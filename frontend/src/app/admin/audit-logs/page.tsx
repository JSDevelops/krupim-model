'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminIcon from '@/components/admin/AdminIcon'
import { authenticatedFetch } from '@/lib/api'
import styles from './page.module.css'

type AuditLog = {
  id: string
  action: string
  entityType: string
  entityId: string | null
  details: Record<string, unknown>
  createdAt: string
  actorName: string | null
  actorEmail: string | null
  actorRole: string | null
}

type AuditResponse = {
  logs: AuditLog[]
  summary: { total: number; today: number; actors: number; actions: number }
  options: { actions: string[]; entityTypes: string[] }
  pagination: { page: number; limit: number; total: number; pages: number }
}

const actionLabels: Record<string, string> = {
  create_user: 'สร้างบัญชีผู้ใช้', update_user: 'แก้ไขบัญชีผู้ใช้', delete_user: 'ลบบัญชีผู้ใช้',
  approve: 'อนุมัติบัญชี', reject: 'ปฏิเสธบัญชี', suspend: 'ระงับบัญชี', activate: 'เปิดใช้งานบัญชี',
  reset_password: 'ตั้งรหัสผ่านใหม่', self_password_reset: 'ผู้ใช้รีเซ็ตรหัสผ่าน', change_password: 'เปลี่ยนรหัสผ่าน',
  update_system_settings: 'แก้ไขการตั้งค่าระบบ', revoke_certificate: 'ยกเลิกใบรับรอง', restore_certificate: 'คืนสถานะใบรับรอง',
}

const entityLabels: Record<string, string> = {
  profile: 'บัญชีผู้ใช้', system_setting: 'การตั้งค่าระบบ', certificate: 'ใบรับรอง',
}

function label(value: string, labels: Record<string, string>) {
  return labels[value] || value.replaceAll('_', ' ')
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(date)
}

function detailEntries(details: Record<string, unknown>) {
  return Object.entries(details || {}).filter(([, value]) => value !== null && value !== '' && typeof value !== 'object').slice(0, 4)
}

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<AuditResponse | null>(null)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadLogs = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page), limit: '24' })
    if (search.trim()) params.set('search', search.trim())
    if (action) params.set('action', action)
    if (entityType) params.set('entityType', entityType)
    try {
      const response = await authenticatedFetch(`/api/admin/audit-logs?${params}`, { cache: 'no-store', signal })
      const payload = await response.json() as AuditResponse & { error?: string }
      if (!response.ok) throw new Error(payload.error || 'โหลดประวัติกิจกรรมไม่สำเร็จ')
      setData(payload)
    } catch (loadError) {
      if (!(loadError instanceof Error && loadError.name === 'AbortError')) {
        setError(loadError instanceof Error ? loadError.message : 'โหลดประวัติกิจกรรมไม่สำเร็จ')
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [action, entityType, page, search])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => void loadLogs(controller.signal), 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [loadLogs])

  const metrics = useMemo(() => [
    { label: 'กิจกรรมทั้งหมด', value: data?.summary.total || 0, icon: 'activity' as const, tone: 'green' },
    { label: 'กิจกรรมวันนี้', value: data?.summary.today || 0, icon: 'clock' as const, tone: 'blue' },
    { label: 'ผู้ดำเนินการ', value: data?.summary.actors || 0, icon: 'users' as const, tone: 'gold' },
    { label: 'ประเภทคำสั่ง', value: data?.summary.actions || 0, icon: 'database' as const, tone: 'purple' },
  ], [data])

  return <div className={styles.page}>
    <header className={styles.hero}><div><p>SYSTEM AUDIT TRAIL</p><h1>ประวัติกิจกรรม</h1><span>ตรวจสอบการเปลี่ยนแปลงข้อมูลสำคัญ พร้อมผู้ดำเนินการและเวลาที่เกิดเหตุการณ์</span></div><button type="button" onClick={() => void loadLogs()} disabled={loading}><AdminIcon name="refresh" size={16} />รีเฟรชข้อมูล</button></header>
    <section className={styles.metrics}>{metrics.map(item => <article key={item.label} data-tone={item.tone}><span><AdminIcon name={item.icon} size={20} /></span><div><small>{item.label}</small><strong>{item.value.toLocaleString('th-TH')}</strong></div></article>)}</section>
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <label className={styles.search}><AdminIcon name="search" size={17} /><input type="search" aria-label="ค้นหาประวัติกิจกรรม" placeholder="ค้นหาชื่อ อีเมล คำสั่ง หรือรหัสข้อมูล" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} /></label>
        <label><span>คำสั่ง</span><select value={action} onChange={event => { setAction(event.target.value); setPage(1) }}><option value="">ทั้งหมด</option>{data?.options.actions.map(item => <option key={item} value={item}>{label(item, actionLabels)}</option>)}</select></label>
        <label><span>ข้อมูล</span><select value={entityType} onChange={event => { setEntityType(event.target.value); setPage(1) }}><option value="">ทั้งหมด</option>{data?.options.entityTypes.map(item => <option key={item} value={item}>{label(item, entityLabels)}</option>)}</select></label>
      </div>
      {error ? <div className={styles.state}><AdminIcon name="activity" size={26} /><strong>{error}</strong><button type="button" onClick={() => void loadLogs()}>ลองอีกครั้ง</button></div> : loading && !data ? <div className={styles.state}><AdminIcon name="refresh" size={26} /><strong>กำลังโหลดประวัติกิจกรรม</strong></div> : data?.logs.length ? <div className={styles.list}>{data.logs.map(item => {
        const details = detailEntries(item.details)
        return <article key={item.id} className={styles.log}><span className={styles.logIcon}><AdminIcon name={item.action.includes('delete') || item.action.includes('revoke') || item.action.includes('reject') ? 'pause' : item.action.includes('create') || item.action.includes('approve') || item.action.includes('restore') ? 'check' : 'activity'} size={17} /></span><div className={styles.logMain}><header><strong>{label(item.action, actionLabels)}</strong><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></header><p><b>{item.actorName || 'ระบบ'}</b>{item.actorEmail ? ` · ${item.actorEmail}` : ''}</p><div className={styles.tags}><span>{label(item.entityType, entityLabels)}</span>{item.entityId && <code>{item.entityId}</code>}{item.actorRole && <span>{item.actorRole}</span>}</div>{details.length > 0 && <dl>{details.map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{String(value)}</dd></div>)}</dl>}</div></article>
      })}</div> : <div className={styles.state}><AdminIcon name="activity" size={27} /><strong>ไม่พบประวัติกิจกรรม</strong><span>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</span></div>}
      {data && data.pagination.pages > 1 && <footer className={styles.pagination}><span>หน้า {data.pagination.page} จาก {data.pagination.pages} · {data.pagination.total.toLocaleString('th-TH')} รายการ</span><div><button type="button" disabled={page <= 1 || loading} onClick={() => setPage(current => Math.max(1, current - 1))}>ก่อนหน้า</button><button type="button" disabled={page >= data.pagination.pages || loading} onClick={() => setPage(current => current + 1)}>ถัดไป</button></div></footer>}
    </section>
  </div>
}
