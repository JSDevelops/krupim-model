import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/db'
import { getRequestSessionToken, verifySessionToken } from '@/lib/session'

export type UserRole = 'developer' | 'teacher' | 'student'

export type AuthUser = {
  id: string
  email: string
  role: UserRole
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

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: readonly UserRole[],
): Promise<AuthUser> {
  const token = getRequestSessionToken(req)
  if (!token) throw new ApiError('Authentication required', 401, 'UNAUTHORIZED')

  let sessionUser
  try {
    sessionUser = await verifySessionToken(token)
  } catch {
    throw new ApiError('Invalid or expired session', 401, 'UNAUTHORIZED')
  }

  const { data: profile, error: profileError } = await localDb
    .from('profiles')
    .select('email, role, approval_status')
    .eq('id', sessionUser.id)
    .single()

  if (profileError || !profile) {
    throw new ApiError('User profile not found', 403, 'PROFILE_REQUIRED')
  }

  if (profile.approval_status && profile.approval_status !== 'active') {
    throw new ApiError('Account is not active', 403, 'ACCOUNT_INACTIVE')
  }

  const role = profile.role as UserRole
  if (role !== sessionUser.role || profile.email !== sessionUser.email) {
    throw new ApiError('Session no longer matches this account', 401, 'UNAUTHORIZED')
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new ApiError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  return { id: sessionUser.id, email: sessionUser.email, role }
}

type RateLimitEntry = { count: number; resetAt: number }
const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export function enforceRateLimit(req: NextRequest, max = 10, windowMs = 60_000) {
  const now = Date.now()
  if (rateLimitStore.size > 2_000) {
    for (const [storedKey, entry] of rateLimitStore) {
      if (entry.resetAt <= now) rateLimitStore.delete(storedKey)
    }
  }
  const key = `${getClientIp(req)}:${req.nextUrl.pathname}`
  const current = rateLimitStore.get(key)

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  current.count += 1
  if (current.count > max) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    throw new ApiError('Too many requests', 429, 'RATE_LIMITED', { 'Retry-After': String(retryAfter) })
  }
}

export async function guardApi(
  req: NextRequest,
  options: { roles?: readonly UserRole[]; maxRequests?: number; windowMs?: number } = {},
) {
  enforceRateLimit(req, options.maxRequests ?? 10, options.windowMs ?? 60_000)
  return requireAuth(req, options.roles)
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
