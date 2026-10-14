import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient } from './helpers/client.js'

describe('profile and settings', () => {
  let env, call, seller, buyer

  before(async () => {
    env = await startTestServer()
    const client = createClient(env)
    call = client.call
    seller = await client.register('Seller A', 'seller')
    buyer = await client.register('Buyer A', 'buyer', { businessName: 'Buyer Co', gstNumber: '27AAACG1234F1Z5' })
  })

  after(async () => {
    await env?.stop()
  })

  describe('profile', () => {
    it('returns the full own profile without secrets', async () => {
      const res = await call('GET', '/auth/me', buyer.token)
      assert.equal(res.status, 200)
      const profile = res.data.seller
      assert.equal(profile.businessName, 'Buyer Co')
      assert.equal(profile.gstNumber, '27AAACG1234F1Z5')
      assert.equal(profile.verificationStatus, 'pending')
      assert.ok(profile.createdAt)
      for (const secret of ['password', 'tokenVersion', '__v']) assert.ok(!(secret in profile), secret)
    })

    it('updates editable fields and ignores protected ones', async () => {
      const res = await call('PUT', '/auth/me', seller.token, {
        fullName: 'Seller Renamed', phone: '+91 98765 43210', city: 'Mumbai', pickupAddress: 'Dock 7',
        email: 'hijack@test.local', role: 'buyer', verificationStatus: 'verified', password: 'x', tokenVersion: 5,
      })
      assert.equal(res.status, 200)
      const profile = res.data.seller
      assert.equal(profile.fullName, 'Seller Renamed')
      assert.equal(profile.city, 'Mumbai')
      assert.equal(profile.email, seller.email)
      assert.equal(profile.role, 'seller')
      assert.equal(profile.verificationStatus, 'pending')
      // The old token still works, so tokenVersion and password were untouched
      assert.equal((await call('GET', '/auth/me', seller.token)).data.seller.fullName, 'Seller Renamed')
    })

    it('validates profile input', async () => {
      assert.equal((await call('PUT', '/auth/me', seller.token, { phone: 'call me' })).status, 400)
      assert.equal((await call('PUT', '/auth/me', seller.token, { fullName: '' })).status, 400)
      assert.equal((await call('PUT', '/auth/me', seller.token, { gstNumber: 'bad gst!' })).status, 400)
      assert.equal((await call('PUT', '/auth/me', seller.token, { avatar: 'https://evil.example/a.png' })).status, 400)
      assert.equal((await call('PUT', '/auth/me', null, { fullName: 'x' })).status, 401)
    })
  })

  describe('settings', () => {
    it('gives buyers their own settings endpoint and keeps roles apart', async () => {
      assert.equal((await call('GET', '/buyer/settings', buyer.token)).status, 200)
      assert.equal((await call('GET', '/buyer/settings', seller.token)).status, 403)
      assert.equal((await call('GET', '/seller/settings', buyer.token)).status, 403)
    })

    it('updates only the keys that are sent', async () => {
      await call('PUT', '/buyer/settings', buyer.token, { channels: { sms: false }, notifications: { newListings: false } })
      const res = await call('PUT', '/buyer/settings', buyer.token, { currency: 'USD ($)', notifications: { collectionReminders: false } })
      assert.equal(res.status, 200)
      const settings = res.data.settings
      assert.equal(settings.currency, 'USD ($)')
      assert.equal(settings.channels.sms, false)
      assert.equal(settings.channels.email, true)
      assert.equal(settings.notifications.newListings, false)
      assert.equal(settings.notifications.collectionReminders, false)
      assert.equal(settings.notifications.requestUpdates, true)
    })

    it('rejects invalid settings', async () => {
      assert.equal((await call('PUT', '/buyer/settings', buyer.token, { currency: 'BTC' })).status, 400)
      assert.equal((await call('PUT', '/seller/settings', seller.token, { channels: { email: 'yes' } })).status, 400)
      assert.equal((await call('PUT', '/seller/settings', seller.token, { language: 'Klingon' })).status, 400)
    })

    it('does not let a user change another user\'s settings', async () => {
      await call('PUT', '/seller/settings', seller.token, { seller: buyer.id, language: 'Hindi' })
      assert.equal((await call('GET', '/buyer/settings', buyer.token)).data.settings.language, 'English')
      assert.equal((await call('GET', '/seller/settings', seller.token)).data.settings.language, 'Hindi')
    })
  })
})
