import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../_lib/auth'
import { getActiveProvider, getGemini, getOpenAI, getAnthropic } from '../../../_lib/ai'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { topic, category, tone, keywords } = body

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 })
    }

    const provider = getActiveProvider(req)
    const prompt = `คุณเป็นบล็อกเกอร์ผู้เชี่ยวชาญด้านอาหาร เครื่องดื่ม และการโรงแรม
เขียนบทความการศึกษาภาษาไทยหัวข้อ: "${topic}"
- หมวดหมู่บทความ: ${category || 'การบริการอาหารและเครื่องดื่ม'}
- โทนในการเขียน: ${tone || 'เป็นทางการและน่าดึงดูด'}
- คำค้นหา (Keywords) ที่ควรครอบคลุม: ${keywords || 'การบริการ, ร้านอาหาร'}

เขียนบทความเต็มรูปแบบเป็นภาษาไทยในรูปแบบ Markdown ที่สวยงาม
ส่งค่ากลับมาเป็นรูปแบบ JSON เท่านั้น:
{
  "title": "หัวข้อบทความที่น่าสนใจ",
  "content": "เนื้อหาบทความแบบ Markdown ยาว 3-4 ย่อหน้า",
  "excerpt": "สรุปสั้นๆ 1-2 ประโยค",
  "readTime": "ประมาณเวลาอ่าน เช่น 5 นาที",
  "tags": ["tag1", "tag2", "tag3"]
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
        max_tokens: 3000,
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
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (err: any) {
    console.error('Blog Generation Error:', err.message)
    return NextResponse.json({ error: 'Failed to generate blog content. Please try again.' }, { status: 500 })
  }
}
