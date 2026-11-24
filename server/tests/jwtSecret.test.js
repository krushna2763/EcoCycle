import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkJwtSecret, jwtSecretProblem } from '../config/jwtSecret.js'

const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const WEAK = 'dev-secret-only-28-chars-ok!'

const capture = () => {
  const lines = { error: [], warn: [] }
  return { lines, log: { error: (m) => lines.error.push(m), warn: (m) => lines.warn.push(m) } }
}

// Start index.js with an explicit environment and collect its output until it exits. Every
// variable it reads is set here (dotenv never overrides set variables), so server/.env and its
// database are never used; a refused secret stops the process before any connection is made.
const startServer = (env) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, ['index.js'], {
      cwd: SERVER_DIR,
      env: {
        ...process.env,
        PORT: '0',
        MONGODB_URI: 'mongodb://127.0.0.1:9/never-used',
        JWT_EXPIRE: '1h',
        CLIENT_URL: 'http://localhost:5173',
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    child.stdout.on('data', (d) => { output += d })
    child.stderr.on('data', (d) => { output += d })
    const timer = setTimeout(() => child.kill(), 10000)
    child.on('exit', (code) => {
      clearTimeout(timer)
      resolve({ code, output })
    })
  })

describe('JWT secret configuration', () => {
  it('accepts secrets with at least 32 random bytes', () => {
    for (const secret of [
      randomBytes(32).toString('hex'),
      randomBytes(48).toString('hex'),
      randomBytes(32).toString('base64'),
      randomBytes(32).toString('base64url'),
    ]) {
      assert.equal(jwtSecretProblem(secret), null)
    }
  })

  it('rejects missing, placeholder, short and repetitive secrets', () => {
    assert.equal(jwtSecretProblem(undefined), 'JWT_SECRET is not set.')
    assert.equal(jwtSecretProblem(''), 'JWT_SECRET is not set.')
    assert.match(jwtSecretProblem('replace-with-a-long-random-secret'), /placeholder/)
    for (const weak of [WEAK, randomBytes(16).toString('hex'), 'a'.repeat(200), 'ab'.repeat(100), '1234567890'.repeat(5)]) {
      assert.match(jwtSecretProblem(weak), /too weak/)
    }
  })

  it('stops production on a weak secret and only warns elsewhere, never logging the secret', () => {
    const production = capture()
    assert.equal(checkJwtSecret({ env: { NODE_ENV: 'production', JWT_SECRET: WEAK }, log: production.log }), false)
    assert.equal(production.lines.error.length, 1)

    const development = capture()
    assert.equal(checkJwtSecret({ env: { NODE_ENV: 'development', JWT_SECRET: WEAK }, log: development.log }), true)
    assert.equal(development.lines.warn.length, 1)

    const unset = capture()
    assert.equal(checkJwtSecret({ env: { JWT_SECRET: WEAK }, log: unset.log }), true)

    for (const line of [...production.lines.error, ...development.lines.warn, ...unset.lines.warn]) {
      assert.ok(!line.includes(WEAK))
    }
  })

  it('refuses to run without a secret in any environment', () => {
    const { log, lines } = capture()
    assert.equal(checkJwtSecret({ env: { NODE_ENV: 'development' }, log }), false)
    assert.match(lines.error[0], /JWT_SECRET is not set/)
  })

  it('stays quiet for a strong secret in production', () => {
    const { log, lines } = capture()
    assert.equal(checkJwtSecret({ env: { NODE_ENV: 'production', JWT_SECRET: randomBytes(32).toString('hex') }, log }), true)
    assert.deepEqual(lines, { error: [], warn: [] })
  })

  it('the server exits at start-up in production with a weak or missing secret', async () => {
    const weak = await startServer({ NODE_ENV: 'production', JWT_SECRET: WEAK })
    assert.equal(weak.code, 1)
    assert.match(weak.output, /Configuration error: JWT_SECRET is too weak/)
    assert.ok(!weak.output.includes(WEAK))
    assert.ok(!weak.output.includes('MongoDB'), 'stopped before connecting to a database')

    const missing = await startServer({ NODE_ENV: 'production', JWT_SECRET: '' })
    assert.equal(missing.code, 1)
    assert.match(missing.output, /Configuration error: JWT_SECRET is not set/)
  })
})
