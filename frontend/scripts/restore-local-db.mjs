import { existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { loadEnv } from './test-helper.mjs'

loadEnv()

function findBinary(name) {
  const check = spawnSync(name, ['--version'], { stdio: 'ignore' })
  if (check.status === 0) return name

  const isWin = process.platform === 'win32'
  const exeName = isWin ? `${name}.exe` : name

  const candidateDirs = isWin
    ? [
        'C:\\laragon\\bin\\postgresql\\postgresql\\bin',
        'C:\\Program Files\\PostgreSQL\\16\\bin',
        'C:\\Program Files\\PostgreSQL\\15\\bin',
      ]
    : [
        '/opt/homebrew/opt/postgresql@16/bin',
        '/opt/homebrew/opt/postgresql@15/bin',
        '/opt/homebrew/bin',
        '/usr/local/opt/postgresql@16/bin',
        '/usr/local/bin',
        '/usr/bin',
      ]

  for (const dir of candidateDirs) {
    const full = join(dir, exeName)
    if (existsSync(full)) return full
  }

  throw new Error(`PostgreSQL tool "${name}" not found in PATH or standard installation locations.`)
}

// Parse args: node scripts/restore-local-db.mjs --file <path> --confirm krupim_local [--uploads <tarPath>]
const args = process.argv.slice(2)
let backupFile = ''
let confirmDb = ''
let uploadsArchive = ''

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--file' && args[i + 1]) backupFile = args[++i]
  else if (args[i] === '--confirm' && args[i + 1]) confirmDb = args[++i]
  else if (args[i] === '--uploads' && args[i + 1]) uploadsArchive = args[++i]
  else if (!backupFile && !args[i].startsWith('--')) backupFile = args[i]
}

const dbName = process.env.LOCAL_DB_NAME || 'krupim_local'

if (!backupFile) {
  console.error('Usage: node scripts/restore-local-db.mjs --file <path-to-dump> --confirm <db-name> [--uploads <archive>]')
  process.exit(1)
}

if (confirmDb !== dbName) {
  console.error(`Restore cancelled. You must pass --confirm ${dbName} to prevent accidental overwrites.`)
  process.exit(1)
}

const resolvedBackup = resolve(process.cwd(), backupFile)
if (!existsSync(resolvedBackup)) {
  throw new Error(`Backup file not found: ${resolvedBackup}`)
}

const pgRestore = findBinary('pg_restore')
console.log(`Restoring ${resolvedBackup} into database "${dbName}"...`)

const restoreArgs = [
  '-h', '127.0.0.1',
  '-p', '5432',
  '-U', 'postgres',
  '-w',
  '--clean',
  '--if-exists',
  '--no-owner',
  '--no-privileges',
  `--dbname=${dbName}`,
  resolvedBackup,
]

let res = spawnSync(pgRestore, restoreArgs, { stdio: 'inherit' })
if (res.status !== 0) {
  // Retry without -U postgres for Mac local user
  const retryArgs = [
    '-h', '127.0.0.1',
    '-p', '5432',
    '-w',
    '--clean',
    '--if-exists',
    '--no-owner',
    '--no-privileges',
    `--dbname=${dbName}`,
    resolvedBackup,
  ]
  res = spawnSync(pgRestore, retryArgs, { stdio: 'inherit' })
  if (res.status !== 0) {
    throw new Error(`pg_restore failed with exit code ${res.status}`)
  }
}

console.log(`✓ Database restore completed for "${dbName}"`)

if (uploadsArchive) {
  const resolvedArchive = resolve(process.cwd(), uploadsArchive)
  if (!existsSync(resolvedArchive)) {
    throw new Error(`Uploads archive not found: ${resolvedArchive}`)
  }
  const workspaceRoot = resolve(process.cwd(), '..')
  const uploadsDir = resolve(workspaceRoot, '.data', 'uploads')
  mkdirSync(uploadsDir, { recursive: true })
  console.log(`Restoring uploads to ${uploadsDir}...`)

  const isZip = resolvedArchive.endsWith('.zip')
  const extract = isZip
    ? spawnSync('unzip', ['-o', resolvedArchive, '-d', uploadsDir], { stdio: 'inherit' })
    : spawnSync('tar', ['-xzf', resolvedArchive, '-C', uploadsDir], { stdio: 'inherit' })

  if (extract.status !== 0) {
    throw new Error('Uploads archive extraction failed')
  }
  console.log(`✓ Uploads restored to ${uploadsDir}`)
}
