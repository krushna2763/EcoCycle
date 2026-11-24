// Which listings buyers can see.
//
// Admin review is controlled by the REQUIRE_LISTING_APPROVAL environment variable.
// When REQUIRE_LISTING_APPROVAL=true, only admin-approved listings (status: "approved")
// are shown to buyers. Rejected listings are never shown to buyers.
// When false/unset, listings with status "approved" and "pending" are visible.
export const listingApprovalRequired = () => process.env.REQUIRE_LISTING_APPROVAL === 'true'

export const visibleStatuses = () => (listingApprovalRequired() ? ['approved'] : ['approved', 'pending'])

// Listings a buyer can browse and request: visible and with quantity left
export const marketplaceFilter = () => ({ status: { $in: visibleStatuses() }, quantity: { $gt: 0 } })
