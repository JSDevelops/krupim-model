import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../../_lib/auth'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
type Asset = { file_name: string; mime_type: string; size_bytes: string; file_data: Buffer; owner_id: string; published: boolean }

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await guardApi(request, { roles: ['student', 'teacher', 'developer'], maxRequests: 120 })
    const { id } = await context.params
    if (!UUID.test(id)) throw new ApiError('รหัสไฟล์โมเดลไม่ถูกต้อง', 400, 'VALIDATION_ERROR')
    const result = await queryDb<Asset>(`
      SELECT a.file_name,a.mime_type,a.size_bytes,a.file_data,a.owner_id,
             EXISTS(SELECT 1 FROM model_generation_jobs j WHERE j.asset_id=a.id AND j.status='success' AND j.ar_item_id IS NOT NULL) AS published
      FROM generated_model_assets a WHERE a.id=$1::uuid LIMIT 1
    `, [id])
    const asset = result.rows[0]
    if (!asset) throw new ApiError('ไม่พบไฟล์โมเดล', 404, 'NOT_FOUND')
    if (!asset.published && user.role !== 'developer' && asset.owner_id !== user.id) throw new ApiError('คุณไม่มีสิทธิ์เปิดไฟล์โมเดลนี้', 403, 'FORBIDDEN')
    return new NextResponse(new Uint8Array(asset.file_data), {
      headers: {
        'Content-Type': asset.mime_type,
        'Content-Length': String(asset.size_bytes),
        'Content-Disposition': `inline; filename="${encodeURIComponent(asset.file_name)}"`,
        'Cache-Control': 'private, max-age=86400, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
