'use client'
import { useState } from 'react'

interface Assignment {
  id: string
  title: string
  class: string
  type: 'Familiarize' | 'Interact' | 'Navigate' | 'Exhibit'
  due: string
  submitted: number
  total: number
  emoji: string
  color: string
  desc: string
}

interface StudentSubmission {
  studentId: string
  studentName: string
  status: 'submitted' | 'pending'
  submittedAt?: string
  score?: number
  maxScore: number
  attachmentName?: string
  feedback?: string
}

const initialAssignments: Assignment[] = [
  { id: 'asg-001', title: 'F-1: AI Scan — ระบุชิ้นอุปกรณ์จัดโต๊ะอาหารและบาร์เครื่องดื่ม', class: 'ปวช.1/1', type: 'Familiarize', due: '29 มิ.ย. 2569', submitted: 2, total: 3, emoji: '🤖', color: '#1E4D3A', desc: 'ให้นักเรียนใช้ AI Scan สแกนอุปกรณ์จริงเพื่อเรียนรู้ศัพท์และสะสมคะแนนวิชาชีพคลังศัพท์ (K)' },
  { id: 'asg-002', title: 'I-1: Gemini Conversation — ฝึกรับและต้อนรับลูกค้าภาษาอังกฤษ (Greeting)', class: 'ปวช.1/1', type: 'Interact', due: '30 มิ.ย. 2569', submitted: 2, total: 3, emoji: '💬', color: '#A6882A', desc: 'ฝึกสนทนาโต้ตอบกับ AI Gemini จำลองเป็นลูกค้าเพื่อพัฒนาความมั่นใจและการสื่อสาร (S)' },
  { id: 'asg-003', title: 'N-1: Restaurant Simulation — แบบฝึกปฏิบัติการรับคำสั่งอาหาร (Taking Orders)', class: 'ปวช.1/2', type: 'Navigate', due: '1 ก.ค. 2569', submitted: 3, total: 3, emoji: '🎭', color: '#C9A84C', desc: 'สวมบทบาทแก้ปัญหาเฉพาะหน้าในสถานการณ์จำลองตามเกณฑ์เก็บคะแนนสมรรถนะการบริการ (C)' },
  { id: 'asg-004', title: 'E-1: Performance Review — ส่งคลิปสรุปทักษะการโรงแรมปลายภาคเรียน', class: 'ทั้งสองห้อง', type: 'Exhibit', due: '5 ก.ค. 2569', submitted: 0, total: 3, emoji: '🏆', color: '#1E4D3A', desc: 'ส่งแฟ้มสะสมงาน Portfolio และคลิปสาธิตการเสิร์ฟเพื่อประเมินความรับผิดชอบจิตบริการ (A)' },
]

const initialSubmissionsMap: Record<string, StudentSubmission[]> = {
  'asg-001': [
    { studentId: 'std-1', studentName: 'นายสมชาย ใจดี', status: 'submitted', submittedAt: '27 มิ.ย. 2569 14:40', score: 8, maxScore: 10, attachmentName: '🖼️ ภาพถ่าย AR: Espresso Coffee Cup' },
    { studentId: 'std-2', studentName: 'นางสาวมาลี สวยงาม', status: 'submitted', submittedAt: '28 มิ.ย. 2569 12:20', score: 10, maxScore: 10, attachmentName: '🖼️ ภาพถ่าย AR: Cocktail Shaker' },
    { studentId: 'std-3', studentName: 'นายพิชัย นักเรียน', status: 'pending', maxScore: 10 }
  ],
  'asg-002': [
    { studentId: 'std-1', studentName: 'นายสมชาย ใจดี', status: 'submitted', submittedAt: '28 มิ.ย. 2569 11:20', score: 24, maxScore: 30, attachmentName: '🔊 บันทึกเสียงบทสนทนาการทักทาย Mr. Smith' },
    { studentId: 'std-2', studentName: 'นางสาวมาลี สวยงาม', status: 'submitted', submittedAt: '28 มิ.ย. 2569 12:45', score: 29, maxScore: 30, attachmentName: '🔊 บันทึกเสียงบทสนทนาระดับสูง Mrs. Davis' },
    { studentId: 'std-3', studentName: 'นายพิชัย นักเรียน', status: 'pending', maxScore: 30 }
  ],
  'asg-003': [
    { studentId: 'std-1', studentName: 'นายสมชาย ใจดี', status: 'submitted', submittedAt: '27 มิ.ย. 2569 15:30', score: 22, maxScore: 30, attachmentName: '📂 แฟ้มจำลองสวมบทบาทแก้ปัญหาระดับ 1' },
    { studentId: 'std-2', studentName: 'นางสาวมาลี สวยงาม', status: 'submitted', submittedAt: '28 มิ.ย. 2569 10:15', score: 28, maxScore: 30, attachmentName: '📂 แฟ้มจำลองสวมบทบาทแก้ปัญหาระดับ 2' },
    { studentId: 'std-3', studentName: 'นายพิชัย นักเรียน', status: 'submitted', submittedAt: '26 มิ.ย. 2569 16:40', score: 18, maxScore: 30, attachmentName: '📂 แฟ้มจำลองสวมบทบาทเบื้องต้น' }
  ],
  'asg-004': [
    { studentId: 'std-1', studentName: 'นายสมชาย ใจดี', status: 'pending', maxScore: 40 },
    { studentId: 'std-2', studentName: 'นางสาวมาลี สวยงาม', status: 'pending', maxScore: 40 },
    { studentId: 'std-3', studentName: 'นายพิชัย นักเรียน', status: 'pending', maxScore: 40 }
  ]
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState(initialAssignments)
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, StudentSubmission[]>>(initialSubmissionsMap)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')

  // Form states
  const [title, setTitle] = useState('')
  const [targetClass, setTargetClass] = useState('ปวช.1/1')
  const [type, setType] = useState<'Familiarize' | 'Interact' | 'Navigate' | 'Exhibit'>('Familiarize')
  const [due, setDue] = useState('')
  const [desc, setDesc] = useState('')

  // Submission report / grading states
  const [activeReportAsg, setActiveReportAsg] = useState<Assignment | null>(null)
  const [gradingSub, setGradingSub] = useState<StudentSubmission | null>(null)
  const [inputScore, setInputScore] = useState<string>('')
  const [inputFeedback, setInputFeedback] = useState<string>('')

  const filtered = assignments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) || a.class.includes(search)
  )

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !due) return
    
    const emojiMap = {
      Familiarize: '🤖',
      Interact: '💬',
      Navigate: '🎭',
      Exhibit: '🏆'
    }
    
    const colorMap = {
      Familiarize: '#1E4D3A',
      Interact: '#A6882A',
      Navigate: '#C9A84C',
      Exhibit: '#1E4D3A'
    }

    const newId = `asg-00${assignments.length + 1}`
    const newAsg: Assignment = {
      id: newId,
      title,
      class: targetClass,
      type,
      due,
      submitted: 0,
      total: 3,
      emoji: emojiMap[type] || '📝',
      color: colorMap[type] || '#757575',
      desc
    }

    // Set initial mock student submissions for new assignment
    const defaultSubmissions: StudentSubmission[] = [
      { studentId: 'std-1', studentName: 'นายสมชาย ใจดี', status: 'pending', maxScore: type === 'Interact' ? 30 : type === 'Familiarize' ? 10 : 40 },
      { studentId: 'std-2', studentName: 'นางสาวมาลี สวยงาม', status: 'pending', maxScore: type === 'Interact' ? 30 : type === 'Familiarize' ? 10 : 40 },
      { studentId: 'std-3', studentName: 'นายพิชัย นักเรียน', status: 'pending', maxScore: type === 'Interact' ? 30 : type === 'Familiarize' ? 10 : 40 }
    ]

    setAssignments(prev => [newAsg, ...prev])
    setSubmissionsMap(prev => ({
      ...prev,
      [newId]: defaultSubmissions
    }))
    
    setTitle('')
    setDue('')
    setDesc('')
    setShowCreate(false)
    alert('สร้างและมอบหมายงาน/กิจกรรมเรียบร้อยแล้ว!')
  }

  function handleDelete(id: string) {
    if (confirm('คุณต้องการลบกิจกรรมการมอบหมายงานนี้ใช่หรือไม่?')) {
      setAssignments(prev => prev.filter(a => a.id !== id))
    }
  }

  function handleOpenGrading(sub: StudentSubmission) {
    setGradingSub(sub)
    setInputScore(sub.score !== undefined ? sub.score.toString() : '')
    setInputFeedback(sub.feedback || '')
  }

  function handleSaveGrade(e: React.FormEvent) {
    e.preventDefault()
    if (!activeReportAsg || !gradingSub) return

    const asgId = activeReportAsg.id
    const parsedScore = Number(inputScore)
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > gradingSub.maxScore) {
      alert(`คะแนนต้องเป็นตัวเลขระหว่าง 0 ถึง ${gradingSub.maxScore}`)
      return
    }

    // Update submissions map
    setSubmissionsMap(prev => {
      const currentList = prev[asgId] || []
      const updatedList = currentList.map(s => {
        if (s.studentId === gradingSub.studentId) {
          return {
            ...s,
            score: parsedScore,
            feedback: inputFeedback
          }
        }
        return s
      })
      return {
        ...prev,
        [asgId]: updatedList
      }
    })

    alert(`บันทึกการประเมินคะแนนให้คุณ ${gradingSub.studentName} เรียบร้อย!`)
    setGradingSub(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1E4D3A', margin: 0 }}>📋 จัดการงานและกิจกรรมการเรียนรู้ (Tasks & Activities)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', margin: '4px 0 0 0' }}>
            ติดตามสถานะการส่งงาน ประเมินคะแนน และรายงานผลงานตามกรอบสมรรถนะวิชาชีพ FINE Model
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700 }}>
          ➕ เพิ่มงานและกิจกรรมใหม่
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'งานและกิจกรรมทั้งหมด', value: assignments.length, color: '#1E4D3A' },
          { label: 'ผู้ส่งงานตรวจแล้ว', value: Object.values(submissionsMap).flatMap(x => x).filter(s => s.status === 'submitted').length, color: '#A6882A' },
          { label: 'กิจกรรมที่รอดำเนินการ', value: Object.values(submissionsMap).flatMap(x => x).filter(s => s.status === 'pending').length, color: '#C9A84C' },
          { label: 'รวมจำนวนนักเรียน ปวช.1', value: 3, color: '#1E4D3A' },
        ].map(s => (
          <div key={s.label} className="erp-kpi-card" style={{ borderLeft: `4px solid ${s.color}`, padding: '16px', background: 'white' }}>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: s.color, marginTop: '4px' }}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter search bar */}
      <div className="erp-card">
        <input
          className="erp-input"
          placeholder="ค้นหาชื่องาน กิจกรรม หรือรหัสชั้นเรียน..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tasks & Activities List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(a => {
          const currentSubs = submissionsMap[a.id] || []
          const submittedCount = currentSubs.filter(s => s.status === 'submitted').length
          const totalCount = currentSubs.length

          return (
            <div key={a.id} className="erp-card" style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 56, height: 56, borderRadius: '12px', background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', flexShrink: 0 }}>
                {a.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge" style={{ background: a.type === 'Familiarize' ? '#EAF3EE' : a.type === 'Interact' ? '#FBF6E9' : '#FDFAF4', color: a.color, fontSize: '11px', fontWeight: 700, border: '1px solid rgba(201,168,76,0.15)' }}>
                    {a.type}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ชั้นเรียน: {a.class}</span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px', margin: '6px 0 0 0' }}>{a.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', margin: '4px 0 0 0' }}>
                  {a.desc}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                  ส่งแล้ว: <span style={{ color: '#1E4D3A', fontWeight: 800 }}>{submittedCount}</span> / {totalCount} คน
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  กำหนดส่ง: {a.due}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setActiveReportAsg(a)}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#C9A84C', color: '#A6882A', fontWeight: 700 }}
                  >
                    📊 รายงานส่งงาน
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="btn btn-outline btn-sm" style={{ borderColor: '#FAE8EB', color: '#8B2635' }}>
                    ลบงาน
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ➕ Create Task Modal */}
      {showCreate && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="erp-card" style={{ width: '480px', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>📋 มอบหมายงานและกิจกรรมใหม่</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="erp-form-group">
                <label className="erp-label">ชื่อหัวข้อกิจกรรม</label>
                <input className="erp-input" placeholder="เช่น การต้อนรับลูกค้าหน้าประตู..." value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="erp-form-group">
                <label className="erp-label">คำอธิบายรายละเอียด</label>
                <textarea className="erp-input" rows={3} placeholder="ระบุสิ่งที่ผู้เรียนต้องปฏิบัติ..." value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">ขั้นตอนพัฒนาการเรียนรู้</label>
                  <select className="erp-input" value={type} onChange={e => setType(e.target.value as any)}>
                    <option value="Familiarize">F - Familiarize (AR/AI Vocabulary)</option>
                    <option value="Interact">I - Interact (Gemini Conversation)</option>
                    <option value="Navigate">N - Navigate (Simulation-Based)</option>
                    <option value="Exhibit">E - Exhibit (Rubric/Portfolio)</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">เป้าหมายชั้นเรียน</label>
                  <select className="erp-input" value={targetClass} onChange={e => setTargetClass(e.target.value)}>
                    <option value="ปวช.1/1">ปวช.1/1</option>
                    <option value="ปวช.1/2">ปวช.1/2</option>
                    <option value="ทั้งสองห้อง">ทั้งสองห้องเรียน</option>
                  </select>
                </div>
              </div>
              <div className="erp-form-group">
                <label className="erp-label">กำหนดส่งงาน</label>
                <input className="erp-input" placeholder="เช่น 30 มิ.ย. 2569" value={due} onChange={e => setDue(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 700 }}>
                ส่งงานและกิจกรรมไปยังผู้เรียน
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📊 Submission Report & Grading Modal */}
      {activeReportAsg && (() => {
        const currentSubs = submissionsMap[activeReportAsg.id] || []
        return (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
            <div className="erp-card" style={{ width: '650px', maxHeight: '90vh', overflowY: 'auto', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: '12px' }}>
                <div>
                  <span className="badge" style={{ background: '#EAF3EE', color: '#1E4D3A', fontWeight: 700 }}>ชั้นเรียน: {activeReportAsg.class}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E4D3A', margin: '4px 0 0 0' }}>📊 รายงานการส่งงานและประเมินกิจกรรม</h3>
                </div>
                <button onClick={() => { setActiveReportAsg(null); setGradingSub(null); }} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ background: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #EDE9E1', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', color: '#A6882A', fontWeight: 700 }}>{activeReportAsg.type}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E4D3A', marginTop: '2px' }}>{activeReportAsg.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>รายละเอียด: {activeReportAsg.desc}</div>
              </div>

              {/* Students Submissions List */}
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1E4D3A', marginBottom: '8px', margin: 0 }}>👥 รายชื่อนักเรียนและไฟล์ส่งงาน</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {currentSubs.map(s => {
                    const hasSubmitted = s.status === 'submitted'
                    return (
                      <div key={s.studentId} style={{ background: 'white', border: '1px solid #EDE9E1', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>👨‍🎓 {s.studentName}</div>
                          {hasSubmitted ? (
                            <div style={{ marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', color: '#1E4D3A', background: '#EAF3EE', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>🟢 ส่งงานแล้ว</span>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px' }}>ส่งเมื่อ: {s.submittedAt}</span>
                              <div style={{ fontSize: '11px', color: '#A6882A', marginTop: '4px', fontWeight: 600 }}>แนบชิ้นงาน: {s.attachmentName}</div>
                              {s.feedback && <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>คอมเมนต์ครู: "{s.feedback}"</div>}
                            </div>
                          ) : (
                            <div style={{ marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', color: '#8B2635', background: '#FAE8EB', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>🔴 ยังไม่ส่งงาน</span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: s.score !== undefined ? '#1E4D3A' : 'var(--text-muted)' }}>
                              {s.score !== undefined ? `${s.score} / ${s.maxScore}` : `- / ${s.maxScore}`} คะแนน
                            </div>
                          </div>
                          {hasSubmitted && (
                            <button
                              onClick={() => handleOpenGrading(s)}
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: '#C9A84C', color: '#A6882A', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}
                            >
                              📝 ตรวจให้คะแนน
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Grading Input Form (Shows only when a student is selected for grading) */}
              {gradingSub && (
                <form onSubmit={handleSaveGrade} style={{ background: '#F5F0E6', padding: '16px', borderRadius: '12px', border: '1.5px solid rgba(201,168,76,0.3)', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#1E4D3A' }}>
                    📝 กำลังประเมินและให้คะแนน: <span style={{ color: '#A6882A' }}>{gradingSub.studentName}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ชิ้นงาน: {gradingSub.attachmentName}</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                    <div className="erp-form-group">
                      <label className="erp-label">คะแนนเต็ม ({gradingSub.maxScore}) *</label>
                      <input
                        type="number"
                        className="erp-input"
                        value={inputScore}
                        onChange={e => setInputScore(e.target.value)}
                        placeholder={`0 - ${gradingSub.maxScore}`}
                        required
                      />
                    </div>
                    <div className="erp-form-group">
                      <label className="erp-label">ข้อเสนอแนะของครู (Teacher Feedback)</label>
                      <input
                        type="text"
                        className="erp-input"
                        value={inputFeedback}
                        onChange={e => setInputFeedback(e.target.value)}
                        placeholder="เช่น ออกเสียงชัดเจน ทักทายมีรอยยิ้ม"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button type="button" onClick={() => setGradingSub(null)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}>
                      ยกเลิก
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ border: 'none', padding: '6px 16px', fontSize: '11px', fontWeight: 700 }}>
                      บันทึกคะแนน
                    </button>
                  </div>
                </form>
              )}

              <button onClick={() => { setActiveReportAsg(null); setGradingSub(null); }} className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 700 }}>
                ปิดหน้าต่างรายงาน
              </button>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
