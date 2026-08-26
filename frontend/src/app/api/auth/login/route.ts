import { compare } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { createSessionToken, setSessionCookie, type SessionRole } from '@/lib/session'

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
  created_at: string
}

export async function POST(request: NextRequest) {
  try {
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
      SELECT u.id, u.email, u.password_hash, p.name, p.role, p.requested_role,
             p.approval_status, p.avatar_url, p.school_id, p.school_name,
             p.phone, p.bio, p.created_at
      FROM app_users u
      JOIN profiles p ON p.id = u.id
      WHERE u.email = $1
      LIMIT 1
    `, [email])
    const account = result.rows[0]
    if (!account || !(await compare(password, account.password_hash))) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 })
    }
    if (account.approval_status === 'pending') {
      return NextResponse.json({ error: 'Account pending approval' }, { status: 403 })
    }
    if (account.approval_status !== 'active') {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }
    if (account.role !== selectedRole) {
      return NextResponse.json({ error: 'Account role mismatch' }, { status: 403 })
    }

    const token = await createSessionToken({ id: account.id, email: account.email, role: account.role })
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
      created_at: account.created_at,
    }
    const response = NextResponse.json({
      user: { id: account.id, email: account.email },
      profile,
      access_token: token,
    })
    setSessionCookie(response, token)
    return response
  } catch (error) {
    console.error('Local login failed:', error)
    return NextResponse.json({ error: 'Authentication service is unavailable' }, { status: 500 })
  }
}
