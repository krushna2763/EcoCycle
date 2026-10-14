import Request from '../models/Request.js'

// Conversation IDs follow the existing `conv_<sellerId>_<buyerId>` convention.
// The ID is only an address; access is decided by the checks below, never by secrecy of the ID.
const CONVERSATION_ID = /^conv_([a-f\d]{24})_([a-f\d]{24})$/

// Returns the conversation's participants plus the other party for userId,
// or null if the ID is malformed or userId is not one of the two participants.
export const getConversationAccess = (conversationId, userId) => {
  if (typeof conversationId !== 'string') return null
  const match = CONVERSATION_ID.exec(conversationId)
  if (!match) return null

  const [, sellerId, buyerId] = match
  const uid = String(userId)
  if (uid === sellerId) return { sellerId, buyerId, otherId: buyerId }
  if (uid === buyerId) return { sellerId, buyerId, otherId: sellerId }
  return null
}

// Messages may only be sent between a seller and a buyer who has sent that seller a request
export const hasTradingRelationship = async ({ sellerId, buyerId }) =>
  Boolean(await Request.exists({ seller: sellerId, buyer: buyerId }))
