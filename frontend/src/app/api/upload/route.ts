import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { ApiError, apiErrorResponse, guardApi } from '../_lib/auth'

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.glb', '.usdz'])
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB max

export async function POST(request: NextRequest) {
  try {
    await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })

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

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const randomSuffix = randomBytes(6).toString('hex')
    const sanitizedBase = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
    const uniqueFilename = `${Date.now()}_${sanitizedBase}_${randomSuffix}${rawExt}`
    const filePath = join(uploadDir, uniqueFilename)

    await writeFile(filePath, buffer)

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
