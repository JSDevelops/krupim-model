'use client'

import Link from 'next/link'
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import AdminIcon from '@/components/admin/AdminIcon'
import { confirmAction } from '@/components/AppConfirmDialog'
import { authenticatedFetch } from '@/lib/api'
import styles from './page.module.css'

type Certificate = {
  id: string
  certificateCode: string
  issuedName: string
  email: string
  schoolName: string | null
  overallScore: number
  issuedAt: string
  revokedAt: string | null
  valid: boolean
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date)
}

async function responseError(response: Response) {
  try { return ((await response.json()) as { error?: string }).error || 'ดำเนินการไม่สำเร็จ' } catch { return 'ดำเนินการไม่สำเร็จ' }
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [filter, setFilter] = useState<'all' | 'valid' | 'revoked'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const loadCertificates = useCallback(async (signal?: AbortSignal) => {
    const response = await authenticatedFetch('/api/admin/certificates', { cache: 'no-store', signal })
    if (!response.ok) throw new Error(await responseError(response))
    const payload = await response.json() as { certificates?: Certificate[] }
    setCertificates(payload.certificates || [])
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
      const matchesSearch = !keyword || [item.issuedName, item.email, item.schoolName || '', item.certificateCode]
        .some(value => value.toLocaleLowerCase('th-TH').includes(keyword))
      return matchesStatus && matchesSearch
    })
  }, [certificates, deferredSearch, filter])

  async function toggleCertificate(item: Certificate) {
    const action = item.valid ? 'revoke' : 'restore'
    const confirmed = await confirmAction({
      title: item.valid ? 'ยกเลิกใบรับรองนี้?' : 'คืนสถานะใบรับรองนี้?',
      description: item.valid
        ? `${item.issuedName} จะไม่สามารถใช้เลขที่ ${item.certificateCode} ยืนยันผลได้จนกว่าจะคืนสถานะ`
        : `ใบรับรองของ ${item.issuedName} จะกลับมาแสดงผลว่าถูกต้อง`,
      confirmText: item.valid ? 'ยกเลิกใบรับรอง' : 'คืนสถานะ',
      tone: item.valid ? 'danger' : 'default',
    })
    if (!confirmed) return
    setBusy(item.id)
    try {
      const response = await authenticatedFetch('/api/admin/certificates', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, action }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      const payload = await response.json() as { certificate: Certificate }
      setCertificates(current => current.map(currentItem => currentItem.id === item.id ? payload.certificate : currentItem))
      toast.success(action === 'revoke' ? 'ยกเลิกใบรับรองแล้ว' : 'คืนสถานะใบรับรองแล้ว')
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : 'เปลี่ยนสถานะใบรับรองไม่สำเร็จ')
    } finally { setBusy(null) }
  }

  const metrics = [
    { label: 'ใบรับรองทั้งหมด', value: summary.total, detail: 'รายการที่เคยออกจากระบบ', icon: 'archive' as const, tone: 'blue' },
    { label: 'ใช้งานได้', value: summary.valid, detail: 'ตรวจสอบแล้วแสดงสถานะถูกต้อง', icon: 'check' as const, tone: 'green' },
    { label: 'ถูกยกเลิก', value: summary.revoked, detail: 'ระงับการนำไปใช้อ้างอิง', icon: 'pause' as const, tone: 'red' },
    { label: 'คะแนนเฉลี่ย', value: `${summary.average}%`, detail: 'คะแนนรวม ณ วันที่ออก', icon: 'score' as const, tone: 'gold' },
  ]

  return <div className={styles.page}>
    <header className={styles.header}><div><p>CERTIFICATE CONTROL</p><h1>ใบรับรองสมรรถนะ</h1><span>ตรวจสอบเลขที่ใบรับรองและควบคุมสถานะจากข้อมูลจริงใน PostgreSQL</span></div></header>
    <section className={styles.metrics}>{metrics.map(item => <article key={item.label} data-tone={item.tone}><span><AdminIcon name={item.icon} size={20} /></span><div><small>{item.label}</small><strong>{item.value}</strong><p>{item.detail}</p></div></article>)}</section>
    {error && <div className={styles.error}><AdminIcon name="activity" size={17} /><span>{error}</span><button type="button" onClick={() => { setError(''); setLoading(true); void loadCertificates().finally(() => setLoading(false)) }}>ลองใหม่</button></div>}
    <section className={styles.panel}>
      <div className={styles.toolbar}><label><AdminIcon name="search" size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาชื่อ อีเมล สถานศึกษา หรือเลขที่ใบรับรอง" /></label><div>{(['all','valid','revoked'] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'all' ? 'ทั้งหมด' : value === 'valid' ? 'ใช้งานได้' : 'ถูกยกเลิก'}</button>)}</div></div>
      {loading ? <div className={styles.empty}><AdminIcon name="refresh" size={25} /><strong>กำลังโหลดใบรับรอง</strong></div> : visible.length ? <div className={styles.grid}>{visible.map(item => <article className={styles.card} key={item.id} data-valid={item.valid}><header><span><AdminIcon name="archive" size={21} /></span><div><small>{item.valid ? 'VALID CERTIFICATE' : 'REVOKED CERTIFICATE'}</small><strong>{item.certificateCode}</strong></div><i>{item.valid ? 'ใช้งานได้' : 'ยกเลิกแล้ว'}</i></header><div className={styles.identity}><h2>{item.issuedName}</h2><p>{item.email}</p><span><AdminIcon name="school" size={14} />{item.schoolName || 'ไม่ระบุสถานศึกษา'}</span></div><dl><div><dt>คะแนนรวม</dt><dd>{item.overallScore}%</dd></div><div><dt>วันที่ออก</dt><dd>{formatDate(item.issuedAt)}</dd></div>{item.revokedAt && <div><dt>วันที่ยกเลิก</dt><dd>{formatDate(item.revokedAt)}</dd></div>}</dl><footer><Link href={`/verify/${item.certificateCode}`} target="_blank"><AdminIcon name="eye" size={15} />ตรวจสอบ</Link><button type="button" disabled={busy === item.id} data-danger={item.valid} onClick={() => void toggleCertificate(item)}><AdminIcon name={busy === item.id ? 'clock' : item.valid ? 'pause' : 'play'} size={15} />{busy === item.id ? 'กำลังบันทึก' : item.valid ? 'ยกเลิก' : 'คืนสถานะ'}</button></footer></article>)}</div> : <div className={styles.empty}><AdminIcon name="archive" size={27} /><strong>ไม่พบใบรับรอง</strong><span>ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</span></div>}
    </section>
  </div>
}
