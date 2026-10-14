// Helpers shared by the request and collection pages

const idOf = (value) => (value && typeof value === 'object' ? value._id : value)

// Conversation IDs follow the server's `conv_<sellerId>_<buyerId>` convention
export const conversationIdFor = (request) => `conv_${idOf(request.seller)}_${idOf(request.buyer)}`

export const ACTIVE_STATUSES = ['accepted', 'scheduled', 'in_progress']

// Collections are requests the seller accepted (including ones later cancelled)
export const isCollection = (request) =>
  [...ACTIVE_STATUSES, 'completed'].includes(request.status) ||
  (request.status === 'cancelled' && Boolean(request.acceptedAt || request.scheduledDate))

// Escape a value for a CSV cell
export const csvCell = (value) => {
  const text = value === undefined || value === null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}
