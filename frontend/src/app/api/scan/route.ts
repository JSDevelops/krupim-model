import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `คุณเป็น AI ผู้เชี่ยวชาญการวิเคราะห์และระบุวัตถุจากภาพถ่ายตามความเป็นจริง (Object Identification AI)
วิเคราะห์ภาพวัตถุที่เห็นในภาพนี้ตามจริงที่ปรากฏ 100% (ตัวอย่างเช่น หากเห็นเป็นขวดน้ำพลาสติก ขวดกาแฟ แก้วพลาสติก ของเล่น โทรศัพท์มือถือ หรือสิ่งของทั่วไป ให้ระบุชื่อที่เป็นสิ่งนั้นจริงๆ โดยตรงตามความจริงที่กล้องจับภาพได้)
และส่งค่ากลับมาเป็นรูปแบบ JSON เท่านั้น (ห้ามเขียนข้อความเกริ่นนำหรือปิดท้ายใดๆ นอกเหนือจาก JSON):
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
    "familiarize": {
      "desc": "คำอธิบายรูปร่างลักษณะ หน้าที่และประโยชน์ใช้สอยโดยละเอียด",
      "location": "ตำแหน่งหรือการวางจัดเตรียมเป็นปกติ"
    },
    "interact": {
      "pronunciation": "คำอ่านออกเสียงภาษาอังกฤษ",
      "english_phrases": ["ประโยคแนะนำ/สื่อสารในงานบริการ 1", "ประโยคแนะนำ/สื่อสารในงานบริการ 2"],
      "roleplay_prompt": "โจทย์สั้นๆ สำหรับฝึกพูดบทบาทสมมติ"
    },
    "navigate": {
      "service_steps": ["ขั้นตอนการจัดเตรียม", "ขั้นตอนการเสิร์ฟ/การวางตำแหน่ง", "ขั้นตอนการเก็บถอน/ทำความสะอาด"],
      "safety_rules": "ข้อควรระวังสำคัญด้านสุขอนามัยหรือความปลอดภัย"
    },
    "exhibit": {
      "quiz_question": "คำถามปรนัยทบทวนความรู้ 1 ข้อ",
      "quiz_options": ["ตัวเลือกผิด 1", "ตัวเลือกถูก", "ตัวเลือกผิด 2"],
      "correct_answer": "ตัวเลือกถูก"
    }
  }
}`

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }

    const geminiKey = process.env.GEMINI_API_KEY || ''

    if (!geminiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured on server' }, { status: 500 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT },
                { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } }
              ]
            }
          ],
          tools: [{ googleSearch: {} }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: 'Gemini API call failed', detail: errText }, { status: response.status })
    }

    const resData = await response.json()
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json({ error: 'No JSON response from Gemini', raw: rawText }, { status: 500 })
    }

    const parsedData = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsedData)

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
