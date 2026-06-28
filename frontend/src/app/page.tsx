'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Seed default test accounts if they don't exist
  useEffect(() => {
    const existingUsersRaw = localStorage.getItem('registeredUsers')
    const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : []
    
    const hasTeacher = existingUsers.some((u: any) => u.email === 'teacher@school.ac.th')
    const hasStudent = existingUsers.some((u: any) => u.email === 'student@school.ac.th')

    if (!hasTeacher) {
      existingUsers.push({
        id: 'teacher-001', name: 'ครูสมหญิง รักเรียน', email: 'teacher@school.ac.th',
        password: 'teacher1234', role: 'teacher', avatar: '👩‍🏫', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ'
      })
    }
    if (!hasStudent) {
      existingUsers.push({
        id: 'student-001', name: 'นายสมชาย ใจดี', email: 'student@school.ac.th',
        password: 'student1234', role: 'student', avatar: '👨‍🎓', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ'
      })
    }
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    setTimeout(() => {
      // 1. Check Admin Account (Developer)
      if (email === 'admin@finemode.ac.th' && password === 'admin1234') {
        const adminUser = {
          id: 'admin-001', name: 'ผู้ดูแลระบบ', role: 'developer' as const,
          avatar: '⚙️', school: 'FINE MODE Platform', email: 'admin@finemode.ac.th'
        }
        localStorage.setItem('userRole', 'developer')
        localStorage.setItem('userInfo', JSON.stringify(adminUser))
        setLoading(false)
        router.push('/role-select')
        return
      }

      // 2. Check Registered Users
      const existingUsersRaw = localStorage.getItem('registeredUsers')
      const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : []
      const foundUser = existingUsers.find((u: any) => u.email === email && u.password === password)

      if (foundUser) {
        localStorage.setItem('userRole', foundUser.role)
        localStorage.setItem('userInfo', JSON.stringify(foundUser))
        setLoading(false)
        router.push(foundUser.role === 'teacher' ? '/teacher/dashboard' : '/student/explore')
      } else {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือโปรดลงทะเบียนเข้าใช้งานก่อน')
        setLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="login-page">
      {/* Luxury Background */}
      <div className="login-bg">
        <div className="login-ornament-1" />
        <div className="login-ornament-2" />
        <div className="login-ornament-3" />
        <div className="login-grid-lines" />
      </div>

      {/* Logo Section */}
      <div className="login-hero animate-fade-in">
        <div className="login-crown">♛</div>
        <div className="login-logo-wrap">
          <img src="/logo.png" alt="FINE MODE Logo" style={{ width: 60, height: 60, borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(201,168,76,0.4)', boxShadow: '0 0 20px rgba(201,168,76,0.15)' }} />
          <div style={{ textAlign: 'left' }}>
            <div className="login-brand">FINE MODE</div>
            <div className="login-brand-sub">AR + AI 3D Learning</div>
          </div>
        </div>
        <div className="login-gold-divider" />
        <p className="login-tagline">ยินดีต้อนรับเข้าสู่รูปแบบการจัดการเรียนรู้ FINE Model ผ่านเทคโนโลยี AR แบบ 3D ร่วมกับ AI และ Simulation-Based Learning เพื่อพัฒนาสมรรถนะการสื่อสารภาษาอังกฤษในงานบริการรอาหารและเครื่องดื่ม</p>
      </div>

      {/* Login Card */}
      <div className="login-card animate-slide-up">
        <div className="card-ornament">✦ เข้าสู่ระบบ ✦</div>

        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">อีเมล / ชื่อผู้ใช้</label>
            <div className="input-wrap">
              <span className="input-icon">✉</span>
              <input
                className="form-input with-icon"
                type="email"
                placeholder="example@school.ac.th"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <div className="input-wrap">
              <span className="input-icon">⊛</span>
              <input
                className="form-input with-icon"
                type={showPass ? 'text' : 'password'}
                placeholder="รหัสผ่านของคุณ"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="login-forgot">
            <a href="#" className="link-text">ลืมรหัสผ่าน?</a>
          </div>

          <button className="btn-luxury" type="submit" disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{width:18,height:18,borderWidth:2,borderColor:'rgba(201,168,76,0.3)',borderTopColor:'#C9A84C'}} /> กำลังเข้าสู่ระบบ...</>
            ) : (
              <>✦ เข้าสู่ระบบ</>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>✦ ✦ ✦</span>
        </div>

        {/* Demo Quick Login */}
        <div className="demo-roles">
          <p className="text-xs text-muted text-center mb-2" style={{letterSpacing:'0.08em'}}>ทดลองใช้งาน (Demo)</p>
          <div className="grid-3" style={{gap:'8px'}}>
            {[
              { label: 'ผู้พัฒนา', emoji: '⚙️', role: 'developer', color: '#1E4D3A' },
              { label: 'ครูผู้สอน', emoji: '👩‍🏫', role: 'teacher', color: '#4A3010' },
              { label: 'นักเรียน', emoji: '👨‍🎓', role: 'student', color: '#1E4D3A' },
            ].map(r => (
              <button
                key={r.role}
                className="demo-role-btn"
                style={{'--role-color': r.color} as any}
                onClick={() => {
                  if (r.role === 'developer') {
                    setEmail('admin@finemode.ac.th')
                    setPassword('admin1234')
                  } else if (r.role === 'teacher') {
                    setEmail('teacher@school.ac.th')
                    setPassword('teacher1234')
                  } else {
                    setEmail('student@school.ac.th')
                    setPassword('student1234')
                  }
                }}
              >
                <span style={{fontSize:20}}>{r.emoji}</span>
                <span style={{fontSize:11,fontWeight:600}}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="login-register">
          ยังไม่มีบัญชี? <Link href="/register" className="link-text">ลงทะเบียน</Link>
        </p>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(160deg, #071812 0%, #102B1F 40%, #1E4D3A 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .login-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .login-ornament-1 {
          position: absolute;
          top: -120px; right: -120px;
          width: 320px; height: 320px;
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 50%;
        }
        .login-ornament-1::after {
          content: '';
          position: absolute;
          inset: 20px;
          border: 1px solid rgba(201,168,76,0.10);
          border-radius: 50%;
        }
        .login-ornament-2 {
          position: absolute;
          top: 25%; left: -100px;
          width: 240px; height: 240px;
          border: 1px solid rgba(201,168,76,0.12);
          border-radius: 50%;
        }
        .login-ornament-3 {
          position: absolute;
          bottom: 25%; right: -60px;
          width: 160px; height: 160px;
          border: 1px solid rgba(201,168,76,0.10);
          border-radius: 50%;
        }
        .login-grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .login-hero {
          padding: 56px var(--space-6) var(--space-6);
          width: 100%;
          max-width: var(--mobile-max);
          position: relative;
          z-index: 1;
          text-align: center;
        }
        .login-crown {
          font-size: 32px;
          color: #C9A84C;
          margin-bottom: var(--space-3);
          text-shadow: 0 0 20px rgba(201,168,76,0.5);
          animation: glow-pulse 3s ease-in-out infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { text-shadow: 0 0 10px rgba(201,168,76,0.3); }
          50% { text-shadow: 0 0 30px rgba(201,168,76,0.7), 0 0 50px rgba(201,168,76,0.3); }
        }
        .login-logo-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          justify-content: center;
        }
        .login-logo-icon {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.10));
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(201,168,76,0.4);
          box-shadow: 0 0 20px rgba(201,168,76,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .login-brand {
          font-size: 28px;
          font-weight: 700;
          color: #FDFAF4;
          line-height: 1.1;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-family: 'Playfair Display', serif;
        }
        .login-brand-sub {
          font-size: var(--font-size-xs);
          color: #C9A84C;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .login-gold-divider {
          width: 80px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C9A84C, transparent);
          margin: 12px auto;
        }
        .login-tagline {
          color: rgba(253,250,244,0.8);
          font-size: 11.5px;
          line-height: 1.6;
          letter-spacing: 0.01em;
          max-width: 340px;
          margin: 0 auto;
        }
        .login-card {
          background: linear-gradient(160deg, #FDFAF4 0%, #F5F0E6 100%);
          border-radius: 28px 28px 0 0;
          padding: var(--space-6);
          width: 100%;
          max-width: var(--mobile-max);
          flex: 1;
          position: relative;
          z-index: 1;
          box-shadow: 0 -8px 50px rgba(0,0,0,0.4), 0 -1px 0 rgba(201,168,76,0.4);
        }
        .login-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #A6882A, #C9A84C, #E0C068, #C9A84C, #A6882A);
          border-radius: 28px 28px 0 0;
        }
        .card-ornament {
          text-align: center;
          font-size: 15px;
          font-weight: 600;
          color: #1E4D3A;
          letter-spacing: 0.15em;
          margin-bottom: var(--space-5);
          font-family: 'Playfair Display', serif;
        }
        .btn-luxury {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #A6882A 0%, #C9A84C 50%, #E0C068 100%);
          color: #1A1410;
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--font-size-md);
          font-weight: 700;
          font-family: var(--font-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 20px rgba(201,168,76,0.40), 0 1px 0 rgba(255,255,255,0.2) inset;
          transition: all 0.25s ease;
        }
        .btn-luxury:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(201,168,76,0.55); }
        .btn-luxury:active { transform: translateY(0); }
        .btn-luxury:disabled { opacity: 0.75; cursor: not-allowed; transform: none; }
        .login-title {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-5);
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          font-size: 16px;
          color: #C9A84C;
          pointer-events: none;
          font-style: normal;
        }
        .form-input.with-icon {
          padding-left: 44px;
          border-color: #D8D2C6;
          background: #FDFAF4;
        }
        .form-input.with-icon:focus {
          border-color: #C9A84C;
          box-shadow: 0 0 0 3px rgba(201,168,76,0.15);
          outline: none;
        }
        .input-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
        }
        .login-forgot { text-align: right; margin-top: -8px; }
        .link-text {
          color: #A6882A;
          font-weight: 600;
          text-decoration: none;
          font-size: var(--font-size-sm);
        }
        .login-divider {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin: var(--space-5) 0;
          color: #C9A84C;
          font-size: 12px;
          letter-spacing: 6px;
          justify-content: center;
        }
        .demo-roles { margin-bottom: var(--space-4); }
        .demo-role-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 6px;
          background: rgba(201,168,76,0.08);
          border: 1.5px solid rgba(201,168,76,0.30);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          color: #4A4138;
        }
        .demo-role-btn:active { transform: scale(0.95); background: rgba(201,168,76,0.18); }
        .login-register {
          text-align: center;
          font-size: var(--font-size-sm);
          color: var(--text-muted);
          margin-top: var(--space-4);
        }
        .login-error {
          background: #FAE8EB;
          color: #8B2635;
          padding: 10px var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          margin-bottom: var(--space-3);
          border: 1px solid rgba(139,38,53,0.2);
        }
      `}</style>
    </div>
  )
}
