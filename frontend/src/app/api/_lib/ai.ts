import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'
import { getActiveAISetting, getAISetting } from '@/lib/aiSettings'
import { isAIProvider, type AIProvider } from '@/lib/aiModels'

export type { AIProvider }

/** Uses the server-wide provider selected by an administrator. */
export async function getActiveProvider(req?: NextRequest): Promise<AIProvider> {
  try {
    return (await getActiveAISetting()).provider
  } catch {
    const requested = req?.headers.get('x-ai-provider')
    return isAIProvider(requested) ? requested : 'gemini'
  }
}

export async function getConfiguredModel(provider: AIProvider) {
  const setting = await getAISetting(provider)
  const model = setting.model || ''
  if (provider === 'gemini') {
    // Google retired gemini-1.5-flash and gemini-2.5-flash (404 Not Found).
    // The current active vision models are gemini-3.1-flash-lite and gemini-3.8-flash.
    if (model.includes('1.5') || model.includes('2.5') || !model.startsWith('gemini-')) {
      return 'gemini-3.1-flash-lite'
    }
    return model
  }
  if (provider === 'openai') {
    if (model.includes('4.1')) return 'gpt-4o-mini'
  }
  if (provider === 'claude') {
    if (model.includes('sonnet') || model.includes('4-6')) return 'claude-3-5-sonnet-20241022'
    if (model.includes('haiku')) return 'claude-3-5-haiku-20241022'
  }
  return model
}

export async function hasConfiguredKey(provider: AIProvider) {
  return Boolean((await getAISetting(provider)).apiKey)
}

export async function getGemini(req?: NextRequest): Promise<GoogleGenerativeAI> {
  void req
  const { apiKey } = await getAISetting('gemini')
  if (!apiKey) throw new Error('No Gemini API key configured. Add it in Admin Settings.')
  return new GoogleGenerativeAI(apiKey)
}

export async function getOpenAI(req?: NextRequest) {
  void req
  const { OpenAI } = await import('openai')
  const { apiKey } = await getAISetting('openai')
  if (!apiKey) throw new Error('No OpenAI API key configured. Add it in Admin Settings.')
  return new OpenAI({ apiKey })
}

export async function getAnthropic(req?: NextRequest) {
  void req
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const { apiKey } = await getAISetting('claude')
  if (!apiKey) throw new Error('No Anthropic API key configured. Add it in Admin Settings.')
  return new Anthropic({ apiKey })
}
