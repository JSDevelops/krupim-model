'use client'
import { useState } from 'react'

interface ContentItem {
  id: string
  type: 'AR Object' | 'AI Scan' | 'Simulation' | 'Lesson'
  name: string
  nameEn: string
  unit: string
  status: 'published' | 'draft'
  emoji: string
}

const initialContent: ContentItem[] = [
  { id: 'cnt-001', type: 'AR Object', name: 'เครื่องชงกาแฟ Espresso', nameEn: 'Espresso Machine', unit: 'Unit 1', status: 'published', emoji: '☕' },
  { id: 'cnt-002', type: 'AR Object', name: 'แก้วไวน์แดงทรง Bordeaux', nameEn: 'Red Wine Glass', unit: 'Unit 1', status: 'published', emoji: '🍷' },
  { id: 'cnt-003', type: 'AI Scan', name: 'จานอาหารหลัก', nameEn: 'Main Course Plate', unit: 'Unit 2', status: 'published', emoji: '🍽️' },
  { id: 'cnt-004', type: 'Simulation', name: 'รับลูกค้าเข้าร้านอาหาร', nameEn: 'Guest Arrival Scenario', unit: 'Unit 3', status: 'published', emoji: '🎭' },
  { id: 'cnt-005', type: 'Lesson', name: 'มาตรฐานการจัดโต๊ะแบบยุโรป', nameEn: 'European Table Setting Standard', unit: 'Unit 2', status: 'draft', emoji: '📚' },
]

const typeColors: Record<string, { bg: string; color: string }> = {
  'AR Object': { bg: '#E3F2FD', color: '#1565C0' },
  'AI Scan': { bg: '#F3E5F5', color: '#7B1FA2' },
  'Simulation': { bg: '#FFEBEE', color: '#C62828' },
  'Lesson': { bg: '#E0F2F1', color: '#00897B' },
}

export default function AdminContentPage() {
  const [content, setContent] = useState(initialContent)
  const [activeTab, setActiveTab] = useState<'all' | 'AR Object' | 'AI Scan' | 'Simulation' | 'Lesson'>('all')
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  
  const [newName, setNewName] = useState('')
  const [newNameEn, setNewNameEn] = useState('')
  const [newType, setNewType] = useState<'AR Object' | 'AI Scan' | 'Simulation' | 'Lesson'>('AR Object')
  const [newUnit, setNewUnit] = useState('Unit 1')
  const [newEmoji, setNewEmoji] = useState('📦')

  const filtered = content.filter(c => {
    const matchTab = activeTab === 'all' || c.type === activeTab
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.nameEn.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  function toggleStatus(id: string) {
    setContent(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'published' ? 'draft' : 'published' } : c))
  }

  function handleDelete(id: string) {
    if (confirm('คุณต้องการลบเนื้อหานี้ออกจากระบบการสอนหรือไม่?')) {
      setContent(prev => prev.filter(c => c.id !== id))
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName || !newNameEn) return
    const newItem: ContentItem = {
      id: `cnt-00${content.length + 1}`,
      type: newType,
      name: newName,
      nameEn: newNameEn,
      unit: newUnit,
      status: 'draft',
      emoji: newEmoji
    }
    setContent(prev => [...prev, newItem])
    setNewName('')
    setNewNameEn('')
    setShowAddModal(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>📦 ระบบจัดการเนื้อหาการเรียนการสอน (Content Builder)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            อัพโหลดโมเดล 3D, จัดเตรียมภาพอ้างอิงสำหรับ AI Scan, วางบทสนทนาจำลอง และเตรียมบทเรียน F&B
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700 }}>
          ➕ สร้างเนื้อหาใหม่
        </button>
      </div>

      {/* Tabs list */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '4px' }}>
        {(['all', 'AR Object', 'AI Scan', 'Simulation', 'Lesson'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', border: 'none', background: 'transparent',
              fontFamily: 'var(--font-primary)', fontSize: '14px', fontWeight: 700,
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            {tab === 'all' ? 'เนื้อหาทั้งหมด' : tab}
          </button>
        ))}
      </div>

      {/* Filters and List */}
      <div className="erp-card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <input
            className="erp-input"
            placeholder="ค้นหาชื่อเนื้อหา..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>สัญลักษณ์</th>
                <th>ประเภท</th>
                <th>ชื่อเนื้อหา (TH)</th>
                <th>ชื่อภาษาอังกฤษ (EN)</th>
                <th>หน่วยการเรียน (Unit)</th>
                <th>สถานะเผยแพร่</th>
                <th style={{ textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const ts = typeColors[item.type]
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ width: 44, height: 44, background: '#F8F9FD', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                        {item.emoji}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: ts.bg, color: ts.color, fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px' }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{item.nameEn}</td>
                    <td style={{ fontWeight: 600 }}>{item.unit}</td>
                    <td>
                      <span onClick={() => toggleStatus(item.id)} style={{
                        cursor: 'pointer',
                        background: item.status === 'published' ? '#E8F5E9' : '#FFF8E1',
                        color: item.status === 'published' ? '#2E7D32' : '#FB8C00',
                        fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px'
                      }}>
                        ● {item.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>แก้ไข</button>
                        <button onClick={() => handleDelete(item.id)} className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--error)', borderColor: 'var(--error-light)' }}>ลบ</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="erp-card" style={{ width: '450px', background: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>📦 เพิ่มเนื้อหาใหม่</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="erp-form-group">
                <label className="erp-label">ชื่อเนื้อหา (TH)</label>
                <input className="erp-input" placeholder="เช่น แก้วเชมเปญ" value={newName} onChange={e => setNewName(e.target.value)} required />
              </div>
              <div className="erp-form-group">
                <label className="erp-label">ชื่อภาษาอังกฤษ (EN)</label>
                <input className="erp-input" placeholder="Champagne Flute Glass" value={newNameEn} onChange={e => setNewNameEn(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">ประเภทเนื้อหา</label>
                  <select className="erp-input" value={newType} onChange={e => setNewType(e.target.value as any)}>
                    <option value="AR Object">AR Object (3D)</option>
                    <option value="AI Scan">AI Scan</option>
                    <option value="Simulation">Simulation</option>
                    <option value="Lesson">Lesson (บทเรียน)</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">หน่วยเรียน (Unit)</label>
                  <select className="erp-input" value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                    <option value="Unit 1">Unit 1</option>
                    <option value="Unit 2">Unit 2</option>
                    <option value="Unit 3">Unit 3</option>
                    <option value="Unit 4">Unit 4</option>
                  </select>
                </div>
              </div>
              <div className="erp-form-group">
                <label className="erp-label">Emoji ไอคอน (ชั่วคราว)</label>
                <input className="erp-input" placeholder="🥂" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 700 }}>
                สร้างเนื้อหา (บันทึกร่าง)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
