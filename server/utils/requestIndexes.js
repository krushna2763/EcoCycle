import Request from '../models/Request.js'
import { OPEN_STATUSES } from './requestStatus.js'

export const OPEN_REQUEST_INDEX = 'unique_open_request_per_listing_and_buyer'

// Requests covered by the rule: open ones with a buyer ID (old seeded requests may have none)
const OPEN_REQUEST_FILTER = { status: { $in: OPEN_STATUSES }, buyer: { $type: 'objectId' } }

// Make "one open request per buyer and listing" a database guarantee, so two concurrent
// submissions cannot both succeed. Existing data is never changed: if old records already
// break the rule, the index is skipped and the conflicting request IDs are logged so they
// can be resolved by hand (the controller's pre-check still applies meanwhile).
export async function ensureOpenRequestIndex({ logger = console } = {}) {
  // Let Mongoose finish creating the collection and its schema indexes first
  await Request.init()
  const collection = Request.collection

  const indexes = await collection.indexes()
  if (indexes.some((index) => index.name === OPEN_REQUEST_INDEX)) return { status: 'exists' }

  const conflicts = await collection.aggregate([
    { $match: OPEN_REQUEST_FILTER },
    { $group: { _id: { listing: '$listing', buyer: '$buyer' }, requestIds: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]).toArray()

  if (conflicts.length > 0) {
    const pairs = conflicts.map((c) => c.requestIds.map(String).join('+')).join(', ')
    logger.warn(
      `Open-request index not created: ${conflicts.length} buyer/listing pair(s) already have more than one open request. ` +
      `Cancel or close the extra requests, then restart the server. Requests: ${pairs}`
    )
    return { status: 'conflicts', conflicts }
  }

  try {
    await collection.createIndex(
      { listing: 1, buyer: 1 },
      { name: OPEN_REQUEST_INDEX, unique: true, partialFilterExpression: OPEN_REQUEST_FILTER }
    )
    logger.log('Open-request index created')
    return { status: 'created' }
  } catch (error) {
    logger.error(`Open-request index could not be created: ${error.message}`)
    return { status: 'failed', error }
  }
}
