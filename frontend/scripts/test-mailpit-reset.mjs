import { randomUUID } from 'node:crypto'
import { CookieSession, loadEnv } from './test-helper.mjs'

loadEnv()

const baseUrl = (process.argv[2] || process.env.TEST_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const mailpitUrl = (process.argv[3] || process.env.MAILPIT_URL || 'http://127.0.0.1:8025').replace(/\/$/, '')

console.log(`Starting Mailpit Reset Test (App: ${baseUrl}, Mailpit: ${mailpitUrl})...`)

const adminSession = new CookieSession(baseUrl)
const testIp = adminSession.randomIp()
const headers = { 'X-Forwarded-For': testIp }

// 1. Admin login
const adminLogin = await adminSession.postJson('/api/auth/login', {
  email: 'admin@local.test',
  password: 'Admin123!',
  selectedRole: 'developer',
}, headers)

if (adminLogin.status !== 200) {
  throw new Error(`Admin login failed: ${adminLogin.status}`)
}

let createdUser = null
let messageId = ''

try {
  const suffix = randomUUID().replace(/-/g, '').slice(0, 10)
  const email = `mailpit-test-${suffix}@local.test`

  // 2. Create student account
  const createRes = await adminSession.postJson('/api/admin/users', {
    name: 'Mailpit Test',
    email,
    password: 'Student12345!',
    role: 'student',
    status: 'active',
    schoolName: 'Local Test',
  }, headers)

  if (createRes.status !== 200 && createRes.status !== 201) {
    throw new Error(`Create student failed: ${createRes.status}`)
  }
  createdUser = createRes.data

  // 3. Request password reset
  const resetRes = await adminSession.postJson('/api/auth/password-reset', { email })
  if (resetRes.status !== 200) {
    throw new Error(`Password reset request returned ${resetRes.status}`)
  }

  // 4. Query Mailpit
  await new Promise(r => setTimeout(r, 400))
  const query = encodeURIComponent(`to:${email}`)
  const searchRes = await fetch(`${mailpitUrl}/api/v1/search?query=${query}&limit=1`).catch(() => null)

  if (!searchRes || !searchRes.ok) {
    console.log('⚠️ Mailpit server is not reachable on ' + mailpitUrl + ' (test skipped or Mailpit not running)')
    process.exit(0)
  }

  const searchData = await searchRes.json()
  const message = searchData.messages?.[0]
  if (!message) {
    throw new Error('Mailpit did not receive password reset email')
  }
  messageId = message.ID

  const detailRes = await fetch(`${mailpitUrl}/api/v1/message/${messageId}`)
  const detail = await detailRes.json()
  const content = (detail.Text || '') + (detail.HTML || '')

  if (resetRes.data?.localResetToken) {
    throw new Error('SMTP mode exposed a local reset token')
  }

  if (!content.includes('/forgot-password#token=')) {
    throw new Error('Password reset email does not contain a secure reset link')
  }

  console.log('✓ PASS Mailpit SMTP password reset delivery')
} finally {
  if (messageId) {
    await fetch(`${mailpitUrl}/api/v1/messages`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ IDs: [messageId] }),
    }).catch(() => null)
  }
  if (createdUser?.id) {
    await adminSession.delete(`/api/admin/users?id=${createdUser.id}`, headers).catch(() => null)
  }
}
