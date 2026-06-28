'use client'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'
import { useState, useEffect } from 'react'

const featureTools = [
  { href: '/student/learn', icon: '📚', label: 'บทเรียน', sub: 'Unit 2 กำลังเรียน', color: '#1E4D3A', bg: '#EAF3EE' },
  { href: '/student/explore', icon: '🔍', label: 'สำรวจอุปกรณ์', sub: 'โมเดล 3D และ AR', color: '#A6882A', bg: '#FBF6E9' },
  { href: '/ai-scan', icon: '🤖', label: 'AI Scan', sub: 'สแกนตรวจอุปกรณ์', color: '#1E4D3A', bg: '#EAF3EE' },
  { href: '/chat', icon: '💬', label: 'Gemini Chat', sub: 'ผู้ช่วยสนทนา AI', color: '#A6882A', bg: '#FBF6E9' },
  { href: '/simulation', icon: '🎭', label: 'Simulation', sub: 'จำลองสวมบทบาท', color: '#8B2635', bg: '#FAE8EB' },
]

const pendingTasks = [
  { title: 'AI Scan — ระบุชิ้นอุปกรณ์จัดโต๊ะอาหาร', due: '29 มิ.ย. 2569', type: 'AI Scan', urgent: true, emoji: '🤖' },
  { title: 'Gemini Conversation — ต้อนรับลูกค้าอังกฤษ', due: '30 มิ.ย. 2569', type: 'Simulation', urgent: false, emoji: '💬' },
]

export default function StudentDashboard() {
  const { user, logout } = useRole()
  const [registryStudent, setRegistryStudent] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const stored = localStorage.getItem('classroomStudents')
      if (stored) {
        try {
          const list = JSON.parse(stored)
          const found = list.find((s: any) => s.name === user.name)
          if (found) {
            setRegistryStudent(found)
          }
        } catch (e) {}
      }
    }
  }, [user])

  const kScore = registryStudent?.ksa?.K ?? 80
  const sScore = registryStudent?.ksa?.S ?? 75
  const aScore = registryStudent?.ksa?.A ?? 82
  const cScore = registryStudent?.ksa?.C ?? 70
  const sessionsCount = registryStudent?.sessions ?? 45

  const ksaScores = [
    { k: 'K', label: 'ความรู้', score: kScore, color: '#1E4D3A' },
    { k: 'S', label: 'ทักษะ', score: sScore, color: '#A6882A' },
    { k: 'A', label: 'เจตคติ', score: aScore, color: '#C9A84C' },
    { k: 'C', label: 'สมรรถนะ', score: cScore, color: '#1E4D3A' },
  ]

  const overall = Math.round((kScore * 0.2) + (sScore * 0.3) + (aScore * 0.1) + (cScore * 0.4))

  return (
    <div className="page-content" style={{ paddingBottom: '80px' }}>
      
      {/* Student Header */}
      <div className="student-hero">
        <div className="student-hero-bg" />
        <div className="student-hero-inner">
          <div className="student-hero-top">
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>ยินดีต้อนรับกลับมา 👋</div>
              <h1 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '4px 0' }}>{user?.name ?? 'นักเรียน'}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.3)' }}>👨‍🎓 STUDENT</span>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>{user?.school}</span>
              </div>
            </div>
            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
              {user?.avatar ?? '👨‍🎓'}
            </div>
          </div>

          {/* KSA-C Mini Bars */}
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '14px', marginTop: 14, border: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>KSA-C สมรรถนะรวมสะสม</span>
              <span style={{ color: 'white', fontWeight: 850, fontSize: 20 }}>{overall}%</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {ksaScores.map(k => (
                <div key={k.k} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 700 }}>{k.k}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9 }}>{k.score}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${k.score}%`, background: 'white', borderRadius: 3, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>🔥 ล็อกอินต่อเนื่อง: 5 วัน</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>·</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>⏱️ เข้าใช้สะสม: {sessionsCount} ครั้ง</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>·</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>🎯 3/5 Units</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        
        {/* Pending Tasks Alert */}
        {pendingTasks.length > 0 && (
          <div style={{ background: '#FBF6E9', border: '1.5px solid #E0C068', borderRadius: 16, padding: 14, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#A6882A', marginBottom: 8 }}>📋 งานและกิจกรรมที่คุณครูมอบหมาย</div>
            {pendingTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 10, padding: '10px 12px', marginBottom: i < pendingTasks.length - 1 ? 6 : 0 }}>
                <span style={{ fontSize: 20 }}>{t.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>กำหนดส่ง: {t.due}</div>
                </div>
                {t.urgent && <span style={{ background: '#FAE8EB', color: '#8B2635', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>🔴 ด่วน!</span>}
              </div>
            ))}
          </div>
        )}

        {/* Learning Tools Grid */}
        <div style={{ textAlign: 'left' }}>
          <h2 className="section-title mb-3" style={{ margin: '0 0 12px 0' }}>ห้องปฏิบัติการและเครื่องมือ</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {featureTools.map(f => (
              <Link key={f.href} href={f.href} style={{ background: 'white', borderRadius: 16, padding: '14px', textDecoration: 'none', color: 'inherit', boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s', display: 'block', border: '1px solid #EDE9E1' }}>
                <div style={{ width: 44, height: 44, background: f.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: f.color }}>{f.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{f.sub}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Continue Learning */}
        <div style={{ textAlign: 'left' }}>
          <h2 className="section-title mb-3" style={{ margin: '0 0 12px 0' }}>📚 เรียนต่อจากคาบที่แล้ว</h2>
          <Link href="/student/learn" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ background: 'linear-gradient(135deg, #102B1F, #1E4D3A)', borderRadius: 18, padding: '16px 18px', boxShadow: '0 6px 20px rgba(16,43,31,0.15)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🍽️</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>บทเรียนสัปดาห์นี้</div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>Unit 2: Table Setting (การจัดโต๊ะ)</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 3 }}>Lesson 3/4 · 75% เสร็จสิ้น</div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 6 }}>
                  <div style={{ width: '75%', height: '100%', background: '#C9A84C', borderRadius: 2 }} />
                </div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22 }}>›</span>
            </div>
          </Link>
        </div>

        {/* Logout */}
        <button onClick={logout} style={{ width: '100%', background: '#FDFAF4', border: '1.5px solid #EDE9E1', borderRadius: 14, padding: '12px', fontSize: 14, color: '#8B2635', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>
          🚪 ออกจากระบบ
        </button>
      </div>

      <style jsx>{`
        .student-hero { background: linear-gradient(135deg, #102B1F 0%, #1E4D3A 60%, #C9A84C 100%); position: relative; overflow: hidden; }
        .student-hero-bg { position: absolute; inset: 0; background: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.07) 0%, transparent 50%); }
        .student-hero-inner { padding: 52px var(--space-4) var(--space-5); position: relative; z-index: 1; }
        .student-hero-top { display: flex; align-items: flex-start; justify-content: space-between; }
      `}</style>
    </div>
  )
}
