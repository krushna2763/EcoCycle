import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, objectId } from './helpers/client.js'

describe('admin dashboard, approval workflow, and seller resubmission', () => {
  let env, db, call, seller, buyer, adminUser, listingId

  before(async () => {
    env = await startTestServer({ env: { REQUIRE_LISTING_APPROVAL: 'true' } })
    db = await connectTestDb(env.dbUri)
    const client = createClient(env)
    call = client.call

    seller = await client.register('Test Seller', 'seller')
    buyer = await client.register('Test Buyer', 'buyer')

    // Create an admin user by registering and promoting role in test db
    const registeredAdmin = await client.register('Platform Admin', 'seller')
    await db.collection('sellers').updateOne(
      { _id: objectId(registeredAdmin.id) },
      { $set: { role: 'admin' } }
    )
    adminUser = registeredAdmin
  })

  after(async () => {
    await db?.close()
    await env?.stop()
  })

  it('rejects unauthenticated and non-admin requests to admin endpoints', async () => {
    const unauth = await call('GET', '/admin/dashboard/stats')
    assert.equal(unauth.status, 401)

    const sellerAttempt = await call('GET', '/admin/dashboard/stats', seller.token)
    assert.equal(sellerAttempt.status, 403)

    const buyerAttempt = await call('GET', '/admin/dashboard/stats', buyer.token)
    assert.equal(buyerAttempt.status, 403)
  })

  it('allows admin to fetch platform stats and registered users', async () => {
    const statsRes = await call('GET', '/admin/dashboard/stats', adminUser.token)
    assert.equal(statsRes.status, 200)
    assert.equal(statsRes.data.success, true)
    assert.ok(statsRes.data.stats)
    assert.ok(typeof statsRes.data.stats.totalListings === 'number')

    const usersRes = await call('GET', '/admin/users?role=seller', adminUser.token)
    assert.equal(usersRes.status, 200)
    assert.equal(usersRes.data.success, true)
    assert.ok(Array.isArray(usersRes.data.users))
    assert.ok(usersRes.data.users.length >= 1)
  })

  it('seller creates a listing; admin views it in pending list', async () => {
    const createRes = await call('POST', '/seller/listings', seller.token, {
      title: 'HDPE Scrap Drums',
      plasticType: 'HDPE',
      quantity: 100,
      pricePerKg: 35,
      location: 'Pune',
    })
    assert.equal(createRes.status, 201)
    listingId = createRes.data.listing._id
    assert.equal(createRes.data.listing.status, 'pending')

    // Verify buyer does not see pending listing on marketplace
    const buyerMarket = await call('GET', '/buyer/listings', buyer.token)
    assert.equal(buyerMarket.status, 200)
    const foundByBuyer = buyerMarket.data.listings.find((l) => l._id === listingId)
    assert.equal(foundByBuyer, undefined)

    // Admin pending listings includes it
    const pendingRes = await call('GET', '/admin/listings', adminUser.token)
    assert.equal(pendingRes.status, 200)
    const foundByAdmin = pendingRes.data.listings.find((l) => l._id === listingId)
    assert.ok(foundByAdmin)
    assert.equal(foundByAdmin.seller.fullName, 'Test Seller')
  })

  it('admin rejects listing with validation on remarks length', async () => {
    // Too short (< 10 chars)
    const shortRemarks = await call('PUT', `/admin/listings/${listingId}/reject`, adminUser.token, {
      remarks: 'Bad photo',
    })
    assert.equal(shortRemarks.status, 400)
    assert.equal(shortRemarks.data.success, false)

    // Valid rejection remarks (>= 10 chars)
    const validReject = await call('PUT', `/admin/listings/${listingId}/reject`, adminUser.token, {
      remarks: 'Please provide clear photos showing the drum quality.',
    })
    assert.equal(validReject.status, 200)
    assert.equal(validReject.data.success, true)
    assert.equal(validReject.data.listing.status, 'rejected')
    assert.equal(validReject.data.listing.rejectionRemarks, 'Please provide clear photos showing the drum quality.')

    // Seller gets listing and sees remarks
    const sellerListing = await call('GET', `/seller/listings/${listingId}`, seller.token)
    assert.equal(sellerListing.status, 200)
    assert.equal(sellerListing.data.listing.status, 'rejected')
    assert.equal(sellerListing.data.listing.rejectionRemarks, 'Please provide clear photos showing the drum quality.')
  })

  it('seller resubmits rejected listing; resets status to pending and clears remarks', async () => {
    const editRes = await call('PUT', `/seller/listings/${listingId}`, seller.token, {
      title: 'HDPE Scrap Drums - Cleaned',
      plasticType: 'HDPE',
      quantity: 120,
      pricePerKg: 35,
      location: 'Pune',
    })
    assert.equal(editRes.status, 200)
    assert.equal(editRes.data.listing.status, 'pending')
    assert.equal(editRes.data.listing.rejectionRemarks, null)
    assert.equal(editRes.data.listing.reviewedAt, null)
    assert.equal(editRes.data.listing.reviewedBy, null)
  })

  it('admin approves listing; listing becomes visible to buyer on marketplace', async () => {
    const approveRes = await call('PUT', `/admin/listings/${listingId}/approve`, adminUser.token)
    assert.equal(approveRes.status, 200)
    assert.equal(approveRes.data.success, true)
    assert.equal(approveRes.data.listing.status, 'approved')

    // Now buyer CAN see it
    const buyerMarket = await call('GET', '/buyer/listings', buyer.token)
    assert.equal(buyerMarket.status, 200)
    const foundByBuyer = buyerMarket.data.listings.find((l) => l._id === listingId)
    assert.ok(foundByBuyer)
    assert.equal(foundByBuyer.title, 'HDPE Scrap Drums - Cleaned')
  })
})
