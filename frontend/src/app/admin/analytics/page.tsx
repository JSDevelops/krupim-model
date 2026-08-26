'use client'

import { useEffect, useState } from 'react'
import { authenticatedFetch } from '@/lib/api'
import AdminIcon, { type AdminIconName } from '@/components/admin/AdminIcon'
import styles from './page.module.css'

type AnalyticsData = {
  summary: {
    total_activities: number
    period_activities: number
    average_score: number
    completion_rate: number
    active_schools: number
  }
  ksa: {
    knowledge: number
    skills: number
    attitude: number
    competency: number
  }
  features: {
    chat: number
    assessment: number
    simulation: number
    ar3d: number
  }
  weekly: Array<{
    date: string
    average_score: number
    activities: number
  }>
  topStudents: Array<{
    id: string
    name: string
    school_name: string | null
    class_name: string | null
    average_score: number
    lessons_completed: number
  }>
  generatedAt: string
}

const metricDefinitions: Array<{
  key: keyof AnalyticsData['summary']
  label: string
  caption: string
  icon: AdminIconName
  suffix?: string
}> = [
  { key: 'total_activities', label: 'กิจกรรมการเรียนรู้', caption: 'สะสมจากทุกฟีเจอร์', icon: 'activity' },
  { key: 'average_score', label: 'คะแนนเฉลี่ย', caption: 'ผลสัมฤทธิ์ทั้งระบบ', icon: 'score', suffix: '%' },
  { key: 'completion_rate', label: 'อัตราเรียนสำเร็จ', caption: 'บทเรียนที่ทำเสร็จ', icon: 'check', suffix: '%' },
  { key: 'active_schools', label: 'สถานศึกษาที่ใช้งาน', caption: 'เครือข่ายที่มีผู้ใช้', icon: 'school' },
]

const ksaDefinitions: Array<{
  key: keyof AnalyticsData['ksa']
  code: string
  label: string
  description: string
}> = [
  { key: 'knowledge', code: 'K', label: 'ความรู้', description: 'Knowledge' },
  { key: 'skills', code: 'S', label: 'ทักษะ', description: 'Skills' },
  { key: 'attitude', code: 'A', label: 'เจตคติ', description: 'Attitude' },
  { key: 'competency', code: 'C', label: 'สมรรถนะ', description: 'Competency' },
]

const featureDefinitions: Array<{
  key: keyof AnalyticsData['features']
  label: string
  description: string
  icon: AdminIconName
}> = [
  { key: 'chat', label: 'AI Conversation', description: 'การสนทนาฝึกภาษา', icon: 'announcement' },
  { key: 'assessment', label: 'AI Assessment', description: 'การประเมินผลผู้เรียน', icon: 'score' },
  { key: 'simulation', label: 'Simulation', description: 'สถานการณ์งานบริการ', icon: 'activity' },
  { key: 'ar3d', label: 'AR 3D Learning', description: 'บทเรียนโมเดลสามมิติ', icon: 'content' },
]

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'ST'
}

async function fetchAnalytics(signal?: AbortSignal) {
  const response = await authenticatedFetch('/api/admin/analytics', { cache: 'no-store', signal })
  if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลวิเคราะห์ได้')
  return response.json() as Promise<AnalyticsData>
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    void fetchAnalytics(controller.signal)
      .then(result => {
        setData(result)
        setError('')
      })
      .catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') setError(loadError.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  async function refresh() {
    if (refreshing) return
    setRefreshing(true)
    try {
      setData(await fetchAnalytics())
      setError('')
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'ไม่สามารถโหลดข้อมูลวิเคราะห์ได้')
    } finally {
      setRefreshing(false)
    }
  }

  const maxActivities = Math.max(...(data?.weekly.map(item => Number(item.activities) || 0) ?? [0]), 1)
  const totalFeatureUsage = featureDefinitions.reduce((sum, item) => sum + Number(data?.features[item.key] ?? 0), 0)

  return (
    <div className={styles.analytics}>
      <header className={styles.pageHeader}>
        <div>
          <p>ข้อมูลเชิงลึก</p>
          <h1>รายงานวิเคราะห์การเรียนรู้</h1>
          <span>ติดตามผลสัมฤทธิ์ พฤติกรรมการใช้งาน และสมรรถนะของผู้เรียนจากข้อมูลจริง</span>
          {data?.generatedAt && <small>อัปเดตล่าสุด {new Date(data.generatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</small>}
        </div>
        <button type="button" onClick={() => void refresh()} disabled={refreshing}>
          <AdminIcon name="refresh" size={17} />
          <span>{refreshing ? 'กำลังอัปเดต...' : 'อัปเดตข้อมูล'}</span>
        </button>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          <AdminIcon name="activity" size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => void refresh()}>ลองอีกครั้ง</button>
        </div>
      )}

      <section className={styles.metrics} aria-label="ตัวชี้วัดสำคัญ">
        {metricDefinitions.map(metric => (
          <article className={styles.metricCard} data-metric={metric.key} key={metric.key}>
            <span className={styles.metricIcon}><AdminIcon name={metric.icon} size={21} /></span>
            <span>
              <small>{metric.label}</small>
              <strong>{loading ? '—' : Number(data?.summary[metric.key] ?? 0).toLocaleString('th-TH')}{metric.suffix}</strong>
              <span>{metric.caption}</span>
            </span>
          </article>
        ))}
      </section>

      <section className={styles.primaryGrid}>
        <article className={`${styles.panel} ${styles.weeklyPanel}`}>
          <header className={styles.panelHeader}>
            <div>
              <span><AdminIcon name="analytics" size={18} /></span>
              <div><h2>กิจกรรมย้อนหลัง 7 วัน</h2><p>จำนวนกิจกรรมและคะแนนเฉลี่ยรายวัน</p></div>
            </div>
            <strong>{data?.summary.period_activities ?? 0}<small>กิจกรรมในช่วงนี้</small></strong>
          </header>

          <div className={styles.weeklyChart}>
            {(data?.weekly ?? Array.from({ length: 7 }, (_, index) => ({ date: String(index), average_score: 0, activities: 0 }))).map(point => {
              const activities = Number(point.activities) || 0
              const score = Number(point.average_score) || 0
              const label = data ? new Date(point.date + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'short' }) : '—'
              return (
                <div className={styles.dayColumn} key={point.date}>
                  <span>{activities}</span>
                  <div className={styles.barTrack}>
                    <div style={{ height: activities > 0 ? Math.max((activities / maxActivities) * 100, 6) + '%' : '3%' }} />
                  </div>
                  <strong>{score}%</strong>
                  <small>{label}</small>
                </div>
              )
            })}
          </div>

          <div className={styles.chartLegend}>
            <span><i className={styles.activityLegend} />จำนวนกิจกรรม</span>
            <span><i className={styles.scoreLegend} />คะแนนเฉลี่ย</span>
          </div>
        </article>

        <article className={`${styles.panel} ${styles.ksaPanel}`}>
          <header className={styles.panelHeader}>
            <div>
              <span><AdminIcon name="score" size={18} /></span>
              <div><h2>กรอบประเมิน KSA-C</h2><p>คะแนนเฉลี่ยแยกตามสมรรถนะ</p></div>
            </div>
          </header>

          <div className={styles.ksaList}>
            {ksaDefinitions.map(item => {
              const score = Number(data?.ksa[item.key] ?? 0)
              return (
                <div className={styles.ksaItem} data-dimension={item.key} key={item.key}>
                  <span className={styles.ksaCode}>{item.code}</span>
                  <span className={styles.ksaCopy}><strong>{item.label}</strong><small>{item.description}</small></span>
                  <div className={styles.progressTrack} role="progressbar" aria-label={item.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}>
                    <span style={{ width: score + '%' }} />
                  </div>
                  <b>{score}%</b>
                </div>
              )
            })}
          </div>
        </article>
      </section>

      <section className={styles.secondaryGrid}>
        <article className={`${styles.panel} ${styles.featurePanel}`}>
          <header className={styles.panelHeader}>
            <div>
              <span><AdminIcon name="activity" size={18} /></span>
              <div><h2>การใช้งานแต่ละฟีเจอร์</h2><p>สัดส่วนกิจกรรมการเรียนรู้ทั้งหมด</p></div>
            </div>
          </header>

          <div className={styles.featureList}>
            {featureDefinitions.map(feature => {
              const count = Number(data?.features[feature.key] ?? 0)
              const percentage = totalFeatureUsage ? Math.round((count / totalFeatureUsage) * 100) : 0
              return (
                <div className={styles.featureRow} data-feature={feature.key} key={feature.key}>
                  <span className={styles.featureIcon}><AdminIcon name={feature.icon} size={18} /></span>
                  <span className={styles.featureCopy}><strong>{feature.label}</strong><small>{feature.description}</small></span>
                  <div className={styles.featureProgress}><span style={{ width: percentage + '%' }} /></div>
                  <span className={styles.featureValue}><strong>{count.toLocaleString('th-TH')}</strong><small>{percentage}%</small></span>
                </div>
              )
            })}
          </div>
        </article>

        <article className={`${styles.panel} ${styles.studentPanel}`}>
          <header className={styles.panelHeader}>
            <div>
              <span><AdminIcon name="student" size={18} /></span>
              <div><h2>ผู้เรียนที่มีผลสัมฤทธิ์สูง</h2><p>เรียงจากคะแนนเฉลี่ยสะสม</p></div>
            </div>
          </header>

          <div className={styles.studentList}>
            {data?.topStudents.length ? data.topStudents.map((student, index) => (
              <div className={styles.studentRow} key={student.id}>
                <span className={styles.rank}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.avatar}>{initials(student.name)}</span>
                <span className={styles.studentIdentity}>
                  <strong>{student.name}</strong>
                  <small>{student.class_name || 'ยังไม่ระบุชั้นเรียน'} · {student.school_name || 'ยังไม่ระบุสถานศึกษา'}</small>
                </span>
                <span className={styles.lessonCount}>{student.lessons_completed}<small>บทเรียน</small></span>
                <strong className={styles.studentScore}>{student.average_score}%</strong>
              </div>
            )) : (
              <p className={styles.emptyState}>{loading ? 'กำลังโหลดข้อมูล...' : 'ยังไม่มีข้อมูลผลสัมฤทธิ์ของผู้เรียน'}</p>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}
