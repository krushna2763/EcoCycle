import Listing from '../models/Listing.js'
import Request from '../models/Request.js'
import { applySellerPrivacy } from '../utils/sellerPrivacy.js'
import { transitionRequest, sendTransitionResult, OPEN_STATUSES } from '../utils/requestStatus.js'
import { notifyRequestCreated } from '../utils/notifications.js'
import { pageInfo, parsePagination } from '../utils/pagination.js'

// Seller profile fields shown on marketplace listings (subject to privacy.profileVisibility)
const PUBLIC_SELLER_FIELDS = 'fullName businessName city sellerType verificationStatus'

// A listing is on the marketplace when it is approved and still has quantity left
const AVAILABLE = { status: 'approved', quantity: { $gt: 0 } }

// Query params may arrive as arrays or objects (e.g. ?plasticType[$ne]=x); only plain strings are used
const queryString = (value, maxLength = 100) => (typeof value === 'string' ? value.trim().slice(0, maxLength) : '')

// Treat user input as literal text inside a MongoDB $regex
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const parsePrice = (value) => {
  const number = parseFloat(queryString(value))
  return Number.isFinite(number) && number >= 0 ? number : undefined
}

// @desc    Get buyer dashboard statistics
// @route   GET /api/buyer/dashboard/stats
export const getBuyerStats = async (req, res, next) => {
  try {
    const buyerId = req.seller._id
    const count = (filter) => Request.countDocuments({ buyer: buyerId, ...filter })

    const [
      totalRequests, pendingRequests, acceptedRequests, scheduledRequests,
      activeCollections, completedRequests, availableMarketplaceListings,
    ] = await Promise.all([
      count({}),
      count({ status: 'pending' }),
      count({ status: 'accepted' }),
      count({ status: 'scheduled' }),
      count({ status: { $in: ['accepted', 'scheduled', 'in_progress'] } }),
      count({ status: 'completed' }),
      Listing.countDocuments(AVAILABLE),
    ])

    const totalMaterialsResult = await Request.aggregate([
      { $match: { buyer: buyerId, status: 'completed' } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ])
    const totalMaterialsProcured = totalMaterialsResult.length > 0 ? totalMaterialsResult[0].totalQuantity : 0

    res.json({
      success: true,
      stats: {
        totalRequests,
        pendingRequests,
        acceptedRequests,
        scheduledRequests,
        activeCollections,
        completedRequests,
        totalMaterialsProcured,
        availableMarketplaceListings,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get available marketplace listings with filters, search, sorting and pagination
// @route   GET /api/buyer/listings?search=&plasticType=&condition=&location=&minPrice=&maxPrice=&sort=&page=&limit=
export const getMarketplaceListings = async (req, res, next) => {
  try {
    const search = queryString(req.query.search)
    const plasticType = queryString(req.query.plasticType)
    const condition = queryString(req.query.condition)
    const location = queryString(req.query.location)
    const sort = queryString(req.query.sort)
    const minPrice = parsePrice(req.query.minPrice)
    const maxPrice = parsePrice(req.query.maxPrice)
    const pagination = parsePagination(req.query, { defaultLimit: 12, maxLimit: 50 })
    const filter = { ...AVAILABLE }

    if (plasticType && plasticType !== 'All') {
      filter.plasticType = plasticType
    }
    if (condition && condition !== 'All') {
      filter.condition = condition
    }
    if (location) {
      filter.location = { $regex: escapeRegex(location), $options: 'i' }
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerKg = {}
      if (minPrice !== undefined) filter.pricePerKg.$gte = minPrice
      if (maxPrice !== undefined) filter.pricePerKg.$lte = maxPrice
    }
    if (search) {
      const pattern = escapeRegex(search)
      filter.$or = [
        { title: { $regex: pattern, $options: 'i' } },
        { description: { $regex: pattern, $options: 'i' } },
        { location: { $regex: pattern, $options: 'i' } },
        { plasticType: { $regex: pattern, $options: 'i' } },
      ]
    }

    const sortBy = {
      price_asc: { pricePerKg: 1 },
      price_desc: { pricePerKg: -1 },
      quantity_desc: { quantity: -1 },
    }[sort] || { createdAt: -1 }

    const [found, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', PUBLIC_SELLER_FIELDS)
        .sort({ ...sortBy, _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Listing.countDocuments(filter),
    ])

    const listings = await applySellerPrivacy(found, req.seller)
    res.json({ success: true, count: listings.length, ...pageInfo(pagination, total), listings })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single listing details for buyer
// @route   GET /api/buyer/listings/:id
export const getListingById = async (req, res, next) => {
  try {
    // Only listings on the marketplace are visible; sellers see their own via /api/seller/listings
    const listing = await Listing.findOne({ _id: req.params.id, ...AVAILABLE })
      .populate('seller', PUBLIC_SELLER_FIELDS)
      .lean()
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    await Listing.updateOne({ _id: listing._id }, { $inc: { viewCount: 1 } })
    listing.viewCount = (listing.viewCount || 0) + 1
    await applySellerPrivacy([listing], req.seller)

    // Lets the page show an existing request instead of offering a duplicate
    const activeRequest = await Request.findOne({ listing: listing._id, buyer: req.seller._id, status: { $in: OPEN_STATUSES } })
      .select('status quantity createdAt')
      .lean()

    res.json({ success: true, listing, activeRequest })
  } catch (error) {
    next(error)
  }
}

// @desc    Create a buy request for a listing
// @route   POST /api/buyer/requests
export const createBuyRequest = async (req, res, next) => {
  try {
    const { listingId, quantity, offerPrice, location, message } = req.body

    const listing = await Listing.findOne({ _id: listingId, ...AVAILABLE })
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    if (listing.seller.toString() === req.seller._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own listing' })
    }

    if (quantity && quantity > listing.quantity) {
      return res.status(400).json({ success: false, message: `Only ${listing.quantity} kg is available on this listing` })
    }

    // Fast path for a friendly message; the unique open-request index is the real guarantee
    const duplicateMessage = 'You already have an open request for this listing'
    if (await Request.exists({ listing: listing._id, buyer: req.seller._id, status: { $in: OPEN_STATUSES } })) {
      return res.status(409).json({ success: false, message: duplicateMessage })
    }

    let newRequest
    try {
      newRequest = await Request.create({
        seller: listing.seller,
        listing: listing._id,
        buyer: req.seller._id,
        companyName: req.seller.businessName || req.seller.fullName,
        buyerPhone: req.seller.phone,
        buyerEmail: req.seller.email,
        interestedPlasticType: listing.plasticType || listing.title,
        quantity: quantity || listing.quantity,
        offerPrice: offerPrice || listing.pricePerKg,
        location: location || req.seller.city || listing.location,
        message: message || '',
        status: 'pending',
      })
    } catch (error) {
      // A concurrent request for the same listing won the race
      if (error.code === 11000) return res.status(409).json({ success: false, message: duplicateMessage })
      throw error
    }
    await notifyRequestCreated(newRequest, listing.title)

    const populatedRequest = await Request.findById(newRequest._id)
      .populate('listing', 'title plasticType quantity pricePerKg location image')
      .populate('seller', 'fullName phone email businessName city')
      .lean()

    const [request] = await applySellerPrivacy([populatedRequest], req.seller, (r) => r.status)
    res.status(201).json({ success: true, request })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all requests made by buyer
// @route   GET /api/buyer/requests
export const getBuyerRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ buyer: req.seller._id })
      .populate('listing', 'title plasticType quantity pricePerKg location image unit')
      .populate('seller', 'fullName phone email businessName city pickupAddress')
      .sort({ createdAt: -1 })
      .lean()

    res.json({ success: true, requests: await applySellerPrivacy(requests, req.seller, (r) => r.status) })
  } catch (error) {
    next(error)
  }
}

// @desc    Cancel a buyer request
// @route   PUT /api/buyer/requests/:id/cancel
export const cancelBuyerRequest = async (req, res, next) => {
  try {
    const { reason } = req.body
    const result = await transitionRequest({
      id: req.params.id, role: 'buyer', owner: { buyer: req.seller._id }, to: 'cancelled',
      set: { cancellationReason: reason || undefined },
    })
    sendTransitionResult(res, result)
  } catch (error) {
    next(error)
  }
}

// @desc    Confirm collection completion by buyer
// @route   PUT /api/buyer/requests/:id/complete
export const completeBuyerCollection = async (req, res, next) => {
  try {
    const result = await transitionRequest({
      id: req.params.id, role: 'buyer', owner: { buyer: req.seller._id }, to: 'completed',
    })
    sendTransitionResult(res, result)
  } catch (error) {
    next(error)
  }
}
