import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'

type VocabularyInput = {
  id?: unknown
  nameEn?: unknown
  nameTh?: unknown
  category?: unknown
  categoryTh?: unknown
  emoji?: unknown
  pronounce?: unknown
  useDesc?: unknown
  sentence?: unknown
  imageUrl?: unknown
  glbUrl?: unknown
  usdzUrl?: unknown
}

const selectFields = `
  id, name_en AS "nameEn", name_th AS "nameTh", category, category_th AS "categoryTh", emoji,
  pronounce, use_desc AS "useDesc", sentence, image_url AS "imageUrl", glb_url AS "glbUrl", usdz_url AS "usdzUrl",
  created_by AS "createdBy",
  created_at AS "createdAt", updated_at AS "updatedAt"
`

function text(value: unknown, label: string, max: number, required = false) {
  const result = typeof value === 'string' ? value.trim() : ''
  if (required && !result) throw new ApiError(`กรุณากรอก${label}`, 400, 'VALIDATION_ERROR')
  if (result.length > max) throw new ApiError(`${label}ยาวเกิน ${max} ตัวอักษร`, 400, 'VALIDATION_ERROR')
  return result
}

function normalize(body: VocabularyInput) {
  return {
    nameEn: text(body.nameEn, 'คำศัพท์ภาษาอังกฤษ', 180, true),
    nameTh: text(body.nameTh, 'คำแปลภาษาไทย', 180, true),
    category: text(body.category, 'รหัสหมวดหมู่', 100, true).toLocaleLowerCase('en-US'),
    categoryTh: text(body.categoryTh, 'ชื่อหมวดหมู่', 180, true),
    emoji: text(body.emoji, 'อีโมจิ', 20),
    pronounce: text(body.pronounce, 'คำอ่าน', 180),
    useDesc: text(body.useDesc, 'คำอธิบายการใช้งาน', 2_000),
    sentence: text(body.sentence, 'ประโยคตัวอย่าง', 1_000),
    imageUrl: text(body.imageUrl, 'ที่อยู่รูปภาพ', 10_000_000),
    glbUrl: text(body.glbUrl, 'ที่อยู่ไฟล์ GLB', 4_000),
    usdzUrl: text(body.usdzUrl, 'ที่อยู่ไฟล์ USDZ', 4_000),
  }
}

async function body(request: NextRequest) {
  try { return await request.json() as VocabularyInput } catch { throw new ApiError('รูปแบบข้อมูลไม่ถูกต้อง', 400, 'INVALID_JSON') }
}

function databaseError(error: unknown): never {
  if ((error as { code?: string }).code === '23505') throw new ApiError('คำศัพท์ภาษาอังกฤษนี้มีอยู่ในระบบแล้ว', 409, 'DUPLICATE_NAME')
  throw error
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 120 })
    const where = user.role === 'developer' ? '' : 'WHERE created_by=$1::uuid OR created_by IS NULL'
    const result = await queryDb(`SELECT ${selectFields} FROM vocabulary_items ${where} ORDER BY updated_at DESC, name_en ASC LIMIT 600`, user.role === 'developer' ? [] : [user.id])
    return NextResponse.json({ vocabulary: result.rows }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return apiErrorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })
    const item = normalize(await body(request))
    try {
      const result = await queryDb(`
        INSERT INTO vocabulary_items (name_en, name_th, category, category_th, emoji, pronounce, use_desc, sentence, image_url, glb_url, usdz_url, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::uuid) RETURNING ${selectFields}
      `, [item.nameEn, item.nameTh, item.category, item.categoryTh, item.emoji, item.pronounce, item.useDesc, item.sentence, item.imageUrl, item.glbUrl, item.usdzUrl, user.id])
      return NextResponse.json({ item: result.rows[0] }, { status: 201 })
    } catch (error) { databaseError(error) }
  } catch (error) { return apiErrorResponse(error) }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 70 })
    const payload = await body(request)
    const id = text(payload.id, 'รหัสคำศัพท์', 80, true)
    const item = normalize(payload)
    try {
      const result = await queryDb(`
        UPDATE vocabulary_items SET name_en=$1, name_th=$2, category=$3, category_th=$4, emoji=$5,
          pronounce=$6, use_desc=$7, sentence=$8, image_url=$9, glb_url=$10, usdz_url=$11, updated_at=NOW()
        WHERE id=$12::uuid${user.role === 'developer' ? '' : ' AND (created_by=$13::uuid OR created_by IS NULL)'} RETURNING ${selectFields}
      `, [item.nameEn, item.nameTh, item.category, item.categoryTh, item.emoji, item.pronounce, item.useDesc, item.sentence, item.imageUrl, item.glbUrl, item.usdzUrl, id, ...(user.role === 'developer' ? [] : [user.id])])
      if (!result.rows[0]) throw new ApiError('ไม่พบคำศัพท์', 404, 'NOT_FOUND')
      return NextResponse.json({ item: result.rows[0] })
    } catch (error) { databaseError(error) }
  } catch (error) { return apiErrorResponse(error) }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 50 })
    const id = request.nextUrl.searchParams.get('id')?.trim()
    if (!id) throw new ApiError('กรุณาระบุคำศัพท์', 400, 'VALIDATION_ERROR')
    const result = await queryDb(`DELETE FROM vocabulary_items WHERE id=$1::uuid${user.role === 'developer' ? '' : ' AND (created_by=$2::uuid OR created_by IS NULL)'} RETURNING id`, [id, ...(user.role === 'developer' ? [] : [user.id])])
    if (!result.rows[0]) throw new ApiError('ไม่พบคำศัพท์', 404, 'NOT_FOUND')
    return NextResponse.json({ deletedId: id })
  } catch (error) { return apiErrorResponse(error) }
}
