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
}

export async function GET(request: NextRequest) {
  try {
    const token = getRequestSessionToken(request)
    if (!token) return NextResponse.json({ session: null })
    const sessionUser = await verifySessionToken(token)
    const result = await queryDb<ActiveProfile>(`
      SELECT id, email, name, role, requested_role, approval_status, avatar_url,
             school_id, school_name, phone, bio, created_at
      FROM profiles
      WHERE id = $1
      LIMIT 1
    `, [sessionUser.id])
    const profile = result.rows[0]
    if (!profile || profile.approval_status !== 'active' || profile.role !== sessionUser.role) {
      const response = NextResponse.json({ session: null }, { status: 401 })
      clearSessionCookie(response)
      return response
    }
    return NextResponse.json({
      session: {
        access_token: token,
        user: { id: profile.id, email: profile.email },
      },
      profile,
    })
  } catch {
    const response = NextResponse.json({ session: null }, { status: 401 })
    clearSessionCookie(response)
    return response
  }
}

