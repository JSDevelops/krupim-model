import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, guardApi } from '../../_lib/auth'
import {
  getAllTokenRequests,
  updateTokenRequestStatus,
  type TokenRequestStatus,
} from '@/lib/tokenRequests'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: ['developer'], maxRequests: 60 })
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const data = await getAllTokenRequests(status)
    return NextResponse.json(data)
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await guardApi(request, { roles: ['developer'], maxRequests: 30 })
    const body = await request.json()

    const id = typeof body.id === 'string' ? body.id : ''
    const status = body.status as 'approved' | 'rejected'
    const adminNotes = typeof body.adminNotes === 'string' ? body.adminNotes.trim() : null
    const approvedQuota = body.approvedQuota !== undefined && body.approvedQuota !== null ? Number(body.approvedQuota) : null

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 })
    }

    const updated = await updateTokenRequestStatus(id, actor.id, {
      status,
      adminNotes,
      approvedQuota,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Token request not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, request: updated })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
