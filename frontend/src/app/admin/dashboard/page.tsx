'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRole } from '@/context/RoleContext'
import { authenticatedFetch } from '@/lib/api'
import AdminIcon, { type AdminIconName } from '@/components/admin/AdminIcon'
import styles from './page.module.css'

type DashboardMetrics = {
  schools: number
  teachers: number
  students: number
  pending_teachers: number
  published_courses: number
  average_score: number
  completed_lessons: number
  simulation_sessions: number
}

type WeeklyPoint = {
  date: string
  average_score: number
  lessons: number
}

type RecentUser = {
  id: string
  name: string
  email: string
  role: 'developer' | 'teacher' | 'student'
  approval_status: 'pending' | 'active' | 'inactive'
  created_at: string
}

type DashboardData = {
  metrics: DashboardMetrics
  weekly: WeeklyPoint[]
  recentUsers: RecentUser[]
  databaseLatencyMs: number
  generatedAt: string
}

const metricDefinitions: Array<{
  key: keyof Pick<DashboardMetrics, 'schools' | 'teachers' | 'students' | 'average_score'>
  label: string
  caption: string
  icon: AdminIconName
  href: string
  suffix?: string
}> = [
  { key: 'schools', label: 'สถานศึกษา', caption: 'เครือข่ายในระบบ', icon: 'school', href: '/admin/users' },
  { key: 'teachers', label: 'ครูผู้สอน', caption: 'บัญชีที่เปิดใช้งาน', icon: 'teacher', href: '/admin/users?tab=teachers' },
  { key: 'students', label: 'นักเรียน', caption: 'ผู้เรียนที่เปิดใช้งาน', icon: 'student', href: '/admin/users?tab=students' },
  { key: 'average_score', label: 'คะแนนเฉลี่ย', caption: 'ผลสัมฤทธิ์ทั้งระบบ', icon: 'score', href: '/admin/analytics', suffix: '%' },
]

const quickActions: Array<{
  href: string
  title: string
  description: string
  icon: AdminIconName
}> = [
  { href: '/admin/users', title: 'จัดการผู้ใช้งาน', description: 'อนุมัติบัญชีและกำหนดสิทธิ์', icon: 'users' },
  { href: '/admin/content', title: 'จัดการเนื้อหา', description: 'ดูแลบทเรียนและสื่อการเรียนรู้', icon: 'content' },
  { href: '/admin/blog', title: 'สร้างประกาศ', description: 'สื่อสารข่าวสารกับผู้ใช้งาน', icon: 'announcement' },
  { href: '/admin/settings', title: 'ตั้งค่าระบบ', description: 'ตรวจบริการ AI และการเชื่อมต่อ', icon: 'settings' },
]

const roleLabels: Record<RecentUser['role'], string> = {
  developer: 'ผู้ดูแลระบบ',
  teacher: 'ครูผู้สอน',
  student: 'นักเรียน',
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U'
}

async function fetchDashboard(signal?: AbortSignal) {
  const response = await authenticatedFetch('/api/admin/dashboard', { cache: 'no-store', signal })
  if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้')
  return response.json() as Promise<DashboardData>
}

export default function AdminDashboard() {
  const { user } = useRole()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    void fetchDashboard(controller.signal)
      .then(result => {
        setData(result)
        setError('')
      })
      .catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') {
          setError(loadError.message)
        }
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  async function refreshDashboard() {
    if (refreshing) return
    setRefreshing(true)
    try {
      setData(await fetchDashboard())
      setError('')
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้')
    } finally {
      setRefreshing(false)
    }
  }

  const metrics = data?.metrics

  return (
    <div className={styles.dashboard}>
      <header className={styles.pageHeader}>
        <div>
          <p>ภาพรวมระบบ</p>
          <h1>สวัสดี {user?.name || 'ผู้ดูแลระบบ'}</h1>
          <span>ติดตามผู้ใช้งาน เนื้อหา และผลการเรียนรู้จากข้อมูลล่าสุด</span>
        </div>
        <button type="button" onClick={() => void refreshDashboard()} disabled={refreshing}>
          <AdminIcon name="refresh" size={17} />
          <span>{refreshing ? 'กำลังอัปเดต...' : 'อัปเดตข้อมูล'}</span>
        </button>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          <AdminIcon name="activity" size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => void refreshDashboard()}>ลองอีกครั้ง</button>
        </div>
      )}

      <section className={styles.metrics} aria-label="ข้อมูลสรุป">
        {metricDefinitions.map(item => (
          <Link href={item.href} className={styles.metricCard} data-metric={item.key} key={item.key}>
            <span className={styles.metricIcon}><AdminIcon name={item.icon} size={21} /></span>
            <span className={styles.metricCopy}>
              <small>{item.label}</small>
              <strong>{loading ? '—' : (metrics?.[item.key] ?? 0).toLocaleString('th-TH')}{item.suffix}</strong>
              <span>{item.caption}</span>
            </span>
            <AdminIcon name="chevron" size={16} />
          </Link>
        ))}
      </section>

      <section className={styles.primaryGrid}>
        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <span className={styles.panelIcon}><AdminIcon name="analytics" size={18} /></span>
              <div><h2>แนวโน้มผลการเรียนรู้</h2><p>คะแนนเฉลี่ยย้อนหลัง 7 วัน</p></div>
            </div>
            <Link href="/admin/analytics">ดูรายงาน <AdminIcon name="arrow" size={15} /></Link>
          </header>

          <div className={styles.chart}>
            {data?.weekly.map(point => {
              const score = Number(point.average_score) || 0
              return (
                <div className={styles.chartColumn} key={point.date}>
                  <span className={styles.chartValue}>{score}%</span>
                  <div className={styles.chartTrack}>
                    <span style={{ height: score > 0 ? Math.max(score, 5) + '%' : '3%' }} />
                  </div>
                  <small>{new Date(point.date + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'short' })}</small>
                </div>
              )
            })}
            {!data && Array.from({ length: 7 }).map((_, index) => (
              <div className={styles.chartColumn} key={index}>
                <span className={styles.chartValue}>—</span>
                <div className={styles.chartTrack}><span className={styles.chartSkeleton} /></div>
                <small>—</small>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <span className={styles.panelIcon}><AdminIcon name="activity" size={18} /></span>
              <div><h2>สถานะระบบ</h2><p>ข้อมูลสำคัญที่ต้องติดตาม</p></div>
            </div>
          </header>

          <div className={styles.statusList}>
            <div>
              <span className={styles.statusIconSuccess}><AdminIcon name="database" size={17} /></span>
              <span><strong>ฐานข้อมูลพร้อมใช้งาน</strong><small>ตอบสนอง {data?.databaseLatencyMs ?? '—'} ms</small></span>
              <span className={styles.statusGood}>ปกติ</span>
            </div>
            <Link href="/admin/users">
              <span className={styles.statusIconWarning}><AdminIcon name="clock" size={17} /></span>
              <span><strong>บัญชีครูรออนุมัติ</strong><small>ตรวจสอบคำขอใหม่</small></span>
              <b>{metrics?.pending_teachers ?? 0}</b>
            </Link>
            <Link href="/admin/content">
              <span className={styles.statusIcon}><AdminIcon name="course" size={17} /></span>
              <span><strong>หลักสูตรที่เผยแพร่</strong><small>พร้อมให้ผู้เรียนเข้าถึง</small></span>
              <b>{metrics?.published_courses ?? 0}</b>
            </Link>
            <div>
              <span className={styles.statusIcon}><AdminIcon name="check" size={17} /></span>
              <span><strong>บทเรียนที่เรียนสำเร็จ</strong><small>สะสมจากผู้เรียนทั้งหมด</small></span>
              <b>{metrics?.completed_lessons ?? 0}</b>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.secondaryGrid}>
        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <span className={styles.panelIcon}><AdminIcon name="users" size={18} /></span>
              <div><h2>ผู้ใช้งานล่าสุด</h2><p>บัญชีที่เพิ่มเข้าสู่ระบบล่าสุด</p></div>
            </div>
            <Link href="/admin/users">ดูทั้งหมด <AdminIcon name="arrow" size={15} /></Link>
          </header>

          <div className={styles.userList}>
            {data?.recentUsers.length ? data.recentUsers.map(recentUser => (
              <div className={styles.userRow} key={recentUser.id}>
                <span className={styles.userAvatar}>{initials(recentUser.name)}</span>
                <span className={styles.userIdentity}>
                  <strong>{recentUser.name}</strong>
                  <small>{recentUser.email}</small>
                </span>
                <span className={styles.userRole}>{roleLabels[recentUser.role]}</span>
                <span className={recentUser.approval_status === 'active' ? styles.activeStatus : styles.pendingStatus}>
                  {recentUser.approval_status === 'active' ? 'ใช้งาน' : recentUser.approval_status === 'pending' ? 'รออนุมัติ' : 'ระงับ'}
                </span>
              </div>
            )) : (
              <p className={styles.emptyState}>{loading ? 'กำลังโหลดข้อมูล...' : 'ยังไม่มีข้อมูลผู้ใช้งาน'}</p>
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <span className={styles.panelIcon}><AdminIcon name="dashboard" size={18} /></span>
              <div><h2>ทางลัด</h2><p>งานที่ใช้บ่อยในระบบผู้ดูแล</p></div>
            </div>
          </header>

          <div className={styles.quickGrid}>
            {quickActions.map(action => (
              <Link href={action.href} key={action.href}>
                <span><AdminIcon name={action.icon} size={18} /></span>
                <div><strong>{action.title}</strong><small>{action.description}</small></div>
                <AdminIcon name="chevron" size={15} />
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
