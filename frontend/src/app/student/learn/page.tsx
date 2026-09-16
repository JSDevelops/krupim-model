'use client'

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

function getWeekNumber(lesson: Lesson, fallbackIndex: number): number {
  const match = lesson.weeks?.match(/\d+/) || lesson.id?.match(/week-(\d+)/) || lesson.title?.match(/สัปดาห์ที่\s*(\d+)/)
  return match ? parseInt(match[1] || match[0], 10) : fallbackIndex + 1
}

export default function LearnPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
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
          error?: string
        }
        if (!response.ok) throw new Error(payload.error || 'โหลดบทเรียนไม่สำเร็จ')
        setLessons(payload.lessons || [])
        setCompleted(new Set(payload.completedIds || []))
        setTested(new Set(payload.testedIds || []))
        setStageProgress(payload.stageProgress || {})
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

