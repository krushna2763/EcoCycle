import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, unique: true },
  language: { type: String, default: 'English', enum: ['English', 'Hindi', 'Marathi'] },
  timezone: { type: String, default: '(GMT+05:30) Asia/Kolkata' },
  dateFormat: { type: String, default: 'DD MMM YYYY', enum: ['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
  notifications: {
    collectionUpdates: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    requestUpdates: { type: Boolean, default: true },
  },
  privacy: {
    profileVisibility: { type: String, default: 'Public', enum: ['Public', 'Verified Recyclers Only', 'Private'] },
    showContactInformation: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model('Settings', settingsSchema)
