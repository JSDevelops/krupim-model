import { CookieSession, loadEnv } from './test-helper.mjs'

loadEnv()

const baseUrl = (process.argv[2] || process.env.TEST_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const adminEmail = process.env.KRUPIM_TEST_ADMIN_EMAIL || 'admin@local.test'
const adminPassword = process.env.KRUPIM_TEST_ADMIN_PASSWORD || 'Admin123!'

console.log(`Starting Local API Smoke Tests against ${baseUrl}...`)

const session = new CookieSession(baseUrl)
const testIp = session.randomIp()

// 1. Developer login smoke test
const loginRes = await session.postJson('/api/auth/login', {
  email: adminEmail,
  password: adminPassword,
  selectedRole: 'developer',
}, { 'X-Forwarded-For': testIp })

if (loginRes.status !== 200) {
  throw new Error(`Developer login smoke test failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`)
}

if (loginRes.data?.access_token) {
  throw new Error('Login response exposed the session token to JavaScript')
}

// 2. Cookie-only session verification
const sessionRes = await session.getJson('/api/auth/session')
if (!sessionRes.data?.session?.user?.id || sessionRes.data?.session?.access_token) {
  throw new Error('Cookie-only session response validation failed')
}
console.log('✓ PASS HttpOnly cookie-only browser session')

// 3. Cross-origin mutation protection
const corsRes = await session.request('/api/auth/logout', {
  method: 'POST',
  headers: {
    Origin: 'https://malicious.example',
    'X-Forwarded-For': testIp,
  },
})

if (corsRes.status !== 403) {
  throw new Error(`Cross-origin mutation returned ${corsRes.status} instead of 403`)
}
console.log('✓ PASS cross-origin mutation protection')

// 4. API endpoints smoke test
const paths = [
  '/api/admin/system-settings',
  '/api/admin/audit-logs',
  '/api/admin/dashboard',
  '/api/teacher/dashboard',
  '/api/teacher/classes',
  '/api/teacher/lessons',
  '/api/teacher/assignments',
  '/api/teacher/vocabulary',
]

for (const path of paths) {
  const res = await session.getJson(path)
  if (res.status !== 200) {
    throw new Error(`API smoke test failed: ${path} returned status ${res.status}`)
  }
  console.log(`✓ PASS ${path}`)
}

// 5. Password reset privacy test
const resetReq = await session.postJson('/api/auth/password-reset', {
  email: 'nonexistent-smoke-test@local.invalid',
}, { 'X-Forwarded-For': testIp })

if (resetReq.status !== 200) {
  throw new Error(`Password reset privacy test failed with status ${resetReq.status}`)
}

// 6. Invalid reset token check
const invalidReset = await session.patchJson('/api/auth/password-reset', {
  token: 'x'.repeat(40),
  newPassword: 'ValidPassword123!',
}, { 'X-Forwarded-For': testIp })

if (invalidReset.status !== 400) {
  throw new Error(`Invalid password reset token returned ${invalidReset.status} instead of 400`)
}
console.log('✓ PASS password-reset privacy and invalid-token checks')

// 7. Rate limiting check
const rateIp = session.randomIp()
let lastStatus = 0

for (let attempt = 1; attempt <= 9; attempt++) {
  const badLogin = await session.postJson('/api/auth/login', {
    email: 'rate-limit-test@local.invalid',
    password: 'WrongPassword123!',
    selectedRole: 'student',
  }, { 'X-Forwarded-For': rateIp })
  lastStatus = badLogin.status
}

if (lastStatus !== 429) {
  throw new Error(`Database rate limit returned ${lastStatus} instead of 429`)
}
console.log('✓ PASS PostgreSQL-backed rate limiting')
console.log('\n🎉 All Local API smoke tests passed successfully!')
