'use client'

import { FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import AdminIcon from '@/components/admin/AdminIcon'
import { confirmAction } from '@/components/AppConfirmDialog'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import styles from '../management.module.css'

type VocabularyItem = {
  id: string
  nameEn: string
  nameTh: string
  category: string
  categoryTh: string
  pronounce: string
  useDesc: string
  sentence: string
  glbUrl: string
  usdzUrl: string
  createdAt: string
  updatedAt: string
}

type VocabularyForm = Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt'>
const emptyForm: VocabularyForm = { nameEn: '', nameTh: '', category: 'tableware', categoryTh: 'อุปกรณ์บนโต๊ะอาหาร', pronounce: '', useDesc: '', sentence: '', glbUrl: '', usdzUrl: '' }

async function responseError(response: Response) {
  try { return ((await response.json()) as { error?: string }).error || 'ไม่สามารถดำเนินการได้' } catch { return 'ไม่สามารถดำเนินการได้' }
}

export default function TeacherVocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VocabularyForm>(emptyForm)
  const [busy, setBusy] = useState<string | null>(null)

  const loadItems = useCallback(async (signal?: AbortSignal) => {
    const response = await authenticatedFetch('/api/teacher/vocabulary', { cache: 'no-store', signal })
    if (!response.ok) throw new Error(await responseError(response))
    const payload = await response.json() as { vocabulary?: VocabularyItem[] }
    setItems(payload.vocabulary ?? [])
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void loadItems(controller.signal).then(() => setError('')).catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') setError(loadError.message)
      }).finally(() => setLoading(false))
    }, 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [loadItems])

  const categories = useMemo(() => Array.from(new Map(items.map(item => [item.category, item.categoryTh])).entries()).sort((a, b) => a[1].localeCompare(b[1], 'th')), [items])
  const visibleItems = useMemo(() => {
    const keyword = deferredSearch.trim().toLocaleLowerCase('th-TH')
    return items.filter(item => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      return !keyword || [item.nameEn, item.nameTh, item.pronounce, item.useDesc, item.sentence].some(value => value?.toLocaleLowerCase('th-TH').includes(keyword))
    })
  }, [categoryFilter, deferredSearch, items])

  const modelsCount = items.filter(item => item.glbUrl || item.usdzUrl).length
  const completeCount = items.filter(item => item.pronounce && item.sentence && item.useDesc).length
  const summary = [
    { key: 'green', label: 'คำศัพท์ทั้งหมด', value: items.length, detail: 'รายการในคลังส่วนกลาง', icon: 'content' as const },
    { key: 'blue', label: 'หมวดหมู่', value: categories.length, detail: 'จัดกลุ่มเพื่อค้นหาเร็วขึ้น', icon: 'archive' as const },
    { key: 'gold', label: 'ข้อมูลครบถ้วน', value: completeCount, detail: 'มีคำอ่าน การใช้ และประโยค', icon: 'check' as const },
    { key: 'purple', label: 'เชื่อมโมเดล 3D', value: modelsCount, detail: 'มีไฟล์ GLB หรือ USDZ', icon: 'cube' as const },
  ]

  async function refresh() {
    setRefreshing(true)
    try { await loadItems(); setError(''); toast.success('อัปเดตคลังคำศัพท์แล้ว') }
    catch (refreshError) { setError(refreshError instanceof Error ? refreshError.message : 'โหลดข้อมูลไม่สำเร็จ') }
    finally { setRefreshing(false) }
  }

  function openCreate() { setEditingId(null); setForm(emptyForm); setEditorOpen(true) }
  function openEdit(item: VocabularyItem) {
    setEditingId(item.id)
    setForm({ nameEn: item.nameEn, nameTh: item.nameTh, category: item.category, categoryTh: item.categoryTh, pronounce: item.pronounce || '', useDesc: item.useDesc || '', sentence: item.sentence || '', glbUrl: item.glbUrl || '', usdzUrl: item.usdzUrl || '' })
    setEditorOpen(true)
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy('save')
    try {
      const response = await authenticatedFetch('/api/teacher/vocabulary', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...(editingId ? { id: editingId } : {}), ...form }) })
      if (!response.ok) throw new Error(await responseError(response))
      const payload = await response.json() as { item: VocabularyItem }
      setItems(current => editingId ? current.map(item => item.id === editingId ? payload.item : item) : [payload.item, ...current])
      setEditorOpen(false)
      toast.success(editingId ? 'บันทึกการแก้ไขคำศัพท์แล้ว' : 'เพิ่มคำศัพท์แล้ว', { description: payload.item.nameEn })
    } catch (saveError) { toast.error(saveError instanceof Error ? saveError.message : 'บันทึกคำศัพท์ไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  async function remove(item: VocabularyItem) {
    const confirmed = await confirmAction({ title: 'ลบคำศัพท์นี้?', description: `คำศัพท์ “${item.nameEn}” จะถูกนำออกจากคลังส่วนกลาง`, confirmText: 'ลบคำศัพท์', tone: 'danger' })
    if (!confirmed) return
    setBusy(`delete:${item.id}`)
    try {
      const response = await authenticatedFetch(`/api/teacher/vocabulary?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await responseError(response))
      setItems(current => current.filter(candidate => candidate.id !== item.id))
      toast.success('ลบคำศัพท์แล้ว')
    } catch (deleteError) { toast.error(deleteError instanceof Error ? deleteError.message : 'ลบคำศัพท์ไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  function update<Key extends keyof VocabularyForm>(key: Key, value: VocabularyForm[Key]) { setForm(current => ({ ...current, [key]: value })) }

  return <main className={styles.page}>
    <header className={styles.pageHeader}><div><p>VOCABULARY LIBRARY</p><h1>คลังคำศัพท์วิชาชีพ</h1><span>จัดหมวดหมู่คำศัพท์ คำอ่าน ประโยค และโมเดลประกอบสำหรับกิจกรรม AI Scan</span></div><div className={styles.headerActions}><button className={styles.secondaryButton} type="button" onClick={() => void refresh()} disabled={refreshing}><AdminIcon name="refresh" size={16} />{refreshing ? 'กำลังอัปเดต' : 'อัปเดตข้อมูล'}</button><button className={styles.primaryButton} type="button" onClick={openCreate}><AdminIcon name="plus" size={16} />เพิ่มคำศัพท์</button></div></header>
    {error && <div className={styles.error}><AdminIcon name="activity" size={17} /><span>{error}</span><button type="button" onClick={() => void refresh()}>ลองอีกครั้ง</button></div>}
    <section className={styles.metrics}>{summary.map(item => <article className={styles.metricCard} data-tone={item.key} key={item.label}><span className={styles.metricIcon}><AdminIcon name={item.icon} size={20} /></span><span><small>{item.label}</small><strong>{loading ? '—' : item.value}</strong><span>{item.detail}</span></span></article>)}</section>
    <section className={styles.workspace}>
      <header className={styles.workspaceHeader}><div><h2>รายการคำศัพท์</h2><p>{visibleItems.length} รายการจากตัวกรองปัจจุบัน</p></div><div className={styles.filters}><label className={styles.searchBox}><AdminIcon name="search" size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาคำศัพท์ คำแปล หรือประโยค" aria-label="ค้นหาคำศัพท์" /></label><label className={styles.selectBox}><AdminIcon name="archive" size={15} /><select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} aria-label="กรองหมวดหมู่"><option value="all">ทุกหมวดหมู่</option>{categories.map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label></div></header>
      <div className={styles.dataList}>{loading ? Array.from({ length: 6 }).map((_, index) => <div className={styles.rowSkeleton} key={index} />) : visibleItems.length ? visibleItems.map(item => <article className={styles.dataRow} key={item.id}>
        <span className={styles.wordMark}>{item.nameEn.slice(0, 2).toUpperCase()}</span><div className={styles.wordIdentity}><small>{item.categoryTh}</small><h3>{item.nameEn}</h3><strong>{item.nameTh}</strong></div><div className={styles.wordPronounce}><small>คำอ่าน</small><strong>{item.pronounce || 'ยังไม่ระบุ'}</strong></div><div className={styles.wordUsage}><small>ตัวอย่างการใช้</small><p>{item.sentence || item.useDesc || 'ยังไม่มีตัวอย่างการใช้'}</p></div><span className={item.glbUrl || item.usdzUrl ? styles.modelBadge : styles.neutralBadge}><AdminIcon name="cube" size={13} />{item.glbUrl || item.usdzUrl ? 'มีโมเดล' : 'ไม่มีโมเดล'}</span><div className={styles.rowActions}><button type="button" onClick={() => openEdit(item)}><AdminIcon name="edit" size={16} /></button><button className={styles.dangerIconButton} type="button" onClick={() => void remove(item)} disabled={Boolean(busy)}><AdminIcon name="trash" size={16} /></button></div>
      </article>) : <div className={styles.emptyState}><span><AdminIcon name="content" size={25} /></span><h3>ไม่พบคำศัพท์</h3><p>{items.length ? 'ลองเปลี่ยนคำค้นหรือหมวดหมู่' : 'เพิ่มคำศัพท์แรกเพื่อเริ่มสร้างคลังการเรียนรู้'}</p>{!items.length && <button type="button" onClick={openCreate}><AdminIcon name="plus" size={16} />เพิ่มคำศัพท์แรก</button>}</div>}</div>
    </section>
    {editorOpen && <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !busy && setEditorOpen(false)}><section className={styles.modal} role="dialog" aria-modal="true"><header className={styles.modalHeader}><span><AdminIcon name={editingId ? 'edit' : 'plus'} size={21} /></span><div><h2>{editingId ? 'แก้ไขคำศัพท์' : 'เพิ่มคำศัพท์ใหม่'}</h2><p>ข้อมูลจะใช้ร่วมกับบทเรียน AR และกิจกรรม AI Scan</p></div><button type="button" onClick={() => setEditorOpen(false)}><AdminIcon name="close" size={18} /></button></header><form onSubmit={save}><div className={styles.formGrid}><label><span>คำศัพท์ภาษาอังกฤษ *</span><input autoFocus required value={form.nameEn} onChange={event => update('nameEn', event.target.value)} /></label><label><span>คำแปลภาษาไทย *</span><input required value={form.nameTh} onChange={event => update('nameTh', event.target.value)} /></label><label><span>รหัสหมวดหมู่ *</span><input required value={form.category} onChange={event => update('category', event.target.value)} placeholder="tableware" /></label><label><span>ชื่อหมวดหมู่ *</span><input required value={form.categoryTh} onChange={event => update('categoryTh', event.target.value)} /></label><label><span>คำอ่าน</span><input value={form.pronounce} onChange={event => update('pronounce', event.target.value)} /></label><label className={styles.fullField}><span>คำอธิบายการใช้งาน</span><textarea rows={3} value={form.useDesc} onChange={event => update('useDesc', event.target.value)} /></label><label className={styles.fullField}><span>ประโยคตัวอย่าง</span><input value={form.sentence} onChange={event => update('sentence', event.target.value)} /></label><label><span>URL ไฟล์ GLB</span><input value={form.glbUrl} onChange={event => update('glbUrl', event.target.value)} /></label><label><span>URL ไฟล์ USDZ</span><input value={form.usdzUrl} onChange={event => update('usdzUrl', event.target.value)} /></label></div><footer className={styles.modalFooter}><button type="button" onClick={() => setEditorOpen(false)}>ยกเลิก</button><button className={styles.primaryButton} type="submit" disabled={busy === 'save'}><AdminIcon name={busy === 'save' ? 'clock' : 'check'} size={16} />{busy === 'save' ? 'กำลังบันทึก' : 'บันทึกคำศัพท์'}</button></footer></form></section></div>}
  </main>
}
