import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, PASSWORD, futureDate } from './helpers/client.js'

const LISTING = { title: 'PET bottles', plasticType: 'PET', quantity: 40, pricePerKg: 20, location: 'Pune' }
const IMAGE_MESSAGE = 'Images must be uploaded through the image upload endpoint'

// Each invalid field is reported once, with a message the user can act on, never express-validator's
// generic "Invalid value" (missing fields and values of the wrong type used to produce it)
describe('validation messages', () => {
  let env, call, seller, buyer, listingId, requestId

  before(async () => {
    env = await startTestServer()
    const client = createClient(env)
    call = client.call
    seller = await client.register('Seller A', 'seller')
    buyer = await client.register('Buyer A', 'buyer')
    // Listings are visible to buyers without review in the default mode
    listingId = (await call('POST', '/seller/listings', seller.token, LISTING)).data.listing._id
    requestId = (await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 5 })).data.request._id
    await call('PUT', `/seller/requests/${requestId}/accept`, seller.token)
  })

  after(async () => {
    await env?.stop()
  })

  const cases = [
    ['register without a full name', () => ['POST', '/auth/register', null,
      { email: 'new1@test.local', password: PASSWORD, phone: '9000000000' }], 'Full name is required'],
    ['register with a numeric phone', () => ['POST', '/auth/register', null,
      { email: 'new2@test.local', password: PASSWORD, fullName: 'New User', phone: 9000000000 }], 'Phone number is required'],
    ['register without a password', () => ['POST', '/auth/register', null,
      { email: 'new3@test.local', fullName: 'New User', phone: '9000000000' }], 'Password must be 6-128 characters'],
    ['login without a password', () => ['POST', '/auth/login', null, { email: 'new1@test.local' }], 'Password is required'],
    ['password check without a password', () => ['POST', '/auth/verify-password', seller.token, {}], 'Password is required'],
    ['password change without the current password', () => ['POST', '/auth/update-password', seller.token,
      { newPassword: 'NewPassword1!' }], 'Current password is required'],
    ['password change with a numeric new password', () => ['POST', '/auth/update-password', seller.token,
      { currentPassword: PASSWORD, newPassword: 12345678 }], 'New password must be 6-128 characters'],
    ['listing with a numeric description', () => ['POST', '/seller/listings', seller.token,
      { ...LISTING, description: 123 }], 'Description must be text'],
    ['listing with a numeric photo', () => ['POST', '/seller/listings', seller.token, { ...LISTING, images: [5] }], IMAGE_MESSAGE],
    ['buy request with a numeric message', () => ['POST', '/buyer/requests', buyer.token,
      { listingId, message: 5 }], 'Message must be text'],
    ['schedule with a numeric time', () => ['PUT', `/seller/requests/${requestId}/schedule`, seller.token,
      { scheduledDate: futureDate(), scheduledTime: 1030 }], 'Invalid time'],
    ['chat message without a conversation', () => ['POST', '/messages', seller.token, { text: 'Hello' }], 'Conversation ID is required'],
    ['settings with a numeric timezone', () => ['PUT', '/seller/settings', seller.token, { timezone: 5 }], 'Invalid timezone'],
    ['profile with a numeric pincode', () => ['PUT', '/auth/me', seller.token, { pincode: 411001 }], 'Enter a valid pincode'],
    ['profile with a numeric avatar', () => ['PUT', '/auth/me', seller.token, { avatar: 5 }], IMAGE_MESSAGE],
  ]

  for (const [label, request, message] of cases) {
    it(`explains ${label}`, async () => {
      const res = await call(...request())
      assert.equal(res.status, 400)
      assert.equal(res.data.message, message)
    })
  }
})
