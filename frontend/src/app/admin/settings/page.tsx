'use client'
import { useState, useEffect } from 'react'

export default function AdminSettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [dbUrl, setDbUrl] = useState('')
  const [dbKey, setDbKey] = useState('')
  const [schoolName, setSchoolName] = useState('วิทยาลัยอาชีวศึกษากรุงเทพ')
  const [maintenance, setMaintenance] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  // Load configuration from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiKey(localStorage.getItem('geminiApiKey') || '')
      setDbUrl(localStorage.getItem('supabaseUrl') || 'https://zzkgzbdvyeansjxsylgw.supabase.co')
      setDbKey(localStorage.getItem('supabaseAnonKey') || '')
      setSchoolName(localStorage.getItem('schoolName') || 'วิทยาลัยอาชีวศึกษากรุงเทพ')
      setMaintenance(localStorage.getItem('maintenanceMode') === 'true')
    }
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('geminiApiKey', apiKey.trim())
      localStorage.setItem('supabaseUrl', dbUrl.trim())
      localStorage.setItem('supabaseAnonKey', dbKey.trim())
      localStorage.setItem('schoolName', schoolName.trim())
      localStorage.setItem('maintenanceMode', maintenance.toString())
      
      // Also update the Next.js process variables if possible (local scope)
      if (dbUrl) (window as any).NEXT_PUBLIC_SUPABASE_URL = dbUrl.trim()
      if (dbKey) (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY = dbKey.trim()
    }
    
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  // Auto-detect AI Provider from key prefix
  const getProviderName = () => {
    if (!apiKey) return 'เซิร์ฟเวอร์หลัก (Default)'
    if (apiKey.startsWith('sk-')) return 'OpenAI (GPT-4o-mini)'
    if (apiKey.startsWith('AIzaSy')) return 'Google Gemini'
    return 'ไม่รู้จักรูปแบบคีย์'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', padding: '16px' }}>
      {/* Header */}
      <div className="erp-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #EDE9E1' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E4D3A' }}>⚙️ ตั้งค่าความปลอดภัยและเชื่อมโยงระบบ (System Config)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          จัดการ API Keys สำหรับระบบ AI สแกน/แชท, ตรวจสอบตำแหน่งฐานข้อมูล Supabase และตั้งค่าการบำรุงรักษาระบบจากเบราว์เซอร์
        </p>
      </div>

      {isSaved && (
        <div style={{ padding: '16px', background: '#EAF3EE', border: '1.5px solid #22c55e', color: '#1E4D3A', borderRadius: '12px', fontWeight: 700 }}>
          ✓ บันทึกการเปลี่ยนแปลงข้อมูลระบบสำเร็จ! ระบบหน้าเว็บจะเริ่มอ้างอิงค่าการตั้งค่าใหม่นี้ในการสแกนและแชทครั้งถัดไป
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="erp-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #EDE9E1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#1E4D3A' }}>🤖 ปัญญาประดิษฐ์ (Generative AI Integration)</h3>
          
          <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#F5F5F0', borderRadius: '8px', fontSize: '12.5px', color: '#6B6A5B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ระบบตรวจพบผู้ให้บริการจากคีย์:</span>
            <strong style={{ color: apiKey.startsWith('sk-') ? '#10b981' : apiKey.startsWith('AIzaSy') ? '#3b82f6' : '#888' }}>
              {getProviderName()}
            </strong>
          </div>

          <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>API Key สำหรับประมวลผล (Gemini หรือ OpenAI Key)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type={showKey ? 'text' : 'password'}
                className="erp-input"
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="กรอกคีย์ sk-proj-... หรือ AIzaSy..."
              />
              <button 
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{ padding: '0 12px', background: '#F5F5F0', border: '1px solid #EDE9E1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
              >
                {showKey ? 'ซ่อน' : 'แสดง'}
              </button>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'block', lineHeight: 1.4 }}>
              💡 <strong>คำแนะนำการกรอก:</strong><br />
              - คีย์ของ <strong>OpenAI</strong> จะขึ้นต้นด้วย <code>sk-...</code> (ระบบจะสลับหลังบ้านไปเรียก GPT-4o-mini แทนให้ทันที)<br />
              - คีย์ของ <strong>Gemini</strong> จะขึ้นต้นด้วย <code>AIzaSy...</code>
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#1E4D3A' }}>🗄️ การเชื่อมต่อฐานข้อมูล (Database Connection)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>Supabase Project URL</label>
              <input
                className="erp-input"
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }}
                value={dbUrl}
                onChange={e => setDbUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
              />
            </div>
            <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>Supabase Anonymous Key</label>
              <input
                type="password"
                className="erp-input"
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }}
                value={dbKey}
                onChange={e => setDbKey(e.target.value)}
                placeholder="eyJhbGciOi..."
              />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#1E4D3A' }}>🏫 ข้อมูลทั่วไปขององค์กร (Organization Profile)</h3>
          <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>ชื่อสถาบันหลัก (Default School)</label>
            <input
              className="erp-input"
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }}
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

        <button 
          type="submit" 
          style={{ 
            padding: '14px', 
            background: 'linear-gradient(135deg, #1E4D3A 0%, #103024 100%)', 
            color: 'white', 
            borderRadius: '8px', 
            border: 'none', 
            fontWeight: 700, 
            fontSize: '14px', 
            marginTop: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16,48,36,0.2)'
          }}
        >
          บันทึกการเปลี่ยนแปลงทั้งหมด
        </button>

      </form>
    </div>
  )
}
