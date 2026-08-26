import { hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { withTransaction } from '@/lib/db'
import { createSessionToken, setSessionCookie, type SessionRole } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const schoolName = typeof body.school === 'string' ? body.school.trim() : ''
    const requestedRole: SessionRole = body.requestedRole === 'teacher' ? 'teacher' : 'student'

    if (!name || !schoolName || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      return NextResponse.json(
        { error: 'Name, school, a valid email, and an 8-character password are required' },
        { status: 400 },
      )
    }

    const passwordHash = await hash(password, 12)
    const approvalStatus = requestedRole === 'teacher' ? 'pending' : 'active'
    const profile = await withTransaction(async client => {
      const school = await client.query<{ id: string }>(`
        INSERT INTO schools (name)
        VALUES ($1)
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [schoolName])
      const user = await client.query<{ id: string }>(`
        INSERT INTO app_users (email, password_hash)
        VALUES ($1, $2)
        RETURNING id
      `, [email, passwordHash])
      const created = await client.query(`
        INSERT INTO profiles (
          id, school_id, school_name, name, email, role, requested_role, approval_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
        RETURNING id, name, email, role, requested_role, approval_status,
                  avatar_url, school_id, school_name, phone, bio, created_at
      `, [user.rows[0].id, school.rows[0].id, schoolName, name, email, requestedRole, approvalStatus])
      return created.rows[0] as Record<string, unknown> & { id: string; email: string; role: SessionRole }
    })

    if (approvalStatus === 'pending') {
      return NextResponse.json({ user: { id: profile.id, email }, profile, session: null }, { status: 201 })
    }

    const token = await createSessionToken({ id: profile.id, email: profile.email, role: profile.role })
    const response = NextResponse.json({
      user: { id: profile.id, email },
      profile,
      session: { access_token: token, user: { id: profile.id, email } },
    }, { status: 201 })
    setSessionCookie(response, token)
    return response
  } catch (error) {
    const dbError = error as Error & { code?: string }
    if (dbError.code === '23505') {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    console.error('Local registration failed:', error)
    return NextResponse.json({ error: 'Unable to create account' }, { status: 500 })
  }
}

