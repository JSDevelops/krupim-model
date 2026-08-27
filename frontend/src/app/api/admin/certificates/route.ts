import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const selectCertificate = `
  SELECT c.id, c.certificate_code AS "certificateCode", c.issued_name AS "issuedName",
         p.email, c.school_name AS "schoolName", c.overall_score AS "overallScore",
         c.score_snapshot AS "scoreSnapshot", c.issued_at AS "issuedAt",
         c.revoked_at AS "revokedAt", c.revoked_at IS NULL AS valid
  FROM certificates c JOIN profiles p ON p.id=c.student_id
`

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: ['developer'], maxRequests: 60 })
    const result = await queryDb(`${selectCertificate} ORDER BY c.issued_at DESC LIMIT 1000`)
    return NextResponse.json({ certificates: result.rows }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await guardApi(request, { roles: ['developer'], maxRequests: 30 })
    const body = await request.json() as { id?: unknown; action?: unknown }
    const id = typeof body.id === 'string' ? body.id : ''
    const action = body.action === 'revoke' || body.action === 'restore' ? body.action : ''
    if (!UUID.test(id) || !action) throw new ApiError('ข้อมูลคำสั่งไม่ถูกต้อง', 400, 'VALIDATION_ERROR')

    const certificate = await withTransaction(async client => {
      const updated = await client.query(`
        UPDATE certificates
        SET revoked_at=${action === 'revoke' ? 'COALESCE(revoked_at,NOW())' : 'NULL'}
        WHERE id=$1::uuid
        RETURNING id
      `, [id])
      if (!updated.rows[0]) throw new ApiError('ไม่พบใบรับรอง', 404, 'NOT_FOUND')
      await client.query(`
        INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json)
        VALUES($1::uuid,$2,'certificate',$3,'{}'::jsonb)
      `, [actor.id, `${action}_certificate`, id])
      const result = await client.query(`${selectCertificate} WHERE c.id=$1::uuid LIMIT 1`, [id])
      return result.rows[0]
    })
    return NextResponse.json({ certificate })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
