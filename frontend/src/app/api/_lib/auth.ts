import { NextRequest, NextResponse } from 'next/server'
import { localDb, queryDb } from '@/lib/db'
import { getRequestSessionToken, verifySessionToken, type SessionUser } from '@/lib/session'

export type UserRole = 'developer' | 'teacher' | 'student'

export type AuthUser = {
  id: string
  email: string
  role: UserRole
}

type AccountState = {
  email: string | null
  role: UserRole | null
  approval_status: string | null
  session_version: number | null
  maintenance_enabled: boolean
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly headers?: HeadersInit,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Server-only PostgreSQL query client. */
export function getDatabase() {
  return localDb
}

async function requestSession(req: NextRequest) {
  const token = getRequestSessionToken(req)
  if (!token) throw new ApiError('Authentication required', 401, 'UNAUTHORIZED')

  try {
    return await verifySessionToken(token)
  } catch {
    throw new ApiError('Invalid or expired session', 401, 'UNAUTHORIZED')
  }
}

function authorizeAccount(
  sessionUser: SessionUser,
  account: AccountState | undefined,
  allowedRoles?: readonly UserRole[],
): AuthUser {
  if (!account?.email || !account.role) {
    throw new ApiError('User profile not found', 403, 'PROFILE_REQUIRED')
  }
  if (account.approval_status && account.approval_status !== 'active') {
    throw new ApiError('Account is not active', 403, 'ACCOUNT_INACTIVE')
  }

  const role = account.role
  if (role !== 'developer' && account.maintenance_enabled) {
    throw new ApiError('ระบบอยู่ระหว่างบำรุงรักษา กรุณาลองใหม่ภายหลัง', 503, 'MAINTENANCE')
  }
  if (role !== sessionUser.role || account.email !== sessionUser.email || account.session_version !== sessionUser.sessionVersion) {
    throw new ApiError('Session no longer matches this account', 401, 'UNAUTHORIZED')
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new ApiError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  return { id: sessionUser.id, email: sessionUser.email, role }
}

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: readonly UserRole[],
): Promise<AuthUser> {
  const sessionUser = await requestSession(req)
  const profileResult = await queryDb<AccountState>(`
    SELECT p.email,p.role,p.approval_status,u.session_version,
           COALESCE((SELECT (value_json->>'maintenance')::boolean
                     FROM system_settings WHERE setting_key='general' LIMIT 1),FALSE) AS maintenance_enabled
    FROM profiles p JOIN app_users u ON u.id=p.id
    WHERE p.id=$1::uuid LIMIT 1
  `, [sessionUser.id])
  return authorizeAccount(sessionUser, profileResult.rows[0], allowedRoles)
}

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')
  return (forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown').slice(0, 80)
}

export function enforceSameOrigin(req: NextRequest) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase())) return
  if ((req.headers.get('authorization') || '').startsWith('Bearer ')) return

  const origin = req.headers.get('origin')
  if (!origin) return
  let originUrl: URL
  try {
    originUrl = new URL(origin)
  } catch {
    throw new ApiError('Invalid request origin', 403, 'INVALID_ORIGIN')
  }

  const expectedHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host
  const expectedProtocol = (req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '')).split(',')[0].trim()
  if (originUrl.host !== expectedHost || originUrl.protocol !== `${expectedProtocol}:`) {
    throw new ApiError('Cross-origin request rejected', 403, 'INVALID_ORIGIN')
  }
}

function rateLimitWindow(req: NextRequest, windowMs: number) {
  const now = Date.now()
  const safeWindowMs = Math.min(Math.max(windowMs, 1_000), 24 * 60 * 60_000)
  const windowNumber = Math.floor(now / safeWindowMs)
  const resetAt = (windowNumber + 1) * safeWindowMs
  const key = `${getClientIp(req)}:${req.nextUrl.pathname.slice(0, 240)}:${safeWindowMs}:${windowNumber}`
  return { now, resetAt, key }
}

function checkRateLimit(requestCount: number | undefined, max: number, now: number, resetAt: number) {
  if ((requestCount || 1) <= max) return
  const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000))
  throw new ApiError('Too many requests', 429, 'RATE_LIMITED', { 'Retry-After': String(retryAfter) })
}

export async function enforceRateLimit(req: NextRequest, max = 10, windowMs = 60_000) {
  enforceSameOrigin(req)
  const { now, resetAt, key } = rateLimitWindow(req, windowMs)
  const result = await queryDb<{ request_count: number }>(`
    WITH cleanup AS (
      DELETE FROM api_rate_limits WHERE expires_at < NOW() - INTERVAL '5 minutes'
    )
    INSERT INTO api_rate_limits(bucket_key,request_count,expires_at)
    VALUES($1,1,to_timestamp($2::double precision / 1000.0))
    ON CONFLICT (bucket_key) DO UPDATE
      SET request_count=api_rate_limits.request_count+1
    RETURNING request_count
  `, [key, resetAt])
  checkRateLimit(result.rows[0]?.request_count, max, now, resetAt)
}

export async function guardApi(
  req: NextRequest,
  options: { roles?: readonly UserRole[]; maxRequests?: number; windowMs?: number } = {},
) {
  enforceSameOrigin(req)
  const sessionUser = await requestSession(req)
  const max = options.maxRequests ?? 10
  const { now, resetAt, key } = rateLimitWindow(req, options.windowMs ?? 60_000)
  const result = await queryDb<AccountState & { request_count: number }>(`
    WITH cleanup AS (
      DELETE FROM api_rate_limits WHERE expires_at < NOW() - INTERVAL '5 minutes'
    ), rate AS (
      INSERT INTO api_rate_limits(bucket_key,request_count,expires_at)
      VALUES($1,1,to_timestamp($2::double precision / 1000.0))
      ON CONFLICT (bucket_key) DO UPDATE
        SET request_count=api_rate_limits.request_count+1
      RETURNING request_count
    ), account AS (
      SELECT p.email,p.role,p.approval_status,u.session_version
      FROM profiles p JOIN app_users u ON u.id=p.id
      WHERE p.id=$3::uuid LIMIT 1
    )
    SELECT account.email,account.role,account.approval_status,account.session_version,
           rate.request_count,
           COALESCE((SELECT (value_json->>'maintenance')::boolean
                     FROM system_settings WHERE setting_key='general' LIMIT 1),FALSE) AS maintenance_enabled
    FROM rate LEFT JOIN account ON TRUE
  `, [key, resetAt, sessionUser.id])
  const account = result.rows[0]
  checkRateLimit(account?.request_count, max, now, resetAt)
  return authorizeAccount(sessionUser, account, options.roles)
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status, headers: error.headers },
    )
  }

  console.error('Unexpected API guard error:', error)
  return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 })
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
