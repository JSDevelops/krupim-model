import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, getErrorMessage, guardApi } from '../../_lib/auth'
import {
  getTripoSetting,
  isTripoModelVersion,
  publicTripoSetting,
  saveTripoSetting,
  TRIPO_MODEL_VERSIONS,
} from '@/lib/tripoSettings'

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: ['developer'], maxRequests: 30 })
    const setting = await getTripoSetting({ fresh: true })
    return NextResponse.json({ setting: publicTripoSetting(setting), modelVersions: TRIPO_MODEL_VERSIONS }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['developer'], maxRequests: 12 })
    const payload = await request.json() as { apiKey?: unknown; modelVersion?: unknown }
    if (payload.apiKey !== undefined && typeof payload.apiKey !== 'string') {
      return NextResponse.json({ error: 'Tripo API Key ไม่ถูกต้อง' }, { status: 400 })
    }
    if (!isTripoModelVersion(payload.modelVersion)) {
      return NextResponse.json({ error: 'เวอร์ชันโมเดล Tripo ไม่อยู่ในรายการที่รองรับ' }, { status: 400 })
    }
    const setting = await saveTripoSetting({
      apiKey: payload.apiKey,
      modelVersion: payload.modelVersion,
      updatedBy: user.id,
    })
    return NextResponse.json({ message: 'บันทึกการตั้งค่า Tripo แล้ว', setting: publicTripoSetting(setting), modelVersions: TRIPO_MODEL_VERSIONS })
  } catch (error) {
    const dbError = error as Error & { code?: string }
    if (dbError.code === '42P01') return NextResponse.json({ error: 'กรุณารัน migration ล่าสุดก่อนตั้งค่า Tripo' }, { status: 503 })
    return NextResponse.json({ error: getErrorMessage(error) || 'บันทึกการตั้งค่า Tripo ไม่สำเร็จ' }, { status: 400 })
  }
}
