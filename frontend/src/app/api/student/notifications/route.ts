import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

export async function PATCH(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student'], maxRequests: 30 })
    await queryDb(`
      UPDATE notifications SET is_read=TRUE,read_at=NOW()
      WHERE user_id=$1::uuid AND is_read=FALSE
    `, [user.id])
    return NextResponse.json({ ok: true })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
