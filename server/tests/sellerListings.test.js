import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, insertApprovedListing, objectId, png } from './helpers/client.js'

const LISTING = { title: 'PET bottles', plasticType: 'PET', quantity: 40, pricePerKg: 20, location: 'Pune' }

describe('seller listing management', () => {
  let env, db, call, upload, seller, otherSeller, buyer

  const approve = (id) => db.collection('listings').updateOne({ _id: objectId(id) }, { $set: { status: 'approved' } })
  const create = async (overrides = {}) => {
    const res = await call('POST', '/seller/listings', seller.token, { ...LISTING, ...overrides })
    assert.equal(res.status, 201)
    return res.data.listing
  }

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    const client = createClient(env)
    ;({ call, upload } = client)
    seller = await client.register('Seller A', 'seller')
    otherSeller = await client.register('Seller B', 'seller')
    buyer = await client.register('Buyer A', 'buyer')
  })

  after(async () => {
    await db?.close()
    await env?.stop()
  })

  describe('listing and filtering', () => {
    before(async () => {
      const approved = await create({ title: 'Approved one', pricePerKg: 10 })
      await approve(approved._id)
      const soldOut = await create({ title: 'Sold out one', pricePerKg: 30 })
      await db.collection('listings').updateOne({ _id: objectId(soldOut._id) }, { $set: { status: 'approved', quantity: 0 } })
      const rejected = await create({ title: 'Rejected one', pricePerKg: 40 })
      await db.collection('listings').updateOne({ _id: objectId(rejected._id) }, { $set: { status: 'rejected' } })
      await create({ title: 'Pending one', pricePerKg: 20 })
      await insertApprovedListing(db, otherSeller.id, { title: 'Not mine' })
    })

    it('returns only the seller\'s own listings with status counts', async () => {
      const res = await call('GET', '/seller/listings', seller.token)
      assert.equal(res.status, 200)
      assert.equal(res.data.total, 4)
      assert.ok(res.data.listings.every((l) => l.seller === seller.id))
      assert.deepEqual(res.data.counts, { all: 4, approved: 1, pending: 1, rejected: 1, sold_out: 1 })
    })

    it('filters by status, sorts and paginates', async () => {
      const approved = await call('GET', '/seller/listings?status=approved', seller.token)
      assert.deepEqual(approved.data.listings.map((l) => l.title), ['Approved one'])
      const soldOut = await call('GET', '/seller/listings?status=sold_out', seller.token)
      assert.deepEqual(soldOut.data.listings.map((l) => l.title), ['Sold out one'])
      const cheapest = await call('GET', '/seller/listings?sort=price_asc&limit=2&page=1', seller.token)
      assert.deepEqual(cheapest.data.listings.map((l) => l.pricePerKg), [10, 20])
      assert.equal(cheapest.data.pages, 2)
      const page2 = await call('GET', '/seller/listings?sort=price_asc&limit=2&page=2', seller.token)
      assert.deepEqual(page2.data.listings.map((l) => l.pricePerKg), [30, 40])
    })

    it('records a "listing submitted" notification', async () => {
      const res = await call('GET', '/notifications?type=listing', seller.token)
      assert.ok(res.data.notifications.some((n) => n.event === 'listing_submitted'))
    })
  })

  describe('viewing, editing and deleting', () => {
    it('shows a single own listing and hides other sellers\' listings', async () => {
      const listing = await create()
      assert.equal((await call('GET', `/seller/listings/${listing._id}`, seller.token)).status, 200)
      assert.equal((await call('GET', `/seller/listings/${listing._id}`, otherSeller.token)).status, 404)
      assert.equal((await call('GET', `/seller/listings/${listing._id}`, buyer.token)).status, 403)
    })

    it('sends an edited approved listing back for review and ignores protected fields', async () => {
      const listing = await create()
      await approve(listing._id)
      const res = await call('PUT', `/seller/listings/${listing._id}`, seller.token, {
        ...LISTING, title: 'Edited title', status: 'approved', seller: otherSeller.id, viewCount: 99,
      })
      assert.equal(res.status, 200)
      assert.equal(res.data.listing.title, 'Edited title')
      assert.equal(res.data.listing.status, 'pending')
      assert.equal(res.data.listing.seller, seller.id)
      assert.equal(res.data.listing.viewCount, 0)
      assert.equal((await call('GET', `/buyer/listings/${listing._id}`, buyer.token)).status, 404)
    })

    it('validates edits like new listings', async () => {
      const listing = await create()
      assert.equal((await call('PUT', `/seller/listings/${listing._id}`, seller.token, { ...LISTING, quantity: -1 })).status, 400)
      assert.equal((await call('PUT', `/seller/listings/${listing._id}`, otherSeller.token, LISTING)).status, 404)
    })

    it('blocks edits while a collection is in progress', async () => {
      const listingId = await insertApprovedListing(db, seller.id, { quantity: 50 })
      const request = await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 10 })
      assert.equal((await call('PUT', `/seller/requests/${request.data.request._id}/accept`, seller.token)).status, 200)
      const res = await call('PUT', `/seller/listings/${listingId}`, seller.token, LISTING)
      assert.equal(res.status, 409)
    })

    it('blocks deletion while requests are open, then deletes listing and photos', async () => {
      const photo = await upload(seller.token, [png()])
      const url = photo.data.files[0].url
      const listing = await create({ images: [url] })
      await approve(listing._id)

      const request = await call('POST', '/buyer/requests', buyer.token, { listingId: listing._id, quantity: 5 })
      assert.equal((await call('DELETE', `/seller/listings/${listing._id}`, seller.token)).status, 409)
      assert.equal((await call('PUT', `/seller/requests/${request.data.request._id}/reject`, seller.token, { reason: 'Sold elsewhere' })).status, 200)

      assert.equal((await call('DELETE', `/seller/listings/${listing._id}`, otherSeller.token)).status, 404)
      assert.equal((await call('DELETE', `/seller/listings/${listing._id}`, seller.token)).status, 200)
      assert.equal((await call('GET', `/seller/listings/${listing._id}`, seller.token)).status, 404)
      assert.equal((await fetch(`${env.socketUrl}${url}`)).status, 404)
    })

    it('removes photos dropped during an edit', async () => {
      const photos = await upload(seller.token, [png('a.png'), png('b.png')])
      const [keep, drop] = photos.data.files.map((f) => f.url)
      const listing = await create({ images: [keep, drop] })
      const res = await call('PUT', `/seller/listings/${listing._id}`, seller.token, { ...LISTING, images: [keep] })
      assert.equal(res.status, 200)
      assert.deepEqual(res.data.listing.images, [keep])
      assert.equal(res.data.listing.image, keep)
      assert.equal((await fetch(`${env.socketUrl}${drop}`)).status, 404)
      assert.equal((await fetch(`${env.socketUrl}${keep}`)).status, 200)
    })
  })
})
