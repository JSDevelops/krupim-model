'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import AdminIcon, { type AdminIconName } from '@/components/admin/AdminIcon'
import styles from './page.module.css'

export type GuideSection = {
  title: string
  description: string
  icon: AdminIconName
  steps?: string[]
  table?: {
    headers: string[]
    rows: string[][]
  }
  tip?: string
  warning?: string
  flowDiagram?: string
  fullWidth?: boolean
}

export type GuideTopic = {
  id: string
  number: string
  title: string
  shortTitle: string
  category: 'ALL' | 'SETUP' | 'CLASSES' | 'CURRICULUM' | 'GRADING' | 'ANALYTICS' | 'TIPS'
  categoryLabel: string
  description: string
  icon: AdminIconName
  href: string
  action: string
  keywords: string[]
  sections: GuideSection[]
  note: string
}

const topics: GuideTopic[] = [
  {
    id: 'start',
    number: '01',
    title: 'เริ่มต้นใช้งาน Teacher Console & สถาปัตยกรรมระบบ',
    shortTitle: 'เริ่มต้นใช้งาน',
    category: 'SETUP',
    categoryLabel: 'เริ่มต้น',
    description: 'ภาพรวมระบบ Teacher Console, การยืนยันสิทธิ์ครูผู้สอน, ฐานข้อมูล Local PostgreSQL และการใช้งานแดชบอร์ดวิเคราะห์',
    icon: 'dashboard',
    href: '/teacher/dashboard',
    action: 'เปิดแดชบอร์ด',
    keywords: ['เริ่มต้น', 'dashboard', 'บัญชี', 'ภาพรวม', 'postgresql', 'kpi', 'สถิติ', 'ฐานข้อมูล', 'laragon'],
    sections: [
      {
        title: 'การตรวจสอบความพร้อมและบัญชีครู',
        description: 'เริ่มต้นใช้งานด้วยการยืนยันสถานะความปลอดภัยและข้อมูลส่วนตัว',
        icon: 'check',
        steps: [
          'เข้าสู่ระบบด้วยบทบาท "ครูผู้สอน" (Teacher) ผ่านหน้าเข้าสู่ระบบหลัก',
          'ตรวจสอบชื่อ-นามสกุล, สถาบันการศึกษา, อีเมล และเบอร์โทรศัพท์จากหน้าโปรไฟล์ครู',
          'ตรวจสถานะบัญชีและสิทธิ์การสอน ระบบจะอนุญาตให้จัดการเฉพาะห้องเรียนที่คุณครูเป็นผู้รับผิดชอบ',
          'กรณีต้องการเปลี่ยนรหัสผ่าน ให้ดำเนินการผ่านเมนูโปรไฟล์ โดยรหัสผ่านต้องมีความยาวไม่น้อยกว่า 8 ตัวอักษร',
        ],
      },
      {
        title: 'ทำความเข้าใจตัวชี้วัดแดชบอร์ดหลัก (KPIs)',
        description: 'แดชบอร์ดสรุปภาพรวมการเรียนการสอนแบบเรียลไทม์ผ่านการเชื่อมต่อ PostgreSQL',
        icon: 'analytics',
        table: {
          headers: ['ตัวชี้วัดบนแดชบอร์ด', 'ความหมาย', 'การนำไปใช้'],
          rows: [
            ['ห้องเรียนทั้งหมด', 'จำนวนห้องเรียนที่คุณครูสร้างและดูแลอยู่', 'คลิกเพื่อเข้าสู่หน้าจัดการห้องเรียน'],
            ['นักเรียนในความดูแล', 'จำนวนนักเรียนรวมทุกห้องที่มีสถานะ Active', 'ติดตามจำนวนผู้เรียนจริงในหลักสูตร'],
            ['งานรอตรวจประเมิน', 'จำนวนชิ้นงานที่นักเรียนส่งแล้วและยังไม่ได้ตรวจ', 'คลิกเพื่อเปิดรายงานการส่งและให้คะแนนทันที'],
            ['อัตราการส่งงานเฉลี่ย', 'เปอร์เซ็นต์การส่งงานเทียบกับจำนวนงานที่มอบหมาย', 'วัดระดับความร่วมมือและการมีส่วนร่วมของห้องเรียน'],
          ],
        },
        tip: 'ข้อมูลใน Teacher Console เชื่อมต่อกับ PostgreSQL ภายในเครื่องอย่างปลอดภัย ข้อมูลจะไม่สูญหายแม้มีการรีเฟรชหรือสลับหน้าต่าง',
      },
      {
        title: 'ลำดับขั้นตอนการจัดเตรียมชั้นเรียนที่แนะนำ',
        description: 'จัดเตรียมข้อมูลตามลำดับวงรอบ FINE Model เพื่อให้ระบบทำงานประสานกันอย่างสมบูรณ์',
        icon: 'arrow',
        flowDiagram: `[1. สร้างห้องเรียน] ──► [2. เชิญ/เพิ่มนักเรียนเข้าห้อง]
         │
         ▼
[3. สร้างสื่อ AR / คลังคำศัพท์] ──► [4. ออกแบบแผนการสอน FINE Model]
         │
         ▼
[5. มอบหมายงานตามขั้นตอน F·I·N·E] ──► [6. นักเรียนเรียนและส่งงานผ่านแอป]
         │
         ▼
[7. ครูตรวจงาน & ให้ Feedback] ──► [8. ติดตามสมรรถนะ KSA-C และสรุปผล]`,
        fullWidth: true,
      },
    ],
    note: 'ข้อมูลทั้งหมดถูกจัดเก็บลงฐานข้อมูล PostgreSQL ท้องถิ่น จึงมีความเสถียร รวดเร็ว และรองรับการจัดการข้อมูลขนาดใหญ่ได้อย่างปลอดภัย',
  },
  {
    id: 'classes',
    number: '02',
    title: 'การจัดการห้องเรียนและสมาชิก (Classrooms & Students)',
    shortTitle: 'ห้องเรียนและนักเรียน',
    category: 'CLASSES',
    categoryLabel: 'ห้องเรียน',
    description: 'การสร้างห้องเรียน, กำหนดปีการศึกษา/ภาคเรียน, การสร้างรหัสเชิญ (Invite Code), และการย้ายห้องเรียนโดยไม่กระทบข้อมูล',
    icon: 'school',
    href: '/teacher/classes',
    action: 'จัดการห้องเรียน',
    keywords: ['ห้องเรียน', 'นักเรียน', 'สมาชิก', 'อีเมล', 'ย้ายห้อง', 'รหัสเชิญ', 'invite', 'code', 'ภาคเรียน'],
    sections: [
      {
        title: 'การสร้างและแก้ไขห้องเรียน',
        description: 'กำหนดโครงสร้างชั้นเรียนก่อนเริ่มเปิดรับสมาชิกหรือมอบหมายงาน',
        icon: 'school',
        steps: [
          'เปิดเมนู "ห้องเรียนและสมาชิก" (`/teacher/classes`) แล้วกดปุ่ม "+ สร้างห้องเรียน"',
          'กรอกชื่อห้องเรียน เช่น "คหกรรมศาสตร์ ม.4/1 - แผนกบริการอาหารและเครื่องดื่ม"',
          'ระบุปีการศึกษา (พ.ศ. เช่น 2569) และภาคเรียน (1 หรือ 2)',
          'ใส่คำอธิบายเพิ่มเติม เช่น รายวิชา รหัสกลุ่ม หรือห้องเรียนประจำ',
          'กด "บันทึก" ห้องเรียนใหม่จะถูกเปิดใช้งานทันทีพร้อมสำหรับการรับนักเรียน',
        ],
      },
      {
        title: 'การรับนักเรียนเข้าห้องเรียน 2 วิธี',
        description: 'เลือกวิธีเพิ่มสมาชิกให้เหมาะสมกับจำนวนนักเรียนในคาบเรียน',
        icon: 'student',
        steps: [
          'วิธีที่ 1 — ใช้รหัสเชิญ (Class Invite Code): กด "สร้างรหัสเชิญ" กำหนดจำนวนสิทธิ์สูงสุดและวันหมดอายุ จากนั้นแชร์รหัส (เช่น KRUPIM69) ให้นักเรียนกรอกตอนสมัคร',
          'วิธีที่ 2 — เพิ่มด้วยอีเมลโดยตรง: กด "เพิ่มสมาชิก" แล้ววางอีเมลของนักเรียนที่สมัครแล้วในระบบ สามารถวางหลายอีเมลพร้อมกันได้',
        ],
        table: {
          headers: ['สถานะนักเรียน', 'สัญลักษณ์', 'คำอธิบาย'],
          rows: [
            ['Active', '🟢 สีเขียว', 'บัญชีปกติ ใช้งานแอปและส่งงานได้ทันที'],
            ['Pending', '🟡 สีเหลือง', 'รอการยืนยันตัวตนหรือยังไม่ได้เข้าสู่ระบบครั้งแรก'],
            ['Inactive', '⚪ สีเทา', 'ระงับการใช้งานชั่วคราว หรือย้ายห้อง'],
          ],
        },
      },
      {
        title: 'การย้ายห้องและการนำนักเรียนออกจากห้อง',
        description: 'แนวทางการจัดการเมื่อนักเรียนเปลี่ยนกลุ่มเรียนหรือจบการศึกษา',
        icon: 'refresh',
        steps: [
          'หากต้องการย้ายห้อง ให้นักเรียนแจ้งครูผู้สอนเพื่อเลือกเปลี่ยนห้องเรียนปลายทางในหน้ารายชื่อ',
          'การกด "นำออกจากห้อง" จะปลดนักเรียนออกจากห้องนั้น แต่จะไม่ลบบัญชีผู้ใช้ ประวัติกิจกรรม หรือคะแนน KSA-C ที่เคยสะสมไว้',
        ],
        warning: 'การลบบัญชีนักเรียนถาวรเป็นสิทธิ์ของผู้ดูแลระบบ (Admin) เพื่อป้องกันการลบข้อมูลโดยอุบัติเหตุ',
      },
    ],
    note: 'แนะนำให้สร้างห้องเรียนแยกตามห้องจริงและภาคเรียน เพื่อความสะดวกในการกรองคะแนนและการออกรายงานผลสัมฤทธิ์เมื่อสิ้นสุดภาคเรียน',
  },
  {
    id: 'lessons',
    number: '03',
    title: 'การสร้างและออกแบบแผนการสอน FINE Model',
    shortTitle: 'แผนการสอน FINE',
    category: 'CURRICULUM',
    categoryLabel: 'แผนการสอน',
    description: 'การเขียนสาระสำคัญ, วัตถุประสงค์ KSA-C, คำศัพท์-ประโยคเป้าหมาย, และการออกแบบกิจกรรม 6 ขั้นตอนตามโมเดล FINE',
    icon: 'content',
    href: '/teacher/lessons',
    action: 'เปิดคลังแผนการสอน',
    keywords: ['แผนการสอน', 'fine', 'ksa', 'วัตถุประสงค์', 'กิจกรรม', 'lead', 'wrap', 'concept', 'syllabus'],
    sections: [
      {
        title: 'ข้อมูลพื้นฐานและสาระสำคัญของแผน',
        description: 'ระบุบริบทของหน่วยการเรียนรู้เพื่อให้เชื่อมโยงกับงานมอบหมายได้ชัดเจน',
        icon: 'content',
        steps: [
          'เปิดหน้า "แผนการสอน" แล้วกด "+ สร้างแผนการสอนใหม่"',
          'กรอกชื่อแผนการสอน เช่น "หน่วยที่ 2: อุปกรณ์บนโต๊ะอาหารและการจัดโต๊ะแบบ Western Style"',
          'ระบุรายวิชา, ระดับชั้น, ภาคเรียน, สัปดาห์ที่สอน และระยะเวลา (เช่น 100 นาที / 2 คาบ)',
          'เขียนสาระสำคัญ (Concept): อธิบายแกนความรู้และทักษะหลักที่นักเรียนจะได้รับในบทเรียนนี้',
        ],
      },
      {
        title: 'การกำหนดวัตถุประสงค์เชิงพฤติกรรม KSA-C',
        description: 'แยกผลลัพธ์การเรียนรู้ 4 มิติเพื่อใช้ในการวัดและประเมินผล',
        icon: 'score',
        table: {
          headers: ['มิติ KSA-C', 'ชื่อเต็ม', 'แนวทางการเขียนในแผนการสอน'],
          rows: [
            ['K', 'Knowledge (ความรู้)', 'บอกชื่ออุปกรณ์สากล หน้าที่ และหลักการจัดโต๊ะแบบ Outside-In ได้ถูกต้อง'],
            ['S', 'Skills (ทักษะ)', 'ออกเสียงคำศัพท์บริการอาหารได้ถูกต้องตามหลักสัทศาสตร์ และจัดวางอุปกรณ์ได้ถูกต้อง'],
            ['A', 'Attribute (เจตคติ)', 'มีบุคลิกภาพที่สุภาพ มีจิตบริการ (Service Mind) และรักษาความสะอาดของอุปกรณ์'],
            ['C', 'Competency (สมรรถนะ)', 'ประยุกต์ใช้ทักษะในการรับออร์เดอร์และแก้ปัญหาเฉพาะหน้าในห้องอาหารจำลองได้'],
          ],
        },
      },
      {
        title: 'การออกแบบกิจกรรม 6 ขั้นตอนของ FINE Model',
        description: 'โครงสร้างกระบวนการเรียนรู้เชิงรุก (Active Learning) ที่บูรณาการเทคโนโลยี AR + AI',
        icon: 'sparkles',
        steps: [
          '1. Lead-in: ขั้นกระตุ้นความสนใจ ครูตั้งคำถามหรือเปิดคลิปสถานการณ์บริการในโรงแรม 5 ดาว',
          '2. Familiarize (F): ขั้นสำรวจ นักเรียนเปิดแอปส่อง AR และสแกน AI เพื่อเรียนรู้คำศัพท์อุปกรณ์ 20 รายการ',
          '3. Interact (I): ขั้นสื่อสาร นักเรียนฝึกออกเสียงประโยคและสนทนากับ AI Restaurant Coach',
          '4. Navigate (N): ขั้นจำลองสถานการณ์ ฝึกจัดโต๊ะจริงตามโจทย์และฝึกแก้ปัญหาข้อร้องเรียน',
          '5. Exhibit (E): ขั้นแสดงผลงานและทดสอบ ทำแบบทดสอบ Quiz 5 ข้อ และบันทึกคะแนนสมรรถนะ',
          '6. Wrap-up: ขั้นสรุปบทเรียน ครูและนักเรียนร่วมกันสะท้อนคิด (Reflection) จุดเด่นและสิ่งที่ต้องพัฒนา',
        ],
        tip: 'เมื่อกรอกข้อมูลครบถ้วน ให้เลือกสถานะเป็น "Published" เพื่อให้แผนพร้อมเชื่อมโยงกับระบบงานมอบหมาย',
      },
    ],
    note: 'แผนการสอนที่สมบูรณ์สามารถทำสำเนา (Duplicate) เพื่อนำไปปรับใช้กับห้องเรียนอื่นหรือภาคเรียนถัดไปได้ทันที ช่วยประหยัดเวลาจัดเตรียมเอกสาร',
  },
  {
    id: 'resources',
    number: '04',
    title: 'การจัดการสื่อ AR โมเดล 3 มิติ และสร้าง QR Code',
    shortTitle: 'สื่อ AR & โมเดล 3D',
    category: 'CURRICULUM',
    categoryLabel: 'สื่อ AR 3D',
    description: 'การนำเข้าโมเดล GLB/USDZ, ระบบ AI 3D Generator, การจัดหมวดหมู่อุปกรณ์, และการสร้าง QR Code ประจำสื่อ',
    icon: 'cube',
    href: '/teacher/ar-models',
    action: 'เปิดคลังโมเดล AR',
    keywords: ['ar', '3d', 'โมเดล', 'qr code', 'glb', 'usdz', 'tripo', 'blender', 'สแกน', 'สไลด์'],
    sections: [
      {
        title: 'ข้อกำหนดของไฟล์โมเดล 3 มิติและการแสดงผล',
        description: 'เตรียมไฟล์โมเดลให้รองรับทั้งเว็บ, แท็บเล็ต, สมาร์ตโฟน Android และ iOS',
        icon: 'cube',
        table: {
          headers: ['ฟอร์แมตไฟล์', 'อุปกรณ์เป้าหมาย', 'ข้อแนะนำทางเทคนิค'],
          rows: [
            ['.GLB (Binary glTF)', 'เว็บเบราว์เซอร์, PC, สมาร์ตโฟน Android', 'ขนาดไม่เกิน 15 MB, พื้นผิว PBR คุณภาพมาตรฐาน'],
            ['.USDZ', 'iPhone / iPad (AR Quick Look)', 'จำเป็นสำหรับระบบฉายภาพ AR ลงบนโต๊ะจริงของ Apple'],
            ['ภาพตัวอย่าง (Preview)', 'การ์ดแสดงผลในแอปนักเรียน', 'ภาพถ่ายหน้าตรงสัดส่วน 1:1 ชัดเจน ไม่มีลายน้ำ'],
          ],
        },
      },
      {
        title: 'การสร้างโมเดล 3D ด้วย AI (Tripo3D Generator)',
        description: 'สร้างโมเดลอุปกรณ์หรืออาหารใหม่ได้โดยไม่ต้องปั้น 3D ด้วยตนเอง',
        icon: 'sparkles',
        steps: [
          'เปิดแท็บ "สร้างโมเดลด้วย AI" ในหน้าคลังโมเดล AR',
          'พิมพ์คำอธิบาย (Prompt) ภาษาอังกฤษ เช่น "A realistic stainless steel dinner fork, hospitality standard"',
          'ใส่ Negative Prompt (สิ่งที่ไม่ต้องการ) เช่น "blurry, low poly, distorted, text"',
          'กด "สร้างงาน AI 3D" ระบบจะส่งงานเข้าคิวประมวลผล',
          'เมื่อระบบแจ้งสถานะ "Success" ครูสามารถตรวจสอบโมเดลและกด "นำเข้าสู่คลังสื่อ AR" ได้ทันที',
        ],
      },
      {
        title: 'การสร้างและพิมพ์ QR Code ประจำสื่อ AR',
        description: 'วิธีเชื่อมโยงสื่อดิจิทัลเข้าสู่ห้องปฏิบัติการและใบงานจริง',
        icon: 'scan',
        steps: [
          'เลือกโมเดลที่ต้องการในรายการ แล้วกดปุ่ม "QR Code"',
          'ระบบจะสร้าง QR Code เฉพาะที่เชื่อมโยงกับโมเดลชิ้นนั้นโดยตรง',
          'กด "ดาวน์โหลดภาพ QR Code" เพื่อนำไปติดบนแผ่นการ์ดคำศัพท์ แผ่นรองจาน หรือโต๊ะฝึกปฏิบัติ',
          'เมื่อนักเรียนใช้ฟังก์ชัน Scanner ในแอปส่อง QR Code ระบบจะเปิดโมเดล 3D ชิ้นนั้นขึ้นมาบนหน้าจอทันที',
        ],
        tip: 'สามารถพิมพ์ QR Code ขนาดประมาณ 4x4 ซม. เคลือบพลาสติกวางประจำจุดสเตชันในห้องอาหารจำลองเพื่อให้นักเรียนฝึกสแกนได้ตลอดภาคเรียน',
      },
    ],
    note: 'การใช้ URL ของไฟล์โมเดล 3D ต้องเป็นลิงก์สาธารณะหรือจัดเก็บบนระบบ Server ที่แอปเข้าถึงได้ หลีกเลี่ยงการใช้ Local File Path ภายในคอมพิวเตอร์',
  },
  {
    id: 'vocab',
    number: '05',
    title: 'คลังคำศัพท์และอุปกรณ์บริการอาหาร (Vocabulary)',
    shortTitle: 'คลังคำศัพท์',
    category: 'CURRICULUM',
    categoryLabel: 'คำศัพท์',
    description: 'การจัดการชุดคำศัพท์ 2 ภาษา, คำอ่านสัทอักษร IPA, หมวดหมู่บริการ, บริบทการใช้งาน, และเคล็ดลับการบริการ',
    icon: 'scan',
    href: '/teacher/vocab',
    action: 'จัดการคลังคำศัพท์',
    keywords: ['คำศัพท์', 'vocabulary', 'สัทอักษร', 'ipa', 'คำแปล', 'ประโยค', 'service tips', 'อาหาร', 'เครื่องดื่ม'],
    sections: [
      {
        title: 'โครงสร้างข้อมูลคำศัพท์มาตรฐานวิชาชีพ',
        description: 'กรอกข้อมูลให้ครบถ้วนเพื่อส่งต่อไปยังฟังก์ชันฝึกพูดและสแกน AI ของนักเรียน',
        icon: 'content',
        steps: [
          'คำศัพท์ภาษาอังกฤษ (Name EN): เช่น "Soup Spoon"',
          'คำแปลภาษาไทย (Name TH): เช่น "ช้อนซุป"',
          'คำอ่านสัทอักษรสากล (Phonetics): เช่น "/suːp spuːn/" เพื่อช่วยให้นักเรียนออกเสียงถูกต้อง',
          'ประโยคตัวอย่าง (Sample Sentence): ประโยคที่พนักงานใช้จริง เช่น "The soup spoon is placed on the outer right side of the cover."',
          'หมวดหมู่ (Category): Appetizers, Main Courses, Desserts, Beverages, Cutlery, Glassware, Tableware',
        ],
      },
      {
        title: 'การเพิ่มบริบทและเคล็ดลับบริการ (Service & Safety Tips)',
        description: 'ข้อมูลเชิงลึกที่ช่วยยกระดับทักษะการทำงานจริงของนักเรียน',
        icon: 'check',
        steps: [
          'ระบุสถานที่ใช้งาน (Location): เช่น Banquet Hall, Fine Dining Station, Beverage Bar',
          'เคล็ดลับการบริการ (Service Tips): เช่น "หยิบจับบริเวณด้ามช้อนเท่านั้น ห้ามใช้นิ้วสัมผัสตัวช้อนเด็ดขาด"',
          'ข้อควรระวัง (Safety & Hygiene): การตรวจสอบคราบน้ำ ความเงางาม และความสะอาดของอุปกรณ์ก่อนวางบนโต๊ะ',
        ],
        tip: 'คำศัพท์ที่ครูบันทึกในหน้านี้จะปรากฏในแท็บ "คลังคำศัพท์" ของนักเรียน และระบบ AI Scan จะใช้ฐานข้อมูลนี้ในการจำแนกวัตถุที่นักเรียนส่องกล้อง',
      },
    ],
    note: 'สามารถค้นหาและจัดระเบียบคำศัพท์ตามหมวดหมู่ เพื่อนำชุดคำศัพท์ไปเชื่อมกับภารกิจ Mission ประจำสัปดาห์ในหน้า Explore ได้อย่างเป็นระบบ',
  },
  {
    id: 'assignments',
    number: '06',
    title: 'การมอบหมายงานและการบ้านตามขั้นตอน F·I·N·E',
    shortTitle: 'งานมอบหมาย',
    category: 'GRADING',
    categoryLabel: 'มอบหมายงาน',
    description: 'การสร้างงานที่ผูกกับขั้นตอน FINE, กำหนดวันส่ง, กำหนดคะแนนเต็ม, และการตั้งค่าเกณฑ์การประเมิน (Rubric)',
    icon: 'score',
    href: '/teacher/assignments',
    action: 'จัดการงานมอบหมาย',
    keywords: ['งาน', 'มอบหมาย', 'ส่งงาน', 'การบ้าน', 'due date', 'max score', 'f', 'i', 'n', 'e', 'rubric'],
    sections: [
      {
        title: 'การสร้างงานมอบหมายใหม่',
        description: 'งานแต่ละชิ้นจะเชื่อมกับห้องเรียนและขั้นตอนของ FINE Model อย่างเฉพาะเจาะจง',
        icon: 'plus',
        steps: [
          'เปิดหน้า "จัดการงานมอบหมาย" (`/teacher/assignments`) แล้วกด "+ สร้างงานใหม่"',
          'เลือกห้องเรียนเป้าหมาย และเลือกแผนการสอนที่เกี่ยวข้อง (ถ้ามี)',
          'ระบุประเภทกิจกรรมตามขั้นตอน: Familiarize (สำรวจ), Interact (ฝึกพูด), Navigate (สถานการณ์), หรือ Exhibit (แบบทดสอบ)',
          'กรอกชื่องานและคำชี้แจงการส่งงานอย่างชัดเจน (เช่น แนบภาพแคปหน้าจอคะแนนออกเสียง หรือส่งลิงก์คลิปวิดีโอ)',
          'กำหนดวันและเวลาปิดรับงาน (Due Date) พร้อมระบุคะแนนเต็ม (Max Score)',
          'กด "บันทึกและมอบหมาย" งานจะถูกส่งไปยังหน้าแดชบอร์ดและแถบนำทางของนักเรียนทุกคนในห้องทันที',
        ],
      },
      {
        title: 'แนวทางการตั้งชื่องานตามขั้นตอน FINE',
        description: 'ตัวอย่างงานที่เหมาะสมในแต่ละขั้นตอนการเรียนรู้',
        icon: 'content',
        table: {
          headers: ['ขั้นตอน', 'ตัวอย่างชื่องาน', 'หลักฐานที่ให้นักเรียนส่ง'],
          rows: [
            ['F · Explore', 'ภารกิจสแกนอุปกรณ์อาหารสัปดาห์ที่ 2 ครบ 20 รายการ', 'ส่งผลสำเร็จผ่านระบบ Mission Tracker ในแอป'],
            ['I · Speak', 'บันทึกการฝึกพูดประโยคต้อนรับและแนะนำเมนูอาหาร', 'แคปหน้าจอคะแนนประเมินรายคำเขียว/แดง >= 80%'],
            ['N · Scenario', 'การจำลองสถานการณ์รับออร์เดอร์และจัดโต๊ะ Outside-In', 'ส่งภาพถ่ายการจัดโต๊ะจริง หรือภาพในห้อง Simulation'],
            ['E · Review', 'สรุปผลคะแนนแบบทดสอบ Quiz 5 ข้อ หน่วยที่ 2', 'ส่งผลคะแนน Quiz ผ่านระบบ Exhibit อัตโนมัติ'],
          ],
        },
      },
    ],
    note: 'เมื่อมอบหมายงานแล้ว ตัวเลขสีแดง (Badge) บนปุ่มเมนูของนักเรียนจะเพิ่มขึ้นโดยอัตโนมัติ ช่วยเตือนให้นักเรียนไม่พลาดกำหนดส่ง',
  },
  {
    id: 'grading',
    number: '07',
    title: 'การตรวจงาน ให้คะแนน และส่งข้อเสนอแนะ Feedback',
    shortTitle: 'ตรวจงาน & ให้คะแนน',
    category: 'GRADING',
    categoryLabel: 'การให้คะแนน',
    description: 'การเปิดรายงานการส่งงาน, ตรวจไฟล์แนบ/ลิงก์ Google Drive, บันทึกคะแนน, ให้ Feedback, และส่งออก Excel/PDF',
    icon: 'analytics',
    href: '/teacher/assignments',
    action: 'ตรวจและให้คะแนน',
    keywords: ['ตรวจงาน', 'คะแนน', 'feedback', 'ข้อเสนอแนะ', 'excel', 'pdf', 'export', 'ส่งงาน', 'รายงาน'],
    sections: [
      {
        title: 'ขั้นตอนการตรวจผลงานของนักเรียน',
        description: 'ระบบแยกรายการผู้ที่ส่งงานแล้วและยังไม่ได้ส่งอย่างชัดเจนเพื่อความสะดวกรวดเร็ว',
        icon: 'check',
        steps: [
          'ในหน้ารวมงานมอบหมาย ให้คลิกที่ชื่องาน หรือกดปุ่ม "📊 รายงานการส่งงาน"',
          'หน้าจอจะแสดงรายชื่อนักเรียนทั้งหมดในห้อง พร้อมสถานะ: "ส่งแล้ว" (เขียว) หรือ "ยังไม่ส่ง" (ส้ม)',
          'คลิกดูชิ้นงานของนักเรียนที่ส่งแล้ว: สามารถกดเปิดไฟล์แนบ (PDF, รูปภาพ) หรือคลิกเปิดลิงก์ภายนอก (Google Drive, Canva, Padlet) ได้ทันที',
          'ตรวจสอบผลงานเทียบกับเกณฑ์และคำชี้แจง',
          'กรอกคะแนนที่ได้ (ต้องไม่เกินคะแนนเต็ม) ในช่องคะแนน',
          'พิมพ์ข้อเสนอแนะ (Feedback) เพื่อแนะนำจุดที่นักเรียนทำได้ดีและจุดที่ควรปรับปรุง',
          'กดปุ่ม "บันทึกคะแนน" ระบบจะอัปเดตคะแนนและส่ง Feedback ไปแสดงในหน้า Portfolio ของนักเรียนทันที',
        ],
      },
      {
        title: 'การส่งออกรายงานผลการส่งงาน (Export to Excel & PDF)',
        description: 'นำข้อมูลคะแนนไปใช้ประกอบการประเมินผลทางการศึกษาอย่างเป็นทางการ',
        icon: 'download',
        steps: [
          'ในหน้ารายงานการส่งงาน ให้สังเกตปุ่มมุมขวาบน',
          'กดปุ่ม "📥 ส่งออก Excel" เพื่อดาวน์โหลดไฟล์สเปรดชีต (.xlsx) สรุปคะแนน, วันที่ส่ง, และสถานะของนักเรียนทุกคน',
          'กดปุ่ม "📄 ส่งออก PDF" เพื่อพิมพ์ใบสรุปคะแนนพร้อมหัวกระดาษสถาบันการศึกษาสำหรับแนบในแฟ้มวิชาการ',
        ],
        tip: 'หากนักเรียนส่งลิงก์ Google Drive แล้วเปิดไม่ได้ ให้แนะนำนักเรียนตั้งค่าสิทธิ์แชร์ไฟล์เป็น "ทุกคนที่มีลิงก์มีสิทธิ์ดู (Anyone with the link)"',
      },
    ],
    note: 'การให้ Feedback เชิงบวกพร้อมข้อเสนอแนะที่ชัดเจน จะช่วยกระตุ้นให้นักเรียนเกิดแรงจูงใจในการกลับไปฝึกซ้ำและพัฒนาตนเองอย่างต่อเนื่อง',
  },
  {
    id: 'analytics',
    number: '08',
    title: 'การติดตามความก้าวหน้าและการวิเคราะห์สมรรถนะ KSA-C',
    shortTitle: 'วิเคราะห์ KSA-C',
    category: 'ANALYTICS',
    categoryLabel: 'การวิเคราะห์',
    description: 'การอ่านคะแนน 4 มิติ K-S-A-C, สูตรถ่วงน้ำหนักรวม, การคัดกรองผู้เรียนกลุ่มเสี่ยง (At-risk), และสถิติภาพรวม',
    icon: 'score',
    href: '/teacher/students',
    action: 'เปิดภาพรวมนักเรียน',
    keywords: ['ksa-c', 'analytics', 'ความก้าวหน้า', 'at-risk', 'กลุ่มเสี่ยง', 'สถิติ', 'คะแนนรวม', 'สมรรถนะ'],
    sections: [
      {
        title: 'ความหมายและการคำนวณคะแนนสมรรถนะ 4 มิติ (KSA-C)',
        description: 'การประเมินรอบด้านตามมาตรฐานวิชาชีพการโรงแรมและการบริการ',
        icon: 'score',
        table: {
          headers: ['มิติ', 'ชื่อเต็ม', 'สัดส่วนน้ำหนัก', 'ที่มาของคะแนนในระบบ'],
          rows: [
            ['K (20%)', 'Knowledge (ความรู้)', '20%', 'คะแนนจากแบบทดสอบ Quiz ในหน้า Exhibit และผลสแกน AI'],
            ['S (30%)', 'Skills (ทักษะ)', '30%', 'คะแนนความแม่นยำในการออกเสียงประโยคและคำศัพท์ในหน้า Interact'],
            ['A (10%)', 'Attribute (เจตคติ)', '10%', 'วินัยในการส่งงานตรงเวลา ความสม่ำเสมอในการเข้าใช้ระบบ (Sessions)'],
            ['C (40%)', 'Competency (สมรรถนะ)', '40%', 'คะแนนจากการฝึกสถานการณ์จริง Navigate, Simulation และคะแนนชิ้นงานที่ครูตรวจ'],
          ],
        },
      },
      {
        title: 'การคัดกรองและช่วยเหลือนักเรียนกลุ่มเสี่ยง (At-risk Students)',
        description: 'ระบบตรวจจับอัตโนมัติเพื่อป้องกันผู้เรียนหลุดจากระบบการเรียนรู้',
        icon: 'activity',
        steps: [
          'เปิดหน้า "ภาพรวมนักเรียน" (`/teacher/students`) แล้วเลือกกรองตามห้องเรียน',
          'สังเกตแถบแจ้งเตือนหรือตัวกรอง "กลุ่มที่ต้องติดตามเป็นพิเศษ (At-risk)"',
          'เกณฑ์กลุ่มเสี่ยง: นักเรียนที่มีคะแนนรวมต่ำกว่า 60% หรือไม่มีกิจกรรมในระบบเกินกว่า 7 วัน',
          'คลิกดูรายละเอียดรายบุคคลเพื่อตรวจสอบว่านักเรียนค้างส่งงานในขั้นตอนใด (F, I, N หรือ E)',
          'ให้คำปรึกษาและมอบหมายงานซ่อมเสริมเพื่อช่วยให้นักเรียนพัฒนาสมรรถนะตามเกณฑ์',
        ],
        tip: 'เมื่อนักเรียนมีคะแนนรวมและสมรรถนะผ่านเกณฑ์ที่กำหนด ระบบจะปลดล็อกปุ่มดาวน์โหลดใบประกาศนียบัตร (Certificate) ในหน้าโปรไฟล์ของนักเรียนโดยอัตโนมัติ',
      },
    ],
    note: 'การประเมิน KSA-C ช่วยให้เห็นจุดแข็งและจุดที่ต้องพัฒนาของนักเรียนแต่ละคนอย่างชัดเจน ทำให้ครูสามารถจัดการเรียนรู้แบบเฉพาะบุคคล (Personalized Learning) ได้อย่างมีประสิทธิภาพ',
  },
  {
    id: 'workflow',
    number: '09',
    title: 'Flow การจัดการเรียนรู้ในห้องเรียนจริงร่วมกับแอป (Active Learning)',
    shortTitle: 'Flow ในห้องเรียนจริง',
    category: 'TIPS',
    categoryLabel: 'แผนการสอนจริง',
    description: 'ลำดับเวลาการจัดกิจกรรมการเรียนรู้ 50-100 นาที, บทบาทของครูและนักเรียน, และการเตรียมห้องปฏิบัติการ',
    icon: 'clock',
    href: '/teacher/lessons',
    action: 'ดูแผนการสอน',
    keywords: ['active learning', 'ห้องเรียน', 'เวลา', 'timeline', 'การสอน', 'ปฏิบัติ', 'byod', 'หูฟัง'],
    sections: [
      {
        title: 'ตัวอย่างตารางกิจกรรม Active Learning คาบเรียน 100 นาที',
        description: 'การบูรณาการเทคโนโลยี AR + AI เข้าสู่ห้องปฏิบัติการบริการอาหารอย่างลงตัว',
        icon: 'clock',
        table: {
          headers: ['ช่วงเวลา', 'ขั้นตอน', 'กิจกรรมของครู', 'กิจกรรมของนักเรียน'],
          rows: [
            ['นาที 00–10', 'Lead-in', 'เปิดแดชบอร์ด ฉายภาพรวมบทเรียน และตั้งคำถามกระตุ้นคิด', 'ดูหน้าจอ ฟังคำชี้แจง และตอบคำถามร่วมกัน'],
            ['นาที 10–30', 'F · Explore', 'เดินสังเกตการณ์ แนะนำการสแกนและแก้ไขมุมกล้อง', 'ใช้มือถือส่อง AR / สแกนวัตถุจริงบนโต๊ะ และสำรวจศัพท์ 20 รายการ'],
            ['นาที 30–50', 'I · Speak', 'แนะนำการออกเสียงคำยาก คอยสังเกตผลรายคำ', 'ใส่หูฟัง กดฟังเสียงต้นแบบ แล้วฝึกพูดโต้ตอบ ดูผลเขียว/แดง'],
            ['นาที 50–75', 'N · Navigate', 'กำหนดสถานการณ์จำลอง (เช่น จัดโต๊ะแบบ Western)', 'ลงมือจัดวางอุปกรณ์จริงบนโต๊ะตามหลัก Outside-In พร้อมจำลองบริการ'],
            ['นาที 75–90', 'E · Exhibit', 'เปิดรับงานใน Assignment คอยรีเฟรชดูยอดส่ง', 'ทำแบบทดสอบ Quiz 5 ข้อ และกดส่งงานผ่าน Quick View Direct Submit'],
            ['นาที 90–100', 'Wrap-up', 'ฉายหน้ารายงานคะแนน ชื่นชมผู้เรียน และสรุปจุดพัฒนา', 'ตรวจสอบคะแนนและ Feedback ในหน้า Portfolio ของตนเอง'],
          ],
        },
        fullWidth: true,
      },
      {
        title: 'การเตรียมความพร้อมด้านสภาพแวดล้อมและอุปกรณ์',
        description: 'ข้อแนะนำเพื่อให้คาบเรียนราบรื่นไม่มีสะดุด',
        icon: 'monitor',
        steps: [
          'เครือข่ายอินเทอร์เน็ต: ตรวจสอบสัญญาณ WiFi ในห้องปฏิบัติการให้มีความเสถียร',
          'อุปกรณ์นักเรียน (BYOD): แจ้งให้นักเรียนนำสมาร์ตโฟนที่ชาร์จแบตเตอรี่มาพร้อม และพกหูฟังที่มีไมโครโฟนสำหรับการฝึกพูด',
          'สภาพแสงและโต๊ะปฏิบัติ: พื้นผิวโต๊ะควรมีแสงสว่างสม่ำเสมอ ไม่มีแสงสะท้อนจ้า เพื่อให้ระบบสแกน AR และ AI Camera จับภาพได้คมชัด',
        ],
      },
    ],
    note: 'การใช้ FINE Model ในห้องเรียนช่วยเปลี่ยนบทบาทของครูจากผู้บรรยาย (Lecturer) มาเป็นโค้ชผู้สนับสนุน (Facilitator) ที่ดูแลนักเรียนได้อย่างใกล้ชิด',
  },
  {
    id: 'troubleshooting',
    number: '10',
    title: 'เคล็ดลับคุณครู & ตารางแก้ปัญหาทางเทคนิค (Troubleshooting & FAQs)',
    shortTitle: 'เคล็ดลับ & แก้ปัญหา',
    category: 'TIPS',
    categoryLabel: 'แก้ปัญหา',
    description: 'แนวทางแก้ปัญหาทางเทคนิคในห้องเรียนจริง, การจัดการสิทธิ์ Google Drive, การอนุญาตสิทธิ์กล้อง AR, และแนวปฏิบัติความปลอดภัยข้อมูล PDPA',
    icon: 'shield',
    href: '/teacher/dashboard',
    action: 'ตรวจสอบระบบ',
    keywords: ['ปัญหา', 'error', 'กล้อง', 'google drive', 'สิทธิ์', 'pdpa', 'laragon', 'backup', 'faq'],
    sections: [
      {
        title: 'ตารางแก้ปัญหาที่พบบ่อยระหว่างการจัดการเรียนการสอน',
        description: 'คู่มือแก้ไขปัญหาทางเทคนิคแบบทันท่วงทีในห้องเรียน',
        icon: 'activity',
        table: {
          headers: ['ปัญหาที่พบ', 'สาเหตุที่เป็นไปได้', 'วิธีแก้ไขทันที'],
          rows: [
            ['นักเรียนบอกว่าไม่เห็นงานมอบหมาย', 'เลือกห้องเรียนผิด หรือนักเรียนยังไม่ได้อยู่ในห้องนั้น', 'ตรวจในหน้ารายชื่อห้องเรียนว่านักเรียนมีสถานะ Active ในห้องนั้นจริงหรือไม่'],
            ['ครูเปิดดูไฟล์แนบของนักเรียนไม่ได้', 'ไฟล์มีขนาดเกิน 12MB หรือนามสกุลไฟล์ไม่ถูกต้อง', 'แจ้งให้นักเรียนแปลงไฟล์เป็น PDF หรือส่งเป็นรูปรวม 1-2 แผ่น'],
            ['ลิงก์ Google Drive แจ้งเตือนขอสิทธิ์เข้าถึง', 'นักเรียนไม่ได้เปิดสิทธิ์แชร์แบบสาธารณะ', 'ให้นักเรียนเปิด Google Drive -> กดปุ่มแชร์ -> เปลี่ยนเป็น "ทุกคนที่มีลิงก์มีสิทธิ์ดู"'],
            ['นักเรียนเปิดกล้องสแกน AR ไม่ได้', 'เบราว์เซอร์ไม่ได้รับอนุญาตการเข้าถึงกล้อง', 'ไปที่ Settings ของมือถือ -> Safari / Chrome -> อนุญาตสิทธิ์ Camera'],
            ['ข้อมูลคะแนนในหน้ารายงานไม่อัปเดต', 'หน้าเว็บค้างแคชหรือ Session ขาดการเชื่อมต่อ', 'กดปุ่มรีเฟรชของเบราว์เซอร์ หรือกดปุ่ม "รีเฟรชข้อมูล" บนแดชบอร์ด'],
          ],
        },
        fullWidth: true,
      },
      {
        title: 'ความปลอดภัยข้อมูลและ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)',
        description: 'แนวปฏิบัติในการคุ้มครองข้อมูลของนักเรียนและสถานศึกษา',
        icon: 'shield',
        steps: [
          'นักเรียนทุกคนต้องกดยินยอมความยินยอม PDPA ในการเข้าสู่ระบบครั้งแรก เพื่อเปิดสิทธิ์จัดเก็บข้อมูลผลการเรียนรู้',
          'หลีกเลี่ยงการเปิดเผยรหัสผ่าน หรือแชร์ภาพหน้าจอที่มีข้อมูลส่วนบุคคลของนักเรียนสู่สาธารณะ',
          'ฐานข้อมูลจัดเก็บบนเซิร์ฟเวอร์ท้องถิ่นที่ปลอดภัย ไม่มีการส่งข้อมูลส่วนบุคคลออกไปยังบุคคลภายนอกโดยไม่ได้รับอนุญาต',
        ],
        tip: 'แนะนำให้สำรองข้อมูลฐานข้อมูล PostgreSQL ผ่านระบบแบ็กอัปของ Laragon อย่างสม่ำเสมอทุกสิ้นเดือนหรือก่อนสอบปลายภาค',
      },
    ],
    note: 'หากพบปัญหาทางเทคนิคที่ไม่สามารถแก้ไขได้ตามตารางข้างต้น สามารถแจ้งผู้ดูแลระบบ (Admin) เพื่อตรวจสอบบันทึกระบบ (System Audit Logs) ได้ตลอดเวลา',
  },
]

export default function TeacherManualPage() {
  const [activeId, setActiveId] = useState(topics[0].id)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | GuideTopic['category']>('ALL')

  const matchingTopics = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('th-TH')
    return topics.filter(topic => {
      // Category filter
      if (categoryFilter !== 'ALL' && topic.category !== categoryFilter) {
        return false
      }
      // Search query
      if (!query) return true
      return [
        topic.title,
        topic.shortTitle,
        topic.description,
        ...topic.keywords,
        ...topic.sections.flatMap(section => [
          section.title,
          section.description,
          ...(section.steps || []),
          ...(section.table ? section.table.headers.concat(section.table.rows.flat()) : []),
        ]),
      ].some(value => value.toLocaleLowerCase('th-TH').includes(query))
    })
  }, [search, categoryFilter])

  const activeTopic = matchingTopics.find(topic => topic.id === activeId) || matchingTopics[0]

  function chooseTopic(id: string) {
    setActiveId(id)
    if (window.innerWidth < 860) {
      window.requestAnimationFrame(() =>
        document.getElementById('guide-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      )
    }
  }

  return (
    <main className={styles.page}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p>TEACHER HANDBOOK & CONSOLE MANUAL</p>
          <h1>คู่มือใช้งาน Teacher Console ฉบับสมบูรณ์</h1>
          <span>
            คู่มือการใช้งานอย่างละเอียดที่สุดสำหรับครูผู้สอน: การจัดการห้องเรียน, ออกแบบแผนการสอน FINE Model, จัดการสื่อ AR 3D, มอบหมายงาน, ตรวจประเมินผลพร้อม Feedback, วิเคราะห์สมรรถนะ KSA-C และการสอน Active Learning
          </span>
          <div className={styles.heroBadges}>
            <span><AdminIcon name="database" size={14} />Local PostgreSQL</span>
            <span><AdminIcon name="shield" size={14} />ความปลอดภัยระดับองค์กร</span>
            <span><AdminIcon name="monitor" size={14} />รองรับ PC / แท็บเล็ต / สมาร์ตโฟน</span>
            <span><AdminIcon name="sparkles" size={14} />บูรณาการ AR 3D + AI</span>
          </div>
        </div>
        <div className={styles.heroIndex}>
          <span>
            <strong>{String(topics.length).padStart(2, '0')}</strong>
            <small>หมวดคู่มือฉบับเต็ม</small>
          </span>
          <i />
          <span>
            <strong>FINE</strong>
            <small>Learning Workflow</small>
          </span>
        </div>
      </section>

      {/* Search & Category Filter Panel */}
      <section className={styles.searchPanel} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <label>
            <AdminIcon name="search" size={18} />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="ค้นหาคู่มือครู เช่น เพิ่มนักเรียน, รหัสเชิญ, แผนการสอน, สื่อ AR, ตรวจงาน, คะแนน KSA-C, Excel..."
              aria-label="ค้นหาในคู่มือครู"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="ล้างคำค้น">
                <AdminIcon name="close" size={16} />
              </button>
            )}
          </label>
          <span>{matchingTopics.length} หมวดที่ตรงกับการค้นหา</span>
        </div>

        {/* Category Pills */}
        <div className={styles.categoryPills}>
          <button
            type="button"
            className={`${styles.categoryPill} ${categoryFilter === 'ALL' ? styles.categoryPillActive : ''}`}
            onClick={() => setCategoryFilter('ALL')}
          >
            ทั้งหมด ({topics.length})
          </button>
          <button
            type="button"
            className={`${styles.categoryPill} ${categoryFilter === 'SETUP' ? styles.categoryPillActive : ''}`}
            onClick={() => setCategoryFilter('SETUP')}
          >
            🚀 เริ่มต้น & แดชบอร์ด
          </button>
          <button
            type="button"
            className={`${styles.categoryPill} ${categoryFilter === 'CLASSES' ? styles.categoryPillActive : ''}`}
            onClick={() => setCategoryFilter('CLASSES')}
          >
            🏫 ห้องเรียน & สมาชิก
          </button>
          <button
            type="button"
            className={`${styles.categoryPill} ${categoryFilter === 'CURRICULUM' ? styles.categoryPillActive : ''}`}
            onClick={() => setCategoryFilter('CURRICULUM')}
          >
            📚 แผนการสอน & สื่อ AR
          </button>
          <button
            type="button"
            className={`${styles.categoryPill} ${categoryFilter === 'GRADING' ? styles.categoryPillActive : ''}`}
            onClick={() => setCategoryFilter('GRADING')}
          >
            📝 มอบหมายงาน & ตรวจคะแนน
          </button>
          <button
            type="button"
            className={`${styles.categoryPill} ${categoryFilter === 'ANALYTICS' ? styles.categoryPillActive : ''}`}
            onClick={() => setCategoryFilter('ANALYTICS')}
          >
            📊 วิเคราะห์สมรรถนะ KSA-C
          </button>
          <button
            type="button"
            className={`${styles.categoryPill} ${categoryFilter === 'TIPS' ? styles.categoryPillActive : ''}`}
            onClick={() => setCategoryFilter('TIPS')}
          >
            💡 แผนสอนจริง & แก้ปัญหา
          </button>
        </div>
      </section>

      {/* Manual Split Layout */}
      <div className={styles.manualLayout}>
        {/* Left Aside: Topic Navigation */}
        <aside className={styles.topicPanel}>
          <header>
            <p>GUIDE SECTIONS</p>
            <h2>หัวข้อคู่มือการสอน ({matchingTopics.length})</h2>
          </header>
          <nav>
            {matchingTopics.map(topic => (
              <button
                type="button"
                className={activeTopic?.id === topic.id ? styles.topicActive : styles.topicButton}
                key={topic.id}
                onClick={() => chooseTopic(topic.id)}
              >
                <span>
                  <AdminIcon name={topic.icon} size={17} />
                </span>
                <div>
                  <small>{topic.number}</small>
                  <strong>{topic.shortTitle}</strong>
                </div>
                <AdminIcon name="chevron" size={14} />
              </button>
            ))}
          </nav>
          <footer>
            <AdminIcon name="activity" size={16} />
            <span>หากพบข้อมูลไม่ตรงกับหน้าจอ ให้รีเฟรชระบบและตรวจสถานะบัญชีก่อน</span>
          </footer>
        </aside>

        {/* Right Section: Active Guide Detail Content */}
        <section className={styles.guideContent} id="guide-content">
          {activeTopic ? (
            <>
              <header className={styles.guideHeader}>
                <span className={styles.guideIcon}>
                  <AdminIcon name={activeTopic.icon} size={24} />
                </span>
                <div>
                  <p>SECTION {activeTopic.number} · {activeTopic.categoryLabel}</p>
                  <h2>{activeTopic.title}</h2>
                  <span>{activeTopic.description}</span>
                </div>
                <Link href={activeTopic.href}>
                  {activeTopic.action}
                  <AdminIcon name="arrow" size={15} />
                </Link>
              </header>

              <div className={styles.sectionGrid}>
                {activeTopic.sections.map((section, sectionIndex) => (
                  <article
                    className={`${styles.guideSection} ${section.fullWidth ? styles.sectionFull : ''}`}
                    key={section.title}
                  >
                    <header>
                      <span>
                        <AdminIcon name={section.icon} size={18} />
                      </span>
                      <div>
                        <small>ขั้นตอนที่ {sectionIndex + 1}</small>
                        <h3>{section.title}</h3>
                        <p>{section.description}</p>
                      </div>
                    </header>

                    {/* Step by Step List */}
                    {section.steps && section.steps.length > 0 && (
                      <ol>
                        {section.steps.map((step, index) => (
                          <li key={step}>
                            <span>{index + 1}</span>
                            <p>{step}</p>
                          </li>
                        ))}
                      </ol>
                    )}

                    {/* Rich Table if available */}
                    {section.table && (
                      <div className={styles.guideTableWrap}>
                        <table className={styles.guideTable}>
                          <thead>
                            <tr>
                              {section.table.headers.map((h, i) => (
                                <th key={i}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row, rIdx) => (
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

                    {/* Flow diagram block if available */}
                    {section.flowDiagram && (
                      <pre className={styles.guideFlowBlock}>{section.flowDiagram}</pre>
                    )}

                    {/* Tip callout */}
                    {section.tip && (
                      <div className={styles.guideCalloutTip}>
                        <span>💡</span>
                        <div>
                          <strong>คำแนะนำคุณครู: </strong>
                          <span>{section.tip}</span>
                        </div>
                      </div>
                    )}

                    {/* Warning callout */}
                    {section.warning && (
                      <div className={styles.guideCalloutWarning}>
                        <span>⚠️</span>
                        <div>
                          <strong>ข้อควรระวัง: </strong>
                          <span>{section.warning}</span>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>

              {/* Note callout box */}
              <aside className={styles.guideNote}>
                <span>
                  <AdminIcon name="shield" size={19} />
                </span>
                <div>
                  <strong>ข้อควรรู้สำคัญ</strong>
                  <p>{activeTopic.note}</p>
                </div>
              </aside>

              {/* Guide Footer with quick action link */}
              <footer className={styles.guideFooter}>
                <span>อ่านจบแล้ว สามารถเปิดหน้าจัดการเพื่อเริ่มทำตามขั้นตอนได้ทันที</span>
                <Link href={activeTopic.href}>
                  {activeTopic.action}
                  <AdminIcon name="arrow" size={15} />
                </Link>
              </footer>
            </>
          ) : (
            <div className={styles.emptyState}>
              <span>
                <AdminIcon name="search" size={25} />
              </span>
              <h3>ไม่พบหัวข้อที่ค้นหา</h3>
              <p>ลองใช้คำค้นสั้นลง เช่น ห้องเรียน, งาน, คะแนน, สื่อ AR หรือรหัสเชิญ</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setCategoryFilter('ALL')
                }}
              >
                แสดงคู่มือทั้งหมด
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
