import Listing from '../models/Listing.js'
import Request from '../models/Request.js'
import { transitionRequest, sendTransitionResult, OPEN_STATUSES } from '../utils/requestStatus.js'
import { deleteUnreferencedImages, ownsAllImages } from '../utils/imageStorage.js'
import { notifyListingSubmitted } from '../utils/notifications.js'
import { pageInfo, parsePagination } from '../utils/pagination.js'

// Listing fields a seller may set when creating or editing a listing
const LISTING_FIELDS = [
  'title', 'plasticType', 'quantity', 'unit', 'pricePerKg', 'location', 'description',
  'condition', 'collectionType', 'availability', 'additionalInfo', 'image', 'images',
]

const REQUEST_STATUSES = ['pending', 'accepted', 'scheduled', 'in_progress', 'completed', 'rejected', 'cancelled']
const ACTIVE_COLLECTION_STATUSES = ['accepted', 'scheduled', 'in_progress']

// "approved" means live on the marketplace; an approved listing with nothing left is sold out
const LISTING_FILTERS = {
  approved: { status: 'approved', quantity: { $gt: 0 } },
  pending: { status: 'pending' },
  rejected: { status: 'rejected' },
  sold_out: { status: 'approved', quantity: { $lte: 0 } },
}

const LISTING_SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { pricePerKg: 1 },
  price_desc: { pricePerKg: -1 },
}

const pickListingFields = (body) => {
  const data = {}
  for (const field of LISTING_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field]
  }
  // The first photo doubles as the cover image
  if (Array.isArray(data.images) && data.images.length > 0 && !data.image) data.image = data.images[0]
  return data
}

const listingImageUrls = (listing) => [...(listing.images || []), listing.image].filter(Boolean)

// Number of open requests per listing, used to decide whether a listing may be edited or deleted
const openRequestCounts = async (listingIds) => {
  const rows = await Request.aggregate([
    { $match: { listing: { $in: listingIds }, status: { $in: OPEN_STATUSES } } },
    { $group: { _id: '$listing', count: { $sum: 1 } } },
  ])
  return new Map(rows.map((row) => [String(row._id), row.count]))
}

const withOpenRequestCounts = async (listings) => {
  const counts = await openRequestCounts(listings.map((l) => l._id))
  return listings.map((listing) => ({ ...listing, openRequestCount: counts.get(String(listing._id)) || 0 }))
}

// @desc    Get dashboard statistics
// @route   GET /api/seller/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const sellerId = req.seller._id
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const count = (model, filter) => model.countDocuments({ seller: sellerId, ...filter })

    const [
      totalListings, activeListings, pendingListings, rejectedListings, soldOutListings,
      totalRequests, pendingRequests, activeCollections, scheduledCollections, completedCollections,
    ] = await Promise.all([
      count(Listing, {}),
      count(Listing, LISTING_FILTERS.approved),
      count(Listing, LISTING_FILTERS.pending),
      count(Listing, LISTING_FILTERS.rejected),
      count(Listing, LISTING_FILTERS.sold_out),
      count(Request, {}),
      count(Request, { status: 'pending' }),
      count(Request, { status: { $in: ACTIVE_COLLECTION_STATUSES } }),
      count(Request, { status: 'scheduled' }),
      count(Request, { status: 'completed' }),
    ])

    const [views] = await Listing.aggregate([
      { $match: { seller: sellerId } },
      { $group: { _id: null, total: { $sum: '$viewCount' } } },
    ])
    // Requests completed before completedAt existed fall back to their last update time
    const [recycled] = await Request.aggregate([
      { $match: { seller: sellerId, status: 'completed' } },
      { $addFields: { finishedAt: { $ifNull: ['$completedAt', '$updatedAt'] } } },
      {
        $group: {
          _id: null,
          allTimeKg: { $sum: '$quantity' },
          monthKg: { $sum: { $cond: [{ $gte: ['$finishedAt', monthStart] }, '$quantity', 0] } },
          monthCount: { $sum: { $cond: [{ $gte: ['$finishedAt', monthStart] }, 1, 0] } },
        },
      },
    ])

    res.json({
      success: true,
      stats: {
        totalListings,
        activeListings,
        pending: pendingListings,
        rejectedListings,
        soldOutListings,
        totalViews: views?.total || 0,
        totalRequests,
        pendingRequests,
        activeCollections,
        scheduledCollections,
        completedCollections,
        // Shown as "This Month" on the dashboard
        completed: recycled?.monthCount || 0,
        totalRecycled: recycled?.monthKg || 0,
        totalRecycledAllTime: recycled?.allTimeKg || 0,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get the seller's listings (filter, sort, paginate)
// @route   GET /api/seller/listings?status=&sort=&page=&limit=
export const getListings = async (req, res, next) => {
  try {
    const sellerId = req.seller._id
    const status = typeof req.query.status === 'string' ? req.query.status : ''
    const filter = { seller: sellerId, ...(LISTING_FILTERS[status] || {}) }
    const sort = LISTING_SORTS[req.query.sort] || LISTING_SORTS.newest
    const pagination = parsePagination(req.query)

    const [listings, total, counts] = await Promise.all([
      Listing.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
      Listing.countDocuments(filter),
      Promise.all([
        Listing.countDocuments({ seller: sellerId }),
        ...Object.values(LISTING_FILTERS).map((f) => Listing.countDocuments({ seller: sellerId, ...f })),
      ]),
    ])

    const [all, approved, pending, rejected, soldOut] = counts
    res.json({
      success: true,
      listings: await withOpenRequestCounts(listings),
      ...pageInfo(pagination, total),
      counts: { all, approved, pending, rejected, sold_out: soldOut },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get one of the seller's own listings
// @route   GET /api/seller/listings/:id
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, seller: req.seller._id }).lean()
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }
    const [result] = await withOpenRequestCounts([listing])
    res.json({ success: true, listing: result })
  } catch (error) {
    next(error)
  }
}

// @desc    Create a new listing (starts as pending until approved)
// @route   POST /api/seller/listings
export const createListing = async (req, res, next) => {
  try {
    // Copy only seller-editable fields; owner, status and counters are set by the server
    const data = pickListingFields(req.body)
    const images = listingImageUrls(data)
    if (images.length > 0 && !(await ownsAllImages(images, req.seller._id))) {
      return res.status(400).json({ success: false, message: 'Images must be ones you uploaded' })
    }

    const listing = await Listing.create({
      ...data,
      seller: req.seller._id,
    })
    await notifyListingSubmitted(listing)
    res.status(201).json({ success: true, listing })
  } catch (error) {
    next(error)
  }
}

// @desc    Edit a listing; any edit sends it back for review
// @route   PUT /api/seller/listings/:id
export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, seller: req.seller._id })
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    if (await Request.exists({ listing: listing._id, status: { $in: ACTIVE_COLLECTION_STATUSES } })) {
      return res.status(409).json({
        success: false,
        message: 'This listing has accepted collections. Complete or cancel them before editing.',
      })
    }

    const data = pickListingFields(req.body)
    // Sending `images` replaces the photo set; omitting it keeps the current photos
    if (Array.isArray(data.images) && !data.image) data.image = data.images[0] || ''
    const images = listingImageUrls({ images: data.images ?? listing.images, image: data.image ?? listing.image })
    if (images.length > 0 && !(await ownsAllImages(images, req.seller._id))) {
      return res.status(400).json({ success: false, message: 'Images must be ones you uploaded' })
    }

    const previousImages = listingImageUrls(listing)
    listing.set({ ...data, status: 'pending', updatedAt: new Date() })
    await listing.save()
    await deleteUnreferencedImages(previousImages.filter((url) => !images.includes(url)))
    await notifyListingSubmitted(listing, { edited: true })

    res.json({ success: true, listing })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete a listing without open requests
// @route   DELETE /api/seller/listings/:id
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, seller: req.seller._id })
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    if (await Request.exists({ listing: listing._id, status: { $in: OPEN_STATUSES } })) {
      return res.status(409).json({
        success: false,
        message: 'This listing has open requests. Decline, complete or cancel them before deleting.',
      })
    }

    await listing.deleteOne()
    await deleteUnreferencedImages(listingImageUrls(listing))
    res.json({ success: true, message: 'Listing deleted' })
  } catch (error) {
    next(error)
  }
}

// @desc    Get requests for the seller's listings
// @route   GET /api/seller/requests?status=a,b&limit=
export const getRequests = async (req, res, next) => {
  try {
    const sellerId = req.seller._id
    const statuses = typeof req.query.status === 'string'
      ? req.query.status.split(',').filter((s) => REQUEST_STATUSES.includes(s))
      : []
    const filter = { seller: sellerId, ...(statuses.length > 0 && { status: { $in: statuses } }) }
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 0, 0), 100)

    let query = Request.find(filter)
      .populate('listing', 'title plasticType quantity pricePerKg location image unit createdAt')
      .populate('buyer', 'fullName phone email businessName city verificationStatus')
      .sort({ createdAt: -1 })
    if (limit) query = query.limit(limit)

    const [requests, statusCounts] = await Promise.all([
      query,
      Request.aggregate([
        { $match: { seller: sellerId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ])

    const counts = Object.fromEntries(REQUEST_STATUSES.map((s) => [s, 0]))
    statusCounts.forEach(({ _id, count }) => { counts[_id] = count })
    counts.all = statusCounts.reduce((sum, { count }) => sum + count, 0)

    res.json({ success: true, requests, counts })
  } catch (error) {
    next(error)
  }
}

// @desc    Accept a request (holds its quantity on the listing)
// @route   PUT /api/seller/requests/:id/accept
export const acceptRequest = async (req, res, next) => {
  try {
    const result = await transitionRequest({
      id: req.params.id, role: 'seller', owner: { seller: req.seller._id }, to: 'accepted',
    })
    sendTransitionResult(res, result)
  } catch (error) {
    next(error)
  }
}

// @desc    Reject a request
// @route   PUT /api/seller/requests/:id/reject
export const rejectRequest = async (req, res, next) => {
  try {
    const { reason } = req.body
    const result = await transitionRequest({
      id: req.params.id, role: 'seller', owner: { seller: req.seller._id }, to: 'rejected',
      set: { rejectionReason: reason || undefined },
    })
    sendTransitionResult(res, result)
  } catch (error) {
    next(error)
  }
}

// @desc    Schedule (or reschedule) a collection for an accepted request
// @route   PUT /api/seller/requests/:id/schedule
export const scheduleCollection = async (req, res, next) => {
  try {
    const { scheduledDate, scheduledTime, scheduledLocation, scheduleNote } = req.body
    const result = await transitionRequest({
      id: req.params.id, role: 'seller', owner: { seller: req.seller._id }, to: 'scheduled',
      set: (request) => ({
        scheduledDate: scheduledDate || request.scheduledDate,
        scheduledTime: scheduledTime || request.scheduledTime,
        scheduledLocation: scheduledLocation || request.scheduledLocation || req.seller.pickupAddress,
        scheduleNote: scheduleNote ?? request.scheduleNote,
      }),
    })
    sendTransitionResult(res, result)
  } catch (error) {
    next(error)
  }
}

// @desc    Update collection status (in_progress, completed, cancelled)
// @route   PUT /api/seller/requests/:id/status
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body
    if (!['accepted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }
    const result = await transitionRequest({
      id: req.params.id, role: 'seller', owner: { seller: req.seller._id }, to: status,
      set: {
        cancellationReason: status === 'cancelled' && reason ? reason : undefined,
        rejectionReason: status === 'rejected' && reason ? reason : undefined,
      },
    })
    sendTransitionResult(res, result)
  } catch (error) {
    next(error)
  }
}
