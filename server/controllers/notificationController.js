import mongoose from 'mongoose'
import Notification from '../models/Notification.js'
import { pageInfo, parsePagination } from '../utils/pagination.js'
import { emitToUser } from '../utils/realtime.js'

const TYPES = ['request', 'collection', 'listing', 'message', 'system']

// @desc    Get the user's notifications (?type=&unread=true&page=&limit=)
// @route   GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.seller._id
    const filter = { user: userId }
    if (TYPES.includes(req.query.type)) filter.type = req.query.type
    if (req.query.unread === 'true') filter.read = false
    const pagination = parsePagination(req.query, { defaultLimit: 20, maxLimit: 50 })

    const [notifications, total, byType, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
      Notification.countDocuments(filter),
      Notification.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(String(userId)) } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Notification.countDocuments({ user: userId, read: false }),
    ])

    const counts = Object.fromEntries(TYPES.map((type) => [type, 0]))
    byType.forEach(({ _id, count }) => { counts[_id] = count })
    counts.all = byType.reduce((sum, { count }) => sum + count, 0)
    counts.unread = unreadCount

    res.json({ success: true, notifications, unreadCount, counts, ...pageInfo(pagination, total) })
  } catch (error) {
    next(error)
  }
}

// @desc    Count unread notifications (for the navbar bell)
// @route   GET /api/notifications/unread-count
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.seller._id, read: false })
    res.json({ success: true, count })
  } catch (error) {
    next(error)
  }
}

// @desc    Mark one notification as read
// @route   PUT /api/notifications/:id/read
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.seller._id },
      { $set: { read: true } },
      { new: true }
    )
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }
    emitToUser(req.seller._id, 'notificationsChanged', {})
    res.json({ success: true, notification })
  } catch (error) {
    next(error)
  }
}

// @desc    Mark all of the user's notifications as read
// @route   PUT /api/notifications/read-all
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const { modifiedCount } = await Notification.updateMany(
      { user: req.seller._id, read: false },
      { $set: { read: true } }
    )
    emitToUser(req.seller._id, 'notificationsChanged', {})
    res.json({ success: true, updated: modifiedCount })
  } catch (error) {
    next(error)
  }
}
