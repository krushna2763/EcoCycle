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
import authRoutes from './routes/auth.js'
import sellerRoutes from './routes/seller.js'
import messageRoutes from './routes/messages.js'
import settingsRoutes from './routes/settings.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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

// Body parser
app.use(express.json({ limit: '10mb' }))

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/seller', sellerRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/seller/settings', settingsRoutes)

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

// Socket.io JWT middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Authentication error'))
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.sellerId = decoded.id
    next()
  } catch {
    next(new Error('Authentication error'))
  }
})

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`Seller connected: ${socket.sellerId}`)

  socket.on('join', (conversationId) => {
    socket.join(conversationId)
  })

  socket.on('leave', (conversationId) => {
    socket.leave(conversationId)
  })

  socket.on('sendMessage', (data) => {
    io.to(data.conversationId).emit('newMessage', {
      ...data,
      sender: socket.sellerId,
      createdAt: new Date().toISOString(),
    })
  })

  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('userTyping', {
      ...data,
      userId: socket.sellerId,
    })
  })

  socket.on('stopTyping', (data) => {
    socket.to(data.conversationId).emit('userStopTyping', {
      ...data,
      userId: socket.sellerId,
    })
  })

  socket.on('disconnect', () => {
    console.log(`Seller disconnected: ${socket.sellerId}`)
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
