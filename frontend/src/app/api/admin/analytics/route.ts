import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

const developerOnly = ['developer'] as const

type SummaryRow = {
  total_activities: number
  period_activities: number
  average_score: number
  completion_rate: number
  active_schools: number
}

type KsaRow = {
  knowledge: number
  skills: number
  attitude: number
  competency: number
}

type FeatureRow = {
  chat: number
  assessment: number
  simulation: number
  ar3d: number
}

type WeeklyRow = {
  date: string
  average_score: number
  activities: number
}

type TopStudentRow = {
  id: string
  name: string
  school_name: string | null
  class_name: string | null
  average_score: number
  lessons_completed: number
}

type AnalyticsRow = {
  summary: SummaryRow
  ksa: KsaRow
  features: FeatureRow
  weekly: WeeklyRow[]
  top_students: TopStudentRow[]
}

const analyticsQuery = `
  WITH activity_events AS (
    SELECT started_at::date AS day FROM chat_sessions WHERE started_at >= CURRENT_DATE - INTERVAL '6 days'
    UNION ALL
    SELECT completed_at::date FROM simulation_sessions WHERE completed_at >= CURRENT_DATE - INTERVAL '6 days'
    UNION ALL
    SELECT submitted_at::date FROM student_assessments WHERE submitted_at >= CURRENT_DATE - INTERVAL '6 days'
    UNION ALL
    SELECT updated_at::date FROM lesson_progress WHERE updated_at >= CURRENT_DATE - INTERVAL '6 days'
  ), activity_counts AS (
    SELECT day, COUNT(*)::int AS activities FROM activity_events GROUP BY day
  ), summary AS (
    SELECT
      ((SELECT COUNT(*) FROM chat_sessions) + (SELECT COUNT(*) FROM simulation_sessions) +
       (SELECT COUNT(*) FROM student_assessments) + (SELECT COUNT(*) FROM lesson_progress))::int AS total_activities,
      (SELECT COUNT(*)::int FROM activity_events) AS period_activities,
      COALESCE((SELECT ROUND(AVG(overall_score))::int FROM learning_analytics), 0) AS average_score,
      COALESCE((SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0))::int FROM lesson_progress), 0) AS completion_rate,
      (SELECT COUNT(DISTINCT school_id)::int FROM profiles WHERE approval_status = 'active' AND school_id IS NOT NULL) AS active_schools
  ), ksa AS (
    SELECT COALESCE(ROUND(AVG(knowledge_score))::int, 0) AS knowledge,
           COALESCE(ROUND(AVG(skills_score))::int, 0) AS skills,
           COALESCE(ROUND(AVG(attitude_score))::int, 0) AS attitude,
           COALESCE(ROUND(AVG(competency_score))::int, 0) AS competency
    FROM learning_analytics
  ), features AS (
    SELECT (SELECT COUNT(*)::int FROM chat_sessions) AS chat,
           (SELECT COUNT(*)::int FROM student_assessments) AS assessment,
           (SELECT COUNT(*)::int FROM simulation_sessions) AS simulation,
           (SELECT COUNT(*)::int FROM lesson_progress
            JOIN lessons ON lessons.id = lesson_progress.lesson_id
            WHERE lessons.content_type = 'ar3d') AS ar3d
  ), weekly AS (
    SELECT TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
           COALESCE(ROUND(AVG(analytics.overall_score))::int, 0) AS average_score,
           COALESCE(MAX(activity_counts.activities), 0)::int AS activities
    FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS days(day)
    LEFT JOIN learning_analytics analytics ON analytics.date = days.day::date
    LEFT JOIN activity_counts ON activity_counts.day = days.day::date
    GROUP BY days.day
  ), top_students AS (
    SELECT profiles.id, profiles.name, profiles.school_name, MAX(classes.name) AS class_name,
           ROUND(AVG(analytics.overall_score))::int AS average_score,
           COALESCE(SUM(analytics.lessons_completed), 0)::int AS lessons_completed
    FROM learning_analytics analytics
    JOIN profiles ON profiles.id = analytics.student_id
    LEFT JOIN class_students ON class_students.student_id = profiles.id
    LEFT JOIN classes ON classes.id = class_students.class_id
    GROUP BY profiles.id, profiles.name, profiles.school_name
    ORDER BY average_score DESC, lessons_completed DESC LIMIT 5
  )
  SELECT (SELECT to_jsonb(summary) FROM summary) AS summary,
         (SELECT to_jsonb(ksa) FROM ksa) AS ksa,
         (SELECT to_jsonb(features) FROM features) AS features,
         COALESCE((SELECT jsonb_agg(to_jsonb(weekly) ORDER BY weekly.date) FROM weekly), '[]'::jsonb) AS weekly,
         COALESCE((SELECT jsonb_agg(to_jsonb(top_students) ORDER BY top_students.average_score DESC, top_students.lessons_completed DESC) FROM top_students), '[]'::jsonb) AS top_students
`

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 60 })
    const startedAt = performance.now()
    const result = await queryDb<AnalyticsRow>(analyticsQuery)
    const row = result.rows[0]
    const databaseLatencyMs = Math.max(1, Math.round(performance.now() - startedAt))

    const response = NextResponse.json({
      summary: row.summary,
      ksa: row.ksa,
      features: row.features,
      weekly: row.weekly,
      topStudents: row.top_students,
      databaseLatencyMs,
      generatedAt: new Date().toISOString(),
    })
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Server-Timing', `database;dur=${databaseLatencyMs}`)
    return response
  } catch (error) {
    return apiErrorResponse(error)
  }
}
