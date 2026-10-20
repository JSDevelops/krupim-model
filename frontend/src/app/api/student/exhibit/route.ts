import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

const CURRICULUM_QUIZZES = [
  {
    topicId: 'table_setting',
    topicTitle: 'การจัดโต๊ะและอุปกรณ์ (Table Setting)',
    questions: [
      {
        question: 'หลักการจัดวางอุปกรณ์ "Outside-In" หมายถึงข้อใด?',
        options: ['ใช้อุปกรณ์จากชิ้นที่อยู่วงนอกสุดเข้าหาด้านในตามลำดับคอร์สอาหาร', 'วางอุปกรณ์จากด้านขวาไปซ้ายเสมอ', 'ใช้อุปกรณ์ตรงกลางจานก่อนเสมอ', 'หยิบชิ้นไหนก่อนก็ได้ตามความสะดวกของลูกค้า'],
        correct: 0,
        explanation: 'Outside-In คือหลักสากลในการจัดโต๊ะตะวันตก โดยผู้รับประทานจะใช้อุปกรณ์จากชิ้นนอกสุดเข้าหาด้านในตามลำดับอาหารที่เสิร์ฟ',
      },
      {
        question: 'Water Goblet (แก้วน้ำทรงสูงมีก้าน) ควรจัดวางตำแหน่งใดบนโต๊ะอาหาร?',
        options: ['ด้านซ้ายสุดของส้อมสลัด', 'เหนือปลายมีดอาหารค่ำ (Dinner Knife) ทางด้านขวา', 'วางตรงกลางจานโชว์ (Show Plate)', 'วางด้านล่างของช้อนซุป'],
        correct: 1,
        explanation: 'แก้วน้ำ Water Goblet เป็นแก้วหลัก ถูกจัดวางไว้เหนือปลายมีด Dinner Knife ด้านขวาประมาณ 1 นิ้ว',
      },
      {
        question: 'Dinner Fork (ส้อมอาหารค่ำ/จานหลัก) มีตำแหน่งการวางที่ถูกต้องอย่างไร?',
        options: ['วางด้านขวาของจาน ถัดจากมีด', 'วางด้านซ้ายของจาน ติดกับจานโชว์', 'วางด้านบนของจานข้างช้อนของหวาน', 'วางซ้อนบนผ้าเช็ดปากตรงกลาง'],
        correct: 1,
        explanation: 'ส้อมจานหลักจะวางอยู่ทางซ้ายมือของจานหลักหรือจานโชว์เสมอ',
      },
      {
        question: 'Soup Spoon (ช้อนซุป) มีลักษณะเฉพาะและการจัดวางอย่างไร?',
        options: ['ปลายช้อนแหลม วางทางซ้าย', 'ปากช้อนกลมมน วางอยู่ด้านขวามือถัดจากมีดอาหารค่ำ', 'ด้ามยาวมาก วางบนจานขนมปัง', 'เป็นส้อมสองง่าม วางด้านบน'],
        correct: 1,
        explanation: 'ช้อนซุปจะมีหลุมช้อนกลมมนขนาดพอเหมาะ จัดวางไว้ด้านขวาสุดเพราะซุปมักเป็นคอร์สแรกๆ',
      },
    ],
  },
  {
    topicId: 'fb_classification',
    topicTitle: 'การจำแนกประเภทอาหารและเครื่องดื่ม',
    questions: [
      {
        question: 'Caesar Salad และ Spring Rolls จัดอยู่ในประเภทอาหารใดตามหลักสากล?',
        options: ['Main Course (อาหารจานหลัก)', 'Appetizer (อาหารเรียกน้ำย่อย)', 'Dessert (ของหวาน)', 'Side Dish (อาหารเคียง)'],
        correct: 1,
        explanation: 'Caesar Salad และ Spring Rolls จัดเป็น Appetizer สำหรับกระตุ้นความอยากอาหารก่อนเข้าสู่จานหลัก',
      },
      {
        question: 'เครื่องดื่มประเภท Virgin Mojito หรือ Shirley Temple จัดอยู่ในหมวดใด?',
        options: ['Alcoholic Cocktail', 'Non-Alcoholic Mocktail', 'Hot Beverage', 'Digestif'],
        correct: 1,
        explanation: 'เครื่องดื่มที่มีคำว่า Virgin หรือ Mocktail เป็นเครื่องดื่มผสมที่ไม่มีแอลกอฮอล์เพื่อสุขภาพและความสดชื่น',
      },
      {
        question: 'ข้อใดคือตัวอย่างของ Main Course (อาหารจานหลัก)?',
        options: ['Mushroom Soup', 'Grilled Ribeye Steak', 'Tiramisu', 'Garlic Bread'],
        correct: 1,
        explanation: 'Grilled Ribeye Steak เป็นอาหารจานหลักที่มีโปรตีนและปริมาณอิ่มท้องเป็นหัวใจสำคัญของมื้อ',
      },
      {
        question: 'ไวน์ขาว (White Wine) นิยมเสิร์ฟคู่กับอาหารประเภทใดมากที่สุด?',
        options: ['สเต๊กเนื้อวัวรสเข้มข้น', 'อาหารทะเล ปลา หรือเนื้อสัตว์ปีกสีขาว', 'เค้กช็อกโกแลตฟัดจ์', 'แกงกะหรี่เนื้อ'],
        correct: 1,
        explanation: 'ไวน์ขาวมีบอดี้เบาและมีความเปรี้ยวสดชื่น เหมาะกับการตัดความมันและชูรสชาติของปลาและอาหารทะเล',
      },
    ],
  },
  {
    topicId: 'service_recovery',
    topicTitle: 'มารยาทและการจัดการข้อร้องเรียน',
    questions: [
      {
        question: 'ประโยคภาษาอังกฤษใดสุภาพและเหมาะสมที่สุดในการทักทายลูกค้าช่วงค่ำ?',
        options: ['Hey, what do you want to eat?', 'Good evening. Welcome to our restaurant. Do you have a reservation?', 'Sit down here please.', 'Are you hungry?'],
        correct: 1,
        explanation: 'การทักทายมาตรฐานระดับ 5 ดาวขึ้นต้นด้วย Good evening ตามด้วยการต้อนรับและการสอบถามการจองโต๊ะ',
      },
      {
        question: 'หากลูกค้าแจ้งว่าอาหารมาช้า พนักงานบริการควรกล่าวประโยคใดเพื่อแสดงความเป็นมืออาชีพ?',
        options: ['The kitchen is busy, please wait.', 'I sincerely apologize for the delay. Your order will be served shortly.', 'It is not my fault.', 'You just ordered 5 minutes ago.'],
        correct: 1,
        explanation: 'พนักงานต้องกล่าวขออภัยอย่างจริงใจ (I sincerely apologize...) และแจ้งความคืบหน้าโดยไม่แก้ตัวหรือโทษครัว',
      },
      {
        question: 'เมื่อลูกค้าทำผ้าเช็ดปาก (Napkin) หล่นลงบนพื้น พนักงานควรทำอย่างไร?',
        options: ['บอกให้ลูกค้าก้มเก็บเอง', 'หยิบผืนเดิมขึ้นมาสะบัดแล้ววางให้ลูกค้า', 'นำผ้าเช็ดปากผืนใหม่ที่สะอาดมาเปลี่ยนให้ลูกค้าทันทีโดยไม่ให้ลูกค้ารู้สึกเก้อเขิน', 'แกล้งทำเป็นไม่เห็น'],
        correct: 2,
        explanation: 'มาตรฐานงานบริการคือการนำผืนใหม่ที่สะอาดมาเปลี่ยนให้ทันทีเพื่อสุขอนามัยที่ดีและความประทับใจ',
      },
      {
        question: 'ขั้นตอนแรกสุดเมื่อลูกค้าแจ้งว่า "แพ้อาหารทะเลอย่างรุนแรง" คืออะไร?',
        options: ['บอกลูกค้าว่าไม่เป็นไรทานได้นิดหน่อย', 'จดบันทึกอย่างชัดเจน ย้ำกับลูกค้า และแจ้งเชฟในครัวทันทีเพื่อแยกภาชนะปรุง', 'เปลี่ยนเป็นเมนูปลาแทนโดยไม่ถาม', 'บอกให้ลูกค้ากลับบ้านไปทานที่อื่น'],
        correct: 1,
        explanation: 'เรื่องสารก่อภูมิแพ้ (Allergens) เป็นความปลอดภัยสูงสุด ต้องจดบันทึก ยืนยัน และประสานงานครัวทันที',
      },
    ],
  },
]

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student', 'developer'], maxRequests: 120 })
    const [historyResult, scoreResult] = await Promise.all([
      queryDb(`
        SELECT * FROM (
          SELECT id, completed_at AS "occurredAt", 'simulation'::text AS type,
                 COALESCE(feedback_json->>'summary', 'การฝึกสถานการณ์จำลอง') AS preview,
                 LEAST(100, ROUND((score::numeric / NULLIF(max_score,0)) * 100))::int AS score,
                 duration_minutes AS "durationMinutes"
          FROM simulation_sessions WHERE student_id=$1::uuid
          UNION ALL
          SELECT id, started_at AS "occurredAt",
                 CASE WHEN session_type='gemini_live' THEN 'live' ELSE 'chat' END AS type,
                 COALESCE(NULLIF(topic,''), 'การสนทนากับผู้ช่วย AI') AS preview,
                 NULL::int AS score,
                 GREATEST(0, ROUND(EXTRACT(EPOCH FROM (COALESCE(ended_at,NOW())-started_at))/60))::int AS "durationMinutes"
          FROM chat_sessions WHERE student_id=$1::uuid
        ) history ORDER BY "occurredAt" DESC LIMIT 60
      `, [user.id]),
      queryDb(`
        SELECT COALESCE(ROUND(AVG(score)),0)::int AS "averageScore",
               COALESCE(ROUND(AVG(knowledge_score)),0)::int AS "knowledgeScore",
               COALESCE(ROUND(AVG(skills_score)),0)::int AS "skillsScore",
               COALESCE(ROUND(AVG(attitude_score)),0)::int AS "attitudeScore",
               COALESCE(ROUND(AVG(competency_score)),0)::int AS "competencyScore",
               COUNT(*)::int AS assessments
        FROM student_assessments WHERE student_id=$1::uuid
      `, [user.id]),
    ])
    return NextResponse.json(
      {
        history: historyResult.rows,
        scores: scoreResult.rows[0],
        quizBank: CURRICULUM_QUIZZES,
      },
      { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=120' } },
    )
  } catch (error) { return apiErrorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student'], maxRequests: 20 })
    const payload = await request.json() as { score?: unknown }
    const score = Number(payload.score)
    if (!Number.isInteger(score) || score < 0 || score > 100) return NextResponse.json({ error: 'คะแนนไม่ถูกต้อง' }, { status: 400 })
    // Record assessment for teacher and student analytics
    await Promise.all([
      queryDb(`
        INSERT INTO student_assessments (student_id, score, knowledge_score, skills_score, attitude_score, competency_score, feedback)
        VALUES ($1::uuid, $2, $2, $2, 85, $2, 'แบบทดสอบ Exhibit Quiz')
      `, [user.id, score]),
      queryDb(`
        INSERT INTO learning_events (student_id, event_type, reference_type, reference_id, score, metadata_json)
        VALUES ($1::uuid, 'quiz_completed', 'exhibit_quiz', 'exhibit-quiz-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MI'), $2, json_build_object('score', $2)::jsonb)
        ON CONFLICT DO NOTHING
      `, [user.id, score]),
    ])

    const existing = await queryDb<{ id: string }>(`SELECT id FROM learning_analytics WHERE student_id=$1::uuid AND course_id IS NULL AND date=CURRENT_DATE LIMIT 1`, [user.id])
    if (existing.rows[0]) {
      await queryDb(`
        UPDATE learning_analytics
        SET knowledge_score=ROUND((knowledge_score+$1)/2),
            overall_score=ROUND((ROUND((knowledge_score+$1)/2)*0.2)+(skills_score*0.3)+(attitude_score*0.1)+(competency_score*0.4))
        WHERE id=$2::uuid
      `, [score, existing.rows[0].id])
    } else {
      await queryDb(`
        INSERT INTO learning_analytics(student_id,course_id,date,knowledge_score,skills_score,attitude_score,competency_score,overall_score)
        VALUES($1::uuid,NULL,CURRENT_DATE,$2,$2,85,$2,ROUND($2*0.2))
      `, [user.id, score])
    }
    return NextResponse.json({ ok: true })
  } catch (error) { return apiErrorResponse(error) }
}
