'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import styles from './StudentAppSlider.module.css'

export interface SlideItem {
  id: string
  step: string
  badge: string
  title: string
  subtitle: string
  image: string
  alt: string
  tabLabel: string
  tabIcon: string
}

const SLIDES: SlideItem[] = [
  {
    id: 'slide-dashboard',
    step: 'DASHBOARD',
    badge: 'หน้าหลักการเรียนรู้',
    title: 'Student Dashboard & FINE Loop',
    subtitle: 'ยินดีต้อนรับผู้เรียน ติดตามคะแนนรวม และวงรอบการเรียนรู้ 4 ขั้นตอน',
    image: '/images/student_app_slide_1_dashboard.jpg',
    alt: 'หน้าจอ Student Dashboard และ FINE Learning Loop',
    tabLabel: 'หน้าหลัก',
    tabIcon: '🏠',
  },
  {
    id: 'slide-explore',
    step: 'F · EXPLORE',
    badge: 'ขั้น F: สร้างความคุ้นเคย',
    title: 'AR 3D Model & AI Scan',
    subtitle: 'เลือกสแกนวัตถุเครื่องมือบริการด้วยกล้อง AI หรือศึกษาโมเดล 3D เสมือนจริง',
    image: '/images/student_app_slide_2_explore.jpg',
    alt: 'หน้าจอ F - Explore สแกน AR 3D และ AI Scan สดเรียลไทม์',
    tabLabel: 'F · สแกน 3D',
    tabIcon: '🔍',
  },
  {
    id: 'slide-speak',
    step: 'I · INTERACT',
    badge: 'ขั้น I: มีปฏิสัมพันธ์',
    title: 'AI Voice Coach & Pronunciation',
    subtitle: 'ฝึกฟังเสียงเจ้าของภาษา พูดออกเสียงประโยคบริการ และประเมินความถูกต้องทันที',
    image: '/images/student_app_slide_3_speak.jpg',
    alt: 'หน้าจอ I - Speak ฝึกฟังและพูดประโยคงงานบริการ',
    tabLabel: 'I · ฝึกพูด AI',
    tabIcon: '🗣️',
  },
  {
    id: 'slide-scenario',
    step: 'N · SCENARIO',
    badge: 'ขั้น N: จำลองสถานการณ์',
    title: 'Real-Time Hotel Simulation',
    subtitle: 'จำลองการต้อนรับและบริการลูกค้าชาวต่างชาติ Mr. Robert Smith แบบเรียลไทม์',
    image: '/images/student_app_slide_4_scenario.jpg',
    alt: 'หน้าจอ N - Scenario Restaurant Simulation โต้ตอบบทสนทนาบริการ',
    tabLabel: 'N · จำลองบริการ',
    tabIcon: '🛎️',
  },
  {
    id: 'slide-exhibit',
    step: 'E · EXHIBIT',
    badge: 'ขั้น E: สรุปและสะสมผลงาน',
    title: 'E-Portfolio & Digital Certificate',
    subtitle: 'ทบทวนผลการฝึก วัดความก้าวหน้า KSA-C และเปิดดูใบประกาศนียบัตรดิจิทัล',
    image: '/images/student_app_slide_5_exhibit.jpg',
    alt: 'หน้าจอ E - Exhibit ทบทวนผลการฝึกและรับใบประกาศนียบัตรดิจิทัล',
    tabLabel: 'E · ผลการฝึก',
    tabIcon: '📊',
  },
]

export default function StudentAppSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length)
  }, [])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-slide effect (every 3.8s, pauses on hover)
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      goToNext()
    }, 3800)
    return () => clearInterval(timer)
  }, [isPaused, goToNext])

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    const threshold = 40 // Minimum swipe distance
    if (diff > threshold) {
      goToNext()
    } else if (diff < -threshold) {
      goToPrev()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const currentSlide = SLIDES[currentIndex]

  return (
    <div
      className={styles.sliderRoot}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="ตัวอย่างหน้าจอแอปพลิเคชัน FINE MODEL บนสมาร์ทโฟน"
    >
      {/* Smartphone Device Frame */}
      <div className={styles.phoneDevice}>
        {/* Dynamic Island / Camera Notch */}
        <div className={styles.dynamicIsland} aria-hidden="true">
          <div className={styles.cameraLens} />
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
            {SLIDES.map((slide, idx) => (
              <div key={slide.id} className={styles.slideItem}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  width={508}
                  height={914}
                  className={styles.slideImage}
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>

          {/* Bottom Virtual Home Bar */}
          <div className={styles.homeBar} aria-hidden="true" />
        </div>
      </div>

      {/* Caption Card Synchronized with Current Slide */}
      <div className={styles.captionCard}>
        <div className={styles.captionHeader}>
          <span className={styles.captionBadge}>{currentSlide.badge}</span>
          <span className={styles.captionCounter}>
            ({currentIndex + 1} / {SLIDES.length})
          </span>
        </div>
        <div className={styles.captionTitle}>{currentSlide.title}</div>
        <p className={styles.captionSubtitle}>{currentSlide.subtitle}</p>
      </div>

      {/* 5 Tab Navigation Buttons */}
      <div className={styles.tabBar} role="tablist" aria-label="เลือกลำดับขั้นตอนหน้าจอ">
        {SLIDES.map((slide, idx) => {
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
