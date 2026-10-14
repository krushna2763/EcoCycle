import mongoose from 'mongoose'
import Listing from '../models/Listing.js'
import Seller from '../models/Seller.js'

// Uploaded images live in MongoDB GridFS (collections uploads.files / uploads.chunks), so they
// persist wherever the database does. Stored URLs are API-relative: /api/uploads/<fileId>.
const BUCKET_NAME = 'uploads'
const IMAGE_PATH = /^\/api\/uploads\/([a-f\d]{24})$/
const HOUR_MS = 60 * 60 * 1000

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_IMAGES_PER_UPLOAD = 5

const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME })
const filesCollection = () => mongoose.connection.db.collection(`${BUCKET_NAME}.files`)
const objectId = (id) => new mongoose.Types.ObjectId(String(id))

// Identify the real file type from its first bytes; the client-declared MIME type is not trusted
export const detectImageType = (buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (buffer.length >= png.length && png.every((byte, i) => buffer[i] === byte)) return 'image/png'
  return null
}

export const imageUrl = (fileId) => `/api/uploads/${fileId}`

export const imageIdFromUrl = (url) => {
  const match = typeof url === 'string' ? IMAGE_PATH.exec(url) : null
  return match ? match[1] : null
}

export const saveImage = ({ buffer, contentType, ownerId }) =>
  new Promise((resolve, reject) => {
    const upload = bucket().openUploadStream(`${ownerId}-${Date.now()}`, {
      metadata: { owner: objectId(ownerId), contentType },
    })
    upload.once('error', reject)
    upload.once('finish', () => resolve(upload.id.toString()))
    upload.end(buffer)
  })

export const findImage = async (fileId) => {
  if (!mongoose.isValidObjectId(fileId)) return null
  return filesCollection().findOne({ _id: objectId(fileId) })
}

export const openImageStream = (fileId) => bucket().openDownloadStream(objectId(fileId))

// True when every URL points to an image in our store uploaded by `ownerId`
export const ownsAllImages = async (urls, ownerId) => {
  const ids = urls.map(imageIdFromUrl)
  if (ids.some((id) => !id)) return false
  const unique = [...new Set(ids)]
  const owned = await filesCollection().countDocuments({
    _id: { $in: unique.map(objectId) },
    'metadata.owner': objectId(ownerId),
  })
  return owned === unique.length
}

// Bytes a user has uploaded since `since` (deleted files no longer count)
export const uploadedBytesSince = async (ownerId, since) => {
  const [row] = await filesCollection().aggregate([
    { $match: { 'metadata.owner': objectId(ownerId), uploadDate: { $gte: since } } },
    { $group: { _id: null, bytes: { $sum: '$length' } } },
  ]).toArray()
  return row?.bytes || 0
}

// Remove stored images by URL; unknown URLs are ignored and failures are logged, not thrown
export const deleteImages = async (urls) => {
  const ids = [...new Set(urls.map(imageIdFromUrl).filter(Boolean))]
  await Promise.all(
    ids.map((id) => bucket().delete(objectId(id)).catch((error) => {
      if (!/not found/i.test(error.message)) console.error(`Could not delete image ${id}:`, error.message)
    }))
  )
}

// The subset of `urls` still used as a listing cover/gallery photo or a user avatar
export const referencedImageUrls = async (urls) => {
  if (urls.length === 0) return new Set()
  const wanted = new Set(urls)
  const [listings, users] = await Promise.all([
    Listing.find({ $or: [{ image: { $in: urls } }, { images: { $in: urls } }] }).select('image images').lean(),
    Seller.find({ avatar: { $in: urls } }).select('avatar').lean(),
  ])
  const used = new Set()
  for (const listing of listings) {
    for (const url of [listing.image, ...(listing.images || [])]) if (wanted.has(url)) used.add(url)
  }
  for (const user of users) used.add(user.avatar)
  return used
}

// Delete the given images unless a listing or avatar still references them
export const deleteUnreferencedImages = async (urls) => {
  const candidates = [...new Set(urls.filter(imageIdFromUrl))]
  const used = await referencedImageUrls(candidates)
  await deleteImages(candidates.filter((url) => !used.has(url)))
}

// Find uploads older than `minAgeMs` that nothing references (photos for a listing that failed
// to save, abandoned forms, replaced avatars) and delete them unless `dryRun` is set.
export const sweepOrphanedImages = async ({ minAgeMs, dryRun = false, batchSize = 200 }) => {
  const cutoff = new Date(Date.now() - minAgeMs)
  const cursor = filesCollection().find({ uploadDate: { $lt: cutoff } }).project({ _id: 1 }).batchSize(batchSize)
  const orphans = []
  let checked = 0
  let batch = []

  const flush = async () => {
    const urls = batch.map((file) => imageUrl(file._id.toString()))
    const used = await referencedImageUrls(urls)
    const unused = urls.filter((url) => !used.has(url))
    if (!dryRun) await deleteImages(unused)
    orphans.push(...unused)
    checked += urls.length
    batch = []
  }

  for await (const file of cursor) {
    batch.push(file)
    if (batch.length >= batchSize) await flush()
  }
  if (batch.length > 0) await flush()
  return { checked, orphans }
}

// Periodically remove orphaned uploads. Controlled by ORPHAN_IMAGE_SWEEP_HOURS (0 disables) and
// ORPHAN_IMAGE_MIN_AGE_HOURS; uploads younger than one hour are never touched.
export const startOrphanImageSweeper = ({
  intervalHours = Number(process.env.ORPHAN_IMAGE_SWEEP_HOURS ?? 6),
  minAgeHours = Number(process.env.ORPHAN_IMAGE_MIN_AGE_HOURS ?? 24),
  logger = console,
} = {}) => {
  if (!(intervalHours > 0)) return null
  const minAgeMs = Math.max(Number.isFinite(minAgeHours) ? minAgeHours : 24, 1) * HOUR_MS

  const run = async () => {
    try {
      const { checked, orphans } = await sweepOrphanedImages({ minAgeMs })
      if (orphans.length > 0) logger.log(`Removed ${orphans.length} unused uploaded image(s) (${checked} checked)`)
    } catch (error) {
      logger.error('Orphaned image cleanup failed:', error.message)
    }
  }

  // First pass a minute after start-up, then on the interval; neither keeps the process alive
  setTimeout(run, 60 * 1000).unref()
  const timer = setInterval(run, intervalHours * HOUR_MS)
  timer.unref()
  return timer
}
