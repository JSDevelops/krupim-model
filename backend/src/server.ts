import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { OpenAI } from 'openai'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Initialize Supabase Client (Service Role for backend to bypass RLS)
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize Default OpenAI Client
const defaultOpenAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// Helper function to extract user's API Key from request headers dynamically (fallback to default)
function getOpenAI(req: express.Request): OpenAI {
  const customKey = req.headers['x-gemini-key'] as string || req.headers['x-openai-key'] as string
  if (customKey && customKey.trim().startsWith('sk-')) {
    return new OpenAI({ apiKey: customKey.trim() })
  }
  return defaultOpenAI
}

// System status endpoint
app.get('/api/status', (req, res) => {
  const customKey = req.headers['x-gemini-key'] as string || req.headers['x-openai-key'] as string
  const hasKey = (customKey && customKey.trim().startsWith('sk-')) || !!process.env.OPENAI_API_KEY
  
  res.json({
    status: 'online',
    supabaseConnected: !!supabaseUrl,
    openaiInitialized: hasKey,
    usingCustomKey: !!(customKey && customKey.trim().startsWith('sk-')),
    timestamp: new Date().toISOString()
  })
})

// OpenAI Chat API (Replaces Gemini Chat)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, student_id, session_type, topic, session_id } = req.body
    const client = getOpenAI(req)

    const systemPrompt = 'คุณคือผู้ช่วยสอนอัจฉริยะในแพลตฟอร์ม FINE MODE ที่เชี่ยวชาญด้านศิลปะการบริการอาหารและเครื่องดื่ม การจัดโต๊ะอาหาร (Table Setting) และคำศัพท์ภาษาอังกฤษที่ใช้ในวิชาชีพนี้ ตอบผู้เรียนด้วยความสุภาพ กระชับ สนับสนุนการเรียนรู้ และมีตัวอย่างสถานการณ์จริงเสมอ'
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(history || []).map((h: any) => ({
        role: h.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: h.text
      })),
      { role: 'user' as const, content: message }
    ]

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7
    })
    
    const text = completion.choices[0].message.content || ''

    // Save to Supabase if student_id is provided
    let savedSessionId = session_id
    if (supabase && student_id) {
      try {
        const fullMessages = [...(history || []), { role: 'user', text: message }, { role: 'model', text }]
        if (savedSessionId) {
          await supabase.from('chat_sessions').update({
            messages_json: fullMessages,
            ended_at: new Date().toISOString()
          }).eq('id', savedSessionId)
        } else {
          const { data, error } = await supabase.from('chat_sessions').insert({
            student_id,
            session_type: session_type || 'gemini_chat', // Keep enum type compatibility
            topic: topic || 'General Conversation',
            messages_json: fullMessages
          }).select('id').single()
          
          if (data) {
            savedSessionId = data.id
          }
        }
      } catch (dbErr) {
        console.error('Failed to save chat session:', dbErr)
      }
    }

    res.json({ response: text, session_id: savedSessionId })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    res.status(500).json({ error: error.message || 'Failed to process chat' })
  }
})

// OpenAI Vision Scan API (Replaces Gemini Vision Scan)
app.post('/api/scan', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body
    const client = getOpenAI(req)

    const systemPrompt = `คุณเป็นผู้เชี่ยวชาญด้านอาหาร เครื่องดื่ม และอุปกรณ์ในห้องอาหารระดับโรงแรมห้าดาว
วิเคราะห์ภาพชิ้นวัตถุหรืออุปกรณ์จัดโต๊ะนี้ และส่งค่ากลับมาเป็นรูปแบบ JSON เท่านั้น:
{
  "name_th": "ชื่อภาษาไทยอย่างเป็นทางการของอุปกรณ์ เช่น แก้วไวน์แดง, มีดตัดเนื้อหลัก",
  "name_en": "ชื่อภาษาอังกฤษอย่างเป็นทางการ เช่น Red Wine Glass, Dinner Knife",
  "category": "food หรือ beverage หรือ equipment หรือ tableware",
  "subcategory": "หมวดย่อยเชิงลึก เช่น Stemware, Flatware, Dinnerware",
  "description": "คำอธิบายวิธีการใช้ชิ้นอุปกรณ์นี้อย่างละเอียดสั้นๆ กระชับ (ใช้ทำอะไร)",
  "location": "ตำแหน่งการจัดวางมาตรฐานบนโต๊ะอาหาร (หาได้ที่ไหน/วางไว้จุดไหน เช่น วางเยื้องไปทางขวาบน เหนือปลายใบมีดห่างประมาณ 1 นิ้ว)",
  "service_tips": "เคล็ดลับการบริการหรือทักษะมาตรฐานสำหรับบริกร 1-2 ข้อ",
  "english_phrases": ["ประโยคภาษาอังกฤษที่ใช้พูดแนะนำการใช้อุปกรณ์หรือทักทายเกี่ยวกับอุปกรณ์ชิ้นนี้กับลูกค้า 1", "ประโยคแนะนำลูกค้าที่ 2"],
  "confidence": ตัวเลขระดับความมั่นใจ 0-100
}`

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`
              }
            }
          ]
        }
      ]
    })

    const text = completion.choices[0].message.content || ''
    const parsedData = JSON.parse(text)

    // Save to Supabase DB (Upsert on name_en to keep it updated)
    if (supabase) {
      try {
        await supabase.from('ai_scan_items').upsert({
          name_th: parsedData.name_th,
          name_en: parsedData.name_en,
          category: parsedData.category || 'tableware',
          subcategory: parsedData.subcategory || '',
          description: parsedData.description || '',
          location: parsedData.location || '',
          service_tips: parsedData.service_tips || '',
          english_phrases: parsedData.english_phrases || []
        }, { onConflict: 'name_en' })
      } catch (dbErr) {
        console.error('Failed to save scanned item to DB:', dbErr)
      }
    }

    res.json(parsedData)
  } catch (error: any) {
    console.error('Scan API Error:', error)
    res.status(500).json({ error: error.message || 'Failed to analyze image' })
  }
})

// OpenAI Simulation Evaluation API
app.post('/api/simulation/evaluate', async (req, res) => {
  try {
    const { messages, score, student_id, scenario_id } = req.body
    const client = getOpenAI(req)

    const chatContent = messages.map((m: any) => `${m.role === 'user' ? 'บริกร' : 'ลูกค้า'}: ${m.text}`).join('\n')

    const prompt = `คุณเป็นผู้เชี่ยวชาญประเมินการบริการในร้านอาหาร
วิเคราะห์บทสนทนาระหว่างบริกรและลูกค้าต่อไปนี้:
${chatContent}

ให้ฟีดแบ็คสั้นๆ (ภาษาไทย) 2-3 ประโยค สรุปจุดเด่นและคำแนะนำเพื่อนำไปปรับปรุง พร้อมคืนค่าในรูปแบบ JSON:
{
  "feedback": "ฟีดแบ็คสรุปภาษาไทย 2-3 ประโยค",
  "suggestions": ["คำแนะนำข้อที่ 1", "คำแนะนำข้อที่ 2"]
}`

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'user', content: prompt }
      ]
    })
    
    const text = completion.choices[0].message.content || ''
    const parsed = JSON.parse(text)

    // Save to Supabase simulation_sessions if student_id and scenario_id are provided
    if (supabase && student_id && scenario_id) {
      try {
        await supabase.from('simulation_sessions').insert({
          student_id,
          scenario_id,
          score: score || 0,
          max_score: 100,
          feedback_json: parsed,
          conversation_json: messages
        })
      } catch (dbErr) {
        console.error('Failed to save simulation session:', dbErr)
      }
    }

    res.json({ ...parsed, score })
  } catch (error: any) {
    console.error('Simulation Evaluation Error:', error)
    res.status(500).json({ error: error.message || 'Failed to evaluate simulation' })
  }
})

// OpenAI AI Blog Generation API
app.post('/api/blog/generate', async (req, res) => {
  try {
    const { topic, category, tone, keywords } = req.body
    const client = getOpenAI(req)

    const prompt = `คุณเป็นบล็อกเกอร์ผู้เชี่ยวชาญด้านอาหาร เครื่องดื่ม และการโรงแรม
เขียนบทความการศึกษาภาษาไทยหัวข้อ: "${topic}"
- หมวดหมู่บทความ: ${category || 'การบริการอาหารและเครื่องดื่ม'}
- โทนในการเขียน: ${tone || 'เป็นทางการและน่าดึงดูด'}
- คำค้นหา (Keywords) ที่ควรครอบคลุม: ${keywords || 'การบริการ, ร้านอาหาร'}

ช่วยวิเคราะห์และเรียบเรียงบทความเต็มรูปแบบเป็นภาษาไทยอย่างสละสลวย จัดแต่งในรูปแบบ Markdown ที่สวยงาม (มีหัวข้อหลัก หัวข้อย่อย รายการหัวข้อ และคำแนะนำเด่น)
ส่งค่ากลับมาเป็นรูปแบบ JSON เท่านั้น:
{
  "title": "หัวข้อบทความที่น่าสนใจดึงดูดใจสะกดอารมณ์ผู้รับบริการ",
  "content": "เนื้อหาบทความแบบ Markdown ยาว 3-4 ย่อหน้าที่มีเนื้อหาลึกซึ้งและอิงหลักวิชาการ",
  "excerpt": "สรุปสั้นๆ 1-2 ประโยคสำหรับแสดงการ์ดแสดงรายการบทความ",
  "readTime": "ประมาณเวลาอ่าน เช่น 5 นาที",
  "tags": ["tag1", "tag2", "tag3"]
}`

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'user', content: prompt }
      ]
    })
    
    const text = completion.choices[0].message.content || ''
    const parsed = JSON.parse(text)
    res.json(parsed)
  } catch (error: any) {
    console.error('Blog Generation Error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate blog content' })
  }
})

// Connection Health Ping Monitor API
app.get('/api/ping-all', async (req, res) => {
  try {
    const startDb = Date.now()
    let dbStatus = 'offline'
    let dbLatency = 0
    
    // Check Supabase by selecting from seeded 'schools' table
    if (supabase && supabaseUrl) {
      try {
        const { data, error } = await supabase.from('schools').select('id').limit(1).maybeSingle()
        if (!error) {
          dbStatus = 'online'
        } else {
          console.error('Supabase query error:', error)
        }
      } catch (e) {
        console.error('Supabase connection failed:', e)
      }
      dbLatency = Date.now() - startDb
    }

    // Check OpenAI API
    const startAI = Date.now()
    let aiStatus = 'offline'
    let aiLatency = 0
    try {
      const client = getOpenAI(req)
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      })
      if (completion.choices[0].message.content) {
        aiStatus = 'online'
        aiLatency = Date.now() - startAI
      }
    } catch (e) {
      console.error('OpenAI ping check failed:', e)
    }

    res.json({
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus, latency: `${dbLatency}ms` },
        gemini: { status: aiStatus, latency: `${aiLatency}ms` }, // Keep key name compatible with UI ping dashboard
        backend: { status: 'online', latency: '1ms' }
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Health check failed' })
  }
})

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`)
})
