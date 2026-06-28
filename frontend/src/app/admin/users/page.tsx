'use client'
import { useState, useEffect } from 'react'

interface UserItem {
  id: string
  name: string
  email: string
  password?: string
  role: string
  school: string
  status?: 'active' | 'inactive'
  avatar: string
  lastLogin?: string
}

const initialPendingTeachers = [
  { id: 'pend-001', name: 'ครูสมศักดิ์ เรียนรู้', email: 'somsak.t@school.ac.th', school: 'วิทยาลัยอาชีวศึกษาสุราษฎร์ธานี', requestDate: 'วันนี้, 10:20 น.', docs: 'ใบประกอบวิชาชีพครู.pdf' },
  { id: 'pend-002', name: 'ครูอัญชลี ขยันยิ่ง', email: 'anchalee.k@school.ac.th', school: 'วิทยาลัยอาชีวศึกษาเชียงราย', requestDate: 'เมื่อวานนี้, 16:45 น.', docs: 'ใบประกอบวิชาชีพครู_อัญชลี.pdf' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [pendingTeachers, setPendingTeachers] = useState(initialPendingTeachers)
  const [activeTab, setActiveTab] = useState<'teachers' | 'pending'>('teachers')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('teacher1234')
  const [newUserSchool, setNewUserSchool] = useState('วิทยาลัยอาชีวศึกษากรุงเทพ')
  
  // Teacher Dashboard popup state
  const [selectedTeacherDashboard, setSelectedTeacherDashboard] = useState<UserItem | null>(null)

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('registeredUsers')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setUsers(parsed)
        } catch (e) {}
      } else {
        const defaultUsers: UserItem[] = [
          { id: 'teacher-001', name: 'ครูสมหญิง รักเรียน', email: 'teacher@school.ac.th', password: 'teacher1234', role: 'teacher', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', status: 'active', avatar: '👩‍🏫', lastLogin: '10 นาทีที่แล้ว' }
        ]
        setUsers(defaultUsers)
        localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers))
      }
    }
  }, [])

  const saveUsersToStorage = (updatedList: UserItem[]) => {
    setUsers(updatedList)
    if (typeof window !== 'undefined') {
      localStorage.setItem('registeredUsers', JSON.stringify(updatedList))
    }
  }

  // Admin manages ONLY Teachers (students are managed by teachers)
  const teacherUsers = users.filter(u => u.role === 'teacher')

  const filteredTeachers = teacherUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  function toggleStatus(id: string) {
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'active' ? 'inactive' : 'active' } as UserItem
      }
      return u
    })
    saveUsersToStorage(updated)
  }

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!newUserName || !newUserEmail) return

    const emailExists = users.some(u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase())
    if (emailExists) {
      alert('อีเมลนี้ถูกใช้ลงทะเบียนแล้วในระบบ')
      return
    }

    const newUser: UserItem = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword || 'teacher1234',
      role: 'teacher',
      school: newUserSchool.trim(),
      status: 'active',
      avatar: '👩‍🏫',
      lastLogin: 'เพิ่งสร้าง'
    }

    saveUsersToStorage([newUser, ...users])
    setNewUserName('')
    setNewUserEmail('')
    setNewUserPassword('teacher1234')
    setShowCreateModal(false)
  }

  function handleDeleteUser(id: string) {
    if (confirm('คุณต้องการลบสิทธิ์บัญชีครูรายนี้ออกจากระบบหรือไม่?')) {
      const updated = users.filter(u => u.id !== id)
      saveUsersToStorage(updated)
    }
  }

  function handleApprove(teacher: typeof initialPendingTeachers[0]) {
    const newUser: UserItem = {
      id: `usr-${Date.now()}`,
      name: teacher.name,
      email: teacher.email,
      password: 'teacher1234',
      role: 'teacher',
      school: teacher.school,
      status: 'active',
      avatar: '👩‍🏫',
      lastLogin: 'เพิ่งได้รับการอนุมัติ'
    }

    saveUsersToStorage([newUser, ...users])
    setPendingTeachers(prev => prev.filter(t => t.id !== teacher.id))
    alert(`อนุมัติและเปิดสิทธิ์ครูผู้สอนให้ ${teacher.name} สำเร็จ!`)
  }

  function handleReject(id: string, name: string) {
    if (confirm(`คุณต้องการปฏิเสธคำขอการเปิดสิทธิ์ของ ${name} หรือไม่?`)) {
      setPendingTeachers(prev => prev.filter(t => t.id !== id))
    }
  }

  // Calculate dynamic classroom metrics for Teacher Dashboard Preview
  const getTeacherClassroomStats = (schoolName: string) => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('classroomStudents') : null
    let studentList = stored ? JSON.parse(stored) : []
    
    if (studentList.length === 0) {
      studentList = [
        { id: 'std-001', name: 'นายสมชาย ใจดี', class: 'ปวช.1/1', ksa: { K: 80, S: 75, A: 82, C: 70 }, sessions: 45 },
        { id: 'std-002', name: 'นางสาวมาลี สวยงาม', class: 'ปวช.1/1', ksa: { K: 95, S: 90, A: 94, C: 88 }, sessions: 62 },
        { id: 'std-003', name: 'นายพิชัย นักเรียน', class: 'ปวช.1/2', ksa: { K: 50, S: 42, A: 48, C: 38 }, sessions: 18 },
        { id: 'std-004', name: 'นางสาวกาญจนา ดีใจ', class: 'ปวช.1/2', ksa: { K: 68, S: 62, A: 70, C: 58 }, sessions: 33 },
        { id: 'std-005', name: 'นายอนันต์ มีใจ', class: 'ปวช.1/1', ksa: { K: 90, S: 85, A: 92, C: 82 }, sessions: 55 },
      ]
    }

    const count = studentList.length
    const totalSessions = studentList.reduce((acc: number, s: any) => acc + (s.sessions || 0), 0)
    const avgK = Math.round(studentList.reduce((acc: number, s: any) => acc + (s.ksa?.K || 0), 0) / count) || 0
    const avgS = Math.round(studentList.reduce((acc: number, s: any) => acc + (s.ksa?.S || 0), 0) / count) || 0
    const avgA = Math.round(studentList.reduce((acc: number, s: any) => acc + (s.ksa?.A || 0), 0) / count) || 0
    const avgC = Math.round(studentList.reduce((acc: number, s: any) => acc + (s.ksa?.C || 0), 0) / count) || 0
    const totalAvg = Math.round((avgK * 0.2) + (avgS * 0.3) + (avgA * 0.1) + (avgC * 0.4))

    return { count, totalSessions, avgK, avgS, avgA, avgC, totalAvg, studentList }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header card */}
      <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E4D3A' }}>👥 ระบบบริหารจัดการครูผู้สอน (Teacher Management)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            [ผู้ดูแลระบบ] บริหารจัดการสิทธิ์ครูผู้สอน (คลิกที่ชื่อของคุณครูเพื่อตรวจสอบ **แดชบอร์ดชั้นเรียน** ของครูท่านนั้น)
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700 }}>
          ➕ อนุมัติสิทธิ์ครูท่านใหม่
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1.5px solid #EDE9E1', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('teachers')}
          style={{
            background: 'transparent', border: 'none', fontSize: '14px', fontWeight: activeTab === 'teachers' ? 700 : 500,
            color: activeTab === 'teachers' ? '#1E4D3A' : 'var(--text-muted)', cursor: 'pointer', padding: '10px 20px',
            borderBottom: activeTab === 'teachers' ? '3px solid #1E4D3A' : 'none'
          }}
        >
          👩‍🏫 ครูผู้สอนในระบบ ({teacherUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            background: 'transparent', border: 'none', fontSize: '14px', fontWeight: activeTab === 'pending' ? 700 : 500,
            color: activeTab === 'pending' ? '#C9A84C' : 'var(--text-muted)', cursor: 'pointer', padding: '10px 20px',
            borderBottom: activeTab === 'pending' ? '3px solid #C9A84C' : 'none', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          ⏳ รออนุมัติรับรองคุณครู ({pendingTeachers.length})
          {pendingTeachers.length > 0 && (
            <span style={{ fontSize: '10px', background: '#C9A84C', color: '#1A1410', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
              {pendingTeachers.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'teachers' ? (
        <>
          {/* Filter and Search controls */}
          <div className="erp-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                className="erp-input"
                placeholder="ค้นหาอาจารย์ ตามชื่อ หรือ อีเมล..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ padding: '8px 16px', background: '#F5F0E6', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#4A4138' }}>
              บทบาทที่จัดการ: ครูผู้สอน (Teacher)
            </div>
          </div>

          {/* Users table */}
          <div className="erp-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="erp-table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>รูปโปรไฟล์</th>
                    <th>ชื่อผู้ใช้ (คลิกดูแดชบอร์ดห้องเรียน)</th>
                    <th>อีเมล</th>
                    <th>บทบาทสิทธิ์</th>
                    <th>สถาบันการศึกษา</th>
                    <th>เข้าใช้งานล่าสุด</th>
                    <th>สถานะการอนุญาต</th>
                    <th style={{ textAlign: 'center' }}>จัดการคีย์/ลบ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        ไม่พบข้อมูลครูผู้สอนในระบบตามเงื่อนไขค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ width: 44, height: 44, background: '#F5F0E6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                            {u.avatar}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedTeacherDashboard(u)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#1E4D3A',
                              fontWeight: 700,
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              textAlign: 'left',
                              padding: 0,
                              fontSize: '13.5px'
                            }}
                            title="คลิกเพื่อเปิดรายงานป๊อปอัพแดชบอร์ดคุณครู"
                          >
                            👩‍🏫 {u.name}
                          </button>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className="badge" style={{
                            background: '#FBF6E9',
                            color: '#A6882A',
                            fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px'
                          }}>
                            TEACHER
                          </span>
                        </td>
                        <td>{u.school}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{u.lastLogin || 'ยังไม่ได้ระบุ'}</td>
                        <td>
                          <span onClick={() => toggleStatus(u.id)} style={{
                            cursor: 'pointer',
                            background: u.status === 'active' || !u.status ? '#EAF3EE' : '#FAE8EB',
                            color: u.status === 'active' || !u.status ? '#1E4D3A' : '#8B2635',
                            fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px'
                          }}>
                            ● {u.status === 'active' || !u.status ? 'Active (ผ่านสิทธิ์)' : 'Suspended (ระงับสิทธิ์)'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button onClick={() => {
                              const newPass = prompt(`ตั้งค่ารหัสผ่านใหม่สำหรับคุณครู ${u.name}:`, u.password || '')
                              if (newPass !== null) {
                                const updated = users.map(item => item.id === u.id ? { ...item, password: newPass } : item)
                                saveUsersToStorage(updated)
                                alert('เปลี่ยนรหัสผ่านสำเร็จ!')
                              }
                            }} className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                              รหัสผ่าน
                            </button>
                            <button onClick={() => handleDeleteUser(u.id)} className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--error)', borderColor: 'var(--error-light)' }}>
                              ลบสิทธิ์
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Teacher approvals list */
        <div className="erp-card" style={{ padding: 0, overflow: 'hidden' }}>
          {pendingTeachers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '32px' }}>🎉</span>
              <div style={{ fontWeight: 700, fontSize: '15px', marginTop: '10px' }}>ไม่มีคำขอรับอนุมัติใหม่ขณะนี้</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>ครูผู้สอนลงทะเบียนเข้ามาครบถ้วนและได้รับการอนุมัติทั้งหมดแล้ว</div>
            </div>
          ) : (
            <div className="erp-table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>ผู้ยื่นคำขอ</th>
                    <th>อีเมลติดต่อ</th>
                    <th>สถาบันการศึกษา</th>
                    <th>วันที่ส่งคำขอ</th>
                    <th>เอกสารแนบ</th>
                    <th style={{ textAlign: 'center' }}>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTeachers.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>👩‍🏫 {t.name}</td>
                      <td>{t.email}</td>
                      <td>{t.school}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{t.requestDate}</td>
                      <td>
                        <a href="#" onClick={(e) => { e.preventDefault(); alert('กำลังดาวน์โหลดเอกสารประกอบวิชาชีพครูเพื่อตรวจสอบสิทธิ์...') }} style={{ color: '#C9A84C', fontWeight: 600, textDecoration: 'none', fontSize: '13px' }}>
                          📄 {t.docs}
                        </a>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleApprove(t)} className="btn btn-primary btn-sm" style={{ border: 'none', background: '#1E4D3A', color: 'white', padding: '6px 12px' }}>
                            อนุมัติเปิดใช้งาน
                          </button>
                          <button onClick={() => handleReject(t.id, t.name)} className="btn btn-outline btn-sm" style={{ color: '#8B2635', borderColor: '#B03A4A', padding: '6px 12px' }}>
                            ปฏิเสธ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="erp-card" style={{ width: '450px', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E4D3A' }}>➕ อนุมัติสิทธิ์บัญชีครูผู้สอนใหม่</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="erp-form-group">
                <label className="erp-label">ชื่อ - นามสกุลครูผู้สอน</label>
                <input className="erp-input" placeholder="เช่น ดร.มงคล สมบูรณ์" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
              </div>
              <div className="erp-form-group">
                <label className="erp-label">อีเมลวิชาชีพ</label>
                <input type="email" className="erp-input" placeholder="teacher@school.ac.th" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
              </div>
              <div className="erp-form-group">
                <label className="erp-label">กำหนดรหัสผ่านเบื้องต้น</label>
                <input type="text" className="erp-input" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required />
              </div>
              <div className="erp-form-group">
                <label className="erp-label">สถาบันวิทยาลัยอาชีวศึกษา</label>
                <input className="erp-input" value={newUserSchool} onChange={e => setNewUserSchool(e.target.value)} />
              </div>
              
              <div style={{ background: '#EAF3EE', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: '#1E4D3A', fontWeight: 650 }}>
                💡 บทบาทบัญชีที่จะได้รับ: ครูผู้สอน (Teacher) เสมอ
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 700 }}>
                บันทึกประวัติและอนุมัติสิทธิ์คุณครู
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 👩‍🏫 TEACHER DASHBOARD PREVIEW POPUP (เมื่อคลิกที่ชื่อครู) */}
      {selectedTeacherDashboard && (() => {
        const stats = getTeacherClassroomStats(selectedTeacherDashboard.school)
        return (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px' }}>
            <div className="erp-card" style={{ width: '600px', maxWidth: '100%', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left', borderRadius: '20px', boxShadow: '0 12px 36px rgba(0,0,0,0.25)', border: '1.5px solid #C9A84C' }}>
              
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #EDE9E1', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>👩‍🏫 แดชบอร์ดห้องเรียนของคุณครู (Classroom Insights)</h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>สแกนตรวจสอบข้อมูลสมรรถนะของครูผู้สอนผ่านหน้า Developer Suite</div>
                </div>
                <button onClick={() => setSelectedTeacherDashboard(null)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#A6882A' }}>✕</button>
              </div>

              {/* Teacher Profile Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#white', padding: '14px', borderRadius: '12px', border: '1.5px solid #EDE9E1', backgroundColor: '#fff' }}>
                <div style={{ width: 50, height: 50, background: '#FBF6E9', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                  {selectedTeacherDashboard.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A' }}>{selectedTeacherDashboard.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedTeacherDashboard.email} · {selectedTeacherDashboard.school}</div>
                </div>
              </div>

              {/* Classroom Key KPIs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ padding: '12px', background: '#EAF3EE', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(30,77,58,0.1)' }}>
                  <div style={{ fontSize: '10px', color: '#1E4D3A', fontWeight: 700, letterSpacing: '0.5px' }}>จำนวนนักเรียนทั้งหมด</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E4D3A', marginTop: '4px' }}>{stats.count} คน</div>
                </div>
                <div style={{ padding: '12px', background: '#FBF6E9', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <div style={{ fontSize: '10px', color: '#A6882A', fontWeight: 700, letterSpacing: '0.5px' }}>การเข้าใช้งานสะสม</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#A6882A', marginTop: '4px' }}>{stats.totalSessions} ครั้ง</div>
                </div>
                <div style={{ padding: '12px', background: '#EAF3EE', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(30,77,58,0.1)' }}>
                  <div style={{ fontSize: '10px', color: '#1E4D3A', fontWeight: 700, letterSpacing: '0.5px' }}>ผลสัมฤทธิ์ห้องเรียน</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E4D3A', marginTop: '4px' }}>{stats.totalAvg}%</div>
                </div>
              </div>

              {/* KSA-C Breakdown Bars */}
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: 800, color: '#A6882A', margin: '0 0 10px 0' }}>📈 ผลสัมฤทธิ์เฉลี่ยห้องเรียนแยกมิติ KSA-C (Class average performance)</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  
                  {/* Knowledge (K) */}
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#4A4138' }}>
                      <span>Knowledge (K) - สาระวิชา</span>
                      <span style={{ color: '#1E4D3A' }}>{stats.avgK}%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#F5F5F0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats.avgK}%`, height: '100%', background: '#1E4D3A' }} />
                    </div>
                  </div>

                  {/* Skill (S) */}
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#4A4138' }}>
                      <span>Skill (S) - ทักษะปฏิบัติ</span>
                      <span style={{ color: '#A6882A' }}>{stats.avgS}%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#F5F5F0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats.avgS}%`, height: '100%', background: '#A6882A' }} />
                    </div>
                  </div>

                  {/* Attribute (A) */}
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#4A4138' }}>
                      <span>Attribute (A) - คุณลักษณะพฤติกรรม</span>
                      <span style={{ color: '#C9A84C' }}>{stats.avgA}%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#F5F5F0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats.avgA}%`, height: '100%', background: '#C9A84C' }} />
                    </div>
                  </div>

                  {/* Competency (C) */}
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#4A4138' }}>
                      <span>Competency (C) - ความพร้อมวิชาชีพ</span>
                      <span style={{ color: '#1E4D3A' }}>{stats.avgC}%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#F5F5F0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats.avgC}%`, height: '100%', background: '#1E4D3A' }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* Student registry list preview */}
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: 800, color: '#A6882A', margin: '0 0 8px 0' }}>👨‍🎓 นักเรียนในห้องเรียนหลักของคุณครู (Classroom Roster Preview)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', background: '#fff', padding: '8px', borderRadius: '10px', border: '1px solid #EDE9E1' }}>
                  {stats.studentList.map((s: any) => {
                    const kVal = s.ksa?.K ?? 0;
                    const sVal = s.ksa?.S ?? 0;
                    const aVal = s.ksa?.A ?? 0;
                    const cVal = s.ksa?.C ?? 0;
                    const totalScore = Math.round((kVal * 0.2) + (sVal * 0.3) + (aVal * 0.1) + (cVal * 0.4));
                    return (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 8px', borderBottom: '1px solid #F5F5F0', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#4A4138' }}>👨‍🎓 {s.name} ({s.class})</span>
                        <span style={{ color: 'var(--text-muted)' }}>สะสม {s.sessions || 0} sessions · คะแนนรวม {totalScore}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #EDE9E1', paddingTop: '12px', marginTop: '6px' }}>
                <button
                  onClick={() => setSelectedTeacherDashboard(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #1E4D3A 0%, #103024 100%)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textAlign: 'center'
                  }}
                >
                  ปิดรายงานแดชบอร์ด
                </button>
              </div>

            </div>
          </div>
        )
      })()}
    </div>
  )
}
