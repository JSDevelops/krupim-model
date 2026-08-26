'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import AdminIcon from '@/components/admin/AdminIcon'
import { authenticatedFetch } from '@/lib/api'
import styles from '../adminPages.module.css'

type AnnouncementPriority = 'urgent' | 'general' | 'event'

interface Announcement {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  tags: string[]
  publishedAt: string
  linkUrl?: string
}

interface AnnouncementRecord {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  tags: string[]
  link_url: string | null
  published_at: string
}

const priorityConfig: Record<AnnouncementPriority, { label: string; description: string; tone: string }> = {
  urgent: { label: 'ประกาศด่วน', description: 'เรื่องสำคัญที่ต้องดำเนินการ', tone: 'red' },
  general: { label: 'ข่าวทั่วไป', description: 'ข้อมูลและการอัปเดตระบบ', tone: 'green' },
  event: { label: 'กิจกรรม', description: 'กำหนดการและกิจกรรมเด่น', tone: 'gold' },
}

function mapAnnouncement(record: AnnouncementRecord): Announcement {
  const published = new Date(record.published_at)
  const publishedAt = Number.isNaN(published.getTime())
    ? 'ไม่ระบุเวลา'
    : new Intl.DateTimeFormat('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(published)
  return {
    id: record.id,
    title: record.title,
    content: record.content,
    priority: record.priority,
    tags: record.tags ?? [],
    publishedAt,
    linkUrl: record.link_url || undefined,
  }
}

async function getResponseError(response: Response) {
  try {
    const payload = await response.json() as { error?: string }
    if (payload.error) return payload.error
  } catch {
    // Fall back to a useful message when an upstream response is not JSON.
  }
  return 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง'
}

export default function AdminNewsPage() {
  const [topic, setTopic] = useState('')
  const [priority, setPriority] = useState<AnnouncementPriority>('general')
  const [keywords, setKeywords] = useState('')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)

  const loadAnnouncements = useCallback(async (signal?: AbortSignal) => {
    const response = await authenticatedFetch('/api/admin/blog', { signal })
    if (!response.ok) throw new Error(await getResponseError(response))
    const payload = await response.json() as { announcements?: AnnouncementRecord[] }
    setAnnouncements((payload.announcements ?? []).map(mapAnnouncement))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve()
      .then(() => loadAnnouncements(controller.signal))
      .catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') setError(loadError.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [loadAnnouncements])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busyAction) setDeleteTarget(null)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [busyAction])

  const counts = useMemo(() => ({
    all: announcements.length,
    urgent: announcements.filter(item => item.priority === 'urgent').length,
    general: announcements.filter(item => item.priority === 'general').length,
    event: announcements.filter(item => item.priority === 'event').length,
  }), [announcements])

  const metrics = [
    { label: 'ประกาศทั้งหมด', value: counts.all, detail: 'รายการที่เผยแพร่แล้ว', icon: 'announcement' as const, tone: 'blue' },
    { label: 'ประกาศด่วน', value: counts.urgent, detail: 'ต้องติดตามเป็นพิเศษ', icon: 'activity' as const, tone: 'red' },
    { label: 'ข่าวทั่วไป', value: counts.general, detail: 'ข้อมูลอัปเดตระบบ', icon: 'content' as const, tone: 'green' },
    { label: 'กิจกรรม', value: counts.event, detail: 'กำหนดการที่กำลังเผยแพร่', icon: 'clock' as const, tone: 'gold' },
  ]

  function resetEditor() {
    setTopic('')
    setContent('')
    setKeywords('')
    setLinkUrl('')
    setPriority('general')
    setEditingId(null)
  }

  function openEdit(item: Announcement) {
    setTopic(item.title)
    setContent(item.content)
    setKeywords(item.tags.join(', '))
    setLinkUrl(item.linkUrl || '')
    setPriority(item.priority)
    setEditingId(item.id)
  }

  async function generateWithAI() {
    if (!topic.trim() || generating) return
    setGenerating(true)
    try {
      const provider = window.localStorage.getItem('activeAiProvider') || 'gemini'
      const response = await authenticatedFetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-ai-provider': provider },
        body: JSON.stringify({
          topic: `เขียนประกาศระบบการศึกษาอาชีวศึกษาแบบกระชับ หัวข้อ: "${topic.trim()}"`,
          category: 'ข่าวสารและกิจกรรม',
          tone: 'กระชับ สุภาพ เป็นทางการ',
          keywords,
        }),
      })
      if (!response.ok) throw new Error('ไม่สามารถสร้างเนื้อหาด้วย AI ได้ กรุณาตรวจสอบผู้ให้บริการ AI ในหน้าตั้งค่า')
      const payload = await response.json() as { content?: string; excerpt?: string }
      const generated = payload.content || payload.excerpt || ''
      if (!generated) throw new Error('AI ไม่ได้ส่งเนื้อหากลับมา กรุณาลองอีกครั้ง')
      setContent(generated)
      toast.success('AI ร่างเนื้อหาให้แล้ว คุณสามารถตรวจแก้ก่อนบันทึกได้')
    } catch (generateError) {
      toast.error(generateError instanceof Error ? generateError.message : 'เกิดข้อผิดพลาดระหว่างสร้างเนื้อหา')
    } finally {
      setGenerating(false)
    }
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = topic.trim()
    const cleanContent = content.trim()
    if (!title || !cleanContent) {
      toast.warning('กรุณากรอกหัวข้อและเนื้อหาก่อนบันทึก')
      return
    }

    const tags = keywords.split(',').map(keyword => keyword.trim()).filter(Boolean)
    const actionKey = editingId ? `update:${editingId}` : 'create'
    setBusyAction(actionKey)
    try {
      const response = await authenticatedFetch('/api/admin/blog', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId
          ? { id: editingId, title, content: cleanContent, priority, tags, linkUrl }
          : { title, content: cleanContent, priority, tags, linkUrl }),
      })
      if (!response.ok) throw new Error(await getResponseError(response))
      const payload = await response.json() as { announcement: AnnouncementRecord }
      const saved = mapAnnouncement(payload.announcement)
      setAnnouncements(current => editingId
        ? current.map(item => item.id === editingId ? saved : item)
        : [saved, ...current])
      toast.success(editingId ? 'บันทึกการแก้ไขประกาศแล้ว' : 'เผยแพร่ประกาศแล้ว')
      resetEditor()
    } catch (publishError) {
      toast.error(publishError instanceof Error ? publishError.message : 'ไม่สามารถบันทึกประกาศได้')
    } finally {
      setBusyAction(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setBusyAction(`delete:${deleteTarget.id}`)
    try {
      const response = await authenticatedFetch(`/api/admin/blog?id=${encodeURIComponent(deleteTarget.id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await getResponseError(response))
      setAnnouncements(current => current.filter(item => item.id !== deleteTarget.id))
      if (editingId === deleteTarget.id) resetEditor()
      toast.success(`ลบประกาศ “${deleteTarget.title}” แล้ว`)
      setDeleteTarget(null)
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'ไม่สามารถลบประกาศได้')
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <main className={styles.adminPage}>
      <header className={styles.pageHeader}>
        <div><p>NEWS & EVENTS</p><h1>ประกาศและกิจกรรม</h1><span>สร้างข่าวสารสำคัญและส่งไปยังแดชบอร์ดครูผู้สอนในระบบ</span></div>
      </header>

      {error && <div className={styles.error} role="alert"><AdminIcon name="activity" size={16} /><span>{error}</span><button type="button" onClick={() => { setError(''); setLoading(true); void loadAnnouncements().catch(retryError => setError(retryError instanceof Error ? retryError.message : 'โหลดข้อมูลไม่สำเร็จ')).finally(() => setLoading(false)) }}>ลองใหม่</button></div>}

      <section className={styles.metrics} aria-label="สรุปประกาศ">
        {metrics.map(metric => (
          <article className={styles.metricCard} data-tone={metric.tone} key={metric.label}>
            <span className={styles.metricIcon}><AdminIcon name={metric.icon} size={20} /></span>
            <span className={styles.metricCopy}><small>{metric.label}</small><strong>{loading ? '—' : metric.value.toLocaleString('th-TH')}</strong><span>{metric.detail}</span></span>
          </article>
        ))}
      </section>

      <section className={styles.editorGrid}>
        <form id="announcement-editor" className={`${styles.panel} ${styles.editorPanel}`} data-tone="purple" onSubmit={handlePublish}>
          <header className={styles.sectionHeader}>
            <span><AdminIcon name={editingId ? 'edit' : 'announcement'} size={18} /></span>
            <div><h2>{editingId ? 'แก้ไขประกาศ' : 'เขียนประกาศใหม่'}</h2><p>{editingId ? 'ปรับข้อมูลแล้วบันทึกเพื่ออัปเดตทุกแดชบอร์ด' : 'กำหนดระดับความสำคัญและรายละเอียดก่อนเผยแพร่'}</p></div>
          </header>

          <div className={`${styles.formBody} ${styles.compactEditorBody}`}>
            <fieldset className={styles.priorityFieldset}>
              <legend>ระดับความสำคัญ</legend>
              <div className={styles.priorityOptions}>
                {(Object.keys(priorityConfig) as AnnouncementPriority[]).map(option => (
                  <button key={option} type="button" data-tone={priorityConfig[option].tone} aria-pressed={priority === option} onClick={() => setPriority(option)} disabled={Boolean(busyAction)}>
                    <strong>{priorityConfig[option].label}</strong><small>{priorityConfig[option].description}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className={styles.field}><span>หัวข้อประกาศ</span><input required maxLength={240} value={topic} onChange={event => setTopic(event.target.value)} placeholder="ระบุหัวข้อที่ต้องการสื่อสาร" /></label>
            <label className={styles.field}><span>รายละเอียด</span><textarea className={styles.compactTextarea} required maxLength={10000} rows={5} value={content} onChange={event => setContent(event.target.value)} placeholder="เขียนรายละเอียด หรือให้ AI ช่วยร่างเนื้อหา" /></label>
            <div className={styles.formGrid}>
              <label className={styles.field}><span>ป้ายกำกับ</span><input value={keywords} onChange={event => setKeywords(event.target.value)} placeholder="คั่นแต่ละคำด้วยจุลภาค" /></label>
              <label className={styles.field}><span>ลิงก์เพิ่มเติม</span><input type="url" value={linkUrl} onChange={event => setLinkUrl(event.target.value)} placeholder="https://example.com" /></label>
            </div>
          </div>

          <footer className={styles.formFooter}>
            {editingId && <button className={styles.cancelButton} type="button" onClick={resetEditor} disabled={Boolean(busyAction)}>ยกเลิกการแก้ไข</button>}
            <button className={styles.aiButton} type="button" onClick={() => void generateWithAI()} disabled={generating || Boolean(busyAction) || !topic.trim()}><AdminIcon name="sparkles" size={16} />{generating ? 'กำลังร่างเนื้อหา' : 'ให้ AI ช่วยร่าง'}</button>
            <button className={styles.primaryButton} type="submit" disabled={Boolean(busyAction)}><AdminIcon name={busyAction ? 'clock' : editingId ? 'check' : 'announcement'} size={16} />{busyAction ? 'กำลังบันทึก' : editingId ? 'บันทึกการแก้ไข' : 'เผยแพร่ประกาศ'}</button>
          </footer>
        </form>

        <section className={`${styles.panel} ${styles.feedPanel}`} data-tone="gold">
          <header className={styles.sectionHeader}><span><AdminIcon name="announcement" size={18} /></span><div><h2>ประกาศที่กำลังเผยแพร่</h2><p>ข้อมูลจาก PostgreSQL เรียงจากรายการล่าสุด</p></div><b>{announcements.length.toLocaleString('th-TH')}</b></header>

          <div className={styles.announcementList} aria-busy={loading}>
            {loading ? (
              <div className={styles.emptyState}><span><AdminIcon name="refresh" size={24} /></span><h3>กำลังโหลดประกาศ</h3><p>ระบบกำลังอ่านข้อมูลล่าสุด</p></div>
            ) : announcements.length === 0 ? (
              <div className={styles.emptyState}><span><AdminIcon name="announcement" size={24} /></span><h3>ยังไม่มีประกาศ</h3><p>ใช้แบบฟอร์มเพื่อสร้างประกาศแรก</p></div>
            ) : announcements.map(item => {
              const config = priorityConfig[item.priority]
              const isBusy = busyAction?.endsWith(item.id) ?? false
              return (
                <article className={styles.announcementCard} data-tone={config.tone} key={item.id}>
                  <div className={styles.announcementTop}>
                    <span className={styles.typeBadge} data-tone={config.tone}>{config.label}</span>
                    <div className={styles.rowActions}>
                      <button className={styles.iconButton} type="button" aria-label={`แก้ไขประกาศ ${item.title}`} title="แก้ไขประกาศ" onClick={() => openEdit(item)} disabled={isBusy}><AdminIcon name="edit" size={14} /></button>
                      <button className={styles.iconButtonDanger} type="button" aria-label={`ลบประกาศ ${item.title}`} title="ลบประกาศ" onClick={() => setDeleteTarget(item)} disabled={isBusy}><AdminIcon name="trash" size={14} /></button>
                    </div>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                  {item.linkUrl && <a href={item.linkUrl} target="_blank" rel="noopener noreferrer"><AdminIcon name="link" size={13} /><span>เปิดลิงก์ที่แนบ</span></a>}
                  <footer><span><AdminIcon name="clock" size={12} />{item.publishedAt}</span>{item.tags.length > 0 && <div>{item.tags.slice(0, 3).map(tag => <span key={tag}>#{tag}</span>)}</div>}</footer>
                </article>
              )
            })}
          </div>
        </section>
      </section>

      {deleteTarget && (
        <div className={styles.modalOverlay} onMouseDown={event => { if (event.target === event.currentTarget && !busyAction) setDeleteTarget(null) }}>
          <section className={`${styles.modal} ${styles.confirmModal}`} role="alertdialog" aria-modal="true" aria-labelledby="delete-news-title">
            <div className={styles.confirmIcon}><AdminIcon name="trash" size={22} /></div>
            <h2 id="delete-news-title">ยืนยันการลบประกาศ</h2>
            <p>ประกาศ “{deleteTarget.title}” จะไม่แสดงบนแดชบอร์ดครูอีกต่อไป</p>
            <div className={styles.modalActions}><button type="button" onClick={() => setDeleteTarget(null)} disabled={Boolean(busyAction)}>ยกเลิก</button><button className={styles.dangerButton} type="button" onClick={() => void handleDelete()} disabled={Boolean(busyAction)}>{busyAction ? 'กำลังลบ' : 'ลบประกาศ'}</button></div>
          </section>
        </div>
      )}
    </main>
  )
}
