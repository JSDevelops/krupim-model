import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi, ApiError } from '../../_lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const priorities = ['urgent', 'general', 'event'] as const

let columnsEnsured = false
async function ensureColumns() {
  if (columnsEnsured) return
  try {
    await queryDb(`
      ALTER TABLE system_announcements 
      ADD COLUMN IF NOT EXISTS target_audience VARCHAR(20) DEFAULT 'all',
      ADD COLUMN IF NOT EXISTS is_push_notification BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS class_id UUID;
    `)
    columnsEnsured = true
  } catch (err) {
    console.warn('Could not auto-add announcement columns:', err)
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })
    await ensureColumns()

    // 1. Fetch classes taught by this teacher
    const classQuery = user.role === 'developer'
      ? 'SELECT id, name FROM classes ORDER BY name ASC'
      : 'SELECT id, name FROM classes WHERE teacher_id = $1::uuid ORDER BY name ASC'
    const classParams = user.role === 'developer' ? [] : [user.id]
    const classesRes = await queryDb<{ id: string; name: string }>(classQuery, classParams)

    // 2. Fetch announcements created by this teacher
    const annQuery = user.role === 'developer'
      ? `SELECT a.id, a.title, a.content, a.priority, a.class_id AS "classId",
                c.name AS "className", a.published_at AS "publishedAt", a.expires_at AS "expiresAt"
         FROM system_announcements a
         LEFT JOIN classes c ON c.id = a.class_id
         ORDER BY a.published_at DESC LIMIT 20`
      : `SELECT a.id, a.title, a.content, a.priority, a.class_id AS "classId",
                c.name AS "className", a.published_at AS "publishedAt", a.expires_at AS "expiresAt"
         FROM system_announcements a
         LEFT JOIN classes c ON c.id = a.class_id
         WHERE a.created_by = $1::uuid
         ORDER BY a.published_at DESC LIMIT 20`
    const annParams = user.role === 'developer' ? [] : [user.id]
    const annRes = await queryDb(annQuery, annParams)

    return NextResponse.json({
      classes: classesRes.rows,
      announcements: annRes.rows,
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 20 })
    await ensureColumns()

    const body = await request.json()
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    const priority = priorities.includes(body.priority) ? body.priority : 'general'
    const classId = typeof body.classId === 'string' && body.classId.trim() ? body.classId.trim() : null
    const expiresAt = typeof body.expiresAt === 'string' && body.expiresAt.trim() ? body.expiresAt.trim() : null
    const isPushNotification = body.isPushNotification !== false
    const linkUrl = typeof body.linkUrl === 'string' && body.linkUrl.trim() ? body.linkUrl.trim() : null
    const tags = Array.isArray(body.tags) ? body.tags.filter((t: unknown) => typeof t === 'string' && (t as string).trim()) : []

    if (!title || !content) {
      throw new ApiError('กรุณากรอกหัวข้อและเนื้อหาประกาศ', 400, 'INVALID_INPUT')
    }

    // Verify class ownership if classId is specified
    let targetClassName = 'ทุกห้องเรียนที่คุณสอน'
    if (classId && user.role !== 'developer') {
      const classCheck = await queryDb<{ id: string; name: string }>(`
        SELECT id, name FROM classes WHERE id = $1::uuid AND teacher_id = $2::uuid LIMIT 1
      `, [classId, user.id])
      if (!classCheck.rows[0]) {
        throw new ApiError('ไม่พบห้องเรียนที่เลือก หรือคุณไม่มีสิทธิ์ในห้องเรียนนี้', 403, 'FORBIDDEN')
      }
      targetClassName = classCheck.rows[0].name
    }

    // Teacher profile name
    const teacherProfile = await queryDb<{ name: string }>(`
      SELECT name FROM profiles WHERE id = $1::uuid LIMIT 1
    `, [user.id])
    const teacherName = teacherProfile.rows[0]?.name || 'ครูผู้สอน'

    // Insert announcement
    const insertRes = await queryDb<{ id: string; title: string; published_at: string }>(`
      INSERT INTO system_announcements (
        title, content, priority, target_audience, class_id,
        created_by, starts_at, expires_at, is_push_notification, link_url, tags
      )
      VALUES ($1, $2, $3, 'students', $4, $5, NOW(), $6, $7, $8, $9)
      RETURNING id, title, published_at
    `, [
      title,
      content,
      priority,
      classId,
      user.id,
      expiresAt,
      isPushNotification,
      linkUrl,
      tags,
    ])
    const created = insertRes.rows[0]

    // Dispatch Push Notification to enrolled students only
    let pushedCount = 0
    if (isPushNotification) {
      try {
        const studentQuery = classId
          ? `SELECT DISTINCT cs.student_id
             FROM class_students cs
             WHERE cs.class_id = $1::uuid`
          : `SELECT DISTINCT cs.student_id
             FROM class_students cs
             JOIN classes c ON c.id = cs.class_id
             WHERE c.teacher_id = $1::uuid`
        const studentParams = classId ? [classId] : [user.id]
        const students = await queryDb<{ student_id: string }>(studentQuery, studentParams)

        const notifType = priority === 'urgent' ? 'warning' : 'info'
        const shortContent = content.length > 100 ? `${content.slice(0, 97)}...` : content
        const notifTitle = `📢 ครู${teacherName}: ${title}`

        for (const s of students.rows) {
          await queryDb(`
            INSERT INTO notifications (user_id, title, message, type, link_url)
            VALUES ($1::uuid, $2, $3, $4, '/student/profile?tab=announcements')
          `, [s.student_id, notifTitle, shortContent, notifType])
        }
        pushedCount = students.rows.length
      } catch (err) {
        console.warn('Failed to dispatch notifications to students:', err)
      }
    }

    return NextResponse.json({
      ok: true,
      announcement: created,
      targetClassName,
      pushedCount,
    }, { status: 201 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
