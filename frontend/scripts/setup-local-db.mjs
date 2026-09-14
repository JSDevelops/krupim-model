import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import pg from 'pg'
import { loadEnv } from './test-helper.mjs'

loadEnv()

const { Client } = pg
const dbName = process.env.LOCAL_DB_NAME || 'krupim_local'
const root = resolve(process.cwd())
const databaseDir = join(root, 'database')
const schemaPath = join(databaseDir, 'schema.local.sql')
const seedPath = join(databaseDir, 'seed.local.sql')
const migrationsPath = join(databaseDir, 'migrations')

function cleanSql(filePath) {
  return readFileSync(filePath, 'utf8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(line => !line.trimStart().startsWith('\\'))
    .join('\n')
}

// 1. Check if target database exists via administrative connection to 'postgres'
console.log(`Connecting to PostgreSQL to check database "${dbName}"...`)

// Parse DATABASE_URL or build admin connection URL
const dbUrl = process.env.DATABASE_URL || 'postgresql://127.0.0.1:5432/krupim_local'
const parsedUrl = new URL(dbUrl)
const adminUrl = new URL(dbUrl)
adminUrl.pathname = '/postgres'

let adminClient
try {
  adminClient = new Client({ connectionString: adminUrl.toString() })
  await adminClient.connect()
} catch (e) {
  // If connection to /postgres failed, try default user
  adminClient = new Client({ host: parsedUrl.hostname || '127.0.0.1', port: Number(parsedUrl.port) || 5432, database: 'postgres' })
  await adminClient.connect()
}

try {
  const checkRes = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
  if (checkRes.rowCount === 0) {
    console.log(`Database "${dbName}" does not exist. Creating...`)
    // CREATE DATABASE cannot run inside a transaction block
    await adminClient.query(`CREATE DATABASE "${dbName}" ENCODING 'UTF8'`)
    console.log(`✓ Database "${dbName}" created.`)
  } else {
    console.log(`✓ Database "${dbName}" already exists.`)
  }
} finally {
  await adminClient.end().catch(() => null)
}

// 2. Connect to the target database and apply schema, seeds, and migrations
console.log(`Applying schema to "${dbName}"...`)
const client = new Client({ connectionString: dbUrl })
await client.connect()

try {
  await client.query('SELECT pg_advisory_lock($1)', [846_302_071])

  // Run schema
  if (existsSync(schemaPath)) {
    console.log('Applying schema.local.sql...')
    await client.query(cleanSql(schemaPath))
    console.log('✓ Schema applied.')
  }

  // Run seed
  if (existsSync(seedPath)) {
    console.log('Applying seed.local.sql...')
    await client.query(cleanSql(seedPath))
    console.log('✓ Seed applied.')
  }

  // Run migrations
  if (existsSync(migrationsPath)) {
    const migrationFiles = readdirSync(migrationsPath)
      .filter(name => /^\d{3}_[a-z0-9_-]+\.sql$/.test(name))
      .sort()

    for (const file of migrationFiles) {
      const applied = await client.query('SELECT 1 FROM schema_migrations WHERE migration_name = $1 LIMIT 1', [file])
      if (applied.rowCount) {
        console.log(`Migration already applied: ${file}`)
        continue
      }
      console.log(`Applying migration: ${file}`)
      await client.query(cleanSql(join(migrationsPath, file)))
      await client.query('INSERT INTO schema_migrations(migration_name) VALUES($1)', [file])
      console.log(`✓ Migration applied: ${file}`)
    }
  }

  console.log(`\n🎉 Local PostgreSQL setup complete for "${dbName}"!`)
} finally {
  await client.query('SELECT pg_advisory_unlock($1)', [846_302_071]).catch(() => null)
  await client.end().catch(() => null)
}
