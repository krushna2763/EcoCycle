import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const sellerSchema = new mongoose.Schema({
  // Step 1: Account Information
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },

  // Step 2: Seller Type
  sellerType: { type: String, enum: ['individual', 'business'], default: 'individual' },

  // Step 3: Individual Details
  city: String,
  pincode: String,
  pickupAddress: String,
  plasticTypes: [String],
  collectionSource: String,
  averageQuantity: String,
  additionalNotes: String,

  // Step 3: Business Details
  businessName: String,
  businessType: String,
  gstNumber: String,
  panNumber: String,
  yearOfEstablishment: String,
  numberOfEmployees: String,
  businessAddress: String,
  businessCity: String,
  businessPincode: String,
  businessDescription: String,

  // Step 4: Verification
  idType: String,
  idNumber: String,
  idDocument: String,
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },

  // Dashboard data
  avatar: String,
  role: { type: String, default: 'seller' },

  createdAt: { type: Date, default: Date.now },
})

// Hash password before saving
sellerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password
sellerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('Seller', sellerSchema)
