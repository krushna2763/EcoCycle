import express from 'express'
import { protect, requireRole } from '../middleware/auth.js'
import { getSettings, updateSettings } from '../controllers/settingsController.js'
import { settingsValidation } from '../middleware/validate.js'

// Mounted at /api/seller/settings and /api/buyer/settings; each mount follows that role's rule
export default function settingsRoutes(role) {
  const router = express.Router()

  router.use(protect, requireRole(role))

  router.get('/', getSettings)
  router.put('/', settingsValidation, updateSettings)

  return router
}
