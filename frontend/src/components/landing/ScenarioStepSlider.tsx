'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './ScenarioStepSlider.module.css';

interface ScenarioStep {
  id: string;
  stepNum: number;
  tag: string;
  titleEn: string;
  titleTh: string;
  image: string;
  alt: string;
  objective: string;
  checklist: string[];
  tipEn: string;
  tipTh: string;
}

const SCENARIO_STEPS: ScenarioStep[] = [
  {
    id: 'step-1',
    stepNum: 1,
    tag: 'STEP 1: PREPARATION',
    titleEn: 'Prepare Before Service',
    titleTh: 'การเตรียมความพร้อมก่อนการบริการ',
    image: '/images/service_prepare.jpg',
    alt: 'Step 1: Prepare Before Service - Table Setting and Grooming Checklist',
    objective: 'ในบทเรียนสถานการณ์จำลอง นักเรียนจะได้รับการประเมินความพร้อมและฝึกใช้ภาษาอังกฤษตามรายการตรวจสอบมาตรฐานสากล:',
    checklist: [
      'Check grooming (บุคลิกภาพ & ยูนิฟอร์ม)',
      'Check table setup (การจัดวางอุปกรณ์บนโต๊ะ)',
      'Check station (จุดเตรียมบริการ Sideboard)',
      'Know the menu (รอบรู้รายละเอียดรายการอาหาร)',
      'Check cutlery (ช้อนส้อมมีด สะอาด ไร้คราบ)',
      'Check glassware (เครื่องแก้ว ใสไร้รอยนิ้วมือ)',
      'Ensure cleanliness (ความสะอาดถูกสุขลักษณะ)',
      'Service Mind (จิตบริการ ความพร้อม 100%)',
    ],
    tipEn: 'Proper preparation ensures smooth service, prevents delays, and creates an exceptional first impression.',
    tipTh: 'การเตรียมความพร้อมอย่างละเอียดรอบคอบ ช่วยให้การบริการราบรื่น ไม่ติดขัด และสร้างความประทับใจแรกพบให้แก่แขกผู้มาเยือน',
  },
  {
    id: 'step-4',
    stepNum: 4,
    tag: 'STEP 4: MENU PRESENTATION',
    titleEn: 'Present the Menu',
    titleTh: 'การนำเสนอเมนูอาหารและแนะนำรายการพิเศษ',
    image: '/images/service_step_4_menu.jpg',
    alt: 'Step 4: Present the Menu - F&B Tips Guide',
    objective: 'Offer the menu professionally and explain today\'s specials (นำเสนอเมนูอย่างมืออาชีพและแนะนำรายการพิเศษของวัน):',
    checklist: [
      'Present from the Right (ยื่นเล่มเมนูจากด้านขวาของแขก)',
      'Introduce Specials (แนะนำเมนูพิเศษและจานเด่นของเชฟ)',
      'Be Knowledgeable (รอบรู้ส่วนผสมและพร้อมตอบคำถาม)',
      'Allow Time (ให้เวลาแขกพิจารณาเมนูโดยไม่เร่งรัด)',
      'Open to First Page (เปิดหน้าแรกให้แขกในระดับสายตาพอเหมาะ)',
      'Warm Eye Contact (สบตา ยิ้มแย้ม และน้ำเสียงสุภาพ)',
    ],
    tipEn: 'Good menu presentation helps guests make confident choices and enhances their dining experience.',
    tipTh: 'การนำเสนอเมนูที่ดี ช่วยให้แขกตัดสินใจเลือกได้อย่างมั่นใจ และยกระดับประสบการณ์มื้ออาหารให้น่าจดจำ',
  },
  {
    id: 'step-5',
    stepNum: 5,
    tag: 'STEP 5: WATER SERVICE',
    titleEn: 'Offer Water',
    titleTh: 'การบริการเสิร์ฟน้ำดื่มและการสอบถามความต้องการ',
    image: '/images/service_step_5_water.jpg',
    alt: 'Step 5: Offer Water - F&B Tips Guide',
    objective: 'Serve still or sparkling water and confirm the guest\'s preference (เสนอทางเลือกน้ำดื่มและยืนยันความต้องการของแขกอย่างสุภาพ):',
    checklist: [
      'Serve Promptly (ให้บริการน้ำดื่มทันทีหลังแขกนั่งเรียบร้อย)',
      'Give Options (เสนอทางเลือกน้ำดื่มธรรมดา หรือ Sparkling)',
      'Confirm Preference (ยืนยันความต้องการก่อนทำการรินเสิร์ฟ)',
      'Serve Properly (รินเสิร์ฟจากด้านขวา หันฉลากเข้าหาแขก)',
      'Check Glass Level (รินน้ำในระดับ 3/4 ของแก้วพอดี)',
      'Service Napkin (ใช้ผ้าเช็ดหยดน้ำที่คอขวด ไม่ให้หยดเลอะโต๊ะ)',
    ],
    tipEn: 'Offering water shows care and sets a positive tone for the guest\'s experience.',
    tipTh: 'การใส่ใจเสนอเสิร์ฟน้ำดื่มทันที แสดงถึงความเอาใจใส่และสร้างบรรยากาศอันอบอุ่นน่าประทับใจตั้งแต่เริ่มต้น',
  },
  {
    id: 'step-6',
    stepNum: 6,
    tag: 'STEP 6: ORDER TAKING',
    titleEn: 'Take Beverage Order',
    titleTh: 'การรับคำสั่งเครื่องดื่มและการแนะนำอย่างมืออาชีพ',
    image: '/images/service_step_6_beverage_order.jpg',
    alt: 'Step 6: Take Beverage Order - F&B Tips Guide',
    objective: 'Suggest beverages professionally and repeat the order (แนะนำเครื่องดื่มที่เข้าคู่กับอาหารและทวนคำสั่งอย่างถูกต้อง):',
    checklist: [
      'Be Attentive (ตั้งใจฟังความต้องการและคำขอพิเศษของแขก)',
      'Make Suggestions (แนะนำเครื่องดื่มที่เข้าคู่กับอาหาร)',
      'Repeat the Order (ทวนรายการเครื่องดื่มให้ชัดเจนป้องกันผิดพลาด)',
      'Show Appreciation (กล่าวขอบคุณและสอบถามความต้องการเพิ่มเติม)',
      'Accurate Note Taking (จดบันทึกลง Order Pad หรือ POS ทันที)',
      'Proper Posture (ยืนตัวตรง สง่างาม เว้นระยะห่างพอเหมาะ)',
    ],
    tipEn: 'Personalized suggestions and accurate order taking enhance the guest experience.',
    tipTh: 'การให้คำแนะนำเครื่องดื่มอย่างรู้จริงและการทวนคำสั่งอย่างแม่นยำ ช่วยสร้างความมั่นใจและความประทับใจสูงสุด',
  },
  {
    id: 'step-7',
    stepNum: 7,
    tag: 'STEP 7: BEVERAGE SERVICE',
    titleEn: 'Serve Beverage',
    titleTh: 'การเสิร์ฟเครื่องดื่มตามมาตรฐานสากล',
    image: '/images/service_step_7_serve_beverage.jpg',
    alt: 'Step 7: Serve Beverage - F&B Tips Guide',
    objective: 'Deliver beverages following 5-star hotel service protocols (เสิร์ฟเครื่องดื่มตามระเบียบและมาตรฐานการบริการระดับ 5 ดาว):',
    checklist: [
      'Check Accuracy (ตรวจสอบความถูกต้องของเครื่องดื่มก่อนยกเสิร์ฟ)',
      'Use Clean Glassware (ใช้แก้วที่สะอาด ไร้รอยคราบและอุณหภูมิเหมาะสม)',
      'Add Garnish (ตรวจชิ้นส่วนประดับแก้ว มะนาว สะระแหน่ ให้สดสวยงาม)',
      'Serve from Right (เสิร์ฟจากด้านขวามือของแขกเสมอ)',
      'Confirm Satisfaction (สบตา กล่าวเชิญดื่ม และยืนยันความพึงพอใจ)',
      'Tray Balance (ถือถาดเสิร์ฟด้วยมือซ้ายอย่างมั่นคงและปลอดภัย)',
    ],
    tipEn: 'Serving beverages with precision, elegance, and warmth reflects true hospitality excellence.',
    tipTh: 'การเสิร์ฟเครื่องดื่มด้วยความแม่นยำ สง่างาม และรอยยิ้มที่อบอุ่น สะท้อนถึงความเป็นเลิศในการบริการอย่างแท้จริง',
  },
];

export default function ScenarioStepSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = SCENARIO_STEPS.length;
  const currentStep = SCENARIO_STEPS[currentIndex];

  // Auto-play interval
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, total]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ---------------------------------------------------------
          SLIDER GRID
          --------------------------------------------------------- */}
      <div className={styles.sliderGrid}>
        {/* Left Column: Photo Frame Slider */}
        <div className={styles.photoCol}>
          <div
            className={styles.photoFrame}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Badges */}
            <div className={styles.slideOverlay}>
              <div className={styles.stepPill}>
                <span className={styles.stepPillGold}>F&B GUIDE</span>
                <span>• Step {currentStep.stepNum}</span>
              </div>
              <div className={styles.slideCounter}>
                {currentIndex + 1} / {total}
              </div>
            </div>

            {/* Slide Image */}
            <Image
              key={currentStep.id}
              src={currentStep.image}
              alt={currentStep.alt}
              width={1024}
              height={819}
              className={styles.slideImage}
              priority={currentIndex === 0}
            />

            {/* Arrows */}
            <button
              type="button"
              className={`${styles.navArrow} ${styles.navArrowPrev}`}
              onClick={handlePrev}
              aria-label="สไลด์ก่อนหน้า"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.navArrow} ${styles.navArrowNext}`}
              onClick={handleNext}
              aria-label="สไลด์ถัดไป"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Dots & Auto-Play Status */}
          <div className={styles.photoControls}>
            <div className={styles.dotsRow}>
              {SCENARIO_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`ไปที่ขั้นตอนที่ ${s.stepNum}`}
                />
              ))}
            </div>

            <div
              className={styles.autoPlayTag}
              onClick={() => setIsPaused(!isPaused)}
              title="คลิกเพื่อหยุดหรือเล่นสไลด์อัตโนมัติ"
            >
              <span className={`${styles.autoPlayDot} ${isPaused ? styles.autoPlayDotPaused : ''}`} />
              <span>{isPaused ? 'หยุดชั่วคราว (ชี้เมาส์)' : 'เลื่อนอัตโนมัติ 6 วิ'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Synchronized Checklist & F&B Tip */}
        <div className={styles.contentCol}>
          <div>
            <div className={styles.contentHeader}>
              <div className={styles.stepSuperTag}>
                <span>★</span> {currentStep.tag}
              </div>
              <h3 className={styles.stepTitle}>
                {currentStep.stepNum}. {currentStep.titleEn}
              </h3>
              <div className={styles.stepTitleTh}>{currentStep.titleTh}</div>
              <p className={styles.stepObjective}>{currentStep.objective}</p>
            </div>

            {/* Checklist items */}
            <div className={styles.checklistGrid}>
              {currentStep.checklist.map((item, i) => (
                <div key={i} className={styles.checklistItem}>
                  <span className={styles.checkIcon}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* F&B Tip Card */}
            <div className={styles.tipCard}>
              <div className={styles.tipIconWrap}>💡</div>
              <div className={styles.tipContent}>
                <div className={styles.tipLabel}>F&B Excellence Tip</div>
                <div className={styles.tipTextEn}>&ldquo;{currentStep.tipEn}&rdquo;</div>
                <div className={styles.tipTextTh}>{currentStep.tipTh}</div>
              </div>
            </div>
          </div>

          {/* Footer Step Navigation */}
          <div className={styles.footerNav}>
            <button
              type="button"
              className={styles.btnStepNav}
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              ← ย้อนกลับ (Step {currentIndex > 0 ? SCENARIO_STEPS[currentIndex - 1].stepNum : ''})
            </button>
            <button
              type="button"
              className={`${styles.btnStepNav} ${styles.btnStepNext}`}
              onClick={handleNext}
            >
              <span>{currentIndex === total - 1 ? 'วนกลับไปเริ่มต้น ↺' : `ขั้นตอนถัดไป (Step ${SCENARIO_STEPS[(currentIndex + 1) % total].stepNum}) →`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

