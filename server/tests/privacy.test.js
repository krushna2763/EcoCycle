import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, objectId } from './helpers/client.js'

const PROFILE_FIELDS = ['fullName', 'businessName', 'city', 'sellerType', 'verificationStatus']

describe('seller privacy settings', () => {
  let env, db, call, register
  const sellers = {}
  const listings = {}
  let buyer, verifiedBuyer

  const setPrivacy = (seller, privacy) =>
    call('PUT', '/seller/settings', seller.token, { privacy: { profileVisibility: 'Public', showContactInformation: true, ...privacy } })

  const createApprovedListing = async (seller) => {
    const res = await call('POST', '/seller/listings', seller.token, {
      title: 'PET bottles', plasticType: 'PET', quantity: 100, pricePerKg: 30, location: 'Pune',
    })
    await db.collection('listings').updateOne({ _id: objectId(res.data.listing._id) }, { $set: { status: 'approved' } })
    return res.data.listing._id
  }

  const sellerOn = async (token, listingId) => (await call('GET', `/buyer/listings/${listingId}`, token)).data.listing.seller
  const requestFor = async (token, requestId) =>
    (await call('GET', '/buyer/requests', token)).data.requests.find((r) => r._id === requestId)

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    ;({ call, register } = createClient(env))

    sellers.public = await register('Public Seller', 'seller', { businessName: 'Public Co' })
    sellers.private = await register('Private Seller', 'seller', { businessName: 'Private Co' })
    sellers.verifiedOnly = await register('Selective Seller', 'seller', { businessName: 'Selective Co' })
    buyer = await register('Buyer A', 'buyer')
    verifiedBuyer = await register('Verified Buyer', 'buyer')
    // No verification endpoint exists yet; simulate an admin verifying this buyer in the test database
    await db.collection('sellers').updateOne({ _id: objectId(verifiedBuyer.id) }, { $set: { verificationStatus: 'verified' } })

    assert.equal((await setPrivacy(sellers.private, { profileVisibility: 'Private' })).status, 200)
    assert.equal((await setPrivacy(sellers.verifiedOnly, { profileVisibility: 'Verified Recyclers Only' })).status, 200)
    for (const key of Object.keys(sellers)) listings[key] = await createApprovedListing(sellers[key])
  })

  after(async () => {
    await db?.close()
    await env?.stop()
  })

  describe('profileVisibility on marketplace listings', () => {
    it('shows a Public seller profile to every buyer', async () => {
      const seller = await sellerOn(buyer.token, listings.public)
      assert.equal(seller.fullName, 'Public Seller')
      assert.equal(seller.businessName, 'Public Co')
    })

    it('hides a Private seller profile but keeps the listing available', async () => {
      const seller = await sellerOn(buyer.token, listings.private)
      for (const field of PROFILE_FIELDS) assert.ok(!(field in seller), `${field} should be hidden`)
      const browse = await call('GET', '/buyer/listings', buyer.token)
      const listed = browse.data.listings.find((l) => l._id === listings.private)
      assert.ok(listed, 'listing should still be listed')
      assert.ok(!('fullName' in listed.seller))
    })

    it('shows a "Verified Recyclers Only" profile to verified buyers only', async () => {
      assert.ok(!('fullName' in (await sellerOn(buyer.token, listings.verifiedOnly))))
      assert.equal((await sellerOn(verifiedBuyer.token, listings.verifiedOnly)).fullName, 'Selective Seller')
    })
  })

  describe('requests, contact details and messages', () => {
    let publicRequest, privateRequest

    it('hides contact details while a request is pending', async () => {
      const res = await call('POST', '/buyer/requests', buyer.token, { listingId: listings.public, quantity: 10 })
      assert.equal(res.status, 201)
      publicRequest = res.data.request._id
      assert.ok(!res.data.request.seller.phone && !res.data.request.seller.email)
      assert.equal(res.data.request.seller.fullName, 'Public Seller')
    })

    it('releases contact details once the seller accepts', async () => {
      assert.equal((await call('PUT', `/seller/requests/${publicRequest}/accept`, sellers.public.token)).status, 200)
      const request = await requestFor(buyer.token, publicRequest)
      assert.equal(request.seller.phone, '9000000000')
      assert.ok(request.seller.email)
    })

    it('respects showContactInformation=false even after acceptance', async () => {
      assert.equal((await setPrivacy(sellers.public, { showContactInformation: false })).status, 200)
      const request = await requestFor(buyer.token, publicRequest)
      assert.ok(!request.seller.phone && !request.seller.email && !request.seller.pickupAddress)
      assert.equal(request.seller.fullName, 'Public Seller')
    })

    it('hides a Private seller on pending requests', async () => {
      const res = await call('POST', '/buyer/requests', buyer.token, { listingId: listings.private, quantity: 10 })
      assert.equal(res.status, 201)
      privateRequest = res.data.request._id
      for (const field of [...PROFILE_FIELDS, 'phone', 'email']) assert.ok(!(field in res.data.request.seller))
    })

    it('hides a Private seller name in messages before acceptance', async () => {
      const res = await call('POST', '/messages', buyer.token, {
        conversationId: `conv_${sellers.private.id}_${buyer.id}`, text: 'Hello',
      })
      assert.equal(res.status, 201)
      assert.equal(res.data.message.receiverName, 'Seller')
    })

    it('reveals a Private seller to the buyer whose request they accepted', async () => {
      assert.equal((await call('PUT', `/seller/requests/${privateRequest}/accept`, sellers.private.token)).status, 200)
      const request = await requestFor(buyer.token, privateRequest)
      assert.equal(request.seller.fullName, 'Private Seller')
      assert.equal(request.seller.phone, '9000000000')
      const message = await call('POST', '/messages', buyer.token, {
        conversationId: `conv_${sellers.private.id}_${buyer.id}`, text: 'Thanks',
      })
      assert.equal(message.data.message.receiverName, 'Private Seller')
    })

    it('keeps the seller hidden on the public marketplace after acceptance', async () => {
      assert.ok(!('fullName' in (await sellerOn(verifiedBuyer.token, listings.private))))
    })
  })

  describe('settings validation', () => {
    it('rejects invalid privacy values', async () => {
      assert.equal((await call('PUT', '/seller/settings', sellers.public.token, { privacy: { showContactInformation: 'yes' } })).status, 400)
      assert.equal((await call('PUT', '/seller/settings', sellers.public.token, { privacy: { profileVisibility: 'Everyone' } })).status, 400)
    })
  })
})
