'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { authenticatedFetch } from '@/lib/api'
import styles from './StudentFINENav.module.css'

type FineLetter = 'F' | 'I' | 'N' | 'E' | 'P'
type NavIcon = 'explore' | 'interact' | 'navigate' | 'exhibit' | 'profile'
type TaskCounts = Record<FineLetter, number>

type NavItem = {
  href: string
  letter: FineLetter
  label: string
  fineLabel: string
  icon: NavIcon
  aliases?: string[]
}

type DashboardTask = {
  id: string
  title: string
  description?: string
  activityType?: string
  dueDate?: string | null
  maxScore?: number
  className?: string
  lessonTitle?: string
  weekName?: string
}

const EMPTY_COUNTS: TaskCounts = { F: 0, I: 0, N: 0, E: 0, P: 0 }

const TABS: NavItem[] = [
  { href: '/student/explore', letter: 'F', label: 'Familiarize', fineLabel: 'Explore', icon: 'explore' },
  { href: '/student/interact', letter: 'I', label: 'Interact', fineLabel: 'Speak', icon: 'interact', aliases: ['/chat', '/live'] },
  { href: '/student/navigate', letter: 'N', label: 'Navigate', fineLabel: 'Scenario', icon: 'navigate', aliases: ['/simulation', '/student/simulation'] },
  { href: '/student/exhibit', letter: 'E', label: 'Exhibit', fineLabel: 'Review', icon: 'exhibit' },
  { href: '/student/profile', letter: 'P', label: 'Portfolio', fineLabel: 'Profile', icon: 'profile', aliases: ['/student/progress'] },
]

function FineNavIcon({ name }: { name: NavIcon }) {
  const common = {
    width: 21,
    height: 21,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (name === 'explore') return <svg {...common}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3"/><path d="M12 7v2M12 15v2M7 12h2M15 12h2"/></svg>
  if (name === 'interact') return <svg {...common}><path d="M21 14a3 3 0 0 1-3 3H9l-5 4v-4a3 3 0 0 1-2-3V6a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3Z"/><path d="M7 8h10M7 12h6"/></svg>
  if (name === 'navigate') return <svg {...common}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/><path d="m9.5 6.2 5 2.7"/></svg>
  if (name === 'exhibit') return <svg {...common}><path d="M9 4h6M10 2h4v4h-4z"/><rect x="5" y="5" width="14" height="17" rx="2"/><path d="m8 13 2 2 5-5M8 18h8"/></svg>
  return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/><path d="M18 5.5h3M19.5 4v3"/></svg>
}

function countsMatch(left: TaskCounts, right: TaskCounts) {
  return left.F === right.F && left.I === right.I && left.N === right.N && left.E === right.E && left.P === right.P
}

function isCurrentPath(pathname: string, tab: NavItem) {
  const paths = [tab.href, ...(tab.aliases || [])]
  return paths.some(path => pathname === path || pathname.startsWith(path + '/'))
}

function taskPath(type?: string) {
  const value = (type || '').toLowerCase()
  if (value.includes('interact') || value.startsWith('i')) return '/student/interact'
  if (value.includes('navigate') || value.startsWith('n')) return '/student/navigate'
  if (value.includes('exhibit') || value.startsWith('e')) return '/student/exhibit'
  return '/student/explore'
}

function getStageBadge(type?: string) {
  const value = (type || '').toUpperCase()
  if (value.includes('INTERACT') || value.startsWith('I')) return { letter: 'I', label: 'Interact · Speak', chipClass: styles.stageChipI }
  if (value.includes('NAVIGATE') || value.startsWith('N')) return { letter: 'N', label: 'Navigate · Scenario', chipClass: styles.stageChipN }
  if (value.includes('EXHIBIT') || value.startsWith('E')) return { letter: 'E', label: 'Exhibit · Review', chipClass: styles.stageChipE }
  return { letter: 'F', label: 'Familiarize · Explore', chipClass: styles.stageChipF }
}

function formatDate(value?: string | null) {
  if (!value) return 'ไม่กำหนด'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date)
}

export default function StudentFINENav() {
  const pathname = usePathname()
  const [taskCounts, setTaskCounts] = useState<TaskCounts>(EMPTY_COUNTS)
  const [tasks, setTasks] = useState<DashboardTask[]>([])
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'ALL' | FineLetter>('ALL')

  // Submission Sub-modal
  const [submitTask, setSubmitTask] = useState<DashboardTask | null>(null)
  const [submission, setSubmission] = useState({ attachmentName: '', attachmentUrl: '' })
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchTasks = async (signal?: AbortSignal) => {
    try {
      const response = await authenticatedFetch('/api/student/dashboard', { signal })
      if (!response.ok) return
      const payload = await response.json() as { taskCounts?: TaskCounts; tasks?: DashboardTask[] }
      const nextCounts = payload.taskCounts || EMPTY_COUNTS
      setTaskCounts(previous => countsMatch(previous, nextCounts) ? previous : nextCounts)
      if (payload.tasks) setTasks(payload.tasks)
    } catch { /* session/layout guard handles authentication */ }
  }

  useEffect(() => {
    const controller = new AbortController()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void fetchTasks(controller.signal)
    }

    void fetchTasks(controller.signal)
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void fetchTasks(controller.signal)
    }, 60_000)
    window.addEventListener('focus', () => void fetchTasks())
    window.addEventListener('storage', () => void fetchTasks())
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', () => void fetchTasks())
      window.removeEventListener('storage', () => void fetchTasks())
      document.removeEventListener('visibilitychange', handleVisibility)
      controller.abort()
    }
  }, [])

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'ALL' || activeFilter === 'P') return tasks
    return tasks.filter(task => {
      const key = task.activityType?.[0]?.toUpperCase()
      return key === activeFilter
    })
  }, [tasks, activeFilter])

  const handleBadgeClick = (event: React.MouseEvent, tab: NavItem) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveFilter(tab.letter === 'P' ? 'ALL' : tab.letter)
    setIsQuickViewOpen(true)
  }

  const handleDirectSubmit = async () => {
    if (!submitTask) return
    setSubmitting(true)
    try {
      let attachmentName = submission.attachmentName
      let attachmentUrl = submission.attachmentUrl

      if (submissionFile) {
        const upload = new FormData()
        upload.set('assignmentId', submitTask.id)
        upload.set('file', submissionFile)
        const uploadRes = await authenticatedFetch('/api/student/files', {
          method: 'POST',
          body: upload,
        })
        const uploadPayload = await uploadRes.json() as { file?: { name: string; url: string }; error?: string }
        if (!uploadRes.ok || !uploadPayload.file) {
          throw new Error(uploadPayload.error || 'อัปโหลดไฟล์ไม่สำเร็จ')
        }
        attachmentName = attachmentName || uploadPayload.file.name
        attachmentUrl = uploadPayload.file.url
      }

      const response = await authenticatedFetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: submitTask.id,
          attachmentName,
          attachmentUrl,
        }),
      })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'ส่งงานไม่สำเร็จ')

      toast.success('ส่งงานเรียบร้อยแล้ว!', { description: submitTask.title })

      const updatedTasks = tasks.filter(t => t.id !== submitTask.id)
      setTasks(updatedTasks)

      const nextCounts: TaskCounts = { F: 0, I: 0, N: 0, E: 0, P: updatedTasks.length }
      for (const t of updatedTasks) {
        const k = t.activityType?.[0]?.toUpperCase()
        if (k === 'F' || k === 'I' || k === 'N' || k === 'E') nextCounts[k] += 1
      }
      setTaskCounts(nextCounts)

      setSubmitTask(null)
      setSubmission({ attachmentName: '', attachmentUrl: '' })
      setSubmissionFile(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ส่งงานไม่สำเร็จ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className={styles.dockWrap}>
        {/* Quick View Pill Trigger */}
        {tasks.length > 0 && (
          <div className={styles.pillContainer}>
            <button
              type="button"
              className={styles.pillTrigger}
              onClick={() => {
                setActiveFilter('ALL')
                setIsQuickViewOpen(true)
              }}
              aria-label={`เปิดดูงานค้างทั้งหมด ${tasks.length} รายการ`}
            >
              <span>📋 งานค้าง</span>
              <span className={styles.pillCount}>{tasks.length}</span>
            </button>
          </div>
        )}

        <nav className={styles.dock} aria-label="Student Navigation Menu">
          {TABS.map(tab => {
            const active = isCurrentPath(pathname, tab)
            const pendingCount = taskCounts[tab.letter]

            return (
              <Link
                key={tab.href}
                href={tab.href}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                aria-label={`${tab.label} — ${tab.letter} · ${tab.fineLabel}${pendingCount ? `, ${pendingCount} pending items` : ''}`}
                className={`${styles.item} ${active ? styles.active : ''}`}
              >
                {pendingCount > 0 && (
                  <button
                    type="button"
                    className={styles.badge}
                    onClick={e => handleBadgeClick(e, tab)}
                    title={`แตะเพื่อดูภารกิจ ${tab.label} (${pendingCount} งาน)`}
                    aria-label={`แตะเพื่อดูภารกิจ ${tab.label} (${pendingCount} งาน)`}
                  >
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </button>
                )}
                <span className={styles.iconWrap}><FineNavIcon name={tab.icon} /></span>
                <span className={styles.copy}>
                  <span className={styles.label}>{tab.label}</span>
                  <span className={styles.fineLabel}>{tab.letter} · {tab.fineLabel}</span>
                </span>
                {active && <span className={styles.activeMark} aria-hidden="true" />}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Quick View Modal / Bottom Sheet */}
      {isQuickViewOpen && (
        <div
          className={styles.quickOverlay}
          onClick={e => e.target === e.currentTarget && setIsQuickViewOpen(false)}
        >
          <section
            className={styles.quickSheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-view-title"
          >
            {/* Sheet Header */}
            <header className={styles.quickHeader}>
              <div className={styles.quickHeaderContent}>
                <h2 id="quick-view-title" className={styles.quickTitle}>
                  <span>📋 ภารกิจและการบ้าน FINE</span>
                </h2>
                <span className={styles.quickSubtitle}>
                  งานที่ได้รับมอบหมายตามแผนการสอน ({filteredTasks.length} รายการ)
                </span>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsQuickViewOpen(false)}
                aria-label="ปิดหน้าต่างภารกิจ"
              >
                ✕
              </button>
            </header>

            {/* Filter Pills */}
            <nav className={styles.filterBar} aria-label="ตัวกรองภารกิจตามขั้นตอน FINE">
              <button
                type="button"
                className={`${styles.filterPill} ${activeFilter === 'ALL' ? styles.filterPillActive : ''}`}
                onClick={() => setActiveFilter('ALL')}
              >
                <span>ทั้งหมด</span>
                <span className={styles.filterBadge}>{tasks.length}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPill} ${activeFilter === 'F' ? styles.filterPillActive : ''}`}
                onClick={() => setActiveFilter('F')}
              >
                <span>F · Explore</span>
                <span className={styles.filterBadge}>{taskCounts.F}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPill} ${activeFilter === 'I' ? styles.filterPillActive : ''}`}
                onClick={() => setActiveFilter('I')}
              >
                <span>I · Speak</span>
                <span className={styles.filterBadge}>{taskCounts.I}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPill} ${activeFilter === 'N' ? styles.filterPillActive : ''}`}
                onClick={() => setActiveFilter('N')}
              >
                <span>N · Scenario</span>
                <span className={styles.filterBadge}>{taskCounts.N}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterPill} ${activeFilter === 'E' ? styles.filterPillActive : ''}`}
                onClick={() => setActiveFilter('E')}
              >
                <span>E · Review</span>
                <span className={styles.filterBadge}>{taskCounts.E}</span>
              </button>
            </nav>

            {/* Sheet Body: Task Cards */}
            <div className={styles.quickBody}>
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => {
                  const stage = getStageBadge(task.activityType)
                  return (
                    <article key={task.id} className={styles.taskCard}>
                      <div className={styles.taskHeaderRow}>
                        <span className={`${styles.stageChip} ${stage.chipClass}`}>
                          {stage.label}
                        </span>
                        {task.weekName && (
                          <span className={styles.weekChip}>{task.weekName}</span>
                        )}
                      </div>

                      <h3 className={styles.cardTitle}>{task.title}</h3>

                      {task.lessonTitle && (
                        <div className={styles.cardLesson}>
                          <span>📖</span>
                          <span>{task.lessonTitle}</span>
                        </div>
                      )}

                      {task.description && (
                        <p className={styles.cardDesc}>{task.description}</p>
                      )}

                      <div className={styles.cardMetaRow}>
                        <span>📅 ส่งภายใน: {formatDate(task.dueDate)}</span>
                        <span>⭐ คะแนนเต็ม: {task.maxScore || 10}</span>
                      </div>

                      <div className={styles.cardActions}>
                        <Link
                          href={taskPath(task.activityType)}
                          onClick={() => setIsQuickViewOpen(false)}
                          className={styles.actionOpenBtn}
                        >
                          <span>🚀 ไปทำกิจกรรม</span>
                        </Link>
                        <button
                          type="button"
                          className={styles.actionSubmitBtn}
                          onClick={() => {
                            setSubmitTask(task)
                            setSubmission({ attachmentName: '', attachmentUrl: '' })
                            setSubmissionFile(null)
                          }}
                        >
                          <span>📤 ส่งงาน</span>
                        </button>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className={styles.emptyTasks}>
                  <span style={{ fontSize: 32 }}>🎉</span>
                  <strong>ไม่มีงานค้างในหมวดนี้</strong>
                  <span>คุณส่งงานในหมวดนี้ครบเรียบร้อยแล้ว เยี่ยมมาก!</span>
                </div>
              )}
            </div>

            {/* Direct Submit Sub-Modal */}
            {submitTask && (
              <div
                className={styles.submitModalBackdrop}
                onClick={e => e.target === e.currentTarget && setSubmitTask(null)}
              >
                <div className={styles.submitDialog} role="dialog" aria-modal="true">
                  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#174735', margin: 0 }}>
                        ส่งงาน: {submitTask.title}
                      </h3>
                      <span style={{ fontSize: 12, color: '#68756d' }}>
                        {submitTask.weekName || 'การบ้านตามแผนการสอน'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.closeButton}
                      onClick={() => setSubmitTask(null)}
                      aria-label="ปิดกล่องส่งงาน"
                    >
                      ✕
                    </button>
                  </header>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="task-attachment-name">
                      ชื่อผลงานหรือหมายเหตุ
                    </label>
                    <input
                      id="task-attachment-name"
                      className={styles.fieldInput}
                      value={submission.attachmentName}
                      onChange={e => setSubmission(prev => ({ ...prev, attachmentName: e.target.value }))}
                      placeholder="เช่น สรุปการฝึกสนทนา, ภาพถ่ายการสแกน AR"
                      maxLength={240}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="task-file-input">
                      แนบไฟล์ผลงาน (รูปภาพ, แคปหน้าจอ, PDF ไม่เกิน 12 MB)
                    </label>
                    <input
                      id="task-file-input"
                      type="file"
                      className={styles.fieldFileInput}
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx,.ppt,.pptx"
                      onChange={e => setSubmissionFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="task-url-input">
                      หรือระบุลิงก์ผลงาน (เช่น Google Drive, YouTube, Canva)
                    </label>
                    <input
                      id="task-url-input"
                      type="url"
                      className={styles.fieldInput}
                      value={submission.attachmentUrl}
                      onChange={e => setSubmission(prev => ({ ...prev, attachmentUrl: e.target.value }))}
                      placeholder="https://..."
                      maxLength={2000}
                    />
                  </div>

                  <div className={styles.submitActions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setSubmitTask(null)}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      className={styles.confirmSubmitBtn}
                      disabled={submitting}
                      onClick={handleDirectSubmit}
                    >
                      {submitting ? 'กำลังส่งงาน...' : 'ยืนยันการส่งงาน'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}

