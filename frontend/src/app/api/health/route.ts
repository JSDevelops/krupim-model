import { NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = Date.now()
  try {
    await queryDb('SELECT 1')
    await queryDb(`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pdpa_consent BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pdpa_consent_at TIMESTAMPTZ;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pdpa_consent_version TEXT DEFAULT '1.0';
    `).catch(err => console.warn('Schema auto-check notice:', err?.message))
    return NextResponse.json({
      status: 'ok',
      database: 'online',
      latencyMs: Date.now() - startedAt,
      region: process.env.VERCEL_REGION || 'local',
    }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ status: 'degraded', database: 'offline' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
