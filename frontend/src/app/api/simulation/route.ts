import { NextRequest, NextResponse } from 'next/server'
import { withTransaction } from '@/lib/db'
import { apiErrorResponse, getErrorMessage, guardApi } from '../_lib/auth'
import { getActiveProvider, getConfiguredModel, getGemini, getOpenAI, getAnthropic } from '../_lib/ai'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function boundedScore(value: unknown, fallback: number) {
  const score = Number(value)
  return Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : fallback
}

export async function POST(req: NextRequest) {
  let authUser
  try {
    authUser = await guardApi(req, { maxRequests: 10 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  try {
    const body = await req.json()
    const { messages, scenario_id } = body
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }
    if (messages.length > 50 || messages.some((message: unknown) => {
      if (!message || typeof message !== 'object') return true
      const item = message as { text?: unknown }
      return typeof item.text !== 'string' || item.text.length > 4_000
    })) {
      return NextResponse.json({ error: 'messages payload is too large' }, { status: 400 })
    }
    const validMessages = messages as Array<{ role?: string; text: string }>
    const provider = await getActiveProvider(req)
    const configuredModel = await getConfiguredModel(provider)
    const chatContent = validMessages.map(message => `${message.role === 'user' ? 'บริกร' : 'ลูกค้า'}: ${message.text}`).join('\n')
    const prompt = `คุณเป็นผู้เชี่ยวชาญประเมินการบริการในร้านอาหาร
วิเคราะห์บทสนทนาระหว่างบริกรและลูกค้าต่อไปนี้:
${chatContent}

ประเมินจากสิ่งที่ผู้เรียนตอบจริง ห้ามให้คะแนนจากจำนวนข้อความเพียงอย่างเดียว คืนค่า JSON เท่านั้น:
{
  "feedback": "ฟีดแบ็คสรุปภาษาไทย 2-3 ประโยค",
  "suggestions": ["คำแนะนำข้อที่ 1", "คำแนะนำข้อที่ 2"],
  "knowledge": 0,
  "skills": 0,
  "attitude": 0,
  "competency": 0
}
คะแนนทุกด้านต้องอยู่ระหว่าง 0-100 โดย knowledge คือความถูกต้องของภาษา, skills คือการสื่อสาร, attitude คือมารยาทบริการ และ competency คือการแก้สถานการณ์ให้สำเร็จ`

    let text = ''
    if (provider === 'openai') {
      const client = await getOpenAI(req)
      const completion = await client.chat.completions.create({
        model: configuredModel,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = await getAnthropic(req)
      const completion = await client.messages.create({
        model: configuredModel,
        max_tokens: 1_000,
        messages: [{ role: 'user', content: prompt }],
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      const genAI = await getGemini(req)
      const model = genAI.getGenerativeModel({ model: configuredModel })
      const result = await model.generateContent(prompt)
      text = result.response.text()
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON output from AI')
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
    const fallback = Math.min(80, 30 + validMessages.filter(message => message.role === 'user').length * 8)
    const scores = {
      knowledge: boundedScore(parsed.knowledge, fallback),
      skills: boundedScore(parsed.skills, fallback),
      attitude: boundedScore(parsed.attitude, fallback),
      competency: boundedScore(parsed.competency, fallback),
    }
    const overall = Math.round(scores.knowledge * 0.2 + scores.skills * 0.3 + scores.attitude * 0.1 + scores.competency * 0.4)
    const duration = Math.max(1, Math.ceil(validMessages.length / 2))

    if (authUser.role === 'student' && typeof scenario_id === 'string' && scenario_id.length <= 120) {
      try {
        await withTransaction(async client => {
          const scenarioId = UUID.test(scenario_id) ? scenario_id : null
          const lessonPlanId = scenarioId ? null : scenario_id
          if (lessonPlanId) {
            const allowed = await client.query(`
              SELECT plan.id FROM fine_lesson_plans plan
              WHERE plan.id=$1 AND plan.publication_status='published'
                AND (
                  plan.class_id IN (SELECT class_id FROM class_students WHERE student_id=$2::uuid)
                  OR (plan.class_id IS NULL AND plan.target_class IN (
                    SELECT c.name FROM classes c JOIN class_students cs ON cs.class_id=c.id WHERE cs.student_id=$2::uuid
                  ))
                ) LIMIT 1
            `, [lessonPlanId, authUser.id])
            if (!allowed.rows[0]) throw new Error('Student cannot access this scenario')
          }
          await client.query(`
            INSERT INTO simulation_sessions (
              student_id,scenario_id,lesson_plan_id,score,max_score,duration_minutes,feedback_json,conversation_json
            ) VALUES ($1::uuid,$2::uuid,$3,$4,100,$5,$6::jsonb,$7::jsonb)
          `, [authUser.id, scenarioId, lessonPlanId, overall, duration, JSON.stringify({ ...parsed, ...scores, score: overall }), JSON.stringify(validMessages)])

          const daily = await client.query<{
            id: string; knowledge_score: string; skills_score: string
            attitude_score: string; competency_score: string
          }>(`
            SELECT id,knowledge_score,skills_score,attitude_score,competency_score
            FROM learning_analytics
            WHERE student_id=$1::uuid AND course_id IS NULL AND date=CURRENT_DATE
            ORDER BY id LIMIT 1 FOR UPDATE
          `, [authUser.id])
          if (daily.rows[0]) {
            const previous = daily.rows[0]
            const knowledge = Math.round((Number(previous.knowledge_score) + scores.knowledge) / 2)
            const skills = Math.round((Number(previous.skills_score) + scores.skills) / 2)
            const attitude = Math.round((Number(previous.attitude_score) + scores.attitude) / 2)
            const competency = Math.round((Number(previous.competency_score) + scores.competency) / 2)
            const mergedOverall = Math.round(knowledge * 0.2 + skills * 0.3 + attitude * 0.1 + competency * 0.4)
            await client.query(`
              UPDATE learning_analytics SET knowledge_score=$1,skills_score=$2,attitude_score=$3,
                competency_score=$4,overall_score=$5,time_spent_minutes=time_spent_minutes+$6
              WHERE id=$7::uuid
            `, [knowledge, skills, attitude, competency, mergedOverall, duration, previous.id])
          } else {
            await client.query(`
              INSERT INTO learning_analytics (
                student_id,course_id,date,knowledge_score,skills_score,attitude_score,
                competency_score,overall_score,time_spent_minutes
              ) VALUES ($1::uuid,NULL,CURRENT_DATE,$2,$3,$4,$5,$6,$7)
            `, [authUser.id, scores.knowledge, scores.skills, scores.attitude, scores.competency, overall, duration])
          }
        })
      } catch (databaseError) {
        console.error('Failed to save simulation session:', getErrorMessage(databaseError))
      }
    }

    return NextResponse.json({ ...parsed, ...scores, score: overall })
  } catch (error) {
    console.error('Simulation Evaluation Error:', getErrorMessage(error))
    return NextResponse.json({ error: 'Failed to evaluate simulation. Please try again.' }, { status: 500 })
  }
}
