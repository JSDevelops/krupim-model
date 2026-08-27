'use client'

import { ChangeEvent, FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import AdminIcon from '@/components/admin/AdminIcon'
import { confirmAction } from '@/components/AppConfirmDialog'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import styles from '../management.module.css'

type ArModel = {
  id: string
  nameEn: string
  nameTh: string
  pronounce: string
  sentence: string
  description: string
  imageUrl: string
  glbUrl: string
  usdzUrl: string
  createdAt: string
  updatedAt: string
}

type ArForm = Omit<ArModel, 'id' | 'createdAt' | 'updatedAt'>

const emptyForm: ArForm = {
  nameEn: '',
  nameTh: '',
  pronounce: '',
  sentence: '',
  description: '',
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

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'ไม่ระบุ'
    : new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export default function TeacherArModelsPage() {
  const [models, setModels] = useState<ArModel[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'incomplete'>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ArForm>(emptyForm)
  const [busy, setBusy] = useState<string | null>(null)
  const [uploadingField, setUploadingField] = useState<'imageUrl' | 'glbUrl' | 'usdzUrl' | null>(null)

  const loadModels = useCallback(async (signal?: AbortSignal) => {
    const response = await authenticatedFetch('/api/teacher/ar-models', { cache: 'no-store', signal })
    if (!response.ok) throw new Error(await responseError(response))
    const payload = await response.json() as { models?: ArModel[] }
    setModels(payload.models ?? [])
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void loadModels(controller.signal).then(() => setError('')).catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') setError(loadError.message)
      }).finally(() => setLoading(false))
    }, 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [loadModels])

  const visibleModels = useMemo(() => {
    const keyword = deferredSearch.trim().toLocaleLowerCase('th-TH')
    return models.filter(model => {
      const ready = Boolean(model.glbUrl || model.usdzUrl)
      if (statusFilter === 'ready' && !ready) return false
      if (statusFilter === 'incomplete' && ready) return false
      return !keyword || [model.nameEn, model.nameTh, model.description].some(value => value?.toLocaleLowerCase('th-TH').includes(keyword))
    })
  }, [deferredSearch, models, statusFilter])

  const readyCount = models.filter(model => model.glbUrl || model.usdzUrl).length
  const imageCount = models.filter(model => model.imageUrl).length
  const summary = [
    { key: 'green', label: 'โมเดลทั้งหมด', value: models.length, detail: 'รายการในคลังของคุณ', icon: 'cube' as const },
    { key: 'blue', label: 'พร้อมใช้งาน', value: readyCount, detail: 'มีไฟล์ GLB หรือ USDZ', icon: 'check' as const },
    { key: 'gold', label: 'มีภาพตัวอย่าง', value: imageCount, detail: 'ช่วยค้นหาได้รวดเร็วขึ้น', icon: 'eye' as const },
    { key: 'purple', label: 'ต้องเพิ่มไฟล์', value: models.length - readyCount, detail: 'รายการที่ยังไม่สมบูรณ์', icon: 'activity' as const },
  ]

  async function refresh() {
    setRefreshing(true)
    try {
      await loadModels()
      setError('')
      toast.success('อัปเดตคลังโมเดลแล้ว')
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

  function openEdit(model: ArModel) {
    setEditingId(model.id)
    setForm({
      nameEn: model.nameEn,
      nameTh: model.nameTh,
      pronounce: model.pronounce || '',
      sentence: model.sentence || '',
      description: model.description || '',
      imageUrl: model.imageUrl || '',
      glbUrl: model.glbUrl || '',
      usdzUrl: model.usdzUrl || ''
    })
    setEditorOpen(true)
  }

  function update<Key extends keyof ArForm>(key: Key, value: ArForm[Key]) {
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
      const response = await authenticatedFetch('/api/teacher/ar-models', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editingId ? { id: editingId } : {}), ...form }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      const payload = await response.json() as { model: ArModel }
      setModels(current => editingId ? current.map(item => item.id === editingId ? payload.model : item) : [payload.model, ...current])
      setEditorOpen(false)
      toast.success(editingId ? 'บันทึกการแก้ไขโมเดลแล้ว' : 'เพิ่มโมเดล AR 3D แล้ว', { description: payload.model.nameEn })
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'บันทึกโมเดลไม่สำเร็จ')
    } finally {
      setBusy(null)
    }
  }

  async function remove(model: ArModel) {
    const confirmed = await confirmAction({
      title: 'ลบโมเดลนี้?',
      description: `โมเดล “${model.nameEn}” จะถูกนำออกจากคลัง`,
      confirmText: 'ลบโมเดล',
      tone: 'danger'
    })
    if (!confirmed) return
    setBusy(`delete:${model.id}`)
    try {
      const response = await authenticatedFetch(`/api/teacher/ar-models?id=${encodeURIComponent(model.id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await responseError(response))
      setModels(current => current.filter(item => item.id !== model.id))
      toast.success('ลบโมเดลแล้ว')
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'ลบโมเดลไม่สำเร็จ')
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p>AR ASSET LIBRARY</p>
          <h1>โมเดล AR และ 3 มิติ</h1>
          <span>จัดการสื่อสามมิติสำหรับบทเรียนและกิจกรรมภาคปฏิบัติ (รองรับการอัปโหลด PNG/JPEG, GLB, USDZ)</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} type="button" onClick={() => void refresh()} disabled={refreshing}>
            <AdminIcon name="refresh" size={16} />
            {refreshing ? 'กำลังอัปเดต' : 'อัปเดตข้อมูล'}
          </button>
          <button className={styles.primaryButton} type="button" onClick={openCreate}>
            <AdminIcon name="plus" size={16} />
            เพิ่มโมเดล
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
            <h2>คลังโมเดลของคุณ</h2>
            <p>{visibleModels.length} รายการจากตัวกรองปัจจุบัน</p>
          </div>
          <div className={styles.filters}>
            <label className={styles.searchBox}>
              <AdminIcon name="search" size={16} />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาชื่อหรือรายละเอียด" aria-label="ค้นหาโมเดล" />
            </label>
            <label className={styles.selectBox}>
              <AdminIcon name="archive" size={15} />
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)} aria-label="กรองสถานะ">
                <option value="all">ทุกสถานะ</option>
                <option value="ready">พร้อมใช้</option>
                <option value="incomplete">ยังไม่สมบูรณ์</option>
              </select>
            </label>
          </div>
        </header>

        <div className={styles.cardGrid}>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <div className={styles.cardSkeleton} key={index} />)
          ) : visibleModels.length ? (
            visibleModels.map(model => {
              const ready = Boolean(model.glbUrl || model.usdzUrl)
              return (
                <article className={styles.assetCard} key={model.id}>
                  <div
                    className={styles.assetPreview}
                    style={model.imageUrl ? { backgroundImage: `linear-gradient(180deg, transparent 45%, rgb(10 29 20 / 55%)), url("${model.imageUrl.replaceAll('"', '%22')}")` } : undefined}
                  >
                    {!model.imageUrl && <AdminIcon name="cube" size={31} />}
                    <span className={ready ? styles.readyBadge : styles.draftBadge}>{ready ? 'พร้อมใช้' : 'รอไฟล์โมเดล'}</span>
                  </div>

                  <div className={styles.assetBody}>
                    <small>{model.pronounce || 'ยังไม่มีคำอ่าน'}</small>
                    <h3>{model.nameEn}</h3>
                    <strong>{model.nameTh}</strong>
                    <p>{model.description || 'ยังไม่มีคำอธิบายสำหรับโมเดลนี้'}</p>
                    <div className={styles.assetMeta}>
                      <span><AdminIcon name="cube" size={13} />{model.glbUrl ? 'GLB' : 'ไม่มี GLB'}</span>
                      <span><AdminIcon name="monitor" size={13} />{model.usdzUrl ? 'USDZ' : 'ไม่มี USDZ'}</span>
                      <span><AdminIcon name="clock" size={13} />{formatDate(model.updatedAt)}</span>
                    </div>
                  </div>

                  <footer className={styles.cardActions}>
                    {model.glbUrl && (
                      <a href={model.glbUrl} target="_blank" rel="noopener noreferrer">
                        <AdminIcon name="eye" size={15} />เปิดโมเดล
                      </a>
                    )}
                    <span />
                    <button type="button" onClick={() => openEdit(model)} title="แก้ไขโมเดล">
                      <AdminIcon name="edit" size={15} />
                    </button>
                    <button className={styles.dangerIconButton} type="button" onClick={() => void remove(model)} disabled={Boolean(busy)} title="ลบโมเดล">
                      <AdminIcon name="trash" size={15} />
                    </button>
                  </footer>
                </article>
              )
            })
          ) : (
            <div className={styles.emptyState}>
              <span><AdminIcon name="cube" size={25} /></span>
              <h3>ยังไม่มีโมเดลในคลัง</h3>
              <p>เพิ่มไฟล์ GLB หรือ USDZ เพื่อใช้กับบทเรียน AR</p>
              <button type="button" onClick={openCreate}>
                <AdminIcon name="plus" size={16} />เพิ่มโมเดลแรก
              </button>
            </div>
          )}
        </div>
      </section>

      {/* AR Model Editor Modal */}
      {editorOpen && (
        <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !busy && setEditorOpen(false)}>
          <section className={styles.modal} role="dialog" aria-modal="true" style={{ width: 'min(760px, 100%)' }}>
            <header className={styles.modalHeader}>
              <span><AdminIcon name={editingId ? 'edit' : 'plus'} size={21} /></span>
              <div>
                <h2>{editingId ? 'แก้ไขโมเดล AR 3D' : 'เพิ่มโมเดล AR 3D'}</h2>
                <p>กรอกข้อมูลและอัปโหลดไฟล์โมเดลที่ต้องการใช้งาน (รองรับ PNG/JPEG, GLB, USDZ)</p>
              </div>
              <button type="button" onClick={() => setEditorOpen(false)}><AdminIcon name="close" size={18} /></button>
            </header>

            <form onSubmit={save}>
              <div className={styles.formGrid}>
                <label>
                  <span>ชื่อภาษาอังกฤษ *</span>
                  <input autoFocus required value={form.nameEn} onChange={event => update('nameEn', event.target.value)} />
                </label>

                <label>
                  <span>ชื่อภาษาไทย *</span>
                  <input required value={form.nameTh} onChange={event => update('nameTh', event.target.value)} />
                </label>

                <label className={styles.fullField}>
                  <span>คำอ่าน / สัทอักษร</span>
                  <input value={form.pronounce} onChange={event => update('pronounce', event.target.value)} placeholder="/ pronunciation /" />
                </label>

                <label className={styles.fullField}>
                  <span>คำอธิบาย</span>
                  <textarea rows={2} value={form.description} onChange={event => update('description', event.target.value)} />
                </label>

                <label className={styles.fullField}>
                  <span>ประโยคตัวอย่าง</span>
                  <input value={form.sentence} onChange={event => update('sentence', event.target.value)} />
                </label>

                {/* Optional Upload: Image [png, jpeg, webp] */}
                <div className={styles.fullField} style={{ border: '1px dashed #cde0d5', borderRadius: 12, padding: '14px 16px', background: '#f9fcfb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#254437' }}>
                      🖼️ รูปตัวอย่างโมเดล <small style={{ fontWeight: 400, color: '#7a8a81' }}>(ไม่บังคับ / รองรับ PNG, JPEG, WebP)</small>
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

                {/* Optional Upload: 3D GLB Model */}
                <div style={{ border: '1px dashed #cde0d5', borderRadius: 12, padding: '14px 16px', background: '#f9fcfb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#254437' }}>
                      📦 ไฟล์โมเดล 3D (.GLB) <small style={{ fontWeight: 400, color: '#7a8a81' }}>(ไม่บังคับ)</small>
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

                {/* Optional Upload: iOS AR QuickLook (.USDZ) */}
                <div style={{ border: '1px dashed #cde0d5', borderRadius: 12, padding: '14px 16px', background: '#f9fcfb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#254437' }}>
                      📱 ไฟล์โมเดล iOS AR (.USDZ) <small style={{ fontWeight: 400, color: '#7a8a81' }}>(ไม่บังคับ)</small>
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
                  {busy === 'save' ? 'กำลังบันทึก' : 'บันทึกโมเดล'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
