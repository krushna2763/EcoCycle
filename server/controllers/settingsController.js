import Settings from '../models/Settings.js'

// @desc    Get seller settings
// @route   GET /api/seller/settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ seller: req.seller._id })
    if (!settings) {
      settings = await Settings.create({ seller: req.seller._id })
    }
    res.json({ success: true, settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update seller settings
// @route   PUT /api/seller/settings
export const updateSettings = async (req, res) => {
  try {
    const { language, timezone, dateFormat, notifications, privacy } = req.body

    const update = {}
    if (language) update.language = language
    if (timezone) update.timezone = timezone
    if (dateFormat) update.dateFormat = dateFormat
    if (notifications) update.notifications = notifications
    if (privacy) update.privacy = privacy
    update.updatedAt = new Date()

    let settings = await Settings.findOneAndUpdate(
      { seller: req.seller._id },
      { $set: update },
      { new: true, upsert: true }
    )

    res.json({ success: true, settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
