import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, guardApi, ApiError } from '../../../_lib/auth'
import { queryDb } from '@/lib/db'
import { sendAdminCustomReplyEmail, smtpConfigured, getAdminNotificationEmail } from '@/lib/mail'

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: ['developer'], maxRequests: 60 })
    return NextResponse.json({
      smtpConfigured: smtpConfigured(),
      adminEmail: getAdminNotificationEmail(),
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await guardApi(request, { roles: ['developer'], maxRequests: 20 })

    const body = await request.json()
    const to = typeof body.to === 'string' ? body.to.trim().toLowerCase() : ''
    const recipientName = typeof body.recipientName === 'string' ? body.recipientName.trim() : 'ผู้ใช้งาน'
    const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      throw new ApiError('ที่อยู่อีเมลผู้รับไม่ถูกต้อง', 400, 'INVALID_EMAIL')
    }
    if (!subject) {
      throw new ApiError('กรุณาระบุหัวข้ออีเมล', 400, 'MISSING_SUBJECT')
    }
    if (!message) {
      throw new ApiError('กรุณากรอกข้อความตอบกลับ', 400, 'MISSING_MESSAGE')
    }

    if (!smtpConfigured()) {
      throw new ApiError('ระบบอีเมล SMTP ยังไม่ได้กำหนดค่าในเซิร์ฟเวอร์', 503, 'SMTP_NOT_CONFIGURED')
    }

    const adminProfile = await queryDb<{ name: string }>(
      'SELECT name FROM profiles WHERE id = $1::uuid',
      [admin.id]
    )
    const adminName = adminProfile.rows[0]?.name || 'นางสาวอนัญญา วิชัยผิน (ครูพิม)'

    await sendAdminCustomReplyEmail({
      to,
      recipientName,
      subject,
      message,
      adminName,
    })

    // Log to audit logs
    await queryDb(
      `INSERT INTO audit_logs (actor_id, action, entity_type, details_json)
       VALUES ($1::uuid, 'send_email_reply', 'mail', $2::jsonb)`,
      [
        admin.id,
        JSON.stringify({ to, recipientName, subject, messageSnippet: message.slice(0, 100) }),
      ]
    )

    return NextResponse.json({
      ok: true,
      message: 'ส่งอีเมลตอบกลับเรียบร้อยแล้ว',
      to,
      subject,
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

