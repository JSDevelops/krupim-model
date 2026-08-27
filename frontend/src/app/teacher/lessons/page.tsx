'use client'

import { FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import AdminIcon, { type AdminIconName } from '@/components/admin/AdminIcon'
import { confirmAction } from '@/components/AppConfirmDialog'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import styles from './page.module.css'

type LessonSummary = {
  id: string
  title: string
  subject: string
  level: string
  term: string
  duration: string
  targetClass: string
  weeks: string
  teacherName: string
  createdAt: string
  updatedAt: string
  objectiveCount: number
  vocabularyCount: number
  complete: boolean
  publicationStatus: 'draft' | 'published'
}

type LessonDetail = Omit<LessonSummary, 'objectiveCount' | 'vocabularyCount' | 'complete'> & {
  concept: string
  objectivesK: string[]
  objectivesS: string[]
  objectivesA: string[]
  objectivesAP: string[]
  vocabulary: string[]
  sentences: string[]
  activitiesLead: string
  activitiesF: string
  activitiesI: string
  activitiesN: string
  activitiesE: string
  activitiesWrap: string
  publicationStatus: 'draft' | 'published'
}

type LessonForm = {
  title: string
  subject: string
  level: string
  term: string
  duration: string
  targetClass: string
  weeks: string
  concept: string
  objectivesK: string
  objectivesS: string
  objectivesA: string
  objectivesAP: string
  vocabulary: string
  sentences: string
  activitiesLead: string
  activitiesF: string
  activitiesI: string
  activitiesN: string
  activitiesE: string
  activitiesWrap: string
  publicationStatus: 'draft' | 'published'
}

const emptyForm: LessonForm = {
  title: '', subject: '', level: '', term: '', duration: '', targetClass: '', weeks: '', concept: '',
  objectivesK: '', objectivesS: '', objectivesA: '', objectivesAP: '', vocabulary: '', sentences: '',
  activitiesLead: '', activitiesF: '', activitiesI: '', activitiesN: '', activitiesE: '', activitiesWrap: '',
  publicationStatus: 'draft',
}

const editorSteps: Array<{ title: string; description: string; icon: AdminIconName }> = [
  { title: 'ข้อมูลพื้นฐาน', description: 'รายวิชา ชั้นเรียน และสาระสำคัญ', icon: 'content' },
  { title: 'ผลลัพธ์การเรียนรู้', description: 'KSA-C คำศัพท์ และประโยค', icon: 'score' },
  { title: 'กิจกรรม FINE', description: 'ลำดับกิจกรรมตลอดบทเรียน', icon: 'activity' },
]

function lines(value: string) {
  return value.split('\n').map(item => item.trim()).filter(Boolean)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'ไม่ระบุ'
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function formFromDetail(lesson: LessonDetail): LessonForm {
  return {
    title: lesson.title || '', subject: lesson.subject || '', level: lesson.level || '', term: lesson.term || '',
    duration: lesson.duration || '', targetClass: lesson.targetClass || '', weeks: lesson.weeks || '', concept: lesson.concept || '',
    objectivesK: (lesson.objectivesK || []).join('\n'), objectivesS: (lesson.objectivesS || []).join('\n'),
    objectivesA: (lesson.objectivesA || []).join('\n'), objectivesAP: (lesson.objectivesAP || []).join('\n'),
    vocabulary: (lesson.vocabulary || []).join('\n'), sentences: (lesson.sentences || []).join('\n'),
    activitiesLead: lesson.activitiesLead || '', activitiesF: lesson.activitiesF || '', activitiesI: lesson.activitiesI || '',
    activitiesN: lesson.activitiesN || '', activitiesE: lesson.activitiesE || '', activitiesWrap: lesson.activitiesWrap || '',
    publicationStatus: lesson.publicationStatus || 'draft',
  }
}

function payloadFromForm(form: LessonForm) {
  return {
    ...form,
    objectivesK: lines(form.objectivesK), objectivesS: lines(form.objectivesS),
    objectivesA: lines(form.objectivesA), objectivesAP: lines(form.objectivesAP),
    vocabulary: lines(form.vocabulary), sentences: lines(form.sentences),
  }
}

function summaryFromDetail(lesson: LessonDetail): LessonSummary {
  const objectiveCount = lesson.objectivesK.length + lesson.objectivesS.length + lesson.objectivesA.length + lesson.objectivesAP.length
  return {
    id: lesson.id, title: lesson.title, subject: lesson.subject, level: lesson.level, term: lesson.term,
    duration: lesson.duration, targetClass: lesson.targetClass, weeks: lesson.weeks, teacherName: lesson.teacherName,
    createdAt: lesson.createdAt, updatedAt: lesson.updatedAt, objectiveCount,
    vocabularyCount: lesson.vocabulary.length,
    complete: Boolean(lesson.concept && lesson.activitiesF && lesson.activitiesI && lesson.activitiesN && lesson.activitiesE),
    publicationStatus: lesson.publicationStatus || 'draft',
  }
}

async function responseError(response: Response) {
  try {
    const payload = await response.json() as { error?: string }
    return payload.error || 'ไม่สามารถดำเนินการได้'
  } catch {
    return 'ไม่สามารถดำเนินการได้'
  }
}

export default function TeacherLessonsPage() {
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [classFilter, setClassFilter] = useState('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorStep, setEditorStep] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<LessonForm>(emptyForm)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [availableClasses, setAvailableClasses] = useState<string[]>([])

  const loadLessons = useCallback(async (signal?: AbortSignal) => {
    const [lessonResponse, classResponse] = await Promise.all([
      authenticatedFetch('/api/teacher/lessons', { cache: 'no-store', signal }),
      authenticatedFetch('/api/teacher/classes', { cache: 'no-store', signal }),
    ])
    if (!lessonResponse.ok) throw new Error(await responseError(lessonResponse))
    const payload = await lessonResponse.json() as { lessons?: LessonSummary[] }
    setLessons(payload.lessons ?? [])
    if (classResponse.ok) {
      const classPayload = await classResponse.json() as { classrooms?: Array<{ name: string }> }
      setAvailableClasses((classPayload.classrooms ?? []).map(item => item.name))
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void loadLessons(controller.signal)
        .then(() => setError(''))
        .catch(loadError => {
          if (loadError instanceof Error && loadError.name !== 'AbortError') setError(loadError.message)
        })
        .finally(() => setLoading(false))
    }, 0)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [loadLessons])

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && editorOpen && !busyAction) setEditorOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [busyAction, editorOpen])

  const classes = useMemo(() => Array.from(new Set([
    ...availableClasses,
    ...lessons.map(lesson => lesson.targetClass).filter(Boolean),
  ])).sort(), [availableClasses, lessons])
  const visibleLessons = useMemo(() => {
    const keyword = deferredSearch.trim().toLocaleLowerCase('th-TH')
    return lessons.filter(lesson => {
      if (classFilter !== 'all' && lesson.targetClass !== classFilter) return false
      if (!keyword) return true
      return [lesson.title, lesson.subject, lesson.level, lesson.targetClass, lesson.weeks]
        .some(value => value?.toLocaleLowerCase('th-TH').includes(keyword))
    })
  }, [classFilter, deferredSearch, lessons])

  const completeCount = lessons.filter(lesson => lesson.complete).length
  const objectiveTotal = lessons.reduce((sum, lesson) => sum + Number(lesson.objectiveCount || 0), 0)
  const summary = [
    { key: 'plans', label: 'แผนการสอนทั้งหมด', value: lessons.length, detail: 'แผนที่คุณเป็นเจ้าของ', icon: 'content' as const },
    { key: 'classes', label: 'ห้องเรียนเป้าหมาย', value: classes.length, detail: 'ห้องเรียนที่มีแผนรองรับ', icon: 'school' as const },
    { key: 'complete', label: 'แผนพร้อมใช้งาน', value: completeCount, detail: 'มีขั้น FINE ครบถ้วน', icon: 'check' as const },
    { key: 'objectives', label: 'ผลลัพธ์การเรียนรู้', value: objectiveTotal, detail: 'จุดประสงค์ KSA-C', icon: 'score' as const },
  ]

  async function refreshLessons() {
    if (refreshing) return
    setRefreshing(true)
    try {
      await loadLessons()
      setError('')
      toast.success('อัปเดตแผนการสอนแล้ว')
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setRefreshing(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setEditorStep(0)
    setEditorOpen(true)
  }

  async function fetchLesson(id: string) {
    const response = await authenticatedFetch(`/api/teacher/lessons?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
    if (!response.ok) throw new Error(await responseError(response))
    const payload = await response.json() as { lesson: LessonDetail }
    return payload.lesson
  }

  async function openEdit(id: string) {
    setBusyAction(`load:${id}`)
    try {
      const lesson = await fetchLesson(id)
      setEditingId(id)
      setForm(formFromDetail(lesson))
      setEditorStep(0)
      setEditorOpen(true)
    } catch (editError) {
      toast.error(editError instanceof Error ? editError.message : 'โหลดรายละเอียดแผนไม่สำเร็จ')
    } finally {
      setBusyAction(null)
    }
  }

  async function duplicateLesson(id: string) {
    setBusyAction(`duplicate:${id}`)
    try {
      const lesson = await fetchLesson(id)
      setEditingId(null)
      setForm({ ...formFromDetail(lesson), title: `${lesson.title} (สำเนา)` })
      setEditorStep(0)
      setEditorOpen(true)
    } catch (duplicateError) {
      toast.error(duplicateError instanceof Error ? duplicateError.message : 'คัดลอกแผนไม่สำเร็จ')
    } finally {
      setBusyAction(null)
    }
  }

  async function saveLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim()) {
      setEditorStep(0)
      toast.warning('กรุณากรอกชื่อแผนการสอน')
      return
    }
    setBusyAction('save')
    try {
      const response = await authenticatedFetch('/api/teacher/lessons', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editingId ? { id: editingId } : {}), ...payloadFromForm(form) }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      const payload = await response.json() as { lesson: LessonDetail }
      const nextSummary = summaryFromDetail(payload.lesson)
      setLessons(current => editingId
        ? current.map(item => item.id === editingId ? nextSummary : item)
        : [nextSummary, ...current])
      setEditorOpen(false)
      toast.success(editingId ? 'บันทึกการแก้ไขแผนการสอนแล้ว' : 'สร้างแผนการสอนแล้ว', { description: payload.lesson.title })
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'บันทึกแผนการสอนไม่สำเร็จ')
    } finally {
      setBusyAction(null)
    }
  }

  async function deleteLesson(lesson: LessonSummary) {
    const confirmed = await confirmAction({
      title: 'ลบแผนการสอนนี้?',
      description: `แผน “${lesson.title}” จะถูกลบออกจากระบบ การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      confirmText: 'ลบแผนการสอน',
      tone: 'danger',
    })
    if (!confirmed) return
    setBusyAction(`delete:${lesson.id}`)
    try {
      const response = await authenticatedFetch(`/api/teacher/lessons?id=${encodeURIComponent(lesson.id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await responseError(response))
      setLessons(current => current.filter(item => item.id !== lesson.id))
      toast.success('ลบแผนการสอนแล้ว')
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'ลบแผนการสอนไม่สำเร็จ')
    } finally {
      setBusyAction(null)
    }
  }

  function updateField<Key extends keyof LessonForm>(key: Key, value: LessonForm[Key]) {
    setForm(current => ({ ...current, [key]: value }))
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p>LESSON MANAGEMENT</p>
          <h1>แผนการสอน FINE Model</h1>
          <span>สร้าง จัดระบบ และปรับปรุงแผนการเรียนรู้ให้พร้อมใช้ในแต่ละชั้นเรียน</span>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryButton} onClick={() => void refreshLessons()} disabled={refreshing}>
            <AdminIcon name="refresh" size={16} /> {refreshing ? 'กำลังอัปเดต' : 'อัปเดตข้อมูล'}
          </button>
          <button type="button" className={styles.primaryButton} onClick={openCreate}>
            <AdminIcon name="plus" size={16} /> สร้างแผนการสอน
          </button>
        </div>
      </header>

      {error && <div className={styles.error} role="alert"><AdminIcon name="activity" size={17} /><span>{error}</span><button type="button" onClick={() => void refreshLessons()}>ลองอีกครั้ง</button></div>}

      <section className={styles.metrics} aria-label="สรุปแผนการสอน">
        {summary.map(item => (
          <article className={styles.metricCard} data-metric={item.key} key={item.key}>
            <span className={styles.metricIcon}><AdminIcon name={item.icon} size={20} /></span>
            <span><small>{item.label}</small><strong>{loading ? '—' : item.value.toLocaleString('th-TH')}</strong><span>{item.detail}</span></span>
          </article>
        ))}
      </section>

      <section className={styles.workspace}>
        <header className={styles.workspaceHeader}>
          <div><h2>คลังแผนการสอน</h2><p>{visibleLessons.length.toLocaleString('th-TH')} รายการจากตัวกรองปัจจุบัน</p></div>
          <div className={styles.filters}>
            <label className={styles.searchBox}><AdminIcon name="search" size={16} /><span className={styles.srOnly}>ค้นหาแผนการสอน</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาชื่อ รายวิชา หรือระดับชั้น" /></label>
            <label className={styles.selectBox}><AdminIcon name="school" size={15} /><span className={styles.srOnly}>กรองห้องเรียน</span><select value={classFilter} onChange={event => setClassFilter(event.target.value)}><option value="all">ทุกห้องเรียน</option>{classes.map(item => <option value={item} key={item}>{item}</option>)}</select></label>
          </div>
        </header>

        <div className={styles.lessonList} aria-busy={loading}>
          {loading ? Array.from({ length: 4 }).map((_, index) => <div className={styles.skeleton} key={index} />) : visibleLessons.length === 0 ? (
            <div className={styles.emptyState}><span><AdminIcon name="content" size={24} /></span><h3>{lessons.length ? 'ไม่พบแผนที่ตรงกับการค้นหา' : 'ยังไม่มีแผนการสอน'}</h3><p>{lessons.length ? 'ลองเปลี่ยนคำค้นหรือห้องเรียนที่เลือก' : 'เริ่มต้นสร้างแผนการสอนแรกสำหรับชั้นเรียนของคุณ'}</p>{!lessons.length && <button type="button" onClick={openCreate}><AdminIcon name="plus" size={16} /> สร้างแผนแรก</button>}</div>
          ) : visibleLessons.map(lesson => (
            <article className={styles.lessonCard} key={lesson.id}>
              <div className={styles.lessonAccent}><AdminIcon name="content" size={19} /></div>
              <div className={styles.lessonMain}>
                <div className={styles.lessonTitle}><span className={lesson.publicationStatus === 'published' ? styles.readyBadge : styles.draftBadge}>{lesson.publicationStatus === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}</span><h3>{lesson.title}</h3></div>
                <p>{lesson.subject || 'ยังไม่ได้ระบุรายวิชา'}</p>
                <div className={styles.lessonMeta}>
                  <span><AdminIcon name="school" size={13} /> {lesson.targetClass || 'ไม่ระบุห้อง'}</span>
                  <span><AdminIcon name="course" size={13} /> {lesson.level || 'ไม่ระบุระดับ'}</span>
                  <span><AdminIcon name="clock" size={13} /> {lesson.duration || 'ไม่ระบุเวลา'}</span>
                </div>
              </div>
              <div className={styles.lessonStats}><span><strong>{lesson.objectiveCount || 0}</strong><small>จุดประสงค์</small></span><span><strong>{lesson.vocabularyCount || 0}</strong><small>คำศัพท์</small></span></div>
              <div className={styles.lessonUpdated}><small>แก้ไขล่าสุด</small><strong>{formatDate(lesson.updatedAt)}</strong></div>
              <div className={styles.lessonActions}>
                <button type="button" onClick={() => void openEdit(lesson.id)} disabled={Boolean(busyAction)} aria-label={`แก้ไข ${lesson.title}`}><AdminIcon name={busyAction === `load:${lesson.id}` ? 'clock' : 'edit'} size={16} /></button>
                <button type="button" onClick={() => void duplicateLesson(lesson.id)} disabled={Boolean(busyAction)} aria-label={`คัดลอก ${lesson.title}`}><AdminIcon name="archive" size={16} /></button>
                <button type="button" className={styles.deleteButton} onClick={() => void deleteLesson(lesson)} disabled={Boolean(busyAction)} aria-label={`ลบ ${lesson.title}`}><AdminIcon name="trash" size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {editorOpen && (
        <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !busyAction && setEditorOpen(false)}>
          <section className={styles.editor} role="dialog" aria-modal="true" aria-labelledby="lesson-editor-title">
            <header className={styles.editorHeader}>
              <span><AdminIcon name={editingId ? 'edit' : 'plus'} size={21} /></span>
              <div><h2 id="lesson-editor-title">{editingId ? 'แก้ไขแผนการสอน' : 'สร้างแผนการสอนใหม่'}</h2><p>{editorSteps[editorStep].description}</p></div>
              <button type="button" onClick={() => setEditorOpen(false)} disabled={Boolean(busyAction)} aria-label="ปิดหน้าต่าง"><AdminIcon name="close" size={18} /></button>
            </header>

            <nav className={styles.stepper} aria-label="ขั้นตอนสร้างแผนการสอน">
              {editorSteps.map((step, index) => <button type="button" key={step.title} aria-current={editorStep === index ? 'step' : undefined} onClick={() => setEditorStep(index)}><span><AdminIcon name={step.icon} size={16} /></span><div><strong>{step.title}</strong><small>ขั้นตอน {index + 1}</small></div></button>)}
            </nav>

            <form onSubmit={saveLesson}>
              <div className={styles.editorBody}>
                {editorStep === 0 && <div className={styles.formGrid}>
                  <label className={styles.fullField}><span>ชื่อแผนการสอน *</span><input autoFocus required maxLength={240} value={form.title} onChange={event => updateField('title', event.target.value)} placeholder="เช่น Restaurant Equipment Vocabulary" /></label>
                  <label className={styles.fullField}><span>รายวิชา</span><input maxLength={300} value={form.subject} onChange={event => updateField('subject', event.target.value)} placeholder="รหัสและชื่อรายวิชา" /></label>
                  <label><span>ระดับชั้น</span><input value={form.level} onChange={event => updateField('level', event.target.value)} placeholder="เช่น ปวช.1" /></label>
                  <label><span>ห้องเรียนเป้าหมาย</span><select value={form.targetClass} onChange={event => updateField('targetClass', event.target.value)}><option value="">ยังไม่เลือกห้องเรียน</option>{availableClasses.map(item => <option value={item} key={item}>{item}</option>)}</select></label>
                  <label><span>การมองเห็นบทเรียน</span><select value={form.publicationStatus} onChange={event => updateField('publicationStatus', event.target.value as LessonForm['publicationStatus'])}><option value="draft">ฉบับร่าง — เฉพาะครู</option><option value="published">เผยแพร่ — นักเรียนในห้องมองเห็น</option></select></label>
                  <label><span>ภาคเรียน</span><input value={form.term} onChange={event => updateField('term', event.target.value)} placeholder="ภาคเรียนที่ 1/2569" /></label>
                  <label><span>สัปดาห์</span><input value={form.weeks} onChange={event => updateField('weeks', event.target.value)} placeholder="สัปดาห์ที่ 1–2" /></label>
                  <label><span>ระยะเวลา</span><input value={form.duration} onChange={event => updateField('duration', event.target.value)} placeholder="เช่น 4 ชั่วโมง" /></label>
                  <label className={styles.fullField}><span>สาระสำคัญ</span><textarea rows={3} maxLength={5000} value={form.concept} onChange={event => updateField('concept', event.target.value)} placeholder="แนวคิดและสาระสำคัญของบทเรียน" /></label>
                </div>}

                {editorStep === 1 && <div className={styles.formGrid}>
                  <label><span>Knowledge (K)</span><textarea rows={4} value={form.objectivesK} onChange={event => updateField('objectivesK', event.target.value)} placeholder="หนึ่งจุดประสงค์ต่อหนึ่งบรรทัด" /></label>
                  <label><span>Skills (S)</span><textarea rows={4} value={form.objectivesS} onChange={event => updateField('objectivesS', event.target.value)} placeholder="หนึ่งจุดประสงค์ต่อหนึ่งบรรทัด" /></label>
                  <label><span>Attribute (A)</span><textarea rows={4} value={form.objectivesA} onChange={event => updateField('objectivesA', event.target.value)} placeholder="หนึ่งจุดประสงค์ต่อหนึ่งบรรทัด" /></label>
                  <label><span>Application (AP)</span><textarea rows={4} value={form.objectivesAP} onChange={event => updateField('objectivesAP', event.target.value)} placeholder="หนึ่งจุดประสงค์ต่อหนึ่งบรรทัด" /></label>
                  <label><span>คำศัพท์สำคัญ</span><textarea rows={4} value={form.vocabulary} onChange={event => updateField('vocabulary', event.target.value)} placeholder="หนึ่งคำหรือกลุ่มคำต่อหนึ่งบรรทัด" /></label>
                  <label><span>ประโยคตัวอย่าง</span><textarea rows={4} value={form.sentences} onChange={event => updateField('sentences', event.target.value)} placeholder="หนึ่งประโยคต่อหนึ่งบรรทัด" /></label>
                </div>}

                {editorStep === 2 && <div className={styles.activityGrid}>
                  <label><span><b>L</b> ขั้นนำเข้าสู่บทเรียน</span><textarea rows={3} value={form.activitiesLead} onChange={event => updateField('activitiesLead', event.target.value)} /></label>
                  <label><span><b>F</b> Familiarize</span><textarea rows={3} value={form.activitiesF} onChange={event => updateField('activitiesF', event.target.value)} /></label>
                  <label><span><b>I</b> Interact</span><textarea rows={3} value={form.activitiesI} onChange={event => updateField('activitiesI', event.target.value)} /></label>
                  <label><span><b>N</b> Navigate</span><textarea rows={3} value={form.activitiesN} onChange={event => updateField('activitiesN', event.target.value)} /></label>
                  <label><span><b>E</b> Exhibit</span><textarea rows={3} value={form.activitiesE} onChange={event => updateField('activitiesE', event.target.value)} /></label>
                  <label><span><b>W</b> ขั้นสรุป</span><textarea rows={3} value={form.activitiesWrap} onChange={event => updateField('activitiesWrap', event.target.value)} /></label>
                </div>}
              </div>

              <footer className={styles.editorFooter}>
                <button type="button" onClick={() => editorStep === 0 ? setEditorOpen(false) : setEditorStep(current => current - 1)} disabled={Boolean(busyAction)}>{editorStep === 0 ? 'ยกเลิก' : 'ย้อนกลับ'}</button>
                {editorStep < editorSteps.length - 1 ? <button type="button" className={styles.primaryButton} onClick={() => { if (!form.title.trim()) { toast.warning('กรุณากรอกชื่อแผนการสอน'); setEditorStep(0); return } setEditorStep(current => current + 1) }}>ถัดไป <AdminIcon name="arrow" size={15} /></button> : <button type="submit" className={styles.primaryButton} disabled={busyAction === 'save'}><AdminIcon name={busyAction === 'save' ? 'clock' : 'check'} size={16} /> {busyAction === 'save' ? 'กำลังบันทึก' : 'บันทึกแผนการสอน'}</button>}
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
