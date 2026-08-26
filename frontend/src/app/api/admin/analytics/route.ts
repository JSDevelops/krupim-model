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

const summaryQuery = [
  'SELECT',
  '((SELECT COUNT(*) FROM chat_sessions) + (SELECT COUNT(*) FROM simulation_sessions) + (SELECT COUNT(*) FROM student_assessments) + (SELECT COUNT(*) FROM lesson_progress))::int AS total_activities,',
  "((SELECT COUNT(*) FROM chat_sessions WHERE started_at >= NOW() - INTERVAL '7 days') +",
  "(SELECT COUNT(*) FROM simulation_sessions WHERE completed_at >= NOW() - INTERVAL '7 days') +",
  "(SELECT COUNT(*) FROM student_assessments WHERE submitted_at >= NOW() - INTERVAL '7 days') +",
  "(SELECT COUNT(*) FROM lesson_progress WHERE updated_at >= NOW() - INTERVAL '7 days'))::int AS period_activities,",
  'COALESCE((SELECT ROUND(AVG(overall_score))::int FROM learning_analytics), 0) AS average_score,',
  "COALESCE((SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0))::int FROM lesson_progress), 0) AS completion_rate,",
  "(SELECT COUNT(DISTINCT school_id)::int FROM profiles WHERE approval_status = 'active' AND school_id IS NOT NULL) AS active_schools",
].join(' ')

const ksaQuery = [
  'SELECT',
  'COALESCE(ROUND(AVG(knowledge_score))::int, 0) AS knowledge,',
  'COALESCE(ROUND(AVG(skills_score))::int, 0) AS skills,',
  'COALESCE(ROUND(AVG(attitude_score))::int, 0) AS attitude,',
  'COALESCE(ROUND(AVG(competency_score))::int, 0) AS competency',
  'FROM learning_analytics',
].join(' ')

const featureQuery = [
  'SELECT',
  '(SELECT COUNT(*)::int FROM chat_sessions) AS chat,',
  '(SELECT COUNT(*)::int FROM student_assessments) AS assessment,',
  '(SELECT COUNT(*)::int FROM simulation_sessions) AS simulation,',
  "(SELECT COUNT(*)::int FROM lesson_progress JOIN lessons ON lessons.id = lesson_progress.lesson_id WHERE lessons.content_type = 'ar3d') AS ar3d",
].join(' ')

const weeklyQuery = [
  "WITH days AS (SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')::date AS day)",
  "SELECT TO_CHAR(days.day, 'YYYY-MM-DD') AS date,",
  'COALESCE(ROUND(AVG(learning_analytics.overall_score))::int, 0) AS average_score,',
  '((SELECT COUNT(*) FROM chat_sessions WHERE started_at::date = days.day) +',
  '(SELECT COUNT(*) FROM simulation_sessions WHERE completed_at::date = days.day) +',
  '(SELECT COUNT(*) FROM student_assessments WHERE submitted_at::date = days.day) +',
  '(SELECT COUNT(*) FROM lesson_progress WHERE updated_at::date = days.day))::int AS activities',
  'FROM days LEFT JOIN learning_analytics ON learning_analytics.date = days.day',
  'GROUP BY days.day ORDER BY days.day',
].join(' ')

const topStudentsQuery = [
  'SELECT profiles.id, profiles.name, profiles.school_name, MAX(classes.name) AS class_name,',
  'ROUND(AVG(learning_analytics.overall_score))::int AS average_score,',
  'COALESCE(SUM(learning_analytics.lessons_completed), 0)::int AS lessons_completed',
  'FROM learning_analytics',
  'JOIN profiles ON profiles.id = learning_analytics.student_id',
  'LEFT JOIN class_students ON class_students.student_id = profiles.id',
  'LEFT JOIN classes ON classes.id = class_students.class_id',
  'GROUP BY profiles.id, profiles.name, profiles.school_name',
  'ORDER BY average_score DESC, lessons_completed DESC LIMIT 5',
].join(' ')

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: developerOnly, maxRequests: 60 })
    const [summary, ksa, features, weekly, topStudents] = await Promise.all([
      queryDb<SummaryRow>(summaryQuery),
      queryDb<KsaRow>(ksaQuery),
      queryDb<FeatureRow>(featureQuery),
      queryDb<WeeklyRow>(weeklyQuery),
      queryDb<TopStudentRow>(topStudentsQuery),
    ])

    const response = NextResponse.json({
      summary: summary.rows[0],
      ksa: ksa.rows[0],
      features: features.rows[0],
      weekly: weekly.rows,
      topStudents: topStudents.rows,
      generatedAt: new Date().toISOString(),
    })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch (error) {
    return apiErrorResponse(error)
  }
}
