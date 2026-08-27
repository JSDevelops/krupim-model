import { readFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type StoredFile = {
  owner_id: string
  original_name: string
  storage_name: string
  mime_type: string
  teacher_id: string | null
  purpose: string
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await guardApi(request, { roles: ['student', 'teacher', 'developer'], maxRequests: 90 })
    const { id } = await context.params
    if (!UUID.test(id)) throw new ApiError('รหัสไฟล์ไม่ถูกต้อง', 400, 'VALIDATION_ERROR')
    const result = await queryDb<StoredFile>(`
      SELECT f.owner_id, f.original_name, f.storage_name, f.mime_type, f.purpose, a.teacher_id
      FROM stored_files f
      LEFT JOIN assignments a ON a.id=f.assignment_id
      WHERE f.id=$1::uuid LIMIT 1
    `, [id])
    const file = result.rows[0]
    if (!file) throw new ApiError('ไม่พบไฟล์', 404, 'NOT_FOUND')
    const permitted = file.purpose === 'avatar' || user.role === 'developer' || file.owner_id === user.id || file.teacher_id === user.id
    if (!permitted) throw new ApiError('คุณไม่มีสิทธิ์เปิดไฟล์นี้', 403, 'FORBIDDEN')
    if (!/^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/i.test(file.storage_name)) throw new ApiError('ข้อมูลไฟล์ไม่ถูกต้อง', 500, 'INVALID_STORAGE_PATH')

    const storageDirectory = path.resolve(process.cwd(), '.data', 'uploads')
    const filePath = path.resolve(storageDirectory, file.storage_name)
    if (!filePath.startsWith(storageDirectory + path.sep)) throw new ApiError('ข้อมูลไฟล์ไม่ถูกต้อง', 500, 'INVALID_STORAGE_PATH')
    const bytes = await readFile(filePath).catch(() => null)
    if (!bytes) throw new ApiError('ไม่พบไฟล์ในพื้นที่จัดเก็บ', 404, 'FILE_MISSING')
    const encodedName = encodeURIComponent(file.original_name).replace(/'/g, '%27')
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': file.mime_type,
        'Content-Disposition': file.purpose === 'avatar'
          ? `inline; filename="avatar"; filename*=UTF-8''${encodedName}`
          : `attachment; filename="download"; filename*=UTF-8''${encodedName}`,
        'Cache-Control': file.purpose === 'avatar' ? 'private, max-age=86400, immutable' : 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
