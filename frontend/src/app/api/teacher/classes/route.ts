import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi, type AuthUser } from '../../_lib/auth'

type ClassInput = {
  action?: unknown
  id?: unknown
  name?: unknown
  description?: unknown
  year?: unknown
  semester?: unknown
  classId?: unknown
  studentEmail?: unknown
  emails?: unknown
}

function text(value: unknown, label: string, max: number, required = false) {
  const result = typeof value === 'string' ? value.trim() : ''
  if (required && !result) throw new ApiError(`กรุณากรอก${label}`, 400, 'VALIDATION_ERROR')
  if (result.length > max) throw new ApiError(`${label}ยาวเกิน ${max} ตัวอักษร`, 400, 'VALIDATION_ERROR')
  return result
}

function numberValue(value: unknown, label: string, min: number, max: number) {
  const result = Number(value)
  if (!Number.isInteger(result) || result < min || result > max) throw new ApiError(`${label}ไม่ถูกต้อง`, 400, 'VALIDATION_ERROR')
  return result
}

function normalizeClass(body: ClassInput) {
  return {
    name: text(body.name, 'ชื่อห้องเรียน', 160, true),
    description: text(body.description, 'รายละเอียด', 1_000),
    year: numberValue(body.year, 'ปีการศึกษา', 2000, 3000),
    semester: numberValue(body.semester, 'ภาคเรียน', 1, 3),
  }
}

async function body(request: NextRequest) {
  try { return await request.json() as ClassInput } catch { throw new ApiError('รูปแบบข้อมูลไม่ถูกต้อง', 400, 'INVALID_JSON') }
}

async function ownedClass(user: AuthUser, classId: string) {
  const values: unknown[] = [classId]
  const ownership = user.role === 'developer' ? '' : ' AND teacher_id=$2'
  if (user.role !== 'developer') values.push(user.id)
  const result = await queryDb('SELECT id FROM classes WHERE id=$1::uuid' + ownership + ' LIMIT 1', values)
  if (!result.rows[0]) throw new ApiError('ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์จัดการ', 404, 'NOT_FOUND')
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 120 })
    const classId = request.nextUrl.searchParams.get('classId')?.trim()
    if (classId) {
      await ownedClass(user, classId)
      const classResult = await queryDb(`
        SELECT c.id, c.name, c.description, c.year, c.semester, c.is_active AS "isActive",
               c.created_at AS "createdAt", p.name AS "teacherName"
        FROM classes c LEFT JOIN profiles p ON p.id=c.teacher_id WHERE c.id=$1::uuid LIMIT 1
      `, [classId])
      const studentResult = await queryDb(`
        SELECT p.id, p.name, p.email, p.school_name AS "schoolName", p.approval_status AS status,
               cs.enrolled_at AS "enrolledAt"
        FROM class_students cs JOIN profiles p ON p.id=cs.student_id
        WHERE cs.class_id=$1::uuid ORDER BY p.name ASC LIMIT 500
      `, [classId])
      return NextResponse.json({ classroom: classResult.rows[0], students: studentResult.rows }, { headers: { 'Cache-Control': 'private, no-store' } })
    }

    const values: unknown[] = []
    const where = user.role === 'developer' ? '' : 'WHERE c.teacher_id=$1'
    if (user.role !== 'developer') values.push(user.id)
    const result = await queryDb(`
      SELECT c.id, c.name, c.description, c.year, c.semester, c.is_active AS "isActive",
             c.created_at AS "createdAt", p.name AS "teacherName", COUNT(cs.id)::int AS "studentCount"
      FROM classes c
      LEFT JOIN profiles p ON p.id=c.teacher_id
      LEFT JOIN class_students cs ON cs.class_id=c.id
      ${where}
      GROUP BY c.id, p.name
      ORDER BY c.is_active DESC, c.created_at DESC
      LIMIT 300
    `, values)
    return NextResponse.json({ classrooms: result.rows }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return apiErrorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })
    const payload = await body(request)
    const action = text(payload.action, 'ประเภทการดำเนินการ', 40, true)

    if (action === 'create_class') {
      const item = normalizeClass(payload)
      const profile = await queryDb<{ school_id: string | null }>('SELECT school_id FROM profiles WHERE id=$1 LIMIT 1', [user.id])
      const result = await queryDb(`
        INSERT INTO classes (school_id, teacher_id, name, description, year, semester)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING id, name, description, year, semester, is_active AS "isActive", created_at AS "createdAt"
      `, [profile.rows[0]?.school_id || null, user.id, item.name, item.description, item.year, item.semester])
      return NextResponse.json({ classroom: { ...result.rows[0], studentCount: 0 } }, { status: 201 })
    }

    const classId = text(payload.classId, 'รหัสห้องเรียน', 80, true)
    await ownedClass(user, classId)

    if (action === 'add_student') {
      const email = text(payload.studentEmail, 'อีเมลนักเรียน', 254, true).toLocaleLowerCase('en-US')
      const student = await queryDb<{ id: string; name: string; email: string }>(`
        SELECT id, name, email FROM profiles
        WHERE email=$1 AND role='student' AND approval_status='active' LIMIT 1
      `, [email])
      if (!student.rows[0]) throw new ApiError('ไม่พบบัญชีนักเรียนที่เปิดใช้งานด้วยอีเมลนี้', 404, 'STUDENT_NOT_FOUND')
      const inserted = await queryDb(`
        INSERT INTO class_students (class_id, student_id) VALUES ($1::uuid,$2::uuid)
        ON CONFLICT (class_id, student_id) DO NOTHING RETURNING id
      `, [classId, student.rows[0].id])
      if (!inserted.rows[0]) throw new ApiError('นักเรียนอยู่ในห้องนี้แล้ว', 409, 'ALREADY_ENROLLED')
      return NextResponse.json({ student: student.rows[0] }, { status: 201 })
    }

    if (action === 'bulk_add') {
      const emails = Array.isArray(payload.emails)
        ? Array.from(new Set(payload.emails.filter((value): value is string => typeof value === 'string').map(value => value.trim().toLocaleLowerCase('en-US')).filter(Boolean))).slice(0, 100)
        : []
      if (!emails.length) throw new ApiError('กรุณาระบุอีเมลนักเรียนอย่างน้อย 1 รายการ', 400, 'VALIDATION_ERROR')
      const result = await withTransaction(async client => {
        const students = await client.query<{ id: string; email: string }>(`
          SELECT id, email FROM profiles WHERE email = ANY($1::citext[]) AND role='student' AND approval_status='active'
        `, [emails])
        let added = 0
        for (const student of students.rows) {
          const inserted = await client.query(`
            INSERT INTO class_students (class_id, student_id) VALUES ($1::uuid,$2::uuid)
            ON CONFLICT (class_id, student_id) DO NOTHING RETURNING id
          `, [classId, student.id])
          added += inserted.rowCount || 0
        }
        const found = new Set(students.rows.map(student => student.email.toLocaleLowerCase('en-US')))
        return { added, missing: emails.filter(email => !found.has(email)) }
      })
      return NextResponse.json(result, { status: 201 })
    }

    throw new ApiError('ไม่รองรับการดำเนินการนี้', 400, 'INVALID_ACTION')
  } catch (error) { return apiErrorResponse(error) }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })
    const payload = await body(request)
    const id = text(payload.id, 'รหัสห้องเรียน', 80, true)
    const item = normalizeClass(payload)
    const values: unknown[] = [item.name, item.description, item.year, item.semester, id]
    const ownership = user.role === 'developer' ? '' : ' AND teacher_id=$6'
    if (user.role !== 'developer') values.push(user.id)
    const result = await queryDb(`
      UPDATE classes SET name=$1, description=$2, year=$3, semester=$4
      WHERE id=$5::uuid${ownership}
      RETURNING id, name, description, year, semester, is_active AS "isActive", created_at AS "createdAt"
    `, values)
    if (!result.rows[0]) throw new ApiError('ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์แก้ไข', 404, 'NOT_FOUND')
    return NextResponse.json({ classroom: result.rows[0] })
  } catch (error) { return apiErrorResponse(error) }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 50 })
    const type = request.nextUrl.searchParams.get('type')
    const classId = request.nextUrl.searchParams.get('classId')?.trim() || ''
    if (!classId) throw new ApiError('กรุณาระบุห้องเรียน', 400, 'VALIDATION_ERROR')
    await ownedClass(user, classId)

    if (type === 'member') {
      const studentId = request.nextUrl.searchParams.get('studentId')?.trim()
      if (!studentId) throw new ApiError('กรุณาระบุนักเรียน', 400, 'VALIDATION_ERROR')
      const result = await queryDb('DELETE FROM class_students WHERE class_id=$1::uuid AND student_id=$2::uuid RETURNING id', [classId, studentId])
      if (!result.rows[0]) throw new ApiError('ไม่พบนักเรียนในห้องนี้', 404, 'NOT_FOUND')
      return NextResponse.json({ removedStudentId: studentId })
    }

    if (type === 'class') {
      const values: unknown[] = [classId]
      const ownership = user.role === 'developer' ? '' : ' AND teacher_id=$2'
      if (user.role !== 'developer') values.push(user.id)
      const result = await queryDb(`DELETE FROM classes WHERE id=$1::uuid${ownership} RETURNING id`, values)
      if (!result.rows[0]) throw new ApiError('ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์ลบ', 404, 'NOT_FOUND')
      return NextResponse.json({ deletedId: classId })
    }

    throw new ApiError('ไม่รองรับการดำเนินการนี้', 400, 'INVALID_ACTION')
  } catch (error) { return apiErrorResponse(error) }
}
