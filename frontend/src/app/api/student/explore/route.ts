import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

type ExploreItem = {
  name: string
  nameEn: string
  emoji: string
  use: string
  sentence: string
  pronounce?: string
  modelId?: string
}

type VocabularyRow = {
  name_th: string
  name_en: string
  emoji: string | null
  use_desc: string | null
  sentence: string | null
  pronounce: string | null
}

type ScanRow = {
  id: string
  name_th: string
  name_en: string
  image_url: string | null
  description: string | null
  service_tips: string | null
  pronounce: string | null
  glb_url: string | null
}

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: ['student', 'developer'], maxRequests: 120 })

    const [vocabularyResult, scanResult] = await Promise.all([
      queryDb<VocabularyRow>(`
        SELECT name_th, name_en, emoji, use_desc, sentence, pronounce
        FROM vocabulary_items
        ORDER BY updated_at DESC
        LIMIT 500
      `),
      queryDb<ScanRow>(`
        SELECT id, name_th, name_en, image_url, description, service_tips, pronounce, glb_url
        FROM ai_scan_items
        ORDER BY created_at DESC
        LIMIT 500
      `),
    ])

    const items = new Map<string, ExploreItem>()

    for (const row of vocabularyResult.rows) {
      if (!row.name_en?.trim()) continue
      items.set(row.name_en.trim().toLocaleLowerCase('en'), {
        name: row.name_th,
        nameEn: row.name_en,
        emoji: row.emoji || '',
        use: row.use_desc || 'ยังไม่มีรายละเอียดวิธีใช้งาน',
        sentence: row.sentence || 'Please handle this item with care.',
        pronounce: row.pronounce || undefined,
      })
    }

    for (const row of scanResult.rows) {
      if (!row.name_en?.trim()) continue
      const key = row.name_en.trim().toLocaleLowerCase('en')
      const previous = items.get(key)
      items.set(key, {
        name: previous?.name || row.name_th,
        nameEn: previous?.nameEn || row.name_en,
        emoji: previous?.emoji || row.image_url || '',
        use: previous?.use || row.description || 'ยังไม่มีรายละเอียดวิธีใช้งาน',
        sentence: previous?.sentence || row.service_tips || 'Please handle this item with care.',
        pronounce: previous?.pronounce || row.pronounce || undefined,
        modelId: row.glb_url ? row.id : previous?.modelId,
      })
    }

    return NextResponse.json(
      { items: [...items.values()] },
      { headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=300' } },
    )
  } catch (error) {
    return apiErrorResponse(error)
  }
}
