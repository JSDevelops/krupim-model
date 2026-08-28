import { hash, compare } from 'bcryptjs'
import pg from 'pg'

const { Client } = pg

function required(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

const connectionString = required('DATABASE_URL')
const email = required('ADMIN_EMAIL').toLowerCase()
const password = required('ADMIN_PASSWORD')
const name = process.env.ADMIN_NAME?.trim() || 'System Administrator'

if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('ADMIN_EMAIL is invalid')
if (password.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters')
if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
  throw new Error('ADMIN_PASSWORD must include lowercase, uppercase, number, and special characters')
}

const sslMode = process.env.DATABASE_SSL?.trim().toLowerCase()
const ssl = sslMode === 'require'
  ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase() !== 'false' }
  : undefined

const client = new Client({ connectionString, ssl, application_name: 'krupim-admin-bootstrap' })

try {
  await client.connect()
  await client.query('BEGIN')

  const existing = await client.query('SELECT id FROM app_users WHERE email = $1 LIMIT 1', [email])
  if (existing.rowCount) throw new Error(`Account already exists: ${email}`)

  const passwordHash = await hash(password, 12)
  await client.query(`
    WITH new_user AS (
      INSERT INTO app_users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, password_hash
    )
    INSERT INTO profiles (id, name, email, role, requested_role, approval_status)
    SELECT id, $3, email, 'developer', 'developer', 'active'
    FROM new_user
    RETURNING id, email, name, role, approval_status
  `, [email, passwordHash, name])

  await client.query('COMMIT')

  const stored = await client.query(`
    SELECT u.password_hash, p.id, p.email, p.name, p.role, p.approval_status
    FROM app_users u
    JOIN profiles p ON p.id = u.id
    WHERE u.email = $1
  `, [email])
  const account = stored.rows[0]
  if (!account || !(await compare(password, account.password_hash))) {
    throw new Error('Admin verification failed after creation')
  }

  console.log(JSON.stringify({
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    approval_status: account.approval_status,
    password_verified: true,
  }, null, 2))
} catch (error) {
  try { await client.query('ROLLBACK') } catch {}
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await client.end()
}
