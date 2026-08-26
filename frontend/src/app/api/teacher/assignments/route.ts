import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi, type AuthUser } from '../../_lib/auth'

const activityTypes = ['Familiarize', 'Interact', 'Navigate', 'Exhibit'] as const
type ActivityType = (typeof activityTypes)[number]
type AssignmentInput = {
  action?: unknown; id?: unknown; assignmentId?: unknown; studentId?: unknown
  title?: unknown; description?: unknown; classId?: unknown; activityType?: unknown
  dueDate?: unknown; maxScore?: unknown; score?: unknown; feedback?: unknown
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function text(value: unknown, label: string, max: number, required = false) {
  const result = typeof value === 'string' ? value.trim() : ''
  if (required && !result) throw new ApiError(`กรุณากรอก${label}`, 400, 'VALIDATION_ERROR')
  if (result.length > max) throw new ApiError(`${label}ยาวเกิน ${max} ตัวอักษร`, 400, 'VALIDATION_ERROR')
  return result
}
function uuid(value: unknown, label: string) {
  const result = text(value, label, 80, true)
  if (!UUID_PATTERN.test(result)) throw new ApiError(`${label}ไม่ถูกต้อง`, 400, 'VALIDATION_ERROR')
  return result
}
function integer(value: unknown, label: string, min: number, max: number) {
  const result = Number(value)
  if (!Number.isInteger(result) || result < min || result > max) throw new ApiError(`${label}ต้องเป็นตัวเลข ${min}–${max}`, 400, 'VALIDATION_ERROR')
  return result
}
function date(value: unknown) {
  const input = text(value, 'กำหนดส่ง', 80, true)
  const result = new Date(input)
  if (Number.isNaN(result.getTime())) throw new ApiError('กำหนดส่งไม่ถูกต้อง', 400, 'VALIDATION_ERROR')
  return result.toISOString()
}
function activity(value: unknown): ActivityType {
  if (typeof value !== 'string' || !activityTypes.includes(value as ActivityType)) throw new ApiError('ประเภทกิจกรรมไม่ถูกต้อง', 400, 'VALIDATION_ERROR')
  return value as ActivityType
}
function normalize(body: AssignmentInput) {
  return {
    title: text(body.title, 'ชื่อกิจกรรม', 240, true),
    description: text(body.description, 'รายละเอียด', 4_000),
    classId: uuid(body.classId, 'ห้องเรียน'),
    activityType: activity(body.activityType),
    dueDate: date(body.dueDate),
    maxScore: integer(body.maxScore, 'คะแนนเต็ม', 1, 1_000),
  }
}
async function requestBody(request: NextRequest) {
  try { return await request.json() as AssignmentInput } catch { throw new ApiError('รูปแบบข้อมูลไม่ถูกต้อง', 400, 'INVALID_JSON') }
}
function teacherScope(user: AuthUser, alias: string, index: number) { return user.role === 'developer' ? '' : ` AND ${alias}.teacher_id=$${index}` }
async function requireClass(user: AuthUser, classId: string) {
  const values: unknown[] = [classId]
  if (user.role !== 'developer') values.push(user.id)
  const result = await queryDb(`SELECT c.id FROM classes c WHERE c.id=$1::uuid${teacherScope(user, 'c', 2)} LIMIT 1`, values)
  if (!result.rows[0]) throw new ApiError('ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์จัดการ', 404, 'CLASS_NOT_FOUND')
}
async function requireAssignment(user: AuthUser, assignmentId: string) {
  const values: unknown[] = [assignmentId]
  if (user.role !== 'developer') values.push(user.id)
  const result = await queryDb(`SELECT a.id, a.max_score FROM assignments a WHERE a.id=$1::uuid${teacherScope(user, 'a', 2)} LIMIT 1`, values)
  if (!result.rows[0]) throw new ApiError('ไม่พบงานหรือคุณไม่มีสิทธิ์จัดการ', 404, 'NOT_FOUND')
  return result.rows[0] as { id: string; max_score: number }
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 120 })
    const assignmentId = request.nextUrl.searchParams.get('id')?.trim()
    if (assignmentId) {
      const id = uuid(assignmentId, 'งาน')
      await requireAssignment(user, id)
      const [assignmentResult, submissionResult] = await Promise.all([
        queryDb(`
          SELECT a.id, a.title, a.description, a.activity_type AS "activityType",
                 a.due_date AS "dueDate", a.max_score AS "maxScore", a.created_at AS "createdAt",
                 a.updated_at AS "updatedAt", c.id AS "classId", c.name AS "className"
          FROM assignments a JOIN classes c ON c.id=a.class_id WHERE a.id=$1::uuid LIMIT 1
        `, [id]),
        queryDb(`
          SELECT p.id AS "studentId", p.name AS "studentName", p.email,
                 s.id AS "submissionId", CASE WHEN s.id IS NULL THEN 'pending' ELSE 'submitted' END AS status,
                 s.score, s.feedback, s.attachment_name AS "attachmentName", s.attachment_url AS "attachmentUrl",
                 s.submitted_at AS "submittedAt", s.graded_at AS "gradedAt"
          FROM assignments a
          JOIN class_students cs ON cs.class_id=a.class_id
          JOIN profiles p ON p.id=cs.student_id
          LEFT JOIN assignment_submissions s ON s.assignment_id=a.id AND s.student_id=p.id
          WHERE a.id=$1::uuid ORDER BY (s.id IS NOT NULL) DESC, p.name ASC LIMIT 500
        `, [id]),
      ])
      return NextResponse.json({ assignment: assignmentResult.rows[0], submissions: submissionResult.rows }, { headers: { 'Cache-Control': 'private, no-store' } })
    }

    const values = user.role === 'developer' ? [] : [user.id]
    const where = user.role === 'developer' ? '' : 'WHERE a.teacher_id=$1'
    const classWhere = user.role === 'developer' ? '' : 'WHERE c.teacher_id=$1'
    const [assignmentResult, classResult] = await Promise.all([
      queryDb(`
        SELECT a.id, a.title, a.description, a.activity_type AS "activityType",
               a.due_date AS "dueDate", a.max_score AS "maxScore", a.created_at AS "createdAt",
               a.updated_at AS "updatedAt", c.id AS "classId", c.name AS "className",
               COUNT(DISTINCT cs.student_id)::int AS "studentCount",
               COUNT(DISTINCT s.student_id)::int AS "submittedCount",
               COUNT(DISTINCT s.student_id) FILTER (WHERE s.score IS NOT NULL)::int AS "gradedCount",
               COALESCE(ROUND(AVG((s.score::numeric / NULLIF(a.max_score,0)) * 100)),0)::int AS "averagePercent"
        FROM assignments a
        JOIN classes c ON c.id=a.class_id
        LEFT JOIN class_students cs ON cs.class_id=c.id
        LEFT JOIN assignment_submissions s ON s.assignment_id=a.id AND s.student_id=cs.student_id
        ${where}
        GROUP BY a.id, c.id
        ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC
        LIMIT 500
      `, values),
      queryDb(`
        SELECT c.id, c.name, c.year, c.semester, c.is_active AS "isActive", COUNT(cs.id)::int AS "studentCount"
        FROM classes c LEFT JOIN class_students cs ON cs.class_id=c.id
        ${classWhere} GROUP BY c.id ORDER BY c.is_active DESC, c.name ASC LIMIT 300
      `, values),
    ])
    return NextResponse.json({ assignments: assignmentResult.rows, classrooms: classResult.rows }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return apiErrorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 50 })
    const item = normalize(await requestBody(request))
    await requireClass(user, item.classId)
    const result = await queryDb(`
      INSERT INTO assignments (class_id, teacher_id, title, description, activity_type, due_date, max_score)
      VALUES ($1::uuid,$2::uuid,$3,$4,$5,$6,$7)
      RETURNING id, title, description, activity_type AS "activityType", due_date AS "dueDate",
                max_score AS "maxScore", created_at AS "createdAt", updated_at AS "updatedAt"
    `, [item.classId, user.id, item.title, item.description, item.activityType, item.dueDate, item.maxScore])
    return NextResponse.json({ assignment: { ...result.rows[0], classId: item.classId } }, { status: 201 })
  } catch (error) { return apiErrorResponse(error) }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 70 })
    const body = await requestBody(request)
    const action = typeof body.action === 'string' ? body.action : 'update_assignment'
    if (action === 'grade_submission') {
      const assignmentId = uuid(body.assignmentId, 'งาน')
      const studentId = uuid(body.studentId, 'นักเรียน')
      const assignment = await requireAssignment(user, assignmentId)
      const score = integer(body.score, 'คะแนน', 0, assignment.max_score)
      const feedback = text(body.feedback, 'ข้อเสนอแนะ', 2_000)
      const result = await queryDb(`
        UPDATE assignment_submissions SET score=$1, feedback=$2, graded_at=NOW()
        WHERE assignment_id=$3::uuid AND student_id=$4::uuid
        RETURNING id, score, feedback, graded_at AS "gradedAt"
      `, [score, feedback, assignmentId, studentId])
      if (!result.rows[0]) throw new ApiError('นักเรียนยังไม่ได้ส่งงาน จึงยังให้คะแนนไม่ได้', 409, 'NOT_SUBMITTED')
      return NextResponse.json({ submission: result.rows[0] })
    }

    const id = uuid(body.id, 'งาน')
    await requireAssignment(user, id)
    const item = normalize(body)
    await requireClass(user, item.classId)
    const values: unknown[] = [item.classId, item.title, item.description, item.activityType, item.dueDate, item.maxScore, id]
    if (user.role !== 'developer') values.push(user.id)
    const result = await queryDb(`
      UPDATE assignments a SET class_id=$1::uuid, title=$2, description=$3, activity_type=$4,
             due_date=$5, max_score=$6, updated_at=NOW()
      WHERE a.id=$7::uuid${teacherScope(user, 'a', 8)}
      RETURNING id, title, description, activity_type AS "activityType", due_date AS "dueDate",
                max_score AS "maxScore", created_at AS "createdAt", updated_at AS "updatedAt"
    `, values)
    if (!result.rows[0]) throw new ApiError('ไม่พบงานหรือคุณไม่มีสิทธิ์แก้ไข', 404, 'NOT_FOUND')
    return NextResponse.json({ assignment: { ...result.rows[0], classId: item.classId } })
  } catch (error) { return apiErrorResponse(error) }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 40 })
    const id = uuid(request.nextUrl.searchParams.get('id'), 'งาน')
    const values: unknown[] = [id]
    if (user.role !== 'developer') values.push(user.id)
    const result = await queryDb(`DELETE FROM assignments a WHERE a.id=$1::uuid${teacherScope(user, 'a', 2)} RETURNING id`, values)
    if (!result.rows[0]) throw new ApiError('ไม่พบงานหรือคุณไม่มีสิทธิ์ลบ', 404, 'NOT_FOUND')
    return NextResponse.json({ deletedId: id })
  } catch (error) { return apiErrorResponse(error) }
}
