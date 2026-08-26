import { NextRequest, NextResponse } from 'next/server'
import { apiErrorResponse, getErrorMessage, guardApi } from '../../_lib/auth'
import { getActiveProvider, getConfiguredModel, getGemini, getOpenAI, getAnthropic } from '../../_lib/ai'

export async function POST(req: NextRequest) {
  try {
    await guardApi(req, { roles: ['teacher', 'developer'], maxRequests: 6 })
  } catch (error) {
    return apiErrorResponse(error)
  }

  try {
    const body = await req.json()
    const { topic, category, tone, keywords } = body

    if (typeof topic !== 'string' || !topic.trim() || topic.length > 1000) {
      return NextResponse.json({ error: 'topic must be between 1 and 1000 characters' }, { status: 400 })
    }

    const provider = await getActiveProvider(req)
    const configuredModel = await getConfiguredModel(provider)
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
        model: configuredModel,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = await getAnthropic(req)
      const completion = await client.messages.create({
        model: configuredModel,
        max_tokens: 3000,
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
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (err: unknown) {
    console.error('Blog Generation Error:', getErrorMessage(err))
    return NextResponse.json({ error: 'Failed to generate blog content. Please try again.' }, { status: 500 })
  }
}
