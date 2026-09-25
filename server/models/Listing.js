import mongoose from 'mongoose'

const listingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  title: { type: String, required: true },
  plasticType: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Kilogram (kg)' },
  pricePerKg: { type: Number, required: true },
  location: { type: String, required: true },
  description: String,
  condition: String,
  collectionType: String,
  availability: String,
  additionalInfo: String,
  images: [String],
  image: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model('Listing', listingSchema)
