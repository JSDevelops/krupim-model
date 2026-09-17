'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import StudentIcon, { type StudentIconName } from '@/app/student/StudentIcon'
import styles from './StudentManualView.module.css'

export type ManualCategory =
  | 'ALL'
  | 'GETTING_STARTED'
  | 'FINE_STAGES'
  | 'SUBMISSION'
  | 'AR_3D'
  | 'EVALUATION'
  | 'TIPS_FAQ'

export interface ManualTopic {
  id: string
  number: string
  title: string
  shortTitle: string
  category: ManualCategory
  categoryLabel: string
  icon: string
  studentIcon?: StudentIconName
  description: string
  actionUrl?: string
  actionLabel?: string
  keywords: string[]
  subSections: {
    title: string
    description?: string
    steps?: string[]
    table?: {
      headers: string[]
      rows: string[][]
    }
    tip?: string
    warning?: string
    note?: string
    flowDiagram?: string
  }[]
}

export const STUDENT_MANUAL_TOPICS: ManualTopic[] = [
  {
    id: 'part-1-getting-started',
    number: 'ส่วนที่ 01',
    title: 'เริ่มต้นใช้งานครั้งแรก & ติดตั้งแอปบนมือถือ',
    shortTitle: 'เริ่มต้น & ติดตั้งแอป',
    category: 'GETTING_STARTED',
    categoryLabel: 'เริ่มต้น',
    icon: '🚀',
    studentIcon: 'user',
    description: 'การเลือกบทบาทนักเรียน, สมัครสมาชิก, ยอมรับ PDPA, เข้าสู่ระบบ และวิธีติดตั้ง Web App ลงบนหน้าจอมือถือ',
    actionUrl: '/role-select',
    actionLabel: 'หน้าเลือกบทบาท',
    keywords: ['สมัคร', 'เข้าสู่ระบบ', 'login', 'register', 'pdpa', 'ติดตั้ง', 'iphone', 'android', 'pwa', 'รหัสผ่าน', 'ลืมรหัสผ่าน'],
    subSections: [
      {
        title: '1.1 การสมัครสมาชิกใหม่ (Register)',
        description: 'เข้าสู่ระบบผ่านเบราว์เซอร์บนมือถือหรือคอมพิวเตอร์ แล้วดำเนินการดังนี้:',
        steps: [
          'เลือกบทบาท "นักเรียน" (Student) ที่หน้าแรก',
          'กดปุ่ม "สมัครสมาชิก" (Register)',
          'กรอกชื่อ-นามสกุลจริง, อีเมลที่ใช้งานได้, และรหัสผ่านความปลอดภัย (อย่างน้อย 8 ตัวอักษร)',
          'กรอกรหัสเชิญจากคุณครูผู้สอน (ถ้ามี เช่น KRUPIM)',
          'อ่านและกดยินยอม "นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)" เพื่อเปิดสิทธิ์การจัดเก็บข้อมูลการเรียน',
          'กดปุ่ม "สมัครสมาชิก" เพื่อสร้างบัญชีและเข้าสู่ระบบทันที',
        ],
        table: {
          headers: ['ช่องข้อมูล', 'คำแนะนำ', 'ตัวอย่าง'],
          rows: [
            ['ชื่อ-นามสกุล', 'ชื่อ-นามสกุลจริงภาษาไทยเพื่อออกใบประกาศ', 'สมหญิง ใจดี'],
            ['อีเมล', 'อีเมลที่ใช้รับผลคะแนนและการแจ้งเตือน', 'student@school.ac.th'],
            ['รหัสผ่าน', 'ความยาวขั้นต่ำ 8 ตัวอักษร มีตัวอักษรและตัวเลข', 'PimFine2024'],
          ],
        },
      },
      {
        title: '1.2 การเข้าสู่ระบบ (Login) & ลืมรหัสผ่าน',
        steps: [
          'เปิดหน้าเข้าสู่ระบบนักเรียน กรอกอีเมลและรหัสผ่าน แล้วกด "เข้าสู่ระบบ"',
          'กรณีลืมรหัสผ่าน: กด "ลืมรหัสผ่าน?" กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่านใหม่ทางอีเมล',
        ],
      },
      {
        title: '1.3 ติดตั้งแอปบนมือถือ (PWA เพื่อเปิดไวไม่ต้องโหลดจากสโตร์)',
        steps: [
          'iPhone / iPad (Safari): กดปุ่มแชร์ (สี่เหลี่ยมลูกศรชี้ขึ้น) -> เลื่อนลงเลือก "เพิ่มไปยังหน้าจอหลัก" (Add to Home Screen) -> กด "เพิ่ม"',
          'Android (Chrome): กดเมนูจุด 3 จุดมุมขวาบน -> เลือก "ติดตั้งแอป" หรือ "เพิ่มลงในหน้าจอหลัก" -> กด "ติดตั้ง"',
        ],
        tip: 'การติดตั้งลงหน้าจอหลัก จะทำให้เปิดแอปได้เต็มจอเหมือนแอปพลิเคชันจริง ลื่นไหลและประหยัดอินเทอร์เน็ต',
      },
    ],
  },
  {
    id: 'part-2-navigation',
    number: 'ส่วนที่ 02',
    title: 'การนำทางหลัก (Bottom Navigation Bar)',
    shortTitle: 'แถบนำทาง FINE',
    category: 'FINE_STAGES',
    categoryLabel: 'FINE Model',
    icon: '🧭',
    studentIcon: 'target',
    description: 'เรียนรู้ปุ่มลัด 5 เมนูหลัก F, I, N, E, P และการทำงานของตัวเลขแจ้งเตือนสีแดง (Badge)',
    actionUrl: '/student/explore',
    actionLabel: 'ทดลองใช้งานเมนู',
    keywords: ['เมนู', 'แถบนำทาง', 'bottom nav', 'badge', 'แจ้งเตือน', 'f', 'i', 'n', 'e', 'p'],
    subSections: [
      {
        title: '2.1 หน้าที่ของปุ่มนำทาง 5 ปุ่ม',
        table: {
          headers: ['ปุ่ม', 'ชื่อกระบวนการ', 'หน้าที่หลัก'],
          rows: [
            ['F', 'Familiarize (Explore)', 'สำรวจอุปกรณ์, คลังคำศัพท์, ภารกิจประจำสัปดาห์ และสแกน AI'],
            ['I', 'Interact (Speak)', 'ฝึกออกเสียงประโยคบริการอาหาร, ประเมินความถูกต้องรายคำ, และสนทนากับ AI'],
            ['N', 'Navigate (Scenario)', 'ฝึกแก้ปัญหาตามสถานการณ์จำลอง (Fine Dining, การรับออร์เดอร์, การจัดโต๊ะ)'],
            ['E', 'Exhibit (Review)', 'ทำแบบทดสอบ Quiz 5 ข้อ, ตรวจสอบประวัติการฝึก และดูกราฟคะแนน KSA-C'],
            ['P', 'Portfolio (Profile)', 'ตรวจสอบโปรไฟล์, ภาพรวมสมรรถนะ, รายการการบ้าน และรับ Certificate'],
          ],
        },
      },
      {
        title: '2.2 การแจ้งเตือนงานค้างด้วยตัวเลขสีแดง (Badge)',
        steps: [
          'เมื่อคุณครูมอบหมายงานใหม่ จะมีตัวเลขสีแดงปรากฏบนปุ่มขั้นตอนนั้นๆ (เช่น F: 2 แปลว่ามี 2 งานที่ต้องทำในขั้น Familiarize)',
          'สามารถแตะที่ตัวเลขสีแดงได้โดยตรง เพื่อเปิดหน้าต่าง Quick View งานค้างขึ้นมาทันที',
        ],
        tip: 'ปุ่มลอย "📋 งานค้าง" ที่มุมล่างขวา จะสรุปจำนวนงานค้างรวมทั้งหมด สามารถกดเพื่อเปิดดูงานได้ตลอดเวลา',
      },
    ],
  },
  {
    id: 'part-3-quick-view',
    number: 'ส่วนที่ 03',
    title: 'ระบบงานค้าง & ส่งงานด่วน (Quick View Direct Submit)',
    shortTitle: 'งานค้าง & ส่งงานด่วน',
    category: 'SUBMISSION',
    categoryLabel: 'การส่งงาน',
    icon: '📋',
    studentIcon: 'task',
    description: 'วิธีตรวจสอบการบ้านที่ครูสั่ง กรองตามขั้นตอน F/I/N/E และส่งไฟล์หรือลิงก์ผลงานได้ทันที',
    keywords: ['งานค้าง', 'quick view', 'การบ้าน', 'ส่งงาน', 'อัปโหลด', 'แนบไฟล์', 'ลิงก์', 'drive'],
    subSections: [
      {
        title: '3.1 วิธีเปิดและกรองรายการงานค้าง',
        steps: [
          'กดปุ่ม "📋 งานค้าง" ที่ลอยอยู่ด้านล่าง หรือแตะตัวเลข Badge บนแถบเมนู',
          'ใช้แท็บตัวกรองด้านบนเพื่อดูงานเฉพาะหมวด: "ทั้งหมด", "F · Explore", "I · Speak", "N · Scenario", "E · Review"',
          'การ์ดแต่ละใบจะแสดงชื่องาน, วันกำหนดส่ง, คะแนนเต็ม, และชื่อแผนการสอน',
        ],
      },
      {
        title: '3.2 ขั้นตอนการส่งงานด่วน (Direct Submit)',
        steps: [
          'กดปุ่ม "📤 ส่งงาน" บนการ์ดงานที่ต้องการส่ง',
          'กรอกชื่อผลงานหรือข้อความอธิบาย (เช่น "ส่งแบบฝึกสแกนอุปกรณ์ 20 รายการ")',
          'แนบไฟล์ผลงาน: รองรับ PDF, รูปภาพ (JPG, PNG, WEBP), Word, PowerPoint ขนาดไม่เกิน 12 MB',
          'หรือระบุลิงก์ผลงานออนไลน์: วาง URL เช่น Google Drive, Canva, YouTube, หรือ Padlet',
          'กดปุ่ม "ยืนยันการส่งงาน" ระบบจะส่งเข้า Dashboard ของคุณครูทันทีและการ์ดจะหายไปจากรายการงานค้าง',
        ],
        warning: 'กรณีแนบลิงก์ Google Drive อย่าลืมตั้งค่าสิทธิ์แชร์เป็น "ทุกคนที่มีลิงก์มีสิทธิ์ดู" เพื่อให้คุณครูเปิดตรวจได้',
      },
    ],
  },
  {
    id: 'part-4-explore',
    number: 'ส่วนที่ 04',
    title: 'F — Familiarize · Explore (สำรวจ & สแกน AI)',
    shortTitle: 'F · สำรวจ & สแกน AI',
    category: 'FINE_STAGES',
    categoryLabel: 'Familiarize',
    icon: '🔍',
    studentIcon: 'camera',
    description: 'ภารกิจสัปดาห์ที่ 2 แบบสไลเดอร์ 20 รายการ, คลังคำศัพท์ 3D, และระบบสแกนกล้อง AI Auto-Scan',
    actionUrl: '/student/explore',
    actionLabel: 'เปิดหน้า Explore',
    keywords: ['explore', 'สแกน', 'ai scan', 'ภารกิจสัปดาห์ที่ 2', 'คำศัพท์', '3d', 'คลังศัพท์', 'กล้อง'],
    subSections: [
      {
        title: '4.1 ภารกิจประจำสัปดาห์ (Mission Tracker สัปดาห์ที่ 2)',
        description: 'สแกนหรือฝึกออกเสียงรายการอาหารและเครื่องดื่มครบ 20 รายการ:',
        steps: [
          'เลื่อนดูการ์ดรายการในสไลเดอร์แนวนอน (Swipe ซ้าย-ขวา หรือกดปุ่ม ◀ ▶)',
          'เลือกตัวกรองหมวดหมู่: Appetizers (เรียกน้ำย่อย), Main Courses (จานหลัก), Desserts (ของหวาน), Beverages (เครื่องดื่ม)',
          'กดปุ่ม "🎙️ ฝึกพูด" บนการ์ด แล้วออกเสียงชื่อรายการภาษาอังกฤษให้ชัดเจน',
          'เมื่อพูดผ่าน (คะแนน >= 60%) การ์ดจะขึ้นเครื่องหมาย ✅ สีเขียว และแถบความคืบหน้าจะเพิ่มขึ้น',
          'เมื่อฝึกเสร็จ กดปุ่ม "ส่งงานให้ครู" เพื่อส่งคะแนนเฉลี่ยเข้าระบบทันที',
        ],
      },
      {
        title: '4.2 คลังคำศัพท์ & อุปกรณ์ 3D (Vocabulary Library)',
        steps: [
          'พิมพ์ค้นหาชื่ออุปกรณ์ภาษาไทยหรืออังกฤษในช่องค้นหา',
          'แตะที่การ์ดอุปกรณ์เพื่อเปิด Quick View รายละเอียด: แสดงคำอ่านสัทอักษร (Phonetics), ประโยคตัวอย่าง, ปุ่ม 🔊 ฟังเสียงเจ้าของภาษา, และปุ่ม "ดูโมเดล 3D"',
        ],
      },
      {
        title: '4.3 การสแกนวัตถุจริงด้วย AI Camera (AI Scan)',
        steps: [
          'กดปุ่ม "เปิดกล้อง" และอนุญาตสิทธิ์การเข้าถึงกล้องบนเบราว์เซอร์',
          'ส่องกล้องไปยังจานอาหาร เครื่องดื่ม หรืออุปกรณ์บนโต๊ะอาหาร แล้วกด "สแกน"',
          'หรือเปิดโหมด "Auto Scan" เพื่อให้ระบบตรวจจับวัตถุให้อัตโนมัติทุก 8 วินาที',
          'AI จะวิเคราะห์ผลลัพธ์พร้อมแท็บ FINE 4 มิติ: คำศัพท์ (F), ฝึกพูดและฟังประโยค (I), ลำดับขั้นตอนบริการ (N), และแบบทดสอบทบทวน (E)',
        ],
        tip: 'หากวัตถุที่สแกนตรงกับรายการใน Mission สัปดาห์ที่ 2 ระบบจะเช็คเครื่องหมายสำเร็จในการ์ดภารกิจให้อัตโนมัติ!',
      },
    ],
  },
  {
    id: 'part-5-interact',
    number: 'ส่วนที่ 05',
    title: 'I — Interact · Speak (ฝึกพูด & สนทนาภาษาอังกฤษ)',
    shortTitle: 'I · ฝึกพูด & สนทนา',
    category: 'FINE_STAGES',
    categoryLabel: 'Interact',
    icon: '💬',
    studentIcon: 'mic',
    description: 'ฝึกออกเสียงประโยคงานบริการ, ตรวจจับคำถูกต้องรายคำ (สีเขียว/แดง), และแชทคุยกับ AI Tutor',
    actionUrl: '/student/interact',
    actionLabel: 'เปิดหน้า Interact',
    keywords: ['พูด', 'สนทนา', 'speak', 'interact', 'ai chat', 'ออกเสียง', 'ไมค์', 'accent'],
    subSections: [
      {
        title: '5.1 ฝึกออกเสียงประโยคสื่อสารงานบริการ',
        steps: [
          'เลือกประโยคที่ต้องการฝึก เช่น การต้อนรับลูกค้า, การแนะนำเมนู, การขอโทษกรณีล่าช้า',
          'กดปุ่ม "🔊 ฟัง" เพื่อฟังสำเนียงต้นแบบของประโยค',
          'กดปุ่ม "🎙️ เริ่มพูด" แล้วออกเสียงตามประโยคนั้นให้ชัดเจน',
          'ระบบจะประเมินผลความถูกต้องรายคำ: คำที่ออกเสียงถูกต้องจะแสดงเป็นตัวอักษร สีเขียว ✅, คำที่ออกเสียงผิดจะแสดงเป็น สีแดง ❌',
          'ดูคะแนนรวม (0–100%) หากได้ต่ำกว่า 80% แนะนำให้ฟังซ้ำแล้วลองใหม่อีกครั้ง',
        ],
        table: {
          headers: ['ระดับคะแนน', 'ความหมาย', 'คำแนะนำ'],
          rows: [
            ['90–100%', '🌟 ยอดเยี่ยม', 'สำเนียงชัดเจนและเป็นธรรมชาติมาก'],
            ['80–89%', '✅ ดีมาก', 'พร้อมสำหรับการสื่อสารในสถานการณ์จริง'],
            ['60–79%', '⚠️ พอใช้', 'ควรฝึกพูดซ้ำโดยเน้นคำที่เป็นสีแดง'],
            ['น้อยกว่า 60%', '❌ ต้องปรับปรุง', 'กดฟังเสียงต้นแบบอีกรอบแล้วพูดช้าๆ ชัดๆ'],
          ],
        },
      },
      {
        title: '5.2 สนทนาโต้ตอบกับ AI Restaurant Coach',
        steps: [
          'พิมพ์ข้อความภาษาอังกฤษในช่อง Chat เช่น ขอคำแนะนำเกี่ยวกับเมนู หรือจำลองบทสนทนาเป็นพนักงานเสิร์ฟ',
          'AI จะตอบกลับในบริบทของลูกค้าหรือผู้จัดการร้าน ช่วยเสริมสร้างความมั่นใจในการตอบโต้อย่างมืออาชีพ',
        ],
      },
    ],
  },
  {
    id: 'part-6-navigate',
    number: 'ส่วนที่ 06',
    title: 'N — Navigate · Scenario (ฝึกตามสถานการณ์จำลอง)',
    shortTitle: 'N · สถานการณ์จำลอง',
    category: 'FINE_STAGES',
    categoryLabel: 'Navigate',
    icon: '📦',
    studentIcon: 'target',
    description: 'ฝึกแก้ปัญหาตามสถานการณ์จริง เช่น จัดโต๊ะแบบ Western Style, รับออร์เดอร์, และรับมือข้อร้องเรียน',
    actionUrl: '/student/navigate',
    actionLabel: 'เปิดหน้า Navigate',
    keywords: ['scenario', 'navigate', 'สถานการณ์', 'จัดโต๊ะ', 'รับออร์เดอร์', 'แก้ปัญหา', 'table setting'],
    subSections: [
      {
        title: '6.1 เลือกสถานการณ์การเรียนรู้',
        steps: [
          'เลือกสถานการณ์ที่ได้รับมอบหมาย เช่น "Table Setting Challenge", "Order Taking", หรือ "Complaint Handling"',
          'อ่านบทบาทสมมติ (เช่น พนักงานบริการในห้องอาหารโรงแรม 5 ดาว) และเป้าหมายของภารกิจ',
        ],
      },
      {
        title: '6.2 เรียนรู้คำศัพท์ & ประโยคประจำสถานการณ์',
        steps: [
          'แท็บคำศัพท์: ศึกษาอุปกรณ์เฉพาะทาง เช่น Cutlery, Glassware, Linen พร้อมหลักการ Outside-In (ใช้อุปกรณ์จากด้านนอกเข้าด้านใน)',
          'แท็บประโยค: ฟังและฝึกพูดประโยคที่ต้องใช้ในการแก้ปัญหาของสถานการณ์นั้น',
          'เมื่อฝึกครบทุกหัวข้อ กดปุ่ม "ส่งงาน" เพื่อบันทึกผลการปฏิบัติลงสู่สมุดคะแนน',
        ],
      },
    ],
  },
  {
    id: 'part-7-exhibit',
    number: 'ส่วนที่ 07',
    title: 'E — Exhibit · Review (ทดสอบ & ทบทวนผลการเรียน)',
    shortTitle: 'E · ทดสอบ & ทบทวน',
    category: 'FINE_STAGES',
    categoryLabel: 'Exhibit',
    icon: '📋',
    studentIcon: 'exhibit',
    description: 'ตรวจสอบประวัติกิจกรรมที่เคยทำ, ทำแบบทดสอบ Quiz 5 ข้อวัดความรู้, และติดตามสมรรถนะ KSA-C',
    actionUrl: '/student/exhibit',
    actionLabel: 'เปิดหน้า Exhibit',
    keywords: ['quiz', 'exhibit', 'review', 'ประวัติ', 'แบบทดสอบ', 'คะแนน', 'ksa-c', 'ทบทวน'],
    subSections: [
      {
        title: '7.1 การทำแบบทดสอบ Quiz ทบทวน',
        steps: [
          'เข้าแท็บ "Quiz" แล้วกดปุ่ม "เริ่มทำ Quiz"',
          'ตอบคำถามปรนัย 4 ตัวเลือก จำนวน 5 ข้อ ระบบจะจับเวลาและสุ่มคำถามตามบทเรียน',
          'เลือกคำตอบที่ถูกต้องแล้วกด "ยืนยัน" เพื่อดูเฉลยทันที',
          'เมื่อทำครบ 5 ข้อ ระบบจะแสดงคะแนนรวม และปุ่ม "ส่งคะแนน" เพื่อบันทึกลงโปรไฟล์',
        ],
      },
      {
        title: '7.2 การติดตามประวัติและสมรรถนะ KSA-C',
        steps: [
          'แท็บ "ประวัติ": แสดงรายการกิจกรรมย้อนหลัง เช่น การแชทกับ AI, การฝึก Live Coach, และเวลาที่ใช้เรียน',
          'แท็บ "คะแนน": แสดงกราฟแท่งประเมินสมรรถนะ 4 ด้าน (Knowledge, Skills, Attitude, Competency)',
        ],
      },
    ],
  },
  {
    id: 'part-8-ar-view',
    number: 'ส่วนที่ 08',
    title: 'AR View — โมเดล 3 มิติเสมือนจริง & AR Quick Look',
    shortTitle: 'โมเดล 3D & AR View',
    category: 'AR_3D',
    categoryLabel: '3D & AR',
    icon: '📐',
    studentIcon: 'cube',
    description: 'การหมุน/ซูมโมเดล 3D และการฉายภาพ AR ลงบนโต๊ะจริงผ่านกล้องมือถือ',
    actionUrl: '/student/ar-view',
    actionLabel: 'เปิดหน้า AR View',
    keywords: ['ar', '3d', 'ar view', 'โมเดล', 'quick look', 'หมุนโมเดล', 'วางบนโต๊ะ'],
    subSections: [
      {
        title: '8.1 การควบคุมโมเดล 3D',
        table: {
          headers: ['ท่าทางการสัมผัส', 'ผลการควบคุม'],
          rows: [
            ['ใช้นิ้วเดียวลาก', 'หมุนโมเดลรอบทิศทาง 360 องศา'],
            ['จีบนิ้วเข้า / กางออก (Pinch)', 'ย่อ หรือ ขยายขนาดโมเดล'],
            ['ใช้สองนิ้วลากพร้อมกัน', 'เลื่อนตำแหน่งโมเดลบนหน้าจอ'],
            ['แตะ 2 ครั้งติดกัน (Double Tap)', 'รีเซ็ตมุมมองกลับสู่ตำแหน่งเริ่มต้น'],
          ],
        },
      },
      {
        title: '8.2 โหมด AR วางโมเดลลงบนโลกจริง',
        steps: [
          'กดปุ่ม "📐 ดูในโหมด AR"',
          'iPhone / iPad: จะเปิดระบบ AR Quick Look อัตโนมัติ ให้ส่องกล้องลงที่โต๊ะหรือพื้นราบจนโมเดลปรากฏ',
          'Android: จะเปิดผ่าน WebXR บน Chrome ให้เลื่อนกล้องช้าๆ เพื่อสแกนพื้นผิว',
          'สามารถเดินดูโมเดลรอบโต๊ะได้เหมือนมีอุปกรณ์วางอยู่จริง',
        ],
        tip: 'ในหน้า AR View มีปุ่ม 🔊 ฟังชื่ออุปกรณ์ และ 🎙️ ฝึกพูดชื่อภาษาอังกฤษเพื่อเก็บคะแนนได้ด้วย',
      },
    ],
  },
  {
    id: 'part-9-scanner',
    number: 'ส่วนที่ 09',
    title: 'Scanner — สแกน QR Code เปิดสื่อ 3D & AR ทันที',
    shortTitle: 'QR Code Scanner',
    category: 'AR_3D',
    categoryLabel: '3D & AR',
    icon: '📷',
    studentIcon: 'camera',
    description: 'วิธีสแกน QR Code บนใบงานหรือการ์ดคำศัพท์ของคุณครูเพื่อเปิดโมเดล 3D โดยตรง',
    actionUrl: '/student/scanner',
    actionLabel: 'เปิดกล้องสแกน QR',
    keywords: ['qr', 'scanner', 'สแกน qr', 'กล้อง', 'ไฟฉาย', 'ซูม'],
    subSections: [
      {
        title: '9.1 การใช้งานสแกนเนอร์',
        steps: [
          'กดเมนู Scanner หรือกดไอคอน QR Code จากหน้า AR View',
          'ส่องกล้องให้ QR Code อยู่ภายในกรอบสี่เหลี่ยมสีเขียว',
          'หากอยู่ในที่มืด สามารถกดปุ่ม "🔦 ไฟฉาย" เพื่อเปิดแฟลชกล้อง',
          'สามารถกดปุ่ม "🔍 ซูม" เพื่อสแกน QR Code ในระยะไกล',
          'เมื่อสแกนสำเร็จ ระบบจะเปิดหน้าโมเดล AR 3D ของอุปกรณ์นั้นขึ้นมาทันที',
        ],
        note: 'QR Code ต้องเป็นโค้ดที่สร้างจากระบบ FINE MODEL ของคุณครูเท่านั้น จึงจะเชื่อมโยงกับโมเดล 3D ได้',
      },
    ],
  },
  {
    id: 'part-10-simulation',
    number: 'ส่วนที่ 10',
    title: 'Simulation — ห้องฝึกบริการเสมือนจริงกับ AI',
    shortTitle: 'ห้องจำลอง Simulation',
    category: 'FINE_STAGES',
    categoryLabel: 'Simulation',
    icon: '🎮',
    studentIcon: 'sparkles',
    description: 'ฝึกบทสนทนาโต้ตอบกับ AI ในสถานการณ์จริงแบบจับเวลา 10 นาที พร้อมรายงานผล 4 มิติ',
    actionUrl: '/student/simulation',
    actionLabel: 'เข้าห้อง Simulation',
    keywords: ['simulation', 'จำลอง', 'ai', 'สนทนา', 'จับเวลา', 'รายงานผล', 'feedback'],
    subSections: [
      {
        title: '10.1 ขั้นตอนการเข้าฝึก Simulation',
        steps: [
          'เลือกหัวข้อสถานการณ์จำลอง แล้วกด "เริ่ม Simulation"',
          'ระบบจะเริ่มจับเวลาถอยหลัง (10 นาที)',
          'โต้ตอบกับ AI ได้ทั้ง 2 วิธี: พิมพ์ข้อความภาษาอังกฤษ หรือ กดปุ่ม 🎙️ ค้างไว้เพื่อพูด',
          'เมื่อจบบทสนทนา หรือกด "สิ้นสุดการจำลอง" ระบบ AI จะประมวลผลทันที',
        ],
      },
      {
        title: '10.2 ผลการประเมิน 4 มิติหลังจบจำลอง',
        table: {
          headers: ['มิติการประเมิน', 'คำอธิบาย'],
          rows: [
            ['Knowledge', 'ความถูกต้องของข้อมูลเมนู ขั้นตอน และอุปกรณ์'],
            ['Skills', 'ความคล่องแคล่วและไวยากรณ์ในการสื่อสาร'],
            ['Attitude', 'ระดับความสุภาพ Service Mind และการใช้คำสุภาพ'],
            ['Competency', 'สมรรถนะการแก้ไขปัญหาเฉพาะหน้าโดยรวม'],
          ],
        },
      },
    ],
  },
  {
    id: 'part-11-portfolio',
    number: 'ส่วนที่ 11',
    title: 'P — Portfolio · Profile (สมรรถนะ & ใบประกาศนียบัตร)',
    shortTitle: 'P · แฟ้มผลงาน & ใบประกาศ',
    category: 'EVALUATION',
    categoryLabel: 'แฟ้มผลงาน',
    icon: '👤',
    studentIcon: 'award',
    description: 'ตรวจสอบชั่วโมงเรียน, สถิติ KSA-C, แก้ไขโปรไฟล์, ตรวจสอบงานที่ส่งแล้ว, และดาวน์โหลด Certificate',
    actionUrl: '/student/profile',
    actionLabel: 'เปิดหน้า Portfolio',
    keywords: ['profile', 'portfolio', 'certificate', 'ใบประกาศ', 'แก้ไขโปรไฟล์', 'เปลี่ยนรหัส', 'ksa-c'],
    subSections: [
      {
        title: '11.1 จัดการโปรไฟล์และรหัสผ่าน',
        steps: [
          'แตะที่รูปโปรไฟล์เพื่อเปลี่ยนภาพประจำตัว (ระบบจะปรับขนาดและบีบอัดให้อัตโนมัติ)',
          'กดปุ่ม "แก้ไขโปรไฟล์" เพื่อแก้ไขชื่อ-นามสกุล, โรงเรียน, เบอร์โทร และข้อความแนะนำตัว',
          'กดปุ่ม "เปลี่ยนรหัสผ่าน" กรอกรหัสเดิมและรหัสใหม่เพื่อความปลอดภัย',
        ],
      },
      {
        title: '11.2 การรับใบประกาศนียบัตร (Certificate of Completion)',
        steps: [
          'เมื่อทำคะแนนเฉลี่ยรวมผ่านเกณฑ์ที่หลักสูตรกำหนด แบนเนอร์สีทองจะปลดล็อก',
          'กดปุ่ม "ดูใบประกาศนียบัตร" หรือ "ดาวน์โหลด Certificate"',
          'ในใบประกาศจะมีชื่อ-นามสกุลจริง, สถาบันการศึกษา, คะแนนสมรรถนะ, และรหัสตรวจสอบ (Certificate Code) อย่างเป็นทางการ',
        ],
      },
    ],
  },
  {
    id: 'part-12-workflow',
    number: 'ส่วนที่ 12',
    title: 'ขั้นตอนการส่งงานและการประเมิน (Workflow ครบวงจร)',
    shortTitle: 'Workflow การส่งงาน',
    category: 'SUBMISSION',
    categoryLabel: 'การส่งงาน',
    icon: '🔄',
    studentIcon: 'check',
    description: 'แผนภาพ Flow chart การเรียนรู้ตั้งแต่เริ่มต้น เข้าสู่ระบบ ทำกิจกรรม จนถึงครูตรวจให้คะแนน',
    keywords: ['workflow', 'ขั้นตอน', 'flow chart', 'ส่งงาน', 'ประเมิน', 'คะแนน', 'feedback'],
    subSections: [
      {
        title: '12.1 แผนผังเส้นทางการเรียนรู้ของนักเรียน (Student Flow)',
        flowDiagram: `[เข้าสู่ระบบนักเรียน]
       │
       ▼
[ตรวจเช็คงานที่มอบหมาย] ──► เปิดดู "📋 งานค้าง" หรือ แถบ Portfolio
       │
       ▼
[ทำกิจกรรมตามขั้นตอน FINE]
  ├── F: สแกนอุปกรณ์ AI / ฝึกออกเสียง Mission 20 รายการ
  ├── I: ฝึกพูดประโยคบริการอาหาร / แชทกับ AI
  ├── N: ฝึกสถานการณ์จำลองการบริการ
  └── E: ทำแบบทดสอบ Quiz 5 ข้อ
       │
       ▼
[ส่งผลงานเข้าสู่ระบบ]
  ├── แบบอัตโนมัติ (Auto): ส่งทันทีเมื่อสแกนครบ หรือ ทำ Quiz เสร็จ
  └── แบบกรอกข้อมูล (Manual): แนบไฟล์รูป/PDF หรือ ลิงก์ Drive ใน Quick View
       │
       ▼
[คุณครูตรวจผลงาน & ให้ Feedback] ──► แสดงคะแนนและคำแนะนำในแท็บ Portfolio`,
      },
      {
        title: '12.2 การตรวจสอบคะแนนและข้อเสนอแนะจากคุณครู',
        steps: [
          'เข้าสู่หน้า Portfolio -> ไปที่แท็บ "งาน"',
          'เลื่อนดูรายการงานที่สถานะเป็น "ส่งแล้ว"',
          'งานที่ครูตรวจแล้วจะแสดงคะแนนที่ได้รับ (เช่น 9/10) พร้อมข้อความติชมและคำแนะนำ (Feedback) จากครูผู้สอน',
        ],
      },
    ],
  },
  {
    id: 'part-13-troubleshooting',
    number: 'ส่วนที่ 13',
    title: 'เคล็ดลับทำคะแนนเต็ม & ตารางแก้ปัญหาที่พบบ่อย',
    shortTitle: 'เคล็ดลับ & แก้ปัญหา',
    category: 'TIPS_FAQ',
    categoryLabel: 'แก้ปัญหา',
    icon: '💡',
    studentIcon: 'info',
    description: 'เทคนิคการออกเสียงให้ได้ 100%, การถ่ายภาพสแกน AI ให้แม่นยำ, และวิธีแก้ปัญหากล้อง/ไมค์ไม่ทำงาน',
    keywords: ['ปัญหา', 'error', 'กล้องไม่ได้', 'ไมค์ไม่ได้', 'เคล็ดลับ', 'เทคนิค', 'faq', 'ช้า'],
    subSections: [
      {
        title: '13.1 เคล็ดลับการเรียนให้ได้คะแนนเต็ม',
        steps: [
          'การสแกน AI: วางสิ่งของในที่แสงสว่างเพียงพอ ไม่มีเงาบดบัง และถือกล้องให้นิ่งประมาณ 2 วินาที',
          'การฝึกออกเสียง: อยู่ในสภาพแวดล้อมที่เงียบ ฟังเสียงต้นแบบ 1-2 ครั้งก่อนกดอัดเสียง แล้วออกเสียงด้วยระดับเสียงปกติชัดถ้อยชัดคำ',
          'การทำ Quiz: ทบทวนคำศัพท์จากหน้า Explore และฝึกพูดจากหน้า Interact ก่อนเริ่มทำข้อสอบ',
        ],
      },
      {
        title: '13.2 ตารางแก้ปัญหาที่พบบ่อย (Troubleshooting)',
        table: {
          headers: ['ปัญหาที่พบ', 'สาเหตุที่เป็นไปได้', 'วิธีแก้ไข'],
          rows: [
            ['กล้องไม่เปิด / จอดำ', 'ไม่ได้อนุญาตสิทธิ์กล้องในเบราว์เซอร์', 'เข้า Settings ของมือถือ -> เลือก Safari/Chrome -> อนุญาต Camera'],
            ['ไมโครโฟนไม่บันทึกเสียง', 'ยังไม่ได้เปิดสิทธิ์ไมค์ หรือเสียงเบาเกินไป', 'ตรวจสอบการอนุญาต Microphone ในเบราว์เซอร์ และพูดให้ใกล้ไมค์มากขึ้น'],
            ['โมเดล 3D โหลดช้า', 'ความเร็วอินเทอร์เน็ตต่ำ', 'สลับใช้ WiFi หรือกดรีเฟรชหน้าเว็บอีกครั้ง'],
            ['กดส่งงานแล้วระบบนิ่ง', 'Session หมดอายุเนื่องจากเปิดค้างไว้นาน', 'กดออกจากระบบแล้ว Login ใหม่ หรือรีเฟรชหน้าเว็บ'],
            ['เปิด AR Quick Look ไม่ได้', 'อุปกรณ์หรือ iOS ไม่รองรับ', 'AR บน iOS ต้องการ iOS 12+ และบน Android ต้องใช้ Chrome WebXR'],
          ],
        },
        tip: 'หากข้อมูลบนหน้าจอไม่อัปเดต ให้กดดึงหน้าจอลงเพื่อรีเฟรช (Pull to Refresh) หรือออกจากระบบแล้วเข้าใหม่',
      },
    ],
  },
  {
    id: 'part-14-summary',
    number: 'ส่วนที่ 14',
    title: 'แผนผังสรุปภาพรวมกระบวนการ FINE Model',
    shortTitle: 'แผนผัง FINE Model',
    category: 'TIPS_FAQ',
    categoryLabel: 'สรุปภาพรวม',
    icon: '🌟',
    studentIcon: 'sparkles',
    description: 'สรุปการเชื่อมโยงความรู้ ทักษะ และการประเมินสมรรถนะครบวงจรของ FINE Model',
    keywords: ['สรุป', 'fine model', 'ภาพรวม', 'สรุปบทเรียน'],
    subSections: [
      {
        title: '14.1 แผนผังบูรณาการ FINE Model',
        flowDiagram: `    ╔════════════════════════════════════════════════════════════════╗
    ║                 FINE MODEL LEARNING WORKFLOW                   ║
    ╚════════════════════════════════════════════════════════════════╝
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
    ┌──────────┐             ┌──────────┐             ┌──────────┐
    │    F     │             │    I     │             │    N     │
    │ Familiarize│ ──► สื่อสาร ──►│ Interact │ ──► ปฏิบัติ ──►│ Navigate │
    │ (สำรวจศัพท์)│             │ (ฝึกสนทนา)│             │(จำลองสถานการณ์)│
    └──────────┘             └──────────┘             └──────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                             ┌──────────┐
                             │    E     │
                             │ Exhibit  │ ◄── ทบทวน Quiz & วัดผล
                             │(วัดสมรรถนะ)│
                             └──────────┘
                                  │
                                  ▼
                             ┌──────────┐
                             │    P     │
                             │Portfolio │ ◄── สะสมผลงาน & รับ Certificate
                             └──────────┘`,
        tip: 'เมื่อนักเรียนฝึกปฏิบัติครบตามวงรอบ FINE Model จะพัฒนาสมรรถนะครบทั้ง 4 ด้าน: ความรู้ (K), ทักษะการสื่อสาร (S), เจตคติและมารยาทบริการ (A), และสมรรถนะวิชาชีพ (C)',
      },
    ],
  },
]

export default function StudentManualView() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<ManualCategory>('ALL')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['part-1-getting-started', 'part-2-navigation']))

  const toggleTopic = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    setExpandedIds(new Set(STUDENT_MANUAL_TOPICS.map(t => t.id)))
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase()
    return STUDENT_MANUAL_TOPICS.filter(topic => {
      // Category filter
      if (activeCategory !== 'ALL' && topic.category !== activeCategory) {
        return false
      }
      // Search query filter
      if (!q) return true
      const matchTitle = topic.title.toLowerCase().includes(q)
      const matchDesc = topic.description.toLowerCase().includes(q)
      const matchKeywords = topic.keywords.some(k => k.toLowerCase().includes(q))
      const matchSub = topic.subSections.some(s =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.steps && s.steps.some(st => st.toLowerCase().includes(q)))
      )
      return matchTitle || matchDesc || matchKeywords || matchSub
    })
  }, [search, activeCategory])

  return (
    <div className={styles.manualWrap}>
      {/* Search and Category Filter Toolbar */}
      <section className={styles.manualToolbar} aria-label="เครื่องมือค้นหาคู่มือนักเรียน">
        <div className={styles.searchBar}>
          <StudentIcon name="book" size={17} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ค้นหาคู่มือ เช่น สมัคร, สแกน AI, ส่งงาน, Quiz, KSA-C, กล้อง, AR..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="ค้นหาคู่มือนักเรียน"
          />
          {search && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setSearch('')}
              aria-label="ล้างคำค้น"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Tag Pills */}
        <nav className={styles.quickTags} aria-label="ตัวกรองหมวดหมู่คู่มือ">
          <span className={styles.tagLabel}>หมวด:</span>
          <button
            type="button"
            className={`${styles.tagPill} ${activeCategory === 'ALL' ? styles.tagPillActive : ''}`}
            onClick={() => setActiveCategory('ALL')}
          >
            ทั้งหมด ({STUDENT_MANUAL_TOPICS.length})
          </button>
          <button
            type="button"
            className={`${styles.tagPill} ${activeCategory === 'GETTING_STARTED' ? styles.tagPillActive : ''}`}
            onClick={() => setActiveCategory('GETTING_STARTED')}
          >
            🚀 เริ่มต้น & ติดตั้ง
          </button>
          <button
            type="button"
            className={`${styles.tagPill} ${activeCategory === 'FINE_STAGES' ? styles.tagPillActive : ''}`}
            onClick={() => setActiveCategory('FINE_STAGES')}
          >
            🎯 ขั้นตอน F·I·N·E
          </button>
          <button
            type="button"
            className={`${styles.tagPill} ${activeCategory === 'SUBMISSION' ? styles.tagPillActive : ''}`}
            onClick={() => setActiveCategory('SUBMISSION')}
          >
            📤 งานค้าง & ส่งงาน
          </button>
          <button
            type="button"
            className={`${styles.tagPill} ${activeCategory === 'AR_3D' ? styles.tagPillActive : ''}`}
            onClick={() => setActiveCategory('AR_3D')}
          >
            📐 โมเดล 3D & AR
          </button>
          <button
            type="button"
            className={`${styles.tagPill} ${activeCategory === 'EVALUATION' ? styles.tagPillActive : ''}`}
            onClick={() => setActiveCategory('EVALUATION')}
          >
            🏆 แฟ้มผลงาน & ใบประกาศ
          </button>
          <button
            type="button"
            className={`${styles.tagPill} ${activeCategory === 'TIPS_FAQ' ? styles.tagPillActive : ''}`}
            onClick={() => setActiveCategory('TIPS_FAQ')}
          >
            💡 เคล็ดลับ & แก้ปัญหา
          </button>
        </nav>

        {/* Stats and Expand/Collapse Controls */}
        <div className={styles.statsRow}>
          <span>แสดง {filteredTopics.length} จากทั้งหมด {STUDENT_MANUAL_TOPICS.length} หมวด</span>
          <div>
            <button type="button" className={styles.toggleAllBtn} onClick={expandAll}>
              ขยายทั้งหมด
            </button>
            <span style={{ margin: '0 4px', color: '#c5d1cb' }}>|</span>
            <button type="button" className={styles.toggleAllBtn} onClick={collapseAll}>
              ย่อทั้งหมด
            </button>
          </div>
        </div>
      </section>

      {/* Accordion Topics List */}
      {filteredTopics.length > 0 ? (
        <div className={styles.topicList}>
          {filteredTopics.map(topic => {
            const isOpen = expandedIds.has(topic.id)
            return (
              <article key={topic.id} className={styles.topicCard}>
                {/* Topic Header Accordion Button */}
                <button
                  type="button"
                  className={styles.topicHeader}
                  onClick={() => toggleTopic(topic.id)}
                  aria-expanded={isOpen}
                >
                  <div className={styles.topicHeaderLeft}>
                    <div className={styles.topicIconBox}>
                      <span>{topic.icon}</span>
                    </div>
                    <div className={styles.topicMeta}>
                      <div className={styles.topicBadgeRow}>
                        <span className={styles.topicNumber}>{topic.number}</span>
                        <span className={styles.topicCategory}>{topic.categoryLabel}</span>
                      </div>
                      <h3 className={styles.topicTitle}>{topic.title}</h3>
                      {!isOpen && <p className={styles.topicDesc}>{topic.description}</p>}
                    </div>
                  </div>
                  <div className={`${styles.topicChevron} ${isOpen ? styles.topicChevronOpen : ''}`}>
                    <StudentIcon name="chevron" size={18} />
                  </div>
                </button>

                {/* Topic Body Content */}
                {isOpen && (
                  <div className={styles.topicBody}>
                    {/* Quick Link Action Banner if available */}
                    {topic.actionUrl && (
                      <div className={styles.quickActionBanner}>
                        <span className={styles.quickActionText}>
                          📍 ต้องการทดลองทำตามหัวข้อนี้ทันทีหรือไม่?
                        </span>
                        <Link href={topic.actionUrl} className={styles.quickActionBtn}>
                          <span>{topic.actionLabel || 'ไปที่หน้านี้'}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    )}

                    {/* Subsections */}
                    {topic.subSections.map((sub, sIndex) => (
                      <div key={sIndex} className={styles.subSection}>
                        <h4 className={styles.subSectionTitle}>
                          <span>🔹</span>
                          <span>{sub.title}</span>
                        </h4>

                        {sub.description && (
                          <p style={{ margin: 0, fontSize: 12, color: '#4a5951', lineHeight: 1.6 }}>
                            {sub.description}
                          </p>
                        )}

                        {/* Steps list */}
                        {sub.steps && sub.steps.length > 0 && (
                          <ol className={styles.stepList}>
                            {sub.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className={styles.stepItem}>
                                <span className={styles.stepNumber}>{stepIndex + 1}</span>
                                <div className={styles.stepContent}>{step}</div>
                              </li>
                            ))}
                          </ol>
                        )}

                        {/* Table */}
                        {sub.table && (
                          <div className={styles.tableWrap}>
                            <table className={styles.manualTable}>
                              <thead>
                                <tr>
                                  {sub.table.headers.map((h, i) => (
                                    <th key={i}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sub.table.rows.map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx}>{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Flow Diagram */}
                        {sub.flowDiagram && (
                          <pre className={styles.flowBlock}>{sub.flowDiagram}</pre>
                        )}

                        {/* Tips & Warnings */}
                        {sub.tip && (
                          <div className={`${styles.callout} ${styles.calloutTip}`}>
                            <span className={styles.calloutIcon}>💡</span>
                            <div>
                              <strong>เคล็ดลับ: </strong>
                              <span>{sub.tip}</span>
                            </div>
                          </div>
                        )}

                        {sub.warning && (
                          <div className={`${styles.callout} ${styles.calloutWarning}`}>
                            <span className={styles.calloutIcon}>⚠️</span>
                            <div>
                              <strong>ข้อควรระวัง: </strong>
                              <span>{sub.warning}</span>
                            </div>
                          </div>
                        )}

                        {sub.note && (
                          <div className={`${styles.callout} ${styles.calloutNote}`}>
                            <span className={styles.calloutIcon}>ℹ️</span>
                            <div>
                              <strong>หมายเหตุ: </strong>
                              <span>{sub.note}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className={styles.emptySearch}>
          <span style={{ fontSize: 36 }}>🔍</span>
          <h3>ไม่พบเนื้อหาคู่มือที่ค้นหา</h3>
          <p>ลองใช้คำค้นหาอื่น เช่น "สแกน", "ส่งงาน", "กล้อง", "คะแนน" หรือเลือกหมวดหมู่อื่น</p>
          <button
            type="button"
            className={styles.quickActionBtn}
            onClick={() => {
              setSearch('')
              setActiveCategory('ALL')
            }}
          >
            แสดงคู่มือทั้งหมด
          </button>
        </div>
      )}
    </div>
  )
}
