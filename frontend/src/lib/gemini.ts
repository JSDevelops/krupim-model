// System prompt for FINE MODE
export const FINE_SYSTEM_PROMPT = `คุณคือ AI ผู้ช่วยการเรียนรู้ของแพลตฟอร์ม FINE MODE AR+AI 3D Learning 
เชี่ยวชาญด้านการบริการอาหารและเครื่องดื่ม (Food and Beverage Service)
ภาษาหลักคือภาษาไทย แต่สามารถสอนภาษาอังกฤษสำหรับการบริการได้

หน้าที่ของคุณ:
1. ตอบคำถามเกี่ยวกับการบริการอาหารและเครื่องดื่ม
2. สอนและฝึกทักษะภาษาอังกฤษสำหรับบริกร
3. อธิบายอุปกรณ์ เมนู และมาตรฐานการบริการ
4. ให้คำแนะนำและ feedback การเรียนรู้
5. ช่วยฝึก Role-play สถานการณ์จริงในร้านอาหาร

ตอบแบบเป็นกันเอง กระชับ ชัดเจน และให้กำลังใจผู้เรียนเสมอ`

const BACKEND_URL = 'http://localhost:3001'

// Chat with context (Routes via backend)
export async function chatWithGemini(
  messages: { role: 'user' | 'model'; text: string }[],
  userMessage: string,
  studentId?: string,
  sessionType?: string,
  topic?: string,
  sessionId?: string
) {
  const storedApiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : ''
  const response = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': storedApiKey
    },
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
    throw new Error('Failed to fetch from chat API')
  }
  const data = await response.json()
  return data
}

// AI Scan - analyze image (Routes via backend)
export async function analyzeImage(imageBase64: string, mimeType: string = 'image/jpeg') {
  const storedApiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : ''
  const response = await fetch(`${BACKEND_URL}/api/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': storedApiKey
    },
    body: JSON.stringify({
      imageBase64,
      mimeType
    })
  })

  if (!response.ok) {
    throw new Error('Failed to analyze image via scan API')
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
  const storedApiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : ''
  const response = await fetch(`${BACKEND_URL}/api/simulation/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': storedApiKey
    },
    body: JSON.stringify({
      messages,
      score,
      student_id: studentId,
      scenario_id: scenarioId
    })
  })

  if (!response.ok) {
    throw new Error('Failed to evaluate simulation')
  }
  return response.json()
}
