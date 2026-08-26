import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { Pool } from 'pg'
import { jwtVerify } from 'jose'

dotenv.config()

// ─── Startup validation (Fail Fast) ─────────────────────────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'AUTH_SECRET'] as const
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[STARTUP ERROR] Missing required env var: ${key}`)
    process.exit(1)
  }
}

const app = express()
const port = process.env.PORT || 3001

// Trust Railway/Vercel proxy so rate-limiter sees real client IP
app.set('trust proxy', 1)

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
    if (!origin) {
      callback(null, true)
      return
    }
    
    // Check if origin is in explicit whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    // Allow localhost and local IP addresses (dev only)
    if (process.env.NODE_ENV !== 'production' && (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.ngrok-free.app')
    )) {
      callback(null, true)
      return
    }

    // ⚠️ Note: *.vercel.app wildcard removed — add your exact Vercel URL to ALLOWED_ORIGINS
    callback(new Error(`CORS: Origin "${origin}" is not allowed`))
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

// Initialize the server-only local PostgreSQL connection pool.
const databaseUrl = process.env.DATABASE_URL || ''
const database = new Pool({ connectionString: databaseUrl, max: 10 })
const authSecret = new TextEncoder().encode(process.env.AUTH_SECRET || '')

// Initialize Default AI Clients — only if key is present, otherwise null (guarded in helper functions)
const defaultGenAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null
const defaultOpenAI = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null
const defaultAnthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// ─── Zod Validation Schemas ──────────────────────────────────────────────────
const ChatSchema = z.object({
  message: z.string().min(1, 'message is required').max(4000, 'message too long'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })).optional().default([]),
  session_type: z.enum(['gemini_chat', 'openai_chat', 'claude_chat']).optional(),
  topic: z.string().optional(),
  session_id: z.string().uuid().optional()
})

const ScanSchema = z.object({
  imageBase64: z.string().min(1, 'imageBase64 is required'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']).optional().default('image/jpeg')
})

const SimulationEvalSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    text: z.string()
  })).min(1).max(50),
  score: z.number().min(0).max(100).optional(),
  scenario_id: z.string().uuid().optional()
})

const BlogGenerateSchema = z.object({
  topic: z.string().min(1, 'topic is required').max(200),
  category: z.string().optional(),
  tone: z.string().optional(),
  keywords: z.string().optional()
})

const ThreeDGenerateSchema = z.object({
  topic: z.string().min(1, 'topic is required').max(200)
})

// Helper: validate request body with zod
function validate<T>(schema: z.ZodType<T>, req: express.Request, res: express.Response): T | null {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({
      error: 'Invalid request body',
      details: result.error.flatten().fieldErrors
    })
    return null
  }
  return result.data
}

// JWT authentication shared with the Next.js frontend.
// ใช้กับ endpoint ที่ต้องการ login เท่านั้น
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const { payload } = await jwtVerify(token, authSecret, {
      algorithms: ['HS256'],
      issuer: 'krupim-local',
      audience: 'krupim-app'
    })
    if (!payload.sub || typeof payload.role !== 'string') {
      res.status(401).json({ error: 'Unauthorized: Invalid session payload' })
      return
    }
    const result = await database.query<{ role: UserRole; approval_status: string }>(
      'SELECT role, approval_status FROM profiles WHERE id = $1 LIMIT 1',
      [payload.sub]
    )
    const profile = result.rows[0]
    if (!profile || profile.approval_status !== 'active' || profile.role !== payload.role) {
      res.status(403).json({ error: 'Forbidden: Account is not active' })
      return
    }

    ;(req as any).userId = payload.sub
    ;(req as any).userRole = profile.role
    next()
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Token verification failed' })
  }
}

type UserRole = 'developer' | 'teacher' | 'student'

function requireRole(...allowedRoles: UserRole[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!allowedRoles.includes((req as any).userRole)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' })
      return
    }
    next()
  }
}


// Helper to get dynamic active provider
function getActiveProvider(req: express.Request): 'gemini' | 'openai' | 'claude' {
  const provider = req.headers['x-ai-provider'] as string
  if (provider === 'openai' || provider === 'claude') {
    return provider
  }
  return 'gemini' // default
}

// API keys are server-side secrets and are never accepted from request headers.
function getGemini(_req: express.Request): GoogleGenerativeAI {
  if (defaultGenAI) return defaultGenAI
  throw new Error('No Gemini API key configured. Please set GEMINI_API_KEY in .env.')
}

function getOpenAI(_req: express.Request): OpenAI {
  if (defaultOpenAI) return defaultOpenAI
  throw new Error('No OpenAI API key configured. Please set OPENAI_API_KEY in .env.')
}

function getAnthropic(_req: express.Request): Anthropic {
  if (defaultAnthropic) return defaultAnthropic
  throw new Error('No Anthropic API key configured. Please set ANTHROPIC_API_KEY in .env.')
}

// System status endpoint
app.get('/api/status', requireAuth, (req, res) => {
  const provider = getActiveProvider(req)
  let initialized = false
  
  if (provider === 'openai') {
    initialized = !!process.env.OPENAI_API_KEY
  } else if (provider === 'claude') {
    initialized = !!process.env.ANTHROPIC_API_KEY
  } else {
    initialized = !!process.env.GEMINI_API_KEY
  }
  
  res.json({
    status: 'online',
    databaseConnected: !!databaseUrl,
    activeProvider: provider,
    aiInitialized: initialized,
    timestamp: new Date().toISOString()
  })
})

// Unified Multi-LLM Chat API (requires the local application JWT)
app.post('/api/chat', requireAuth, async (req, res) => {
  try {
    const body = validate(ChatSchema, req, res)
    if (!body) return
    const { message, history, session_type, topic, session_id } = body
    const ownerId = (req as any).userId as string
    const provider = getActiveProvider(req)
    const systemPrompt = 'คุณคือผู้ช่วยสอนอัจฉริยะในแพลตฟอร์ม FINE MODEL ที่เชี่ยวชาญด้านศิลปะการบริการอาหารและเครื่องดื่ม การจัดโต๊ะอาหาร (Table Setting) และคำศัพท์ภาษาอังกฤษที่ใช้ในวิชาชีพนี้ ตอบผู้เรียนด้วยความสุภาพ กระชับ สนับสนุนการเรียนรู้ และมีตัวอย่างสถานการณ์จริงเสมอ'
    
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

    // Persist only to the authenticated student's own record.
    let savedSessionId = session_id
    if ((req as any).userRole === 'student') {
      try {
        const fullMessages = [...(history || []), { role: 'user', text: message }, { role: 'model', text }]
        if (savedSessionId) {
          await database.query(
            'UPDATE chat_sessions SET messages_json = $1, ended_at = NOW() WHERE id = $2 AND student_id = $3',
            [JSON.stringify(fullMessages), savedSessionId, ownerId]
          )
        } else {
          const inserted = await database.query<{ id: string }>(`
            INSERT INTO chat_sessions (student_id, session_type, topic, messages_json)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `, [ownerId, session_type || 'gemini_chat', topic || 'General Conversation', JSON.stringify(fullMessages)])
          savedSessionId = inserted.rows[0]?.id
        }
      } catch (dbErr) {
        console.error('Failed to save chat session:', dbErr)
      }
    }

    res.json({ response: text, session_id: savedSessionId })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    res.status(500).json({ error: 'Failed to process chat request. Please try again.' })
  }
})

// Unified Multi-LLM Vision Scan API (requires the local application JWT)
app.post('/api/scan', requireAuth, async (req, res) => {
  try {
    const body = validate(ScanSchema, req, res)
    if (!body) return
    const { imageBase64, mimeType: resolvedMime } = body

    // Validate base64 size (max ~8MB encoded = ~6MB image)
    if (imageBase64.length > 10_000_000) {
      res.status(400).json({ error: 'Image too large. Maximum size is 6MB.' })
      return
    }

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
                  url: `data:${resolvedMime};base64,${imageBase64}`
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
                  media_type: resolvedMime as any,
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
      // Default: Gemini 2.0 Flash (Optimized for Fast Real-time Vision)
      const genAI = getGemini(req)
      let result
      const imagePart = {
        inlineData: { data: imageBase64, mimeType: resolvedMime }
      }
      try {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        })
        result = await model.generateContent([systemPrompt, imagePart])
      } catch (err: any) {
        console.warn('Gemini 2.0 Flash failed, retrying with Gemini 1.5 Flash:', err.message)
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        })
        result = await model.generateContent([systemPrompt, imagePart])
      }
      text = result.response.text()
    }

    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON output from AI. Raw response: ' + text)
    const parsedData = JSON.parse(jsonMatch[0])

    // Save to Local PostgreSQL DB
    if (['teacher', 'developer'].includes((req as any).userRole)) {
      try {
        await database.query(`
          INSERT INTO ai_scan_items (
            name_th, name_en, category, subcategory, description, location,
            service_tips, english_phrases, pronounce
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          ON CONFLICT (name_en) DO UPDATE SET
            name_th = EXCLUDED.name_th,
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            description = EXCLUDED.description,
            location = EXCLUDED.location,
            service_tips = EXCLUDED.service_tips,
            english_phrases = EXCLUDED.english_phrases,
            pronounce = EXCLUDED.pronounce
        `, [
          parsedData.name_th,
          parsedData.name_en,
          parsedData.category || 'tableware',
          parsedData.subcategory || '',
          parsedData.description || (parsedData.fine_analysis?.familiarize?.desc || ''),
          parsedData.location || (parsedData.fine_analysis?.familiarize?.location || ''),
          parsedData.service_tips || (parsedData.fine_analysis?.navigate?.service_steps?.join('\n') || ''),
          parsedData.english_phrases || (parsedData.fine_analysis?.interact?.english_phrases || []),
          parsedData.pronounce || (parsedData.fine_analysis?.interact?.pronunciation || '')
        ])
      } catch (dbErr) {
        console.error('Failed to save scanned item to DB:', dbErr)
      }
    }

    res.json(parsedData)
  } catch (error: any) {
    // 🔴 แก้ไข: ไม่ส่ง fallback teapot ที่ทำให้ผู้ใช้เข้าใจผิด
    // ส่ง error ที่ชัดเจนแทน เพื่อให้ frontend แสดง error state ที่ถูกต้อง
    console.error('Scan API Error:', error.message)
    res.status(503).json({
      error: 'AI scan service temporarily unavailable. Please try again.',
      code: 'SCAN_AI_ERROR',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Unified Simulation Evaluation API (requires the local application JWT)
app.post('/api/simulation/evaluate', requireAuth, async (req, res) => {
  try {
    const body = validate(SimulationEvalSchema, req, res)
    if (!body) return
    const { messages, score, scenario_id } = body
    const ownerId = (req as any).userId as string

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

    // Save to Local PostgreSQL
    if ((req as any).userRole === 'student' && scenario_id) {
      try {
        await database.query(`
          INSERT INTO simulation_sessions (
            student_id, scenario_id, score, max_score, feedback_json, conversation_json
          ) VALUES ($1, $2, $3, 100, $4, $5)
        `, [ownerId, scenario_id, score || 0, JSON.stringify(parsed), JSON.stringify(messages)])
      } catch (dbErr) {
        console.error('Failed to save simulation session:', dbErr)
      }
    }

    res.json({ ...parsed, score })
  } catch (error: any) {
    console.error('Simulation Evaluation Error:', error)
    res.status(500).json({ error: 'Failed to evaluate simulation. Please try again.' })
  }
})

// Unified AI Blog Generation API (requires the local application JWT)
app.post('/api/blog/generate', requireAuth, requireRole('teacher', 'developer'), async (req, res) => {
  try {
    const body = validate(BlogGenerateSchema, req, res)
    if (!body) return
    const { topic, category, tone, keywords } = body
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
    res.status(500).json({ error: 'Failed to generate blog content. Please try again.' })
  }
})

// ─── In-memory store for Tripo3D async tasks ─────────────────────────────────
const tripoTasks = new Map<string, { status: 'pending' | 'success' | 'failed', ownerId: string, glbUrl?: string, topic?: string }>()

// 3D AI Studio Generation API Integration (NON-BLOCKING)
app.post('/api/3d/generate', requireAuth, requireRole('teacher', 'developer'), async (req, res) => {
  try {
    const body = validate(ThreeDGenerateSchema, req, res)
    if (!body) return
    const { topic } = body

    const ownerId = (req as any).userId as string
    const apiKey = process.env.THREE_D_AI_STUDIO_API_KEY || ''
    const tripoKey = process.env.TRIPO_API_KEY || ''
    console.log(`Generating 3D model for: ${topic}`)

    let glbUrl = ''
    let usdzUrl = ''
    let isMocked = true

    // 1. Try Tripo3D API if tripoKey is available — NON-BLOCKING: submit task, return taskId immediately
    if (tripoKey && tripoKey !== 'your_tripo_api_key_here') {
      try {
        console.log(`Submitting Tripo3D task for: ${topic}`)
        const tripoResp = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tripoKey}`
          },
          body: JSON.stringify({ type: 'text_to_model', prompt: topic })
        })
        if (tripoResp.ok) {
          const tripoData = (await tripoResp.json()) as any
          if (tripoData.code === 0 && tripoData.data?.task_id) {
            const taskId = tripoData.data.task_id as string
            console.log(`Tripo3D task submitted: ${taskId}`)
            // Store pending task — background poll will update it
            tripoTasks.set(taskId, { status: 'pending', ownerId, topic })
            // Background polling (non-blocking)
            ;(async () => {
              for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 5000))
                try {
                  const pollResp = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
                    headers: { 'Authorization': `Bearer ${tripoKey}` }
                  })
                  if (pollResp.ok) {
                    const pollData = (await pollResp.json()) as any
                    if (pollData.code === 0 && pollData.data) {
                      const status = pollData.data.status
                      if (status === 'success') {
                        tripoTasks.set(taskId, { status: 'success', ownerId, glbUrl: pollData.data.result?.model?.glb || '', topic })
                        break
                      } else if (status === 'failed') {
                        tripoTasks.set(taskId, { status: 'failed', ownerId, topic })
                        break
                      }
                    }
                  }
                } catch (pollErr) {
                  console.error('Tripo3D poll error:', pollErr)
                }
              }
            })()
            // Return taskId immediately — client can poll /api/3d/status/:taskId
            return res.json({
              success: true,
              topic,
              taskId,
              status: 'pending',
              provider: 'Tripo3D (sample shown while processing)',
              glbUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
              usdzUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz'
            })
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
      status: 'success',
      provider: isMocked ? '3D AI Studio (Simulated)' : '3D AI Studio API'
    })
  } catch (error: any) {
    console.error('3D Generation Error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate 3D model' })
  }
})

// Tripo3D Async Status Check (client polls this after receiving taskId)
app.get('/api/3d/status/:taskId', requireAuth, requireRole('teacher', 'developer'), (req, res) => {
  const { taskId } = req.params as { taskId: string }
  const task = tripoTasks.get(taskId)
  if (!task || (task.ownerId !== (req as any).userId && (req as any).userRole !== 'developer')) {
    return res.status(404).json({ error: 'Task not found' })
  }
  const { ownerId: _ownerId, ...publicTask } = task
  res.json({ taskId, ...publicTask })
})

// Blender Python Script Generator API
app.post('/api/blender/generate', requireAuth, requireRole('teacher', 'developer'), async (req, res) => {
  try {
    const body = validate(ThreeDGenerateSchema, req, res)
    if (!body) return
    const { topic } = body
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

// Connection Health Ping Monitor API (🔐 requires JWT)
// 🔴 แก้ไข: ไม่เรียก LLM จริงเพื่อประหยัด token — ตรวจแค่ API key format + DB ping
app.get('/api/ping-all', requireAuth, requireRole('developer'), async (req, res) => {
  try {
    const startDb = Date.now()
    let dbStatus = 'offline'
    let dbLatency = 0
    
    try {
      await database.query('SELECT 1')
      dbStatus = 'online'
    } catch {}
    dbLatency = Date.now() - startDb

    // Check AI provider — ตรวจ key format เท่านั้น ไม่เรียก LLM จริง (ประหยัด token)
    const provider = getActiveProvider(req)
    let aiStatus = 'offline'
    let aiNote = ''

    if (provider === 'openai') {
      const hasKey = !!process.env.OPENAI_API_KEY
      aiStatus = hasKey ? 'key_configured' : 'no_key'
      aiNote = 'Key format check only (no token usage)'
    } else if (provider === 'claude') {
      const hasKey = !!process.env.ANTHROPIC_API_KEY
      aiStatus = hasKey ? 'key_configured' : 'no_key'
      aiNote = 'Key format check only (no token usage)'
    } else {
      // Gemini
      const hasKey = !!process.env.GEMINI_API_KEY
      aiStatus = hasKey ? 'key_configured' : 'no_key'
      aiNote = 'Key format check only (no token usage)'
    }

    res.json({
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus, latency: `${dbLatency}ms` },
        ai: { status: aiStatus, provider, note: aiNote },
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
