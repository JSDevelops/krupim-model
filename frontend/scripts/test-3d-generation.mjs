import { randomUUID } from 'node:crypto'
import { CookieSession, getDbClient, loadEnv } from './test-helper.mjs'

loadEnv()

const baseUrl = (process.argv[2] || process.env.TEST_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
console.log(`Starting 3D Generation Test against ${baseUrl}...`)

const session = new CookieSession(baseUrl)
const testIp = session.randomIp()
const headers = { 'X-Forwarded-For': testIp }

// 1. Admin login
const adminLogin = await session.postJson('/api/auth/login', {
  email: 'admin@local.test',
  password: 'Admin123!',
  selectedRole: 'developer',
}, headers)

if (adminLogin.status !== 200) {
  throw new Error(`Admin login failed: ${adminLogin.status}`)
}

// 2. Tripo settings check
const settingsRes = await session.getJson('/api/admin/tripo-settings', headers)
const settings = settingsRes.data
if (!settings?.modelVersions || settings.modelVersions.length < 1) {
  throw new Error('Tripo model versions are unavailable')
}

if (settings.setting?.keyConfigured) {
  console.log('✓ PASS Tripo settings and model-version API (generation skipped to avoid consuming external credits)')
  process.exit(0)
}

// 3. Dev preview test
let job = null
let dbClient = null

try {
  dbClient = await getDbClient()
  const suffix = randomUUID().replace(/-/g, '').slice(0, 8)
  const body = {
    nameEn: `Preview Cup ${suffix}`,
    nameTh: `ถ้วยตัวอย่าง ${suffix}`,
    prompt: 'A simple white ceramic coffee cup, isolated object, clean topology',
    negativePrompt: 'text, watermark, blurry',
    description: 'Automated local 3D workflow test',
  }

  const createdRes = await session.postJson('/api/3d/generate', body, headers)

  if (createdRes.status === 503 && createdRes.data?.code === 'TRIPO_NOT_CONFIGURED') {
    console.log('✓ PASS Tripo settings checked (generation rejected with 503 TRIPO_NOT_CONFIGURED in production mode)')
    process.exit(0)
  }

  job = createdRes.data?.job

  if (!job?.id || !job?.arItemId || job.status !== 'preview' || !job.glbUrl) {
    throw new Error(`Development preview job was not persisted correctly: ${JSON.stringify(createdRes.data)}`)
  }

  const listedRes = await session.getJson('/api/3d/generate', headers)
  const jobs = listedRes.data?.jobs || []
  if (!jobs.some(j => j.id === job.id)) {
    throw new Error('Generated model job is missing from job history')
  }

  console.log('✓ PASS Tripo settings, generation persistence, AR item creation, and job history')
} finally {
  if (job?.id && job?.arItemId && dbClient) {
    await dbClient.query(`
      DELETE FROM model_generation_jobs WHERE id = $1::uuid;
      DELETE FROM ar_items WHERE id = $2;
    `, [job.id, job.arItemId]).catch(() => null)
  }
  if (dbClient) {
    await dbClient.end().catch(() => null)
  }
}
