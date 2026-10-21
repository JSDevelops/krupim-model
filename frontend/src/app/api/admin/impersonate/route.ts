import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { createSessionToken, setSessionCookie, type SessionRole } from '@/lib/session'
import { guardApi, ApiError, apiErrorResponse } from '../../_lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type TargetProfile = {
  id: string
  email: string
  name: string
  role: SessionRole
  approval_status: 'pending' | 'active' | 'inactive'
  session_version: number
}

export async function POST(request: NextRequest) {
  try {
    // จำกัดสิทธิ์เฉพาะ role 'developer' (Super Admin) เท่านั้น! สิทธิ์อื่นถูกปฏิเสธ 403 Forbidden ทันที
    const adminUser = await guardApi(request, { roles: ['developer'], maxRequests: 60 })

    const body = await request.json()
    const targetUserId = typeof body.userId === 'string' ? body.userId.trim() : ''

    if (!targetUserId) {
      throw new ApiError('กรุณาระบุรหัสผู้ใช้งานที่ต้องการเข้าสู่ระบบ', 400, 'INVALID_INPUT')
    }

    // ดึงข้อมูลบัญชีเป้าหมาย
    const result = await queryDb<TargetProfile>(`
      SELECT p.id, p.email, p.name, p.role, p.approval_status, u.session_version
      FROM profiles p
      JOIN app_users u ON u.id = p.id
      WHERE p.id = $1::uuid
      LIMIT 1
    `, [targetUserId])

    const targetUser = result.rows[0]
    if (!targetUser) {
      throw new ApiError('ไม่พบบัญชีผู้ใช้งานที่ระบุ', 404, 'USER_NOT_FOUND')
    }

    if (targetUser.role !== 'teacher') {
      throw new ApiError('สามารถเข้าสู่ระบบในฐานะครูผู้สอนเท่านั้น', 400, 'INVALID_TARGET_ROLE')
    }

    if (targetUser.approval_status !== 'active') {
      throw new ApiError('บัญชีครูท่านนี้ยังไม่ได้รับการอนุมัติหรือถูกระงับการใช้งาน', 403, 'ACCOUNT_NOT_ACTIVE')
    }

    // บันทึก Audit Log เพื่อความโปร่งใสและตรวจสอบได้
    try {
      await queryDb(`
        INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, details)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        adminUser.id,
        adminUser.role,
        'impersonate_teacher',
        'user',
        targetUser.id,
        JSON.stringify({
          adminEmail: adminUser.email,
          targetEmail: targetUser.email,
          targetName: targetUser.name,
          timestamp: new Date().toISOString(),
        })
      ])
    } catch {
      // ไม่ให้ขัดขวางหากตาราง audit_logs โครงสร้างต่างกัน
    }

    // สร้าง Session Token สำหรับครูท่านนี้
    const sessionToken = await createSessionToken({
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      sessionVersion: targetUser.session_version,
    })

    const response = NextResponse.json({
      success: true,
      message: `เข้าสู่ระบบในฐานะ ${targetUser.name} สำเร็จ`,
      target: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
      redirectTo: '/teacher/dashboard',
    })

    // กำหนด Cookie ให้เบราว์เซอร์สลับ Session เป็นของครูทันที
    setSessionCookie(response, sessionToken)

    return response
  } catch (error) {
    return apiErrorResponse(error)
  }
}
