import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi, type AuthUser } from '../../_lib/auth'

type ArInput = {
  id?: unknown
  nameEn?: unknown
  nameTh?: unknown
  pronounce?: unknown
  sentence?: unknown
  description?: unknown
  imageUrl?: unknown
  glbUrl?: unknown
  usdzUrl?: unknown
}

const selectFields = `
  id, name_en AS "nameEn", name_th AS "nameTh", pronounce, sentence, description,
  image_url AS "imageUrl", glb_url AS "glbUrl", usdz_url AS "usdzUrl",
  created_at AS "createdAt", updated_at AS "updatedAt"
`

function text(value: unknown, label: string, max: number, required = false) {
  const result = typeof value === 'string' ? value.trim() : ''
  if (required && !result) throw new ApiError(`กรุณากรอก${label}`, 400, 'VALIDATION_ERROR')
  if (result.length > max) throw new ApiError(`${label}ยาวเกิน ${max} ตัวอักษร`, 400, 'VALIDATION_ERROR')
  return result
}

function normalize(body: ArInput) {
  return {
    nameEn: text(body.nameEn, 'ชื่อภาษาอังกฤษ', 180, true),
    nameTh: text(body.nameTh, 'ชื่อภาษาไทย', 180, true),
    pronounce: text(body.pronounce, 'คำอ่าน', 180),
    sentence: text(body.sentence, 'ประโยคตัวอย่าง', 1_000),
    description: text(body.description, 'คำอธิบาย', 3_000),
    imageUrl: text(body.imageUrl, 'ที่อยู่รูปภาพ', 4_000),
    glbUrl: text(body.glbUrl, 'ที่อยู่ไฟล์ GLB', 4_000),
    usdzUrl: text(body.usdzUrl, 'ที่อยู่ไฟล์ USDZ', 4_000),
  }
}

function ownerClause(user: AuthUser, index = 1) {
  return user.role === 'developer' ? '' : `WHERE created_by = $${index}`
}

async function body(request: NextRequest) {
  try { return await request.json() as ArInput } catch { throw new ApiError('รูปแบบข้อมูลไม่ถูกต้อง', 400, 'INVALID_JSON') }
}

function databaseError(error: unknown): never {
  if ((error as { code?: string }).code === '23505') throw new ApiError('ชื่อภาษาอังกฤษนี้มีอยู่ในระบบแล้ว', 409, 'DUPLICATE_NAME')
  throw error
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 120 })
    const values = user.role === 'developer' ? [] : [user.id]
    const result = await queryDb(`SELECT ${selectFields} FROM ar_items ${ownerClause(user)} ORDER BY updated_at DESC LIMIT 400`, values)
    return NextResponse.json({ models: result.rows }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return apiErrorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 50 })
    const item = normalize(await body(request))
    try {
      const result = await queryDb(`
        INSERT INTO ar_items (id, name_en, name_th, pronounce, sentence, description, image_url, glb_url, usdz_url, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING ${selectFields}
      `, [`ar-${randomUUID()}`, item.nameEn, item.nameTh, item.pronounce, item.sentence, item.description, item.imageUrl, item.glbUrl, item.usdzUrl, user.id])
      return NextResponse.json({ model: result.rows[0] }, { status: 201 })
    } catch (error) { databaseError(error) }
  } catch (error) { return apiErrorResponse(error) }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })
    const payload = await body(request)
    const id = text(payload.id, 'รหัสโมเดล', 120, true)
    const item = normalize(payload)
    const values: unknown[] = [item.nameEn, item.nameTh, item.pronounce, item.sentence, item.description, item.imageUrl, item.glbUrl, item.usdzUrl, id]
    const ownership = user.role === 'developer' ? '' : ' AND created_by = $10'
    if (user.role !== 'developer') values.push(user.id)
    try {
      const result = await queryDb(`
        UPDATE ar_items SET name_en=$1, name_th=$2, pronounce=$3, sentence=$4, description=$5,
          image_url=$6, glb_url=$7, usdz_url=$8, updated_at=NOW()
        WHERE id=$9${ownership} RETURNING ${selectFields}
      `, values)
      if (!result.rows[0]) throw new ApiError('ไม่พบโมเดลหรือคุณไม่มีสิทธิ์แก้ไข', 404, 'NOT_FOUND')
      return NextResponse.json({ model: result.rows[0] })
    } catch (error) { databaseError(error) }
  } catch (error) { return apiErrorResponse(error) }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 40 })
    const id = request.nextUrl.searchParams.get('id')?.trim()
    if (!id) throw new ApiError('กรุณาระบุโมเดล', 400, 'VALIDATION_ERROR')
    const values: unknown[] = [id]
    const ownership = user.role === 'developer' ? '' : ' AND created_by = $2'
    if (user.role !== 'developer') values.push(user.id)
    const result = await queryDb(`DELETE FROM ar_items WHERE id=$1${ownership} RETURNING id`, values)
    if (!result.rows[0]) throw new ApiError('ไม่พบโมเดลหรือคุณไม่มีสิทธิ์ลบ', 404, 'NOT_FOUND')
    return NextResponse.json({ deletedId: id })
  } catch (error) { return apiErrorResponse(error) }
}
