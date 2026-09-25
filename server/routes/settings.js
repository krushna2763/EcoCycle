import express from 'express'
import { protect } from '../middleware/auth.js'
import { getSettings, updateSettings } from '../controllers/settingsController.js'
import { settingsValidation } from '../middleware/validate.js'

const router = express.Router()

router.get('/', protect, getSettings)
router.put('/', protect, settingsValidation, updateSettings)

export default router
