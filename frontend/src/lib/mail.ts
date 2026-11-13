import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'
import { queryDb } from '@/lib/db'
import { decryptSecret } from '@/lib/aiSettings'

type MailRuntime = typeof globalThis & { __krupimMailer?: Transporter }
const mailRuntime = globalThis as MailRuntime

function booleanEnv(value: string | undefined) {
  return value?.trim().toLowerCase() === 'true'
}

export type SmtpRuntimeConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  adminEmail: string
  source: 'database' | 'environment' | 'none'
  hasPassword: boolean
  passwordHint: string | null
}

let cachedSmtpConfig: { expiresAt: number; config: SmtpRuntimeConfig } | null = null

export function invalidateSmtpCache() {
  cachedSmtpConfig = null
  mailRuntime.__krupimMailer = undefined
}

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST?.trim() || cachedSmtpConfig?.config.host)
}

export async function isSmtpReady(): Promise<boolean> {
  try {
    const config = await getEffectiveSmtpConfig()
    if (!config.host) return false
    if (config.host === '127.0.0.1' || config.host === 'localhost') return true
    return Boolean(config.user && config.hasPassword)
  } catch {
    return false
  }
}

export async function getEffectiveSmtpConfig(forceFresh = false): Promise<SmtpRuntimeConfig> {
  const now = Date.now()
  if (!forceFresh && cachedSmtpConfig && cachedSmtpConfig.expiresAt > now) {
    return cachedSmtpConfig.config
  }

  let dbConfig: Record<string, unknown> | null = null
  try {
    const res = await queryDb<{ value_json: Record<string, unknown> }>(
      `SELECT value_json FROM system_settings WHERE setting_key = 'smtp' LIMIT 1`
    )
    dbConfig = res.rows[0]?.value_json || null
  } catch {
    // If DB is offline or table missing, fallback to environment
  }

  const envHost = process.env.SMTP_HOST?.trim()
  const dbHost = typeof dbConfig?.host === 'string' ? dbConfig.host.trim() : ''
  const host = dbHost || envHost || 'smtp.gmail.com'

  const envPort = Number(process.env.SMTP_PORT || 465)
  const dbPort = typeof dbConfig?.port === 'number' ? dbConfig.port : undefined
  const port = dbPort || envPort

  const secure = dbConfig?.secure !== undefined
    ? Boolean(dbConfig.secure)
    : (process.env.SMTP_SECURE ? booleanEnv(process.env.SMTP_SECURE) : port === 465)

  const envUser = process.env.SMTP_USER?.trim()
  const dbUser = typeof dbConfig?.user === 'string' ? dbConfig.user.trim() : ''
  const user = dbUser || envUser || 'krupim@ktc.ac.th'

  let pass = ''
  let passwordHint: string | null = null
  let source: SmtpRuntimeConfig['source'] = 'none'

  if (typeof dbConfig?.passEncrypted === 'string' && dbConfig.passEncrypted) {
    try {
      pass = decryptSecret(dbConfig.passEncrypted)
      source = 'database'
      passwordHint = typeof dbConfig?.passHint === 'string'
        ? dbConfig.passHint
        : (pass ? `••••${pass.slice(-4)}` : null)
    } catch {
      // ignore decryption failure, fallback
    }
  }

  if (!pass && process.env.SMTP_PASS) {
    pass = process.env.SMTP_PASS.trim()
    source = 'environment'
    passwordHint = `••••${pass.slice(-4)}`
  }

  const envFrom = process.env.SMTP_FROM?.trim()
  const dbFrom = typeof dbConfig?.from === 'string' ? dbConfig.from.trim() : ''
  const from = dbFrom || envFrom || `KruPIM FINE Model <${user}>`

  const envAdminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim()
  const dbAdminEmail = typeof dbConfig?.adminEmail === 'string' ? dbConfig.adminEmail.trim() : ''
  const adminEmail = dbAdminEmail || envAdminEmail || 'krupim@ktc.ac.th'

  const config: SmtpRuntimeConfig = {
    host,
    port,
    secure,
    user,
    pass,
    from,
    adminEmail,
    source,
    hasPassword: Boolean(pass),
    passwordHint,
  }

  cachedSmtpConfig = {
    expiresAt: now + 30_000,
    config,
  }

  return config
}

export async function getMailTransporter() {
  const config = await getEffectiveSmtpConfig()
  if (!config.host) throw new Error('SMTP_HOST is not configured')

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    ...(config.user && config.pass ? { auth: { user: config.user, pass: config.pass } } : {}),
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  })
}

function transporter() {
  if (mailRuntime.__krupimMailer) return mailRuntime.__krupimMailer
  const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT || 465)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error('SMTP_PORT is invalid')
  const user = process.env.SMTP_USER?.trim() || 'krupim@ktc.ac.th'
  const pass = process.env.SMTP_PASS
  mailRuntime.__krupimMailer = nodemailer.createTransport({
    host,
    port,
    secure: booleanEnv(process.env.SMTP_SECURE) || port === 465,
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

export function getAdminNotificationEmail() {
  return cachedSmtpConfig?.config.adminEmail || process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || 'krupim@ktc.ac.th'
}

export async function sendPasswordResetEmail(input: {
  to: string
  name: string
  resetUrl: string
  expiresMinutes: number
}) {
  const safeName = escapeHtml(input.name || 'ผู้ใช้งาน')
  const safeUrl = escapeHtml(input.resetUrl)
  const config = await getEffectiveSmtpConfig()
  const transport = await getMailTransporter()
  return transport.sendMail({
    from: config.from,
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
  const config = await getEffectiveSmtpConfig()
  const transport = await getMailTransporter()

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

  return transport.sendMail({
    from: config.from,
    to: input.to,
    subject,
    text: textContent,
    html: htmlContent,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
}

/**
 * 1. อีเมลแจ้งผลอนุมัติบัญชีครูผู้สอน (Teacher Account Approval Welcome Email)
 */
export async function sendTeacherApprovalEmail(input: {
  to: string
  teacherName: string
}) {
  const safeTeacherName = escapeHtml(input.teacherName || 'คุณครูผู้สอน')
  const appUrl = getPublicAppUrl()
  const loginUrl = `${appUrl}/role-select`
  const guideUrl = `${appUrl}/docs`
  const from = process.env.SMTP_FROM?.trim() || 'KruPIM FINE Model <no-reply@krupim.local>'
  const subject = '[FINE Model] บัญชีครูผู้สอนของคุณได้รับการอนุมัติเรียบร้อยแล้ว — ยินดีต้อนรับสู่ระบบจัดการเรียนรู้'

  const textContent = `เรียน คุณครู ${input.teacherName},\n\nผู้ดูแลระบบแพลตฟอร์ม FINE MODEL (AR 3D + AI Scan) ขอเรียนให้ทราบว่า บัญชีผู้ใช้งานครูผู้สอนของคุณได้รับการตรวจสอบและอนุมัติเข้าใช้งานเรียบร้อยแล้ว\n\nคุณครูสามารถเข้าสู่ระบบ Teacher Console ได้ทันทีที่:\n${loginUrl}\n\nสิทธิประโยชน์ที่คุณครูสามารถใช้งานได้:\n1. สร้างและจัดการห้องเรียน พร้อมสร้างลิงก์รหัสเชิญนักเรียน\n2. มอบหมายบทเรียนและกิจกรรมตามโมเดล FINE (F-I-N-E)\n3. ตรวจงาน ติดตามคะแนนสมรรถนะ KSA-C และรายงานผลประเมินรายบุคคล\n4. คลังคำศัพท์และสื่อจำลองเสมือนจริง AR 3D\n\nคู่มือการใช้งาน: ${guideUrl}\n\nด้วยความเคารพอย่างสูง,\nนางสาวอนัญญา วิชัยผิน (ครูพิม)\nแผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์`

  const htmlContent = `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;max-width:600px;margin:auto;padding:28px;border:1px solid #dce8e1;border-radius:18px;background:#ffffff;color:#173c31">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <span style="font-size:12px;font-weight:bold;color:#205c43;background:#e5f3eb;padding:4px 12px;border-radius:20px;letter-spacing:0.06em">FINE MODEL · AR 3D + AI SCAN</span>
      </div>
      <h2 style="font-size:22px;color:#183b2a;margin:0 0 16px;line-height:1.4">🎉 บัญชีครูผู้สอนของคุณได้รับการอนุมัติแล้ว</h2>
      <p style="font-size:15px;line-height:1.6;margin:0 0 14px">เรียน <strong>คุณครู ${safeTeacherName}</strong>,</p>
      <p style="font-size:14px;line-height:1.65;margin:0 0 18px;color:#3d5649">
        ผู้ดูแลระบบแพลตฟอร์ม <strong>FINE MODEL (AR 3D + AI Scan)</strong> ขอเรียนให้ทราบว่า บัญชีผู้ใช้งานครูผู้สอนของคุณได้รับการตรวจสอบและ <strong style="color:#205c43">อนุมัติเข้าใช้งานระบบเรียบร้อยแล้ว</strong>
      </p>

      <div style="background:#f7faf8;border:1px solid #e1ebe5;border-radius:12px;padding:16px 20px;margin-bottom:22px">
        <h4 style="margin:0 0 10px;color:#1c4535;font-size:14px">✨ สิทธิประโยชน์ที่คุณครูสามารถใช้งานได้:</h4>
        <ul style="margin:0;padding-left:20px;font-size:13.5px;color:#455e51;line-height:1.7">
          <li>สร้างและจัดการห้องเรียน พร้อมสร้างลิงก์รหัสเชิญนักเรียนเข้าห้องเรียน</li>
          <li>มอบหมายบทเรียนและกิจกรรมตามกระบวนการ FINE (F, I, N, E)</li>
          <li>ตรวจงาน ติดตามคะแนนสมรรถนะ 4 มิติ (KSA-C Framework) รายบุคคล</li>
          <li>คลังคำศัพท์วิชาชีพ และคลังโมเดลเสมือนจริง AR 3D พร้อมระบบสแกน AI</li>
        </ul>
      </div>

      <div style="margin:26px 0 20px;text-align:center">
        <a href="${loginUrl}" target="_blank" style="display:inline-block;padding:13px 32px;background:#215c43;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:bold;font-size:15px;box-shadow:0 4px 14px rgba(33,92,67,0.28)">
          เข้าสู่ระบบ Teacher Console →
        </a>
      </div>

      <p style="font-size:13px;color:#6b8276;text-align:center;margin:0 0 24px">
        หรือเข้าสู่ระบบที่ <a href="${loginUrl}" style="color:#215c43">${loginUrl}</a>
      </p>

      <hr style="border:none;border-top:1px dashed #d5e2dc;margin:24px 0" />

      <div style="font-size:12.5px;color:#63786e;line-height:1.6">
        <p style="margin:0 0 4px"><strong>ด้วยความเคารพอย่างสูง,</strong></p>
        <p style="margin:0 0 2px;color:#1c3c2f;font-weight:bold">นางสาวอนัญญา วิชัยผิน (ครูพิม)</p>
        <p style="margin:0">แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์ · ผู้ดูแลระบบ FINE MODEL</p>
      </div>
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

/**
 * 2. อีเมลแจ้งผลอนุมัติขยายโควตา AI (AI Token Quota Approved)
 */
export async function sendTokenRequestApprovalEmail(input: {
  to: string
  teacherName: string
  targetClass?: string
  approvedQuota: number
  adminNotes?: string | null
}) {
  const safeTeacherName = escapeHtml(input.teacherName || 'คุณครูผู้สอน')
  const safeClassName = escapeHtml(input.targetClass || 'ห้องเรียนของคุณ')
  const safeNotes = input.adminNotes ? escapeHtml(input.adminNotes) : ''
  const appUrl = getPublicAppUrl()
  const dashboardUrl = `${appUrl}/teacher/dashboard`
  const from = process.env.SMTP_FROM?.trim() || 'KruPIM FINE Model <no-reply@krupim.local>'
  const subject = `[FINE Model] อนุมัติคำขอขยายโควตา AI เรียบร้อยแล้ว (+${input.approvedQuota.toLocaleString()} ครั้ง) สำหรับ ${input.targetClass || 'ห้องเรียน'}`

  const textContent = `เรียน คุณครู ${input.teacherName},\n\nตามที่คุณครูได้ส่งคำขอขยายโควตาการใช้งาน AI Scan สำหรับนักเรียนห้อง ${input.targetClass || 'ห้องเรียน'} นั้น\n\nผู้ดูแลระบบได้ดำเนินการตรวจสอบและ อนุมัติโควตาเพิ่มเติมจำนวน +${input.approvedQuota.toLocaleString()} ครั้ง ให้เรียบร้อยแล้ว\n${input.adminNotes ? `หมายเหตุจากผู้ดูแลระบบ: ${input.adminNotes}\n` : ''}\nคุณครูสามารถตรวจสอบสถานะได้ที่:\n${dashboardUrl}\n\nทีมผู้ดูแลระบบ FINE MODEL`

  const htmlContent = `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;max-width:600px;margin:auto;padding:28px;border:1px solid #dce8e1;border-radius:18px;background:#ffffff;color:#173c31">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <span style="font-size:12px;font-weight:bold;color:#205c43;background:#e5f3eb;padding:4px 12px;border-radius:20px;letter-spacing:0.06em">FINE MODEL · AI SCAN QUOTA</span>
      </div>
      <h2 style="font-size:22px;color:#183b2a;margin:0 0 16px;line-height:1.4">✨ อนุมัติคำขอขยายโควตา AI เรียบร้อยแล้ว</h2>
      <p style="font-size:15px;line-height:1.6;margin:0 0 14px">เรียน <strong>คุณครู ${safeTeacherName}</strong>,</p>
      <p style="font-size:14px;line-height:1.65;margin:0 0 18px;color:#3d5649">
        ตามที่คุณครูได้ส่งคำขอขยายโควตาการใช้งานปัญญาประดิษฐ์ (Google Gemini AI Scan) สำหรับกิจกรรมการเรียนรู้ของนักเรียนห้อง <strong>${safeClassName}</strong> นั้น
      </p>

      <div style="background:#f4fbf6;border:1.5px solid #cce5d6;border-radius:14px;padding:20px;text-align:center;margin-bottom:20px">
        <span style="font-size:12.5px;color:#537765;text-transform:uppercase;letter-spacing:0.05em;font-weight:bold">โควตาที่ได้รับอนุมัติเพิ่มเติม</span>
        <div style="font-size:32px;font-weight:900;color:#215c43;margin:6px 0">+${input.approvedQuota.toLocaleString()} <span style="font-size:18px;font-weight:600">ครั้ง</span></div>
        <span style="font-size:13px;color:#6b8878">พร้อมใช้งานสำหรับนักเรียนในห้องเรียนทันที</span>
      </div>

      ${safeNotes ? `
        <div style="background:#fbfbf9;border:1px solid #e5ebe7;border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:13px;color:#45594e">
          <strong style="color:#1d3d2f">💬 หมายเหตุจากผู้ดูแลระบบ:</strong> ${safeNotes}
        </div>
      ` : ''}

      <div style="margin:24px 0 18px;text-align:center">
        <a href="${dashboardUrl}" target="_blank" style="display:inline-block;padding:12px 28px;background:#215c43;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:14px;box-shadow:0 4px 12px rgba(33,92,67,0.25)">
          เข้าสู่หน้าแดชบอร์ดครูผู้สอน →
        </a>
      </div>

      <hr style="border:none;border-top:1px dashed #d5e2dc;margin:24px 0" />
      <p style="font-size:12.5px;color:#788e83;text-align:center;margin:0">
        ทีมผู้ดูแลระบบ FINE MODEL · แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์
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

/**
 * 3. อีเมลแจ้งเตือน Admin เมื่อมีครูใหม่สมัครสมาชิก (Alert Admin on New Teacher Pending)
 */
export async function sendAdminNewTeacherPendingEmail(input: {
  teacherName: string
  teacherEmail: string
  schoolName: string
}) {
  const adminEmail = getAdminNotificationEmail()
  const safeTeacherName = escapeHtml(input.teacherName)
  const safeTeacherEmail = escapeHtml(input.teacherEmail)
  const safeSchoolName = escapeHtml(input.schoolName)
  const appUrl = getPublicAppUrl()
  const reviewUrl = `${appUrl}/admin/users?tab=pending`
  const from = process.env.SMTP_FROM?.trim() || 'KruPIM FINE Model <no-reply@krupim.local>'
  const subject = `[FINE Model Admin] มีคุณครูสมัครสมาชิกใหม่รอการอนุมัติ: ${input.teacherName} (${input.schoolName})`

  const textContent = `เรียน ครูพิม (Admin),\n\nมีคุณครูสมัครสมาชิกใหม่รอการอนุมัติในระบบ FINE MODEL:\n- ชื่อ: ${input.teacherName}\n- อีเมล: ${input.teacherEmail}\n- สถานศึกษา: ${input.schoolName}\n\nคุณครูพิมสามารถเปิดตรวจสอบและกดอนุมัติได้ที่:\n${reviewUrl}\n\nระบบ FINE MODEL Platform`

  const htmlContent = `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;max-width:600px;margin:auto;padding:26px;border:1px solid #dce8e1;border-radius:18px;background:#ffffff;color:#173c31">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span style="font-size:11.5px;font-weight:bold;color:#8f6b1e;background:#fcf4e4;padding:4px 10px;border-radius:20px;letter-spacing:0.05em">ADMIN NOTIFICATION</span>
      </div>
      <h3 style="font-size:20px;color:#183b2a;margin:0 0 16px">👤 มีคุณครูสมัครสมาชิกใหม่รอการอนุมัติ</h3>
      <p style="font-size:14.5px;line-height:1.6;margin:0 0 16px">สวัสดี ครูพิม (Admin), มีคุณครูลงทะเบียนขอเปิดใช้งานบัญชีครูผู้สอนในระบบ มีข้อมูลดังนี้:</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13.5px">
        <tr style="border-bottom:1px solid #edf3ef">
          <td style="padding:9px 0;color:#6d8076;width:120px">ชื่อ-นามสกุล:</td>
          <td style="padding:9px 0;font-weight:bold;color:#1c3d2f">${safeTeacherName}</td>
        </tr>
        <tr style="border-bottom:1px solid #edf3ef">
          <td style="padding:9px 0;color:#6d8076">อีเมลติดต่อ:</td>
          <td style="padding:9px 0;font-weight:bold;color:#1c3d2f">${safeTeacherEmail}</td>
        </tr>
        <tr style="border-bottom:1px solid #edf3ef">
          <td style="padding:9px 0;color:#6d8076">สถานศึกษา/สังกัด:</td>
          <td style="padding:9px 0;font-weight:bold;color:#1c3d2f">${safeSchoolName}</td>
        </tr>
      </table>

      <div style="margin:24px 0 18px;text-align:center">
        <a href="${reviewUrl}" target="_blank" style="display:inline-block;padding:12px 28px;background:#215c43;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:14px;box-shadow:0 4px 12px rgba(33,92,67,0.25)">
          เปิดหน้า Admin Console เพื่ออนุมัติ →
        </a>
      </div>

      <p style="font-size:12px;color:#85968d;text-align:center;margin:0">
        หรือเข้าสู่ระบบที่ <a href="${reviewUrl}" style="color:#215c43">${reviewUrl}</a>
      </p>
    </div>
  `

  return transporter().sendMail({
    from,
    to: adminEmail,
    subject,
    text: textContent,
    html: htmlContent,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
}

/**
 * 4. อีเมลแจ้งเตือน Admin เมื่อมีคำขอโควตา AI ใหม่ (Alert Admin on New Token Request)
 */
export async function sendAdminNewTokenRequestEmail(input: {
  teacherName: string
  teacherEmail: string
  targetClass: string
  requestedQuota: number
  reason?: string
}) {
  const adminEmail = getAdminNotificationEmail()
  const safeTeacherName = escapeHtml(input.teacherName)
  const safeTeacherEmail = escapeHtml(input.teacherEmail)
  const safeTargetClass = escapeHtml(input.targetClass)
  const safeReason = input.reason ? escapeHtml(input.reason) : 'ไม่ระบุเหตุผล'
  const appUrl = getPublicAppUrl()
  const reviewUrl = `${appUrl}/admin/token-requests`
  const from = process.env.SMTP_FROM?.trim() || 'KruPIM FINE Model <no-reply@krupim.local>'
  const subject = `[FINE Model Admin] มีคำขอโควตา AI ใหม่: คุณครู ${input.teacherName} (ขอเพิ่ม ${input.requestedQuota.toLocaleString()} ครั้ง)`

  const textContent = `เรียน ครูพิม (Admin),\n\nมีคุณครูส่งคำขอขยายโควตา AI ใหม่ในระบบ FINE MODEL:\n- คุณครูผู้ขอ: ${input.teacherName} (${input.teacherEmail})\n- ชั้นเรียน: ${input.targetClass}\n- จำนวนที่ขอ: +${input.requestedQuota.toLocaleString()} คำขอ\n- เหตุผล: ${input.reason || 'ไม่ระบุ'}\n\nคุณครูพิมสามารถเปิดตรวจสอบและอนุมัติได้ที่:\n${reviewUrl}\n\nระบบ FINE MODEL Platform`

  const htmlContent = `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;max-width:600px;margin:auto;padding:26px;border:1px solid #dce8e1;border-radius:18px;background:#ffffff;color:#173c31">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span style="font-size:11.5px;font-weight:bold;color:#8f6b1e;background:#fcf4e4;padding:4px 10px;border-radius:20px;letter-spacing:0.05em">TOKEN REQUEST ALERT</span>
      </div>
      <h3 style="font-size:20px;color:#183b2a;margin:0 0 16px">⚡ มีคำขอขยายโควตา AI ใหม่</h3>
      <p style="font-size:14.5px;line-height:1.6;margin:0 0 16px">สวัสดี ครูพิม (Admin), มีคุณครูส่งคำขอขยายโควตาการใช้งานปัญญาประดิษฐ์ AI Scan มีรายละเอียดดังนี้:</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13.5px">
        <tr style="border-bottom:1px solid #edf3ef">
          <td style="padding:9px 0;color:#6d8076;width:120px">คุณครูผู้ขอ:</td>
          <td style="padding:9px 0;font-weight:bold;color:#1c3d2f">${safeTeacherName} (${safeTeacherEmail})</td>
        </tr>
        <tr style="border-bottom:1px solid #edf3ef">
          <td style="padding:9px 0;color:#6d8076">ห้องเรียนเป้าหมาย:</td>
          <td style="padding:9px 0;font-weight:bold;color:#1c3d2f">${safeTargetClass}</td>
        </tr>
        <tr style="border-bottom:1px solid #edf3ef">
          <td style="padding:9px 0;color:#6d8076">จำนวนที่ขอเพิ่ม:</td>
          <td style="padding:9px 0;font-weight:bold;color:#215c43;font-size:15px">+${input.requestedQuota.toLocaleString()} ครั้ง</td>
        </tr>
        <tr style="border-bottom:1px solid #edf3ef">
          <td style="padding:9px 0;color:#6d8076">เหตุผลความจำเป็น:</td>
          <td style="padding:9px 0;color:#3d5248">${safeReason}</td>
        </tr>
      </table>

      <div style="margin:24px 0 18px;text-align:center">
        <a href="${reviewUrl}" target="_blank" style="display:inline-block;padding:12px 28px;background:#215c43;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:14px;box-shadow:0 4px 12px rgba(33,92,67,0.25)">
          เปิดหน้าอนุมัติโควตา AI →
        </a>
      </div>

      <p style="font-size:12px;color:#85968d;text-align:center;margin:0">
        หรือเข้าสู่ระบบที่ <a href="${reviewUrl}" style="color:#215c43">${reviewUrl}</a>
      </p>
    </div>
  `

  return transporter().sendMail({
    from,
    to: adminEmail,
    subject,
    text: textContent,
    html: htmlContent,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
}

/**
 * 5. อีเมลตอบกลับข้อความ/การสอบถามจากผู้ดูแลระบบ (Admin Support Reply)
 */
export async function sendAdminCustomReplyEmail(input: {
  to: string
  recipientName: string
  subject: string
  message: string
  adminName?: string
}) {
  const safeRecipientName = escapeHtml(input.recipientName || 'ผู้ใช้งาน')
  const safeMessage = escapeHtml(input.message).replace(/\n/g, '<br />')
  const safeSubject = escapeHtml(input.subject)
  const safeAdminName = escapeHtml(input.adminName || 'นางสาวอนัญญา วิชัยผิน (ครูพิม)')
  const adminEmail = getAdminNotificationEmail()
  const from = process.env.SMTP_FROM?.trim() || 'KruPIM FINE Model <no-reply@krupim.local>'
  const subject = `[FINE Model] ${input.subject}`

  const textContent = `สวัสดี ${input.recipientName || 'ผู้ใช้งาน'},\n\nข้อความตอบกลับจากผู้ดูแลระบบ FINE MODEL ในหัวข้อ: "${input.subject}":\n\n${input.message}\n\nหากมีข้อสงสัยเพิ่มเติม สามารถติดต่อสอบถามได้ที่ ${adminEmail}\n\nด้วยความเคารพอย่างสูง,\n${input.adminName || 'นางสาวอนัญญา วิชัยผิน (ครูพิม)'}\nผู้ดูแลระบบ FINE MODEL Platform`

  const htmlContent = `
    <div style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;max-width:600px;margin:auto;padding:28px;border:1px solid #dce8e1;border-radius:18px;background:#ffffff;color:#173c31">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <span style="font-size:12px;font-weight:bold;color:#205c43;background:#e5f3eb;padding:4px 12px;border-radius:20px;letter-spacing:0.06em">FINE MODEL · SUPPORT &amp; INQUIRY</span>
      </div>
      <h3 style="font-size:20px;color:#183b2a;margin:0 0 16px;line-height:1.4">${safeSubject}</h3>
      <p style="font-size:15px;line-height:1.6;margin:0 0 14px">สวัสดี <strong>${safeRecipientName}</strong>,</p>
      
      <div style="background:#f9fbf9;border-left:4px solid #215c43;padding:16px 20px;margin:18px 0 24px;border-radius:4px 12px 12px 4px;font-size:14.5px;color:#2a4538;line-height:1.7">
        ${safeMessage}
      </div>

      <p style="font-size:13px;color:#6b8276;line-height:1.6;margin:0 0 20px">
        หากมีข้อสงสัยเพิ่มเติม ท่านสามารถติดต่อผู้ดูแลระบบได้โดยตรงที่อีเมล <a href="mailto:${adminEmail}" style="color:#215c43;font-weight:bold">${adminEmail}</a>
      </p>

      <hr style="border:none;border-top:1px dashed #d5e2dc;margin:24px 0" />

      <div style="font-size:12.5px;color:#63786e;line-height:1.6">
        <p style="margin:0 0 4px"><strong>ด้วยความเคารพอย่างสูง,</strong></p>
        <p style="margin:0 0 2px;color:#1c3c2f;font-weight:bold">${safeAdminName}</p>
        <p style="margin:0">แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์ · ผู้ดูแลระบบ FINE MODEL</p>
      </div>
    </div>
  `

  return transporter().sendMail({
    from,
    to: input.to,
    replyTo: adminEmail,
    subject,
    text: textContent,
    html: htmlContent,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
}
