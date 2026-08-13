import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../_lib/auth'
import { getActiveProvider, getGemini, getOpenAI, getAnthropic } from '../../../../_lib/ai'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { topic } = body

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 })
    }

    const provider = getActiveProvider(req)
    const prompt = `You are a Blender Python scripting expert.
Write a clean, functional Python script using Blender's 'bpy' module to programmatically generate a 3D model of a "${topic}" (for F&B/tableware context).
The script must:
1. Clear existing mesh objects.
2. Build the mesh (e.g. using primitives, extrusion, scaling, or subdivision modifier).
3. Assign a basic material (e.g., glass shader, metal shiny shader, or ceramic white).
4. Do not include any explanation. Output ONLY the raw python code inside a markdown code block starting with \`\`\`python and ending with \`\`\`.`

    let text = ''

    if (provider === 'openai') {
      const client = await getOpenAI(req)
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = await getAnthropic(req)
      const completion = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      const genAI = getGemini(req)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await model.generateContent(prompt)
      text = result.response.text()
    }

    const codeMatch = text.match(/```python([\s\S]*?)```/)
    const code = codeMatch ? codeMatch[1].trim() : text.replace(/```/g, '').trim()

    return NextResponse.json({ success: true, topic, code })
  } catch (err: any) {
    console.error('Blender Script Generation Error:', err.message)
    return NextResponse.json({ error: err.message || 'Failed to generate Blender script' }, { status: 500 })
  }
}
