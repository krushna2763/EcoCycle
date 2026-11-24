import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, insertApprovedListing, objectId, futureDate } from './helpers/client.js'
import { dateIn, isCalendarDate, timezoneFromSetting } from '../utils/scheduleDate.js'

// YYYY-MM-DD shifted by whole days
const addDays = (date, days) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10)

// Pacific/Kiritimati (UTC+14) and Pacific/Pago_Pago (UTC-11) are 25 hours apart, so at any moment
// the western zone's "today" is already in the past for the eastern one
const EAST = 'Pacific/Kiritimati'
const WEST = 'Pacific/Pago_Pago'

describe('collection date rules (unit)', () => {
  it('accepts only real calendar dates in YYYY-MM-DD form', () => {
    for (const valid of ['2026-11-01', '2028-02-29', '2026-12-31']) assert.equal(isCalendarDate(valid), true, valid)
    for (const invalid of ['2026-02-30', '2027-02-29', '2026-13-01', '2026-00-10', '2026-04-31', '2026-11-1',
      '01/11/2026', '2026-11-01T10:00:00Z', 'tomorrow', '', '0099-01-01']) {
      assert.equal(isCalendarDate(invalid), false, invalid)
    }
  })

  it('reads the IANA zone from a timezone setting and falls back to Asia/Kolkata', () => {
    assert.equal(timezoneFromSetting('(GMT+05:30) Asia/Kolkata'), 'Asia/Kolkata')
    assert.equal(timezoneFromSetting('(GMT-05:00) America/New_York'), 'America/New_York')
    assert.equal(timezoneFromSetting('(GMT+00:00) UTC'), 'UTC')
    assert.equal(timezoneFromSetting('Mars/Olympus'), 'Asia/Kolkata')
    assert.equal(timezoneFromSetting(undefined), 'Asia/Kolkata')
  })

  it('takes the calendar date in the given timezone, not the server\'s', () => {
    // 23:59:59 and 00:00:00 in India
    const beforeMidnightIst = new Date('2026-10-14T18:29:59Z')
    const midnightIst = new Date('2026-10-14T18:30:00Z')
    assert.equal(dateIn('Asia/Kolkata', beforeMidnightIst), '2026-10-14')
    assert.equal(dateIn('Asia/Kolkata', midnightIst), '2026-10-15')
    assert.equal(dateIn('UTC', midnightIst), '2026-10-14')
    assert.equal(dateIn('America/New_York', midnightIst), '2026-10-14')
    assert.equal(dateIn(EAST, new Date('2026-12-31T10:00:00Z')), '2027-01-01')
    assert.equal(dateIn(WEST, new Date('2027-01-01T10:00:00Z')), '2026-12-31')
  })
})

describe('PUT /api/seller/requests/:id/schedule date validation', () => {
  let env, db, call, seller, eastSeller, westSeller, unknownZoneSeller, otherSeller, buyer

  // A request for `owner`'s listing, accepted and ready to be scheduled
  const acceptedRequest = async (owner) => {
    const listingId = await insertApprovedListing(db, owner.id, { quantity: 100 })
    const res = await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 1 })
    assert.equal(res.status, 201)
    const id = res.data.request._id
    assert.equal((await call('PUT', `/seller/requests/${id}/accept`, owner.token)).status, 200)
    return id
  }
  const schedule = (user, id, body) => call('PUT', `/seller/requests/${id}/schedule`, user?.token, body)
  const stored = (id) => db.collection('requests').findOne({ _id: objectId(id) })
  const expectRefused = async (user, id, body, status, message) => {
    const before = await stored(id)
    const res = await schedule(user, id, body)
    assert.equal(res.status, status, JSON.stringify(body))
    if (message) assert.equal(res.data.message, message, JSON.stringify(body))
    const afterwards = await stored(id)
    assert.equal(afterwards.status, before.status)
    assert.equal(afterwards.scheduledDate, before.scheduledDate)
  }
  const setTimezone = async (user, timezone) =>
    assert.equal((await call('PUT', '/seller/settings', user.token, { timezone })).status, 200)

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    const client = createClient(env)
    call = client.call
    seller = await client.register('Seller Default Zone', 'seller')
    eastSeller = await client.register('Seller East', 'seller')
    westSeller = await client.register('Seller West', 'seller')
    unknownZoneSeller = await client.register('Seller Unknown Zone', 'seller')
    otherSeller = await client.register('Seller Other', 'seller')
    buyer = await client.register('Buyer A', 'buyer')
    await setTimezone(eastSeller, `(GMT+14:00) ${EAST}`)
    await setTimezone(westSeller, `(GMT-11:00) ${WEST}`)
    await setTimezone(unknownZoneSeller, 'Mars/Olympus')
  })

  after(async () => {
    await db?.close()
    await env?.stop()
  })

  it('accepts today (in the seller\'s timezone) and stores the date unchanged', async () => {
    const id = await acceptedRequest(seller)
    const today = dateIn('Asia/Kolkata')
    const res = await schedule(seller, id, { scheduledDate: today, scheduledTime: '10:30' })
    assert.equal(res.status, 200)
    assert.equal(res.data.request.status, 'scheduled')
    assert.equal(res.data.request.scheduledDate, today)
    assert.equal((await stored(id)).scheduledDate, today)
  })

  it('accepts a future date and allows rescheduling to another one', async () => {
    const id = await acceptedRequest(seller)
    assert.equal((await schedule(seller, id, { scheduledDate: futureDate(10) })).status, 200)
    const res = await schedule(seller, id, { scheduledDate: ` ${futureDate(400)} ` })
    assert.equal(res.status, 200)
    assert.equal(res.data.request.scheduledDate, futureDate(400))
  })

  it('rejects past dates, including when rescheduling', async () => {
    const id = await acceptedRequest(seller)
    const yesterday = addDays(dateIn('Asia/Kolkata'), -1)
    for (const scheduledDate of ['2020-01-01', yesterday]) {
      await expectRefused(seller, id, { scheduledDate }, 400, 'Collection date cannot be in the past')
    }
    assert.equal((await schedule(seller, id, { scheduledDate: futureDate() })).status, 200)
    await expectRefused(seller, id, { scheduledDate: yesterday }, 400, 'Collection date cannot be in the past')
  })

  it('rejects missing dates with a clear message', async () => {
    const id = await acceptedRequest(seller)
    for (const body of [{}, { scheduledDate: '' }, { scheduledDate: '   ' }, { scheduledDate: null }, { scheduledTime: '10:00' }]) {
      await expectRefused(seller, id, body, 400, 'Collection date is required')
    }
  })

  it('rejects invalid and impossible dates', async () => {
    const id = await acceptedRequest(seller)
    for (const scheduledDate of ['2030-02-30', '2031-02-29', '2030-13-01', '2030-04-31', '2030-1-5', '15/01/2030',
      'tomorrow', '2030-01-15T10:00:00Z', 20300115, ['2030-01-15'], { $gt: '' }]) {
      await expectRefused(seller, id, { scheduledDate }, 400, 'Collection date must be a valid date in YYYY-MM-DD format')
    }
  })

  it('decides "today" in the seller\'s timezone, not the server\'s', async () => {
    const westToday = dateIn(WEST)
    const eastToday = dateIn(EAST)
    assert.ok(westToday < eastToday)

    // Already yesterday (or earlier) for a seller in UTC+14
    const eastRequest = await acceptedRequest(eastSeller)
    await expectRefused(eastSeller, eastRequest, { scheduledDate: westToday }, 400, 'Collection date cannot be in the past')
    assert.equal((await schedule(eastSeller, eastRequest, { scheduledDate: eastToday })).status, 200)

    // Still today for a seller in UTC-11, even when it is already tomorrow in UTC
    const westRequest = await acceptedRequest(westSeller)
    assert.equal((await schedule(westSeller, westRequest, { scheduledDate: westToday })).status, 200)
  })

  it('falls back to Asia/Kolkata when the timezone setting is not a known zone', async () => {
    const id = await acceptedRequest(unknownZoneSeller)
    await expectRefused(unknownZoneSeller, id, { scheduledDate: addDays(dateIn(WEST), -1) }, 400, 'Collection date cannot be in the past')
    assert.equal((await schedule(unknownZoneSeller, id, { scheduledDate: dateIn('Asia/Kolkata') })).status, 200)
  })

  it('keeps authentication, role and ownership checks', async () => {
    const id = await acceptedRequest(seller)
    const scheduledDate = futureDate()
    await expectRefused(null, id, { scheduledDate }, 401)
    await expectRefused(buyer, id, { scheduledDate }, 403)
    await expectRefused(otherSeller, id, { scheduledDate }, 404, 'Request not found')
    // A bad date is refused before the request is looked up, without revealing whether it exists
    await expectRefused(otherSeller, id, { scheduledDate: '2020-01-01' }, 400, 'Collection date cannot be in the past')
    assert.equal((await schedule(seller, 'not-an-id', { scheduledDate })).status, 400)
  })

  it('keeps the request status rules for valid dates', async () => {
    const scheduledDate = futureDate()
    const listingId = await insertApprovedListing(db, seller.id, { quantity: 100 })
    const pending = (await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 1 })).data.request._id
    await expectRefused(seller, pending, { scheduledDate }, 409, 'Cannot change a pending request to scheduled')

    for (const status of ['completed', 'cancelled', 'rejected']) {
      const id = await acceptedRequest(seller)
      await db.collection('requests').updateOne({ _id: objectId(id) }, { $set: { status } })
      await expectRefused(seller, id, { scheduledDate }, 409, `Cannot change a ${status} request to scheduled`)
    }
  })
})
