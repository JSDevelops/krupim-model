import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi, type AuthUser } from '../../_lib/auth'

type LessonInput = {
  title?: unknown
  subject?: unknown
  level?: unknown
  term?: unknown
  duration?: unknown
  targetClass?: unknown
  weeks?: unknown
  concept?: unknown
  objectivesK?: unknown
  objectivesS?: unknown
  objectivesA?: unknown
  objectivesAP?: unknown
  vocabulary?: unknown
  sentences?: unknown
  activitiesLead?: unknown
  activitiesF?: unknown
  activitiesI?: unknown
  activitiesN?: unknown
  activitiesE?: unknown
  activitiesWrap?: unknown
}

const detailSelect = `
  id, title, subject, level, term, duration, target_class AS "targetClass", weeks, concept,
  objectives_k AS "objectivesK", objectives_s AS "objectivesS", objectives_a AS "objectivesA",
  objectives_ap AS "objectivesAP", vocabulary, sentences,
  activities_lead AS "activitiesLead", activities_f AS "activitiesF",
  activities_i AS "activitiesI", activities_n AS "activitiesN",
  activities_e AS "activitiesE", activities_wrap AS "activitiesWrap",
  teacher_name AS "teacherName", teacher_email AS "teacherEmail",
  created_at AS "createdAt", updated_at AS "updatedAt"
`

function requiredText(value: unknown, label: string, max: number) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) throw new ApiError(`กรุณากรอก${label}`, 400, 'VALIDATION_ERROR')
  if (text.length > max) throw new ApiError(`${label}ยาวเกิน ${max} ตัวอักษร`, 400, 'VALIDATION_ERROR')
  return text
}

function optionalText(value: unknown, label: string, max: number) {
  if (value === null || value === undefined) return ''
  const text = typeof value === 'string' ? value.trim() : ''
  if (text.length > max) throw new ApiError(`${label}ยาวเกิน ${max} ตัวอักษร`, 400, 'VALIDATION_ERROR')
  return text
}

function textList(value: unknown, label: string) {
  if (!Array.isArray(value)) return []
  const items = value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 40)
  if (items.some(item => item.length > 600)) {
    throw new ApiError(`${label}แต่ละรายการต้องไม่เกิน 600 ตัวอักษร`, 400, 'VALIDATION_ERROR')
  }
  return items
}

function normalizeLesson(body: LessonInput) {
  return {
    title: requiredText(body.title, 'ชื่อแผนการสอน', 240),
    subject: optionalText(body.subject, 'รายวิชา', 300),
    level: optionalText(body.level, 'ระดับชั้น', 160),
    term: optionalText(body.term, 'ภาคเรียน', 120),
    duration: optionalText(body.duration, 'ระยะเวลา', 120),
    targetClass: optionalText(body.targetClass, 'ห้องเรียนเป้าหมาย', 120),
    weeks: optionalText(body.weeks, 'สัปดาห์', 120),
    concept: optionalText(body.concept, 'สาระสำคัญ', 5_000),
    objectivesK: textList(body.objectivesK, 'จุดประสงค์ด้านความรู้'),
    objectivesS: textList(body.objectivesS, 'จุดประสงค์ด้านทักษะ'),
    objectivesA: textList(body.objectivesA, 'จุดประสงค์ด้านคุณลักษณะ'),
    objectivesAP: textList(body.objectivesAP, 'จุดประสงค์ด้านการประยุกต์ใช้'),
    vocabulary: textList(body.vocabulary, 'คำศัพท์'),
    sentences: textList(body.sentences, 'ประโยคตัวอย่าง'),
    activitiesLead: optionalText(body.activitiesLead, 'ขั้นนำเข้าสู่บทเรียน', 5_000),
    activitiesF: optionalText(body.activitiesF, 'กิจกรรม Familiarize', 5_000),
    activitiesI: optionalText(body.activitiesI, 'กิจกรรม Interact', 5_000),
    activitiesN: optionalText(body.activitiesN, 'กิจกรรม Navigate', 5_000),
    activitiesE: optionalText(body.activitiesE, 'กิจกรรม Exhibit', 5_000),
    activitiesWrap: optionalText(body.activitiesWrap, 'ขั้นสรุป', 5_000),
  }
}

function ownership(user: AuthUser, parameterIndex: number) {
  return user.role === 'developer' ? '' : ` AND teacher_email = $${parameterIndex}`
}

function lessonValues(lesson: ReturnType<typeof normalizeLesson>) {
  return [
    lesson.title, lesson.subject, lesson.level, lesson.term, lesson.duration,
    lesson.targetClass, lesson.weeks, lesson.concept,
    JSON.stringify(lesson.objectivesK), JSON.stringify(lesson.objectivesS),
    JSON.stringify(lesson.objectivesA), JSON.stringify(lesson.objectivesAP),
    JSON.stringify(lesson.vocabulary), JSON.stringify(lesson.sentences),
    lesson.activitiesLead, lesson.activitiesF, lesson.activitiesI,
    lesson.activitiesN, lesson.activitiesE, lesson.activitiesWrap,
  ]
}

async function requestBody(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 120_000) throw new ApiError('ข้อมูลแผนการสอนมีขนาดใหญ่เกินไป', 413, 'PAYLOAD_TOO_LARGE')
  try {
    return await request.json() as LessonInput & { id?: unknown }
  } catch {
    throw new ApiError('รูปแบบข้อมูลไม่ถูกต้อง', 400, 'INVALID_JSON')
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 120 })
    const id = request.nextUrl.searchParams.get('id')?.trim()

    if (id) {
      const values: unknown[] = [id]
      if (user.role !== 'developer') values.push(user.email)
      const result = await queryDb(`SELECT ${detailSelect} FROM fine_lesson_plans WHERE id = $1${ownership(user, 2)} LIMIT 1`, values)
      if (!result.rows[0]) throw new ApiError('ไม่พบแผนการสอน', 404, 'NOT_FOUND')
      return NextResponse.json({ lesson: result.rows[0] }, { headers: { 'Cache-Control': 'private, no-store' } })
    }

    const values: unknown[] = []
    const where = user.role === 'developer' ? '' : 'WHERE teacher_email = $1'
    if (user.role !== 'developer') values.push(user.email)
    const result = await queryDb(`
      SELECT id, title, subject, level, term, duration, target_class AS "targetClass", weeks,
             teacher_name AS "teacherName", created_at AS "createdAt", updated_at AS "updatedAt",
             jsonb_array_length(objectives_k) + jsonb_array_length(objectives_s)
               + jsonb_array_length(objectives_a) + jsonb_array_length(objectives_ap) AS "objectiveCount",
             jsonb_array_length(vocabulary) AS "vocabularyCount",
             CASE WHEN concept <> '' AND activities_f <> '' AND activities_i <> ''
                       AND activities_n <> '' AND activities_e <> '' THEN true ELSE false END AS complete
      FROM fine_lesson_plans
      ${where}
      ORDER BY updated_at DESC
      LIMIT 300
    `, values)
    return NextResponse.json({ lessons: result.rows }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 40 })
    const lesson = normalizeLesson(await requestBody(request))
    const profile = await queryDb<{ name: string }>('SELECT name FROM profiles WHERE id = $1 LIMIT 1', [user.id])
    const id = `lesson-${randomUUID()}`
    const values = [id, ...lessonValues(lesson), profile.rows[0]?.name || user.email, user.email]
    const result = await queryDb(`
      INSERT INTO fine_lesson_plans (
        id, title, subject, level, term, duration, target_class, weeks, concept,
        objectives_k, objectives_s, objectives_a, objectives_ap, vocabulary, sentences,
        activities_lead, activities_f, activities_i, activities_n, activities_e, activities_wrap,
        teacher_name, teacher_email
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb,
        $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING ${detailSelect}
    `, values)
    return NextResponse.json({ lesson: result.rows[0] }, { status: 201 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })
    const body = await requestBody(request)
    const id = requiredText(body.id, 'รหัสแผนการสอน', 120)
    const lesson = normalizeLesson(body)
    const values: unknown[] = [...lessonValues(lesson), id]
    if (user.role !== 'developer') values.push(user.email)
    const result = await queryDb(`
      UPDATE fine_lesson_plans SET
        title = $1, subject = $2, level = $3, term = $4, duration = $5,
        target_class = $6, weeks = $7, concept = $8,
        objectives_k = $9::jsonb, objectives_s = $10::jsonb,
        objectives_a = $11::jsonb, objectives_ap = $12::jsonb,
        vocabulary = $13::jsonb, sentences = $14::jsonb,
        activities_lead = $15, activities_f = $16, activities_i = $17,
        activities_n = $18, activities_e = $19, activities_wrap = $20,
        updated_at = NOW()
      WHERE id = $21${ownership(user, 22)}
      RETURNING ${detailSelect}
    `, values)
    if (!result.rows[0]) throw new ApiError('ไม่พบแผนการสอนหรือคุณไม่มีสิทธิ์แก้ไข', 404, 'NOT_FOUND')
    return NextResponse.json({ lesson: result.rows[0] })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 40 })
    const id = request.nextUrl.searchParams.get('id')?.trim()
    if (!id) throw new ApiError('กรุณาระบุแผนการสอน', 400, 'VALIDATION_ERROR')
    const values: unknown[] = [id]
    if (user.role !== 'developer') values.push(user.email)
    const result = await queryDb(`DELETE FROM fine_lesson_plans WHERE id = $1${ownership(user, 2)} RETURNING id`, values)
    if (!result.rows[0]) throw new ApiError('ไม่พบแผนการสอนหรือคุณไม่มีสิทธิ์ลบ', 404, 'NOT_FOUND')
    return NextResponse.json({ deletedId: id })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
