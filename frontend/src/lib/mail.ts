import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'

type MailRuntime = typeof globalThis & { __krupimMailer?: Transporter }
const mailRuntime = globalThis as MailRuntime

function booleanEnv(value: string | undefined) {
  return value?.trim().toLowerCase() === 'true'
}

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST?.trim())
}

function transporter() {
  if (mailRuntime.__krupimMailer) return mailRuntime.__krupimMailer
  const host = process.env.SMTP_HOST?.trim()
  if (!host) throw new Error('SMTP_HOST is not configured')
  const port = Number(process.env.SMTP_PORT || 1025)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error('SMTP_PORT is invalid')
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS
  mailRuntime.__krupimMailer = nodemailer.createTransport({
    host,
    port,
    secure: booleanEnv(process.env.SMTP_SECURE),
    ...(user && pass ? { auth: { user, pass } } : {}),
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
  })
  return mailRuntime.__krupimMailer
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[character] || character)
}

export function getPublicAppUrl() {
  const configuredUrl = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredUrl) {
    try {
      const parsed = new URL(configuredUrl)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString().replace(/\/$/, '')
      }
    } catch {
      // ignore
    }
  }
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://www.krupim-finemodel3d-ar.com'
}

export async function sendPasswordResetEmail(input: {
  to: string
  name: string
  resetUrl: string
  expiresMinutes: number
}) {
  const safeName = escapeHtml(input.name || 'ผู้ใช้งาน')
  const safeUrl = escapeHtml(input.resetUrl)
  const from = process.env.SMTP_FROM?.trim() || 'KruPIM FINE Model <no-reply@krupim.local>'
  return transporter().sendMail({
    from,
    to: input.to,
    subject: 'ตั้งรหัสผ่านใหม่สำหรับ KruPIM FINE Model',
    text: `สวัสดี ${input.name || 'ผู้ใช้งาน'}\n\nเปิดลิงก์นี้เพื่อตั้งรหัสผ่านใหม่ภายใน ${input.expiresMinutes} นาที:\n${input.resetUrl}\n\nหากคุณไม่ได้ส่งคำขอนี้ สามารถละเว้นอีเมลฉบับนี้ได้`,
    html: `<div style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:auto;color:#173c31"><p style="font-size:13px;color:#987322;letter-spacing:.08em">KRUPIM · FINE MODEL</p><h1 style="font-size:24px">ตั้งรหัสผ่านใหม่</h1><p>สวัสดี ${safeName}</p><p>ระบบได้รับคำขอตั้งรหัสผ่านใหม่ ลิงก์นี้มีอายุ ${input.expiresMinutes} นาที</p><p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#194f3e;color:#fff;text-decoration:none">ตั้งรหัสผ่านใหม่</a></p><p style="font-size:13px;color:#687770;overflow-wrap:anywhere">หากปุ่มไม่ทำงาน ให้เปิดลิงก์นี้: ${safeUrl}</p><p style="font-size:13px;color:#687770">หากคุณไม่ได้ส่งคำขอนี้ สามารถละเว้นอีเมลฉบับนี้ได้</p></div>`,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
}

export async function sendAssignmentSubmissionEmail(input: {
  to: string
  teacherName: string
  studentName: string
  studentEmail?: string
  className: string
  assignmentTitle: string
  attachmentName?: string | null
  attachmentUrl?: string | null
  submittedAt: string
  reviewUrl: string
}) {
  const safeTeacherName = escapeHtml(input.teacherName || 'คุณครูผู้สอน')
  const safeStudentName = escapeHtml(input.studentName || 'นักเรียน')
  const safeClassName = escapeHtml(input.className || 'ชั้นเรียน')
  const safeAssignmentTitle = escapeHtml(input.assignmentTitle || 'งานมอบหมาย')
  const safeAttachmentName = input.attachmentName ? escapeHtml(input.attachmentName) : ''
  const safeAttachmentUrl = input.attachmentUrl ? escapeHtml(input.attachmentUrl) : ''
  const safeReviewUrl = escapeHtml(input.reviewUrl)
  const from = process.env.SMTP_FROM?.trim() || 'KruPIM FINE Model <no-reply@krupim.local>'

  const subject = `[KruPIM FINE Model] นักเรียนส่งงาน: ${input.studentName} (${input.className}) - ${input.assignmentTitle}`

  const attachmentHtml = safeAttachmentName ? `
    <div style="margin:16px 0;padding:12px 16px;background:#f0f7f3;border:1px solid #c9e2d3;border-radius:10px">
      <p style="margin:0;font-size:13px;color:#244e38;font-weight:bold">📎 ไฟล์แนบของนักเรียน:</p>
      <p style="margin:4px 0 0;font-size:14px;color:#183b2a;word-break:break-all">${safeAttachmentName}</p>
      ${safeAttachmentUrl ? `<p style="margin:8px 0 0"><a href="${safeAttachmentUrl}" target="_blank" style="color:#206a44;font-size:13px;font-weight:bold;text-decoration:underline">ดาวน์โหลดหรือเปิดดูไฟล์แนบ</a></p>` : ''}
    </div>
  ` : '<p style="color:#77857e;font-size:13px">ไม่มีไฟล์แนบ</p>'

  const textContent = `สวัสดี ${input.teacherName}\n\nมีนักเรียนส่งงานในระบบ KruPIM FINE Model ดังนี้:\n- นักเรียน: ${input.studentName}\n- ชั้นเรียน: ${input.className}\n- ชื่องาน: ${input.assignmentTitle}\n${input.attachmentName ? `- ไฟล์แนบ: ${input.attachmentName}\n` : ''}\nคุณครูสามารถเปิดตรวจงานและให้คะแนนได้ที่ลิงก์นี้:\n${input.reviewUrl}`

  const htmlContent = `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;max-width:580px;margin:auto;padding:24px;border:1px solid #dce8e1;border-radius:16px;background:#ffffff;color:#1c3d2f">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span style="font-size:12px;font-weight:bold;color:#2d7250;background:#e5f3eb;padding:4px 10px;border-radius:20px;letter-spacing:0.05em">KRUPIM · FINE MODEL 3D AR</span>
      </div>
      <h2 style="font-size:20px;color:#183b2a;margin:0 0 16px">📢 มีนักเรียนส่งงานใหม่</h2>
      <p style="font-size:15px;line-height:1.6;margin:0 0 14px">สวัสดี <strong>${safeTeacherName}</strong>,</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 16px;color:#3d5649">
        นักเรียนได้ส่งงานตามกิจกรรมการเรียนรู้ FINE Model เรียบร้อยแล้ว มีรายละเอียดดังนี้:
      </p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px">
        <tr style="border-bottom:1px solid #edf3ef">
          <td style="padding:8px 0;color:#6d8076;width:110px">นักเรียนผู้ส่ง:</td>
          <td style="padding:8px 0;font-weight:bold;color:#1c3d2f">${safeStudentName}</td>
        </tr>
        <tr style="border-bottom:1px solid #edf3ef">
          <td style="padding:8px 0;color:#6d8076">ห้องเรียน:</td>
          <td style="padding:8px 0;font-weight:bold;color:#1c3d2f">${safeClassName}</td>
        </tr>
        <tr style="border-bottom:1px solid #edf3ef">
          <td style="padding:8px 0;color:#6d8076">ชื่องาน:</td>
          <td style="padding:8px 0;font-weight:bold;color:#1c3d2f">${safeAssignmentTitle}</td>
        </tr>
      </table>

      ${attachmentHtml}

      <div style="margin:24px 0 18px;text-align:center">
        <a href="${safeReviewUrl}" style="display:inline-block;padding:12px 28px;background:#246947;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:14px;box-shadow:0 4px 12px rgba(36,105,71,0.25)">
          เข้าตรวจงานและให้คะแนน
        </a>
      </div>

      <p style="font-size:12px;color:#85968d;text-align:center;margin:0">
        หรือเข้าสู่ระบบที่ <a href="${safeReviewUrl}" style="color:#2d7250">${safeReviewUrl}</a>
      </p>
    </div>
  `

  return transporter().sendMail({
    from,
    to: input.to,
    subject,
    text: textContent,
    html: htmlContent,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
}
