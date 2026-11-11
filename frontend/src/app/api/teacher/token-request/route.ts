import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, guardApi } from '../../_lib/auth'
import { queryDb } from '@/lib/db'
import {
  createTokenRequest,
  getTeacherTokenRequests,
  type TokenRequestType,
} from '@/lib/tokenRequests'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })
    const requests = await getTeacherTokenRequests(user.id)
    return NextResponse.json({ requests })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 20 })
    const body = await request.json()

    // Fetch teacher profile for full name and school name
    const profileRes = await queryDb<{ name: string; school_name: string | null }>(`
      SELECT name, school_name FROM profiles WHERE id = $1::uuid LIMIT 1
    `, [user.id])
    const profile = profileRes.rows[0]

    const teacherName = profile?.name || 'ครูผู้สอน'
    const schoolName = profile?.school_name || null

    const requestType = (body.requestType || 'temporary_extension') as TokenRequestType
    const packageName = typeof body.packageName === 'string' ? body.packageName.trim() : null
    const studentCount = Number(body.studentCount) || 30
    const targetDate = typeof body.targetDate === 'string' ? body.targetDate.trim() : null
    const contactChannel = typeof body.contactChannel === 'string' ? body.contactChannel.trim() : null
    const notes = typeof body.notes === 'string' ? body.notes.trim() : null

    const created = await createTokenRequest({
      userId: user.id,
      teacherName,
      schoolName,
      requestType,
      packageName,
      studentCount,
      targetDate,
      contactChannel,
      notes,
    })

    return NextResponse.json({ ok: true, request: created })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

