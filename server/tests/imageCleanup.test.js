import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { startTestServer } from './helpers/testServer.js'
import { createClient, objectId, png } from './helpers/client.js'
import { sweepOrphanedImages } from '../utils/imageStorage.js'

const LISTING = { title: 'PET bottles', plasticType: 'PET', quantity: 10, pricePerKg: 20, location: 'Pune' }
const DAY_MS = 24 * 60 * 60 * 1000

describe('uploaded image lifecycle', () => {
  let env, call, upload, seller, otherSeller

  const uploadOne = async (user) => (await upload(user.token, [png()])).data.files[0]
  const exists = async (url) => (await fetch(`${env.socketUrl}${url}`)).status === 200
  const ageFile = (file, ms) =>
    mongoose.connection.db.collection('uploads.files').updateOne({ _id: objectId(file.id) }, { $set: { uploadDate: new Date(Date.now() - ms) } })

  before(async () => {
    env = await startTestServer()
    const client = createClient(env)
    ;({ call, upload } = client)
    seller = await client.register('Seller A', 'seller')
    otherSeller = await client.register('Seller B', 'seller')
    // The sweep runs in this process against the same throwaway database
    await mongoose.connect(env.dbUri)
    assert.equal(mongoose.connection.host, '127.0.0.1')
  })

  after(async () => {
    await mongoose.disconnect()
    await env?.stop()
  })

  describe('DELETE /api/uploads/:id', () => {
    it('removes an unused upload of the owner', async () => {
      const file = await uploadOne(seller)
      assert.equal((await call('DELETE', `/uploads/${file.id}`, seller.token)).status, 200)
      assert.equal(await exists(file.url), false)
    })

    it('refuses other users, images in use, bad IDs and anonymous calls', async () => {
      const file = await uploadOne(seller)
      assert.equal((await call('DELETE', `/uploads/${file.id}`, otherSeller.token)).status, 404)
      assert.equal((await call('DELETE', `/uploads/${file.id}`)).status, 401)
      assert.equal((await call('DELETE', '/uploads/not-an-id', seller.token)).status, 400)

      assert.equal((await call('POST', '/seller/listings', seller.token, { ...LISTING, images: [file.url] })).status, 201)
      const inUse = await call('DELETE', `/uploads/${file.id}`, seller.token)
      assert.equal(inUse.status, 409)
      assert.equal(await exists(file.url), true)
    })
  })

  describe('avatar replacement', () => {
    it('keeps the old avatar when a listing still shows it', async () => {
      const shared = await uploadOne(seller)
      assert.equal((await call('PUT', '/auth/me', seller.token, { avatar: shared.url })).status, 200)
      assert.equal((await call('POST', '/seller/listings', seller.token, { ...LISTING, images: [shared.url] })).status, 201)
      const next = await uploadOne(seller)
      assert.equal((await call('PUT', '/auth/me', seller.token, { avatar: next.url })).status, 200)
      assert.equal(await exists(shared.url), true)
    })

    it('removes the old avatar when nothing else uses it', async () => {
      const first = await uploadOne(seller)
      await call('PUT', '/auth/me', seller.token, { avatar: first.url })
      const second = await uploadOne(seller)
      await call('PUT', '/auth/me', seller.token, { avatar: second.url })
      assert.equal(await exists(first.url), false)
      assert.equal(await exists(second.url), true)
    })
  })

  describe('orphan sweep', () => {
    let listingPhoto, avatar, abandoned, fresh

    before(async () => {
      listingPhoto = await uploadOne(otherSeller)
      await call('POST', '/seller/listings', otherSeller.token, { ...LISTING, images: [listingPhoto.url] })
      avatar = await uploadOne(otherSeller)
      await call('PUT', '/auth/me', otherSeller.token, { avatar: avatar.url })
      abandoned = await uploadOne(otherSeller)
      fresh = await uploadOne(otherSeller)
      for (const file of [listingPhoto, avatar, abandoned]) await ageFile(file, 2 * DAY_MS)
    })

    it('reports old unreferenced uploads in dry-run mode without deleting them', async () => {
      const { orphans } = await sweepOrphanedImages({ minAgeMs: DAY_MS, dryRun: true })
      assert.ok(orphans.includes(abandoned.url))
      assert.ok(!orphans.includes(listingPhoto.url) && !orphans.includes(avatar.url) && !orphans.includes(fresh.url))
      assert.equal(await exists(abandoned.url), true)
    })

    it('deletes only old uploads that no listing or avatar uses', async () => {
      const { orphans } = await sweepOrphanedImages({ minAgeMs: DAY_MS })
      assert.ok(orphans.includes(abandoned.url))
      assert.equal(await exists(abandoned.url), false)
      assert.equal(await exists(listingPhoto.url), true)
      assert.equal(await exists(avatar.url), true)
      assert.equal(await exists(fresh.url), true, 'recent uploads are never swept')
    })
  })
})

describe('upload allowance', () => {
  let env, upload, seller

  before(async () => {
    env = await startTestServer({ env: { UPLOAD_DAILY_LIMIT_MB: '1' } })
    const client = createClient(env)
    upload = client.upload
    seller = await client.register('Seller A', 'seller')
  })

  after(async () => {
    await env?.stop()
  })

  it('refuses uploads beyond the daily allowance', async () => {
    const big = { bytes: Buffer.concat([png().bytes, Buffer.alloc(400 * 1024)]), type: 'image/png', name: 'big.png' }
    assert.equal((await upload(seller.token, [big])).status, 201)
    assert.equal((await upload(seller.token, [big])).status, 201)
    const third = await upload(seller.token, [big])
    assert.equal(third.status, 429)
    assert.equal(third.data.message, 'Daily image upload limit reached. Please try again tomorrow.')
  })
})
