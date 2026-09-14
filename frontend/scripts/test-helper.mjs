import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'

const { Client } = pg

/**
 * Ensures .env.local environment variables are loaded if not already present in process.env.
 */
export function loadEnv(root = process.cwd()) {
  if (process.env.DATABASE_URL && process.env.AUTH_SECRET) return

  const envPath = join(root, '.env.local')
  if (existsSync(envPath)) {
    try {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath)
      } else {
        const content = readFileSync(envPath, 'utf8')
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) continue
          const eq = trimmed.indexOf('=')
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim()
            const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
            if (!process.env[key]) {
              process.env[key] = val
            }
          }
        }
      }
    } catch {}
  }
}

/**
 * Connects to PostgreSQL using DATABASE_URL.
 */
export async function getDbClient() {
  loadEnv()
  const connectionString = process.env.DATABASE_URL?.trim() || 'postgresql://127.0.0.1:5432/krupim_local'
  const sslMode = process.env.DATABASE_SSL?.trim().toLowerCase()
  const ssl = sslMode === 'require'
    ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase() !== 'false' }
    : undefined

  const client = new Client({ connectionString, ssl, application_name: 'krupim-test-runner' })
  await client.connect()
  return client
}

/**
 * Cookie-preserving HTTP session client (replaces PowerShell WebRequestSession).
 */
export class CookieSession {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.cookies = new Map()
  }

  randomIp() {
    const r = () => Math.floor(Math.random() * 254) + 1
    return `10.${r()}.${r()}.${r()}`
  }

  getCookieHeader() {
    if (this.cookies.size === 0) return ''
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')
  }

  async request(path, options = {}) {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`
    const headers = new Headers(options.headers || {})

    if (!headers.has('X-Forwarded-For')) {
      headers.set('X-Forwarded-For', this.randomIp())
    }

    const cookieHeader = this.getCookieHeader()
    if (cookieHeader && !headers.has('Cookie')) {
      headers.set('Cookie', cookieHeader)
    }

    const response = await fetch(url, { ...options, headers })

    // Save returned cookies
    const setCookies = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : (response.headers.get('set-cookie') ? [response.headers.get('set-cookie')] : [])

    for (const raw of setCookies) {
      const match = raw.match(/^([^=;]+)=([^;]*)/)
      if (match) {
        const name = match[1].trim()
        const value = match[2].trim()
        if (value === '' || /Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(raw)) {
          this.cookies.delete(name)
        } else {
          this.cookies.set(name, value)
        }
      }
    }

    return response
  }

  async getJson(path, headers = {}) {
    const res = await this.request(path, { method: 'GET', headers })
    const data = await res.json().catch(() => null)
    return { status: res.status, data, headers: res.headers }
  }

  async postJson(path, body = {}, headers = {}) {
    const res = await this.request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => null)
    return { status: res.status, data, headers: res.headers }
  }

  async patchJson(path, body = {}, headers = {}) {
    const res = await this.request(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => null)
    return { status: res.status, data, headers: res.headers }
  }

  async delete(path, headers = {}) {
    const res = await this.request(path, { method: 'DELETE', headers })
    const data = await res.json().catch(() => null)
    return { status: res.status, data, headers: res.headers }
  }
}
