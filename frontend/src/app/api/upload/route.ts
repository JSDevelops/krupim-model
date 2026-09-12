import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { queryDb } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../_lib/auth'

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.glb', '.usdz'])
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB max

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
  '.usdz': 'model/vnd.usdz+zip'
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || typeof file === 'string') {
      throw new ApiError('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด', 400, 'FILE_REQUIRED')
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError('ขนาดไฟล์เกินกำหนด (สูงสุด 50MB)', 400, 'FILE_TOO_LARGE')
    }

    const rawExt = extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      throw new ApiError('รองรับเฉพาะไฟล์ .png, .jpg, .jpeg, .webp, .glb และ .usdz เท่านั้น', 400, 'INVALID_FILE_TYPE')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const randomSuffix = randomBytes(6).toString('hex')
    const sanitizedBase = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
    const uniqueFilename = `${Date.now()}_${sanitizedBase}_${randomSuffix}${rawExt}`
    const mimeType = file.type || MIME_MAP[rawExt] || 'application/octet-stream'

    // 1. Try local disk write if writable (e.g. local dev)
    try {
      const uploadDir = join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, uniqueFilename), buffer)
    } catch {
      // In read-only serverless environments (Vercel), disk write is safely bypassed
    }

    // 2. Always persist to PostgreSQL database so it survives across serverless instances
    await queryDb(`
      INSERT INTO uploaded_assets (file_name, mime_type, size_bytes, file_data, uploaded_by)
      VALUES ($1, $2, $3, $4, $5::uuid)
      ON CONFLICT (file_name) DO UPDATE 
        SET file_data = EXCLUDED.file_data, size_bytes = EXCLUDED.size_bytes, mime_type = EXCLUDED.mime_type
    `, [uniqueFilename, mimeType, file.size, buffer, user.id])

    const publicUrl = `/uploads/${uniqueFilename}`

    return NextResponse.json({
      url: publicUrl,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      extension: rawExt
    }, { status: 201 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
