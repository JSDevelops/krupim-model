import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, getErrorMessage, guardApi, getDatabase } from '../_lib/auth'
import { getActiveProvider, getConfiguredModel, hasConfiguredKey } from '../_lib/ai'

export async function GET(req: NextRequest) {
  try {
    await guardApi(req, { roles: ['developer'], maxRequests: 30 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  try {
    const provider = await getActiveProvider(req)
    const localData = getDatabase()

    // DB ping (lightweight)
    const startDb = Date.now()
    let dbStatus = 'offline'
    try {
      const { error } = await localData.from('schools').select('id').limit(1).maybeSingle()
      if (!error) dbStatus = 'online'
    } catch { /* ignore */ }
    const dbLatency = Date.now() - startDb

    // AI key check (no actual LLM call — saves tokens)
    const [hasKey, model] = await Promise.all([
      hasConfiguredKey(provider),
      getConfiguredModel(provider),
    ])
    const aiStatus = hasKey ? 'key_configured' : 'no_key'

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus, latency: `${dbLatency}ms` },
        ai: { status: aiStatus, provider, model, note: 'Configuration check only (no token usage)' },
        backend: { status: 'online', latency: '1ms' }
      }
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) || 'Health check failed' }, { status: 500 })
  }
}
