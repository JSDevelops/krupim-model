import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getSupabase } from '../../../_lib/auth'
import { getActiveProvider } from '../../../_lib/ai'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }

  try {
    const provider = getActiveProvider(req)
    const supabase = getSupabase()

    // DB ping (lightweight)
    const startDb = Date.now()
    let dbStatus = 'offline'
    try {
      const { error } = await supabase.from('schools').select('id').limit(1).maybeSingle()
      if (!error) dbStatus = 'online'
    } catch { /* ignore */ }
    const dbLatency = Date.now() - startDb

    // AI key check (no actual LLM call — saves tokens)
    let aiStatus = 'no_key'
    if (provider === 'openai') {
      const key = req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY || ''
      aiStatus = key.startsWith('sk-') ? 'key_configured' : 'no_key'
    } else if (provider === 'claude') {
      const key = req.headers.get('x-claude-key') || process.env.ANTHROPIC_API_KEY || ''
      aiStatus = key.startsWith('sk-ant-') ? 'key_configured' : 'no_key'
    } else {
      const key = req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY || ''
      aiStatus = key.startsWith('AIzaSy') ? 'key_configured' : 'no_key'
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus, latency: `${dbLatency}ms` },
        ai: { status: aiStatus, provider, note: 'Key format check only (no token usage)' },
        backend: { status: 'online', latency: '1ms' }
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Health check failed' }, { status: 500 })
  }
}
