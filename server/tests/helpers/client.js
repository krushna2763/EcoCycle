// HTTP, socket and database helpers shared by the regression tests
import mongoose from 'mongoose'
import { io } from 'socket.io-client'

export const PASSWORD = 'Password123!'

export function createClient(env) {
  let counter = 0

  const call = async (method, path, token, body, rawBody) => {
    const headers = {}
    if (token) headers.Authorization = `Bearer ${token}`
    if (body !== undefined || rawBody !== undefined) headers['Content-Type'] = 'application/json'
    const res = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
    let data = null
    try { data = await res.json() } catch { /* non-JSON body */ }
    return { status: res.status, data }
  }

  const register = async (fullName, role, extra = {}) => {
    counter += 1
    const email = `user${counter}_${Date.now()}@test.local`
    const res = await call('POST', '/auth/register', null, {
      fullName, email, password: PASSWORD, phone: '9000000000', role,
      city: 'Pune', pickupAddress: `${fullName} street 1`, ...extra,
    })
    if (res.status !== 201) throw new Error(`register ${fullName} failed: ${JSON.stringify(res.data)}`)
    return { token: res.data.token, id: res.data.seller.id, email }
  }

  // files: [{ bytes: Buffer, type: 'image/png', name }]
  const upload = async (token, files) => {
    const form = new FormData()
    for (const file of files) form.append('images', new Blob([file.bytes], { type: file.type }), file.name || 'photo.png')
    const res = await fetch(`${env.apiUrl}/uploads`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
    let data = null
    try { data = await res.json() } catch { /* non-JSON body */ }
    return { status: res.status, data }
  }

  const connectSocket = (token) =>
    new Promise((resolve) => {
      const socket = io(env.socketUrl, { auth: { token }, transports: ['websocket'], reconnection: false })
      socket.once('connect', () => resolve({ socket, error: null }))
      socket.once('connect_error', (err) => resolve({ socket, error: err.message }))
    })

  return { call, register, upload, connectSocket }
}

// Smallest byte sequences the server accepts as PNG / JPEG (it checks the file signature)
export const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
export const JPEG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46])
export const png = (name = 'photo.png') => ({ bytes: PNG_BYTES, type: 'image/png', name })

// Insert an approved listing straight into the test database (no approval endpoint exists yet)
export async function insertApprovedListing(db, sellerId, overrides = {}) {
  const { insertedId } = await db.collection('listings').insertOne({
    seller: new mongoose.Types.ObjectId(sellerId),
    title: 'PET bottles',
    plasticType: 'PET',
    quantity: 100,
    pricePerKg: 30,
    location: 'Pune',
    status: 'approved',
    viewCount: 0,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })
  return insertedId.toString()
}

export const joinRoom = (socket, conversationId) =>
  new Promise((resolve) => socket.emit('join', conversationId, resolve))

export const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Resolve with the next `event` payload on a socket, or null after `timeoutMs`
export const nextEvent = (socket, event, timeoutMs = 2000) =>
  new Promise((resolve) => {
    const timer = setTimeout(() => { socket.off(event, handler); resolve(null) }, timeoutMs)
    function handler(payload) { clearTimeout(timer); resolve(payload) }
    socket.once(event, handler)
  })

// Direct access to the private test database, for steps no API offers yet (e.g. listing approval)
export async function connectTestDb(dbUri) {
  const conn = await mongoose.createConnection(dbUri).asPromise()
  if (conn.host !== '127.0.0.1') {
    await conn.close()
    throw new Error(`Refusing to use non-local database host ${conn.host}`)
  }
  return conn
}

export const objectId = (id) => new mongoose.Types.ObjectId(id)
