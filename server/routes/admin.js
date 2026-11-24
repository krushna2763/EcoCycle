import express from 'express'
import { protect, requireRole } from '../middleware/auth.js'
import {
  getPlatformStats,
  getPendingListings,
  getListingForReview,
  approveListing,
  rejectListing,
  getAllUsers,
} from '../controllers/adminController.js'
import { idParamValidation } from '../middleware/validate.js'

const router = express.Router()

// Every admin endpoint requires an authenticated account with the admin role
router.use(protect, requireRole('admin'))

router.get('/dashboard/stats', getPlatformStats)
router.get('/listings', getPendingListings)
router.get('/listings/:id', idParamValidation, getListingForReview)
router.put('/listings/:id/approve', idParamValidation, approveListing)
router.put('/listings/:id/reject', idParamValidation, rejectListing)
router.get('/users', getAllUsers)

export default router
