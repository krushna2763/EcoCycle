import Seller from '../models/Seller.js'
import { generateToken } from '../middleware/auth.js'
import { disconnectUserSockets } from '../utils/realtime.js'
import { deleteUnreferencedImages, ownsAllImages } from '../utils/imageStorage.js'

// @desc    Register a new seller or buyer
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const {
      email, password, fullName, phone, sellerType, role,
      // Individual fields
      city, pincode, pickupAddress, plasticTypes, collectionSource, averageQuantity, additionalNotes,
      // Business fields
      businessName, businessType, gstNumber, panNumber, yearOfEstablishment,
      numberOfEmployees, businessAddress, businessCity, businessPincode, businessDescription,
    } = req.body

    // Check if user already exists
    const existingSeller = await Seller.findOne({ email })
    if (existingSeller) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    // Determine account role (default to 'seller', allow 'buyer')
    const accountRole = role === 'buyer' ? 'buyer' : 'seller'

    // Create user
    const seller = await Seller.create({
      email, password, fullName, phone,
      sellerType: sellerType || (accountRole === 'buyer' ? 'business' : 'individual'),
      role: accountRole,
      city: city || businessCity,
      pincode: pincode || businessPincode,
      pickupAddress: pickupAddress || businessAddress,
      plasticTypes, collectionSource, averageQuantity, additionalNotes,
      businessName, businessType, gstNumber, panNumber, yearOfEstablishment,
      numberOfEmployees,
      businessAddress: businessAddress || pickupAddress,
      businessCity: businessCity || city,
      businessPincode: businessPincode || pincode,
      businessDescription,
    })

    const token = generateToken(seller._id, seller.tokenVersion)

    res.status(201).json({
      success: true,
      token,
      seller: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        phone: seller.phone,
        role: seller.role,
        sellerType: seller.sellerType,
        businessName: seller.businessName,
        city: seller.city,
        pincode: seller.pincode,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Login user (seller or buyer)
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' })
    }

    const seller = await Seller.findOne({ email })
    if (!seller) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isMatch = await seller.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = generateToken(seller._id, seller.tokenVersion)

    res.json({
      success: true,
      token,
      seller: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        phone: seller.phone,
        role: seller.role || 'seller',
        sellerType: seller.sellerType,
        city: seller.city,
        pincode: seller.pincode,
        pickupAddress: seller.pickupAddress,
        plasticTypes: seller.plasticTypes,
        businessName: seller.businessName,
        businessType: seller.businessType,
        avatar: seller.avatar,
      },
    })
  } catch (error) {
    next(error)
  }
}

// The signed-in user's own profile; never includes password hashes or token data
const profileOf = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role || 'seller',
  sellerType: user.sellerType,
  city: user.city,
  pincode: user.pincode,
  pickupAddress: user.pickupAddress,
  plasticTypes: user.plasticTypes,
  businessName: user.businessName,
  businessType: user.businessType,
  gstNumber: user.gstNumber,
  businessAddress: user.businessAddress,
  businessCity: user.businessCity,
  businessPincode: user.businessPincode,
  businessDescription: user.businessDescription,
  verificationStatus: user.verificationStatus,
  avatar: user.avatar,
  createdAt: user.createdAt,
})

// Profile fields a user may change themselves
const PROFILE_FIELDS = [
  'fullName', 'phone', 'city', 'pincode', 'pickupAddress', 'businessName', 'businessType',
  'gstNumber', 'businessAddress', 'businessCity', 'businessPincode', 'businessDescription', 'avatar',
]

// @desc    Get current logged-in user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ success: true, seller: profileOf(req.seller) })
}

// @desc    Update the current user's profile (email, role and verification are not editable)
// @route   PUT /api/auth/me
export const updateMe = async (req, res, next) => {
  try {
    const user = await Seller.findById(req.seller._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const updates = {}
    for (const field of PROFILE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    }

    if (updates.avatar && !(await ownsAllImages([updates.avatar], user._id))) {
      return res.status(400).json({ success: false, message: 'Avatar must be an image you uploaded' })
    }

    const previousAvatar = user.avatar
    user.set(updates)
    await user.save()
    // The old photo may also be a listing photo, so only remove it if nothing uses it
    if (previousAvatar && previousAvatar !== user.avatar) await deleteUnreferencedImages([previousAvatar])

    res.json({ success: true, seller: profileOf(user) })
  } catch (error) {
    next(error)
  }
}

// @desc    Verify current password
// @route   POST /api/auth/verify-password
export const verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body
    const seller = await Seller.findById(req.seller._id)
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' })
    }
    const isMatch = await seller.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' })
    }
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// @desc    Update password (requires the current password)
// @route   POST /api/auth/update-password
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const seller = await Seller.findById(req.seller._id)
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' })
    }

    const isMatch = await seller.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' })
    }
    if (await seller.comparePassword(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must be different from the current password' })
    }

    // Hashed by the Seller pre-save hook; bumping tokenVersion revokes all earlier JWTs
    seller.password = newPassword
    seller.tokenVersion = (seller.tokenVersion || 0) + 1
    await seller.save()
    // Live sockets were authenticated with the now-revoked token
    disconnectUserSockets(seller._id)

    // Fresh token so the current session keeps working
    const token = generateToken(seller._id, seller.tokenVersion)
    res.json({ success: true, message: 'Password updated', token })
  } catch (error) {
    next(error)
  }
}
