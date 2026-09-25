import Listing from '../models/Listing.js'
import Request from '../models/Request.js'

// @desc    Get dashboard statistics
// @route   GET /api/seller/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const sellerId = req.seller._id

    const totalListings = await Listing.countDocuments({ seller: sellerId })
    const pendingListings = await Listing.countDocuments({ seller: sellerId, status: 'pending' })
    const approvedListings = await Listing.countDocuments({ seller: sellerId, status: 'approved' })
    const activeListings = approvedListings

    const recycledResult = await Listing.aggregate([
      { $match: { seller: sellerId, status: 'approved' } },
      { $group: { _id: null, totalKg: { $sum: '$quantity' } } },
    ])
    const totalRecycled = recycledResult.length > 0 ? recycledResult[0].totalKg : 0

    res.json({
      success: true,
      stats: {
        totalListings,
        pending: pendingListings,
        completed: approvedListings,
        totalRecycled,
        activeListings,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get all listings for seller
// @route   GET /api/seller/listings
export const getListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.seller._id }).sort({ createdAt: -1 })
    res.json({ success: true, listings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create a new listing
// @route   POST /api/seller/listings
export const createListing = async (req, res) => {
  try {
    const listing = await Listing.create({
      seller: req.seller._id,
      ...req.body,
    })
    res.status(201).json({ success: true, listing })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get all requests for seller
// @route   GET /api/seller/requests
export const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ seller: req.seller._id })
      .populate('listing', 'title plasticType')
      .sort({ createdAt: -1 })
    res.json({ success: true, requests })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Accept a request
// @route   PUT /api/seller/requests/:id/accept
export const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findOne({ _id: req.params.id, seller: req.seller._id })
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' })
    }
    request.status = 'accepted'
    await request.save()
    res.json({ success: true, request })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Reject a request
// @route   PUT /api/seller/requests/:id/reject
export const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findOne({ _id: req.params.id, seller: req.seller._id })
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' })
    }
    request.status = 'rejected'
    await request.save()
    res.json({ success: true, request })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
