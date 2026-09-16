import { NextRequest, NextResponse } from 'next/server'
import { ApiError, apiErrorResponse, guardApi } from '../../_lib/auth'
import { getActiveProvider, getConfiguredModel, hasConfiguredKey, getGemini, getOpenAI, getAnthropic } from '../../_lib/ai'
import { queryDb } from '@/lib/db'

// Template fallback generator for feedback
function generateFallbackFeedback({
  assignmentTitle,
  activityType,
  studentName,
  ksaScores,
  rubricLevels,
  tone,
  attachmentName,
}: {
  assignmentTitle: string
  activityType: string
  studentName: string
  ksaScores: { knowledge: number; skills: number; attitude: number; competency: number }
  rubricLevels: { knowledge: number | null; skills: number | null; attitude: number | null; competency: number | null }
  tone: 'encouraging' | 'academic' | 'concise'
  attachmentName?: string | null
}): string {
  const k = ksaScores.knowledge
  const s = ksaScores.skills
  const a = ksaScores.attitude
  const c = ksaScores.competency
  const avg = Math.round(k * 0.2 + s * 0.3 + a * 0.1 + c * 0.4)

  const attachNote = attachmentName ? `ผลงาน 3D "${attachmentName}" ` : ''

  if (tone === 'concise') {
    if (avg >= 85) {
      return `${studentName} ทำผลงาน${assignmentTitle}ได้ดีเยี่ยม สัดส่วนและความถูกต้องชัดเจนมาก พัฒนาทักษะได้ตามเป้าหมายของ FINE Model อย่างดี`
    } else if (avg >= 70) {
      return `${studentName} ปฏิบัติงาน${assignmentTitle}ได้เรียบร้อย ขอให้เพิ่มความประณีตในการจัดวางและทบทวนการออกเสียงคำศัพท์เพิ่มเติม`
    } else {
      return `ผลงานมีพื้นฐานที่ดี ขอให้ ${studentName} ตรวจสอบสัดส่วนชิ้นงานและทบทวนขั้นตอนกระบวนการเพิ่มเติมตามคำแนะนำ`
    }
  }

  if (tone === 'academic') {
    const kComment = k >= 80 ? 'มีความเข้าใจคำศัพท์และบริบทการบริการได้แม่นยำ' : 'ควรทบทวนคำศัพท์เฉพาะทางด้าน Table Setting เพิ่มเติม'
    const sComment = s >= 80 ? 'ทักษะการสร้างและจัดวางองค์ประกอบ 3D มีความประณีตถูกต้องตามมาตรฐาน' : 'สามารถปรับปรุงสัดส่วนและการจัดวางโมเดล 3D ให้สมดุลยิ่งขึ้น'
    const cComment = c >= 80 ? 'แสดงสมรรถนะการสื่อสารและการประยุกต์ใช้ได้ในเกณฑ์ยอดเยี่ยม' : 'ควรฝึกฝนการใช้ประโยคในการนำเสนอและการบริการเพิ่มเติม'

    return `ผลการประเมินกิจกรรม ${activityType} (${assignmentTitle}):
1. ด้านความรู้ (K): ${kComment} (ระดับ ${rubricLevels.knowledge ?? (k >= 80 ? 4 : 2)})
2. ด้านทักษะ (S): ${sComment} (ระดับ ${rubricLevels.skills ?? (s >= 80 ? 4 : 2)})
3. ด้านเจตคติและสมรรถนะ (A & C): มีความตั้งใจและส่งงานได้ตรงเวลา ${cComment}
ข้อเสนอแนะเชิงวิชาการ: แนะนำให้นำผลงาน ${attachNote}ไปต่อยอดในกิจกรรมขั้นถัดไปของ FINE Model`
  }

  // Default: Encouraging (ส่งเสริมกำลังใจ)
  const intro = avg >= 85
    ? `ยอดเยี่ยมมากครับ ${studentName}! 🌟 ครูชื่นชมในความตั้งใจสร้างสรรค์ผลงาน ${assignmentTitle}`
    : avg >= 70
    ? `ทำได้ดีมากครับ ${studentName}! ชิ้นงาน ${assignmentTitle} มีความคืบหน้าที่น่าประทับใจ`
    : `เป็นจุดเริ่มต้นที่ดีมากครับ ${studentName}! ครูเห็นถึงความพยายามในชิ้นงานนี้`

  const details = []
  if (s >= 80) details.push('ทักษะการสร้างโมเดล 3D มีความประณีตและสวยงาม สัดส่วนสมจริง')
  else if (s < 70) details.push('หากปรับแต่งมุมมองและรายละเอียดโมเดล 3D เพิ่มเติม ชิ้นงานจะสมบูรณ์แบบยิ่งขึ้น')

  if (k >= 80) details.push('การจำแนกคำศัพท์และหน้าที่ของอุปกรณ์บนโต๊ะอาหารมีความถูกต้องแม่นยำ')
  else details.push('ลองทบทวนคำศัพท์ภาษาอังกฤษของอุปกรณ์บนโต๊ะอาหารในระบบเพิ่มเติมเพื่อเพิ่มความมั่นใจ')

  if (a >= 85) details.push('มีความรับผิดชอบ ส่งงานตรงเวลาและมีความใส่ใจในงาน')

  const conclusion = avg >= 80
    ? 'รักษามาตรฐานการเรียนรู้นี้ไว้นะครับ ครูเชื่อว่าจะต่อยอดไปสู่อาชีพการบริการระดับสากลได้อย่างแน่นอน! 🚀'
    : 'ครูเป็นกำลังใจให้นะครับ พัฒนาต่อไปเรื่อยๆ ชิ้นงานถัดไปจะดียิ่งขึ้นแน่นอนครับ ✨'

  return `${intro}\n• ${details.join('\n• ')}\n\n${conclusion}`
}

// Template fallback generator for class insights
function generateFallbackInsights({
  assignmentTitle,
  className,
  activityType,
  maxScore,
  submissionsCount,
  gradedCount,
  averageScore,
  avgKsa,
  returnedCount,
}: {
  assignmentTitle: string
  className: string
  activityType: string
  maxScore: number
  submissionsCount: number
  gradedCount: number
  averageScore: number
  avgKsa: { knowledge: number; skills: number; attitude: number; competency: number }
  returnedCount?: number
}): string {
  const avgPct = maxScore > 0 ? Math.round((averageScore / maxScore) * 100) : 0
  const highestKsa = Object.entries(avgKsa).reduce((prev, curr) => curr[1] > prev[1] ? curr : prev, ['knowledge', 0])
  const lowestKsa = Object.entries(avgKsa).reduce((prev, curr) => curr[1] < prev[1] ? curr : prev, ['knowledge', 100])

  const ksaLabels: Record<string, string> = {
    knowledge: 'ความรู้ความเข้าใจคำศัพท์ (K)',
    skills: 'ทักษะการปฏิบัติการสร้าง 3D (S)',
    attitude: 'เจตคติและความรับผิดชอบ (A)',
    competency: 'สมรรถนะการสื่อสารและการบริการ (C)',
  }

  return `📊 รายงานสรุปผลการประเมินภาพรวมชั้นเรียน (AI Class Insights)
งาน: ${assignmentTitle} | ห้องเรียน: ${className} | กิจกรรม: ${activityType}
จำนวนผู้ส่งงาน: ${submissionsCount} คน | ตรวจแล้ว: ${gradedCount} คน | ส่งกลับแก้ไข: ${returnedCount ?? 0} คน
คะแนนเฉลี่ยรวม: ${averageScore}/${maxScore} (${avgPct}%)

1. จุดเด่นของชั้นเรียน (Class Strengths):
• ผู้เรียนส่วนใหญ่มีผลการประเมินโดดเด่นในด้าน "${ksaLabels[highestKsa[0]]}" (คะแนนเฉลี่ย ${highestKsa[1]}%)
• มีความกระตือรือร้นในการใช้เครื่องมือ 3D และ AR ช่วยให้เห็นภาพจริงของอุปกรณ์ในห้องอาหาร

2. ประเด็นที่ควรส่งเสริมเพิ่มเติม (Areas for Growth):
• ด้านที่ควรเสริมสร้างเพิ่มเติมคือ "${ksaLabels[lowestKsa[0]]}" (คะแนนเฉลี่ย ${lowestKsa[1]}%)
• ผู้เรียนบางส่วนยังต้องการคำแนะนำเพิ่มเติมเกี่ยวกับการจัดระเบียบสัดส่วนและตำแหน่งการวางอุปกรณ์มาตรฐาน

3. แนวทางการจัดการเรียนรู้ครั้งถัดไป (Next Pedagogical Steps for R&D):
• จัดกิจกรรมฝึกสนทนาบทบาทสมมติ (Role-play) เพื่อเสริมสร้างสมรรถนะด้านการสื่อสารและการบริการ
• ใช้โมเดล 3D แบบ AR Interactive ในขั้นตอนถัดไปของ FINE Model เพื่อทบทวนคำศัพท์ที่นักเรียนยังสับสน
• บันทึกข้อค้นพบนี้ลงในแบบบันทึกผลหลังการจัดการเรียนรู้ของแผนการสอนสัปดาห์นี้`
}

export async function POST(request: NextRequest) {
  try {
    await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 30 })
    const body = (await request.json()) as {
      action?: string
      assignmentTitle?: string
      activityType?: string
      studentName?: string
      ksaScores?: { knowledge: number; skills: number; attitude: number; competency: number }
      rubricLevels?: { knowledge: number | null; skills: number | null; attitude: number | null; competency: number | null }
      overallScore?: number
      maxScore?: number
      tone?: 'encouraging' | 'academic' | 'concise'
      attachmentName?: string | null
      className?: string
      submissionsCount?: number
      gradedCount?: number
      averageScore?: number
      avgKsa?: { knowledge: number; skills: number; attitude: number; competency: number }
      returnedCount?: number
      checkText?: string
    }

    const action = body.action || 'generate_feedback'

    // ───────────────────────────────────────────────
    // ACTION 1: Generate Feedback
    // ───────────────────────────────────────────────
    if (action === 'generate_feedback') {
      const assignmentTitle = body.assignmentTitle || 'งานมอบหมาย'
      const activityType = body.activityType || 'Familiarize'
      const studentName = body.studentName || 'นักเรียน'
      const ksaScores = body.ksaScores || { knowledge: 80, skills: 75, attitude: 85, competency: 70 }
      const rubricLevels = body.rubricLevels || { knowledge: null, skills: null, attitude: null, competency: null }
      const tone = body.tone || 'encouraging'
      const attachmentName = body.attachmentName || null

      const provider = await getActiveProvider(request)
      const hasKey = await hasConfiguredKey(provider)

      if (!hasKey) {
        const fallback = generateFallbackFeedback({
          assignmentTitle,
          activityType,
          studentName,
          ksaScores,
          rubricLevels,
          tone,
          attachmentName,
        })
        return NextResponse.json({ feedback: fallback, provider: 'template-engine' })
      }

      try {
        const configuredModel = await getConfiguredModel(provider)
        const systemPrompt = `คุณคือผู้เชี่ยวชาญการศึกษาอาชีวศึกษาและอาจารย์สอนวิชาภาษาอังกฤษเพื่องานบริการและศิลปะบนโต๊ะอาหาร (Table Setting & Food/Beverage Service)
สร้างข้อเสนอแนะและคำติชมแก่นักเรียนตามกระบวนการจัดการเรียนรู้ FINE Model (Familiarize, Interact, Navigate, Exhibit)
ใช้ภาษาไทยที่สุภาพ เป็นมืออาชีพ ถูกต้องตามหลักครุศาสตร์ และสอดคล้องกับโทนที่ระบุ (${tone})
ห้ามใช้คำหยาบหรือคำบั่นทอนกำลังใจ เน้นการเสริมสร้างสมรรถนะ KSA-C`

        const userPrompt = `กรุณาเขียนข้อเสนอแนะสำหรับนักเรียน:
ชื่อนักเรียน: ${studentName}
ชื่องาน: ${assignmentTitle} (ขั้นตอน FINE: ${activityType})
ผลงานที่แนบ: ${attachmentName || 'ไม่มีไฟล์แนบ'}
คะแนนสมรรถนะ:
- Knowledge (ความรู้คำศัพท์/หน้าที่ 20%): ${ksaScores.knowledge}/100 (ระดับ Rubric: ${rubricLevels.knowledge ?? '-'})
- Skills (ทักษะปฏิบัติ 3D 30%): ${ksaScores.skills}/100 (ระดับ Rubric: ${rubricLevels.skills ?? '-'})
- Attitude (เจตคติ ความรับผิดชอบ 10%): ${ksaScores.attitude}/100 (ระดับ Rubric: ${rubricLevels.attitude ?? '-'})
- Competency (สมรรถนะการสื่อสารและการบริการ 40%): ${ksaScores.competency}/100 (ระดับ Rubric: ${rubricLevels.competency ?? '-'})
โทนที่ต้องการ: ${tone === 'encouraging' ? 'เสริมกำลังใจ อบอุ่น มีพลังบวก' : tone === 'academic' ? 'เชิงวิชาการ ชี้เกณฑ์ Rubric ละเอียด' : 'กระชับ 2-3 ประโยคตรงประเด็น'}
ความยาว: 2-4 ย่อหน้า ไม่ยาวเกินไปและเหมาะกับส่งให้นักเรียนอ่านโดยตรง`

        let aiText = ''
        if (provider === 'gemini') {
          const genAI = await getGemini(request)
          const model = genAI.getGenerativeModel({ model: configuredModel, systemInstruction: systemPrompt })
          const result = await model.generateContent(userPrompt)
          aiText = result.response.text()
        } else if (provider === 'openai') {
          const client = await getOpenAI(request)
          const completion = await client.chat.completions.create({
            model: configuredModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
          })
          aiText = completion.choices[0]?.message.content || ''
        } else if (provider === 'claude') {
          const client = await getAnthropic(request)
          const message = await client.messages.create({
            model: configuredModel,
            max_tokens: 800,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
          })
          aiText = message.content[0]?.type === 'text' ? message.content[0].text : ''
        }

        if (aiText.trim()) {
          return NextResponse.json({ feedback: aiText.trim(), provider })
        }
      } catch (aiError) {
        console.warn('AI feedback generation failed, falling back to template engine:', aiError)
      }

      const fallback = generateFallbackFeedback({
        assignmentTitle,
        activityType,
        studentName,
        ksaScores,
        rubricLevels,
        tone,
        attachmentName,
      })
      return NextResponse.json({ feedback: fallback, provider: 'template-engine' })
    }

    // ───────────────────────────────────────────────
    // ACTION 2: Class Insights & Reflection
    // ───────────────────────────────────────────────
    if (action === 'class_insights') {
      const assignmentTitle = body.assignmentTitle || 'งานมอบหมาย'
      const className = body.className || 'ห้องเรียน'
      const activityType = body.activityType || 'Familiarize'
      const maxScore = body.maxScore || 100
      const submissionsCount = body.submissionsCount || 0
      const gradedCount = body.gradedCount || 0
      const averageScore = body.averageScore || 0
      const avgKsa = body.avgKsa || { knowledge: 75, skills: 75, attitude: 80, competency: 70 }
      const returnedCount = body.returnedCount || 0

      const provider = await getActiveProvider(request)
      const hasKey = await hasConfiguredKey(provider)

      if (!hasKey) {
        const fallback = generateFallbackInsights({
          assignmentTitle,
          className,
          activityType,
          maxScore,
          submissionsCount,
          gradedCount,
          averageScore,
          avgKsa,
          returnedCount,
        })
        return NextResponse.json({ insights: fallback, provider: 'template-engine' })
      }

      try {
        const configuredModel = await getConfiguredModel(provider)
        const prompt = `คุณคือนักวิจัยทางการศึกษาและครูผู้สอนระดับอาชีวศึกษา
กรุณาวิเคราะห์ผลการเรียนรู้ของชั้นเรียนเพื่อนำไปใช้ใน "บันทึกผลหลังการจัดการเรียนรู้" ในเล่มรายงานวิจัย FINE Model:
ชื่องาน: ${assignmentTitle}
ห้องเรียน: ${className}
ขั้นตอน FINE Model: ${activityType}
คะแนนเต็ม: ${maxScore} คะแนน | คะแนนเฉลี่ยชั้นเรียน: ${averageScore} คะแนน (${Math.round((averageScore / maxScore) * 100)}%)
จำนวนนักเรียนที่ส่งงาน: ${submissionsCount} คน | ตรวจแล้ว: ${gradedCount} คน | ส่งกลับแก้ไข: ${returnedCount} คน
คะแนนเฉลี่ยสมรรถนะ KSA-C:
- ความรู้ (Knowledge 20%): ${avgKsa.knowledge}%
- ทักษะ (Skills 30%): ${avgKsa.skills}%
- เจตคติ (Attitude 10%): ${avgKsa.attitude}%
- สมรรถนะ (Competency 40%): ${avgKsa.competency}%

ให้สรุปเนื้อหาเป็น 3 หัวข้ออย่างชัดเจนและเป็นทางการ:
1. จุดเด่นของชั้นเรียน (Class Strengths)
2. ประเด็นที่ควรส่งเสริมเพิ่มเติม (Areas for Growth)
3. แนวทางการจัดการเรียนรู้ครั้งถัดไปสำหรับบันทึกหลังการสอน (Next Pedagogical Steps for R&D)`

        let aiText = ''
        if (provider === 'gemini') {
          const genAI = await getGemini(request)
          const model = genAI.getGenerativeModel({ model: configuredModel })
          const result = await model.generateContent(prompt)
          aiText = result.response.text()
        } else if (provider === 'openai') {
          const client = await getOpenAI(request)
          const completion = await client.chat.completions.create({
            model: configuredModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          })
          aiText = completion.choices[0]?.message.content || ''
        } else if (provider === 'claude') {
          const client = await getAnthropic(request)
          const message = await client.messages.create({
            model: configuredModel,
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
          })
          aiText = message.content[0]?.type === 'text' ? message.content[0].text : ''
        }

        if (aiText.trim()) {
          return NextResponse.json({ insights: aiText.trim(), provider })
        }
      } catch (aiError) {
        console.warn('AI class insights failed, falling back:', aiError)
      }

      const fallback = generateFallbackInsights({
        assignmentTitle,
        className,
        activityType,
        maxScore,
        submissionsCount,
        gradedCount,
        averageScore,
        avgKsa,
        returnedCount,
      })
      return NextResponse.json({ insights: fallback, provider: 'template-engine' })
    }

    // ───────────────────────────────────────────────
    // ACTION 3: Vocab Pre-check
    // ───────────────────────────────────────────────
    if (action === 'vocab_precheck') {
      const checkText = `${body.checkText || ''} ${body.attachmentName || ''}`.toLowerCase()

      const dbVocab = await queryDb<{ name_en: string; name_th: string; category_th: string }>(`
        SELECT name_en, name_th, category_th
        FROM vocabulary_items
        LIMIT 60
      `)

      const matched: Array<{ en: string; th: string; category: string }> = []
      for (const item of dbVocab.rows) {
        const enLower = item.name_en.toLowerCase()
        if (checkText.includes(enLower)) {
          matched.push({ en: item.name_en, th: item.name_th, category: item.category_th })
        }
      }

      // If text doesn't contain exact DB item name, check token overlap
      if (matched.length === 0) {
        for (const item of dbVocab.rows) {
          const tokens = item.name_en.toLowerCase().split(/\s+/)
          if (tokens.some(t => t.length > 3 && checkText.includes(t))) {
            matched.push({ en: item.name_en, th: item.name_th, category: item.category_th })
          }
        }
      }

      return NextResponse.json({
        matched: matched.slice(0, 6),
        totalChecked: dbVocab.rows.length,
      })
    }

    throw new ApiError('การกระทำไม่ถูกต้อง', 400, 'INVALID_ACTION')
  } catch (error) {
    return apiErrorResponse(error)
  }
}
