import express from 'express'
import { protect, requireRole } from '../middleware/auth.js'
import {
  getBuyerStats,
  getMarketplaceListings,
  getListingById,
  createBuyRequest,
  getBuyerRequests,
  cancelBuyerRequest,
  completeBuyerCollection,
} from '../controllers/buyerController.js'
import { buyRequestValidation, idParamValidation, reasonValidation } from '../middleware/validate.js'

const router = express.Router()

// Every buyer endpoint requires an authenticated account with the buyer role
router.use(protect, requireRole('buyer'))

router.get('/dashboard/stats', getBuyerStats)
router.get('/listings', getMarketplaceListings)
router.get('/listings/:id', idParamValidation, getListingById)
router.post('/requests', buyRequestValidation, createBuyRequest)
router.get('/requests', getBuyerRequests)
router.put('/requests/:id/cancel', idParamValidation, reasonValidation, cancelBuyerRequest)
router.put('/requests/:id/complete', idParamValidation, completeBuyerCollection)

export default router
