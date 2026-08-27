import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

type LessonSentenceRow = {
  title: string
  sentences: unknown
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
    const result = await queryDb<LessonSentenceRow>(`
      SELECT title, sentences
      FROM fine_lesson_plans
      WHERE publication_status='published' ${scope}
        AND jsonb_typeof(sentences) = 'array'
        AND jsonb_array_length(sentences) > 0
      ORDER BY updated_at DESC
      LIMIT 6
    `, user.role === 'developer' ? [] : [user.id])

    const prompts: Array<{ en: string; th: string; context: string }> = []
    const seen = new Set<string>()
    for (const row of result.rows) {
      if (!Array.isArray(row.sentences)) continue
      for (const sentence of row.sentences) {
        if (typeof sentence !== 'string') continue
        const en = sentence.trim()
        const key = en.toLocaleLowerCase('en')
        if (!en || seen.has(key)) continue
        seen.add(key)
        prompts.push({ en, th: 'ประโยคฝึกจากแผนการสอน', context: row.title || 'แผนการสอนของครู' })
        if (prompts.length >= 30) break
      }
      if (prompts.length >= 30) break
    }

    return NextResponse.json(
      { prompts },
      { headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=300' } },
    )
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student'], maxRequests: 40 })
    const body = await request.json() as { score?: unknown; sentence?: unknown }
    const score = Number(body.score)
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return NextResponse.json({ error: 'คะแนนไม่ถูกต้อง' }, { status: 400 })
    }
    const sentence = typeof body.sentence === 'string' ? body.sentence.trim().slice(0, 500) : ''
    await withTransaction(async client => {
      await client.query(`
        INSERT INTO chat_sessions (student_id,session_type,topic,messages_json,ended_at)
        VALUES ($1::uuid,'gemini_live',$2,$3::jsonb,NOW())
      `, [user.id, 'Pronunciation practice', JSON.stringify([{ sentence, score }])])
      const existing = await client.query<{ id: string }>(`
        SELECT id FROM learning_analytics
        WHERE student_id=$1::uuid AND course_id IS NULL AND date=CURRENT_DATE
        ORDER BY id LIMIT 1 FOR UPDATE
      `, [user.id])
      if (existing.rows[0]) {
        await client.query(`
          UPDATE learning_analytics
          SET skills_score=ROUND((skills_score+$1)/2),
              overall_score=ROUND((knowledge_score*0.2)+(ROUND((skills_score+$1)/2)*0.3)+(attitude_score*0.1)+(competency_score*0.4)),
              time_spent_minutes=time_spent_minutes+1
          WHERE id=$2::uuid
        `, [score, existing.rows[0].id])
      } else {
        await client.query(`
          INSERT INTO learning_analytics (student_id,course_id,date,skills_score,overall_score,time_spent_minutes)
          VALUES ($1::uuid,NULL,CURRENT_DATE,$2,ROUND($2*0.3),1)
        `, [user.id, score])
      }
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
