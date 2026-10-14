import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB connected: ${conn.connection.host} (Database: ${conn.connection.name})`)
    return conn
  } catch (error) {
    // Sanitize any potential credentials from error output
    const safeError = (error.message || '').replace(/:\/\/([^:]+):([^@]+)@/g, '://$1:***@')
    console.error('MongoDB connection error:', safeError)
    process.exit(1)
  }
}

export default connectDB
