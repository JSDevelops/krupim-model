'use client'

import { FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
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

type GenerationJob = {
  id: string
  nameEn: string
  nameTh: string
  prompt: string
  modelVersion: string
  status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled' | 'banned' | 'expired' | 'unknown' | 'preview'
  progress: number
  glbUrl: string
  previewUrl: string
  errorMessage: string | null
  arItemId: string | null
  createdAt: string
}

type GenerationForm = { nameEn: string; nameTh: string; prompt: string; negativePrompt: string; description: string }

const emptyForm: ArForm = { nameEn: '', nameTh: '', pronounce: '', sentence: '', description: '', imageUrl: '', glbUrl: '', usdzUrl: '' }
const emptyGenerationForm: GenerationForm = { nameEn: '', nameTh: '', prompt: '', negativePrompt: 'low quality, blurry, text, watermark', description: '' }
const activeGenerationStatuses = new Set<GenerationJob['status']>(['queued', 'running', 'unknown'])

const generationStatusLabel: Record<GenerationJob['status'], string> = {
  queued: 'รอประมวลผล', running: 'กำลังสร้าง', success: 'สำเร็จ', failed: 'ไม่สำเร็จ',
  cancelled: 'ยกเลิกแล้ว', banned: 'ถูกปฏิเสธ', expired: 'หมดอายุ', unknown: 'กำลังตรวจสอบ', preview: 'ตัวอย่างสำหรับพัฒนา',
}

async function responseError(response: Response) {
  try { return ((await response.json()) as { error?: string }).error || 'ไม่สามารถดำเนินการได้' } catch { return 'ไม่สามารถดำเนินการได้' }
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'ไม่ระบุ' : new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
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
  const [jobs, setJobs] = useState<GenerationJob[]>([])
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [generationForm, setGenerationForm] = useState<GenerationForm>(emptyGenerationForm)
  const [busy, setBusy] = useState<string | null>(null)

  const loadModels = useCallback(async (signal?: AbortSignal) => {
    const response = await authenticatedFetch('/api/teacher/ar-models', { cache: 'no-store', signal })
    if (!response.ok) throw new Error(await responseError(response))
    const payload = await response.json() as { models?: ArModel[] }
    setModels(payload.models ?? [])
  }, [])

  const loadJobs = useCallback(async (signal?: AbortSignal) => {
    const response = await authenticatedFetch('/api/3d/generate', { cache: 'no-store', signal })
    if (!response.ok) throw new Error(await responseError(response))
    const payload = await response.json() as { jobs?: GenerationJob[] }
    setJobs(payload.jobs ?? [])
  }, [])

  const activeJobIds = useMemo(
    () => jobs.filter(job => activeGenerationStatuses.has(job.status)).map(job => job.id).sort().join(','),
    [jobs],
  )

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void Promise.all([loadModels(controller.signal), loadJobs(controller.signal)]).then(() => setError('')).catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') setError(loadError.message)
      }).finally(() => setLoading(false))
    }, 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [loadJobs, loadModels])

  useEffect(() => {
    if (!activeJobIds) return
    const activeIds = activeJobIds.split(',')
    let cancelled = false
    const poll = async () => {
      const results = await Promise.all(activeIds.map(async id => {
        const response = await authenticatedFetch(`/api/3d/status/${encodeURIComponent(id)}`, { cache: 'no-store' })
        if (!response.ok) return null
        return ((await response.json()) as { job?: GenerationJob }).job ?? null
      }))
      if (cancelled) return
      const updates = new Map(results.filter((job): job is GenerationJob => Boolean(job)).map(job => [job.id, job]))
      const completed = results.some(job => job?.status === 'success' || job?.status === 'preview')
      setJobs(current => current.map(job => {
        const updated = updates.get(job.id)
        if (!updated) return job
        return updated
      }))
      if (completed) {
        void loadModels().catch(() => undefined)
        toast.success('สร้างและบันทึกโมเดล 3 มิติเรียบร้อยแล้ว')
      }
    }
    const timer = window.setInterval(() => void poll(), 4_000)
    void poll()
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [activeJobIds, loadModels])

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
    try { await Promise.all([loadModels(), loadJobs()]); setError(''); toast.success('อัปเดตคลังโมเดลแล้ว') }
    catch (refreshError) { setError(refreshError instanceof Error ? refreshError.message : 'โหลดข้อมูลไม่สำเร็จ') }
    finally { setRefreshing(false) }
  }

  function openCreate() { setEditingId(null); setForm(emptyForm); setEditorOpen(true) }
  function openGenerator() { setGenerationForm(emptyGenerationForm); setGeneratorOpen(true) }
  function openEdit(model: ArModel) {
    setEditingId(model.id)
    setForm({ nameEn: model.nameEn, nameTh: model.nameTh, pronounce: model.pronounce || '', sentence: model.sentence || '', description: model.description || '', imageUrl: model.imageUrl || '', glbUrl: model.glbUrl || '', usdzUrl: model.usdzUrl || '' })
    setEditorOpen(true)
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy('save')
    try {
      const response = await authenticatedFetch('/api/teacher/ar-models', {
        method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editingId ? { id: editingId } : {}), ...form }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      const payload = await response.json() as { model: ArModel }
      setModels(current => editingId ? current.map(item => item.id === editingId ? payload.model : item) : [payload.model, ...current])
      setEditorOpen(false)
      toast.success(editingId ? 'บันทึกการแก้ไขโมเดลแล้ว' : 'เพิ่มโมเดล AR 3D แล้ว', { description: payload.model.nameEn })
    } catch (saveError) { toast.error(saveError instanceof Error ? saveError.message : 'บันทึกโมเดลไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  async function remove(model: ArModel) {
    const confirmed = await confirmAction({ title: 'ลบโมเดลนี้?', description: `โมเดล “${model.nameEn}” จะถูกนำออกจากคลัง`, confirmText: 'ลบโมเดล', tone: 'danger' })
    if (!confirmed) return
    setBusy(`delete:${model.id}`)
    try {
      const response = await authenticatedFetch(`/api/teacher/ar-models?id=${encodeURIComponent(model.id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await responseError(response))
      setModels(current => current.filter(item => item.id !== model.id))
      toast.success('ลบโมเดลแล้ว')
    } catch (deleteError) { toast.error(deleteError instanceof Error ? deleteError.message : 'ลบโมเดลไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  async function generateModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy('generate')
    try {
      const response = await authenticatedFetch('/api/3d/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(generationForm),
      })
      if (!response.ok) throw new Error(await responseError(response))
      const payload = await response.json() as { job: GenerationJob }
      setJobs(current => [payload.job, ...current.filter(job => job.id !== payload.job.id)])
      setGeneratorOpen(false)
      if (payload.job.status === 'preview' || payload.job.status === 'success') await loadModels()
      toast.success(payload.job.status === 'preview' ? 'สร้างโมเดลตัวอย่างและบันทึกแล้ว' : 'ส่งงานให้ Tripo แล้ว', { description: payload.job.nameEn })
    } catch (generateError) { toast.error(generateError instanceof Error ? generateError.message : 'ส่งงานสร้างโมเดลไม่สำเร็จ') }
    finally { setBusy(null) }
  }

  function update<Key extends keyof ArForm>(key: Key, value: ArForm[Key]) { setForm(current => ({ ...current, [key]: value })) }
  function updateGeneration<Key extends keyof GenerationForm>(key: Key, value: GenerationForm[Key]) { setGenerationForm(current => ({ ...current, [key]: value })) }

  return <main className={styles.page}>
    <header className={styles.pageHeader}><div><p>AR ASSET LIBRARY</p><h1>โมเดล AR และ 3 มิติ</h1><span>สร้างด้วย AI หรือนำเข้าไฟล์โมเดลเพื่อใช้กับบทเรียนและกิจกรรมภาคปฏิบัติ</span></div><div className={styles.headerActions}><button className={styles.secondaryButton} type="button" onClick={() => void refresh()} disabled={refreshing}><AdminIcon name="refresh" size={16} />{refreshing ? 'กำลังอัปเดต' : 'อัปเดต'}</button><button className={styles.aiButton} type="button" onClick={openGenerator}><AdminIcon name="sparkles" size={16} />สร้างด้วย Tripo</button><button className={styles.primaryButton} type="button" onClick={openCreate}><AdminIcon name="plus" size={16} />เพิ่มด้วยตนเอง</button></div></header>
    {error && <div className={styles.error}><AdminIcon name="activity" size={17} /><span>{error}</span><button type="button" onClick={() => void refresh()}>ลองอีกครั้ง</button></div>}
    <section className={styles.metrics}>{summary.map(item => <article className={styles.metricCard} data-tone={item.key} key={item.label}><span className={styles.metricIcon}><AdminIcon name={item.icon} size={20} /></span><span><small>{item.label}</small><strong>{loading ? '—' : item.value}</strong><span>{item.detail}</span></span></article>)}</section>
    {jobs.length > 0 && <section className={styles.generationPanel}>
      <header><div><span><AdminIcon name="sparkles" size={18} /></span><div><h2>งานสร้างโมเดลด้วย AI</h2><p>ระบบตรวจสถานะและบันทึกไฟล์ GLB เข้า PostgreSQL โดยอัตโนมัติ</p></div></div><small>{jobs.filter(job => activeGenerationStatuses.has(job.status)).length} งานกำลังทำงาน</small></header>
      <div className={styles.generationList}>{jobs.slice(0, 5).map(job => <article className={styles.generationJob} key={job.id} data-status={job.status}>
        <span className={styles.generationThumb} style={job.previewUrl ? { backgroundImage: `url("${job.previewUrl.replaceAll('"', '%22')}")` } : undefined}>{!job.previewUrl && <AdminIcon name={job.status === 'success' || job.status === 'preview' ? 'check' : 'cube'} size={20} />}</span>
        <div className={styles.generationIdentity}><strong>{job.nameEn}</strong><small>{job.nameTh} · {job.modelVersion || 'Tripo'}</small></div>
        <div className={styles.generationProgress}><span><small>{generationStatusLabel[job.status]}</small><strong>{Math.round(job.progress)}%</strong></span><div><i style={{ width: `${Math.max(2, job.progress)}%` }} /></div>{job.errorMessage && <small className={styles.generationError}>{job.errorMessage}</small>}</div>
        {job.glbUrl ? <a href={job.glbUrl} target="_blank" rel="noopener noreferrer"><AdminIcon name="eye" size={15} />เปิดโมเดล</a> : <span className={styles.jobState}><AdminIcon name={activeGenerationStatuses.has(job.status) ? 'refresh' : 'activity'} size={14} />{generationStatusLabel[job.status]}</span>}
      </article>)}</div>
    </section>}
    <section className={styles.workspace}>
      <header className={styles.workspaceHeader}><div><h2>คลังโมเดลของคุณ</h2><p>{visibleModels.length} รายการจากตัวกรองปัจจุบัน</p></div><div className={styles.filters}><label className={styles.searchBox}><AdminIcon name="search" size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาชื่อหรือรายละเอียด" aria-label="ค้นหาโมเดล" /></label><label className={styles.selectBox}><AdminIcon name="archive" size={15} /><select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)} aria-label="กรองสถานะ"><option value="all">ทุกสถานะ</option><option value="ready">พร้อมใช้</option><option value="incomplete">ยังไม่สมบูรณ์</option></select></label></div></header>
      <div className={styles.cardGrid}>{loading ? Array.from({ length: 6 }).map((_, index) => <div className={styles.cardSkeleton} key={index} />) : visibleModels.length ? visibleModels.map(model => {
        const ready = Boolean(model.glbUrl || model.usdzUrl)
        return <article className={styles.assetCard} key={model.id}>
          <div className={styles.assetPreview} style={model.imageUrl ? { backgroundImage: `linear-gradient(180deg, transparent 45%, rgb(10 29 20 / 55%)), url("${model.imageUrl.replaceAll('"', '%22')}")` } : undefined}>{!model.imageUrl && <AdminIcon name="cube" size={31} />}<span className={ready ? styles.readyBadge : styles.draftBadge}>{ready ? 'พร้อมใช้' : 'รอไฟล์โมเดล'}</span></div>
          <div className={styles.assetBody}><small>{model.pronounce || 'ยังไม่มีคำอ่าน'}</small><h3>{model.nameEn}</h3><strong>{model.nameTh}</strong><p>{model.description || 'ยังไม่มีคำอธิบายสำหรับโมเดลนี้'}</p><div className={styles.assetMeta}><span><AdminIcon name="cube" size={13} />{model.glbUrl ? 'GLB' : 'ไม่มี GLB'}</span><span><AdminIcon name="monitor" size={13} />{model.usdzUrl ? 'USDZ' : 'ไม่มี USDZ'}</span><span><AdminIcon name="clock" size={13} />{formatDate(model.updatedAt)}</span></div></div>
          <footer className={styles.cardActions}>{model.glbUrl && <a href={model.glbUrl} target="_blank" rel="noopener noreferrer"><AdminIcon name="eye" size={15} />เปิดโมเดล</a>}<span /><button type="button" onClick={() => openEdit(model)}><AdminIcon name="edit" size={15} /></button><button className={styles.dangerIconButton} type="button" onClick={() => void remove(model)} disabled={Boolean(busy)}><AdminIcon name="trash" size={15} /></button></footer>
        </article>
      }) : <div className={styles.emptyState}><span><AdminIcon name="cube" size={25} /></span><h3>ยังไม่มีโมเดลในคลัง</h3><p>เพิ่มไฟล์ GLB หรือ USDZ เพื่อใช้กับบทเรียน AR</p><button type="button" onClick={openCreate}><AdminIcon name="plus" size={16} />เพิ่มโมเดลแรก</button></div>}</div>
    </section>
    {generatorOpen && <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !busy && setGeneratorOpen(false)}><section className={`${styles.modal} ${styles.generatorModal}`} role="dialog" aria-modal="true" aria-labelledby="generator-title"><header className={styles.modalHeader}><span><AdminIcon name="sparkles" size={21} /></span><div><h2 id="generator-title">สร้างโมเดล 3 มิติด้วย Tripo</h2><p>อธิบายรูปร่าง วัสดุ สี และมุมมองให้ชัดเจนเพื่อผลลัพธ์ที่แม่นยำ</p></div><button type="button" onClick={() => setGeneratorOpen(false)}><AdminIcon name="close" size={18} /></button></header><form onSubmit={generateModel}><div className={styles.formGrid}><label><span>ชื่อภาษาอังกฤษ *</span><input autoFocus required maxLength={180} value={generationForm.nameEn} onChange={event => updateGeneration('nameEn', event.target.value)} placeholder="Coffee Cup" /></label><label><span>ชื่อภาษาไทย *</span><input required maxLength={180} value={generationForm.nameTh} onChange={event => updateGeneration('nameTh', event.target.value)} placeholder="ถ้วยกาแฟ" /></label><label className={styles.fullField}><span>Prompt สำหรับสร้างโมเดล *</span><textarea required rows={4} maxLength={1024} value={generationForm.prompt} onChange={event => updateGeneration('prompt', event.target.value)} placeholder="A realistic white ceramic coffee cup, clean topology, isolated object..." /><small>{generationForm.prompt.length}/1,024 ตัวอักษร</small></label><label className={styles.fullField}><span>สิ่งที่ไม่ต้องการ</span><input maxLength={255} value={generationForm.negativePrompt} onChange={event => updateGeneration('negativePrompt', event.target.value)} /></label><label className={styles.fullField}><span>คำอธิบายในคลัง</span><textarea rows={2} maxLength={3000} value={generationForm.description} onChange={event => updateGeneration('description', event.target.value)} placeholder="รายละเอียดสำหรับครูและนักเรียน" /></label></div><footer className={styles.modalFooter}><button type="button" onClick={() => setGeneratorOpen(false)}>ยกเลิก</button><button className={styles.aiButton} type="submit" disabled={busy === 'generate'}><AdminIcon name={busy === 'generate' ? 'clock' : 'sparkles'} size={16} />{busy === 'generate' ? 'กำลังส่งงาน' : 'เริ่มสร้างโมเดล'}</button></footer></form></section></div>}
    {editorOpen && <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !busy && setEditorOpen(false)}><section className={styles.modal} role="dialog" aria-modal="true"><header className={styles.modalHeader}><span><AdminIcon name={editingId ? 'edit' : 'plus'} size={21} /></span><div><h2>{editingId ? 'แก้ไขโมเดล AR 3D' : 'เพิ่มโมเดล AR 3D'}</h2><p>กรอกข้อมูลและตำแหน่งไฟล์โมเดลที่พร้อมใช้งาน</p></div><button type="button" onClick={() => setEditorOpen(false)}><AdminIcon name="close" size={18} /></button></header><form onSubmit={save}><div className={styles.formGrid}><label><span>ชื่อภาษาอังกฤษ *</span><input autoFocus required value={form.nameEn} onChange={event => update('nameEn', event.target.value)} /></label><label><span>ชื่อภาษาไทย *</span><input required value={form.nameTh} onChange={event => update('nameTh', event.target.value)} /></label><label><span>คำอ่าน</span><input value={form.pronounce} onChange={event => update('pronounce', event.target.value)} placeholder="/ pronunciation /" /></label><label className={styles.fullField}><span>คำอธิบาย</span><textarea rows={3} value={form.description} onChange={event => update('description', event.target.value)} /></label><label className={styles.fullField}><span>ประโยคตัวอย่าง</span><input value={form.sentence} onChange={event => update('sentence', event.target.value)} /></label><label className={styles.fullField}><span>URL รูปตัวอย่าง</span><input type="url" value={form.imageUrl} onChange={event => update('imageUrl', event.target.value)} placeholder="https://..." /></label><label><span>URL ไฟล์ GLB</span><input value={form.glbUrl} onChange={event => update('glbUrl', event.target.value)} placeholder="/models/item.glb" /></label><label><span>URL ไฟล์ USDZ</span><input value={form.usdzUrl} onChange={event => update('usdzUrl', event.target.value)} placeholder="/models/item.usdz" /></label></div><footer className={styles.modalFooter}><button type="button" onClick={() => setEditorOpen(false)}>ยกเลิก</button><button className={styles.primaryButton} type="submit" disabled={busy === 'save'}><AdminIcon name={busy === 'save' ? 'clock' : 'check'} size={16} />{busy === 'save' ? 'กำลังบันทึก' : 'บันทึกโมเดล'}</button></footer></form></section></div>}
  </main>
}
