import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'

type GeneralSettings = { schoolName: string; maintenance: boolean }

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: ['developer'], maxRequests: 30 })
    const result = await queryDb<{ value_json: GeneralSettings }>(`
      SELECT value_json FROM system_settings WHERE setting_key='general' LIMIT 1
    `)
    return NextResponse.json({
      settings: result.rows[0]?.value_json || { schoolName: 'วิทยาลัยอาชีวศึกษากรุงเทพ', maintenance: false },
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['developer'], maxRequests: 12 })
    const body = await request.json() as Record<string, unknown>
    const schoolName = typeof body.schoolName === 'string' ? body.schoolName.trim() : ''
    const maintenance = body.maintenance === true
    if (!schoolName || schoolName.length > 240) {
      throw new ApiError('ชื่อสถานศึกษาต้องมีความยาว 1–240 ตัวอักษร', 400, 'INVALID_INPUT')
    }
    const settings: GeneralSettings = { schoolName, maintenance }
    const result = await queryDb<{ value_json: GeneralSettings }>(`
      INSERT INTO system_settings (setting_key,value_json,updated_by,updated_at)
      VALUES ('general',$1::jsonb,$2::uuid,NOW())
      ON CONFLICT (setting_key) DO UPDATE SET
        value_json=EXCLUDED.value_json, updated_by=EXCLUDED.updated_by, updated_at=NOW()
      RETURNING value_json
    `, [JSON.stringify(settings), user.id])
    await queryDb(`
      INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json)
      VALUES($1::uuid,'update_system_settings','system_settings','general',$2::jsonb)
    `, [user.id, JSON.stringify(settings)])
    return NextResponse.json({ settings: result.rows[0].value_json })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
