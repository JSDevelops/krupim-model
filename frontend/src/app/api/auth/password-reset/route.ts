import { createHash, randomBytes } from 'node:crypto'
import { hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { ApiError, apiErrorResponse, enforceRateLimit } from '../../_lib/auth'
import { passwordPolicyError } from '@/lib/passwordPolicy'
import { sendPasswordResetEmail, smtpConfigured } from '@/lib/mail'

const RESET_TTL_MINUTES = 20

function digestToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function validateNewPassword(password: string) {
  const error = passwordPolicyError(password)
  if (error) throw new ApiError(error, 400, 'WEAK_PASSWORD')
}

function getPublicAppUrl() {
  const configuredUrl = process.env.APP_URL?.trim()
  const appUrl = configuredUrl || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')
  if (!appUrl) throw new Error('APP_URL is required to send password reset email')

  const parsed = new URL(appUrl)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('APP_URL must use http or https')
  }
  return parsed.toString().replace(/\/$/, '')
}

export async function POST(request: NextRequest) {
  try {
    await enforceRateLimit(request, 4, 15 * 60_000)
    const body = await request.json() as { email?: unknown }
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || email.length > 320) throw new ApiError('กรุณาระบุอีเมลให้ถูกต้อง', 400, 'INVALID_EMAIL')

    const account = await queryDb<{ id: string; name: string }>(`
      SELECT u.id,p.name FROM app_users u JOIN profiles p ON p.id=u.id
      WHERE u.email=$1 LIMIT 1
    `, [email])
    let localResetToken: string | undefined
    let expiresAt: string | undefined
    if (account.rows[0]) {
      const rawToken = randomBytes(32).toString('base64url')
      const expiry = new Date(Date.now() + RESET_TTL_MINUTES * 60_000)
      await withTransaction(async client => {
        await client.query('UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=$1::uuid AND used_at IS NULL', [account.rows[0].id])
        await client.query(`
          INSERT INTO password_reset_tokens(user_id,token_hash,expires_at)
          VALUES($1::uuid,$2,$3::timestamptz)
        `, [account.rows[0].id, digestToken(rawToken), expiry.toISOString()])
      })
      if (smtpConfigured()) {
        try {
          const appUrl = getPublicAppUrl()
          await sendPasswordResetEmail({
            to: email,
            name: account.rows[0].name,
            resetUrl: `${appUrl}/forgot-password#token=${encodeURIComponent(rawToken)}`,
            expiresMinutes: RESET_TTL_MINUTES,
          })
        } catch (mailError) {
          console.error('Password reset email delivery failed:', mailError)
          if (process.env.NODE_ENV === 'development') {
            localResetToken = rawToken
            expiresAt = expiry.toISOString()
          } else {
            await queryDb('UPDATE password_reset_tokens SET used_at=NOW() WHERE token_hash=$1 AND used_at IS NULL', [digestToken(rawToken)])
          }
        }
      } else if (process.env.NODE_ENV === 'development') {
        localResetToken = rawToken
        expiresAt = expiry.toISOString()
      } else {
        await queryDb('UPDATE password_reset_tokens SET used_at=NOW() WHERE token_hash=$1 AND used_at IS NULL', [digestToken(rawToken)])
        console.error('Password reset email is not configured')
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'หากอีเมลนี้มีบัญชีอยู่ ระบบได้สร้างคำขอกู้คืนแล้ว',
      ...(localResetToken ? { localResetToken, expiresAt } : {}),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await enforceRateLimit(request, 6, 15 * 60_000)
    const body = await request.json() as { token?: unknown; newPassword?: unknown }
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
    if (token.length < 32 || token.length > 200) throw new ApiError('รหัสกู้คืนไม่ถูกต้องหรือหมดอายุแล้ว', 400, 'INVALID_RESET_TOKEN')
    validateNewPassword(newPassword)

    const passwordHash = await hash(newPassword, 12)
    await withTransaction(async client => {
      const reset = await client.query<{ id: string; user_id: string }>(`
        SELECT id,user_id FROM password_reset_tokens
        WHERE token_hash=$1 AND used_at IS NULL AND expires_at>NOW()
        FOR UPDATE
      `, [digestToken(token)])
      if (!reset.rows[0]) throw new ApiError('รหัสกู้คืนไม่ถูกต้องหรือหมดอายุแล้ว', 400, 'INVALID_RESET_TOKEN')

      await client.query('UPDATE app_users SET password_hash=$1,session_version=session_version+1,updated_at=NOW() WHERE id=$2::uuid', [passwordHash, reset.rows[0].user_id])
      await client.query('UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=$1::uuid AND used_at IS NULL', [reset.rows[0].user_id])
      await client.query(`
        INSERT INTO audit_logs(action,entity_type,entity_id,details_json)
        VALUES('self_password_reset','profile',$1,'{"method":"one_time_token"}'::jsonb)
      `, [reset.rows[0].user_id])
    })
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
