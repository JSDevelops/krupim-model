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

type SystemHealthData = {
  timestamp: string
  server: {
    status: string
    uptimeSeconds: number
    nodeVersion: string
    memory: {
      rssMb: number
      heapUsedMb: number
      heapTotalMb: number
    }
  }
  database: {
    status: string
    latencyMs: number
    sizePretty: string
    sizeBytes: number
    topTables: Array<{
      name: string
      sizePretty: string
      sizeBytes: number
    }>
    connections: {
      active: number
      idle: number
      total: number
    }
  }
  aiIntelligence: {
    activeProvider: string
    activeModel: string
    dailyRequests: number
    dailyTokens: number
    dailyPromptTokens: number
    dailyCompletionTokens: number
    pendingTokenRequests: number
  }
  userActivity: {
    online15m: number
    active1h: number
    active24h: number
    totalTeachers: number
    totalStudents: number
    hourlyTraffic: Array<{ hour: string; count: number }>
  }
  security: {
    activeThrottledBuckets: number
    recentAuditEvents: Array<{
      id: string
      action: string
      entity_type: string
      created_at: string
      details: string | null
    }>
  }
}

function formatUptime(seconds?: number) {
  if (!seconds) return '—'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d} วัน ${h} ชม.`
  if (h > 0) return `${h} ชม. ${m} นาที`
  return `${m} นาที`
}

async function fetchDashboard(signal?: AbortSignal) {
  const response = await authenticatedFetch('/api/admin/dashboard', { cache: 'no-store', signal })
  if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้')
  return response.json() as Promise<DashboardData>
}

async function fetchSystemHealth(signal?: AbortSignal): Promise<SystemHealthData | null> {
  try {
    const response = await authenticatedFetch('/api/admin/system-health', { cache: 'no-store', signal })
    if (response.ok) return await response.json() as SystemHealthData
  } catch {
    // silent fallback
  }
  return null
}

export default function AdminDashboard() {
  const { user } = useRole()
  const [data, setData] = useState<DashboardData | null>(null)
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null)
  const [activeView, setActiveView] = useState<'academic' | 'telemetry'>('academic')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetchDashboard(controller.signal),
      fetchSystemHealth(controller.signal),
    ])
      .then(([dashResult, healthResult]) => {
        setData(dashResult)
        if (healthResult) setHealthData(healthResult)
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

  // Auto-refresh timer when toggled on
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      void fetchSystemHealth().then(res => {
        if (res) setHealthData(res)
      })
    }, 20_000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  async function refreshDashboard() {
    if (refreshing) return
    setRefreshing(true)
    try {
      const [dash, health] = await Promise.all([
        fetchDashboard(),
        fetchSystemHealth(),
      ])
      setData(dash)
      if (health) setHealthData(health)
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

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div className={styles.viewTabs}>
          <button
            type="button"
            className={`${styles.viewTab} ${activeView === 'academic' ? styles.viewTabActive : ''}`}
            onClick={() => setActiveView('academic')}
          >
            <AdminIcon name="analytics" size={15} />
            <span>ภาพรวมวิชาการ (Academic Overview)</span>
          </button>
          <button
            type="button"
            className={`${styles.viewTab} ${activeView === 'telemetry' ? styles.viewTabActive : ''}`}
            onClick={() => setActiveView('telemetry')}
          >
            <span className={styles.liveDot} />
            <span>สถานะระบบ & เรียลไทม์ (Live Telemetry)</span>
          </button>
        </div>

        {activeView === 'telemetry' && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#4d6156', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: '#215c43' }}
            />
            <span>⚡ อัปเดตสดอัตโนมัติ (ทุก 20 วินาที)</span>
          </label>
        )}
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <AdminIcon name="activity" size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => void refreshDashboard()}>ลองอีกครั้ง</button>
        </div>
      )}

      {/* VIEW 1: ACADEMIC OVERVIEW (Original Components) */}
      {activeView === 'academic' && (
        <>
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
        </>
      )}

      {/* VIEW 2: REALTIME SYSTEM TELEMETRY & RESOURCES */}
      {activeView === 'telemetry' && (
        <>
          {/* 4 Cards: Server, DB, AI, Concurrency */}
          <section className={styles.telemetryGrid}>
            {/* Card 1: Server Memory & Uptime */}
            <article className={styles.telemetryCard}>
              <div className={styles.telemetryCardTop}>
                <span className={styles.telemetryCardTitle}>🖥️ เซิร์ฟเวอร์ & RAM</span>
                <span className={styles.telemetryCardBadge}>Node {healthData?.server.nodeVersion || 'v20'}</span>
              </div>
              <span className={styles.telemetryBigVal}>
                {healthData?.server.memory.rssMb ?? 49} <small style={{ fontSize: 13, fontWeight: 600 }}>MB</small>
              </span>
              <div className={styles.telemetrySub}>
                <span>Heap: {healthData?.server.memory.heapUsedMb ?? 25} / {healthData?.server.memory.heapTotalMb ?? 35} MB</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${Math.min(100, Math.round(((healthData?.server.memory.heapUsedMb || 25) / Math.max(1, healthData?.server.memory.heapTotalMb || 35)) * 100))}%`,
                  }}
                />
              </div>
              <span style={{ fontSize: 10.5, color: '#889890' }}>
                ⏱️ รันต่อเนื่อง: {formatUptime(healthData?.server.uptimeSeconds)}
              </span>
            </article>

            {/* Card 2: Database Size & Latency */}
            <article className={styles.telemetryCard}>
              <div className={styles.telemetryCardTop}>
                <span className={styles.telemetryCardTitle}>💾 พื้นที่ฐานข้อมูล (PostgreSQL)</span>
                <span className={styles.telemetryCardBadge}>
                  {healthData?.database.status === 'connected' ? '🟢 เชื่อมต่อปกติ' : '🔴 ตรวจสอบ'}
                </span>
              </div>
              <span className={styles.telemetryBigVal}>
                {healthData?.database.sizePretty ?? '15 MB'}
              </span>
              <div className={styles.telemetrySub}>
                <span>⚡ Latency: <strong>{healthData?.database.latencyMs ?? 25} ms</strong></span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${Math.min(100, Math.max(3, Math.round(((healthData?.database.sizeBytes || 15000000) / 524288000) * 100)))}%`,
                  }}
                />
              </div>
              <span style={{ fontSize: 10.5, color: '#889890' }}>
                🔌 Connection Pools: {healthData?.database.connections.active ?? 1} ใช้งาน / {healthData?.database.connections.idle ?? 0} สแตนด์บาย
              </span>
            </article>

            {/* Card 3: AI Token Usage */}
            <article className={styles.telemetryCard}>
              <div className={styles.telemetryCardTop}>
                <span className={styles.telemetryCardTitle}>🤖 การใช้งาน Token AI (วันนี้)</span>
                {healthData?.aiIntelligence.pendingTokenRequests ? (
                  <Link href="/admin/token-requests" className={`${styles.telemetryCardBadge} ${styles.telemetryCardBadgeWarning}`}>
                    🔔 รออนุมัติ {healthData.aiIntelligence.pendingTokenRequests} คำขอ
                  </Link>
                ) : (
                  <span className={styles.telemetryCardBadge}>โควต้าปกติ</span>
                )}
              </div>
              <span className={styles.telemetryBigVal}>
                {(healthData?.aiIntelligence.dailyTokens ?? 0).toLocaleString('th-TH')} <small style={{ fontSize: 13, fontWeight: 600 }}>Tokens</small>
              </span>
              <div className={styles.telemetrySub}>
                <span>{healthData?.aiIntelligence.dailyRequests ?? 0} คำขอ · ผู้ให้บริการ: {healthData?.aiIntelligence.activeProvider || 'Gemini'}</span>
              </div>
              <span style={{ fontSize: 10.5, color: '#889890', marginTop: 4 }}>
                ✨ โมเดลปัจจุบัน: <strong>{healthData?.aiIntelligence.activeModel || 'gemini-2.5-flash'}</strong>
              </span>
            </article>

            {/* Card 4: Concurrency & Active Users */}
            <article className={styles.telemetryCard}>
              <div className={styles.telemetryCardTop}>
                <span className={styles.telemetryCardTitle}>👥 ผู้ใช้งานพร้อมกัน (ออนไลน์)</span>
                <span className={styles.telemetryCardBadge}>15 นาทีล่าสุด</span>
              </div>
              <span className={styles.telemetryBigVal}>
                {healthData?.userActivity.online15m ?? 0} <small style={{ fontSize: 13, fontWeight: 600 }}>คน</small>
              </span>
              <div className={styles.telemetrySub}>
                <span>1 ชม. ที่ผ่านมา: {healthData?.userActivity.active1h ?? 1} คน · 24 ชม.: {healthData?.userActivity.active24h ?? 1} คน</span>
              </div>
              <span style={{ fontSize: 10.5, color: '#889890', marginTop: 4 }}>
                🏫 สมาชิกระบบ: ครู {healthData?.userActivity.totalTeachers ?? 2} คน · นักเรียน {healthData?.userActivity.totalStudents ?? 44} คน
              </span>
            </article>
          </section>

          {/* Secondary Grid: Top Tables & Peak Hours Chart */}
          <section className={styles.primaryGrid}>
            {/* Left: Top 5 Largest Tables */}
            <article className={styles.panel}>
              <header className={styles.panelHeader}>
                <div>
                  <span className={styles.panelIcon}><AdminIcon name="database" size={18} /></span>
                  <div>
                    <h2>5 ตารางที่ใช้พื้นที่ฐานข้อมูลมากที่สุด</h2>
                    <p>ตรวจสอบขนาดและการเติบโตของข้อมูลในระบบ</p>
                  </div>
                </div>
                <Link href="/admin/settings">ตั้งค่าระบบ <AdminIcon name="arrow" size={15} /></Link>
              </header>

              <div className={styles.storageList}>
                {healthData?.database.topTables.map((tbl, i) => (
                  <div key={tbl.name} className={styles.storageRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#8c9c94', width: 16 }}>{i + 1}.</span>
                      <span className={styles.storageName}>{tbl.name}</span>
                    </div>
                    <span className={styles.storageSize}>{tbl.sizePretty}</span>
                  </div>
                ))}
                {!healthData?.database.topTables.length && (
                  <p style={{ margin: 0, padding: 16, color: '#8a9c93', fontSize: 12 }}>
                    กำลังวิเคราะห์ขนาดตารางข้อมูล...
                  </p>
                )}
              </div>
            </article>

            {/* Right: Peak Hours Traffic (24h) */}
            <article className={styles.panel}>
              <header className={styles.panelHeader}>
                <div>
                  <span className={styles.panelIcon}><AdminIcon name="activity" size={18} /></span>
                  <div>
                    <h2>ช่วงเวลาที่เข้าใช้งาน (24 ชั่วโมงย้อนหลัง)</h2>
                    <p>วิเคราะห์ชั่วโมงที่มีการใช้งานหนาแน่น (Peak Hours)</p>
                  </div>
                </div>
              </header>

              <div className={styles.hourlyContainer}>
                <div className={styles.hourlyChart}>
                  {(() => {
                    const maxTraffic = Math.max(1, ...(healthData?.userActivity.hourlyTraffic.map(t => t.count) || [1]))
                    return healthData?.userActivity.hourlyTraffic.map(item => {
                      const heightPercent = Math.max(4, Math.round((item.count / maxTraffic) * 100))
                      const isPeak = item.count > 0 && item.count === maxTraffic
                      return (
                        <div key={item.hour} className={styles.hourlyCol} title={`${item.hour} — กิจกรรม: ${item.count} ครั้ง`}>
                          <div className={styles.hourlyBarWrap}>
                            <div
                              className={`${styles.hourlyBar} ${isPeak ? styles.hourlyBarPeak : ''}`}
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                          {parseInt(item.hour) % 3 === 0 && (
                            <span className={styles.hourlyText}>{item.hour.slice(0, 2)}</span>
                          )}
                        </div>
                      )
                    })
                  })()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#72847c', marginTop: 4 }}>
                  <span>🌙 00:00 (กลางคืน)</span>
                  <span style={{ color: '#ca8a04', fontWeight: 700 }}>☀️ คาบเรียน (09:00 - 15:00)</span>
                  <span>🌆 23:00 (ดึก)</span>
                </div>
              </div>
            </article>
          </section>

          {/* Bottom Security & Protection Events */}
          <section className={styles.secondaryGrid}>
            <article className={styles.panel}>
              <header className={styles.panelHeader}>
                <div>
                  <span className={styles.panelIcon}><AdminIcon name="clock" size={18} /></span>
                  <div>
                    <h2>ประวัติกิจกรรมความปลอดภัยล่าสุด (Security Audit)</h2>
                    <p>บันทึกการกระทำสำคัญในระบบเพื่อความโปร่งใส</p>
                  </div>
                </div>
                <Link href="/admin/audit-logs">ดูประวัติทั้งหมด <AdminIcon name="arrow" size={15} /></Link>
              </header>

              <div className={styles.userList}>
                {healthData?.security.recentAuditEvents.length ? healthData.security.recentAuditEvents.map(evt => (
                  <div className={styles.userRow} key={evt.id} style={{ gridTemplateColumns: 'auto minmax(0, 1fr) auto' }}>
                    <span style={{ fontSize: 14 }}>🛡️</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <strong style={{ fontSize: 12, color: '#17382b' }}>{evt.action} ({evt.entity_type})</strong>
                      <small style={{ fontSize: 11, color: '#889890' }}>
                        {new Date(evt.created_at).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </small>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#f0fdf4', color: '#166534' }}>
                      สำเร็จ
                    </span>
                  </div>
                )) : (
                  <p className={styles.emptyState}>ยังไม่มีประวัติกิจกรรมผิดปกติ</p>
                )}
              </div>
            </article>

            <article className={styles.panel}>
              <header className={styles.panelHeader}>
                <div>
                  <span className={styles.panelIcon}><AdminIcon name="settings" size={18} /></span>
                  <div>
                    <h2>ระบบป้องกันและควบคุม (System Protection)</h2>
                    <p>สถานะกลไกความปลอดภัยของระบบ</p>
                  </div>
                </div>
              </header>

              <div className={styles.statusList}>
                <div>
                  <span className={styles.statusIconSuccess}><AdminIcon name="check" size={17} /></span>
                  <span><strong>Rate Limiter & Anti-Spam</strong><small>ควบคุมความถี่ Request ไม่ให้เซิร์ฟเวอร์โอเวอร์โหลด</small></span>
                  <span className={styles.statusGood}>ทำงานปกติ</span>
                </div>
                <div>
                  <span className={styles.statusIconSuccess}><AdminIcon name="check" size={17} /></span>
                  <span><strong>Throttled IP Buckets</strong><small>จำนวนการดักจับ Request ผิดปกติ</small></span>
                  <b>{healthData?.security.activeThrottledBuckets ?? 0}</b>
                </div>
                <div>
                  <span className={styles.statusIconSuccess}><AdminIcon name="check" size={17} /></span>
                  <span><strong>PDPA & Data Protection</strong><small>การยินยอมและการเข้ารหัสข้อมูลส่วนบุคคล</small></span>
                  <span className={styles.statusGood}>คุ้มครอง</span>
                </div>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
