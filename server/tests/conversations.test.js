import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, insertApprovedListing, joinRoom, nextEvent, objectId, waitFor } from './helpers/client.js'

describe('persistent chat', () => {
  let env, db, call, connectSocket
  let seller, privateSeller, buyer, outsider, convId, privateConvId
  const sockets = []

  const connect = async (token) => {
    const result = await connectSocket(token)
    sockets.push(result.socket)
    return result.socket
  }

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    const client = createClient(env)
    ;({ call, connectSocket } = client)
    seller = await client.register('Seller A', 'seller', { businessName: 'Seller A Co' })
    privateSeller = await client.register('Private Seller', 'seller')
    buyer = await client.register('Buyer A', 'buyer', { businessName: 'Buyer A Co' })
    outsider = await client.register('Buyer B', 'buyer')

    await call('PUT', '/seller/settings', privateSeller.token, { privacy: { profileVisibility: 'Private' } })
    for (const owner of [seller, privateSeller]) {
      const listingId = await insertApprovedListing(db, owner.id, { title: `${owner.id} lot` })
      assert.equal((await call('POST', '/buyer/requests', buyer.token, { listingId, quantity: 5 })).status, 201)
    }
    convId = `conv_${seller.id}_${buyer.id}`
    privateConvId = `conv_${privateSeller.id}_${buyer.id}`
  })

  after(async () => {
    sockets.forEach((socket) => socket.close())
    await db?.close()
    await env?.stop()
  })

  it('lists a conversation for every request partner, even before any message', async () => {
    const res = await call('GET', '/messages/conversations', buyer.token)
    assert.equal(res.status, 200)
    const ids = res.data.conversations.map((c) => c.conversationId).sort()
    assert.deepEqual(ids, [convId, privateConvId].sort())
    const withSeller = res.data.conversations.find((c) => c.conversationId === convId)
    assert.equal(withSeller.participant.name, 'Seller A Co')
    assert.equal(withSeller.request.status, 'pending')
    assert.equal(withSeller.unread, 0)

    assert.deepEqual((await call('GET', '/messages/conversations', outsider.token)).data.conversations, [])
  })

  it('keeps a Private seller anonymous in the conversation list', async () => {
    const res = await call('GET', '/messages/conversations', buyer.token)
    assert.equal(res.data.conversations.find((c) => c.conversationId === privateConvId).participant.name, 'Seller')
  })

  it('delivers a REST message once to each participant and persists it', async () => {
    const sellerSocket = await connect(seller.token)
    const buyerSocket = await connect(buyer.token)
    const outsiderSocket = await connect(outsider.token)
    const received = { seller: [], buyer: [], outsider: [] }
    sellerSocket.on('newMessage', (m) => received.seller.push(m))
    buyerSocket.on('newMessage', (m) => received.buyer.push(m))
    outsiderSocket.on('newMessage', (m) => received.outsider.push(m))
    // Being in the conversation room as well must not cause a second copy
    await joinRoom(sellerSocket, convId)

    const res = await call('POST', '/messages', buyer.token, { conversationId: convId, text: 'Hello there' })
    assert.equal(res.status, 201)
    await waitFor(400)

    assert.deepEqual(received.seller.map((m) => m._id), [res.data.message._id])
    assert.deepEqual(received.buyer.map((m) => m._id), [res.data.message._id])
    assert.equal(received.outsider.length, 0)
    const history = await call('GET', `/messages/${convId}`, seller.token)
    assert.deepEqual(history.data.messages.map((m) => m.text), ['Hello there'])
  })

  it('stores socket messages through the same path and acknowledges them', async () => {
    const sellerSocket = await connect(seller.token)
    const ack = await new Promise((resolve) => sellerSocket.emit('sendMessage', { conversationId: convId, text: 'Reply via socket' }, resolve))
    assert.equal(ack.success, true)
    assert.equal(ack.message.senderName, 'Seller A Co')
    const stored = await db.collection('messages').countDocuments({ conversationId: convId, text: 'Reply via socket' })
    assert.equal(stored, 1)

    const refused = await new Promise((resolve) => sellerSocket.emit('sendMessage', { conversationId: privateConvId, text: 'x' }, resolve))
    assert.equal(refused.success, false)
  })

  it('tracks unread messages and read receipts', async () => {
    const buyerSocket = await connect(buyer.token)
    let list = await call('GET', '/messages/conversations', buyer.token)
    assert.equal(list.data.conversations.find((c) => c.conversationId === convId).unread, 1)

    const receipt = nextEvent(buyerSocket, 'messagesRead', 500)
    const sellerSocket = await connect(seller.token)
    const sellerReceipt = nextEvent(sellerSocket, 'messagesRead')
    assert.equal((await call('PUT', `/messages/${convId}/read`, buyer.token)).status, 200)
    assert.deepEqual(await sellerReceipt, { conversationId: convId, readerId: buyer.id })
    assert.equal(await receipt, null, 'the reader does not get their own receipt')

    list = await call('GET', '/messages/conversations', buyer.token)
    assert.equal(list.data.conversations.find((c) => c.conversationId === convId).unread, 0)
    assert.equal((await call('PUT', `/messages/${convId}/read`, outsider.token)).status, 403)
  })

  it('keeps one unread message notification per conversation', async () => {
    await call('POST', '/messages', buyer.token, { conversationId: convId, text: 'First' })
    await call('POST', '/messages', buyer.token, { conversationId: convId, text: 'Second' })
    const res = await call('GET', '/notifications?type=message&unread=true', seller.token)
    assert.equal(res.data.total, 1)
    assert.equal(res.data.notifications[0].message, 'Second')
    assert.equal(res.data.notifications[0].link, `/seller/dashboard/messages?c=${convId}`)

    await call('PUT', `/messages/${convId}/read`, seller.token)
    assert.equal((await call('GET', '/notifications?type=message&unread=true', seller.token)).data.total, 0)
  })

  it('pages through long histories', async () => {
    const base = Date.now() - 100000
    await db.collection('messages').insertMany(Array.from({ length: 60 }, (_, i) => ({
      conversationId: privateConvId, sender: objectId(buyer.id), senderName: 'Buyer A Co',
      receiverId: privateSeller.id, receiverName: 'Seller', text: `old ${i}`, read: true, createdAt: new Date(base + i * 10),
    })))
    const first = await call('GET', `/messages/${privateConvId}`, buyer.token)
    assert.equal(first.data.messages.length, 50)
    assert.equal(first.data.hasMore, true)
    assert.equal(first.data.messages.at(-1).text, 'old 59')
    const older = await call('GET', `/messages/${privateConvId}?before=${encodeURIComponent(first.data.messages[0].createdAt)}`, buyer.token)
    assert.equal(older.data.messages.length, 10)
    assert.equal(older.data.hasMore, false)
    assert.equal(older.data.messages[0].text, 'old 0')
  })

  it('announces presence to request partners only', async () => {
    const sellerSocket = await connect(seller.token)
    const outsiderSocket = await connect(outsider.token)
    // Close any earlier buyer sockets so the next connection is a fresh "online" event
    for (const socket of sockets) if (socket.auth?.token === buyer.token) socket.close()
    await waitFor(200)

    const sellerSees = nextEvent(sellerSocket, 'presence')
    const outsiderSees = nextEvent(outsiderSocket, 'presence', 800)
    const buyerSocket = await connect(buyer.token)
    assert.deepEqual(await sellerSees, { userId: buyer.id, online: true })
    assert.equal(await outsiderSees, null)

    const list = await call('GET', '/messages/conversations', seller.token)
    assert.equal(list.data.conversations.find((c) => c.conversationId === convId).online, true)
    buyerSocket.close()
  })
})
