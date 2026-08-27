'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import StudentFINENav from '@/components/StudentFINENav'
import StudentIcon from '@/app/student/StudentIcon'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import styles from './live.module.css'

type Status = 'idle' | 'listening' | 'responding'
type RecognitionEvent = { results: ArrayLike<{ 0: { transcript: string } }> }
type Recognition = { lang: string; interimResults: boolean; maxAlternatives: number; onstart: (() => void) | null; onresult: ((event: RecognitionEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; abort: () => void }
type RecognitionConstructor = new () => Recognition

const examples = ['Good evening, sir. Welcome to FINE restaurant.', 'Do you have a reservation for tonight?', 'Certainly. Please follow me to your table.', 'Would you prefer red wine or white wine?']

export default function LivePage() {
  const [status, setStatus] = useState<Status>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const recognitionRef = useRef<Recognition | null>(null)

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'en-US'; utterance.rate = .88; window.speechSynthesis.speak(utterance)
  }, [])

  const respond = useCallback(async (text: string) => {
    try {
      const apiResponse = await authenticatedFetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `Act as a five-star restaurant customer. Reply naturally in English using only one or two short sentences to this service staff statement: "${text}"`, history: [], session_type: 'voice_coach', topic: 'Live Service Roleplay', session_id: sessionId }) })
      const payload = await apiResponse.json()
      if (!apiResponse.ok) throw new Error(payload.error || 'AI ไม่สามารถตอบกลับได้')
      const reply = String(payload.response || 'Could you repeat that, please?')
      if (payload.session_id) setSessionId(String(payload.session_id)); setResponse(reply); setStatus('idle'); speak(reply)
    } catch (cause) { const message = cause instanceof Error ? cause.message : 'ไม่สามารถเชื่อมต่อผู้ช่วย AI ได้'; setError(message); setStatus('idle'); toast.error(message) }
  }, [sessionId, speak])

  useEffect(() => {
    const speechWindow = window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
    const Constructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (Constructor) {
      const recognition = new Constructor(); recognition.lang = 'en-US'; recognition.interimResults = false; recognition.maxAlternatives = 1
      recognition.onstart = () => { setStatus('listening'); setError('') }
      recognition.onresult = event => { const text = event.results[0]?.[0]?.transcript || ''; setTranscript(text); setStatus('responding'); void respond(text) }
      recognition.onerror = () => { setError('ไม่ได้ยินเสียงพูด กรุณาตรวจสอบสิทธิ์ไมโครโฟนแล้วลองอีกครั้ง'); setStatus('idle') }
      recognition.onend = () => setStatus(value => value === 'listening' ? 'idle' : value)
      recognitionRef.current = recognition
    }
    return () => { recognitionRef.current?.abort(); window.speechSynthesis?.cancel() }
  }, [respond])

  function start() {
    window.speechSynthesis?.cancel()
    if (!recognitionRef.current) return toast.warning('กรุณาใช้ Chrome หรือ Safari เวอร์ชันล่าสุดเพื่อฝึกด้วยเสียง')
    try { recognitionRef.current.start() } catch { recognitionRef.current.abort(); window.setTimeout(() => recognitionRef.current?.start(), 250) }
  }

  return <><main className={styles.page}><div className={styles.shell}><header className={styles.header}><Link href="/student/interact" aria-label="กลับหน้าฝึกพูด"><StudentIcon name="arrowLeft" size={18} /></Link><div><span className={styles.eyebrow}>Real-time voice training</span><h1>AI Voice Coach</h1></div><span className={styles.statusPill}>{status === 'idle' ? 'พร้อมฝึก' : status === 'listening' ? 'กำลังฟัง' : 'กำลังตอบ'}</span></header><section className={styles.voiceStage}><div className={`${styles.rings} ${status !== 'idle' ? styles.activeRings : ''}`}><span /><span /><span /></div><button type="button" className={`${styles.voiceButton} ${styles[status]}`} onClick={status === 'idle' ? start : undefined} disabled={status !== 'idle'} aria-label="เริ่มพูดภาษาอังกฤษ"><StudentIcon name={status === 'responding' ? 'sparkles' : 'mic'} size={32} /></button><strong>{status === 'idle' ? 'แตะไมโครโฟนแล้วพูดภาษาอังกฤษ' : status === 'listening' ? 'กำลังฟังเสียงของคุณ' : 'ผู้ช่วย AI กำลังสร้างคำตอบ'}</strong><p>พูดหนึ่งประโยคต่อครั้ง ระบบจะตอบกลับในบทบาทลูกค้าร้านอาหาร</p>{error && <div className={styles.error}><StudentIcon name="info" size={16} />{error}</div>}</section><section className={styles.content}>{transcript || response ? <div className={styles.exchange}>{transcript && <article><span><StudentIcon name="user" size={15} />คุณพูด</span><p>{transcript}</p></article>}{response && <article className={styles.aiReply}><span><StudentIcon name="sparkles" size={15} />ลูกค้าตอบกลับ</span><p>{response}</p><div><button type="button" onClick={() => speak(response)}><StudentIcon name="volume" size={16} />ฟังซ้ำ</button><button type="button" onClick={start}><StudentIcon name="mic" size={16} />ตอบกลับ</button></div></article>}</div> : <div className={styles.examples}><div className={styles.sectionTitle}><span className={styles.iconBox}><StudentIcon name="message" /></span><div><h2>ประโยคแนะนำสำหรับเริ่มฝึก</h2><p>แตะประโยคเพื่อฟังตัวอย่าง</p></div></div>{examples.map((example, index) => <button type="button" key={example} onClick={() => speak(example)}><span>{String(index + 1).padStart(2, '0')}</span><p>{example}</p><StudentIcon name="volume" size={16} /></button>)}</div>}</section></div></main><StudentFINENav /></>
}
