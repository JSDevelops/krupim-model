import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student', 'developer'], maxRequests: 120 })
    const lessonScope = user.role === 'developer' ? '' : `AND (
      class_id IN (SELECT class_id FROM class_students WHERE student_id=$1::uuid)
      OR (class_id IS NULL AND target_class IN (
        SELECT c.name FROM classes c JOIN class_students cs ON cs.class_id=c.id WHERE cs.student_id=$1::uuid
      ))
    )`
    const [profile, stats, tasks, lesson, notifications, fEvents, iSessions, nSimulations, eSubmissions, certRow] = await Promise.all([
      queryDb(`
        SELECT name,email,avatar_url AS "avatarUrl",school_name AS "schoolName"
        FROM profiles WHERE id=$1::uuid LIMIT 1
      `, [user.id]),
      queryDb(`
        SELECT COALESCE(ROUND(AVG(knowledge_score)),0)::int AS "knowledgeScore",
               COALESCE(ROUND(AVG(skills_score)),0)::int AS "skillsScore",
               COALESCE(ROUND(AVG(attitude_score)),0)::int AS "attitudeScore",
               COALESCE(ROUND(AVG(competency_score)),0)::int AS "competencyScore",
               COALESCE(ROUND(AVG(overall_score)),0)::int AS "overallScore",
               COALESCE(SUM(lessons_completed),0)::int AS "lessonsCompleted",
               COALESCE(SUM(time_spent_minutes),0)::int AS "timeSpentMinutes"
        FROM learning_analytics WHERE student_id=$1::uuid
      `, [user.id]),
      queryDb(`
        SELECT a.id, a.title, a.description, a.activity_type AS "activityType",
               a.due_date AS "dueDate", a.max_score AS "maxScore",
               c.name AS "className",
               lp.title AS "lessonTitle", lp.weeks AS "weekName"
        FROM assignments a
        JOIN classes c ON c.id=a.class_id
        JOIN class_students cs ON cs.class_id=c.id AND cs.student_id=$1::uuid
        LEFT JOIN fine_lesson_plans lp ON lp.id=a.lesson_plan_id
        LEFT JOIN assignment_submissions s ON s.assignment_id=a.id AND s.student_id=$1::uuid
        WHERE s.id IS NULL ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC LIMIT 50
      `, [user.id]),
      queryDb(`
        SELECT id,title,subject,level,weeks,concept FROM fine_lesson_plans
        WHERE publication_status='published' ${lessonScope}
        ORDER BY updated_at DESC LIMIT 1
      `, user.role === 'developer' ? [] : [user.id]),
      queryDb(`
        SELECT id,title,message,type,link_url AS "linkUrl",created_at AS "createdAt"
        FROM notifications WHERE user_id=$1::uuid AND is_read=FALSE
        ORDER BY created_at DESC LIMIT 5
      `, [user.id]),
      queryDb<{ count: string }>(`
        SELECT COUNT(*)::text AS count FROM learning_events
        WHERE student_id=$1::uuid AND event_type IN ('ar_view', 'ai_scan', 'mission_completed')
      `, [user.id]),
      queryDb<{ count: string }>(`
        SELECT COUNT(*)::text AS count FROM chat_sessions
        WHERE student_id=$1::uuid
      `, [user.id]),
      queryDb<{ count: string }>(`
        SELECT COUNT(*)::text AS count FROM simulation_sessions
        WHERE student_id=$1::uuid
      `, [user.id]),
      queryDb<{ count: string }>(`
        SELECT (
          (SELECT COUNT(*) FROM student_assessments WHERE student_id=$1::uuid) +
          (SELECT COUNT(*) FROM assignment_submissions WHERE student_id=$1::uuid)
        )::text AS count
      `, [user.id]),
      queryDb<{ id: string; certificate_code: string }>(`
        SELECT id, certificate_code FROM certificates WHERE student_id=$1::uuid AND revoked_at IS NULL LIMIT 1
      `, [user.id]),
    ])
    const counts = { F: 0, I: 0, N: 0, E: 0, P: tasks.rows.length }
    for (const task of tasks.rows as Array<{ activityType?: string }>) {
      const key = task.activityType?.[0]?.toUpperCase()
      if (key === 'F' || key === 'I' || key === 'N' || key === 'E') counts[key] += 1
    }

    const fCount = Number(fEvents.rows[0]?.count || 0)
    const iCount = Number(iSessions.rows[0]?.count || 0)
    const nCount = Number(nSimulations.rows[0]?.count || 0)
    const eCount = Number(eSubmissions.rows[0]?.count || 0)
    const cert = certRow.rows[0]

    const completedSteps = (fCount > 0 ? 1 : 0) + (iCount > 0 ? 1 : 0) + (nCount > 0 ? 1 : 0) + (eCount > 0 ? 1 : 0)
    const journey = {
      f: { key: 'F', title: 'Familiarize (Focus)', label: 'สำรวจอุปกรณ์ & 3D AR', count: fCount, completed: fCount > 0, href: '/student/explore' },
      i: { key: 'I', title: 'Interact', label: 'ฝึกฟังและออกเสียงบทสนทนา', count: iCount, completed: iCount > 0, href: '/student/interact' },
      n: { key: 'N', title: 'Navigate', label: 'สถานการณ์จำลอง & บทบาทสมมติ', count: nCount, completed: nCount > 0, href: '/student/navigate' },
      e: { key: 'E', title: 'Exhibit (Evaluate)', label: 'แบบทดสอบ & ส่งงานประเมิน', count: eCount, completed: eCount > 0, href: '/student/exhibit' },
      completedSteps,
      percentage: Math.round((completedSteps / 4) * 100),
      hasCertificate: Boolean(cert?.id),
      certificateCode: cert?.certificate_code || null,
    }

    return NextResponse.json(
      {
        profile: profile.rows[0], stats: stats.rows[0], tasks: tasks.rows,
        taskCounts: counts, latestLesson: lesson.rows[0] || null, notifications: notifications.rows,
        journey,
      },
      { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=120' } },
    )
  } catch (error) {
    return apiErrorResponse(error)
  }
}
