import Settings from '../models/Settings.js'

// Nested preference groups the client may update key by key
const NESTED_FIELDS = {
  notifications: ['collectionUpdates', 'messages', 'requestUpdates', 'newListings', 'collectionReminders'],
  channels: ['email', 'sms', 'push', 'marketing'],
  privacy: ['profileVisibility', 'showContactInformation'],
}
const TOP_LEVEL_FIELDS = ['language', 'timezone', 'dateFormat', 'currency']

// @desc    Get the user's settings (created with defaults on first read)
// @route   GET /api/seller/settings, GET /api/buyer/settings
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ seller: req.seller._id })
    if (!settings) {
      settings = await Settings.create({ seller: req.seller._id })
    }
    res.json({ success: true, settings })
  } catch (error) {
    next(error)
  }
}

// @desc    Update the user's settings; only the keys sent are changed
// @route   PUT /api/seller/settings, PUT /api/buyer/settings
export const updateSettings = async (req, res, next) => {
  try {
    const update = {}
    for (const field of TOP_LEVEL_FIELDS) {
      if (req.body[field]) update[field] = req.body[field]
    }
    for (const [group, keys] of Object.entries(NESTED_FIELDS)) {
      const values = req.body[group]
      if (!values || typeof values !== 'object') continue
      for (const key of keys) {
        if (values[key] !== undefined) update[`${group}.${key}`] = values[key]
      }
    }
    update.updatedAt = new Date()

    const settings = await Settings.findOneAndUpdate(
      { seller: req.seller._id },
      { $set: update },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    res.json({ success: true, settings })
  } catch (error) {
    next(error)
  }
}
