'use client'
import { useState, useEffect } from 'react'
import { useRole } from '@/context/RoleContext'

interface ConversationEntry {
  id: string
  date: string
  type: 'chat' | 'live' | 'simulation'
  preview: string
  score: number
  duration: string
}

interface QuizQuestion {
  q: string
  options: string[]
  correct: number
}

const defaultConversations: ConversationEntry[] = [
  { id: 'c1', date: '27 มิ.ย. 2569, 14:30', type: 'live', preview: '"Good evening! Welcome to our restaurant..."', score: 88, duration: '5 นาที 20 วินาที' },
  { id: 'c2', date: '26 มิ.ย. 2569, 10:15', type: 'simulation', preview: '"May I take your order, sir?"', score: 74, duration: '3 นาที 45 วินาที' },
  { id: 'c3', date: '25 มิ.ย. 2569, 15:00', type: 'chat', preview: '"This is a dinner fork. It is used for..."', score: 92, duration: '8 นาที 10 วินาที' },
]

const quizBank: QuizQuestion[] = [
  { q: 'What is a "Dinner Fork" used for?', options: ['Soup course', 'Main course', 'Dessert', 'Bread'], correct: 1 },
  { q: 'Where is the water goblet placed?', options: ['Left of the plate', 'Below the knife', 'Above the knife', 'Next to the fork'], correct: 2 },
  { q: 'What does "Outside-In" mean in table setting?', options: ['Use center utensils first', 'Use outermost utensils first', 'Use left side first', 'Use right side first'], correct: 1 },
  { q: 'Which phrase is correct for welcoming a guest?', options: ['"What do you want?"', '"Good evening! Welcome to our restaurant."', '"Sit down please."', '"You want food?"'], correct: 1 },
  { q: 'How do you apologize for a delay?', options: ['"Sorry!"', '"Wait."', '"I apologize for the inconvenience."', '"Not my fault."'], correct: 2 },
]

export default function EExhibitPage() {
  const { user } = useRole()
  const [activeTab, setActiveTab] = useState<'history' | 'quiz' | 'score'>('history')
  const [conversations, setConversations] = useState<ConversationEntry[]>([])

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false)
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([])
  const [quizDone, setQuizDone] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('conversationHistory')
    if (stored) {
      try { setConversations(JSON.parse(stored)); return } catch (e) {}
    }
    setConversations(defaultConversations)
  }, [])

  const avgScore = conversations.length > 0
    ? Math.round(conversations.reduce((s, c) => s + c.score, 0) / conversations.length)
    : 0

  const quizScore = quizDone ? Math.round((quizAnswers.filter(Boolean).length / quizBank.length) * 100) : 0

  function selectAnswer(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    const correct = idx === quizBank[qIdx].correct
    setTimeout(() => {
      setQuizAnswers(prev => [...prev, correct])
      if (qIdx < quizBank.length - 1) {
        setQIdx(p => p + 1)
        setSelected(null)
      } else {
        setQuizDone(true)
      }
    }, 1200)
  }

  function resetQuiz() {
    setQIdx(0); setSelected(null); setQuizAnswers([]); setQuizDone(false); setQuizStarted(false)
  }

  const typeIcon = (t: string) => t === 'live' ? '🎙️' : t === 'simulation' ? '🎭' : '💬'
  const typeLabel = (t: string) => t === 'live' ? 'Gemini Live' : t === 'simulation' ? 'Simulation' : 'AI Chat'
  const typeColor = (t: string) => t === 'live' ? '#1A2A40' : t === 'simulation' ? '#4A1A2A' : '#1E4D3A'

  return (
    <div style={{ minHeight: '100vh', background: '#F3EFE6', paddingBottom: 80 }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(160deg, #1A2A0F 0%, #2A4A1A 55%, #3A6A2A 100%)',
        padding: '52px 20px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: 'rgba(201,168,76,0.07)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, display: 'inline-block', marginBottom: 8 }}>E — FINE MODEL</span>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>Exhibit</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '0 0 16px' }}>บันทึกบทสนทนาและทดสอบเพื่อรับคะแนน</p>

          {/* Quick score preview */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'บทสนทนาสะสม', value: conversations.length, unit: 'ครั้ง', icon: '💬' },
              { label: 'คะแนนเฉลี่ย', value: avgScore, unit: '%', icon: '⭐' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ color: 'white', fontWeight: 900, fontSize: 22 }}>{s.value}<span style={{ fontSize: 12 }}>{s.unit}</span></div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
            {[
              { id: 'history', label: '📜 บันทึก' },
              { id: 'quiz', label: '📝 Quiz' },
              { id: 'score', label: '🏆 คะแนน' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ flex: 1, padding: '9px 4px', borderRadius: 8, border: 'none', background: activeTab === t.id ? 'white' : 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 800, color: activeTab === t.id ? '#1A2A0F' : 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-primary)' }}>{t.label}</button>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 500 28" style={{ display: 'block', marginTop: 4, width: '100%' }} preserveAspectRatio="none">
          <path d="M0 28 Q125 0 250 16 Q375 32 500 8 L500 28 Z" fill="#F3EFE6"/>
        </svg>
      </div>

      <div style={{ padding: '8px 16px 0' }}>

        {/* === HISTORY TAB === */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: 13, fontWeight: 800, color: '#1A2A0F', margin: 0 }}>📜 บันทึกบทสนทนาทั้งหมด</h2>
            {conversations.map((conv) => (
              <div key={conv.id} style={{ background: 'white', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,42,15,0.07)', border: '1px solid #EDE9E1' }}>
                <div style={{ background: typeColor(conv.type), padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{typeIcon(conv.type)}</span>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: 700 }}>{typeLabel(conv.type)}</div>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>{conv.date}</div>
                    </div>
                  </div>
                  <div style={{ background: conv.score >= 80 ? '#22C55E' : conv.score >= 60 ? '#EAB308' : '#EF4444', color: 'white', fontSize: 11, fontWeight: 900, padding: '4px 10px', borderRadius: 100 }}>{conv.score}%</div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ fontSize: 12.5, color: '#4A4138', fontStyle: 'italic', margin: '0 0 8px' }}>{conv.preview}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 10, color: '#8C8272' }}>⏱️ {conv.duration}</span>
                    <span style={{ fontSize: 10, color: '#8C8272' }}>
                      {conv.score >= 80 ? '✅ ผ่านเกณฑ์' : '⚠️ ต้องพัฒนา'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8C8272' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>ยังไม่มีบันทึกบทสนทนา</div>
                <div style={{ fontSize: 12 }}>ลองใช้ I-Interact หรือ N-Navigate เพื่อเริ่มฝึก</div>
              </div>
            )}
          </div>
        )}

        {/* === QUIZ TAB === */}
        {activeTab === 'quiz' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!quizStarted && !quizDone && (
              <div style={{ background: 'white', borderRadius: 20, padding: '24px 20px', textAlign: 'center', border: '1px solid #EDE9E1', boxShadow: '0 4px 20px rgba(26,42,15,0.08)' }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>📝</div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A2A0F', margin: '0 0 8px' }}>{'แบบทดสอบ F&B Service'}</h2>
                <p style={{ fontSize: 13, color: '#8C8272', margin: '0 0 20px', lineHeight: 1.6 }}>{quizBank.length} คำถาม · ไม่จำกัดเวลา<br/>ทดสอบความรู้ด้านคำศัพท์และสถานการณ์</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'จำนวนข้อ', value: `${quizBank.length} ข้อ` },
                    { label: 'คะแนนผ่าน', value: '70%' },
                    { label: 'ผลต่อ KSA', value: 'K + S' },
                    { label: 'เวลาโดยประมาณ', value: '~5 นาที' },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#F3EFE6', borderRadius: 12, padding: '10px' }}>
                      <div style={{ fontSize: 11, color: '#8C8272' }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2A0F', marginTop: 2 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setQuizStarted(true)} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #1A2A0F, #2A4A1A)', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>
                  🚀 เริ่มทำแบบทดสอบ
                </button>
              </div>
            )}

            {quizStarted && !quizDone && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 6, background: '#EDE9E1', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ width: `${((qIdx + 1) / quizBank.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #1A2A0F, #3A6A2A)', borderRadius: 100, transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#8C8272', fontWeight: 700 }}>{qIdx + 1}/{quizBank.length}</span>
                </div>

                <div style={{ background: 'white', borderRadius: 20, padding: '20px', border: '1px solid #EDE9E1', boxShadow: '0 4px 20px rgba(26,42,15,0.08)' }}>
                  <div style={{ fontSize: 10, color: '#3A6A2A', fontWeight: 800, marginBottom: 12, letterSpacing: '0.3px' }}>คำถามที่ {qIdx + 1}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A2A0F', margin: '0 0 20px', lineHeight: 1.5 }}>{quizBank[qIdx].q}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {quizBank[qIdx].options.map((opt, i) => {
                      let bg = 'white'
                      let border = '1.5px solid #EDE9E1'
                      let color = '#4A4138'
                      if (selected !== null) {
                        if (i === quizBank[qIdx].correct) { bg = '#EAF3EE'; border = '1.5px solid #1E4D3A'; color = '#1E4D3A' }
                        else if (i === selected && i !== quizBank[qIdx].correct) { bg = '#FAE8EB'; border = '1.5px solid #8B2635'; color = '#8B2635' }
                      } else if (selected === i) { bg = '#EAF3EE'; border = '1.5px solid #1E4D3A' }
                      return (
                        <button key={i} onClick={() => selectAnswer(i)} style={{ padding: '13px 16px', borderRadius: 14, border, background: bg, color, fontSize: 13, fontWeight: 700, cursor: selected !== null ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'var(--font-primary)', transition: 'all 0.2s' }}>
                          <span style={{ fontWeight: 800, marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>{opt}
                          {selected !== null && i === quizBank[qIdx].correct && ' ✓'}
                          {selected !== null && i === selected && i !== quizBank[qIdx].correct && ' ✗'}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {quizDone && (
              <div style={{ background: 'white', borderRadius: 20, padding: '24px 20px', textAlign: 'center', border: '1px solid #EDE9E1' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>{quizScore >= 80 ? '🏆' : quizScore >= 60 ? '✅' : '💪'}</div>
                <div style={{ fontSize: 13, color: '#8C8272', marginBottom: 4 }}>คะแนนของคุณ</div>
                <div style={{ fontSize: 52, fontWeight: 900, color: quizScore >= 80 ? '#1E4D3A' : quizScore >= 60 ? '#A6882A' : '#8B2635', margin: '0 0 6px' }}>{quizScore}%</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#4A4138', marginBottom: 16 }}>
                  {quizAnswers.filter(Boolean).length}/{quizBank.length} ข้อถูกต้อง
                </div>
                <div style={{ background: '#F3EFE6', borderRadius: 14, padding: '12px', marginBottom: 20, fontSize: 12, color: '#8C8272' }}>
                  {quizScore >= 80 ? '🌟 ยอดเยี่ยม! คะแนนนี้จะถูกบันทึกลงใน KSA-C ของคุณ' : quizScore >= 60 ? '✅ ผ่านเกณฑ์! ฝึกเพิ่มเติมเพื่อพัฒนาต่อ' : '💪 ยังไม่ผ่านเกณฑ์ 60% ลองทำใหม่อีกครั้ง'}
                </div>
                <button onClick={resetQuiz} style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#1A2A0F,#2A4A1A)', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>🔄 ทำแบบทดสอบใหม่</button>
              </div>
            )}
          </div>
        )}

        {/* === SCORE TAB === */}
        {activeTab === 'score' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Big score ring */}
            <div style={{ background: 'white', borderRadius: 20, padding: '24px 20px', border: '1px solid #EDE9E1', boxShadow: '0 4px 20px rgba(26,42,15,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#8C8272', fontWeight: 700, marginBottom: 16 }}>คะแนนเฉลี่ยสะสมจากบทสนทนา</div>
              <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 16px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#EDE9E1" strokeWidth="10"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#2A4A1A" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50 * avgScore / 100} ${2 * Math.PI * 50 * (1 - avgScore / 100)}`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#1A2A0F' }}>{avgScore}%</span>
                  <span style={{ fontSize: 10, color: '#8C8272', fontWeight: 700 }}>เฉลี่ย</span>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2A0F', marginBottom: 4 }}>
                {avgScore >= 80 ? '🌟 ระดับ Excellent' : avgScore >= 70 ? '✅ ระดับ Good' : '💪 ระดับ Developing'}
              </div>
              <div style={{ fontSize: 11, color: '#8C8272' }}>จากบทสนทนา {conversations.length} ครั้ง</div>
            </div>

            {/* Score breakdown */}
            <div style={{ background: 'white', borderRadius: 18, padding: '16px', border: '1px solid #EDE9E1' }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1A2A0F', margin: '0 0 14px' }}>📊 คะแนนแยกตามประเภท</h3>
              {[
                { type: 'simulation', label: 'Simulation', score: conversations.filter(c => c.type === 'simulation').reduce((a, c) => a + c.score, 0) / (conversations.filter(c => c.type === 'simulation').length || 1) || 0, color: '#4A1A2A', icon: '🎭' },
                { type: 'chat', label: 'AI Chat', score: conversations.filter(c => c.type === 'chat').reduce((a, c) => a + c.score, 0) / (conversations.filter(c => c.type === 'chat').length || 1) || 0, color: '#1E4D3A', icon: '💬' },
              ].map(item => (
                <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#4A4138' }}>{item.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: item.color }}>{Math.round(item.score)}%</span>
                    </div>
                    <div style={{ height: 6, background: '#EDE9E1', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: 100, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* KSA contribution */}
            <div style={{ background: 'linear-gradient(135deg, #1A2A0F, #2A4A1A)', borderRadius: 18, padding: '16px', color: 'white' }}>
              <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 800, marginBottom: 12 }}>🎯 ผลต่อคะแนน KSA-C</div>
              {[
                { k: 'K', label: 'Knowledge (ความรู้)', desc: 'จาก Quiz และ Standard Prompts' },
                { k: 'S', label: 'Skills (ทักษะ)', desc: 'จากการฝึกออกเสียงและแต่งประโยค AI' },
                { k: 'C', label: 'Competency (สมรรถนะ)', desc: 'จาก Simulation และ E-Exhibit รวม' },
              ].map(item => (
                <div key={item.k} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{item.k}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: 'white' }}>{item.label}</div>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
