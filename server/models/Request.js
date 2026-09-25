import mongoose from 'mongoose'

const requestSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  companyName: { type: String, required: true },
  companyLogo: String,
  interestedPlasticType: { type: String, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Request', requestSchema)
