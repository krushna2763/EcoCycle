import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, objectId, png } from './helpers/client.js'

const BASE_LISTING = { title: 'T', plasticType: 'PET', quantity: 5, pricePerKg: 5, location: 'Pune' }

describe('listing creation, visibility and marketplace queries', () => {
  let env, db, call, upload, seller, otherSeller, buyer, listing

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    const client = createClient(env)
    call = client.call
    upload = client.upload
    seller = await client.register('Seller A', 'seller')
    otherSeller = await client.register('Seller B', 'seller')
    buyer = await client.register('Buyer A', 'buyer')
  })

  after(async () => {
    await db?.close()
    await env?.stop()
  })

  describe('mass assignment', () => {
    it('ignores protected fields sent by the client', async () => {
      const res = await call('POST', '/seller/listings', seller.token, {
        title: 'PET bottles', plasticType: 'PET', quantity: 50, pricePerKg: 30, location: 'Pune',
        status: 'approved', seller: otherSeller.id, viewCount: 999, _id: '111111111111111111111111', createdAt: '2000-01-01',
      })
      assert.equal(res.status, 201)
      listing = res.data.listing
      assert.equal(listing.status, 'pending')
      assert.equal(listing.seller, seller.id)
      assert.equal(listing.viewCount, 0)
      assert.notEqual(listing._id, '111111111111111111111111')
      assert.ok(!String(listing.createdAt).startsWith('2000'))
    })

    const invalid = [
      ['negative quantity', { quantity: -5 }],
      ['zero price', { pricePerKg: 0 }],
      ['non-numeric quantity', { quantity: 'abc' }],
      ['huge quantity', { quantity: 1e12 }],
      ['unknown plastic type', { plasticType: 'Gold' }],
      ['object title', { title: { $gt: '' } }],
      ['too-long title', { title: 'x'.repeat(61) }],
      ['javascript: image URL', { image: 'javascript:alert(1)' }],
    ]
    for (const [label, patch] of invalid) {
      it(`rejects ${label}`, async () => {
        assert.equal((await call('POST', '/seller/listings', seller.token, { ...BASE_LISTING, ...patch })).status, 400)
      })
    }

    it('rejects browser-only blob: image URLs', async () => {
      const res = await call('POST', '/seller/listings', seller.token, { ...BASE_LISTING, image: 'blob:http://localhost:5173/abc' })
      assert.equal(res.status, 400)
    })

    it('accepts the payload the listing form sends', async () => {
      const uploaded = await upload(seller.token, [png()])
      assert.equal(uploaded.status, 201)
      const res = await call('POST', '/seller/listings', seller.token, {
        ...BASE_LISTING, unit: 'Kilogram (kg)', description: 'd', condition: 'Clean', collectionType: 'Household',
        availability: 'Immediately', additionalInfo: '', images: [uploaded.data.files[0].url],
      })
      assert.equal(res.status, 201)
      assert.equal(res.data.listing.image, uploaded.data.files[0].url)
    })
  })

  describe('listing visibility', () => {
    it('hides pending listings from buyers', async () => {
      assert.equal((await call('GET', `/buyer/listings/${listing._id}`, buyer.token)).status, 404)
      assert.equal((await call('POST', '/buyer/requests', buyer.token, { listingId: listing._id, quantity: 5 })).status, 404)
    })

    it('shows approved listings without seller contact details', async () => {
      // No approval endpoint exists yet; simulate moderator approval in the test database
      await db.collection('listings').updateOne({ _id: objectId(listing._id) }, { $set: { status: 'approved' } })
      const res = await call('GET', `/buyer/listings/${listing._id}`, buyer.token)
      assert.equal(res.status, 200)
      assert.equal(res.data.listing.seller.fullName, 'Seller A')
      for (const field of ['phone', 'email', 'pickupAddress']) assert.ok(!(field in res.data.listing.seller))
      assert.equal(res.data.listing.viewCount, 1)
    })

    it('omits seller contact details when browsing', async () => {
      const res = await call('GET', '/buyer/listings', buyer.token)
      assert.ok(res.data.listings.length >= 1)
      assert.ok(res.data.listings.every((l) => !l.seller?.phone && !l.seller?.email && !l.seller?.pickupAddress))
    })

    it('validates buy request quantities', async () => {
      assert.equal((await call('POST', '/buyer/requests', buyer.token, { listingId: listing._id, quantity: 51 })).status, 400)
      assert.equal((await call('POST', '/buyer/requests', buyer.token, { listingId: listing._id, quantity: -1 })).status, 400)
    })
  })

  describe('marketplace query input', () => {
    it('treats regex metacharacters literally', async () => {
      assert.equal((await call('GET', '/buyer/listings?search=.*', buyer.token)).data.count, 0)
      assert.equal((await call('GET', '/buyer/listings?location=P.ne', buyer.token)).data.count, 0)
    })

    it('handles catastrophic-backtracking patterns', async () => {
      assert.equal((await call('GET', `/buyer/listings?search=${encodeURIComponent('(a+)+$')}`, buyer.token)).status, 200)
    })

    it('keeps normal search and price filters working', async () => {
      assert.ok((await call('GET', '/buyer/listings?search=pet', buyer.token)).data.count >= 1)
      assert.equal((await call('GET', '/buyer/listings?minPrice=31', buyer.token)).data.count, 0)
    })

    it('ignores query operators injected through query strings', async () => {
      const res = await call('GET', '/buyer/listings?plasticType[$ne]=PET', buyer.token)
      assert.equal(res.status, 200)
      assert.ok(res.data.listings.some((l) => l._id === listing._id))
    })
  })

  describe('error responses', () => {
    it('returns a generic message for malformed JSON', async () => {
      const res = await call('POST', '/auth/login', null, undefined, '{bad json')
      assert.equal(res.status, 400)
      assert.equal(res.data.message, 'Malformed JSON body')
    })

    it('returns a generic message for invalid IDs', async () => {
      const res = await call('GET', '/buyer/listings/not-an-id', buyer.token)
      assert.equal(res.status, 400)
      assert.equal(res.data.message, 'Invalid ID format')
    })
  })
})
