'use client'
import { useState, useEffect } from 'react'

export default function AdminSettingsPage() {
  const [activeProvider, setActiveProvider] = useState('gemini')
  const [geminiKey, setGeminiKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [claudeKey, setClaudeKey] = useState('')
  const [dbUrl, setDbUrl] = useState('')
  const [dbKey, setDbKey] = useState('')
  const [schoolName, setSchoolName] = useState('วิทยาลัยอาชีวศึกษากรุงเทพ')
  const [maintenance, setMaintenance] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // Key visibility states
  const [showGemini, setShowGemini] = useState(false)
  const [showOpenai, setShowOpenai] = useState(false)
  const [showClaude, setShowClaude] = useState(false)

  // Load configuration from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveProvider(localStorage.getItem('activeAiProvider') || 'gemini')
      setGeminiKey(localStorage.getItem('geminiApiKey') || '')
      setOpenaiKey(localStorage.getItem('openaiApiKey') || '')
      setClaudeKey(localStorage.getItem('claudeApiKey') || '')
      setDbUrl(localStorage.getItem('supabaseUrl') || 'https://zzkgzbdvyeansjxsylgw.supabase.co')
      setDbKey(localStorage.getItem('supabaseAnonKey') || '')
      setSchoolName(localStorage.getItem('schoolName') || 'วิทยาลัยอาชีวศึกษากรุงเทพ')
      setMaintenance(localStorage.getItem('maintenanceMode') === 'true')
    }
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeAiProvider', activeProvider)
      localStorage.setItem('geminiApiKey', geminiKey.trim())
      localStorage.setItem('openaiApiKey', openaiKey.trim())
      localStorage.setItem('claudeApiKey', claudeKey.trim())
      localStorage.setItem('supabaseUrl', dbUrl.trim())
      localStorage.setItem('supabaseAnonKey', dbKey.trim())
      localStorage.setItem('schoolName', schoolName.trim())
      localStorage.setItem('maintenanceMode', maintenance.toString())
      
      // Also update window public variables (local scope fallback)
      if (dbUrl) (window as any).NEXT_PUBLIC_SUPABASE_URL = dbUrl.trim()
      if (dbKey) (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY = dbKey.trim()
    }
    
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', padding: '16px' }}>
      {/* Header */}
      <div className="erp-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #EDE9E1' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E4D3A' }}>⚙️ ตั้งค่าความปลอดภัยและเชื่อมโยงระบบ (System Config)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          จัดการตัวเลือกผู้ให้บริการค่าย AI แบบแยกคีย์อิสระ, ตรวจสอบตำแหน่งฐานข้อมูล Supabase และตั้งค่าการบำรุงรักษาระบบ
        </p>
      </div>

      {isSaved && (
        <div style={{ padding: '16px', background: '#EAF3EE', border: '1.5px solid #22c55e', color: '#1E4D3A', borderRadius: '12px', fontWeight: 700 }}>
          ✓ บันทึกการเปลี่ยนแปลงข้อมูลระบบสำเร็จ! ระบบออนไลน์จะเริ่มใช้งานผู้ให้บริการค่าย AI ที่ระบุทันที
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="erp-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #EDE9E1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Active AI Provider Selector */}
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#1E4D3A' }}>🤖 ตั้งค่าการประมวลผลปัญญาประดิษฐ์ (Active AI Provider)</h3>
          
          <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>เลือกค่าย AI ที่ต้องการเปิดใช้งาน (Active System Engine)</label>
            <select
              style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #1E4D3A', fontSize: '13.5px', background: '#fff', fontWeight: 700, color: '#1E4D3A', cursor: 'pointer' }}
              value={activeProvider}
              onChange={e => setActiveProvider(e.target.value)}
            >
              <option value="gemini">Google Gemini (Model: gemini-2.0-flash)</option>
              <option value="openai">OpenAI (Model: gpt-4o-mini)</option>
              <option value="claude">Anthropic Claude (Model: claude-3-5-sonnet)</option>
            </select>
          </div>

          {/* AI Keys Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#FBFBFA', padding: '16px', borderRadius: '12px', border: '1px dashed #C9A84C' }}>
            
            {/* Google Gemini Key */}
            <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="erp-label" style={{ fontWeight: 700, fontSize: '12px', color: activeProvider === 'gemini' ? '#3b82f6' : '#6B6A5B' }}>
                1. Google Gemini API Key {activeProvider === 'gemini' && '🟢 (กำลังใช้งาน)'}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showGemini ? 'text' : 'password'}
                  className="erp-input"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px' }}
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="กรอกคีย์ AIzaSy..."
                />
                <button 
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  style={{ padding: '0 12px', background: '#F5F5F0', border: '1px solid #EDE9E1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                >
                  {showGemini ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </div>

            {/* OpenAI Key */}
            <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="erp-label" style={{ fontWeight: 700, fontSize: '12px', color: activeProvider === 'openai' ? '#10b981' : '#6B6A5B' }}>
                2. OpenAI API Key {activeProvider === 'openai' && '🟢 (กำลังใช้งาน)'}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showOpenai ? 'text' : 'password'}
                  className="erp-input"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px' }}
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder="กรอกคีย์ sk-proj-... หรือ sk-..."
                />
                <button 
                  type="button"
                  onClick={() => setShowOpenai(!showOpenai)}
                  style={{ padding: '0 12px', background: '#F5F5F0', border: '1px solid #EDE9E1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                >
                  {showOpenai ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </div>

            {/* Anthropic Claude Key */}
            <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="erp-label" style={{ fontWeight: 700, fontSize: '12px', color: activeProvider === 'claude' ? '#a78bfa' : '#6B6A5B' }}>
                3. Anthropic Claude API Key {activeProvider === 'claude' && '🟢 (กำลังใช้งาน)'}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showClaude ? 'text' : 'password'}
                  className="erp-input"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px' }}
                  value={claudeKey}
                  onChange={e => setClaudeKey(e.target.value)}
                  placeholder="กรอกคีย์ sk-ant-..."
                />
                <button 
                  type="button"
                  onClick={() => setShowClaude(!showClaude)}
                  style={{ padding: '0 12px', background: '#F5F5F0', border: '1px solid #EDE9E1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                >
                  {showClaude ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </div>

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
