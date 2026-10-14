import express from 'express'
import { protect, requireRole } from '../middleware/auth.js'
import {
  getDashboardStats,
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getRequests,
  acceptRequest,
  rejectRequest,
  scheduleCollection,
  updateRequestStatus,
} from '../controllers/sellerController.js'
import {
  idParamValidation,
  listingValidation,
  reasonValidation,
  scheduleValidation,
  statusUpdateValidation,
} from '../middleware/validate.js'

const router = express.Router()

// Every seller endpoint requires an authenticated account with the seller role
router.use(protect, requireRole('seller'))

router.get('/dashboard/stats', getDashboardStats)
router.get('/listings', getListings)
router.post('/listings', listingValidation, createListing)
router.get('/listings/:id', idParamValidation, getListing)
router.put('/listings/:id', idParamValidation, listingValidation, updateListing)
router.delete('/listings/:id', idParamValidation, deleteListing)
router.get('/requests', getRequests)
router.put('/requests/:id/accept', idParamValidation, acceptRequest)
router.put('/requests/:id/reject', idParamValidation, reasonValidation, rejectRequest)
router.put('/requests/:id/schedule', idParamValidation, scheduleValidation, scheduleCollection)
router.put('/requests/:id/status', idParamValidation, statusUpdateValidation, updateRequestStatus)

export default router
