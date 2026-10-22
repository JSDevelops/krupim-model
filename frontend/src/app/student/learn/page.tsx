'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { authenticatedFetch } from '@/lib/api'
import StudentIcon from '../StudentIcon'
import styles from '../studentPages.module.css'

type Lesson = {
  id: string; title: string; subject: string; level: string; term: string; duration: string
  targetClass: string; weeks: string; concept: string; objectivesK: string[]; objectivesS: string[]
  objectivesA: string[]; objectivesAP: string[]; vocabulary: string[]; sentences: string[]
  activitiesF: string; activitiesI: string; activitiesN: string; activitiesE: string
}

type PlanAssignment = {
  id: string
  lessonPlanId: string
  title: string
  description: string | null
  activityType: string
  dueDate: string | null
  maxScore: number
  isSubmitted: boolean
  status: string | null
  score: number | null
  feedback: string | null
  returnReason: string | null
  availableFrom: string | null
}

function getWeekNumber(lesson: Lesson, fallbackIndex: number): number {
  const match = lesson.weeks?.match(/\d+/) || lesson.id?.match(/week-(\d+)/) || lesson.title?.match(/สัปดาห์ที่\s*(\d+)/)
  return match ? parseInt(match[1] || match[0], 10) : fallbackIndex + 1
}

function getActivityRoute(type: string, planId: string, weekNum: number) {
  const t = (type || '').toLowerCase()
  if (t.includes('interact') || t.includes('speak')) return `/student/interact?planId=${encodeURIComponent(planId)}`
  if (t.includes('navigate') || t.includes('simulat')) return `/student/simulation?planId=${encodeURIComponent(planId)}`
  if (t.includes('exhibit') || t.includes('quiz')) return `/student/exhibit?planId=${encodeURIComponent(planId)}`
  return `/student/explore?planId=${encodeURIComponent(planId)}&week=${weekNum}`
}

export default function LearnPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [assignmentsByPlan, setAssignmentsByPlan] = useState<Record<string, PlanAssignment[]>>({})
  const [open, setOpen] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [tested, setTested] = useState<Set<string>>(new Set())
  const [stageProgress, setStageProgress] = useState<Record<string, Record<string, boolean>>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void authenticatedFetch('/api/student/learn', { signal: controller.signal })
      .then(async response => {
        const payload = await response.json() as {
          lessons?: Lesson[]
          completedIds?: string[]
          testedIds?: string[]
          stageProgress?: Record<string, Record<string, boolean>>
          assignmentsByPlan?: Record<string, PlanAssignment[]>
          error?: string
        }
        if (!response.ok) throw new Error(payload.error || 'โหลดบทเรียนไม่สำเร็จ')
        setLessons(payload.lessons || [])
        setCompleted(new Set(payload.completedIds || []))
        setTested(new Set(payload.testedIds || []))
        setStageProgress(payload.stageProgress || {})
        setAssignmentsByPlan(payload.assignmentsByPlan || {})
      })
      .catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') setError(loadError.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const shown = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('th-TH')
    const filtered = keyword
      ? lessons.filter(lesson => `${lesson.title} ${lesson.subject} ${lesson.weeks}`.toLocaleLowerCase('th-TH').includes(keyword))
      : lessons
    return [...filtered].sort((a, b) => getWeekNumber(a, 0) - getWeekNumber(b, 0))
  }, [lessons, query])

  async function completeLesson(lesson: Lesson) {
    setSaving(lesson.id)
    try {
      const response = await authenticatedFetch('/api/student/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: lesson.id }),
      })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'บันทึกความก้าวหน้าไม่สำเร็จ')
      setCompleted(current => new Set(current).add(lesson.id))
      toast.success('บันทึกว่าเรียนบทนี้สำเร็จแล้ว', { description: lesson.title })
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'บันทึกความก้าวหน้าไม่สำเร็จ')
    } finally {
      setSaving(null)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <StudentIcon name="book" size={15}/>Learning plan
            </div>
            <h1 className={styles.title}>แผนการเรียนรู้ของคุณ</h1>
            <p className={styles.subtitle}>
              ติดตามความก้าวหน้าและสถานะการทดสอบทั้ง 18 สัปดาห์ตามแผนการสอน FINE Model
            </p>
          </div>
          <div className={styles.heroStats}>
            <div>
              <strong>{lessons.length}</strong>
              <span>บทเรียนทั้งหมด</span>
            </div>
            <div>
              <strong>{completed.size}</strong>
              <span>เรียนสำเร็จแล้ว</span>
            </div>
            <div>
              <strong>{tested.size}</strong>
              <span>ผ่านการทดสอบแล้ว</span>
            </div>
          </div>
        </section>

        <section className={styles.content} aria-busy={loading}>
          <label className={styles.field}>
            <span>ค้นหาบทเรียน</span>
            <input
              className={styles.input}
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="ชื่อบทเรียน รายวิชา หรือสัปดาห์"
            />
          </label>

          {error && (
            <div className={styles.notice} style={{ marginTop: 12 }}>
              <StudentIcon name="info" size={17}/>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.manualList} style={{ marginTop: 12 }}>
            {shown.map((lesson, index) => {
              const isDone = completed.has(lesson.id)
              const isTested = tested.has(lesson.id)
              const stages = stageProgress[lesson.id] || {}

              return (
                <article
                  className={`${styles.manualItem} ${open === lesson.id ? styles.expanded : ''}`}
                  key={lesson.id}
                >
                  <button
                    className={styles.manualHeader}
                    type="button"
                    onClick={() => setOpen(open === lesson.id ? null : lesson.id)}
                  >
                    <span className={styles.iconBox}>
                      {String(getWeekNumber(lesson, index)).padStart(2, '0')}
                    </span>
                    <div>
                      <strong>
                        {lesson.title}
                        <small>{lesson.weeks || lesson.subject} · {lesson.level || 'ทุกระดับ'}</small>
                      </strong>
                      <div className={styles.lessonBadgeRow}>
                        {isDone && (
                          <span className={styles.lessonBadgeCompleted}>✓ เรียนแล้ว</span>
                        )}
                        {isTested && (
                          <span className={styles.lessonBadgeTested}>🏆 ทดสอบแล้ว</span>
                        )}
                        <span className={styles.stageChipList} title="ความก้าวหน้า 4 ขั้นตอน FINE">
                          {(['F', 'I', 'N', 'E'] as const).map(st => (
                            <span
                              key={st}
                              className={`${styles.stageMiniChip} ${stages[st] ? styles.stageMiniChipActive : ''}`}
                              title={`ขั้น ${st}: ${stages[st] ? 'ทำแล้ว' : 'ยังไม่ทำ'}`}
                            >
                              {st}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                    <span className={styles.chevron}>
                      <StudentIcon name="chevron" size={17}/>
                    </span>
                  </button>

                  {open === lesson.id && (
                    <div className={styles.lessonDetail}>
                      <p>{lesson.concept || 'ยังไม่มีรายละเอียดสาระสำคัญ'}</p>

                      <div className={styles.factGrid}>
                        <div className={styles.fact}>
                          <span>รายวิชา</span>
                          <strong>{lesson.subject || '-'}</strong>
                        </div>
                        <div className={styles.fact}>
                          <span>ระยะเวลา</span>
                          <strong>{lesson.duration || '-'}</strong>
                        </div>
                      </div>

                      {lesson.vocabulary?.length > 0 && (
                        <div>
                          <b>คำศัพท์เป้าหมาย</b>
                          <div className={styles.wordResults}>
                            {lesson.vocabulary.map((value, itemIndex) => (
                              <span className={styles.correct} key={`${value}-${itemIndex}`}>
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {lesson.sentences?.length > 0 && (
                        <div className={styles.lessonBlock}>
                          <b>ประโยคฝึก</b>
                          {lesson.sentences.map((value, itemIndex) => (
                            <p key={`${value}-${itemIndex}`}>{value}</p>
                          ))}
                        </div>
                      )}

                      <div className={styles.lessonBlock}>
                        <b>เป้าหมายการเรียนรู้</b>
                        {[
                          ...(lesson.objectivesK || []),
                          ...(lesson.objectivesS || []),
                          ...(lesson.objectivesA || []),
                          ...(lesson.objectivesAP || []),
                        ].map((value, itemIndex) => (
                          <p key={`${value}-${itemIndex}`}>
                            {itemIndex + 1}. {value}
                          </p>
                        ))}
                      </div>

                      {/* 4 Activities of FINE Model for this week */}
                      <div className={styles.fineActivitiesSection}>
                        <b>ขั้นตอนการเรียนรู้ FINE Model ประจำสัปดาห์นี้</b>
                        <div className={styles.fineActivitiesGrid}>
                          <Link href={`/student/explore?planId=${encodeURIComponent(lesson.id)}&week=${getWeekNumber(lesson, index)}`} className={styles.fineActivityCard}>
                            <div>
                              <div className={styles.fineCardTop}>
                                <span className={styles.fineBadgeF}>[F] Familiarize</span>
                                {stages['F'] ? <span className={styles.statusPillSubmitted}>✓ ทำแล้ว</span> : <span className={styles.statusPillPending}>ยังไม่ทำ</span>}
                              </div>
                              <div className={styles.fineCardContent}>
                                <strong>สำรวจอุปกรณ์ & AR 3D</strong>
                                <p>{lesson.activitiesF || 'สแกนวัตถุและเรียนรู้คำศัพท์ประจำสัปดาห์'}</p>
                              </div>
                            </div>
                            <span className={styles.fineCardAction}>ไปสำรวจอุปกรณ์ →</span>
                          </Link>

                          <Link href={`/student/interact?planId=${encodeURIComponent(lesson.id)}`} className={styles.fineActivityCard}>
                            <div>
                              <div className={styles.fineCardTop}>
                                <span className={styles.fineBadgeI}>[I] Interact</span>
                                {stages['I'] ? <span className={styles.statusPillSubmitted}>✓ ทำแล้ว</span> : <span className={styles.statusPillPending}>ยังไม่ทำ</span>}
                              </div>
                              <div className={styles.fineCardContent}>
                                <strong>ฝึกสนทนา AI Voice</strong>
                                <p>{lesson.activitiesI || 'ฝึกออกเสียงและแต่งประโยคกับ AI'}</p>
                              </div>
                            </div>
                            <span className={styles.fineCardAction}>ไปฝึกพูด AI →</span>
                          </Link>

                          <Link href={`/student/simulation?planId=${encodeURIComponent(lesson.id)}`} className={styles.fineActivityCard}>
                            <div>
                              <div className={styles.fineCardTop}>
                                <span className={styles.fineBadgeN}>[N] Navigate</span>
                                {stages['N'] ? <span className={styles.statusPillSubmitted}>✓ ทำแล้ว</span> : <span className={styles.statusPillPending}>ยังไม่ทำ</span>}
                              </div>
                              <div className={styles.fineCardContent}>
                                <strong>สถานการณ์จำลอง Restaurant Simulation</strong>
                                <p>{lesson.activitiesN || 'จำลองบทบาทการบริการในร้านอาหาร'}</p>
                              </div>
                            </div>
                            <span className={styles.fineCardAction}>เข้าสู่ห้องจำลอง →</span>
                          </Link>

                          <Link href={`/student/exhibit?planId=${encodeURIComponent(lesson.id)}`} className={styles.fineActivityCard}>
                            <div>
                              <div className={styles.fineCardTop}>
                                <span className={styles.fineBadgeE}>[E] Exhibit</span>
                                {stages['E'] ? <span className={styles.statusPillSubmitted}>✓ ทำแล้ว</span> : <span className={styles.statusPillPending}>ยังไม่ทำ</span>}
                              </div>
                              <div className={styles.fineCardContent}>
                                <strong>แบบทดสอบ Quiz & สรุปผลงาน</strong>
                                <p>{lesson.activitiesE || 'วัดความรู้และประเมินผลการเรียนรู้'}</p>
                              </div>
                            </div>
                            <span className={styles.fineCardAction}>ทำแบบทดสอบ →</span>
                          </Link>
                        </div>
                      </div>

                      {/* Specific Assignments from Teacher */}
                      {assignmentsByPlan[lesson.id] && assignmentsByPlan[lesson.id].length > 0 && (
                        <div className={styles.fineActivitiesSection}>
                          <b>งานที่คุณครูมอบหมายในสัปดาห์นี้ ({assignmentsByPlan[lesson.id].length} งาน)</b>
                          <div className={styles.planAssignmentsList}>
                            {assignmentsByPlan[lesson.id].map(assignment => {
                              const route = getActivityRoute(assignment.activityType, lesson.id, getWeekNumber(lesson, index))
                              return (
                                <div key={assignment.id} className={styles.planAssignmentItem}>
                                  <div>
                                    <div className={styles.planAssignmentTitle}>
                                      <span>{assignment.title}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                                      <small style={{ color: '#7a857e' }}>
                                        คะแนนเต็ม {assignment.maxScore} คะแนน
                                        {assignment.dueDate && ` · กำหนดส่ง: ${new Date(assignment.dueDate).toLocaleDateString('th-TH')}`}
                                      </small>
                                      {assignment.status === 'returned' ? (
                                        <span className={styles.statusPillReturned}>⚠️ ครูส่งกลับให้แก้ไข</span>
                                      ) : assignment.status === 'graded' ? (
                                        <span className={styles.statusPillGraded}>🟢 ตรวจแล้ว ({assignment.score}/{assignment.maxScore} คะแนน)</span>
                                      ) : assignment.isSubmitted ? (
                                        <span className={styles.statusPillSubmitted}>✓ ส่งงานแล้ว (รอตรวจ)</span>
                                      ) : (
                                        <span className={styles.statusPillPending}>ยังไม่ได้ส่ง</span>
                                      )}
                                    </div>
                                    {assignment.returnReason && (
                                      <div className={styles.returnedReasonBox} style={{ marginTop: '6px' }}>
                                        ⚠️ <strong>เหตุผลที่ส่งกลับ:</strong> {assignment.returnReason}
                                      </div>
                                    )}
                                    {assignment.feedback && (
                                      <p className={styles.feedbackQuote} style={{ marginTop: '4px' }}>
                                        💬 &ldquo;{assignment.feedback}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                  <Link
                                    href={route}
                                    className={styles.button}
                                    style={{ flexShrink: 0, padding: '6px 12px', minHeight: '32px', fontSize: '10px' }}
                                  >
                                    {assignment.isSubmitted ? 'ดูงาน/ทำซ้ำ' : 'เริ่มทำกิจกรรม'}
                                  </Link>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {isDone ? (
                        <div className={styles.completedNoticeBox}>
                          ✓ ผ่านบทเรียนนี้แล้ว (บันทึกอัตโนมัติจากการส่งงานหรือกิจกรรม)
                          {isTested && ' · และผ่านการทดสอบแล้ว'}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`${styles.button} ${styles.full}`}
                          disabled={saving === lesson.id}
                          onClick={() => void completeLesson(lesson)}
                        >
                          <StudentIcon name="book" size={16}/>
                          {saving === lesson.id ? 'กำลังบันทึก...' : 'ทำเครื่องหมายว่าเรียนจบ'}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          {!loading && !shown.length && (
            <div className={`${styles.card} ${styles.empty}`}>
              <StudentIcon name="book" size={25}/>
              <strong>ยังไม่มีบทเรียนที่เผยแพร่</strong>
              <span>เลือกห้องเรียนให้ถูกต้อง หรือรอคุณครูเผยแพร่แผนการสอน</span>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

