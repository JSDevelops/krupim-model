import { existsSync, mkdirSync, statSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { loadEnv } from './test-helper.mjs'

loadEnv()

function findBinary(name) {
  // 1. Try directly in PATH
  const check = spawnSync(name, ['--version'], { stdio: 'ignore' })
  if (check.status === 0) return name

  // 2. Try common platform paths
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

const dbName = process.env.LOCAL_DB_NAME || 'krupim_local'
const workspaceRoot = resolve(process.cwd(), '..')
const backupDirectory = resolve(workspaceRoot, 'backups')
mkdirSync(backupDirectory, { recursive: true })

const now = new Date()
const pad = n => String(n).padStart(2, '0')
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
const backupPath = join(backupDirectory, `${dbName}-${timestamp}.dump`)

const pgDump = findBinary('pg_dump')
console.log(`Found pg_dump at: ${pgDump}`)
console.log(`Backing up database "${dbName}" to ${backupPath}...`)

const dumpResult = spawnSync(pgDump, [
  '-h', '127.0.0.1',
  '-p', '5432',
  '-U', 'postgres',
  '-w',
  '--format=custom',
  '--compress=6',
  '--no-owner',
  '--no-privileges',
  `--file=${backupPath}`,
  dbName,
], { stdio: 'inherit' })

if (dumpResult.status !== 0) {
  // If connection failed with user postgres, try without -U
  const retry = spawnSync(pgDump, [
    '-h', '127.0.0.1',
    '-p', '5432',
    '-w',
    '--format=custom',
    '--compress=6',
    '--no-owner',
    '--no-privileges',
    `--file=${backupPath}`,
    dbName,
  ], { stdio: 'inherit' })

  if (retry.status !== 0) {
    throw new Error(`pg_dump failed with exit code ${retry.status}`)
  }
}

const stats = statSync(backupPath)
console.log(`✓ Database backup ready: ${backupPath}`)
console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

// Back up local uploads if present
const uploadsDir = resolve(workspaceRoot, '.data', 'uploads')
if (existsSync(uploadsDir) && readdirSync(uploadsDir).length > 0) {
  const archivePath = join(backupDirectory, `${dbName}-${timestamp}.uploads.tar.gz`)
  console.log(`Archiving uploads directory to ${archivePath}...`)
  const tarRes = spawnSync('tar', ['-czf', archivePath, '-C', uploadsDir, '.'], { stdio: 'inherit' })
  if (tarRes.status === 0) {
    const archiveStats = statSync(archivePath)
    console.log(`✓ Uploads backup ready: ${archivePath}`)
    console.log(`  Size: ${(archiveStats.size / 1024 / 1024).toFixed(2)} MB`)
  }
} else {
  console.log('ℹ No local upload files found to back up.')
}
