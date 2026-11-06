import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, getErrorMessage, guardApi, getDatabase } from '../_lib/auth'
import { getActiveProvider, getConfiguredModel, getGemini, getOpenAI, getAnthropic } from '../_lib/ai'
import { generateChatFallback } from './fallback-chat'

const SYSTEM_PROMPT = 'คุณคือผู้ช่วยสอนอัจฉริยะในแพลตฟอร์ม FINE MODEL ที่เชี่ยวชาญด้านศิลปะการบริการอาหารและเครื่องดื่ม การจัดโต๊ะอาหาร (Table Setting) และคำศัพท์ภาษาอังกฤษที่ใช้ในวิชาชีพนี้ ตอบผู้เรียนด้วยความสุภาพ กระชับ สนับสนุนการเรียนรู้ และมีตัวอย่างสถานการณ์จริงเสมอ'

type ChatMessage = { role: 'user' | 'model'; text: string }

export async function POST(req: NextRequest) {
  let authUser
  try {
    authUser = await guardApi(req, { maxRequests: 10 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  let userMessage = ''
  let validHistory: ChatMessage[] = []
  let session_type: string | undefined
  let topic: string | undefined
  let session_id: string | undefined

  try {
    const body = await req.json()
    userMessage = body.message || ''
    const { history = [], session_type: sType, topic: sTopic, session_id: sId } = body
    session_type = sType
    topic = sTopic
    session_id = sId

    if (typeof userMessage !== 'string' || !userMessage.trim() || userMessage.length > 4000) {
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
    validHistory = history as ChatMessage[]

    let text = ''
    let isFallback = false

    try {
      const provider = await getActiveProvider(req)
      const configuredModel = await getConfiguredModel(provider)

      if (provider === 'openai') {
        const client = await getOpenAI(req)
        const messages = [
          { role: 'system' as const, content: SYSTEM_PROMPT },
          ...validHistory.map(h => ({
            role: h.role === 'user' ? 'user' as const : 'assistant' as const,
            content: h.text
          })),
          { role: 'user' as const, content: userMessage }
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
          { role: 'user' as const, content: userMessage }
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
        const result = await chat.sendMessage(userMessage)
        text = result.response.text()
      }
    } catch (aiErr: unknown) {
      console.warn('AI Provider failed in /api/chat, falling back to intelligent dialogue:', getErrorMessage(aiErr))
      text = generateChatFallback(userMessage)
      isFallback = true
    }

    if (!text) {
      text = generateChatFallback(userMessage)
      isFallback = true
    }

    // Save to PostgreSQL
    let savedSessionId = session_id
    if (authUser.role === 'student') {
      try {
        const localData = getDatabase()
        const fullMessages = [...validHistory, { role: 'user', text: userMessage }, { role: 'model', text }]
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

    return NextResponse.json({ response: text, session_id: savedSessionId, is_fallback: isFallback })
  } catch (err: unknown) {
    console.error('Chat API Fatal Error:', getErrorMessage(err))
    // Even on fatal error, return educational fallback response
    const fallbackText = generateChatFallback(userMessage || '')
    return NextResponse.json({ response: fallbackText, is_fallback: true }, { status: 200 })
  }
}
