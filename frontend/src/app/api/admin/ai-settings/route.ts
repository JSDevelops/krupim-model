import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, getErrorMessage, guardApi } from '../../_lib/auth'
import { getAllAISettings, publicAISettings, saveAISetting } from '@/lib/aiSettings'
import { isAIProvider } from '@/lib/aiModels'

export async function GET(req: NextRequest) {
  try {
    await guardApi(req, { roles: ['developer'], maxRequests: 30 })
    const settings = await getAllAISettings({ fresh: true })
    return NextResponse.json({ settings: publicAISettings(settings) })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function PUT(req: NextRequest) {
  let user
  try {
    user = await guardApi(req, { roles: ['developer'], maxRequests: 12 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }
    const body = await req.json() as Record<string, unknown>
    if (!isAIProvider(body.provider)) {
      return NextResponse.json({ error: 'ผู้ให้บริการ AI ไม่ถูกต้อง' }, { status: 400 })
    }
    if (typeof body.model !== 'string' || body.model.length > 100) {
      return NextResponse.json({ error: 'โมเดล AI ไม่ถูกต้อง' }, { status: 400 })
    }
    if (body.apiKey !== undefined && typeof body.apiKey !== 'string') {
      return NextResponse.json({ error: 'API Key ไม่ถูกต้อง' }, { status: 400 })
    }

    const settings = await saveAISetting({
      provider: body.provider,
      model: body.model,
      apiKey: body.apiKey,
      active: body.active !== false,
      updatedBy: user.id,
    })
    return NextResponse.json({
      message: 'บันทึกการตั้งค่า AI แล้ว',
      settings: publicAISettings(settings),
    })
  } catch (error) {
    const dbError = error as Error & { code?: string }
    if (dbError.code === '42P01') {
      return NextResponse.json({ error: 'ยังไม่มีตารางตั้งค่า AI กรุณารัน npm run db:setup ก่อน' }, { status: 503 })
    }
    return NextResponse.json({ error: getErrorMessage(error) || 'บันทึกการตั้งค่า AI ไม่สำเร็จ' }, { status: 400 })
  }
}
