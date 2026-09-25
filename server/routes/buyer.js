import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getBuyerStats,
  getMarketplaceListings,
  getListingById,
  createBuyRequest,
  getBuyerRequests,
  cancelBuyerRequest,
  completeBuyerCollection,
} from '../controllers/buyerController.js'

const router = express.Router()

router.get('/dashboard/stats', protect, getBuyerStats)
router.get('/listings', protect, getMarketplaceListings)
router.get('/listings/:id', protect, getListingById)
router.post('/requests', protect, createBuyRequest)
router.get('/requests', protect, getBuyerRequests)
router.put('/requests/:id/cancel', protect, cancelBuyerRequest)
router.put('/requests/:id/complete', protect, completeBuyerCollection)

export default router