'use client'
import { useState, useEffect } from 'react'

interface Announcement {
  id: string
  title: string
  content: string
  priority: 'urgent' | 'general' | 'event'
  tags: string[]
  publishedAt: string
  linkUrl?: string
}

export default function AdminNewsPage() {
  const [topic, setTopic] = useState('แจ้งเตือนการอัปเดตโมเดล 3D แก้วเครื่องดื่มและมีดสเต็กตัวใหม่')
  const [priority, setPriority] = useState<'urgent' | 'general' | 'event'>('general')
  const [keywords, setKeywords] = useState('อุปกรณ์จัดโต๊ะ, อัปเดตโมเดล, 3D AR')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('https://krupim-finemodel3d-ar.com')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [publishedNews, setPublishedNews] = useState<Announcement[]>([])

  // Load published news on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('systemNews')
      if (stored) {
        try {
          setPublishedNews(JSON.parse(stored))
        } catch (e) {}
      } else {
        const defaultNews: Announcement[] = [
          {
            id: 'news-001',
            title: '📣 ขอความร่วมมือครูผู้สอนเร่งการประเมิน Rubric เล่มจำลองสถานการณ์',
            content: 'ขอแจ้งความร่วมมือให้คุณครูทุกท่านดำเนินการประเมินผลคะแนน Rubric ด้านคุณลักษณะ (Attribute) ของนักศึกษาให้เสร็จสิ้นภายในสิ้นสัปดาห์นี้ เพื่อเตรียมออกใบรับรองสมรรถนะ FINE Model',
            priority: 'urgent',
            tags: ['การประเมิน', 'คุณลักษณะ'],
            publishedAt: '28 มิ.ย. 2026, 08:30 น.'
          }
        ]
        setPublishedNews(defaultNews)
        localStorage.setItem('systemNews', JSON.stringify(defaultNews))
      }
    }
  }, [])

  const saveNewsToStorage = (updatedList: Announcement[]) => {
    setPublishedNews(updatedList)
    if (typeof window !== 'undefined') {
      localStorage.setItem('systemNews', JSON.stringify(updatedList))
    }
  }

  // AI generation of announcement body
  async function generateWithAI() {
    if (!topic) return
    setLoading(true)
    setError('')
    setContent('')

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://krupim-model-production.up.railway.app'
      const provider = localStorage.getItem('activeAiProvider') || 'gemini'
      const geminiKey = localStorage.getItem('geminiApiKey') || ''
      const openaiKey = localStorage.getItem('openaiApiKey') || ''
      const claudeKey = localStorage.getItem('claudeApiKey') || ''

      const resp = await fetch(`${backendUrl}/api/blog/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-provider': provider,
          'x-gemini-key': geminiKey,
          'x-openai-key': openaiKey,
          'x-claude-key': claudeKey
        },
        body: JSON.stringify({
          topic: `เขียนประกาศข่าวสารระบบการศึกษาโรงเรียนอาชีวะสั้นๆ หัวข้อ: "${topic}"`,
          category: 'ข่าวสารและกิจกรรม',
          tone: 'กระชับ สุภาพ เป็นทางการ',
          keywords
        })
      })

      if (!resp.ok) {
        throw new Error('AI ล้มเหลว กรุณาตรวจสอบ API Keys ในหน้าตั้งค่า หรือเขียนเนื้อหาด้วยตนเอง')
      }

      const data = await resp.json()
      setContent(data.content || data.excerpt || '')
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างเนื้อหาด้วย AI')
    } finally {
      setLoading(false)
    }
  }

  function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    if (!topic || !content) {
      alert('กรุณากรอกหัวเรื่องและเนื้อหาก่อนเผยแพร่')
      return
    }

    const now = new Date()
    const thaiDate = now.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + `, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`

    const newAnnouncement: Announcement = {
      id: `news-${Date.now()}`,
      title: (priority === 'urgent' ? '🚨 [ด่วนที่สุด] ' : priority === 'event' ? '📅 [กิจกรรม] ' : '📣 ') + topic.trim(),
      content: content.trim(),
      priority,
      tags: keywords.split(',').map(k => k.trim()).filter(Boolean),
      publishedAt: thaiDate,
      linkUrl: linkUrl.trim() || undefined
    }

    const updated = [newAnnouncement, ...publishedNews]
    saveNewsToStorage(updated)
    
    // Clear inputs
    setTopic('')
    setContent('')
    setKeywords('')
    setLinkUrl('')
    alert('ส่งกระจายประกาศและกิจกรรมแจ้งไปยังแดชบอร์ดคุณครูสำเร็จเรียบร้อย! 📢')
  }

  function handleDeleteNews(id: string) {
    if (confirm('คุณต้องการลบข่าวประกาศกิจกรรมชิ้นนี้หรือไม่?')) {
      const updated = publishedNews.filter(n => n.id !== id)
      saveNewsToStorage(updated)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="erp-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #EDE9E1' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E4D3A' }}>📢 ระบบแจ้งข่าวสารและกิจกรรมไปยังครูผู้สอน (News & Events Dispatcher)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          [ผู้ดูแลระบบ] เขียนกระจายข่าวสาร ประกาศด่วน หรืออัปเดตกิจกรรมส่งตรงไปยังหน้าแรก (Dashboard) ของครูผู้สอนทุกคนในระบบพร้อมกัน
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Editor Form */}
        <form onSubmit={handlePublish} className="erp-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #EDE9E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid #EDE9E1', paddingBottom: '10px', color: '#1E4D3A' }}>
            ✏️ เขียนประกาศ/สร้างกิจกรรม
          </h3>

          <div className="erp-form-group">
            <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>ระดับความสำคัญ (Priority)</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              {[
                { value: 'urgent', label: '🚨 ด่วนที่สุด (Urgent)', color: '#8B2635' },
                { value: 'general', label: '📣 ข่าวทั่วไป (General)', color: '#1E4D3A' },
                { value: 'event', label: '📅 กิจกรรมเด่น (Event)', color: '#A6882A' }
              ].map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value as any)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: priority === p.value ? p.color : '#EDE9E1',
                    background: priority === p.value ? `${p.color}15` : '#fff',
                    color: p.color,
                    fontWeight: 700,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="erp-form-group">
            <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>หัวข้อกิจกรรม/ชื่อเรื่อง</label>
            <input
              className="erp-input"
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px' }}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="เช่น การส่งรายชื่อนักศึกษาประกวดสแกน AR อุปกรณ์โต๊ะ..."
              required
            />
          </div>

          <div className="erp-form-group">
            <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>
              เนื้อหารายละเอียดข่าวประกาศ
            </label>
            <textarea
              className="erp-input"
              rows={6}
              style={{ width: '100%', resize: 'none', padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px', lineHeight: 1.5 }}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="กรอกเนื้อหารายละเอียด หรือ ให้ AI ช่วยร่างเบื้องต้นโดยคลิกปุ่มสีทองด้านล่าง..."
              required
            />
          </div>

          <div className="erp-form-group">
            <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>ป้ายกำกับคีย์เวิร์ด (คั่นด้วยจุลภาค ,)</label>
            <input
              className="erp-input"
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px' }}
              placeholder="เช่น อัปเดต, เกณฑ์การประเมิน, การจัดโต๊ะ"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
            />
          </div>

          <div className="erp-form-group">
            <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>ลิงก์แนบข่าวสาร/กิจกรรม (Link URL - ถ้ามี)</label>
            <input
              className="erp-input"
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px' }}
              placeholder="เช่น https://google.com หรือ ลิงก์แบบฟอร์ม"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FAE8EB', color: '#8B2635', borderRadius: '8px', fontSize: '12.5px', border: '1px solid rgba(139,38,53,0.2)' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={generateWithAI}
              disabled={loading || !topic}
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(201,168,76,0.15)',
                border: '1.5px solid #C9A84C',
                color: '#A6882A',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'กำลังร่างข่าว...' : '✨ ให้ AI ร่างเนื้อหา'}
            </button>
            <button
              type="submit"
              style={{
                flex: 1.5,
                padding: '12px',
                background: 'linear-gradient(135deg, #1E4D3A 0%, #103024 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16,48,36,0.2)'
              }}
            >
              📢 ประกาศข่าวสารด่วน
            </button>
          </div>
        </form>

        {/* Live Active News Board */}
        <div className="erp-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #EDE9E1', display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid #EDE9E1', paddingBottom: '10px', color: '#1E4D3A' }}>
            📡 บอร์ดข่าวสารคุณครูที่กำลังออนไลน์ (Active Notices Feed)
          </h3>

          {publishedNews.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '8px' }}>
              <span style={{ fontSize: '40px' }}>📡</span>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>ไม่มีประกาศข่าวสารในขณะนี้</div>
              <div style={{ fontSize: '12px', maxWidth: '280px' }}>สร้างข่าวสารใหม่ทางแถบซ้ายเพื่อออกประกาศไปยังแดชบอร์ดคุณครู</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
              {publishedNews.map(news => (
                <div key={news.id} style={{ padding: '16px', background: '#FDFAF4', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      background: news.priority === 'urgent' ? '#FAE8EB' : news.priority === 'event' ? '#FBF6E9' : '#EAF3EE',
                      color: news.priority === 'urgent' ? '#8B2635' : news.priority === 'event' ? '#A6882A' : '#1E4D3A',
                      fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase'
                    }}>
                      {news.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteNews(news.id)}
                      style={{ background: 'transparent', border: 'none', color: '#8B2635', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                    >
                      ลบ
                    </button>
                  </div>

                  <h4 style={{ fontSize: '14.5px', fontWeight: 800, marginTop: '8px', color: '#1E4D3A' }}>{news.title}</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '6px', whiteSpace: 'pre-wrap' }}>{news.content}</p>
                  {news.linkUrl && (
                    <div style={{ marginTop: '8px', fontSize: '12px' }}>
                      <a href={news.linkUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#A6882A', fontWeight: 700, textDecoration: 'underline' }}>
                        🔗 ลิงก์แนบ: {news.linkUrl}
                      </a>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #EDE9E1', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>📅 โพสต์เมื่อ: {news.publishedAt}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {news.tags.map(t => (
                        <span key={t} style={{ background: '#EDE9E1', color: '#554D41', padding: '1px 6px', borderRadius: '4px' }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
