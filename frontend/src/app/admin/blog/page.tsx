'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import AdminIcon from '@/components/admin/AdminIcon'
import { authenticatedFetch } from '@/lib/api'
import styles from '../adminPages.module.css'

type AnnouncementPriority = 'urgent' | 'general' | 'event'
type TargetAudience = 'all' | 'teachers' | 'students'

interface Announcement {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  targetAudience: TargetAudience
  isPushNotification: boolean
  startsAt: string
  expiresAt?: string
  tags: string[]
  publishedAt: string
  linkUrl?: string
}

interface AnnouncementRecord {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  target_audience?: TargetAudience
  is_push_notification?: boolean
  starts_at?: string
  expires_at?: string | null
  tags: string[]
  link_url: string | null
  published_at: string
}

const priorityConfig: Record<AnnouncementPriority, { label: string; description: string; tone: string }> = {
  urgent: { label: 'ประกาศด่วน', description: 'เรื่องสำคัญที่ต้องดำเนินการ', tone: 'red' },
  general: { label: 'ข่าวทั่วไป', description: 'ข้อมูลและการอัปเดตระบบ', tone: 'green' },
  event: { label: 'กิจกรรม', description: 'กำหนดการและกิจกรรมเด่น', tone: 'gold' },
}

const audienceConfig: Record<TargetAudience, { label: string; description: string; icon: string }> = {
  all: { label: '👥 ทุกคน', description: 'ครูและนักเรียนทั้งหมด', icon: 'users' },
  teachers: { label: '👨‍🏫 เฉพาะครู', description: 'ครูผู้สอนทุกคน', icon: 'teacher' },
  students: { label: '🎒 เฉพาะนักเรียน', description: 'นักเรียนทุกคน', icon: 'student' },
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
    targetAudience: record.target_audience || 'all',
    isPushNotification: record.is_push_notification !== false,
    startsAt: record.starts_at || '',
    expiresAt: record.expires_at || undefined,
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
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('all')
  const [isPushNotification, setIsPushNotification] = useState(true)
  const [startsAt, setStartsAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
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
    setTargetAudience('all')
    setIsPushNotification(true)
    setStartsAt('')
    setExpiresAt('')
    setEditingId(null)
  }

  function openEdit(item: Announcement) {
    setTopic(item.title)
    setContent(item.content)
    setKeywords(item.tags.join(', '))
    setLinkUrl(item.linkUrl || '')
    setPriority(item.priority)
    setTargetAudience(item.targetAudience || 'all')
    setIsPushNotification(item.isPushNotification !== false)
    setStartsAt(item.startsAt ? item.startsAt.slice(0, 16) : '')
    setExpiresAt(item.expiresAt ? item.expiresAt.slice(0, 16) : '')
    setEditingId(item.id)
  }

  async function generateWithAI() {
    if (!topic.trim()) return
    setGenerating(true)
    try {
      const response = await authenticatedFetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          priority,
          keywords: keywords.split(',').map(keyword => keyword.trim()).filter(Boolean),
        }),
      })
      if (!response.ok) throw new Error(await getResponseError(response))
      const payload = await response.json() as { content?: string; tags?: string[] }
      if (payload.content) setContent(payload.content)
      if (payload.tags && payload.tags.length > 0) {
        setKeywords(current => {
          const merged = new Set([
            ...current.split(',').map(tag => tag.trim()).filter(Boolean),
            ...(payload.tags ?? []),
          ])
          return Array.from(merged).join(', ')
        })
      }
      toast.success('AI ช่วยร่างเนื้อหาประกาศแล้ว ตรวจสอบและแก้ไขต่อได้ทันที')
    } catch (aiError) {
      toast.error(aiError instanceof Error ? aiError.message : 'ไม่สามารถให้ AI ช่วยร่างเนื้อหาได้')
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
          ? { id: editingId, title, content: cleanContent, priority, targetAudience, isPushNotification, startsAt: startsAt || null, expiresAt: expiresAt || null, tags, linkUrl }
          : { title, content: cleanContent, priority, targetAudience, isPushNotification, startsAt: startsAt || null, expiresAt: expiresAt || null, tags, linkUrl }),
      })
      if (!response.ok) throw new Error(await getResponseError(response))
      const payload = await response.json() as { announcement: AnnouncementRecord }
      const saved = mapAnnouncement(payload.announcement)
      setAnnouncements(current => editingId
        ? current.map(item => item.id === editingId ? saved : item)
        : [saved, ...current])
      toast.success(
        editingId
          ? 'บันทึกการแก้ไขประกาศแล้ว'
          : isPushNotification
          ? `เผยแพร่ประกาศและส่ง Push Message ไปยัง${audienceConfig[targetAudience].label} เรียบร้อยแล้ว 🔔`
          : 'เผยแพร่ประกาศเรียบร้อยแล้ว'
      )
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
    <div className={styles.adminPage}>
      <header className={styles.pageHeader}>
        <div>
          <p>COMMUNICATION &amp; ANNOUNCEMENTS</p>
          <h1>ข่าวสารและประกาศระบบ</h1>
          <span>สื่อสารข้อมูลสำคัญ ข่าวสารวิชาการ และกิจกรรมไปยังครูและนักเรียน</span>
        </div>
      </header>

      {error && <div className={styles.error} role="alert"><p>{error}</p><button type="button" onClick={() => { setError(''); void loadAnnouncements() }}>ลองใหม่</button></div>}

      <section className={styles.metricsGrid} aria-label="สรุปข้อมูลประกาศ">
        {metrics.map(item => (
          <article className={styles.metricCard} data-tone={item.tone} key={item.label}>
            <span className={styles.metricIcon}><AdminIcon name={item.icon} size={20} /></span>
            <div className={styles.metricCopy}><span>{item.label}</span><strong>{item.value}</strong><small>{item.detail}</small></div>
          </article>
        ))}
      </section>

      <section className={styles.editorGrid}>
        <form id="announcement-editor" className={`${styles.panel} ${styles.editorPanel}`} data-tone="purple" onSubmit={handlePublish}>
          <header className={styles.sectionHeader}>
            <span><AdminIcon name={editingId ? 'edit' : 'announcement'} size={18} /></span>
            <div><h2>{editingId ? 'แก้ไขประกาศ' : 'เขียนประกาศใหม่'}</h2><p>{editingId ? 'ปรับข้อมูลแล้วบันทึกเพื่ออัปเดตทุกแดชบอร์ด' : 'กำหนดระดับความสำคัญ กลุ่มเป้าหมาย และระยะเวลาเผยแพร่'}</p></div>
          </header>

          <div className={`${styles.formBody} ${styles.compactEditorBody}`}>
            {/* ระดับความสำคัญ */}
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

            {/* กลุ่มเป้าหมาย (Target Audience) */}
            <fieldset className={styles.priorityFieldset}>
              <legend>กลุ่มเป้าหมายผู้รับข่าว (Target Audience)</legend>
              <div className={styles.priorityOptions}>
                {(Object.keys(audienceConfig) as TargetAudience[]).map(opt => (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={targetAudience === opt}
                    onClick={() => setTargetAudience(opt)}
                    disabled={Boolean(busyAction)}
                  >
                    <strong>{audienceConfig[opt].label}</strong>
                    <small>{audienceConfig[opt].description}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className={styles.field}><span>หัวข้อประกาศ</span><input required maxLength={240} value={topic} onChange={event => setTopic(event.target.value)} placeholder="ระบุหัวข้อที่ต้องการสื่อสาร" /></label>
            <label className={styles.field}><span>รายละเอียด</span><textarea className={styles.compactTextarea} required maxLength={10000} rows={5} value={content} onChange={event => setContent(event.target.value)} placeholder="เขียนรายละเอียด หรือให้ AI ช่วยร่างเนื้อหา" /></label>

            {/* กำหนดการเผยแพร่และหมดอายุ */}
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>📅 วัน-เวลาเริ่มเผยแพร่ (Starts At)</span>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={event => setStartsAt(event.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>⏳ วัน-เวลาหมดอายุ (Expires At)</span>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={event => setExpiresAt(event.target.value)}
                />
              </label>
            </div>

            {/* Push Notification Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 700, color: '#17392b', cursor: 'pointer', padding: '2px 0' }}>
              <input
                type="checkbox"
                checked={isPushNotification}
                onChange={event => setIsPushNotification(event.target.checked)}
                style={{ width: 17, height: 17, accentColor: '#2f7556', cursor: 'pointer' }}
              />
              <span>🔔 ส่งการแจ้งเตือน Push Message เข้ากระดิ่งทันทีเมื่อเผยแพร่</span>
            </label>

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
              const aud = audienceConfig[item.targetAudience] || audienceConfig.all
              const isBusy = busyAction?.endsWith(item.id) ?? false
              const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date()

              return (
                <article className={styles.announcementCard} data-tone={config.tone} key={item.id} style={isExpired ? { opacity: 0.6 } : undefined}>
                  <div className={styles.announcementTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className={styles.typeBadge} data-tone={config.tone}>{config.label}</span>
                      <span className={styles.typeBadge} style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}>
                        {aud.label}
                      </span>
                      {item.isPushNotification && (
                        <span style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>🔔 Push</span>
                      )}
                      {isExpired && (
                        <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700 }}>⏳ หมดอายุแล้ว</span>
                      )}
                    </div>
                    <div className={styles.rowActions}>
                      <button className={styles.iconButton} type="button" aria-label={`แก้ไขประกาศ ${item.title}`} title="แก้ไขประกาศ" onClick={() => openEdit(item)} disabled={isBusy}><AdminIcon name="edit" size={14} /></button>
                      <button className={styles.iconButtonDanger} type="button" aria-label={`ลบประกาศ ${item.title}`} title="ลบประกาศ" onClick={() => setDeleteTarget(item)} disabled={isBusy}><AdminIcon name="trash" size={14} /></button>
                    </div>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                  {item.linkUrl && <a href={item.linkUrl} target="_blank" rel="noopener noreferrer"><AdminIcon name="link" size={13} /><span>เปิดลิงก์ที่แนบ</span></a>}
                  <footer>
                    <span><AdminIcon name="clock" size={12} />{item.publishedAt}</span>
                    {item.tags.length > 0 && <div>{item.tags.slice(0, 3).map(tag => <span key={tag}>#{tag}</span>)}</div>}
                  </footer>
                </article>
              )
            })}
          </div>
        </section>
      </section>

      {deleteTarget && (
        <div className={styles.confirmBackdrop} role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
          <div className={styles.confirmDialog}>
            <span className={styles.confirmIcon} data-tone="red"><AdminIcon name="trash" size={24} /></span>
            <h3 id="confirm-delete-title">ยืนยันการลบประกาศ</h3>
            <p>ต้องการลบประกาศ <strong>“{deleteTarget.title}”</strong> ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelButton} type="button" onClick={() => setDeleteTarget(null)} disabled={Boolean(busyAction)}>ยกเลิก</button>
              <button className={styles.dangerButton} type="button" onClick={() => void handleDelete()} disabled={Boolean(busyAction)}><AdminIcon name="trash" size={16} />{busyAction ? 'กำลังลบ' : 'ยืนยันลบ'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
