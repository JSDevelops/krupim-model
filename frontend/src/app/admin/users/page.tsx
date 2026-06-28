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
      role: 'teacher', // Locked to teacher for Admin user management
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header card */}
      <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E4D3A' }}>👥 ระบบบริหารจัดการครูผู้สอน (Teacher Management)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            [ผู้ดูแลระบบ] บริหารจัดการสิทธิ์เฉพาะบัญชี **ครูผู้สอน (Teacher)** เท่านั้น (ระบบนักเรียนจะได้รับการจัดการโดยคุณครูโดยตรง)
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
                    <th>ชื่อผู้ใช้</th>
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
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
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
    </div>
  )
}
