'use client'
import { useState, useEffect } from 'react'
import { useRole } from '@/context/RoleContext'
import Link from 'next/link'

const stats = [
  { value: '3', label: 'วิทยาลัยอาชีวศึกษาเครือข่าย', icon: '🏫', color: '#1E4D3A', bg: '#EAF3EE' },
  { value: '12', label: 'บัญชีครูผู้สอนผ่านสิทธิ์', icon: '👩‍🏫', color: '#A6882A', bg: '#FBF6E9' },
  { value: '156', label: 'นักเรียนลงทะเบียนเรียน', icon: '👨‍🎓', color: '#1E4D3A', bg: '#EAF3EE' },
  { value: '89%', label: 'คะแนนผลสัมฤทธิ์สแกนภาพเฉลี่ย', icon: '🎯', color: '#C9A84C', bg: '#FBF6E9' },
]

const initialLogs = [
  { action: 'ครูสมหญิง สร้าง Assignment "AI Scan - อุปกรณ์บาร์"', time: '10 นาทีที่แล้ว', user: 'ครูสมหญิง รักเรียน', type: 'Activity' },
  { action: 'นักเรียนใหม่ลงทะเบียนผ่าน Mobile App 3 คน', time: '20 นาทีที่แล้ว', user: 'ระบบอัตโนมัติ', type: 'System' },
  { action: 'OpenAI GPT-4o-mini: เขียนประกาศแจ้งข่าวเสร็จสมบูรณ์', time: '1 ชั่วโมงที่แล้ว', user: 'OpenAI GPT', type: 'AI Service' },
  { action: 'นักเรียน นายสมชาย สำเร็จ Simulation Unit 2', time: '2 ชั่วโมงที่แล้ว', user: 'นายสมชาย ใจดี', type: 'Learning' },
]

const analyticsData = {
  totalSessions: 1248, weekSessions: 183,
  avgScore: 78, completionRate: 72,
  weeklyScores: [65, 72, 70, 78, 82, 75, 85],
  ksa: [
    { k: 'K', label: 'Knowledge (ความรู้)', score: 80, color: '#1E4D3A' },
    { k: 'S', label: 'Skills (ทักษะ)', score: 72, color: '#A6882A' },
    { k: 'A', label: 'Attitude (เจตคติ)', score: 85, color: '#C9A84C' },
    { k: 'C', label: 'Competency (สมรรถนะ)', score: 68, color: '#103024' }
  ],
  featureUsage: [
    { name: 'Gemini Chat', sessions: 456, pct: 90, color: '#1E4D3A', icon: '💬' },
    { name: 'AI Scan', sessions: 312, pct: 65, color: '#A6882A', icon: '🤖' },
    { name: 'Simulation', sessions: 278, pct: 55, color: '#C9A84C', icon: '🎭' },
    { name: 'AR 3D Object', sessions: 202, pct: 40, color: '#103024', icon: '📦' },
  ],
  topStudents: [
    { name: 'นายพิทักษ์ ดีเลิศ', score: 95, class: 'ปวช.1/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', avatar: '👨‍🎓' },
    { name: 'นางสาวมาลี สวยงาม', score: 92, class: 'ปวช.1/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', avatar: '👩‍🎓' },
    { name: 'นายสมพร เก่งมาก', score: 88, class: 'ปวช.1/2', school: 'วิทยาลัยอาชีวศึกษานครปฐม', avatar: '👨‍🎓' },
  ],
}
const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

export default function AdminDashboard() {
  const { user } = useRole()
  const [logs, setLogs] = useState(initialLogs)
  const [activeProvider, setActiveProvider] = useState('gemini')
  const [hasGemini, setHasGemini] = useState(false)
  const [hasOpenai, setHasOpenai] = useState(false)
  const [hasClaude, setHasClaude] = useState(false)
  
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview')

  const [pingData, setPingData] = useState<any>({
    database: { status: 'online', latency: '85ms' },
    gemini: { status: 'online', latency: '195ms' },
    backend: { status: 'online', latency: '1ms' }
  })
  const [pinging, setPinging] = useState(false)

  // Load configuration details from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveProvider(localStorage.getItem('activeAiProvider') || 'gemini')
      setHasGemini(!!localStorage.getItem('geminiApiKey'))
      setHasOpenai(!!localStorage.getItem('openaiApiKey'))
      setHasClaude(!!localStorage.getItem('claudeApiKey'))
    }
  }, [])

  async function handlePing() {
    setPinging(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://krupim-model-production.up.railway.app'
      const provider = typeof window !== 'undefined' ? localStorage.getItem('activeAiProvider') || 'gemini' : 'gemini'
      const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : ''
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('openaiApiKey') || '' : ''
      const claudeKey = typeof window !== 'undefined' ? localStorage.getItem('claudeApiKey') || '' : ''

      const resp = await fetch(`${backendUrl}/api/ping-all`, {
        headers: {
          'x-ai-provider': provider,
          'x-gemini-key': geminiKey,
          'x-openai-key': openaiKey,
          'x-claude-key': claudeKey
        }
      })
      if (resp.ok) {
        const data = await resp.json()
        setPingData(data)
      }
    } catch (e) {
    } finally {
      setPinging(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Welcome Banner Card */}
      <div className="erp-card" style={{ background: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 60%, #2A6B52 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '140px', height: '140px', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '80px', height: '80px', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50%' }} />
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#C9A84C', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>♛ FINE Model 3D · Developer Suite</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.02em' }}>ระบบจัดการพื้นที่พัฒนาซอฟต์แวร์ (Admin ERP Dashboard)</h2>
        <p style={{ opacity: 0.75, fontSize: '14px', marginTop: '6px' }}>
          วิทยาลัยอาชีวศึกษา · สิทธิ์การเข้าถึงสูงสุดของระบบวิเคราะห์ AI
        </p>
        <div style={{ marginTop: '12px', width: '60px', height: '2px', background: 'linear-gradient(90deg, #A6882A, #C9A84C, #E0C068)' }} />
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1.5px solid #EDE9E1', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'transparent', border: 'none', fontSize: '14px', fontWeight: activeTab === 'overview' ? 700 : 500,
            color: activeTab === 'overview' ? '#1E4D3A' : 'var(--text-muted)', cursor: 'pointer', padding: '10px 20px',
            borderBottom: activeTab === 'overview' ? '3px solid #1E4D3A' : 'none'
          }}
        >
          📊 ภาพรวมระบบ (System Overview)
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            background: 'transparent', border: 'none', fontSize: '14px', fontWeight: activeTab === 'analytics' ? 700 : 500,
            color: activeTab === 'analytics' ? '#1E4D3A' : 'var(--text-muted)', cursor: 'pointer', padding: '10px 20px',
            borderBottom: activeTab === 'analytics' ? '3px solid #1E4D3A' : 'none'
          }}
        >
          📈 รายงานวิเคราะห์ระบบ (Analytics Insights)
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* KPI Summary Row */}
          <div className="erp-kpi-grid">
            {stats.map(s => (
              <div key={s.label} className="erp-kpi-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                <div className="erp-kpi-info">
                  <span className="erp-kpi-label">{s.label}</span>
                  <span className="erp-kpi-value" style={{ color: s.color }}>{s.value}</span>
                </div>
                <div className="erp-kpi-icon" style={{ background: s.bg }}>
                  <span style={{ fontSize: '24px' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* QUICK SHORTCUT PANEL */}
          <div className="erp-card">
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', color: '#1E4D3A' }}>⚡ ทางลัดด่วนเข้าถึงทุกโมดูล (System Quick Shortcuts)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              
              <Link href="/admin/settings" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px', background: '#FDFBF7', border: '1px solid #EDE9E1', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = '#EDE9E1'}>
                  <span style={{ fontSize: '22px' }}>⚙️</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A' }}>ตั้งค่าระบบ (Config)</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>จัดการ API Keys & ค่าย AI</div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/users" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px', background: '#FDFBF7', border: '1px solid #EDE9E1', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = '#EDE9E1'}>
                  <span style={{ fontSize: '22px' }}>👥</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A' }}>จัดการสิทธิ์ครูผู้สอน</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>อนุมัติและปรับเปลี่ยนสิทธิ์ครู</div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/blog" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px', background: '#FDFBF7', border: '1px solid #EDE9E1', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = '#EDE9E1'}>
                  <span style={{ fontSize: '22px' }}>📢</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A' }}>แจ้งข่าวและกิจกรรม</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>แจ้งประกาศด่วนไปยังครูผู้สอน</div>
                  </div>
                </div>
              </Link>

              <div onClick={() => setActiveTab('analytics')} style={{ cursor: 'pointer' }}>
                <div style={{ padding: '14px', background: '#FDFBF7', border: '1px solid #EDE9E1', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = '#EDE9E1'}>
                  <span style={{ fontSize: '22px' }}>📊</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A' }}>สถิติวิเคราะห์ (Analytics)</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>ข้อมูลผลสัมฤทธิ์ KSA รวม</div>
                  </div>
                </div>
              </div>

              <Link href="/admin/content" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px', background: '#FDFBF7', border: '1px solid #EDE9E1', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = '#EDE9E1'}>
                  <span style={{ fontSize: '22px' }}>📚</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A' }}>จัดการคลังบทเรียน</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>เนื้อหาหลักสูตรการจัดโต๊ะ</div>
                  </div>
                </div>
              </Link>

              <Link href="/student/explore" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px', background: '#FDFBF7', border: '1px solid #EDE9E1', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = '#EDE9E1'}>
                  <span style={{ fontSize: '22px' }}>👨‍🎓</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#103024' }}>หน้าเล่นฝั่งนักเรียน</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>ทดลองสแกน AR & คุยบอท</div>
                  </div>
                </div>
              </Link>

              <Link href="/teacher/dashboard" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px', background: '#FDFBF7', border: '1px solid #EDE9E1', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = '#EDE9E1'}>
                  <span style={{ fontSize: '22px' }}>👩‍🏫</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#103024' }}>หน้าเล่นฝั่งคุณครู</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>ตรวจงานนักเรียน / ออกใบประกาศ</div>
                  </div>
                </div>
              </Link>

              <Link href="/role-select" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px', background: '#FDFBF7', border: '1px solid #EDE9E1', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = '#EDE9E1'}>
                  <span style={{ fontSize: '22px' }}>🔄</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#A6882A' }}>หน้าหลักสลับบทบาท</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>ย้อนกลับหน้าแรกเลือกบทบาท</div>
                  </div>
                </div>
              </Link>

            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            
            {/* Left Col: Real-time logs & Database Storage health */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Storage & Database Space Monitor */}
              <div className="erp-card">
                <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', color: '#1E4D3A' }}>💾 สถานะการใช้พื้นที่โปรเจค (Supabase Space Usage)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Row 1: PostgreSQL database limit */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#333', marginBottom: '4px' }}>
                      <span>พื้นที่จัดเก็บฐานข้อมูล (Database Rows Limit)</span>
                      <span style={{ color: '#1E4D3A' }}>1.4 MB / 500 MB (0.28% ของฟรีเทียร์)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#F5F5F0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '0.28%', height: '100%', background: 'linear-gradient(90deg, #1E4D3A, #103024)' }} />
                    </div>
                  </div>

                  {/* Row 2: File storage assets limit */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#333', marginBottom: '4px' }}>
                      <span>คลังเก็บไฟล์ภาพและสื่อ AR (Supabase Storage Bucket)</span>
                      <span style={{ color: '#A6882A' }}>18.2 MB / 1 GB (1.82% ของฟรีเทียร์)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#F5F5F0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '1.82%', height: '100%', background: 'linear-gradient(90deg, #A6882A, #C9A84C)' }} />
                    </div>
                  </div>

                  {/* Database metadata information */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                    <div style={{ padding: '10px', background: '#FDFAF4', border: '1px solid #EDE9E1', borderRadius: '8px', fontSize: '12px' }}>
                      <div>ตารางที่ใช้งานหลัก: <strong style={{ color: '#1E4D3A' }}>5 Tables</strong></div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>schools, users, ai_scan_items, etc.</div>
                    </div>
                    <div style={{ padding: '10px', background: '#FDFAF4', border: '1px solid #EDE9E1', borderRadius: '8px', fontSize: '12px' }}>
                      <div>จำนวนทรานแซกชันรวม: <strong style={{ color: '#1E4D3A' }}>2,450 Rows</strong></div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>อัปเดตแบบเรียลไทม์ล่าสุดวันนี้</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent logs */}
              <div className="erp-card">
                <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', color: '#1E4D3A' }}>📜 กิจกรรมระบบแบบเรียลไทม์ (Live Logs)</h3>
                <div className="erp-table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>กิจกรรม</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>เมื่อ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, fontSize: '13px' }}>
                            <span className="badge" style={{ background: '#EAF3EE', color: '#1E4D3A', fontSize: '10.5px', marginRight: '6px' }}>
                              {log.type}
                            </span>
                            {log.action}
                          </td>
                          <td style={{ fontSize: '12px' }}>{log.user}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{log.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Col: Comprehensive System Services API Health Check Monitor */}
            <div className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A' }}>🔌 ครอบคลุมการทำงาน API (Full Project API Status)</h3>
                <button
                  onClick={handlePing}
                  disabled={pinging}
                  style={{
                    background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 700,
                    color: '#A6882A', cursor: 'pointer'
                  }}
                >
                  {pinging ? 'ตรวจสถานะ...' : '🔄 ทดสอบความหน่วง (Ping)'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Supabase status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#FDFAF4', borderRadius: '10px', border: '1px solid #EDE9E1' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12.5px' }}>Supabase DB Connect</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>ฐานข้อมูล PostgreSQL หลัก</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: '#EAF3EE', color: '#1E4D3A', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>● Online</span>
                    <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Latency: {pingData.database?.latency || '85ms'}</div>
                  </div>
                </div>

                {/* Backend API status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#FDFAF4', borderRadius: '10px', border: '1px solid #EDE9E1' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12.5px' }}>Node API Server (Express)</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>หลังบ้านประมวลผลระบบสแกนภาพ</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: '#EAF3EE', color: '#1E4D3A', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>● Online</span>
                    <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Latency: {pingData.backend?.latency || '1ms'}</div>
                  </div>
                </div>

                {/* AI Providers configurations status */}
                <div style={{ borderTop: '1px dashed #EDE9E1', paddingTop: '10px', marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#A6882A', marginBottom: '8px' }}>คีย์ระบบปัญญาประดิษฐ์ (AI Core Providers)</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    
                    {/* Gemini API Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#fff', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                      <div style={{ fontSize: '11.5px' }}>
                        <strong>Google Gemini API</strong> {activeProvider === 'gemini' && '⭐'}
                      </div>
                      <span style={{
                        background: hasGemini ? '#EAF3EE' : '#FAE8EB',
                        color: hasGemini ? '#1E4D3A' : '#8B2635',
                        fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px'
                      }}>
                        {hasGemini ? 'ติดตั้งแล้ว (Configured)' : 'ไม่ได้กรอก (Not Set)'}
                      </span>
                    </div>

                    {/* OpenAI API Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#fff', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                      <div style={{ fontSize: '11.5px' }}>
                        <strong>OpenAI GPT API</strong> {activeProvider === 'openai' && '⭐'}
                      </div>
                      <span style={{
                        background: hasOpenai ? '#EAF3EE' : '#FAE8EB',
                        color: hasOpenai ? '#1E4D3A' : '#8B2635',
                        fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px'
                      }}>
                        {hasOpenai ? 'ติดตั้งแล้ว (Configured)' : 'ไม่ได้กรอก (Not Set)'}
                      </span>
                    </div>

                    {/* Claude API Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#fff', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                      <div style={{ fontSize: '11.5px' }}>
                        <strong>Anthropic Claude API</strong> {activeProvider === 'claude' && '⭐'}
                      </div>
                      <span style={{
                        background: hasClaude ? '#EAF3EE' : '#FAE8EB',
                        color: hasClaude ? '#1E4D3A' : '#8B2635',
                        fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px'
                      }}>
                        {hasClaude ? 'ติดตั้งแล้ว (Configured)' : 'ไม่ได้กรอก (Not Set)'}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Client App status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#FDFAF4', borderRadius: '10px', border: '1px solid #EDE9E1', marginTop: '4px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12.5px' }}>Frontend App (Vercel)</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>เว็บอินเตอร์เฟสนักเรียน/ครู</div>
                  </div>
                  <span style={{ background: '#EAF3EE', color: '#1E4D3A', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>● Healthy</span>
                </div>

              </div>
            </div>

          </div>
        </>
      ) : (
        /* Analytics Tab integrated directly from analytics page */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* KPI Analytics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'การเข้าเรียนรวม (Sessions)', val: analyticsData.totalSessions, desc: `+${analyticsData.weekSessions} สัปดาห์นี้`, color: '#1E4D3A' },
              { label: 'คะแนนเฉลี่ยทั้งระบบ', val: `${analyticsData.avgScore}%`, desc: 'เกณฑ์ความรู้-ทักษะ F&B', color: '#A6882A' },
              { label: 'อัตราเรียนสำเร็จรายคน', val: `${analyticsData.completionRate}%`, desc: 'วัดผลแบบ KSA-C', color: '#C9A84C' },
              { label: 'Active โรงเรียนเครือข่าย', val: '3 แห่ง', desc: 'ลงทะเบียนเรียนจริง', color: '#103024' },
            ].map(card => (
              <div key={card.label} className="erp-card" style={{ borderLeft: `4px solid ${card.color}` }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: card.color, marginTop: '4px' }}>{card.val}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{card.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
            {/* Left Col: KSA-C & Feature metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* KSA-C */}
              <div className="erp-card">
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: '#1E4D3A' }}>📊 ผลประเมินกรอบ KSA-C รายด้านเฉลี่ยทั้งระบบ</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {analyticsData.ksa.map(item => (
                    <div key={item.k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#4A4138' }}>{item.label}</span>
                        <span style={{ fontWeight: 850, color: item.color }}>{item.score}%</span>
                      </div>
                      <div className="progress-bar-wrap" style={{ height: '8px' }}>
                        <div className="progress-bar-fill" style={{ width: `${item.score}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature usage */}
              <div className="erp-card">
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: '#1E4D3A' }}>📱 สถิติกิจกรรมการเรียนรู้แยกตามฟีเจอร์นวัตกรรม</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {analyticsData.featureUsage.map(f => (
                    <div key={f.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{f.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#4A4138' }}>{f.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '220px' }}>
                        <div className="progress-bar-wrap" style={{ flex: 1, height: '6px' }}>
                          <div className="progress-bar-fill" style={{ width: `${f.pct}%`, background: f.color }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, width: '90px', textAlign: 'right', color: '#1E4D3A' }}>
                          {f.sessions} Sessions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col: Weekly graph & Top students */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Weekly bar graph */}
              <div className="erp-card">
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: '#1E4D3A' }}>🗓️ จำนวนกิจกรรมการฝึกฝนรายสัปดาห์ (Weekly Activity)</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', padding: '0 20px', margin: '20px 0' }}>
                  {analyticsData.weeklyScores.map((v, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <div style={{ width: '24px', background: 'linear-gradient(180deg, #1E4D3A, #C9A84C)', height: `${v * 1.2}px`, borderRadius: '6px 6px 0 0' }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{days[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top performers */}
              <div className="erp-card">
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: '#1E4D3A' }}>🏆 นักเรียนผลสัมฤทธิ์สมรรถนะดีเด่นระบบ FINE (Top Performers)</h3>
                <div className="erp-table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>อันดับ</th>
                        <th>ชื่อนักเรียน</th>
                        <th>ชั้นเรียน</th>
                        <th>สถาบันการศึกษา</th>
                        <th style={{ textAlign: 'center' }}>คะแนนรวม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topStudents.map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 800, fontSize: '16px' }}>{['🥇', '🥈', '🥉'][idx]}</td>
                          <td style={{ fontWeight: 700 }}>{s.name}</td>
                          <td>{s.class}</td>
                          <td>{s.school}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#1E4D3A', fontSize: '15px' }}>{s.score}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  )
}
