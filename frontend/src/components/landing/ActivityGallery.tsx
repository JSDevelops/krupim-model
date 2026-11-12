'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import styles from './ActivityGallery.module.css'

interface GalleryItem {
  id: string
  title: string
  category: 'simulation' | 'demo'
  categoryLabel: string
  tag: string
  description: string
  image: string
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'act-1',
    title: 'การฝึกปฏิบัติรับคำสั่งอาหาร (Taking Orders)',
    category: 'simulation',
    categoryLabel: 'สถานการณ์บริการจริง',
    tag: 'Service Simulation',
    description: 'นักเรียนฝึกปฏิบัติการรับคำสั่งอาหารและเครื่องดื่มจากลูกค้าชาวต่างชาติในสถานการณ์จำลองจริง โดยมีครูพิมคอยให้คำแนะนำอย่างใกล้ชิด',
    image: '/images/gallery/activity-01.jpg',
  },
  {
    id: 'act-2',
    title: 'การสนทนาแนะนำเมนูอาหารภาษาอังกฤษ',
    category: 'simulation',
    categoryLabel: 'สถานการณ์บริการจริง',
    tag: 'English Communication',
    description: 'การฝึกทักษะการสนทนาภาษาอังกฤษเพื่อการบริการ แนะนำเมนูอาหาร และสร้างความมั่นใจในการตอบสนองความต้องการของลูกค้าสากล',
    image: '/images/gallery/activity-02.jpg',
  },
  {
    id: 'act-3',
    title: 'การสังเกตการณ์และประเมินตามสภาพจริง',
    category: 'simulation',
    categoryLabel: 'สถานการณ์บริการจริง',
    tag: 'Authentic Assessment',
    description: 'ครูพิมสังเกตการณ์การปฏิบัติงานและบันทึกประเมินสมรรถนะ KSA-C ของผู้เรียนระหว่างการบริการในสถานการณ์จริง',
    image: '/images/gallery/activity-03.jpg',
  },
  {
    id: 'act-4',
    title: 'มารยาทและท่วงท่าการบริการระดับสากล',
    category: 'simulation',
    categoryLabel: 'สถานการณ์บริการจริง',
    tag: 'Hospitality Etiquette',
    description: 'การฝึกอบรมบุคลิกภาพ ท่วงท่าการส่งมอบบริการด้วยความสุภาพ มารยาทการโรงแรม และไหวพริบการแก้ปัญหาเฉพาะหน้า',
    image: '/images/gallery/activity-04.jpg',
  },
  {
    id: 'act-5',
    title: 'การตรวจสอบคุณภาพและความใสของแก้วไวน์',
    category: 'demo',
    categoryLabel: 'การสาธิตทักษะวิชาชีพ',
    tag: 'Wine Glass Inspection',
    description: 'ครูพิมสาธิตวิธีการตรวจสอบความสะอาด ไร้รอยคราบ และความสมบูรณ์ของแก้วไวน์ (Inspection) ก่อนการจัดโต๊ะอาหารบริการ',
    image: '/images/gallery/activity-05.jpg',
  },
  {
    id: 'act-6',
    title: 'เทคนิคการเช็ดแก้วไวน์ตามมาตรฐานสากล',
    category: 'demo',
    categoryLabel: 'การสาธิตทักษะวิชาชีพ',
    tag: 'Glass Polishing Technique',
    description: 'การสาธิตการใช้ผ้าเช็ดแก้วเฉพาะอย่างถูกสุขลักษณะและระมัดระวัง เพื่อความเงางามและรักษาคุณภาพรูปทรงของแก้วไวน์',
    image: '/images/gallery/activity-06.jpg',
  },
  {
    id: 'act-7',
    title: 'การสาธิตท่วงท่าการถือและจัดวางแก้ว',
    category: 'demo',
    categoryLabel: 'การสาธิตทักษะวิชาชีพ',
    tag: 'Professional Handling',
    description: 'การจัดท่วงท่าและการทรงตัวในการถือแก้วไวน์ตามมาตรฐานห้องอาหารชั้นนำ เพื่อความสง่างามและความปลอดภัยในการปฏิบัติงาน',
    image: '/images/gallery/activity-07.jpg',
  },
  {
    id: 'act-8',
    title: 'การเตรียมอุปกรณ์และขั้นตอนบริการไวน์',
    category: 'demo',
    categoryLabel: 'การสาธิตทักษะวิชาชีพ',
    tag: 'Wine Service Setup',
    description: 'การสาธิตการใช้อุปกรณ์บริการไวน์ ถังแช่ไวน์ (Wine Cooler) และการจัดเตรียมโต๊ะบริการให้พร้อมรองรับผู้มารับบริการ',
    image: '/images/gallery/activity-08.jpg',
  },
]

export default function ActivityGallery() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'demo'>('simulation')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const filteredItems = GALLERY_ITEMS.filter((item) => item.category === activeTab)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const showNext = useCallback(() => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredItems.length))
  }, [selectedIndex, filteredItems.length])

  const showPrev = useCallback(() => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length))
  }, [selectedIndex, filteredItems.length])

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (selectedIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'ArrowLeft') showPrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, showNext, showPrev])

  return (
    <section id="gallery" className={styles.gallerySection} aria-label="ภาพบรรยากาศการจัดการเรียนรู้และการฝึกปฏิบัติจริง">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.headerWrap}>
          <div className={styles.eyebrowBadge}>
            <span className={styles.eyebrowDot} />
            <span>PRACTICAL LEARNING GALLERY · ACTIVE LEARNING &amp; SERVICE PRACTICE</span>
          </div>
          <h2 className={styles.title}>
            ภาพบรรยากาศการจัดการเรียนรู้ &amp; การฝึกปฏิบัติการบริการจริง
          </h2>
          <p className={styles.subtitle}>
            การบูรณาการกระบวนการ FINE Model สู่การปฏิบัติงานจริงในห้องอาหารจำลอง: การสื่อสารภาษาอังกฤษกับลูกค้าชาวต่างชาติ
            และการสาธิตทักษะมาตรฐานวิชาชีพการบริการอาหารและเครื่องดื่ม โดย ครูพิม (นางสาวอนัญญา วิชัยผิน) แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์
          </p>

          {/* Filter Tabs */}
          <div className={styles.tabsWrap} role="tablist" aria-label="หมวดหมู่ภาพกิจกรรม">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'simulation'}
              className={`${styles.tabBtn} ${activeTab === 'simulation' ? styles.tabBtnActive : ''}`}
              onClick={() => { setActiveTab('simulation'); setSelectedIndex(null); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>สถานการณ์บริการลูกค้าจริง (4)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'demo'}
              className={`${styles.tabBtn} ${activeTab === 'demo' ? styles.tabBtnActive : ''}`}
              onClick={() => { setActiveTab('demo'); setSelectedIndex(null); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>การสาธิตทักษะบริการมาตรฐาน (4)</span>
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={styles.grid}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={styles.card}
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openLightbox(index)
                }
              }}
              aria-label={`คลิกเพื่อดูภาพขนาดใหญ่: ${item.title}`}
            >
              <div className={styles.imageContainer}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={styles.image}
                  priority={index < 4}
                />
                <div className={styles.overlayGradient} />

                {/* Top Badge */}
                <div className={styles.topBadge}>
                  <span className={styles.tagPill}>{item.tag}</span>
                </div>

                {/* Zoom Hint Icon */}
                <div className={styles.zoomIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>

                {/* Bottom Content Card */}
                <div className={styles.cardContent}>
                  <div className={styles.cardCategory}>{item.categoryLabel}</div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className={styles.galleryFooter}>
          <div className={styles.footerBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#215c43" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>
              จัดการเรียนรู้และการฝึกอบรมจริง ณ แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && filteredItems[selectedIndex] && (
        <div
          className={styles.lightboxBackdrop}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="รูปภาพขนาดใหญ่"
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={closeLightbox}
              aria-label="ปิดภาพขนาดใหญ่"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Prev Button */}
            <button
              type="button"
              className={`${styles.navBtn} ${styles.prevBtn}`}
              onClick={showPrev}
              aria-label="รูปก่อนหน้า"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              type="button"
              className={`${styles.navBtn} ${styles.nextBtn}`}
              onClick={showNext}
              aria-label="รูปถัดไป"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Large Image Frame */}
            <div className={styles.lightboxMedia}>
              <div className={styles.lightboxImageWrap}>
                <Image
                  src={filteredItems[selectedIndex].image}
                  alt={filteredItems[selectedIndex].title}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>

            {/* Caption & Info Bar */}
            <div className={styles.lightboxCaption}>
              <div className={styles.lightboxMeta}>
                <span className={styles.lightboxTag}>
                  {filteredItems[selectedIndex].tag}
                </span>
                <span className={styles.lightboxCounter}>
                  รูปที่ {selectedIndex + 1} จาก {filteredItems.length}
                </span>
              </div>
              <h3 className={styles.lightboxTitle}>
                {filteredItems[selectedIndex].title}
              </h3>
              <p className={styles.lightboxDesc}>
                {filteredItems[selectedIndex].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

