import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, objectId, png } from './helpers/client.js'

// End-to-end buyer-seller flow: listing -> request -> accept -> schedule -> collect,
// including quantity reservation, duplicate protection and notifications
describe('buyer-seller workflow', () => {
  let env, db, call, upload
  let seller, buyer, buyer2, buyer3
  let listingId, requestId, request2Id

  const listingQuantity = async () => (await db.collection('listings').findOne({ _id: objectId(listingId) })).quantity
  const notificationsOf = async (user, query = '') => (await call('GET', `/notifications${query}`, user.token)).data
  const browseIds = async (user) => (await call('GET', '/buyer/listings', user.token)).data.listings.map((l) => l._id)

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    const client = createClient(env)
    ;({ call, upload } = client)
    seller = await client.register('Seller A', 'seller')
    buyer = await client.register('Buyer A', 'buyer', { businessName: 'Recycle Co' })
    buyer2 = await client.register('Buyer B', 'buyer')
    buyer3 = await client.register('Buyer C', 'buyer')
  })

  after(async () => {
    await db?.close()
    await env?.stop()
  })

  it('1-2. seller creates a listing that starts pending and owned by them', async () => {
    const photo = await upload(seller.token, [png()])
    const res = await call('POST', '/seller/listings', seller.token, {
      title: 'Clean PET bottles', plasticType: 'PET', quantity: 50, pricePerKg: 25, location: 'Pune',
      images: [photo.data.files[0].url],
    })
    assert.equal(res.status, 201)
    assert.equal(res.data.listing.status, 'pending')
    assert.equal(res.data.listing.seller, seller.id)
    listingId = res.data.listing._id
  })

  it('3. buyers see it only once it is approved', async () => {
    assert.ok(!(await browseIds(buyer)).includes(listingId))
    assert.equal((await call('GET', `/buyer/listings/${listingId}`, buyer.token)).status, 404)
    // No approval endpoint exists yet; simulate the future admin step in the test database
    await db.collection('listings').updateOne({ _id: objectId(listingId) }, { $set: { status: 'approved' } })
    const browse = await call('GET', '/buyer/listings?limit=5', buyer.token)
    assert.ok(browse.data.listings.some((l) => l._id === listingId))
    assert.equal(browse.data.page, 1)
    assert.ok(browse.data.total >= 1)
  })

  it('4. buyer opens details and sends a valid request; duplicates are refused', async () => {
    const details = await call('GET', `/buyer/listings/${listingId}`, buyer.token)
    assert.equal(details.status, 200)
    assert.equal(details.data.activeRequest, null)
    assert.match(details.data.listing.image, /^\/api\/uploads\//)

    assert.equal((await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 60 })).status, 400)
    const res = await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 30, offerPrice: 24 })
    assert.equal(res.status, 201)
    requestId = res.data.request._id

    const duplicate = await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 5 })
    assert.equal(duplicate.status, 409)
    assert.equal((await call('GET', `/buyer/listings/${listingId}`, buyer.token)).data.activeRequest._id, requestId)
  })

  it('5. seller sees the request and a notification', async () => {
    const res = await call('GET', '/seller/requests?status=pending', seller.token)
    assert.equal(res.data.counts.pending, 1)
    const request = res.data.requests.find((r) => r._id === requestId)
    assert.equal(request.companyName, 'Recycle Co')
    assert.equal(request.listing.title, 'Clean PET bottles')
    assert.ok((await notificationsOf(seller)).notifications.some((n) => n.event === 'request_created' && n.request === requestId))
  })

  it('6-7. seller accepts; quantity is reserved and the buyer is told', async () => {
    const res = await call('PUT', `/seller/requests/${requestId}/accept`, seller.token)
    assert.equal(res.status, 200)
    assert.equal(res.data.request.reservedQuantity, 30)
    assert.ok(res.data.request.acceptedAt)
    assert.equal(await listingQuantity(), 20)

    const mine = await call('GET', '/buyer/requests', buyer.token)
    assert.equal(mine.data.requests.find((r) => r._id === requestId).status, 'accepted')
    assert.ok((await notificationsOf(buyer)).notifications.some((n) => n.event === 'request_accepted'))
  })

  it('reserved quantity limits other buyers and sold-out listings leave the marketplace', async () => {
    assert.equal((await call('POST', '/buyer/requests', buyer2.token, { listingId, quantity: 30 })).status, 400)
    const res = await call('POST', '/buyer/requests', buyer2.token, { listingId, quantity: 20 })
    assert.equal(res.status, 201)
    request2Id = res.data.request._id
    assert.equal((await call('PUT', `/seller/requests/${request2Id}/accept`, seller.token)).status, 200)
    assert.equal(await listingQuantity(), 0)

    assert.ok(!(await browseIds(buyer3)).includes(listingId))
    assert.equal((await call('GET', `/buyer/listings/${listingId}`, buyer3.token)).status, 404)
    assert.equal((await call('POST', '/buyer/requests', buyer3.token, { listingId, quantity: 1 })).status, 404)
  })

  it('a seller cannot accept more than is left', async () => {
    await db.collection('listings').updateOne({ _id: objectId(listingId) }, { $set: { quantity: 5 } })
    const late = await db.collection('requests').insertOne({
      seller: objectId(seller.id), listing: objectId(listingId), buyer: objectId(buyer3.id), companyName: 'Buyer C',
      interestedPlasticType: 'PET', quantity: 10, location: 'Pune', status: 'pending', createdAt: new Date(), updatedAt: new Date(),
    })
    const res = await call('PUT', `/seller/requests/${late.insertedId}/accept`, seller.token)
    assert.equal(res.status, 409)
    assert.equal(res.data.message, 'Only 5 kg is still available on this listing')
    await db.collection('listings').updateOne({ _id: objectId(listingId) }, { $set: { quantity: 0 } })
  })

  it('8-9. seller schedules; both sides see the collection details', async () => {
    const res = await call('PUT', `/seller/requests/${requestId}/schedule`, seller.token, {
      scheduledDate: '2026-11-05', scheduledTime: '10:30', scheduledLocation: 'Warehouse 4, Pune', scheduleNote: 'Gate 2',
    })
    assert.equal(res.status, 200)
    const forBuyer = (await call('GET', '/buyer/requests', buyer.token)).data.requests.find((r) => r._id === requestId)
    assert.equal(forBuyer.status, 'scheduled')
    assert.equal(forBuyer.scheduledLocation, 'Warehouse 4, Pune')
    assert.equal(forBuyer.scheduleNote, 'Gate 2')
    const forSeller = (await call('GET', '/seller/requests?status=scheduled', seller.token)).data.requests[0]
    assert.equal(forSeller._id, requestId)
    assert.ok((await notificationsOf(buyer, '?type=collection')).notifications.some((n) => n.event === 'collection_scheduled'))
    assert.equal((await call('PUT', `/seller/requests/${requestId}/schedule`, seller.token, {})).status, 400)
  })

  it('10. collection progresses and completes only through valid transitions', async () => {
    assert.equal((await call('PUT', `/seller/requests/${requestId}/status`, seller.token, { status: 'in_progress' })).status, 200)
    assert.equal((await call('PUT', `/seller/requests/${requestId}/status`, seller.token, { status: 'completed' })).status, 200)
    assert.equal((await call('PUT', `/buyer/requests/${requestId}/cancel`, buyer.token)).status, 409)
    const done = (await call('GET', '/buyer/requests', buyer.token)).data.requests.find((r) => r._id === requestId)
    assert.equal(done.status, 'completed')
    assert.ok(done.completedAt)
    assert.ok((await notificationsOf(buyer)).notifications.some((n) => n.event === 'collection_completed'))
  })

  it('cancelling an accepted collection returns its quantity to the listing', async () => {
    const res = await call('PUT', `/buyer/requests/${request2Id}/cancel`, buyer2.token, { reason: 'Truck broke down' })
    assert.equal(res.status, 200)
    assert.equal(res.data.request.cancelledBy, 'buyer')
    assert.equal(await listingQuantity(), 20)
    assert.ok((await browseIds(buyer3)).includes(listingId))
    assert.ok((await notificationsOf(seller)).notifications.some((n) => n.event === 'collection_cancelled'))
  })

  it('11. both dashboards reflect the same numbers', async () => {
    const sellerStats = (await call('GET', '/seller/dashboard/stats', seller.token)).data.stats
    assert.equal(sellerStats.totalListings, 1)
    assert.equal(sellerStats.activeListings, 1)
    assert.equal(sellerStats.completedCollections, 1)
    assert.equal(sellerStats.completed, 1)
    assert.equal(sellerStats.totalRecycled, 30)
    assert.equal(sellerStats.totalRecycledAllTime, 30)
    assert.equal(sellerStats.pendingRequests, 1)
    assert.ok(sellerStats.totalViews >= 2)

    const buyerStats = (await call('GET', '/buyer/dashboard/stats', buyer.token)).data.stats
    assert.equal(buyerStats.completedRequests, 1)
    assert.equal(buyerStats.totalMaterialsProcured, 30)
  })

  it('12. notification preferences are respected', async () => {
    assert.equal((await call('PUT', '/buyer/settings', buyer3.token, { notifications: { requestUpdates: false } })).status, 200)
    const pending = await db.collection('requests').findOne({ buyer: objectId(buyer3.id), status: 'pending' })
    assert.equal((await call('PUT', `/seller/requests/${pending._id}/reject`, seller.token, { reason: 'No' })).status, 200)
    const events = (await notificationsOf(buyer3)).notifications.map((n) => n.event)
    assert.ok(!events.includes('request_rejected'))
  })
})
