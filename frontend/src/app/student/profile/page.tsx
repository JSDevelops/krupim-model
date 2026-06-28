'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'

interface Task {
  id: string
  title: string
  type: string
  due: string
  urgent: boolean
  done: boolean
}

const defaultTasks: Task[] = [
  { id: 't1', title: 'AI Scan — ระบุชิ้นอุปกรณ์จัดโต๊ะอาหาร', type: 'F-Familiarize', due: '29 มิ.ย. 2569', urgent: true, done: false },
  { id: 't2', title: 'Standard Prompts — ต้อนรับลูกค้าอังกฤษ', type: 'I-Interact', due: '30 มิ.ย. 2569', urgent: false, done: false },
  { id: 't3', title: 'Quiz บทที่ 1 — คำศัพท์ F&B Service', type: 'E-Exhibit', due: '27 มิ.ย. 2569', urgent: false, done: true },
  { id: 't4', title: 'Simulation — จัดโต๊ะ Formal Western', type: 'N-Navigate', due: '2 ก.ค. 2569', urgent: false, done: false },
]

const manualItems = [
  { icon: '⬛', title: 'F - Familiarize: สแกน QR & AI', content: 'ไปที่แท็บ F แล้วเลือก "สแกน QR Code" เพื่อสแกนบัตรอุปกรณ์ที่ครูแจก หรือเลือก "AI Scan" เพื่อถ่ายรูปวัตถุรอบตัวให้ AI วิเคราะห์ชื่อและวิธีใช้ กดปุ่ม 🔊 เพื่อฟังเสียง และ 🎤 เพื่อฝึกพูดตาม' },
  { icon: '💬', title: 'I - Interact: ฝึกประโยค & Live Coach', content: 'แท็บ I มี 2 โหมด — Standard Prompts แสดงประโยคจากแผนการสอนของครู กดฟังและพูดตามเพื่อรับคะแนน และ Gemini Live Coach สำหรับสนทนาแบบ Real-time กับ AI' },
  { icon: '🎭', title: 'N - Navigate: จำลองสถานการณ์', content: 'แท็บ N แสดงสถานการณ์จำลองจากแผนการสอน กดที่การ์ดสถานการณ์เพื่อดูคำศัพท์ (กดพลิก Flashcard) และประโยคฝึกพูด กด "เข้าห้องจำลอง" เพื่อ Simulation เต็มรูปแบบ' },
  { icon: '⭐', title: 'E - Exhibit: ทดสอบ & บันทึกคะแนน', content: 'แท็บ E บันทึกบทสนทนาทุกครั้งอัตโนมัติ ทำ Quiz เพื่อรับคะแนน K และ S ดูกราฟคะแนนแยกตามประเภทการฝึก และตรวจสอบผลต่อ KSA-C ของคุณ' },
  { icon: '👤', title: 'Portfolio: ข้อมูลและสถิติ', content: 'หน้านี้แสดงข้อมูลส่วนตัว งานที่ได้รับมอบหมาย คะแนน KSA-C สะสม และใบรับรองสมรรถนะเมื่อผ่านเกณฑ์ 70%' },
]

export default function PortfolioPage() {
  const { user, setUser, logout } = useRole()
  const [registryStudent, setRegistryStudent] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'manual'>('overview')
  const [expandedManual, setExpandedManual] = useState<number | null>(null)
  const [showCert, setShowCert] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const stored = localStorage.getItem('classroomStudents')
      if (stored) {
        try {
          const list = JSON.parse(stored)
          const found = list.find((s: any) => s.name === user.name)
          if (found) setRegistryStudent(found)
        } catch (e) {}
      }
    }
    const taskStored = localStorage.getItem('studentTasks')
    if (taskStored) {
      try { setTasks(JSON.parse(taskStored)) } catch (e) { setTasks(defaultTasks) }
    } else {
      setTasks(defaultTasks)
    }
  }, [user])

  const kScore = registryStudent?.ksa?.K ?? 80
  const sScore = registryStudent?.ksa?.S ?? 75
  const aScore = registryStudent?.ksa?.A ?? 82
  const cScore = registryStudent?.ksa?.C ?? 70
  const sessions = registryStudent?.sessions ?? 45
  const overall = Math.round((kScore * 0.2) + (sScore * 0.3) + (aScore * 0.1) + (cScore * 0.4))
  const isCertified = kScore >= 60 && sScore >= 60 && aScore >= 60 && cScore >= 60 && overall >= 70

  const pendingTasks = tasks.filter(t => !t.done)
  const doneTasks = tasks.filter(t => t.done)

  const typeColor = (t: string) => {
    if (t.includes('F-')) return { bg: '#EAF3EE', color: '#1E4D3A' }
    if (t.includes('I-')) return { bg: '#EEF0FA', color: '#1A2A40' }
    if (t.includes('N-')) return { bg: '#FAE8EB', color: '#4A1A2A' }
    if (t.includes('E-')) return { bg: '#EAF4EA', color: '#1A2A0F' }
    return { bg: '#FBF6E9', color: '#A6882A' }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F3EFE6', paddingBottom: 80 }}>

      {/* Profile Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #102B1F 0%, #1E4D3A 60%, #C9A84C 150%)',
        padding: '52px 20px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, background: 'rgba(201,168,76,0.07)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: 40, left: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

        {/* Avatar + Name - รองรับการเปลี่ยนรูปภาพอัปโหลดและแปลงเป็น Base64 */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 16 }}>
          <div 
            onClick={() => {
              if (typeof window !== 'undefined') {
                const el = document.getElementById('student-avatar-input')
                if (el) el.click()
              }
            }}
            style={{ 
              width: 84, height: 84, borderRadius: '50%', 
              background: 'rgba(255,255,255,0.15)', 
              border: '3px solid rgba(201,168,76,0.6)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 10px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              position: 'relative', overflow: 'hidden', cursor: 'pointer',
            }}
            title="คลิกเพื่ออัปโหลดรูปภาพใหม่"
          >
            {user?.avatar && user.avatar.startsWith('data:image') ? (
              <img 
                src={user.avatar} 
                alt="Profile Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <span style={{ fontSize: 40 }}>{user?.avatar ?? '👨‍🎓'}</span>
            )}
            
            {/* Overlay Camera Icon on Hover */}
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
              fontSize: 16, color: 'white'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
            >
              📸 เปลี่ยนรูป
            </div>
          </div>

          {/* Hidden File Input */}
          <input 
            type="file" 
            id="student-avatar-input"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file && user) {
                const reader = new FileReader()
                reader.onload = (event) => {
                  const base64 = event.target?.result as string
                  // 1. อัปเดตเข้าระบบหลัก
                  setUser({ ...user, avatar: base64 })
                  // 2. อัปเดตรายชื่อ registeredUsers เพื่อไม่ให้หายตอนล๊อกอินใหม่
                  const registered = localStorage.getItem('registeredUsers')
                  if (registered) {
                    try {
                      const list = JSON.parse(registered)
                      const idx = list.findIndex((u: any) => u.email === user.email)
                      if (idx !== -1) {
                        list[idx].avatar = base64
                        localStorage.setItem('registeredUsers', JSON.stringify(list))
                      }
                    } catch (err) {}
                  }
                }
                reader.readAsDataURL(file)
              }
            }}
          />

          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>{user?.name ?? 'นักเรียน'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, margin: '0 0 8px' }}>{user?.email}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <span style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100 }}>👨‍🎓 STUDENT</span>
            <span style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 10, padding: '4px 12px', borderRadius: 100 }}>{user?.school}</span>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, position: 'relative', zIndex: 1 }}>
          {[
            { label: 'ล็อกอิน', value: sessions, unit: 'ครั้ง' },
            { label: 'สมรรถนะ', value: overall, unit: '%' },
            { label: 'งานคงค้าง', value: pendingTasks.length, unit: 'งาน' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 20 }}>{s.value}<span style={{ fontSize: 10, fontWeight: 700 }}>{s.unit}</span></div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, position: 'relative', zIndex: 1 }}>
          {[
            { id: 'overview', label: '📊 KSA-C' },
            { id: 'tasks', label: `📋 งาน (${pendingTasks.length})` },
            { id: 'manual', label: '📖 คู่มือ' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ flex: 1, padding: '9px 4px', borderRadius: 8, border: 'none', background: activeTab === t.id ? 'white' : 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 800, color: activeTab === t.id ? '#1E4D3A' : 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-primary)' }}>{t.label}</button>
          ))}
        </div>
        <svg viewBox="0 0 500 28" style={{ display: 'block', marginTop: 4, width: '100%' }} preserveAspectRatio="none">
          <path d="M0 28 Q125 0 250 16 Q375 32 500 8 L500 28 Z" fill="#F3EFE6"/>
        </svg>
      </div>

      <div style={{ padding: '8px 16px 0' }}>

        {/* === KSA-C OVERVIEW === */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Certificate Banner */}
            {isCertified ? (
              <div style={{ background: 'linear-gradient(135deg,#102B1F,#1E4D3A)', borderRadius: 18, padding: '16px 18px', border: '2px solid #C9A84C', cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,43,31,0.15)' }} onClick={() => setShowCert(true)}>
                <div style={{ color: '#C9A84C', fontSize: 10, fontWeight: 800, letterSpacing: '1px', marginBottom: 6 }}>✨ COMPETENCY CERTIFICATE UNLOCKED</div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{'ยินดีด้วย! คุณได้รับใบรับรองสมรรถนะ F&B'}</div>
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px', textAlign: 'center', color: '#C9A84C', fontWeight: 800, fontSize: 13 }}>📜 แตะเพื่อดูใบรับรอง</div>
              </div>
            ) : (
              <div style={{ background: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 14, padding: '12px 14px', fontSize: 11.5, color: '#F57F17', fontWeight: 700 }}>
                ⚠️ คะแนนเฉลี่ยปัจจุบัน ({overall}%) ยังไม่ถึงเกณฑ์ออกใบรับรอง (ต้องการ 70% และทุกด้าน ≥ 60%)
              </div>
            )}

            {/* KSA-C bars */}
            <div style={{ background: 'white', borderRadius: 18, padding: '16px', border: '1px solid #EDE9E1', boxShadow: '0 2px 12px rgba(16,43,31,0.06)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1E4D3A', margin: '0 0 16px' }}>🎯 สมรรถนะ KSA-C รายด้าน</h3>
              {[
                { key: 'K', label: 'Knowledge — ความรู้', score: kScore, color: '#1E4D3A', bg: '#EAF3EE', icon: '📚' },
                { key: 'S', label: 'Skills — ทักษะปฏิบัติ', score: sScore, color: '#1A2A40', bg: '#EEF0FA', icon: '🎯' },
                { key: 'A', label: 'Attitude — เจตคติ', score: aScore, color: '#C9A84C', bg: '#FBF6E9', icon: '💫' },
                { key: 'C', label: 'Competency — สมรรถนะ', score: cScore, color: '#4A1A2A', bg: '#FAE8EB', icon: '⭐' },
              ].map(item => (
                <div key={item.key} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, background: item.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>{item.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: item.color }}>{item.score}%</span>
                      </div>
                      <div style={{ height: 7, background: '#EDE9E1', borderRadius: 100, marginTop: 5, overflow: 'hidden' }}>
                        <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: 100, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#1E4D3A' }}>คะแนนรวมถ่วงน้ำหนัก</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#1E4D3A' }}>{overall}%</span>
                </div>
                <div style={{ fontSize: 10, color: '#8C8272', marginTop: 3 }}>K×20% + S×30% + A×10% + C×40%</div>
              </div>
              
              {/* Navigation to Student Dashboard */}
              <Link href="/student/dashboard" style={{ 
                display: 'block', 
                width: '100%', 
                padding: '13px', 
                borderRadius: 14, 
                border: 'none', 
                background: 'linear-gradient(135deg, #1E4D3A, #102B1F)', 
                color: '#C9A84C', 
                fontWeight: 800, 
                fontSize: 13, 
                textAlign: 'center',
                textDecoration: 'none',
                cursor: 'pointer', 
                fontFamily: 'var(--font-primary)',
                boxShadow: '0 4px 14px rgba(30,77,58,0.2)',
                marginTop: 14
              }}>
                📊 เข้าสู่แดชบอร์ดนักเรียน (Dashboard)
              </Link>
            </div>

            <button onClick={logout} style={{ width: '100%', padding: '13px', borderRadius: 14, border: '1.5px solid #EDE9E1', background: 'white', color: '#8B2635', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>🚪 ออกจากระบบ</button>
          </div>
        )}

        {/* === TASKS === */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pendingTasks.length > 0 && (
              <div>
                <h2 style={{ fontSize: 13, fontWeight: 800, color: '#1E4D3A', margin: '0 0 10px' }}>📌 งานที่ต้องทำ ({pendingTasks.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pendingTasks.map(task => {
                    const tc = typeColor(task.type)
                    // ค้นหาเส้นทางหน้าเว็บตามประเภทงาน
                    let targetUrl = '/student/explore'
                    if (task.type.includes('I-')) targetUrl = '/student/interact'
                    if (task.type.includes('N-')) targetUrl = '/student/navigate'
                    if (task.type.includes('E-')) targetUrl = '/student/exhibit'

                    return (
                      <div key={task.id} style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: '1px solid #EDE9E1', boxShadow: '0 2px 10px rgba(16,43,31,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ width: 40, height: 40, background: tc.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>📋</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: 13, color: '#1A1410', marginBottom: 4, lineHeight: 1.4 }}>{task.title}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                              <span style={{ background: tc.bg, color: tc.color, fontSize: 9.5, fontWeight: 800, padding: '3px 8px', borderRadius: 100 }}>{task.type}</span>
                              <span style={{ fontSize: 10, color: '#8C8272' }}>📅 {task.due}</span>
                              {task.urgent && <span style={{ background: '#FAE8EB', color: '#8B2635', fontSize: 9.5, fontWeight: 800, padding: '3px 8px', borderRadius: 100 }}>🔴 ด่วน</span>}
                            </div>
                            
                            {/* ปุ่มกดเพื่อทำภารกิจทันที */}
                            <Link href={targetUrl} style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 16px',
                              borderRadius: 10,
                              background: 'linear-gradient(135deg, #102B1F, #1E4D3A)',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 800,
                              textDecoration: 'none',
                              boxShadow: '0 4px 12px rgba(30,77,58,0.2)',
                              transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              🚀 เริ่มทำภารกิจเลย ➡️
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {doneTasks.length > 0 && (
              <div>
                <h2 style={{ fontSize: 13, fontWeight: 800, color: '#8C8272', margin: '0 0 10px' }}>✅ งานที่ส่งแล้ว ({doneTasks.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {doneTasks.map(task => (
                    <div key={task.id} style={{ background: '#F3EFE6', borderRadius: 14, padding: '12px 14px', border: '1px solid #EDE9E1', opacity: 0.75 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>✅</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12.5, color: '#8C8272', textDecoration: 'line-through' }}>{task.title}</div>
                          <div style={{ fontSize: 10, color: '#B8B0A0', marginTop: 2 }}>{task.type} · {task.due}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === MANUAL === */}
        {activeTab === 'manual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 12, color: '#8C8272', margin: '0 0 4px' }}>กดที่หัวข้อเพื่อดูวิธีใช้งาน</p>
            {manualItems.map((item, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #EDE9E1', boxShadow: '0 1px 8px rgba(16,43,31,0.04)' }}>
                <button
                  onClick={() => setExpandedManual(expandedManual === i ? null : i)}
                  style={{
                    width: '100%', padding: '14px 16px', background: 'transparent', border: 'none',
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: '#1E4D3A', fontFamily: 'var(--font-primary)' }}>{item.title}</span>
                  <span style={{ color: '#C9A84C', fontSize: 18, fontWeight: 700, transition: 'transform 0.2s', transform: expandedManual === i ? 'rotate(90deg)' : 'rotate(0)' }}>›</span>
                </button>
                {expandedManual === i && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #EDE9E1' }}>
                    <p style={{ fontSize: 12.5, color: '#4A4138', lineHeight: 1.7, margin: '12px 0 0' }}>{item.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showCert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,43,31,0.6)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowCert(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FDFAF4', borderRadius: 24, padding: '24px', width: '100%', maxWidth: 420, animation: 'fadeInUp 0.3s ease' }}>
            <div style={{ background: 'linear-gradient(135deg,#102B1F,#1E4D3A)', borderRadius: 18, padding: '24px', border: '3px solid #C9A84C', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: '#C9A84C', fontWeight: 800, letterSpacing: '2px', marginBottom: 10 }}>CERTIFICATE OF COMPETENCY</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 12 }}>{'เกียรติบัตรรับรองสมรรถนะ F&B Service'}</div>
              <div style={{ width: 40, height: 1, background: '#C9A84C', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>มอบให้แก่</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#C9A84C', marginBottom: 16 }}>{user?.name}</div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: '0 0 20px' }}>{'ผ่านเกณฑ์การฝึกทักษะตามกรอบ FINE Model ด้านการสื่อสารและบริการอาหาร มีคะแนนสัมฤทธิ์เฉลี่ยรวม '}{overall}{'%'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                <span>สถาบัน: {user?.school}</span>
                <span>รหัส: FINE-FB-{registryStudent?.id || '001'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => alert('กำลังส่งไปยังคำสั่งพิมพ์...')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#102B1F,#1E4D3A)', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>🖨️ พิมพ์ PDF</button>
              <button onClick={() => setShowCert(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #EDE9E1', background: 'white', color: '#8C8272', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
