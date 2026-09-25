import Seller from '../models/Seller.js'
import { generateToken } from '../middleware/auth.js'

// @desc    Register a new seller
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const {
      email, password, fullName, phone, sellerType,
      // Individual fields
      city, pincode, pickupAddress, plasticTypes, collectionSource, averageQuantity, additionalNotes,
      // Business fields
      businessName, businessType, gstNumber, panNumber, yearOfEstablishment,
      numberOfEmployees, businessAddress, businessCity, businessPincode, businessDescription,
    } = req.body

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email })
    if (existingSeller) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    // Create seller
    const seller = await Seller.create({
      email, password, fullName, phone, sellerType,
      city, pincode, pickupAddress, plasticTypes, collectionSource, averageQuantity, additionalNotes,
      businessName, businessType, gstNumber, panNumber, yearOfEstablishment,
      numberOfEmployees, businessAddress, businessCity, businessPincode, businessDescription,
    })

    const token = generateToken(seller._id)

    res.status(201).json({
      success: true,
      token,
      seller: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        phone: seller.phone,
        sellerType: seller.sellerType,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Login seller
// @route   POST /api/auth/login
export const login = async (req, res) => {
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

    const token = generateToken(seller._id)

    res.json({
      success: true,
      token,
      seller: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        phone: seller.phone,
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
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Get current logged-in seller
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({
    success: true,
    seller: {
      id: req.seller._id,
      fullName: req.seller.fullName,
      email: req.seller.email,
      phone: req.seller.phone,
      sellerType: req.seller.sellerType,
      city: req.seller.city,
      pincode: req.seller.pincode,
      pickupAddress: req.seller.pickupAddress,
      plasticTypes: req.seller.plasticTypes,
      businessName: req.seller.businessName,
      businessType: req.seller.businessType,
      avatar: req.seller.avatar,
    },
  })
}

// @desc    Verify current password
// @route   POST /api/auth/verify-password
export const verifyPassword = async (req, res) => {
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
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update password
// @route   POST /api/auth/update-password
export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body
    const seller = await Seller.findById(req.seller._id)
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' })
    }
    seller.password = newPassword
    await seller.save()
    res.json({ success: true, message: 'Password updated' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
