import { compare } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { createSessionToken, setSessionCookie, type SessionRole } from '@/lib/session'
import { apiErrorResponse, enforceRateLimit } from '../../_lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
}

type LoginRow = {
  id: string
  email: string
  password_hash: string
  name: string
  role: SessionRole
  approval_status: 'pending' | 'active' | 'inactive'
  requested_role: SessionRole
  avatar_url: string | null
  school_id: string | null
  school_name: string | null
  phone: string | null
  bio: string | null
  pdpa_consent?: boolean
  pdpa_consent_at?: string | null
  pdpa_consent_version?: string | null
  created_at: string
  session_version: number
}

export async function POST(request: NextRequest) {
  try {
    await enforceRateLimit(request, 8, 60_000)
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const selectedRole = typeof body.selectedRole === 'string' ? body.selectedRole : ''
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    if (!['developer', 'teacher', 'student'].includes(selectedRole)) {
      return NextResponse.json({ error: 'A valid login role is required' }, { status: 400 })
    }

    const result = await queryDb<LoginRow>(`
      SELECT u.id, u.email, u.password_hash, u.session_version, p.name, p.role, p.requested_role,
             p.approval_status, p.avatar_url, p.school_id, p.school_name,
             p.phone, p.bio,
             COALESCE(p.pdpa_consent, FALSE) AS pdpa_consent,
             p.pdpa_consent_at,
             COALESCE(p.pdpa_consent_version, '1.0') AS pdpa_consent_version,
             p.created_at
      FROM app_users u
      JOIN profiles p ON p.id = u.id
      WHERE u.email = $1
      LIMIT 1
    `, [email])
    const account = result.rows[0]
    if (!account || !(await compare(password, account.password_hash))) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401, headers: NO_CACHE_HEADERS })
    }
    if (account.approval_status === 'pending') {
      return NextResponse.json({ error: 'Account pending approval' }, { status: 403, headers: NO_CACHE_HEADERS })
    }
    if (account.approval_status !== 'active') {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403, headers: NO_CACHE_HEADERS })
    }
    if (account.role !== selectedRole) {
      return NextResponse.json({ error: 'Account role mismatch' }, { status: 403, headers: NO_CACHE_HEADERS })
    }

    const token = await createSessionToken({ id: account.id, email: account.email, role: account.role, sessionVersion: account.session_version })
    const profile = {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      requested_role: account.requested_role,
      approval_status: account.approval_status,
      avatar_url: account.avatar_url,
      school_id: account.school_id,
      school_name: account.school_name,
      phone: account.phone,
      bio: account.bio,
      pdpa_consent: Boolean(account.pdpa_consent),
      pdpa_consent_at: account.pdpa_consent_at ?? null,
      pdpa_consent_version: account.pdpa_consent_version ?? '1.0',
      created_at: account.created_at,
    }
    const response = NextResponse.json({
      user: { id: account.id, email: account.email },
      profile,
    }, { headers: NO_CACHE_HEADERS })
    setSessionCookie(response, token)
    return response
  } catch (error) {
    console.error('Local login failed:', error)
    return apiErrorResponse(error)
  }
}
