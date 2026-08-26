'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import logo from '../../../public/logo.png'
import { signInLocal, type UserRole } from '@/lib/localData'
import styles from '../page.module.css'

type IconName =
  | 'brand'
  | 'admin'
  | 'teacher'
  | 'student'
  | 'mail'
  | 'lock'
  | 'eye'
  | 'eyeOff'
  | 'alert'
  | 'arrow'
  | 'back'
  | 'check'

type RoleChoice = {
  id: UserRole
  title: string
  subtitle: string
  hint: string
  description: string
  features: string[]
  icon: IconName
}

const roles: RoleChoice[] = [
  {
    id: 'student',
    title: 'นักเรียน / นักศึกษา',
    subtitle: 'Student',
    hint: 'เรียนรู้ ฝึกปฏิบัติ และติดตามผล',
    description: 'เรียนรู้ผ่านโมเดล AR 3D ฝึกคำศัพท์ด้วย AI และทดลองสถานการณ์งานบริการเสมือนจริง',
    features: ['บทเรียน AR และโมเดล 3 มิติ', 'ฝึกคำศัพท์ด้วย AI Scan', 'สนทนาและสถานการณ์จำลอง', 'ติดตามคะแนนและความก้าวหน้า'],
    icon: 'student',
  },
  {
    id: 'teacher',
    title: 'ครูผู้สอน',
    subtitle: 'Teacher',
    hint: 'จัดการชั้นเรียน บทเรียน และการประเมิน',
    description: 'บริหารการเรียนการสอน จัดกิจกรรม ติดตามผู้เรียน และประเมินสมรรถนะจากข้อมูลจริง',
    features: ['จัดทำแผนการสอน FINE MODEL', 'จัดการชั้นเรียนและทะเบียนนักเรียน', 'มอบหมายงานและประเมินผล', 'ดูรายงานความก้าวหน้ารายบุคคล'],
    icon: 'teacher',
  },
  {
    id: 'developer',
    title: 'ผู้ดูแลระบบ',
    subtitle: 'Administrator',
    hint: 'บริหารผู้ใช้ เนื้อหา และการตั้งค่าระบบ',
    description: 'ควบคุมภาพรวมแพลตฟอร์ม อนุมัติบัญชี จัดการเนื้อหา และตรวจสอบข้อมูลการใช้งาน',
    features: ['จัดการผู้ใช้และสิทธิ์การเข้าถึง', 'อนุมัติบัญชีครูผู้สอน', 'บริหารเนื้อหา AR และ AI', 'วิเคราะห์รายงานภาพรวมระบบ'],
    icon: 'admin',
  },
]

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (name === 'brand') return <svg {...common}><path d="m12 3-8 4 8 4 8-4-8-4Z"/><path d="m4 12 8 4 8-4"/><path d="m4 17 8 4 8-4"/></svg>
  if (name === 'admin') return <svg {...common}><path d="M12 3 4.5 6v5.2c0 4.6 3.2 8.4 7.5 9.8 4.3-1.4 7.5-5.2 7.5-9.8V6L12 3Z"/><path d="M9.5 12 11 13.5l3.5-3.5"/></svg>
  if (name === 'teacher') return <svg {...common}><path d="M3 5h18v12H3z"/><path d="M7 21h10M12 17v4"/><circle cx="8" cy="10" r="2"/><path d="M12 13c-.8-1.4-2.1-2-4-2s-3.2.6-4 2M14 9h4M14 12h3"/></svg>
  if (name === 'student') return <svg {...common}><path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z"/><path d="M6 11.2V16c2.7 2.2 9.3 2.2 12 0v-4.8M21.5 9v6"/></svg>
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
  if (name === 'lock') return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg>
  if (name === 'eye') return <svg {...common}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>
  if (name === 'eyeOff') return <svg {...common}><path d="m3 3 18 18"/><path d="M10.6 6.2A10.6 10.6 0 0 1 12 6c6 0 9.5 6 9.5 6a14 14 0 0 1-2.1 2.8"/><path d="M6.2 6.2C3.8 7.8 2.5 12 2.5 12s3.5 6 9.5 6a9.8 9.8 0 0 0 3.1-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
  if (name === 'alert') return <svg {...common}><path d="M10.3 4.1 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  if (name === 'back') return <svg {...common}><path d="M19 12H5"/><path d="m10 17-5-5 5-5"/></svg>
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>
  return <svg {...common}><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></svg>
}

function loginErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  if (message.includes('Account role mismatch')) return 'บัญชีนี้ไม่ตรงกับบทบาทที่เลือก กรุณาเลือกบทบาทให้ถูกต้อง'
  if (message.includes('Account pending approval')) return 'บัญชีครูกำลังรอผู้ดูแลระบบอนุมัติ'
  if (message.includes('Account is inactive')) return 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ'
  return message || 'ระบบไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง'
}

function destinationFor(role: UserRole) {
  if (role === 'developer') return '/admin/dashboard'
  if (role === 'teacher') return '/teacher/dashboard'
  return '/student/explore'
}

export default function RoleSelectPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<RoleChoice | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function chooseRole(role: RoleChoice) {
    setSelectedRole(role)
    setError('')
  }

  function changeRole() {
    setSelectedRole(null)
    setPassword('')
    setShowPassword(false)
    setError('')
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedRole || loading) return

    setLoading(true)
    setError('')
    try {
      const { profile } = await signInLocal(email.trim().toLowerCase(), password, selectedRole.id)
      router.replace(destinationFor(profile.role))
    } catch (loginError) {
      setError(loginErrorMessage(loginError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.rolePage}>
      <div className={styles.roleBackdrop} aria-hidden="true" />

      <header className={styles.roleHeader}>
        <div className={styles.roleBrand}>
          <Image src={logo} width={54} height={54} loading="eager" alt="ตราสัญลักษณ์ FINE MODEL" />
          <div>
            <strong>FINE MODEL</strong>
            <span>AR 3D + AI LEARNING</span>
          </div>
        </div>
        <div className={styles.roleHeading}>
          <p>เข้าสู่แพลตฟอร์ม</p>
          <h1>เลือกบทบาทของคุณ</h1>
          <span>ดูรายละเอียดและเลือกพื้นที่ใช้งานที่ตรงกับบัญชีของคุณ</span>
        </div>
      </header>

      <section className={styles.roleShowcase} aria-label="รายละเอียดบทบาทผู้ใช้งาน">
        {roles.map(role => (
          <article key={role.id} className={styles.roleDetailCard} data-role={role.id}>
            <div className={styles.roleDetailHeader}>
              <div className={styles.roleDetailTop}>
                <span className={styles.roleDetailIcon}><Icon name={role.icon} size={29} /></span>
                <span className={styles.roleBadge}>{role.subtitle}</span>
              </div>
              <h2>{role.title}</h2>
              <p>{role.hint}</p>
            </div>

            <div className={styles.roleDetailBody}>
              <p className={styles.roleDescription}>{role.description}</p>
              <ul className={styles.roleFeatures}>
                {role.features.map(feature => (
                  <li key={feature}>
                    <span><Icon name="check" size={15} /></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button type="button" className={styles.roleLoginButton} onClick={() => chooseRole(role)}>
                <span>เข้าสู่ระบบบทบาทนี้</span>
                <Icon name="arrow" size={18} />
              </button>
            </div>
          </article>
        ))}
      </section>

      <footer className={styles.roleFooter}>
        <span>ยังไม่มีบัญชี?</span>
        <Link href="/register-student">ลงทะเบียนนักเรียน</Link>
        <Link href="/register-teacher">ลงทะเบียนครู</Link>
      </footer>

      {selectedRole && (
        <div className={styles.loginOverlay}>
          <section
            className={styles.loginDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-dialog-title"
            onKeyDown={event => {
              if (event.key === 'Escape' && !loading) changeRole()
            }}
          >
            <button type="button" className={styles.changeRole} onClick={changeRole} disabled={loading}>
              <Icon name="back" size={18} />
              กลับไปเลือกบทบาท
            </button>

            <div className={styles.selectedRole}>
              <span className={styles.selectedRoleIcon}><Icon name={selectedRole.icon} size={23} /></span>
              <span>
                <small>เข้าสู่ระบบในฐานะ</small>
                <strong id="login-dialog-title">{selectedRole.title}</strong>
              </span>
            </div>

            {error && (
              <div id="login-error" className={styles.error} role="alert" aria-live="assertive">
                <Icon name="alert" size={19} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className={styles.form} aria-busy={loading}>
              <div className={styles.field}>
                <label htmlFor="login-email">อีเมล</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><Icon name="mail" size={19} /></span>
                  <input
                    id="login-email"
                    className={styles.input}
                    type="email"
                    inputMode="email"
                    placeholder="example@school.ac.th"
                    value={email}
                    onChange={event => { setEmail(event.target.value); if (error) setError('') }}
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    disabled={loading}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'login-error' : undefined}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="login-password">รหัสผ่าน</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><Icon name="lock" size={19} /></span>
                  <input
                    id="login-password"
                    className={styles.input + ' ' + styles.passwordInput}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่าน"
                    value={password}
                    onChange={event => { setPassword(event.target.value); if (error) setError('') }}
                    autoComplete="current-password"
                    disabled={loading}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'login-error' : 'password-help'}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(current => !current)}
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    aria-pressed={showPassword}
                    disabled={loading}
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={20} />
                  </button>
                </div>
                <p id="password-help" className={styles.helpText}>หากลืมรหัสผ่าน โปรดติดต่อผู้ดูแลระบบ</p>
              </div>

              <button className={styles.submit} type="submit" disabled={loading}>
                {loading ? <span className={styles.spinner} aria-hidden="true" /> : <Icon name="arrow" size={20} />}
                <span>{loading ? 'กำลังตรวจสอบบัญชี...' : 'เข้าสู่ระบบ' + selectedRole.title}</span>
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
