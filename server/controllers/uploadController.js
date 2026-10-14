import multer from 'multer'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_UPLOAD,
  deleteImages,
  detectImageType,
  findImage,
  imageUrl,
  openImageStream,
  ownsAllImages,
  referencedImageUrls,
  saveImage,
  uploadedBytesSince,
} from '../utils/imageStorage.js'

// Per-user upload allowance over a rolling 24 hours, so one account cannot fill the database
const DAILY_UPLOAD_LIMIT_BYTES = (Number(process.env.UPLOAD_DAILY_LIMIT_MB) || 50) * 1024 * 1024
const DAY_MS = 24 * 60 * 60 * 1000

// Files are buffered in memory (max 5 x 5 MB) and checked before anything is stored
export const parseImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_IMAGES_PER_UPLOAD },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true)
    cb(Object.assign(new Error('Only JPG and PNG images are allowed'), { statusCode: 400 }))
  },
}).array('images', MAX_IMAGES_PER_UPLOAD)

// @desc    Upload listing photos or an avatar
// @route   POST /api/uploads
export const uploadImages = async (req, res, next) => {
  try {
    const files = req.files || []
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'Upload at least one JPG or PNG image' })
    }

    const types = files.map((file) => detectImageType(file.buffer))
    if (types.some((type) => !type)) {
      return res.status(400).json({ success: false, message: 'Only JPG and PNG images are allowed' })
    }

    const incoming = files.reduce((sum, file) => sum + file.size, 0)
    const used = await uploadedBytesSince(req.seller._id, new Date(Date.now() - DAY_MS))
    if (used + incoming > DAILY_UPLOAD_LIMIT_BYTES) {
      return res.status(429).json({ success: false, message: 'Daily image upload limit reached. Please try again tomorrow.' })
    }

    // All or nothing: if one file fails to store, remove the ones already saved
    const ids = []
    try {
      for (let i = 0; i < files.length; i += 1) {
        ids.push(await saveImage({ buffer: files[i].buffer, contentType: types[i], ownerId: req.seller._id }))
      }
    } catch (error) {
      await deleteImages(ids.map(imageUrl))
      throw error
    }

    res.status(201).json({ success: true, files: ids.map((id) => ({ id, url: imageUrl(id) })) })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete an image the user uploaded but did not end up using (e.g. a listing failed to save)
// @route   DELETE /api/uploads/:id
export const deleteUpload = async (req, res, next) => {
  try {
    const url = imageUrl(req.params.id)
    if (!(await ownsAllImages([url], req.seller._id))) {
      return res.status(404).json({ success: false, message: 'Image not found' })
    }
    if ((await referencedImageUrls([url])).size > 0) {
      return res.status(409).json({ success: false, message: 'Image is still used by a listing or profile' })
    }
    await deleteImages([url])
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// @desc    Serve a stored image (public so <img> tags can load it)
// @route   GET /api/uploads/:id
export const getImage = async (req, res, next) => {
  try {
    const file = await findImage(req.params.id)
    const contentType = file?.metadata?.contentType
    if (!file || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return res.status(404).json({ success: false, message: 'Image not found' })
    }

    res.set({
      'Content-Type': contentType,
      'Content-Length': String(file.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      // Images are embedded by the client app on another origin
      'Cross-Origin-Resource-Policy': 'cross-origin',
    })
    // Once streaming has started the status line is sent, so a failure can only end the response
    openImageStream(req.params.id)
      .on('error', (error) => (res.headersSent ? res.destroy(error) : next(error)))
      .pipe(res)
  } catch (error) {
    next(error)
  }
}
