import { queryDb } from './db'

export type AiTokenRecord = {
  userId?: string | null
  provider?: string
  model?: string
  serviceType?: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export type AiQuotaStats = {
  providerName: string
  dailyRequestLimit: number
  requestsUsed: number
  requestsRemaining: number
  percentUsed: number
  totalTokensUsed: number
  promptTokensUsed: number
  completionTokensUsed: number
  health: 'healthy' | 'warning' | 'critical'
  healthLabel: string
  resetTime: string
}

let tableEnsured = false

async function ensureTable(): Promise<void> {
  if (tableEnsured) return
  try {
    await queryDb(`
      CREATE TABLE IF NOT EXISTS ai_token_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        provider TEXT NOT NULL DEFAULT 'gemini',
        model TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
        service_type TEXT NOT NULL DEFAULT 'chat',
        prompt_tokens INT NOT NULL DEFAULT 0,
        completion_tokens INT NOT NULL DEFAULT 0,
        total_tokens INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_ai_token_usage_date ON ai_token_usage(created_at DESC);
    `)
    tableEnsured = true
  } catch (err) {
    console.warn('Could not auto-create ai_token_usage table:', err)
  }
}

export async function recordAiTokenUsage(record: AiTokenRecord): Promise<void> {
  try {
    await ensureTable()
    const promptTokens = Math.max(0, Math.round(record.promptTokens || 0))
    const completionTokens = Math.max(0, Math.round(record.completionTokens || 0))
    const totalTokens = Math.max(promptTokens + completionTokens, Math.round(record.totalTokens || 0))

    await queryDb(`
      INSERT INTO ai_token_usage (
        user_id, provider, model, service_type,
        prompt_tokens, completion_tokens, total_tokens
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      record.userId || null,
      record.provider || 'gemini',
      record.model || 'gemini-2.5-flash',
      record.serviceType || 'chat',
      promptTokens,
      completionTokens,
      totalTokens,
    ])
  } catch (err) {
    console.warn('Failed to record AI token usage:', err)
  }
}

export async function getAiQuotaStats(provider = 'gemini'): Promise<AiQuotaStats> {
  let dailyLimit = 1500 // Google Gemini Free Tier daily requests baseline
  try {
    await ensureTable()

    // Query any approved extra quota today from ai_token_requests
    try {
      const extraRes = await queryDb<{ extra: string }>(`
        SELECT COALESCE(SUM(approved_quota), 0)::text AS extra
        FROM ai_token_requests
        WHERE status = 'approved' AND (updated_at >= CURRENT_DATE OR created_at >= CURRENT_DATE)
      `)
      const extraLimit = Number(extraRes.rows[0]?.extra || 0)
      if (extraLimit > 0) {
        dailyLimit += extraLimit
      }
    } catch {
      // Table may not exist yet or no requests approved
    }

    const result = await queryDb<{
      requestCount: string
      totalTokens: string
      promptTokens: string
      completionTokens: string
    }>(`
      SELECT COUNT(*)::text AS "requestCount",
             COALESCE(SUM(total_tokens), 0)::text AS "totalTokens",
             COALESCE(SUM(prompt_tokens), 0)::text AS "promptTokens",
             COALESCE(SUM(completion_tokens), 0)::text AS "completionTokens"
      FROM ai_token_usage
      WHERE created_at >= CURRENT_DATE
        AND provider = $1
    `, [provider])

    const row = result.rows[0]
    const requestsUsed = Number(row?.requestCount || 0)
    const totalTokensUsed = Number(row?.totalTokens || 0)
    const promptTokensUsed = Number(row?.promptTokens || 0)
    const completionTokensUsed = Number(row?.completionTokens || 0)

    const percentUsed = Math.min(100, Math.round((requestsUsed / dailyLimit) * 100))
    const requestsRemaining = Math.max(0, dailyLimit - requestsUsed)

    let health: 'healthy' | 'warning' | 'critical' = 'healthy'
    let healthLabel = 'ปกติพร้อมใช้งาน 🟢'

    if (percentUsed >= 85) {
      health = 'critical'
      healthLabel = 'ใกล้เต็มขีดจำกัด 🔴'
    } else if (percentUsed >= 50) {
      health = 'warning'
      healthLabel = 'เริ่มใช้งานหนาแน่น 🟡'
    }

    const providerNames: Record<string, string> = {
      gemini: 'Google Gemini',
      openai: 'OpenAI',
      claude: 'Anthropic Claude',
    }

    return {
      providerName: providerNames[provider] || provider,
      dailyRequestLimit: dailyLimit,
      requestsUsed,
      requestsRemaining,
      percentUsed,
      totalTokensUsed,
      promptTokensUsed,
      completionTokensUsed,
      health,
      healthLabel,
      resetTime: '00:00 น.',
    }
  } catch (err) {
    console.warn('Failed to get AI quota stats:', err)
    return {
      providerName: 'Google Gemini',
      dailyRequestLimit: dailyLimit,
      requestsUsed: 0,
      requestsRemaining: dailyLimit,
      percentUsed: 0,
      totalTokensUsed: 0,
      promptTokensUsed: 0,
      completionTokensUsed: 0,
      health: 'healthy',
      healthLabel: 'ปกติพร้อมใช้งาน 🟢',
      resetTime: '00:00 น.',
    }
  }
}

