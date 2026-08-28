import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/session'
import { apiErrorResponse, enforceRateLimit } from '../../_lib/auth'

export async function POST(request: NextRequest) {
  try {
    await enforceRateLimit(request, 20, 60_000)
    const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
    clearSessionCookie(response)
    return response
  } catch (error) {
    return apiErrorResponse(error)
  }
}
