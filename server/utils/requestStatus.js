import Listing from '../models/Listing.js'
import Request from '../models/Request.js'
import { notifyRequestTransition } from './notifications.js'

// Request lifecycle, derived from the actions the existing dashboards offer:
//   pending -> accepted -> scheduled -> in_progress -> completed
// A seller answers a pending request (accept / reject); a buyer may withdraw it (cancel).
// Once accepted, the seller manages the collection and either party may complete or cancel it.
// completed, rejected and cancelled are final.
const ACTIVE = ['accepted', 'scheduled', 'in_progress']
export const OPEN_STATUSES = ['pending', ...ACTIVE]

const TRANSITIONS = {
  seller: {
    pending: ['accepted', 'rejected'],
    accepted: [...ACTIVE, 'completed', 'cancelled'],
    scheduled: [...ACTIVE, 'completed', 'cancelled'],
    in_progress: [...ACTIVE, 'completed', 'cancelled'],
  },
  buyer: {
    pending: ['cancelled'],
    accepted: ['completed', 'cancelled'],
    scheduled: ['completed', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
  },
}

const TIMESTAMP_FIELDS = { rejected: 'rejectedAt', completed: 'completedAt', cancelled: 'cancelledAt' }

const label = (status) => status.replace('_', ' ')

// Accepting a request holds its quantity on the listing so it cannot be promised twice
const reserveQuantity = async (request) => {
  const result = await Listing.updateOne(
    { _id: request.listing, status: 'approved', quantity: { $gte: request.quantity } },
    { $inc: { quantity: -request.quantity } }
  )
  if (result.modifiedCount === 1) return null

  const listing = await Listing.findById(request.listing).select('status quantity').lean()
  if (!listing || listing.status !== 'approved') return 'The listing for this request is not currently approved'
  return `Only ${listing.quantity} kg is still available on this listing`
}

const releaseQuantity = (listingId, quantity) =>
  Listing.updateOne({ _id: listingId }, { $inc: { quantity } })

// Give quantity back without masking the original outcome; a failure is logged with enough
// detail to correct the listing by hand
const releaseQuietly = async (request, quantity, reason) => {
  try {
    await releaseQuantity(request.listing, quantity)
  } catch (error) {
    console.error(
      `Could not return ${quantity} kg to listing ${request.listing} (${reason}, request ${request._id}): ${error.message}`
    )
  }
}

// Move a request the user is party to into status `to`, enforcing the lifecycle above.
// `owner` scopes the lookup ({ seller } or { buyer }); `set` (object, or function of the
// current request) holds extra fields to update. Resolves to { request } or { status, message }.
export const transitionRequest = async ({ id, role, owner, to, set = {} }) => {
  const request = await Request.findOne({ _id: id, ...owner })
  if (!request) return { status: 404, message: 'Request not found' }

  const from = request.status
  if (!TRANSITIONS[role]?.[from]?.includes(to)) {
    return { status: 409, message: `Cannot change a ${label(from)} request to ${label(to)}` }
  }

  const fields = { ...(typeof set === 'function' ? set(request) : set) }
  if (TIMESTAMP_FIELDS[to]) fields[TIMESTAMP_FIELDS[to]] = new Date()
  if (to === 'cancelled') {
    fields.cancelledBy = role
    fields.reservedQuantity = 0
  }

  const reserving = from === 'pending' && to === 'accepted'
  if (reserving) {
    const problem = await reserveQuantity(request)
    if (problem) return { status: 409, message: problem }
    fields.reservedQuantity = request.quantity
    fields.acceptedAt = new Date()
  }

  // Conditional on the status just checked, so a concurrent update cannot slip past the rules
  let updated
  try {
    updated = await Request.findOneAndUpdate(
      { _id: request._id, status: from },
      { $set: { ...fields, status: to, updatedAt: new Date() } },
      { new: true, runValidators: true }
    )
  } catch (error) {
    // The status did not change, so the quantity held for it must not stay held
    if (reserving) await releaseQuietly(request, request.quantity, 'accept failed')
    throw error
  }
  if (!updated) {
    if (reserving) await releaseQuietly(request, request.quantity, 'accept lost a race')
    return { status: 409, message: 'Request was changed by another update, please refresh' }
  }

  // A cancelled collection gives its held quantity back to the listing
  if (to === 'cancelled' && request.reservedQuantity > 0) {
    await releaseQuietly(request, request.reservedQuantity, 'cancelled')
  }

  await notifyRequestTransition({ request: updated, from, to, actorRole: role })
  return { request: updated }
}

export const sendTransitionResult = (res, result) => {
  if (!result.request) {
    return res.status(result.status).json({ success: false, message: result.message })
  }
  res.json({ success: true, request: result.request })
}
