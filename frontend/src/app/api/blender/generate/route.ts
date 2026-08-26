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
    const { topic } = body

    if (typeof topic !== 'string' || !topic.trim() || topic.length > 200) {
      return NextResponse.json({ error: 'topic must be between 1 and 200 characters' }, { status: 400 })
    }

    const provider = await getActiveProvider(req)
    const configuredModel = await getConfiguredModel(provider)
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
        model: configuredModel,
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = await getAnthropic(req)
      const completion = await client.messages.create({
        model: configuredModel,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      const genAI = await getGemini(req)
      const model = genAI.getGenerativeModel({ model: configuredModel })
      const result = await model.generateContent(prompt)
      text = result.response.text()
    }

    const codeMatch = text.match(/```python([\s\S]*?)```/)
    const code = codeMatch ? codeMatch[1].trim() : text.replace(/```/g, '').trim()

    return NextResponse.json({ success: true, topic, code })
  } catch (err: unknown) {
    const message = getErrorMessage(err)
    console.error('Blender Script Generation Error:', message)
    return NextResponse.json({ error: message || 'Failed to generate Blender script' }, { status: 500 })
  }
}
