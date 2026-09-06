import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const databaseUrl = (process.argv[2] || process.env.DATABASE_URL)?.trim()

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL is required.')
  console.error('Usage: DATABASE_URL="postgresql://..." node scripts/import-production-vocab.mjs')
  console.error('   or: node scripts/import-production-vocab.mjs "postgresql://..."')
  process.exit(1)
}

const root = process.cwd()
const sqlPath = join(root, 'database', 'export_vocabulary_for_production.sql')

const isRemote = !databaseUrl.includes('127.0.0.1') && !databaseUrl.includes('localhost')
const sslRequired = process.env.DATABASE_SSL?.trim().toLowerCase() === 'require' || isRemote
const ssl = sslRequired
  ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase() === 'true' }
  : undefined

const client = new Client({ connectionString: databaseUrl, ssl })

async function run() {
  console.log('📡 Connecting to PostgreSQL...')
  await client.connect()
  console.log('✅ Connected successfully.')

  console.log(`📄 Reading SQL file: ${sqlPath}`)
  const sql = readFileSync(sqlPath, 'utf8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(line => !line.trimStart().startsWith('\\'))
    .join('\n')

  console.log('⏳ Executing schema update and vocabulary import...')
  await client.query(sql)
  console.log('✅ SQL script executed successfully.')

  const countResult = await client.query('SELECT count(*) FROM vocabulary_items')
  console.log(`📊 Total vocabulary_items in database: ${countResult.rows[0].count}`)

  const sample = await client.query('SELECT id, name_en, name_th, image_url, glb_url FROM vocabulary_items LIMIT 3')
  console.log('🔎 Sample records:', sample.rows)

  await client.end()
  console.log('🎉 Done!')
}

run().catch(async err => {
  console.error('❌ Migration failed:', err.message)
  try {
    await client.end()
  } catch {}
  process.exit(1)
})
