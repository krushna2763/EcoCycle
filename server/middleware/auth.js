import jwt from 'jsonwebtoken'
import Seller from '../models/Seller.js'

// Resolve a JWT to its user record, or null if the token is invalid, expired or revoked.
// Shared by the HTTP `protect` middleware and the Socket.IO handshake.
export const authenticateToken = async (token) => {
  if (!token) return null

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }

  const user = await Seller.findById(decoded.id).select('-password')
  if (!user) return null

  // Tokens issued before the last password change carry an older version
  if ((decoded.tv || 0) !== (user.tokenVersion || 0)) return null

  return user
}

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' })
  }

  try {
    req.seller = await authenticateToken(token)
  } catch (error) {
    return next(error)
  }

  if (!req.seller) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' })
  }
  next()
}

// Restrict a route to the given roles. Must run after `protect`: the role is read from
// the user record loaded from the database, never from the request body or token payload.
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.seller) {
    return res.status(401).json({ success: false, message: 'Not authorized' })
  }

  const role = req.seller.role || 'seller'
  if (!roles.includes(role)) {
    return res.status(403).json({ success: false, message: 'Access denied for this account type' })
  }
  next()
}

export const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign({ id, tv: tokenVersion }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
}
