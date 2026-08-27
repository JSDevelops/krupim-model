'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'
import StudentIcon from '@/app/student/StudentIcon'
import logo from '../../../public/logo.png'
import styles from './page.module.css'

type Step = 'request' | 'reset' | 'complete'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [localMode, setLocalMode] = useState(false)

  useEffect(() => {
    const queryToken = new URLSearchParams(window.location.search).get('token')
    const hashToken = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token')
    const resetToken = (hashToken || queryToken || '').trim()
    if (resetToken.length >= 32 && resetToken.length <= 200) {
      const timer = window.setTimeout(() => {
        setToken(resetToken)
        setStep('reset')
      }, 0)
      window.history.replaceState({}, '', '/forgot-password')
      return () => window.clearTimeout(timer)
    }
  }, [])

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const payload = await response.json() as { error?: string; localResetToken?: string; delivery?: 'email' | 'local' }
      if (!response.ok) throw new Error(payload.error || 'ไม่สามารถสร้างคำขอกู้คืนได้')
      if (payload.localResetToken) {
        setToken(payload.localResetToken)
        setLocalMode(true)
      }
      setStep(payload.localResetToken ? 'reset' : 'request')
      toast.success('สร้างคำขอกู้คืนแล้ว', {
        description: payload.localResetToken ? 'ระบบใส่รหัส Local แบบใช้ครั้งเดียวให้แล้ว' : 'ตรวจสอบกล่องอีเมลและเปิดลิงก์ตั้งรหัสผ่านใหม่',
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถสร้างคำขอกู้คืนได้')
    } finally {
      setBusy(false)
    }
  }

  async function confirmReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmPassword) return toast.warning('รหัสผ่านใหม่และช่องยืนยันไม่ตรงกัน')
    setBusy(true)
    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      setPassword('')
      setConfirmPassword('')
      setToken('')
      setStep('complete')
      toast.success('ตั้งรหัสผ่านใหม่สำเร็จ')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className={styles.page}>
      <span className={styles.orb} aria-hidden="true" />
      <header className={styles.brand}>
        <Image src={logo} alt="FINE MODEL" width={46} height={46} priority />
        <span><strong>FINE MODEL</strong><small>SECURE ACCOUNT RECOVERY</small></span>
      </header>

      <section className={styles.card} aria-labelledby="recovery-title">
        <div className={styles.icon}><StudentIcon name={step === 'complete' ? 'check' : 'lock'} size={24} /></div>
        <p className={styles.eyebrow}>ACCOUNT SECURITY</p>
        <h1 id="recovery-title">{step === 'complete' ? 'ตั้งรหัสผ่านใหม่แล้ว' : 'กู้คืนรหัสผ่าน'}</h1>
        <p className={styles.description}>
          {step === 'request' && 'ระบุอีเมลของบัญชีเพื่อสร้างรหัสกู้คืนแบบใช้ครั้งเดียว ซึ่งมีอายุ 20 นาที'}
          {step === 'reset' && 'กรอกรหัสกู้คืนและตั้งรหัสผ่านใหม่ที่คาดเดาได้ยาก'}
          {step === 'complete' && 'คุณสามารถกลับไปเลือกบทบาทและเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที'}
        </p>

        {step === 'request' && (
          <form className={styles.form} onSubmit={requestReset}>
            <label><span>อีเมลบัญชี</span><div className={styles.inputWrap}><StudentIcon name="message" size={18} /><input required type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={event => setEmail(event.target.value)} /></div></label>
            <button className={styles.primary} type="submit" disabled={busy}>{busy ? 'กำลังสร้างคำขอ' : 'สร้างรหัสกู้คืน'}<StudentIcon name="arrowRight" size={17} /></button>
          </form>
        )}

        {step === 'reset' && (
          <form className={styles.form} onSubmit={confirmReset}>
            {localMode && <div className={styles.localNotice}><StudentIcon name="info" size={17} /><span><strong>Local development</strong> ระบบใส่รหัสใช้ครั้งเดียวให้อัตโนมัติ ห้ามใช้รูปแบบนี้ใน production</span></div>}
            <label><span>รหัสกู้คืน</span><div className={styles.inputWrap}><StudentIcon name="key" size={18} /><input required minLength={32} autoComplete="one-time-code" value={token} onChange={event => setToken(event.target.value)} /></div></label>
            <div className={styles.twoColumns}>
              <label><span>รหัสผ่านใหม่</span><div className={styles.inputWrap}><StudentIcon name="lock" size={18} /><input required minLength={10} type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShowPassword(value => !value)}><StudentIcon name={showPassword ? 'eyeOff' : 'eye'} size={18} /></button></div></label>
              <label><span>ยืนยันรหัสผ่าน</span><div className={styles.inputWrap}><StudentIcon name="lock" size={18} /><input required minLength={10} type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></div></label>
            </div>
            <p className={styles.hint}>อย่างน้อย 10 ตัวอักษร และต้องมี A–Z, a–z และตัวเลข</p>
            <button className={styles.primary} type="submit" disabled={busy}>{busy ? 'กำลังบันทึก' : 'ตั้งรหัสผ่านใหม่'}<StudentIcon name="check" size={17} /></button>
          </form>
        )}

        {step === 'complete' && <Link className={styles.primary} href="/role-select">กลับไปเข้าสู่ระบบ<StudentIcon name="arrowRight" size={17} /></Link>}

        {step !== 'complete' && <div className={styles.footer}><button type="button" onClick={() => setStep(step === 'reset' ? 'request' : step)} disabled={step === 'request' || busy}>เริ่มใหม่</button><Link href="/role-select"><StudentIcon name="arrowLeft" size={15} /> กลับหน้าเข้าสู่ระบบ</Link></div>}
      </section>
    </main>
  )
}
