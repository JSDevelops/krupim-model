import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student', 'developer'], maxRequests: 120 })
    const [historyResult, scoreResult] = await Promise.all([
      queryDb(`
        SELECT * FROM (
          SELECT id, completed_at AS "occurredAt", 'simulation'::text AS type,
                 COALESCE(feedback_json->>'summary', 'การฝึกสถานการณ์จำลอง') AS preview,
                 LEAST(100, ROUND((score::numeric / NULLIF(max_score,0)) * 100))::int AS score,
                 duration_minutes AS "durationMinutes"
          FROM simulation_sessions WHERE student_id=$1::uuid
          UNION ALL
          SELECT id, started_at AS "occurredAt",
                 CASE WHEN session_type='gemini_live' THEN 'live' ELSE 'chat' END AS type,
                 COALESCE(NULLIF(topic,''), 'การสนทนากับผู้ช่วย AI') AS preview,
                 NULL::int AS score,
                 GREATEST(0, ROUND(EXTRACT(EPOCH FROM (COALESCE(ended_at,NOW())-started_at))/60))::int AS "durationMinutes"
          FROM chat_sessions WHERE student_id=$1::uuid
        ) history ORDER BY "occurredAt" DESC LIMIT 60
      `, [user.id]),
      queryDb(`
        SELECT COALESCE(ROUND(AVG(score)),0)::int AS "averageScore",
               COALESCE(ROUND(AVG(knowledge_score)),0)::int AS "knowledgeScore",
               COALESCE(ROUND(AVG(skills_score)),0)::int AS "skillsScore",
               COALESCE(ROUND(AVG(attitude_score)),0)::int AS "attitudeScore",
               COALESCE(ROUND(AVG(competency_score)),0)::int AS "competencyScore",
               COUNT(*)::int AS assessments
        FROM student_assessments WHERE student_id=$1::uuid
      `, [user.id]),
    ])
    return NextResponse.json(
      { history: historyResult.rows, scores: scoreResult.rows[0] },
      { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=120' } },
    )
  } catch (error) { return apiErrorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student'], maxRequests: 20 })
    const payload = await request.json() as { score?: unknown }
    const score = Number(payload.score)
    if (!Number.isInteger(score) || score < 0 || score > 100) return NextResponse.json({ error: 'คะแนนไม่ถูกต้อง' }, { status: 400 })
    const existing = await queryDb<{ id: string }>(`SELECT id FROM learning_analytics WHERE student_id=$1::uuid AND course_id IS NULL AND date=CURRENT_DATE LIMIT 1`, [user.id])
    if (existing.rows[0]) {
      await queryDb(`
        UPDATE learning_analytics
        SET knowledge_score=ROUND((knowledge_score+$1)/2),
            overall_score=ROUND((ROUND((knowledge_score+$1)/2)*0.2)+(skills_score*0.3)+(attitude_score*0.1)+(competency_score*0.4))
        WHERE id=$2::uuid
      `, [score, existing.rows[0].id])
    } else {
      await queryDb(`
        INSERT INTO learning_analytics(student_id,course_id,date,knowledge_score,overall_score)
        VALUES($1::uuid,NULL,CURRENT_DATE,$2,ROUND($2*0.2))
      `, [user.id, score])
    }
    return NextResponse.json({ ok: true })
  } catch (error) { return apiErrorResponse(error) }
}
