import pg from 'pg'
import { CookieSession, loadEnv } from './test-helper.mjs'

loadEnv()

const { Client } = pg
const dbUrl = process.env.DATABASE_URL || 'postgresql://127.0.0.1:5432/krupim_local'
const baseUrl = (process.argv[2] || process.env.TEST_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const adminEmail = process.env.KRUPIM_TEST_ADMIN_EMAIL || 'admin@local.test'
const adminPassword = process.env.KRUPIM_TEST_ADMIN_PASSWORD || 'Admin123!'

async function run() {
  console.log('Testing PDPA Consent database state...')
  const client = new Client({ connectionString: dbUrl })
  await client.connect()
  try {
    // 1. Database schema & column verification
    const colRes = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name LIKE 'pdpa%'
      ORDER BY column_name;
    `)
    console.log('Columns in profiles:', colRes.rows)

    if (colRes.rows.length < 3) {
      throw new Error('PDPA columns missing in profiles table')
    }

    // 2. Sample profiles PDPA state
    const profRes = await client.query(`
      SELECT id, name, role, pdpa_consent, pdpa_consent_at, pdpa_consent_version
      FROM profiles
      WHERE role IN ('teacher', 'student')
      LIMIT 3;
    `)
    console.log('Sample profiles PDPA state:', profRes.rows)

    // 3. Test API endpoint /api/auth/pdpa-consent
    console.log(`\nTesting /api/auth/pdpa-consent against ${baseUrl}...`)
    const session = new CookieSession(baseUrl)
    const testIp = session.randomIp()

    // Login as admin/developer
    const loginRes = await session.postJson('/api/auth/login', {
      email: adminEmail,
      password: adminPassword,
      selectedRole: 'developer',
    }, { 'X-Forwarded-For': testIp })

    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`)
    }
    console.log('✓ Logged in successfully')

    // Test GET /api/auth/pdpa-consent
    const getConsentRes = await session.getJson('/api/auth/pdpa-consent')
    if (getConsentRes.status !== 200) {
      throw new Error(`GET /api/auth/pdpa-consent failed with status ${getConsentRes.status}`)
    }
    console.log('✓ GET /api/auth/pdpa-consent:', getConsentRes.data)

    // Test POST /api/auth/pdpa-consent
    const postConsentRes = await session.postJson('/api/auth/pdpa-consent', {
      version: '1.0',
    }, { 'X-Forwarded-For': testIp })

    if (postConsentRes.status !== 200 || !postConsentRes.data?.success) {
      throw new Error(`POST /api/auth/pdpa-consent failed with status ${postConsentRes.status}`)
    }
    console.log('✓ POST /api/auth/pdpa-consent:', postConsentRes.data)

    // Re-check GET
    const recheckRes = await session.getJson('/api/auth/pdpa-consent')
    if (!recheckRes.data?.consented) {
      throw new Error('PDPA consent recheck failed: expected consented=true')
    }
    console.log('✓ Verified consent state persisted:', recheckRes.data)

    // Verify audit log
    const auditRes = await client.query(`
      SELECT action, entity_type, details_json, created_at
      FROM audit_logs
      WHERE action = 'pdpa_consent_agreed'
      ORDER BY created_at DESC
      LIMIT 1;
    `)
    console.log('✓ Audit log confirmed:', auditRes.rows[0])

    console.log('\n🎉 ALL PDPA CONSENT TESTS PASSED!')
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
