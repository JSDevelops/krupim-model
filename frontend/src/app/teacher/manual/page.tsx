'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import AdminIcon, { type AdminIconName } from '@/components/admin/AdminIcon'
import styles from './page.module.css'

type GuideSection = { title: string; description: string; icon: AdminIconName; steps: string[] }
type GuideTopic = {
  id: string; number: string; title: string; shortTitle: string; description: string
  icon: AdminIconName; href: string; action: string; keywords: string[]; sections: GuideSection[]; note: string
}

const topics: GuideTopic[] = [
  {
    id: 'start', number: '01', title: 'เริ่มต้นใช้งาน Teacher Console', shortTitle: 'เริ่มต้นใช้งาน',
    description: 'ตรวจสอบบัญชี ตั้งค่าข้อมูลพื้นฐาน และจัดลำดับงานก่อนเริ่มเปิดชั้นเรียน', icon: 'dashboard', href: '/teacher/dashboard', action: 'เปิดแดชบอร์ด',
    keywords: ['เริ่มต้น', 'dashboard', 'บัญชี', 'ภาพรวม', 'postgresql'],
    sections: [
      { title: 'ตรวจสอบความพร้อม', description: 'เริ่มจากข้อมูลที่จำเป็นต่อการใช้งานทุกโมดูล', icon: 'check', steps: ['เข้าสู่ระบบด้วยบทบาทครูผู้สอน', 'ตรวจชื่อ สถานศึกษา และสถานะบัญชีจากเมนูโปรไฟล์', 'เปิดแดชบอร์ดเพื่อตรวจจำนวนห้องเรียน นักเรียน และงานที่รอตรวจ'] },
      { title: 'ลำดับงานที่แนะนำ', description: 'จัดเตรียมข้อมูลตามลำดับเพื่อลดการทำงานซ้ำ', icon: 'arrow', steps: ['สร้างห้องเรียน', 'เพิ่มนักเรียนเข้าห้อง', 'สร้างแผนการสอนและสื่อ', 'มอบหมายงานและติดตามผล'] },
    ],
    note: 'ข้อมูลใน Teacher Console เชื่อมกับ PostgreSQL ภายใน Laragon การรีเฟรชหน้าไม่ทำให้ข้อมูลที่บันทึกแล้วหายไป',
  },
  {
    id: 'classes', number: '02', title: 'ห้องเรียนและนักเรียน', shortTitle: 'ห้องเรียนและนักเรียน',
    description: 'สร้างห้องเรียน จัดสมาชิก และติดตามภาพรวมผู้เรียนที่อยู่ในความรับผิดชอบ', icon: 'school', href: '/teacher/classes', action: 'จัดการห้องเรียน',
    keywords: ['ห้องเรียน', 'นักเรียน', 'สมาชิก', 'อีเมล', 'ย้ายห้อง'],
    sections: [
      { title: 'สร้างห้องเรียน', description: 'กำหนดโครงสร้างห้องก่อนเพิ่มสมาชิกหรือมอบหมายงาน', icon: 'school', steps: ['เปิดเมนูห้องเรียนและสมาชิก', 'กดสร้างห้องเรียน แล้วระบุชื่อ ปีการศึกษา และภาคเรียน', 'ตรวจรายละเอียดก่อนบันทึก ห้องใหม่จะพร้อมใช้งานทันที'] },
      { title: 'เพิ่มและย้ายนักเรียน', description: 'ครูจัดการเฉพาะสมาชิกห้องโดยไม่กระทบบัญชีส่วนกลาง', icon: 'student', steps: ['ใช้อีเมลของบัญชีนักเรียนที่แอดมินเปิดใช้งานแล้ว', 'เลือกห้องเรียนปลายทางและยืนยันการเพิ่ม', 'ใช้หน้ารวมนักเรียนเมื่อต้องการย้ายห้องหรือนำออกจากห้อง'] },
    ],
    note: 'การนำออกจากห้องจะไม่ลบบัญชีหรือประวัติการเรียน การลบบัญชีและเปลี่ยนบทบาทเป็นสิทธิ์ของผู้ดูแลระบบ',
  },
  {
    id: 'lessons', number: '03', title: 'แผนการสอน FINE Model', shortTitle: 'แผนการสอน',
    description: 'สร้างแผนการเรียนรู้แบบเป็นขั้นตอน ตั้งแต่ข้อมูลพื้นฐาน ผลลัพธ์ KSA-C ไปจนถึงกิจกรรม FINE', icon: 'content', href: '/teacher/lessons', action: 'เปิดคลังแผนการสอน',
    keywords: ['แผนการสอน', 'fine', 'ksa', 'วัตถุประสงค์', 'กิจกรรม'],
    sections: [
      { title: 'ข้อมูลพื้นฐาน', description: 'ระบุบริบทที่ทำให้ค้นหาและนำแผนกลับมาใช้ได้ง่าย', icon: 'content', steps: ['กรอกชื่อแผน รายวิชา ระดับชั้น และห้องเป้าหมาย', 'กำหนดภาคเรียน สัปดาห์ ระยะเวลา และสาระสำคัญ', 'บันทึกชื่อให้สื่อความหมายและไม่ซ้ำกันมากเกินไป'] },
      { title: 'ผลลัพธ์และกิจกรรม', description: 'แยกจุดประสงค์ให้ตรวจสอบผลการเรียนรู้ได้ชัดเจน', icon: 'score', steps: ['ระบุ Knowledge, Skills, Attribute และ Application ทีละบรรทัด', 'เพิ่มคำศัพท์และประโยคตัวอย่างที่ใช้จริง', 'ออกแบบกิจกรรม Lead, Familiarize, Interact, Navigate, Exhibit และ Wrap'] },
    ],
    note: 'แผนที่มีสาระสำคัญและกิจกรรม FINE ครบจะถูกแสดงสถานะพร้อมใช้ คุณสามารถแก้ไขหรือทำสำเนาแผนเดิมได้',
  },
  {
    id: 'resources', number: '04', title: 'สื่อ AR โมเดล 3 มิติ และคำศัพท์', shortTitle: 'สื่อ AR และคำศัพท์',
    description: 'จัดคลังสื่อให้เป็นระบบ พร้อมข้อมูลภาษาอังกฤษ หมวดหมู่ ลิงก์โมเดล และคำแนะนำการบริการ', icon: 'cube', href: '/teacher/ar-models', action: 'เปิดคลังโมเดล AR',
    keywords: ['ar', '3d', 'โมเดล', 'คำศัพท์', 'vocabulary', 'glb', 'usdz'],
    sections: [
      { title: 'โมเดล AR และ 3 มิติ', description: 'เตรียมข้อมูลให้เหมาะกับทั้งเว็บ Android และ iOS', icon: 'cube', steps: ['กรอกชื่อไทย ชื่ออังกฤษ หมวดหมู่ และคำอธิบาย', 'เพิ่มภาพตัวอย่างและ URL ของไฟล์ GLB หรือ USDZ ตามที่มี', 'บันทึกเป็นฉบับร่างก่อน แล้วตรวจลิงก์พรีวิวก่อนเผยแพร่'] },
      { title: 'คลังคำศัพท์', description: 'สร้างชุดคำศัพท์ที่ค้นหาและนำไปฝึกได้สะดวก', icon: 'scan', steps: ['ระบุคำศัพท์ คำแปล คำอ่าน และหมวดหมู่', 'เพิ่มสถานที่ใช้งาน เคล็ดลับบริการ และประโยคตัวอย่าง', 'ค้นหา แก้ไข หรือลบรายการที่ซ้ำจากหน้าคลังคำศัพท์'] },
    ],
    note: 'ใช้ URL ที่เข้าถึงได้จากอุปกรณ์ของนักเรียน หลีกเลี่ยง path ไฟล์ภายในเครื่องครูซึ่งมือถือเครื่องอื่นจะเปิดไม่ได้',
  },
  {
    id: 'assignments', number: '05', title: 'งานมอบหมายและการประเมิน', shortTitle: 'งานและการประเมิน',
    description: 'มอบหมายกิจกรรมให้ห้องเรียน ติดตามสถานะการส่ง และบันทึกคะแนนพร้อมข้อเสนอแนะ', icon: 'score', href: '/teacher/assignments', action: 'จัดการงานมอบหมาย',
    keywords: ['งาน', 'มอบหมาย', 'ส่งงาน', 'คะแนน', 'feedback', 'ประเมิน'],
    sections: [
      { title: 'สร้างงานใหม่', description: 'งานหนึ่งรายการเชื่อมกับห้องเรียนหนึ่งห้องและกิจกรรมหนึ่งขั้น', icon: 'plus', steps: ['ระบุชื่อ รายละเอียด และขั้น Familiarize, Interact, Navigate หรือ Exhibit', 'เลือกห้องเรียน กำหนดวันส่ง และคะแนนเต็ม', 'ตรวจจำนวนสมาชิกของห้องก่อนสร้างและมอบหมาย'] },
      { title: 'ตรวจและให้คะแนน', description: 'รายงานจะแยกผู้ที่ส่งแล้วและผู้ที่ยังไม่ส่งโดยอัตโนมัติ', icon: 'analytics', steps: ['เปิดปุ่มรายงานของงานที่ต้องการ', 'เลือกให้คะแนนเฉพาะนักเรียนที่ส่งงานแล้ว', 'กรอกคะแนนไม่เกินคะแนนเต็ม พร้อมข้อเสนอแนะที่นำไปปรับปรุงได้'] },
    ],
    note: 'การลบงานจะลบข้อมูลการส่งที่เชื่อมกับงานนั้นด้วย ควรตรวจรายงานและยืนยันรายการให้ถูกต้องก่อนลบ',
  },
  {
    id: 'progress', number: '06', title: 'ติดตามความก้าวหน้าและ KSA-C', shortTitle: 'ความก้าวหน้า KSA-C',
    description: 'อ่านคะแนนรายมิติ กิจกรรมล่าสุด และผู้เรียนที่ควรติดตามจากข้อมูลจริงในระบบ', icon: 'analytics', href: '/teacher/students', action: 'เปิดภาพรวมนักเรียน',
    keywords: ['ความก้าวหน้า', 'ksa-c', 'คะแนน', 'analytics', 'ติดตาม'],
    sections: [
      { title: 'อ่านค่าคะแนน', description: 'ใช้คะแนนแต่ละมิติร่วมกัน ไม่พิจารณาเฉพาะคะแนนรวม', icon: 'score', steps: ['K แสดงความรู้และความเข้าใจ', 'S แสดงทักษะการปฏิบัติและการสื่อสาร', 'A แสดงคุณลักษณะและเจตคติ', 'C แสดงสมรรถนะการประยุกต์ใช้ในสถานการณ์'] },
      { title: 'วางแผนติดตาม', description: 'ใช้ตัวกรองเพื่อลดเวลาค้นหาผู้เรียนที่ต้องการความช่วยเหลือ', icon: 'activity', steps: ['กรองตามห้องเรียนหรือสถานะบัญชี', 'ตรวจคะแนนต่ำกว่าเกณฑ์และวันที่ทำกิจกรรมล่าสุด', 'เปิดงานมอบหมายเพื่อดูชิ้นงานและให้ข้อเสนอแนะรายบุคคล'] },
    ],
    note: 'คะแนนศูนย์อาจหมายถึงยังไม่มีข้อมูลประเมิน ควรตรวจประวัติการส่งงานและกิจกรรมก่อนสรุปผลผู้เรียน',
  },
]

export default function TeacherManualPage() {
  const [activeId, setActiveId] = useState(topics[0].id)
  const [search, setSearch] = useState('')
  const matchingTopics = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('th-TH')
    if (!query) return topics
    return topics.filter(topic => [topic.title, topic.shortTitle, topic.description, ...topic.keywords, ...topic.sections.flatMap(section => [section.title, section.description, ...section.steps])].some(value => value.toLocaleLowerCase('th-TH').includes(query)))
  }, [search])
  const activeTopic = matchingTopics.find(topic => topic.id === activeId) || matchingTopics[0]

  function chooseTopic(id: string) {
    setActiveId(id)
    if (window.innerWidth < 860) window.requestAnimationFrame(() => document.getElementById('guide-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.heroContent}><p>TEACHER HANDBOOK</p><h1>คู่มือใช้งาน Teacher Console</h1><span>คำแนะนำแบบเป็นขั้นตอนสำหรับจัดห้องเรียน สร้างสื่อ มอบหมายงาน และติดตามผลผู้เรียน</span><div className={styles.heroBadges}><span><AdminIcon name="database" size={14} />Local PostgreSQL</span><span><AdminIcon name="shield" size={14} />สิทธิ์ตามบทบาท</span><span><AdminIcon name="monitor" size={14} />รองรับทุกอุปกรณ์</span></div></div>
      <div className={styles.heroIndex}><span><strong>{String(topics.length).padStart(2, '0')}</strong><small>หมวดคู่มือ</small></span><i /><span><strong>FINE</strong><small>Learning Workflow</small></span></div>
    </section>

    <section className={styles.searchPanel}><label><AdminIcon name="search" size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหา เช่น เพิ่มนักเรียน สร้างงาน คะแนน KSA-C" aria-label="ค้นหาในคู่มือ" />{search && <button type="button" onClick={() => setSearch('')} aria-label="ล้างคำค้น"><AdminIcon name="close" size={16} /></button>}</label><span>{matchingTopics.length} หมวดที่ตรงกับการค้นหา</span></section>

    <div className={styles.manualLayout}>
      <aside className={styles.topicPanel}><header><p>GUIDE SECTIONS</p><h2>หัวข้อคู่มือ</h2></header><nav>{matchingTopics.map(topic => <button type="button" className={activeTopic?.id === topic.id ? styles.topicActive : styles.topicButton} key={topic.id} onClick={() => chooseTopic(topic.id)}><span><AdminIcon name={topic.icon} size={17} /></span><div><small>{topic.number}</small><strong>{topic.shortTitle}</strong></div><AdminIcon name="chevron" size={14} /></button>)}</nav><footer><AdminIcon name="activity" size={16} /><span>หากพบข้อมูลไม่ตรงกับหน้าจอ ให้รีเฟรชระบบและตรวจสถานะบัญชีก่อน</span></footer></aside>

      <section className={styles.guideContent} id="guide-content">
        {activeTopic ? <>
          <header className={styles.guideHeader}><span className={styles.guideIcon}><AdminIcon name={activeTopic.icon} size={24} /></span><div><p>SECTION {activeTopic.number}</p><h2>{activeTopic.title}</h2><span>{activeTopic.description}</span></div><Link href={activeTopic.href}>{activeTopic.action}<AdminIcon name="arrow" size={15} /></Link></header>
          <div className={styles.sectionGrid}>{activeTopic.sections.map((section, sectionIndex) => <article className={styles.guideSection} key={section.title}><header><span><AdminIcon name={section.icon} size={18} /></span><div><small>ขั้นตอน {sectionIndex + 1}</small><h3>{section.title}</h3><p>{section.description}</p></div></header><ol>{section.steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></article>)}</div>
          <aside className={styles.guideNote}><span><AdminIcon name="shield" size={19} /></span><div><strong>ข้อควรรู้</strong><p>{activeTopic.note}</p></div></aside>
          <footer className={styles.guideFooter}><span>อ่านจบแล้ว สามารถเปิดหน้าจัดการเพื่อเริ่มทำตามขั้นตอนได้ทันที</span><Link href={activeTopic.href}>{activeTopic.action}<AdminIcon name="arrow" size={15} /></Link></footer>
        </> : <div className={styles.emptyState}><span><AdminIcon name="search" size={25} /></span><h3>ไม่พบหัวข้อที่ค้นหา</h3><p>ลองใช้คำค้นสั้นลง เช่น ห้องเรียน งาน คะแนน หรือ AR</p><button type="button" onClick={() => setSearch('')}>แสดงคู่มือทั้งหมด</button></div>}
      </section>
    </div>
  </main>
}
