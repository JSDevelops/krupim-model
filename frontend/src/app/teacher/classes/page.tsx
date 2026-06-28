'use client'
import { useState, useEffect } from 'react'

interface Student {
  id: string
  studentId: string
  name: string
  email: string
  classroom: string
  status: 'Registered' | 'Pending'
}

const defaultClassrooms = ['ปวช.1/1', 'ปวช.1/2']

const initialStudents: Student[] = [
  // ปวช.1/1
  { id: 'std-001', studentId: '6720701-0001', name: 'นายสมชาย ใจดี', email: 'somchai.jai@school.ac.th', classroom: 'ปวช.1/1', status: 'Registered' },
  { id: 'std-002', studentId: '6720701-0002', name: 'นางสาวมาลี สวยงาม', email: 'malee.s@school.ac.th', classroom: 'ปวช.1/1', status: 'Registered' },
  { id: 'std-003', studentId: '6720701-0003', name: 'นายณัฐพล สุดหล่อ', email: 'nattaphol.s@school.ac.th', classroom: 'ปวช.1/1', status: 'Registered' },
  { id: 'std-004', studentId: '6720701-0004', name: 'นางสาววิภาวี รักดี', email: 'wipawee.r@school.ac.th', classroom: 'ปวช.1/1', status: 'Pending' },
  // ปวช.1/2
  { id: 'std-005', studentId: '6720701-0025', name: 'นายพิชัย นักเรียน', email: 'pichai.n@school.ac.th', classroom: 'ปวช.1/2', status: 'Registered' },
  { id: 'std-006', studentId: '6720701-0026', name: 'นางสาวดาริกา แสงดาว', email: 'darika.s@school.ac.th', classroom: 'ปวช.1/2', status: 'Registered' },
  { id: 'std-007', studentId: '6720701-0027', name: 'นายอนันต์ ยอดเยี่ยม', email: 'anant.y@school.ac.th', classroom: 'ปวช.1/2', status: 'Pending' }
]

export default function TeacherClassesPage() {
  const [classrooms, setClassrooms] = useState<string[]>([])
  const [students, setStudents] = useState<Student[]>([])

  // Modal Control States
  const [showAddClassModal, setShowAddClassModal] = useState(false)
  const [showAddStudentManual, setShowAddStudentManual] = useState(false)
  const [showImportStudentModal, setShowImportStudentModal] = useState(false)

  // active state
  const [activeClass, setActiveClass] = useState<string>('ปวช.1/1')

  // Form states - เพิ่มห้องเรียน
  const [newClassName, setNewClassName] = useState('')
  const [newClassDept, setNewClassDept] = useState('การโรงแรม')

  // Form states - เพิ่มนักเรียนทีละคน
  const [mStudentId, setMStudentId] = useState('')
  const [mName, setMName] = useState('')
  const [mEmail, setMEmail] = useState('')

  // Form states - นำเข้านักเรียนแบบ Batch/คัดลอกวาง
  const [batchText, setBatchText] = useState('')
  const [csvPreview, setCsvPreview] = useState<Omit<Student, 'id' | 'status'>[]>([])
  const [fileName, setFileName] = useState('')

  // โหลดข้อมูลห้องเรียนและนักเรียนจาก localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedClasses = localStorage.getItem('classroomList')
      if (storedClasses) {
        try { setClassrooms(JSON.parse(storedClasses)) } catch (e) { setClassrooms(defaultClassrooms) }
      } else {
        localStorage.setItem('classroomList', JSON.stringify(defaultClassrooms))
        setClassrooms(defaultClassrooms)
      }

      const storedStudents = localStorage.getItem('classroomStudents')
      if (storedStudents) {
        try { setStudents(JSON.parse(storedStudents)) } catch (e) { setStudents(initialStudents) }
      } else {
        localStorage.setItem('classroomStudents', JSON.stringify(initialStudents))
        setStudents(initialStudents)
      }
    }
  }, [])

  // บันทึกความเปลี่ยนแปลงของนักเรียน
  const saveStudents = (updatedList: Student[]) => {
    setStudents(updatedList)
    localStorage.setItem('classroomStudents', JSON.stringify(updatedList))
  }

  // เพิ่มห้องเรียนใหม่
  function handleAddClassroom(e: React.FormEvent) {
    e.preventDefault()
    if (!newClassName.trim()) return

    const cName = newClassName.trim()
    if (classrooms.includes(cName)) {
      alert('ห้องเรียนนี้มีอยู่ในระบบแล้ว!')
      return
    }

    const updatedClasses = [...classrooms, cName]
    setClassrooms(updatedClasses)
    localStorage.setItem('classroomList', JSON.stringify(updatedClasses))

    setNewClassName('')
    setShowAddClassModal(false)
    setActiveClass(cName) // เปลี่ยนหน้าแสดงผลไปยังห้องที่เพิ่งสร้าง
    alert(`สร้างห้องเรียน "${cName}" (${newClassDept}) สำเร็จ! คุณครูสามารถนำเข้านักเรียนเข้าห้องนี้ได้ทันที`)
  }

  // ลบห้องเรียน
  function handleDeleteClassroom(cName: string) {
    if (confirm(`คุณต้องการลบห้องเรียน "${cName}" และรายชื่อนักเรียนทั้งหมดในห้องนี้หรือไม่?`)) {
      const updatedClasses = classrooms.filter(c => c !== cName)
      setClassrooms(updatedClasses)
      localStorage.setItem('classroomList', JSON.stringify(updatedClasses))

      const updatedStudents = students.filter(s => s.classroom !== cName)
      saveStudents(updatedStudents)

      if (activeClass === cName && updatedClasses.length > 0) {
        setActiveClass(updatedClasses[0])
      }
    }
  }

  // เพิ่มนักเรียนรายบุคคลเข้าสู่ Active Classroom
  function handleAddStudentManual(e: React.FormEvent) {
    e.preventDefault()
    if (!mStudentId || !mName || !mEmail) return

    const newStd: Student = {
      id: `manual-${Date.now()}`,
      studentId: mStudentId.trim(),
      name: mName.trim(),
      email: mEmail.trim(),
      classroom: activeClass,
      status: 'Pending'
    }

    const updated = [...students, newStd]
    saveStudents(updated)

    setMStudentId('')
    setMName('')
    setMEmail('')
    setShowAddStudentManual(false)
    alert(`เพิ่ม ${mName} เข้าสู่ห้อง ${activeClass} สำเร็จ!`)
  }

  // คัดวิเคราะห์ข้อมูลแบบ Batch Text (คัดลอกรายชื่อวาง)
  function handleParseBatchText() {
    if (!batchText.trim()) return
    // คาดหวังรูปแบบ: รหัสนักเรียน  ชื่อ-นามสกุล  อีเมล (คั่นด้วย Tab หรือเครื่องหมายจุลภาค)
    const lines = batchText.split('\n')
    const parsed: Omit<Student, 'id' | 'status'>[] = []

    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      if (!trimmed) return
      
      const columns = trimmed.split(/[\t,]+/)
      if (columns.length >= 2) {
        parsed.push({
          studentId: columns[0]?.trim() || `6720701-${1000 + idx}`,
          name: columns[1]?.trim() || `นักเรียนที่ ${idx + 1}`,
          email: columns[2]?.trim() || `student.${idx + 1}@school.ac.th`,
          classroom: activeClass
        })
      }
    })

    if (parsed.length > 0) {
      setCsvPreview(parsed)
    } else {
      alert('รูปแบบข้อมูลไม่ถูกต้อง! โปรดป้อนข้อมูลแบบ "รหัส คั่นด้วยวรรค/Tab แล้วตามด้วยชื่อ และอีเมล"')
    }
  }

  // อัปโหลดไฟล์ CSV นักเรียน
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      if (!text) return

      const lines = text.split('\n')
      const parsed: Omit<Student, 'id' | 'status'>[] = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const columns = line.split(',')
        if (columns.length >= 2) {
          parsed.push({
            studentId: columns[0]?.trim() || `6720701-00${100 + i}`,
            name: columns[1]?.trim() || `นักเรียนนำเข้าที่ ${i}`,
            email: columns[2]?.trim() || `imported.${i}@school.ac.th`,
            classroom: activeClass
          })
        }
      }
      setCsvPreview(parsed)
    }
    reader.readAsText(file)
  }

  // ยืนยันการบันทึกการนำเข้าแบบกลุ่มเข้าระบบ
  function handleConfirmImport() {
    if (csvPreview.length === 0) return

    const newStudents: Student[] = csvPreview.map((item, idx) => ({
      id: `imported-${Date.now()}-${idx}`,
      studentId: item.studentId,
      name: item.name,
      email: item.email,
      classroom: activeClass,
      status: 'Pending'
    }))

    const updated = [...students, ...newStudents]
    saveStudents(updated)

    setShowImportStudentModal(false)
    setCsvPreview([])
    setBatchText('')
    setFileName('')
    alert(`นำเข้านักเรียนจำนวน ${newStudents.length} คน เข้าห้อง ${activeClass} สำเร็จ!`)
  }

  // ลบนักเรียนออกจากห้องเรียน
  function handleDeleteStudent(id: string, name: string) {
    if (confirm(`คุณต้องการลบคุณ ${name} ออกจากห้องเรียนนี้หรือไม่?`)) {
      const updated = students.filter(s => s.id !== id)
      saveStudents(updated)
    }
  }

  // โหลดไฟล์ตัวอย่าง
  function downloadTemplate() {
    const csvContent = "data:text/csv;charset=utf-8,รหัสนักเรียน,ชื่อ-นามสกุล,อีเมล\n6720701-0101,นายธนาธิป โต๊ะกลม,thanathip.t@school.ac.th\n6720701-0102,นางสาวพิมพ์ชนก แก้วใส,pimchanok.k@school.ac.th"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "student_import_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredStudents = students.filter(s => s.classroom === activeClass)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1E4D3A' }}>🏫 ระบบบริหารห้องเรียน ปวช.1 โรงแรม (Classroom Workspace)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            สร้างห้องเรียนรายห้อง มอบหมายห้องเรียน และนำเข้ารายชื่อนักเรียนด้วยแบบฟอร์มคัดลอกรายชื่อวาง หรือไฟล์ Excel
          </p>
        </div>
        <div>
          <button 
            onClick={() => setShowAddClassModal(true)} 
            className="btn btn-primary" 
            style={{ border: 'none', fontWeight: 800, padding: '12px 20px', borderRadius: 12 }}
          >
            ➕ เพิ่มห้องเรียนใหม่
          </button>
        </div>
      </div>

      {/* Class Selector Tabs & Delete Class button */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        {classrooms.map(cls => {
          const count = students.filter(s => s.classroom === cls).length
          const isActive = activeClass === cls
          return (
            <div 
              key={cls}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, background: isActive ? 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)' : '#FDFAF4',
                padding: '4px 12px', borderRadius: 14, border: '1.5px solid rgba(201,168,76,0.25)',
                boxShadow: isActive ? '0 4px 12px rgba(16,43,31,0.12)' : 'none',
              }}
            >
              <button
                onClick={() => setActiveClass(cls)}
                style={{
                  padding: '8px 12px', border: 'none', background: 'transparent',
                  fontFamily: 'var(--font-primary)', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer',
                  color: isActive ? '#FDFAF4' : '#1E4D3A',
                }}
              >
                ห้อง {cls} ({count} คน)
              </button>
              
              <button 
                onClick={() => handleDeleteClassroom(cls)}
                style={{
                  background: 'transparent', border: 'none', color: isActive ? 'rgba(255,255,255,0.6)' : '#8B2635',
                  cursor: 'pointer', fontSize: 13, padding: '4px'
                }}
                title="ลบห้องเรียนนี้"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* Student List Table of Current Classroom */}
      <div className="erp-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE9E1', background: '#FDFAF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>
              บัญชีรายชื่อห้อง: {activeClass} ({filteredStudents.length} คน)
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
              คุณครูสามารถเพิ่มเด็กทีละรายบุคคล หรือก๊อปปี้รายชื่อเพื่อนำเข้าแบบกลุ่มรวดเร็วเข้ารายห้องเรียนนี้
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setShowAddStudentManual(true)} 
              className="btn btn-outline btn-sm" 
              style={{ borderColor: '#C9A84C', color: '#A6882A', fontWeight: 700 }}
            >
              ➕ เพิ่มเด็กรายคน
            </button>
            <button 
              onClick={() => setShowImportStudentModal(true)} 
              className="btn btn-primary btn-sm" 
              style={{ border: 'none', fontWeight: 700 }}
            >
              📥 นำเข้านักเรียนแบบกลุ่ม
            </button>
          </div>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            📭 ยังไม่มีนักเรียนในห้องเรียน "{activeClass}" <br />
            โปรดกดปุ่มด้านบนขวาเพื่อนำรายชื่อนักเรียนนำส่งเข้าสู่ห้องเรียนนี้
          </div>
        ) : (
          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>รหัสประจำตัวนักเรียน</th>
                  <th>ชื่อ - นามสกุล</th>
                  <th>อีเมล / บัญชีใช้เรียน</th>
                  <th>สถานะระบบ</th>
                  <th style={{ textAlign: 'center' }}>จัดการห้องเรียน</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: '#A6882A' }}>{s.studentId}</td>
                    <td style={{ fontWeight: 700 }}>👨‍🎓 {s.name}</td>
                    <td>{s.email}</td>
                    <td>
                      <span className="badge" style={{ background: s.status === 'Registered' ? '#EAF3EE' : '#FBF6E9', color: s.status === 'Registered' ? '#1E4D3A' : '#A6882A', fontWeight: 700 }}>
                        {s.status === 'Registered' ? '✓ เข้าร่วมแล้ว' : '⌛ รอลงทะเบียน'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteStudent(s.id, s.name)}
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: '#FAE8EB', color: '#8B2635', padding: '4px 10px' }}
                      >
                        ลบออก
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: ADD CLASSROOM ── */}
      {showAddClassModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <form onSubmit={handleAddClassroom} className="erp-card" style={{ width: '420px', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: 10 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>🏫 สร้างห้องเรียนใหม่</h3>
              <button type="button" onClick={() => setShowAddClassModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div className="erp-form-group">
              <label className="erp-label">ชื่อห้องเรียน</label>
              <input 
                className="erp-input" 
                value={newClassName} 
                onChange={e => setNewClassName(e.target.value)} 
                placeholder="เช่น ปวช.1/3, ม.4/1" 
                required 
              />
            </div>
            
            <div className="erp-form-group">
              <label className="erp-label">แผนกวิชา / สาขา</label>
              <input 
                className="erp-input" 
                value={newClassDept} 
                onChange={e => setNewClassDept(e.target.value)} 
                placeholder="เช่น การโรงแรมและบริการอาหาร" 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 800, marginTop: 4 }}>
              💾 บันทึกและสร้างห้องเรียน
            </button>
          </form>
        </div>
      )}

      {/* ── MODAL: ADD STUDENT MANUALLY ── */}
      {showAddStudentManual && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <form onSubmit={handleAddStudentManual} className="erp-card" style={{ width: '420px', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: 10 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>➕ เพิ่มนักเรียนเข้าห้อง {activeClass}</h3>
              <button type="button" onClick={() => setShowAddStudentManual(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div className="erp-form-group">
              <label className="erp-label">รหัสนักเรียน</label>
              <input 
                className="erp-input" 
                value={mStudentId} 
                onChange={e => setMStudentId(e.target.value)} 
                placeholder="เช่น 6720701-0005" 
                required 
              />
            </div>
            
            <div className="erp-form-group">
              <label className="erp-label">ชื่อ - นามสกุลจริง</label>
              <input 
                className="erp-input" 
                value={mName} 
                onChange={e => setMName(e.target.value)} 
                placeholder="เช่น นายมานะ รักดี" 
                required 
              />
            </div>

            <div className="erp-form-group">
              <label className="erp-label">อีเมลติดต่อ</label>
              <input 
                className="erp-input" 
                type="email"
                value={mEmail} 
                onChange={e => setMEmail(e.target.value)} 
                placeholder="เช่น mana@school.ac.th" 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 800, marginTop: 4 }}>
              💾 บันทึกรายชื่อนักเรียน
            </button>
          </form>
        </div>
      )}

      {/* ── MODAL: IMPORT STUDENTS BATCH / CSV ── */}
      {showImportStudentModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div className="erp-card" style={{ width: '640px', maxHeight: '90vh', overflowY: 'auto', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: 10 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>📥 นำเข้าข้อมูลนักเรียนแบบกลุ่ม (ห้อง: {activeClass})</h3>
              <button type="button" onClick={() => { setShowImportStudentModal(false); setCsvPreview([]); setFileName(''); setBatchText(''); }} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Template downloader */}
            <div style={{ padding: '12px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#A6882A' }}>📋 มีแบบฟอร์มนำเข้าไฟล์ CSV?</span>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: 2 }}>ดาวน์โหลดแบบฟอร์มมาตรฐาน นำรหัสนักเรียน ชื่อ และอีเมลมาใส่เพื่ออัปโหลดไฟล์</div>
              </div>
              <button onClick={downloadTemplate} className="btn btn-outline btn-sm" style={{ borderColor: '#C9A84C', color: '#A6882A', fontWeight: 700 }}>
                ดาวน์โหลดแบบฟอร์ม
              </button>
            </div>

            {/* วิธีที่ 1: อัปโหลดไฟล์ */}
            <div style={{ border: '2px dashed rgba(201,168,76,0.25)', borderRadius: '14px', padding: '20px', textAlign: 'center', background: 'white', position: 'relative' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '6px' }}>📊 อัปโหลดไฟล์ CSV</span>
              <span style={{ fontSize: '12.5px', fontWeight: 700, display: 'block', color: '#1E4D3A' }}>
                {fileName ? `ไฟล์ปัจจุบัน: ${fileName}` : 'ลากไฟล์ CSV หรือคลิกเพื่ออัปโหลดบัญชีรายชื่อ'}
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
            </div>

            <div style={{ textAlign: 'center', color: '#8C8272', fontWeight: 700, fontSize: 12, margin: '4px 0' }}>— หรือป้อนข้อมูลแบบคัดลอกวางด้านล่าง —</div>

            {/* วิธีที่ 2: คัดลอกวางข้อมูล (Batch Copy-Paste) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>วางข้อมูลแถวละ 1 คน (รูปแบบ: รหัสนักเรียน [เว้นวรรค/Tab] ชื่อ-นามสกุล [เว้นวรรค/Tab] อีเมล)</label>
              <textarea 
                value={batchText}
                onChange={e => setBatchText(e.target.value)}
                placeholder="เช่น:&#10;6720701-0110	นายสมพงษ์ เรียนดี	sompong@school.ac.th&#10;6720701-0111	นางสาวมณี สวยสม	manee@school.ac.th"
                rows={4}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none', resize: 'none', fontFamily: 'monospace', fontSize: 12 }}
              />
              <button 
                onClick={handleParseBatchText}
                className="btn btn-outline btn-sm"
                style={{ alignSelf: 'flex-end', marginTop: 4, borderColor: '#C9A84C', color: '#A6882A', fontWeight: 700 }}
              >
                ⚙️ ประมวลผลข้อความที่วาง
              </button>
            </div>

            {/* Preview of Parsed Data */}
            {csvPreview.length > 0 && (
              <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A', margin: '0 0 8px' }}>🔍 พรีวิวรายชื่อที่เตรียมนำเข้าห้อง "{activeClass}" ({csvPreview.length} รายการ)</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1.5px solid #EDE9E1', borderRadius: 12 }}>
                  <table className="erp-table" style={{ fontSize: '11px' }}>
                    <thead>
                      <tr>
                        <th>รหัสนักเรียน</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>อีเมล</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, color: '#A6882A' }}>{item.studentId}</td>
                          <td style={{ fontWeight: 700 }}>{item.name}</td>
                          <td>{item.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button 
                  onClick={handleConfirmImport} 
                  className="btn btn-primary" 
                  style={{ width: '100%', border: 'none', padding: '12px', fontWeight: 800, marginTop: '12px' }}
                >
                  📥 ยืนยันนำเข้ารายชื่อทั้งหมด ({csvPreview.length} คน)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
