'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import StudentFINENav from '@/components/StudentFINENav'
import StudentIcon, { type StudentIconName } from '@/app/student/StudentIcon'
import { useRole } from '@/context/RoleContext'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import SpeechSpeedToggle, { getStoredSpeechRate } from '@/components/SpeechSpeedToggle'
import styles from './simulation.module.css'

type Message = {
  role: 'user' | 'ai'
  text: string
  translation?: string
  showTranslation?: boolean
}

type Feedback = {
  text: string
  score: number
  suggestions?: string[]
  knowledge?: number
  skills?: number
  attitude?: number
  competency?: number
}

type RecognitionEvent = { results: ArrayLike<{ 0: { transcript: string } }> }
type Recognition = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type RecognitionConstructor = new () => Recognition

const DEFAULT_SCENARIO_ID = '44444444-4444-4444-4444-444444444441'
const TIME_LIMIT = 600

export type GuestStatus = 'waiting_greeting' | 'listening' | 'thinking' | 'speaking' | 'ready'

export const GUEST_STATUS_INFO: Record<GuestStatus, { label: string; tone: string }> = {
  waiting_greeting: { label: '🚶 รอรับการทักทาย', tone: '#b27814' },
  listening: { label: '👂 กำลังฟังคุณพูด...', tone: '#2563eb' },
  thinking: { label: '💭 กำลังคิดคำตอบ...', tone: '#6b7280' },
  speaking: { label: '🗣️ กำลังพูดตอบกลับ...', tone: '#16a34a' },
  ready: { label: 'พร้อมสนทนา', tone: '#215c43' },
}

const INITIAL_GREETING_SUGGESTIONS = [
  'Good evening, sir! Welcome to our restaurant. Do you have a reservation tonight?',
  'Good evening, sir! Welcome to the Grand Dining Room. A table for how many persons, please?',
  'Good evening and welcome! May I have your name for the table reservation, sir?',
]

type LearningScenario = {
  id: string
  title: string
  titleTh: string
  description: string
  sentences?: string[]
}

const criteria: Array<{ label: string; score: number; icon: StudentIconName; tone: string }> = [
  { label: 'การทักทายและการพูดจา', score: 20, icon: 'message', tone: '#39745d' },
  { label: 'ความถูกต้องของภาษา', score: 30, icon: 'book', tone: '#4d7896' },
  { label: 'การแนะนำและรับรายการ', score: 30, icon: 'task', tone: '#9a6e2b' },
  { label: 'มารยาทงานบริการ', score: 20, icon: 'award', tone: '#915363' },
]

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

export default function SimulationPage() {
  const { user } = useRole()
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [turnCount, setTurnCount] = useState(0)
  const [stage, setStage] = useState('Greeting & Seating')
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>(INITIAL_GREETING_SUGGESTIONS)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [score, setScore] = useState(15)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const [guestStatus, setGuestStatus] = useState<GuestStatus>('waiting_greeting')
  const [speechRate, setSpeechRate] = useState<number>(() => getStoredSpeechRate())
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO_ID)
  const [scenario, setScenario] = useState<LearningScenario | null>(null)

  const messageRef = useRef<Message[]>([])
  const turnCountRef = useRef(0)
  const scoreRef = useRef(20)
  const recognitionRef = useRef<Recognition | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messageRef.current = messages }, [messages])
  useEffect(() => { turnCountRef.current = turnCount }, [turnCount])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [messages, typing])
  useEffect(() => () => { recognitionRef.current?.stop(); window.speechSynthesis?.cancel() }, [])

  // Load scenario from query parameter if present
  useEffect(() => {
    const selectedId = new URLSearchParams(window.location.search).get('scenario')?.trim()
    if (!selectedId) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setScenarioId(selectedId)
      void authenticatedFetch('/api/student/navigate', { signal: controller.signal })
        .then(async response => (response.ok ? (response.json() as Promise<{ scenarios?: LearningScenario[] }>) : null))
        .then(payload => setScenario(payload?.scenarios?.find(item => item.id === selectedId) || null))
        .catch(() => setScenario(null))
    }, 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [])

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = speechRate
    const voices = window.speechSynthesis.getVoices()
    utterance.voice =
      voices.find(voice => voice.lang.startsWith('en') && /Google|Natural|Male|David/i.test(voice.name)) ||
      voices.find(voice => voice.lang.startsWith('en')) ||
      null

    setGuestStatus('speaking')
    utterance.onend = () => {
      setGuestStatus('ready')
      onDone?.()
    }
    utterance.onerror = () => {
      setGuestStatus('ready')
    }
    window.speechSynthesis.speak(utterance)
  }, [speechRate])

  const finishSimulation = useCallback(async () => {
    if (finished) return
    setFinished(true)
    setEvaluating(true)
    recognitionRef.current?.stop()
    window.speechSynthesis?.cancel()

    try {
      const response = await authenticatedFetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messageRef.current.map(m => ({ role: m.role, text: m.text })),
          scenario_id: scenarioId,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'ประเมินผลไม่สำเร็จ')
      setFeedback({
        text: String(payload.feedback || 'ฝึกซ้อมได้ดี ควรทบทวนประโยคบริการอย่างสม่ำเสมอ'),
        score: Number(payload.score ?? scoreRef.current),
        suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : [],
        knowledge: Number(payload.knowledge ?? 0),
        skills: Number(payload.skills ?? 0),
        attitude: Number(payload.attitude ?? 0),
        competency: Number(payload.competency ?? 0),
      })
    } catch (error) {
      setFeedback({
        text: error instanceof Error ? error.message : 'ระบบบันทึกผลแล้ว แต่ไม่สามารถสร้างคำแนะนำเพิ่มเติมได้',
        score: scoreRef.current,
      })
    } finally {
      setEvaluating(false)
    }
  }, [finished, scenarioId])

  // Timer countdown
  useEffect(() => {
    if (!started || finished) return
    const timer = window.setInterval(() => {
      setTimeLeft(value => {
        if (value <= 1) {
          window.clearInterval(timer)
          void finishSimulation()
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [started, finished, finishSimulation])

  function startSimulation() {
    setStarted(true)
    setTyping(false)
    setTurnCount(0)
    setScore(15)
    setStage('Greeting & Seating')
    setSuggestedResponses(INITIAL_GREETING_SUGGESTIONS)
    setMessages([])
    setGuestStatus('waiting_greeting')
    setInput('')
  }

  async function sendMessage(value = input) {
    const text = value.trim()
    if (!text || finished || typing) return

    // 1. Append waiter message
    const updatedMessages: Message[] = [...messages, { role: 'user', text }]
    setMessages(updatedMessages)
    setInput('')
    setTyping(true)
    setGuestStatus('thinking')

    try {
      // 2. Call AI Customer Simulation API
      const response = await authenticatedFetch('/api/simulation/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, text: m.text })),
          userMessage: text,
          turnCount: turnCountRef.current + 1,
          currentStage: stage,
          scenarioTitle: scenario?.title || 'Fine Dining Restaurant',
        }),
      })

      if (!response.ok) {
        throw new Error('ไม่สามารถเชื่อมต่อลูกค้า AI ได้')
      }

      const data = await response.json() as {
        reply: string
        translationTh?: string
        stage?: string
        suggestedResponses?: string[]
        isFinished?: boolean
      }

      const nextCustomerMessage: Message = {
        role: 'ai',
        text: data.reply,
        translation: data.translationTh || '',
        showTranslation: false,
      }

      setMessages(prev => [...prev, nextCustomerMessage])
      setTurnCount(count => count + 1)
      if (data.stage) setStage(data.stage)
      if (data.suggestedResponses?.length) setSuggestedResponses(data.suggestedResponses)
      setScore(s => Math.min(100, s + 17))
      speak(data.reply)

      if (data.isFinished) {
        toast.success('การบริการครบทุกขั้นตอนแล้ว!', {
          description: 'คุณสามารถกดปุ่ม "จบประเมินผล" เพื่อดูสรุปคะแนนทักษะได้เลยครับ',
        })
      }
    } catch (err) {
      console.warn('AI Chat error, continuing session:', err)
      toast.error('มีปัญหาในการเชื่อมต่อ AI ลูกค้าชั่วคราว กำลังใช้การตอบกลับสำรอง')
      const fallbackReply: Message = {
        role: 'ai',
        text: 'Good evening! Thank you. Yes, I have a reservation for two under the name Smith. Is our table ready?',
        translation: 'สวัสดีตอนเย็นครับ! ขอบคุณครับ ใช่ครับ ผมมีจองโต๊ะสำหรับ 2 ท่านไว้ในชื่อ สมิธ โต๊ะพร้อมแล้วหรือยังครับ?',
        showTranslation: false,
      }
      setMessages(prev => [...prev, fallbackReply])
      speak(fallbackReply.text)
    } finally {
      setTyping(false)
    }
  }

  function toggleMessageTranslation(index: number) {
    setMessages(prev =>
      prev.map((msg, i) => (i === index ? { ...msg, showTranslation: !msg.showTranslation } : msg)),
    )
  }

  function useSuggestion(phrase: string) {
    setInput(phrase)
    toast.info('ใส่ประโยคแนะนำในช่องตอบแล้ว สามารถกดส่งหรือฝึกออกเสียงได้ทันที')
  }

  function toggleSpeech() {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      setGuestStatus(messageRef.current.length === 0 ? 'waiting_greeting' : 'ready')
      return
    }
    const speechWindow = window as typeof window & {
      SpeechRecognition?: RecognitionConstructor
      webkitSpeechRecognition?: RecognitionConstructor
    }
    const Constructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Constructor) return toast.warning('อุปกรณ์นี้ไม่รองรับการพิมพ์ด้วยเสียง กรุณาพิมพ์คำตอบแทน')
    const recognition = new Constructor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = event => {
      const transcript = event.results[0]?.[0]?.transcript || ''
      setInput(transcript)
      setListening(false)
      if (transcript) void sendMessage(transcript)
    }
    recognition.onerror = () => {
      setListening(false)
      setGuestStatus(messageRef.current.length === 0 ? 'waiting_greeting' : 'ready')
      toast.error('ไม่สามารถรับเสียงได้ กรุณาตรวจสอบสิทธิ์ไมโครโฟน')
    }
    recognition.onend = () => {
      setListening(false)
    }
    recognitionRef.current = recognition
    setListening(true)
    setGuestStatus('listening')
    recognition.start()
  }

  function resetSimulation() {
    setStarted(false)
    setFinished(false)
    setTurnCount(0)
    setMessages([])
    setInput('')
    setScore(15)
    setTimeLeft(TIME_LIMIT)
    setFeedback(null)
    setTyping(false)
    setGuestStatus('waiting_greeting')
  }

  // ─── 1. INTRO PAGE ───────────────────────────────────────────
  if (!started) {
    return (
      <>
        <main className={styles.introPage}>
          <div className={styles.introShell}>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                  <StudentIcon name="cube" size={15} />
                  Navigate · AI Customer Simulation
                </span>
                <h1>{scenario?.title || 'ฝึกสนทนากับลูกค้าจำลอง AI'}</h1>
                <p>
                  {scenario?.description ||
                    'สวมบทบาทเป็นพนักงานบริการ (Waiter/Waitress) ฝึกต้อนรับ แนะนำเมนู รับออร์เดอร์อาหาร และส่งลูกค้า โดยมี AI สวมบทบาทเป็น Mr. Smith ลูกค้าต่างชาติ'}
                </p>
                <div className={styles.heroMeta}>
                  <span>ระดับเริ่มต้น - ปานกลาง</span>
                  <span>10 นาที</span>
                  <span>100 คะแนนเต็ม</span>
                  <span>AI Interactive Roleplay</span>
                </div>
              </div>
              <div className={styles.restaurantVisual}>
                <span>{scenario?.titleTh || '5-Star Hotel Dining Room'}</span>
              </div>
            </section>

            <section className={styles.introGrid}>
              <article className={styles.card}>
                <div className={styles.cardTitle}>
                  <span className={styles.iconBox}>
                    <StudentIcon name="target" />
                  </span>
                  <div>
                    <h2>เป้าหมายสถานการณ์จริง</h2>
                    <p>จำลองการบริการอาหารและเครื่องดื่มครบ 5 ขั้นตอน</p>
                  </div>
                </div>
                <p className={styles.cardText}>
                  ฝึกสื่อสารภาษาอังกฤษอย่างสุภาพ โต้ตอบกับลูกค้า AI (Mr. Smith) ตามขั้นตอนมาตรฐานงานบริการโรงแรม:
                  ต้อนรับและตรวจสอบการจอง, เสิร์ฟน้ำและมอบเมนู, รับออร์เดอร์อาหาร, สอบถามความพึงพอใจ และการเช็คบิลส่งลูกค้า
                </p>
                <button type="button" className={styles.startButton} onClick={startSimulation}>
                  เริ่มฝึกสถานการณ์จำลองกับลูกค้า AI <StudentIcon name="arrowRight" size={17} />
                </button>
              </article>

              <article className={styles.card}>
                <div className={styles.cardTitle}>
                  <span className={`${styles.iconBox} ${styles.goldIcon}`}>
                    <StudentIcon name="chart" />
                  </span>
                  <div>
                    <h2>เกณฑ์การประเมิน 4 ด้าน</h2>
                    <p>ระบบ AI จะวิเคราะห์เมื่อจบการฝึก</p>
                  </div>
                </div>
                <div className={styles.criteria}>
                  {criteria.map(item => (
                    <div key={item.label}>
                      <span className={styles.criterionIcon} style={{ color: item.tone }}>
                        <StudentIcon name={item.icon} size={16} />
                      </span>
                      <span>{item.label}</span>
                      <strong>{item.score}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <Link href="/student/navigate" className={styles.backLink}>
              <StudentIcon name="arrowLeft" size={16} />
              กลับไปหน้าเลือกสถานการณ์
            </Link>
          </div>
        </main>
        <StudentFINENav />
      </>
    )
  }

  // ─── 2. RESULT PAGE ──────────────────────────────────────────
  if (finished) {
    return (
      <>
        <main className={styles.resultPage}>
          <section className={styles.resultCard}>
            <span className={styles.resultIcon}>
              <StudentIcon name="award" size={28} />
            </span>
            <span className={styles.eyebrow}>Simulation Completed</span>
            <h1>จบสถานการณ์จำลองแล้ว</h1>

            {evaluating ? (
              <div className={styles.evaluating}>
                <StudentIcon name="refresh" size={22} />
                <span>AI กำลังวิเคราะห์และบันทึกคะแนน...</span>
              </div>
            ) : (
              <>
                <div className={styles.resultScore}>
                  {feedback?.score ?? score}
                  <small>/ 100 คะแนน</small>
                </div>

                <div className={styles.feedback}>
                  <StudentIcon name="message" size={18} />
                  <div>
                    <strong>ผลการประเมินจากผู้เชี่ยวชาญ AI:</strong>
                    <p>{feedback?.text}</p>
                    {feedback?.suggestions && feedback.suggestions.length > 0 && (
                      <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '9.5px' }}>
                        {feedback.suggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className={styles.resultActions}>
                  <button type="button" className={styles.startButton} onClick={resetSimulation}>
                    <StudentIcon name="refresh" size={16} />
                    ฝึกอีกครั้ง
                  </button>
                  <Link className={styles.secondaryButton} href="/student/exhibit">
                    ดูแฟ้มสะสมผลงาน (E)
                  </Link>
                </div>
              </>
            )}
          </section>
        </main>
        <StudentFINENav />
      </>
    )
  }

  // ─── 3. ACTIVE SIMULATION CHAT ───────────────────────────────
  const stageWeights: Record<string, number> = {
    'Greeting & Seating': 20,
    'Drinks & Menus': 40,
    'Food Ordering': 60,
    'During Meal': 80,
    'Billing & Farewell': 100,
  }
  const progressPercent = turnCount === 0 ? 10 : Math.min(100, Math.max(stageWeights[stage] || 20, Math.min(100, turnCount * 20)))

  return (
    <>
      <main className={styles.sessionPage}>
        <div className={styles.sessionShell}>
          <header className={styles.sessionHeader}>
            <div>
              <span className={styles.eyebrow}>
                {stage || 'Greeting and seating'}
              </span>
              <h1>Restaurant Simulation</h1>
            </div>
            <div className={styles.sessionStats}>
              <span>
                <StudentIcon name="clock" size={15} />
                {formatTime(timeLeft)}
              </span>
              <span>{progressPercent}%</span>
              <button
                type="button"
                className={styles.finishHeaderBtn}
                onClick={() => void finishSimulation()}
                title="จบและประเมินผลการสนทนา"
              >
                จบประเมินผล
              </button>
            </div>
          </header>

          <div className={styles.progressTrack}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>

          <section className={styles.chatPanel}>
            {/* Customer Header */}
            <div className={styles.customer}>
              <div className={styles.customerInfoGroup}>
                <div className={styles.customerAvatar}>
                  <StudentIcon name="user" size={22} />
                </div>
                <div className={styles.customerMeta}>
                  <div className={styles.customerNameRow}>
                    <strong>Mr. Robert Smith</strong>
                    <span className={`${styles.guestStatusBadge} ${styles[guestStatus]}`}>
                      <span className={styles.pulseDot} />
                      {GUEST_STATUS_INFO[guestStatus].label}
                    </span>
                  </div>
                  <span>ลูกค้าจำลองชาวต่างชาติ (5-Star Hotel Guest)</span>
                </div>
              </div>
              <div className={styles.customerAudioControls}>
                <SpeechSpeedToggle compact currentRate={speechRate} onRateChange={setSpeechRate} />
                <button
                  type="button"
                  onClick={() => {
                    const lastAi = [...messages].reverse().find(m => m.role === 'ai')
                    if (lastAi) speak(lastAi.text)
                  }}
                  aria-label="ฟังเสียงลูกค้าประโยคล่าสุด"
                  title="ฟังเสียงลูกค้าประโยคล่าสุด"
                >
                  <StudentIcon name="volume" size={18} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className={styles.messages} aria-live="polite">
              {messages.length === 0 && (
                <div className={styles.arrivalCard}>
                  <div className={styles.arrivalBadge}>
                    <span className={styles.arrivalDot} />
                    <span>GUEST ARRIVAL · ขั้นตอนที่ 1 ทักทายต้อนรับลูกค้า</span>
                  </div>
                  <h3 className={styles.arrivalTitle}>
                    Mr. Robert Smith กำลังเดินเข้ามาถึงหน้าร้านอาหาร
                  </h3>
                  <p className={styles.arrivalDesc}>
                    ตามมาตรฐานงานบริการสากล (5-Star Hospitality) พนักงานบริการต้องเป็นฝ่าย <strong>กล่าวทักทายต้อนรับลูกค้าก่อนเสมอ</strong><br />
                    กดปุ่มไมโครโฟนด้านล่างเพื่อ <strong>พูดสด</strong> หรือกดเลือกประโยคทักทายแนะนำเพื่อเริ่มการสนทนา
                  </p>
                  <div className={styles.arrivalPromptList}>
                    {INITIAL_GREETING_SUGGESTIONS.map((phrase, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={styles.arrivalPromptBtn}
                        onClick={() => useSuggestion(phrase)}
                      >
                        <span className={styles.arrivalPromptIcon}>💬</span>
                        <span>{phrase}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.aiMessage}`}
                >
                  <span>
                    {message.role === 'user' ? (user?.name ? `${user.name} (บริกร)` : 'พนักงานบริการ (บริกร)') : 'Customer (Mr. Smith)'}
                  </span>
                  <p>{message.text}</p>

                  {/* Customer Translation toggle */}
                  {message.role === 'ai' && message.translation && (
                    <div className={styles.messageMetaRow}>
                      <button
                        type="button"
                        className={styles.translationToggle}
                        onClick={() => toggleMessageTranslation(index)}
                      >
                        {message.showTranslation ? 'ซ่อนคำแปลไทย' : '🌐 ดูคำแปลไทย'}
                      </button>
                      <button
                        type="button"
                        className={styles.translationToggle}
                        onClick={() => speak(message.text)}
                        title="ฟังเสียงประโยคนี้"
                      >
                        🔊 ฟังเสียง
                      </button>
                    </div>
                  )}

                  {message.role === 'ai' && message.showTranslation && message.translation && (
                    <div className={styles.translationBox}>
                      {message.translation}
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className={`${styles.message} ${styles.aiMessage}`}>
                  <span>Customer (Mr. Smith)</span>
                  <p className={styles.typing}>Mr. Smith กำลังตอบกลับ...</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Phrases Scaffolding */}
            {suggestedResponses.length > 0 && !typing && (
              <div className={styles.suggestionsWrap}>
                <div className={styles.suggestionsHeader}>
                  <span>💡 ประโยคแนะนำสำหรับบริกร (กดเพื่อนำไปตอบ):</span>
                  <span className={styles.stageBadge}>{stage}</span>
                </div>
                <div className={styles.suggestionsList}>
                  {suggestedResponses.map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={styles.suggestionChip}
                      onClick={() => useSuggestion(phrase)}
                      title="กดเพื่อนำประโยคนี้ไปใส่ในช่องตอบ"
                    >
                      <span className={styles.suggestionIcon}>💬</span>
                      <span>{phrase}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Composer */}
            <form
              className={styles.composer}
              onSubmit={event => {
                event.preventDefault()
                void sendMessage()
              }}
            >
              <button
                type="button"
                className={`${styles.micButton} ${listening ? styles.listening : ''}`}
                onClick={toggleSpeech}
                aria-label={listening ? 'หยุดรับเสียง' : 'ตอบด้วยเสียงภาษาอังกฤษ'}
                title={listening ? 'กำลังรับเสียง...' : 'กดเพื่อตอบด้วยเสียงภาษาอังกฤษ'}
              >
                <StudentIcon name="mic" size={18} />
              </button>
              <input
                value={input}
                onChange={event => setInput(event.target.value)}
                placeholder={
                  listening
                    ? 'กำลังฟังเสียงของคุณ (พูดภาษาอังกฤษได้เลย)...'
                    : messages.length === 0
                    ? 'กดไมค์พูดทักทายลูกค้า หรือพิมพ์ "Good evening, sir! Welcome..."'
                    : 'พิมพ์หรือเลือกคำตอบภาษาอังกฤษ...'
                }
                maxLength={1000}
                disabled={typing}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={!input.trim() || typing}
                aria-label="ส่งคำตอบ"
                title="ส่งคำตอบ"
              >
                <StudentIcon name="arrowRight" size={18} />
              </button>
            </form>
          </section>
        </div>
      </main>
      <StudentFINENav />
    </>
  )
}
