import { compare, hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { clearSessionCookie } from '@/lib/session'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'
import { passwordPolicyError } from '@/lib/passwordPolicy'

export async function PATCH(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['developer'], maxRequests: 8 })
    const body = await request.json() as { currentPassword?: unknown; newPassword?: unknown }
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
    const passwordError = passwordPolicyError(newPassword)
    if (passwordError) throw new ApiError(passwordError, 400, 'WEAK_PASSWORD')
    const account = await queryDb<{ password_hash: string }>('SELECT password_hash FROM app_users WHERE id=$1::uuid LIMIT 1', [user.id])
    if (!account.rows[0] || !await compare(currentPassword, account.rows[0].password_hash)) {
      throw new ApiError('รหัสผ่านปัจจุบันไม่ถูกต้อง', 400, 'INVALID_PASSWORD')
    }
    const passwordHash = await hash(newPassword, 12)
    await withTransaction(async client => {
      await client.query('UPDATE app_users SET password_hash=$1,session_version=session_version+1,updated_at=NOW() WHERE id=$2::uuid', [passwordHash, user.id])
      await client.query(`INSERT INTO audit_logs(actor_id,action,entity_type,entity_id) VALUES($1::uuid,'change_password','profile',$1::text)`, [user.id])
    })
    const response = NextResponse.json({ ok: true, sessionRevoked: true })
    clearSessionCookie(response)
    return response
  } catch (error) {
    return apiErrorResponse(error)
  }
}
