import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi, ApiError } from '../../_lib/auth'

const developerOnly = ['developer'] as const
const priorities = ['urgent', 'general', 'event'] as const
export type AnnouncementPriority = (typeof priorities)[number]

const audiences = ['all', 'teachers', 'students'] as const
export type TargetAudience = (typeof audiences)[number]

export type AnnouncementRow = {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  target_audience: TargetAudience
  is_push_notification: boolean
  starts_at: string
  expires_at: string | null
  tags: string[]
  link_url: string | null
  published_at: string
  updated_at: string
}

let columnsEnsured = false
async function ensureColumns() {
  if (columnsEnsured) return
  try {
    await queryDb(`
      ALTER TABLE system_announcements 
      ADD COLUMN IF NOT EXISTS target_audience VARCHAR(20) DEFAULT 'all',
      ADD COLUMN IF NOT EXISTS is_push_notification BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;
    `)
    columnsEnsured = true
  } catch (err) {
    console.warn('Could not auto-add announcement columns:', err)
  }
}

function readAnnouncement(body: Record<string, unknown>) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const priority = body.priority
  const linkUrl = typeof body.linkUrl === 'string' ? body.linkUrl.trim() : ''
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string').map(tag => tag.trim()).filter(Boolean).slice(0, 10)
    : []

  const targetAudience = typeof body.targetAudience === 'string' && audiences.includes(body.targetAudience as TargetAudience)
    ? (body.targetAudience as TargetAudience)
    : 'all'

  const isPushNotification = body.isPushNotification !== false
  const startsAt = typeof body.startsAt === 'string' && body.startsAt ? body.startsAt : null
  const expiresAt = typeof body.expiresAt === 'string' && body.expiresAt ? body.expiresAt : null

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

  return {
    title,
    content,
    priority: priority as AnnouncementPriority,
    targetAudience,
    isPushNotification,
    startsAt,
    expiresAt,
    tags,
    linkUrl: linkUrl || null,
  }
}

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 40 })
    await ensureColumns()
    const result = await queryDb<AnnouncementRow>(`
      SELECT id, title, content, priority, target_audience, is_push_notification,
             starts_at, expires_at, tags, link_url, published_at, updated_at
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
    await ensureColumns()
    const ann = readAnnouncement(await request.json() as Record<string, unknown>)

    const result = await queryDb<AnnouncementRow>(`
      INSERT INTO system_announcements (
        title, content, priority, target_audience, is_push_notification,
        starts_at, expires_at, tags, link_url, created_by
      )
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()), $7, $8, $9, $10)
      RETURNING id, title, content, priority, target_audience, is_push_notification,
                starts_at, expires_at, tags, link_url, published_at, updated_at
    `, [
      ann.title,
      ann.content,
      ann.priority,
      ann.targetAudience,
      ann.isPushNotification,
      ann.startsAt,
      ann.expiresAt,
      ann.tags,
      ann.linkUrl,
      actor.id,
    ])

    const created = result.rows[0]

    // Dispatch In-App Notifications if Push Notification is requested
    if (ann.isPushNotification) {
      try {
        let roleFilter = "role IN ('teacher', 'student')"
        if (ann.targetAudience === 'teachers') roleFilter = "role = 'teacher'"
        else if (ann.targetAudience === 'students') roleFilter = "role = 'student'"

        const targetUsers = await queryDb<{ id: string; role: string }>(`
          SELECT id, role FROM profiles WHERE ${roleFilter} AND approval_status = 'active'
        `)

        const notifType = ann.priority === 'urgent' ? 'warning' : 'info'
        const shortMsg = ann.content.length > 120 ? `${ann.content.slice(0, 117)}...` : ann.content

        for (const u of targetUsers.rows) {
          const destUrl = ann.linkUrl || (u.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
          await queryDb(`
            INSERT INTO notifications (user_id, title, message, type, link_url)
            VALUES ($1::uuid, $2, $3, $4, $5)
          `, [
            u.id,
            `📢 ${ann.title}`,
            shortMsg,
            notifType,
            destUrl,
          ])
        }
      } catch (err) {
        console.warn('Failed to push in-app notifications for announcement:', err)
      }
    }

    return NextResponse.json({ announcement: created }, { status: 201 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 25 })
    await ensureColumns()
    const body = await request.json() as Record<string, unknown>
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) throw new ApiError('Announcement id is required', 400, 'INVALID_INPUT')
    const ann = readAnnouncement(body)

    const result = await queryDb<AnnouncementRow>(`
      UPDATE system_announcements
      SET title = $1, content = $2, priority = $3, target_audience = $4,
          is_push_notification = $5, starts_at = COALESCE($6, starts_at),
          expires_at = $7, tags = $8, link_url = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING id, title, content, priority, target_audience, is_push_notification,
                starts_at, expires_at, tags, link_url, published_at, updated_at
    `, [
      ann.title,
      ann.content,
      ann.priority,
      ann.targetAudience,
      ann.isPushNotification,
      ann.startsAt,
      ann.expiresAt,
      ann.tags,
      ann.linkUrl,
      id,
    ])

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
