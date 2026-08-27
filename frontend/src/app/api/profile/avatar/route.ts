import { randomUUID } from 'crypto'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { withTransaction } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'

export const runtime = 'nodejs'

const MAX_AVATAR_BYTES = 750_000
const LOCAL_AVATAR = /^\/api\/files\/([0-9a-f-]{36})$/i
const MIME_EXTENSION: Record<string, string> = { jpeg: '.jpg', png: '.png', webp: '.webp' }

function validSignature(bytes: Buffer, type: string) {
  if (type === 'jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (type === 'png') return bytes.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))
  return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
}

function storagePath(storageName: string) {
  return path.resolve(process.cwd(), '.data', 'uploads', storageName)
}

async function removePhysicalFile(storageName: string | null) {
  if (!storageName || !/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(storageName)) return
  await unlink(storagePath(storageName)).catch(() => undefined)
}

export async function POST(request: NextRequest) {
  let newStorageName = ''
  try {
    const user = await guardApi(request, { roles: ['student', 'teacher', 'developer'], maxRequests: 12 })
    if (Number(request.headers.get('content-length') || 0) > 1_100_000) {
      throw new ApiError('รูปโปรไฟล์มีขนาดใหญ่เกินไป', 413, 'PAYLOAD_TOO_LARGE')
    }
    const body = await request.json() as { dataUrl?: unknown }
    const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : ''
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl)
    if (!match) throw new ApiError('รูปโปรไฟล์ต้องเป็น JPEG, PNG หรือ WebP', 400, 'INVALID_AVATAR')
    const imageType = match[1]
    const bytes = Buffer.from(match[2], 'base64')
    if (!bytes.length || bytes.length > MAX_AVATAR_BYTES || !validSignature(bytes, imageType)) {
      throw new ApiError('ข้อมูลรูปโปรไฟล์ไม่ถูกต้องหรือมีขนาดใหญ่เกินไป', 400, 'INVALID_AVATAR')
    }

    newStorageName = `${randomUUID()}${MIME_EXTENSION[imageType]}`
    const uploadsDirectory = path.resolve(process.cwd(), '.data', 'uploads')
    await mkdir(uploadsDirectory, { recursive: true })
    await writeFile(storagePath(newStorageName), bytes, { flag: 'wx' })

    const result = await withTransaction(async client => {
      const current = await client.query<{ avatar_url: string | null }>('SELECT avatar_url FROM profiles WHERE id=$1::uuid FOR UPDATE', [user.id])
      if (!current.rows[0]) throw new ApiError('ไม่พบโปรไฟล์ผู้ใช้', 404, 'NOT_FOUND')
      const inserted = await client.query<{ id: string }>(`
        INSERT INTO stored_files(owner_id,purpose,original_name,storage_name,mime_type,size_bytes)
        VALUES($1::uuid,'avatar',$2,$3,$4,$5) RETURNING id
      `, [user.id, `avatar${MIME_EXTENSION[imageType]}`, newStorageName, `image/${imageType}`, bytes.length])
      const avatarUrl = `/api/files/${inserted.rows[0].id}`
      await client.query('UPDATE profiles SET avatar_url=$1,updated_at=NOW() WHERE id=$2::uuid', [avatarUrl, user.id])

      let previousStorageName: string | null = null
      const oldFileId = LOCAL_AVATAR.exec(current.rows[0].avatar_url || '')?.[1]
      if (oldFileId) {
        const removed = await client.query<{ storage_name: string }>(`
          DELETE FROM stored_files WHERE id=$1::uuid AND owner_id=$2::uuid AND purpose='avatar'
          RETURNING storage_name
        `, [oldFileId, user.id])
        previousStorageName = removed.rows[0]?.storage_name || null
      }
      await client.query(`
        INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json)
        VALUES($1::uuid,'update_avatar','profile',$1::text,$2::jsonb)
      `, [user.id, JSON.stringify({ size: bytes.length, mimeType: `image/${imageType}` })])
      return { avatarUrl, previousStorageName }
    })
    await removePhysicalFile(result.previousStorageName)
    return NextResponse.json({ avatarUrl: result.avatarUrl })
  } catch (error) {
    await removePhysicalFile(newStorageName)
    return apiErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student', 'teacher', 'developer'], maxRequests: 12 })
    const storageName = await withTransaction(async client => {
      const current = await client.query<{ avatar_url: string | null }>('SELECT avatar_url FROM profiles WHERE id=$1::uuid FOR UPDATE', [user.id])
      if (!current.rows[0]) throw new ApiError('ไม่พบโปรไฟล์ผู้ใช้', 404, 'NOT_FOUND')
      await client.query('UPDATE profiles SET avatar_url=NULL,updated_at=NOW() WHERE id=$1::uuid', [user.id])
      const oldFileId = LOCAL_AVATAR.exec(current.rows[0].avatar_url || '')?.[1]
      if (!oldFileId) return null
      const removed = await client.query<{ storage_name: string }>(`
        DELETE FROM stored_files WHERE id=$1::uuid AND owner_id=$2::uuid AND purpose='avatar'
        RETURNING storage_name
      `, [oldFileId, user.id])
      return removed.rows[0]?.storage_name || null
    })
    await removePhysicalFile(storageName)
    return NextResponse.json({ avatarUrl: null })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
