import { randomUUID } from 'node:crypto'
import { CookieSession, loadEnv } from './test-helper.mjs'

loadEnv()

const baseUrl = (process.argv[2] || process.env.TEST_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
console.log(`Starting Local Avatar Test against ${baseUrl}...`)

const adminSession = new CookieSession(baseUrl)
const headers = { 'X-Forwarded-For': '10.46.46.46' }

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

try {
  const suffix = randomUUID().replace(/-/g, '').slice(0, 10)
  const email = `avatar-test-${suffix}@local.test`

  // 2. Create student account
  const createRes = await adminSession.postJson('/api/admin/users', {
    name: 'Avatar Test',
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

  // 3. Student login
  const studentSession = new CookieSession(baseUrl)
  const studentLogin = await studentSession.postJson('/api/auth/login', {
    email,
    password: 'Student12345!',
    selectedRole: 'student',
  }, { 'X-Forwarded-For': '10.46.46.47' })

  if (studentLogin.status !== 200) {
    throw new Error(`Student login failed: ${studentLogin.status}`)
  }

  const authHeaders = { 'X-Forwarded-For': '10.46.46.48' }
  const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

  // 4. Upload first avatar
  const firstRes = await studentSession.postJson('/api/profile/avatar', { dataUrl }, authHeaders)
  if (firstRes.status !== 200) {
    throw new Error(`First avatar upload failed: ${firstRes.status}`)
  }

  const firstUrl = firstRes.data?.avatarUrl
  const firstFetch = await studentSession.request(firstUrl, { headers: authHeaders })
  const contentType = firstFetch.headers.get('content-type') || ''
  if (firstFetch.status !== 200 || !contentType.startsWith('image/png')) {
    throw new Error(`Avatar download failed: status=${firstFetch.status}, contentType=${contentType}`)
  }

  // 5. Upload second avatar (replaces first)
  const secondRes = await studentSession.postJson('/api/profile/avatar', { dataUrl }, authHeaders)
  if (secondRes.status !== 200) {
    throw new Error(`Second avatar upload failed: ${secondRes.status}`)
  }

  const secondUrl = secondRes.data?.avatarUrl

  // Check old avatar is gone (404)
  const oldFetch = await studentSession.request(firstUrl, { headers: authHeaders })
  if (oldFetch.status !== 404) {
    throw new Error(`Replaced avatar returned ${oldFetch.status} instead of 404`)
  }

  // 6. Delete avatar
  const delRes = await studentSession.delete('/api/profile/avatar', authHeaders)
  if (delRes.status !== 200) {
    throw new Error(`Delete avatar failed: ${delRes.status}`)
  }

  // Check second avatar is now gone (404)
  const secondFetch = await studentSession.request(secondUrl, { headers: authHeaders })
  if (secondFetch.status !== 404) {
    throw new Error(`Removed avatar returned ${secondFetch.status} instead of 404`)
  }

  console.log('✓ PASS local avatar upload, replacement cleanup, and removal')
} finally {
  if (createdUser?.id) {
    await adminSession.delete(`/api/admin/users?id=${createdUser.id}`, headers).catch(() => null)
  }
}
