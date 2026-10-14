import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, unique: true },
  language: { type: String, default: 'English', enum: ['English', 'Hindi', 'Marathi'] },
  timezone: { type: String, default: '(GMT+05:30) Asia/Kolkata' },
  dateFormat: { type: String, default: 'DD MMM YYYY', enum: ['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
  currency: { type: String, default: 'INR (₹)', enum: ['INR (₹)', 'USD ($)'] },
  notifications: {
    collectionUpdates: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    requestUpdates: { type: Boolean, default: true },
    // Stored preferences for alerts that need future features (listing approval, a reminder scheduler)
    newListings: { type: Boolean, default: true },
    collectionReminders: { type: Boolean, default: true },
  },
  // Delivery channel preferences; only in-app notifications are sent today
  channels: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
  privacy: {
    profileVisibility: { type: String, default: 'Public', enum: ['Public', 'Verified Recyclers Only', 'Private'] },
    showContactInformation: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model('Settings', settingsSchema)
