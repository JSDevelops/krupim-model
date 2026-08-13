import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'

export type AIProvider = 'gemini' | 'openai' | 'claude'

/** อ่าน provider จาก x-ai-provider header */
export function getActiveProvider(req: NextRequest): AIProvider {
  const p = req.headers.get('x-ai-provider') || ''
  if (p === 'openai' || p === 'claude') return p
  return 'gemini'
}

/** ดึง Gemini client — ลอง header key ก่อน ถ้าไม่มีใช้ env */
export function getGemini(req: NextRequest): GoogleGenerativeAI {
  const headerKey = req.headers.get('x-gemini-key') || ''
  const key = (headerKey.startsWith('AIzaSy') ? headerKey : '') || process.env.GEMINI_API_KEY || ''
  if (!key) throw new Error('No Gemini API key configured. Set GEMINI_API_KEY in Vercel env or provide x-gemini-key header.')
  return new GoogleGenerativeAI(key)
}

/** ดึง OpenAI client */
export async function getOpenAI(req: NextRequest) {
  const { OpenAI } = await import('openai')
  const headerKey = req.headers.get('x-openai-key') || ''
  const key = (headerKey.startsWith('sk-') ? headerKey : '') || process.env.OPENAI_API_KEY || ''
  if (!key) throw new Error('No OpenAI API key configured.')
  return new OpenAI({ apiKey: key })
}

/** ดึง Anthropic client */
export async function getAnthropic(req: NextRequest) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const headerKey = req.headers.get('x-claude-key') || ''
  const key = (headerKey.startsWith('sk-ant-') ? headerKey : '') || process.env.ANTHROPIC_API_KEY || ''
  if (!key) throw new Error('No Anthropic API key configured.')
  return new Anthropic({ apiKey: key })
}
