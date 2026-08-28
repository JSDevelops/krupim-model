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
  created_at: string
  session_version: number
}

export async function GET(request: NextRequest) {
  try {
    const token = getRequestSessionToken(request)
    if (!token) return NextResponse.json({ session: null })
    const sessionUser = await verifySessionToken(token)
    const result = await queryDb<ActiveProfile>(`
      SELECT p.id, p.email, p.name, p.role, p.requested_role, p.approval_status, p.avatar_url,
             p.school_id, p.school_name, p.phone, p.bio, p.created_at, u.session_version
      FROM profiles p JOIN app_users u ON u.id=p.id
      WHERE p.id = $1
      LIMIT 1
    `, [sessionUser.id])
    const profile = result.rows[0]
    if (!profile || profile.approval_status !== 'active' || profile.role !== sessionUser.role || profile.session_version !== sessionUser.sessionVersion) {
      const response = NextResponse.json({ session: null }, { status: 401 })
      clearSessionCookie(response)
      return response
    }
    return NextResponse.json({
      session: {
        user: { id: profile.id, email: profile.email },
      },
      profile,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    const response = NextResponse.json({ session: null }, { status: 401 })
    clearSessionCookie(response)
    return response
  }
}
