import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi, ApiError } from '../../_lib/auth'

const developerOnly = ['developer'] as const
const contentTypes = ['AR Object', 'AI Scan', 'Simulation', 'Lesson'] as const
const contentStatuses = ['published', 'draft'] as const

type ContentType = (typeof contentTypes)[number]
type ContentStatus = (typeof contentStatuses)[number]

type ContentRow = {
  id: string
  content_type: ContentType
  name_th: string
  name_en: string
  unit_label: string
  status: ContentStatus
  created_at: string
  updated_at: string
}

function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && contentTypes.includes(value as ContentType)
}

function isContentStatus(value: unknown): value is ContentStatus {
  return typeof value === 'string' && contentStatuses.includes(value as ContentStatus)
}

function readContent(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const nameEn = typeof body.nameEn === 'string' ? body.nameEn.trim() : ''
  const unit = typeof body.unit === 'string' ? body.unit.trim() : ''
  const type = body.type
  const status = body.status

  if (!name || !nameEn || !unit || !isContentType(type) || !isContentStatus(status)) {
    throw new ApiError('กรุณากรอกชื่อ ประเภท หน่วยเรียน และสถานะให้ครบถ้วน', 400, 'INVALID_INPUT')
  }
  if (name.length > 200 || nameEn.length > 200 || unit.length > 80) {
    throw new ApiError('ข้อมูลบางช่องยาวเกินกว่าที่ระบบกำหนด', 400, 'INVALID_INPUT')
  }

  return { name, nameEn, unit, type, status }
}

function contentErrorResponse(error: unknown) {
  const dbError = error as Error & { code?: string }
  if (dbError.code === '23505') {
    return NextResponse.json({ error: 'มีเนื้อหาชื่อภาษาอังกฤษนี้อยู่ในประเภทเดียวกันแล้ว' }, { status: 409 })
  }
  return apiErrorResponse(error)
}

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 40 })
    const result = await queryDb<ContentRow>(`
      SELECT id, content_type, name_th, name_en, unit_label, status, created_at, updated_at
      FROM content_library
      ORDER BY updated_at DESC, created_at DESC
    `)
    return NextResponse.json({ items: result.rows })
  } catch (error) {
    return contentErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await guardApi(request, { roles: developerOnly, maxRequests: 20 })
    const body = await request.json() as Record<string, unknown>
    const content = readContent(body)
    const result = await queryDb<ContentRow>(`
      INSERT INTO content_library (content_type, name_th, name_en, unit_label, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, content_type, name_th, name_en, unit_label, status, created_at, updated_at
    `, [content.type, content.name, content.nameEn, content.unit, content.status, actor.id])
    return NextResponse.json({ item: result.rows[0] }, { status: 201 })
  } catch (error) {
    return contentErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 30 })
    const body = await request.json() as Record<string, unknown>
    const id = typeof body.id === 'string' ? body.id : ''
    const action = typeof body.action === 'string' ? body.action : 'update'
    if (!id) throw new ApiError('Content id is required', 400, 'INVALID_INPUT')

    let result
    if (action === 'toggle') {
      result = await queryDb<ContentRow>(`
        UPDATE content_library
        SET status = CASE WHEN status = 'published' THEN 'draft' ELSE 'published' END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, content_type, name_th, name_en, unit_label, status, created_at, updated_at
      `, [id])
    } else if (action === 'update') {
      const content = readContent(body)
      result = await queryDb<ContentRow>(`
        UPDATE content_library
        SET content_type = $1, name_th = $2, name_en = $3, unit_label = $4,
            status = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING id, content_type, name_th, name_en, unit_label, status, created_at, updated_at
      `, [content.type, content.name, content.nameEn, content.unit, content.status, id])
    } else {
      throw new ApiError('Unsupported action', 400, 'INVALID_INPUT')
    }

    if (result.rowCount !== 1) throw new ApiError('ไม่พบเนื้อหา', 404, 'NOT_FOUND')
    return NextResponse.json({ item: result.rows[0] })
  } catch (error) {
    return contentErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 15 })
    const id = request.nextUrl.searchParams.get('id') || ''
    if (!id) throw new ApiError('Content id is required', 400, 'INVALID_INPUT')
    const result = await queryDb('DELETE FROM content_library WHERE id = $1 RETURNING id', [id])
    if (result.rowCount !== 1) throw new ApiError('ไม่พบเนื้อหา', 404, 'NOT_FOUND')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return contentErrorResponse(error)
  }
}
