import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  type: { type: String, enum: ['request', 'collection', 'listing', 'message', 'system'], required: true },
  event: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  // Client route the notification opens, already resolved for the recipient's role
  link: String,
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  conversationId: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ user: 1, read: 1 })

export default mongoose.model('Notification', notificationSchema)
