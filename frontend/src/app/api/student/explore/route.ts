import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

type ExploreItem = {
  id?: string
  name: string
  nameEn: string
  emoji: string
  use: string
  sentence: string
  pronounce?: string
  imageUrl?: string
  glbUrl?: string
  usdzUrl?: string
  category?: string
  categoryTh?: string
  modelId?: string
}

type VocabularyRow = {
  id: string
  name_th: string
  name_en: string
  emoji: string | null
  use_desc: string | null
  sentence: string | null
  pronounce: string | null
  image_url: string | null
  glb_url: string | null
  usdz_url: string | null
  category: string | null
  category_th: string | null
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
    await guardApi(request, { roles: ['student', 'teacher', 'developer'], maxRequests: 120 })

    const [vocabularyResult, scanResult] = await Promise.all([
      queryDb<VocabularyRow>(`
        SELECT id, name_th, name_en, emoji, use_desc, sentence, pronounce,
               image_url, glb_url, usdz_url, category, category_th
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
        id: row.id,
        name: row.name_th,
        nameEn: row.name_en,
        emoji: row.emoji || '',
        use: row.use_desc || 'ยังไม่มีรายละเอียดวิธีใช้งาน',
        sentence: row.sentence || 'Please handle this item with care.',
        pronounce: row.pronounce || undefined,
        imageUrl: row.image_url || undefined,
        glbUrl: row.glb_url || undefined,
        usdzUrl: row.usdz_url || undefined,
        category: row.category || undefined,
        categoryTh: row.category_th || undefined,
        modelId: row.glb_url ? row.id : undefined,
      })
    }

    for (const row of scanResult.rows) {
      if (!row.name_en?.trim()) continue
      const key = row.name_en.trim().toLocaleLowerCase('en')
      const previous = items.get(key)
      items.set(key, {
        id: previous?.id || row.id,
        name: previous?.name || row.name_th,
        nameEn: previous?.nameEn || row.name_en,
        emoji: previous?.emoji || row.image_url || '',
        use: previous?.use || row.description || 'ยังไม่มีรายละเอียดวิธีใช้งาน',
        sentence: previous?.sentence || row.service_tips || 'Please handle this item with care.',
        pronounce: previous?.pronounce || row.pronounce || undefined,
        imageUrl: previous?.imageUrl || row.image_url || undefined,
        glbUrl: previous?.glbUrl || row.glb_url || undefined,
        usdzUrl: previous?.usdzUrl || undefined,
        category: previous?.category,
        categoryTh: previous?.categoryTh,
        modelId: previous?.modelId || (row.glb_url ? row.id : undefined),
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

