'use client'
import { useState, useEffect } from 'react'

export default function AdminSettingsPage() {
  // Tabs: 'security' or 'uxui'
  const [settingsTab, setSettingsTab] = useState<'security' | 'uxui'>('security')
  const [isSaved, setIsSaved] = useState(false)

  // 🔐 1. Security & Core States
  const [activeProvider, setActiveProvider] = useState('gemini')
  const [geminiKey, setGeminiKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [claudeKey, setClaudeKey] = useState('')
  const [dbUrl, setDbUrl] = useState('')
  const [dbKey, setDbKey] = useState('')
  const [schoolName, setSchoolName] = useState('วิทยาลัยอาชีวศึกษากรุงเทพ')
  const [maintenance, setMaintenance] = useState(false)
  const [showGemini, setShowGemini] = useState(false)
  const [showOpenai, setShowOpenai] = useState(false)
  const [showClaude, setShowClaude] = useState(false)
  const [threeDAIStudioKey, setThreeDAIStudioKey] = useState('')
  const [showThreeDAIStudio, setShowThreeDAIStudio] = useState(false)

  // 🎨 2. UX/UI Preferences States (เวอร์ชันเต็มสมบูรณ์ที่สุด)
  const [themeMode, setThemeMode] = useState('forest-gold')
  const [fontFamily, setFontFamily] = useState('kanit')
  const [textSize, setTextSize] = useState('normal')
  const [transitionStyle, setTransitionStyle] = useState('smooth')
  const [layoutDensity, setLayoutDensity] = useState('comfortable')
  const [arQuality, setArQuality] = useState('hd')
  const [showArHelp, setShowArHelp] = useState('once')
  const [microInteractions, setMicroInteractions] = useState(true)

  // Load configs on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Security
      setActiveProvider(localStorage.getItem('activeAiProvider') || 'gemini')
      setGeminiKey(localStorage.getItem('geminiApiKey') || '')
      setOpenaiKey(localStorage.getItem('openaiApiKey') || '')
      setClaudeKey(localStorage.getItem('claudeApiKey') || '')
      setThreeDAIStudioKey(localStorage.getItem('threeDAIStudioKey') || '')
      setDbUrl(localStorage.getItem('supabaseUrl') || 'https://zzkgzbdvyeansjxsylgw.supabase.co')
      setDbKey(localStorage.getItem('supabaseAnonKey') || '')
      setSchoolName(localStorage.getItem('schoolName') || 'วิทยาลัยอาชีวศึกษากรุงเทพ')
      setMaintenance(localStorage.getItem('maintenanceMode') === 'true')

      // UX/UI
      setThemeMode(localStorage.getItem('uxThemeMode') || 'forest-gold')
      setFontFamily(localStorage.getItem('uxFontFamily') || 'kanit')
      setTextSize(localStorage.getItem('uxTextSize') || 'normal')
      setTransitionStyle(localStorage.getItem('uxTransitionStyle') || 'smooth')
      setLayoutDensity(localStorage.getItem('uxLayoutDensity') || 'comfortable')
      setArQuality(localStorage.getItem('uxArQuality') || 'hd')
      setShowArHelp(localStorage.getItem('uxShowArHelp') || 'once')
      setMicroInteractions(localStorage.getItem('uxMicroInteractions') !== 'false')
    }
  }, [])

  function handleSaveSecurity(e: React.FormEvent) {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeAiProvider', activeProvider)
      localStorage.setItem('geminiApiKey', geminiKey.trim())
      localStorage.setItem('openaiApiKey', openaiKey.trim())
      localStorage.setItem('claudeApiKey', claudeKey.trim())
      localStorage.setItem('threeDAIStudioKey', threeDAIStudioKey.trim())
      localStorage.setItem('supabaseUrl', dbUrl.trim())
      localStorage.setItem('supabaseAnonKey', dbKey.trim())
      localStorage.setItem('schoolName', schoolName.trim())
      localStorage.setItem('maintenanceMode', maintenance.toString())
      
      if (dbUrl) (window as any).NEXT_PUBLIC_SUPABASE_URL = dbUrl.trim()
      if (dbKey) (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY = dbKey.trim()
    }
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  function handleSaveUXUI(e: React.FormEvent) {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('uxThemeMode', themeMode)
      localStorage.setItem('uxFontFamily', fontFamily)
      localStorage.setItem('uxTextSize', textSize)
      localStorage.setItem('uxTransitionStyle', transitionStyle)
      localStorage.setItem('uxLayoutDensity', layoutDensity)
      localStorage.setItem('uxArQuality', arQuality)
      localStorage.setItem('uxShowArHelp', showArHelp)
      localStorage.setItem('uxMicroInteractions', microInteractions.toString())

      // Immediately apply CSS styles & classes to document body
      if (typeof document !== 'undefined') {
        // Clear old classes
        document.body.className = document.body.className
          .split(' ')
          .filter(c => !c.startsWith('theme-') && !c.startsWith('font-') && !c.startsWith('density-'))
          .join(' ')

        // Add active settings classes
        document.body.classList.add(`theme-${themeMode}`)
        document.body.classList.add(`font-${textSize}`)
        document.body.classList.add(`density-${layoutDensity}`)

        // Set fontFamily variable on root body
        const fontsMap: Record<string, string> = {
          kanit: "'Kanit', sans-serif",
          sarabun: "'Sarabun', sans-serif",
          inter: "'Inter', sans-serif"
        }
        document.body.style.fontFamily = fontsMap[fontFamily] || 'sans-serif'
      }
    }
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const [clearing, setClearing] = useState(false)

  function handleClearCache() {
    if (confirm('คุณต้องการล้างแคชไฟล์ขยะ ข้อมูลการจำลองสถานการณ์ชั่วคราว และประวัติบันทึกความหน่วง API Ping บนเบราว์เซอร์เพื่อคืนพื้นที่ความจำหรือไม่? (ข้อมูลบัญชีผู้ใช้ คะแนนสมรรถนะนักเรียน และคีย์ AI จะถูกเก็บรักษาอย่างปลอดภัย)')) {
      setClearing(true)
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const savedKeys = [
            'registeredUsers',
            'schoolName',
            'supabaseUrl',
            'supabaseAnonKey',
            'activeAiProvider',
            'geminiApiKey',
            'openaiApiKey',
            'claudeApiKey',
            'threeDAIStudioKey',
            'classroomStudents',
            'uxThemeMode',
            'uxFontFamily',
            'uxTextSize',
            'uxTransitionStyle',
            'uxLayoutDensity',
            'uxArQuality',
            'uxShowArHelp',
            'uxMicroInteractions',
            'systemNews'
          ]
          
          const keysToDelete: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && !savedKeys.includes(key)) {
              keysToDelete.push(key)
            }
          }
          keysToDelete.forEach(k => localStorage.removeItem(k))
          sessionStorage.clear()
        }
        setClearing(false)
        alert('🧹 ล้างข้อมูลแคชขยะชั่วคราวสำเร็จ! (กู้คืนพื้นที่เบราว์เซอร์และหน่วยความจำโมเดล 3D ได้ลื่นไหลขึ้น)')
      }, 1200)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px', padding: '16px' }}>
      
      {/* Header Banner */}
      <div className="erp-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #EDE9E1' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E4D3A' }}>⚙️ แผงตั้งค่าผู้ดูแลระบบควบคุมหลัก (Developer Console)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          ปรับแต่งระบบหลังบ้าน เชื่อมโยงกุญแจความปลอดภัย และจัดการสกินส่วนแสดงผลติดต่อผู้เรียนระบบ FINE Model
        </p>
      </div>

      {isSaved && (
        <div style={{ padding: '16px', background: '#EAF3EE', border: '1.5px solid #22c55e', color: '#1E4D3A', borderRadius: '12px', fontWeight: 700 }}>
          ✓ บันทึกการอัปเดตการกำหนดค่าระบบสำเร็จแล้ว! ข้อมูลจะนำส่งกระจายไปยังฝั่งผู้ใช้ทันที
        </div>
      )}

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #EDE9E1', paddingBottom: '2px' }}>
        <button
          onClick={() => setSettingsTab('security')}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '14.5px',
            fontWeight: settingsTab === 'security' ? 800 : 500,
            color: settingsTab === 'security' ? '#1E4D3A' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '12px 24px',
            borderBottom: settingsTab === 'security' ? '3px solid #1E4D3A' : 'none',
            transition: 'all 0.2s'
          }}
        >
          🔐 ตั้งค่าระบบและความปลอดภัย
        </button>
        <button
          onClick={() => setSettingsTab('uxui')}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '14.5px',
            fontWeight: settingsTab === 'uxui' ? 800 : 500,
            color: settingsTab === 'uxui' ? '#1E4D3A' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '12px 24px',
            borderBottom: settingsTab === 'uxui' ? '3px solid #1E4D3A' : 'none',
            transition: 'all 0.2s'
          }}
        >
          🎨 ปรับแต่งหน้าจอ UX/UI (เวอร์ชันเต็ม)
        </button>
      </div>

      {/* Content Form Blocks */}
      {settingsTab === 'security' ? (
        <form onSubmit={handleSaveSecurity} className="erp-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #EDE9E1', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Active AI Provider Selector */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', color: '#1E4D3A' }}>🤖 ตั้งค่าการประมวลผลปัญญาประดิษฐ์ (Active AI Provider)</h3>
            
            <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>เลือกค่าย AI ที่ต้องการเปิดใช้งานหลัก</label>
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
                  <button type="button" onClick={() => setShowGemini(!showGemini)} style={{ padding: '0 12px', background: '#F5F5F0', border: '1px solid #EDE9E1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
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
                  <button type="button" onClick={() => setShowOpenai(!showOpenai)} style={{ padding: '0 12px', background: '#F5F5F0', border: '1px solid #EDE9E1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
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
                  <button type="button" onClick={() => setShowClaude(!showClaude)} style={{ padding: '0 12px', background: '#F5F5F0', border: '1px solid #EDE9E1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                    {showClaude ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
              </div>

              {/* 3D AI Studio API Key */}
              <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="erp-label" style={{ fontWeight: 700, fontSize: '12px', color: '#c9a84c' }}>
                  4. 3D AI Studio API Key 🟡 (เชื่อมโยงสำหรับการเจนโมเดล .glb & .usdz ด้วย AI)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type={showThreeDAIStudio ? 'text' : 'password'}
                    className="erp-input"
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px' }}
                    value={threeDAIStudioKey}
                    onChange={e => setThreeDAIStudioKey(e.target.value)}
                    placeholder="กรอก API Key จาก 3daistudio.com..."
                  />
                  <button type="button" onClick={() => setShowThreeDAIStudio(!showThreeDAIStudio)} style={{ padding: '0 12px', background: '#F5F5F0', border: '1px solid #EDE9E1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                    {showThreeDAIStudio ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Database Info */}
          <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', color: '#1E4D3A' }}>🗄️ การเชื่อมต่อฐานข้อมูล (Database Connection)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="erp-label">Supabase Project URL</label>
                <input className="erp-input" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }} value={dbUrl} onChange={e => setDbUrl(e.target.value)} />
              </div>
              <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="erp-label">Supabase Anonymous Key</label>
                <input type="password" className="erp-input" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }} value={dbKey} onChange={e => setDbKey(e.target.value)} />
              </div>
            </div>
          </div>

          {/* School Name */}
          <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', color: '#1E4D3A' }}>🏫 ข้อมูลทั่วไปขององค์กร (Organization Profile)</h3>
            <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="erp-label">ชื่อสถาบันหลัก (Default School)</label>
              <input className="erp-input" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1' }} value={schoolName} onChange={e => setSchoolName(e.target.value)} />
            </div>
          </div>

          {/* Maintenance */}
          <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', color: '#1E4D3A' }}>🔒 ความปลอดภัยและการตรวจสอบ (System Operations)</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#FBF6E9', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.3)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#A6882A' }}>เปิดใช้งาน Maintenance Mode</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>เมื่อเปิดใช้งาน นักเรียนและครูจะไม่สามารถเข้าใช้งานแพลตฟอร์มได้ชั่วคราว</div>
              </div>
              <input type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer' }} checked={maintenance} onChange={e => setMaintenance(e.target.checked)} />
            </div>
          </div>

          <button type="submit" style={{ padding: '14px', background: 'linear-gradient(135deg, #1E4D3A 0%, #103024 100%)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            บันทึกการเชื่อมต่อและความปลอดภัย
          </button>
        </form>
      ) : (
        /* 🎨 UX/UI preferences FULL VERSION */
        <form onSubmit={handleSaveUXUI} className="erp-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #EDE9E1', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Section 1: Themes & Branding */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', borderBottom: '1.5px solid #EDE9E1', paddingBottom: '8px', marginBottom: '14px' }}>
              🎨 สกินสีและภาพลักษณ์ (Themes & Branding)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>โทนสีของระบบ (Visual Theme Mode)</label>
                <select
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
                  value={themeMode}
                  onChange={e => setThemeMode(e.target.value)}
                >
                  <option value="forest-gold">🌲 Forest Gold (สีเขียว-ทองดั้งเดิมหรูหรา)</option>
                  <option value="dark-night">🌑 Obsidian Dark (โหมดมืดสนิทถนอมสายตา)</option>
                  <option value="royal-blue">👑 Royal Blue (น้ำเงินเข้มภูมิฐานระดับสูง)</option>
                  <option value="cherry-blossom">🌸 Cherry Blossom (ชมพูพาสเทล อ่อนโยน เข้าถึงง่าย)</option>
                </select>
              </div>

              <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>ตระกูลแบบตัวอักษร (System Font Family)</label>
                <select
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
                  value={fontFamily}
                  onChange={e => setFontFamily(e.target.value)}
                >
                  <option value="kanit">✏️ Kanit (โมเดิร์น โค้งมน ทันสมัยนิยม)</option>
                  <option value="sarabun">✏️ Sarabun (สารบรรณ ทางการ เรียบร้อย)</option>
                  <option value="inter">✏️ Inter / Outfit (สากล เรียบหรู สะอาดตา)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Layout & Accessibility */}
          <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', borderBottom: '1.5px solid #EDE9E1', paddingBottom: '8px', marginBottom: '14px' }}>
              📏 รูปเลย์เอาต์และการเข้าถึง (Layout & Accessibility)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>ขนาดอักษรแสดงผล (Base Font Size)</label>
                <select
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
                  value={textSize}
                  onChange={e => setTextSize(e.target.value)}
                >
                  <option value="normal">Normal (มาตรฐาน 100% - คล่องตัว)</option>
                  <option value="large">Large (ขนาดใหญ่ 115% - อ่านสบายตา)</option>
                  <option value="xlarge">Extra Large (ขนาดใหญ่พิเศษ 130% - คมชัดสูง)</option>
                </select>
              </div>

              <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>ความหนาแน่นโครงสร้างหน้า (Card Layout Density)</label>
                <select
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
                  value={layoutDensity}
                  onChange={e => setLayoutDensity(e.target.value)}
                >
                  <option value="comfortable">Comfortable (ผ่อนคลาย สวยงาม เว้นระยะพอเหมาะ)</option>
                  <option value="compact">Compact (กระชับ เก็บข้อมูลเยอะ ประหยัดการเลื่อนหน้า)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Animations & Speeds */}
          <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', borderBottom: '1.5px solid #EDE9E1', paddingBottom: '8px', marginBottom: '14px' }}>
              ⚡ ความลื่นไหลและแอนิเมชัน (Performance & Transition Styles)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
              
              <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>สไตล์เอฟเฟกต์การเปลี่ยนหน้า (Transition Effect)</label>
                <select
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
                  value={transitionStyle}
                  onChange={e => setTransitionStyle(e.target.value)}
                >
                  <option value="smooth">Slide Smooth 60FPS (เคลื่อนไหวลื่นไหลสมบูรณ์แบบ)</option>
                  <option value="fade">Fade Only (เลือนจาง - ประหยัดพลังงาน CPU)</option>
                  <option value="none">None / Instant (ทันทีทันใด - เหมาะสำหรับเครื่องสเปกต่ำ)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFBF7', padding: '10px 14px', borderRadius: '8px', border: '1px solid #EDE9E1', height: '42px', marginTop: '24px' }}>
                <div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#4A4138' }}>เปิดแอนิเมชันปุ่มสั่นไหวแบบสั่นเบา (Micro-interactions)</span>
                </div>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={microInteractions}
                  onChange={e => setMicroInteractions(e.target.checked)}
                />
              </div>

            </div>
          </div>

          {/* Section 4: 3D AR & Helper Overlays */}
          <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', borderBottom: '1.5px solid #EDE9E1', paddingBottom: '8px', marginBottom: '14px' }}>
              📦 เทคโนโลยี AR และการเรนเดอร์สามมิติ (AR & 3D Object settings)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>คุณภาพพื้นผิววัตถุสามมิติ (3D AR Model Quality)</label>
                <select
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
                  value={arQuality}
                  onChange={e => setArQuality(e.target.value)}
                >
                  <option value="hd">High Definition (สวยงามสมจริง คมชัดสูงสุด 1080p)</option>
                  <option value="sd">Standard Definition (โหลดเร็วขึ้น 50% เหมาะสำหรับเน็ตความเร็วต่ำ)</option>
                </select>
              </div>

              <div className="erp-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="erp-label" style={{ fontWeight: 700, fontSize: '13px' }}>แสดงคู่มือช่วยสอนการหมุนขยาย AR (Helper Guidelines Overlay)</label>
                <select
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '13px', background: '#fff', cursor: 'pointer' }}
                  value={showArHelp}
                  onChange={e => setShowArHelp(e.target.value)}
                >
                  <option value="always">แสดงทุกครั้งที่เริ่มใช้งานกล้อง AR</option>
                  <option value="once">แสดงเฉพาะการเปิดใช้งานครั้งแรกเท่านั้น</option>
                  <option value="never">ซ่อนแถบนำทางช่วยเหลือทั้งหมดถาวร</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 5: Cache Cleaner */}
          <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', borderBottom: '1.5px solid #EDE9E1', paddingBottom: '8px', marginBottom: '14px' }}>
              🧹 การบำรุงรักษาเครื่องผู้ใช้ (Client-Side Cache Cleaning)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#FFFDF6', border: '1.5px solid #C9A84C', borderRadius: '12px' }}>
              <div style={{ flex: 1, paddingRight: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#A6882A' }}>ล้างไฟล์ขยะ แคชจำลองสถานการณ์ และเซสชันชั่วคราว</span>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.5 }}>
                  ล้างความหน่วงทดสอบ Latency, แคชโมเดล AR ค้างหน้าจอ, และประวัติการกดคำแนะนำ เพื่อเพิ่มพื้นที่ความจำและช่วยลดความหน่วงสะสมของเบราว์เซอร์ (ข้อมูลบัญชี คะแนนนักเรียน และกุญแจ AI ปลอดภัย 100%)
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                disabled={clearing}
                style={{
                  padding: '12px 20px',
                  background: '#8B2635',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 10px rgba(139,38,53,0.15)',
                  flexShrink: 0
                }}
              >
                {clearing ? 'กำลังล้างแคช...' : '🧹 ล้างแคชขยะความจำ'}
              </button>
            </div>
          </div>

          <button type="submit" style={{ padding: '14px', background: 'linear-gradient(135deg, #1E4D3A 0%, #103024 100%)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,48,36,0.2)' }}>
            บันทึกการปรับแต่ง UX/UI และบังคับใช้
          </button>
        </form>
      )}

    </div>
  )
}
