// Starts a throwaway MongoDB + API server for one test file and tears both down afterwards.
// Never reads MONGODB_URI from the environment: tests only ever talk to the private local mongod.
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const MONGOD_BIN = process.env.MONGOD_PATH || 'mongod'
const STARTUP_TIMEOUT_MS = 30000

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

const waitForPort = async (port, deadline) => {
  while (Date.now() < deadline) {
    const open = await new Promise((resolve) => {
      const socket = net.connect(port, '127.0.0.1')
      socket.once('connect', () => { socket.destroy(); resolve(true) })
      socket.once('error', () => resolve(false))
    })
    if (open) return
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`Timed out waiting for port ${port}`)
}

const stopProcess = (child) =>
  new Promise((resolve) => {
    if (!child || child.exitCode !== null || child.signalCode !== null) return resolve()
    child.once('exit', () => resolve())
    child.kill()
  })

// `env` adds or overrides server settings for this file only (e.g. a lower upload allowance);
// the database connection variables cannot be overridden
export async function startTestServer({ env: extraEnv = {} } = {}) {
  const dbPath = await fs.mkdtemp(path.join(os.tmpdir(), 'ecocycle-test-'))
  const mongoPort = await getFreePort()
  const apiPort = await getFreePort()
  const dbUri = `mongodb://127.0.0.1:${mongoPort}/ecocycle_test`
  const jwtSecret = randomBytes(32).toString('hex')
  const deadline = Date.now() + STARTUP_TIMEOUT_MS
  let mongod
  let api
  const apiLog = []

  const stop = async () => {
    await stopProcess(api)
    await stopProcess(mongod)
    await fs.rm(dbPath, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 })
  }

  try {
    mongod = spawn(MONGOD_BIN, ['--dbpath', dbPath, '--port', String(mongoPort), '--bind_ip', '127.0.0.1', '--quiet'], {
      stdio: 'ignore',
    })
    const mongodFailed = new Promise((_, reject) => {
      mongod.once('error', (err) => reject(new Error(`Could not start mongod (${MONGOD_BIN}): ${err.message}. Install MongoDB or set MONGOD_PATH.`)))
    })
    await Promise.race([waitForPort(mongoPort, deadline), mongodFailed])

    // Every variable the server reads is set explicitly, so values from server/.env are never used
    api = spawn(process.execPath, ['index.js'], {
      cwd: SERVER_DIR,
      env: {
        ...process.env,
        // Optional tuning gets fixed defaults; the background image sweep is off (tests call it directly)
        RATE_LIMIT_MAX: '300',
        UPLOAD_DAILY_LIMIT_MB: '50',
        ORPHAN_IMAGE_SWEEP_HOURS: '0',
        ORPHAN_IMAGE_MIN_AGE_HOURS: '24',
        ...extraEnv,
        NODE_ENV: 'test',
        PORT: String(apiPort),
        MONGODB_URI: dbUri,
        JWT_SECRET: jwtSecret,
        JWT_EXPIRE: '1h',
        CLIENT_URL: 'http://localhost:5173',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`API server did not start:\n${apiLog.join('')}`)), Math.max(deadline - Date.now(), 0))
      const onData = (chunk) => {
        apiLog.push(chunk.toString())
        const match = /MongoDB connected: (\S+)/.exec(apiLog.join(''))
        if (!match) return
        clearTimeout(timer)
        if (match[1] !== '127.0.0.1') reject(new Error(`Refusing to test against non-local database host ${match[1]}`))
        else resolve()
      }
      api.stdout.on('data', onData)
      api.stderr.on('data', onData)
      api.once('exit', (code) => {
        clearTimeout(timer)
        reject(new Error(`API server exited with code ${code}:\n${apiLog.join('')}`))
      })
    })
    await waitForPort(apiPort, deadline)
  } catch (error) {
    await stop()
    throw error
  }

  return {
    apiUrl: `http://127.0.0.1:${apiPort}/api`,
    socketUrl: `http://127.0.0.1:${apiPort}`,
    dbUri,
    jwtSecret,
    stop,
  }
}
