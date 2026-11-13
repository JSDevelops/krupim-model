import { queryDb } from './db'
import {
  type TokenRequestType,
  type TokenRequestStatus,
  type TokenRequestRow,
  REQUEST_TYPE_LABELS,
} from './tokenRequestTypes'
import {
  sendAdminNewTokenRequestEmail,
  sendTokenRequestApprovalEmail,
  smtpConfigured,
} from './mail'

export type { TokenRequestType, TokenRequestStatus, TokenRequestRow }
export { REQUEST_TYPE_LABELS }

let tableEnsured = false

export async function ensureTokenRequestsTable(): Promise<void> {
  if (tableEnsured) return
  try {
    await queryDb(`
      CREATE TABLE IF NOT EXISTS ai_token_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        teacher_name TEXT NOT NULL,
        school_name TEXT,
        request_type VARCHAR(50) NOT NULL DEFAULT 'temporary_extension',
        package_name VARCHAR(100),
        student_count INT NOT NULL DEFAULT 30,
        target_date VARCHAR(100),
        contact_channel TEXT,
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        admin_notes TEXT,
        approved_quota INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_ai_token_requests_user ON ai_token_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_ai_token_requests_status ON ai_token_requests(status);
    `)
    tableEnsured = true
  } catch (err) {
    console.warn('Could not auto-create ai_token_requests table:', err)
  }
}

export async function createTokenRequest(input: {
  userId: string
  teacherName: string
  schoolName?: string | null
  requestType: TokenRequestType
  packageName?: string | null
  studentCount?: number
  targetDate?: string | null
  contactChannel?: string | null
  notes?: string | null
}): Promise<TokenRequestRow> {
  await ensureTokenRequestsTable()

  const result = await queryDb<TokenRequestRow>(`
    INSERT INTO ai_token_requests (
      user_id, teacher_name, school_name, request_type,
      package_name, student_count, target_date, contact_channel, notes, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
    RETURNING *
  `, [
    input.userId,
    input.teacherName,
    input.schoolName || null,
    input.requestType,
    input.packageName || null,
    input.studentCount || 30,
    input.targetDate || null,
    input.contactChannel || null,
    input.notes || null,
  ])

  const created = result.rows[0]

  // Notify Admins
  try {
    const adminUsers = await queryDb<{ id: string }>(`
      SELECT id FROM profiles WHERE role = 'developer'
    `)
    const typeLabel = REQUEST_TYPE_LABELS[input.requestType] || input.requestType
    const schoolText = input.schoolName ? ` (${input.schoolName})` : ''

    for (const admin of adminUsers.rows) {
      await queryDb(`
        INSERT INTO notifications (user_id, title, message, type, link_url)
        VALUES ($1::uuid, $2, $3, 'warning', '/admin/token-requests')
      `, [
        admin.id,
        'คำขอเพิ่มโควต้า AI Token ใหม่',
        `ครู ${input.teacherName}${schoolText} ส่งคำขอ: ${typeLabel}`,
      ])
    }

    if (smtpConfigured()) {
      queryDb<{ email: string }>('SELECT email FROM profiles WHERE id = $1::uuid', [input.userId])
        .then(res => {
          const teacherEmail = res.rows[0]?.email || input.contactChannel || 'ไม่ระบุอีเมล'
          return sendAdminNewTokenRequestEmail({
            teacherName: input.teacherName,
            teacherEmail,
            targetClass: input.packageName || `กลุ่มนักเรียน (${input.studentCount || 30} คน)`,
            requestedQuota: input.studentCount ? input.studentCount * 50 : 1500,
            reason: input.notes || REQUEST_TYPE_LABELS[input.requestType],
          })
        })
        .catch(err => console.warn('Failed to send admin token request email:', err))
    }
  } catch (err) {
    console.warn('Failed to notify admins of token request:', err)
  }

  return created
}

export async function getTeacherTokenRequests(userId: string): Promise<TokenRequestRow[]> {
  await ensureTokenRequestsTable()
  const result = await queryDb<TokenRequestRow>(`
    SELECT * FROM ai_token_requests
    WHERE user_id = $1::uuid
    ORDER BY created_at DESC
    LIMIT 20
  `, [userId])
  return result.rows
}

export async function getAllTokenRequests(statusFilter?: string): Promise<{
  requests: TokenRequestRow[]
  counts: { total: number; pending: number; approved: number; rejected: number }
}> {
  await ensureTokenRequestsTable()

  const countsRes = await queryDb<{
    total: string
    pending: string
    approved: string
    rejected: string
  }>(`
    SELECT
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE status = 'pending')::text AS pending,
      COUNT(*) FILTER (WHERE status = 'approved')::text AS approved,
      COUNT(*) FILTER (WHERE status = 'rejected')::text AS rejected
    FROM ai_token_requests
  `)

  const row = countsRes.rows[0]
  const counts = {
    total: Number(row?.total || 0),
    pending: Number(row?.pending || 0),
    approved: Number(row?.approved || 0),
    rejected: Number(row?.rejected || 0),
  }

  let query = `SELECT * FROM ai_token_requests`
  const params: unknown[] = []

  if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
    query += ` WHERE status = $1`
    params.push(statusFilter)
  }

  query += ` ORDER BY created_at DESC LIMIT 100`

  const listRes = await queryDb<TokenRequestRow>(query, params)
  return { requests: listRes.rows, counts }
}

export async function updateTokenRequestStatus(
  id: string,
  actorId: string,
  input: {
    status: 'approved' | 'rejected'
    adminNotes?: string | null
    approvedQuota?: number | null
  }
): Promise<TokenRequestRow | null> {
  await ensureTokenRequestsTable()

  const result = await queryDb<TokenRequestRow>(`
    UPDATE ai_token_requests
    SET status = $1,
        admin_notes = $2,
        approved_quota = $3,
        updated_at = NOW()
    WHERE id = $4::uuid
    RETURNING *
  `, [
    input.status,
    input.adminNotes || null,
    input.approvedQuota || null,
    id,
  ])

  const updated = result.rows[0]
  if (!updated) return null

  // Notify the Teacher
  try {
    if (input.status === 'approved') {
      const quotaMsg = input.approvedQuota
        ? ` (+${input.approvedQuota.toLocaleString()} Requests)`
        : ''
      await queryDb(`
        INSERT INTO notifications (user_id, title, message, type, link_url)
        VALUES ($1::uuid, $2, $3, 'success', '/teacher/dashboard')
      `, [
        updated.user_id,
        'อนุมัติคำขอโควต้า AI แล้ว 🎉',
        input.adminNotes || `ผู้ดูแลระบบอนุมัติคำขอของคุณแล้ว${quotaMsg} สามารถเข้าใช้งานต่อได้ทันที`,
      ])

      if (smtpConfigured()) {
        queryDb<{ email: string; name: string }>('SELECT email, name FROM profiles WHERE id = $1::uuid', [updated.user_id])
          .then(res => {
            const teacher = res.rows[0]
            if (teacher?.email) {
              return sendTokenRequestApprovalEmail({
                to: teacher.email,
                teacherName: teacher.name || updated.teacher_name,
                targetClass: updated.package_name || 'ชั้นเรียนของคุณ',
                approvedQuota: input.approvedQuota || 1500,
                adminNotes: input.adminNotes,
              })
            }
          })
          .catch(err => console.warn('Failed to send token approval email:', err))
      }
    } else {
      await queryDb(`
        INSERT INTO notifications (user_id, title, message, type, link_url)
        VALUES ($1::uuid, $2, $3, 'info', '/teacher/dashboard')
      `, [
        updated.user_id,
        'แจ้งผลคำขอโควต้า AI',
        input.adminNotes || 'คำขอไม่ได้รับการอนุมัติ กรุณาติดต่อผู้ดูแลระบบเพื่อขอข้อมูลเพิ่มเติม',
      ])
    }

    // Record audit log
    await queryDb(`
      INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details_json)
      VALUES ($1::uuid, $2, 'ai_token_request', $3::uuid, $4::jsonb)
    `, [
      actorId,
      `token_request_${input.status}`,
      id,
      JSON.stringify({ status: input.status, adminNotes: input.adminNotes, approvedQuota: input.approvedQuota }),
    ])
  } catch (err) {
    console.warn('Failed to notify teacher or log audit for token request:', err)
  }

  return updated
}
