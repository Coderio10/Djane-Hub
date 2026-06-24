import crypto from 'crypto'

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD

function getAdminConfig() {
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('Missing ADMIN_PASSWORD in environment variables')
  }

  if (!SESSION_SECRET) {
    throw new Error('Missing ADMIN_SESSION_SECRET in environment variables')
  }

  return {
    password: process.env.ADMIN_PASSWORD,
    secret: SESSION_SECRET,
  }
}

function sign(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url')
}

function safeEqual(a, b) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)

  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

function createAdminToken() {
  const { secret } = getAdminConfig()
  const payload = Buffer.from(JSON.stringify({
    role: 'admin',
    expiresAt: Date.now() + TOKEN_TTL_MS,
  })).toString('base64url')
  const signature = sign(payload, secret)

  return `${payload}.${signature}`
}

function verifyAdminToken(token) {
  const { secret } = getAdminConfig()
  const [payload, signature] = token?.split('.') ?? []

  if (!payload || !signature) return false
  if (!safeEqual(signature, sign(payload, secret))) return false

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return data.role === 'admin' && data.expiresAt > Date.now()
  } catch {
    return false
  }
}

function loginAdmin(req, res) {
  const { password } = req.body
  const { password: correctPassword } = getAdminConfig()

  if (!password || !safeEqual(password, correctPassword)) {
    return res.status(401).json({ error: 'Invalid admin password' })
  }

  res.json({ token: createAdminToken() })
}

function requireAdmin(req, res, next) {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Admin authentication required' })
  }

  next()
}

export { loginAdmin, requireAdmin }
