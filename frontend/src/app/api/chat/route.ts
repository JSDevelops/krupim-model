import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, getErrorMessage, guardApi, getDatabase } from '../_lib/auth'
import { getActiveProvider, getConfiguredModel, getGemini, getOpenAI, getAnthropic } from '../_lib/ai'

const SYSTEM_PROMPT = 'คุณคือผู้ช่วยสอนอัจฉริยะในแพลตฟอร์ม FINE MODEL ที่เชี่ยวชาญด้านศิลปะการบริการอาหารและเครื่องดื่ม การจัดโต๊ะอาหาร (Table Setting) และคำศัพท์ภาษาอังกฤษที่ใช้ในวิชาชีพนี้ ตอบผู้เรียนด้วยความสุภาพ กระชับ สนับสนุนการเรียนรู้ และมีตัวอย่างสถานการณ์จริงเสมอ'

type ChatMessage = { role: 'user' | 'model'; text: string }

export async function POST(req: NextRequest) {
  let authUser
  try {
    authUser = await guardApi(req, { maxRequests: 10 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  try {
    const body = await req.json()
    const { message, history = [], session_type, topic, session_id } = body

    if (typeof message !== 'string' || !message.trim() || message.length > 4000) {
      return NextResponse.json({ error: 'message must be between 1 and 4000 characters' }, { status: 400 })
    }
    if (!Array.isArray(history) || history.length > 50) {
      return NextResponse.json({ error: 'history must contain no more than 50 messages' }, { status: 400 })
    }
    if (history.some(item => !item || typeof item !== 'object'
      || !['user', 'model'].includes(item.role)
      || typeof item.text !== 'string'
      || item.text.length > 4000)) {
      return NextResponse.json({ error: 'history contains invalid messages' }, { status: 400 })
    }
    const validHistory = history as ChatMessage[]

    const provider = await getActiveProvider(req)
    const configuredModel = await getConfiguredModel(provider)
    let text = ''

    if (provider === 'openai') {
      const client = await getOpenAI(req)
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...validHistory.map(h => ({
          role: h.role === 'user' ? 'user' as const : 'assistant' as const,
          content: h.text
        })),
        { role: 'user' as const, content: message }
      ]
      const completion = await client.chat.completions.create({ model: configuredModel, messages, temperature: 0.7 })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = await getAnthropic(req)
      const messages = [
        ...validHistory.map(h => ({
          role: h.role === 'user' ? 'user' as const : 'assistant' as const,
          content: h.text
        })),
        { role: 'user' as const, content: message }
      ]
      const completion = await client.messages.create({
        model: configuredModel,
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      const genAI = await getGemini(req)
      const model = genAI.getGenerativeModel({ model: configuredModel, systemInstruction: SYSTEM_PROMPT })
      
      // Google Gemini requires history to start with 'user' and alternate strictly between user and model
      const formattedHistory: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = []
      let expectedRole: 'user' | 'model' = 'user'
      const firstUserIndex = validHistory.findIndex(h => h.role === 'user' && h.text?.trim())
      if (firstUserIndex !== -1) {
        for (let i = firstUserIndex; i < validHistory.length; i++) {
          const h = validHistory[i]
          if (h.role === expectedRole && h.text?.trim()) {
            formattedHistory.push({
              role: h.role,
              parts: [{ text: h.text }]
            })
            expectedRole = expectedRole === 'user' ? 'model' : 'user'
          }
        }
      }
      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
        formattedHistory.pop()
      }

      const chat = model.startChat({ history: formattedHistory })
      const result = await chat.sendMessage(message)
      text = result.response.text()
    }

    // Save to PostgreSQL
    let savedSessionId = session_id
    if (authUser.role === 'student') {
      try {
        const localData = getDatabase()
        const fullMessages = [...validHistory, { role: 'user', text: message }, { role: 'model', text }]
        if (savedSessionId) {
          await localData.from('chat_sessions').update({
            messages_json: fullMessages,
            ended_at: new Date().toISOString()
          }).eq('id', savedSessionId).eq('student_id', authUser.id)
        } else {
          const { data } = await localData.from('chat_sessions').insert({
            student_id: authUser.id,
            session_type: session_type || 'gemini_chat',
            topic: topic || 'General Conversation',
            messages_json: fullMessages
          }).select('id').single()
          if (data) savedSessionId = data.id
        }
      } catch (dbErr: unknown) {
        console.error('Failed to save chat session:', getErrorMessage(dbErr))
      }
    }

    return NextResponse.json({ response: text, session_id: savedSessionId })
  } catch (err: unknown) {
    console.error('Chat API Error:', getErrorMessage(err))
    return NextResponse.json({ error: 'Failed to process chat request. Please try again.' }, { status: 500 })
  }
}
