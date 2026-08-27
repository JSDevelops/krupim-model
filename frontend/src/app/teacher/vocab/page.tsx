'use client'

import { ChangeEvent, FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
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
  imageUrl: string
  glbUrl: string
  usdzUrl: string
  createdAt: string
  updatedAt: string
}

type VocabularyForm = Omit<VocabularyItem, 'id' | 'createdAt' | 'updatedAt'>

const CATEGORY_PRESETS: Array<{ key: string; label: string }> = [
  { key: 'tableware', label: 'เครื่องใช้บนโต๊ะอาหาร' },
  { key: 'cutlery', label: 'เครื่องเงินและช้อนส้อม' },
  { key: 'glassware', label: 'เครื่องแก้ว' },
  { key: 'linen', label: 'เครื่องลินิน' },
  { key: 'condiments', label: 'อุปกรณ์เครื่องปรุง' },
  { key: 'service', label: 'อุปกรณ์บริการอาหาร' },
  { key: 'beverage', label: 'อุปกรณ์บริการเครื่องดื่ม' },
  { key: 'gueridon', label: 'อุปกรณ์บริการด้วยรถเข็น' },
  { key: 'accessories', label: 'อุปกรณ์จัดโต๊ะอาหาร' },
  { key: 'side_station', label: 'อุปกรณ์สถานีบริการ' },
]

const emptyForm: VocabularyForm = {
  nameEn: '',
  nameTh: '',
  category: 'tableware',
  categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
  pronounce: '',
  useDesc: '',
  sentence: '',
  imageUrl: '',
  glbUrl: '',
  usdzUrl: ''
}

async function responseError(response: Response) {
  try {
    return ((await response.json()) as { error?: string }).error || 'ไม่สามารถดำเนินการได้'
  } catch {
    return 'ไม่สามารถดำเนินการได้'
  }
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
  const [uploadingField, setUploadingField] = useState<'imageUrl' | 'glbUrl' | 'usdzUrl' | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

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
  const imageCount = items.filter(item => item.imageUrl).length
  const completeCount = items.filter(item => item.pronounce && item.sentence && item.useDesc).length
  const summary = [
    { key: 'green', label: 'คำศัพท์ทั้งหมด', value: items.length, detail: 'รายการในคลังส่วนกลาง', icon: 'content' as const },
    { key: 'blue', label: 'หมวดหมู่', value: categories.length, detail: 'จัดกลุ่มเพื่อค้นหาเร็วขึ้น', icon: 'archive' as const },
    { key: 'gold', label: 'มีรูปภาพประกอบ', value: imageCount, detail: 'รองรับไฟล์ PNG / JPEG', icon: 'eye' as const },
    { key: 'purple', label: 'เชื่อมโมเดล 3D', value: modelsCount, detail: 'มีไฟล์ GLB หรือ USDZ', icon: 'cube' as const },
  ]

  function playPronunciation(item: VocabularyItem) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    if (playingId === item.id) {
      setPlayingId(null)
      return
    }
    const utterance = new SpeechSynthesisUtterance(item.nameEn)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    utterance.onend = () => setPlayingId(null)
    utterance.onerror = () => setPlayingId(null)
    setPlayingId(item.id)
    window.speechSynthesis.speak(utterance)
  }

  async function refresh() {
    setRefreshing(true)
    try {
      await loadItems()
      setError('')
      toast.success('อัปเดตคลังคำศัพท์แล้ว')
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setRefreshing(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setEditorOpen(true)
  }

  function openEdit(item: VocabularyItem) {
    setEditingId(item.id)
    setForm({
      nameEn: item.nameEn,
      nameTh: item.nameTh,
      category: item.category,
      categoryTh: item.categoryTh,
      pronounce: item.pronounce || '',
      useDesc: item.useDesc || '',
      sentence: item.sentence || '',
      imageUrl: item.imageUrl || '',
      glbUrl: item.glbUrl || '',
      usdzUrl: item.usdzUrl || ''
    })
    setEditorOpen(true)
  }

  function selectCategoryPreset(key: string) {
    const found = CATEGORY_PRESETS.find(p => p.key === key)
    if (found) {
      setForm(current => ({ ...current, category: found.key, categoryTh: found.label }))
    }
  }

  function update<Key extends keyof VocabularyForm>(key: Key, value: VocabularyForm[Key]) {
    setForm(current => ({ ...current, [key]: value }))
  }

function processImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('กรุณาเลือกไฟล์รูปภาพ (PNG, JPEG, WebP)'))
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error('ไฟล์ต้นฉบับต้องมีขนาดไม่เกิน 12 MB'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('อ่านไฟล์รูปภาพไม่สำเร็จ'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('รูปภาพไม่ถูกต้อง'))
      img.onload = () => {
        const maxDimension = 800
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(String(reader.result))
          return
        }
        if (file.type === 'image/png') {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/png'))
        } else {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/webp', 0.88))
        }
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'glbUrl' | 'usdzUrl') {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingField(field)
    try {
      if (field === 'imageUrl') {
        const dataUrl = await processImageToDataUrl(file)
        update('imageUrl', dataUrl)
        toast.success(`บันทึกรูปภาพ "${file.name}" พร้อมเก็บในฐานข้อมูลเรียบร้อย`)
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await authenticatedFetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'การอัปโหลดไฟล์ล้มเหลว')
      }

      const data = await response.json() as { url: string; originalName: string }
      update(field, data.url)
      toast.success(`อัปโหลดไฟล์ "${file.name}" เรียบร้อยแล้ว`)
    } catch (err: any) {
      toast.error(err.message || 'ไม่สามารถอัปโหลดไฟล์ได้')
    } finally {
      setUploadingField(null)
      event.target.value = ''
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy('save')
    try {
      const response = await authenticatedFetch('/api/teacher/vocabulary', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editingId ? { id: editingId } : {}), ...form })
      })
      if (!response.ok) throw new Error(await responseError(response))
      const payload = await response.json() as { item: VocabularyItem }
      setItems(current => editingId ? current.map(item => item.id === editingId ? payload.item : item) : [payload.item, ...current])
      setEditorOpen(false)
      toast.success(editingId ? 'บันทึกการแก้ไขคำศัพท์แล้ว' : 'เพิ่มคำศัพท์แล้ว', { description: payload.item.nameEn })
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'บันทึกคำศัพท์ไม่สำเร็จ')
    } finally {
      setBusy(null)
    }
  }

  async function remove(item: VocabularyItem) {
    const confirmed = await confirmAction({
      title: 'ลบคำศัพท์นี้?',
      description: `คำศัพท์ “${item.nameEn}” จะถูกนำออกจากคลังส่วนกลาง`,
      confirmText: 'ลบคำศัพท์',
      tone: 'danger'
    })
    if (!confirmed) return
    setBusy(`delete:${item.id}`)
    try {
      const response = await authenticatedFetch(`/api/teacher/vocabulary?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await responseError(response))
      setItems(current => current.filter(candidate => candidate.id !== item.id))
      toast.success('ลบคำศัพท์แล้ว')
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'ลบคำศัพท์ไม่สำเร็จ')
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p>VOCABULARY LIBRARY</p>
          <h1>คลังคำศัพท์วิชาชีพ</h1>
          <span>จัดหมวดหมู่คำศัพท์ คำอ่าน ประโยค และอัปโหลดไฟล์ประกอบ (รูปภาพ, GLB, USDZ)</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} type="button" onClick={() => void refresh()} disabled={refreshing}>
            <AdminIcon name="refresh" size={16} />
            {refreshing ? 'กำลังอัปเดต' : 'อัปเดตข้อมูล'}
          </button>
          <button className={styles.primaryButton} type="button" onClick={openCreate}>
            <AdminIcon name="plus" size={16} />
            เพิ่มคำศัพท์
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.error}>
          <AdminIcon name="activity" size={17} />
          <span>{error}</span>
          <button type="button" onClick={() => void refresh()}>ลองอีกครั้ง</button>
        </div>
      )}

      <section className={styles.metrics}>
        {summary.map(item => (
          <article className={styles.metricCard} data-tone={item.key} key={item.label}>
            <span className={styles.metricIcon}><AdminIcon name={item.icon} size={20} /></span>
            <span>
              <small>{item.label}</small>
              <strong>{loading ? '—' : item.value}</strong>
              <span>{item.detail}</span>
            </span>
          </article>
        ))}
      </section>

      <section className={styles.workspace}>
        <header className={styles.workspaceHeader}>
          <div>
            <h2>รายการคำศัพท์</h2>
            <p>{visibleItems.length} รายการจากตัวกรองปัจจุบัน</p>
          </div>
          <div className={styles.filters}>
            <label className={styles.searchBox}>
              <AdminIcon name="search" size={16} />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาคำศัพท์ คำแปล หรือประโยค" aria-label="ค้นหาคำศัพท์" />
            </label>
            <label className={styles.selectBox}>
              <AdminIcon name="archive" size={15} />
              <select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} aria-label="กรองหมวดหมู่">
                <option value="all">ทุกหมวดหมู่ ({items.length})</option>
                {categories.map(([key, label]) => (
                  <option value={key} key={key}>{label} ({items.filter(i => i.category === key).length})</option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <div className={styles.dataList}>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <div className={styles.rowSkeleton} key={index} />)
          ) : visibleItems.length ? (
            visibleItems.map(item => (
              <article className={styles.dataRow} key={item.id}>
                {item.imageUrl ? (
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      backgroundImage: `url("${item.imageUrl}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '1px solid #c8dcd0',
                      flexShrink: 0
                    }}
                    title={item.nameEn}
                  />
                ) : (
                  <span className={styles.wordMark}>{item.nameEn.slice(0, 2).toUpperCase()}</span>
                )}
                
                <div className={styles.wordIdentity}>
                  <small>{item.categoryTh}</small>
                  <h3>{item.nameEn}</h3>
                  <strong>{item.nameTh}</strong>
                </div>

                <div className={styles.wordPronounce}>
                  <small>คำอ่าน</small>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong>{item.pronounce || 'ยังไม่ระบุ'}</strong>
                    <button 
                      type="button" 
                      onClick={() => playPronunciation(item)} 
                      title="ฟังเสียงอ่านภาษาอังกฤษ"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 15, padding: '2px 4px' }}
                    >
                      {playingId === item.id ? '⏹️' : '🔊'}
                    </button>
                  </div>
                </div>

                <div className={styles.wordUsage}>
                  <small>ตัวอย่างการใช้</small>
                  <p>{item.sentence || item.useDesc || 'ยังไม่มีตัวอย่างการใช้'}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.imageUrl && (
                    <span className={styles.readyBadge} title="มีรูปภาพ">
                      🖼️ รูปภาพ
                    </span>
                  )}
                  <span className={item.glbUrl || item.usdzUrl ? styles.modelBadge : styles.neutralBadge}>
                    <AdminIcon name="cube" size={13} />
                    {item.glbUrl && item.usdzUrl ? 'GLB+USDZ' : item.glbUrl ? 'GLB' : item.usdzUrl ? 'USDZ' : 'ไม่มี 3D'}
                  </span>
                </div>

                <div className={styles.rowActions}>
                  <button type="button" onClick={() => openEdit(item)} title="แก้ไขคำศัพท์">
                    <AdminIcon name="edit" size={16} />
                  </button>
                  <button className={styles.dangerIconButton} type="button" onClick={() => void remove(item)} disabled={Boolean(busy)} title="ลบคำศัพท์">
                    <AdminIcon name="trash" size={16} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className={styles.emptyState}>
              <span><AdminIcon name="content" size={25} /></span>
              <h3>ไม่พบคำศัพท์</h3>
              <p>{items.length ? 'ลองเปลี่ยนคำค้นหรือหมวดหมู่' : 'เพิ่มคำศัพท์แรกเพื่อเริ่มสร้างคลังการเรียนรู้'}</p>
              {!items.length && (
                <button type="button" onClick={openCreate}><AdminIcon name="plus" size={16} />เพิ่มคำศัพท์แรก</button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Create / Edit Vocabulary Modal */}
      {editorOpen && (
        <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !busy && setEditorOpen(false)}>
          <section className={styles.modal} role="dialog" aria-modal="true" style={{ width: 'min(760px, 100%)' }}>
            <header className={styles.modalHeader}>
              <span><AdminIcon name={editingId ? 'edit' : 'plus'} size={21} /></span>
              <div>
                <h2>{editingId ? 'แก้ไขคำศัพท์' : 'เพิ่มคำศัพท์ใหม่'}</h2>
                <p>ข้อมูลและไฟล์ที่อัปโหลดจะใช้ร่วมกับบทเรียน AR 3D และกิจกรรม AI Scan</p>
              </div>
              <button type="button" onClick={() => setEditorOpen(false)}><AdminIcon name="close" size={18} /></button>
            </header>

            <form onSubmit={save}>
              <div className={styles.formGrid}>
                {/* 1. Basic Text Information */}
                <label>
                  <span>คำศัพท์ภาษาอังกฤษ *</span>
                  <input autoFocus required value={form.nameEn} onChange={event => update('nameEn', event.target.value)} placeholder="เช่น Water Goblet" />
                </label>

                <label>
                  <span>คำแปลภาษาไทย *</span>
                  <input required value={form.nameTh} onChange={event => update('nameTh', event.target.value)} placeholder="เช่น แก้วน้ำเปล่า" />
                </label>

                <label className={styles.fullField}>
                  <span>เลือกหมวดหมู่มาตรฐาน</span>
                  <select onChange={e => selectCategoryPreset(e.target.value)} value={form.category}>
                    {CATEGORY_PRESETS.map(p => <option key={p.key} value={p.key}>{p.label} ({p.key})</option>)}
                  </select>
                </label>

                <label>
                  <span>รหัสหมวดหมู่ (Category Key) *</span>
                  <input required value={form.category} onChange={event => update('category', event.target.value)} placeholder="tableware" />
                </label>

                <label>
                  <span>ชื่อหมวดหมู่ภาษาไทย *</span>
                  <input required value={form.categoryTh} onChange={event => update('categoryTh', event.target.value)} placeholder="เครื่องใช้บนโต๊ะอาหาร" />
                </label>

                <label className={styles.fullField}>
                  <span>คำอ่าน / สัทอักษร (Phonetics)</span>
                  <input value={form.pronounce} onChange={event => update('pronounce', event.target.value)} placeholder="เช่น /ˈwɔːtər ˈɡɒblət/ หรือ วอ-เทอะ กอบ-เลิท" />
                </label>

                <label className={styles.fullField}>
                  <span>คำอธิบายการใช้งาน (Use Description)</span>
                  <textarea rows={2} value={form.useDesc} onChange={event => update('useDesc', event.target.value)} placeholder="อธิบายหน้าที่หรือการใช้งานในภัตตาคาร/โรงแรม" />
                </label>

                <label className={styles.fullField}>
                  <span>ประโยคตัวอย่างสำหรับฝึกสนทนา</span>
                  <input value={form.sentence} onChange={event => update('sentence', event.target.value)} placeholder="เช่น Water goblet is filled with ice water before service." />
                </label>

                {/* 2. Optional Upload: Image [png, jpeg, webp] */}
                <div className={styles.fullField} style={{ border: '1px dashed #cde0d5', borderRadius: 12, padding: '14px 16px', background: '#f9fcfb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#254437' }}>
                      🖼️ รูปภาพประกอบคำศัพท์ <small style={{ fontWeight: 400, color: '#7a8a81' }}>(ไม่บังคับ / รองรับ PNG, JPEG, WebP)</small>
                    </span>
                    {form.imageUrl && (
                      <button 
                        type="button" 
                        onClick={() => update('imageUrl', '')}
                        style={{ fontSize: 11, color: '#a04840', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        นำรูปออก
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    {form.imageUrl && (
                      <div 
                        style={{ 
                          width: 64, height: 64, borderRadius: 10, 
                          backgroundImage: `url("${form.imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center',
                          border: '1px solid #bad2c3', flexShrink: 0 
                        }} 
                      />
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 220 }}>
                      <label 
                        style={{ 
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, 
                          padding: '8px 14px', borderRadius: 8, background: '#eaf4ee', color: '#2b5a44', 
                          cursor: uploadingField === 'imageUrl' ? 'wait' : 'pointer', fontSize: 12, fontWeight: 600, border: '1px solid #c8ded1'
                        }}
                      >
                        <AdminIcon name={uploadingField === 'imageUrl' ? 'clock' : 'plus'} size={15} />
                        {uploadingField === 'imageUrl' ? 'กำลังอัปโหลดรูปภาพ...' : form.imageUrl ? 'เปลี่ยนไฟล์รูปภาพ' : '📁 เลือกไฟล์รูปภาพ (PNG / JPEG)'}
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/jpg, image/webp" 
                          style={{ display: 'none' }}
                          disabled={uploadingField !== null}
                          onChange={e => handleFileUpload(e, 'imageUrl')} 
                        />
                      </label>
                      <input 
                        type="url" 
                        value={form.imageUrl} 
                        onChange={e => update('imageUrl', e.target.value)} 
                        placeholder="หรือระบุ URL รูปภาพ (https://...)" 
                        style={{ fontSize: 11, padding: '6px 10px', height: 32 }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Optional Upload: 3D GLB Model */}
                <div style={{ border: '1px dashed #cde0d5', borderRadius: 12, padding: '14px 16px', background: '#f9fcfb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#254437' }}>
                      📦 โมเดล 3D (.GLB) <small style={{ fontWeight: 400, color: '#7a8a81' }}>(ไม่บังคับ)</small>
                    </span>
                    {form.glbUrl && (
                      <button 
                        type="button" 
                        onClick={() => update('glbUrl', '')}
                        style={{ fontSize: 11, color: '#a04840', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        ลบไฟล์
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label 
                      style={{ 
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, 
                        padding: '8px 14px', borderRadius: 8, background: '#eef3fa', color: '#2b5278', 
                        cursor: uploadingField === 'glbUrl' ? 'wait' : 'pointer', fontSize: 12, fontWeight: 600, border: '1px solid #c9dbee'
                      }}
                    >
                      <AdminIcon name={uploadingField === 'glbUrl' ? 'clock' : 'cube'} size={15} />
                      {uploadingField === 'glbUrl' ? 'กำลังอัปโหลดไฟล์ GLB...' : form.glbUrl ? 'เปลี่ยนไฟล์ .GLB' : '📁 เลือกไฟล์ .GLB จากเครื่อง'}
                      <input 
                        type="file" 
                        accept=".glb, model/gltf-binary" 
                        style={{ display: 'none' }}
                        disabled={uploadingField !== null}
                        onChange={e => handleFileUpload(e, 'glbUrl')} 
                      />
                    </label>
                    <input 
                      type="text" 
                      value={form.glbUrl} 
                      onChange={e => update('glbUrl', e.target.value)} 
                      placeholder="URL หรือ Path โมเดล /models/...glb" 
                      style={{ fontSize: 11, padding: '6px 10px', height: 32 }}
                    />
                  </div>
                </div>

                {/* 4. Optional Upload: iOS AR QuickLook (.USDZ) */}
                <div style={{ border: '1px dashed #cde0d5', borderRadius: 12, padding: '14px 16px', background: '#f9fcfb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#254437' }}>
                      📱 โมเดล iOS AR (.USDZ) <small style={{ fontWeight: 400, color: '#7a8a81' }}>(ไม่บังคับ)</small>
                    </span>
                    {form.usdzUrl && (
                      <button 
                        type="button" 
                        onClick={() => update('usdzUrl', '')}
                        style={{ fontSize: 11, color: '#a04840', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        ลบไฟล์
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label 
                      style={{ 
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, 
                        padding: '8px 14px', borderRadius: 8, background: '#f5effc', color: '#683692', 
                        cursor: uploadingField === 'usdzUrl' ? 'wait' : 'pointer', fontSize: 12, fontWeight: 600, border: '1px solid #e0cff5'
                      }}
                    >
                      <AdminIcon name={uploadingField === 'usdzUrl' ? 'clock' : 'cube'} size={15} />
                      {uploadingField === 'usdzUrl' ? 'กำลังอัปโหลดไฟล์ USDZ...' : form.usdzUrl ? 'เปลี่ยนไฟล์ .USDZ' : '📁 เลือกไฟล์ .USDZ จากเครื่อง'}
                      <input 
                        type="file" 
                        accept=".usdz, model/vnd.usdz+zip" 
                        style={{ display: 'none' }}
                        disabled={uploadingField !== null}
                        onChange={e => handleFileUpload(e, 'usdzUrl')} 
                      />
                    </label>
                    <input 
                      type="text" 
                      value={form.usdzUrl} 
                      onChange={e => update('usdzUrl', e.target.value)} 
                      placeholder="URL หรือ Path โมเดล /models/...usdz" 
                      style={{ fontSize: 11, padding: '6px 10px', height: 32 }}
                    />
                  </div>
                </div>
              </div>

              <footer className={styles.modalFooter}>
                <button type="button" onClick={() => setEditorOpen(false)}>ยกเลิก</button>
                <button className={styles.primaryButton} type="submit" disabled={busy === 'save' || uploadingField !== null}>
                  <AdminIcon name={busy === 'save' ? 'clock' : 'check'} size={16} />
                  {busy === 'save' ? 'กำลังบันทึก' : 'บันทึกคำศัพท์'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
