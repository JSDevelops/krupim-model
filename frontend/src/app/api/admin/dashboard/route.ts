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

const metricsQuery = [
  'SELECT',
  "(SELECT COUNT(*)::int FROM schools) AS schools,",
  "(SELECT COUNT(*)::int FROM profiles WHERE role = 'teacher' AND approval_status = 'active') AS teachers,",
  "(SELECT COUNT(*)::int FROM profiles WHERE role = 'student' AND approval_status = 'active') AS students,",
  "(SELECT COUNT(*)::int FROM profiles WHERE requested_role = 'teacher' AND approval_status = 'pending') AS pending_teachers,",
  '(SELECT COUNT(*)::int FROM courses WHERE is_published = true) AS published_courses,',
  'COALESCE((SELECT ROUND(AVG(overall_score))::int FROM learning_analytics), 0) AS average_score,',
  "(SELECT COUNT(*)::int FROM lesson_progress WHERE status = 'completed') AS completed_lessons,",
  '(SELECT COUNT(*)::int FROM simulation_sessions) AS simulation_sessions',
].join(' ')

const weeklyQuery = [
  "WITH days AS (SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')::date AS day)",
  "SELECT TO_CHAR(days.day, 'YYYY-MM-DD') AS date,",
  'COALESCE(ROUND(AVG(learning_analytics.overall_score))::int, 0) AS average_score,',
  'COALESCE(SUM(learning_analytics.lessons_completed)::int, 0) AS lessons',
  'FROM days LEFT JOIN learning_analytics ON learning_analytics.date = days.day',
  'GROUP BY days.day ORDER BY days.day',
].join(' ')

const recentUsersQuery = [
  'SELECT id, name, email, role, approval_status, created_at',
  'FROM profiles ORDER BY created_at DESC LIMIT 5',
].join(' ')

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 60 })
    const startedAt = performance.now()

    const [metricsResult, weeklyResult, recentUsersResult] = await Promise.all([
      queryDb<MetricsRow>(metricsQuery),
      queryDb<WeeklyRow>(weeklyQuery),
      queryDb<RecentUserRow>(recentUsersQuery),
    ])

    const response = NextResponse.json({
      metrics: metricsResult.rows[0],
      weekly: weeklyResult.rows,
      recentUsers: recentUsersResult.rows,
      databaseLatencyMs: Math.max(1, Math.round(performance.now() - startedAt)),
      generatedAt: new Date().toISOString(),
    })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch (error) {
    return apiErrorResponse(error)
  }
}
