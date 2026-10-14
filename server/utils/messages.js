import Message from '../models/Message.js'
import Notification from '../models/Notification.js'
import Request from '../models/Request.js'
import Seller from '../models/Seller.js'
import { getConversationAccess, hasTradingRelationship } from './conversations.js'
import { canBuyerViewSeller, canViewSellerProfile, ENGAGED_STATUSES, loadSellerPrivacy } from './sellerPrivacy.js'
import { emitToUser, emitToUsers, isOnline } from './realtime.js'
import { notifyNewMessage } from './notifications.js'

export const MAX_MESSAGE_LENGTH = 2000

// Persist a message and deliver it to both participants. Shared by REST and Socket.IO so every
// message is authorized the same way, stored once, and delivered once per open tab.
// Resolves to { message } or { status, error }.
export const createMessage = async ({ sender, conversationId, text, receiverId }) => {
  const access = getConversationAccess(conversationId, sender._id)
  if (!access) return { status: 403, error: 'You do not have access to this conversation' }
  if (receiverId && receiverId !== access.otherId) {
    return { status: 400, error: 'Recipient does not match this conversation' }
  }

  const body = typeof text === 'string' ? text.trim() : ''
  if (!body || body.length > MAX_MESSAGE_LENGTH) {
    return { status: 400, error: `Message must be 1-${MAX_MESSAGE_LENGTH} characters` }
  }

  if (!(await hasTradingRelationship(access))) {
    return { status: 403, error: 'You can only message users you have a request with' }
  }

  // Recipient identity comes from the database, not from client input
  const receiver = await Seller.findById(access.otherId).select('fullName businessName role')
  if (!receiver) return { status: 404, error: 'Recipient not found' }

  const receiverIsSeller = access.otherId === access.sellerId
  // A buyer only learns the seller's name if the seller's profileVisibility allows it
  const hideReceiverName = receiverIsSeller && !(await canBuyerViewSeller(access.sellerId, sender))

  const message = await Message.create({
    conversationId,
    sender: sender._id,
    senderName: sender.businessName || sender.fullName,
    receiverId: access.otherId,
    receiverName: hideReceiverName ? 'Seller' : receiver.fullName,
    text: body,
  })

  emitToUsers([sender._id, access.otherId], 'newMessage', message.toJSON())
  await notifyNewMessage({
    recipientId: access.otherId,
    recipientRole: receiverIsSeller ? 'seller' : 'buyer',
    conversationId,
    senderName: message.senderName,
    text: body,
  })

  return { message }
}

// Mark everything the user received in a conversation as read and tell the other side
export const markConversationRead = async (conversationId, user) => {
  const access = getConversationAccess(conversationId, user._id)
  if (!access) return null

  const { modifiedCount } = await Message.updateMany(
    { conversationId, receiverId: String(user._id), read: false },
    { $set: { read: true } }
  )
  const notifications = await Notification.updateMany(
    { user: user._id, type: 'message', conversationId, read: false },
    { $set: { read: true } }
  )

  if (modifiedCount > 0) emitToUser(access.otherId, 'messagesRead', { conversationId, readerId: String(user._id) })
  if (notifications.modifiedCount > 0) emitToUser(user._id, 'notificationsChanged', {})
  return { updated: modifiedCount }
}

// Conversations exist for every seller-buyer pair connected by a request, with or without messages
export const listConversations = async (user) => {
  const userId = String(user._id)
  const isBuyer = user.role === 'buyer'
  const [ownField, otherField] = isBuyer ? ['buyer', 'seller'] : ['seller', 'buyer']

  const requests = await Request.find({ [ownField]: user._id })
    .sort({ createdAt: -1 })
    .populate('listing', 'title')
    .populate(otherField, 'fullName businessName avatar')
    .lean()

  // Latest request per counterpart, plus whether any request with them was accepted
  const pairs = new Map()
  for (const request of requests) {
    const other = request[otherField]
    if (!other) continue
    const key = String(other._id)
    const pair = pairs.get(key) || { other, latest: request, engaged: false }
    if (ENGAGED_STATUSES.includes(request.status)) pair.engaged = true
    pairs.set(key, pair)
  }

  const conversationIdFor = (otherId) => (isBuyer ? `conv_${otherId}_${userId}` : `conv_${userId}_${otherId}`)
  const ids = [...pairs.keys()].map(conversationIdFor)

  const summaries = await Message.aggregate([
    { $match: { conversationId: { $in: ids } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$text' },
        time: { $first: '$createdAt' },
        lastSender: { $first: '$sender' },
        unread: { $sum: { $cond: [{ $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$read', false] }] }, 1, 0] } },
      },
    },
  ])
  const summaryById = new Map(summaries.map((s) => [s._id, s]))

  const privacyOf = isBuyer ? await loadSellerPrivacy([...pairs.keys()]) : null

  const conversations = [...pairs.entries()].map(([otherId, { other, latest, engaged }]) => {
    const conversationId = conversationIdFor(otherId)
    const summary = summaryById.get(conversationId)
    const visible = !isBuyer || canViewSellerProfile(privacyOf(otherId), user, engaged)
    return {
      conversationId,
      participant: {
        id: otherId,
        name: visible ? other.businessName || other.fullName : 'Seller',
        avatar: visible ? other.avatar || null : null,
        role: isBuyer ? 'seller' : 'buyer',
      },
      online: isOnline(otherId),
      lastMessage: summary?.lastMessage || '',
      lastMessageFromMe: summary ? String(summary.lastSender) === userId : false,
      time: summary?.time || latest.createdAt,
      unread: summary?.unread || 0,
      request: {
        _id: latest._id,
        status: latest.status,
        listingTitle: latest.listing?.title || latest.interestedPlasticType,
      },
    }
  })

  return conversations.sort((a, b) => new Date(b.time) - new Date(a.time))
}

// Users who share at least one request with this user (for presence updates)
export const counterpartIds = async (user) => {
  const [ownField, otherField] = user.role === 'buyer' ? ['buyer', 'seller'] : ['seller', 'buyer']
  const ids = await Request.distinct(otherField, { [ownField]: user._id })
  return ids.filter(Boolean).map(String)
}
