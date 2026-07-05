// System prompt for FINE MODEL
export const FINE_SYSTEM_PROMPT = `คุณคือ AI ผู้ช่วยการเรียนรู้ของแพลตฟอร์ม FINE MODEL AR 3D + AI Learning 
เชี่ยวชาญด้านการบริการอาหารและเครื่องดื่ม (Food and Beverage Service)
ภาษาหลักคือภาษาไทย แต่สามารถสอนภาษาอังกฤษสำหรับการบริการได้

หน้าที่ของคุณ:
1. ตอบคำถามเกี่ยวกับการบริการอาหารและเครื่องดื่ม
2. สอนและฝึกทักษะภาษาอังกฤษสำหรับบริกร
3. อธิบายอุปกรณ์ เมนู และมาตรฐานการบริการ
4. ให้คำแนะนำและ feedback การเรียนรู้
5. ช่วยฝึก Role-play สถานการณ์จริงในร้านอาหาร

ตอบแบบเป็นกันเอง กระชับ ชัดเจน และให้กำลังใจผู้เรียนเสมอ`

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

// ดึง Supabase access token จาก session ปัจจุบัน
async function getAccessToken(): Promise<string> {
  if (typeof window === 'undefined') return ''
  try {
    // dynamic import เพื่อหลีกเลี่ยง circular dependency
    const { supabase } = await import('@/lib/supabase')
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? ''
  } catch {
    return ''
  }
}

// Helper to get active AI headers from localStorage + Supabase JWT
export async function getAIHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken()

  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'x-ai-provider': 'gemini',
      'x-gemini-key': '',
      'x-openai-key': '',
      'x-claude-key': ''
    }
  }

  const activeProvider = localStorage.getItem('activeAiProvider') || 'gemini'
  const geminiKey = localStorage.getItem('geminiApiKey') || ''
  const openaiKey = localStorage.getItem('openaiApiKey') || ''
  const claudeKey = localStorage.getItem('claudeApiKey') || ''

  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'x-ai-provider': activeProvider,
    'x-gemini-key': geminiKey,
    'x-openai-key': openaiKey,
    'x-claude-key': claudeKey
  }
}

// Chat with context (Routes via backend)
export async function chatWithGemini(
  messages: { role: 'user' | 'model'; text: string }[],
  userMessage: string,
  studentId?: string,
  sessionType?: string,
  topic?: string,
  sessionId?: string
) {
  const headers = await getAIHeaders()
  const response = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: userMessage,
      history: messages,
      student_id: studentId,
      session_type: sessionType,
      topic,
      session_id: sessionId
    })
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    throw new Error(errBody.error || `Chat API error: ${response.status}`)
  }
  const data = await response.json()
  return data
}

// AI Scan - analyze image (Routes via backend)
export async function analyzeImage(imageBase64: string, mimeType: string = 'image/jpeg') {
  const headers = await getAIHeaders()
  const response = await fetch(`${BACKEND_URL}/api/scan`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      imageBase64,
      mimeType
    })
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    throw new Error(errBody.error || `Scan API error: ${response.status}`)
  }
  return response.json()
}

// Generate simulation feedback (Routes via backend)
export async function generateSimulationFeedback(
  messages: { role: 'user' | 'model'; text: string }[],
  score: number,
  studentId?: string,
  scenarioId?: string
) {
  const headers = await getAIHeaders()
  const response = await fetch(`${BACKEND_URL}/api/simulation/evaluate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      score,
      student_id: studentId,
      scenario_id: scenarioId
    })
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    throw new Error(errBody.error || `Simulation API error: ${response.status}`)
  }
  return response.json()
}
