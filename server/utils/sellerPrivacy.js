import Request from '../models/Request.js'
import Settings from '../models/Settings.js'

// Seller fields covered by privacy.profileVisibility
const PROFILE_FIELDS = ['fullName', 'businessName', 'city', 'sellerType', 'verificationStatus']
// Seller fields covered by privacy.showContactInformation
const CONTACT_FIELDS = ['phone', 'email', 'pickupAddress']
// Request statuses in which the seller has agreed to deal with the buyer
export const ENGAGED_STATUSES = ['accepted', 'scheduled', 'in_progress', 'completed']

const DEFAULT_PRIVACY = { profileVisibility: 'Public', showContactInformation: true }

// Fetch privacy settings for many sellers in one query; sellers without a Settings document get the defaults
export const loadSellerPrivacy = async (sellerIds) => {
  const settings = await Settings.find({ seller: { $in: sellerIds } }).select('seller privacy').lean()
  const bySeller = new Map(settings.map((s) => [String(s.seller), { ...DEFAULT_PRIVACY, ...s.privacy }]))
  return (sellerId) => bySeller.get(String(sellerId)) || DEFAULT_PRIVACY
}

// A seller who accepted the buyer's request is always identifiable to that buyer;
// otherwise profileVisibility decides
export const canViewSellerProfile = (privacy, viewer, engaged) => {
  if (engaged) return true
  if (privacy.profileVisibility === 'Private') return false
  if (privacy.profileVisibility === 'Verified Recyclers Only') return viewer?.verificationStatus === 'verified'
  return true
}

// Contact details need both an accepted request and showContactInformation enabled
export const canViewSellerContact = (privacy, engaged) => engaged && privacy.showContactInformation !== false

// Remove the populated-seller fields `viewer` may not see from plain listing or request objects.
// `statusOf(item)` returns the request status for requests, undefined for listings.
export const applySellerPrivacy = async (items, viewer, statusOf = () => undefined) => {
  const privacyOf = await loadSellerPrivacy(items.map((item) => item.seller?._id).filter(Boolean))

  items.forEach((item) => {
    const seller = item.seller
    if (!seller) return
    const privacy = privacyOf(seller._id)
    const engaged = ENGAGED_STATUSES.includes(statusOf(item))
    if (!canViewSellerContact(privacy, engaged)) CONTACT_FIELDS.forEach((field) => delete seller[field])
    if (!canViewSellerProfile(privacy, viewer, engaged)) PROFILE_FIELDS.forEach((field) => delete seller[field])
  })
  return items
}

// Whether `viewer` (a buyer) may see the profile of the seller they are dealing with
export const canBuyerViewSeller = async (sellerId, viewer) => {
  const [privacyOf, engaged] = await Promise.all([
    loadSellerPrivacy([sellerId]),
    Request.exists({ seller: sellerId, buyer: viewer._id, status: { $in: ENGAGED_STATUSES } }),
  ])
  return canViewSellerProfile(privacyOf(sellerId), viewer, Boolean(engaged))
}
