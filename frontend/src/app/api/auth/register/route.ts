import { hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { withTransaction } from '@/lib/db'
import { createSessionToken, setSessionCookie, type SessionRole } from '@/lib/session'
import { apiErrorResponse, enforceRateLimit, ApiError } from '../../_lib/auth'
import { passwordPolicyError } from '@/lib/passwordPolicy'

type InviteRow = {
  short_code: string
  class_id: string | null
  teacher_id: string | null
  school_name: string | null
  expires_at: Date | null
  max_uses: number
  use_count: number
  revoked_at: Date | null
}

export async function POST(request: NextRequest) {
  try {
    await enforceRateLimit(request, 5, 60_000)
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const submittedSchool = typeof body.school === 'string' ? body.school.trim() : ''
    const requestedRole: SessionRole = body.requestedRole === 'teacher' ? 'teacher' : 'student'
    const inviteCode = requestedRole === 'student' && typeof body.inviteCode === 'string'
      ? body.inviteCode.trim().toUpperCase()
      : ''

    if (!name || !submittedSchool || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new ApiError('กรุณากรอกชื่อ สถานศึกษา และอีเมลให้ถูกต้อง', 400, 'INVALID_INPUT')
    }
    const passwordError = passwordPolicyError(password)
    if (passwordError) throw new ApiError(passwordError, 400, 'WEAK_PASSWORD')
    if (inviteCode && !/^[A-Z0-9]{6,12}$/.test(inviteCode)) {
      throw new ApiError('รหัสเชิญไม่ถูกต้อง', 400, 'INVALID_INVITE')
    }

    const passwordHash = await hash(password, 12)
    const approvalStatus = requestedRole === 'teacher' ? 'pending' : 'active'
    const profile = await withTransaction(async client => {
      let invite: InviteRow | null = null
      if (inviteCode) {
        const inviteResult = await client.query<InviteRow>(`
          SELECT ci.short_code,
                 COALESCE(ci.class_id, legacy_class.id) AS class_id,
                 COALESCE(ci.created_by, legacy_class.teacher_id) AS teacher_id,
                 COALESCE(ci.school_name, school.name) AS school_name,
                 ci.expires_at, ci.max_uses, ci.use_count, ci.revoked_at
          FROM class_invites ci
          LEFT JOIN LATERAL (
            SELECT c.id, c.teacher_id, c.school_id
            FROM classes c
            LEFT JOIN profiles teacher ON teacher.id=c.teacher_id
            WHERE c.name=ci.target_class
              AND (ci.teacher_name IS NULL OR teacher.name=ci.teacher_name)
            ORDER BY c.created_at DESC LIMIT 1
          ) legacy_class ON TRUE
          LEFT JOIN schools school ON school.id=legacy_class.school_id
          WHERE ci.short_code=$1
          FOR UPDATE OF ci
        `, [inviteCode])
        invite = inviteResult.rows[0] || null
        const expired = invite?.expires_at && new Date(invite.expires_at).getTime() <= Date.now()
        if (!invite || !invite.class_id || invite.revoked_at || expired || invite.use_count >= invite.max_uses) {
          throw new ApiError('รหัสเชิญไม่ถูกต้อง หมดอายุ หรือถูกใช้งานครบแล้ว', 400, 'INVALID_INVITE')
        }
      }

      const schoolName = invite?.school_name?.trim() || submittedSchool
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

      if (requestedRole === 'teacher') {
        await client.query(`
          INSERT INTO notifications(user_id,title,message,type,link_url)
          SELECT id,'มีคำขอบัญชีครูใหม่',$1,'teacher','/admin/users?tab=pending'
          FROM profiles
          WHERE role='developer' AND approval_status='active'
        `, [`${name} (${email}) รอการอนุมัติ`])
      }

      if (invite?.class_id) {
        await client.query(`
          INSERT INTO class_students (class_id, student_id)
          VALUES ($1::uuid,$2::uuid)
          ON CONFLICT (class_id,student_id) DO NOTHING
        `, [invite.class_id, user.rows[0].id])
        await client.query('UPDATE class_invites SET use_count=use_count+1 WHERE short_code=$1', [invite.short_code])
        await client.query(`
          INSERT INTO notifications (user_id,title,message,type,link_url)
          VALUES ($1::uuid,'เข้าร่วมชั้นเรียนสำเร็จ','บัญชีของคุณถูกเพิ่มเข้าชั้นเรียนแล้ว','success','/student/dashboard')
        `, [user.rows[0].id])
        if (invite.teacher_id) {
          await client.query(`
            INSERT INTO notifications (user_id,title,message,type,link_url)
            VALUES ($1::uuid,'มีนักเรียนเข้าร่วมชั้นเรียน',$2,'student','/teacher/students')
          `, [invite.teacher_id, name])
        }
      }

      return created.rows[0] as Record<string, unknown> & { id: string; email: string; role: SessionRole }
    })

    if (approvalStatus === 'pending') {
      return NextResponse.json({ user: { id: profile.id, email }, profile, session: null }, { status: 201 })
    }

    const token = await createSessionToken({ id: profile.id, email: profile.email, role: profile.role, sessionVersion: 1 })
    const response = NextResponse.json({
      user: { id: profile.id, email },
      profile,
      session: { user: { id: profile.id, email } },
    }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
    setSessionCookie(response, token)
    return response
  } catch (error) {
    const dbError = error as Error & { code?: string }
    if (dbError.code === '23505') {
      return NextResponse.json({ error: 'อีเมลนี้ถูกลงทะเบียนแล้ว', code: 'EMAIL_EXISTS' }, { status: 409 })
    }
    return apiErrorResponse(error)
  }
}
