import express from 'express'
import { protect } from '../middleware/auth.js'
import { parseImages, uploadImages, getImage, deleteUpload } from '../controllers/uploadController.js'
import { idParamValidation } from '../middleware/validate.js'

const router = express.Router()

// Any signed-in user may upload images (listing photos, avatars); ownership is recorded per file
router.post('/', protect, parseImages, uploadImages)
router.get('/:id', getImage)
router.delete('/:id', protect, idParamValidation, deleteUpload)

export default router
