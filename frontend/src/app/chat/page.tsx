'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import StudentFINENav from '@/components/StudentFINENav'
import StudentIcon from '@/app/student/StudentIcon'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import styles from './chat.module.css'

type Message = { role: 'user' | 'model'; text: string; timestamp: Date }
type RecognitionEvent = { results: ArrayLike<{ 0: { transcript: string } }> }
type Recognition = { lang: string; interimResults: boolean; onstart: (() => void) | null; onresult: ((event: RecognitionEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void; abort: () => void }
type RecognitionConstructor = new () => Recognition

const suggestions = ['วิธีทักทายลูกค้าภาษาอังกฤษ', 'อธิบาย Table Setting มาตรฐาน', 'ฝึกรับรายการอาหารภาษาอังกฤษ', 'วิธีแนะนำเมนูอาหาร', 'การจัดการข้อร้องเรียนลูกค้า']
const welcome: Message = { role: 'model', text: 'สวัสดีครับ ผมคือผู้ช่วยการเรียนรู้ FINE Model ถามเรื่องคำศัพท์ภาษาอังกฤษ การจัดโต๊ะ การรับรายการอาหาร หรือสถานการณ์งานบริการได้เลยครับ', timestamp: new Date() }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([welcome])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<Recognition | null>(null)

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get('q')
    const queryTimer = query ? window.setTimeout(() => setInput(query), 0) : null
    const speechWindow = window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
    const Constructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (Constructor) {
      const recognition = new Constructor(); recognition.lang = 'th-TH'; recognition.interimResults = false
      recognition.onstart = () => setListening(true)
      recognition.onresult = event => setInput(value => `${value} ${event.results[0]?.[0]?.transcript || ''}`.trim())
      recognition.onerror = () => { setListening(false); toast.error('ไม่สามารถรับเสียงได้ กรุณาตรวจสอบสิทธิ์ไมโครโฟน') }
      recognition.onend = () => setListening(false); recognitionRef.current = recognition
    }
    return () => { if (queryTimer !== null) window.clearTimeout(queryTimer); recognitionRef.current?.abort(); window.speechSynthesis?.cancel() }
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [messages, loading])

  function toggleMic() {
    const recognition = recognitionRef.current
    if (!recognition) return toast.warning('กรุณาใช้ Chrome หรือ Safari เวอร์ชันล่าสุดเพื่อใช้ไมโครโฟน')
    if (listening) recognition.stop(); else { window.speechSynthesis?.cancel(); recognition.start() }
  }

  function speak(text: string, index: number) {
    if (!window.speechSynthesis) return
    if (speakingIndex === index) { window.speechSynthesis.cancel(); setSpeakingIndex(null); return }
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = /[a-z]/i.test(text) ? 'en-US' : 'th-TH'; utterance.rate = .92; utterance.onend = () => setSpeakingIndex(null); utterance.onerror = () => setSpeakingIndex(null); setSpeakingIndex(index); window.speechSynthesis.speak(utterance)
  }

  async function sendMessage(value = input) {
    const text = value.trim()
    if (!text || loading) return
    const history = messages.map(message => ({ role: message.role, text: message.text }))
    const userMessage: Message = { role: 'user', text, timestamp: new Date() }
    setMessages(items => [...items, userMessage]); setInput(''); setLoading(true); window.speechSynthesis?.cancel(); setSpeakingIndex(null)
    try {
      const response = await authenticatedFetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history, session_type: 'learning_chat', topic: 'FINE Learning Assistant', session_id: sessionId }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'ผู้ช่วย AI ไม่สามารถตอบกลับได้')
      if (payload.session_id) setSessionId(String(payload.session_id))
      setMessages(items => [...items, { role: 'model', text: String(payload.response || 'ยังไม่มีคำตอบจากระบบ'), timestamp: new Date() }])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      toast.error(message); setMessages(items => [...items, { role: 'model', text: message, timestamp: new Date() }])
    } finally { setLoading(false) }
  }

  return (
    <>
      <main className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.header}>
            <Link href="/student/explore" className={styles.backButton} aria-label="กลับหน้าสำรวจ">
              <StudentIcon name="arrowLeft" size={18} />
            </Link>
            <span className={styles.assistantIcon}>
              <StudentIcon name="sparkles" size={21} />
            </span>
            <div>
              <h1>ผู้ช่วยการเรียนรู้ AI</h1>
              <p><span />พร้อมช่วยตอบคำถามงานบริการ</p>
            </div>
          </header>
          <section className={styles.chat} aria-label="บทสนทนากับผู้ช่วย AI">
            <div className={styles.messages} aria-live="polite">
              {messages.map((message, index) => (
                <article key={`${message.timestamp.getTime()}-${index}`} className={`${styles.messageRow} ${message.role === 'user' ? styles.userRow : styles.aiRow}`}>
                  {message.role === 'model' && (
                    <span className={styles.avatar}>
                      <StudentIcon name="sparkles" size={16} />
                    </span>
                  )}
                  <div className={styles.messageContent}>
                    <div className={styles.bubble}>
                      {message.text.split('\n').map((line, lineIndex) => (
                        <span key={lineIndex}>
                          {line}
                          {lineIndex < message.text.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    <div className={styles.messageMeta}>
                      <span>{message.timestamp.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.role === 'model' && (
                        <button type="button" onClick={() => speak(message.text, index)}>
                          <StudentIcon name={speakingIndex === index ? 'x' : 'volume'} size={13} />
                          {speakingIndex === index ? 'หยุด' : 'ฟัง'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
              {loading && (
                <div className={`${styles.messageRow} ${styles.aiRow}`}>
                  <span className={styles.avatar}>
                    <StudentIcon name="sparkles" size={16} />
                  </span>
                  <div className={styles.typing}>
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
            {messages.length < 3 && (
              <div className={styles.suggestions}>
                {suggestions.map(prompt => (
                  <button type="button" key={prompt} onClick={() => void sendMessage(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <form className={styles.composer} onSubmit={event => { event.preventDefault(); void sendMessage() }}>
              <button type="button" className={`${styles.micButton} ${listening ? styles.listening : ''}`} onClick={toggleMic} aria-label={listening ? 'หยุดรับเสียง' : 'พิมพ์ด้วยเสียง'}>
                <StudentIcon name="mic" size={18} />
              </button>
              <input value={input} onChange={event => setInput(event.target.value)} placeholder={listening ? 'กำลังรับเสียง...' : 'พิมพ์คำถามหรือประโยคที่ต้องการฝึก...'} maxLength={4000} />
              <button type="submit" className={styles.sendButton} disabled={!input.trim() || loading} aria-label="ส่งข้อความ">
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
