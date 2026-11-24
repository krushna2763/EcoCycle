import Listing from '../models/Listing.js'
import Request from '../models/Request.js'
import Seller from '../models/Seller.js'
import { notify } from '../utils/notifications.js'
import { pageInfo, parsePagination } from '../utils/pagination.js'

// @desc    Get comprehensive platform statistics for admin
// @route   GET /api/admin/dashboard/stats
export const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalSellers,
      totalBuyers,
      totalListings,
      pendingListings,
      approvedListings,
      rejectedListings,
      totalRequests,
      completedRequests,
      recycledAgg,
    ] = await Promise.all([
      Seller.countDocuments({ role: 'seller' }),
      Seller.countDocuments({ role: 'buyer' }),
      Listing.countDocuments({}),
      Listing.countDocuments({ status: 'pending' }),
      Listing.countDocuments({ status: 'approved' }),
      Listing.countDocuments({ status: 'rejected' }),
      Request.countDocuments({}),
      Request.countDocuments({ status: 'completed' }),
      Request.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalKg: { $sum: '$quantity' } } },
      ]),
    ])

    const totalRecycledKg = recycledAgg[0]?.totalKg || 0

    res.json({
      success: true,
      stats: {
        totalSellers,
        totalBuyers,
        totalUsers: totalSellers + totalBuyers,
        totalListings,
        pendingListings,
        approvedListings,
        rejectedListings,
        totalRequests,
        completedRequests,
        completedCollections: completedRequests,
        totalRecycledKg,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get pending listings awaiting admin review
// @route   GET /api/admin/listings?page=&limit=
export const getPendingListings = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query)
    const filter = { status: 'pending' }

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'fullName email phone city sellerType businessName avatar')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Listing.countDocuments(filter),
    ])

    res.json({
      success: true,
      listings,
      ...pageInfo(pagination, total),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get a single listing for review with seller details and request counts
// @route   GET /api/admin/listings/:id
export const getListingForReview = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'fullName email phone city pincode pickupAddress sellerType businessName businessAddress verificationStatus avatar createdAt')
      .populate('reviewedBy', 'fullName email')
      .lean()

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    const requestCount = await Request.countDocuments({ listing: req.params.id })

    res.json({
      success: true,
      listing: {
        ...listing,
        requestCount,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Approve a listing
// @route   PUT /api/admin/listings/:id/approve
export const approveListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    listing.status = 'approved'
    listing.rejectionRemarks = null
    listing.reviewedAt = new Date()
    listing.reviewedBy = req.seller._id
    listing.updatedAt = new Date()
    await listing.save()

    await notify(listing.seller, {
      type: 'listing',
      event: 'listing_approved',
      title: 'Listing approved',
      message: `"${listing.title}" has been approved and is now visible to buyers.`,
      link: '/seller/dashboard/listings',
      listing: listing._id,
    })

    res.json({
      success: true,
      message: 'Listing approved successfully',
      listing,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Reject a listing with remarks
// @route   PUT /api/admin/listings/:id/reject
export const rejectListing = async (req, res, next) => {
  try {
    const { remarks } = req.body
    if (!remarks || typeof remarks !== 'string' || remarks.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Rejection remarks are required and must be at least 10 characters long',
      })
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    const trimmedRemarks = remarks.trim()
    listing.status = 'rejected'
    listing.rejectionRemarks = trimmedRemarks
    listing.reviewedAt = new Date()
    listing.reviewedBy = req.seller._id
    listing.updatedAt = new Date()
    await listing.save()

    await notify(listing.seller, {
      type: 'listing',
      event: 'listing_rejected',
      title: 'Listing needs changes',
      message: `"${listing.title}" was not approved. Remarks: ${trimmedRemarks}`,
      link: '/seller/dashboard/listings',
      listing: listing._id,
    })

    res.json({
      success: true,
      message: 'Listing rejected',
      listing,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all registered users with role filtering and pagination
// @route   GET /api/admin/users?role=&page=&limit=
export const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query
    const filter = {}
    if (role && ['seller', 'buyer', 'admin'].includes(role)) {
      filter.role = role
    }

    const pagination = parsePagination(req.query)

    const [users, total, counts] = await Promise.all([
      Seller.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Seller.countDocuments(filter),
      Promise.all([
        Seller.countDocuments({}),
        Seller.countDocuments({ role: 'seller' }),
        Seller.countDocuments({ role: 'buyer' }),
        Seller.countDocuments({ role: 'admin' }),
      ]),
    ])

    const [all, sellers, buyers, admins] = counts

    res.json({
      success: true,
      users,
      ...pageInfo(pagination, total),
      counts: { all, sellers, buyers, admins },
    })
  } catch (error) {
    next(error)
  }
}
