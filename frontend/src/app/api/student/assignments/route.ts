import { NextRequest, NextResponse } from 'next/server'
import { withTransaction } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'
import { removeLocalStoredFiles } from '@/lib/localFileStorage'

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
      const allowed = await client.query<{ id: string; title: string; teacher_id: string | null }>(`
        SELECT a.id, a.title, a.teacher_id
        FROM assignments a
        JOIN class_students cs ON cs.class_id=a.class_id
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

      const result = await client.query(`
        INSERT INTO assignment_submissions (assignment_id,student_id,attachment_name,attachment_url)
        VALUES ($1::uuid,$2::uuid,$3,$4)
        ON CONFLICT (assignment_id,student_id) DO UPDATE
        SET attachment_name=EXCLUDED.attachment_name, attachment_url=EXCLUDED.attachment_url,
            score=NULL, feedback=NULL, graded_at=NULL, submitted_at=NOW()
        RETURNING id, submitted_at AS "submittedAt"
      `, [assignmentId, user.id, name || null, url || null])

      const teacherId = allowed.rows[0].teacher_id
      if (teacherId) {
        await client.query(`
          INSERT INTO notifications (user_id, title, message, type, link_url)
          VALUES ($1::uuid,'มีงานส่งใหม่',$2,'submission','/teacher/assignments')
        `, [teacherId, allowed.rows[0].title])
      }
      let obsoleteStorageName: string | null = null
      const previous = previousFile.rows[0]
      if (previous && previous.attachment_url !== url) {
        await client.query('DELETE FROM stored_files WHERE id=$1::uuid AND owner_id=$2::uuid', [previous.id, user.id])
        obsoleteStorageName = previous.storage_name
      }
      return { submission: result.rows[0], obsoleteStorageName }
    })

    await removeLocalStoredFiles([resultWithCleanup.obsoleteStorageName])

    return NextResponse.json({ submission: resultWithCleanup.submission }, { status: 201 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
