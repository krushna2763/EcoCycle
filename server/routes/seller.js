import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getDashboardStats,
  getListings,
  createListing,
  getRequests,
  acceptRequest,
  rejectRequest,
} from '../controllers/sellerController.js'
import { listingValidation } from '../middleware/validate.js'

const router = express.Router()

router.get('/dashboard/stats', protect, getDashboardStats)
router.get('/listings', protect, getListings)
router.post('/listings', protect, listingValidation, createListing)
router.get('/requests', protect, getRequests)
router.put('/requests/:id/accept', protect, acceptRequest)
router.put('/requests/:id/reject', protect, rejectRequest)

export default router
