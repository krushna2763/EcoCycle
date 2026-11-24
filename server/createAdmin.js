import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Seller from './models/Seller.js'

dotenv.config()

async function createAdmin() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in environment variables')
    process.exit(1)
  }

  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'EcoCycle Administrator'
  const phone = process.env.ADMIN_PHONE || '9876543210'

  if (!email || !password) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be defined in environment variables or .env file')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB for admin user management')

    let admin = await Seller.findOne({ email })

    if (admin) {
      console.log(`Found existing user with email: ${email}`)
      let changed = false

      if (admin.role !== 'admin') {
        admin.role = 'admin'
        changed = true
      }
      if (admin.verificationStatus !== 'verified') {
        admin.verificationStatus = 'verified'
        changed = true
      }
      
      const isSamePassword = await admin.comparePassword(password)
      if (!isSamePassword) {
        admin.password = password
        changed = true
      }

      if (changed) {
        // pre('save') hook on Seller schema automatically hashes admin.password via bcrypt
        await admin.save()
        console.log(`User role updated to 'admin' (User ID: ${admin._id})`)
      } else {
        console.log(`User is already an active admin (User ID: ${admin._id})`)
      }
    } else {
      // Seller.create invokes pre('save') hook, hashing the password via bcrypt
      admin = await Seller.create({
        fullName: name,
        email,
        password,
        phone,
        role: 'admin',
        sellerType: 'individual',
        city: 'Pune',
        pincode: '411001',
        pickupAddress: 'EcoCycle HQ, Pune',
        verificationStatus: 'verified',
      })
      console.log(`Admin user created successfully with email: ${email} (User ID: ${admin._id})`)
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

createAdmin()
