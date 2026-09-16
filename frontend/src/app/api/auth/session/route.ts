import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import {
  clearSessionCookie,
  getRequestSessionToken,
  verifySessionToken,
  type SessionRole,
} from '@/lib/session'

type ActiveProfile = {
  id: string
  email: string
  name: string
  role: SessionRole
  requested_role: SessionRole
  approval_status: 'pending' | 'active' | 'inactive'
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

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
}

export async function GET(request: NextRequest) {
  let isTokenInvalid = false
  try {
    const token = getRequestSessionToken(request)
    if (!token) {
      return NextResponse.json({ session: null }, { headers: NO_CACHE_HEADERS })
    }

    let sessionUser: Awaited<ReturnType<typeof verifySessionToken>>
    try {
      sessionUser = await verifySessionToken(token)
    } catch (tokenErr) {
      isTokenInvalid = true
      throw tokenErr
    }

    const result = await queryDb<ActiveProfile>(`
      SELECT p.id, p.email, p.name, p.role, p.requested_role, p.approval_status, p.avatar_url,
             p.school_id, p.school_name, p.phone, p.bio,
             COALESCE(p.pdpa_consent, FALSE) AS pdpa_consent,
             p.pdpa_consent_at,
             COALESCE(p.pdpa_consent_version, '1.0') AS pdpa_consent_version,
             p.created_at, u.session_version
      FROM profiles p JOIN app_users u ON u.id=p.id
      WHERE p.id = $1::uuid
      LIMIT 1
    `, [sessionUser.id])

    const profile = result.rows[0]
    if (!profile || profile.approval_status !== 'active' || profile.role !== sessionUser.role || profile.session_version !== sessionUser.sessionVersion) {
      const response = NextResponse.json({ session: null }, { status: 401, headers: NO_CACHE_HEADERS })
      clearSessionCookie(response)
      return response
    }

    return NextResponse.json({
      session: {
        user: { id: profile.id, email: profile.email },
      },
      profile,
    }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('[GET /api/auth/session] error:', error)
    const response = NextResponse.json({ session: null }, { status: 401, headers: NO_CACHE_HEADERS })
    if (isTokenInvalid) {
      clearSessionCookie(response)
    }
    return response
  }
}
