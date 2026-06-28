'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'

const myClasses = [
  { id: 1, name: 'ปวช.1/1 สาขาการโรงแรม (วิชาการบริการอาหารฯ 20701-2020)', students: 28, progress: 78, activeToday: 22, emoji: '🍽️', color: '#1E4D3A', bg: '#EAF3EE' },
  { id: 2, name: 'ปวช.1/2 สาขาการโรงแรม (วิชาการบริการอาหารฯ 20701-2020)', students: 25, progress: 62, activeToday: 15, emoji: '🥤', color: '#A6882A', bg: '#FBF6E9' },
]

const pendingGrading = [
  { id: 'sub-001', student: 'นายสมชาย ใจดี', task: 'Simulation: รับคำสั่งอาหาร (Taking Food Orders)', type: 'Navigate', submittedAt: '10 นาทีที่แล้ว', class: 'ปวช.1/1', avatar: '👨‍🎓' },
  { id: 'sub-002', student: 'นางสาววิภา ดีใจ', task: 'AI Scan: ตรวจวิเคราะห์อุปกรณ์จัดบาร์แก้วเครื่องดื่ม', type: 'Familiarize', submittedAt: '1 ชั่วโมงที่แล้ว', class: 'ปวช.1/1', avatar: '👩‍🎓' },
  { id: 'sub-003', student: 'นายพิชัย นักเรียน', task: 'Gemini Conversation: ทักทายลูกค้าเป็นภาษาอังกฤษ (Greeting)', type: 'Interact', submittedAt: '3 ชั่วโมงที่แล้ว', class: 'ปวช.1/2', avatar: '👨‍🎓' },
]

const needHelpStudents = [
  { name: 'นายมานะ ตั้งเรียน', score: 58, class: 'ปวช.1/1', issue: 'คะแนนการรับคำสั่งอาหาร (C) ต่ำกว่าเกณฑ์ 60%', avatar: '👨‍🎓' },
  { name: 'นางสาวสายใจ รักสงบ', score: 62, class: 'ปวช.1/2', issue: 'ไม่ผ่านเกณฑ์ทักษะสื่อสารภาษาอังกฤษ (S)', avatar: '👩‍🎓' },
]

export default function TeacherDashboard() {
  const { user } = useRole()
  const [announcements, setAnnouncements] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('systemNews')
      if (stored) {
        try {
          setAnnouncements(JSON.parse(stored))
        } catch (e) {}
      }
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div className="erp-card" style={{ background: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 60%, #2A6B52 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '140px', height: '140px', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '80px', height: '80px', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50%' }} />
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#C9A84C', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>♛ FINE Model 3D · Teacher ERP</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.02em' }}>หน้าจัดการเรียนรู้ครูผู้สอน (Teacher Portal)</h2>
        <p style={{ opacity: 0.75, fontSize: '14px', marginTop: '6px' }}>
          วิทยาลัยอาชีวศึกษา · ยินดีต้อนรับ คุณครู {user?.name}
        </p>
        <div style={{ marginTop: '12px', width: '60px', height: '2px', background: 'linear-gradient(90deg, #A6882A, #C9A84C, #E0C068)' }} />
      </div>

      {/* 📢 บอร์ดประกาศและข่าวสารจากผู้ดูแลระบบ (System Notices) */}
      {announcements.length > 0 && (
        <div className="erp-card" style={{ background: '#FFFDF6', border: '1.5px solid #C9A84C', padding: '16px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#A6882A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📢 ประกาศด่วนและข่าวสารจากผู้ดูแลระบบ
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
            {announcements.map((news: any) => (
              <div key={news.id} style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    background: news.priority === 'urgent' ? '#FAE8EB' : news.priority === 'event' ? '#FBF6E9' : '#EAF3EE',
                    color: news.priority === 'urgent' ? '#8B2635' : news.priority === 'event' ? '#A6882A' : '#1E4D3A',
                    fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px'
                  }}>
                    {news.priority === 'urgent' ? 'ด่วนที่สุด (Urgent)' : news.priority === 'event' ? 'กิจกรรม (Event)' : 'ประกาศทั่วไป'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{news.publishedAt}</span>
                </div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E4D3A', marginTop: '6px' }}>{news.title}</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                  {news.content}
                </p>
                {news.tags && news.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    {news.tags.map((t: string) => (
                      <span key={t} style={{ background: '#EDE9E1', color: '#554D41', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px' }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="erp-kpi-grid">
        {[
          { label: 'ชั้นเรียนปวช.1 ในระบบ', value: '2 ห้องเรียน', icon: '🏫', color: '#1E4D3A', bg: '#EAF3EE' },
          { label: 'นักเรียนทั้งหมด', value: '53 คน', icon: '👥', color: '#A6882A', bg: '#FBF6E9' },
          { label: 'คำขอตรวจ Rubric รอกระบวนการ', value: '3 รายการ', icon: '📋', color: '#C9A84C', bg: '#FBF6E9' },
          { label: 'คะแนนเฉลี่ยระดับสมรรถนะ', value: '74.2%', icon: '📈', color: '#1E4D3A', bg: '#EAF3EE' },
        ].map(k => (
          <div key={k.label} className="erp-kpi-card" style={{ borderLeft: `4px solid ${k.color}` }}>
            <div className="erp-kpi-info">
              <span className="erp-kpi-label">{k.label}</span>
              <span className="erp-kpi-value" style={{ color: k.color }}>{k.value}</span>
            </div>
            <div className="erp-kpi-icon" style={{ background: k.bg }}>
              <span style={{ fontSize: '24px' }}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left Side: Classes & Grading queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Classes list */}
          <div className="erp-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1E4D3A' }}>🏫 ห้องเรียนและรายวิชาที่ดูแล (8 หน่วยการเรียนรู้ 18 สัปดาห์)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myClasses.map(cls => (
                <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '16px', background: '#FDFAF4' }}>
                  <div style={{ width: 52, height: 52, background: cls.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
                    {cls.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{cls.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      👥 จำนวน: {cls.students} คน · ฝึกฝนแอปวันนี้: {cls.activeToday} คน
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>สัดส่วนการพัฒนาสมรรถนะเฉลี่ย (KSA-C)</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: cls.color }}>{cls.progress}%</span>
                      </div>
                      <div className="progress-bar-wrap" style={{ height: '8px' }}>
                        <div className="progress-bar-fill" style={{ width: `${cls.progress}%`, background: cls.color }} />
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px', borderColor: cls.color, color: cls.color }}>
                    เข้าสู่ห้อง
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Grading Table */}
          <div className="erp-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1E4D3A' }}>📋 ชิ้นงานและคลิปประเมินสมรรถนะรอการอนุมัติคะแนน (Pending Rubric Review)</h3>
            <div className="erp-table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>นักเรียน</th>
                    <th>ห้อง</th>
                    <th>ชิ้นงานตามกรอบ FINE</th>
                    <th>เวลาส่ง</th>
                    <th style={{ textAlign: 'center' }}>การประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingGrading.map(g => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 700 }}>
                        <span style={{ marginRight: '6px' }}>{g.avatar}</span> {g.student}
                      </td>
                      <td>{g.class}</td>
                      <td>
                        <span className="badge" style={{
                          background: g.type === 'Familiarize' ? '#EAF3EE' : g.type === 'Interact' ? '#FBF6E9' : '#FDFAF4',
                          color: g.type === 'Familiarize' ? '#1E4D3A' : g.type === 'Interact' ? '#A6882A' : '#C9A84C',
                          fontSize: '11px', fontWeight: 700, border: '1px solid rgba(201,168,76,0.15)'
                        }}>
                          {g.type}
                        </span>
                        <span style={{ marginLeft: '8px', fontSize: '13px' }}>{g.task}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{g.submittedAt}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '12px', border: 'none', borderRadius: '8px', color: '#1A1410', fontWeight: 700 }}>
                          กรอกรูบริค
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Alerts / Students needing attention & Implementation Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* FINE Model Framework Guide */}
          <div className="erp-card" style={{ border: '1px solid rgba(201,168,76,0.25)', background: '#FDFAF4' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E4D3A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📖 กรอบแนวคิดนวัตกรรม FINE Model 3D
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
              การจัดกิจกรรมตามลำดับขั้นตอนเพื่อพัฒนาสมรรถนะภาษาอังกฤษด้านการบริการตามเกณฑ์คู่มือครู
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { stage: 'F - Familiarize', tech: 'AR 3D + AI Scan', ksa: 'Knowledge (K) 20%', desc: 'คุ้นเคยกับคำศัพท์เฉพาะ อุปกรณ์จัดบาร์ เมนูอาหาร' },
                { stage: 'I - Interact', tech: 'AI Gemini Conversation', ksa: 'Skill (S) 30%', desc: 'ฝึกการออกเสียง โต้ตอบรับส่งคำทักทาย' },
                { stage: 'N - Navigate', tech: 'Simulation-Based', ksa: 'Competency (C) 40%', desc: 'ฝึกสถานการณ์เสมือนจริง การรับออเดอร์ บริการ' },
                { stage: 'E - Exhibit', tech: 'Rubrics + Portfolio', ksa: 'Attribute (A) 10%', desc: 'แสดงผลงานจริง ประเมินบุคลิกภาพ จิตบริการ' },
              ].map(f => (
                <div key={f.stage} style={{ borderBottom: '1px solid #EDE9E1', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A' }}>{f.stage}</span>
                    <span style={{ fontSize: '11px', background: '#F5F0E6', color: '#A6882A', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{f.ksa}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    เทคโนโลยี: {f.tech} · {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help needed panel */}
          <div className="erp-card" style={{ border: '1.5px solid #C9A84C', background: '#FFFDF6' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#A6882A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ นักเรียนที่ค้างส่งหรือคะแนนต่ำกว่าเกณฑ์ผ่าน (70%)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {needHelpStudents.map((s, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, background: '#FBF6E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {s.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.name} ({s.class})</div>
                    <div style={{ fontSize: '11px', color: '#A6882A', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {s.issue}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#8B2635' }}>{s.score}%</div>
                    <button className="btn btn-outline btn-sm" style={{ fontSize: '10px', padding: '3px 8px', marginTop: '4px', borderColor: '#C9A84C', color: '#A6882A' }}>
                      ติดต่อช่วยสอน
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions List */}
          <div className="erp-card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#1E4D3A' }}>⚡ ทางลัดด่วน (Quick Links)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/teacher/assignments" style={{ display: 'block', padding: '12px', background: '#FDFAF4', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', textDecoration: 'none', color: '#1E4D3A', fontWeight: 700, fontSize: '13px' }}>
                📋 สร้างงานที่มอบหมายตามลำดับ F-I-N-E
              </Link>
              <Link href="/teacher/students" style={{ display: 'block', padding: '12px', background: '#FDFAF4', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', textDecoration: 'none', color: '#A6882A', fontWeight: 700, fontSize: '13px' }}>
                📊 เปิดรายงานสมรรถนะรายบุคคล (KSA-C)
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
