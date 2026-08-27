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
