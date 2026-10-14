import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import errorHandler from '../middleware/errorHandler.js'

const run = (err) => {
  const res = {
    statusCode: 0,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
  errorHandler(err, {}, res, () => {})
  return res
}

describe('errorHandler', () => {
  let logs
  let originalConsoleError

  beforeEach(() => {
    logs = []
    originalConsoleError = console.error
    console.error = (...args) => logs.push(args.join(' '))
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('returns a generic message for internal errors', () => {
    const res = run(new Error('MongoServerError: connection to mongodb+srv://dbuser:SuperSecret123@cluster0.example.net failed'))
    assert.equal(res.statusCode, 500)
    assert.equal(res.body.message, 'Internal Server Error')
  })

  it('masks connection-string credentials in server logs', () => {
    run(new Error('connection to mongodb+srv://dbuser:SuperSecret123@cluster0.example.net failed'))
    const output = logs.join('\n')
    assert.ok(!output.includes('SuperSecret123'))
    assert.ok(output.includes('dbuser:***@'))
  })

  it('keeps explicit client-error messages', () => {
    const res = run(Object.assign(new Error('Not allowed'), { statusCode: 403 }))
    assert.equal(res.statusCode, 403)
    assert.equal(res.body.message, 'Not allowed')
  })
})
