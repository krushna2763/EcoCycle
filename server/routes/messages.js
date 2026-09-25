import express from 'express'
import { protect } from '../middleware/auth.js'
import { getConversations, getMessages, sendMessage } from '../controllers/messageController.js'

const router = express.Router()

router.get('/conversations', protect, getConversations)
router.get('/:conversationId', protect, getMessages)
router.post('/', protect, sendMessage)

export default router
