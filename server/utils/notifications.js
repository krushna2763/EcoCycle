import Listing from '../models/Listing.js'
import Notification from '../models/Notification.js'
import Settings from '../models/Settings.js'
import { emitToUser } from './realtime.js'

// Settings toggle (settings.notifications.<key>) that governs each notification type
const PREFERENCE_FOR_TYPE = { request: 'requestUpdates', collection: 'collectionUpdates', message: 'messages' }

const LINKS = {
  seller: {
    request: '/seller/dashboard/requests',
    collection: '/seller/dashboard/collections',
    listing: '/seller/dashboard/listings',
    message: '/seller/dashboard/messages',
  },
  buyer: {
    request: '/buyer/dashboard/requests',
    collection: '/buyer/dashboard/collections',
    message: '/buyer/dashboard/messages',
  },
}

const ACTIVE_STATUSES = ['accepted', 'scheduled', 'in_progress']

const wantsNotification = async (userId, type) => {
  const preference = PREFERENCE_FOR_TYPE[type]
  if (!preference) return true
  const settings = await Settings.findOne({ seller: userId }).select('notifications').lean()
  return settings?.notifications?.[preference] !== false
}

// Notifications are a side effect: a failure is logged and never breaks the main action
const safely = async (label, fn) => {
  try {
    return await fn()
  } catch (error) {
    console.error(`Notification error (${label}):`, error.message)
    return null
  }
}

export const notify = (userId, data) =>
  safely(data.event, async () => {
    if (!(await wantsNotification(userId, data.type))) return null
    const notification = await Notification.create({ user: userId, ...data })
    emitToUser(userId, 'notification', notification)
    return notification
  })

export const notifyListingSubmitted = (listing, { edited = false } = {}) =>
  notify(listing.seller, {
    type: 'listing',
    event: edited ? 'listing_resubmitted' : 'listing_submitted',
    title: edited ? 'Listing updated and sent for review' : 'Listing submitted for review',
    message: `"${listing.title}" is pending approval and will be visible to buyers once approved.`,
    link: LINKS.seller.listing,
    listing: listing._id,
  })

export const notifyRequestCreated = (request, listingTitle) =>
  notify(request.seller, {
    type: 'request',
    event: 'request_created',
    title: 'New collection request',
    message: `${request.companyName} requested ${request.quantity} kg of "${listingTitle}".`,
    link: LINKS.seller.request,
    request: request._id,
    listing: request.listing,
  })

// Tell the other party about a status change made by `actorRole`
export const notifyRequestTransition = ({ request, from, to, actorRole }) =>
  safely(`request ${from}->${to}`, async () => {
    const listing = await Listing.findById(request.listing).select('title').lean()
    const title = listing?.title || request.interestedPlasticType
    const recipientRole = actorRole === 'seller' ? 'buyer' : 'seller'
    const recipient = recipientRole === 'buyer' ? request.buyer : request.seller
    const actor = actorRole === 'seller' ? 'The seller' : request.companyName
    const wasActive = ACTIVE_STATUSES.includes(from)
    const when = [request.scheduledDate, request.scheduledTime].filter(Boolean).join(' at ')
    const where = request.scheduledLocation ? ` (${request.scheduledLocation})` : ''

    const events = {
      accepted: from === 'pending'
        ? ['request', 'request_accepted', 'Request accepted', `Your request for ${request.quantity} kg of "${title}" was accepted.`]
        : ['collection', 'collection_updated', 'Collection updated', `The collection for "${title}" was moved back to accepted.`],
      rejected: ['request', 'request_rejected', 'Request declined',
        `Your request for "${title}" was declined.${request.rejectionReason ? ` Reason: ${request.rejectionReason}` : ''}`],
      scheduled: from === 'scheduled'
        ? ['collection', 'collection_rescheduled', 'Collection rescheduled', `Pickup for "${title}" was rescheduled to ${when || 'a new time'}${where}.`]
        : ['collection', 'collection_scheduled', 'Collection scheduled', `Pickup for "${title}" is scheduled for ${when || 'a date to be confirmed'}${where}.`],
      in_progress: ['collection', 'collection_in_progress', 'Collection in progress', `The collection for "${title}" has started.`],
      completed: ['collection', 'collection_completed', 'Collection completed', `${actor} marked the collection for "${title}" as completed.`],
      cancelled: wasActive
        ? ['collection', 'collection_cancelled', 'Collection cancelled',
          `${actor} cancelled the collection for "${title}".${request.cancellationReason ? ` Reason: ${request.cancellationReason}` : ''}`]
        : ['request', 'request_cancelled', 'Request cancelled', `${actor} cancelled their request for "${title}".`],
    }
    const [type, event, notificationTitle, message] = events[to]

    return notify(recipient, {
      type,
      event,
      title: notificationTitle,
      message,
      link: LINKS[recipientRole][type],
      request: request._id,
      listing: request.listing,
    })
  })

// One unread notification per conversation, refreshed by each new message instead of piling up
export const notifyNewMessage = ({ recipientId, recipientRole, conversationId, senderName, text }) =>
  safely('message', async () => {
    if (!(await wantsNotification(recipientId, 'message'))) return null
    const notification = await Notification.findOneAndUpdate(
      { user: recipientId, type: 'message', conversationId, read: false },
      {
        $set: {
          event: 'message_received',
          title: `New message from ${senderName}`,
          message: text.length > 140 ? `${text.slice(0, 137)}...` : text,
          link: `${LINKS[recipientRole].message}?c=${conversationId}`,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    )
    emitToUser(recipientId, 'notification', notification)
    return notification
  })
