import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 120 })
    const values = user.role === 'developer' ? [] : [user.id]
    const classScope = user.role === 'developer' ? '' : 'WHERE c.teacher_id=$1::uuid'
    const assignmentScope = user.role === 'developer' ? '' : 'WHERE a.teacher_id=$1::uuid'

    const [classes, students, pending, announcements] = await Promise.all([
      queryDb(`
        SELECT c.id, c.name, c.year, c.semester, c.is_active AS "isActive",
               COUNT(cs.id)::int AS "studentCount"
        FROM classes c
        LEFT JOIN class_students cs ON cs.class_id=c.id
        ${classScope}
        GROUP BY c.id
        ORDER BY c.is_active DESC, c.name ASC
        LIMIT 300
      `, values),
      queryDb(`
        WITH owned_classes AS (
          SELECT c.id, c.name FROM classes c ${classScope}
        ), memberships AS (
          SELECT cs.student_id,
                 ARRAY_AGG(DISTINCT oc.id) AS class_ids,
                 ARRAY_AGG(DISTINCT oc.name ORDER BY oc.name) AS class_names_list,
                 STRING_AGG(DISTINCT oc.name, ', ' ORDER BY oc.name) AS class_names
          FROM class_students cs
          JOIN owned_classes oc ON oc.id=cs.class_id
          GROUP BY cs.student_id
        ), analytics AS (
          SELECT la.student_id,
                 ROUND(AVG(la.knowledge_score))::int AS knowledge,
                 ROUND(AVG(la.skills_score))::int AS skills,
                 ROUND(AVG(la.attitude_score))::int AS attitude,
                 ROUND(AVG(la.competency_score))::int AS competency,
                 SUM(la.lessons_completed)::int AS lessons_completed,
                 SUM(la.time_spent_minutes)::int AS time_spent_minutes,
                 MAX(la.date)::timestamptz AS last_active
          FROM learning_analytics la
          JOIN memberships m ON m.student_id=la.student_id
          GROUP BY la.student_id
        ), assessments AS (
          SELECT sa.student_id,
                 ROUND(AVG(sa.knowledge_score))::int AS knowledge,
                 ROUND(AVG(sa.skills_score))::int AS skills,
                 ROUND(AVG(sa.attitude_score))::int AS attitude,
                 ROUND(AVG(sa.competency_score))::int AS competency,
                 MAX(sa.submitted_at) AS last_active
          FROM student_assessments sa
          JOIN memberships m ON m.student_id=sa.student_id
          GROUP BY sa.student_id
        ), sessions AS (
          SELECT activity.student_id, COUNT(*)::int AS total, MAX(activity.occurred_at) AS last_active
          FROM (
            SELECT student_id, completed_at AS occurred_at FROM simulation_sessions
            UNION ALL
            SELECT student_id, started_at AS occurred_at FROM chat_sessions
          ) activity
          JOIN memberships m ON m.student_id=activity.student_id
          GROUP BY activity.student_id
        )
        SELECT p.id, p.name, p.school_name AS school,
               m.class_ids AS "classIds", m.class_names_list AS "classNames",
               m.class_names AS "className",
               COALESCE(an.knowledge, ass.knowledge, 0)::int AS knowledge,
               COALESCE(an.skills, ass.skills, 0)::int AS skills,
               COALESCE(an.attitude, ass.attitude, 0)::int AS attitude,
               COALESCE(an.competency, ass.competency, 0)::int AS competency,
               COALESCE(an.lessons_completed, 0)::int AS "lessonsCompleted",
               COALESCE(an.time_spent_minutes, 0)::int AS "timeSpentMinutes",
               COALESCE(se.total, 0)::int AS sessions,
               GREATEST(an.last_active, ass.last_active, se.last_active) AS "lastActive"
        FROM memberships m
        JOIN profiles p ON p.id=m.student_id
        LEFT JOIN analytics an ON an.student_id=p.id
        LEFT JOIN assessments ass ON ass.student_id=p.id
        LEFT JOIN sessions se ON se.student_id=p.id
        ORDER BY p.name ASC
        LIMIT 1000
      `, values),
      queryDb(`
        SELECT s.id, a.id AS "assignmentId", s.student_id AS "studentId",
               p.name AS "studentName", c.id AS "classId", c.name AS "className",
               a.title AS "taskName", a.activity_type AS type,
               COALESCE(NULLIF(a.description,''), 'คะแนนเต็ม ' || a.max_score || ' คะแนน') AS unit,
               a.max_score AS "maxScore", s.submitted_at AS "submittedAt"
        FROM assignment_submissions s
        JOIN assignments a ON a.id=s.assignment_id
        JOIN classes c ON c.id=a.class_id
        JOIN profiles p ON p.id=s.student_id
        ${assignmentScope}
        ${assignmentScope ? 'AND' : 'WHERE'} s.score IS NULL
        ORDER BY s.submitted_at ASC
        LIMIT 100
      `, values),
      queryDb(`
        SELECT id, title, content, priority, link_url AS "linkUrl", published_at AS "publishedAt"
        FROM system_announcements
        ORDER BY published_at DESC
        LIMIT 3
      `),
    ])

    return NextResponse.json(
      {
        classes: classes.rows,
        students: students.rows,
        pending: pending.rows,
        announcements: announcements.rows,
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    return apiErrorResponse(error)
  }
}
