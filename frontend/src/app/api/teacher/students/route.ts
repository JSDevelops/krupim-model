import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi, type AuthUser } from '../../_lib/auth'

type StudentInput = {
  action?: unknown
  classId?: unknown
  fromClassId?: unknown
  toClassId?: unknown
  studentId?: unknown
  studentEmail?: unknown
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function text(value: unknown, label: string, max: number, required = false) {
  const result = typeof value === 'string' ? value.trim() : ''
  if (required && !result) throw new ApiError(`กรุณาระบุ${label}`, 400, 'VALIDATION_ERROR')
  if (result.length > max) throw new ApiError(`${label}ยาวเกิน ${max} ตัวอักษร`, 400, 'VALIDATION_ERROR')
  return result
}

function uuid(value: unknown, label: string) {
  const result = text(value, label, 80, true)
  if (!UUID_PATTERN.test(result)) throw new ApiError(`${label}ไม่ถูกต้อง`, 400, 'VALIDATION_ERROR')
  return result
}

async function payload(request: NextRequest) {
  try { return await request.json() as StudentInput } catch { throw new ApiError('รูปแบบข้อมูลไม่ถูกต้อง', 400, 'INVALID_JSON') }
}

function ownership(user: AuthUser, alias = 'c') {
  return user.role === 'developer' ? { clause: '', values: [] as unknown[] } : { clause: ` AND ${alias}.teacher_id=$2`, values: [user.id] as unknown[] }
}

async function requireOwnedClass(user: AuthUser, classId: string) {
  const scope = ownership(user)
  const result = await queryDb(`SELECT c.id FROM classes c WHERE c.id=$1::uuid${scope.clause} LIMIT 1`, [classId, ...scope.values])
  if (!result.rows[0]) throw new ApiError('ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์จัดการ', 404, 'CLASS_NOT_FOUND')
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 120 })
    const teacherFilter = user.role === 'developer' ? '' : 'WHERE c.teacher_id=$1'
    const values = user.role === 'developer' ? [] : [user.id]

    const [classResult, studentResult] = await Promise.all([
      queryDb(`
        SELECT c.id, c.name, c.year, c.semester, c.is_active AS "isActive",
               COUNT(cs.id)::int AS "studentCount"
        FROM classes c
        LEFT JOIN class_students cs ON cs.class_id=c.id
        ${teacherFilter}
        GROUP BY c.id
        ORDER BY c.is_active DESC, c.name ASC
        LIMIT 300
      `, values),
      queryDb(`
        WITH owned_classes AS (
          SELECT c.id, c.name FROM classes c ${teacherFilter}
        ), memberships AS (
          SELECT cs.student_id,
                 JSONB_AGG(JSONB_BUILD_OBJECT(
                   'classId', oc.id,
                   'className', oc.name,
                   'enrolledAt', cs.enrolled_at
                 ) ORDER BY oc.name) AS classrooms,
                 MIN(cs.enrolled_at) AS first_enrolled_at
          FROM class_students cs
          JOIN owned_classes oc ON oc.id=cs.class_id
          GROUP BY cs.student_id
        ), latest_analytics AS (
          SELECT DISTINCT ON (la.student_id)
                 la.student_id,
                 la.knowledge_score::float8 AS knowledge,
                 la.skills_score::float8 AS skills,
                 la.attitude_score::float8 AS attitude,
                 la.competency_score::float8 AS competency,
                 la.overall_score::float8 AS overall,
                 la.lessons_completed,
                 la.time_spent_minutes,
                 la.date::timestamptz AS last_activity
          FROM learning_analytics la
          JOIN memberships m ON m.student_id=la.student_id
          ORDER BY la.student_id, la.date DESC
        ), assessment_stats AS (
          SELECT sa.student_id,
                 ROUND(AVG(sa.knowledge_score))::int AS knowledge,
                 ROUND(AVG(sa.skills_score))::int AS skills,
                 ROUND(AVG(sa.attitude_score))::int AS attitude,
                 ROUND(AVG(sa.competency_score))::int AS competency,
                 ROUND(AVG(sa.score))::int AS overall,
                 MAX(sa.submitted_at) AS last_activity
          FROM student_assessments sa
          JOIN memberships m ON m.student_id=sa.student_id
          GROUP BY sa.student_id
        ), lesson_stats AS (
          SELECT lp.student_id,
                 COUNT(*) FILTER (WHERE lp.status='completed')::int AS completed,
                 COALESCE(SUM(lp.time_spent_minutes),0)::int AS minutes,
                 MAX(lp.updated_at) AS last_activity
          FROM lesson_progress lp
          JOIN memberships m ON m.student_id=lp.student_id
          GROUP BY lp.student_id
        ), simulation_stats AS (
          SELECT ss.student_id, COUNT(*)::int AS sessions, MAX(ss.completed_at) AS last_activity
          FROM simulation_sessions ss
          JOIN memberships m ON m.student_id=ss.student_id
          GROUP BY ss.student_id
        )
        SELECT p.id, p.name, p.email, p.avatar_url AS "avatarUrl",
               p.school_name AS "schoolName", p.approval_status AS status,
               m.classrooms, m.first_enrolled_at AS "firstEnrolledAt",
               COALESCE(la.knowledge, ast.knowledge, 0)::int AS knowledge,
               COALESCE(la.skills, ast.skills, 0)::int AS skills,
               COALESCE(la.attitude, ast.attitude, 0)::int AS attitude,
               COALESCE(la.competency, ast.competency, 0)::int AS competency,
               COALESCE(la.overall, ast.overall, 0)::int AS overall,
               COALESCE(la.lessons_completed, ls.completed, 0)::int AS "lessonsCompleted",
               COALESCE(la.time_spent_minutes, ls.minutes, 0)::int AS "timeSpentMinutes",
               COALESCE(ss.sessions, 0)::int AS sessions,
               GREATEST(la.last_activity, ast.last_activity, ls.last_activity, ss.last_activity) AS "lastActive"
        FROM memberships m
        JOIN profiles p ON p.id=m.student_id
        LEFT JOIN latest_analytics la ON la.student_id=p.id
        LEFT JOIN assessment_stats ast ON ast.student_id=p.id
        LEFT JOIN lesson_stats ls ON ls.student_id=p.id
        LEFT JOIN simulation_stats ss ON ss.student_id=p.id
        ORDER BY p.name ASC
        LIMIT 1000
      `, values),
    ])

    return NextResponse.json(
      { classrooms: classResult.rows, students: studentResult.rows },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) { return apiErrorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })
    const body = await payload(request)
    const classId = uuid(body.classId, 'ห้องเรียน')
    const email = text(body.studentEmail, 'อีเมลนักเรียน', 254, true).toLocaleLowerCase('en-US')
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError('รูปแบบอีเมลไม่ถูกต้อง', 400, 'VALIDATION_ERROR')
    await requireOwnedClass(user, classId)

    const student = await queryDb<{ id: string; name: string; email: string }>(`
      SELECT id, name, email FROM profiles
      WHERE email=$1 AND role='student' AND approval_status='active' LIMIT 1
    `, [email])
    if (!student.rows[0]) throw new ApiError('ไม่พบบัญชีนักเรียนที่เปิดใช้งานด้วยอีเมลนี้', 404, 'STUDENT_NOT_FOUND')
    const result = await queryDb(`
      INSERT INTO class_students (class_id, student_id) VALUES ($1::uuid,$2::uuid)
      ON CONFLICT (class_id, student_id) DO NOTHING RETURNING id
    `, [classId, student.rows[0].id])
    if (!result.rows[0]) throw new ApiError('นักเรียนอยู่ในห้องเรียนนี้แล้ว', 409, 'ALREADY_ENROLLED')
    return NextResponse.json({ student: student.rows[0] }, { status: 201 })
  } catch (error) { return apiErrorResponse(error) }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })
    const body = await payload(request)
    const action = text(body.action, 'การดำเนินการ', 40, true)
    if (action !== 'move_student') throw new ApiError('ไม่รองรับการดำเนินการนี้', 400, 'INVALID_ACTION')
    const studentId = uuid(body.studentId, 'นักเรียน')
    const fromClassId = uuid(body.fromClassId, 'ห้องเรียนเดิม')
    const toClassId = uuid(body.toClassId, 'ห้องเรียนใหม่')
    if (fromClassId === toClassId) throw new ApiError('กรุณาเลือกห้องเรียนใหม่ที่ต่างจากห้องเดิม', 400, 'SAME_CLASS')
    await Promise.all([requireOwnedClass(user, fromClassId), requireOwnedClass(user, toClassId)])

    await withTransaction(async client => {
      const source = await client.query('SELECT id FROM class_students WHERE class_id=$1::uuid AND student_id=$2::uuid FOR UPDATE', [fromClassId, studentId])
      if (!source.rows[0]) throw new ApiError('ไม่พบการลงทะเบียนในห้องเรียนเดิม', 404, 'MEMBERSHIP_NOT_FOUND')
      await client.query(`
        INSERT INTO class_students (class_id, student_id) VALUES ($1::uuid,$2::uuid)
        ON CONFLICT (class_id, student_id) DO NOTHING
      `, [toClassId, studentId])
      await client.query('DELETE FROM class_students WHERE class_id=$1::uuid AND student_id=$2::uuid', [fromClassId, studentId])
    })
    return NextResponse.json({ studentId, fromClassId, toClassId })
  } catch (error) { return apiErrorResponse(error) }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 50 })
    const classId = uuid(request.nextUrl.searchParams.get('classId'), 'ห้องเรียน')
    const studentId = uuid(request.nextUrl.searchParams.get('studentId'), 'นักเรียน')
    await requireOwnedClass(user, classId)
    const result = await queryDb('DELETE FROM class_students WHERE class_id=$1::uuid AND student_id=$2::uuid RETURNING id', [classId, studentId])
    if (!result.rows[0]) throw new ApiError('ไม่พบการลงทะเบียนของนักเรียนในห้องนี้', 404, 'MEMBERSHIP_NOT_FOUND')
    return NextResponse.json({ studentId, classId })
  } catch (error) { return apiErrorResponse(error) }
}
