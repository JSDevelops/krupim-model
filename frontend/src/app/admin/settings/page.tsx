'use client'
import { useState } from 'react'

export default function AdminSettingsPage() {
  const [apiKey, setApiKey] = useState('AIzaSyAkk92tJrfj-f5R40wPyHIRquBK1qdCIdE')
  const [dbUrl, setDbUrl] = useState('https://your-project.supabase.co')
  const [dbKey, setDbKey] = useState('your-anon-key')
  const [schoolName, setSchoolName] = useState('วิทยาลัยอาชีวศึกษากรุงเทพ')
  const [maintenance, setMaintenance] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      {/* Header */}
      <div className="erp-card">
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>⚙️ ตั้งค่าความปลอดภัยและเชื่อมโยงระบบ (System Config)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          จัดการ API Keys สำหรับประมวลผล Gemini AI, ตรวจสอบที่อยู่ฐานข้อมูล Supabase และตั้งค่าการบำรุงรักษาระบบ
        </p>
      </div>

      {isSaved && (
        <div style={{ padding: '16px', background: '#EAF3EE', border: '1.5px solid rgba(201,168,76,0.3)', color: '#1E4D3A', borderRadius: '12px', fontWeight: 700 }}>
          ✓ บันทึกการเปลี่ยนแปลงข้อมูลระบบสำเร็จ! ระบบเริ่มอัพเดทค่า config ใหม่แล้ว
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#1E4D3A' }}>🤖 ปัญญาประดิษฐ์ (Generative AI Integration)</h3>
          <div className="erp-form-group">
            <label className="erp-label">Google Gemini API Key</label>
            <input
              type="password"
              className="erp-input"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              ใช้สำหรับฟีเจอร์ Gemini Chat, AI Scan (Vision) และ AI Simulation feedback
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#1E4D3A' }}>🗄️ การเชื่อมต่อฐานข้อมูล (Database Connection)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="erp-form-group">
              <label className="erp-label">Supabase Project URL</label>
              <input
                className="erp-input"
                value={dbUrl}
                onChange={e => setDbUrl(e.target.value)}
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-label">Supabase Anonymous Key</label>
              <input
                type="password"
                className="erp-input"
                value={dbKey}
                onChange={e => setDbKey(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#1E4D3A' }}>🏫 ข้อมูลทั่วไปขององค์กร (Organization Profile)</h3>
          <div className="erp-form-group">
            <label className="erp-label">ชื่อสถาบันหลัก (Default School)</label>
            <input
              className="erp-input"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#1E4D3A' }}>🔒 ความปลอดภัยและการตรวจสอบ (System Operations)</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#FBF6E9', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.3)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#A6882A' }}>เปิดใช้งาน Maintenance Mode</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                เมื่อเปิดใช้งาน นักเรียนและครูจะไม่สามารถเข้าใช้งานแพลตฟอร์มได้ชั่วคราว
              </div>
            </div>
            <input
              type="checkbox"
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              checked={maintenance}
              onChange={e => setMaintenance(e.target.checked)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '14px', border: 'none', fontWeight: 700, fontSize: '14px', marginTop: '10px' }}>
          บันทึกการเปลี่ยนแปลงทั้งหมด
        </button>

      </form>
    </div>
  )
}
