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

// All browser calls stay on the same origin and are handled by Next.js Route Handlers.
const API_BASE_PATH = '/api'

// Helper for the active provider. Authentication stays in the HttpOnly same-origin cookie.
export async function getAIHeaders(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
      'x-ai-provider': 'gemini'
    }
  }

  const activeProvider = localStorage.getItem('activeAiProvider') || 'gemini'
  return {
    'Content-Type': 'application/json',
    'x-ai-provider': activeProvider
  }
}

// Chat with context (Next.js full-stack API)
export async function chatWithGemini(
  messages: { role: 'user' | 'model'; text: string }[],
  userMessage: string,
  studentId?: string,
  sessionType?: string,
  topic?: string,
  sessionId?: string
) {
  const headers = await getAIHeaders()
  const response = await fetch(`${API_BASE_PATH}/chat`, {
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

// AI Scan - analyze image (Next.js full-stack API)
export async function analyzeImage(imageBase64: string, mimeType: string = 'image/jpeg') {
  const headers = await getAIHeaders()
  const response = await fetch(`${API_BASE_PATH}/scan`, {
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

// Generate simulation feedback (Next.js full-stack API)
export async function generateSimulationFeedback(
  messages: { role: 'user' | 'model'; text: string }[],
  score: number,
  studentId?: string,
  scenarioId?: string
) {
  const headers = await getAIHeaders()
  const response = await fetch(`${API_BASE_PATH}/simulation`, {
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
