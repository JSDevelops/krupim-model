'use client'

import Link from 'next/link'
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import AdminIcon from '@/components/admin/AdminIcon'
import { confirmAction } from '@/components/AppConfirmDialog'
import { authenticatedFetch } from '@/lib/api'
import styles from './page.module.css'

type Certificate = {
  id: string; studentId: string; certificateCode: string; issuedName: string; email: string
  schoolName: string | null; overallScore: number; issuedAt: string; revokedAt: string | null; valid: boolean
}

type StudentCandidate = {
  id: string; name: string; email: string; schoolName: string | null; overallScore: number
  scoreSnapshot: { knowledgeScore: number; skillsScore: number; attitudeScore: number; competencyScore: number; overallScore: number }
  eligible: boolean; certificateId: string | null; certificateCode: string | null; certificateValid: boolean | null
}

type CertificateEvent = {
  id: string; certificateId: string; eventType: 'issue' | 'reissue' | 'revoke' | 'restore'
  details: { certificateCode?: string; previousCertificateCode?: string; overallScore?: number; migrated?: boolean }
  createdAt: string; actorName: string | null; actorEmail: string | null
}

const eventLabel: Record<CertificateEvent['eventType'], string> = {
  issue: 'ออกใบรับรอง', reissue: 'ออกใบรับรองใหม่', revoke: 'ยกเลิกใบรับรอง', restore: 'คืนสถานะใบรับรอง',
}

function formatDate(value: string, withTime = false) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('th-TH', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(date)
}

async function responseError(response: Response) {
  try { return ((await response.json()) as { error?: string }).error || 'ดำเนินการไม่สำเร็จ' } catch { return 'ดำเนินการไม่สำเร็จ' }
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [students, setStudents] = useState<StudentCandidate[]>([])
  const [events, setEvents] = useState<CertificateEvent[]>([])
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [filter, setFilter] = useState<'all' | 'valid' | 'revoked'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [issueOpen, setIssueOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [historyCertificate, setHistoryCertificate] = useState<Certificate | null>(null)

  const loadCertificates = useCallback(async (signal?: AbortSignal) => {
    const response = await authenticatedFetch('/api/admin/certificates', { cache: 'no-store', signal })
    if (!response.ok) throw new Error(await responseError(response))
    const payload = await response.json() as { certificates?: Certificate[]; students?: StudentCandidate[]; events?: CertificateEvent[] }
    setCertificates(payload.certificates || [])
    setStudents(payload.students || [])
    setEvents(payload.events || [])
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void loadCertificates(controller.signal).catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') setError(loadError.message)
      }).finally(() => setLoading(false))
    }, 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [loadCertificates])

  const summary = useMemo(() => {
    const valid = certificates.filter(item => item.valid).length
    const revoked = certificates.length - valid
    const average = certificates.length ? Math.round(certificates.reduce((total, item) => total + item.overallScore, 0) / certificates.length) : 0
    return { total: certificates.length, valid, revoked, average }
  }, [certificates])

  const visible = useMemo(() => {
    const keyword = deferredSearch.trim().toLocaleLowerCase('th-TH')
    return certificates.filter(item => {
      const matchesStatus = filter === 'all' || (filter === 'valid' ? item.valid : !item.valid)
      return matchesStatus && (!keyword || [item.issuedName, item.email, item.schoolName || '', item.certificateCode]
        .some(value => value.toLocaleLowerCase('th-TH').includes(keyword)))
    })
  }, [certificates, deferredSearch, filter])

  const candidateStudents = useMemo(() => {
    const keyword = studentSearch.trim().toLocaleLowerCase('th-TH')
    return students.filter(student => !keyword || [student.name, student.email, student.schoolName || ''].some(value => value.toLocaleLowerCase('th-TH').includes(keyword)))
  }, [studentSearch, students])

  const selectedStudent = students.find(student => student.id === selectedStudentId) || null
  const selectedHistory = historyCertificate ? events.filter(event => event.certificateId === historyCertificate.id) : []

  function openIssue(studentId = '') {
    setStudentSearch('')
    setSelectedStudentId(studentId)
    setIssueOpen(true)
  }

  async function issueCertificate() {
    if (!selectedStudent) return
    const action = selectedStudent.certificateId ? 'reissue' : 'issue'
    if (action === 'reissue') {
      const confirmed = await confirmAction({
        title: 'ออกใบรับรองใหม่อีกครั้ง?',
        description: `เลขที่ ${selectedStudent.certificateCode} จะใช้งานไม่ได้ และระบบจะออกเลขที่ใหม่จากคะแนนล่าสุด`,
        confirmText: 'ออกเลขที่ใหม่',
      })
      if (!confirmed) return
    }
    setBusy(`issue:${selectedStudent.id}`)
    try {
      const response = await authenticatedFetch('/api/admin/certificates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: selectedStudent.id, action }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      await loadCertificates()
      setIssueOpen(false)
      toast.success(action === 'issue' ? 'ออกใบรับรองเรียบร้อยแล้ว' : 'ออกใบรับรองเลขที่ใหม่แล้ว', { description: selectedStudent.name })
    } catch (issueError) { toast.error(issueError instanceof Error ? issueError.message : 'ออกใบรับรองไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  async function toggleCertificate(item: Certificate) {
    const action = item.valid ? 'revoke' : 'restore'
    const confirmed = await confirmAction({
      title: item.valid ? 'ยกเลิกใบรับรองนี้?' : 'คืนสถานะใบรับรองนี้?',
      description: item.valid
        ? `${item.issuedName} จะไม่สามารถใช้เลขที่ ${item.certificateCode} ยืนยันผลได้จนกว่าจะคืนสถานะ`
        : `ใบรับรองของ ${item.issuedName} จะกลับมาแสดงผลว่าถูกต้อง`,
      confirmText: item.valid ? 'ยกเลิกใบรับรอง' : 'คืนสถานะ', tone: item.valid ? 'danger' : 'default',
    })
    if (!confirmed) return
    setBusy(item.id)
    try {
      const response = await authenticatedFetch('/api/admin/certificates', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, action }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      await loadCertificates()
      toast.success(action === 'revoke' ? 'ยกเลิกใบรับรองแล้ว' : 'คืนสถานะใบรับรองแล้ว')
    } catch (updateError) { toast.error(updateError instanceof Error ? updateError.message : 'เปลี่ยนสถานะใบรับรองไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  const metrics = [
    { label: 'ใบรับรองทั้งหมด', value: summary.total, detail: 'รายการที่เคยออกจากระบบ', icon: 'archive' as const, tone: 'blue' },
    { label: 'ใช้งานได้', value: summary.valid, detail: 'ตรวจสอบแล้วแสดงสถานะถูกต้อง', icon: 'check' as const, tone: 'green' },
    { label: 'ถูกยกเลิก', value: summary.revoked, detail: 'ระงับการนำไปใช้อ้างอิง', icon: 'pause' as const, tone: 'red' },
    { label: 'คะแนนเฉลี่ย', value: `${summary.average}%`, detail: 'คะแนนรวม ณ วันที่ออก', icon: 'score' as const, tone: 'gold' },
  ]

  return <div className={styles.page}>
    <header className={styles.header}><div><p>CERTIFICATE CONTROL</p><h1>ใบรับรองสมรรถนะ</h1><span>ออกใหม่ ยกเลิก คืนสถานะ และตรวจสอบประวัติจาก PostgreSQL</span></div><button className={styles.issueButton} type="button" onClick={() => openIssue()}><AdminIcon name="plus" size={16} />ออกใบรับรอง</button></header>
    <section className={styles.metrics}>{metrics.map(item => <article key={item.label} data-tone={item.tone}><span><AdminIcon name={item.icon} size={20} /></span><div><small>{item.label}</small><strong>{item.value}</strong><p>{item.detail}</p></div></article>)}</section>
    {error && <div className={styles.error}><AdminIcon name="activity" size={17} /><span>{error}</span><button type="button" onClick={() => { setError(''); setLoading(true); void loadCertificates().finally(() => setLoading(false)) }}>ลองใหม่</button></div>}
    <section className={styles.panel}>
      <div className={styles.toolbar}><label><AdminIcon name="search" size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาชื่อ อีเมล สถานศึกษา หรือเลขที่ใบรับรอง" /></label><div>{(['all','valid','revoked'] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'all' ? 'ทั้งหมด' : value === 'valid' ? 'ใช้งานได้' : 'ถูกยกเลิก'}</button>)}</div></div>
      {loading ? <div className={styles.empty}><AdminIcon name="refresh" size={25} /><strong>กำลังโหลดใบรับรอง</strong></div> : visible.length ? <div className={styles.grid}>{visible.map(item => <article className={styles.card} key={item.id} data-valid={item.valid}>
        <header><span><AdminIcon name="archive" size={21} /></span><div><small>{item.valid ? 'VALID CERTIFICATE' : 'REVOKED CERTIFICATE'}</small><strong>{item.certificateCode}</strong></div><i>{item.valid ? 'ใช้งานได้' : 'ยกเลิกแล้ว'}</i></header>
        <div className={styles.identity}><h2>{item.issuedName}</h2><p>{item.email}</p><span><AdminIcon name="school" size={14} />{item.schoolName || 'ไม่ระบุสถานศึกษา'}</span></div>
        <dl><div><dt>คะแนนรวม</dt><dd>{item.overallScore}%</dd></div><div><dt>วันที่ออก</dt><dd>{formatDate(item.issuedAt)}</dd></div>{item.revokedAt && <div><dt>วันที่ยกเลิก</dt><dd>{formatDate(item.revokedAt)}</dd></div>}</dl>
        <footer><Link href={`/verify/${item.certificateCode}`} target="_blank"><AdminIcon name="eye" size={15} />ตรวจสอบ</Link><button type="button" onClick={() => setHistoryCertificate(item)}><AdminIcon name="clock" size={15} />ประวัติ</button><button type="button" disabled={busy === item.id} data-danger={item.valid} onClick={() => void toggleCertificate(item)}><AdminIcon name={busy === item.id ? 'clock' : item.valid ? 'pause' : 'play'} size={15} />{busy === item.id ? 'กำลังบันทึก' : item.valid ? 'ยกเลิก' : 'คืนสถานะ'}</button></footer>
      </article>)}</div> : <div className={styles.empty}><AdminIcon name="archive" size={27} /><strong>ไม่พบใบรับรอง</strong><span>ออกใบรับรองให้นักเรียนที่ผ่านเกณฑ์ หรือลองเปลี่ยนตัวกรอง</span><button type="button" onClick={() => openIssue()}><AdminIcon name="plus" size={15} />ออกใบรับรอง</button></div>}
    </section>

    {issueOpen && <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !busy && setIssueOpen(false)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="issue-title"><header><span><AdminIcon name="archive" size={20} /></span><div><h2 id="issue-title">ออกใบรับรองสมรรถนะ</h2><p>เลือกนักเรียน ระบบจะตรวจคะแนนล่าสุดก่อนออกเลขที่ใบรับรอง</p></div><button type="button" onClick={() => setIssueOpen(false)}><AdminIcon name="close" size={18} /></button></header><div className={styles.modalBody}><label className={styles.studentSearch}><AdminIcon name="search" size={16} /><input autoFocus value={studentSearch} onChange={event => setStudentSearch(event.target.value)} placeholder="ค้นหาชื่อหรืออีเมลนักเรียน" /></label><div className={styles.studentList}>{candidateStudents.length ? candidateStudents.map(student => <button type="button" key={student.id} data-selected={selectedStudentId === student.id} onClick={() => setSelectedStudentId(student.id)}><span><AdminIcon name="student" size={17} /></span><div><strong>{student.name}</strong><small>{student.email}</small></div><i data-eligible={student.eligible}>{student.eligible ? `${student.overallScore}% ผ่านเกณฑ์` : `${student.overallScore}% ยังไม่ผ่าน`}</i></button>) : <p>ไม่พบนักเรียนจากคำค้นหา</p>}</div>{selectedStudent && <div className={styles.scoreReview}><div><span>ความรู้</span><strong>{selectedStudent.scoreSnapshot.knowledgeScore}%</strong></div><div><span>ทักษะ</span><strong>{selectedStudent.scoreSnapshot.skillsScore}%</strong></div><div><span>เจตคติ</span><strong>{selectedStudent.scoreSnapshot.attitudeScore}%</strong></div><div><span>สมรรถนะ</span><strong>{selectedStudent.scoreSnapshot.competencyScore}%</strong></div></div>}</div><footer><button type="button" onClick={() => setIssueOpen(false)}>ยกเลิก</button><button className={styles.issueButton} type="button" disabled={!selectedStudent?.eligible || busy === `issue:${selectedStudent?.id}`} onClick={() => void issueCertificate()}><AdminIcon name={busy ? 'clock' : selectedStudent?.certificateId ? 'refresh' : 'check'} size={16} />{busy ? 'กำลังออกใบรับรอง' : selectedStudent?.certificateId ? 'ออกเลขที่ใหม่' : 'ออกใบรับรอง'}</button></footer></section></div>}

    {historyCertificate && <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && setHistoryCertificate(null)}><section className={`${styles.modal} ${styles.historyModal}`} role="dialog" aria-modal="true" aria-labelledby="history-title"><header><span><AdminIcon name="clock" size={20} /></span><div><h2 id="history-title">ประวัติใบรับรอง</h2><p>{historyCertificate.issuedName} · {historyCertificate.certificateCode}</p></div><button type="button" onClick={() => setHistoryCertificate(null)}><AdminIcon name="close" size={18} /></button></header><div className={styles.timeline}>{selectedHistory.length ? selectedHistory.map(event => <article key={event.id} data-event={event.eventType}><span><AdminIcon name={event.eventType === 'revoke' ? 'pause' : event.eventType === 'restore' ? 'play' : event.eventType === 'reissue' ? 'refresh' : 'check'} size={15} /></span><div><strong>{eventLabel[event.eventType]}</strong><p>{event.actorName || event.actorEmail || (event.details.migrated ? 'ข้อมูลเดิมจากระบบ' : 'ระบบ')}</p>{event.details.previousCertificateCode && <small>เลขที่เดิม {event.details.previousCertificateCode}</small>}</div><time>{formatDate(event.createdAt, true)}</time></article>) : <div className={styles.emptyHistory}>ยังไม่มีประวัติของใบรับรองนี้</div>}</div><footer><span>{selectedHistory.length} เหตุการณ์</span><button type="button" onClick={() => setHistoryCertificate(null)}>ปิด</button></footer></section></div>}
  </div>
}
