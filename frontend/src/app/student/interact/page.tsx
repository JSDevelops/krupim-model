'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import InteractIcon from './InteractIcon'
import styles from './interact.module.css'

interface Prompt {
  en: string
  th: string
  context: string
}

interface WordCheck {
  word: string
  correct: boolean
}

type SpeechRecognitionInstance = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onstart: () => void
  onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void
  onerror: (event: { error?: string }) => void
  onend: () => void
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

const defaultPrompts: Prompt[] = [
  { en: 'Good evening! Welcome to our restaurant. Do you have a reservation?', th: 'ยินดีต้อนรับสู่ร้านอาหารของเรา คุณมีการจองโต๊ะไหมครับ?', context: 'การต้อนรับลูกค้าที่โต๊ะ' },
  { en: 'May I show you to your table, please?', th: 'ขออนุญาตพาท่านไปที่โต๊ะได้ไหมครับ?', context: 'การนำลูกค้าไปยังโต๊ะ' },
  { en: 'Here is the menu. Can I get you something to drink to start?', th: 'นี่คือเมนูครับ ขอนำเครื่องดื่มมาให้ก่อนได้ไหมครับ?', context: 'การมอบเมนูและรับออร์เดอร์' },
  { en: 'Are you ready to order, or do you need a few more minutes?', th: 'พร้อมจะสั่งอาหารแล้วหรือยังครับ หรือต้องการเวลาเพิ่มเติม?', context: 'การรับออร์เดอร์อาหาร' },
  { en: 'I apologize for the delay. Your order will be ready shortly.', th: 'ขออภัยในความล่าช้าครับ อาหารของท่านจะพร้อมเสิร์ฟเร็ว ๆ นี้', context: 'การขอโทษกรณีล่าช้า' },
  { en: 'Would you like to see the dessert menu?', th: 'ท่านต้องการดูเมนูของหวานไหมครับ?', context: 'การเสนอเมนูของหวาน' },
]

function cleanWord(value: string) {
  return value.toLocaleLowerCase('en').replace(/[^a-z0-9']/g, '')
}

function evaluateWords(target: string, spoken: string) {
  const spokenPool = spoken.split(/\s+/).map(cleanWord).filter(Boolean)
  const checked = target.split(/\s+/).map(word => {
    const normalized = cleanWord(word)
    const matchIndex = spokenPool.indexOf(normalized)
    if (matchIndex >= 0) spokenPool.splice(matchIndex, 1)
    return { word, correct: matchIndex >= 0 }
  })
  const correctCount = checked.filter(word => word.correct).length
  return {
    checked,
    score: checked.length ? Math.round((correctCount / checked.length) * 100) : 0,
  }
}

export default function InteractPage() {
  const [prompts, setPrompts] = useState<Prompt[]>(defaultPrompts)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [recording, setRecording] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [wordStatus, setWordStatus] = useState<WordCheck[]>([])
  const [transcript, setTranscript] = useState('')
  const [listLimit, setListLimit] = useState(8)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function loadPrompts() {
      try {
        const response = await authenticatedFetch('/api/student/interact', { signal: controller.signal })
        if (!response.ok) return
        const payload = await response.json() as { prompts?: Prompt[] }
        if (payload.prompts?.length) {
          setPrompts(payload.prompts)
          setCurrentIndex(0)
        }
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Unable to load lesson prompts:', error)
      }
    }
    void loadPrompts()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      recognitionRef.current?.stop()
      recognitionRef.current = null
    }
  }, [])

  const current = prompts[currentIndex] || defaultPrompts[0]
  const total = prompts.length
  const progress = total ? ((currentIndex + 1) / total) * 100 : 0
  const visiblePrompts = useMemo(() => prompts.slice(0, listLimit), [listLimit, prompts])

  function resetEvaluation() {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setRecording(false)
    setScore(null)
    setWordStatus([])
    setTranscript('')
  }

  function selectPrompt(index: number) {
    resetEvaluation()
    setCurrentIndex(Math.max(0, Math.min(index, total - 1)))
  }

  function speak() {
    if (!window.speechSynthesis) {
      toast.warning('เบราว์เซอร์นี้ยังไม่รองรับการอ่านออกเสียง')
      return
    }
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(current.en)
    utterance.lang = 'en-US'
    utterance.rate = 0.84
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  function startSpeechCheck() {
    if (recording) {
      recognitionRef.current?.stop()
      return
    }

    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.warning('เบราว์เซอร์นี้ยังไม่รองรับการประเมินเสียงพูด', { description: 'แนะนำให้ใช้งานผ่าน Google Chrome' })
      return
    }

    window.speechSynthesis?.cancel()
    setSpeaking(false)
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => {
      setRecording(true)
      setScore(null)
      setWordStatus([])
      setTranscript('')
    }
    recognition.onresult = event => {
      const spoken = event.results[0]?.[0]?.transcript || ''
      const result = evaluateWords(current.en, spoken)
      setTranscript(spoken)
      setWordStatus(result.checked)
      setScore(result.score)
      void authenticatedFetch('/api/student/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: result.score, sentence: current.en }),
      }).catch(error => console.warn('Unable to save pronunciation score:', error))
    }
    recognition.onerror = event => {
      console.warn('Speech recognition error:', event.error)
      setRecording(false)
    }
    recognition.onend = () => {
      setRecording(false)
      recognitionRef.current = null
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  const scoreDescription = score == null
    ? ''
    : score >= 90
      ? 'ออกเสียงได้ชัดเจนมาก'
      : score >= 75
        ? 'ทำได้ดี ลองเก็บคำที่ยังไม่ตรงอีกครั้ง'
        : 'ลองฟังต้นแบบแล้วฝึกช้าลงอีกครั้ง'

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}><InteractIcon name="sparkles" size={15} /> I — Interact</div>
            <h1 className={styles.title}>ฝึกฟังและพูดประโยคงานบริการ</h1>
            <p className={styles.subtitle}>ฟังสำเนียงต้นแบบ พูดตาม และตรวจความถูกต้องรายคำ เพื่อพัฒนาความมั่นใจในการสื่อสารกับผู้รับบริการ</p>
          </div>
        </section>

        <div className={styles.layout}>
          <section className={styles.card}>
            <div className={styles.progressRow}>
              <div className={styles.progressTrack} aria-label={`ความคืบหน้า ${Math.round(progress)} เปอร์เซ็นต์`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                <div className={styles.progressBar} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.counter}>{currentIndex + 1} / {total}</span>
            </div>

            <div className={styles.contextBar}>
              <span className={styles.contextText}>สถานการณ์: {current.context}</span>
              <span className={styles.number}>ประโยค {String(currentIndex + 1).padStart(2, '0')}</span>
            </div>

            <div className={styles.practiceBody}>
              <div className={`${styles.languageCard} ${styles.english}`}>
                <div className={styles.languageLabel}><InteractIcon name="message" size={15} /> ภาษาอังกฤษ</div>
                <p className={styles.sentence}>{current.en}</p>
              </div>

              <div className={`${styles.languageCard} ${styles.thai}`}>
                <div className={styles.languageLabel}><InteractIcon name="book" size={15} /> คำแปลภาษาไทย</div>
                <p className={styles.translation}>{current.th}</p>
              </div>

              <div className={styles.actions}>
                <button type="button" className={`${styles.button} ${styles.listenButton}`} onClick={speak}>
                  <InteractIcon name={speaking ? 'pause' : 'volume'} size={17} />
                  {speaking ? 'หยุดเสียงต้นแบบ' : 'ฟังเสียงต้นแบบ'}
                </button>
                <button type="button" className={`${styles.button} ${styles.recordButton} ${recording ? styles.recording : ''}`} onClick={startSpeechCheck}>
                  <InteractIcon name={recording ? 'pause' : 'mic'} size={17} />
                  {recording ? 'หยุดบันทึกเสียง' : 'พูดตามและประเมิน'}
                </button>
              </div>

              {score !== null && (
                <section className={styles.scorePanel} aria-live="polite">
                  <div className={styles.scoreHeader}>
                    <span className={styles.scoreIcon}><InteractIcon name={score >= 75 ? 'check' : 'refresh'} size={20} /></span>
                    <div className={styles.scoreCopy}><strong>ผลการประเมินการออกเสียง</strong><span>{scoreDescription}</span></div>
                    <span className={styles.scoreValue}>{score}%</span>
                  </div>
                  <div className={styles.words}>
                    {wordStatus.map((word, index) => <span className={`${styles.word} ${word.correct ? styles.correct : styles.incorrect}`} key={`${word.word}-${index}`}>{word.word}</span>)}
                  </div>
                  {transcript && <p className={styles.transcript}>ระบบได้ยิน: “{transcript}”</p>}
                </section>
              )}
            </div>

            <div className={styles.pager}>
              <button type="button" className={styles.navButton} disabled={currentIndex === 0} onClick={() => selectPrompt(currentIndex - 1)}>
                <InteractIcon name="arrowLeft" size={16} /> ก่อนหน้า
              </button>
              <button type="button" className={`${styles.navButton} ${styles.navPrimary}`} disabled={currentIndex >= total - 1} onClick={() => selectPrompt(currentIndex + 1)}>
                ถัดไป <InteractIcon name="arrowRight" size={16} />
              </button>
            </div>
          </section>

          <aside className={`${styles.card} ${styles.sideCard}`}>
            <header className={styles.sideHeader}>
              <span className={styles.sideIcon}><InteractIcon name="headphones" size={20} /></span>
              <div><h2>รายการประโยคฝึก</h2><p>เลือกสถานการณ์ที่ต้องการฝึกได้ทันที</p></div>
            </header>
            <div className={styles.list}>
              {visiblePrompts.map((prompt, index) => (
                <button type="button" className={`${styles.listButton} ${index === currentIndex ? styles.listActive : ''}`} key={`${prompt.en}-${index}`} onClick={() => selectPrompt(index)}>
                  <span className={styles.listNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.listText}><span className={styles.listContext}>{prompt.context}</span><span className={styles.listSentence}>{prompt.en}</span></span>
                </button>
              ))}
            </div>
            {listLimit < total && <button type="button" className={styles.moreButton} onClick={() => setListLimit(limit => limit + 8)}>แสดงเพิ่มอีก {Math.min(8, total - listLimit)} ประโยค</button>}
          </aside>
        </div>
      </div>
    </main>
  )
}
