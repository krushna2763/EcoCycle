// Browser end-to-end test of the full seller/buyer flow.
//
// Starts its own throwaway stack: a private mongod on a temp folder, the API (server/index.js)
// and the Vite dev server, all on free local ports, then drives Chrome through the flow.
// The database address is built here and never read from the environment or server/.env,
// and the run aborts unless the API reports a 127.0.0.1 database. See e2e/README.md.
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CLIENT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SERVER_DIR = path.resolve(CLIENT_DIR, '..', 'server')
const requireClient = createRequire(path.join(CLIENT_DIR, 'package.json'))
const requireServer = createRequire(path.join(SERVER_DIR, 'package.json'))
const puppeteer = requireClient('puppeteer-core')
const mongoose = requireServer('mongoose')

const MONGOD_BIN = process.env.MONGOD_PATH || 'mongod'
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)
const STEP_TIMEOUT_MS = 15000
const PASSWORD = 'Password123!'
// A valid 1x1 PNG used as the listing photo
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')

const results = []
const procs = []
let browser
let conn
let tempDir
const pages = {}

const step = async (name, fn) => {
  try {
    await fn()
    results.push({ name, ok: true })
    console.log(`PASS ${name}`)
  } catch (error) {
    results.push({ name, ok: false, error: error.message })
    console.log(`FAIL ${name}\n     ${error.message}`)
    throw error
  }
}

const getFreePort = () =>
  new Promise((resolve, reject) => {
    const probe = net.createServer()
    probe.unref()
    probe.on('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address()
      probe.close(() => resolve(port))
    })
  })

const waitForPort = async (port, timeoutMs = 60000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const open = await new Promise((resolve) => {
      const socket = net.connect(port, '127.0.0.1')
      socket.once('connect', () => { socket.destroy(); resolve(true) })
      socket.once('error', () => resolve(false))
    })
    if (open) return
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`Timed out waiting for port ${port}`)
}

const stopProcess = (child) =>
  new Promise((resolve) => {
    if (!child || child.exitCode !== null || child.signalCode !== null) return resolve()
    child.once('exit', () => resolve())
    child.kill()
  })

async function main() {
  const chromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate))
  if (!chromePath) throw new Error('Chrome not found. Install Google Chrome or set CHROME_PATH.')

  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ecocycle-e2e-'))
  const dbPath = path.join(tempDir, 'db')
  const artifactsDir = process.env.E2E_ARTIFACTS_DIR || path.join(tempDir, 'artifacts')
  await fs.mkdir(dbPath, { recursive: true })
  await fs.mkdir(artifactsDir, { recursive: true })
  const photoPath = path.join(tempDir, 'photo.png')
  await fs.writeFile(photoPath, PNG)

  const [mongoPort, apiPort, webPort] = [await getFreePort(), await getFreePort(), await getFreePort()]
  const dbUri = `mongodb://127.0.0.1:${mongoPort}/ecocycle_e2e`
  const api = `http://127.0.0.1:${apiPort}/api`
  const web = `http://127.0.0.1:${webPort}`

  // 1. Private MongoDB
  const mongod = spawn(MONGOD_BIN, ['--dbpath', dbPath, '--port', String(mongoPort), '--bind_ip', '127.0.0.1', '--quiet'], { stdio: 'ignore' })
  procs.push(mongod)
  await Promise.race([
    waitForPort(mongoPort),
    new Promise((_, reject) => mongod.once('error', (e) => reject(new Error(`Could not start mongod (${MONGOD_BIN}): ${e.message}. Set MONGOD_PATH.`)))),
  ])

  // 2. API with every setting it reads given explicitly (server/.env is never used)
  const apiLog = []
  const apiProc = spawn(process.execPath, ['index.js'], {
    cwd: SERVER_DIR,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(apiPort),
      MONGODB_URI: dbUri,
      JWT_SECRET: randomBytes(32).toString('hex'),
      JWT_EXPIRE: '1h',
      CLIENT_URL: web,
      RATE_LIMIT_MAX: '1000',
      UPLOAD_DAILY_LIMIT_MB: '50',
      ORPHAN_IMAGE_SWEEP_HOURS: '0',
      ORPHAN_IMAGE_MIN_AGE_HOURS: '24',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  procs.push(apiProc)
  apiProc.stdout.on('data', (d) => apiLog.push(String(d)))
  apiProc.stderr.on('data', (d) => apiLog.push(String(d)))
  await waitForPort(apiPort)
  for (let i = 0; i < 50 && !/MongoDB connected: /.test(apiLog.join('')); i += 1) await new Promise((r) => setTimeout(r, 100))
  const host = /MongoDB connected: (\S+)/.exec(apiLog.join(''))?.[1]
  if (host !== '127.0.0.1') throw new Error(`Refusing to run: API database host is ${host || 'unknown'}, expected 127.0.0.1\n${apiLog.join('')}`)

  // 3. Web client pointed at the private API
  const webProc = spawn(process.execPath, [path.join(CLIENT_DIR, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', String(webPort), '--strictPort'], {
    cwd: CLIENT_DIR,
    env: { ...process.env, VITE_API_URL: api, VITE_SOCKET_URL: `http://127.0.0.1:${apiPort}` },
    stdio: 'ignore',
  })
  procs.push(webProc)
  await waitForPort(webPort)

  conn = await mongoose.createConnection(dbUri).asPromise()
  if (conn.host !== '127.0.0.1') throw new Error(`Refusing to use database host ${conn.host}`)

  // Test accounts (fresh database, unique per run)
  const register = async (body) => {
    const res = await fetch(`${api}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (res.status !== 201) throw new Error(`register failed: ${JSON.stringify(data)}`)
    return data.seller
  }
  const seller = await register({ fullName: 'Asha Seller', email: 'seller@e2e.local', password: PASSWORD, phone: '9000000001', role: 'seller', city: 'Pune', pickupAddress: 'Baner Road' })
  const buyer = await register({ fullName: 'Ravi Buyer', email: 'buyer@e2e.local', password: PASSWORD, phone: '9000000002', role: 'buyer', businessName: 'GreenLoop Recyclers', city: 'Mumbai' })
  const convId = `conv_${seller.id}_${buyer.id}`

  browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: process.env.E2E_HEADFUL ? false : true,
    args: ['--no-sandbox'],
  })

  const problems = []
  const openPage = async (label) => {
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    await page.setViewport({ width: 1366, height: 900 })
    page.on('pageerror', (e) => problems.push(`${label} page error: ${e.message}`))
    page.on('console', (m) => { if (m.type() === 'error') problems.push(`${label} console error: ${m.text()}`) })
    page.on('response', (r) => { if (r.status() >= 500) problems.push(`${label} HTTP ${r.status()} ${r.url()}`) })
    pages[label] = page
    return page
  }
  const pageText = (page) => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 700)).catch(() => '')
  const text = (page, needle) =>
    page.waitForFunction((n) => document.body.innerText.includes(n), { timeout: STEP_TIMEOUT_MS }, needle)
      .catch(async () => { throw new Error(`text "${needle}" not found on ${page.url()} :: ${await pageText(page)}`) })
  // Exact visible-text match, so "Accept" does not hit the "Accepted" tab
  const clickText = async (page, tag, label) => {
    const handle = await page.waitForSelector(`::-p-xpath(//${tag}[normalize-space()="${label}"])`, { visible: true, timeout: STEP_TIMEOUT_MS })
      .catch(async () => { throw new Error(`${tag} "${label}" not found on ${page.url()} :: ${await pageText(page)}`) })
    await handle.click()
  }
  // Set a controlled input/select value the way React expects
  const setValue = (page, selector, value) =>
    page.$eval(selector, (el, v) => {
      const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v)
      el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
    }, value)
  const shot = (page, name) => page.screenshot({ path: path.join(artifactsDir, `${name}.png`) })
  const login = async (page, email) => {
    await page.goto(`${web}/login`, { waitUntil: 'networkidle2' })
    await page.type('input[placeholder="Enter your email or phone number"]', email)
    await page.type('input[placeholder="Enter your password"]', PASSWORD)
    await page.click('button[type="submit"]')
  }

  const sellerPage = await openPage('seller')
  const buyerPage = await openPage('buyer')

  await step('seller logs in through the UI', async () => {
    await login(sellerPage, 'seller@e2e.local')
    await sellerPage.waitForFunction(() => location.pathname === '/seller/dashboard', { timeout: STEP_TIMEOUT_MS })
    await text(sellerPage, 'Asha Seller')
  })

  await step('seller creates a listing with a real photo upload', async () => {
    await sellerPage.goto(`${web}/seller/dashboard/add-listing`, { waitUntil: 'networkidle2' })
    await sellerPage.type('input[placeholder="Example: Used PET Bottles"]', 'E2E PET Bottles')
    const selects = await sellerPage.$$('select')
    await selects[0].select('PET')
    await sellerPage.type('input[placeholder="Enter quantity"]', '50')
    await sellerPage.type('input[placeholder="Enter price per unit"]', '25')
    await sellerPage.type('input[placeholder="Enter city or area"]', 'Pune')
    await sellerPage.type('textarea[placeholder^="Describe the condition"]', 'Clean sorted bottles')
    await selects[2].select('Clean')
    await selects[3].select('Household')
    await selects[4].select('Immediately')
    const fileInput = await sellerPage.$('input[type="file"]')
    await fileInput.uploadFile(photoPath)
    await clickText(sellerPage, 'button', 'Publish Listing')
    await text(sellerPage, 'Listing Submitted!')
  })

  await step('my listings shows it as pending approval with its photo', async () => {
    await sellerPage.goto(`${web}/seller/dashboard/listings`, { waitUntil: 'networkidle2' })
    await text(sellerPage, 'E2E PET Bottles')
    await text(sellerPage, 'Pending Approval')
    const loaded = await sellerPage.$$eval('img[alt="E2E PET Bottles"]', (imgs) => imgs.some((i) => i.complete && i.naturalWidth > 0))
    if (!loaded) throw new Error('listing photo did not load')
    await shot(sellerPage, '01-my-listings')
  })

  // There is no approval UI yet (Admin phase); approve directly in the throwaway database
  await conn.collection('listings').updateOne({ title: 'E2E PET Bottles' }, { $set: { status: 'approved' } })

  await step('buyer logs in, finds the listing and sends a request', async () => {
    await login(buyerPage, 'buyer@e2e.local')
    await buyerPage.waitForFunction(() => location.pathname === '/buyer/dashboard', { timeout: STEP_TIMEOUT_MS })
    await buyerPage.goto(`${web}/buyer/dashboard/listings`, { waitUntil: 'networkidle2' })
    await text(buyerPage, 'E2E PET Bottles')
    await shot(buyerPage, '02-browse')
    await clickText(buyerPage, 'h3', 'E2E PET Bottles')
    await text(buyerPage, 'About the Seller')
    await text(buyerPage, 'Asha Seller')
    await setValue(buyerPage, 'input[type="number"][max]', '30')
    await shot(buyerPage, '03-details')
    await clickText(buyerPage, 'button', 'Send Buy Request')
    await text(buyerPage, 'Request Sent!')
    await buyerPage.waitForFunction(() => location.pathname === '/buyer/dashboard/requests', { timeout: STEP_TIMEOUT_MS })
    await text(buyerPage, 'Pending')
  })

  await step('seller gets a live notification badge and accepts the request', async () => {
    await sellerPage.goto(`${web}/seller/dashboard/requests`, { waitUntil: 'networkidle2' })
    await text(sellerPage, 'GreenLoop Recyclers')
    await sellerPage.waitForSelector('button[aria-label$="unread notifications"]', { timeout: STEP_TIMEOUT_MS })
      .catch(() => { throw new Error('no unread-notification badge on the seller navbar') })
    await clickText(sellerPage, 'button', 'Accept')
    await text(sellerPage, 'Manage Collection')
    await shot(sellerPage, '04-requests')
  })

  await step('buyer sees the acceptance', async () => {
    await buyerPage.goto(`${web}/buyer/dashboard/requests`, { waitUntil: 'networkidle2' })
    await text(buyerPage, 'Accepted')
    await text(buyerPage, 'Mark as Collected')
  })

  await step('seller schedules the collection', async () => {
    await sellerPage.goto(`${web}/seller/dashboard/collections`, { waitUntil: 'networkidle2' })
    await clickText(sellerPage, 'button', 'Schedule Collection')
    await setValue(sellerPage, 'input[type="date"]', '2027-01-15')
    await setValue(sellerPage, 'input[type="time"]', '10:30')
    await setValue(sellerPage, 'input[placeholder="Pickup location"]', 'Warehouse 4, Pune')
    await clickText(sellerPage, 'button', 'Send Schedule')
    await text(sellerPage, 'Start Collection')
    await shot(sellerPage, '05-collections')
  })

  await step('buyer sees the pickup schedule', async () => {
    await buyerPage.goto(`${web}/buyer/dashboard/collections`, { waitUntil: 'networkidle2' })
    await text(buyerPage, 'Pickup Scheduled')
    await text(buyerPage, 'Warehouse 4, Pune')
  })

  await step('chat: messages persist and arrive live, exactly once', async () => {
    await buyerPage.goto(`${web}/buyer/dashboard/messages?c=${convId}`, { waitUntil: 'networkidle2' })
    await sellerPage.goto(`${web}/seller/dashboard/messages?c=${convId}`, { waitUntil: 'networkidle2' })
    await buyerPage.type('input[placeholder="Type your message..."]', 'Truck arrives at 10:30')
    await buyerPage.keyboard.press('Enter')
    await text(sellerPage, 'Truck arrives at 10:30')
    await sellerPage.type('input[placeholder="Type your message..."]', 'Gate 2 please')
    await sellerPage.keyboard.press('Enter')
    await text(buyerPage, 'Gate 2 please')
    await new Promise((r) => setTimeout(r, 800))
    // Once in the thread and once as the conversation preview
    const count = await buyerPage.evaluate(() => document.body.innerText.split('Gate 2 please').length - 1)
    if (count !== 2) throw new Error(`expected the reply once in the thread (+1 preview), found ${count}`)
    await shot(buyerPage, '06-chat')
    await buyerPage.reload({ waitUntil: 'networkidle2' })
    await text(buyerPage, 'Truck arrives at 10:30')
  })

  await step('seller runs and completes the collection', async () => {
    await sellerPage.goto(`${web}/seller/dashboard/collections`, { waitUntil: 'networkidle2' })
    await clickText(sellerPage, 'button', 'Start Collection')
    await text(sellerPage, 'In Progress')
    await clickText(sellerPage, 'button', 'Mark Completed')
    await sellerPage.waitForFunction(() => !document.body.innerText.includes('Mark Completed'), { timeout: STEP_TIMEOUT_MS })
  })

  await step('both dashboards and notifications reflect the result', async () => {
    await buyerPage.goto(`${web}/buyer/dashboard/requests`, { waitUntil: 'networkidle2' })
    await text(buyerPage, 'Collection completed')
    await buyerPage.goto(`${web}/buyer/dashboard/notifications`, { waitUntil: 'networkidle2' })
    for (const title of ['Request accepted', 'Collection scheduled', 'Collection completed']) await text(buyerPage, title)
    await shot(buyerPage, '07-buyer-notifications')
    await sellerPage.goto(`${web}/seller/dashboard`, { waitUntil: 'networkidle2' })
    await text(sellerPage, '30 kg')
    await shot(sellerPage, '08-seller-dashboard')
    const listing = await conn.collection('listings').findOne({ title: 'E2E PET Bottles' })
    if (listing.quantity !== 20) throw new Error(`listing quantity is ${listing.quantity}, expected 20 (50 - 30 collected)`)
  })

  await step('profile and settings save to the server', async () => {
    await buyerPage.goto(`${web}/buyer/dashboard/profile`, { waitUntil: 'networkidle2' })
    await clickText(buyerPage, 'button', 'Edit Profile')
    await setValue(buyerPage, 'input[value="Mumbai"]', 'Thane')
    await clickText(buyerPage, 'button', 'Save Changes')
    await text(buyerPage, 'Profile updated.')
    const user = await conn.collection('sellers').findOne({ email: 'buyer@e2e.local' })
    if (user.city !== 'Thane') throw new Error('buyer profile change was not saved')

    await sellerPage.goto(`${web}/seller/dashboard/settings`, { waitUntil: 'networkidle2' })
    const selects = await sellerPage.$$('select')
    await selects[0].select('Hindi')
    await clickText(sellerPage, 'button', 'Save Changes')
    await text(sellerPage, 'Settings saved successfully.')
    const settings = await conn.collection('settings').findOne({ seller: new mongoose.Types.ObjectId(seller.id) })
    if (settings?.language !== 'Hindi') throw new Error('seller settings change was not saved')
  })

  await step('no page errors, console errors or 5xx responses', async () => {
    const relevant = problems.filter((p) => !/favicon|DevTools/.test(p))
    if (relevant.length) throw new Error(relevant.join('\n     '))
  })
}

let failed = false
try {
  await main()
} catch (error) {
  failed = true
  if (!results.some((r) => !r.ok)) console.log(`\nE2E setup failed: ${error.message}`)
  for (const [label, page] of Object.entries(pages)) {
    if (tempDir) await page.screenshot({ path: path.join(tempDir, `failure-${label}.png`) }).catch(() => {})
  }
} finally {
  await conn?.close().catch(() => {})
  await browser?.close().catch(() => {})
  for (const child of procs.reverse()) await stopProcess(child)
  // The database is always removed; screenshots are kept only after a failure (or in E2E_ARTIFACTS_DIR)
  if (tempDir) {
    const removeOptions = { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }
    if (failed) {
      await fs.rm(path.join(tempDir, 'db'), removeOptions)
      console.log(`\nScreenshots for this failed run: ${tempDir}`)
    } else {
      await fs.rm(tempDir, removeOptions)
    }
  }
  if (process.env.E2E_ARTIFACTS_DIR) console.log(`Screenshots saved to ${process.env.E2E_ARTIFACTS_DIR}`)
  const passed = results.filter((r) => r.ok).length
  console.log(`\nE2E steps: ${results.length} | passed ${passed} | failed ${results.length - passed}`)
}

process.exit(failed ? 1 : 0)
