import { NextRequest, NextResponse } from 'next/server'
import { withTransaction } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'
import { removeLocalStoredFiles } from '@/lib/localFileStorage'
import { getPublicAppUrl, sendAssignmentSubmissionEmail, smtpConfigured } from '@/lib/mail'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student'], maxRequests: 30 })
    const body = await request.json() as {
      assignmentId?: unknown
      attachmentName?: unknown
      attachmentUrl?: unknown
    }
    const assignmentId = typeof body.assignmentId === 'string' ? body.assignmentId : ''
    if (!UUID.test(assignmentId)) throw new ApiError('รหัสงานไม่ถูกต้อง', 400, 'VALIDATION_ERROR')
    const name = typeof body.attachmentName === 'string' ? body.attachmentName.trim().slice(0, 240) : ''
    const url = typeof body.attachmentUrl === 'string' ? body.attachmentUrl.trim().slice(0, 2_000) : ''
    const localFile = /^\/api\/files\/[0-9a-f-]{36}$/i.test(url)
    if (url && !localFile && !/^https?:\/\/\S+$/i.test(url)) throw new ApiError('ลิงก์ผลงานไม่ถูกต้อง', 400, 'VALIDATION_ERROR')

    const resultWithCleanup = await withTransaction(async client => {
      const allowed = await client.query<{
        id: string
        title: string
        teacher_id: string | null
        lesson_plan_id: string | null
        activity_type: string | null
        teacher_email: string | null
        teacher_name: string | null
        student_name: string
        student_email: string
        class_name: string
      }>(`
        SELECT a.id, a.title, a.teacher_id, a.lesson_plan_id, a.activity_type,
               tp.email AS teacher_email, tp.name AS teacher_name,
               sp.name AS student_name, sp.email AS student_email,
               c.name AS class_name
        FROM assignments a
        JOIN classes c ON c.id=a.class_id
        JOIN class_students cs ON cs.class_id=a.class_id
        JOIN profiles sp ON sp.id=cs.student_id
        LEFT JOIN profiles tp ON tp.id=a.teacher_id
        WHERE a.id=$1::uuid AND cs.student_id=$2::uuid
        LIMIT 1
      `, [assignmentId, user.id])
      if (!allowed.rows[0]) throw new ApiError('ไม่พบงานหรือคุณไม่มีสิทธิ์ส่งงาน', 404, 'NOT_FOUND')

      if (localFile) {
        const fileId = url.slice('/api/files/'.length)
        const ownedFile = await client.query(`
          SELECT id FROM stored_files
          WHERE id=$1::uuid AND owner_id=$2::uuid AND assignment_id=$3::uuid
          LIMIT 1
        `, [fileId, user.id, assignmentId])
        if (!ownedFile.rows[0]) throw new ApiError('ไม่พบไฟล์ที่อัปโหลดสำหรับงานนี้', 400, 'INVALID_ATTACHMENT')
      }

      const previousFile = await client.query<{ id: string; storage_name: string; attachment_url: string }>(`
        SELECT f.id, f.storage_name, s.attachment_url
        FROM assignment_submissions s
        JOIN stored_files f ON s.attachment_url='/api/files/' || f.id::text
        WHERE s.assignment_id=$1::uuid AND s.student_id=$2::uuid
        LIMIT 1
      `, [assignmentId, user.id])

      const previousSub = await client.query<{ id: string; status: string }>(`
        SELECT id, status FROM assignment_submissions
        WHERE assignment_id=$1::uuid AND student_id=$2::uuid
        LIMIT 1
      `, [assignmentId, user.id])
      const isResubmit = previousSub.rows[0]?.status === 'returned'

      const result = await client.query(`
        INSERT INTO assignment_submissions (assignment_id,student_id,attachment_name,attachment_url,status)
        VALUES ($1::uuid,$2::uuid,$3,$4,'submitted')
        ON CONFLICT (assignment_id,student_id) DO UPDATE
        SET attachment_name=EXCLUDED.attachment_name, attachment_url=EXCLUDED.attachment_url,
            status=CASE WHEN assignment_submissions.status='returned' THEN 'resubmitted' ELSE 'submitted' END,
            return_reason=NULL, returned_at=NULL,
            score=NULL, feedback=NULL, graded_at=NULL, submitted_at=NOW()
        RETURNING id, submitted_at AS "submittedAt"
      `, [assignmentId, user.id, name || null, url || null])

      const row = allowed.rows[0]
      const teacherId = row.teacher_id
      const studentName = row.student_name || 'นักเรียน'
      const className = row.class_name || 'ห้องเรียน'
      const taskTitle = row.title
      const attachInfo = name ? ` (📎 ไฟล์แนบ: ${name})` : ''

      if (teacherId) {
        await client.query(`
          INSERT INTO notifications (user_id, title, message, type, link_url)
          VALUES ($1::uuid, $2, $3, 'submission', '/teacher/assignments')
        `, [
          teacherId,
          isResubmit ? 'มีการส่งงานที่แก้ไขแล้ว' : 'มีการส่งงานใหม่',
          `${studentName} [${className}] ได้${isResubmit ? 'ส่งงานที่แก้ไข' : 'ส่งงาน'} “${taskTitle}”${attachInfo}`,
        ])
      }

      // Auto-trigger completion and tested events when linked to a lesson plan
      if (row.lesson_plan_id) {
        const lessonPlanId = row.lesson_plan_id
        const actType = (row.activity_type || '').toLowerCase()
        const stage = actType.includes('interact') ? 'i' : actType.includes('navigate') ? 'n' : actType.includes('exhibit') ? 'e' : 'f'

        // 1. Mark lesson as completed
        await client.query(`
          INSERT INTO learning_events (student_id, event_type, reference_type, reference_id, metadata_json)
          VALUES ($1::uuid, 'lesson_completed', 'fine_lesson_plan', $2, $3::jsonb)
          ON CONFLICT (student_id, event_type, reference_type, reference_id) DO NOTHING
        `, [user.id, lessonPlanId, JSON.stringify({ assignmentId, title: taskTitle, stage })])

        // 2. Mark specific stage completed (stage_f, stage_i, stage_n, stage_e)
        await client.query(`
          INSERT INTO learning_events (student_id, event_type, reference_type, reference_id, metadata_json)
          VALUES ($1::uuid, $3, 'fine_lesson_plan', $2, $4::jsonb)
          ON CONFLICT (student_id, event_type, reference_type, reference_id) DO NOTHING
        `, [user.id, lessonPlanId, `stage_${stage}`, JSON.stringify({ assignmentId, stage })])

        // 3. If stage is Exhibit (E), mark lesson as tested
        if (stage === 'e') {
          await client.query(`
            INSERT INTO learning_events (student_id, event_type, reference_type, reference_id, metadata_json)
            VALUES ($1::uuid, 'lesson_tested', 'fine_lesson_plan', $2, $3::jsonb)
            ON CONFLICT (student_id, event_type, reference_type, reference_id) DO NOTHING
          `, [user.id, lessonPlanId, JSON.stringify({ assignmentId, title: taskTitle })])
        }

        // 4. Update learning_analytics lessons_completed and time spent
        const analytics = await client.query<{ id: string }>(`
          SELECT id FROM learning_analytics
          WHERE student_id=$1::uuid AND course_id IS NULL AND date=CURRENT_DATE
          ORDER BY id LIMIT 1 FOR UPDATE
        `, [user.id])
        if (analytics.rows[0]) {
          await client.query(`
            UPDATE learning_analytics
            SET lessons_completed=(
              SELECT COUNT(DISTINCT reference_id)::int FROM learning_events
              WHERE student_id=$1::uuid AND event_type='lesson_completed' AND reference_type='fine_lesson_plan'
            ),
            time_spent_minutes=time_spent_minutes+10
            WHERE id=$2::uuid
          `, [user.id, analytics.rows[0].id])
        } else {
          await client.query(`
            INSERT INTO learning_analytics (student_id, course_id, date, lessons_completed, time_spent_minutes, knowledge_score, overall_score)
            VALUES ($1::uuid, NULL, CURRENT_DATE, 1, 10, 80, 80)
          `, [user.id])
        }
      }
      let obsoleteStorageName: string | null = null
      const previous = previousFile.rows[0]
      if (previous && previous.attachment_url !== url) {
        await client.query('DELETE FROM stored_files WHERE id=$1::uuid AND owner_id=$2::uuid', [previous.id, user.id])
        obsoleteStorageName = previous.storage_name
      }
      return { submission: result.rows[0], obsoleteStorageName, allowedInfo: row }
    })

    await removeLocalStoredFiles([resultWithCleanup.obsoleteStorageName])

    const info = resultWithCleanup.allowedInfo
    if (info?.teacher_email && smtpConfigured()) {
      try {
        const appUrl = getPublicAppUrl()
        const reviewUrl = `${appUrl}/teacher/assignments?id=${encodeURIComponent(assignmentId)}`
        const fileFullUrl = url && url.startsWith('/') ? `${appUrl}${url}` : (url || null)

        await sendAssignmentSubmissionEmail({
          to: info.teacher_email,
          teacherName: info.teacher_name || 'คุณครูผู้สอน',
          studentName: info.student_name || 'นักเรียน',
          studentEmail: info.student_email,
          className: info.class_name || 'ห้องเรียน',
          assignmentTitle: info.title,
          attachmentName: name || null,
          attachmentUrl: fileFullUrl,
          submittedAt: new Date().toISOString(),
          reviewUrl,
        })
      } catch (mailError) {
        console.warn('Failed to send assignment submission email notification:', mailError)
      }
    }

    return NextResponse.json({ submission: resultWithCleanup.submission }, { status: 201 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
