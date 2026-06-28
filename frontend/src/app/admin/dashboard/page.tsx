'use client'
import { useState, useEffect } from 'react'
import { useRole } from '@/context/RoleContext'

const stats = [
  { value: '3', label: 'โรงเรียนทั้งหมด', icon: '🏫', color: '#1E4D3A', bg: '#EAF3EE' },
  { value: '12', label: 'ครูผู้สอน', icon: '👩‍🏫', color: '#A6882A', bg: '#FBF6E9' },
  { value: '156', label: 'นักเรียนทั้งหมด', icon: '👨‍🎓', color: '#1E4D3A', bg: '#EAF3EE' },
  { value: '89%', label: 'คะแนนผลสัมฤทธิ์เฉลี่ย', icon: '🎯', color: '#C9A84C', bg: '#FBF6E9' },
]

const initialLogs = [
  { action: 'ครูสมหญิง สร้าง Assignment "AI Scan - อุปกรณ์บาร์"', time: '10 นาทีที่แล้ว', user: 'ครูสมหญิง รักเรียน', type: 'Activity' },
  { action: 'นักเรียนใหม่ลงทะเบียนผ่าน Mobile App 3 คน', time: '20 นาทีที่แล้ว', user: 'ระบบอัตโนมัติ', type: 'System' },
  { action: 'Gemini 2.0 Flash: เขียนบล็อกอาหารเสร็จสมบูรณ์', time: '1 ชั่วโมงที่แล้ว', user: 'Gemini AI', type: 'AI Service' },
  { action: 'นักเรียน นายสมชาย สำเร็จ Simulation Unit 2', time: '2 ชั่วโมงที่แล้ว', user: 'นายสมชาย ใจดี', type: 'Learning' },
]

export default function AdminDashboard() {
  const { user } = useRole()
  const [logs, setLogs] = useState(initialLogs)
  const [pingData, setPingData] = useState<any>({
    database: { status: 'online', latency: '85ms' },
    gemini: { status: 'online', latency: '195ms' },
    backend: { status: 'online', latency: '1ms' }
  })
  const [pinging, setPinging] = useState(false)

  async function handlePing() {
    setPinging(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const activeProvider = typeof window !== 'undefined' ? localStorage.getItem('activeAiProvider') || 'gemini' : 'gemini'
      const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : ''
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('openaiApiKey') || '' : ''
      const claudeKey = typeof window !== 'undefined' ? localStorage.getItem('claudeApiKey') || '' : ''

      const resp = await fetch(`${backendUrl}/api/ping-all`, {
        headers: {
          'x-ai-provider': activeProvider,
          'x-gemini-key': geminiKey,
          'x-openai-key': openaiKey,
          'x-claude-key': claudeKey
        }
      })
      if (resp.ok) {
        const data = await resp.json()
        setPingData(data.services)
      } else {
        throw new Error()
      }
    } catch (err) {
      setPingData({
        database: { status: 'offline', latency: 'Error' },
        gemini: { status: 'offline', latency: 'Error' },
        backend: { status: 'online', latency: 'Local' }
      })
    } finally {
      setPinging(false)
    }
  }

  // Add random logs to simulate activity feed
  useEffect(() => {
    const timer = setInterval(() => {
      const activities = [
        'เรียกใช้งานโมเดล AI Scan ตรวจเครื่องแก้วไวน์',
        'นักเรียนขอคำปรึกษาแชทบอทอาหารและเครื่องดื่ม',
        'ตรวจคะแนนและวิเคราะห์ Rubric เกณฑ์จัดโต๊ะ',
        'ยื่นส่งแบบฝึกหัดการบริการแบบบุฟเฟ่ต์สากล',
      ]
      const usersList = ['นายศักดิ์สิทธิ์ ตั้งใจ', 'ครูมานะ ดีงาม', 'นางสาวจินตนา พลอยดี', 'นายมานะ เรียนดี']
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      const randomUser = usersList[Math.floor(Math.random() * usersList.length)]
      
      const newLog = {
        action: `${randomUser} ${randomActivity}`,
        time: 'เมื่อสักครู่',
        user: randomUser,
        type: 'Real-time'
      }

      setLogs(prev => [newLog, ...prev.slice(0, 5)])
    }, 20000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div className="erp-card" style={{ background: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 60%, #2A6B52 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '140px', height: '140px', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '80px', height: '80px', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50%' }} />
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#C9A84C', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>♛ Six Star ERP System</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.02em' }}>ภาพรวมระบบบริหารจัดการ FINE MODE</h2>
        <p style={{ opacity: 0.75, fontSize: '14px', marginTop: '6px' }}>
          ยินดีต้อนรับคุณ {user?.name} · คุณกำลังอยู่ในหน้าควบคุมสำหรับผู้ดูแลระบบ
        </p>
        <div style={{ marginTop: '12px', width: '60px', height: '2px', background: 'linear-gradient(90deg, #A6882A, #C9A84C, #E0C068)' }} />
      </div>

      {/* KPI Stats Grid */}
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent System Activity Logs */}
        <div className="erp-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1E4D3A' }}>📜 ล็อกกิจกรรมระบบล่าสุด (System Logs)</h3>
          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>ประเภท</th>
                  <th>กิจกรรม</th>
                  <th>ผู้กระทำ</th>
                  <th>เวลา</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i}>
                    <td>
                      <span className="badge" style={{ background: '#EAF3EE', color: '#1E4D3A', fontSize: '11px', fontWeight: 600 }}>
                        {log.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.action}</td>
                    <td>{log.user}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Services Connection Health Status Monitor */}
        <div className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E4D3A' }}>⚡ สถานะระบบและ API</h3>
            <button
              onClick={handlePing}
              disabled={pinging}
              style={{
                background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 700,
                color: '#A6882A', cursor: 'pointer'
              }}
            >
              {pinging ? 'กำลังตรวจ...' : '🔌 Ping Test'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'gemini', name: 'Gemini 2.0 Flash API', desc: 'โมเดลผู้ช่วยวิชาการ & ประเมินผล' },
              { key: 'database', name: 'Supabase DB Connect', desc: 'ฐานข้อมูล PostgreSQL คลังข้อมูล' },
              { key: 'backend', name: 'Local API Server (Node)', desc: 'เซิร์ฟเวอร์ควบคุมระบบกลาง' },
            ].map(s => {
              const statusInfo = pingData[s.key] || { status: 'offline', latency: 'N/A' }
              const isOnline = statusInfo.status === 'online'
              return (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#FDFAF4', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.15)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      background: isOnline ? '#EAF3EE' : '#FAE8EB',
                      color: isOnline ? '#1E4D3A' : '#8B2635',
                      fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', display: 'inline-block'
                    }}>
                      ● {isOnline ? 'Online' : 'Offline'}
                    </span>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Latency: {statusInfo.latency}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
