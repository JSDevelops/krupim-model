import { NextRequest, NextResponse } from 'next/server'
import { getActiveProvider, getConfiguredModel, hasConfiguredKey } from '../_lib/ai'
import { apiErrorResponse, guardApi } from '../_lib/auth'

export async function GET(req: NextRequest) {
  try {
    await guardApi(req, { maxRequests: 30 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  const provider = await getActiveProvider(req)
  const [initialized, model] = await Promise.all([
    hasConfiguredKey(provider),
    getConfiguredModel(provider),
  ])

  return NextResponse.json({
    status: 'online',
    activeProvider: provider,
    model,
    aiInitialized: initialized,
    timestamp: new Date().toISOString()
  })
}
