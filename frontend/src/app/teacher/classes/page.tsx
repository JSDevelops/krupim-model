'use client'

import { FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import AdminIcon from '@/components/admin/AdminIcon'
import { confirmAction } from '@/components/AppConfirmDialog'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import styles from '../management.module.css'

type Classroom = {
  id: string
  name: string
  description: string
  year: number
  semester: number
  isActive: boolean
  teacherName?: string
  studentCount: number
  createdAt: string
}

type ClassStudent = {
  id: string
  name: string
  email: string
  schoolName: string
  status: 'active' | 'inactive' | 'pending'
  enrolledAt: string
}

type ClassForm = { name: string; description: string; year: string; semester: string }
const emptyClassForm: ClassForm = { name: '', description: '', year: String(new Date().getFullYear() + 543), semester: '1' }

async function responseError(response: Response) {
  try { return ((await response.json()) as { error?: string }).error || 'ไม่สามารถดำเนินการได้' } catch { return 'ไม่สามารถดำเนินการได้' }
}

function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'ST' }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'ไม่ระบุ' : new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date) }

export default function TeacherClassesPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [students, setStudents] = useState<ClassStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [rosterLoading, setRosterLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [classEditorOpen, setClassEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [classForm, setClassForm] = useState<ClassForm>(emptyClassForm)
  const [memberEditorOpen, setMemberEditorOpen] = useState(false)
  const [memberEmails, setMemberEmails] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const loadRoster = useCallback(async (classId: string, signal?: AbortSignal) => {
    setRosterLoading(true)
    try {
      const response = await authenticatedFetch(`/api/teacher/classes?classId=${encodeURIComponent(classId)}`, { cache: 'no-store', signal })
      if (!response.ok) throw new Error(await responseError(response))
      const payload = await response.json() as { students?: ClassStudent[] }
      setStudents(payload.students ?? [])
    } finally { setRosterLoading(false) }
  }, [])

  const loadClassrooms = useCallback(async (signal?: AbortSignal) => {
    const response = await authenticatedFetch('/api/teacher/classes', { cache: 'no-store', signal })
    if (!response.ok) throw new Error(await responseError(response))
    const payload = await response.json() as { classrooms?: Classroom[] }
    const nextClasses = payload.classrooms ?? []
    setClassrooms(nextClasses)
    const nextActive = nextClasses.find(item => item.id === activeId)?.id || nextClasses[0]?.id || null
    setActiveId(nextActive)
    if (nextActive) await loadRoster(nextActive, signal)
    else setStudents([])
  }, [activeId, loadRoster])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void loadClassrooms(controller.signal).then(() => setError('')).catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') setError(loadError.message)
      }).finally(() => setLoading(false))
    }, 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [loadClassrooms])

  const activeClass = classrooms.find(item => item.id === activeId) || null
  const visibleStudents = useMemo(() => {
    const keyword = deferredSearch.trim().toLocaleLowerCase('th-TH')
    return !keyword ? students : students.filter(student => [student.name, student.email, student.schoolName].some(value => value?.toLocaleLowerCase('th-TH').includes(keyword)))
  }, [deferredSearch, students])
  const totalStudents = classrooms.reduce((sum, item) => sum + Number(item.studentCount || 0), 0)
  const summary = [
    { key: 'green', label: 'ห้องเรียนทั้งหมด', value: classrooms.length, detail: 'ห้องที่คุณรับผิดชอบ', icon: 'school' as const },
    { key: 'blue', label: 'สมาชิกในชั้น', value: totalStudents, detail: 'รวมการลงทะเบียนทุกห้อง', icon: 'student' as const },
    { key: 'gold', label: 'ปีการศึกษา', value: activeClass?.year || '—', detail: activeClass ? `ภาคเรียนที่ ${activeClass.semester}` : 'ยังไม่ได้เลือกห้อง', icon: 'course' as const },
    { key: 'purple', label: 'ห้องที่เลือก', value: activeClass?.studentCount || 0, detail: activeClass?.name || 'ยังไม่มีห้องเรียน', icon: 'users' as const },
  ]

  async function selectClass(id: string) {
    if (id === activeId || rosterLoading) return
    setActiveId(id)
    try { await loadRoster(id) } catch (loadError) { toast.error(loadError instanceof Error ? loadError.message : 'โหลดรายชื่อนักเรียนไม่สำเร็จ') }
  }

  function openCreate() { setEditingId(null); setClassForm(emptyClassForm); setClassEditorOpen(true) }
  function openEdit(item: Classroom) { setEditingId(item.id); setClassForm({ name: item.name, description: item.description || '', year: String(item.year), semester: String(item.semester) }); setClassEditorOpen(true) }

  async function saveClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy('save-class')
    try {
      const response = await authenticatedFetch('/api/teacher/classes', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...(editingId ? { id: editingId } : { action: 'create_class' }), ...classForm }) })
      if (!response.ok) throw new Error(await responseError(response))
      const payload = await response.json() as { classroom: Classroom }
      if (editingId) setClassrooms(current => current.map(item => item.id === editingId ? { ...item, ...payload.classroom } : item))
      else { const created = { ...payload.classroom, studentCount: 0 }; setClassrooms(current => [created, ...current]); setActiveId(created.id); setStudents([]) }
      setClassEditorOpen(false); toast.success(editingId ? 'บันทึกข้อมูลห้องเรียนแล้ว' : 'สร้างห้องเรียนแล้ว', { description: payload.classroom.name })
    } catch (saveError) { toast.error(saveError instanceof Error ? saveError.message : 'บันทึกห้องเรียนไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  async function deleteClass(item: Classroom) {
    const confirmed = await confirmAction({ title: 'ลบห้องเรียนนี้?', description: `ห้อง “${item.name}” และรายชื่อสมาชิกจะถูกลบ การดำเนินการนี้ไม่สามารถย้อนกลับได้`, confirmText: 'ลบห้องเรียน', tone: 'danger' })
    if (!confirmed) return
    setBusy(`delete-class:${item.id}`)
    try {
      const response = await authenticatedFetch(`/api/teacher/classes?type=class&classId=${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await responseError(response))
      const next = classrooms.filter(candidate => candidate.id !== item.id); setClassrooms(next)
      if (activeId === item.id) { const nextId = next[0]?.id || null; setActiveId(nextId); if (nextId) await loadRoster(nextId); else setStudents([]) }
      toast.success('ลบห้องเรียนแล้ว')
    } catch (deleteError) { toast.error(deleteError instanceof Error ? deleteError.message : 'ลบห้องเรียนไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  async function addMembers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!activeId) return
    const emails = Array.from(new Set(memberEmails.split(/[\n,;]+/).map(value => value.trim()).filter(Boolean)))
    if (!emails.length) { toast.warning('กรุณากรอกอีเมลนักเรียน'); return }
    setBusy('add-members')
    try {
      const isBulk = emails.length > 1
      const response = await authenticatedFetch('/api/teacher/classes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(isBulk ? { action: 'bulk_add', classId: activeId, emails } : { action: 'add_student', classId: activeId, studentEmail: emails[0] }) })
      if (!response.ok) throw new Error(await responseError(response))
      const result = await response.json() as { added?: number; missing?: string[] }
      await loadRoster(activeId)
      const added = isBulk ? result.added || 0 : 1
      setClassrooms(current => current.map(item => item.id === activeId ? { ...item, studentCount: item.studentCount + added } : item))
      setMemberEditorOpen(false); setMemberEmails('')
      toast.success(`เพิ่มนักเรียน ${added} คนแล้ว`, result.missing?.length ? { description: `ไม่พบบัญชี ${result.missing.length} รายการ` } : undefined)
    } catch (addError) { toast.error(addError instanceof Error ? addError.message : 'เพิ่มนักเรียนไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  async function removeStudent(student: ClassStudent) {
    if (!activeId) return
    const confirmed = await confirmAction({ title: 'นำออกจากห้องเรียน?', description: `${student.name} จะยังมีบัญชีในระบบ แต่จะไม่เป็นสมาชิกของห้องนี้`, confirmText: 'นำออกจากห้อง', tone: 'danger' })
    if (!confirmed) return
    setBusy(`remove:${student.id}`)
    try {
      const response = await authenticatedFetch(`/api/teacher/classes?type=member&classId=${encodeURIComponent(activeId)}&studentId=${encodeURIComponent(student.id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await responseError(response))
      setStudents(current => current.filter(item => item.id !== student.id)); setClassrooms(current => current.map(item => item.id === activeId ? { ...item, studentCount: Math.max(0, item.studentCount - 1) } : item)); toast.success('นำนักเรียนออกจากห้องแล้ว')
    } catch (removeError) { toast.error(removeError instanceof Error ? removeError.message : 'นำออกจากห้องไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  return <main className={styles.page}>
    <header className={styles.pageHeader}><div><p>CLASSROOM MANAGEMENT</p><h1>ห้องเรียนและสมาชิก</h1><span>สร้างห้องเรียน จัดสมาชิก และดูสถานะการลงทะเบียนจากฐานข้อมูลเดียว</span></div><div className={styles.headerActions}><button className={styles.secondaryButton} type="button" onClick={() => void loadClassrooms()}><AdminIcon name="refresh" size={16} />อัปเดตข้อมูล</button><button className={styles.primaryButton} type="button" onClick={openCreate}><AdminIcon name="plus" size={16} />สร้างห้องเรียน</button></div></header>
    {error && <div className={styles.error}><AdminIcon name="activity" size={17} /><span>{error}</span><button type="button" onClick={() => void loadClassrooms()}>ลองอีกครั้ง</button></div>}
    <section className={styles.metrics}>{summary.map(item => <article className={styles.metricCard} data-tone={item.key} key={item.label}><span className={styles.metricIcon}><AdminIcon name={item.icon} size={20} /></span><span><small>{item.label}</small><strong>{loading ? '—' : item.value}</strong><span>{item.detail}</span></span></article>)}</section>
    <section className={styles.classesWorkspace}>
      <aside className={styles.classPanel}><header><div><h2>ห้องเรียนของคุณ</h2><p>{classrooms.length} ห้องเรียน</p></div><button type="button" onClick={openCreate}><AdminIcon name="plus" size={16} /></button></header><div className={styles.classList}>{loading ? Array.from({ length: 3 }).map((_, index) => <div className={styles.classSkeleton} key={index} />) : classrooms.length ? classrooms.map(item => <article className={item.id === activeId ? styles.classCardActive : styles.classCard} key={item.id} onClick={() => void selectClass(item.id)}><span><AdminIcon name="school" size={18} /></span><div><strong>{item.name}</strong><small>ปี {item.year} · ภาคเรียน {item.semester}</small></div><b>{item.studentCount}</b><button type="button" onClick={event => { event.stopPropagation(); openEdit(item) }}><AdminIcon name="edit" size={14} /></button></article>) : <div className={styles.compactEmpty}>ยังไม่มีห้องเรียน</div>}</div></aside>
      <div className={styles.rosterPanel}>{activeClass ? <><header className={styles.rosterHeader}><div><span><AdminIcon name="users" size={18} /></span><div><h2>{activeClass.name}</h2><p>{activeClass.description || `ปีการศึกษา ${activeClass.year} · ภาคเรียนที่ ${activeClass.semester}`}</p></div></div><div><button type="button" className={styles.secondaryButton} onClick={() => openEdit(activeClass)}><AdminIcon name="edit" size={15} />แก้ไขห้อง</button><button type="button" className={styles.primaryButton} onClick={() => { setMemberEmails(''); setMemberEditorOpen(true) }}><AdminIcon name="plus" size={15} />เพิ่มนักเรียน</button><button type="button" className={styles.dangerButton} onClick={() => void deleteClass(activeClass)}><AdminIcon name="trash" size={15} /></button></div></header><div className={styles.rosterTools}><label className={styles.searchBox}><AdminIcon name="search" size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาชื่อหรืออีเมล" aria-label="ค้นหานักเรียน" /></label><span>{visibleStudents.length} คน</span></div><div className={styles.studentList}>{rosterLoading ? Array.from({ length: 4 }).map((_, index) => <div className={styles.rowSkeleton} key={index} />) : visibleStudents.length ? visibleStudents.map(student => <article className={styles.studentRow} key={student.id}><span className={styles.studentAvatar}>{initials(student.name)}</span><div><strong>{student.name}</strong><small>{student.email}</small></div><span>{student.schoolName || 'ไม่ระบุสถานศึกษา'}</span><span className={student.status === 'active' ? styles.readyBadge : styles.draftBadge}>{student.status === 'active' ? 'ใช้งาน' : 'ระงับ'}</span><small>{formatDate(student.enrolledAt)}</small><button type="button" onClick={() => void removeStudent(student)} disabled={Boolean(busy)}><AdminIcon name="close" size={15} /></button></article>) : <div className={styles.emptyState}><span><AdminIcon name="student" size={24} /></span><h3>ยังไม่มีนักเรียนในห้องนี้</h3><p>เพิ่มด้วยอีเมลของบัญชีนักเรียนที่เปิดใช้งานแล้ว</p><button type="button" onClick={() => setMemberEditorOpen(true)}><AdminIcon name="plus" size={16} />เพิ่มนักเรียน</button></div>}</div></> : <div className={styles.emptyState}><span><AdminIcon name="school" size={25} /></span><h3>เริ่มจากสร้างห้องเรียน</h3><p>เมื่อมีห้องเรียนแล้ว คุณจะเพิ่มและจัดการสมาชิกได้ที่นี่</p><button type="button" onClick={openCreate}><AdminIcon name="plus" size={16} />สร้างห้องเรียน</button></div>}</div>
    </section>
    {classEditorOpen && <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !busy && setClassEditorOpen(false)}><section className={styles.modal} role="dialog" aria-modal="true"><header className={styles.modalHeader}><span><AdminIcon name={editingId ? 'edit' : 'plus'} size={21} /></span><div><h2>{editingId ? 'แก้ไขห้องเรียน' : 'สร้างห้องเรียนใหม่'}</h2><p>กำหนดชื่อ ปีการศึกษา และภาคเรียน</p></div><button type="button" onClick={() => setClassEditorOpen(false)}><AdminIcon name="close" size={18} /></button></header><form onSubmit={saveClass}><div className={styles.formGrid}><label className={styles.fullField}><span>ชื่อห้องเรียน *</span><input autoFocus required value={classForm.name} onChange={event => setClassForm(current => ({ ...current, name: event.target.value }))} placeholder="เช่น ปวช.1/1" /></label><label><span>ปีการศึกษา *</span><input required type="number" min="2000" max="3000" value={classForm.year} onChange={event => setClassForm(current => ({ ...current, year: event.target.value }))} /></label><label><span>ภาคเรียน *</span><select value={classForm.semester} onChange={event => setClassForm(current => ({ ...current, semester: event.target.value }))}><option value="1">ภาคเรียนที่ 1</option><option value="2">ภาคเรียนที่ 2</option><option value="3">ภาคฤดูร้อน</option></select></label><label className={styles.fullField}><span>รายละเอียด</span><textarea rows={3} value={classForm.description} onChange={event => setClassForm(current => ({ ...current, description: event.target.value }))} /></label></div><footer className={styles.modalFooter}><button type="button" onClick={() => setClassEditorOpen(false)}>ยกเลิก</button><button className={styles.primaryButton} type="submit" disabled={busy === 'save-class'}><AdminIcon name={busy === 'save-class' ? 'clock' : 'check'} size={16} />บันทึกห้องเรียน</button></footer></form></section></div>}
    {memberEditorOpen && activeClass && <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !busy && setMemberEditorOpen(false)}><section className={`${styles.modal} ${styles.compactModal}`} role="dialog" aria-modal="true"><header className={styles.modalHeader}><span><AdminIcon name="student" size={21} /></span><div><h2>เพิ่มนักเรียนเข้า {activeClass.name}</h2><p>ใช้บัญชีนักเรียนที่เปิดใช้งานแล้วในระบบ</p></div><button type="button" onClick={() => setMemberEditorOpen(false)}><AdminIcon name="close" size={18} /></button></header><form onSubmit={addMembers}><div className={styles.formGrid}><label className={styles.fullField}><span>อีเมลนักเรียน</span><textarea autoFocus required rows={6} value={memberEmails} onChange={event => setMemberEmails(event.target.value)} placeholder={'student1@example.com\nstudent2@example.com'} /><small>กรอกได้หลายอีเมล โดยขึ้นบรรทัดใหม่หรือคั่นด้วยเครื่องหมายจุลภาค</small></label></div><footer className={styles.modalFooter}><button type="button" onClick={() => setMemberEditorOpen(false)}>ยกเลิก</button><button className={styles.primaryButton} type="submit" disabled={busy === 'add-members'}><AdminIcon name={busy === 'add-members' ? 'clock' : 'plus'} size={16} />เพิ่มเข้าห้องเรียน</button></footer></form></section></div>}
  </main>
}
