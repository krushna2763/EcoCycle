import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers/testServer.js'
import { createClient, JPEG_BYTES, PNG_BYTES, png } from './helpers/client.js'

const LISTING = { title: 'PET bottles', plasticType: 'PET', quantity: 10, pricePerKg: 20, location: 'Pune' }

describe('image uploads', () => {
  let env, call, upload, seller, otherSeller, buyer

  before(async () => {
    env = await startTestServer()
    const client = createClient(env)
    ;({ call, upload } = client)
    const { register } = client
    seller = await register('Seller A', 'seller')
    otherSeller = await register('Seller B', 'seller')
    buyer = await register('Buyer A', 'buyer')
  })

  after(async () => {
    await env?.stop()
  })

  it('stores PNG and JPEG images and serves them back', async () => {
    const res = await upload(seller.token, [png(), { bytes: JPEG_BYTES, type: 'image/jpeg', name: 'a.jpg' }])
    assert.equal(res.status, 201)
    assert.equal(res.data.files.length, 2)
    for (const file of res.data.files) assert.match(file.url, /^\/api\/uploads\/[a-f\d]{24}$/)

    const image = await fetch(`${env.socketUrl}${res.data.files[0].url}`)
    assert.equal(image.status, 200)
    assert.equal(image.headers.get('content-type'), 'image/png')
    assert.equal(image.headers.get('cross-origin-resource-policy'), 'cross-origin')
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), PNG_BYTES)
  })

  it('requires authentication to upload', async () => {
    const form = new FormData()
    form.append('images', new Blob([PNG_BYTES], { type: 'image/png' }), 'a.png')
    const res = await fetch(`${env.apiUrl}/uploads`, { method: 'POST', body: form })
    assert.equal(res.status, 401)
  })

  it('rejects files that are not really JPG or PNG', async () => {
    const fake = await upload(seller.token, [{ bytes: Buffer.from('<script>alert(1)</script>'), type: 'image/png', name: 'x.png' }])
    assert.equal(fake.status, 400)
    const gif = await upload(seller.token, [{ bytes: Buffer.from('GIF89a'), type: 'image/gif', name: 'x.gif' }])
    assert.equal(gif.status, 400)
    assert.equal(gif.data.message, 'Only JPG and PNG images are allowed')
  })

  it('enforces count and size limits', async () => {
    const tooMany = await upload(seller.token, Array.from({ length: 6 }, (_, i) => png(`${i}.png`)))
    assert.equal(tooMany.status, 400)
    const big = Buffer.concat([PNG_BYTES, Buffer.alloc(5 * 1024 * 1024)])
    const tooBig = await upload(seller.token, [{ bytes: big, type: 'image/png', name: 'big.png' }])
    assert.equal(tooBig.status, 400)
    assert.equal(tooBig.data.message, 'Each image must be 5 MB or smaller')
    assert.equal((await upload(seller.token, [])).status, 400)
  })

  it('returns 404 for unknown images', async () => {
    assert.equal((await fetch(`${env.apiUrl}/uploads/000000000000000000000000`)).status, 404)
    assert.equal((await fetch(`${env.apiUrl}/uploads/not-an-id`)).status, 404)
  })

  it('only lets sellers attach images they uploaded', async () => {
    const theirs = await upload(otherSeller.token, [png()])
    const res = await call('POST', '/seller/listings', seller.token, { ...LISTING, images: [theirs.data.files[0].url] })
    assert.equal(res.status, 400)
    assert.equal(res.data.message, 'Images must be ones you uploaded')
  })

  it('uses an uploaded image as avatar and rejects someone else\'s', async () => {
    const mine = await upload(buyer.token, [png()])
    const ok = await call('PUT', '/auth/me', buyer.token, { avatar: mine.data.files[0].url })
    assert.equal(ok.status, 200)
    assert.equal(ok.data.seller.avatar, mine.data.files[0].url)

    const theirs = await upload(seller.token, [png()])
    assert.equal((await call('PUT', '/auth/me', buyer.token, { avatar: theirs.data.files[0].url })).status, 400)
  })
})
