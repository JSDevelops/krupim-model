'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import StudentFINENav from '@/components/StudentFINENav'

interface Scenario {
  id: string
  title: string
  titleTh: string
  role: string
  desc: string
  vocab: { word: string; ph: string; meaning: string; emoji: string }[]
  sentences: string[]
}

const defaultScenarios: Scenario[] = [
  {
    id: 's1',
    title: 'Table Setting Challenge',
    titleTh: 'แข่งจัดโต๊ะอาหาร',
    role: 'Food & Beverage Staff',
    desc: 'ฝึกทักษะการจัดโต๊ะอาหารแบบตะวันตกที่เป็นทางการ (Formal Western Course) การจัดลำดับมีด ส้อม แก้วน้ำ และการพับผ้าเช็ดปากตามมาตรฐานโรงแรมระดับ 6 ดาว เพื่อต้อนรับลูกค้าคนสำคัญ',
    vocab: [
      { word: 'Cutlery', ph: '/ˈkʌtləri/', meaning: 'เครื่องมือรับประทานอาหาร (มีด, ส้อม, ช้อน)', emoji: '🍴' },
      { word: 'Glassware', ph: '/ˈɡlɑːsweə(r)/', meaning: 'เครื่องแก้ว (แก้วน้ำ, แก้วไวน์)', emoji: '🍷' },
      { word: 'Napkin', ph: '/ˈnæpkɪn/', meaning: 'ผ้าเช็ดปาก', emoji: '🧻' },
      { word: 'Outside-In', ph: '/ˌaʊtˈsaɪd ɪn/', meaning: 'การใช้งานจากด้านนอกเข้าหาด้านใน', emoji: '🍽️' },
    ],
    sentences: [
      'Good evening, ladies and gentlemen. Welcome to our fine dining restaurant.',
      'I will be serving you tonight. If you need anything, please let me know.',
      'Allow me to explain the cutlery setting. We start using from the outside in.',
    ],
  },
]

export default function NavigatePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>(defaultScenarios)
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'vocab' | 'sentences'>('overview')
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [speaking, setSpeaking] = useState<string | null>(null)
  
  // States สำหรับระบบฝึกพูดและประเมินผลการออกเสียง
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [practiceResults, setPracticeResults] = useState<Record<string, {
    score: number
    transcript: string
    wordStatus: { word: string; correct: boolean }[]
  }>>({})

  function startPractice(targetSentence: string, id: string) {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('เบราว์เซอร์ของคุณไม่รองรับระบบประเมินเสียงพูด โปรดใช้ Google Chrome')
      return
    }

    if (recordingId === id) {
      // กดซ้ำเพื่อหยุดบันทึก
      const rec = (window as any)._navigateRecognition
      if (rec) rec.stop()
      setRecordingId(null)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setRecordingId(id)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript || ''
      
      // ทำความสะอาดข้อความเปรียบเทียบคำต่อคำ
      const cleanTarget = targetSentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase()
      const cleanSpoken = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase()

      const targetWords = cleanTarget.split(/\s+/)
      const spokenWords = cleanSpoken.split(/\s+/)

      // ตรวจสอบคำศัพท์ทีละคำ
      const originalWords = targetSentence.split(/\s+/)
      const wordStatus = originalWords.map(word => {
        const cleanW = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase()
        const correct = spokenWords.includes(cleanW)
        return { word, correct }
      })

      // คำนวณคะแนนร้อยละ
      const correctCount = wordStatus.filter(w => w.correct).length
      const score = Math.round((correctCount / wordStatus.length) * 100)

      setPracticeResults(prev => ({
        ...prev,
        [id]: { score, transcript, wordStatus }
      }))
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error in practice', event.error)
      setRecordingId(null)
    }

    recognition.onend = () => {
      setRecordingId(null)
    }

    recognition.start()
    ;(window as any)._navigateRecognition = recognition
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lessonPlans')
      if (stored) {
        try {
          const plans = JSON.parse(stored)
          if (Array.isArray(plans) && plans.length > 0) {
            const mapped = plans.map((p: any, idx: number) => ({
              id: `plan-${idx}`,
              title: p.title || 'Lesson Challenge',
              titleTh: 'สถานการณ์จำลองตามแผนการสอน',
              role: 'F&B Service Staff',
              desc: p.objective || 'ฝึกทักษะการบริการอาหารตามแผนการเรียนรู้ของคุณครู',
              vocab: (p.vocabulary || []).map((v: any) => ({
                word: v.nameEn,
                ph: '/pronunciation/',
                meaning: v.name,
                emoji: v.emoji || '🍽️'
              })),
              sentences: p.practiceSentences || [
                'Welcome to our 6-star dining room.',
                'May I take your order, please?',
                'Certainly, I will be right back with your drinks.'
              ]
            }))
            setScenarios(mapped)
          }
        } catch (e) {}
      }
    }
  }, [])

  function speak(text: string, id: string) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = 'en-US'
      utt.rate = 0.85
      setSpeaking(id)
      utt.onend = () => setSpeaking(null)
      window.speechSynthesis.speak(utt)
    }
  }

  function flipCard(idx: number) {
    setFlippedCards(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx); else next.add(idx)
      return next
    })
  }

  if (activeScenario) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3EFE6', paddingBottom: 80 }}>
        
        {/* Scenario Detail Header */}
        <div style={{ 
          background: 'linear-gradient(160deg, #4A1A2A 0%, #7B2D3E 60%, #8B3A50 100%)', 
          padding: '52px 20px 0', 
          position: 'relative', 
          overflow: 'hidden' 
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: 'rgba(201,168,76,0.07)', borderRadius: '50%' }} />

          {/* ปุ่มย้อนกลับดีไซน์ใหม่สไตล์วงกลมกระจกฝ้าหรูหรา */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <button 
              onClick={() => setActiveScenario(null)} 
              style={{ 
                width: 40, height: 40,
                background: 'rgba(255,255,255,0.12)', 
                border: '1.5px solid rgba(255,255,255,0.25)', 
                color: '#C9A84C', 
                borderRadius: '50%', 
                cursor: 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 900,
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              title="ย้อนกลับ"
            >
              ‹
            </button>
            <span style={{ 
              background: 'rgba(201,168,76,0.18)', 
              border: '1px solid rgba(201,168,76,0.4)', 
              color: '#C9A84C', 
              fontSize: 10, 
              fontWeight: 800, 
              padding: '4px 12px', 
              borderRadius: 100, 
              letterSpacing: '0.8px'
            }}>N — NAVIGATE</span>
          </div>

          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>{activeScenario.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '0 0 8px', fontFamily: "'Kanit', sans-serif" }}>{activeScenario.titleTh}</p>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontSize: 10.5, fontWeight: 700, padding: '4px 12px', borderRadius: 100, display: 'inline-block', marginBottom: 16 }}>👔 บทบาท: {activeScenario.role}</span>

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
            {[
              { id: 'overview', label: 'ภาพรวม' },
              { id: 'vocab', label: `คำศัพท์ (${activeScenario.vocab.length})` },
              { id: 'sentences', label: `ประโยค (${activeScenario.sentences.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveView(t.id as any)} style={{ flex: 1, padding: '9px 4px', borderRadius: 8, border: 'none', background: activeView === t.id ? 'white' : 'transparent', cursor: 'pointer', fontSize: 11.5, fontWeight: 800, color: activeView === t.id ? '#4A1A2A' : 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-primary)' }}>{t.label}</button>
            ))}
          </div>
          <svg viewBox="0 0 500 28" style={{ display: 'block', marginTop: 4, width: '100%' }} preserveAspectRatio="none">
            <path d="M0 28 Q125 0 250 16 Q375 32 500 8 L500 28 Z" fill="#F3EFE6"/>
          </svg>
        </div>

        <div style={{ padding: '8px 16px 0' }}>
          {activeView === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'white', borderRadius: 20, padding: '16px', border: '1px solid #EDE9E1', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 10, color: '#A6882A', fontWeight: 800, marginBottom: 8, letterSpacing: '0.5px' }}>📋 รายละเอียดสถานการณ์</div>
                <p style={{ fontSize: 13, color: '#4A4138', lineHeight: 1.7, margin: 0 }}>{activeScenario.desc}</p>
              </div>
              <Link href="/simulation" style={{
                display: 'block', textDecoration: 'none',
                background: 'linear-gradient(135deg, #4A1A2A, #7B2D3E)',
                color: 'white', padding: '16px', borderRadius: 18,
                textAlign: 'center', fontWeight: 900, fontSize: 14.5,
                boxShadow: '0 8px 24px rgba(74,26,42,0.25)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🎭 เข้าห้องจำลองสถานการณ์
              </Link>
            </div>
          )}

          {activeView === 'vocab' && (
            <div>
              <p style={{ fontSize: 12, color: '#8C8272', margin: '0 0 12px' }}>💡 กดที่การ์ดเพื่อดูความหมายและฟังการออกเสียง</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {activeScenario.vocab.map((v, i) => {
                  const isFlipped = flippedCards.has(i)
                  return (
                    <div key={i} onClick={() => flipCard(i)} style={{ height: 130, perspective: '600px', cursor: 'pointer' }}>
                      <div style={{
                        width: '100%', height: '100%', position: 'relative',
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}>
                        {/* Front: แสดงรูปภาพชิ้นอุปกรณ์ (Emoji ใหญ่) */}
                        <div style={{
                          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          background: 'linear-gradient(135deg, #4A1A2A, #7B2D3E)',
                          borderRadius: 18, display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', padding: 12,
                          boxShadow: '0 4px 12px rgba(74,26,42,0.15)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                          <div style={{ 
                            width: 80, height: 80, borderRadius: 12, 
                            background: 'rgba(255,255,255,0.15)', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', 
                            overflow: 'hidden', marginBottom: 8,
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}>
                            {v.emoji && v.emoji.startsWith('data:image') ? (
                              <img src={v.emoji} alt={v.word} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: 52, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' }}>{v.emoji}</span>
                            )}
                          </div>
                          <div style={{ color: '#C9A84C', fontSize: 9, fontWeight: 800, letterSpacing: '0.8px' }}>แตะเพื่อพลิก 🔄</div>
                        </div>
                        
                        {/* Back: แสดงคำศัพท์ภาษาอังกฤษ คำอ่าน และปุ่มเล่นเสียง */}
                        <div style={{
                          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', 
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          background: 'white', borderRadius: 18, display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', padding: 10, 
                          border: '2.5px solid #7B2D3E',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}>
                          <div style={{ color: '#4A1A2A', fontWeight: 900, fontSize: 13.5, textAlign: 'center', lineHeight: 1.1 }}>{v.word}</div>
                          {v.ph && <div style={{ color: '#8C8272', fontSize: 9.5, marginTop: 2, fontFamily: 'monospace' }}>{v.ph}</div>}
                          <div style={{ color: '#7B2D3E', fontWeight: 700, fontSize: 11, textAlign: 'center', marginTop: 4 }}>{v.meaning}</div>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); speak(v.word, v.word) }} 
                            style={{ 
                              marginTop: 6, 
                              background: speaking === v.word ? '#4A1A2A' : '#FAE8EB', 
                              border: 'none', 
                              borderRadius: 100, 
                              color: speaking === v.word ? 'white' : '#7B2D3E', 
                              padding: '3px 10px', 
                              fontSize: 10, 
                              fontWeight: 800, 
                              cursor: 'pointer', 
                              fontFamily: 'var(--font-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            🔊 ฟังเสียง
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeView === 'sentences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeScenario.sentences.map((s, i) => {
                const id = `sent-${i}`
                const result = practiceResults[id]
                const isRec = recordingId === id

                return (
                  <div key={i} style={{ background: 'white', borderRadius: 18, padding: '16px', border: '1px solid #EDE9E1', boxShadow: '0 2px 10px rgba(74,26,42,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#4A1A2A,#7B2D3E)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        
                        {/* ประโยคต้นแบบ */}
                        <p style={{ fontSize: 14.5, fontWeight: 700, color: '#1A1410', margin: '0 0 12px', lineHeight: 1.5, fontStyle: 'italic' }}>
                          "{s}"
                        </p>

                        {/* ปุ่มฟังและปุ่มบันทึกเสียงพูดตาม */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: result || isRec ? 12 : 0 }}>
                          <button 
                            onClick={() => speak(s, `play-${i}`)} 
                            style={{ 
                              flex: 1, padding: '10px', borderRadius: 12, 
                              border: speaking === `play-${i}` ? 'none' : '1.5px solid #4A1A2A', 
                              background: speaking === `play-${i}` ? '#4A1A2A' : 'transparent', 
                              color: speaking === `play-${i}` ? 'white' : '#4A1A2A', 
                              fontSize: 11.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)' 
                            }}
                          >
                            🔊 {speaking === `play-${i}` ? 'กำลังออกเสียง...' : 'ฟังเจ้าของภาษา'}
                          </button>
                          
                          <button 
                            onClick={() => startPractice(s, id)} 
                            style={{ 
                              flex: 1, padding: '10px', borderRadius: 12, border: 'none', 
                              background: isRec ? '#FF6B6B' : 'linear-gradient(135deg,#4A1A2A,#7B2D3E)', 
                              color: 'white', fontSize: 11.5, fontWeight: 800, cursor: 'pointer', 
                              fontFamily: 'var(--font-primary)',
                              animation: isRec ? 'pulse-mic 1.2s infinite' : 'none'
                            }}
                          >
                            {isRec ? '🛑 กำลังฟังเสียง...' : '🎤 กดแล้วพูดตาม'}
                          </button>
                        </div>

                        {/* การประเมินผลออกเสียงแยกคำศัพท์ */}
                        {result && (
                          <div style={{ 
                            background: '#FDFCF7', 
                            border: '1.5px solid #EDE9E1', 
                            borderRadius: 14, 
                            padding: '12px', 
                            marginTop: 8,
                            animation: 'fadeInUp 0.3s ease'
                          }}>
                            {/* ส่วนแสดงคะแนน */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #EDE9E1', paddingBottom: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#8C8272' }}>🔊 ผลวิเคราะห์การออกเสียง</span>
                              <span style={{ 
                                fontSize: 12, 
                                fontWeight: 900, 
                                color: result.score >= 80 ? '#1E4D3A' : result.score >= 50 ? '#C9A84C' : '#8B2635',
                                background: result.score >= 80 ? '#EAF3EE' : result.score >= 50 ? '#FFF8E1' : '#FAE8EB',
                                padding: '3px 10px',
                                borderRadius: 100
                              }}>
                                คะแนน: {result.score}%
                              </span>
                            </div>
                            
                            {/* ไฮไลท์สีคำศัพท์รายคำ */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', lineHeight: 1.6 }}>
                              {result.wordStatus.map((w, wIdx) => (
                                <span 
                                  key={wIdx} 
                                  style={{ 
                                    fontSize: 13, 
                                    fontWeight: 700, 
                                    color: w.correct ? '#1E4D3A' : '#FF4D4D',
                                    background: w.correct ? 'rgba(30,77,58,0.06)' : 'rgba(255,77,77,0.06)',
                                    padding: '1px 6px',
                                    borderRadius: 6,
                                    textDecoration: w.correct ? 'none' : 'line-through'
                                  }}
                                  title={w.correct ? 'ออกเสียงถูกต้อง' : 'ออกเสียงไม่ชัดเจนหรือขาดหาย'}
                                >
                                  {w.word}
                                </span>
                              ))}
                            </div>
                            
                            {/* แสดงข้อความจริงที่นักเรียนพูด */}
                            <div style={{ fontSize: 10, color: '#8C8272', marginTop: 8, fontStyle: 'italic' }}>
                              เสียงที่ตรวจพบ: "{result.transcript}"
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        <StudentFINENav />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F3EFE6', paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(160deg, #4A1A2A 0%, #7B2D3E 60%, #8B3A50 100%)', padding: '52px 20px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: 'rgba(201,168,76,0.07)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <Link href="/student/explore" style={{
            width: 40, height: 40,
            background: 'rgba(255,255,255,0.12)', 
            border: '1.5px solid rgba(255,255,255,0.25)', 
            color: '#C9A84C', 
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 900,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            ‹
          </Link>
          <span style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100, display: 'inline-block' }}>N — FINE MODEL</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>Navigate</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '0 0 20px', fontFamily: "'Kanit', sans-serif" }}>จำลองสถานการณ์และฝึกคำศัพท์</p>
        </div>
        <svg viewBox="0 0 500 28" style={{ display: 'block', marginTop: 4, width: '100%' }} preserveAspectRatio="none">
          <path d="M0 28 Q125 0 250 16 Q375 32 500 8 L500 28 Z" fill="#F3EFE6"/>
        </svg>
      </div>

      <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ fontSize: 13, fontWeight: 800, color: '#4A1A2A', margin: 0 }}>🎭 เลือกสถานการณ์จำลอง</h2>
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            onClick={() => { setActiveScenario(sc); setActiveView('overview') }}
            style={{
              background: 'white', borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(74,26,42,0.10)', border: '1px solid #EDE9E1', cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <div style={{ background: 'linear-gradient(135deg, #4A1A2A, #7B2D3E)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#C9A84C', fontSize: 10, fontWeight: 800, marginBottom: 4 }}>SCENARIO</div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{sc.title}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 22, width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🎭</div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#4A4138', marginBottom: 6 }}>{sc.titleTh}</div>
              <p style={{ fontSize: 11.5, color: '#8C8272', margin: '0 0 12px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>{sc.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <StudentFINENav />

      <style>{`
        @keyframes pulse-mic {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.6); }
          70% { transform: scale(1.06); box-shadow: 0 0 0 8px rgba(255, 107, 107, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
