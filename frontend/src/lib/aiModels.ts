export const AI_PROVIDERS = ['gemini', 'openai', 'claude'] as const

export type AIProvider = (typeof AI_PROVIDERS)[number]

export type AIModelOption = {
  id: string
  name: string
  description: string
}

export const AI_MODEL_OPTIONS: Record<AIProvider, readonly AIModelOption[]> = {
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'สมดุลคุณภาพ ความเร็ว และค่าใช้จ่าย' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: 'ประหยัดและตอบสนองเร็วสำหรับงานปริมาณมาก' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'เหมาะกับงานวิเคราะห์และเหตุผลที่ซับซ้อน' },
  ],
  openai: [
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 mini', description: 'รวดเร็ว คุ้มค่า และรองรับภาพ' },
    { id: 'gpt-4o-mini', name: 'GPT-4o mini', description: 'โมเดลอเนกประสงค์ต้นทุนต่ำ' },
    { id: 'gpt-4.1', name: 'GPT-4.1', description: 'คุณภาพสูงสำหรับคำสั่งและงานซับซ้อน' },
  ],
  claude: [
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', description: 'สมดุลความฉลาดและความเร็ว' },
    { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', description: 'เร็วและประหยัดสำหรับงานทั่วไป' },
    { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', description: 'เหมาะกับงานวิเคราะห์ที่ซับซ้อนที่สุด' },
  ],
}

export const DEFAULT_AI_MODELS: Record<AIProvider, string> = {
  gemini: AI_MODEL_OPTIONS.gemini[0].id,
  openai: AI_MODEL_OPTIONS.openai[0].id,
  claude: AI_MODEL_OPTIONS.claude[0].id,
}

export function isAIProvider(value: unknown): value is AIProvider {
  return typeof value === 'string' && AI_PROVIDERS.includes(value as AIProvider)
}

export function isAllowedAIModel(provider: AIProvider, value: unknown): value is string {
  return typeof value === 'string' && AI_MODEL_OPTIONS[provider].some(model => model.id === value)
}
