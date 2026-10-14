import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, PASSWORD } from './helpers/client.js'

describe('role authorization and password updates', () => {
  let env, db, call, seller, buyer

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    const client = createClient(env)
    call = client.call
    seller = await client.register('Seller A', 'seller')
    buyer = await client.register('Buyer A', 'buyer', { businessName: 'Buyer A Co' })
  })

  after(async () => {
    await db?.close()
    await env?.stop()
  })

  describe('server-side roles', () => {
    it('rejects requests without a token', async () => {
      assert.equal((await call('GET', '/seller/listings')).status, 401)
    })

    it('blocks buyers from seller endpoints', async () => {
      assert.equal((await call('GET', '/seller/listings', buyer.token)).status, 403)
      assert.equal((await call('POST', '/seller/listings', buyer.token, { title: 'x' })).status, 403)
      assert.equal((await call('GET', '/seller/settings', buyer.token)).status, 403)
      assert.equal((await call('PUT', '/seller/requests/000000000000000000000000/accept', buyer.token)).status, 403)
    })

    it('blocks sellers from buyer endpoints', async () => {
      assert.equal((await call('GET', '/buyer/listings', seller.token)).status, 403)
      assert.equal((await call('POST', '/buyer/requests', seller.token, { listingId: '000000000000000000000000' })).status, 403)
    })

    it('allows each role its own endpoints and shared ones', async () => {
      assert.equal((await call('GET', '/seller/listings', seller.token)).status, 200)
      assert.equal((await call('GET', '/seller/settings', seller.token)).status, 200)
      assert.equal((await call('GET', '/buyer/listings', buyer.token)).status, 200)
      assert.equal((await call('GET', '/auth/me', buyer.token)).status, 200)
      assert.equal((await call('GET', '/auth/me', seller.token)).status, 200)
    })

    it('does not let registration pick the admin role', async () => {
      const res = await call('POST', '/auth/register', null, {
        fullName: 'Evil', email: `evil_${Date.now()}@test.local`, password: PASSWORD, phone: '1', role: 'admin',
      })
      assert.equal(res.status, 400)
    })
  })

  describe('password updates', () => {
    let newToken

    it('requires the current password', async () => {
      assert.equal((await call('POST', '/auth/update-password', seller.token, { newPassword: 'NewPass456!' })).status, 400)
    })

    it('rejects a wrong current password', async () => {
      const res = await call('POST', '/auth/update-password', seller.token, { currentPassword: 'nope', newPassword: 'NewPass456!' })
      assert.equal(res.status, 400)
      assert.equal(res.data.message, 'Current password is incorrect')
    })

    it('validates the new password', async () => {
      assert.equal((await call('POST', '/auth/update-password', seller.token, { currentPassword: PASSWORD, newPassword: '123' })).status, 400)
      assert.equal((await call('POST', '/auth/update-password', seller.token, { currentPassword: PASSWORD, newPassword: PASSWORD })).status, 400)
    })

    it('changes the password and returns a fresh token', async () => {
      const res = await call('POST', '/auth/update-password', seller.token, { currentPassword: PASSWORD, newPassword: 'NewPass456!' })
      assert.equal(res.status, 200)
      assert.ok(res.data.token)
      newToken = res.data.token
    })

    it('revokes tokens issued before the change', async () => {
      assert.equal((await call('GET', '/auth/me', seller.token)).status, 401)
      assert.equal((await call('GET', '/auth/me', newToken)).status, 200)
    })

    it('only accepts the new password at login', async () => {
      assert.equal((await call('POST', '/auth/login', null, { email: seller.email, password: PASSWORD })).status, 401)
      assert.equal((await call('POST', '/auth/login', null, { email: seller.email, password: 'NewPass456!' })).status, 200)
    })

    it('stores the password as a bcrypt hash', async () => {
      const doc = await db.collection('sellers').findOne({ email: seller.email })
      assert.match(doc.password, /^\$2[aby]\$/)
    })

    it('leaves other users signed in', async () => {
      assert.equal((await call('GET', '/auth/me', buyer.token)).status, 200)
    })
  })
})
