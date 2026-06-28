'use client'
import { useState } from 'react'

const initialUsers = [
  { id: 'usr-001', name: 'ครูสมหญิง รักเรียน', email: 'teacher1@school.ac.th', role: 'teacher', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', status: 'active', avatar: '👩‍🏫', lastLogin: '10 นาทีที่แล้ว' },
  { id: 'usr-002', name: 'ครูมานะ ดีงาม', email: 'teacher2@school.ac.th', role: 'teacher', school: 'วิทยาลัยอาชีวศึกษานครปฐม', status: 'active', avatar: '👨‍🏫', lastLogin: '1 ชั่วโมงที่แล้ว' },
  { id: 'usr-003', name: 'นายสมชาย ใจดี', email: 'std001@school.ac.th', role: 'student', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', status: 'active', avatar: '👨‍🎓', lastLogin: '2 ชม.ที่แล้ว' },
  { id: 'usr-004', name: 'นางสาวสมใจ หวังดี', email: 'std002@school.ac.th', role: 'student', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', status: 'active', avatar: '👩‍🎓', lastLogin: '1 วันที่แล้ว' },
  { id: 'usr-005', name: 'นายพิชัย นักเรียน', email: 'std003@school.ac.th', role: 'student', school: 'วิทยาลัยอาชีวศึกษาเชียงใหม่', status: 'inactive', avatar: '👨‍🎓', lastLogin: '5 วันที่แล้ว' },
]

const initialPendingTeachers = [
  { id: 'pend-001', name: 'ครูสมศักดิ์ เรียนรู้', email: 'somsak.t@school.ac.th', school: 'วิทยาลัยอาชีวศึกษาสุราษฎร์ธานี', requestDate: 'วันนี้, 10:20 น.', docs: 'ใบประกอบวิชาชีพครู.pdf' },
  { id: 'pend-002', name: 'ครูอัญชลี ขยันยิ่ง', email: 'anchalee.k@school.ac.th', school: 'วิทยาลัยอาชีวศึกษาเชียงราย', requestDate: 'เมื่อวานนี้, 16:45 น.', docs: 'ใบประกอบวิชาชีพครู_อัญชลี.pdf' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [pendingTeachers, setPendingTeachers] = useState(initialPendingTeachers)
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState('student')
  const [newUserSchool, setNewUserSchool] = useState('วิทยาลัยอาชีวศึกษากรุงเทพ')

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  function toggleStatus(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
  }

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!newUserName || !newUserEmail) return
    const newUser = {
      id: `usr-00${users.length + 1}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      school: newUserSchool,
      status: 'active',
      avatar: newUserRole === 'teacher' ? '👩‍🏫' : '👨‍🎓',
      lastLogin: 'เพิ่งสร้าง'
    }
    setUsers(prev => [newUser, ...prev])
    setNewUserName('')
    setNewUserEmail('')
    setShowCreateModal(false)
  }

  function handleDeleteUser(id: string) {
    if (confirm('คุณต้องการลบผู้ใช้นี้ออกจากระบบหรือไม่?')) {
      setUsers(prev => prev.filter(u => u.id !== id))
    }
  }

  function handleApprove(teacher: typeof initialPendingTeachers[0]) {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: teacher.name,
      email: teacher.email,
      role: 'teacher',
      school: teacher.school,
      status: 'active',
      avatar: '👩‍🏫',
      lastLogin: 'เพิ่งได้รับการอนุมัติ'
    }
    setUsers(prev => [newUser, ...prev])
    setPendingTeachers(prev => prev.filter(t => t.id !== teacher.id))
    alert(`อนุมัติและเปิดสิทธิ์การใช้งานให้ ${teacher.name} สำเร็จ!`)
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
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>👥 ระบบบริหารจัดการผู้ใช้ (User & Teacher Approval)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            จัดการบัญชีผู้ใช้งาน และพิจารณาอนุมัติคำขอสิทธิ์ของครูผู้สอนเพื่อเริ่มการสอนในระบบ
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700 }}>
          ➕ สร้างผู้ใช้ใหม่
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1.5px solid #EDE9E1', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            background: 'transparent', border: 'none', fontSize: '14px', fontWeight: activeTab === 'all' ? 700 : 500,
            color: activeTab === 'all' ? '#1E4D3A' : 'var(--text-muted)', cursor: 'pointer', padding: '10px 20px',
            borderBottom: activeTab === 'all' ? '3px solid #1E4D3A' : 'none'
          }}
        >
          👤 ผู้ใช้ทั้งหมดในระบบ ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            background: 'transparent', border: 'none', fontSize: '14px', fontWeight: activeTab === 'pending' ? 700 : 500,
            color: activeTab === 'pending' ? '#C9A84C' : 'var(--text-muted)', cursor: 'pointer', padding: '10px 20px',
            borderBottom: activeTab === 'pending' ? '3px solid #C9A84C' : 'none', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          ⏳ รออนุมัติครูผู้สอน ({pendingTeachers.length})
          {pendingTeachers.length > 0 && (
            <span style={{ fontSize: '10px', background: '#C9A84C', color: '#1A1410', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
              {pendingTeachers.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Filter and Search controls */}
          <div className="erp-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                className="erp-input"
                placeholder="ค้นหาตามชื่อ หรือ อีเมล..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ width: '200px' }}>
              <select className="erp-input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="all">ทุกบทบาท</option>
                <option value="teacher">ครูผู้สอน (Teacher)</option>
                <option value="student">นักเรียน (Student)</option>
              </select>
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
                    <th>บทบาท</th>
                    <th>สถาบันการศึกษา</th>
                    <th>เข้าใช้งานล่าสุด</th>
                    <th>สถานะ</th>
                    <th style={{ textAlign: 'center' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
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
                          background: u.role === 'teacher' ? '#FBF6E9' : '#EAF3EE',
                          color: u.role === 'teacher' ? '#A6882A' : '#1E4D3A',
                          fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px'
                        }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{u.school}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.lastLogin}</td>
                      <td>
                        <span onClick={() => toggleStatus(u.id)} style={{
                          cursor: 'pointer',
                          background: u.status === 'active' ? '#EAF3EE' : '#FAE8EB',
                          color: u.status === 'active' ? '#1E4D3A' : '#8B2635',
                          fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px'
                        }}>
                          ● {u.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            แก้ไข
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--error)', borderColor: 'var(--error-light)' }}>
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                        <a href="#" style={{ color: '#C9A84C', fontWeight: 600, textDecoration: 'none', fontSize: '13px' }}>
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
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E4D3A' }}>➕ สร้างผู้ใช้ระบบใหม่</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="erp-form-group">
                <label className="erp-label">ชื่อผู้ใช้ (ไทย)</label>
                <input className="erp-input" placeholder="เช่น นายวิชา ดีมาก" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
              </div>
              <div className="erp-form-group">
                <label className="erp-label">อีเมล</label>
                <input type="email" className="erp-input" placeholder="example@school.ac.th" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
              </div>
              <div className="erp-form-group">
                <label className="erp-label">บทบาท</label>
                <select className="erp-input" value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                  <option value="student">นักเรียน (Student)</option>
                  <option value="teacher">ครูผู้สอน (Teacher)</option>
                </select>
              </div>
              <div className="erp-form-group">
                <label className="erp-label">สถาบันการศึกษา</label>
                <input className="erp-input" value={newUserSchool} onChange={e => setNewUserSchool(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 700 }}>
                บันทึกบัญชีผู้ใช้งาน
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
