'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import styles from './TeacherConsoleSlider.module.css'

export interface TeacherSlideItem {
  id: string
  badge: string
  title: string
  subtitle: string
  image: string
  alt: string
  tabLabel: string
  tabIcon: string
}

const TEACHER_SLIDES: TeacherSlideItem[] = [
  {
    id: 'slide-dashboard',
    badge: 'ระบบจัดการชั้นเรียน',
    title: 'Teacher Console & Dashboard',
    subtitle: 'ภาพรวมห้องเรียน 2 ห้อง นักเรียน 42 คน ติดตามการส่งงาน และตรวจสอบโควต้า AI ประจำวัน',
    image: '/images/teacher_console_slide_1_dashboard.jpg',
    alt: 'แดชบอร์ดครูผู้สอน FINE Model Teacher Console',
    tabLabel: 'แดชบอร์ด',
    tabIcon: '📊',
  },
  {
    id: 'slide-lessons',
    badge: 'คลังแผนการสอนบูรณาการ',
    title: '18-Week Lesson Plan Management',
    subtitle: 'แผนการสอนตามกระบวนการ FINE Model ครบ 18 สัปดาห์ ครอบคลุม 220 วัตถุประสงค์ KSA-C',
    image: '/images/teacher_console_slide_2_lessons.jpg',
    alt: 'แผนการสอน FINE Model 18 สัปดาห์',
    tabLabel: 'แผนการสอน 18 สัปดาห์',
    tabIcon: '📑',
  },
  {
    id: 'slide-ar-modal',
    badge: 'ระบบเพิ่มสื่อเสมือนจริง',
    title: 'AR 3D Model Management & Upload',
    subtitle: 'อัปโหลดและจัดการไฟล์โมเดล 3 มิติ (.GLB สำหรับ Android/Web และ .USDZ สำหรับ iOS AR)',
    image: '/images/teacher_console_slide_3_ar_modal.jpg',
    alt: 'หน้าต่างเพิ่มและอัปโหลดโมเดล AR 3D',
    tabLabel: 'เพิ่มสื่อ AR 3D',
    tabIcon: '📦',
  },
  {
    id: 'slide-vocab',
    badge: 'คลังคำศัพท์วิชาชีพ',
    title: 'Hospitality Vocabulary Repository',
    subtitle: 'คลังคำศัพท์เฉพาะทางงานบริการอาหารและเครื่องดื่ม 51 รายการ พร้อมรูปภาพ สัทอักษร และสื่อ 3D',
    image: '/images/teacher_console_slide_4_vocab.jpg',
    alt: 'คลังคำศัพท์วิชาชีพการโรงแรม FINE Model',
    tabLabel: 'คลังคำศัพท์ 51 รายการ',
    tabIcon: '📚',
  },
  {
    id: 'slide-classroom',
    badge: 'บริหารสมาชิกและห้องเรียน',
    title: 'Classroom & Student Management',
    subtitle: 'จัดกลุ่มห้องเรียน ปวช.1 และ ปวช.2 รายชื่อสมาชิก 42 คน พร้อมระบบลิงก์เชิญและติดตามผล',
    image: '/images/teacher_console_slide_5_classroom.jpg',
    alt: 'การจัดการห้องเรียนและสมาชิกนักเรียน',
    tabLabel: 'ห้องเรียน & สมาชิก',
    tabIcon: '👥',
  },
]

export default function TeacherConsoleSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % TEACHER_SLIDES.length)
  }, [])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + TEACHER_SLIDES.length) % TEACHER_SLIDES.length)
  }, [])

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-slide effect (every 4s, pauses on hover)
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      goToNext()
    }, 4000)
    return () => clearInterval(timer)
  }, [isPaused, goToNext])

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 40) {
      goToNext()
    } else if (diff < -40) {
      goToPrev()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const currentSlide = TEACHER_SLIDES[currentIndex]

  return (
    <div
      className={styles.sliderRoot}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="ตัวอย่างหน้าจอ Teacher Console สำหรับครูผู้สอน"
    >
      {/* Modern Desktop Browser Console Frame */}
      <div className={styles.consoleFrame}>
        {/* Titlebar with window controls and address bar */}
        <div className={styles.titleBar}>
          <div className={styles.windowControls} aria-hidden="true">
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
          <div className={styles.addressBar}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>fine-model.app/teacher/console</span>
          </div>
          <div className={styles.padRight} aria-hidden="true" />
        </div>

        {/* Floating Side Arrows */}
        <button
          type="button"
          onClick={goToPrev}
          className={styles.navArrowPrev}
          aria-label="สไลด์ก่อนหน้า"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={goToNext}
          className={styles.navArrowNext}
          aria-label="สไลด์ถัดไป"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Screen Viewport with Carousel Track */}
        <div
          className={styles.screenViewport}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={styles.carouselTrack}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {TEACHER_SLIDES.map((slide, idx) => (
              <div key={slide.id} className={styles.slideItem}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  width={1024}
                  height={559}
                  className={styles.slideImage}
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Caption Card Synchronized with Current Slide */}
      <div className={styles.captionCard}>
        <div className={styles.captionHeader}>
          <span className={styles.captionBadge}>{currentSlide.badge}</span>
          <span className={styles.captionCounter}>
            ({currentIndex + 1} / {TEACHER_SLIDES.length})
          </span>
        </div>
        <div className={styles.captionTitle}>{currentSlide.title}</div>
        <p className={styles.captionSubtitle}>{currentSlide.subtitle}</p>
      </div>

      {/* 5 Tab Navigation Buttons */}
      <div className={styles.tabBar} role="tablist" aria-label="เลือกลำดับหน้าจอระบบครูผู้สอน">
        {TEACHER_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => goToIndex(idx)}
              className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
            >
              <span>{slide.tabIcon}</span>
              <span>{slide.tabLabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
