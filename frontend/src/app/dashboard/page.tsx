'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const quickActions = [
  { href: '/ar-3d', icon: '📦', label: 'AR 3D', sublabel: 'วัตถุ 3 มิติ', color: '#1565C0', bg: '#E3F2FD' },
  { href: '/ai-scan', icon: '🤖', label: 'AI Scan', sublabel: 'สแกน AI', color: '#7B1FA2', bg: '#F3E5F5' },
  { href: '/chat', icon: '💬', label: 'Gemini', sublabel: 'ผู้ช่วย AI', color: '#00897B', bg: '#E0F2F1' },
  { href: '/simulation', icon: '🎭', label: 'Simulation', sublabel: 'สถานการณ์', color: '#C62828', bg: '#FFEBEE' },
  { href: '/progress', icon: '📊', label: 'Analytics', sublabel: 'รายผลคะแนน', color: '#1B5E20', bg: '#E8F5E9' },
]

const recentActivities = [
  { icon: '📦', title: 'AR 3D: Restaurant Equipment', subtitle: 'Unit 1 · เรียนจบแล้ว', time: '2 ชั่วโมงที่แล้ว', color: '#1565C0', score: 100 },
  { icon: '🤖', title: 'AI Scan: Grilled Salmon', subtitle: 'วิเคราะห์สำเร็จ', time: '5 ชั่วโมงที่แล้ว', color: '#7B1FA2', score: null },
  { icon: '🎭', title: 'Simulation: Taking Order', subtitle: 'คะแนน 85/100', time: 'เมื่อวาน', color: '#C62828', score: 85 },
  { icon: '💬', title: 'Gemini: AI Practice', subtitle: 'ฝึกสนทนา 15 นาที', time: 'เมื่อวาน', color: '#00897B', score: null },
]

export default function DashboardPage() {
  const [role, setRole] = useState('student')
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const r = localStorage.getItem('userRole') || 'student'
    setRole(r)
    const h = new Date().getHours()
    if (h < 12) setGreeting('อรุณสวัสดิ์')
    else if (h < 17) setGreeting('สวัสดีตอนบ่าย')
    else setGreeting('สวัสดีตอนเย็น')
  }, [])

  return (
    <div className="page-content">
      {/* Header Banner */}
      <div className="dash-hero">
        <div className="dash-hero-inner">
          <div className="dash-greeting">
            <div className="dash-greeting-text">
              <span className="dash-hi">{greeting} 👋</span>
              <h1 className="dash-name">สวัสดิ์รัก, ครูผู้สอน</h1>
              <p className="dash-subtitle">FINE MODEL · AR 3D + AI LEARNING</p>
            </div>
            <div className="dash-avatar">
              <span style={{fontSize: 28}}>👩‍🏫</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="dash-stats">
            {[
              { value: '24', label: 'นักเรียน', icon: '👥' },
              { value: '16', label: 'กิจกรรม', icon: '📋' },
              { value: '8', label: 'เสร็จแล้ว', icon: '✅' },
            ].map(s => (
              <div key={s.label} className="dash-stat-item">
                <span className="dash-stat-icon">{s.icon}</span>
                <span className="dash-stat-value">{s.value}</span>
                <span className="dash-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="dash-content">
        {/* Overall Progress */}
        <div className="dash-section">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">ความก้าวหน้ารวม</h2>
            <Link href="/progress" className="text-sm text-primary font-semibold">ดูทั้งหมด →</Link>
          </div>
          <div className="progress-card">
            <div className="progress-card-inner">
              {/* Circular Progress */}
              <div className="circular-wrap">
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="38" fill="none" stroke="#E3F2FD" strokeWidth="8"/>
                  <circle
                    cx="45" cy="45" r="38"
                    fill="none"
                    stroke="url(#progressGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 38 * 0.75} ${2 * Math.PI * 38 * 0.25}`}
                    transform="rotate(-90 45 45)"
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1565C0"/>
                      <stop offset="100%" stopColor="#7B1FA2"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="circular-text">
                  <span className="circular-pct">75%</span>
                  <span className="circular-label">ดีมาก</span>
                </div>
              </div>

              {/* KSA-C bars */}
              <div className="ksa-bars">
                {[
                  { key: 'K', label: 'ความรู้', score: 80, color: '#1565C0' },
                  { key: 'S', label: 'ทักษะ', score: 70, color: '#7B1FA2' },
                  { key: 'A', label: 'เจตคติ', score: 85, color: '#00897B' },
                  { key: 'C', label: 'สมรรถนะ', score: 65, color: '#E65100' },
                ].map(k => (
                  <div key={k.key} className="ksa-row">
                    <div className="ksa-label">
                      <span className="ksa-key" style={{color: k.color}}>{k.key}</span>
                      <span className="ksa-name">{k.label}</span>
                    </div>
                    <div className="ksa-bar-wrap">
                      <div className="progress-bar-wrap" style={{flex:1}}>
                        <div className="progress-bar-fill" style={{width: `${k.score}%`, background: k.color}} />
                      </div>
                      <span className="ksa-score" style={{color: k.color}}>{k.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dash-section">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">เมนูหลัก</h2>
          </div>
          <div className="quick-actions">
            {quickActions.map(a => (
              <Link key={a.href} href={a.href} className="quick-action">
                <div className="quick-action-icon" style={{background: a.bg}}>
                  <span style={{fontSize: 26}}>{a.icon}</span>
                </div>
                <span className="quick-action-label" style={{color: a.color}}>{a.label}</span>
                <span className="quick-action-sub">{a.sublabel}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dash-section">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">กิจกรรมล่าสุด</h2>
            <Link href="/learn" className="text-sm text-primary font-semibold">ดูทั้งหมด →</Link>
          </div>
          <div className="activity-list">
            {recentActivities.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{background: a.color + '18'}}>
                  <span style={{fontSize:22}}>{a.icon}</span>
                </div>
                <div className="activity-info">
                  <div className="activity-title">{a.title}</div>
                  <div className="activity-sub">{a.subtitle}</div>
                </div>
                <div className="activity-right">
                  {a.score !== null && (
                    <div className="activity-score" style={{color: a.color}}>{a.score}</div>
                  )}
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Units Progress */}
        <div className="dash-section">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">โมดูลการเรียนรู้</h2>
            <Link href="/learn" className="text-sm text-primary font-semibold">ดูทั้งหมด →</Link>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {[
              { id: 1, title: 'Restaurant Equipment', emoji: '🍳', progress: 100, status: 'เสร็จแล้ว', color: '#1565C0' },
              { id: 2, title: 'Table Setting', emoji: '🍽️', progress: 75, status: 'กำลังเรียน', color: '#7B1FA2' },
              { id: 3, title: 'Taking Food Orders', emoji: '📝', progress: 80, status: 'Role Play', color: '#00897B' },
              { id: 4, title: 'Handling Complaints', emoji: '🤝', progress: 30, status: 'เริ่มต้น', color: '#E65100' },
              { id: 5, title: 'Service Recovery', emoji: '⭐', progress: 0, status: 'ยังไม่เริ่ม', color: '#757575' },
            ].map(u => (
              <Link key={u.id} href={`/learn/${u.id}`} className="unit-row">
                <div className="unit-icon" style={{background: u.color + '15'}}>
                  <span style={{fontSize:22}}>{u.emoji}</span>
                </div>
                <div className="unit-info">
                  <div className="unit-title">Unit {u.id}: {u.title}</div>
                  <div className="progress-bar-wrap" style={{marginTop:6}}>
                    <div className="progress-bar-fill" style={{width:`${u.progress}%`, background: u.color}} />
                  </div>
                </div>
                <div className="unit-right">
                  <div className="unit-pct" style={{color: u.color}}>{u.progress}%</div>
                  <div className="unit-status">{u.status}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dash-hero {
          background: var(--gradient-primary);
          padding: 48px 0 0;
          position: relative;
          overflow: hidden;
        }
        .dash-hero::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 160px; height: 160px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
        }
        .dash-hero-inner {
          padding: 0 var(--space-4) 0;
          position: relative;
          z-index: 1;
        }
        .dash-greeting {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-5);
        }
        .dash-hi { font-size: 13px; color: rgba(255,255,255,0.8); display: block; }
        .dash-name { font-size: 22px; font-weight: 700; color: white; margin: 2px 0; }
        .dash-subtitle { font-size: 12px; color: rgba(255,255,255,0.7); }
        .dash-avatar {
          width: 52px; height: 52px;
          background: rgba(255,255,255,0.2);
          border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          border: 2px solid rgba(255,255,255,0.3);
        }
        .dash-stats {
          display: flex;
          background: rgba(255,255,255,0.15);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          padding: var(--space-4);
          gap: var(--space-2);
        }
        .dash-stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .dash-stat-icon { font-size: 18px; }
        .dash-stat-value { font-size: 22px; font-weight: 700; color: white; }
        .dash-stat-label { font-size: 11px; color: rgba(255,255,255,0.8); }
        .dash-content {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .dash-section { margin-bottom: var(--space-6); }
        .progress-card {
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }
        .progress-card-inner {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
        }
        .circular-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .circular-text {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .circular-pct { font-size: 18px; font-weight: 700; color: var(--primary); }
        .circular-label { font-size: 10px; color: var(--success); font-weight: 600; }
        .ksa-bars { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .ksa-row { display: flex; flex-direction: column; gap: 3px; }
        .ksa-label { display: flex; align-items: center; gap: 6px; }
        .ksa-key { font-size: 13px; font-weight: 700; width: 16px; }
        .ksa-name { font-size: 11px; color: var(--text-muted); }
        .ksa-bar-wrap { display: flex; align-items: center; gap: 6px; }
        .ksa-score { font-size: 11px; font-weight: 700; width: 30px; text-align: right; }
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3);
        }
        .quick-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--space-3) var(--space-2);
          box-shadow: var(--shadow-sm);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .quick-action:active { transform: scale(0.95); }
        .quick-action-icon {
          width: 52px; height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .quick-action-label { font-size: 12px; font-weight: 700; }
        .quick-action-sub { font-size: 10px; color: var(--text-muted); }
        .activity-list { display: flex; flex-direction: column; gap: 8px; }
        .activity-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: white;
          border-radius: var(--radius-md);
          padding: var(--space-3);
          box-shadow: var(--shadow-sm);
        }
        .activity-icon {
          width: 44px; height: 44px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .activity-info { flex: 1; min-width: 0; }
        .activity-title { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .activity-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .activity-right { text-align: right; flex-shrink: 0; }
        .activity-score { font-size: 15px; font-weight: 700; }
        .activity-time { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
        .unit-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: white;
          border-radius: var(--radius-md);
          padding: var(--space-3);
          box-shadow: var(--shadow-sm);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .unit-row:active { transform: scale(0.98); }
        .unit-icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .unit-info { flex: 1; min-width: 0; }
        .unit-title { font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
        .unit-right { text-align: right; flex-shrink: 0; min-width: 50px; }
        .unit-pct { font-size: 14px; font-weight: 700; }
        .unit-status { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
      `}</style>
    </div>
  )
}
