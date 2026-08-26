'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
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
}

interface ContentRecord {
  id: string
  content_type: ContentType
  name_th: string
  name_en: string
  unit_label: string
  status: ContentStatus
}

interface ContentForm {
  name: string
  nameEn: string
  type: ContentType
  unit: string
  status: ContentStatus
}

const emptyForm: ContentForm = {
  name: '',
  nameEn: '',
  type: 'AR Object',
  unit: 'Unit 1',
  status: 'draft',
}

const typeConfig: Record<ContentType, { label: string; icon: AdminIconName; tone: string }> = {
  'AR Object': { label: 'โมเดล AR', icon: 'cube', tone: 'blue' },
  'AI Scan': { label: 'AI Scan', icon: 'scan', tone: 'purple' },
  Simulation: { label: 'สถานการณ์จำลอง', icon: 'activity', tone: 'orange' },
  Lesson: { label: 'บทเรียน', icon: 'course', tone: 'green' },
}

const tabs: Array<{ key: ContentTab; label: string }> = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'AR Object', label: 'โมเดล AR' },
  { key: 'AI Scan', label: 'AI Scan' },
  { key: 'Simulation', label: 'สถานการณ์จำลอง' },
  { key: 'Lesson', label: 'บทเรียน' },
]

function mapContent(record: ContentRecord): ContentItem {
  return {
    id: record.id,
    type: record.content_type,
    name: record.name_th,
    nameEn: record.name_en,
    unit: record.unit_label,
    status: record.status,
  }
}

async function getResponseError(response: Response) {
  try {
    const payload = await response.json() as { error?: string }
    if (payload.error) return payload.error
  } catch {
    // Fall back to the message below when an upstream response is not JSON.
  }
  return 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง'
}

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [activeTab, setActiveTab] = useState<ContentTab>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ContentForm>(emptyForm)
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
      setFormOpen(false)
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
      const matchesSearch = !keyword
        || item.name.toLocaleLowerCase('th-TH').includes(keyword)
        || item.nameEn.toLocaleLowerCase('en-US').includes(keyword)
        || item.unit.toLocaleLowerCase('en-US').includes(keyword)
      return matchesTab && matchesSearch
    })
  }, [activeTab, items, search])

  const metrics = [
    { key: 'all', label: 'เนื้อหาทั้งหมด', value: counts.all, detail: 'ทุกประเภทในระบบ', icon: 'content' as const, tone: 'blue' },
    { key: 'ar', label: 'โมเดล AR', value: counts['AR Object'], detail: 'วัตถุสามมิติสำหรับเรียนรู้', icon: 'cube' as const, tone: 'purple' },
    { key: 'published', label: 'เผยแพร่แล้ว', value: counts.published, detail: 'พร้อมให้ผู้เรียนใช้งาน', icon: 'check' as const, tone: 'green' },
    { key: 'draft', label: 'ฉบับร่าง', value: counts.draft, detail: 'รอตรวจสอบก่อนเผยแพร่', icon: 'edit' as const, tone: 'gold' },
  ]

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(item: ContentItem) {
    setEditingId(item.id)
    setForm({ name: item.name, nameEn: item.nameEn, type: item.type, unit: item.unit, status: item.status })
    setFormOpen(true)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanForm = { ...form, name: form.name.trim(), nameEn: form.nameEn.trim(), unit: form.unit.trim() }
    if (!cleanForm.name || !cleanForm.nameEn || !cleanForm.unit) return

    const actionKey = editingId ? `update:${editingId}` : 'create'
    setBusyAction(actionKey)
    try {
      const response = await authenticatedFetch('/api/admin/content', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, action: 'update', ...cleanForm } : cleanForm),
      })
      if (!response.ok) throw new Error(await getResponseError(response))
      const payload = await response.json() as { item: ContentRecord }
      const savedItem = mapContent(payload.item)
      setItems(current => editingId
        ? current.map(item => item.id === editingId ? savedItem : item)
        : [savedItem, ...current])
      setActiveTab('all')
      setFormOpen(false)
      setEditingId(null)
      setForm(emptyForm)
      toast.success(editingId ? 'บันทึกการแก้ไขเนื้อหาแล้ว' : 'สร้างเนื้อหาใหม่แล้ว')
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'ไม่สามารถบันทึกเนื้อหาได้')
    } finally {
      setBusyAction(null)
    }
  }

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
      setItems(current => current.map(currentItem => currentItem.id === item.id ? updatedItem : currentItem))
      toast.success(updatedItem.status === 'published' ? `เผยแพร่ ${item.name} แล้ว` : `ย้าย ${item.name} กลับเป็นฉบับร่างแล้ว`)
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
      toast.success(`ลบ ${deleteTarget.name} ออกจากคลังแล้ว`)
      setDeleteTarget(null)
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
          <p>CONTENT LIBRARY</p>
          <h1>จัดการเนื้อหาการเรียนรู้</h1>
          <span>ดูแลโมเดล AR, AI Scan, สถานการณ์จำลอง และบทเรียนจากจุดเดียว</span>
        </div>
        <button className={styles.primaryButton} type="button" onClick={openCreate} disabled={Boolean(busyAction)}>
          <AdminIcon name="plus" size={16} />
          <span>สร้างเนื้อหา</span>
        </button>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => { setError(''); setLoading(true); void loadContent().catch(retryError => setError(retryError instanceof Error ? retryError.message : 'โหลดข้อมูลไม่สำเร็จ')).finally(() => setLoading(false)) }}>ลองใหม่</button>
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
          <div><h2>{tabs.find(tab => tab.key === activeTab)?.label}</h2><p>{visibleItems.length.toLocaleString('th-TH')} รายการที่แสดง</p></div>
          <label className={styles.searchBox}>
            <AdminIcon name="search" size={17} />
            <span className={styles.srOnly}>ค้นหาเนื้อหา</span>
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาชื่อหรือหน่วยเรียน" />
          </label>
        </div>

        <div className={styles.dataList} aria-busy={loading}>
          <div className={`${styles.listHeader} ${styles.contentGrid}`} aria-hidden="true">
            <span>เนื้อหา</span><span>ประเภท</span><span>หน่วยเรียน</span><span>สถานะ</span><span>จัดการ</span>
          </div>
          {loading ? (
            <div className={styles.emptyState}><span><AdminIcon name="refresh" size={24} /></span><h3>กำลังโหลดคลังเนื้อหา</h3><p>ระบบกำลังอ่านข้อมูลจาก PostgreSQL</p></div>
          ) : visibleItems.length === 0 ? (
            <div className={styles.emptyState}><span><AdminIcon name="search" size={24} /></span><h3>ไม่พบเนื้อหาที่ตรงกับเงื่อนไข</h3><p>ลองเปลี่ยนประเภทหรือคำค้นหา</p></div>
          ) : visibleItems.map(item => {
            const config = typeConfig[item.type]
            const isBusy = busyAction?.endsWith(item.id) ?? false
            return (
              <article className={`${styles.dataRow} ${styles.contentGrid}`} data-tone={config.tone} key={item.id}>
                <div className={styles.itemIdentity}>
                  <span className={styles.itemIcon}><AdminIcon name={config.icon} size={18} /></span>
                  <span><strong>{item.name}</strong><small>{item.nameEn}</small></span>
                </div>
                <span className={styles.typeBadge} data-tone={config.tone}>{config.label}</span>
                <span className={styles.unitLabel}>{item.unit}</span>
                <button className={styles.statusButton} data-status={item.status} type="button" onClick={() => void toggleStatus(item)} disabled={isBusy}>
                  {item.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                </button>
                <div className={styles.rowActions}>
                  <button className={styles.iconButton} type="button" title="แก้ไข" aria-label={`แก้ไข ${item.name}`} onClick={() => openEdit(item)} disabled={isBusy}><AdminIcon name="edit" size={15} /></button>
                  <button className={styles.iconButtonDanger} type="button" title="ลบ" aria-label={`ลบ ${item.name}`} onClick={() => setDeleteTarget(item)} disabled={isBusy}><AdminIcon name="trash" size={15} /></button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {formOpen && (
        <div className={`${styles.modalOverlay} ${styles.compactOverlay}`} onMouseDown={event => { if (event.target === event.currentTarget && !busyAction) setFormOpen(false) }}>
          <section className={`${styles.modal} ${styles.compactModal}`} role="dialog" aria-modal="true" aria-labelledby="content-form-title">
            <div className={styles.modalHeader}>
              <span><AdminIcon name={editingId ? 'edit' : 'plus'} size={20} /></span>
              <div><h2 id="content-form-title">{editingId ? 'แก้ไขเนื้อหา' : 'สร้างเนื้อหาใหม่'}</h2><p>กำหนดรายละเอียด หมวดหมู่ และสถานะการเผยแพร่</p></div>
              <button type="button" aria-label="ปิดหน้าต่าง" onClick={() => setFormOpen(false)} disabled={Boolean(busyAction)}><AdminIcon name="close" size={18} /></button>
            </div>
            <form className={`${styles.modalForm} ${styles.compactForm}`} onSubmit={handleSave}>
              <div className={styles.formGrid}>
                <label><span>ชื่อเนื้อหาภาษาไทย</span><input autoFocus required maxLength={200} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="เช่น แก้วเชมเปญ" /></label>
                <label><span>ชื่อภาษาอังกฤษ</span><input required maxLength={200} value={form.nameEn} onChange={event => setForm(current => ({ ...current, nameEn: event.target.value }))} placeholder="Champagne Flute Glass" /></label>
              </div>
              <div className={`${styles.formGrid} ${styles.formGridThree}`}>
                <label><span>ประเภท</span><select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value as ContentType }))}>{Object.keys(typeConfig).map(type => <option value={type} key={type}>{typeConfig[type as ContentType].label}</option>)}</select></label>
                <label><span>หน่วยเรียน</span><select value={form.unit} onChange={event => setForm(current => ({ ...current, unit: event.target.value }))}>{['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4'].map(unit => <option value={unit} key={unit}>{unit}</option>)}</select></label>
                <label><span>สถานะ</span><select value={form.status} onChange={event => setForm(current => ({ ...current, status: event.target.value as ContentStatus }))}><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่</option></select></label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setFormOpen(false)} disabled={Boolean(busyAction)}>ยกเลิก</button>
                <button className={styles.primaryButton} type="submit" disabled={Boolean(busyAction)}><AdminIcon name={busyAction ? 'clock' : 'check'} size={15} />{busyAction ? 'กำลังบันทึก' : editingId ? 'บันทึกการแก้ไข' : 'สร้างเนื้อหา'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className={styles.modalOverlay} onMouseDown={event => { if (event.target === event.currentTarget && !busyAction) setDeleteTarget(null) }}>
          <section className={`${styles.modal} ${styles.confirmModal}`} role="alertdialog" aria-modal="true" aria-labelledby="delete-content-title">
            <div className={styles.confirmIcon}><AdminIcon name="trash" size={22} /></div>
            <h2 id="delete-content-title">ยืนยันการลบเนื้อหา</h2>
            <p>รายการ “{deleteTarget.name}” จะถูกนำออกจากคลังเนื้อหาอย่างถาวร</p>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={Boolean(busyAction)}>ยกเลิก</button>
              <button className={styles.dangerButton} type="button" onClick={() => void handleDelete()} disabled={Boolean(busyAction)}>{busyAction ? 'กำลังลบ' : 'ลบเนื้อหา'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
