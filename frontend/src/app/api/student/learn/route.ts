import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student', 'developer'], maxRequests: 120 })
    const scope = user.role === 'developer' ? '' : `AND (
      class_id IN (SELECT class_id FROM class_students WHERE student_id=$1::uuid)
      OR (class_id IS NULL AND target_class IN (
        SELECT c.name FROM classes c JOIN class_students cs ON cs.class_id=c.id WHERE cs.student_id=$1::uuid
      ))
    )`
    const [result, completionResult, testedResult, stageProgressResult] = await Promise.all([
      queryDb(`
        SELECT id,title,subject,level,term,duration,target_class AS "targetClass",weeks,concept,
               objectives_k AS "objectivesK",objectives_s AS "objectivesS",objectives_a AS "objectivesA",
               objectives_ap AS "objectivesAP",vocabulary,sentences,activities_f AS "activitiesF",
               activities_i AS "activitiesI",activities_n AS "activitiesN",activities_e AS "activitiesE"
        FROM fine_lesson_plans
        WHERE publication_status='published' ${scope}
        ORDER BY COALESCE(NULLIF(regexp_replace(weeks, '[^0-9]', '', 'g'), '')::int, NULLIF(regexp_replace(id, '[^0-9]', '', 'g'), '')::int, 999) ASC, updated_at DESC LIMIT 100
      `, user.role === 'developer' ? [] : [user.id]),
      user.role === 'student'
        ? queryDb<{ reference_id: string }>(`
            SELECT reference_id FROM learning_events
            WHERE student_id=$1::uuid AND event_type='lesson_completed' AND reference_type='fine_lesson_plan'
            UNION
            SELECT DISTINCT a.lesson_plan_id AS reference_id
            FROM assignment_submissions s
            JOIN assignments a ON a.id=s.assignment_id
            WHERE s.student_id=$1::uuid AND a.lesson_plan_id IS NOT NULL
          `, [user.id])
        : Promise.resolve({ rows: [] as Array<{ reference_id: string }> }),
      user.role === 'student'
        ? queryDb<{ reference_id: string }>(`
            SELECT reference_id FROM learning_events
            WHERE student_id=$1::uuid AND event_type='lesson_tested' AND reference_type='fine_lesson_plan'
            UNION
            SELECT DISTINCT a.lesson_plan_id AS reference_id
            FROM assignment_submissions s
            JOIN assignments a ON a.id=s.assignment_id
            WHERE s.student_id=$1::uuid AND a.lesson_plan_id IS NOT NULL
              AND (a.activity_type ILIKE '%exhibit%' OR a.activity_type ILIKE 'E%')
          `, [user.id])
        : Promise.resolve({ rows: [] as Array<{ reference_id: string }> }),
      user.role === 'student'
        ? queryDb<{ lessonId: string; stage: string }>(`
            SELECT a.lesson_plan_id AS "lessonId",
                   COALESCE(NULLIF(UPPER(SUBSTRING(a.activity_type FROM 1 FOR 1)), ''), 'F') AS "stage"
            FROM assignment_submissions s
            JOIN assignments a ON a.id=s.assignment_id
            WHERE s.student_id=$1::uuid AND a.lesson_plan_id IS NOT NULL
            GROUP BY a.lesson_plan_id, "stage"
          `, [user.id])
        : Promise.resolve({ rows: [] as Array<{ lessonId: string; stage: string }> }),
    ])

    const stageMap: Record<string, Record<string, boolean>> = {}
    for (const row of stageProgressResult.rows) {
      if (!stageMap[row.lessonId]) stageMap[row.lessonId] = { F: false, I: false, N: false, E: false }
      stageMap[row.lessonId][row.stage] = true
    }

    return NextResponse.json(
      {
        lessons: result.rows,
        completedIds: Array.from(new Set(completionResult.rows.map(item => item.reference_id))),
        testedIds: Array.from(new Set(testedResult.rows.map(item => item.reference_id))),
        stageProgress: stageMap,
      },
      { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=120' } },
    )
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student'], maxRequests: 30 })
    const body = await request.json() as { lessonId?: unknown }
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : ''
    if (!lessonId || lessonId.length > 120) {
      return NextResponse.json({ error: 'รหัสบทเรียนไม่ถูกต้อง' }, { status: 400 })
    }
    const completed = await withTransaction(async client => {
      const allowed = await client.query(`
        SELECT plan.id FROM fine_lesson_plans plan
        WHERE plan.id=$1 AND plan.publication_status='published'
          AND (
            plan.class_id IN (SELECT class_id FROM class_students WHERE student_id=$2::uuid)
            OR (plan.class_id IS NULL AND plan.target_class IN (
              SELECT c.name FROM classes c JOIN class_students cs ON cs.class_id=c.id WHERE cs.student_id=$2::uuid
            ))
          ) LIMIT 1
      `, [lessonId, user.id])
      if (!allowed.rows[0]) return false
      const event = await client.query(`
        INSERT INTO learning_events (student_id,event_type,reference_type,reference_id)
        VALUES ($1::uuid,'lesson_completed','fine_lesson_plan',$2)
        ON CONFLICT (student_id,event_type,reference_type,reference_id) DO NOTHING
        RETURNING id
      `, [user.id, lessonId])
      if (!event.rows[0]) return true
      const analytics = await client.query<{ id: string }>(`
        SELECT id FROM learning_analytics
        WHERE student_id=$1::uuid AND course_id IS NULL AND date=CURRENT_DATE
        ORDER BY id LIMIT 1 FOR UPDATE
      `, [user.id])
      if (analytics.rows[0]) {
        await client.query(`
          UPDATE learning_analytics
          SET lessons_completed=lessons_completed+1,time_spent_minutes=time_spent_minutes+5
          WHERE id=$1::uuid
        `, [analytics.rows[0].id])
      } else {
        await client.query(`
          INSERT INTO learning_analytics (student_id,course_id,date,lessons_completed,time_spent_minutes)
          VALUES ($1::uuid,NULL,CURRENT_DATE,1,5)
        `, [user.id])
      }
      return true
    })
    if (!completed) return NextResponse.json({ error: 'ไม่พบบทเรียนหรือไม่มีสิทธิ์เข้าถึง' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
