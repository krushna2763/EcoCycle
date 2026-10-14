import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, insertApprovedListing, objectId, waitFor } from './helpers/client.js'
import Request from '../models/Request.js'
import { ensureOpenRequestIndex, OPEN_REQUEST_INDEX } from '../utils/requestIndexes.js'

const silentLogger = { log() {}, warn() {}, error() {} }

describe('duplicate requests and quantity integrity', () => {
  let env, db, call, register
  let seller, buyer, otherBuyer

  const waitForIndex = async () => {
    for (let i = 0; i < 50; i += 1) {
      const indexes = await db.collection('requests').indexes().catch(() => [])
      const index = indexes.find((ix) => ix.name === OPEN_REQUEST_INDEX)
      if (index) return index
      await waitFor(100)
    }
    throw new Error('open-request index was not created')
  }

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    ;({ call, register } = createClient(env))
    seller = await register('Seller A', 'seller')
    buyer = await register('Buyer A', 'buyer')
    otherBuyer = await register('Buyer B', 'buyer')
  })

  after(async () => {
    await db?.close()
    await env?.stop()
  })

  it('creates a partial unique index for open requests at start-up', async () => {
    const index = await waitForIndex()
    assert.equal(index.unique, true)
    assert.deepEqual(index.key, { listing: 1, buyer: 1 })
    assert.deepEqual(index.partialFilterExpression.status.$in, ['pending', 'accepted', 'scheduled', 'in_progress'])
  })

  it('lets exactly one of many simultaneous requests for the same listing succeed', async () => {
    await waitForIndex()
    const listingId = await insertApprovedListing(db, seller.id, { quantity: 100 })
    const results = await Promise.all(
      Array.from({ length: 8 }, () => call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 5 }))
    )
    const statuses = results.map((r) => r.status).sort()
    assert.deepEqual(statuses, [201, 409, 409, 409, 409, 409, 409, 409])
    assert.ok(results.filter((r) => r.status === 409).every((r) => r.data.message === 'You already have an open request for this listing'))
    assert.equal(await db.collection('requests').countDocuments({ listing: objectId(listingId), buyer: objectId(buyer.id) }), 1)
  })

  it('still lets other buyers request, and the same buyer again once the request is closed', async () => {
    const listingId = await insertApprovedListing(db, seller.id, { quantity: 100 })
    const first = await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 5 })
    assert.equal(first.status, 201)
    assert.equal((await call('POST', '/buyer/requests', otherBuyer.token, { listingId, quantity: 5 })).status, 201)
    assert.equal((await call('PUT', `/buyer/requests/${first.data.request._id}/cancel`, buyer.token)).status, 200)
    assert.equal((await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 5 })).status, 201)
  })

  it('reserves quantity only once when the same request is accepted twice at the same time', async () => {
    const listingId = await insertApprovedListing(db, seller.id, { quantity: 100 })
    const request = await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 10 })
    const id = request.data.request._id
    const results = await Promise.all([
      call('PUT', `/seller/requests/${id}/accept`, seller.token),
      call('PUT', `/seller/requests/${id}/accept`, seller.token),
    ])
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409])
    const listing = await db.collection('listings').findOne({ _id: objectId(listingId) })
    assert.equal(listing.quantity, 90)
  })

  describe('index creation against existing data', () => {
    const otherDb = () => env.dbUri.replace(/\/ecocycle_test$/, '/ecocycle_index_check')

    before(async () => {
      await mongoose.connect(otherDb())
      assert.equal(mongoose.connection.host, '127.0.0.1')
    })

    after(async () => {
      await mongoose.disconnect()
    })

    it('skips the index and keeps the data when open duplicates already exist', async () => {
      const listing = new mongoose.Types.ObjectId()
      const buyerId = new mongoose.Types.ObjectId()
      const base = { seller: new mongoose.Types.ObjectId(), listing, buyer: buyerId, companyName: 'X', interestedPlasticType: 'PET', quantity: 1, location: 'Pune' }
      await Request.init()
      const { buyer: _omit, ...withoutBuyer } = base
      await Request.collection.insertMany([
        { ...base, status: 'pending' },
        { ...base, status: 'accepted' },
        // Old seeded requests without a buyer (missing or null) are outside the rule
        { ...withoutBuyer, status: 'pending' },
        { ...withoutBuyer, buyer: null, status: 'pending' },
      ])

      const result = await ensureOpenRequestIndex({ logger: silentLogger })
      assert.equal(result.status, 'conflicts')
      assert.equal(result.conflicts.length, 1)
      assert.equal(await Request.countDocuments(), 4, 'no request was deleted or changed')
      assert.ok(!(await Request.collection.indexes()).some((ix) => ix.name === OPEN_REQUEST_INDEX))
    })

    it('creates the index once the conflict is resolved, and the database then refuses duplicates', async () => {
      await Request.updateOne({ status: 'accepted' }, { $set: { status: 'cancelled' } })
      assert.equal((await ensureOpenRequestIndex({ logger: silentLogger })).status, 'created')
      assert.equal((await ensureOpenRequestIndex({ logger: silentLogger })).status, 'exists')

      const open = await Request.findOne({ status: 'pending', buyer: { $type: 'objectId' } }).lean()
      await assert.rejects(
        Request.create({ ...open, _id: undefined, status: 'pending' }),
        (error) => error.code === 11000
      )
      // A closed duplicate is allowed (history keeps old requests)
      await Request.create({ ...open, _id: undefined, status: 'completed' })
    })
  })
})
