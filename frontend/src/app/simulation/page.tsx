'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import StudentFINENav from '@/components/StudentFINENav'
import StudentIcon, { type StudentIconName } from '@/app/student/StudentIcon'
import { useRole } from '@/context/RoleContext'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import styles from './simulation.module.css'

type Message = { role: 'user' | 'ai'; text: string }
type Feedback = { text: string; score: number }
type RecognitionEvent = { results: ArrayLike<{ 0: { transcript: string } }> }
type Recognition = { lang: string; interimResults: boolean; maxAlternatives: number; onresult: ((event: RecognitionEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void }
type RecognitionConstructor = new () => Recognition

const DEFAULT_SCENARIO_ID = '44444444-4444-4444-4444-444444444441'
const TIME_LIMIT = 600
const defaultScripts = [
  'Good evening! We have a reservation for two under Smith.',
  'Could we have a table by the window, please?',
  'What would you recommend for tonight?',
  "I'll have the grilled salmon and a glass of white wine, please.",
  'Thank you. The service was excellent.',
]
type LearningScenario = { id: string; title: string; titleTh: string; description: string; sentences: string[] }
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
  const [scriptIndex, setScriptIndex] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO_ID)
  const [scenario, setScenario] = useState<LearningScenario | null>(null)
  const messageRef = useRef<Message[]>([])
  const scoreRef = useRef(0)
  const recognitionRef = useRef<Recognition | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messageRef.current = messages }, [messages])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [messages, typing])
  useEffect(() => () => { recognitionRef.current?.stop(); window.speechSynthesis?.cancel() }, [])
  useEffect(() => {
    const selectedId = new URLSearchParams(window.location.search).get('scenario')?.trim()
    if (!selectedId) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setScenarioId(selectedId)
      void authenticatedFetch('/api/student/navigate', { signal: controller.signal })
        .then(async response => response.ok ? response.json() as Promise<{ scenarios?: LearningScenario[] }> : null)
        .then(payload => setScenario(payload?.scenarios?.find(item => item.id === selectedId) || null))
        .catch(() => setScenario(null))
    }, 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [])

  const scripts = scenario?.sentences?.length ? scenario.sentences : defaultScripts

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'en-US'; utterance.rate = .9
    const voices = window.speechSynthesis.getVoices(); utterance.voice = voices.find(voice => voice.lang.startsWith('en') && /Google|Natural/.test(voice.name)) || voices.find(voice => voice.lang.startsWith('en')) || null
    window.speechSynthesis.speak(utterance)
  }, [])

  const finishSimulation = useCallback(async () => {
    if (finished) return
    setFinished(true); setEvaluating(true); recognitionRef.current?.stop()
    try {
      const response = await authenticatedFetch('/api/simulation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: messageRef.current, scenario_id: scenarioId }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'ประเมินผลไม่สำเร็จ')
      setFeedback({ text: String(payload.feedback || 'ฝึกซ้อมได้ดี ควรทบทวนประโยคบริการอย่างสม่ำเสมอ'), score: Number(payload.score ?? scoreRef.current) })
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : 'ระบบบันทึกผลแล้ว แต่ไม่สามารถสร้างคำแนะนำเพิ่มเติมได้', score: scoreRef.current })
    } finally { setEvaluating(false) }
  }, [finished, scenarioId])

  useEffect(() => {
    if (!started || finished) return
    const timer = window.setInterval(() => setTimeLeft(value => { if (value <= 1) { window.clearInterval(timer); void finishSimulation(); return 0 } return value - 1 }), 1000)
    return () => window.clearInterval(timer)
  }, [started, finished, finishSimulation])

  function startSimulation() {
    setStarted(true); setTyping(true)
    window.setTimeout(() => { const first = scripts[0]; setMessages([{ role: 'ai', text: first }]); setScriptIndex(1); setTyping(false); speak(first) }, 650)
  }

  function sendMessage(value = input) {
    const text = value.trim()
    if (!text || finished || typing) return
    setMessages(items => [...items, { role: 'user', text }]); setInput('')
    if (scriptIndex >= scripts.length) { window.setTimeout(() => void finishSimulation(), 400); return }
    setTyping(true)
    window.setTimeout(() => {
      const reply = scripts[scriptIndex]
      setMessages(items => [...items, { role: 'ai', text: reply }]); setScriptIndex(index => index + 1)
      setScore(value => Math.min(100, value + 18)); setTyping(false); speak(reply)
    }, 750)
  }

  function toggleSpeech() {
    if (listening) { recognitionRef.current?.stop(); return }
    const speechWindow = window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
    const Constructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Constructor) return toast.warning('อุปกรณ์นี้ไม่รองรับการพิมพ์ด้วยเสียง กรุณาพิมพ์คำตอบแทน')
    const recognition = new Constructor(); recognition.lang = 'en-US'; recognition.interimResults = false; recognition.maxAlternatives = 1
    recognition.onresult = event => { const transcript = event.results[0]?.[0]?.transcript || ''; setInput(transcript); if (transcript) sendMessage(transcript) }
    recognition.onerror = () => { setListening(false); toast.error('ไม่สามารถรับเสียงได้ กรุณาตรวจสอบสิทธิ์ไมโครโฟน') }
    recognition.onend = () => setListening(false); recognitionRef.current = recognition; setListening(true); recognition.start()
  }

  function resetSimulation() {
    setStarted(false); setFinished(false); setScriptIndex(0); setMessages([]); setInput(''); setScore(0); setTimeLeft(TIME_LIMIT); setFeedback(null); setTyping(false)
  }

  if (!started) return <><main className={styles.introPage}><div className={styles.introShell}><section className={styles.hero}><div className={styles.heroCopy}><span className={styles.eyebrow}><StudentIcon name="cube" size={15} />Navigate simulation</span><h1>{scenario?.title || 'ฝึกสถานการณ์ร้านอาหารระดับ 5 ดาว'}</h1><p>{scenario?.description || 'รับบทพนักงานบริการ ฝึกทักทาย จัดที่นั่ง แนะนำเมนู และรับรายการเป็นภาษาอังกฤษ'}</p><div className={styles.heroMeta}><span>ระดับเริ่มต้น</span><span>10 นาที</span><span>100 คะแนน</span></div></div><div className={styles.restaurantVisual}><span>{scenario?.titleTh || 'Fine dining room'}</span></div></section><section className={styles.introGrid}><article className={styles.card}><div className={styles.cardTitle}><span className={styles.iconBox}><StudentIcon name="target" /></span><div><h2>เป้าหมายของสถานการณ์</h2><p>{scenario?.titleTh || 'Greeting and seating'}</p></div></div><p className={styles.cardText}>{scenario?.description || 'สื่อสารกับลูกค้าอย่างสุภาพ เลือกประโยคให้เหมาะกับบริบท และดำเนินบทสนทนาจนครบทุกช่วงบริการ'}</p><button type="button" className={styles.startButton} onClick={startSimulation}>เริ่มฝึกสถานการณ์ <StudentIcon name="arrowRight" size={17} /></button></article><article className={styles.card}><div className={styles.cardTitle}><span className={`${styles.iconBox} ${styles.goldIcon}`}><StudentIcon name="chart" /></span><div><h2>เกณฑ์ประเมิน</h2><p>บันทึกผลลงแฟ้มสะสมงาน</p></div></div><div className={styles.criteria}>{criteria.map(item => <div key={item.label}><span className={styles.criterionIcon} style={{ color: item.tone }}><StudentIcon name={item.icon} size={16} /></span><span>{item.label}</span><strong>{item.score}</strong></div>)}</div></article></section><Link href="/student/navigate" className={styles.backLink}><StudentIcon name="arrowLeft" size={16} />กลับไปเลือกสถานการณ์</Link></div></main><StudentFINENav /></>

  if (finished) return <><main className={styles.resultPage}><section className={styles.resultCard}><span className={styles.resultIcon}><StudentIcon name="award" size={28} /></span><span className={styles.eyebrow}>Session completed</span><h1>จบสถานการณ์จำลองแล้ว</h1>{evaluating ? <div className={styles.evaluating}><StudentIcon name="refresh" size={22} /><span>กำลังประเมินและบันทึกผล</span></div> : <><div className={styles.resultScore}>{feedback?.score ?? score}<small>/ 100 คะแนน</small></div><div className={styles.feedback}><StudentIcon name="message" size={18} /><p>{feedback?.text}</p></div><div className={styles.resultActions}><button type="button" className={styles.startButton} onClick={resetSimulation}><StudentIcon name="refresh" size={16} />ฝึกอีกครั้ง</button><Link className={styles.secondaryButton} href="/student/exhibit">ดูผลการเรียน</Link></div></>}</section></main><StudentFINENav /></>

  const progress = Math.round((scriptIndex / scripts.length) * 100)
  return <><main className={styles.sessionPage}><div className={styles.sessionShell}><header className={styles.sessionHeader}><div><span className={styles.eyebrow}>Greeting and seating</span><h1>Restaurant Simulation</h1></div><div className={styles.sessionStats}><span><StudentIcon name="clock" size={15} />{formatTime(timeLeft)}</span><span>{progress}%</span></div></header><div className={styles.progressTrack}><span style={{ width: `${progress}%` }} /></div><section className={styles.chatPanel}><div className={styles.customer}><div className={styles.customerAvatar}><StudentIcon name="user" size={22} /></div><div><strong>Mr. Smith</strong><span>ลูกค้าจำลอง</span></div><button type="button" onClick={() => messages.at(-1)?.role === 'ai' && speak(messages.at(-1)?.text || '')} aria-label="ฟังประโยคล่าสุด"><StudentIcon name="volume" size={18} /></button></div><div className={styles.messages} aria-live="polite">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.aiMessage}`}><span>{message.role === 'user' ? user?.name || 'นักเรียน' : 'Customer'}</span><p>{message.text}</p></div>)}{typing && <div className={`${styles.message} ${styles.aiMessage}`}><span>Customer</span><p className={styles.typing}>กำลังตอบกลับ</p></div>}<div ref={chatEndRef} /></div><form className={styles.composer} onSubmit={event => { event.preventDefault(); sendMessage() }}><button type="button" className={`${styles.micButton} ${listening ? styles.listening : ''}`} onClick={toggleSpeech} aria-label={listening ? 'หยุดรับเสียง' : 'ตอบด้วยเสียง'}><StudentIcon name="mic" size={18} /></button><input value={input} onChange={event => setInput(event.target.value)} placeholder="พิมพ์คำตอบภาษาอังกฤษ..." maxLength={1000} disabled={typing} /><button type="submit" className={styles.sendButton} disabled={!input.trim() || typing} aria-label="ส่งคำตอบ"><StudentIcon name="arrowRight" size={18} /></button></form></section><button type="button" className={styles.finishButton} onClick={() => void finishSimulation()}>จบและประเมินผล</button></div></main><StudentFINENav /></>
}
