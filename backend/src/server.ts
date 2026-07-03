import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

// ─── Startup validation (Fail Fast) ─────────────────────────────────────────
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[STARTUP ERROR] Missing required env var: ${key}`)
    process.exit(1)
  }
}

const app = express()
const port = process.env.PORT || 3001

// ─── Security Middleware ─────────────────────────────────────────────────────

// 1. Helmet — sets security-related HTTP headers
app.use(helmet())

// 2. CORS — allow only whitelisted origins
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
).split(',').map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: Origin "${origin}" is not allowed`))
    }
  },
  credentials: true
}))

// 3. Rate Limiting — max 30 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment and try again.' }
})
app.use('/api/', limiter)

// Stricter limit for AI endpoints (10 req/min per IP)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit exceeded. Please wait before sending more messages.' }
})
app.use('/api/chat', aiLimiter)
app.use('/api/scan', aiLimiter)
app.use('/api/simulation', aiLimiter)

app.use(express.json({ limit: '10mb' }))

// ─── Initialize Supabase Client (Service Role — bypasses RLS for backend writes) ─
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize Default AI Clients (using dummy fallbacks to prevent startup crash if keys are empty)
const defaultGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDummyKey')
const defaultOpenAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-DummyOpenAIKeyToPreventCrash' })
const defaultAnthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-DummyAnthropicKeyToPreventCrash' })


// Helper to get dynamic active provider
function getActiveProvider(req: express.Request): 'gemini' | 'openai' | 'claude' {
  const provider = req.headers['x-ai-provider'] as string
  if (provider === 'openai' || provider === 'claude') {
    return provider
  }
  return 'gemini' // default
}

// Helper function to extract user's API Key from request headers dynamically (fallback to default)
function getGemini(req: express.Request): GoogleGenerativeAI {
  const customKey = req.headers['x-gemini-key'] as string
  if (customKey && customKey.trim().startsWith('AIzaSy')) {
    return new GoogleGenerativeAI(customKey.trim())
  }
  return defaultGenAI
}

function getOpenAI(req: express.Request): OpenAI {
  const customKey = req.headers['x-openai-key'] as string
  if (customKey && customKey.trim().startsWith('sk-')) {
    return new OpenAI({ apiKey: customKey.trim() })
  }
  return defaultOpenAI
}

function getAnthropic(req: express.Request): Anthropic {
  const customKey = req.headers['x-claude-key'] as string
  if (customKey && customKey.trim().startsWith('sk-ant-')) {
    return new Anthropic({ apiKey: customKey.trim() })
  }
  return defaultAnthropic
}

// System status endpoint
app.get('/api/status', (req, res) => {
  const provider = getActiveProvider(req)
  let initialized = false
  
  if (provider === 'openai') {
    const customKey = req.headers['x-openai-key'] as string
    initialized = (customKey && customKey.trim().startsWith('sk-')) || !!process.env.OPENAI_API_KEY
  } else if (provider === 'claude') {
    const customKey = req.headers['x-claude-key'] as string
    initialized = (customKey && customKey.trim().startsWith('sk-ant-')) || !!process.env.ANTHROPIC_API_KEY
  } else {
    const customKey = req.headers['x-gemini-key'] as string
    initialized = (customKey && customKey.trim().startsWith('AIzaSy')) || !!process.env.GEMINI_API_KEY
  }
  
  res.json({
    status: 'online',
    supabaseConnected: !!supabaseUrl,
    activeProvider: provider,
    aiInitialized: initialized,
    timestamp: new Date().toISOString()
  })
})

// Unified Multi-LLM Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, student_id, session_type, topic, session_id } = req.body
    const provider = getActiveProvider(req)
    const systemPrompt = 'คุณคือผู้ช่วยสอนอัจฉริยะในแพลตฟอร์ม FINE MODE ที่เชี่ยวชาญด้านศิลปะการบริการอาหารและเครื่องดื่ม การจัดโต๊ะอาหาร (Table Setting) และคำศัพท์ภาษาอังกฤษที่ใช้ในวิชาชีพนี้ ตอบผู้เรียนด้วยความสุภาพ กระชับ สนับสนุนการเรียนรู้ และมีตัวอย่างสถานการณ์จริงเสมอ'
    
    let text = ''

    if (provider === 'openai') {
      const client = getOpenAI(req)
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
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = getAnthropic(req)
      const messages = (history || []).map((h: any) => ({
        role: h.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: h.text
      }))
      messages.push({ role: 'user' as const, content: message })

      const completion = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: systemPrompt,
        messages
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      // Default: Google Gemini
      const genAI = getGemini(req)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt
      })
      const formattedHistory = (history || []).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }))
      const chat = model.startChat({ history: formattedHistory })
      const result = await chat.sendMessage(message)
      text = result.response.text()
    }

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
            session_type: session_type || 'gemini_chat',
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

// Unified Multi-LLM Vision Scan API
app.post('/api/scan', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body
    const provider = getActiveProvider(req)

    const systemPrompt = `คุณเป็น AI ผู้เชี่ยวชาญการวิเคราะห์และระบุวัตถุจากภาพถ่ายตามความเป็นจริง (Object Identification AI)
วิเคราะห์ภาพวัตถุที่เห็นในภาพนี้ตามจริงที่ปรากฏ 100% (ตัวอย่างเช่น หากเห็นเป็นขวดน้ำพลาสติก ขวดกาแฟ แก้วพลาสติก ของเล่น โทรศัพท์มือถือ หรือสิ่งของทั่วไป ให้ระบุชื่อที่เป็นสิ่งนั้นจริงๆ โดยตรงตามความจริงที่กล้องจับภาพได้ ไม่ต้องพยายามเปรียบเทียบหรือบิดเบือนให้กลายเป็นชิ้นส่วนจัดโต๊ะอาหารระดับห้าดาวของโรงแรมหรูหากไม่ใช่สิ่งนั้นจริงๆ)
และส่งค่ากลับมาเป็นรูปแบบ JSON เท่านั้น (ห้ามเขียนข้อความเกริ่นนำหรือปิดท้ายใดๆ นอกเหนือจาก JSON):
{
  "name_th": "ชื่อวัตถุภาษาไทยตามความจริง เช่น ขวดกาแฟพลาสติก, ส้อมอาหาร, ขวดน้ำดื่ม",
  "name_en": "ชื่อวัตถุภาษาอังกฤษตามความจริง เช่น Plastic Coffee Bottle, Dinner Fork, Plastic Water Bottle",
  "category": "food หรือ beverage หรือ equipment หรือ tableware หรือ general (สำหรับของใช้ทั่วไป)",
  "subcategory": "หมวดย่อยเชิงลึก เช่น Plastic Container, Stemware, Flatware, Dinnerware, Electronics",
  "description": "คำอธิบายลักษณะ หน้าที่ และประโยชน์การใช้งานตามจริงของวัตถุชิ้นนั้นๆ",
  "location": "ตำแหน่งหรือจุดที่เรามักจะพบเจอวัตถุชนิดนี้ในชีวิตจริง",
  "service_tips": "เคล็ดลับการจัดเตรียม สุขอนามัย หรือทักษะการหยิบจับดูแลรักษาของสิ่งนั้นๆ 1-2 ข้อ",
  "english_phrases": ["ประโยคภาษาอังกฤษที่เกี่ยวข้องกับการแนะนำ การหยิบใช้ หรือการบริการสิ่งนี้กับลูกค้า/คู่สนทนา 1", "ประโยคแนะนำ/สื่อสารที่ 2"],
  "pronounce": "คำอ่านสัทอักษร (Phonetic Transcription) ภาษาอังกฤษ เช่น /'plæs.tɪk 'kɒf.i 'bɒt.əl/",
  "confidence": ตัวเลขระดับความมั่นใจ 0-100,
  "fine_analysis": {
    "familiarize": {
      "desc": "คำอธิบายรูปร่างลักษณะ หน้าที่และประโยชน์ใช้สอยโดยละเอียดตามจริง",
      "location": "ตำแหน่งหรือการวางจัดเตรียมเป็นปกติ"
    },
    "interact": {
      "pronunciation": "คำอ่านออกเสียงภาษาอังกฤษเลียนแบบสัทอักษรหรือคำอ่านไทยเชิงอังกฤษ",
      "english_phrases": ["ประโยคแนะนำ/สื่อสารในงานบริการ 1", "ประโยคแนะนำ/สื่อสารในงานบริการ 2"],
      "roleplay_prompt": "โจทย์สั้นๆ สำหรับฝึกพูดบทบาทสมมติเกี่ยวกับการแนะนำหรือบริการสิ่งนี้"
    },
    "navigate": {
      "service_steps": [
        "ขั้นตอนการจัดเตรียมสุขอนามัย/ความสะอาดก่อนใช้งาน",
        "ขั้นตอนการเสิร์ฟ/การวางตำแหน่งใช้งานหลัก",
        "ขั้นตอนการเก็บถอน/การทิ้งหรือทำความสะอาดหลังเสร็จงาน"
      ],
      "safety_rules": "ข้อควรระวังสำคัญด้านสุขอนามัยหรือความปลอดภัยที่ต้องระวัง"
    },
    "exhibit": {
      "quiz_question": "คำถามปรนัยทบทวนความรู้เกี่ยวกับคุณสมบัติหรือการหยิบจับสิ่งนี้ 1 ข้อ",
      "quiz_options": ["ตัวเลือกผิด 1", "ตัวเลือกถูก", "ตัวเลือกผิด 2"],
      "correct_answer": "ตัวเลือกถูก (ต้องตรงกับตัวเลือกใน quiz_options ตัวใดตัวหนึ่งพอดี)"
    }
  }
}`

    let text = ''

    if (provider === 'openai') {
      const client = getOpenAI(req)
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
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = getAnthropic(req)
      const completion = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType || 'image/jpeg',
                  data: imageBase64
                }
              },
              {
                type: 'text',
                text: systemPrompt
              }
            ]
          }
        ]
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      // Default: Gemini
      const genAI = getGemini(req)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const imagePart = {
        inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' }
      }
      const result = await model.generateContent([systemPrompt, imagePart])
      text = result.response.text()
    }

    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON output from AI')
    const parsedData = JSON.parse(jsonMatch[0])

    // Save to Supabase DB
    if (supabase) {
      try {
        await supabase.from('ai_scan_items').upsert({
          name_th: parsedData.name_th,
          name_en: parsedData.name_en,
          category: parsedData.category || 'tableware',
          subcategory: parsedData.subcategory || '',
          description: parsedData.description || (parsedData.fine_analysis?.familiarize?.desc || ''),
          location: parsedData.location || (parsedData.fine_analysis?.familiarize?.location || ''),
          service_tips: parsedData.service_tips || (parsedData.fine_analysis?.navigate?.service_steps?.join('\n') || ''),
          english_phrases: parsedData.english_phrases || (parsedData.fine_analysis?.interact?.english_phrases || []),
          pronounce: parsedData.pronounce || (parsedData.fine_analysis?.interact?.pronunciation || '')
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

// Unified Simulation Evaluation API
app.post('/api/simulation/evaluate', async (req, res) => {
  try {
    const { messages, score, student_id, scenario_id } = req.body
    const provider = getActiveProvider(req)
    const chatContent = messages.map((m: any) => `${m.role === 'user' ? 'บริกร' : 'ลูกค้า'}: ${m.text}`).join('\n')

    const prompt = `คุณเป็นผู้เชี่ยวชาญประเมินการบริการในร้านอาหาร
วิเคราะห์บทสนทนาระหว่างบริกรและลูกค้าต่อไปนี้:
${chatContent}

ให้ฟีดแบ็คสั้นๆ (ภาษาไทย) 2-3 ประโยค สรุปจุดเด่นและคำแนะนำเพื่อนำไปปรับปรุง พร้อมคืนค่าในรูปแบบ JSON:
{
  "feedback": "ฟีดแบ็คสรุปภาษาไทย 2-3 ประโยค",
  "suggestions": ["คำแนะนำข้อที่ 1", "คำแนะนำข้อที่ 2"]
}`

    let text = ''

    if (provider === 'openai') {
      const client = getOpenAI(req)
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = getAnthropic(req)
      const completion = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      // Default: Gemini
      const genAI = getGemini(req)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await model.generateContent(prompt)
      text = result.response.text()
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON output from AI')
    const parsed = JSON.parse(jsonMatch[0])

    // Save to Supabase
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

// Unified AI Blog Generation API
app.post('/api/blog/generate', async (req, res) => {
  try {
    const { topic, category, tone, keywords } = req.body
    const provider = getActiveProvider(req)

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

    let text = ''

    if (provider === 'openai') {
      const client = getOpenAI(req)
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = getAnthropic(req)
      const completion = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      // Default: Gemini
      const genAI = getGemini(req)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await model.generateContent(prompt)
      text = result.response.text()
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON output from AI')
    const parsed = JSON.parse(jsonMatch[0])
    res.json(parsed)
  } catch (error: any) {
    console.error('Blog Generation Error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate blog content' })
  }
})

// 3D AI Studio Generation API Integration
app.post('/api/3d/generate', async (req, res) => {
  try {
    const { topic } = req.body
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' })
    }

    const apiKey = (req.headers['x-3d-ai-studio-key'] as string) || process.env.THREE_D_AI_STUDIO_API_KEY || ''
    const tripoKey = (req.headers['x-tripo-key'] as string) || process.env.TRIPO_API_KEY || ''
    console.log(`Generating 3D model for: ${topic}`)

    let glbUrl = ''
    let usdzUrl = ''
    let isMocked = true

    // 1. Try Tripo3D API if tripoKey is available
    if (tripoKey && tripoKey !== 'your_tripo_api_key_here') {
      try {
        console.log(`Submitting Tripo3D task for: ${topic}`)
        const tripoResp = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tripoKey}`
          },
          body: JSON.stringify({
            type: 'text_to_model',
            prompt: topic
          })
        })
        if (tripoResp.ok) {
          const tripoData = (await tripoResp.json()) as any
          if (tripoData.code === 0 && tripoData.data && tripoData.data.task_id) {
            const taskId = tripoData.data.task_id
            console.log(`Tripo3D task submitted successfully, taskId: ${taskId}`)
            
            // Poll for status (max 6 attempts, 3s interval)
            for (let i = 0; i < 6; i++) {
              await new Promise(resolve => setTimeout(resolve, 3000))
              const pollResp = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${tripoKey}`
                }
              })
              if (pollResp.ok) {
                const pollData = (await pollResp.json()) as any
                if (pollData.code === 0 && pollData.data) {
                  const status = pollData.data.status
                  console.log(`Tripo3D task ${taskId} status: ${status}`)
                  if (status === 'success') {
                    glbUrl = pollData.data.result?.model?.glb || ''
                    usdzUrl = glbUrl
                    isMocked = false
                    break
                  } else if (status === 'failed') {
                    console.error('Tripo3D task failed')
                    break
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to communicate with Tripo3D API:', err)
      }
    }

    // 2. Try 3D AI Studio API as fallback/alternative if tripoKey failed or is missing
    if (isMocked && apiKey && apiKey !== 'your_3d_ai_studio_api_key_here') {
      try {
        const response = await fetch('https://3daistudio.com/api/v1/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            prompt: topic,
            quality: 'high',
            formats: ['glb', 'usdz']
          })
        })
        if (response.ok) {
          const result = (await response.json()) as any
          if (result.glb_url) {
            glbUrl = result.glb_url
            usdzUrl = result.usdz_url || ''
            isMocked = false
          }
        }
      } catch (err) {
        console.error('Failed to communicate with 3D AI Studio API:', err)
      }
    }

    if (isMocked) {
      const lowerTopic = topic.toLowerCase()
      if (lowerTopic.includes('glass') || lowerTopic.includes('wine') || lowerTopic.includes('champagne') || lowerTopic.includes('แก้ว')) {
        glbUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WineGlass/glTF-Binary/WineGlass.glb'
        usdzUrl = 'https://developer.apple.com/augmented-reality/quick-look/models/teapot/teapot.usdz'
      } else if (lowerTopic.includes('teapot') || lowerTopic.includes('tea pot') || lowerTopic.includes('kettle') || lowerTopic.includes('กา')) {
        glbUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/UtahTeapot/glTF-Binary/UtahTeapot.glb'
        usdzUrl = 'https://developer.apple.com/augmented-reality/quick-look/models/teapot/teapot.usdz'
      } else if (lowerTopic.includes('bottle') || lowerTopic.includes('flask') || lowerTopic.includes('water') || lowerTopic.includes('ขวด')) {
        glbUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb'
        usdzUrl = 'https://developer.apple.com/augmented-reality/quick-look/models/waterbottle/waterbottle.usdz'
      } else if (lowerTopic.includes('cake') || lowerTopic.includes('dessert') || lowerTopic.includes('sweet') || lowerTopic.includes('เค้ก')) {
        glbUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Cake/glTF-Binary/Cake.glb'
        usdzUrl = 'https://developer.apple.com/augmented-reality/quick-look/models/teapot/teapot.usdz'
      } else if (lowerTopic.includes('apple') || lowerTopic.includes('fruit') || lowerTopic.includes('ผลไม้')) {
        glbUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Apple/glTF-Binary/Apple.glb'
        usdzUrl = 'https://developer.apple.com/augmented-reality/quick-look/models/teapot/teapot.usdz'
      } else {
        const modelId = Math.random().toString(36).substring(2, 11)
        glbUrl = `https://modelviewer.dev/shared-assets/models/Astronaut.glb?id=${modelId}`
        usdzUrl = `https://modelviewer.dev/shared-assets/models/Astronaut.usdz?id=${modelId}`
      }
    }

    res.json({
      success: true,
      topic,
      glbUrl,
      usdzUrl,
      provider: isMocked ? '3D AI Studio (Simulated)' : '3D AI Studio API'
    })
  } catch (error: any) {
    console.error('3D Generation Error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate 3D model' })
  }
})

// Blender Python Script Generator API
app.post('/api/blender/generate', async (req, res) => {
  try {
    const { topic } = req.body
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' })
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
      const client = getOpenAI(req)
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.choices[0].message.content || ''
    } else if (provider === 'claude') {
      const client = getAnthropic(req)
      const completion = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
      text = completion.content[0].type === 'text' ? completion.content[0].text : ''
    } else {
      // Default: Gemini
      const genAI = getGemini(req)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await model.generateContent(prompt)
      text = result.response.text()
    }

    // Extract code block
    let code = text
    const codeMatch = text.match(/```python([\s\S]*?)```/)
    if (codeMatch) {
      code = codeMatch[1].trim()
    } else {
      code = text.replace(/```/g, '').trim()
    }

    res.json({ success: true, topic, code })
  } catch (error: any) {
    console.error('Blender Script Generation Error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate Blender script' })
  }
})

// Connection Health Ping Monitor API
app.get('/api/ping-all', async (req, res) => {
  try {
    const startDb = Date.now()
    let dbStatus = 'offline'
    let dbLatency = 0
    
    // Check Supabase
    if (supabase && supabaseUrl) {
      try {
        const { data, error } = await supabase.from('schools').select('id').limit(1).maybeSingle()
        if (!error) {
          dbStatus = 'online'
        }
      } catch (e) {}
      dbLatency = Date.now() - startDb
    }

    // Check Active Provider API status
    const provider = getActiveProvider(req)
    let aiStatus = 'offline'
    let aiLatency = 0
    const startAI = Date.now()
    try {
      if (provider === 'openai') {
        const client = getOpenAI(req)
        await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        })
        aiStatus = 'online'
      } else if (provider === 'claude') {
        const client = getAnthropic(req)
        await client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        })
        aiStatus = 'online'
      } else {
        const genAI = getGemini(req)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        await model.generateContent("ping")
        aiStatus = 'online'
      }
      aiLatency = Date.now() - startAI
    } catch (e) {
      console.error('Active AI ping check failed:', e)
    }

    res.json({
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus, latency: `${dbLatency}ms` },
        gemini: { status: aiStatus, latency: `${aiLatency}ms` }, // Compat key
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
