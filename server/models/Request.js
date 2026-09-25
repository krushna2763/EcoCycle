import mongoose from 'mongoose'

const requestSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  companyName: { type: String, required: true },
  companyLogo: String,
  buyerPhone: String,
  buyerEmail: String,
  interestedPlasticType: { type: String, required: true },
  quantity: { type: Number, required: true },
  offerPrice: Number,
  location: { type: String, required: true },
  message: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'scheduled', 'in_progress', 'completed', 'rejected', 'cancelled'],
    default: 'pending',
  },
  scheduledDate: String,
  scheduledTime: String,
  scheduledLocation: String,
  rejectionReason: String,
  cancellationReason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model('Request', requestSchema)
