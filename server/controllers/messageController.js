import Message from '../models/Message.js'

// @desc    Get all conversations for seller
// @route   GET /api/messages/conversations
export const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.seller._id }, { receiverId: req.seller._id.toString() }],
    }).sort({ createdAt: -1 })

    // Group by conversationId and get last message
    const conversationMap = {}
    messages.forEach((msg) => {
      if (!conversationMap[msg.conversationId]) {
        conversationMap[msg.conversationId] = {
          conversationId: msg.conversationId,
          lastMessage: msg.text,
          time: msg.createdAt,
          sender: msg.sender,
          senderName: msg.senderName,
          receiverId: msg.receiverId,
          receiverName: msg.receiverName,
        }
      }
    })

    res.json({ success: true, conversations: Object.values(conversationMap) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 })

    res.json({ success: true, messages })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Send a message
// @route   POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, receiverId, receiverName } = req.body

    const message = await Message.create({
      conversationId,
      sender: req.seller._id,
      senderName: req.seller.fullName,
      receiverId,
      receiverName,
      text,
    })

    res.status(201).json({ success: true, message })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
