import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, insertApprovedListing, nextEvent } from './helpers/client.js'

describe('notifications', () => {
  let env, db, call, connectSocket, seller, buyer, otherBuyer
  const sockets = []

  const createRequest = async () => {
    const listingId = await insertApprovedListing(db, seller.id)
    const res = await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 5 })
    assert.equal(res.status, 201)
    return res.data.request._id
  }

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    const client = createClient(env)
    ;({ call, connectSocket } = client)
    seller = await client.register('Seller A', 'seller')
    buyer = await client.register('Buyer A', 'buyer')
    otherBuyer = await client.register('Buyer B', 'buyer')
  })

  after(async () => {
    sockets.forEach((socket) => socket.close())
    await db?.close()
    await env?.stop()
  })

  it('pushes new notifications to the recipient\'s open sockets', async () => {
    const { socket } = await connectSocket(seller.token)
    sockets.push(socket)
    const incoming = nextEvent(socket, 'notification')
    await createRequest()
    const notification = await incoming
    assert.equal(notification?.event, 'request_created')
    assert.equal(notification.link, '/seller/dashboard/requests')
  })

  it('lists only the user\'s own notifications with counts', async () => {
    const id = await createRequest()
    await call('PUT', `/seller/requests/${id}/accept`, seller.token)

    const sellerList = await call('GET', '/notifications', seller.token)
    assert.equal(sellerList.status, 200)
    assert.ok(sellerList.data.notifications.every((n) => n.user === seller.id))
    assert.equal(sellerList.data.counts.request, 2)
    assert.equal(sellerList.data.unreadCount, 2)

    const buyerList = await call('GET', '/notifications', buyer.token)
    assert.deepEqual(buyerList.data.notifications.map((n) => n.event), ['request_accepted'])
    assert.equal(buyerList.data.notifications[0].link, '/buyer/dashboard/requests')

    assert.equal((await call('GET', '/notifications', otherBuyer.token)).data.total, 0)
  })

  it('filters by type and unread state', async () => {
    const requests = await call('GET', '/notifications?type=request', seller.token)
    assert.ok(requests.data.notifications.every((n) => n.type === 'request'))
    assert.equal((await call('GET', '/notifications?type=collection', seller.token)).data.total, 0)
    assert.equal((await call('GET', '/notifications?unread=true', seller.token)).data.total, 2)
  })

  it('marks one notification read, but only for its owner', async () => {
    const [first] = (await call('GET', '/notifications', seller.token)).data.notifications
    assert.equal((await call('PUT', `/notifications/${first._id}/read`, buyer.token)).status, 404)
    const res = await call('PUT', `/notifications/${first._id}/read`, seller.token)
    assert.equal(res.status, 200)
    assert.equal(res.data.notification.read, true)
    assert.equal((await call('GET', '/notifications/unread-count', seller.token)).data.count, 1)
  })

  it('marks all notifications read', async () => {
    const res = await call('PUT', '/notifications/read-all', seller.token)
    assert.equal(res.status, 200)
    assert.equal((await call('GET', '/notifications/unread-count', seller.token)).data.count, 0)
    assert.equal((await call('GET', '/notifications/unread-count', buyer.token)).data.count, 1)
  })

  it('requires authentication and valid IDs', async () => {
    assert.equal((await call('GET', '/notifications')).status, 401)
    assert.equal((await call('PUT', '/notifications/not-an-id/read', seller.token)).status, 400)
  })
})
