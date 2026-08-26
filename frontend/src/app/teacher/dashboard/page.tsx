'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { toast } from 'sonner'
import AdminIcon, { type AdminIconName } from '@/components/admin/AdminIcon'
import { useRole } from '@/context/RoleContext'
import { authenticatedFetch } from '@/lib/api'
import styles from './page.module.css'

type TeacherAnnouncement = {
  id: string
  title: string
  content: string
  priority: 'urgent' | 'general' | 'event'
  publishedAt: string
  linkUrl?: string
}

type AnnouncementRecord = {
  id: string
  title: string
  content: string
  priority: TeacherAnnouncement['priority']
  link_url: string | null
  published_at: string
}

type StudentRecord = {
  id: string
  name: string
  class: string
  school: string
  sessions: number
  ksa: { K: number; S: number; A: number; C: number }
  lastActive: string
}

type PendingGradingItem = {
  id: string
  studentId: string
  studentName: string
  class: string
  taskName: string
  type: 'Familiarize' | 'Interact' | 'Navigate' | 'Exhibit'
  unit: string
  submittedAt: string
}

const defaultStudents: StudentRecord[] = [
  { id: 'std-001', name: 'นายสมชาย ใจดี', class: 'ปวช.1/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 45, ksa: { K: 80, S: 75, A: 82, C: 70 }, lastActive: '10 นาทีที่แล้ว' },
  { id: 'std-002', name: 'นางสาวมาลี สวยงาม', class: 'ปวช.1/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 62, ksa: { K: 95, S: 90, A: 94, C: 88 }, lastActive: '1 ชั่วโมงที่แล้ว' },
  { id: 'std-003', name: 'นายพิชัย นักเรียน', class: 'ปวช.1/2', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 18, ksa: { K: 50, S: 42, A: 48, C: 38 }, lastActive: '3 ชั่วโมงที่แล้ว' },
  { id: 'std-004', name: 'นางสาวกาญจนา ดีใจ', class: 'ปวช.1/2', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 33, ksa: { K: 68, S: 62, A: 70, C: 58 }, lastActive: 'เมื่อวานนี้' },
  { id: 'std-005', name: 'นายอนันต์ มีใจ', class: 'ปวช.1/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', sessions: 55, ksa: { K: 90, S: 85, A: 92, C: 82 }, lastActive: '2 ชั่วโมงที่แล้ว' },
]

const defaultPending: PendingGradingItem[] = [
  { id: 'grad-001', studentId: 'std-001', studentName: 'นายสมชาย ใจดี', class: 'ปวช.1/1', taskName: 'รับคำสั่งอาหารจากลูกค้า', type: 'Navigate', unit: 'Unit 2 · Hospitality Service', submittedAt: '10 นาทีที่แล้ว' },
  { id: 'grad-002', studentId: 'std-002', studentName: 'นางสาวมาลี สวยงาม', class: 'ปวช.1/1', taskName: 'วิเคราะห์อุปกรณ์จัดบาร์', type: 'Familiarize', unit: 'Unit 1 · Table Setting', submittedAt: '1 ชั่วโมงที่แล้ว' },
  { id: 'grad-003', studentId: 'std-003', studentName: 'นายพิชัย นักเรียน', class: 'ปวช.1/2', taskName: 'สนทนาต้อนรับลูกค้า', type: 'Interact', unit: 'Unit 1 · Reception English', submittedAt: '3 ชั่วโมงที่แล้ว' },
]

const scoreDefinitions = [
  { key: 'K', label: 'Knowledge', detail: 'ความรู้และคำศัพท์', color: '#347553' },
  { key: 'S', label: 'Skills', detail: 'ทักษะการสื่อสาร', color: '#35688c' },
  { key: 'A', label: 'Attribute', detail: 'บุคลิกภาพและจิตบริการ', color: '#947420' },
  { key: 'C', label: 'Competency', detail: 'สมรรถนะการปฏิบัติงาน', color: '#70558b' },
] as const

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'ST'
}

function weightedScore(student: StudentRecord) {
  return Math.round(student.ksa.K * 0.2 + student.ksa.S * 0.3 + student.ksa.A * 0.1 + student.ksa.C * 0.4)
}

function readStoredList<T>(key: string, fallback: T[]) {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return fallback
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.length ? parsed as T[] : fallback
  } catch {
    return fallback
  }
}

export default function TeacherDashboard() {
  const { user } = useRole()
  const [announcements, setAnnouncements] = useState<TeacherAnnouncement[]>([])
  const [students, setStudents] = useState<StudentRecord[]>(defaultStudents)
  const [pendingList, setPendingList] = useState<PendingGradingItem[]>(defaultPending)
  const [classFilter, setClassFilter] = useState('all')
  const [selectedGrading, setSelectedGrading] = useState<PendingGradingItem | null>(null)
  const [scores, setScores] = useState({ K: 80, S: 75, A: 85, C: 70 })
  const [gradingNotes, setGradingNotes] = useState('ผ่านเกณฑ์การประเมินสมรรถนะสะสมเบื้องต้น')

  useEffect(() => {
    const controller = new AbortController()
    void authenticatedFetch('/api/announcements', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('ไม่สามารถโหลดประกาศได้')
        return response.json() as Promise<{ announcements?: AnnouncementRecord[] }>
      })
      .then(payload => setAnnouncements((payload.announcements ?? []).slice(0, 3).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        priority: item.priority,
        linkUrl: item.link_url || undefined,
        publishedAt: new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(item.published_at)),
      }))))
      .catch(error => {
        if (error instanceof Error && error.name !== 'AbortError') toast.error('โหลดประกาศล่าสุดไม่สำเร็จ')
      })

    const studentList = readStoredList('classroomStudents', defaultStudents)
    const gradingList = readStoredList('pendingGradings', defaultPending)
    const storageTimer = window.setTimeout(() => {
      setStudents(studentList)
      setPendingList(gradingList)
    }, 0)
    if (!localStorage.getItem('classroomStudents')) localStorage.setItem('classroomStudents', JSON.stringify(studentList))
    if (!localStorage.getItem('pendingGradings')) localStorage.setItem('pendingGradings', JSON.stringify(gradingList))
    return () => {
      controller.abort()
      window.clearTimeout(storageTimer)
    }
  }, [])

  const classes = useMemo(() => Array.from(new Set(students.map(student => student.class))).sort(), [students])
  const filteredStudents = useMemo(() => classFilter === 'all' ? students : students.filter(student => student.class === classFilter), [classFilter, students])
  const filteredPending = useMemo(() => classFilter === 'all' ? pendingList : pendingList.filter(item => item.class === classFilter), [classFilter, pendingList])
  const totalSessions = filteredStudents.reduce((sum, student) => sum + student.sessions, 0)
  const averageScores = scoreDefinitions.reduce<Record<(typeof scoreDefinitions)[number]['key'], number>>((result, definition) => {
    result[definition.key] = filteredStudents.length
      ? Math.round(filteredStudents.reduce((sum, student) => sum + student.ksa[definition.key], 0) / filteredStudents.length)
      : 0
    return result
  }, { K: 0, S: 0, A: 0, C: 0 })
  const classAverage = filteredStudents.length
    ? Math.round(filteredStudents.reduce((sum, student) => sum + weightedScore(student), 0) / filteredStudents.length)
    : 0
  const needAttention = filteredStudents.filter(student => weightedScore(student) < 70).sort((a, b) => weightedScore(a) - weightedScore(b))

  const metrics: Array<{ label: string; value: string; detail: string; icon: AdminIconName; tone: string }> = [
    { label: 'นักเรียนในชั้น', value: filteredStudents.length.toLocaleString('th-TH'), detail: classFilter === 'all' ? `${classes.length} ห้องเรียน` : classFilter, icon: 'student', tone: 'students' },
    { label: 'ความก้าวหน้าเฉลี่ย', value: `${classAverage}%`, detail: 'คะแนนถ่วงน้ำหนัก KSA-C', icon: 'analytics', tone: 'progress' },
    { label: 'รอตรวจประเมิน', value: filteredPending.length.toLocaleString('th-TH'), detail: 'รายการที่ต้องดำเนินการ', icon: 'clock', tone: 'grading' },
    { label: 'กิจกรรมสะสม', value: totalSessions.toLocaleString('th-TH'), detail: 'ครั้งจากนักเรียนที่เลือก', icon: 'activity', tone: 'sessions' },
  ]

  function openGrading(item: PendingGradingItem) {
    const student = students.find(candidate => candidate.id === item.studentId)
    setScores(student?.ksa ?? { K: 80, S: 75, A: 85, C: 70 })
    setGradingNotes('ผ่านเกณฑ์การประเมินสมรรถนะสะสมเบื้องต้น')
    setSelectedGrading(item)
  }

  function saveGrading() {
    if (!selectedGrading) return
    const updatedStudents = students.map(student => student.id === selectedGrading.studentId
      ? { ...student, ksa: scores, sessions: student.sessions + 1, lastActive: 'เพิ่งได้รับการประเมิน' }
      : student)
    const updatedPending = pendingList.filter(item => item.id !== selectedGrading.id)
    setStudents(updatedStudents)
    setPendingList(updatedPending)
    localStorage.setItem('classroomStudents', JSON.stringify(updatedStudents))
    localStorage.setItem('pendingGradings', JSON.stringify(updatedPending))
    toast.success('บันทึกคะแนน KSA-C แล้ว', { description: selectedGrading.studentName })
    setSelectedGrading(null)
  }

  return (
    <main className={styles.dashboard}>
      <section className={styles.hero} aria-labelledby="teacher-dashboard-title">
        <span className={styles.heroOrb} aria-hidden="true" />
        <div className={styles.heroMain}>
          <p><AdminIcon name="teacher" size={14} /> TEACHER CONSOLE</p>
          <h1 id="teacher-dashboard-title">สวัสดี {user?.name || 'คุณครูผู้สอน'}</h1>
          <span>จัดการชั้นเรียน ติดตามงานประเมิน และดูพัฒนาการของนักเรียนได้ครบในหน้าเดียว</span>
          <div className={styles.heroActions}>
            <Link href="/teacher/assignments"><AdminIcon name="plus" size={16} /> สร้างงานใหม่</Link>
            <Link href="/teacher/students"><AdminIcon name="student" size={16} /> จัดการนักเรียน</Link>
          </div>
          <dl className={styles.heroFacts}>
            <div><dt>ห้องเรียน</dt><dd>{classes.length}</dd></div>
            <div><dt>นักเรียนทั้งหมด</dt><dd>{students.length}</dd></div>
            <div><dt>รอตรวจ</dt><dd>{pendingList.length}</dd></div>
          </dl>
        </div>

        <div className={styles.heroSummary}>
          <label className={styles.classFilter}>
            <span><AdminIcon name="school" size={15} /> ขอบเขตข้อมูล</span>
            <select value={classFilter} onChange={event => setClassFilter(event.target.value)}>
              <option value="all">ทุกห้องเรียน</option>
              {classes.map(className => <option value={className} key={className}>{className}</option>)}
            </select>
          </label>
          <div className={styles.progressSummary}>
            <div
              className={styles.progressRing}
              style={{ '--progress': `${classAverage * 3.6}deg` } as CSSProperties}
              aria-label={`ความก้าวหน้าเฉลี่ย ${classAverage} เปอร์เซ็นต์`}
            >
              <span><strong>{classAverage}%</strong><small>ภาพรวม</small></span>
            </div>
            <div>
              <small>ความก้าวหน้าชั้นเรียน</small>
              <strong>{classFilter === 'all' ? 'ทุกห้องเรียน' : classFilter}</strong>
              <span>{needAttention.length ? `${needAttention.length} คนควรได้รับการติดตาม` : 'นักเรียนทุกคนอยู่ในเกณฑ์ที่ดี'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.metrics} aria-label="ข้อมูลสรุปชั้นเรียน">
        {metrics.map(metric => (
          <article className={styles.metricCard} data-tone={metric.tone} key={metric.label}>
            <span className={styles.metricIcon}><AdminIcon name={metric.icon} size={21} /></span>
            <span className={styles.metricCopy}><small>{metric.label}</small><strong>{metric.value}</strong><span>{metric.detail}</span></span>
          </article>
        ))}
      </section>

      <section className={styles.primaryGrid}>
        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <div><span className={styles.panelIcon}><AdminIcon name="analytics" size={18} /></span><div><h2>ภาพรวมสมรรถนะ KSA-C</h2><p>ค่าเฉลี่ยจากนักเรียนในตัวกรองปัจจุบัน</p></div></div>
            <strong>{classAverage}%</strong>
          </header>
          <div className={styles.scoreList}>
            {scoreDefinitions.map(definition => (
              <div className={styles.scoreItem} key={definition.key}>
                <div><span><b>{definition.key}</b><span><strong>{definition.label}</strong><small>{definition.detail}</small></span></span><strong style={{ color: definition.color }}>{averageScores[definition.key]}%</strong></div>
                <div className={styles.progressTrack}><span style={{ width: `${averageScores[definition.key]}%`, background: definition.color }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <div><span className={styles.panelIcon}><AdminIcon name="activity" size={18} /></span><div><h2>นักเรียนที่ควรติดตาม</h2><p>คะแนนรวมต่ำกว่าเกณฑ์ 70%</p></div></div>
            <Link href="/teacher/students">ดูทั้งหมด <AdminIcon name="arrow" size={15} /></Link>
          </header>
          <div className={styles.attentionList}>
            {needAttention.length ? needAttention.slice(0, 4).map(student => (
              <Link href="/teacher/students" className={styles.attentionRow} key={student.id}>
                <span className={styles.avatar}>{initials(student.name)}</span>
                <span><strong>{student.name}</strong><small>{student.class} · ใช้งานล่าสุด {student.lastActive}</small></span>
                <b>{weightedScore(student)}%</b>
                <AdminIcon name="chevron" size={15} />
              </Link>
            )) : <div className={styles.emptyState}><AdminIcon name="check" size={20} /><strong>นักเรียนผ่านเกณฑ์ทุกคน</strong><span>ยังไม่มีรายการที่ต้องติดตามเป็นพิเศษ</span></div>}
          </div>
        </article>
      </section>

      <section className={styles.secondaryGrid}>
        <article className={`${styles.panel} ${styles.gradingPanel}`}>
          <header className={styles.panelHeader}>
            <div><span className={styles.panelIcon}><AdminIcon name="score" size={18} /></span><div><h2>งานที่รอตรวจประเมิน</h2><p>เรียงตามเวลาที่นักเรียนส่งล่าสุด</p></div></div>
            <Link href="/teacher/assignments">จัดการงาน <AdminIcon name="arrow" size={15} /></Link>
          </header>
          <div className={styles.gradingList}>
            {filteredPending.length ? filteredPending.slice(0, 5).map(item => (
              <article className={styles.gradingRow} key={item.id}>
                <span className={styles.avatar}>{initials(item.studentName)}</span>
                <span className={styles.gradingIdentity}><strong>{item.studentName}</strong><small>{item.class} · {item.submittedAt}</small></span>
                <span className={styles.gradingTask}><strong>{item.taskName}</strong><small>{item.unit}</small></span>
                <span className={styles.typeBadge}>{item.type}</span>
                <button type="button" onClick={() => openGrading(item)}>ตรวจงาน</button>
              </article>
            )) : <div className={styles.emptyState}><AdminIcon name="check" size={20} /><strong>ตรวจงานครบแล้ว</strong><span>ไม่มีรายการประเมินค้างอยู่ในขณะนี้</span></div>}
          </div>
        </article>

        <div className={styles.sideColumn}>
          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <div><span className={styles.panelIcon}><AdminIcon name="announcement" size={18} /></span><div><h2>ประกาศล่าสุด</h2><p>ข่าวสารสำหรับครูผู้สอน</p></div></div>
            </header>
            <div className={styles.announcementList}>
              {announcements.length ? announcements.map(item => (
                <article key={item.id} data-priority={item.priority}>
                  <span>{item.priority === 'urgent' ? 'เร่งด่วน' : item.priority === 'event' ? 'กิจกรรม' : 'ทั่วไป'}</span>
                  <strong>{item.title}</strong>
                  <p>{item.content}</p>
                  <small>{item.publishedAt}</small>
                  {item.linkUrl && <a href={item.linkUrl} target="_blank" rel="noopener noreferrer">เปิดรายละเอียด <AdminIcon name="arrow" size={13} /></a>}
                </article>
              )) : <div className={styles.compactEmpty}>ยังไม่มีประกาศใหม่</div>}
            </div>
          </article>

          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <div><span className={styles.panelIcon}><AdminIcon name="dashboard" size={18} /></span><div><h2>ทางลัด</h2><p>งานที่ใช้บ่อยสำหรับครู</p></div></div>
            </header>
            <div className={styles.quickLinks}>
              <Link href="/teacher/students"><span><AdminIcon name="student" size={17} /></span><div><strong>จัดการนักเรียน</strong><small>ทะเบียน สิทธิ์ และคะแนน</small></div><AdminIcon name="chevron" size={15} /></Link>
              <Link href="/teacher/lessons"><span><AdminIcon name="content" size={17} /></span><div><strong>แผนการสอน</strong><small>สร้างและจัดลำดับบทเรียน</small></div><AdminIcon name="chevron" size={15} /></Link>
              <Link href="/teacher/assignments"><span><AdminIcon name="score" size={17} /></span><div><strong>มอบหมายงาน</strong><small>กิจกรรมและการประเมิน</small></div><AdminIcon name="chevron" size={15} /></Link>
            </div>
          </article>
        </div>
      </section>

      {selectedGrading && (
        <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && setSelectedGrading(null)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="grading-title">
            <header>
              <span><AdminIcon name="score" size={21} /></span>
              <div><h2 id="grading-title">ประเมินสมรรถนะ KSA-C</h2><p>{selectedGrading.studentName} · {selectedGrading.class}</p></div>
              <button type="button" onClick={() => setSelectedGrading(null)} aria-label="ปิดหน้าต่าง"><AdminIcon name="close" size={18} /></button>
            </header>
            <div className={styles.modalTask}><strong>{selectedGrading.taskName}</strong><span>{selectedGrading.unit}</span></div>
            <div className={styles.scoreEditor}>
              {scoreDefinitions.map(definition => (
                <label key={definition.key}>
                  <span><b style={{ color: definition.color }}>{definition.key}</b><span><strong>{definition.label}</strong><small>{definition.detail}</small></span><output>{scores[definition.key]}</output></span>
                  <input type="range" min="0" max="100" value={scores[definition.key]} onChange={event => setScores(current => ({ ...current, [definition.key]: Number(event.target.value) }))} style={{ accentColor: definition.color }} />
                </label>
              ))}
            </div>
            <label className={styles.notesField}><span>ข้อเสนอแนะเพิ่มเติม</span><textarea rows={2} value={gradingNotes} onChange={event => setGradingNotes(event.target.value)} /></label>
            <footer><button type="button" onClick={() => setSelectedGrading(null)}>ยกเลิก</button><button type="button" onClick={saveGrading}><AdminIcon name="check" size={17} /> บันทึกผลประเมิน</button></footer>
          </section>
        </div>
      )}
    </main>
  )
}
