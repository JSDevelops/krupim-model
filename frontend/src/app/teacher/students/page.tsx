'use client'
import { useState, useEffect } from 'react'

interface Student {
  id: string
  name: string
  class: string
  email: string
  password?: string
  status?: 'active' | 'inactive'
  ksa: {
    K: number // Knowledge (20%)
    S: number // Skill (30%)
    A: number // Attribute (10%)
    C: number // Competency (40%)
  }
  sessions: number
}

const initialStudents: Student[] = [
  { id: 'std-001', name: 'นายสมชาย ใจดี', class: 'ปวช.1/1', email: 'student@school.ac.th', password: 'student1234', status: 'active', ksa: { K: 80, S: 75, A: 82, C: 70 }, sessions: 45 },
  { id: 'std-002', name: 'นางสาวมาลี สวยงาม', class: 'ปวช.1/1', email: 'std002@school.ac.th', password: 'student1234', status: 'active', ksa: { K: 95, S: 90, A: 94, C: 88 }, sessions: 62 },
  { id: 'std-003', name: 'นายพิชัย นักเรียน', class: 'ปวช.1/2', email: 'std003@school.ac.th', password: 'student1234', status: 'inactive', ksa: { K: 50, S: 42, A: 48, C: 38 }, sessions: 18 },
  { id: 'std-004', name: 'นางสาวกาญจนา ดีใจ', class: 'ปวช.1/2', email: 'std004@school.ac.th', password: 'student1234', status: 'active', ksa: { K: 68, S: 62, A: 70, C: 58 }, sessions: 33 },
  { id: 'std-005', name: 'นายอนันต์ มีใจ', class: 'ปวช.1/1', email: 'std005@school.ac.th', password: 'student1234', status: 'active', ksa: { K: 90, S: 85, A: 92, C: 82 }, sessions: 55 },
]

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classFilter, setClassFilter] = useState('all')

  // Modals state
  const [showAddEdit, setShowAddEdit] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [showEvidence, setShowEvidence] = useState<Student | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [studentClass, setStudentClass] = useState('ปวช.1/1')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('student1234')
  const [kScore, setKScore] = useState(0)
  const [sScore, setSScore] = useState(0)
  const [aScore, setAScore] = useState(0)
  const [cScore, setCScore] = useState(0)
  const [sessions, setSessions] = useState(0)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('classroomStudents')
      if (stored) {
        try {
          setStudents(JSON.parse(stored))
          return
        } catch (e) {}
      }
      setStudents(initialStudents)
      localStorage.setItem('classroomStudents', JSON.stringify(initialStudents))
    }
  }, [])

  // Sync to both classroomStudents (KSA database) and registeredUsers (login database)
  const saveStudentsAndSyncAuth = (updatedList: Student[]) => {
    setStudents(updatedList)
    if (typeof window !== 'undefined') {
      localStorage.setItem('classroomStudents', JSON.stringify(updatedList))
      
      // Sync to registeredUsers for login check
      const rawUsers = localStorage.getItem('registeredUsers')
      let registeredList = rawUsers ? JSON.parse(rawUsers) : []

      updatedList.forEach(s => {
        const existingIdx = registeredList.findIndex((u: any) => u.id === s.id || u.email === s.email)
        const mappedUser = {
          id: s.id,
          name: s.name,
          email: s.email,
          password: s.password || 'student1234',
          role: 'student',
          school: 'วิทยาลัยอาชีวศึกษากรุงเทพ',
          status: s.status || 'active',
          avatar: '👨‍🎓',
          lastLogin: 'ลงทะเบียนโดยครู'
        }
        if (existingIdx > -1) {
          registeredList[existingIdx] = { ...registeredList[existingIdx], ...mappedUser }
        } else {
          registeredList.push(mappedUser)
        }
      })

      // Clean up deleted students from registeredUsers
      registeredList = registeredList.filter((u: any) => {
        if (u.role === 'student') {
          return updatedList.some(s => s.id === u.id || s.email === u.email)
        }
        return true // Keep teachers & admins
      })

      localStorage.setItem('registeredUsers', JSON.stringify(registeredList))
    }
  }

  const filtered = students.filter(s =>
    classFilter === 'all' || s.class === classFilter
  )

  function evaluateCompetency(ksa: Student['ksa']) {
    const kVal = ksa?.K ?? 0
    const sVal = ksa?.S ?? 0
    const aVal = ksa?.A ?? 0
    const cVal = ksa?.C ?? 0

    const isAspectsPassed = kVal >= 60 && sVal >= 60 && aVal >= 60 && cVal >= 60
    const weightedTotal = Math.round((kVal * 0.2) + (sVal * 0.3) + (aVal * 0.1) + (cVal * 0.4))
    const isPassed = isAspectsPassed && weightedTotal >= 70
    
    return {
      total: weightedTotal,
      passed: isPassed,
      failedReasons: [
        kVal < 60 && 'Knowledge (K) < 60%',
        sVal < 60 && 'Skill (S) < 60%',
        aVal < 60 && 'Attribute (A) < 60%',
        cVal < 60 && 'Competency (C) < 60%',
        weightedTotal < 70 && 'คะแนนรวม < 70%'
      ].filter(Boolean) as string[]
    }
  }

  function handleOpenAdd() {
    setEditingStudent(null)
    setName('')
    setStudentClass('ปวช.1/1')
    setEmail('')
    setPassword('student1234')
    setKScore(0)
    setSScore(0)
    setAScore(0)
    setCScore(0)
    setSessions(0)
    setShowAddEdit(true)
  }

  function handleOpenEdit(s: Student) {
    setEditingStudent(s)
    setName(s.name)
    setStudentClass(s.class)
    setEmail(s.email || '')
    setPassword(s.password || 'student1234')
    setKScore(s.ksa?.K ?? 0)
    setSScore(s.ksa?.S ?? 0)
    setAScore(s.ksa?.A ?? 0)
    setCScore(s.ksa?.C ?? 0)
    setSessions(s.sessions ?? 0)
    setShowAddEdit(true)
  }

  function handleSaveStudent(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) return

    const emailCheck = students.some(s => s.email.toLowerCase() === email.trim().toLowerCase() && (!editingStudent || s.id !== editingStudent.id))
    if (emailCheck) {
      alert('อีเมลผู้เรียนนี้มีในระบบทะเบียนแล้ว')
      return
    }

    if (editingStudent) {
      const updated = students.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            name,
            class: studentClass,
            email: email.trim(),
            password: password.trim(),
            ksa: { K: kScore, S: sScore, A: aScore, C: cScore },
            sessions
          }
        }
        return s
      })
      saveStudentsAndSyncAuth(updated)
      alert('แก้ไขประวัตินักเรียนและอัปเดตสิทธิ์เข้าเรียนสำเร็จ!')
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        name,
        class: studentClass,
        email: email.trim(),
        password: password.trim(),
        status: 'active',
        ksa: { K: kScore, S: sScore, A: aScore, C: cScore },
        sessions
      }
      saveStudentsAndSyncAuth([...students, newStudent])
      alert('ลงทะเบียนนักเรียนและสร้างสิทธิ์เข้าสู่ระบบเรียบร้อย!')
    }

    setShowAddEdit(false)
  }

  function handleDeleteStudent(id: string) {
    if (confirm('คุณต้องการลบข้อมูลประวัติและยกเลิกสิทธิ์ล็อกอินของนักเรียนรายนี้หรือไม่?')) {
      const updated = students.filter(s => s.id !== id)
      saveStudentsAndSyncAuth(updated)
    }
  }

  function toggleStudentStatus(s: Student) {
    const updated = students.map(item => {
      if (item.id === s.id) {
        return { ...item, status: item.status === 'active' || !item.status ? 'inactive' : 'active' } as Student
      }
      return item
    })
    saveStudentsAndSyncAuth(updated)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>👥 ทะเบียนและสิทธิ์เข้าเรียนของนักเรียน (Student Registry & Permissions)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', margin: '4px 0 0 0' }}>
            [อาจารย์ผู้สอน] บริหารจัดการสิทธิ์การเข้าใช้งาน, รหัสผ่าน, พร้อมประเมินสมรรถนะ KSA-C ของผู้เรียน
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700 }}>
          ➕ ลงทะเบียนนักเรียน & อนุมัติสิทธิ์เข้าเรียน
        </button>
      </div>

      {/* Class filter controls */}
      <div className="erp-card" style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-start' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#A6882A', marginRight: '8px' }}>กรองระดับชั้น:</span>
        {['all', 'ปวช.1/1', 'ปวช.1/2'].map(cls => (
          <button
            key={cls}
            onClick={() => setClassFilter(cls)}
            style={{
              padding: '8px 18px', border: 'none', borderRadius: '100px',
              fontFamily: 'var(--font-primary)', fontSize: '13px', fontWeight: 600,
              background: classFilter === cls ? '#1E4D3A' : '#F5F0E6',
              color: classFilter === cls ? '#FDFAF4' : '#4A4138',
              cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            {cls === 'all' ? 'ทุกชั้นเรียน ปวช.1' : `ชั้นเรียน ${cls}`}
          </button>
        ))}
      </div>

      {/* Main performance table */}
      <div className="erp-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>ชื่อผู้เรียน</th>
                <th>อีเมลระบบ</th>
                <th>ชั้นเรียน</th>
                <th>สิทธิ์เข้าใช้งาน</th>
                <th style={{ textAlign: 'center' }}>Knowledge (K)</th>
                <th style={{ textAlign: 'center' }}>Skills (S)</th>
                <th style={{ textAlign: 'center' }}>Attribute (A)</th>
                <th style={{ textAlign: 'center' }}>Competency (C)</th>
                <th style={{ textAlign: 'center' }}>คะแนนรวม</th>
                <th>ผลสัมฤทธิ์</th>
                <th style={{ textAlign: 'center' }}>จัดการสิทธิ์</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const evalResult = evaluateCompetency(s.ksa)
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>👨‍🎓 {s.name}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{s.email}</td>
                    <td>{s.class}</td>
                    <td>
                      <span 
                        onClick={() => toggleStudentStatus(s)}
                        style={{
                          cursor: 'pointer',
                          background: s.status === 'active' || !s.status ? '#EAF3EE' : '#FAE8EB',
                          color: s.status === 'active' || !s.status ? '#1E4D3A' : '#8B2635',
                          fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px'
                        }}
                      >
                        ● {s.status === 'active' || !s.status ? 'Active (มีสิทธิ์)' : 'Suspended (ระงับ)'}
                      </span>
                    </td>
                    
                    {/* KSA-C columns */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#1E4D3A' }}>{s.ksa?.K ?? 0}%</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#A6882A' }}>{s.ksa?.S ?? 0}%</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#C9A84C' }}>{s.ksa?.A ?? 0}%</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#1E4D3A' }}>{s.ksa?.C ?? 0}%</span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: evalResult.passed ? '#1E4D3A' : '#8B2635' }}>
                        {evalResult.total}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      {evalResult.passed ? (
                        <span className="badge" style={{ background: '#EAF3EE', color: '#1E4D3A', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                          🏆 ผ่านสมรรถนะ
                        </span>
                      ) : (
                        <span className="badge" style={{ background: '#FAE8EB', color: '#8B2635', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', width: 'fit-content' }}>
                          ⚠️ ต่ำกว่าเกณฑ์
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => setShowEvidence(s)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px', borderColor: 'rgba(201,168,76,0.5)', color: '#A6882A' }}
                        >
                          📜 แฟ้มผลงาน
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px', borderColor: '#EDE9E1', color: '#554D41' }}
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px', borderColor: '#FAE8EB', color: '#8B2635' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showAddEdit && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="erp-card" style={{ width: '500px', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>
                {editingStudent ? '✏️ แก้ไขสิทธิ์ทะเบียนนักเรียน' : '➕ ลงทะเบียนบัญชีนักเรียนใหม่'}
              </h3>
              <button onClick={() => setShowAddEdit(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSaveStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="erp-form-group">
                <label className="erp-label">ชื่อ - นามสกุล นักเรียน *</label>
                <input
                  className="erp-input"
                  placeholder="เช่น นายสมชาย ใจดี"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">อีเมลเข้าเรียน (ล็อกอิน)*</label>
                  <input
                    type="email"
                    className="erp-input"
                    placeholder="student@school.ac.th"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">กำหนดรหัสผ่านเบื้องต้น</label>
                  <input
                    type="text"
                    className="erp-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">ชั้นเรียนปัจจุบัน</label>
                  <select className="erp-input" value={studentClass} onChange={e => setStudentClass(e.target.value)}>
                    <option value="ปวช.1/1">ปวช.1/1</option>
                    <option value="ปวช.1/2">ปวช.1/2</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">จำนวนเข้าใช้งานสะสม (Sessions)</label>
                  <input
                    type="number"
                    className="erp-input"
                    value={sessions}
                    onChange={e => setSessions(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1E4D3A', margin: '10px 0 0 0', borderBottom: '1px solid #EDE9E1', paddingBottom: '4px' }}>
                📈 ประเมินระดับสมรรถนะ KSA-C (0 - 100%)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">Knowledge (K) - สาระวิชา</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="erp-input"
                    value={kScore}
                    onChange={e => setKScore(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">Skill (S) - ทักษะปฏิบัติ</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="erp-input"
                    value={sScore}
                    onChange={e => setSScore(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">Attribute (A) - คุณลักษณะพฤติกรรม</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="erp-input"
                    value={aScore}
                    onChange={e => setAScore(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">Competency (C) - ความพร้อมวิชาชีพ</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="erp-input"
                    value={cScore}
                    onChange={e => setCScore(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 700, marginTop: '8px' }}>
                บันทึกประวัตินักเรียนและสิทธิ์เข้าเรียน
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Evidence and Certificate Modal */}
      {showEvidence && (() => {
        const evalResult = evaluateCompetency(showEvidence.ksa)
        return (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
            <div className="erp-card" style={{ width: '550px', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>📜 แฟ้มประวัติและใบประกาศผลสัมฤทธิ์</h3>
                <button onClick={() => setShowEvidence(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              {/* Student Header */}
              <div style={{ background: 'white', padding: '14px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A' }}>{showEvidence.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>ห้องเรียน: {showEvidence.class} · ล็อกอินการเรียนรู้: {showEvidence.sessions} ครั้ง</div>
              </div>

              {/* Evidence Portfolio */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#A6882A', margin: '0 0 6px 0' }}>📂 ชิ้นงานหลักฐานฝึกฝนสะสม (Evidence Items)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid #EDE9E1', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🗣️ ฝึกสนทนาโต้ตอบต้อนรับ Mr. David (AI)</span>
                    <span style={{ color: '#1E4D3A', fontWeight: 700 }}>26/30 (ผ่าน)</span>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid #EDE9E1', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📷 สแกนตรวจสอบ Espresso Coffee Cup (AR)</span>
                    <span style={{ color: '#1E4D3A', fontWeight: 700 }}>ตรวจผ่าน ✓</span>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid #EDE9E1', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📝 แบบคัดคำอ่านศัพท์ Restaurants Equipment</span>
                    <span style={{ color: '#1E4D3A', fontWeight: 700 }}>10/10</span>
                  </div>
                </div>
              </div>

              {/* Competency Certificate preview */}
              {evalResult.passed ? (
                <div style={{ background: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)', color: '#FDFAF4', padding: '20px', borderRadius: '12px', border: '2px solid #C9A84C', textAlign: 'center', boxShadow: '0 8px 24px rgba(16,43,31,0.2)' }}>
                  <div style={{ fontSize: '11px', color: '#C9A84C', fontWeight: 700, letterSpacing: '2px' }}>CERTIFICATE OF COMPETENCY</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#FDFAF4', marginTop: '6px' }}>ใบรับรองผลสมรรถนะวิชาชีพ F&B</div>
                  <p style={{ fontSize: '11px', color: '#FDFAF4', opacity: 0.8, marginTop: '8px', lineHeight: 1.4, margin: '8px 0 0 0' }}>
                    ขอรับรองว่า **{showEvidence.name}** ได้พัฒนาคะแนนสมรรถนะความพร้อมการเรียนรู้ด้วย FINE Model
                    มีผลสัมฤทธิ์ผ่านเกณฑ์มาตรฐานเฉลี่ยที่ **{evalResult.total}%** ครบถ้วนตามกระบวนวิชาชีพโรงแรม
                  </p>
                  <button
                    onClick={() => {
                      alert('กำลังเตรียมพิมพ์ใบประกาศนียบัตรรับรองสมรรถนะไฟล์ PDF...')
                    }}
                    className="btn btn-outline"
                    style={{ border: '1px solid #C9A84C', color: '#C9A84C', width: '100%', padding: '10px', marginTop: '14px', fontWeight: 700 }}
                  >
                    🖨️ พิมพ์ใบรับรองสมรรถนะ (PDF)
                  </button>
                </div>
              ) : (
                <div style={{ background: '#FAE8EB', color: '#8B2635', padding: '14px', borderRadius: '8px', fontSize: '11px', textAlign: 'center', fontWeight: 600 }}>
                  ⚠️ นักเรียนยังมีผลคะแนนบางสมรรถนะไม่ถึงเกณฑ์ขั้นต่ำ 60% จึงยังไม่ออกใบรับรองวิชาชีพให้ได้
                </div>
              )}

              <button onClick={() => setShowEvidence(null)} className="btn btn-primary" style={{ width: '100%', padding: '10px', fontWeight: 700 }}>
                ปิดแฟ้มประวัติ
              </button>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
