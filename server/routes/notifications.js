import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notificationController.js'
import { idParamValidation } from '../middleware/validate.js'

const router = express.Router()

// Shared by sellers and buyers; every query is scoped to the signed-in user
router.use(protect)

router.get('/', getNotifications)
router.get('/unread-count', getUnreadCount)
router.put('/read-all', markAllNotificationsRead)
router.put('/:id/read', idParamValidation, markNotificationRead)

export default router
