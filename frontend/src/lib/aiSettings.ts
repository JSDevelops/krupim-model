import 'server-only'

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import type { PoolClient, QueryResultRow } from 'pg'
import { queryDb, withTransaction } from '@/lib/db'
import {
  AI_PROVIDERS,
  DEFAULT_AI_MODELS,
  isAllowedAIModel,
  type AIProvider,
} from '@/lib/aiModels'

type AISettingRow = QueryResultRow & {
  provider: AIProvider
  api_key_encrypted: string | null
  model: string
  is_active: boolean
  updated_at: Date | string
}

export type RuntimeAISetting = {
  provider: AIProvider
  apiKey: string
  model: string
  active: boolean
  source: 'database' | 'environment' | 'none'
  updatedAt: string | null
}

const ENV_KEYS: Record<AIProvider, 'GEMINI_API_KEY' | 'OPENAI_API_KEY' | 'ANTHROPIC_API_KEY'> = {
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
  claude: 'ANTHROPIC_API_KEY',
}

const globalForAISettings = globalThis as typeof globalThis & {
  __krupimAISettingsCache?: { expiresAt: number; settings: RuntimeAISetting[] }
}

function encryptionKey() {
  const secret = process.env.AI_SETTINGS_ENCRYPTION_KEY || process.env.AUTH_SECRET || ''
  if (secret.length < 32) {
    throw new Error('AI_SETTINGS_ENCRYPTION_KEY or AUTH_SECRET must contain at least 32 characters')
  }
  return createHash('sha256').update(secret, 'utf8').digest()
}

function encryptSecret(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return ['v1', iv.toString('base64url'), authTag.toString('base64url'), encrypted.toString('base64url')].join('.')
}

function decryptSecret(payload: string) {
  const [version, ivValue, authTagValue, encryptedValue] = payload.split('.')
  if (version !== 'v1' || !ivValue || !authTagValue || !encryptedValue) {
    throw new Error('Invalid encrypted AI key payload')
  }
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivValue, 'base64url'))
  decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

function environmentKey(provider: AIProvider) {
  return process.env[ENV_KEYS[provider]]?.trim() || ''
}

function normalizeRows(rows: AISettingRow[]): RuntimeAISetting[] {
  const activeProvider = rows.find(row => row.is_active)?.provider || 'gemini'
  return AI_PROVIDERS.map(provider => {
    const row = rows.find(item => item.provider === provider)
    const encryptedKey = row?.api_key_encrypted || ''
    const envKey = environmentKey(provider)
    let apiKey = ''
    let source: RuntimeAISetting['source'] = 'none'

    if (encryptedKey) {
      apiKey = decryptSecret(encryptedKey)
      source = 'database'
    } else if (envKey) {
      apiKey = envKey
      source = 'environment'
    }

    return {
      provider,
      apiKey,
      model: row && isAllowedAIModel(provider, row.model) ? row.model : DEFAULT_AI_MODELS[provider],
      active: provider === activeProvider,
      source,
      updatedAt: row?.updated_at ? new Date(row.updated_at).toISOString() : null,
    }
  })
}

export function clearAISettingsCache() {
  delete globalForAISettings.__krupimAISettingsCache
}

export async function getAllAISettings(options: { fresh?: boolean } = {}) {
  const cached = globalForAISettings.__krupimAISettingsCache
  if (!options.fresh && cached && cached.expiresAt > Date.now()) return cached.settings

  let rows: AISettingRow[] = []
  try {
    const result = await queryDb<AISettingRow>(
      'SELECT provider, api_key_encrypted, model, is_active, updated_at FROM ai_provider_settings ORDER BY provider',
    )
    rows = result.rows
  } catch (error) {
    const dbError = error as Error & { code?: string }
    if (dbError.code !== '42P01') throw error
  }

  const settings = normalizeRows(rows)
  globalForAISettings.__krupimAISettingsCache = { expiresAt: Date.now() + 15_000, settings }
  return settings
}

export async function getAISetting(provider: AIProvider) {
  const settings = await getAllAISettings()
  return settings.find(setting => setting.provider === provider) as RuntimeAISetting
}

export async function getActiveAISetting() {
  const settings = await getAllAISettings()
  return settings.find(setting => setting.active) || settings[0]
}

function validateApiKey(provider: AIProvider, value: string) {
  if (value.length < 12 || value.length > 512) throw new Error('API Key ต้องมีความยาวระหว่าง 12 ถึง 512 ตัวอักษร')
  if (provider === 'gemini' && !value.startsWith('AIza')) throw new Error('Gemini API Key ต้องขึ้นต้นด้วย AIza')
  if (provider === 'openai' && !value.startsWith('sk-')) throw new Error('OpenAI API Key ต้องขึ้นต้นด้วย sk-')
  if (provider === 'claude' && !value.startsWith('sk-ant-')) throw new Error('Anthropic API Key ต้องขึ้นต้นด้วย sk-ant-')
}

async function saveWithClient(
  client: PoolClient,
  input: { provider: AIProvider; model: string; apiKey?: string; active: boolean; updatedBy: string },
) {
  const current = await client.query<{ api_key_encrypted: string | null }>(
    'SELECT api_key_encrypted FROM ai_provider_settings WHERE provider = $1 FOR UPDATE',
    [input.provider],
  )
  const trimmedKey = input.apiKey?.trim() || ''
  if (trimmedKey) validateApiKey(input.provider, trimmedKey)
  const encryptedKey = trimmedKey ? encryptSecret(trimmedKey) : current.rows[0]?.api_key_encrypted || null

  if (input.active) await client.query('UPDATE ai_provider_settings SET is_active = FALSE WHERE is_active = TRUE')
  await client.query(
    `INSERT INTO ai_provider_settings (provider, api_key_encrypted, model, is_active, updated_by, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (provider) DO UPDATE SET
       api_key_encrypted = EXCLUDED.api_key_encrypted,
       model = EXCLUDED.model,
       is_active = EXCLUDED.is_active,
       updated_by = EXCLUDED.updated_by,
       updated_at = NOW()`,
    [input.provider, encryptedKey, input.model, input.active, input.updatedBy],
  )
}

export async function saveAISetting(input: {
  provider: AIProvider
  model: string
  apiKey?: string
  active: boolean
  updatedBy: string
}) {
  if (!isAllowedAIModel(input.provider, input.model)) throw new Error('โมเดลที่เลือกไม่อยู่ในรายการที่รองรับ')
  await withTransaction(client => saveWithClient(client, input))
  clearAISettingsCache()
  return getAllAISettings({ fresh: true })
}

export function publicAISettings(settings: RuntimeAISetting[]) {
  return settings.map(({ apiKey, ...setting }) => ({
    ...setting,
    keyConfigured: Boolean(apiKey),
    keyHint: apiKey ? `••••${apiKey.slice(-4)}` : null,
  }))
}
