import Listing from '../models/Listing.js'
import Request from '../models/Request.js'
import Seller from '../models/Seller.js'

// @desc    Get buyer dashboard statistics
// @route   GET /api/buyer/dashboard/stats
export const getBuyerStats = async (req, res) => {
  try {
    const buyerId = req.seller._id

    const totalRequests = await Request.countDocuments({ buyer: buyerId })
    const pendingRequests = await Request.countDocuments({ buyer: buyerId, status: 'pending' })
    const acceptedRequests = await Request.countDocuments({ buyer: buyerId, status: 'accepted' })
    const scheduledRequests = await Request.countDocuments({ buyer: buyerId, status: 'scheduled' })
    const activeCollections = await Request.countDocuments({
      buyer: buyerId,
      status: { $in: ['accepted', 'scheduled', 'in_progress'] },
    })
    const completedRequests = await Request.countDocuments({ buyer: buyerId, status: 'completed' })

    const totalMaterialsResult = await Request.aggregate([
      { $match: { buyer: buyerId, status: 'completed' } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ])
    const totalMaterialsProcured = totalMaterialsResult.length > 0 ? totalMaterialsResult[0].totalQuantity : 0
    const availableMarketplaceListings = await Listing.countDocuments({ status: 'approved' })

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
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get active marketplace listings for buyers with filters & search
// @route   GET /api/buyer/listings
export const getMarketplaceListings = async (req, res) => {
  try {
    const { search, plasticType, minPrice, maxPrice, location, condition, sort } = req.query
    const filter = { status: 'approved' }

    if (plasticType && plasticType !== 'All') {
      filter.plasticType = plasticType
    }
    if (condition && condition !== 'All') {
      filter.condition = condition
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' }
    }
    if (minPrice || maxPrice) {
      filter.pricePerKg = {}
      if (minPrice) filter.pricePerKg.$gte = Number(minPrice)
      if (maxPrice) filter.pricePerKg.$lte = Number(maxPrice)
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { plasticType: { $regex: search, $options: 'i' } },
      ]
    }

    let query = Listing.find(filter).populate('seller', 'fullName phone email city businessName sellerType')

    if (sort === 'price_asc') {
      query = query.sort({ pricePerKg: 1 })
    } else if (sort === 'price_desc') {
      query = query.sort({ pricePerKg: -1 })
    } else if (sort === 'quantity_desc') {
      query = query.sort({ quantity: -1 })
    } else {
      query = query.sort({ createdAt: -1 })
    }

    const listings = await query
    res.json({ success: true, count: listings.length, listings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get single listing details for buyer
// @route   GET /api/buyer/listings/:id
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'seller',
      'fullName phone email city pickupAddress businessName sellerType verificationStatus'
    )
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    listing.viewCount = (listing.viewCount || 0) + 1
    await listing.save()

    res.json({ success: true, listing })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create a buy request for a listing
// @route   POST /api/buyer/requests
export const createBuyRequest = async (req, res) => {
  try {
    const { listingId, quantity, offerPrice, location, message } = req.body

    const listing = await Listing.findById(listingId).populate('seller')
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    if (listing.seller._id.toString() === req.seller._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own listing' })
    }

    const newRequest = await Request.create({
      seller: listing.seller._id,
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

    const populatedRequest = await Request.findById(newRequest._id)
      .populate('listing', 'title plasticType quantity pricePerKg location image')
      .populate('seller', 'fullName phone email businessName city')

    res.status(201).json({ success: true, request: populatedRequest })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get all requests made by buyer
// @route   GET /api/buyer/requests
export const getBuyerRequests = async (req, res) => {
  try {
    const requests = await Request.find({ buyer: req.seller._id })
      .populate('listing')
      .populate('seller', 'fullName phone email businessName city pickupAddress')
      .sort({ createdAt: -1 })

    res.json({ success: true, requests })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Cancel a buyer request
// @route   PUT /api/buyer/requests/:id/cancel
export const cancelBuyerRequest = async (req, res) => {
  try {
    const { reason } = req.body
    const request = await Request.findOne({ _id: req.params.id, buyer: req.seller._id })
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' })
    }
    request.status = 'cancelled'
    if (reason) request.cancellationReason = reason
    request.updatedAt = new Date()
    await request.save()
    res.json({ success: true, request })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Confirm collection completion by buyer
// @route   PUT /api/buyer/requests/:id/complete
export const completeBuyerCollection = async (req, res) => {
  try {
    const request = await Request.findOne({ _id: req.params.id, buyer: req.seller._id })
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' })
    }
    request.status = 'completed'
    request.updatedAt = new Date()
    await request.save()
    res.json({ success: true, request })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
