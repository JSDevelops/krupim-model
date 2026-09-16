'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRole } from '@/context/RoleContext'
import styles from './IdleSecurityGuard.module.css'

interface ShapeItem {
  id: string
  nameTh: string
  nameEn: string
  icon: React.ReactNode
}

const ALL_SHAPES: ShapeItem[] = [
  {
    id: 'cube',
    nameTh: 'ลูกบาศก์',
    nameEn: 'Cube',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: 'cylinder',
    nameTh: 'ทรงกระบอก',
    nameEn: 'Cylinder',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    id: 'sphere',
    nameTh: 'ทรงกลม',
    nameEn: 'Sphere',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    id: 'pyramid',
    nameTh: 'พีระมิด',
    nameEn: 'Pyramid',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polygon points="12 2 2 20 22 20 12 2" />
        <line x1="12" y1="2" x2="12" y2="20" />
        <line x1="2" y1="20" x2="12" y2="15" />
        <line x1="22" y1="20" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: 'cone',
    nameTh: 'กรวยกลม',
    nameEn: 'Cone',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="m12 2 9 17.5a9 3 0 0 1-18 0Z" />
        <ellipse cx="12" cy="19.5" rx="9" ry="2.5" />
      </svg>
    ),
  },
  {
    id: 'torus',
    nameTh: 'วงแหวน',
    nameEn: 'Torus',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
]

// ระยะเวลาที่ไม่มีการใช้งานก่อนล็อกหน้าจอ (ค่าเริ่มต้น 10 นาที = 600,000 ms)
const IDLE_TIMEOUT_MS = 10 * 60 * 1000

export default function IdleSecurityGuard() {
  const { user, logout, loading } = useRole()
  const [isLocked, setIsLocked] = useState(false)
  const [challengeShapes, setChallengeShapes] = useState<ShapeItem[]>([])
  const [targetShape, setTargetShape] = useState<ShapeItem | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(0)

  // ฟังก์ชันสุ่มโจทย์ทายรูปทรง 3 มิติ
  const generateNewChallenge = useCallback(() => {
    // สุ่มเลือก 4 รูปทรงจาก ALL_SHAPES
    const shuffled = [...ALL_SHAPES].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 4)
    // สุ่มเลือก 1 รูปทรงเป็นเป้าหมาย
    const target = selected[Math.floor(Math.random() * selected.length)]

    setChallengeShapes(selected)
    setTargetShape(target)
    setIsSuccess(false)
    setErrorMsg('')
  }, [])

  // ฟังก์ชันเปิดล็อกหน้าจอ
  const triggerLock = useCallback(() => {
    if (!user) return
    setIsLocked(true)
    generateNewChallenge()
  }, [user, generateNewChallenge])

  // รีเซ็ตตัวจับเวลาเมื่อมีการขยับเมาส์/กดคีย์บอร์ด
  const resetTimer = useCallback(() => {
    if (isLocked) return // ถ้าล็อกอยู่ไม่ต้องรีเซ็ต
    lastActivityRef.current = Date.now()

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      triggerLock()
    }, IDLE_TIMEOUT_MS)
  }, [isLocked, triggerLock])

  useEffect(() => {
    if (loading || !user) return

    // ฟังก์ชัน handler พร้อม throttle 1 วินาที
    let lastHandled = 0
    const handleUserActivity = () => {
      const now = Date.now()
      if (now - lastHandled > 1000) {
        lastHandled = now
        resetTimer()
      }
    }

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'pointerdown']
    events.forEach(ev => window.addEventListener(ev, handleUserActivity, { passive: true }))

    // เริ่มต้นตัวจับเวลา
    resetTimer()

    // ให้เรียก window.__krupim_lock_screen() เพื่อทดสอบล็อกได้ทันที
    if (typeof window !== 'undefined') {
      ;(window as unknown as { __krupim_lock_screen?: () => void }).__krupim_lock_screen = () => {
        triggerLock()
      }
    }

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleUserActivity))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [loading, user, resetTimer, triggerLock])

  // การตรวจสอบเมื่อคลิกเลือกรูปทรง
  const handleSelectShape = (shape: ShapeItem) => {
    if (isSuccess || !targetShape) return

    if (shape.id === targetShape.id) {
      // ตอบถูก -> ยืนยันตัวตนมนุษย์สำเร็จ!
      setIsSuccess(true)
      setErrorMsg('')

      setTimeout(() => {
        setIsLocked(false)
        setIsSuccess(false)
        resetTimer()
      }, 700)
    } else {
      // ตอบผิด
      setErrorMsg('⚠️ รูปทรงไม่ตรงกับที่ระบุ กรุณาลองใหม่อีกครั้ง')
      setTimeout(() => {
        generateNewChallenge()
      }, 800)
    }
  }

  // หากไม่มีผู้ใช้ หรือยังโหลดไม่เสร็จ หรือยังไม่ล็อก ไม่ต้องแสดงหน้าต่าง
  if (loading || !user || !isLocked) {
    return null
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="idle-lock-title">
      <div className={styles.modal}>
        <div className={styles.shieldHeader}>
          <div className={styles.shieldIcon}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <span className={styles.badge}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            ระบบป้องกันหน้าจออัตโนมัติ (Idle Guard)
          </span>
          <h2 id="idle-lock-title" className={styles.title}>
            หน้าจอถูกล็อกเนื่องจากไม่มีการใช้งาน
          </h2>
          <p className={styles.subtitle}>
            เพื่อความปลอดภัยของข้อมูลโมเดล 3D และผลการประเมิน กรุณายืนยันว่าท่านคือ <strong>มนุษย์ผู้ใช้งานจริง (ไม่ใช่ AI/Bot)</strong>
          </p>
        </div>

        <div className={styles.userCard}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userRole}>
              {user.role === 'teacher' ? '👨‍🏫 ครูผู้สอน' : user.role === 'student' ? '🎓 นักเรียน' : '⚡ ผู้ดูแลระบบ'}
            </div>
          </div>
          <span style={{ fontSize: '1.25rem' }}>🔒</span>
        </div>

        <div className={styles.challengeBox}>
          <div className={styles.challengeTitle}>
            <span>🧩</span>
            <span>ภารกิจยืนยันความเป็นมนุษย์ (Proof of Human)</span>
          </div>
          <div className={styles.challengeDesc}>
            กรุณาแตะที่รูปทรง 3 มิติที่เป็น <span className={styles.targetHighlight}>{targetShape ? `${targetShape.nameTh} (${targetShape.nameEn})` : '...'}</span> เพื่อปลดล็อก:
          </div>

          {isSuccess ? (
            <div className={styles.successBanner}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>ยืนยันสำเร็จ! ยินดีต้อนรับกลับสู่ระบบ</span>
            </div>
          ) : (
            <div className={styles.gridShapes}>
              {challengeShapes.map((shape) => (
                <button
                  key={shape.id}
                  type="button"
                  className={styles.shapeBtn}
                  onClick={() => handleSelectShape(shape)}
                  title={shape.nameTh}
                >
                  {shape.icon}
                  <span className={styles.shapeLabel}>{shape.nameTh}</span>
                </button>
              ))}
            </div>
          )}

          {errorMsg && !isSuccess && (
            <div className={styles.errorBanner}>
              {errorMsg}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => logout()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            ออกจากระบบ
          </button>
          <span className={styles.infoHint}>
            FINE Model Security Shield v1.0
          </span>
        </div>
      </div>
    </div>
  )
}
