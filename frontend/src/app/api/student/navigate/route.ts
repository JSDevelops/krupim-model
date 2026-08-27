import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

type LessonPlanRow = {
  id: string
  title: string
  subject: string | null
  level: string | null
  concept: string | null
  vocabulary: unknown
  sentences: unknown
  activity: string | null
}

type VocabularyItem = {
  word: string
  pronunciation: string
  meaning: string
}

function cleanText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() || fallback : fallback
}

function normalizeVocabulary(value: unknown): VocabularyItem[] {
  if (!Array.isArray(value)) return []

  return value.slice(0, 30).flatMap(item => {
    if (typeof item === 'string') {
      const word = item.trim()
      return word ? [{ word, pronunciation: '', meaning: 'คำศัพท์จากแผนการสอน' }] : []
    }
    if (!item || typeof item !== 'object') return []

    const record = item as Record<string, unknown>
    const word = cleanText(record.nameEn || record.word || record.name_en)
    if (!word) return []

    return [{
      word,
      pronunciation: cleanText(record.pronunciation || record.pronounce || record.ph),
      meaning: cleanText(record.name || record.nameTh || record.meaning || record.name_th, 'คำศัพท์จากแผนการสอน'),
    }]
  })
}

function normalizeSentences(value: unknown) {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value.slice(0, 30).flatMap(item => {
    if (typeof item !== 'string') return []
    const sentence = item.trim()
    const key = sentence.toLocaleLowerCase('en')
    if (!sentence || seen.has(key)) return []
    seen.add(key)
    return [sentence]
  })
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student', 'developer'], maxRequests: 120 })
    const scope = user.role === 'developer' ? '' : `AND (
      class_id IN (SELECT class_id FROM class_students WHERE student_id=$1::uuid)
      OR (class_id IS NULL AND target_class IN (
        SELECT c.name FROM classes c JOIN class_students cs ON cs.class_id=c.id WHERE cs.student_id=$1::uuid
      ))
    )`
    const result = await queryDb<LessonPlanRow>(`
      SELECT id, title, subject, level, concept, vocabulary, sentences,
             activities_n AS activity
      FROM fine_lesson_plans
      WHERE publication_status='published' ${scope}
        AND (jsonb_typeof(vocabulary) = 'array'
         OR jsonb_typeof(sentences) = 'array'
        )
      ORDER BY updated_at DESC
      LIMIT 24
    `, user.role === 'developer' ? [] : [user.id])

    const scenarios = result.rows.map(row => ({
      id: row.id,
      title: cleanText(row.title, 'Service Practice'),
      titleTh: cleanText(row.subject, 'สถานการณ์ฝึกจากแผนการสอน'),
      role: cleanText(row.level, 'พนักงานบริการอาหารและเครื่องดื่ม'),
      description: cleanText(row.concept || row.activity, 'ฝึกการสื่อสารและการให้บริการตามสถานการณ์จริง'),
      activity: cleanText(row.activity),
      vocabulary: normalizeVocabulary(row.vocabulary),
      sentences: normalizeSentences(row.sentences),
    }))

    return NextResponse.json(
      { scenarios },
      { headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=300' } },
    )
  } catch (error) {
    return apiErrorResponse(error)
  }
}
