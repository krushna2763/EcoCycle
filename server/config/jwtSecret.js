// JWT_SECRET signs every login token: anyone who can guess it can forge a token for any account.
// Production (NODE_ENV=production) refuses to start without a strong secret; other environments
// only warn, so existing local setups keep working until the secret is replaced.
// Messages never include the secret itself.
const PLACEHOLDER = 'replace-with-a-long-random-secret' // value in server/.env.example
const MIN_BITS = 256 // 32 random bytes
const HOW_TO_FIX = 'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'

// Strength of a randomly generated secret, estimated from its length and alphabet. It cannot tell
// a random string from a memorable one, so the secret should always come from a generator.
const estimatedBits = (secret) => {
  const alphabet = /^\d+$/.test(secret) ? 10
    : /^[0-9a-f]+$/i.test(secret) ? 16
      : /^[A-Za-z0-9+/=_-]+$/.test(secret) ? 64
        : 94
  return secret.length * Math.log2(alphabet)
}

// Why the secret cannot be used, or null when it is strong enough
export const jwtSecretProblem = (secret) => {
  if (!secret) return 'JWT_SECRET is not set.'
  if (secret === PLACEHOLDER) return 'JWT_SECRET is still the placeholder from .env.example.'
  if (estimatedBits(secret) < MIN_BITS || new Set(secret).size < 10) {
    return 'JWT_SECRET is too weak: use at least 32 random bytes (for example 64 hex characters).'
  }
  return null
}

// Returns false when the server must not start: no secret at all, or a weak one in production
export const checkJwtSecret = ({ env = process.env, log = console } = {}) => {
  const problem = jwtSecretProblem(env.JWT_SECRET)
  if (!problem) return true
  if (!env.JWT_SECRET || env.NODE_ENV === 'production') {
    log.error(`Configuration error: ${problem} ${HOW_TO_FIX}`)
    return false
  }
  log.warn(`Warning: ${problem} The server refuses to start with this secret when NODE_ENV=production. ${HOW_TO_FIX}`)
  return true
}
