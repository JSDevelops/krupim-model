import { NextRequest, NextResponse } from 'next/server'
import { guardApi, apiErrorResponse } from '@/app/api/_lib/auth'
import { queryDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await guardApi(req, { maxRequests: 30, windowMs: 60_000 })
    const result = await queryDb<{
      pdpa_consent: boolean
      pdpa_consent_at: string | null
      pdpa_consent_version: string | null
    }>(
      `SELECT pdpa_consent, pdpa_consent_at, pdpa_consent_version FROM profiles WHERE id = $1 LIMIT 1`,
      [user.id],
    )

    const row = result.rows[0]
    return NextResponse.json({
      consented: Boolean(row?.pdpa_consent),
      consentedAt: row?.pdpa_consent_at ?? null,
      version: row?.pdpa_consent_version ?? '1.0',
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await guardApi(req, { maxRequests: 20, windowMs: 60_000 })
    let body: { version?: string } = {}
    try {
      body = await req.json()
    } catch {
      // default empty body
    }

    const version = typeof body.version === 'string' && body.version.trim() ? body.version.trim() : '1.0'

    await queryDb(
      `UPDATE profiles
       SET pdpa_consent = TRUE,
           pdpa_consent_at = NOW(),
           pdpa_consent_version = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [version, user.id],
    )

    const userAgent = req.headers.get('user-agent') || 'unknown'
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

    await queryDb(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details_json)
       VALUES ($1::uuid, 'pdpa_consent_agreed', 'profile', $1::text, $2::jsonb)`,
      [
        user.id,
        JSON.stringify({
          version,
          userAgent: userAgent.slice(0, 200),
          ip: ip.slice(0, 50),
          timestamp: new Date().toISOString(),
        }),
      ],
    )

    return NextResponse.json({
      success: true,
      consentedAt: new Date().toISOString(),
      version,
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
