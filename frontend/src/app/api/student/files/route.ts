import { randomUUID } from 'crypto'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_SIZE = 12 * 1024 * 1024
const FILE_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'text/plain': '.txt',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
}

export async function POST(request: NextRequest) {
  let storedPath = ''
  try {
    const user = await guardApi(request, { roles: ['student'], maxRequests: 12 })
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > MAX_SIZE + 256_000) throw new ApiError('ไฟล์มีขนาดเกิน 12 MB', 413, 'FILE_TOO_LARGE')
    const form = await request.formData()
    const assignmentId = String(form.get('assignmentId') || '')
    const file = form.get('file')
    if (!UUID.test(assignmentId)) throw new ApiError('รหัสงานไม่ถูกต้อง', 400, 'VALIDATION_ERROR')
    if (!(file instanceof File) || file.size === 0) throw new ApiError('กรุณาเลือกไฟล์', 400, 'FILE_REQUIRED')
    if (file.size > MAX_SIZE) throw new ApiError('ไฟล์มีขนาดเกิน 12 MB', 413, 'FILE_TOO_LARGE')
    const extension = FILE_TYPES[file.type]
    if (!extension) throw new ApiError('รองรับเฉพาะ PDF, รูปภาพ, TXT, Word และ PowerPoint', 415, 'UNSUPPORTED_FILE')

    const allowed = await queryDb(`
      SELECT a.id FROM assignments a
      JOIN class_students cs ON cs.class_id=a.class_id
      WHERE a.id=$1::uuid AND cs.student_id=$2::uuid LIMIT 1
    `, [assignmentId, user.id])
    if (!allowed.rows[0]) throw new ApiError('ไม่พบงานหรือคุณไม่มีสิทธิ์ส่งงานนี้', 404, 'NOT_FOUND')

    const storageName = `${randomUUID()}${extension}`
    const storageDirectory = path.resolve(process.cwd(), '.data', 'uploads')
    storedPath = path.join(storageDirectory, storageName)
    await mkdir(storageDirectory, { recursive: true })
    await writeFile(storedPath, new Uint8Array(await file.arrayBuffer()), { flag: 'wx' })

    const stored = await withTransaction(async client => {
      const result = await client.query<{ id: string }>(`
        INSERT INTO stored_files(owner_id,assignment_id,purpose,original_name,storage_name,mime_type,size_bytes)
        VALUES($1::uuid,$2::uuid,'assignment',$3,$4,$5,$6)
        RETURNING id
      `, [user.id, assignmentId, file.name.slice(0, 240), storageName, file.type, file.size])
      await client.query(`
        INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json)
        VALUES($1::uuid,'upload_assignment_file','stored_file',$2,$3::jsonb)
      `, [user.id, result.rows[0].id, JSON.stringify({ assignmentId, size: file.size, mimeType: file.type })])
      return result.rows[0]
    })
    return NextResponse.json({
      file: { id: stored.id, name: file.name.slice(0, 240), url: `/api/files/${stored.id}`, size: file.size },
    }, { status: 201 })
  } catch (error) {
    if (storedPath) await unlink(storedPath).catch(() => undefined)
    return apiErrorResponse(error)
  }
}
