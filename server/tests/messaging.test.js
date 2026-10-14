import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { startTestServer } from './helpers/testServer.js'
import { createClient, connectTestDb, joinRoom, objectId, waitFor, PASSWORD } from './helpers/client.js'

const onceDisconnected = (socket, timeoutMs) =>
  new Promise((resolve) => {
    if (!socket.connected) return resolve(true)
    const timer = setTimeout(() => resolve(false), timeoutMs)
    socket.once('disconnect', () => { clearTimeout(timer); resolve(true) })
  })

describe('private conversations and sockets', () => {
  let env, db, call, register, connectSocket
  let sellerA, sellerB, buyerA, buyerB, convId
  const sockets = []

  const connect = async (token) => {
    const result = await connectSocket(token)
    sockets.push(result.socket)
    return result
  }

  before(async () => {
    env = await startTestServer()
    db = await connectTestDb(env.dbUri)
    ;({ call, register, connectSocket } = createClient(env))

    sellerA = await register('Seller A', 'seller')
    sellerB = await register('Seller B', 'seller')
    buyerA = await register('Buyer A', 'buyer')
    buyerB = await register('Buyer B', 'buyer')

    const listing = await call('POST', '/seller/listings', sellerA.token, {
      title: 'PET bottles', plasticType: 'PET', quantity: 50, pricePerKg: 30, location: 'Pune',
    })
    await db.collection('listings').updateOne({ _id: objectId(listing.data.listing._id) }, { $set: { status: 'approved' } })
    const request = await call('POST', '/buyer/requests', buyerA.token, { listingId: listing.data.listing._id, quantity: 10 })
    assert.equal(request.status, 201)
    convId = `conv_${sellerA.id}_${buyerA.id}`
  })

  after(async () => {
    sockets.forEach((socket) => socket.close())
    await db?.close()
    await env?.stop()
  })

  describe('REST messages', () => {
    it('lets participants with a request exchange messages', async () => {
      const res = await call('POST', '/messages', buyerA.token, {
        conversationId: convId, receiverId: sellerA.id, receiverName: 'Fake Name', text: 'Hello seller',
      })
      assert.equal(res.status, 201)
      assert.equal(res.data.message.receiverName, 'Seller A')
      assert.equal((await call('GET', `/messages/${convId}`, sellerA.token)).data.messages.length, 1)
      assert.equal((await call('GET', `/messages/${convId}`, buyerA.token)).status, 200)
    })

    it('blocks outsiders from reading or posting', async () => {
      assert.equal((await call('GET', `/messages/${convId}`, buyerB.token)).status, 403)
      assert.equal((await call('GET', `/messages/${convId}`, sellerB.token)).status, 403)
      assert.equal((await call('POST', '/messages', buyerB.token, { conversationId: convId, text: 'spam' })).status, 403)
    })

    it('rejects guessable IDs and pairs without a request', async () => {
      assert.equal((await call('GET', '/messages/conv-1', buyerA.token)).status, 403)
      assert.equal((await call('POST', '/messages', buyerB.token, { conversationId: `conv_${sellerA.id}_${buyerB.id}`, text: 'hi' })).status, 403)
    })

    it('validates recipient and text', async () => {
      assert.equal((await call('POST', '/messages', buyerA.token, { conversationId: convId, receiverId: sellerB.id, text: 'hi' })).status, 400)
      assert.equal((await call('POST', '/messages', buyerA.token, { conversationId: convId, text: '   ' })).status, 400)
    })
  })

  describe('socket rooms', () => {
    let sA, bA, bB

    before(async () => {
      sA = await connect(sellerA.token)
      bA = await connect(buyerA.token)
      bB = await connect(buyerB.token)
    })

    it('refuses invalid tokens', async () => {
      assert.equal((await connect('not-a-token')).error, 'Authentication error')
    })

    it('connects valid tokens', () => {
      assert.ok(!sA.error && !bA.error && !bB.error)
    })

    it('lets only participants join a conversation room', async () => {
      assert.equal((await joinRoom(sA.socket, convId)).success, true)
      assert.equal((await joinRoom(bA.socket, convId)).success, true)
      assert.equal((await joinRoom(bB.socket, convId)).success, false)
      assert.equal((await joinRoom(bB.socket, 'conv-1')).success, false)
      assert.equal((await joinRoom(bB.socket, `user:${sellerA.id}`)).success, false)
    })

    it('delivers participant messages with server-side identity only', async () => {
      const received = { seller: [], outsider: [] }
      sA.socket.on('newMessage', (m) => received.seller.push(m))
      bB.socket.on('newMessage', (m) => received.outsider.push(m))
      bA.socket.emit('sendMessage', { conversationId: convId, text: 'live hello', senderName: 'Spoofed', sender: sellerB.id, extra: '<script>' })
      bB.socket.emit('sendMessage', { conversationId: convId, text: 'intruder' })
      await waitFor(500)

      assert.ok(received.seller.some((m) => m.text === 'live hello'))
      assert.ok(received.seller.every((m) => m.sender === buyerA.id && m.senderName === 'Buyer A'))
      assert.ok(received.seller.every((m) => !('extra' in m)))
      assert.ok(!received.seller.some((m) => m.text === 'intruder'))
      assert.equal(received.outsider.length, 0)
    })
  })

  describe('socket revocation', () => {
    it('disconnects live sockets when the user changes their password', async () => {
      const seller = await connect(sellerA.token)
      const otherUser = await connect(buyerA.token)
      assert.equal((await joinRoom(seller.socket, convId)).success, true)
      const disconnected = onceDisconnected(seller.socket, 2000)

      const res = await call('POST', '/auth/update-password', sellerA.token, { currentPassword: PASSWORD, newPassword: 'NewPass456!' })
      assert.equal(res.status, 200)
      assert.equal(await disconnected, true, 'revoked socket should be disconnected')
      assert.equal(otherUser.socket.connected, true, 'other users stay connected')

      // The revoked socket no longer receives conversation traffic
      const received = []
      seller.socket.on('newMessage', (m) => received.push(m))
      otherUser.socket.emit('join', convId, () => {})
      await waitFor(100)
      otherUser.socket.emit('sendMessage', { conversationId: convId, text: 'after revoke' })
      await waitFor(500)
      assert.equal(received.length, 0)

      assert.equal((await connect(sellerA.token)).error, 'Authentication error')
      const fresh = await connect(res.data.token)
      assert.equal(fresh.error, null)
      assert.equal((await joinRoom(fresh.socket, convId)).success, true)
    })

    it('disconnects sockets when their token expires', async () => {
      const shortLived = jwt.sign({ id: buyerB.id, tv: 0 }, env.jwtSecret, { expiresIn: 2 })
      const { socket, error } = await connect(shortLived)
      assert.equal(error, null)
      assert.equal(await onceDisconnected(socket, 5000), true)
    })
  })
})
