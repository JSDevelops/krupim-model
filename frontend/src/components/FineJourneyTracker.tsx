'use client'

import Link from 'next/link'
import StudentIcon from '@/app/student/StudentIcon'
import styles from './FineJourneyTracker.module.css'

export type FineJourneyData = {
  f: { key: string; title: string; label: string; count: number; completed: boolean; href: string }
  i: { key: string; title: string; label: string; count: number; completed: boolean; href: string }
  n: { key: string; title: string; label: string; count: number; completed: boolean; href: string }
  e: { key: string; title: string; label: string; count: number; completed: boolean; href: string }
  completedSteps: number
  percentage: number
  hasCertificate: boolean
  certificateCode: string | null
}

export default function FineJourneyTracker({ journey }: { journey?: FineJourneyData | null }) {
  const steps = [
    {
      key: 'F',
      name: 'F — Familiarize',
      titleTh: 'สร้างความคุ้นเคย & คำศัพท์ 3D',
      desc: 'สแกนวัตถุจริงด้วย AI และศึกษาโมเดล 3D เสมือนจริง',
      href: '/student/explore',
      count: journey?.f?.count ?? 0,
      completed: (journey?.f?.count ?? 0) > 0,
      icon: 'target' as const,
      color: '#285e47',
    },
    {
      key: 'I',
      name: 'I — Interact',
      titleTh: 'ฝึกฟังและออกเสียงประโยคบริการ',
      desc: 'ฟังเสียงต้นแบบเจ้าของภาษา และทดสอบออกเสียงรายคำ',
      href: '/student/interact',
      count: journey?.i?.count ?? 0,
      completed: (journey?.i?.count ?? 0) > 0,
      icon: 'message' as const,
      color: '#315573',
    },
    {
      key: 'N',
      name: 'N — Navigate',
      titleTh: 'สถานการณ์จำลอง & ตัดสินใจ',
      desc: 'แก้ปัญหาเฉพาะหน้าและฝึกบทบาทสมมติในห้องอาหาร',
      href: '/student/navigate',
      count: journey?.n?.count ?? 0,
      completed: (journey?.n?.count ?? 0) > 0,
      icon: 'task' as const,
      color: '#8c6020',
    },
    {
      key: 'E',
      name: 'E — Exhibit',
      titleTh: 'ประเมินผล & แสดงผลงาน',
      desc: 'ทำแบบทดสอบวัดสมรรถนะ KSA-C และรับใบประกาศนียบัตร',
      href: '/student/exhibit',
      count: journey?.e?.count ?? 0,
      completed: (journey?.e?.count ?? 0) > 0,
      icon: 'award' as const,
      color: '#7a3b49',
    },
  ]

  const completedSteps = journey?.completedSteps ?? steps.filter(s => s.completed).length
  const percent = journey?.percentage ?? Math.round((completedSteps / 4) * 100)

  return (
    <section className={styles.wrapper} aria-label="วงรอบการเรียนรู้ FINE Model">
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.badge}>
            <StudentIcon name="sparkles" size={13} />
            <span>FINE Learning Loop</span>
          </div>
          <h2 className={styles.title}>เส้นทางการเรียนรู้ตามวงรอบ FINE Model</h2>
          <p className={styles.subtitle}>
            ผ่านการฝึกปฏิบัติครบ 4 มิติเพื่อพัฒนาสมรรถนะวิชาชีพการบริการอาหารและเครื่องดื่มมาตรฐานสากล
          </p>
        </div>
        <div className={styles.progressCircle}>
          <div className={styles.progressPercent}>{percent}%</div>
          <span className={styles.progressLabel}>สำเร็จ {completedSteps}/4 ขั้น</span>
        </div>
      </div>

      <div className={styles.progressBarTrack} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className={styles.progressBarFill} style={{ width: `${percent}%` }} />
      </div>

      <div className={styles.stepsGrid}>
        {steps.map((step, idx) => {
          const isNext = !step.completed && (idx === 0 || steps[idx - 1].completed)
          return (
            <Link
              key={step.key}
              href={step.href}
              className={`${styles.stepCard} ${step.completed ? styles.stepDone : isNext ? styles.stepCurrent : ''}`}
            >
              <div className={styles.stepTop}>
                <span className={styles.stepBadge} style={{ background: step.color }}>
                  {step.key}
                </span>
                <span className={`${styles.statusPill} ${step.completed ? styles.statusDone : isNext ? styles.statusCurrent : ''}`}>
                  {step.completed ? (
                    <>
                      <StudentIcon name="check" size={12} /> สำเร็จแล้ว ({step.count})
                    </>
                  ) : isNext ? (
                    '⭐ ขั้นตอนปัจจุบัน'
                  ) : (
                    'รอเริ่มเรียน'
                  )}
                </span>
              </div>

              <div className={styles.stepContent}>
                <h3 className={styles.stepName}>{step.name}</h3>
                <h4 className={styles.stepTitleTh}>{step.titleTh}</h4>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>

              <div className={styles.stepFooter}>
                <span className={styles.ctaText}>
                  {step.completed ? 'ทบทวนอีกครั้ง' : isNext ? 'เริ่มเรียนขั้นตอนนี้' : 'ดูรายละเอียด'}
                </span>
                <StudentIcon name="arrowRight" size={14} />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
