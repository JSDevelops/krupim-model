import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'

const CODE = /^FINE-[A-F0-9]{16}$/

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await context.params
  const code = rawCode.toUpperCase()
  if (!CODE.test(code)) return NextResponse.json({ error: 'รูปแบบเลขที่ใบรับรองไม่ถูกต้อง' }, { status: 400 })

  const result = await queryDb(`
    SELECT certificate_code AS "certificateCode", issued_name AS "issuedName",
           school_name AS "schoolName", overall_score AS "overallScore",
           score_snapshot AS "scoreSnapshot", issued_at AS "issuedAt",
           revoked_at IS NULL AS valid
    FROM certificates WHERE certificate_code=$1 LIMIT 1
  `, [code])
  if (!result.rows[0]) return NextResponse.json({ error: 'ไม่พบใบรับรองนี้' }, { status: 404 })
  return NextResponse.json({ certificate: result.rows[0] }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
