import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, insertApprovedListing, objectId } from './helpers/client.js'

describe('request status transitions', () => {
  let env, db, call
  let seller, otherSeller, buyer, otherBuyer

  // A fresh listing per request, since a buyer may only have one open request per listing
  const newRequest = async () => {
    const listingId = await insertApprovedListing(db, seller.id, { quantity: 1000 })
    const res = await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 1 })
    assert.equal(res.status, 201)
    return res.data.request._id
  }
  const sellerAction = (id, action, body) => call('PUT', `/seller/requests/${id}/${action}`, seller.token, body)
  const setStatus = (id, status, body = {}) => sellerAction(id, 'status', { status, ...body })
  const buyerAction = (id, action, body) => call('PUT', `/buyer/requests/${id}/${action}`, buyer.token, body)

  // Create a request through the API, then set its starting status directly in the test database.
  // Keeps each file under the API rate limit; the real path is covered by the workflow test.
  const requestIn = async (status) => {
    const id = await newRequest()
    if (status !== 'pending') {
      await db.collection('requests').updateOne({ _id: objectId(id) }, { $set: { status } })
    }
    return id
  }

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    const client = createClient(env)
    call = client.call
    seller = await client.register('Seller A', 'seller')
    otherSeller = await client.register('Seller B', 'seller')
    buyer = await client.register('Buyer A', 'buyer')
    otherBuyer = await client.register('Buyer B', 'buyer')
  })

  after(async () => {
    await db?.close()
    await env?.stop()
  })

  describe('buyer actions', () => {
    it('cannot complete a pending request', async () => {
      const id = await requestIn('pending')
      const res = await buyerAction(id, 'complete')
      assert.equal(res.status, 409)
      assert.equal(res.data.message, 'Cannot change a pending request to completed')
    })

    it('can cancel a pending request', async () => {
      const id = await requestIn('pending')
      const res = await buyerAction(id, 'cancel', { reason: 'Changed plans' })
      assert.equal(res.status, 200)
      assert.equal(res.data.request.status, 'cancelled')
      assert.equal(res.data.request.cancellationReason, 'Changed plans')
    })

    for (const status of ['accepted', 'scheduled', 'in_progress']) {
      it(`can complete or cancel an ${status} request`, async () => {
        assert.equal((await buyerAction(await requestIn(status), 'complete')).status, 200)
        assert.equal((await buyerAction(await requestIn(status), 'cancel')).status, 200)
      })
    }

    for (const status of ['completed', 'cancelled', 'rejected']) {
      it(`cannot change a ${status} request`, async () => {
        const id = await requestIn(status)
        assert.equal((await buyerAction(id, 'cancel')).status, 409)
        assert.equal((await buyerAction(id, 'complete')).status, 409)
      })
    }
  })

  describe('seller actions', () => {
    it('must accept or reject a pending request before anything else', async () => {
      const id = await requestIn('pending')
      assert.equal((await sellerAction(id, 'schedule', { scheduledDate: '2026-11-01' })).status, 409)
      for (const status of ['scheduled', 'in_progress', 'completed', 'cancelled']) {
        assert.equal((await setStatus(id, status)).status, 409, status)
      }
    })

    it('can reject a pending request with a reason', async () => {
      const id = await requestIn('pending')
      const res = await sellerAction(id, 'reject', { reason: 'Already sold' })
      assert.equal(res.status, 200)
      assert.equal(res.data.request.rejectionReason, 'Already sold')
    })

    it('cannot reject a request after accepting it', async () => {
      const id = await requestIn('accepted')
      assert.equal((await sellerAction(id, 'reject')).status, 409)
      assert.equal((await setStatus(id, 'rejected')).status, 409)
    })

    it('runs the full collection workflow', async () => {
      const id = await requestIn('pending')
      assert.equal((await sellerAction(id, 'accept')).data.request.status, 'accepted')
      const scheduled = await sellerAction(id, 'schedule', { scheduledDate: '2026-11-01', scheduledTime: '10:00 AM', scheduledLocation: 'Warehouse' })
      assert.equal(scheduled.data.request.status, 'scheduled')
      assert.equal(scheduled.data.request.scheduledLocation, 'Warehouse')
      const rescheduled = await sellerAction(id, 'schedule', { scheduledDate: '2026-11-02' })
      assert.equal(rescheduled.status, 200)
      assert.equal(rescheduled.data.request.scheduledDate, '2026-11-02')
      assert.equal(rescheduled.data.request.scheduledLocation, 'Warehouse')
      assert.equal((await setStatus(id, 'in_progress')).data.request.status, 'in_progress')
      assert.equal((await setStatus(id, 'completed')).data.request.status, 'completed')
    })

    it('can cancel an active collection with a reason', async () => {
      const res = await setStatus(await requestIn('scheduled'), 'cancelled', { reason: 'Truck unavailable' })
      assert.equal(res.status, 200)
      assert.equal(res.data.request.cancellationReason, 'Truck unavailable')
    })

    for (const status of ['completed', 'cancelled', 'rejected']) {
      it(`cannot change a ${status} request`, async () => {
        const id = await requestIn(status)
        assert.equal((await sellerAction(id, 'accept')).status, 409)
        assert.equal((await sellerAction(id, 'schedule', { scheduledDate: '2026-11-01' })).status, 409)
        for (const target of ['accepted', 'in_progress', 'completed', 'cancelled']) {
          if (target !== status) assert.equal((await setStatus(id, target)).status, 409, target)
        }
      })
    }

    it('rejects unknown statuses', async () => {
      assert.equal((await setStatus(await requestIn('accepted'), 'pending')).status, 400)
    })
  })

  describe('ownership and concurrency', () => {
    it('hides requests from other sellers and buyers', async () => {
      const id = await requestIn('pending')
      assert.equal((await call('PUT', `/seller/requests/${id}/accept`, otherSeller.token)).status, 404)
      assert.equal((await call('PUT', `/buyer/requests/${id}/cancel`, otherBuyer.token)).status, 404)
    })

    it('lets only one of two conflicting updates win', async () => {
      const id = await requestIn('scheduled')
      const results = await Promise.all([buyerAction(id, 'cancel'), setStatus(id, 'completed')])
      assert.deepEqual(results.map((r) => r.status).sort(), [200, 409])
      const final = await db.collection('requests').findOne({ _id: objectId(id) })
      const winner = results.find((r) => r.status === 200).data.request.status
      assert.equal(final.status, winner)
    })
  })
})
