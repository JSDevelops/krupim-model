import { randomUUID } from 'node:crypto'
import { CookieSession, getDbClient, loadEnv } from './test-helper.mjs'

loadEnv()

const baseUrl = (process.argv[2] || process.env.TEST_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
console.log(`Starting Certificates Test against ${baseUrl}...`)

const session = new CookieSession(baseUrl)
const testIp = session.randomIp()
const headers = { 'X-Forwarded-For': testIp }

// Login admin
const loginRes = await session.postJson('/api/auth/login', {
  email: 'admin@local.test',
  password: 'Admin123!',
  selectedRole: 'developer',
}, headers)

if (loginRes.status !== 200) {
  throw new Error(`Admin login failed: ${loginRes.status}`)
}

let createdUser = null
let dbClient = null

try {
  dbClient = await getDbClient()

  const suffix = randomUUID().replace(/-/g, '').slice(0, 10)
  const email = `certificate-test-${suffix}@local.test`

  // Create student
  const createRes = await session.postJson('/api/admin/users', {
    name: 'Certificate Test',
    email,
    password: 'Student12345!',
    role: 'student',
    status: 'active',
    schoolName: 'Local Test',
  }, headers)

  if (createRes.status !== 201 && createRes.status !== 200) {
    throw new Error(`Create student failed: ${createRes.status}`)
  }
  createdUser = createRes.data

  // Insert learning analytics
  await dbClient.query(`
    INSERT INTO learning_analytics(student_id, date, knowledge_score, skills_score, attitude_score, competency_score, overall_score)
    VALUES ($1, CURRENT_DATE, 80, 82, 84, 86, 84)
    ON CONFLICT (student_id, course_id, date) DO NOTHING
  `, [createdUser.id])

  // Issue certificate
  const issueRes = await session.postJson('/api/admin/certificates', {
    studentId: createdUser.id,
    action: 'issue',
  }, headers)

  if (issueRes.status !== 200 && issueRes.status !== 201) {
    throw new Error(`Issue certificate failed: ${issueRes.status}`)
  }

  let certificate = issueRes.data.certificate
  if (!certificate?.id || !certificate?.certificateCode) {
    throw new Error('Certificate issue response invalid')
  }

  // Reissue certificate
  const oldCode = certificate.certificateCode
  const reissueRes = await session.postJson('/api/admin/certificates', {
    studentId: createdUser.id,
    action: 'reissue',
  }, headers)

  if (reissueRes.status !== 200 && reissueRes.status !== 201) {
    throw new Error(`Reissue certificate failed: ${reissueRes.status}`)
  }

  certificate = reissueRes.data.certificate
  if (!certificate.certificateCode || certificate.certificateCode === oldCode) {
    throw new Error('Certificate reissue did not rotate code')
  }

  // Revoke certificate
  const revokeRes = await session.patchJson('/api/admin/certificates', {
    id: certificate.id,
    action: 'revoke',
  }, headers)

  if (revokeRes.status !== 200) {
    throw new Error(`Revoke certificate failed: ${revokeRes.status}`)
  }

  const revokedCheck = await session.getJson(`/api/certificates/${certificate.certificateCode}`, headers)
  if (revokedCheck.data?.certificate?.valid) {
    throw new Error('Revoked certificate still verifies as valid')
  }

  // Restore certificate
  const restoreRes = await session.patchJson('/api/admin/certificates', {
    id: certificate.id,
    action: 'restore',
  }, headers)

  if (restoreRes.status !== 200) {
    throw new Error(`Restore certificate failed: ${restoreRes.status}`)
  }

  const restoredCheck = await session.getJson(`/api/certificates/${certificate.certificateCode}`, headers)
  if (!restoredCheck.data?.certificate?.valid) {
    throw new Error('Restored certificate does not verify as valid')
  }

  // Verify history
  const adminData = await session.getJson('/api/admin/certificates', headers)
  const history = (adminData.data?.events || []).filter(e => e.certificateId === certificate.id)
  if (history.length < 4) {
    throw new Error(`Certificate history incomplete: ${history.length} event(s)`)
  }

  console.log('✓ PASS admin certificate issue, reissue, revoke, public verification, restore, and history')
} finally {
  if (createdUser?.id) {
    if (dbClient) {
      await dbClient.query('DELETE FROM learning_analytics WHERE student_id = $1', [createdUser.id]).catch(() => null)
    }
    await session.delete(`/api/admin/users?id=${createdUser.id}`, headers).catch(() => null)
  }
  if (dbClient) {
    await dbClient.end().catch(() => null)
  }
}
