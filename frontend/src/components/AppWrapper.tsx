'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout, user, setUser } = useRole()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [showSystemStats, setShowSystemStats] = useState(false)
  const [currentSearch, setCurrentSearch] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentSearch(window.location.search)
    }
  }, [pathname])

  // Profile forms fields
  const [profName, setProfName] = useState('')
  const [profSchool, setProfSchool] = useState('')
  const [profEmail, setProfEmail] = useState('')
  const [profAvatar, setProfAvatar] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash')

  const [notifications, setNotifications] = useState([
    { id: 1, text: '👩‍🏫 ครูมานะ ดีงาม ขอยื่นอนุมัติการใช้งานใหม่', time: '5 นาทีที่แล้ว', read: false },
    { id: 2, text: '🔌 ระบบ API Connect: Gemini 2.0 ทำงานปกติ (Latency 195ms)', time: '1 ชั่วโมงที่แล้ว', read: true },
    { id: 3, text: '📈 สถิติผลสัมฤทธิ์ปลายภาคเรียน Unit 2 ประมวลผลเรียบร้อย', time: '3 ชั่วโมงที่แล้ว', read: true }
  ])

  const isAdmin = pathname.startsWith('/admin')
  const isTeacher = pathname.startsWith('/teacher')
  const isERP = isAdmin || isTeacher

  const unreadCount = notifications.filter(n => !n.read).length

  // Initialize default API Key provided by user
  useState(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('geminiApiKey')
      if (!existing) {
        localStorage.setItem('geminiApiKey', 'AIzaSyAkk92tJrfj-f5R40wPyHIRquBK1qdCIdE')
      }
    }
  })

  function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function handleOpenProfile() {
    if (user) {
      setProfName(user.name || '')
      setProfSchool(user.school || '')
      setProfEmail(user.email || '')
      setProfAvatar(user.avatar || '👩‍🏫')
    }
    if (typeof window !== 'undefined') {
      setApiKey(localStorage.getItem('geminiApiKey') || '')
      setSelectedModel(localStorage.getItem('geminiModel') || 'gemini-1.5-flash')
    }
    setShowProfileSettings(true)
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    const updatedUser = {
      ...user,
      name: profName,
      school: profSchool,
      email: profEmail,
      avatar: profAvatar
    }

    setUser(updatedUser)

    // บันทึกทับ registeredUsers เพื่อให้คงอยู่เมื่อเปิดหน้าเพจขึ้นมาใหม่
    const registered = localStorage.getItem('registeredUsers')
    if (registered) {
      try {
        const list = JSON.parse(registered)
        const idx = list.findIndex((u: any) => u.email === user.email)
        if (idx !== -1) {
          list[idx].name = profName
          list[idx].school = profSchool
          list[idx].avatar = profAvatar
          localStorage.setItem('registeredUsers', JSON.stringify(list))
        }
      } catch (err) {}
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('geminiApiKey', apiKey)
      localStorage.setItem('geminiModel', selectedModel)
    }

    alert('บันทึกการตั้งค่าโปรไฟล์และข้อมูล AI API Key สำเร็จ! ⚙️')
    setShowProfileSettings(false)
  }

  if (isERP) {
    const sidebarMenu = isAdmin ? [
      { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
      { href: '/admin/users', icon: '👥', label: 'จัดการผู้ใช้' },
      { href: '/admin/blog', icon: '📢', label: 'แจ้งข่าวและกิจกรรม' },
      { href: '/admin/settings', icon: '⚙️', label: 'ตั้งค่าระบบ' },
    ] : [
      { href: '/teacher/dashboard', icon: '🏫', label: 'Dashboard' },
      { 
        href: '/teacher/lessons', 
        icon: '📖', 
        label: 'แผนการสอน FINE MODEL',
        children: [
          { href: '/teacher/lessons', icon: '📝', label: 'จัดการแผนการสอน' },
          { href: '/teacher/lessons?tab=4.5', icon: '🛸', label: 'AR & 3D Items' }
        ]
      },
      { 
        href: '/teacher/classes', 
        icon: '👨‍👩‍👧‍👦', 
        label: 'จัดการนักเรียน',
        children: [
          { href: '/teacher/classes', icon: '🏫', label: 'จัดการห้องเรียน' },
          { href: '/teacher/students', icon: '👥', label: 'ทะเบียนนักเรียน' }
        ]
      },
      { href: '/teacher/assignments', icon: '📋', label: 'งานและกิจกรรม' },
      { href: '/teacher/vocab', icon: '🔤', label: 'คลังคำศัพท์' },
      { href: '/teacher/manual', icon: '📚', label: 'คู่มือการใช้งาน' },
    ]

    const brandColor = isAdmin ? 'var(--primary)' : 'var(--secondary)'
    const roleLabel = isAdmin ? 'Admin' : 'Teacher'

    return (
      <div className="erp-layout">
        {/* Sidebar — Dark Luxury Green */}
        <aside className="erp-sidebar">
          <div className="erp-brand">
            <img src="/logo.png" alt="FINE MODE Logo" style={{ width: 36, height: 36, borderRadius: '6px', border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 0 10px rgba(201,168,76,0.2)' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#FDFAF4', letterSpacing: '1.5px', textTransform: 'uppercase' }}>FINE MODE</div>
              <div style={{ fontSize: 10, color: '#C9A84C', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>{roleLabel} Panel ✦</div>
            </div>
          </div>
          <nav className="erp-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sidebarMenu.map(item => {
              const hasChildren = 'children' in item && item.children
              
              const isMatch = (href: string) => {
                const [hPath, hQuery] = href.split('?')
                if (hQuery) {
                  return pathname === hPath && currentSearch.includes(hQuery)
                }
                return pathname === hPath && !currentSearch.includes('tab=')
              }

              const isActive = isMatch(item.href) || (hasChildren && item.children.some(child => isMatch(child.href)))
              
              return (
                <div key={item.href} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <Link
                    href={item.href}
                    className={`erp-nav-item ${isActive ? 'active' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontWeight: isActive ? 800 : 500 }}>{item.label}</span>
                    {hasChildren && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.7 }}>
                        {isActive ? '▼' : '▶'}
                      </span>
                    )}
                  </Link>

                  {/* Render Submenus */}
                  {hasChildren && isActive && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '2px', 
                      paddingLeft: '22px', 
                      marginTop: '2px',
                      borderLeft: '1.5px solid rgba(201,168,76,0.2)',
                      marginLeft: '16px',
                      marginBottom: '4px'
                    }}>
                      {item.children.map(child => {
                        const isChildActive = isMatch(child.href)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`erp-nav-item ${isChildActive ? 'active' : ''}`}
                            style={{ 
                              padding: '8px 12px', 
                              fontSize: '12.5px',
                              height: 'auto',
                              borderRadius: '8px',
                              background: isChildActive ? 'rgba(201,168,76,0.12)' : 'transparent',
                              color: isChildActive ? '#C9A84C' : 'rgba(253,252,244,0.7)',
                              boxShadow: 'none'
                            }}
                          >
                            <span style={{ fontSize: 13 }}>{child.icon}</span>
                            <span>{child.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
          <div className="erp-sidebar-footer">
            <div
              className="erp-user-info"
              onClick={handleOpenProfile}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s', display: 'flex', gap: '10px', alignItems: 'center' }}
              title="แก้ไขโปรไฟล์คุณครู & API Key"
            >
              <div className="erp-user-avatar" style={{ 
                background: 'rgba(201,168,76,0.20)', 
                border: '1.5px solid rgba(201,168,76,0.40)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user?.avatar && user.avatar.startsWith('data:image') ? (
                  <img 
                    src={user.avatar} 
                    alt="User Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <span>{user?.avatar ?? '👩‍🏫'}</span>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#FDFAF4', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {user?.name} <span style={{ fontSize: '9px', color: '#C9A84C' }}>⚙️</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(201,168,76,0.7)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.school}</div>
              </div>
            </div>
            <button onClick={logout} className="erp-logout-btn" style={{ borderColor: 'rgba(201,168,76,0.35)', color: '#E0C068', background: 'rgba(201,168,76,0.08)', marginTop: '8px' }}>
              🚪 ออกจากระบบ
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="erp-main">
          {/* Topbar */}
          <header className="erp-topbar" style={{ position: 'relative' }}>
            <div className="erp-breadcrumb">
              <span style={{ color: 'var(--text-muted)' }}>หน้าหลัก</span>
              <span style={{ margin: '0 8px', color: '#C9A84C' }}>✦</span>
              <span style={{ fontWeight: 600, color: '#1E4D3A' }}>
                {pathname.split('/').pop()?.toUpperCase()}
              </span>
            </div>
            <div className="erp-topbar-actions">
              <div className="erp-search-box" style={{ background: '#F3EFE6', border: '1px solid rgba(201,168,76,0.20)' }}>
                🔍 <input placeholder="ค้นหาข้อมูลในระบบ..." />
              </div>
              
              {/* Notification Bell with Toggle */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '6px', position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  🔔 {unreadCount > 0 && <span className="erp-badge-dot" />}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '12px',
                    width: '320px', background: '#FDFAF4', borderRadius: '12px',
                    border: '1.5px solid rgba(201,168,76,0.25)', boxShadow: '0 8px 30px rgba(16,43,31,0.15)',
                    zIndex: 1000, overflow: 'hidden'
                  }}>
                    <div style={{ padding: '12px 16px', background: '#1E4D3A', color: '#FDFAF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px' }}>🔔 การแจ้งเตือนระบบ</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} style={{ background: 'transparent', border: 'none', color: '#C9A84C', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                          อ่านทั้งหมด
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {notifications.map(n => (
                        <div key={n.id} style={{
                          padding: '12px 16px', borderBottom: '1px solid #EDE9E1',
                          background: n.read ? 'transparent' : 'rgba(201,168,76,0.06)',
                          transition: 'background 0.2s'
                        }}>
                          <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>{n.text}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{n.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
                <button
                  onClick={() => setShowSystemStats(!showSystemStats)}
                  style={{
                    background: 'rgba(201,168,76,0.08)',
                    border: '1px solid rgba(201,168,76,0.30)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#A6882A',
                    fontWeight: 700,
                    fontSize: '13px',
                    transition: 'all 0.2s',
                  }}
                  title="สรุปสถานะระบบและทรัพยากร AI"
                >
                  {/* 9-dot grid icon */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5px', width: '13px', height: '13px' }}>
                    {[...Array(9)].map((_, i) => (
                      <div key={i} style={{ width: '3px', height: '3px', background: '#A6882A', borderRadius: '50%' }} />
                    ))}
                  </div>
                  <span>สถานะระบบ</span>
                </button>

                {showSystemStats && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '12px',
                    width: '350px', background: '#FDFAF4', borderRadius: '14px',
                    border: '1.5px solid rgba(201,168,76,0.25)', boxShadow: '0 10px 35px rgba(16,43,31,0.18)',
                    zIndex: 1100, padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#1E4D3A' }}>🎛️ สรุปสถานะทรัพยากรระบบ</span>
                      <button onClick={() => setShowSystemStats(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                    </div>

                    {/* Platform Usage */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <span>📈 การใช้งานแพลตฟอร์ม</span>
                        <span style={{ color: '#1E4D3A' }}>ดีเยี่ยม (ปกติ)</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <div style={{ flex: 1, background: 'white', padding: '6px 8px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Session ประจำวัน</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E4D3A', marginTop: '2px' }}>142 ครั้ง</div>
                        </div>
                        <div style={{ flex: 1, background: 'white', padding: '6px 8px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>การตอบสนอง AI</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#A6882A', marginTop: '2px' }}>1.84 วินาที</div>
                        </div>
                      </div>
                    </div>

                    {/* Storage Reservation */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <span>💾 พื้นที่เก็บไฟล์จำลอง (3D/Images)</span>
                        <span style={{ color: '#1E4D3A', fontWeight: 700 }}>49.0% (24.5 GB)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#EDE9E1', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                        <div style={{ width: '49%', height: '100%', background: 'linear-gradient(90deg, #C9A84C, #A6882A)', borderRadius: '3px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>ใช้งานไป: 24.5 GB</span>
                        <span>พื้นที่ทั้งหมด: 50.0 GB</span>
                      </div>
                    </div>

                    {/* Remaining AI Credits */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <span>⚡ เครดิตคำขอ AI (Gemini Tokens)</span>
                        <span style={{ color: '#1E4D3A', fontWeight: 700 }}>87.4% (เหลือ 87,420)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#EDE9E1', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                        <div style={{ width: '87.4%', height: '100%', background: 'linear-gradient(90deg, #1E4D3A, #102B1F)', borderRadius: '3px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>ใช้ไป: 12,580 tokens</span>
                        <span>โควตาเดือนนี้: 100,000 tokens</span>
                      </div>
                    </div>

                    {/* Additional stats */}
                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>โมเดลประมวลผลปัจจุบัน:</span>
                        <span style={{ fontWeight: 700, color: '#1E4D3A' }}>Gemini 1.5 Flash</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>เซิร์ฟเวอร์หลัก:</span>
                        <span style={{ fontWeight: 700, color: '#1E4D3A' }}>gcp-asia-southeast1 (Green)</span>
                      </div>
                    </div>

                    {/* Swapper Link Shortcut */}
                    <Link
                      href="/role-select"
                      onClick={() => setShowSystemStats(false)}
                      style={{
                        display: 'block', textAlign: 'center', background: '#1E4D3A', color: '#FDFAF4',
                        textDecoration: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px',
                        fontWeight: 700, transition: 'background 0.2s', marginTop: '4px'
                      }}
                    >
                      🔄 เข้าสู่หน้าต่างสลับบทบาทผู้ใช้
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ERP Pages Container */}
          <main className="erp-content-container">
            {children}
          </main>
        </div>

        {/* ⚙️ Teacher Profile & API Key Settings Modal */}
        {showProfileSettings && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }}>
            <div className="erp-card" style={{ width: '480px', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>⚙️ ตั้งค่าข้อมูลส่วนตัวคุณครู & AI API Key</h3>
                <button onClick={() => setShowProfileSettings(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* 📸 Teacher Avatar Selection Form Group */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div 
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        const el = document.getElementById('modal-teacher-avatar-input')
                        if (el) el.click()
                      }
                    }}
                    style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: '#F3E5F5', border: '2.5px solid #E1BEE7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 36, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(123,31,162,0.12)'
                    }}
                    title="คลิกเพื่อเลือกไฟล์รูปภาพโปรไฟล์ใหม่"
                  >
                    {profAvatar && profAvatar.startsWith('data:image') ? (
                      <img 
                        src={profAvatar} 
                        alt="Teacher Avatar Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <span>{profAvatar || '👩‍🏫'}</span>
                    )}

                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.2s',
                      fontSize: 10, color: 'white', fontWeight: 'bold'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      📸 อัปเดตรูป
                    </div>
                  </div>
                  
                  {/* Hidden File Input inside Modal */}
                  <input 
                    type="file" 
                    id="modal-teacher-avatar-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string
                          setProfAvatar(base64)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <span style={{ fontSize: 10.5, color: '#8C8272', fontWeight: 700 }}>กดที่รูปเพื่อแก้ไขภาพประจำตัว</span>
                </div>

                <div className="erp-form-group">
                  <label className="erp-label">ชื่อ - นามสกุลคุณครู</label>
                  <input
                    className="erp-input"
                    value={profName}
                    onChange={e => setProfName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="erp-form-group">
                  <label className="erp-label">สถานศึกษา / สังกัด</label>
                  <input
                    className="erp-input"
                    value={profSchool}
                    onChange={e => setProfSchool(e.target.value)}
                    required
                  />
                </div>

                <div className="erp-form-group">
                  <label className="erp-label">อีเมลติดต่อ (Email)</label>
                  <input
                    type="email"
                    className="erp-input"
                    value={profEmail}
                    onChange={e => setProfEmail(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 700, marginTop: '16px' }}>
                  บันทึกข้อมูลโปรไฟล์
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Fallback to Mobile View for students & login
  return (
    <div className="app-wrapper">
      {children}
    </div>
  )
}
