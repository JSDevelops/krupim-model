'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/student/explore',
    letter: 'F',
    sub: 'สแกน',
    grad: ['#0D2318', '#1E4D3A'],
    dot: '#2A6B52',
    glow: 'rgba(30,77,58,0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="3" height="3" rx="0.5"/>
        <rect x="19" y="14" width="2" height="2" rx="0.5"/>
        <rect x="14" y="19" width="2" height="2" rx="0.5"/>
        <rect x="19" y="19" width="2" height="2" rx="0.5"/>
      </svg>
    ),
  },
  {
    href: '/student/interact',
    letter: 'I',
    sub: 'สนทนา',
    grad: ['#0C1824', '#1A3A5C'],
    dot: '#2D4A6E',
    glow: 'rgba(26,58,92,0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: '/student/navigate',
    letter: 'N',
    sub: 'จำลอง',
    grad: ['#2A0C12', '#6B1A2A'],
    dot: '#7B2D3E',
    glow: 'rgba(107,26,42,0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
  },
  {
    href: '/student/exhibit',
    letter: 'E',
    sub: 'ทดสอบ',
    grad: ['#0C1E0E', '#1A4A1F'],
    dot: '#2A5A2F',
    glow: 'rgba(26,74,31,0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    href: '/student/profile',
    letter: 'P',
    sub: 'Portfolio',
    grad: ['#3A2808', '#8B5E1A'],
    dot: '#C9A84C',
    glow: 'rgba(201,168,76,0.45)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function StudentFINENav() {
  const pathname = usePathname()
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({ F: 0, I: 0, N: 0, E: 0, P: 0 })

  // ดึงข้อมูลงานที่ค้างเพื่อทำระบบแจ้งเตือนสีแดง
  useEffect(() => {
    const checkTasks = () => {
      const stored = localStorage.getItem('studentTasks')
      let list = []
      if (stored) {
        try { list = JSON.parse(stored) } catch (e) {}
      } else {
        // ค่าเริ่มต้นของงานที่ค้าง
        list = [
          { id: 't1', type: 'F-Familiarize', done: false },
          { id: 't2', type: 'I-Interact', done: false },
          { id: 't4', type: 'N-Navigate', done: false },
        ]
      }

      const counts = { F: 0, I: 0, N: 0, E: 0, P: 0 }
      list.forEach((t: any) => {
        if (!t.done) {
          if (t.type.includes('F-')) counts.F++
          if (t.type.includes('I-')) counts.I++
          if (t.type.includes('N-')) counts.N++
          if (t.type.includes('E-')) counts.E++
        }
      })
      // รวมงานค้างทั้งหมดโชว์ที่หน้า Profile (P)ด้วย
      counts.P = counts.F + counts.I + counts.N + counts.E
      setTaskCounts(counts)
    }

    checkTasks()
    // อัปเดตเมื่อเปลี่ยนหน้าหรือโฟกัสหน้าจอ
    window.addEventListener('focus', checkTasks)
    return () => window.removeEventListener('focus', checkTasks)
  }, [pathname])

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 500,
      zIndex: 1100,
      background: 'rgba(10, 8, 6, 0.93)',
      backdropFilter: 'blur(28px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
      paddingBottom: 'calc(4px + env(safe-area-inset-bottom, 0px))',
      boxShadow: '0 -1px 0 rgba(201,168,76,0.22), 0 -12px 40px rgba(0,0,0,0.45)',
      overflow: 'visible',
    }}>

      {/* Gold shimmer top border */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.15) 10%, rgba(201,168,76,0.65) 40%, rgba(255,220,110,0.95) 50%, rgba(201,168,76,0.65) 60%, rgba(201,168,76,0.15) 90%, transparent 100%)',
      }} />

      {/* Tab row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: 72,
        padding: '0 8px',
        gap: 3,
        overflow: 'visible',
      }}>
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          const pendingCount = taskCounts[tab.letter as keyof typeof taskCounts] || 0

          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                textDecoration: 'none',
                borderRadius: 20,
                padding: '6px 2px 8px',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                
                /* เมื่อกดปุ่ม (Active) ให้แสดงใหญ่ขึ้นและลอยสูงขึ้น */
                transform: isActive ? 'translateY(-8px) scale(1.12)' : 'translateY(0) scale(1)',
                zIndex: isActive ? 10 : 1,

                /* Active background gradient */
                background: isActive
                  ? `linear-gradient(145deg, ${tab.grad[0]}, ${tab.grad[1]})`
                  : 'transparent',
                boxShadow: isActive
                  ? `0 8px 24px ${tab.glow}, inset 0 1.5px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.04)`
                  : 'none',
              }}
            >
              {/* Notification Red Badge - แสดงเฉพาะบนแท็บพอร์ตโฟลิโอ (P) เท่านั้น */}
              {tab.letter === 'P' && pendingCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 4,
                  right: 12,
                  background: '#FF4D4D',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: 900,
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(255,77,77,0.6)',
                  zIndex: 12,
                  animation: 'pulse-notification 1.5s infinite',
                }}>
                  {pendingCount}
                </span>
              )}

              {/* Icon */}
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(180,168,148,0.60)',
                transition: 'color 0.3s, transform 0.3s',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                filter: isActive ? `drop-shadow(0 2px 8px ${tab.glow})` : 'none',
              }}>
                {tab.icon}
              </span>

              {/* Text Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                transition: 'all 0.3s',
              }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 900,
                  color: isActive ? '#C9A84C' : 'rgba(180,168,148,0.50)',
                  textShadow: isActive ? `0 0 8px rgba(201,168,76,0.50)` : 'none',
                  fontFamily: "'Playfair Display', 'Georgia', serif",
                  lineHeight: 1,
                }}>
                  {tab.letter}
                </span>

                <span style={{
                  fontSize: '7px',
                  color: isActive ? 'rgba(255,255,255,0.40)' : 'rgba(180,168,148,0.30)',
                  lineHeight: 1,
                }}>·</span>

                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: isActive ? 'rgba(255,255,255,0.90)' : 'rgba(180,168,148,0.45)',
                  fontFamily: "'Kanit', 'Noto Sans Thai', sans-serif",
                  lineHeight: 1,
                  letterSpacing: '0.1px',
                }}>
                  {tab.sub}
                </span>
              </div>

              {/* Bottom active line */}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  bottom: 3,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 2.5,
                  borderRadius: 100,
                  background: '#C9A84C',
                  boxShadow: '0 0 6px rgba(201,168,76,0.6)',
                }} />
              )}
            </Link>
          )
        })}
      </div>

      <style jsx global>{`
        @keyframes pulse-notification {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
          70% { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(255, 77, 77, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
        }
      `}</style>
    </nav>
  )
}
