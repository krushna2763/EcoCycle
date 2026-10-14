import { body, param, validationResult } from 'express-validator'

// Allowed values shared with the listing form (client/src/pages/Seller/AddPlasticWaste.jsx)
// and the marketplace filters (client/src/pages/Buyer/BrowseListings.jsx)
export const PLASTIC_TYPES = ['PET', 'HDPE', 'LDPE', 'PP', 'PVC', 'PS', 'Mixed', 'Other']
export const UNITS = ['Kilogram (kg)', 'Gram (g)', 'Ton', 'Piece']

// Upper bounds that reject absurd values without limiting real-world listings
const MAX_QUANTITY = 1000000
const MAX_PRICE_PER_KG = 100000

// Images must be uploaded through POST /api/uploads first; ownership is checked in the controller
const IMAGE_URL = /^\/api\/uploads\/[a-f\d]{24}$/
const IMAGE_MESSAGE = 'Images must be uploaded through the image upload endpoint'

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
  body('password').isString().isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters'),
  body('fullName').isString().trim().notEmpty().withMessage('Full name is required'),
  body('phone').isString().trim().notEmpty().withMessage('Phone number is required'),
  body('role').optional().isIn(['seller', 'buyer']).withMessage('Invalid role'),
  handleValidation,
]

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
  handleValidation,
]

export const verifyPasswordValidation = [
  body('password').isString().notEmpty().withMessage('Password is required'),
  handleValidation,
]

export const updatePasswordValidation = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  body('newPassword').isString().isLength({ min: 6, max: 128 }).withMessage('New password must be 6-128 characters'),
  handleValidation,
]

// Listing validations
export const listingValidation = [
  body('title').isString().withMessage('Title is required').bail().trim().notEmpty().withMessage('Title is required').isLength({ max: 60 }).withMessage('Title max 60 characters'),
  body('plasticType').isIn(PLASTIC_TYPES).withMessage(`Plastic type must be one of: ${PLASTIC_TYPES.join(', ')}`),
  body('quantity').isFloat({ gt: 0, max: MAX_QUANTITY }).withMessage(`Quantity must be a number greater than 0 and at most ${MAX_QUANTITY}`).toFloat(),
  body('pricePerKg').isFloat({ gt: 0, max: MAX_PRICE_PER_KG }).withMessage(`Price must be a number greater than 0 and at most ${MAX_PRICE_PER_KG}`).toFloat(),
  body('location').isString().withMessage('Location is required').bail().trim().notEmpty().withMessage('Location is required').isLength({ max: 200 }).withMessage('Location max 200 characters'),
  body('unit').optional().isIn(UNITS).withMessage('Invalid unit'),
  body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('Description max 500 characters'),
  body('condition').optional().isString().trim().isLength({ max: 50 }).withMessage('Condition max 50 characters'),
  body('collectionType').optional().isString().trim().isLength({ max: 50 }).withMessage('Collection type max 50 characters'),
  body('availability').optional().isString().trim().isLength({ max: 50 }).withMessage('Availability max 50 characters'),
  body('additionalInfo').optional().isString().trim().isLength({ max: 1000 }).withMessage('Additional info max 1000 characters'),
  body('image').optional({ values: 'falsy' }).isString().matches(IMAGE_URL).withMessage(IMAGE_MESSAGE),
  body('images').optional().isArray({ max: 5 }).withMessage('At most 5 images allowed'),
  body('images.*').isString().matches(IMAGE_URL).withMessage(IMAGE_MESSAGE),
  handleValidation,
]

// Buy request validations
export const buyRequestValidation = [
  body('listingId').isMongoId().withMessage('Valid listing ID is required'),
  body('quantity').optional().isFloat({ gt: 0, max: MAX_QUANTITY }).withMessage('Quantity must be a number greater than 0').toFloat(),
  body('offerPrice').optional().isFloat({ gt: 0, max: MAX_PRICE_PER_KG }).withMessage('Offer price must be a number greater than 0').toFloat(),
  body('location').optional().isString().trim().isLength({ max: 200 }).withMessage('Location max 200 characters'),
  body('message').optional().isString().trim().isLength({ max: 1000 }).withMessage('Message max 1000 characters'),
  handleValidation,
]

export const idParamValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidation,
]

const optionalReason = () =>
  body('reason').optional({ values: 'null' }).isString().withMessage('Reason must be text').trim().isLength({ max: 500 }).withMessage('Reason max 500 characters')

export const reasonValidation = [optionalReason(), handleValidation]

export const scheduleValidation = [
  body('scheduledDate').isString().withMessage('Collection date is required').bail().trim().notEmpty().withMessage('Collection date is required').isLength({ max: 40 }).withMessage('Invalid date'),
  body('scheduledTime').optional().isString().trim().isLength({ max: 20 }).withMessage('Invalid time'),
  body('scheduledLocation').optional().isString().trim().isLength({ max: 300 }).withMessage('Location max 300 characters'),
  body('scheduleNote').optional().isString().trim().isLength({ max: 300 }).withMessage('Note max 300 characters'),
  handleValidation,
]

export const statusUpdateValidation = [
  body('status').isString().withMessage('Status is required'),
  optionalReason(),
  handleValidation,
]

// Message validations
export const messageValidation = [
  body('conversationId').isString().notEmpty().withMessage('Conversation ID is required'),
  body('text').isString().withMessage('Message text is required').bail().trim().notEmpty().withMessage('Message text is required').isLength({ max: 2000 }).withMessage('Message max 2000 characters'),
  body('receiverId').optional().isMongoId().withMessage('Invalid receiver ID'),
  handleValidation,
]

// Settings validations
export const settingsValidation = [
  body('language').optional().isIn(['English', 'Hindi', 'Marathi']).withMessage('Invalid language'),
  body('timezone').optional().isString().isLength({ max: 64 }).withMessage('Invalid timezone'),
  body('dateFormat').optional().isIn(['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).withMessage('Invalid date format'),
  body('notifications').optional().isObject().withMessage('Invalid notification settings'),
  body('currency').optional().isIn(['INR (₹)', 'USD ($)']).withMessage('Invalid currency'),
  body([
    'notifications.collectionUpdates', 'notifications.messages', 'notifications.requestUpdates',
    'notifications.newListings', 'notifications.collectionReminders',
  ]).optional().isBoolean().withMessage('Notification settings must be true or false'),
  body('channels').optional().isObject().withMessage('Invalid channel settings'),
  body(['channels.email', 'channels.sms', 'channels.push', 'channels.marketing'])
    .optional().isBoolean().withMessage('Channel settings must be true or false'),
  body('privacy').optional().isObject().withMessage('Invalid privacy settings'),
  body('privacy.profileVisibility').optional().isIn(['Public', 'Verified Recyclers Only', 'Private']).withMessage('Invalid visibility'),
  body('privacy.showContactInformation').optional().isBoolean().withMessage('Show contact information must be true or false'),
  handleValidation,
]

// Profile validations (PUT /api/auth/me); email, role and verification status are not editable here
const optionalText = (field, max, label) =>
  body(field).optional().isString().withMessage(`${label} must be text`).trim().isLength({ max }).withMessage(`${label} max ${max} characters`)

export const profileValidation = [
  body('fullName').optional().isString().withMessage('Full name is required').bail().trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }).withMessage('Full name max 100 characters'),
  body('phone').optional().isString().withMessage('Enter a valid phone number').bail().trim().matches(/^\+?[\d\s-]{7,20}$/).withMessage('Enter a valid phone number'),
  optionalText('city', 100, 'City'),
  body('pincode').optional().isString().trim().matches(/^[A-Za-z\d -]{0,10}$/).withMessage('Enter a valid pincode'),
  optionalText('pickupAddress', 300, 'Address'),
  optionalText('businessName', 150, 'Business name'),
  optionalText('businessType', 100, 'Business type'),
  body('gstNumber').optional().isString().trim().matches(/^[A-Za-z\d]{0,20}$/).withMessage('Enter a valid GST number'),
  optionalText('businessAddress', 300, 'Business address'),
  optionalText('businessCity', 100, 'Business city'),
  body('businessPincode').optional().isString().trim().matches(/^[A-Za-z\d -]{0,10}$/).withMessage('Enter a valid pincode'),
  optionalText('businessDescription', 1000, 'Business description'),
  body('avatar').optional({ values: 'falsy' }).isString().matches(IMAGE_URL).withMessage(IMAGE_MESSAGE),
  handleValidation,
]
