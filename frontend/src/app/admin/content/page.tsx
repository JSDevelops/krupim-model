'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import AdminIcon, { type AdminIconName } from '@/components/admin/AdminIcon'
import { authenticatedFetch } from '@/lib/api'
import styles from '../adminPages.module.css'

type ContentType = 'AR Object' | 'AI Scan' | 'Simulation' | 'Lesson'
type ContentStatus = 'published' | 'draft'
type ContentTab = 'all' | ContentType

interface ContentItem {
  id: string
  type: ContentType
  name: string
  nameEn: string
  unit: string
  status: ContentStatus
  creatorName: string
  creatorEmail: string | null
  creatorSchool: string | null
  createdAt: string
  updatedAt: string
}

interface ContentRecord {
  id: string
  content_type: ContentType
  name_th: string
  name_en: string
  unit_label: string
  status: ContentStatus
  creator_name: string | null
  creator_email: string | null
  creator_school: string | null
  created_at: string
  updated_at: string
}

const typeConfig: Record<ContentType, { label: string; icon: AdminIconName; tone: string }> = {
  'AR Object': { label: 'โมเดล AR 3D', icon: 'cube', tone: 'blue' },
  'AI Scan': { label: 'AI Scan', icon: 'scan', tone: 'purple' },
  Simulation: { label: 'สถานการณ์จำลอง', icon: 'activity', tone: 'orange' },
  Lesson: { label: 'บทเรียน FINE', icon: 'course', tone: 'green' },
}

const tabs: Array<{ key: ContentTab; label: string }> = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'AR Object', label: 'โมเดล AR 3D' },
  { key: 'AI Scan', label: 'AI Scan' },
  { key: 'Simulation', label: 'สถานการณ์จำลอง' },
  { key: 'Lesson', label: 'บทเรียน FINE' },
]

function mapContent(record: ContentRecord): ContentItem {
  return {
    id: record.id,
    type: record.content_type,
    name: record.name_th,
    nameEn: record.name_en,
    unit: record.unit_label,
    status: record.status,
    creatorName: record.creator_name || 'ครูผู้สอนส่วนกลาง',
    creatorEmail: record.creator_email,
    creatorSchool: record.creator_school,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

function formatDate(isoString?: string) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'short', timeStyle: 'short' }).format(d)
}

async function getResponseError(response: Response) {
  try {
    const payload = await response.json() as { error?: string }
    if (payload.error) return payload.error
  } catch {
    // Fall back to default error
  }
  return 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง'
}

export default function AdminContentAuditPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [activeTab, setActiveTab] = useState<ContentTab>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [inspectTarget, setInspectTarget] = useState<ContentItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null)

  const loadContent = useCallback(async (signal?: AbortSignal) => {
    const response = await authenticatedFetch('/api/admin/content', { signal })
    if (!response.ok) throw new Error(await getResponseError(response))
    const payload = await response.json() as { items?: ContentRecord[] }
    setItems((payload.items ?? []).map(mapContent))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve()
      .then(() => loadContent(controller.signal))
      .catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') setError(loadError.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [loadContent])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || busyAction) return
      setInspectTarget(null)
      setDeleteTarget(null)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [busyAction])

  const counts = useMemo(() => ({
    all: items.length,
    'AR Object': items.filter(item => item.type === 'AR Object').length,
    'AI Scan': items.filter(item => item.type === 'AI Scan').length,
    Simulation: items.filter(item => item.type === 'Simulation').length,
    Lesson: items.filter(item => item.type === 'Lesson').length,
    published: items.filter(item => item.status === 'published').length,
    draft: items.filter(item => item.status === 'draft').length,
  }), [items])

  const visibleItems = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('th-TH')
    return items.filter(item => {
      const matchesTab = activeTab === 'all' || item.type === activeTab
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesSearch = !keyword
        || item.name.toLocaleLowerCase('th-TH').includes(keyword)
        || item.nameEn.toLocaleLowerCase('en-US').includes(keyword)
        || item.unit.toLocaleLowerCase('en-US').includes(keyword)
        || item.creatorName.toLocaleLowerCase('th-TH').includes(keyword)
      return matchesTab && matchesStatus && matchesSearch
    })
  }, [items, activeTab, statusFilter, search])

  const uniqueTeachers = useMemo(() => {
    const names = new Set(items.map(i => i.creatorName).filter(Boolean))
    return names.size
  }, [items])

  const metrics = [
    {
      key: 'all',
      label: 'เนื้อหาในระบบทั้งหมด',
      value: counts.all,
      detail: 'ครอบคลุมทุกหมวดหมู่การเรียนรู้',
      icon: 'content' as AdminIconName,
      tone: 'blue',
    },
    {
      key: 'ar',
      label: 'สื่อสามมิติ AR 3D',
      value: counts['AR Object'],
      detail: 'สื่อเสมือนจริงสำหรับการจัดโต๊ะอาหาร',
      icon: 'cube' as AdminIconName,
      tone: 'purple',
    },
    {
      key: 'published',
      label: 'เผยแพร่และตรวจสอบแล้ว',
      value: counts.published,
      detail: 'เปิดให้นักเรียนเข้าเรียนและทำกิจกรรม',
      icon: 'check' as AdminIconName,
      tone: 'green',
    },
    {
      key: 'teachers',
      label: 'ครูผู้จัดทำเนื้อหา',
      value: uniqueTeachers,
      detail: 'จำนวนผู้สอนที่ร่วมพัฒนาสื่อ',
      icon: 'teacher' as AdminIconName,
      tone: 'gold',
    },
  ]

  async function toggleStatus(item: ContentItem) {
    setBusyAction(`toggle:${item.id}`)
    try {
      const response = await authenticatedFetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, action: 'toggle' }),
      })
      if (!response.ok) throw new Error(await getResponseError(response))
      const payload = await response.json() as { item: ContentRecord }
      const updatedItem = mapContent(payload.item)
      setItems(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, status: updatedItem.status, updatedAt: updatedItem.updatedAt } : currentItem))
      if (inspectTarget?.id === item.id) {
        setInspectTarget(current => current ? { ...current, status: updatedItem.status } : null)
      }
      toast.success(updatedItem.status === 'published' ? `อนุมัติเผยแพร่ “${item.name}” เรียบร้อยแล้ว` : `ระงับการเผยแพร่ “${item.name}” เป็นฉบับร่างแล้ว`)
    } catch (statusError) {
      toast.error(statusError instanceof Error ? statusError.message : 'ไม่สามารถเปลี่ยนสถานะได้')
    } finally {
      setBusyAction(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setBusyAction(`delete:${deleteTarget.id}`)
    try {
      const response = await authenticatedFetch(`/api/admin/content?id=${encodeURIComponent(deleteTarget.id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await getResponseError(response))
      setItems(current => current.filter(item => item.id !== deleteTarget.id))
      toast.success(`ลบรายการ “${deleteTarget.name}” ออกจากระบบแล้ว`)
      setDeleteTarget(null)
      if (inspectTarget?.id === deleteTarget.id) setInspectTarget(null)
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'ไม่สามารถลบเนื้อหาได้')
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <main className={styles.adminPage}>
      <header className={styles.pageHeader}>
        <div>
          <p>CONTENT AUDIT & GOVERNANCE</p>
          <h1>ตรวจสอบและกำกับดูแลเนื้อหาการเรียนรู้</h1>
          <span>ตรวจสอบความสมบูรณ์ คุณภาพสื่อ AR 3D และสถานะการเผยแพร่ของครูผู้สอนทั่วทั้งระบบ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <AdminIcon name="shield" size={16} />
            <span>โหมดผู้ดูแลระบบ: ตรวจสอบและกำกับดูแล</span>
          </div>
          <button
            className={styles.outlineButton}
            type="button"
            onClick={() => {
              setLoading(true)
              void loadContent().finally(() => setLoading(false))
            }}
            disabled={loading}
          >
            <AdminIcon name="refresh" size={15} />
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>
      </header>

      {/* Role separation policy notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '12px 18px',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid #e2e8f0',
          marginBottom: 16,
          fontSize: 13,
          color: '#334155',
          lineHeight: 1.5,
        }}
      >
        <span style={{ color: '#0284c7', marginTop: 2 }}>
          <AdminIcon name="shield" size={18} />
        </span>
        <div>
          <strong style={{ color: '#0f172a' }}>การแบ่งแยกบทบาทตามมาตรฐานระบบการศึกษา (Role-Based Governance):</strong>
          <span style={{ display: 'block', marginTop: 2 }}>
            ครูผู้สอนเป็นผู้ออกแบบและจัดทำแผนการสอน FINE Model, คำศัพท์, และสื่อ AR 3D ผ่านหน้า <em>Teacher Console</em> โดยผู้ดูแลระบบ (Admin) มีหน้าที่กำกับดูแลความถูกต้อง ตรวจสอบคุณภาพสื่อ และอนุมัติหรือระงับการเผยแพร่เพื่อความปลอดภัยของสถาบัน
          </span>
        </div>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setError('')
              setLoading(true)
              void loadContent()
                .catch(retryError => setError(retryError instanceof Error ? retryError.message : 'โหลดข้อมูลไม่สำเร็จ'))
                .finally(() => setLoading(false))
            }}
          >
            ลองใหม่
          </button>
        </div>
      )}

      <section className={styles.metrics} aria-label="สรุปเนื้อหา">
        {metrics.map(metric => (
          <article className={styles.metricCard} data-tone={metric.tone} key={metric.key}>
            <span className={styles.metricIcon}><AdminIcon name={metric.icon} size={20} /></span>
            <span className={styles.metricCopy}>
              <small>{metric.label}</small>
              <strong>{loading ? '—' : metric.value.toLocaleString('th-TH')}</strong>
              <span>{metric.detail}</span>
            </span>
          </article>
        ))}
      </section>

      <section className={`${styles.panel} ${styles.contentPanel}`} data-tone="green">
        <div className={styles.tabs} role="tablist" aria-label="ประเภทเนื้อหา">
          {tabs.map(tab => (
            <button key={tab.key} type="button" role="tab" aria-selected={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
              {tab.label}<span>{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        <div className={styles.panelToolbar}>
          <div>
            <h2>{tabs.find(tab => tab.key === activeTab)?.label}</h2>
            <p>{visibleItems.length.toLocaleString('th-TH')} รายการที่แสดง</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ color: '#64748b' }}>สถานะ:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 12,
                }}
              >
                <option value="all">ทั้งหมด ({counts.all})</option>
                <option value="published">เผยแพร่แล้ว ({counts.published})</option>
                <option value="draft">ฉบับร่าง / รอตรวจ ({counts.draft})</option>
              </select>
            </div>
            <label className={styles.searchBox}>
              <AdminIcon name="search" size={17} />
              <span className={styles.srOnly}>ค้นหาเนื้อหาหรือครูผู้จัดทำ</span>
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="ค้นหาชื่อ, หน่วยเรียน, หรือครูผู้สอน..."
              />
            </label>
          </div>
        </div>

        <div className={styles.dataList} aria-busy={loading}>
          <div className={`${styles.listHeader} ${styles.contentGrid}`} aria-hidden="true">
            <span>เนื้อหา / สื่อการเรียนรู้</span>
            <span>ประเภท</span>
            <span>ผู้จัดทำ & หน่วยเรียน</span>
            <span>สถานะเผยแพร่</span>
            <span>ตรวจสอบ</span>
          </div>

          {loading ? (
            <div className={styles.emptyState}>
              <span><AdminIcon name="refresh" size={24} /></span>
              <h3>กำลังโหลดข้อมูลการตรวจสอบ</h3>
              <p>ระบบกำลังอ่านข้อมูลจาก PostgreSQL</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className={styles.emptyState}>
              <span><AdminIcon name="search" size={24} /></span>
              <h3>ไม่พบเนื้อหาที่ตรงกับเงื่อนไขการตรวจสอบ</h3>
              <p>ลองปรับตัวกรองประเภท สถานะ หรือคำค้นหา</p>
            </div>
          ) : visibleItems.map(item => {
            const config = typeConfig[item.type]
            const isBusy = busyAction?.endsWith(item.id) ?? false
            return (
              <article className={`${styles.dataRow} ${styles.contentGrid}`} data-tone={config.tone} key={item.id}>
                <div className={styles.itemIdentity}>
                  <span className={styles.itemIcon}><AdminIcon name={config.icon} size={18} /></span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.nameEn}</small>
                  </span>
                </div>

                <span className={styles.typeBadge} data-tone={config.tone}>{config.label}</span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {item.creatorName}
                  </span>
                  <small style={{ color: '#64748b', fontSize: 11 }}>
                    {item.unit} • {formatDate(item.updatedAt)}
                  </small>
                </div>

                <div>
                  <button
                    className={styles.statusButton}
                    data-status={item.status}
                    type="button"
                    onClick={() => void toggleStatus(item)}
                    disabled={isBusy}
                    title={item.status === 'published' ? 'คลิกเพื่อระงับการเผยแพร่' : 'คลิกเพื่ออนุมัติเผยแพร่'}
                  >
                    {item.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง/ระงับ'}
                  </button>
                </div>

                <div className={styles.rowActions}>
                  <button
                    className={styles.iconButton}
                    type="button"
                    title="ตรวจสอบรายละเอียดสื่อ"
                    aria-label={`ตรวจสอบ ${item.name}`}
                    onClick={() => setInspectTarget(item)}
                    disabled={isBusy}
                    style={{ background: '#f1f5f9', color: '#0f172a' }}
                  >
                    <AdminIcon name="eye" size={16} />
                  </button>
                  <button
                    className={styles.iconButtonDanger}
                    type="button"
                    title="ลบกรณีผิดระเบียบ"
                    aria-label={`ลบ ${item.name}`}
                    onClick={() => setDeleteTarget(item)}
                    disabled={isBusy}
                  >
                    <AdminIcon name="trash" size={15} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Audit Inspection Modal */}
      {inspectTarget && (
        <div
          className={`${styles.modalOverlay} ${styles.compactOverlay}`}
          onMouseDown={event => { if (event.target === event.currentTarget && !busyAction) setInspectTarget(null) }}
        >
          <section className={`${styles.modal} ${styles.compactModal}`} role="dialog" aria-modal="true" aria-labelledby="audit-modal-title">
            <div className={styles.modalHeader}>
              <span><AdminIcon name="shield" size={20} /></span>
              <div>
                <h2 id="audit-modal-title">ตรวจสอบรายละเอียดเนื้อหา (Content Audit)</h2>
                <p>ตรวจสอบความสมบูรณ์และมาตรฐานวิชาการของสื่อการเรียนรู้</p>
              </div>
              <button type="button" aria-label="ปิดหน้าต่าง" onClick={() => setInspectTarget(null)} disabled={Boolean(busyAction)}>
                <AdminIcon name="close" size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>ชื่อเนื้อหา (TH)</small>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>{inspectTarget.name}</div>
                </div>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>ชื่อภาษาอังกฤษ (EN)</small>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>{inspectTarget.nameEn}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>ประเภทสื่อ</small>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>
                    {typeConfig[inspectTarget.type]?.label || inspectTarget.type}
                  </div>
                </div>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>หน่วยการเรียนรู้</small>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>{inspectTarget.unit}</div>
                </div>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>สถานะปัจจุบัน</small>
                  <div style={{ marginTop: 4 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        background: inspectTarget.status === 'published' ? '#dcfce7' : '#fef3c7',
                        color: inspectTarget.status === 'published' ? '#15803d' : '#b45309',
                      }}
                    >
                      {inspectTarget.status === 'published' ? 'เผยแพร่ใช้งานแล้ว' : 'ฉบับร่าง / พักการเผยแพร่'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>ข้อมูลครูผู้จัดทำ (Author Metadata)</small>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <AdminIcon name="teacher" size={16} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{inspectTarget.creatorName}</span>
                  {inspectTarget.creatorSchool && (
                    <span style={{ fontSize: 12, color: '#64748b' }}>({inspectTarget.creatorSchool})</span>
                  )}
                </div>
                {inspectTarget.creatorEmail && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, marginLeft: 24 }}>
                    อีเมลติดต่อ: {inspectTarget.creatorEmail}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, marginLeft: 24 }}>
                  สร้างเมื่อ: {formatDate(inspectTarget.createdAt)} | ปรับปรุงล่าสุด: {formatDate(inspectTarget.updatedAt)}
                </div>
              </div>

              <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 12, color: '#166534' }}>
                <strong>แนวทางการกำกับดูแลสำหรับแอดมิน:</strong>
                <p style={{ marginTop: 4, lineHeight: 1.4 }}>
                  หากเนื้อหามีความถูกต้องตามมาตรฐานวิชาการการโรงแรมและการจัดโต๊ะอาหาร FINE Model สามารถเปิดสถานะเป็น &quot;เผยแพร่แล้ว&quot; เพื่อให้นักเรียนเข้าถึงได้ทันที หรือหากต้องการให้ครูปรับปรุงเนื้อหา สามารถคลิก &quot;สลับเป็นฉบับร่าง&quot; ได้
                </p>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setInspectTarget(null)} disabled={Boolean(busyAction)}>
                  ปิดหน้าต่าง
                </button>
                <button
                  className={inspectTarget.status === 'published' ? styles.outlineButton : styles.primaryButton}
                  type="button"
                  onClick={() => void toggleStatus(inspectTarget)}
                  disabled={Boolean(busyAction)}
                >
                  <AdminIcon name={inspectTarget.status === 'published' ? 'eyeOff' : 'check'} size={15} />
                  <span>{inspectTarget.status === 'published' ? 'ระงับเป็นฉบับร่าง' : 'อนุมัติเผยแพร่'}</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          onMouseDown={event => { if (event.target === event.currentTarget && !busyAction) setDeleteTarget(null) }}
        >
          <section className={`${styles.modal} ${styles.confirmModal}`} role="alertdialog" aria-modal="true" aria-labelledby="delete-content-title">
            <div className={styles.confirmIcon}><AdminIcon name="trash" size={22} /></div>
            <h2 id="delete-content-title">ยืนยันการลบเนื้อหาที่ไม่เหมาะสม</h2>
            <p>รายการ “{deleteTarget.name}” จะถูกนำออกจากระบบอย่างถาวรตามนโยบายกำกับดูแล</p>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={Boolean(busyAction)}>ยกเลิก</button>
              <button className={styles.dangerButton} type="button" onClick={() => void handleDelete()} disabled={Boolean(busyAction)}>
                {busyAction ? 'กำลังลบ...' : 'ยืนยันลบเนื้อหา'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
