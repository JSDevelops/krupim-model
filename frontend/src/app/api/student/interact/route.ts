import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

type LessonSentenceRow = {
  title: string
  sentences: unknown
}

const SENTENCE_TRANSLATIONS: Record<string, string> = {
  // Week 1: Cutlery & Glassware
  'this is a dinner knife. it is used for the main course.': 'นี่คือมีดรับประทานอาหารค่ำ ใช้สำหรับรับประทานอาหารจานหลัก',
  'a soup spoon is used for soup.': 'ช้อนซุปใช้สำหรับรับประทานซุป',
  'this is a water goblet.': 'นี่คือแก้วน้ำมีก้าน (Water Goblet)',
  'we use water goblet for water.': 'เราใช้แก้วน้ำมีก้านสำหรับเสิร์ฟน้ำดื่ม',
  'what is this equipment? - this is a water goblet.': 'อุปกรณ์ชิ้นนี้คืออะไร? - นี่คือแก้วน้ำมีก้าน',

  // Week 2: Food & Beverage Menu
  'spaghetti carbonara is categorized as a main course.': 'สปาเกตตี คาร์โบนารา จัดอยู่ในหมวดหมู่อาหารจานหลัก',
  'virgin mojito belongs to non-alcoholic beverages.': 'เวอร์จิน โมฮิโต จัดอยู่ในหมวดหมู่เครื่องดื่มไม่มีแอลกอฮอล์',
  'how is caesar salad categorized?': 'ซีซาร์สลัดจัดอยู่ในหมวดหมู่อาหารประเภทใด?',
  'caesar salad is categorized as an appetizer.': 'ซีซาร์สลัดจัดอยู่ในหมวดหมู่อาหารเรียกน้ำย่อย (Appetizer)',
  'what kind of dish is tiramisu? - tiramisu is a dessert.': 'ทีรามิสุคืออาหารประเภทใด? - ทีรามิสุคือของหวาน (Dessert)',

  // Common Service & Later Weeks
  'may i show you to your table, please?': 'ขออนุญาตพาท่านไปที่โต๊ะได้ไหมครับ/ค่ะ?',
  'here is the menu. can i get you something to drink to start?': 'นี่คือรายการอาหารครับ/ค่ะ รับเครื่องดื่มอะไรก่อนดีครับ?',
  'are you ready to order, or do you need a few more minutes?': 'พร้อมสั่งอาหารแล้วหรือยังครับ หรือต้องการเวลาดูเมนูเพิ่มเติม?',
  'i apologize for the delay. your order will be ready shortly.': 'ขออภัยในความล่าช้าครับ อาหารของท่านจะพร้อมเสิร์ฟในไม่ช้า',
  'would you like to see the dessert menu?': 'ท่านต้องการดูเมนูของหวานเพิ่มเติมไหมครับ?',
  'here is your bill, sir/madam. whenever you are ready.': 'นี่คือใบเรียกเก็บเงินครับ/ค่ะ ท่านสามารถชำระได้เมื่อพร้อมครับ',
  'how would you like to settle the bill, in cash or by credit card?': 'ท่านสะดวกชำระค่าอาหารเป็นเงินสดหรือบัตรเครดิตดีครับ?',
  'thank you very much for dining with us. we hope to welcome you again soon.': 'ขอบพระคุณเป็นอย่างยิ่งที่มาใช้บริการ หวังว่าจะมีโอกาสได้ต้อนรับท่านอีกครั้งนะครับ',
  'throughout this semester, i have developed my professional food and beverage service skills.': 'ตลอดภาคเรียนนี้ ฉันได้พัฒนาทักษะวิชาชีพการบริการอาหารและเครื่องดื่มอย่างต่อเนื่อง',
  'the most challenging part was handling difficult customer complaints and special dietary requests.': 'ส่วนที่ท้าทายที่สุดคือการรับมือกับข้อร้องเรียนของลูกค้าและการจัดการคำขออาหารพิเศษ',
  'i will apply this skill to my future hotel internship and career in hospitality.': 'ฉันจะนำทักษะนี้ไปประยุกต์ใช้ในการฝึกงานและการทำงานในสายงานบริการโรงแรมในอนาคต',
  'what is the correct procedure when a guest complains about undercooked food?': 'ขั้นตอนที่ถูกต้องเมื่อลูกค้าแจ้งว่าอาหารไม่สุกคืออะไร?',
  'how do you present the bill professionally?': 'คุณจะยื่นใบเรียกเก็บเงินให้กับลูกค้าอย่างมืออาชีพได้อย่างไร?',
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student', 'developer'], maxRequests: 120 })
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')?.trim()

    // Determine if student is enrolled in a specific class
    const classCheck = await queryDb<{ class_id: string }>(`
      SELECT class_id FROM class_students WHERE student_id=$1::uuid LIMIT 1
    `, [user.id])
    const enrolledClassId = classCheck.rows[0]?.class_id

    const scope = user.role === 'developer' || !enrolledClassId
      ? ''
      : `AND (class_id=$1::uuid OR class_id IS NULL)`

    const queryParams: unknown[] = user.role === 'developer' || !enrolledClassId ? [] : [enrolledClassId]

    // Fetch list of available published lesson plans ordered by week number (Week 1 first)
    const plansResult = await queryDb<{ id: string; title: string; weeks: string; concept: string }>(`
      SELECT id, title, weeks, concept
      FROM fine_lesson_plans
      WHERE publication_status='published' ${scope}
      ORDER BY COALESCE(NULLIF(regexp_replace(weeks, '[^0-9]', '', 'g'), '')::int, NULLIF(regexp_replace(id, '[^0-9]', '', 'g'), '')::int, 999) ASC, id ASC
      LIMIT 30
    `, queryParams)

    let filterClause = ''
    const sentenceParams: unknown[] = [...queryParams]
    if (planId && planId !== 'all') {
      sentenceParams.push(planId)
      filterClause = `AND id=$${sentenceParams.length}`
    }

    const result = await queryDb<LessonSentenceRow & { id: string; weeks: string; concept: string }>(`
      SELECT id, title, weeks, concept, sentences
      FROM fine_lesson_plans
      WHERE publication_status='published' ${scope} ${filterClause}
        AND jsonb_typeof(sentences) = 'array'
        AND jsonb_array_length(sentences) > 0
      ORDER BY COALESCE(NULLIF(regexp_replace(weeks, '[^0-9]', '', 'g'), '')::int, NULLIF(regexp_replace(id, '[^0-9]', '', 'g'), '')::int, 999) ASC, id ASC
      LIMIT 30
    `, sentenceParams)

    const prompts: Array<{ en: string; th: string; context: string; planId?: string; weekNum?: number }> = []
    const seen = new Set<string>()
    for (const row of result.rows) {
      if (!Array.isArray(row.sentences)) continue
      const weekMatch = row.weeks?.match(/\d+/) || row.id?.match(/\d+/)
      const weekNum = weekMatch ? parseInt(weekMatch[0], 10) : 0
      for (const sentence of row.sentences) {
        if (typeof sentence !== 'string') continue
        const en = sentence.trim()
        const key = en.toLocaleLowerCase('en')
        if (!en || seen.has(key)) continue
        seen.add(key)
        const customTh = SENTENCE_TRANSLATIONS[key] || `ประโยคฝึกภาษาอังกฤษสำหรับงานบริการ (${row.weeks || 'แผนการสอน'})`
        prompts.push({
          en,
          th: customTh,
          context: `${row.weeks ? row.weeks + ': ' : ''}${row.title || 'แผนการสอนของครู'}`,
          planId: row.id,
          weekNum,
        })
      }
    }

    let assignment: { id: string; title: string; maxScore: number } | null = null
    if (planId && planId !== 'all') {
      const assignRes = await queryDb<{ id: string; title: string; maxScore: number }>(`
        SELECT a.id, a.title, a.max_score AS "maxScore"
        FROM assignments a
        JOIN classes c ON c.id=a.class_id
        JOIN class_students cs ON cs.class_id=c.id AND cs.student_id=$1::uuid
        WHERE a.lesson_plan_id=$2 AND a.activity_type='Interact' AND a.is_published=TRUE
        LIMIT 1
      `, [user.id, planId])
      assignment = assignRes.rows[0] || null
    }

    return NextResponse.json(
      { prompts, plans: plansResult.rows, assignment },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
    )
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['student'], maxRequests: 40 })
    const body = await request.json() as { score?: unknown; sentence?: unknown }
    const score = Number(body.score)
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return NextResponse.json({ error: 'คะแนนไม่ถูกต้อง' }, { status: 400 })
    }
    const sentence = typeof body.sentence === 'string' ? body.sentence.trim().slice(0, 500) : ''
    await withTransaction(async client => {
      await client.query(`
        INSERT INTO chat_sessions (student_id,session_type,topic,messages_json,ended_at)
        VALUES ($1::uuid,'gemini_live',$2,$3::jsonb,NOW())
      `, [user.id, 'Pronunciation practice', JSON.stringify([{ sentence, score }])])
      const existing = await client.query<{ id: string }>(`
        SELECT id FROM learning_analytics
        WHERE student_id=$1::uuid AND course_id IS NULL AND date=CURRENT_DATE
        ORDER BY id LIMIT 1 FOR UPDATE
      `, [user.id])
      if (existing.rows[0]) {
        await client.query(`
          UPDATE learning_analytics
          SET skills_score=ROUND((skills_score+$1)/2),
              overall_score=ROUND((knowledge_score*0.3)+(ROUND((skills_score+$1)/2)*0.5)+(attitude_score*0.2)),
              time_spent_minutes=time_spent_minutes+1
          WHERE id=$2::uuid
        `, [score, existing.rows[0].id])
      } else {
        await client.query(`
          INSERT INTO learning_analytics (student_id,course_id,date,skills_score,overall_score,time_spent_minutes)
          VALUES ($1::uuid,NULL,CURRENT_DATE,$2,ROUND($2*0.5),1)
        `, [user.id, score])
      }
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
