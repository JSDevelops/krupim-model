import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getSupabase } from '../_lib/auth'
import { getActiveProvider, getGemini, getOpenAI, getAnthropic } from '../_lib/ai'

const SYSTEM_PROMPT = 'คุณคือผู้ช่วยสอนอัจฉริยะในแพลตฟอร์ม FINE MODEL ที่เชี่ยวชาญด้านศิลปะการบริการอาหารและเครื่องดื่ม การจัดโต๊ะอาหาร (Table Setting) และคำศัพท์ภาษาอังกฤษที่ใช้ในวิชาชีพนี้ ตอบผู้เรียนด้วยความสุภาพ กระชับ สนับสนุนการเรียนรู้ และมีตัวอย่างสถานการณ์จริงเสมอ'

export async function POST(req: NextRequest) {
  await requireAuth(req, false)

  try {
    const body = await req.json()
    const { message, history = [], student_id, session_type, topic, session_id } = body

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const provider = getActiveProvider(req)
    let text = ''

    if (provider === 'openai') {
      const client = await getOpenAI(req)
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...(history || []).map((h: any) => ({
          role: h.role === 'user' ? 'user' as const : 'assistant' as const,
          content: h.text
        })),
        { role: 'user' as const, content: message }
      ]
      const completion = await client.chat.completions.create({ model: 'gpt-4o-mini', messages, temperature: 0.7 })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = await getAnthropic(req)
      const messages = [
        ...(history || []).map((h: any) => ({
          role: h.role === 'user' ? 'user' as const : 'assistant' as const,
          content: h.text
        })),
        { role: 'user' as const, content: message }
      ]
      const completion = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      const genAI = getGemini(req)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM_PROMPT })
      const formattedHistory = (history || []).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }))
      const chat = model.startChat({ history: formattedHistory })
      const result = await chat.sendMessage(message)
      text = result.response.text()
    }

    // Save to Supabase
    let savedSessionId = session_id
    if (student_id) {
      try {
        const supabase = getSupabase()
        const fullMessages = [...(history || []), { role: 'user', text: message }, { role: 'model', text }]
        if (savedSessionId) {
          await supabase.from('chat_sessions').update({
            messages_json: fullMessages,
            ended_at: new Date().toISOString()
          }).eq('id', savedSessionId)
        } else {
          const { data } = await supabase.from('chat_sessions').insert({
            student_id,
            session_type: session_type || 'gemini_chat',
            topic: topic || 'General Conversation',
            messages_json: fullMessages
          }).select('id').single()
          if (data) savedSessionId = data.id
        }
      } catch (dbErr: any) {
        console.error('Failed to save chat session:', dbErr.message)
      }
    }

    return NextResponse.json({ response: text, session_id: savedSessionId })
  } catch (err: any) {
    console.error('Chat API Error:', err.message)
    return NextResponse.json({ error: 'Failed to process chat request. Please try again.' }, { status: 500 })
  }
}
