import express from 'express'
import { protect } from '../middleware/auth.js'
import { getConversations, getMessages, markRead, sendMessage } from '../controllers/messageController.js'
import { messageValidation } from '../middleware/validate.js'

const router = express.Router()

// Shared by sellers and buyers; per-conversation access is checked in the controller
router.get('/conversations', protect, getConversations)
router.get('/:conversationId', protect, getMessages)
router.put('/:conversationId/read', protect, markRead)
router.post('/', protect, messageValidation, sendMessage)

export default router
