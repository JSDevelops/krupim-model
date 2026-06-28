'use client'
import { useState } from 'react'

interface GeneratedBlog {
  title: string
  content: string
  excerpt: string
  readTime: string
  tags: string[]
}

export default function AIBlogWriterPage() {
  const [topic, setTopic] = useState('วิธีการจัดโต๊ะอาหารแบบ Fine Dining แบบมาตรฐานสากล')
  const [category, setCategory] = useState('Table Setting')
  const [tone, setTone] = useState('เป็นทางการและให้ความรู้')
  const [keywords, setKeywords] = useState('จัดโต๊ะอาหาร, Fine Dining, บริกรมืออาชีพ, แก้วไวน์')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [blog, setBlog] = useState<GeneratedBlog | null>(null)
  const [publishedBlogs, setPublishedBlogs] = useState<GeneratedBlog[]>([
    {
      title: 'ศิลปะการต้อนรับลูกค้าภาษาอังกฤษสไตล์โรงแรมห้าดาว',
      excerpt: 'เรียนรู้ประโยคและเทคนิคระดับสูงในการต้อนรับและแนะนำเมนูอาหารสำหรับนักศึกษาวิชาชีพการโรงแรม',
      content: '### ศิลปะการต้อนรับลูกค้าภาษาอังกฤษ\n\nการบริการที่เป็นเลิศเริ่มต้นด้วยคำทักทายแรกพบ ต่อไปนี้เป็นประโยคที่ควรจดจำ:\n\n1. **Greeting:** "Good evening, welcome to FINE Restaurant. Do you have a reservation?"\n2. **Escorting:** "Please follow me, I will show you to your table."\n3. **Seating:** "Please be seated. Here is your menu."',
      readTime: '4 นาที',
      tags: ['English', 'Service tips']
    }
  ])

  async function generateBlog() {
    if (!topic) return
    setLoading(true)
    setError('')
    setBlog(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const resp = await fetch(`${backendUrl}/api/blog/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category, tone, keywords })
      })

      if (!resp.ok) {
        throw new Error('ระบบ AI เกิดข้อผิดพลาดชั่วคราว โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือ API Key')
      }

      const data = await resp.json()
      setBlog(data)
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการติดต่อระบบ AI')
    } finally {
      setLoading(false)
    }
  }

  function publishBlog() {
    if (!blog) return
    setPublishedBlogs(prev => [blog, ...prev])
    setBlog(null)
    alert('เผยแพร่บทความการศึกษาเข้าสู่ระบบสำเร็จ! นักเรียนและผู้ใช้จะเห็นในหน้าบอร์ดความรู้')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Header Card */}
      <div className="erp-card">
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>✍️ ระบบสร้างบทความอัจฉริยะ (AI Blog Writer)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          ใช้ระบบ AI (Gemini 2.0 Flash) ร่างบทความวิชาการสำหรับการเสิร์ฟ จัดโต๊ะอาหาร และคำศัพท์บริการได้ทันที
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Editor Form */}
        <div className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid #EDE9E1', paddingBottom: '10px', color: '#1E4D3A' }}>
            ⚙️ ตั้งค่าความต้องการบทความ
          </h3>

          <div className="erp-form-group">
            <label className="erp-label">หัวข้อบทความหลัก (Topic)</label>
            <textarea
              className="erp-input"
              rows={3}
              style={{ width: '100%', resize: 'none' }}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="เช่น การรินไวน์อย่างถูกวิธีสำหรับบริกร..."
            />
          </div>

          <div className="erp-form-group">
            <label className="erp-label">หมวดหมู่เนื้อหา (Category)</label>
            <select className="erp-input" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Table Setting">การจัดโต๊ะอาหาร (Table Setting)</option>
              <option value="Hospitality English">ภาษาอังกฤษบริการ (Hospitality English)</option>
              <option value="Restaurant Service">เทคนิคการบริการอาหาร (Restaurant Service)</option>
              <option value="Wine & Beverage">การจัดการไวน์และเครื่องดื่ม (Wine & Beverage)</option>
            </select>
          </div>

          <div className="erp-form-group">
            <label className="erp-label">โทนเสียงบทความ (Tone & Style)</label>
            <select className="erp-input" value={tone} onChange={e => setTone(e.target.value)}>
              <option value="เป็นทางการและวิชาการระดับสูง">เป็นทางการและอิงวิชาการ (Professional)</option>
              <option value="เป็นกันเอง สนุกสนาน เข้าใจง่าย">เป็นกันเอง เข้าใจง่าย (Conversational)</option>
              <option value="หรูหราสร้างแรงบันดาลใจแบบโรงแรม 6 ดาว">หรูหราสร้างแรงบันดาลใจ (Premium Luxury)</option>
            </select>
          </div>

          <div className="erp-form-group">
            <label className="erp-label">คำสำคัญ SEO (Keywords)</label>
            <input
              className="erp-input"
              placeholder="คั่นด้วยเครื่องหมายจุลภาค ,"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FAE8EB', color: '#8B2635', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(139,38,53,0.2)' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={generateBlog}
            disabled={loading}
            className="btn btn-primary"
            style={{ border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 700 }}
          >
            {loading ? 'กำลังเขียนบทความประมวลผล AI...' : '✦ เขียนบทความด้วย AI'}
          </button>
        </div>

        {/* Live Preview Area */}
        <div className="erp-card" style={{ minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid #EDE9E1', paddingBottom: '10px', color: '#1E4D3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📝 ตัวอย่างพรีวิวบทความ</span>
            {blog && (
              <span className="badge" style={{ background: '#EAF3EE', color: '#1E4D3A' }}>{blog.readTime}</span>
            )}
          </h3>

          {!blog && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '8px' }}>
              <span style={{ fontSize: '40px' }}>✍️</span>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>ยังไม่มีบทความที่สร้างขณะนี้</div>
              <div style={{ fontSize: '12px', maxWidth: '280px' }}>กรอกความต้องการบทความด้านซ้าย และกดปุ่มสร้างบทความด้วย AI</div>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', borderColor: 'rgba(201,168,76,0.2)', borderTopColor: '#C9A84C' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#C9A84C' }}>Gemini กำลังร่างเนื้อหาวิชาการและโครงสร้าง Markdown...</div>
            </div>
          )}

          {blog && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ overflowY: 'auto', maxHeight: '420px', paddingRight: '4px', marginBottom: '16px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', lineHeight: 1.4 }}>{blog.title}</h1>
                
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: '#F5F0E6', color: '#A6882A', fontWeight: 600 }}>{category}</span>
                  {blog.tags?.map(t => (
                    <span key={t} className="badge" style={{ background: '#EDE9E1', color: '#4A4138' }}>#{t}</span>
                  ))}
                </div>

                <div style={{ fontSize: '13px', padding: '10px 14px', background: '#FBF6E9', borderLeft: '4px solid #C9A84C', borderRadius: '0 8px 8px 0', color: 'var(--text-secondary)', marginBottom: '16px', fontStyle: 'italic' }}>
                  {blog.excerpt}
                </div>

                <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {blog.content}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #EDE9E1', paddingTop: '16px' }}>
                <button
                  onClick={() => setBlog(null)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '10px' }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={publishBlog}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '10px', border: 'none' }}
                >
                  ✦ เผยแพร่บทความเข้าระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Published Blogs Directory */}
      <div className="erp-card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1E4D3A' }}>📚 คลังบทความการเรียนการสอน (Published Articles)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {publishedBlogs.map((b, i) => (
            <div key={i} style={{ background: '#FDFAF4', border: '1px solid rgba(201,168,76,0.20)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(16,43,31,0.04)' }}>
              <div>
                <span className="badge" style={{ background: '#EAF3EE', color: '#1E4D3A', fontSize: '10px', fontWeight: 700, marginBottom: '6px' }}>{b.readTime} อ่าน</span>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{b.title}</h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>{b.excerpt}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EDE9E1', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#A6882A', fontWeight: 600 }}>{category}</span>
                <span style={{ fontSize: '12px', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }}>อ่านบทความเต็ม ›</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
