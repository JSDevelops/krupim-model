import { NextRequest, NextResponse } from 'next/server'
import { withTransaction } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'

type ScoreRow = {
  name: string
  school_name: string | null
  knowledge_score: number
  skills_score: number
  attitude_score: number
  competency_score: number
  overall_score: number
}

const certificateSelect = `
  SELECT id, certificate_code AS "certificateCode", issued_name AS "issuedName",
         school_name AS "schoolName", overall_score AS "overallScore",
         score_snapshot AS "scoreSnapshot", issued_at AS "issuedAt"
  FROM certificates
  WHERE student_id=$1::uuid AND certificate_type='fine-fb-service' AND revoked_at IS NULL
  LIMIT 1
`

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student'], maxRequests: 60 })
    const certificate = await withTransaction(async client => {
      const result = await client.query(certificateSelect, [user.id])
      return result.rows[0] || null
    })
    return NextResponse.json({ certificate }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student'], maxRequests: 6 })
    const certificate = await withTransaction(async client => {
      const existing = await client.query(certificateSelect, [user.id])
      if (existing.rows[0]) return existing.rows[0]
      const revoked = await client.query('SELECT id FROM certificates WHERE student_id=$1::uuid AND certificate_type=$2 AND revoked_at IS NOT NULL LIMIT 1', [user.id, 'fine-fb-service'])
      if (revoked.rows[0]) throw new ApiError('ใบรับรองนี้ถูกยกเลิก กรุณาติดต่อผู้ดูแลระบบ', 409, 'CERTIFICATE_REVOKED')

      const scores = await client.query<ScoreRow>(`
        SELECT p.name, p.school_name,
          COALESCE(ROUND(AVG(la.knowledge_score)),0)::int AS knowledge_score,
          COALESCE(ROUND(AVG(la.skills_score)),0)::int AS skills_score,
          COALESCE(ROUND(AVG(la.attitude_score)),0)::int AS attitude_score,
          COALESCE(ROUND(AVG(la.competency_score)),0)::int AS competency_score,
          COALESCE(ROUND(AVG(la.overall_score)),0)::int AS overall_score
        FROM profiles p
        LEFT JOIN learning_analytics la ON la.student_id=p.id
        WHERE p.id=$1::uuid AND p.role='student' AND p.approval_status='active'
        GROUP BY p.id, p.name, p.school_name
      `, [user.id])
      const score = scores.rows[0]
      if (!score) throw new ApiError('ไม่พบบัญชีนักเรียนที่พร้อมออกใบรับรอง', 404, 'NOT_FOUND')

      const weighted = Math.round(
        score.knowledge_score * 0.2
        + score.skills_score * 0.3
        + score.attitude_score * 0.1
        + score.competency_score * 0.4,
      )
      const overall = score.overall_score || weighted
      const dimensions = [score.knowledge_score, score.skills_score, score.attitude_score, score.competency_score]
      if (overall < 70 || dimensions.some(value => value < 60)) {
        throw new ApiError('คะแนนยังไม่ผ่านเกณฑ์ออกใบรับรอง', 409, 'CERTIFICATE_NOT_ELIGIBLE')
      }

      const snapshot = {
        knowledgeScore: score.knowledge_score,
        skillsScore: score.skills_score,
        attitudeScore: score.attitude_score,
        competencyScore: score.competency_score,
        overallScore: overall,
      }
      const inserted = await client.query(`
        INSERT INTO certificates (student_id, issued_name, school_name, overall_score, score_snapshot)
        VALUES ($1::uuid,$2,$3,$4,$5::jsonb)
        ON CONFLICT (student_id, certificate_type) DO UPDATE
          SET student_id=EXCLUDED.student_id
        RETURNING id, certificate_code AS "certificateCode", issued_name AS "issuedName",
                  school_name AS "schoolName", overall_score AS "overallScore",
                  score_snapshot AS "scoreSnapshot", issued_at AS "issuedAt"
      `, [user.id, score.name, score.school_name, overall, JSON.stringify(snapshot)])
      await client.query(`
        INSERT INTO certificate_events(certificate_id,actor_id,event_type,details_json)
        VALUES($1::uuid,$2::uuid,'issue',$3::jsonb)
      `, [inserted.rows[0].id, user.id, JSON.stringify({ overallScore: overall, source: 'student-self-service' })])
      await client.query(`
        INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json)
        VALUES($1::uuid,'issue_certificate','certificate',$2::text,$3::jsonb)
      `, [user.id, inserted.rows[0].id, JSON.stringify({ overallScore: overall })])
      return inserted.rows[0]
    })
    return NextResponse.json({ certificate }, { status: 201 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
