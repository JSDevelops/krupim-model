import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, enforceRateLimit, getDatabase } from '../../_lib/auth'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  try {
    enforceRateLimit(req, 8, 60_000)
    const { code } = await context.params
    const normalizedCode = code.trim().toUpperCase()
    if (!/^[A-Z0-9]{6,12}$/.test(normalizedCode)) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    const db = getDatabase()
    const { data, error } = await db
      .from('class_invites')
      .select('target_class,teacher_name,school_name,expires_at')
      .eq('short_code', normalizedCode)
      .maybeSingle()

    if (error || !data || (data.expires_at && new Date(data.expires_at).getTime() <= Date.now())) {
      return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 })
    }

    return NextResponse.json({ invite: data })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
