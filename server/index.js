import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'
import { authenticateToken } from './middleware/auth.js'
import { getConversationAccess } from './utils/conversations.js'
import { counterpartIds, createMessage } from './utils/messages.js'
import { emitToUsers, markSocketClosed, markSocketOpen, registerSocketServer, userRoom } from './utils/realtime.js'
import { ensureOpenRequestIndex } from './utils/requestIndexes.js'
import { startOrphanImageSweeper } from './utils/imageStorage.js'
import authRoutes from './routes/auth.js'
import sellerRoutes from './routes/seller.js'
import buyerRoutes from './routes/buyer.js'
import messageRoutes from './routes/messages.js'
import settingsRoutes from './routes/settings.js'
import notificationRoutes from './routes/notifications.js'
import uploadRoutes from './routes/uploads.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// Rate limiting. The dashboards make several API calls per page, so the default allows 300
// requests per 15 minutes per IP; image downloads are cacheable and not counted.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  skip: (req) => req.method === 'GET' && req.path.startsWith('/uploads/'),
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/verify-password', authLimiter)
app.use('/api/auth/update-password', authLimiter)

// Body parser (images are uploaded as multipart through /api/uploads, so JSON bodies stay small)
app.use(express.json({ limit: '1mb' }))

// Connect to MongoDB, then add the duplicate-request guard and the unused-image cleanup
connectDB().then(async () => {
  try {
    await ensureOpenRequestIndex()
  } catch (error) {
    console.error('Index check failed:', error.message)
  }
  startOrphanImageSweeper()
})

// Routes
app.use('/api/auth', authRoutes)
// Settings must be mounted before the role routers so their requests are not authenticated twice
app.use('/api/seller/settings', settingsRoutes('seller'))
app.use('/api/buyer/settings', settingsRoutes('buyer'))
app.use('/api/seller', sellerRoutes)
app.use('/api/buyer', buyerRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/uploads', uploadRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Error handler
app.use(errorHandler)

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

registerSocketServer(io)

// Socket.io JWT middleware: same token checks as the HTTP `protect` middleware
io.use(async (socket, next) => {
  try {
    const user = await authenticateToken(socket.handshake.auth?.token)
    if (!user) {
      return next(new Error('Authentication error'))
    }
    socket.user = user
    socket.sellerId = user._id.toString()
    socket.tokenExp = jwt.decode(socket.handshake.auth.token)?.exp
    next()
  } catch {
    next(new Error('Authentication error'))
  }
})

// A socket may only use rooms of conversations it joined after the membership check
const inConversation = (socket, conversationId) =>
  socket.rooms.has(conversationId) && Boolean(getConversationAccess(conversationId, socket.sellerId))

// Re-check the handshake token before privileged actions; drops sockets whose token was
// revoked or expired after connecting (e.g. on another server instance)
const sessionIsValid = async (socket) => {
  if (await authenticateToken(socket.handshake.auth?.token)) return true
  socket.disconnect(true)
  return false
}

// setTimeout's maximum delay (~24.8 days)
const MAX_TIMER_MS = 2 ** 31 - 1

// Tell users who share a request with this user that they came online or went offline
const broadcastPresence = async (socket, online) => {
  try {
    emitToUsers(await counterpartIds(socket.user), 'presence', { userId: socket.sellerId, online })
  } catch (error) {
    console.error('Socket presence error:', error.message)
  }
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`Seller connected: ${socket.sellerId}`)

  // Personal room: notifications, new messages, and disconnects after a password change
  socket.join(userRoom(socket.sellerId))
  if (markSocketOpen(socket.sellerId)) broadcastPresence(socket, true)

  // Close the socket when its token expires
  if (socket.tokenExp) {
    const expiryTimer = setTimeout(
      () => socket.disconnect(true),
      Math.min(Math.max(socket.tokenExp * 1000 - Date.now(), 0), MAX_TIMER_MS)
    )
    socket.on('disconnect', () => clearTimeout(expiryTimer))
  }

  socket.on('join', async (conversationId, ack) => {
    try {
      const allowed = Boolean(getConversationAccess(conversationId, socket.sellerId)) && (await sessionIsValid(socket))
      if (allowed) socket.join(conversationId)
      if (typeof ack === 'function') ack({ success: allowed })
    } catch (error) {
      console.error('Socket join error:', error.message)
    }
  })

  socket.on('leave', (conversationId) => {
    if (typeof conversationId === 'string') socket.leave(conversationId)
  })

  // Same path as POST /api/messages: authorized, stored once, delivered to both users' rooms.
  // Only server-side identity and the text are used; other client fields are ignored.
  socket.on('sendMessage', async (data, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {}
    try {
      if (!(await sessionIsValid(socket))) return
      const result = await createMessage({ sender: socket.user, conversationId: data?.conversationId, text: data?.text })
      reply(result.message ? { success: true, message: result.message } : { success: false, message: result.error })
    } catch (error) {
      console.error('Socket sendMessage error:', error.message)
      reply({ success: false, message: 'Message could not be sent' })
    }
  })

  socket.on('typing', (data) => {
    if (!inConversation(socket, data?.conversationId)) return
    socket.to(data.conversationId).emit('userTyping', {
      conversationId: data.conversationId,
      userId: socket.sellerId,
    })
  })

  socket.on('stopTyping', (data) => {
    if (!inConversation(socket, data?.conversationId)) return
    socket.to(data.conversationId).emit('userStopTyping', {
      conversationId: data.conversationId,
      userId: socket.sellerId,
    })
  })

  socket.on('disconnect', () => {
    console.log(`Seller disconnected: ${socket.sellerId}`)
    if (markSocketClosed(socket.sellerId)) broadcastPresence(socket, false)
  })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...')
  httpServer.close(() => {
    process.exit(0)
  })
})

export { io }
