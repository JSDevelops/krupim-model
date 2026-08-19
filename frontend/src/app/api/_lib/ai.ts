import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'

export type AIProvider = 'gemini' | 'openai' | 'claude'

/** อ่าน provider จาก x-ai-provider header */
export function getActiveProvider(req: NextRequest): AIProvider {
  const p = req.headers.get('x-ai-provider') || ''
  if (p === 'openai' || p === 'claude') return p
  return 'gemini'
}

const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

/** ดึง Gemini client — ลอง header key ก่อน ถ้าไม่มีใช้ env หรือ default key */
export function getGemini(req: NextRequest): GoogleGenerativeAI {
  const headerKey = (req.headers.get('x-gemini-key') || '').trim()
  const key = (headerKey.length > 10 ? headerKey : '') || DEFAULT_GEMINI_KEY
  if (!key) throw new Error('No Gemini API key configured. Set GEMINI_API_KEY in environment or provide your key in Settings.')
  return new GoogleGenerativeAI(key)
}

/** ดึง OpenAI client */
export async function getOpenAI(req: NextRequest) {
  const { OpenAI } = await import('openai')
  const headerKey = (req.headers.get('x-openai-key') || '').trim()
  const key = (headerKey.length > 10 ? headerKey : '') || process.env.OPENAI_API_KEY || ''
  if (!key) throw new Error('No OpenAI API key configured.')
  return new OpenAI({ apiKey: key })
}

/** ดึง Anthropic client */
export async function getAnthropic(req: NextRequest) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const headerKey = (req.headers.get('x-claude-key') || '').trim()
  const key = (headerKey.length > 10 ? headerKey : '') || process.env.ANTHROPIC_API_KEY || ''
  if (!key) throw new Error('No Anthropic API key configured.')
  return new Anthropic({ apiKey: key })
}
