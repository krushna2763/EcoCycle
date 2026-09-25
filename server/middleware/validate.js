import { body, validationResult } from 'express-validator'

// Handle validation errors
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(', '),
    })
  }
  next()
}

// Auth validations
export const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('role').optional().isIn(['seller', 'buyer', 'admin']).withMessage('Invalid role'),
  handleValidation,
]

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
]

// Listing validations
export const listingValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 60 }).withMessage('Title max 60 characters'),
  body('plasticType').trim().notEmpty().withMessage('Plastic type is required'),
  body('quantity').isNumeric({ min: 1 }).withMessage('Quantity must be a positive number'),
  body('pricePerKg').isNumeric({ min: 1 }).withMessage('Price must be a positive number'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  handleValidation,
]

// Settings validations
export const settingsValidation = [
  body('language').optional().isIn(['English', 'Hindi', 'Marathi']).withMessage('Invalid language'),
  body('dateFormat').optional().isIn(['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).withMessage('Invalid date format'),
  body('privacy.profileVisibility').optional().isIn(['Public', 'Verified Recyclers Only', 'Private']).withMessage('Invalid visibility'),
  handleValidation,
]
