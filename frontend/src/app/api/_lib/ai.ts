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
  return (await getAISetting(provider)).model
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
