'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import StudentFINENav from '@/components/StudentFINENav'
import StudentIcon from '@/app/student/StudentIcon'
import { useRole } from '@/context/RoleContext'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import styles from './simulation.module.css'

// ─── Types ────────────────────────────────────────────────────
type Message = { role: 'user' | 'ai'; text: string }

type EvalResult = {
  feedback: string
  suggestions?: string[]
  score: number
  knowledge: number
  skills: number
  attitude: number
  competency: number
}

type LearningScenario = {
  id: string
  title: string
  titleTh: string
  description: string
  sentences: string[]
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

// ─── Constants ───────────────────────────────────────────────
const DEFAULT_SCENARIO_ID = '44444444-4444-4444-4444-444444444441'
const TIME_LIMIT = 600 // 10 minutes

const DEFAULT_SCENARIO: LearningScenario = {
  id: DEFAULT_SCENARIO_ID,
  title: 'Fine Dining Restaurant',
  titleTh: 'ฝึกสถานการณ์ร้านอาหารระดับ 5 ดาว',
  description: 'รับบทพนักงานบริการ ฝึกทักทาย จัดที่นั่ง แนะนำเมนู และรับรายการเป็นภาษาอังกฤษ',
  sentences: [
    'Good evening! We have a reservation for two under Smith.',
    'Could we have a table by the window, please?',
    'What would you recommend for tonight?',
    "I'll have the grilled salmon and a glass of white wine, please.",
    'Thank you. The service was excellent.',
  ],
}

const CRITERIA = [
  { label: 'การทักทายและการพูดจา', score: 20, icon: 'message' as const, color: '#39745d' },
  { label: 'ความถูกต้องของภาษา', score: 30, icon: 'book' as const, color: '#4d7896' },
  { label: 'การแนะนำและรับรายการ', score: 30, icon: 'task' as const, color: '#9a6e2b' },
  { label: 'มารยาทงานบริการ', score: 20, icon: 'award' as const, color: '#915363' },
]

const METRIC_COLORS: Record<string, string> = {
  knowledge: '#4d7896',
  skills: '#39745d',
  attitude: '#9a6e2b',
  competency: '#7b5083',
}

const METRIC_LABELS: Record<string, string> = {
  knowledge: 'ความถูกต้องของภาษา',
  skills: 'ทักษะการสื่อสาร',
  attitude: 'มารยาทบริการ',
  competency: 'ความสำเร็จของสถานการณ์',
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

// ─── Inner component (needs useSearchParams inside Suspense) ──
function SimulationContent() {
  const searchParams = useSearchParams()
  const { user } = useRole()

  // Derive scenarioId from URL — no setState needed
  const scenarioId = useMemo(
    () => searchParams.get('scenario')?.trim() || DEFAULT_SCENARIO_ID,
    [searchParams],
  )

  // Phase
  const [phase, setPhase] = useState<'intro' | 'session' | 'result'>('intro')

  // Session state
  const [scenario, setScenario] = useState<LearningScenario>(DEFAULT_SCENARIO)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [scriptIndex, setScriptIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)

  // Result state
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState<EvalResult | null>(null)

  // Refs
  const messagesRef = useRef<Message[]>([])
  const recognitionRef = useRef<Recognition | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const finishedRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages }, [messages])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, typing])

  // Cleanup on unmount
  useEffect(() => () => {
    recognitionRef.current?.stop()
    window.speechSynthesis?.cancel()
  }, [])

  // Load scenario from URL param — scenarioId already derived above
  useEffect(() => {
    if (scenarioId === DEFAULT_SCENARIO_ID) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const response = await authenticatedFetch('/api/student/navigate', { signal: controller.signal })
        if (!response.ok) return
        const payload = await response.json() as { scenarios?: LearningScenario[] }
        const found = payload.scenarios?.find(item => item.id === scenarioId)
        if (found) setScenario(found)
      } catch {
        // keep default scenario
      }
    }, 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [scenarioId])

  // TTS helper
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    const voices = window.speechSynthesis.getVoices()
    utterance.voice =
      voices.find(v => v.lang.startsWith('en') && /Google|Natural/.test(v.name)) ||
      voices.find(v => v.lang.startsWith('en')) ||
      null
    window.speechSynthesis.speak(utterance)
  }, [])

  // Finish & evaluate
  const finishSimulation = useCallback(async () => {
    if (finishedRef.current) return
    finishedRef.current = true
    recognitionRef.current?.stop()
    setPhase('result')
    setEvaluating(true)
    try {
      const response = await authenticatedFetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesRef.current, scenario_id: scenarioId }),
      })
      const payload = await response.json() as Record<string, unknown>
      if (!response.ok) throw new Error(String(payload.error || 'ประเมินผลไม่สำเร็จ'))
      setResult({
        feedback: String(payload.feedback || 'ฝึกซ้อมได้ดี ควรทบทวนประโยคบริการอย่างสม่ำเสมอ'),
        suggestions: Array.isArray(payload.suggestions) ? (payload.suggestions as string[]) : [],
        score: Number(payload.score ?? 0),
        knowledge: Number(payload.knowledge ?? 0),
        skills: Number(payload.skills ?? 0),
        attitude: Number(payload.attitude ?? 0),
        competency: Number(payload.competency ?? 0),
      })
    } catch (error) {
      setResult({
        feedback: error instanceof Error ? error.message : 'ระบบบันทึกผลแล้ว แต่ไม่สามารถสร้างคำแนะนำเพิ่มเติมได้',
        suggestions: [],
        score: Math.min(100, 30 + messagesRef.current.filter(m => m.role === 'user').length * 8),
        knowledge: 0, skills: 0, attitude: 0, competency: 0,
      })
    } finally {
      setEvaluating(false)
    }
  }, [scenarioId])

  // Countdown timer
  useEffect(() => {
    if (phase !== 'session') return
    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timer)
          void finishSimulation()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [phase, finishSimulation])

  // ─── Actions ─────────────────────────────────────────────
  function startSimulation() {
    finishedRef.current = false
    setMessages([])
    setInput('')
    setScriptIndex(0)
    setTimeLeft(TIME_LIMIT)
    setResult(null)
    setPhase('session')
    setTyping(true)
    window.setTimeout(() => {
      const first = scenario.sentences[0] || 'Good evening! How may I help you?'
      setMessages([{ role: 'ai', text: first }])
      setScriptIndex(1)
      setTyping(false)
      speak(first)
    }, 600)
  }

  function sendMessage(value = input) {
    const text = value.trim()
    if (!text || phase !== 'session' || typing) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    if (scriptIndex >= scenario.sentences.length) {
      window.setTimeout(() => void finishSimulation(), 400)
      return
    }
    setTyping(true)
    window.setTimeout(() => {
      const reply = scenario.sentences[scriptIndex]
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
      setScriptIndex(i => i + 1)
      setTyping(false)
      speak(reply)
    }, 750)
  }

  function toggleSpeech() {
    if (listening) { recognitionRef.current?.stop(); return }
    const w = window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
    const Constructor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Constructor) return toast.warning('อุปกรณ์นี้ไม่รองรับการพิมพ์ด้วยเสียง กรุณาพิมพ์คำตอบแทน')
    const rec = new Constructor()
    rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1
    rec.onresult = event => {
      const transcript = event.results[0]?.[0]?.transcript || ''
      setInput(transcript)
      if (transcript) sendMessage(transcript)
    }
    rec.onerror = () => { setListening(false); toast.error('ไม่สามารถรับเสียงได้ กรุณาตรวจสอบสิทธิ์ไมโครโฟน') }
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    setListening(true)
    rec.start()
  }

  function resetSimulation() {
    finishedRef.current = false
    setPhase('intro')
    setMessages([])
    setInput('')
    setScriptIndex(0)
    setTimeLeft(TIME_LIMIT)
    setResult(null)
    setTyping(false)
    setListening(false)
  }

  const progress = scenario.sentences.length
    ? Math.round((scriptIndex / scenario.sentences.length) * 100)
    : 0

  // ─── INTRO SCREEN ─────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <>
        <main className={styles.page}>
          <div className={styles.shell}>
            {/* Hero */}
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                  <StudentIcon name="cube" size={14} />
                  N · Navigate simulation
                </span>
                <h1 className={styles.heroTitle}>{scenario.titleTh}</h1>
                <p className={styles.heroDesc}>{scenario.description}</p>
                <div className={styles.heroMeta}>
                  <span>ระดับเริ่มต้น</span>
                  <span>10 นาที</span>
                  <span>100 คะแนน</span>
                </div>
              </div>
              <div className={styles.restaurantVisual}>
                <span>{scenario.title}</span>
              </div>
            </section>

            {/* Cards */}
            <div className={styles.introGrid}>
              {/* Goal card */}
              <article className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.iconBox}><StudentIcon name="target" size={20} /></span>
                  <div>
                    <h2>เป้าหมายของสถานการณ์</h2>
                    <p>สื่อสารอย่างสุภาพและเป็นมืออาชีพ</p>
                  </div>
                </div>
                <p className={styles.cardText}>
                  {scenario.description || 'สื่อสารกับลูกค้าอย่างสุภาพ เลือกประโยคให้เหมาะกับบริบท และดำเนินบทสนทนาจนครบทุกช่วงบริการ'}
                </p>
                <button type="button" className={styles.startButton} onClick={startSimulation}>
                  เริ่มฝึกสถานการณ์ <StudentIcon name="arrowRight" size={16} />
                </button>
              </article>

              {/* Criteria card */}
              <article className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={`${styles.iconBox} ${styles.goldIcon}`}><StudentIcon name="chart" size={20} /></span>
                  <div>
                    <h2>เกณฑ์ประเมิน</h2>
                    <p>บันทึกผลลงแฟ้มสะสมงาน</p>
                  </div>
                </div>
                <div className={styles.criteria}>
                  {CRITERIA.map(item => (
                    <div className={styles.criterionRow} key={item.label}>
                      <span className={styles.criterionIcon} style={{ color: item.color }}>
                        <StudentIcon name={item.icon} size={16} />
                      </span>
                      <span>{item.label}</span>
                      <strong>{item.score}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <Link href="/student/navigate" className={styles.backLink}>
              <StudentIcon name="arrowLeft" size={15} />
              กลับไปเลือกสถานการณ์
            </Link>
          </div>
        </main>
        <StudentFINENav />
      </>
    )
  }

  // ─── RESULT SCREEN ────────────────────────────────────────
  if (phase === 'result') {
    const score = result?.score ?? 0
    const scorePercent = `${Math.round(score * 3.6)}deg`

    return (
      <>
        <main className={styles.resultPage}>
          <article className={styles.resultCard}>
            <span className={styles.resultIcon}><StudentIcon name="award" size={28} /></span>
            <span className={styles.eyebrow} style={{ display: 'flex', justifyContent: 'center', margin: '0 auto' }}>
              Session completed
            </span>
            <h1>จบสถานการณ์จำลองแล้ว</h1>

            {evaluating ? (
              <div className={styles.evaluating}>
                <StudentIcon name="refresh" size={22} />
                <span>กำลังประเมินและบันทึกผล</span>
              </div>
            ) : (
              <>
                {/* Score ring */}
                <div
                  className={styles.scoreRing}
                  style={{ '--score': scorePercent } as React.CSSProperties}
                >
                  <div>
                    <strong>{score}</strong>
                    <small>/ 100</small>
                  </div>
                </div>

                {/* Breakdown bars */}
                {result && (result.knowledge > 0 || result.skills > 0) && (
                  <div className={styles.breakdown}>
                    {(['knowledge', 'skills', 'attitude', 'competency'] as const).map(key => (
                      <div className={styles.metricRow} key={key}>
                        <div className={styles.metricTop}>
                          <span>{METRIC_LABELS[key]}</span>
                          <strong>{result[key]}</strong>
                        </div>
                        <div className={styles.metricTrack}>
                          <div
                            className={styles.metricBar}
                            style={{ width: `${result[key]}%`, background: METRIC_COLORS[key] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Feedback */}
                {result?.feedback && (
                  <div className={styles.feedbackBlock}>
                    <StudentIcon name="message" size={18} />
                    <p>{result.feedback}</p>
                  </div>
                )}

                {/* Suggestions */}
                {result?.suggestions && result.suggestions.length > 0 && (
                  <ul className={styles.suggestionsList}>
                    {result.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}

                {/* Actions */}
                <div className={styles.resultActions}>
                  <button type="button" className={styles.startButton} onClick={resetSimulation}>
                    <StudentIcon name="refresh" size={15} />
                    ฝึกอีกครั้ง
                  </button>
                  <Link className={styles.secondaryButton} href="/student/exhibit">
                    <StudentIcon name="exhibit" size={15} />
                    ดูผลการเรียน
                  </Link>
                </div>
              </>
            )}
          </article>
        </main>
        <StudentFINENav />
      </>
    )
  }

  // ─── SESSION SCREEN ───────────────────────────────────────
  return (
    <>
      <main className={styles.page}>
        <div className={styles.shell}>
          {/* Header */}
          <header className={styles.sessionHeader}>
            <div>
              <span className={styles.sessionEyebrow}>Navigate · Simulation</span>
              <h1 className={styles.sessionTitle}>{scenario.title}</h1>
            </div>
            <div className={styles.sessionStats}>
              <span><StudentIcon name="clock" size={14} />{formatTime(timeLeft)}</span>
              <span>{progress}%</span>
            </div>
          </header>

          {/* Progress bar */}
          <div className={styles.progressTrack}>
            <span className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>

          {/* Chat panel */}
          <section className={styles.chatPanel}>
            {/* Customer bar */}
            <div className={styles.customerBar}>
              <div className={styles.customerAvatar}><StudentIcon name="user" size={22} /></div>
              <div>
                <strong>Mr. Smith</strong>
                <small>ลูกค้าจำลอง · {scenario.titleTh}</small>
              </div>
              <button
                type="button"
                className={styles.replayButton}
                onClick={() => {
                  const last = messages.findLast(m => m.role === 'ai')
                  if (last) speak(last.text)
                }}
                aria-label="ฟังประโยคล่าสุด"
              >
                <StudentIcon name="volume" size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className={styles.messages} aria-live="polite">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
                >
                  <span>{msg.role === 'user' ? (user?.name || 'นักเรียน') : 'Customer'}</span>
                  <p>{msg.text}</p>
                </div>
              ))}
              {typing && (
                <div className={`${styles.message} ${styles.aiMessage}`}>
                  <span>Customer</span>
                  <p className={styles.typingDots}>กำลังตอบกลับ…</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Composer */}
            <form
              className={styles.composer}
              onSubmit={e => { e.preventDefault(); sendMessage() }}
            >
              <button
                type="button"
                className={`${styles.micButton} ${listening ? styles.listening : ''}`}
                onClick={toggleSpeech}
                aria-label={listening ? 'หยุดรับเสียง' : 'ตอบด้วยเสียง'}
              >
                <StudentIcon name="mic" size={18} />
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="พิมพ์คำตอบภาษาอังกฤษ…"
                maxLength={1000}
                disabled={typing}
                aria-label="พิมพ์คำตอบ"
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={!input.trim() || typing}
                aria-label="ส่งคำตอบ"
              >
                <StudentIcon name="arrowRight" size={18} />
              </button>
            </form>
          </section>

          <button type="button" className={styles.finishLink} onClick={() => void finishSimulation()}>
            จบและประเมินผล
          </button>
        </div>
      </main>
      <StudentFINENav />
    </>
  )
}

// ─── Page export (wrapped in Suspense for useSearchParams) ───
export default function StudentSimulationPage() {
  return (
    <Suspense
      fallback={
        <>
          <main style={{ display: 'grid', placeItems: 'center', minHeight: '100svh', color: '#4a5e54', fontSize: 13 }}>
            กำลังเตรียมสถานการณ์…
          </main>
          <StudentFINENav />
        </>
      }
    >
      <SimulationContent />
    </Suspense>
  )
}
