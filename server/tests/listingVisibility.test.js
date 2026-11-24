import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, objectId } from './helpers/client.js'

const LISTING = { title: 'PET bottles', plasticType: 'PET', quantity: 40, pricePerKg: 20, location: 'Pune' }

// Default mode (REQUIRE_LISTING_APPROVAL unset or false): there is no admin review yet, so a new
// listing is on the marketplace straight away while rejected and sold-out listings stay hidden.
// The admin-review mode is covered by listings.test.js, sellerListings.test.js and workflow.test.js.
describe('listing visibility without admin review', () => {
  let env, db, call, seller, otherSeller, buyer, fresh

  const setListing = (id, fields) => db.collection('listings').updateOne({ _id: objectId(id) }, { $set: fields })
  const storedListing = (id) => db.collection('listings').findOne({ _id: objectId(id) })
  const create = async (overrides = {}) => {
    const res = await call('POST', '/seller/listings', seller.token, { ...LISTING, ...overrides })
    assert.equal(res.status, 201)
    return res.data
  }
  const browseIds = async () => (await call('GET', '/buyer/listings?limit=50', buyer.token)).data.listings.map((l) => l._id)

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    const client = createClient(env)
    call = client.call
    seller = await client.register('Seller A', 'seller')
    otherSeller = await client.register('Seller B', 'seller')
    buyer = await client.register('Buyer A', 'buyer')
  })

  after(async () => {
    await db?.close()
    await env?.stop()
  })

  it('puts a new listing on the marketplace straight away', async () => {
    const created = await create({ title: 'Fresh listing' })
    fresh = created.listing
    assert.equal(created.approvalRequired, false)
    // The listing is still unreviewed; only its visibility differs from the admin-review mode
    assert.equal(fresh.status, 'pending')

    assert.ok((await browseIds()).includes(fresh._id))
    const details = await call('GET', `/buyer/listings/${fresh._id}`, buyer.token)
    assert.equal(details.status, 200)
    assert.equal(details.data.listing.title, 'Fresh listing')
    const stats = await call('GET', '/buyer/dashboard/stats', buyer.token)
    assert.equal(stats.data.stats.availableMarketplaceListings, 1)
  })

  it('tells the seller the listing is published', async () => {
    const res = await call('GET', '/notifications?type=listing', seller.token)
    const notification = res.data.notifications.find((n) => n.event === 'listing_submitted')
    assert.equal(notification.title, 'Listing published')
    assert.equal(notification.message, '"Fresh listing" is now visible to buyers on the marketplace.')
  })

  it('keeps rejected and sold-out listings hidden from buyers', async () => {
    const rejected = (await create({ title: 'Rejected listing' })).listing
    await setListing(rejected._id, { status: 'rejected' })
    const soldOut = (await create({ title: 'Sold out listing' })).listing
    await setListing(soldOut._id, { quantity: 0 })

    const ids = await browseIds()
    for (const listing of [rejected, soldOut]) {
      assert.ok(!ids.includes(listing._id), listing.title)
      assert.equal((await call('GET', `/buyer/listings/${listing._id}`, buyer.token)).status, 404, listing.title)
      const request = await call('POST', '/buyer/requests', buyer.token, { listingId: listing._id, quantity: 1 })
      assert.equal(request.status, 404, listing.title)
    }
  })

  it('counts unreviewed listings as live in the seller\'s tabs and stats', async () => {
    const res = await call('GET', '/seller/listings', seller.token)
    assert.equal(res.data.approvalRequired, false)
    // "approved" is the live tab; "pending" still counts listings nobody has reviewed
    assert.deepEqual(res.data.counts, { all: 3, approved: 1, pending: 2, rejected: 1, sold_out: 1 })
    const live = await call('GET', '/seller/listings?status=approved', seller.token)
    assert.deepEqual(live.data.listings.map((l) => l.title), ['Fresh listing'])
    const soldOut = await call('GET', '/seller/listings?status=sold_out', seller.token)
    assert.deepEqual(soldOut.data.listings.map((l) => l.title), ['Sold out listing'])

    const stats = await call('GET', '/seller/dashboard/stats', seller.token)
    assert.equal(stats.data.approvalRequired, false)
    assert.equal(stats.data.stats.activeListings, 1)
    assert.equal(stats.data.stats.soldOutListings, 1)
    assert.equal((await call('GET', `/seller/listings/${fresh._id}`, seller.token)).data.approvalRequired, false)
  })

  it('keeps an edited listing on the marketplace', async () => {
    const res = await call('PUT', `/seller/listings/${fresh._id}`, seller.token, { ...LISTING, title: 'Edited listing' })
    assert.equal(res.status, 200)
    assert.equal(res.data.approvalRequired, false)
    const details = await call('GET', `/buyer/listings/${fresh._id}`, buyer.token)
    assert.equal(details.status, 200)
    assert.equal(details.data.listing.title, 'Edited listing')
    const notifications = await call('GET', '/notifications?type=listing', seller.token)
    assert.ok(notifications.data.notifications.some((n) => n.event === 'listing_resubmitted' && n.title === 'Listing updated'))
  })

  it('lets the seller accept a request for an unreviewed listing and reserves the quantity', async () => {
    const request = await call('POST', '/buyer/requests', buyer.token, { listingId: fresh._id, quantity: 15 })
    assert.equal(request.status, 201)
    const accepted = await call('PUT', `/seller/requests/${request.data.request._id}/accept`, seller.token)
    assert.equal(accepted.status, 200)
    assert.equal(accepted.data.request.status, 'accepted')
    const stored = await storedListing(fresh._id)
    assert.equal(stored.quantity, 25)
    assert.equal(stored.status, 'pending')
  })

  it('refuses to accept a request once its listing is rejected', async () => {
    const listing = (await create({ title: 'Later rejected', quantity: 10 })).listing
    const request = await call('POST', '/buyer/requests', buyer.token, { listingId: listing._id, quantity: 5 })
    assert.equal(request.status, 201)
    await setListing(listing._id, { status: 'rejected' })

    const res = await call('PUT', `/seller/requests/${request.data.request._id}/accept`, seller.token)
    assert.equal(res.status, 409)
    assert.equal(res.data.message, 'The listing for this request is not currently available')
    assert.equal((await storedListing(listing._id)).quantity, 10)
  })

  it('ignores status, owner and counters sent by the seller, on create and on edit', async () => {
    const created = await create({ title: 'Self-approved', status: 'approved', seller: otherSeller.id, viewCount: 50 })
    assert.equal(created.listing.status, 'pending')
    assert.equal(created.listing.seller, seller.id)
    assert.equal(created.listing.viewCount, 0)

    const hidden = await create({ title: 'Self-rejected', status: 'rejected' })
    assert.equal(hidden.listing.status, 'pending')
    assert.ok((await browseIds()).includes(hidden.listing._id))

    const edited = await call('PUT', `/seller/listings/${created.listing._id}`, seller.token, { ...LISTING, status: 'approved', seller: otherSeller.id })
    assert.equal(edited.status, 200)
    const stored = await storedListing(created.listing._id)
    assert.equal(stored.status, 'pending')
    assert.equal(String(stored.seller), seller.id)
  })

  it('keeps each listing private to its seller', async () => {
    const { listing } = await create({ title: 'Owned listing' })
    for (const [method, body] of [['GET'], ['PUT', LISTING], ['DELETE']]) {
      assert.equal((await call(method, `/seller/listings/${listing._id}`, otherSeller.token, body)).status, 404, method)
    }
    assert.ok(!(await call('GET', '/seller/listings?limit=50', otherSeller.token)).data.listings.some((l) => l._id === listing._id))
    assert.equal((await call('GET', '/seller/listings', buyer.token)).status, 403)
    assert.equal((await call('POST', '/buyer/requests', seller.token, { listingId: listing._id, quantity: 1 })).status, 403)
    assert.equal((await storedListing(listing._id)).title, 'Owned listing')
  })

  it('only lets buyers request what is left on a listing', async () => {
    const { listing } = await create({ title: 'Small batch', quantity: 6 })
    const tooMuch = await call('POST', '/buyer/requests', buyer.token, { listingId: listing._id, quantity: 7 })
    assert.equal(tooMuch.status, 400)
    assert.equal(tooMuch.data.message, 'Only 6 kg is available on this listing')
    const exact = await call('POST', '/buyer/requests', buyer.token, { listingId: listing._id, quantity: 6 })
    assert.equal(exact.status, 201)
    assert.equal((await call('PUT', `/seller/requests/${exact.data.request._id}/accept`, seller.token)).status, 200)

    // Fully reserved: the listing leaves the marketplace but stays with its seller as sold out
    assert.equal((await storedListing(listing._id)).quantity, 0)
    assert.ok(!(await browseIds()).includes(listing._id))
    assert.equal((await call('GET', `/buyer/listings/${listing._id}`, buyer.token)).status, 404)
    const soldOut = await call('GET', '/seller/listings?status=sold_out', seller.token)
    assert.ok(soldOut.data.listings.some((l) => l._id === listing._id))
  })
})
