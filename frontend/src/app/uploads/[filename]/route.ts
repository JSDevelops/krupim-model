import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const runtime = 'nodejs'

type UploadedAsset = {
  mime_type: string
  size_bytes: string
  file_data: Buffer
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'ชื่อไฟล์ไม่ถูกต้อง' }, { status: 400 })
    }

    // 1. Try serving from local disk first if exists
    try {
      const diskPath = join(process.cwd(), 'public', 'uploads', filename)
      const diskBytes = await readFile(diskPath)
      const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase()
      const mimeTypes: Record<string, string> = {
        '.glb': 'model/gltf-binary',
        '.usdz': 'model/vnd.usdz+zip',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp'
      }
      return new NextResponse(new Uint8Array(diskBytes), {
        headers: {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'Content-Length': String(diskBytes.length),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff'
        }
      })
    } catch {
      // File not found on local disk, fallback to database
    }

    // 2. Query from database
    const result = await queryDb<UploadedAsset>(`
      SELECT mime_type, size_bytes, file_data 
      FROM uploaded_assets 
      WHERE file_name = $1 
      LIMIT 1
    `, [filename])

    const asset = result.rows[0]
    if (!asset) {
      return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 404 })
    }

    return new NextResponse(new Uint8Array(asset.file_data), {
      headers: {
        'Content-Type': asset.mime_type,
        'Content-Length': String(asset.size_bytes),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  } catch (error) {
    console.error('Error serving upload asset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
