'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [school, setSchool] = useState('')
  const [role] = useState<'teacher'>('teacher')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic Validation
    if (!name || !email || !password || !school) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง')
      setLoading(false)
      return
    }

    setTimeout(() => {
      const existingUsersRaw = localStorage.getItem('registeredUsers')
      const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : []
      
      const userExists = existingUsers.some((u: any) => u.email === email)
      if (userExists) {
        setError('อีเมลนี้ถูกใช้งานในระบบแล้ว')
        setLoading(false)
        return
      }

      const newUser = {
        name,
        email,
        password,
        school,
        role: 'teacher',
        avatar: '👩‍🏫',
        id: `usr-${Date.now()}`,
        status: 'pending' // Teacher must be approved by admin
      }

      existingUsers.push(newUser)
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers))

      setSuccess(true)
      setLoading(false)

      // Redirect to login page to show pending message
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }, 1200)
  }

  return (
    <div className="login-card animate-slide-up" style={{ padding: '30px var(--space-5)' }}>
      <div className="card-ornament">✦ ลงทะเบียนครูผู้สอน ✦</div>

      {error && (
        <div className="login-error" style={{ marginBottom: '16px' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '12px', background: '#EAF3EE', border: '1px solid rgba(201,168,76,0.3)', color: '#1E4D3A', borderRadius: '12px', marginBottom: '16px', fontWeight: 600, fontSize: '13px', textAlign: 'center' }}>
          🎉 ลงทะเบียนสำเร็จ! รอผู้ดูแลระบบอนุมัติ...
        </div>
      )}

      <form onSubmit={handleRegister} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Role is hardcoded to student for this page */}

        <div className="form-group">
          <label className="form-label">ชื่อ-นามสกุล</label>
          <div className="input-wrap">
            <span className="input-icon">👤</span>
            <input
              className="form-input with-icon"
              placeholder="ชื่อจริง นามสกุลจริง"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">สถาบัน / โรงเรียน</label>
          <div className="input-wrap">
            <span className="input-icon">🏫</span>
            <input
              className="form-input with-icon"
              placeholder="ชื่อวิทยาลัยอาชีวศึกษา"
              value={school}
              onChange={e => setSchool(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">อีเมล</label>
          <div className="input-wrap">
            <span className="input-icon">✉</span>
            <input
              className="form-input with-icon"
              type="email"
              placeholder="yourname@school.ac.th"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              type="password"
              placeholder="รหัสผ่านของคุณ (ขั้นต่ำ 6 ตัว)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </div>

        <button className="btn-luxury" type="submit" disabled={loading || success} style={{ marginTop: '8px' }}>
          {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนเพื่อเข้าเรียน'}
        </button>
      </form>

      <p className="login-register" style={{ marginTop: '20px' }}>
        มีบัญชีอยู่แล้ว? <Link href="/" className="link-text">เข้าสู่ระบบ</Link>
      </p>

      <style jsx>{`
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
        .btn-luxury:disabled { opacity: 0.75; cursor: not-allowed; }
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
        .link-text {
          color: #A6882A;
          font-weight: 600;
          text-decoration: none;
          font-size: var(--font-size-sm);
        }
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

export default function RegisterPage() {
  return (
    <div className="login-page">
      {/* Luxury Background */}
      <div className="login-bg">
        <div className="login-ornament-1" />
        <div className="login-ornament-2" />
        <div className="login-ornament-3" />
        <div className="login-grid-lines" />
      </div>

      <div className="login-hero animate-fade-in" style={{ paddingBottom: '16px', paddingTop: '40px' }}>
        <div className="login-crown">♛</div>
        <div className="login-logo-wrap">
          <img src="/logo.png" alt="FINE MODEL Logo" style={{ width: 60, height: 60, borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(201,168,76,0.4)', boxShadow: '0 0 20px rgba(201,168,76,0.15)' }} />
          <div style={{ textAlign: 'left' }}>
            <div className="login-brand">FINE MODEL</div>
            <div className="login-brand-sub">AR 3D + AI LEARNING</div>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="login-card animate-slide-up" style={{ padding: '40px', textAlign: 'center', color: '#A6882A' }}>
          กำลังเตรียมแบบฟอร์มลงทะเบียน...
        </div>
      }>
        <RegisterForm />
      </Suspense>

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
        }
        .login-logo-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          justify-content: center;
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
      `}</style>
    </div>
  )
}
