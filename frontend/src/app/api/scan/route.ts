import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, getErrorMessage, guardApi, getDatabase } from '../_lib/auth'
import { getActiveProvider, getConfiguredModel, getGemini, getOpenAI, getAnthropic } from '../_lib/ai'

const SCAN_SYSTEM_PROMPT = `คุณเป็น AI ผู้เชี่ยวชาญการวิเคราะห์และระบุวัตถุจากภาพถ่ายตามความเป็นจริง (Object Identification AI)
วิเคราะห์ภาพวัตถุที่เห็นในภาพนี้ตามจริงที่ปรากฏ 100% (ตัวอย่างเช่น หากเห็นเป็นขวดน้ำพลาสติก ขวดกาแฟ แก้วพลาสติก ของเล่น โทรศัพท์มือถือ หรือสิ่งของทั่วไป ให้ระบุชื่อที่เป็นสิ่งนั้นจริงๆ โดยตรงตามความจริงที่กล้องจับภาพได้)
และส่งค่ากลับมาเป็นรูปแบบ JSON เท่านั้น (ห้ามเขียนข้อความเกริ่นนำหรือปิดท้ายใดๆ นอกเหนือจาก JSON):
{
  "name_th": "ชื่อวัตถุภาษาไทยตามความจริง",
  "name_en": "ชื่อวัตถุภาษาอังกฤษตามความจริง",
  "category": "food หรือ beverage หรือ equipment หรือ tableware หรือ general",
  "subcategory": "หมวดย่อยเชิงลึก",
  "description": "คำอธิบายลักษณะ หน้าที่ และประโยชน์การใช้งานตามจริง",
  "location": "ตำแหน่งหรือจุดที่เรามักจะพบเจอวัตถุชนิดนี้ในชีวิตจริง",
  "service_tips": "เคล็ดลับการจัดเตรียม สุขอนามัย หรือทักษะการหยิบจับดูแลรักษา 1-2 ข้อ",
  "english_phrases": ["ประโยคภาษาอังกฤษที่เกี่ยวข้อง 1", "ประโยคแนะนำ/สื่อสารที่ 2"],
  "pronounce": "คำอ่านสัทอักษร (Phonetic Transcription) ภาษาอังกฤษ",
  "confidence": 95,
  "fine_analysis": {
    "familiarize": { "desc": "คำอธิบายรูปร่างลักษณะ หน้าที่และประโยชน์", "location": "ตำแหน่งการวางจัดเตรียม" },
    "interact": { "pronunciation": "คำอ่านออกเสียงภาษาอังกฤษ", "english_phrases": ["ประโยคแนะนำ 1", "ประโยคแนะนำ 2"], "roleplay_prompt": "โจทย์สั้นๆ สำหรับฝึกพูด" },
    "navigate": { "service_steps": ["ขั้นตอนจัดเตรียม", "ขั้นตอนเสิร์ฟ", "ขั้นตอนเก็บถอน"], "safety_rules": "ข้อควรระวังสำคัญ" },
    "exhibit": { "quiz_question": "คำถามปรนัย 1 ข้อ", "quiz_options": ["ตัวเลือกผิด 1", "ตัวเลือกถูก", "ตัวเลือกผิด 2"], "correct_answer": "ตัวเลือกถูก" }
  }
}`

export async function POST(req: NextRequest) {
  // ── Auth (optional/best-effort for scan learning) ───────────────────────────
  let authUser
  try {
    authUser = await guardApi(req, { maxRequests: 6 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  try {
    const body = await req.json()
    const { imageBase64, mimeType = 'image/jpeg' } = body

    if (typeof imageBase64 !== 'string' || !imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }
    if (imageBase64.length > 10_000_000) {
      return NextResponse.json({ error: 'Image too large. Maximum size is 6MB.' }, { status: 400 })
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 })
    }
    const resolvedMimeType = mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    const provider = await getActiveProvider(req)
    const configuredModel = await getConfiguredModel(provider)
    let text = ''

    if (provider === 'openai') {
      const client = await getOpenAI(req)
      const completion = await client.chat.completions.create({
        model: configuredModel,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: SCAN_SYSTEM_PROMPT },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
          ]
        }]
      })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = await getAnthropic(req)
      const completion = await client.messages.create({
        model: configuredModel,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: resolvedMimeType, data: imageBase64 } },
            { type: 'text', text: SCAN_SYSTEM_PROMPT }
          ]
        }]
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      const genAI = await getGemini(req)
      const model = genAI.getGenerativeModel({
        model: configuredModel,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      })
      const result = await model.generateContent([
        SCAN_SYSTEM_PROMPT,
        { inlineData: { data: imageBase64, mimeType } }
      ])
      text = result.response.text()
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON output from AI')
    const parsedData = JSON.parse(jsonMatch[0])

    // Only trusted content managers may promote scan output into the shared knowledge base.
    if (authUser.role === 'teacher' || authUser.role === 'developer') try {
      const localData = getDatabase()
      await localData.from('ai_scan_items').upsert({
        name_th: parsedData.name_th,
        name_en: parsedData.name_en,
        category: parsedData.category || 'tableware',
        subcategory: parsedData.subcategory || '',
        description: parsedData.description || parsedData.fine_analysis?.familiarize?.desc || '',
        location: parsedData.location || parsedData.fine_analysis?.familiarize?.location || '',
        service_tips: parsedData.service_tips || parsedData.fine_analysis?.navigate?.service_steps?.join('\n') || '',
        english_phrases: parsedData.english_phrases || parsedData.fine_analysis?.interact?.english_phrases || [],
        pronounce: parsedData.pronounce || parsedData.fine_analysis?.interact?.pronunciation || ''
      }, { onConflict: 'name_en' })
    } catch (dbErr: unknown) {
      console.error('Failed to save scanned item to DB:', getErrorMessage(dbErr))
    }

    return NextResponse.json(parsedData)

  } catch (err: unknown) {
    const message = getErrorMessage(err)
    console.error('Scan API Error:', message)
    return NextResponse.json({
      error: message || 'AI scan service temporarily unavailable. Please try again.',
      code: 'SCAN_AI_ERROR'
    }, { status: 500 })
  }
}
