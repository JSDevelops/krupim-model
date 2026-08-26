import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi, ApiError } from '../../_lib/auth'

const developerOnly = ['developer'] as const
const priorities = ['urgent', 'general', 'event'] as const
type AnnouncementPriority = (typeof priorities)[number]

export type AnnouncementRow = {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  tags: string[]
  link_url: string | null
  published_at: string
  updated_at: string
}

function readAnnouncement(body: Record<string, unknown>) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const priority = body.priority
  const linkUrl = typeof body.linkUrl === 'string' ? body.linkUrl.trim() : ''
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string').map(tag => tag.trim()).filter(Boolean).slice(0, 10)
    : []

  if (!title || !content || typeof priority !== 'string' || !priorities.includes(priority as AnnouncementPriority)) {
    throw new ApiError('กรุณากรอกหัวข้อ เนื้อหา และระดับความสำคัญให้ครบถ้วน', 400, 'INVALID_INPUT')
  }
  if (title.length > 240 || content.length > 10_000 || tags.some(tag => tag.length > 50)) {
    throw new ApiError('ข้อมูลบางช่องยาวเกินกว่าที่ระบบกำหนด', 400, 'INVALID_INPUT')
  }
  if (linkUrl) {
    try {
      const url = new URL(linkUrl)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol')
    } catch {
      throw new ApiError('ลิงก์เพิ่มเติมต้องเป็น URL แบบ http หรือ https', 400, 'INVALID_INPUT')
    }
  }

  return { title, content, priority: priority as AnnouncementPriority, tags, linkUrl: linkUrl || null }
}

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 40 })
    const result = await queryDb<AnnouncementRow>(`
      SELECT id, title, content, priority, tags, link_url, published_at, updated_at
      FROM system_announcements
      ORDER BY published_at DESC
    `)
    return NextResponse.json({ announcements: result.rows })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await guardApi(request, { roles: developerOnly, maxRequests: 20 })
    const announcement = readAnnouncement(await request.json() as Record<string, unknown>)
    const result = await queryDb<AnnouncementRow>(`
      INSERT INTO system_announcements (title, content, priority, tags, link_url, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, content, priority, tags, link_url, published_at, updated_at
    `, [announcement.title, announcement.content, announcement.priority, announcement.tags, announcement.linkUrl, actor.id])
    return NextResponse.json({ announcement: result.rows[0] }, { status: 201 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 25 })
    const body = await request.json() as Record<string, unknown>
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) throw new ApiError('Announcement id is required', 400, 'INVALID_INPUT')
    const announcement = readAnnouncement(body)
    const result = await queryDb<AnnouncementRow>(`
      UPDATE system_announcements
      SET title = $1, content = $2, priority = $3, tags = $4, link_url = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING id, title, content, priority, tags, link_url, published_at, updated_at
    `, [announcement.title, announcement.content, announcement.priority, announcement.tags, announcement.linkUrl, id])
    if (result.rowCount !== 1) throw new ApiError('ไม่พบประกาศ', 404, 'NOT_FOUND')
    return NextResponse.json({ announcement: result.rows[0] })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 15 })
    const id = request.nextUrl.searchParams.get('id') || ''
    if (!id) throw new ApiError('Announcement id is required', 400, 'INVALID_INPUT')
    const result = await queryDb('DELETE FROM system_announcements WHERE id = $1 RETURNING id', [id])
    if (result.rowCount !== 1) throw new ApiError('ไม่พบประกาศ', 404, 'NOT_FOUND')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
