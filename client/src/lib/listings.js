// Helpers shared by the seller listing views

// How a seller's listing is shown. Without admin review (approvalRequired false), unreviewed
// ("pending") listings are already on the marketplace, so they are live like approved ones.
export const listingStatusKey = (listing, approvalRequired) => {
  const live = listing.status === 'approved' || (listing.status === 'pending' && !approvalRequired)
  if (!live) return listing.status
  if (listing.quantity <= 0) return 'sold_out'
  return approvalRequired ? 'approved' : 'live'
}
