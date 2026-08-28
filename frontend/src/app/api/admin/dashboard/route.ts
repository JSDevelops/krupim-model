import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

const developerOnly = ['developer'] as const

type MetricsRow = {
  schools: number
  teachers: number
  students: number
  pending_teachers: number
  published_courses: number
  average_score: number
  completed_lessons: number
  simulation_sessions: number
}

type WeeklyRow = {
  date: string
  average_score: number
  lessons: number
}

type RecentUserRow = {
  id: string
  name: string
  email: string
  role: 'developer' | 'teacher' | 'student'
  approval_status: 'pending' | 'active' | 'inactive'
  created_at: string
}

type DashboardRow = MetricsRow & {
  weekly: WeeklyRow[]
  recent_users: RecentUserRow[]
}

const dashboardQuery = `
  WITH metrics AS (
    SELECT
      (SELECT COUNT(*)::int FROM schools) AS schools,
      (SELECT COUNT(*)::int FROM profiles WHERE role = 'teacher' AND approval_status = 'active') AS teachers,
      (SELECT COUNT(*)::int FROM profiles WHERE role = 'student' AND approval_status = 'active') AS students,
      (SELECT COUNT(*)::int FROM profiles WHERE requested_role = 'teacher' AND approval_status = 'pending') AS pending_teachers,
      (SELECT COUNT(*)::int FROM courses WHERE is_published = true) AS published_courses,
      COALESCE((SELECT ROUND(AVG(overall_score))::int FROM learning_analytics), 0) AS average_score,
      (SELECT COUNT(*)::int FROM lesson_progress WHERE status = 'completed') AS completed_lessons,
      (SELECT COUNT(*)::int FROM simulation_sessions) AS simulation_sessions
  ), weekly AS (
    SELECT TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
           COALESCE(ROUND(AVG(analytics.overall_score))::int, 0) AS average_score,
           COALESCE(SUM(analytics.lessons_completed)::int, 0) AS lessons
    FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS days(day)
    LEFT JOIN learning_analytics analytics ON analytics.date = days.day::date
    GROUP BY days.day
  ), recent_users AS (
    SELECT id, name, email, role, approval_status, created_at
    FROM profiles ORDER BY created_at DESC LIMIT 5
  )
  SELECT metrics.*,
         COALESCE((SELECT jsonb_agg(to_jsonb(weekly) ORDER BY weekly.date) FROM weekly), '[]'::jsonb) AS weekly,
         COALESCE((SELECT jsonb_agg(to_jsonb(recent_users) ORDER BY recent_users.created_at DESC) FROM recent_users), '[]'::jsonb) AS recent_users
  FROM metrics
`

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 60 })
    const startedAt = performance.now()

    const result = await queryDb<DashboardRow>(dashboardQuery)
    const row = result.rows[0]
    const { weekly, recent_users: recentUsers, ...metrics } = row

    const databaseLatencyMs = Math.max(1, Math.round(performance.now() - startedAt))
    const response = NextResponse.json({
      metrics,
      weekly,
      recentUsers,
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
