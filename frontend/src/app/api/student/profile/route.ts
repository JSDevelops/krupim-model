import { compare, hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { clearSessionCookie } from '@/lib/session'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'
import { passwordPolicyError } from '@/lib/passwordPolicy'

type ProfileInput = {
  action?: unknown
  name?: unknown
  schoolName?: unknown
  phone?: unknown
  bio?: unknown
  avatarUrl?: unknown
  currentPassword?: unknown
  newPassword?: unknown
}

function text(value: unknown, label: string, max: number, required = false) {
  const result = typeof value === 'string' ? value.trim() : ''
  if (required && !result) throw new ApiError(`กรุณากรอก${label}`, 400, 'VALIDATION_ERROR')
  if (result.length > max) throw new ApiError(`${label}ยาวเกิน ${max} ตัวอักษร`, 400, 'VALIDATION_ERROR')
  return result
}

function avatar(value: unknown) {
  const result = typeof value === 'string' ? value.trim() : ''
  if (!result) return ''
  const remote = /^https?:\/\/\S+$/i.test(result) && result.length <= 2_000
  const local = /^\/api\/files\/[0-9a-f-]{36}$/i.test(result)
  const data = /^data:image\/(jpeg|png|webp);base64,/i.test(result) && result.length <= 850_000
  if (!remote && !local && !data) throw new ApiError('รูปโปรไฟล์ต้องเป็น JPEG, PNG, WebP หรือ URL ที่ถูกต้อง', 400, 'INVALID_AVATAR')
  return result
}

async function requestBody(request: NextRequest) {
  const length = Number(request.headers.get('content-length') || 0)
  if (length > 900_000) throw new ApiError('ข้อมูลรูปโปรไฟล์มีขนาดใหญ่เกินไป', 413, 'PAYLOAD_TOO_LARGE')
  try { return await request.json() as ProfileInput } catch { throw new ApiError('รูปแบบข้อมูลไม่ถูกต้อง', 400, 'INVALID_JSON') }
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student', 'developer'], maxRequests: 120 })
    const [profileResult, analyticsResult, taskResult] = await Promise.all([
      queryDb(`
        SELECT id, name, email, role, approval_status AS status, avatar_url AS "avatarUrl",
               school_id AS "schoolId", school_name AS "schoolName", phone, bio,
               created_at AS "createdAt", updated_at AS "updatedAt"
        FROM profiles WHERE id=$1::uuid LIMIT 1
      `, [user.id]),
      queryDb(`
        SELECT
          COALESCE(ROUND(AVG(knowledge_score)),0)::int AS "knowledgeScore",
          COALESCE(ROUND(AVG(skills_score)),0)::int AS "skillsScore",
          COALESCE(ROUND(AVG(attitude_score)),0)::int AS "attitudeScore",
          COALESCE(ROUND(AVG(competency_score)),0)::int AS "competencyScore",
          COALESCE(ROUND(AVG(overall_score)),0)::int AS "overallScore",
          COALESCE(SUM(lessons_completed),0)::int AS "lessonsCompleted",
          COALESCE(SUM(time_spent_minutes),0)::int AS "timeSpentMinutes",
          (SELECT COUNT(*)::int FROM simulation_sessions WHERE student_id=$1::uuid)
            + (SELECT COUNT(*)::int FROM chat_sessions WHERE student_id=$1::uuid) AS sessions
        FROM learning_analytics WHERE student_id=$1::uuid
      `, [user.id]),
      queryDb(`
        SELECT a.id, a.title, a.description, a.activity_type AS "activityType",
               a.due_date AS "dueDate", a.max_score AS "maxScore", c.name AS "className",
               CASE WHEN s.id IS NULL THEN 'pending' ELSE 'submitted' END AS status,
               s.score, s.feedback, s.submitted_at AS "submittedAt"
        FROM assignments a
        JOIN classes c ON c.id=a.class_id
        JOIN class_students cs ON cs.class_id=c.id AND cs.student_id=$1::uuid
        LEFT JOIN assignment_submissions s ON s.assignment_id=a.id AND s.student_id=$1::uuid
        ORDER BY (s.id IS NULL) DESC, a.due_date ASC NULLS LAST, a.created_at DESC
        LIMIT 120
      `, [user.id]),
    ])
    if (!profileResult.rows[0]) throw new ApiError('ไม่พบข้อมูลโปรไฟล์', 404, 'NOT_FOUND')
    return NextResponse.json(
      { profile: profileResult.rows[0], stats: analyticsResult.rows[0], tasks: taskResult.rows },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) { return apiErrorResponse(error) }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student', 'developer'], maxRequests: 30 })
    const payload = await requestBody(request)
    const action = typeof payload.action === 'string' ? payload.action : 'update_profile'

    if (action === 'change_password') {
      const currentPassword = typeof payload.currentPassword === 'string' ? payload.currentPassword : ''
      const newPassword = typeof payload.newPassword === 'string' ? payload.newPassword : ''
      if (!currentPassword) throw new ApiError('กรุณากรอกรหัสผ่านปัจจุบัน', 400, 'VALIDATION_ERROR')
      const passwordError = passwordPolicyError(newPassword)
      if (passwordError) throw new ApiError(passwordError, 400, 'WEAK_PASSWORD')
      if (currentPassword === newPassword) throw new ApiError('รหัสผ่านใหม่ต้องต่างจากรหัสผ่านปัจจุบัน', 400, 'SAME_PASSWORD')
      const account = await queryDb<{ password_hash: string }>('SELECT password_hash FROM app_users WHERE id=$1::uuid LIMIT 1', [user.id])
      if (!account.rows[0] || !(await compare(currentPassword, account.rows[0].password_hash))) throw new ApiError('รหัสผ่านปัจจุบันไม่ถูกต้อง', 400, 'INVALID_PASSWORD')
      const passwordHash = await hash(newPassword, 12)
      await withTransaction(async client => {
        await client.query('UPDATE app_users SET password_hash=$1,session_version=session_version+1,updated_at=NOW() WHERE id=$2::uuid', [passwordHash, user.id])
        await client.query(`INSERT INTO audit_logs(actor_id,action,entity_type,entity_id) VALUES($1::uuid,'change_password','profile',$1::text)`, [user.id])
      })
      const response = NextResponse.json({ ok: true, sessionRevoked: true })
      clearSessionCookie(response)
      return response
    }

    if (action !== 'update_profile') throw new ApiError('ไม่รองรับการดำเนินการนี้', 400, 'INVALID_ACTION')
    const name = text(payload.name, 'ชื่อ–นามสกุล', 160, true)
    const schoolName = text(payload.schoolName, 'สถานศึกษา', 240)
    const phone = text(payload.phone, 'หมายเลขโทรศัพท์', 40)
    const bio = text(payload.bio, 'ข้อมูลแนะนำตัว', 1_500)
    const avatarUrl = avatar(payload.avatarUrl)
    const profile = await withTransaction(async client => {
      let schoolId: string | null = null
      if (schoolName) {
        const school = await client.query<{ id: string }>(`
          INSERT INTO schools (name) VALUES ($1)
          ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id
        `, [schoolName])
        schoolId = school.rows[0].id
      }
      const result = await client.query(`
        UPDATE profiles SET name=$1, school_id=$2, school_name=$3, phone=$4, bio=$5,
                            avatar_url=$6, updated_at=NOW()
        WHERE id=$7::uuid
        RETURNING id, name, email, role, approval_status AS status, avatar_url AS "avatarUrl",
                  school_id AS "schoolId", school_name AS "schoolName", phone, bio,
                  created_at AS "createdAt", updated_at AS "updatedAt"
      `, [name, schoolId, schoolName || null, phone || null, bio || null, avatarUrl || null, user.id])
      return result.rows[0]
    })
    return NextResponse.json({ profile })
  } catch (error) { return apiErrorResponse(error) }
}
