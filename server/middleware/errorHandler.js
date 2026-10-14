// Mask credentials embedded in connection strings (e.g. mongodb+srv://user:pass@host) before logging
const sanitize = (text = '') => String(text).replace(/:\/\/([^:/@\s]+):([^@\s]+)@/g, '://$1:***@')

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', sanitize(err.message))

  // Malformed or oversized JSON bodies from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Malformed JSON body' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large' })
  }

  // Upload limits from multer
  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: 'Each image must be 5 MB or smaller',
      LIMIT_FILE_COUNT: 'At most 5 images can be uploaded at once',
      LIMIT_UNEXPECTED_FILE: 'At most 5 images can be uploaded at once',
    }
    return res.status(400).json({ success: false, message: messages[err.code] || 'Invalid upload' })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ success: false, message: messages.join(', ') })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate field value' })
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' })
  }

  const statusCode = err.statusCode || err.status || 500

  // Never expose internal error messages (database, driver, stack details); keep the stack in the server log
  if (statusCode >= 500) {
    console.error(sanitize(err.stack))
    return res.status(500).json({ success: false, message: 'Internal Server Error' })
  }

  res.status(statusCode).json({
    success: false,
    message: err.expose === false ? 'Request failed' : err.message,
  })
}

export default errorHandler
