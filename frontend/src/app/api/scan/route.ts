import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageBase64, mimeType } = body

    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://krupim-model-production.up.railway.app'
    
    // Forward headers (Authorization, x-ai-provider, x-gemini-key, etc.)
    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    const passThroughKeys = ['authorization', 'x-ai-provider', 'x-gemini-key', 'x-openai-key', 'x-claude-key']
    passThroughKeys.forEach(key => {
      const val = req.headers.get(key)
      if (val) forwardHeaders[key] = val
    })

    // 1. Try Express Backend /api/scan (Unified Multi-LLM & DB Save)
    try {
      const backendResp = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: forwardHeaders,
        body: JSON.stringify({ imageBase64, mimeType })
      })

      if (backendResp.ok) {
        const data = await backendResp.json()
        return NextResponse.json(data)
      }
      console.warn(`Backend /api/scan returned status ${backendResp.status}, checking Groq fallback...`)
    } catch (backendErr: any) {
      console.warn('Backend /api/scan fetch failed, checking Groq fallback:', backendErr.message)
    }

    // 2. Fallback: Groq API (if GROQ_API_KEY is configured)
    const groqKey = process.env.GROQ_API_KEY || ''
    if (groqKey) {
      const SYSTEM_PROMPT = `คุณเป็น AI ผู้เชี่ยวชาญการวิเคราะห์และระบุวัตถุจากภาพถ่ายตามความเป็นจริง (Object Identification AI)
วิเคราะห์ภาพวัตถุที่เห็นในภาพนี้ตามจริงที่ปรากฏ 100%
ส่งค่ากลับมาเป็นรูปแบบ JSON เท่านั้น:
{
  "name_th": "ชื่อวัตถุภาษาไทยตามความจริง",
  "name_en": "ชื่อวัตถุภาษาอังกฤษตามความจริง",
  "category": "food หรือ beverage หรือ equipment หรือ tableware หรือ general",
  "subcategory": "หมวดย่อยเชิงลึก",
  "description": "คำอธิบายลักษณะ หน้าที่ และประโยชน์การใช้งาน",
  "location": "ตำแหน่งหรือจุดที่เรามักจะพบเจอวัตถุชนิดนี้ในชีวิตจริง",
  "service_tips": "เคล็ดลับการจัดเตรียม สุขอนามัย หรือทักษะการหยิบจับดูแลรักษา 1-2 ข้อ",
  "english_phrases": ["ประโยคภาษาอังกฤษที่เกี่ยวข้อง 1", "ประโยคแนะนำ/สื่อสารที่ 2"],
  "pronounce": "คำอ่านสัทอักษร (Phonetic Transcription) ภาษาอังกฤษ",
  "confidence": 95,
  "fine_analysis": {
    "familiarize": { "desc": "คำอธิบายรูปร่างลักษณะ", "location": "ตำแหน่งการวางจัดเตรียม" },
    "interact": { "pronunciation": "คำอ่านออกเสียงภาษาอังกฤษ", "english_phrases": ["ประโยคแนะนำ 1", "ประโยคแนะนำ 2"], "roleplay_prompt": "โจทย์สั้นๆ สำหรับฝึกพูด" },
    "navigate": { "service_steps": ["ขั้นตอนจัดเตรียม", "ขั้นตอนเสิร์ฟ", "ขั้นตอนเก็บถอน"], "safety_rules": "ข้อควรระวังสำคัญ" },
    "exhibit": { "quiz_question": "คำถามปรนัย 1 ข้อ", "quiz_options": ["ตัวเลือกผิด 1", "ตัวเลือกถูก", "ตัวเลือกผิด 2"], "correct_answer": "ตัวเลือกถูก" }
  }
}`

      const imageUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: [{ type: 'text', text: SYSTEM_PROMPT }, { type: 'image_url', image_url: { url: imageUrl } }] }],
          temperature: 0.3,
          max_tokens: 2048,
          response_format: { type: 'json_object' }
        })
      })

      if (response.ok) {
        const resData = await response.json()
        const rawText = resData.choices?.[0]?.message?.content || ''
        const jsonMatch = rawText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return NextResponse.json(JSON.parse(jsonMatch[0]))
        }
      }
    }

    return NextResponse.json({ error: 'Backend scan service currently unavailable.' }, { status: 503 })

  } catch (err: any) {
    console.error('API /api/scan error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

