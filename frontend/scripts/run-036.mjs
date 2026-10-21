#!/usr/bin/env node
// Quick script to apply migration 036 only
// DATABASE_URL must be passed as env var (no file reading)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'
const { Client } = pg

const databaseUrl = (process.env.DATABASE_URL || '').trim()
if (!databaseUrl) throw new Error('DATABASE_URL env var is required')
console.log('Connecting to DB:', databaseUrl.slice(0, 50) + '...')

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

const sql = readFileSync(join('database', 'migrations', '036_assignment_publish_control.sql'), 'utf8')

await client.connect()
try {
  console.log('Running migration 036...')
  await client.query(sql)
  try {
    await client.query(
      "INSERT INTO schema_migrations(migration_name) VALUES('036_assignment_publish_control.sql') ON CONFLICT DO NOTHING"
    )
    console.log('Recorded in schema_migrations.')
  } catch {
    console.log('schema_migrations recording skipped.')
  }
  console.log('Migration 036 applied successfully! ✅')
} catch (err) {
  console.error('Migration error:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
