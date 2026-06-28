'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import StudentFINENav from '@/components/StudentFINENav'

interface Prompt {
  en: string
  th: string
  context: string
}

interface WordCheck {
  word: string
  correct: boolean
}

const defaultPrompts: Prompt[] = [
  { en: 'Good evening! Welcome to our restaurant. Do you have a reservation?', th: 'ยินดีต้อนรับสู่ร้านอาหารของเรา คุณมีการจองโต๊ะไหมครับ?', context: 'การต้อนรับลูกค้าที่โต๊ะ' },
  { en: 'May I show you to your table, please?', th: 'ขออนุญาตพาท่านไปที่โต๊ะได้ไหมครับ?', context: 'การนำลูกค้าไปยังโต๊ะ' },
  { en: 'Here is the menu. Can I get you something to drink to start?', th: 'นี่คือเมนูครับ ขอนำเครื่องดื่มมาให้ก่อนได้ไหมครับ?', context: 'การมอบเมนูและรับออร์เดอร์' },
  { en: 'Are you ready to order, or do you need a few more minutes?', th: 'พร้อมจะสั่งอาหารแล้วหรือยังครับ หรือต้องการเวลาเพิ่มเติม?', context: 'การรับออร์เดอร์อาหาร' },
  { en: 'I apologize for the delay. Your order will be ready shortly.', th: 'ขออภัยในความล่าช้าครับ อาหารของท่านจะพร้อมเสิร์ฟเร็วๆ นี้', context: 'การขอโทษกรณีล่าช้า' },
  { en: 'Would you like to see the dessert menu?', th: 'ท่านต้องการดูเมนูของหวานไหมครับ?', context: 'การเสนอเมนูของหวาน' },
]

export default function IInteractPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [wordStatus, setWordStatus] = useState<WordCheck[]>([])
  const [spokenTranscript, setSpokenTranscript] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('lessonPlans')
    if (stored) {
      try {
        const plans = JSON.parse(stored)
        if (Array.isArray(plans) && plans.length > 0) {
          const sentences = plans[0].sentences || []
          if (sentences.length > 0) {
            const parsed: Prompt[] = sentences.map((s: string) => ({
              en: s,
              th: 'ประโยคฝึกจากแผนการสอน',
              context: 'จากแผนการสอนของครู',
            }))
            setPrompts(parsed)
            return
          }
        }
      } catch (e) {}
    }
    setPrompts(defaultPrompts)
  }, [])

  const current = prompts[currentIdx]
  const total = prompts.length

  function speak(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = 'en-US'
      utt.rate = 0.82
      setSpeaking(true)
      utt.onend = () => setSpeaking(false)
      window.speechSynthesis.speak(utt)
    }
  }

  // ระบบตรวจจับเสียงพูดจริงเพื่อประเมินความถูกต้องแยกรายคำศัพท์
  function startSpeechCheck() {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('เบราว์เซอร์ของคุณไม่รองรับระบบประเมินเสียงพูด โปรดเปิดใช้บน Google Chrome')
      return
    }

    if (practiceMode) {
      const rec = (window as any)._interactRecognition
      if (rec) rec.stop()
      setPracticeMode(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setPracticeMode(true)
      setScore(null)
      setWordStatus([])
      setSpokenTranscript('')
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript || ''
      setSpokenTranscript(transcript)

      const cleanTarget = current.en.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase()
      const cleanSpoken = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase()

      const targetWords = cleanTarget.split(/\s+/)
      const spokenWords = cleanSpoken.split(/\s+/)

      // เปรียบเทียบตรวจความถูกต้องทีละคำ
      const originalWords = current.en.split(/\s+/)
      const checked: WordCheck[] = originalWords.map(word => {
        const cleanW = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase()
        const correct = spokenWords.includes(cleanW)
        return { word, correct }
      })

      setWordStatus(checked)

      const correctCount = checked.filter(w => w.correct).length
      const calculatedScore = Math.round((correctCount / checked.length) * 100)
      setScore(calculatedScore)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech check error', event.error)
      setPracticeMode(false)
    }

    recognition.onend = () => {
      setPracticeMode(false)
    }

    recognition.start()
    ;(window as any)._interactRecognition = recognition
  }

  function next() {
    setScore(null)
    setWordStatus([])
    setSpokenTranscript('')
    setCurrentIdx(p => Math.min(p + 1, total - 1))
  }
  function prev() {
    setScore(null)
    setWordStatus([])
    setSpokenTranscript('')
    setCurrentIdx(p => Math.max(p - 1, 0))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F3EFE6', paddingBottom: 80 }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(160deg, #1A2A40 0%, #243650 55%, #2D4A6E 100%)',
        padding: '52px 20px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: 'rgba(201,168,76,0.07)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.5px' }}>I — FINE MODEL</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', lineHeight: 1.2 }}>Interact</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '0 0 16px' }}>ฝึกประโยคและโต้ตอบกับ AI</p>
        </div>
        <svg viewBox="0 0 500 28" style={{ display: 'block', marginTop: 4, width: '100%' }} preserveAspectRatio="none">
          <path d="M0 28 Q125 0 250 16 Q375 32 500 8 L500 28 Z" fill="#F3EFE6"/>
        </svg>
      </div>

      <div style={{ padding: '8px 16px 0' }}>

        {prompts.length > 0 && current && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 4, background: '#EDE9E1', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ width: `${((currentIdx + 1) / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #1A2A40, #2D4A6E)', borderRadius: 100, transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontSize: 11, color: '#8C8272', fontWeight: 700, whiteSpace: 'nowrap' }}>{currentIdx + 1} / {total}</span>
            </div>

            {/* Main prompt card */}
            <div style={{
              background: 'white', borderRadius: 22, overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(26,42,64,0.12)', border: '1px solid #EDE9E1',
            }}>
              {/* Context tag */}
              <div style={{ background: 'linear-gradient(135deg, #1A2A40, #2D4A6E)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>สถานการณ์: {current.context}</span>
                <span style={{ fontSize: 10, color: '#C9A84C', fontWeight: 800 }}>#{currentIdx + 1}</span>
              </div>

              <div style={{ padding: '20px 18px' }}>
                {/* EN Sentence */}
                <div style={{ background: '#F0F4FF', borderRadius: 16, padding: '16px', marginBottom: 12, position: 'relative' }}>
                  <div style={{ fontSize: 10, color: '#2D4A6E', fontWeight: 800, marginBottom: 8, letterSpacing: '0.3px' }}>🇬🇧 ภาษาอังกฤษ</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#1A2A40', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>"{current.en}"</p>
                </div>

                {/* TH Translation */}
                <div style={{ background: '#FBF6E9', borderRadius: 16, padding: '14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: '#A6882A', fontWeight: 800, marginBottom: 6 }}>🇹🇭 คำแปลภาษาไทย</div>
                  <p style={{ fontSize: 13.5, color: '#4A4138', margin: 0, lineHeight: 1.6 }}>{current.th}</p>
                </div>

                {/* Score display with word highlights */}
                {score !== null && (
                  <div style={{
                    background: '#FDFCF7',
                    borderRadius: 18, padding: '16px', marginBottom: 16,
                    border: '1.5px solid #EDE9E1',
                    animation: 'fadeInUp 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EDE9E1', paddingBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 24 }}>{score >= 90 ? '🌟' : score >= 80 ? '✅' : '💪'}</span>
                        <div style={{ fontSize: 12, color: '#8C8272', fontWeight: 700 }}>ผลการวิเคราะห์การออกเสียง</div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: score >= 80 ? '#1E4D3A' : '#A6882A' }}>{score}%</div>
                    </div>

                    {/* Word status visualization */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', lineHeight: 1.6 }}>
                      {wordStatus.map((w, wIdx) => (
                        <span
                          key={wIdx}
                          style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: w.correct ? '#1E4D3A' : '#FF4D4D',
                            background: w.correct ? 'rgba(30,77,58,0.06)' : 'rgba(255,77,77,0.06)',
                            padding: '2px 8px',
                            borderRadius: 8,
                            textDecoration: w.correct ? 'none' : 'line-through'
                          }}
                        >
                          {w.word}
                        </span>
                      ))}
                    </div>

                    {spokenTranscript && (
                      <div style={{ fontSize: 11, color: '#8C8272', fontStyle: 'italic', marginTop: 4 }}>
                        เสียงของคุณที่ตรวจพบ: "{spokenTranscript}"
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={() => speak(current.en)}
                    style={{
                      padding: '12px', borderRadius: 12, border: speaking ? 'none' : '1.5px solid #1A2A40',
                      background: speaking ? 'linear-gradient(135deg,#1A2A40,#2D4A6E)' : 'transparent',
                      color: speaking ? 'white' : '#1A2A40', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)',
                    }}
                  >{speaking ? '🔊 กำลังพูด...' : '🔊 ฟังเสียง'}</button>

                  <button
                    onClick={startSpeechCheck}
                    style={{
                      padding: '12px', borderRadius: 12, border: 'none',
                      background: practiceMode ? '#FF6B6B' : 'linear-gradient(135deg, #1A2A40, #2D4A6E)',
                      color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)',
                      animation: practiceMode ? 'pulse-mic-blue 1.2s infinite' : 'none'
                    }}
                  >{practiceMode ? '🛑 กำลังฟังเสียง...' : '🎤 พูดตาม'}</button>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={prev}
                disabled={currentIdx === 0}
                style={{
                  flex: 1, padding: '13px', borderRadius: 14, border: '1.5px solid #EDE9E1',
                  background: 'white', color: currentIdx === 0 ? '#D8D2C6' : '#4A4138',
                  fontSize: 13, fontWeight: 700, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-primary)',
                }}
              >← ประโยคก่อนหน้า</button>
              <button
                onClick={next}
                disabled={currentIdx === total - 1}
                style={{
                  flex: 1, padding: '13px', borderRadius: 14, border: 'none',
                  background: currentIdx === total - 1 ? '#EDE9E1' : 'linear-gradient(135deg,#1A2A40,#2D4A6E)',
                  color: currentIdx === total - 1 ? '#8C8272' : 'white',
                  fontSize: 13, fontWeight: 700, cursor: currentIdx === total - 1 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-primary)',
                }}
              >ประโยคต่อไป →</button>
            </div>

            {/* Prompt list mini */}
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#1E4D3A', margin: '0 0 10px' }}>📋 รายการประโยคทั้งหมด</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {prompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIdx(i); setScore(null); setWordStatus([]); setSpokenTranscript('') }}
                    style={{
                      background: i === currentIdx ? 'linear-gradient(135deg,#1A2A40,#2D4A6E)' : 'white',
                      borderRadius: 12, padding: '10px 14px', border: i === currentIdx ? 'none' : '1px solid #EDE9E1',
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 11, color: i === currentIdx ? 'rgba(255,255,255,0.7)' : '#8C8272', fontWeight: 700, marginBottom: 2 }}>#{i + 1} · {p.context}</div>
                    <div style={{ fontSize: 12, color: i === currentIdx ? 'white' : '#4A4138', fontWeight: 700, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{p.en}"</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}


      </div>

      <StudentFINENav />

      <style>{`
        @keyframes pulse-mic-blue {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.6); }
          70% { transform: scale(1.04); box-shadow: 0 0 0 8px rgba(255, 107, 107, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
        }
        @keyframes pingRing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
