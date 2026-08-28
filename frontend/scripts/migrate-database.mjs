import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) throw new Error('DATABASE_URL is required for production migrations')

const root = process.cwd()
const schemaPath = join(root, 'database', 'schema.local.sql')
const migrationsPath = join(root, 'database', 'migrations')
const ssl = process.env.DATABASE_SSL?.trim().toLowerCase() === 'require'
  ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase() !== 'false' }
  : undefined
const client = new Client({ connectionString: databaseUrl, ssl })

function sqlFile(path) {
  return readFileSync(path, 'utf8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(line => !line.trimStart().startsWith('\\'))
    .join('\n')
}

await client.connect()
try {
  await client.query('SELECT pg_advisory_lock($1)', [846_302_071])
  await client.query(sqlFile(schemaPath))

  const migrationFiles = readdirSync(migrationsPath)
    .filter(name => /^\d{3}_[a-z0-9_-]+\.sql$/.test(name))
    .sort()

  for (const migrationName of migrationFiles) {
    const applied = await client.query('SELECT 1 FROM schema_migrations WHERE migration_name=$1 LIMIT 1', [migrationName])
    if (applied.rowCount) {
      console.log(`Migration already applied: ${migrationName}`)
      continue
    }
    console.log(`Applying migration: ${migrationName}`)
    await client.query(sqlFile(join(migrationsPath, migrationName)))
    await client.query('INSERT INTO schema_migrations(migration_name) VALUES($1)', [migrationName])
  }
  console.log('Production PostgreSQL schema is up to date.')
} finally {
  await client.query('SELECT pg_advisory_unlock($1)', [846_302_071]).catch(() => undefined)
  await client.end()
}
