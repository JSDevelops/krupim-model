import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, getErrorMessage, guardApi, getDatabase } from '../_lib/auth'
import { getActiveProvider, getConfiguredModel, getGemini, getOpenAI, getAnthropic } from '../_lib/ai'

export async function POST(req: NextRequest) {
  let authUser
  try {
    authUser = await guardApi(req, { maxRequests: 10 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  try {
    const body = await req.json()
    const { messages, score, scenario_id } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }
    if (messages.length > 50 || messages.some((message: unknown) => {
      if (!message || typeof message !== 'object') return true
      const item = message as { text?: unknown }
      return typeof item.text !== 'string' || item.text.length > 4000
    })) {
      return NextResponse.json({ error: 'messages payload is too large' }, { status: 400 })
    }
    const validMessages = messages as Array<{ role?: string; text: string }>

    const provider = await getActiveProvider(req)
    const configuredModel = await getConfiguredModel(provider)
    const chatContent = validMessages.map(m => `${m.role === 'user' ? 'บริกร' : 'ลูกค้า'}: ${m.text}`).join('\n')

    const prompt = `คุณเป็นผู้เชี่ยวชาญประเมินการบริการในร้านอาหาร
วิเคราะห์บทสนทนาระหว่างบริกรและลูกค้าต่อไปนี้:
${chatContent}

ให้ฟีดแบ็คสั้นๆ (ภาษาไทย) 2-3 ประโยค สรุปจุดเด่นและคำแนะนำเพื่อนำไปปรับปรุง พร้อมคืนค่าในรูปแบบ JSON:
{
  "feedback": "ฟีดแบ็คสรุปภาษาไทย 2-3 ประโยค",
  "suggestions": ["คำแนะนำข้อที่ 1", "คำแนะนำข้อที่ 2"]
}`

    let text = ''

    if (provider === 'openai') {
      const client = await getOpenAI(req)
      const completion = await client.chat.completions.create({
        model: configuredModel,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = await getAnthropic(req)
      const completion = await client.messages.create({
        model: configuredModel,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
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
    const parsed = JSON.parse(jsonMatch[0])

    // Save to PostgreSQL
    if (authUser.role === 'student' && typeof scenario_id === 'string') {
      try {
        const localData = getDatabase()
        await localData.from('simulation_sessions').insert({
          student_id: authUser.id,
          scenario_id,
          score: score || 0,
          max_score: 100,
          feedback_json: parsed,
          conversation_json: messages
        })
      } catch (dbErr: unknown) {
        console.error('Failed to save simulation session:', getErrorMessage(dbErr))
      }
    }

    return NextResponse.json({ ...parsed, score })
  } catch (err: unknown) {
    console.error('Simulation Evaluation Error:', getErrorMessage(err))
    return NextResponse.json({ error: 'Failed to evaluate simulation. Please try again.' }, { status: 500 })
  }
}
