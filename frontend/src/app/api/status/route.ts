import { NextRequest, NextResponse } from 'next/server'
import { getActiveProvider } from '../../_lib/ai'

export async function GET(req: NextRequest) {
  const provider = getActiveProvider(req)
  let initialized = false

  if (provider === 'openai') {
    const key = req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY || ''
    initialized = key.startsWith('sk-')
  } else if (provider === 'claude') {
    const key = req.headers.get('x-claude-key') || process.env.ANTHROPIC_API_KEY || ''
    initialized = key.startsWith('sk-ant-')
  } else {
    const key = req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY || ''
    initialized = key.startsWith('AIzaSy')
  }

  return NextResponse.json({
    status: 'online',
    activeProvider: provider,
    aiInitialized: initialized,
    timestamp: new Date().toISOString()
  })
}
