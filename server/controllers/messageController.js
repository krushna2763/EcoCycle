import Message from '../models/Message.js'
import { getConversationAccess } from '../utils/conversations.js'
import { createMessage, listConversations, markConversationRead } from '../utils/messages.js'

const PAGE_SIZE = 50

// @desc    Get the user's conversations (one per seller-buyer pair with a request)
// @route   GET /api/messages/conversations
export const getConversations = async (req, res, next) => {
  try {
    res.json({ success: true, conversations: await listConversations(req.seller) })
  } catch (error) {
    next(error)
  }
}

// @desc    Get messages for a conversation, newest page first (?before=<ISO date> for older pages)
// @route   GET /api/messages/:conversationId
export const getMessages = async (req, res, next) => {
  try {
    if (!getConversationAccess(req.params.conversationId, req.seller._id)) {
      return res.status(403).json({ success: false, message: 'You do not have access to this conversation' })
    }

    const before = typeof req.query.before === 'string' ? new Date(req.query.before) : null
    const filter = {
      conversationId: req.params.conversationId,
      ...(before && !Number.isNaN(before.getTime()) && { createdAt: { $lt: before } }),
    }

    const page = await Message.find(filter).sort({ createdAt: -1 }).limit(PAGE_SIZE + 1)
    const hasMore = page.length > PAGE_SIZE
    const messages = page.slice(0, PAGE_SIZE).reverse()

    res.json({ success: true, messages, hasMore })
  } catch (error) {
    next(error)
  }
}

// @desc    Send a message
// @route   POST /api/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text, receiverId } = req.body
    const result = await createMessage({ sender: req.seller, conversationId, text, receiverId })
    if (!result.message) {
      return res.status(result.status).json({ success: false, message: result.error })
    }
    res.status(201).json({ success: true, message: result.message })
  } catch (error) {
    next(error)
  }
}

// @desc    Mark received messages in a conversation as read
// @route   PUT /api/messages/:conversationId/read
export const markRead = async (req, res, next) => {
  try {
    const result = await markConversationRead(req.params.conversationId, req.seller)
    if (!result) {
      return res.status(403).json({ success: false, message: 'You do not have access to this conversation' })
    }
    res.json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
}
