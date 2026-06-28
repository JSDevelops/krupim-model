'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'

interface StudentRecord {
  id: string
  name: string
  class: string
  school: string
  sessions: number
  ksa: {
    K: number
    S: number
    A: number
    C: number
  }
  lastActive: string
  avatar: string
}

interface PendingGradingItem {
  id: string
  studentId: string
  studentName: string
  class: string
  taskName: string
  type: 'Familiarize' | 'Interact' | 'Navigate' | 'Exhibit'
  unit: string
  submittedAt: string
  avatar: string
}

export default function TeacherDashboard() {
  const { user } = useRole()
  const [announcements, setAnnouncements] = useState<any[]>([])
  
  // Dynamic Datasets
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [pendingList, setPendingList] = useState<PendingGradingItem[]>([])
  const [classFilter, setClassFilter] = useState<string>('all')

  // Grading Modal States
  const [selectedGrading, setSelectedGrading] = useState<PendingGradingItem | null>(null)
  const [scoreK, setScoreK] = useState<number>(80)
  const [scoreS, setScoreS] = useState<number>(75)
  const [scoreA, setScoreA] = useState<number>(85)
  const [scoreC, setScoreC] = useState<number>(70)
  const [gradingNotes, setGradingNotes] = useState<string>('ผ่านเกณฑ์การประเมินสมรรถนะสะสมเบื้องต้น')

  // Initialize and load data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Announcements
      const storedNews = localStorage.getItem('systemNews')
      if (storedNews) {
        try { setAnnouncements(JSON.parse(storedNews)) } catch (e) {}
      }

      // 2. Classroom Students
      const storedStudents = localStorage.getItem('classroomStudents')
      let studentList: StudentRecord[] = []
      if (storedStudents) {
        try {
          studentList = JSON.parse(storedStudents)
        } catch (e) {}
      }
      
      // Fallback default populated student roster if empty
      if (studentList.length === 0) {
        studentList = [
          { id: 'std-001', name: 'นายสมชาย ใจดี', class: 'ปวช.1/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 45, ksa: { K: 80, S: 75, A: 82, C: 70 }, lastActive: '10 นาทีที่แล้ว', avatar: '👨‍🎓' },
          { id: 'std-002', name: 'นางสาวมาลี สวยงาม', class: 'ปวช.1/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 62, ksa: { K: 95, S: 90, A: 94, C: 88 }, lastActive: '1 ชั่วโมงที่แล้ว', avatar: '👩‍🎓' },
          { id: 'std-003', name: 'นายพิชัย นักเรียน', class: 'ปวช.1/2', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 18, ksa: { K: 50, S: 42, A: 48, C: 38 }, lastActive: '3 ชั่วโมงที่แล้ว', avatar: '👨‍🎓' },
          { id: 'std-004', name: 'นางสาวกาญจนา ดีใจ', class: 'ปวช.1/2', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 33, ksa: { K: 68, S: 62, A: 70, C: 58 }, lastActive: 'เมื่อวานนี้', avatar: '👩‍🎓' },
          { id: 'std-005', name: 'นายอนันต์ มีใจ', class: 'ปวช.1/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 55, ksa: { K: 90, S: 85, A: 92, C: 82 }, lastActive: '2 ชั่วโมงที่แล้ว', avatar: '👨‍🎓' },
          { id: 'std-006', name: 'นายมานะ ตั้งเรียน', class: 'ปวช.1/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 12, ksa: { K: 58, S: 55, A: 62, C: 58 }, lastActive: '3 วันที่แล้ว', avatar: '👨‍🎓' },
          { id: 'std-007', name: 'นางสาวสายใจ รักสงบ', class: 'ปวช.1/2', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 25, ksa: { K: 64, S: 58, A: 72, C: 62 }, lastActive: '5 วันที่แล้ว', avatar: '👩‍🎓' }
        ]
        localStorage.setItem('classroomStudents', JSON.stringify(studentList))
      }
      setStudents(studentList)

      // 3. Pending Rubric Reviews
      const storedPending = localStorage.getItem('pendingGradings')
      let pendingListItems: PendingGradingItem[] = []
      if (storedPending) {
        try { pendingListItems = JSON.parse(storedPending) } catch (e) {}
      } else {
        pendingListItems = [
          { id: 'grad-001', studentId: 'std-001', studentName: 'นายสมชาย ใจดี', class: 'ปวช.1/1', taskName: 'Simulation: รับคำสั่งอาหาร (Taking Food Orders)', type: 'Navigate', unit: 'Unit 2 - Hospitality service', submittedAt: '10 นาทีที่แล้ว', avatar: '👨‍🎓' },
          { id: 'grad-002', studentId: 'std-002', studentName: 'นางสาววิภา ดีใจ', class: 'ปวช.1/1', taskName: 'AI Scan: ตรวจวิเคราะห์อุปกรณ์จัดบาร์แก้วเครื่องดื่ม', type: 'Familiarize', unit: 'Unit 1 - Table Setting', submittedAt: '1 ชั่วโมงที่แล้ว', avatar: '👩‍🎓' },
          { id: 'grad-003', studentId: 'std-003', studentName: 'นายพิชัย นักเรียน', class: 'ปวช.1/2', taskName: 'Gemini Conversation: ทักทายลูกค้าเป็นภาษาอังกฤษ (Greeting)', type: 'Interact', unit: 'Unit 1 - Reception English', submittedAt: '3 ชั่วโมงที่แล้ว', avatar: '👨‍🎓' }
        ]
        localStorage.setItem('pendingGradings', JSON.stringify(pendingListItems))
      }
      setPendingList(pendingListItems)
    }
  }, [])

  // Filter students and pending items by class
  const filteredStudents = classFilter === 'all' 
    ? students 
    : students.filter(s => s.class === classFilter)

  const filteredPending = classFilter === 'all'
    ? pendingList
    : pendingList.filter(g => g.class === classFilter)

  // Calculations based on filtered list
  const totalStudents = filteredStudents.length
  const totalSessions = filteredStudents.reduce((acc, curr) => acc + curr.sessions, 0)
  
  const avgK = totalStudents ? Math.round(filteredStudents.reduce((acc, curr) => acc + curr.ksa.K, 0) / totalStudents) : 0
  const avgS = totalStudents ? Math.round(filteredStudents.reduce((acc, curr) => acc + curr.ksa.S, 0) / totalStudents) : 0
  const avgA = totalStudents ? Math.round(filteredStudents.reduce((acc, curr) => acc + curr.ksa.A, 0) / totalStudents) : 0
  const avgC = totalStudents ? Math.round(filteredStudents.reduce((acc, curr) => acc + curr.ksa.C, 0) / totalStudents) : 0
  const classAvgProgress = Math.round((avgK * 0.2) + (avgS * 0.3) + (avgA * 0.1) + (avgC * 0.4))

  // Students needing attention (score < 70%)
  const needHelpList = filteredStudents.filter(s => {
    const avg = Math.round((s.ksa.K * 0.2) + (s.ksa.S * 0.3) + (s.ksa.A * 0.1) + (s.ksa.C * 0.4))
    return avg < 70
  }).map(s => {
    const avg = Math.round((s.ksa.K * 0.2) + (s.ksa.S * 0.3) + (s.ksa.A * 0.1) + (s.ksa.C * 0.4))
    let issue = ''
    if (s.ksa.K < 65) issue = 'คะแนน Knowledge (K) ต่ำกว่าเกณฑ์ประเมิน'
    else if (s.ksa.S < 65) issue = 'ไม่ผ่านทักษะสนทนาภาษาอังกฤษ (S)'
    else if (s.ksa.C < 65) issue = 'คะแนนความเข้าใจงานบริการ (C) น้อย'
    else issue = 'ชั่วโมงฝึกทักษะสะสมต่ำกว่าเกณฑ์'
    
    return { name: s.name, class: s.class, score: avg, issue, avatar: s.avatar }
  })

  // Open grading rubric modal
  function openGradingModal(item: PendingGradingItem) {
    setSelectedGrading(item)
    // Find matching student if exists to preload scores
    const match = students.find(s => s.id === item.studentId)
    if (match) {
      setScoreK(match.ksa.K)
      setScoreS(match.ksa.S)
      setScoreA(match.ksa.A)
      setScoreC(match.ksa.C)
    } else {
      setScoreK(80)
      setScoreS(75)
      setScoreA(85)
      setScoreC(70)
    }
    setGradingNotes('กรอกประเมินเกณฑ์รูบริคสำเร็จตามคู่มือการสอน FINE Model')
  }

  // Handle saving the graded scores
  function handleSaveGrading() {
    if (!selectedGrading) return

    // 1. Update Student KSA in classroomStudents
    const updatedStudents = students.map(s => {
      if (s.id === selectedGrading.studentId) {
        return {
          ...s,
          ksa: { K: scoreK, S: scoreS, A: scoreA, C: scoreC },
          sessions: s.sessions + 1,
          lastActive: 'เพิ่งผ่านประเมินรูบริค'
        }
      }
      return s
    })
    setStudents(updatedStudents)
    localStorage.setItem('classroomStudents', JSON.stringify(updatedStudents))

    // 2. Remove from pending grading queue
    const updatedPending = pendingList.filter(p => p.id !== selectedGrading.id)
    setPendingList(updatedPending)
    localStorage.setItem('pendingGradings', JSON.stringify(updatedPending))

    alert(`บันทึกคะแนนรูบริค KSA-C ของ ${selectedGrading.studentName} สำเร็จ! 📋✨`)
    setSelectedGrading(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Welcome Banner */}
      <div className="erp-card" style={{ background: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 60%, #2A6B52 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '140px', height: '140px', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '80px', height: '80px', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50%' }} />
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#C9A84C', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>♛ FINE Model 3D · Teacher ERP</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.02em' }}>หน้าแรกคุณครูผู้สอน (Teacher Main Dashboard)</h2>
        <p style={{ opacity: 0.75, fontSize: '14px', marginTop: '6px' }}>
          ยินดีต้อนรับ คุณครู {user?.name || 'สมหญิง รักเรียน'} · บริหารจัดการสิทธิ์คะแนนและจัดสัดส่วนห้องเรียนอาชีวศึกษา
        </p>
        <div style={{ marginTop: '12px', width: '60px', height: '2px', background: 'linear-gradient(90deg, #A6882A, #C9A84C, #E0C068)' }} />
      </div>

      {/* Class Filter Dropdown Card */}
      <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #EDE9E1', borderRadius: '16px', padding: '16px 24px' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ตัวเลือกกรองการแสดงผล (Filter Selection)</span>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', marginTop: '2px' }}>🏫 เลือกห้องเรียนที่ต้องการควบคุมประเมินผล</h4>
        </div>
        <select
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
          style={{
            padding: '10px 24px',
            borderRadius: '10px',
            border: '1.5px solid #1E4D3A',
            fontSize: '13.5px',
            background: '#fff',
            fontWeight: 700,
            color: '#1E4D3A',
            cursor: 'pointer'
          }}
        >
          <option value="all">🏫 แสดงชั้นเรียนที่ดูแลทั้งหมด (All Classes)</option>
          <option value="ปวช.1/1">🍽️ ปวช. 1/1 สาขาการโรงแรม</option>
          <option value="ปวช.1/2">🥤 ปวช. 1/2 สาขาการโรงแรม</option>
        </select>
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
                {news.linkUrl && (
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={news.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderColor: '#C9A84C',
                        color: '#A6882A',
                        fontWeight: 700,
                        textDecoration: 'none',
                        borderRadius: '6px',
                        background: '#FDFAF4'
                      }}
                    >
                      🔗 เปิดดูลิงก์แนบ / เอกสารเพิ่มเติม
                    </a>
                  </div>
                )}
                {news.tags && news.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
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
          { label: 'ชั้นเรียนในการดูแลกรอง', value: classFilter === 'all' ? '2 ห้องเรียน' : '1 ห้องเรียน', icon: '🏫', color: '#1E4D3A', bg: '#EAF3EE' },
          { label: 'นักเรียนทั้งหมดรวม', value: `${totalStudents} คน`, icon: '👥', color: '#A6882A', bg: '#FBF6E9' },
          { label: 'งานส่งสะสมรอตรวจ', value: `${filteredPending.length} รายการ`, icon: '📋', color: '#C9A84C', bg: '#FBF6E9' },
          { label: 'คะแนนเฉลี่ยห้องเรียน', value: `${classAvgProgress}%`, icon: '📈', color: '#1E4D3A', bg: '#EAF3EE' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Col: Classes, Grading list & Performance charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active KSA-C metrics comparison chart */}
          <div className="erp-card">
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', color: '#1E4D3A' }}>
              📈 คะแนนสมรรถนะเฉลี่ยห้องเรียนแยกด้านสะสม (KSA-C Metrics)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#4A4138' }}>
                  <span>Knowledge (K) - ความเข้าใจคำศัพท์บริการ</span>
                  <span style={{ color: '#1E4D3A', fontWeight: 800 }}>{avgK}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#EDE9E1', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${avgK}%`, height: '100%', background: '#1E4D3A', borderRadius: '4px', transition: 'width 0.4s ease-out' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#4A4138' }}>
                  <span>Skills (S) - ทักษะปฏิบัติสนทนาภาษาอังกฤษ</span>
                  <span style={{ color: '#A6882A', fontWeight: 800 }}>{avgS}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#EDE9E1', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${avgS}%`, height: '100%', background: '#A6882A', borderRadius: '4px', transition: 'width 0.4s ease-out' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#4A4138' }}>
                  <span>Attribute (A) - คุณลักษณะจิตบริการ & บุคลิกภาพ</span>
                  <span style={{ color: '#C9A84C', fontWeight: 800 }}>{avgA}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#EDE9E1', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${avgA}%`, height: '100%', background: '#C9A84C', borderRadius: '4px', transition: 'width 0.4s ease-out' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#4A4138' }}>
                  <span>Competency (C) - ความพร้อมสถานการณ์บริการเสมือน</span>
                  <span style={{ color: '#103024', fontWeight: 800 }}>{avgC}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#EDE9E1', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${avgC}%`, height: '100%', background: '#103024', borderRadius: '4px', transition: 'width 0.4s ease-out' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Pending Grading Queue Table */}
          <div className="erp-card">
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', color: '#1E4D3A' }}>
              📋 ชิ้นงานและสแกน AR รอให้คะแนนวิชาชีพ (Rubric Queue)
            </h3>
            
            {filteredPending.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '32px' }}>🎉</span>
                <div style={{ fontWeight: 700, marginTop: '8px' }}>ไม่มีรายการรอกรอกประเมินรูบริคขณะนี้</div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>นักเรียนส่งประเมินครบถ้วนและได้รับการตรวจเกรดหมดแล้ว</div>
              </div>
            ) : (
              <div className="erp-table-container">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>นักเรียน</th>
                      <th>ห้องเรียน</th>
                      <th>ประเภทกิจกรรม (FINE)</th>
                      <th>ส่งเมื่อ</th>
                      <th style={{ textAlign: 'center' }}>ประเมิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPending.map(g => (
                      <tr key={g.id}>
                        <td style={{ fontWeight: 750, color: '#333' }}>
                          <span style={{ marginRight: '6px' }}>{g.avatar}</span> {g.studentName}
                        </td>
                        <td>{g.class}</td>
                        <td>
                          <span className="badge" style={{
                            background: g.type === 'Familiarize' ? '#EAF3EE' : g.type === 'Interact' ? '#FBF6E9' : '#FDFAF4',
                            color: g.type === 'Familiarize' ? '#1E4D3A' : g.type === 'Interact' ? '#A6882A' : '#C9A84C',
                            fontSize: '10.5px', fontWeight: 750, border: '1px solid rgba(201,168,76,0.15)'
                          }}>
                            {g.type}
                          </span>
                          <span style={{ marginLeft: '6px', fontSize: '12.5px', color: '#4A4138' }}>{g.taskName}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{g.submittedAt}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => openGradingModal(g)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 12px', fontSize: '12px', border: 'none', borderRadius: '8px', color: 'white', background: '#1E4D3A', fontWeight: 700 }}
                          >
                            กรอกรูบริค
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Attention list & FINE conceptual details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Attention panel */}
          <div className="erp-card" style={{ border: '1.5px solid #C9A84C', background: '#FFFDF6' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#A6882A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ นักเรียนที่คะแนนต่ำกว่าเกณฑ์เฉลี่ย (70%)
            </h3>
            
            {needHelpList.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#A6882A', fontStyle: 'italic', fontSize: '12.5px' }}>
                🎉 นักเรียนทุกคนผ่านเกณฑ์ประเมินสะสมขั้นต่ำ 70% ครบถ้วน
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {needHelpList.map((s, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 38, height: 38, background: '#FBF6E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      {s.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 750, fontSize: '13px', color: '#4A4138' }}>{s.name} ({s.class})</div>
                      <div style={{ fontSize: '11px', color: '#8B2635', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        💡 {s.issue}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#8B2635' }}>{s.score}%</div>
                      <button
                        onClick={() => alert(`ส่งการแจ้งเตือนคู่มือแบบทดสอบทักษะเพิ่มเติมไปยังบัญชี ${s.name} สำเร็จ`)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '10px', padding: '3px 8px', marginTop: '4px', borderColor: '#C9A84C', color: '#A6882A', background: 'transparent' }}
                      >
                        ติวเสริม
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="erp-card">
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', color: '#1E4D3A' }}>⚡ ทางลัดด่วนคุณครู (Quick Links)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/teacher/assignments" style={{ display: 'block', padding: '12px', background: '#FDFAF4', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', textDecoration: 'none', color: '#1E4D3A', fontWeight: 700, fontSize: '13px' }}>
                📋 มอบหมายงานสแกน AR และ AI Chat (F-I-N-E)
              </Link>
              <Link href="/teacher/students" style={{ display: 'block', padding: '12px', background: '#FDFAF4', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', textDecoration: 'none', color: '#A6882A', fontWeight: 700, fontSize: '13px' }}>
                👥 จัดการสิทธิ์บัญชีนักเรียน & เกรดรวม KSA-C
              </Link>
            </div>
          </div>

          {/* FINE framework guide */}
          <div className="erp-card" style={{ background: '#FDFAF4', border: '1px solid rgba(201,168,76,0.2)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', marginBottom: '12px' }}>
              📖 ขั้นตอนนวัตกรรมการศึกษา FINE Model
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', lineHeight: 1.5 }}>
              <div style={{ paddingBottom: '6px', borderBottom: '1px solid #EDE9E1' }}>
                <strong style={{ color: '#1E4D3A' }}>F - Familiarize:</strong> คุ้นเคยคำศัพท์ผ่าน 3D AR + AI Scan (K 20%)
              </div>
              <div style={{ paddingBottom: '6px', borderBottom: '1px solid #EDE9E1' }}>
                <strong style={{ color: '#A6882A' }}>I - Interact:</strong> โต้ตอบสนทนาภาษาอังกฤษกับบอท AI (S 30%)
              </div>
              <div style={{ paddingBottom: '6px', borderBottom: '1px solid #EDE9E1' }}>
                <strong style={{ color: '#C9A84C' }}>N - Navigate:</strong> จำลองสถานการณ์บริการ F&B เสมือน (C 40%)
              </div>
              <div>
                <strong style={{ color: '#103024' }}>E - Exhibit:</strong> นำเสนอผลสัมฤทธิ์ประเมินสะสม (A 10%)
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 📋 INTERACTIVE RUBRIC GRADING MODAL POPUP */}
      {selectedGrading && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div className="erp-card" style={{ width: '500px', maxWidth: '100%', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '16px', border: '1.5px solid #C9A84C' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>📋 กรอกคะแนนประเมินเกณฑ์รูบริค (KSA-C Rubric Form)</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{selectedGrading.taskName}</div>
              </div>
              <button onClick={() => setSelectedGrading(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#A6882A' }}>✕</button>
            </div>

            {/* Student metadata info */}
            <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1.5px solid #EDE9E1' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4A4138' }}>
                ผู้ส่งประเมิน: {selectedGrading.avatar} {selectedGrading.studentName} ({selectedGrading.class})
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                หมวดวิชา: {selectedGrading.unit} · หมวดกิจกรรม: {selectedGrading.type}
              </div>
            </div>

            {/* Score Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* K */}
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ color: '#1E4D3A' }}>Knowledge (K) - ความเข้าใจคำศัพท์บริการ</span>
                  <span style={{ color: '#1E4D3A' }}>{scoreK} / 100</span>
                </div>
                <input type="range" min="0" max="100" value={scoreK} onChange={e => setScoreK(Number(e.target.value))} style={{ width: '100%', marginTop: '6px', cursor: 'pointer' }} />
              </div>

              {/* S */}
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ color: '#A6882A' }}>Skills (S) - ทักษะสนทนาภาษาอังกฤษ</span>
                  <span style={{ color: '#A6882A' }}>{scoreS} / 100</span>
                </div>
                <input type="range" min="0" max="100" value={scoreS} onChange={e => setScoreS(Number(e.target.value))} style={{ width: '100%', marginTop: '6px', cursor: 'pointer' }} />
              </div>

              {/* A */}
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ color: '#C9A84C' }}>Attribute (A) - บุคลิกภาพ/จิตบริการ</span>
                  <span style={{ color: '#C9A84C' }}>{scoreA} / 100</span>
                </div>
                <input type="range" min="0" max="100" value={scoreA} onChange={e => setScoreA(Number(e.target.value))} style={{ width: '100%', marginTop: '6px', cursor: 'pointer' }} />
              </div>

              {/* C */}
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ color: '#103024' }}>Competency (C) - ความเชี่ยวชาญการจำลอง</span>
                  <span style={{ color: '#103024' }}>{scoreC} / 100</span>
                </div>
                <input type="range" min="0" max="100" value={scoreC} onChange={e => setScoreC(Number(e.target.value))} style={{ width: '100%', marginTop: '6px', cursor: 'pointer' }} />
              </div>

            </div>

            {/* Note text field */}
            <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="erp-label" style={{ fontWeight: 700, fontSize: '11.5px' }}>ข้อเสนอแนะเพิ่มเติมเพื่อพัฒนาการเรียนรู้ (Feedback Notes)</label>
              <input
                className="erp-input"
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '12.5px' }}
                value={gradingNotes}
                onChange={e => setGradingNotes(e.target.value)}
              />
            </div>

            {/* Modal Footer / Actions */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #EDE9E1', paddingTop: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setSelectedGrading(null)}
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveGrading}
                className="btn btn-primary"
                style={{ flex: 1.5, padding: '10px', border: 'none', fontSize: '13px', background: 'linear-gradient(135deg, #1E4D3A 0%, #103024 100%)', color: 'white', fontWeight: 700 }}
              >
                💾 บันทึกเกรดประเมิน
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
