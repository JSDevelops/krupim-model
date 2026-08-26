import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, getErrorMessage, guardApi } from '../../../_lib/auth'

type TripoStatus = {
  code?: number
  data?: {
    status?: string
    result?: { model?: { glb?: string } }
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> },
) {
  try {
    await guardApi(req, { roles: ['teacher', 'developer'], maxRequests: 30 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  try {
    const { taskId } = await context.params
    if (!/^[A-Za-z0-9_-]{6,128}$/.test(taskId)) {
      return NextResponse.json({ error: 'Invalid task id' }, { status: 400 })
    }

    const tripoKey = (process.env.TRIPO_API_KEY || '').trim()
    if (!tripoKey) return NextResponse.json({ error: 'Tripo3D is not configured' }, { status: 503 })

    const response = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${tripoKey}` },
      cache: 'no-store',
    })
    const payload = await response.json() as TripoStatus
    if (!response.ok || payload.code !== 0 || !payload.data) {
      return NextResponse.json({ error: 'Unable to load 3D task' }, { status: 502 })
    }

    return NextResponse.json({
      taskId,
      status: payload.data.status,
      glbUrl: payload.data.result?.model?.glb || '',
    })
  } catch (error) {
    console.error('3D status error:', getErrorMessage(error))
    return NextResponse.json({ error: 'Unable to load 3D task' }, { status: 500 })
  }
}
