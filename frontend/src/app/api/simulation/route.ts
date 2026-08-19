import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getSupabase } from '../_lib/auth'
import { getActiveProvider, getGemini, getOpenAI, getAnthropic } from '../_lib/ai'

export async function POST(req: NextRequest) {
  await requireAuth(req, false)

  try {
    const body = await req.json()
    const { messages, score, student_id, scenario_id } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }

    const provider = getActiveProvider(req)
    const chatContent = messages.map((m: any) => `${m.role === 'user' ? 'บริกร' : 'ลูกค้า'}: ${m.text}`).join('\n')

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
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = await getAnthropic(req)
      const completion = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      const genAI = getGemini(req)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await model.generateContent(prompt)
      text = result.response.text()
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON output from AI')
    const parsed = JSON.parse(jsonMatch[0])

    // Save to Supabase
    if (student_id && scenario_id) {
      try {
        const supabase = getSupabase()
        await supabase.from('simulation_sessions').insert({
          student_id,
          scenario_id,
          score: score || 0,
          max_score: 100,
          feedback_json: parsed,
          conversation_json: messages
        })
      } catch (dbErr: any) {
        console.error('Failed to save simulation session:', dbErr.message)
      }
    }

    return NextResponse.json({ ...parsed, score })
  } catch (err: any) {
    console.error('Simulation Evaluation Error:', err.message)
    return NextResponse.json({ error: 'Failed to evaluate simulation. Please try again.' }, { status: 500 })
  }
}
