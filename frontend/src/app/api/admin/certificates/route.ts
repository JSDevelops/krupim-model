import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type ScoreRow = {
  id: string; name: string; email: string; school_name: string | null
  knowledge_score: number; skills_score: number; attitude_score: number; competency_score: number; overall_score: number
}

const selectCertificate = `
  SELECT c.id, c.student_id AS "studentId", c.certificate_code AS "certificateCode",
         c.issued_name AS "issuedName", p.email, c.school_name AS "schoolName",
         c.overall_score AS "overallScore", c.score_snapshot AS "scoreSnapshot",
         c.issued_at AS "issuedAt", c.revoked_at AS "revokedAt", c.revoked_at IS NULL AS valid
  FROM certificates c JOIN profiles p ON p.id=c.student_id
`

const scoreSelect = `
  SELECT p.id,p.name,p.email,p.school_name,
    COALESCE(ROUND(AVG(la.knowledge_score)),0)::int AS knowledge_score,
    COALESCE(ROUND(AVG(la.skills_score)),0)::int AS skills_score,
    COALESCE(ROUND(AVG(la.attitude_score)),0)::int AS attitude_score,
    COALESCE(ROUND(AVG(la.competency_score)),0)::int AS competency_score,
    COALESCE(ROUND(AVG(la.overall_score)),0)::int AS overall_score
  FROM profiles p LEFT JOIN learning_analytics la ON la.student_id=p.id
  WHERE p.id=$1::uuid AND p.role='student' AND p.approval_status='active'
  GROUP BY p.id,p.name,p.email,p.school_name
`

function scoreSnapshot(score: ScoreRow) {
  const weighted = Math.round(score.knowledge_score * .2 + score.skills_score * .3 + score.attitude_score * .1 + score.competency_score * .4)
  const overall = score.overall_score || weighted
  return {
    overall,
    snapshot: {
      knowledgeScore: score.knowledge_score, skillsScore: score.skills_score,
      attitudeScore: score.attitude_score, competencyScore: score.competency_score, overallScore: overall,
    },
    eligible: overall >= 70 && [score.knowledge_score, score.skills_score, score.attitude_score, score.competency_score].every(value => value >= 60),
  }
}

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: ['developer'], maxRequests: 60 })
    const [certificatesResult, studentsResult, eventsResult] = await Promise.all([
      queryDb(`${selectCertificate} ORDER BY c.issued_at DESC LIMIT 1000`),
      queryDb<ScoreRow>(`
        SELECT p.id,p.name,p.email,p.school_name,
          COALESCE(ROUND(AVG(la.knowledge_score)),0)::int AS knowledge_score,
          COALESCE(ROUND(AVG(la.skills_score)),0)::int AS skills_score,
          COALESCE(ROUND(AVG(la.attitude_score)),0)::int AS attitude_score,
          COALESCE(ROUND(AVG(la.competency_score)),0)::int AS competency_score,
          COALESCE(ROUND(AVG(la.overall_score)),0)::int AS overall_score
        FROM profiles p LEFT JOIN learning_analytics la ON la.student_id=p.id
        WHERE p.role='student' AND p.approval_status='active'
        GROUP BY p.id,p.name,p.email,p.school_name ORDER BY p.name LIMIT 2000
      `),
      queryDb(`
        SELECT e.id,e.certificate_id AS "certificateId",e.event_type AS "eventType",
          e.details_json AS details,e.created_at AS "createdAt",p.name AS "actorName",p.email AS "actorEmail"
        FROM certificate_events e LEFT JOIN profiles p ON p.id=e.actor_id
        ORDER BY e.created_at DESC LIMIT 5000
      `),
    ])
    const certificateByStudent = new Map(certificatesResult.rows.map(certificate => [certificate.studentId as string, certificate]))
    const students = studentsResult.rows.map(student => {
      const scores = scoreSnapshot(student)
      const certificate = certificateByStudent.get(student.id)
      return {
        id: student.id, name: student.name, email: student.email, schoolName: student.school_name,
        overallScore: scores.overall, scoreSnapshot: scores.snapshot, eligible: scores.eligible,
        certificateId: certificate?.id || null, certificateCode: certificate?.certificateCode || null,
        certificateValid: certificate ? certificate.valid : null,
      }
    })
    return NextResponse.json({ certificates: certificatesResult.rows, students, events: eventsResult.rows }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await guardApi(request, { roles: ['developer'], maxRequests: 15 })
    const body = await request.json() as { studentId?: unknown; action?: unknown }
    const studentId = typeof body.studentId === 'string' ? body.studentId : ''
    const action = body.action === 'reissue' ? 'reissue' : body.action === 'issue' ? 'issue' : ''
    if (!UUID.test(studentId) || !action) throw new ApiError('ข้อมูลการออกใบรับรองไม่ถูกต้อง', 400, 'VALIDATION_ERROR')

    const certificate = await withTransaction(async client => {
      const scores = await client.query<ScoreRow>(scoreSelect, [studentId])
      const score = scores.rows[0]
      if (!score) throw new ApiError('ไม่พบบัญชีนักเรียนที่พร้อมออกใบรับรอง', 404, 'NOT_FOUND')
      const calculated = scoreSnapshot(score)
      if (!calculated.eligible) throw new ApiError('นักเรียนยังไม่ผ่านเกณฑ์: คะแนนรวมต้องไม่น้อยกว่า 70 และแต่ละด้านไม่น้อยกว่า 60', 409, 'CERTIFICATE_NOT_ELIGIBLE')

      const existing = await client.query<{ id: string; certificate_code: string }>(
        `SELECT id,certificate_code FROM certificates WHERE student_id=$1::uuid AND certificate_type='fine-fb-service' FOR UPDATE`, [studentId],
      )
      if (action === 'issue' && existing.rows[0]) throw new ApiError('นักเรียนมีใบรับรองแล้ว โปรดเลือกออกใบรับรองใหม่อีกครั้ง', 409, 'CERTIFICATE_EXISTS')
      if (action === 'reissue' && !existing.rows[0]) throw new ApiError('ยังไม่มีใบรับรองเดิม กรุณาเลือกออกใบรับรอง', 409, 'CERTIFICATE_NOT_FOUND')

      let id: string
      let oldCode: string | null = null
      if (action === 'issue') {
        const inserted = await client.query<{ id: string }>(`
          INSERT INTO certificates(student_id,issued_name,school_name,overall_score,score_snapshot)
          VALUES($1::uuid,$2,$3,$4,$5::jsonb) RETURNING id
        `, [studentId, score.name, score.school_name, calculated.overall, JSON.stringify(calculated.snapshot)])
        id = inserted.rows[0].id
      } else {
        id = existing.rows[0].id
        oldCode = existing.rows[0].certificate_code
        await client.query(`
          UPDATE certificates SET certificate_code=('FINE-'||UPPER(encode(gen_random_bytes(8),'hex'))),
            issued_name=$2,school_name=$3,overall_score=$4,score_snapshot=$5::jsonb,issued_at=NOW(),revoked_at=NULL
          WHERE id=$1::uuid
        `, [id, score.name, score.school_name, calculated.overall, JSON.stringify(calculated.snapshot)])
      }
      const selected = await client.query(`${selectCertificate} WHERE c.id=$1::uuid LIMIT 1`, [id])
      const current = selected.rows[0]
      const details = { overallScore: calculated.overall, previousCertificateCode: oldCode, certificateCode: current.certificateCode }
      await client.query(`INSERT INTO certificate_events(certificate_id,actor_id,event_type,details_json) VALUES($1::uuid,$2::uuid,$3,$4::jsonb)`, [id, actor.id, action, JSON.stringify(details)])
      await client.query(`INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json) VALUES($1::uuid,$2,'certificate',$3::text,$4::jsonb)`, [actor.id, `${action}_certificate`, id, JSON.stringify(details)])
      return current
    })
    return NextResponse.json({ certificate }, { status: action === 'issue' ? 201 : 200 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await guardApi(request, { roles: ['developer'], maxRequests: 30 })
    const body = await request.json() as { id?: unknown; action?: unknown }
    const id = typeof body.id === 'string' ? body.id : ''
    const action = body.action === 'revoke' || body.action === 'restore' ? body.action : ''
    if (!UUID.test(id) || !action) throw new ApiError('ข้อมูลคำสั่งไม่ถูกต้อง', 400, 'VALIDATION_ERROR')

    const certificate = await withTransaction(async client => {
      const locked = await client.query<{ revoked_at: Date | null }>('SELECT revoked_at FROM certificates WHERE id=$1::uuid FOR UPDATE', [id])
      if (!locked.rows[0]) throw new ApiError('ไม่พบใบรับรอง', 404, 'NOT_FOUND')
      if (action === 'revoke' && locked.rows[0].revoked_at) throw new ApiError('ใบรับรองนี้ถูกยกเลิกอยู่แล้ว', 409, 'CERTIFICATE_ALREADY_REVOKED')
      if (action === 'restore' && !locked.rows[0].revoked_at) throw new ApiError('ใบรับรองนี้ใช้งานได้อยู่แล้ว', 409, 'CERTIFICATE_ALREADY_VALID')
      await client.query(`UPDATE certificates SET revoked_at=${action === 'revoke' ? 'NOW()' : 'NULL'} WHERE id=$1::uuid`, [id])
      const details = { action }
      await client.query(`INSERT INTO certificate_events(certificate_id,actor_id,event_type,details_json) VALUES($1::uuid,$2::uuid,$3,$4::jsonb)`, [id, actor.id, action, JSON.stringify(details)])
      await client.query(`INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json) VALUES($1::uuid,$2,'certificate',$3::text,$4::jsonb)`, [actor.id, `${action}_certificate`, id, JSON.stringify(details)])
      const result = await client.query(`${selectCertificate} WHERE c.id=$1::uuid LIMIT 1`, [id])
      return result.rows[0]
    })
    return NextResponse.json({ certificate })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
