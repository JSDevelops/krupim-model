import 'server-only'

import { queryDb, withTransaction } from '@/lib/db'
import { decryptSecret, encryptSecret } from '@/lib/aiSettings'

export const TRIPO_MODEL_VERSIONS = [
  'P1-20260311',
  'Turbo-v1.0-20250506',
  'v3.1-20260211',
  'v3.0-20250812',
  'v2.5-20250123',
  'v2.0-20240919',
  'v1.4-20240625',
] as const

export type TripoModelVersion = typeof TRIPO_MODEL_VERSIONS[number]

type TripoRow = {
  api_key_encrypted: string | null
  config_json: { modelVersion?: unknown }
  updated_at: Date | string
}

export type RuntimeTripoSetting = {
  apiKey: string
  modelVersion: TripoModelVersion
  source: 'database' | 'environment' | 'none'
  updatedAt: string | null
}

const defaultModel: TripoModelVersion = 'v2.5-20250123'
const globalForTripo = globalThis as typeof globalThis & {
  __krupimTripoCache?: { expiresAt: number; setting: RuntimeTripoSetting }
}

export function isTripoModelVersion(value: unknown): value is TripoModelVersion {
  return typeof value === 'string' && TRIPO_MODEL_VERSIONS.includes(value as TripoModelVersion)
}

export function clearTripoSettingsCache() {
  delete globalForTripo.__krupimTripoCache
}

export async function getTripoSetting(options: { fresh?: boolean } = {}): Promise<RuntimeTripoSetting> {
  const cached = globalForTripo.__krupimTripoCache
  if (!options.fresh && cached && cached.expiresAt > Date.now()) return cached.setting

  let row: TripoRow | undefined
  try {
    const result = await queryDb<TripoRow>(`
      SELECT api_key_encrypted,config_json,updated_at
      FROM integration_settings WHERE provider='tripo' LIMIT 1
    `)
    row = result.rows[0]
  } catch (error) {
    if ((error as { code?: string }).code !== '42P01') throw error
  }

  const encrypted = row?.api_key_encrypted || ''
  const environment = process.env.TRIPO_API_KEY?.trim() || ''
  const setting: RuntimeTripoSetting = {
    apiKey: encrypted ? decryptSecret(encrypted) : environment,
    modelVersion: isTripoModelVersion(row?.config_json?.modelVersion) ? row.config_json.modelVersion : defaultModel,
    source: encrypted ? 'database' : environment ? 'environment' : 'none',
    updatedAt: row?.updated_at ? new Date(row.updated_at).toISOString() : null,
  }
  globalForTripo.__krupimTripoCache = { expiresAt: Date.now() + 15_000, setting }
  return setting
}

export async function saveTripoSetting(input: {
  apiKey?: string
  modelVersion: TripoModelVersion
  updatedBy: string
}) {
  const newKey = input.apiKey?.trim() || ''
  if (newKey && (newKey.length < 12 || newKey.length > 512 || !newKey.startsWith('tsk_'))) {
    throw new Error('Tripo API Key ต้องขึ้นต้นด้วย tsk_ และมีความยาวไม่เกิน 512 ตัวอักษร')
  }
  await withTransaction(async client => {
    const current = await client.query<{ api_key_encrypted: string | null }>(`
      SELECT api_key_encrypted FROM integration_settings WHERE provider='tripo' FOR UPDATE
    `)
    const encrypted = newKey ? encryptSecret(newKey) : current.rows[0]?.api_key_encrypted || null
    await client.query(`
      INSERT INTO integration_settings(provider,api_key_encrypted,config_json,updated_by,updated_at)
      VALUES('tripo',$1,jsonb_build_object('modelVersion',$2::text),$3::uuid,NOW())
      ON CONFLICT(provider) DO UPDATE SET api_key_encrypted=EXCLUDED.api_key_encrypted,
        config_json=EXCLUDED.config_json,updated_by=EXCLUDED.updated_by,updated_at=NOW()
    `, [encrypted, input.modelVersion, input.updatedBy])
    await client.query(`
      INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json)
      VALUES($1::uuid,'update_tripo_settings','integration_setting','tripo',jsonb_build_object('modelVersion',$2::text,'keyChanged',$3::boolean))
    `, [input.updatedBy, input.modelVersion, Boolean(newKey)])
  })
  clearTripoSettingsCache()
  return getTripoSetting({ fresh: true })
}

export function publicTripoSetting(setting: RuntimeTripoSetting) {
  return {
    modelVersion: setting.modelVersion,
    keyConfigured: Boolean(setting.apiKey),
    keyHint: setting.apiKey ? `••••${setting.apiKey.slice(-4)}` : null,
    source: setting.source,
    updatedAt: setting.updatedAt,
  }
}
