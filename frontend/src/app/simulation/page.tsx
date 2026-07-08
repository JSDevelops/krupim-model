'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import StudentFINENav from '@/components/StudentFINENav'
import { useRole } from '@/context/RoleContext'

interface Message { role: 'user' | 'ai'; text: string }

const scenario = {
  title: 'Restaurant Simulation',
  subtitle: 'สถานการณ์จำลองร้านอาหารระดับ 5 ดาว',
  stage: 'รับลูกค้าเข้าร้าน (Greeting & Seating)',
  stageNum: 3,
  totalStages: 5,
  maxScore: 100,
  timeLimit: 600,
  rubric: [
    { name: 'การทักทายและการพูดจา', max: 20, icon: '🤝' },
    { name: 'ความถูกต้องของไวยากรณ์', max: 30, icon: '💬' },
    { name: 'การนำเสนอเมนูและรับออร์เดอร์', max: 30, icon: '📋' },
    { name: 'มารยาทและบุคลิกภาพงานบริการ', max: 20, icon: '⭐' },
  ],
  // ลิงก์รูปภาพจำลองบรรยากาศร้านอาหารระดับ 5 ดาว
  restaurantImg: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600'
}

// รูปภาพลูกค้าชาวต่างชาติ (Premium Foreign Customer Profile)
const customerAvatarUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'

const simulationScripts = [
  { speaker: 'customer', text: 'Good evening! We have a reservation for two under Smith.' },
  { speaker: 'customer', text: 'Could we have a table by the window please?' },
  { speaker: 'customer', text: 'What would you recommend for tonight?' },
  { speaker: 'customer', text: "I'll have the Grilled Salmon, please. And a glass of white wine." },
  { speaker: 'customer', text: 'Thank you, that was excellent!' },
]

export default function SimulationPage() {
  const { user } = useRole()
  const [started, setStarted] = useState(false)
  const [scriptIdx, setScriptIdx] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(scenario.timeLimit)
  const [feedback, setFeedback] = useState<any>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [finished, setFinished] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  function speak(text: string) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel() // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
        || voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural'))
        || voices.find(v => v.lang.startsWith('en'))
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (!started || finished) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); finishSim(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [started, finished])

  function startSim() {
    setStarted(true)
    setIsTyping(true)
    setTimeout(() => {
      const firstText = simulationScripts[0].text
      setMessages([{ role: 'ai', text: firstText }])
      speak(firstText)
      setScriptIdx(1)
      setIsTyping(false)
    }, 1200)
  }

  function handleSend() {
    if (!input.trim() || finished) return
    const userText = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setInput('')

    if (scriptIdx < simulationScripts.length) {
      setIsTyping(true)
      setTimeout(() => {
        const nextText = simulationScripts[scriptIdx].text
        setMessages(prev => [...prev, { role: 'ai', text: nextText }])
        speak(nextText)
        setScriptIdx(i => i + 1)
        setScore(s => Math.min(100, s + Math.floor(Math.random() * 8) + 12))
        setIsTyping(false)
      }, 1400)
    } else {
      finishSim()
    }
  }

  async function finishSim() {
    setFinished(true)
    setEvaluating(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://krupim-model-production.up.railway.app'
      const resp = await fetch(`${backendUrl}/api/simulation/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages.map(m => ({ role: m.role, text: m.text })), 
          score,
          student_id: user?.id || 'student-001',
          scenario_id: '44444444-4444-4444-4444-444444444441'
        })
      })
      const data = await resp.json()
      setFeedback({ text: data.feedback, score: data.score })
    } catch {
      setFeedback({ text: 'ทำได้ดีมากครับ! ฝึกซ้อมต่อไปเพื่อพัฒนาทักษะการสื่อสารภาษาอังกฤษในงานบริการ', score })
    }
    setEvaluating(false)
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  function resetSim() {
    setStarted(false); setFinished(false); setMessages([])
    setScore(0); setTimeLeft(600); setFeedback(null); setScriptIdx(0)
  }

  const timePercent = (timeLeft / scenario.timeLimit) * 100
  const timeColor = timeLeft > 120 ? '#1E4D3A' : timeLeft > 60 ? '#C9A84C' : '#8B2635'

  /* ── INTRO SCREEN ────────────────────────────── */
  if (!started) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#F5F0E8 0%,#EDE8DC 100%)', paddingBottom: 84 }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(160deg,#102B1F 0%,#1E4D3A 65%,#2A6B52 100%)',
          padding: '52px 20px 0',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, background: 'rgba(201,168,76,0.08)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: 40, left: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 20 }}>
            {/* Plate icon */}
            <div style={{
              width: 88, height: 88,
              background: 'rgba(255,255,255,0.10)',
              borderRadius: '50%',
              border: '2px solid rgba(201,168,76,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 44, margin: '0 auto 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}>🍽️</div>

            {/* Badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ background: 'rgba(201,168,76,0.20)', border: '1px solid rgba(201,168,76,0.45)', color: '#C9A84C', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100, letterSpacing: '0.5px' }}>🎭 ROLE PLAY</span>
              <span style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>BEGINNER</span>
            </div>

            <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 6px', fontFamily: "'Playfair Display',serif", letterSpacing: '-0.3px' }}>
              {scenario.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 12, margin: 0 }}>{scenario.subtitle}</p>
          </div>

          <svg viewBox="0 0 500 32" style={{ display: 'block', width: '100%', marginTop: 4 }} preserveAspectRatio="none">
            <path d="M0 32 Q125 4 250 20 Q375 36 500 12 L500 32 Z" fill="#F5F0E8"/>
          </svg>
        </div>

        <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Restaurant Environment Image Card */}
          <div style={{
            width: '100%', height: 160, borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 6px 18px rgba(16,43,31,0.08)', position: 'relative',
            border: '1.5px solid rgba(201,168,76,0.2)'
          }}>
            <img 
              src={scenario.restaurantImg} 
              alt="Luxury Restaurant Environment" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 10%, rgba(0,0,0,0.1) 80%)',
              display: 'flex', alignItems: 'flex-end', padding: '12px 16px'
            }}>
              <div>
                <div style={{ color: '#C9A84C', fontSize: 10, fontWeight: 800, letterSpacing: '0.5px', marginBottom: 2 }}>ENVIRONMENT SIMULATION</div>
                <div style={{ color: 'white', fontSize: 13.5, fontWeight: 800 }}>ภัตตาคารระดับ 5 ดาว: Fine Dining Room</div>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '⏱️', label: 'เวลา', value: '10 นาที', color: '#1E4D3A', bg: '#EAF3EE' },
              { icon: '🎯', label: 'คะแนนเต็ม', value: '100 คะแนน', color: '#1A3A5C', bg: '#E8EEF6' },
              { icon: '💬', label: 'ภาษา', value: 'English', color: '#6B1A2A', bg: '#FAE8EB' },
              { icon: '🎭', label: 'รูปแบบ', value: 'Role Play', color: '#7A5A1A', bg: '#FBF6E9' },
            ].map(info => (
              <div key={info.icon} style={{
                background: 'white', borderRadius: 16, padding: '14px 14px',
                border: '1px solid rgba(237,233,225,0.80)',
                boxShadow: '0 2px 10px rgba(16,43,31,0.06)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ width: 38, height: 38, background: info.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {info.icon}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#8C8272', marginBottom: 2 }}>{info.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: info.color }}>{info.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Rubric card */}
          <div style={{ background: 'white', borderRadius: 20, padding: '16px', border: '1px solid rgba(237,233,225,0.80)', boxShadow: '0 2px 12px rgba(16,43,31,0.06)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1E4D3A', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              📊 เกณฑ์การให้คะแนน
            </h3>
            {scenario.rubric.map((r, i) => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < scenario.rubric.length - 1 ? 12 : 0 }}>
                <span style={{ fontSize: 16 }}>{r.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: '#4A4138', fontWeight: 600 }}>{r.name}</span>
                <span style={{
                  fontSize: 12, fontWeight: 800, color: '#1E4D3A',
                  background: '#EAF3EE', padding: '3px 10px', borderRadius: 100,
                }}>{r.max} คะแนน</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #EDE9E1', marginTop: 14, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4A4138' }}>รวม</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#1E4D3A' }}>100 คะแนน</span>
            </div>
          </div>

          {/* Hint */}
          <div style={{ background: '#FBF6E9', border: '1px solid rgba(201,168,76,0.30)', borderRadius: 14, padding: '12px 14px', fontSize: 12, color: '#7A5A1A', lineHeight: 1.6 }}>
            💡 <strong>เคล็ดลับ:</strong> ตอบเป็นภาษาอังกฤษเพื่อรับคะแนนทักษะ (Skill) และใช้ความสุภาพเพื่อมารยาทที่ดี
          </div>

          {/* Start button */}
          <button
            onClick={startSim}
            style={{
              width: '100%', padding: '16px', borderRadius: 18, border: 'none',
              background: 'linear-gradient(135deg,#A6882A,#C9A84C)',
              color: '#1A1410', fontSize: 15, fontWeight: 900,
              cursor: 'pointer', fontFamily: 'var(--font-primary)',
              boxShadow: '0 8px 28px rgba(166,136,42,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            🎭 เริ่มการจำลองสถานการณ์
          </button>

          <Link href="/student/navigate" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '13px', borderRadius: 14, border: '1.5px solid #EDE9E1',
            background: 'white', color: '#8C8272', fontSize: 13, fontWeight: 700,
            textDecoration: 'none',
          }}>← กลับ</Link>
        </div>

        <StudentFINENav />
      </div>
    )
  }

  /* ── RESULT SCREEN ───────────────────────────── */
  if (finished && feedback) {
    const isGreat = score >= 80
    const isGood = score >= 60

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#F5F0E8 0%,#EDE8DC 100%)', paddingBottom: 84 }}>

        {/* Result Hero */}
        <div style={{
          background: isGreat
            ? 'linear-gradient(160deg,#102B1F 0%,#1E4D3A 60%,#C9A84C 150%)'
            : isGood
              ? 'linear-gradient(160deg,#1A3A5C 0%,#2D4A6E 60%,#C9A84C 150%)'
              : 'linear-gradient(160deg,#4A1A2A 0%,#7B2D3E 60%,#C9A84C 150%)',
          padding: '52px 20px 0',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 60, display: 'block', marginBottom: 12 }}>{isGreat ? '🏆' : isGood ? '👏' : '💪'}</span>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 900, margin: '0 0 6px' }}>สิ้นสุดการจำลองสถานการณ์</h1>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '6px 20px', marginTop: 6 }}>
              <span style={{ color: '#C9A84C', fontWeight: 900, fontSize: 22 }}>{score}</span>
              <span style={{ color: 'white', fontSize: 13, marginLeft: 2 }}>/ 100 คะแนน</span>
            </div>
          </div>
          <svg viewBox="0 0 500 32" style={{ display: 'block', width: '100%', marginTop: 4 }} preserveAspectRatio="none">
            <path d="M0 32 Q125 4 250 20 Q375 36 500 12 L500 32 Z" fill="#F5F0E8"/>
          </svg>
        </div>

        <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Feedback Card */}
          <div style={{ background: 'white', borderRadius: 20, padding: '18px', border: '1px solid rgba(237,233,225,0.80)', boxShadow: '0 2px 12px rgba(16,43,31,0.06)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1E4D3A', margin: '0 0 10px' }}>💬 การประเมินและแนะนำจาก AI</h3>
            {evaluating ? (
              <div style={{ fontSize: 13, color: '#8C8272', padding: '10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #C9A84C', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                ระบบกำลังประเมินทักษะการสนทนาภาษาอังกฤษของคุณ...
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#4A4138', lineHeight: 1.6, margin: 0 }}>{feedback.text}</p>
            )}
          </div>

          <button
            onClick={resetSim}
            style={{
              width: '100%', padding: '15px', borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg,#1E4D3A,#102B1F)',
              color: 'white', fontSize: 14, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'var(--font-primary)',
              boxShadow: '0 4px 14px rgba(30,77,58,0.25)',
            }}
          >🔄 ฝึกฝนอีกครั้ง</button>

          <Link href="/student/navigate" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '13px', borderRadius: 14, border: '1.5px solid #EDE9E1',
            background: 'white', color: '#8C8272', fontSize: 13, fontWeight: 700,
            textDecoration: 'none',
          }}>← กลับไปยังหน้านำทาง</Link>
        </div>

        <StudentFINENav />
      </div>
    )
  }

  /* ── ACTIVE SIMULATION SCREEN ────────────────── */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F0E8', overflow: 'hidden' }}>

      {/* Top Header */}
      <div style={{
        background: 'linear-gradient(160deg,#102B1F 0%,#1E4D3A 100%)',
        padding: '16px 20px',
        color: 'white',
        flexShrink: 0,
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/student/navigate" style={{
              width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: 18
            }}>✕</Link>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{scenario.title}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>สถานการณ์ {scriptIdx}/{simulationScripts.length}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#C9A84C' }}>{formatTime(timeLeft)}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>เวลาที่เหลือ</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#C9A84C' }}>{score}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>คะแนน</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden', display: 'flex', gap: 4 }}>
          {Array.from({ length: simulationScripts.length }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < scriptIdx ? 'rgba(201,168,76,0.80)' : 'rgba(255,255,255,0.20)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Customer Header chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px',
        background: 'white',
        borderBottom: '1px solid #EDE9E1',
        boxShadow: '0 2px 8px rgba(16,43,31,0.05)',
        flexShrink: 0,
      }}>
        {/* รูปใบหน้าลูกค้าต่างชาติ */}
        <div style={{ 
          width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', 
          flexShrink: 0, border: '2px solid rgba(201,168,76,0.5)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          <img src={customerAvatarUrl} alt="Mr. Smith" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1A1410' }}>Mr./Ms. Smith</div>
          <div style={{ fontSize: 10, color: '#8C8272' }}>ลูกค้าต่างชาติ · ภาษาอังกฤษ</div>
        </div>
        <span style={{ background: '#EAF3EE', color: '#1E4D3A', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 100 }}>{scenario.stage}</span>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            
            {/* Dynamic Avatar (Customer vs Student Profile) */}
            <div style={{ 
              width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', 
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: m.role === 'ai' ? '1.5px solid rgba(201,168,76,0.5)' : '1.5px solid rgba(30,77,58,0.3)',
              background: m.role === 'ai' ? 'white' : 'linear-gradient(135deg,#102B1F,#1E4D3A)'
            }}>
              {m.role === 'ai' ? (
                <img src={customerAvatarUrl} alt="Customer Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.avatar && user.avatar.startsWith('data:image') ? (
                  <img src={user.avatar} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 16 }}>{user?.avatar ?? '🧑'}</span>
                )
              )}
            </div>

            <div style={{ maxWidth: '72%' }}>
              <div style={{ fontSize: 9.5, color: '#8C8272', marginBottom: 4, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                {m.role === 'ai' ? 'Customer' : 'You (Waiter)'}
              </div>
              <div style={{
                background: m.role === 'ai' ? 'white' : 'linear-gradient(135deg,#102B1F,#1E4D3A)',
                color: m.role === 'ai' ? '#1A1410' : 'white',
                padding: '10px 14px',
                borderRadius: m.role === 'ai' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                fontSize: 13.5,
                lineHeight: 1.55,
                border: m.role === 'ai' ? '1px solid #EDE9E1' : 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ flex: 1 }}>{m.text}</span>
                {m.role === 'ai' && (
                  <button
                    onClick={() => speak(m.text)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C9A84C',
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                    title="ฟังเสียงพูด"
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ 
              width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', 
              flexShrink: 0, border: '1.5px solid rgba(201,168,76,0.5)'
            }}>
              <img src={customerAvatarUrl} alt="Customer Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ background: 'white', border: '1px solid #EDE9E1', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 5 }}>
              {[0, 1, 2].map(d => (
                <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9A84C', animation: `bounce 1s ease ${d * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Tip bar */}
      <div style={{ padding: '8px 16px', background: '#FBF6E9', borderTop: '1px solid rgba(201,168,76,0.15)', fontSize: 11.5, color: '#7A5A1A', fontWeight: 600, flexShrink: 0 }}>
        💡 ตอบเป็นภาษาอังกฤษเพื่อรับคะแนน Skill เพิ่มเติม
      </div>

      {/* Input area */}
      <div style={{ display: 'flex', gap: 10, padding: '10px 16px', background: 'white', borderTop: '1px solid #EDE9E1', flexShrink: 0, paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))', alignItems: 'center' }}>
        
        {/* Microphone Button */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
              if (!SpeechRecognition) {
                alert('เบราว์เซอร์ของคุณไม่รองรับการพูด หรือต้องเปิดสิทธิ์การเข้าถึงไมโครโฟน')
                return
              }

              if (isListening) {
                const rec = (window as any)._simulationRecognition
                if (rec) rec.stop()
                setIsListening(false)
              } else {
                const recognition = new SpeechRecognition()
                recognition.lang = 'en-US'
                recognition.interimResults = false
                recognition.maxAlternatives = 1

                recognition.onstart = () => {
                  setIsListening(true)
                }

                recognition.onresult = (event: any) => {
                  const speechToText = event.results[0][0].transcript
                  setInput(speechToText)
                }

                recognition.onerror = (event: any) => {
                  console.error('Speech recognition error', event.error)
                  setIsListening(false)
                }

                recognition.onend = () => {
                  setIsListening(false)
                }

                recognition.start()
                ;(window as any)._simulationRecognition = recognition
              }
            }
          }}
          style={{
            width: 46, height: 46, borderRadius: '50%', border: 'none',
            background: isListening ? '#FF6B6B' : 'rgba(201,168,76,0.15)',
            color: isListening ? 'white' : '#A6882A',
            fontSize: 18, cursor: 'pointer',
            boxShadow: isListening ? '0 0 12px #FF6B6B' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            animation: isListening ? 'pulse-mic 1.2s infinite' : 'none',
            flexShrink: 0,
          }}
          title={isListening ? 'หยุดบันทึกเสียง' : 'กดแล้วพูดเพื่อส่งคำตอบ'}
        >
          🎤
        </button>

        {/* Input box */}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="พิมพ์ข้อความภาษาอังกฤษเพื่อตอบโต้ หรือกดไมค์เพื่อพูด..."
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 24,
            border: '1px solid #EDE9E1', outline: 'none',
            fontSize: 13.5, background: '#F5F0E8',
            fontFamily: 'var(--font-primary)',
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            width: 42, height: 42, borderRadius: '50%', border: 'none',
            background: input.trim() ? 'linear-gradient(135deg, #1E4D3A, #102B1F)' : '#EDE9E1',
            color: input.trim() ? 'white' : '#8C8272',
            fontSize: 18, cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-mic {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.6); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
        }
      `}</style>
    </div>
  )
}
