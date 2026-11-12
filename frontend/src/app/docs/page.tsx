'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './docs.module.css'

type RoleCategory = 'ALL' | 'OVERVIEW' | 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PERMISSIONS' | 'FAQ'

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<RoleCategory>('ALL')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  // Filter visibility helper
  const isVisible = (category: RoleCategory, keywords: string[] = []) => {
    const matchRole = selectedRole === 'ALL' || selectedRole === category
    if (!matchRole) return false

    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return keywords.some(k => k.toLowerCase().includes(q))
  }

  return (
    <div className={styles.docsPage}>
      {/* Sticky Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.navWrap}>
            <Link href="/" className={styles.brand} aria-label="กลับสู่หน้าแรก">
              <Image
                src="/logo.png"
                alt="FINE MODEL Logo"
                width={40}
                height={40}
                className={styles.brandLogo}
                priority
              />
              <div className={styles.brandText}>
                <span className={styles.brandTitle}>FINE MODEL DOCUMENTATION</span>
                <span className={styles.brandSubtitle}>คู่มือการใช้งานฉบับสมบูรณ์ & สิทธิ์ระบบ</span>
              </div>
            </Link>

            <div className={styles.navActions}>
              <button
                type="button"
                onClick={handlePrint}
                className={styles.printBtn}
                title="พิมพ์คู่มือหรือบันทึกเป็น PDF"
              >
                <span aria-hidden="true" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                </span>
                <span>พิมพ์ / PDF</span>
              </button>

              <Link href="/" className={styles.backHomeBtn}>
                <span>← กลับหน้าแรก</span>
              </Link>

              <Link href="/role-select" className={styles.loginPortalBtn}>
                <span>เข้าสู่ระบบ →</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero & Search Toolbar */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroEyebrow}>
            <span>OFFICIAL SYSTEM MANUAL &amp; PERMISSIONS SPECIFICATION</span>
          </div>
          <h1 className={styles.heroTitle}>
            เอกสารคู่มือการใช้งาน <span className={styles.heroTitleHighlight}>ฉบับสมบูรณ์</span>
          </h1>
          <p className={styles.heroDesc}>
            คำอธิบายกระบวนการ FINE Model, สถาปัตยกรรมระบบ, ขั้นตอนการปฏิบัติงานของทุกบทบาท (นักเรียน, ครูผู้สอน, ผู้ดูแลระบบ) 
            พร้อมตารางกำหนดสิทธิ์การใช้งาน (Permissions Matrix) และแนวทางแก้ไขปัญหาทางเทคนิค
          </p>

          <div className={styles.toolbarWrap}>
            {/* Search Input */}
            <div className={styles.searchBox}>
              <span className={styles.searchIcon} aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="ค้นหาฟังก์ชัน, บทบาท, ขั้นตอน FINE, หรือคำสำคัญ (เช่น AR, AI Voice, ตรวจงาน, สิทธิ์)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label="ล้างการค้นหา"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className={styles.roleTabs} role="tablist" aria-label="กรองตามบทบาท">
              <button
                type="button"
                className={`${styles.roleTabBtn} ${selectedRole === 'ALL' ? styles.roleTabActive : ''}`}
                onClick={() => setSelectedRole('ALL')}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                className={`${styles.roleTabBtn} ${selectedRole === 'OVERVIEW' ? styles.roleTabActive : ''}`}
                onClick={() => setSelectedRole('OVERVIEW')}
              >
                ภาพรวม FINE Model
              </button>
              <button
                type="button"
                className={`${styles.roleTabBtn} ${selectedRole === 'STUDENT' ? styles.roleTabActive : ''}`}
                onClick={() => setSelectedRole('STUDENT')}
              >
                นักเรียน (Student)
              </button>
              <button
                type="button"
                className={`${styles.roleTabBtn} ${selectedRole === 'TEACHER' ? styles.roleTabActive : ''}`}
                onClick={() => setSelectedRole('TEACHER')}
              >
                ครูผู้สอน (Teacher)
              </button>
              <button
                type="button"
                className={`${styles.roleTabBtn} ${selectedRole === 'ADMIN' ? styles.roleTabActive : ''}`}
                onClick={() => setSelectedRole('ADMIN')}
              >
                ผู้ดูแลระบบ (Admin)
              </button>
              <button
                type="button"
                className={`${styles.roleTabBtn} ${selectedRole === 'PERMISSIONS' ? styles.roleTabActive : ''}`}
                onClick={() => setSelectedRole('PERMISSIONS')}
              >
                เมทริกซ์สิทธิ์ (Permissions)
              </button>
              <button
                type="button"
                className={`${styles.roleTabBtn} ${selectedRole === 'FAQ' ? styles.roleTabActive : ''}`}
                onClick={() => setSelectedRole('FAQ')}
              >
                FAQ &amp; การแก้ปัญหา
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className={styles.container}>
        <div className={styles.mainLayout}>
          {/* Sticky Sidebar Navigation */}
          <aside className={styles.sidebar} aria-label="สารบัญเอกสาร">
            <div className={styles.sidebarTitle}>
              <span>สารบัญด่วน</span>
              <span style={{ fontSize: 11, color: '#8c6819' }}>Quick Nav</span>
            </div>
            <ul className={styles.sidebarList}>
              <li>
                <a href="#overview" className={styles.sidebarLink}>
                  <span>1. ภาพรวม FINE Model</span>
                  <span className={styles.sidebarBadge}>กรอบคิด</span>
                </a>
              </li>
              <li>
                <a href="#student-manual" className={styles.sidebarLink}>
                  <span>2. คู่มือนักเรียน (Student)</span>
                  <span className={styles.sidebarBadge}>6 ขั้น</span>
                </a>
              </li>
              <li>
                <a href="#teacher-manual" className={styles.sidebarLink}>
                  <span>3. คู่มือครูผู้สอน (Teacher)</span>
                  <span className={styles.sidebarBadge}>8 โมดูล</span>
                </a>
              </li>
              <li>
                <a href="#admin-manual" className={styles.sidebarLink}>
                  <span>4. คู่มือผู้ดูแลระบบ (Admin)</span>
                  <span className={styles.sidebarBadge}>Telemetry</span>
                </a>
              </li>
              <li>
                <a href="#permissions-matrix" className={styles.sidebarLink}>
                  <span>5. เมทริกซ์สิทธิ์ (Matrix)</span>
                  <span className={styles.sidebarBadge}>4 ระดับ</span>
                </a>
              </li>
              <li>
                <a href="#faq-section" className={styles.sidebarLink}>
                  <span>6. FAQ &amp; การแก้ไขปัญหา</span>
                  <span className={styles.sidebarBadge}>Help</span>
                </a>
              </li>
            </ul>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(23, 75, 55, 0.1)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#174735', marginBottom: 8 }}>
                ทางลัดเข้าสู่ระบบ
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Link href="/student/dashboard" style={{ fontSize: 12.5, color: '#245b43', textDecoration: 'none' }}>
                  → พอร์ทัลนักเรียน (Student Portal)
                </Link>
                <Link href="/teacher/dashboard" style={{ fontSize: 12.5, color: '#245b43', textDecoration: 'none' }}>
                  → ห้องพักครู (Teacher Console)
                </Link>
                <Link href="/admin/dashboard" style={{ fontSize: 12.5, color: '#245b43', textDecoration: 'none' }}>
                  → คอนโซลแอดมิน (Admin Console)
                </Link>
              </div>
            </div>
          </aside>

          {/* Detailed Documentation Content */}
          <div className={styles.contentArea}>
            {/* SECTION 1: OVERVIEW & FINE MODEL FRAMEWORK */}
            {isVisible('OVERVIEW', ['ภาพรวม', 'fine', 'framework', 'ksa-c', 'กระบวนการ', 'โมเดล', 'ทฤษฎี', 'ar', 'ai']) && (
              <section id="overview" className={styles.docSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionCategory}>Chapter 01 · System Architecture</span>
                    <h2 className={styles.sectionTitle}>1. ภาพรวมสถาปัตยกรรม & โมเดล FINE Model</h2>
                    <p className={styles.sectionDesc}>
                      โครงสร้างการจัดกระบวนการเรียนรู้ภาษาอังกฤษเพื่องานบริการ บูรณาการเทคโนโลยีสื่อเสมือนจริง AR 3D และปัญญาประดิษฐ์ AI Scan
                    </p>
                  </div>
                  <Link href="/role-select" className={styles.sectionActionBtn}>
                    <span>เริ่มใช้งานระบบ →</span>
                  </Link>
                </div>

                <div className={styles.topicCardGrid}>
                  <div className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <h3 className={styles.topicTitle}>
                        <span className={styles.topicNumber}>1.1</span>
                        <span>กระบวนการ 4 ขั้นตอนของ FINE Model</span>
                      </h3>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#b58c32' }}>Pedagogical Cycle</span>
                    </div>
                    <div className={styles.topicCardBody}>
                      <div className={styles.diagramBox}>{`[ F : Familiarize & Explore ]  ──► สำรวจคำศัพท์ภาษาอังกฤษเฉพาะทาง + โมเดล 3D AR + AI Scan
              │
              ▼
[ I : Interact & Speak ]       ──► ฝึกสนทนาโต้ตอบเสียงสดกับ AI Voice Coach จำลองบทบาทลูกค้า
              │
              ▼
[ N : Navigate & Scenario ]    ──► แก้ไขสถานการณ์จำลอง 3D Interactive ตัดสินใจตามมาตรฐานบริการ
              │
              ▼
[ E : Exhibit & Evaluate ]     ──► ทำ Exit Ticket Quiz + สรุปคะแนน KSA-C + รับใบประกาศนียบัตร`}</div>

                      <div className={styles.docTableWrap}>
                        <table className={styles.docTable}>
                          <thead>
                            <tr>
                              <th>ขั้นตอน FINE</th>
                              <th>ความหมายเชิงการสอน</th>
                              <th>เครื่องมือเทคโนโลยีที่ใช้</th>
                              <th>ผลลัพธ์ที่คาดหวัง (Outcomes)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><strong>F · Familiarize</strong></td>
                              <td>การสร้างความคุ้นเคยกับคำศัพท์ อุปกรณ์ และบริบทงานบริการ</td>
                              <td>AR 3D WebGL, 3D Canvas, AI Scan ถ่ายภาพวัตถุ</td>
                              <td>จำแนกประเภทอุปกรณ์และออกเสียงคำศัพท์ถูกต้อง</td>
                            </tr>
                            <tr>
                              <td><strong>I · Interact</strong></td>
                              <td>การฝึกสื่อสารโต้ตอบอย่างเป็นธรรมชาติ</td>
                              <td>Web Speech Recognition, AI Voice (Gemini / TTS)</td>
                              <td>โต้ตอบบทสนทนากับลูกค้าได้อย่างคล่องแคล่วและมั่นใจ</td>
                            </tr>
                            <tr>
                              <td><strong>N · Navigate</strong></td>
                              <td>การนำทางและตัดสินใจแก้ปัญหาเฉพาะหน้าในงานบริการ</td>
                              <td>Branching Scenario Engine, 3D Environment</td>
                              <td>มีทักษะไหวพริบการบริการและ Service Mind ระดับมืออาชีพ</td>
                            </tr>
                            <tr>
                              <td><strong>E · Exhibit</strong></td>
                              <td>การสะท้อนการเรียนรู้และแสดงหลักฐานสมรรถนะ</td>
                              <td>Exit Ticket Quiz, Rubric Evaluator, E-Portfolio</td>
                              <td>วัดผลสมรรถนะครบ 4 มิติ KSA-C พร้อมรับเกียรติบัตร</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <h3 className={styles.topicTitle}>
                        <span className={styles.topicNumber}>1.2</span>
                        <span>กรอบการวัดและประเมินผลสมรรถนะ KSA-C</span>
                      </h3>
                    </div>
                    <div className={styles.topicCardBody}>
                      <p style={{ fontSize: 14, color: '#3b4d43', lineHeight: 1.6 }}>
                        ระบบประเมินผลผู้เรียนรายบุคคลแบบ Real-time ผ่านการรวบรวมข้อมูลการทำกิจกรรมทั้ง 4 ขั้นตอน 
                        แปลงเป็นคะแนนสมรรถนะ 4 มิติ และแสดงผลเป็นแผนภูมิใยแมงมุม (Spider Chart) บน E-Portfolio:
                      </p>
                      <ul className={styles.stepList}>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>K</span>
                          <div>
                            <strong>Knowledge (ด้านความรู้):</strong> ประเมินจากความถูกต้องของคลังคำศัพท์ภาษาอังกฤษ การจำแนกประเภทอุปกรณ์งานโรงแรม และคะแนนแบบทดสอบ Quiz
                          </div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>S</span>
                          <div>
                            <strong>Skills (ด้านทักษะปฏิบัติ):</strong> ประเมินจากความคล่องแคล่วในการฝึกพูดกับ AI Voice Coach, สำเนียง, ความรวดเร็วในการโต้ตอบ และการออกเสียงที่ถูกต้อง
                          </div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>A</span>
                          <div>
                            <strong>Attitude & Application (ด้านเจตคติและการประยุกต์ใช้):</strong> ประเมินจากมารยาทการสื่อสาร ความสุภาพ การเลือกคำศัพท์ที่เหมาะสมกับลูกค้า และการส่งงานตรงต่อเวลา
                          </div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>C</span>
                          <div>
                            <strong>Competence (สมรรถนะวิชาชีพแบบองค์รวม):</strong> ประเมินจากการตัดสินใจแก้ปัญหาในสถานการณ์จำลอง 3D Scenario ได้อย่างถูกต้องตามเกณฑ์มาตรฐานสากล
                          </div>
                        </li>
                      </ul>

                      <div className={styles.tipBox}>
                        <span>💡</span>
                        <div>
                          <strong>การออกเกียรติบัตรดิจิทัล:</strong> เมื่อนักเรียนทำกิจกรรมและได้คะแนนสมรรถนะผ่านเกณฑ์ที่ครูกำหนด 
                          ระบบจะสร้างเกียรติบัตร E-Portfolio พร้อม QR Code และรหัสตรวจสิทธิสากล เช่น <code>FINE-2026-XXXX</code> 
                          ซึ่งสามารถตรวจสอบความถูกต้องได้ทันทีผ่านหน้า <code>/verify/[code]</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: STUDENT MANUAL */}
            {isVisible('STUDENT', ['นักเรียน', 'student', 'สมัคร', 'pdpa', 'dock', 'pwa', 'iphone', 'android', 'สแกน', 'พูด', 'exit ticket', 'portfolio']) && (
              <section id="student-manual" className={styles.docSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionCategory}>Chapter 02 · Student Manual</span>
                    <h2 className={styles.sectionTitle}>2. คู่มือการใช้งานสำหรับนักเรียน (Student Guide)</h2>
                    <p className={styles.sectionDesc}>
                      คำแนะนำทีละขั้นตอนสำหรับนักเรียน ตั้งแต่การลงทะเบียน, ติดตั้งแอป, ฝึกทักษะตามขั้นตอน FINE จนถึงการส่งงานและรับเกียรติบัตร
                    </p>
                  </div>
                  <Link href="/student/dashboard" className={styles.sectionActionBtn}>
                    <span>เปิดพอร์ทัลนักเรียน →</span>
                  </Link>
                </div>

                <div className={styles.topicCardGrid}>
                  {/* 2.1 Registration & App Install */}
                  <div className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <h3 className={styles.topicTitle}>
                        <span className={styles.topicNumber}>2.1</span>
                        <span>การสมัครสมาชิก, เข้าสู่ระบบ และติดตั้งแอปลงมือถือ (PWA)</span>
                      </h3>
                    </div>
                    <div className={styles.topicCardBody}>
                      <ol className={styles.stepList}>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>1</span>
                          <div>
                            <strong>สมัครสมาชิก:</strong> กดปุ่ม &quot;สมัครสมาชิกนักเรียน&quot; กรอกชื่อ-นามสกุลจริงภาษาไทย, อีเมล, รหัสผ่าน (อย่างน้อย 8 ตัวอักษร) และรหัสเชิญห้องเรียน (Invite Code เช่น <code>KRUPIM</code>)
                          </div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>2</span>
                          <div>
                            <strong>ยินยอมนโยบาย PDPA:</strong> กดยอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคลเพื่อเปิดสิทธิ์บันทึกประวัติคะแนนและการออกเกียรติบัตร
                          </div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>3</span>
                          <div>
                            <strong>ติดตั้งลงหน้าจอมือถือ (Add to Home Screen):</strong>
                            <ul style={{ paddingLeft: 18, marginTop: 4 }}>
                              <li><strong>iOS (Safari):</strong> แตะปุ่ม Share (สี่เหลี่ยมลูกศรชี้ขึ้น) → เลื่อนลงเลือก <em>&quot;เพิ่มไปยังหน้าจอหลัก (Add to Home Screen)&quot;</em> → แตะ &quot;เพิ่ม&quot;</li>
                              <li><strong>Android (Chrome):</strong> แตะจุด 3 จุดมุมขวาบน → เลือก <em>&quot;ติดตั้งแอป&quot;</em> หรือ <em>&quot;เพิ่มลงในหน้าจอหลัก&quot;</em></li>
                            </ul>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>

                  {/* 2.2 Bottom Dock Nav */}
                  <div className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <h3 className={styles.topicTitle}>
                        <span className={styles.topicNumber}>2.2</span>
                        <span>การใช้งานแถบเมนูนำทาง (Bottom Dock Navigation)</span>
                      </h3>
                    </div>
                    <div className={styles.topicCardBody}>
                      <p style={{ fontSize: 14, color: '#3b4d43' }}>
                        แถบเมนูด้านล่างออกแบบในสไตล์ Horizontal Compact Capsule ช่วยให้นำทางได้อย่างรวดเร็ว:
                      </p>
                      <div className={styles.docTableWrap}>
                        <table className={styles.docTable}>
                          <thead>
                            <tr>
                              <th>ปุ่มเมนู</th>
                              <th>ตัวย่อ</th>
                              <th>หน้าที่และการทำงาน</th>
                              <th>URL ภายใน</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><strong>🏠 หน้าหลัก</strong></td>
                              <td>H</td>
                              <td>สรุปกิจกรรมประจำสัปดาห์, การบ้านล่าสุด, สถิติเหรียญรางวัล</td>
                              <td><code>/student/dashboard</code></td>
                            </tr>
                            <tr>
                              <td><strong>🔍 F · Explore</strong></td>
                              <td>F</td>
                              <td>สำรวจคำศัพท์, หมุนดูโมเดล 3D แบบ 360°, สแกนวัตถุ AI Scan</td>
                              <td><code>/student/explore</code></td>
                            </tr>
                            <tr>
                              <td><strong>💬 I · Speak</strong></td>
                              <td>I</td>
                              <td>ห้องฝึกสนทนาเสียงภาษาอังกฤษสดกับ AI Voice Coach</td>
                              <td><code>/student/interact</code></td>
                            </tr>
                            <tr>
                              <td><strong>📦 N · Scenario</strong></td>
                              <td>N</td>
                              <td>สถานการณ์จำลอง 3 มิติ แก้ไขปัญหาเฉพาะหน้างานบริการ</td>
                              <td><code>/student/navigate</code></td>
                            </tr>
                            <tr>
                              <td><strong>📋 E · Exhibit</strong></td>
                              <td>E</td>
                              <td>ทำแบบทดสอบ Exit Ticket, ประเมินตนเอง, ส่งการบ้านให้ครู</td>
                              <td><code>/student/exhibit</code></td>
                            </tr>
                            <tr>
                              <td><strong>👤 Portfolio</strong></td>
                              <td>P</td>
                              <td>แฟ้มสะสมงาน, กราฟสมรรถนะ KSA-C, ใบประกาศนียบัตร และการจัดการโปรไฟล์</td>
                              <td><code>/student/profile</code></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* 2.3 Learning Steps Details */}
                  <div className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <h3 className={styles.topicTitle}>
                        <span className={styles.topicNumber}>2.3</span>
                        <span>เคล็ดลับการฝึกฝนและส่งงานให้ได้คะแนนระดับดีเยี่ยม</span>
                      </h3>
                    </div>
                    <div className={styles.topicCardBody}>
                      <ul className={styles.stepList}>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>★</span>
                          <div>
                            <strong>ขั้น F (Explore):</strong> แตะที่โมเดล 3D เพื่อฟังเสียงการออกเสียงของเจ้าของภาษา และกดปุ่ม &quot;AI Scan&quot; เพื่อทดลองสแกนอุปกรณ์จริงในชีวิตประจำวัน
                          </div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>★</span>
                          <div>
                            <strong>ขั้น I (Speak):</strong> สวมหูฟังเพื่อเสียงที่คมชัด แตะไอคอนไมโครโฟนแล้วพูดภาษาอังกฤษชัดเจน ระบบจะแปลงเสียงเป็นข้อความและตอบกลับทันที
                          </div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>★</span>
                          <div>
                            <strong>ขั้น N (Scenario):</strong> อ่านสถานการณ์ของลูกค้าให้รอบคอบ เลือกตอบคำตอบที่แสดงถึง Service Mind และความช่วยเหลืออย่างมืออาชีพ
                          </div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>★</span>
                          <div>
                            <strong>ขั้น E (Exhibit):</strong> เมื่อทำ Quiz จบแล้ว ให้ตรวจสอบคะแนนและกดปุ่ม &quot;ส่งผลคะแนนเป็นการบ้าน&quot; เพื่อบันทึกเข้าสู่ระบบตรวจของครูทันที
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 3: TEACHER MANUAL */}
            {isVisible('TEACHER', ['ครู', 'teacher', 'ห้องเรียน', 'เชิญ', 'แผนการสอน', 'ตรวจงาน', 'rubric', 'token', 'เกียรติบัตร']) && (
              <section id="teacher-manual" className={styles.docSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionCategory}>Chapter 03 · Teacher Manual</span>
                    <h2 className={styles.sectionTitle}>3. คู่มือการใช้งานสำหรับครูผู้สอน (Teacher Guide)</h2>
                    <p className={styles.sectionDesc}>
                      แนวทางการจัดการชั้นเรียน, ออกแบบแผนการสอน FINE Model, มอบหมายงานประจำสัปดาห์, ตรวจประเมินแบบ Rubric และออกใบประกาศนียบัตร
                    </p>
                  </div>
                  <Link href="/teacher/dashboard" className={styles.sectionActionBtn}>
                    <span>เปิดห้องพักครู (Teacher Console) →</span>
                  </Link>
                </div>

                <div className={styles.topicCardGrid}>
                  {/* 3.1 Class Management */}
                  <div className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <h3 className={styles.topicTitle}>
                        <span className={styles.topicNumber}>3.1</span>
                        <span>การสร้างห้องเรียน & การแจกรหัสเชิญ (Invite Code)</span>
                      </h3>
                    </div>
                    <div className={styles.topicCardBody}>
                      <ol className={styles.stepList}>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>1</span>
                          <div>เข้าสู่เมนู <strong>&quot;ห้องเรียนทั้งหมด&quot;</strong> (<code>/teacher/classes</code>) แล้วกดปุ่ม <code>+ สร้างห้องเรียนใหม่</code></div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>2</span>
                          <div>กำหนดชื่อห้องเรียน เช่น <em>&quot;ปวช.1 สาขาวิชาการโรงแรม (กลุ่ม 1)&quot;</em>, ภาคเรียน, ปีการศึกษา และระดับชั้น</div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>3</span>
                          <div>ระบบจะสร้าง <strong>รหัสเชิญ (Classroom Invite Code)</strong> อัตโนมัติ คุณครูสามารถคัดลอกรหัสนี้ให้นักเรียนใช้กรอกตอนสมัครเพื่อเข้าห้องเรียนทันที</div>
                        </li>
                      </ol>
                    </div>
                  </div>

                  {/* 3.2 Weekly Assignments */}
                  <div className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <h3 className={styles.topicTitle}>
                        <span className={styles.topicNumber}>3.2</span>
                        <span>การมอบหมายบทเรียนประจำสัปดาห์ (Assignment Management)</span>
                      </h3>
                    </div>
                    <div className={styles.topicCardBody}>
                      <div className={styles.noteBox}>
                        <span>📌</span>
                        <div>
                          <strong>เฉพาะบทบาทครู:</strong> หน้าจัดการบทเรียนประจำสัปดาห์ (<code>/teacher/assignments</code>) 
                          ถูกสงวนไว้ให้ครูผู้สอนเป็นผู้ควบคุมการมอบหมายงานแก่นักเรียน โดยมีฟิลด์ความปลอดภัย <code>is_published</code> และ <code>available_from</code> ควบคุมการเปิด-ปิดบทเรียน
                        </div>
                      </div>

                      <ol className={styles.stepList}>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>1</span>
                          <div>เลือกเมนู <strong>&quot;บทเรียนประจำสัปดาห์&quot;</strong> แล้วกด <code>+ สร้างการเรียนรู้</code></div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>2</span>
                          <div>เลือกขั้นตอน FINE ที่ต้องการมอบหมาย (Familiarize, Interact, Navigate, หรือ Exhibit)</div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>3</span>
                          <div>เลือกห้องเรียนเป้าหมาย, กำหนดวันและเวลาเปิดให้เริ่มทำ, วันครบกำหนดส่ง (Due Date) และคะแนนเต็ม</div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>4</span>
                          <div>ตั้งสถานะเป็น <strong>&quot;เปิดใช้งาน (Published)&quot;</strong> บทเรียนจะปรากฏบนหน้า Dashboard ของนักเรียนห้องนั้นโดยอัตโนมัติ</div>
                        </li>
                      </ol>
                    </div>
                  </div>

                  {/* 3.3 Grading & KSA-C */}
                  <div className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <h3 className={styles.topicTitle}>
                        <span className={styles.topicNumber}>3.3</span>
                        <span>การตรวจชิ้นงาน & ประเมินผล KSA-C รายบุคคล</span>
                      </h3>
                    </div>
                    <div className={styles.topicCardBody}>
                      <p style={{ fontSize: 14, color: '#3b4d43' }}>
                        เมื่อนักเรียนส่งชิ้นงานเข้ามา ครูสามารถคลิกไอคอน <strong>&quot;รายงานการส่งงาน&quot;</strong> เพื่อตรวจประเมิน:
                      </p>
                      <ul className={styles.stepList}>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>✓</span>
                          <div>ตรวจสอบคะแนน Quiz และคำตอบการแก้ไขสถานการณ์จำลองของนักเรียน</div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>✓</span>
                          <div>ปรับเพิ่ม-ลดคะแนนสมรรถนะ KSA-C ตามเกณฑ์ Rubric พร้อมพิมพ์ข้อเสนอแนะเชิงสร้างสรรค์ (Constructive Feedback)</div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>✓</span>
                          <div>เมื่อกดบันทึก ผลคะแนนจะอัปเดตไปยังแฟ้มสะสมงาน E-Portfolio ของนักเรียนแบบทันที</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 4: ADMIN MANUAL */}
            {isVisible('ADMIN', ['แอดมิน', 'admin', 'telemetry', 'postgresql', 'ram', 'token', 'ผู้ดูแลระบบ', 'สิทธิ์', 'ความปลอดภัย']) && (
              <section id="admin-manual" className={styles.docSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionCategory}>Chapter 04 · Administrator Manual</span>
                    <h2 className={styles.sectionTitle}>4. คู่มือการใช้งานสำหรับผู้ดูแลระบบ (Admin Guide)</h2>
                    <p className={styles.sectionDesc}>
                      การควบคุมโครงสร้างพื้นฐาน, มอนิเตอร์สุขภาพเซิร์ฟเวอร์แบบ Real-time Telemetry, กำกับดูแลผู้ใช้งาน, โมเดล 3D และความปลอดภัยของระบบ
                    </p>
                  </div>
                  <Link href="/admin/dashboard" className={styles.sectionActionBtn}>
                    <span>เปิดคอนโซลผู้ดูแลระบบ →</span>
                  </Link>
                </div>

                <div className={styles.topicCardGrid}>
                  {/* 4.1 Real-time Telemetry */}
                  <div className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <h3 className={styles.topicTitle}>
                        <span className={styles.topicNumber}>4.1</span>
                        <span>แดชบอร์ดสถานะระบบ & เรียลไทม์ (Live Telemetry Dashboard)</span>
                      </h3>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#196f3d' }}>● Live Monitoring</span>
                    </div>
                    <div className={styles.topicCardBody}>
                      <p style={{ fontSize: 14, color: '#3b4d43' }}>
                        Admin Console มีแถบ <strong>&quot;⚡ สถานะระบบ & เรียลไทม์ (Live Telemetry)&quot;</strong> 
                        ที่ดึงข้อมูลสดจาก API <code>/api/admin/system-health</code> ทุก 10 วินาที โดยไม่กระทบการทำงานของผู้ใช้งาน:
                      </p>

                      <div className={styles.docTableWrap}>
                        <table className={styles.docTable}>
                          <thead>
                            <tr>
                              <th>มาตรวัด (Metric)</th>
                              <th>แหล่งข้อมูล / รายละเอียด</th>
                              <th>เกณฑ์ปกติ (Normal Threshold)</th>
                              <th>การรับมือเมื่อผิดปกติ</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><strong>Server RAM & Memory</strong></td>
                              <td>Node.js <code>process.memoryUsage()</code> (RSS, Heap Used, Total)</td>
                              <td>น้อยกว่า 85% ของหน่วยความจำระบบ</td>
                              <td>ตรวจสอบ Memory Leak หรือรีสตาร์ต Worker Instance</td>
                            </tr>
                            <tr>
                              <td><strong>Database Health</strong></td>
                              <td>PostgreSQL Database Size (14 MB), Query Latency, Active Pool</td>
                              <td>Latency &lt; 250ms, Size ขยายตัวตามงาน</td>
                              <td>ทำ Vacuume/Re-index หรือเพิ่ม Connection Pool Limit</td>
                            </tr>
                            <tr>
                              <td><strong>AI Token Consumption</strong></td>
                              <td>ปริมาณการเรียกใช้ Gemini API / Tripo3D API รายวัน</td>
                              <td>อยู่ภายใน Budget รายเดือนของสถาบัน</td>
                              <td>ตรวจสอบคำขอ Token ที่ค้าง หรือปรับ Limit รายห้อง</td>
                            </tr>
                            <tr>
                              <td><strong>Peak Traffic Analysis</strong></td>
                              <td>สถิติการส่งงานและเข้าเรียนรายชั่วโมง (08:00 - 17:00 น.)</td>
                              <td>กระจายตัวสม่ำเสมอในคาบเรียน</td>
                              <td>เตรียม Bandwidth รองรับช่วงส่งงานท้ายคาบ</td>
                            </tr>
                            <tr>
                              <td><strong>Security & Audit Logs</strong></td>
                              <td>ประวัติการเข้าสู่ระบบ, การสลับสิทธิ์ (Impersonate), การลบข้อมูล</td>
                              <td>ไม่มี Failed Login ผิดปกติ</td>
                              <td>ตรวจสอบ IP แปลกปลอมและระงับบัญชีต้องสงสัย</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* 4.2 User Management */}
                  <div className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <h3 className={styles.topicTitle}>
                        <span className={styles.topicNumber}>4.2</span>
                        <span>การจัดการบัญชีผู้ใช้และสิทธิ์ (User & Access Control)</span>
                      </h3>
                    </div>
                    <div className={styles.topicCardBody}>
                      <ol className={styles.stepList}>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>1</span>
                          <div>
                            <strong>เปลี่ยนบทบาท (Role Promotion):</strong> ปรับสถานะผู้ใช้จาก Student เป็น Teacher หรือ Administrator ผ่านหน้า <code>/admin/users</code>
                          </div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>2</span>
                          <div>
                            <strong>ระงับบัญชี (Suspend/Activate):</strong> ปิดกั้นการเข้าใช้งานกรณีพบพฤติกรรมผิดนโยบาย โดยข้อมูลผลการเรียนจะยังคงปลอดภัยในฐานข้อมูล
                          </div>
                        </li>
                        <li className={styles.stepItem}>
                          <span className={styles.stepBadge}>3</span>
                          <div>
                            <strong>รีเซ็ตรหัสผ่าน:</strong> สร้างรหัสผ่านชั่วคราวให้นักเรียนหรือครูที่ลืมรหัสผ่านและไม่สามารถเข้าอีเมลได้
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 5: PERMISSIONS MATRIX */}
            {isVisible('PERMISSIONS', ['สิทธิ์', 'permissions', 'matrix', 'ตาราง', 'guest', 'student', 'teacher', 'admin', 'บทบาท']) && (
              <section id="permissions-matrix" className={styles.docSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionCategory}>Chapter 05 · Security & Authorization</span>
                    <h2 className={styles.sectionTitle}>5. เมทริกซ์สิทธิ์การใช้งาน (Permissions Matrix)</h2>
                    <p className={styles.sectionDesc}>
                      ตารางเปรียบเทียบสิทธิ์การเข้าถึงและการจัดการฟังก์ชันต่าง ๆ ในระบบของแต่ละบทบาทอย่างละเอียด
                    </p>
                  </div>
                </div>

                <div className={styles.docTableWrap}>
                  <table className={styles.docTable}>
                    <thead>
                      <tr>
                        <th>โมดูล / ฟังก์ชันระบบ</th>
                        <th style={{ textAlign: 'center' }}>ผู้เยี่ยมชม (Guest)</th>
                        <th style={{ textAlign: 'center' }}>นักเรียน (Student)</th>
                        <th style={{ textAlign: 'center' }}>ครูผู้สอน (Teacher)</th>
                        <th style={{ textAlign: 'center' }}>ผู้ดูแลระบบ (Admin)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>ดูหน้าแรก Landing Page & คู่มือ</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ใช้งานได้</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ใช้งานได้</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ใช้งานได้</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ใช้งานได้</span></td>
                      </tr>
                      <tr>
                        <td><strong>ดูคลังโมเดล 3D & เล่น AR พื้นฐาน</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permPartial}>◯ พรีวิวบางส่วน</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ เต็มรูปแบบ</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ เต็มรูปแบบ</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ เต็มรูปแบบ</span></td>
                      </tr>
                      <tr>
                        <td><strong>ใช้งาน AI Voice Coach & AI Scan</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ต้องล็อกอิน</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ สิทธิ์ตามโควตา</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ สิทธิ์ทดสอบสอน</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ สิทธิ์ทดสอบระบบ</span></td>
                      </tr>
                      <tr>
                        <td><strong>ทำแบบทดสอบ Exit Ticket & ส่งงาน</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ส่งงานห้องตนเอง</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                      </tr>
                      <tr>
                        <td><strong>เข้าถึง E-Portfolio & เกียรติบัตรตนเอง</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ดู/ดาวน์โหลดได้</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permPartial}>◯ ดูของนักเรียนในห้อง</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ดูได้ทั้งระบบ</span></td>
                      </tr>
                      <tr>
                        <td><strong>ตรวจสอบรหัสเกียรติบัตร (/verify)</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ สาธารณะ</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ สาธารณะ</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ สาธารณะ</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ สาธารณะ</span></td>
                      </tr>
                      <tr>
                        <td><strong>สร้างห้องเรียน & มอบหมายบทเรียน</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ห้องที่ตนรับผิดชอบ</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ กำกับได้ทุกห้อง</span></td>
                      </tr>
                      <tr>
                        <td><strong>ตรวจงาน & ให้คะแนน Rubric KSA-C</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ตรวจและให้ข้อคิดเห็น</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permPartial}>◯ ดูภาพรวม</span></td>
                      </tr>
                      <tr>
                        <td><strong>ขอเพิ่มโควตา AI Token</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ยื่นคำขอได้</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ ผู้อนุมัติคำขอ</span></td>
                      </tr>
                      <tr>
                        <td><strong>ดู Live Telemetry & ข้อมูลเซิร์ฟเวอร์</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ สิทธิ์เต็ม Admin</span></td>
                      </tr>
                      <tr>
                        <td><strong>จัดการผู้ใช้งาน & เปลี่ยนบทบาท</strong></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permNo}>✕ ไม่มีสิทธิ์</span></td>
                        <td style={{ textAlign: 'center' }}><span className={styles.permYes}>✓ สิทธิ์เต็ม Admin</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* SECTION 6: FAQ & TROUBLESHOOTING */}
            {isVisible('FAQ', ['faq', 'ปัญหา', 'ไมค์', 'กล้อง', 'ลืมรหัสผ่าน', 'offline', 'ฐานข้อมูล', 'help']) && (
              <section id="faq-section" className={styles.docSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionCategory}>Chapter 06 · Support & Troubleshooting</span>
                    <h2 className={styles.sectionTitle}>6. คำถามที่พบบ่อย & การแก้ไขปัญหา (FAQs)</h2>
                    <p className={styles.sectionDesc}>
                      รวบรวมแนวทางแก้ไขข้อขัดข้องทางเทคนิคที่พบบ่อยในการใช้งานระบบ
                    </p>
                  </div>
                </div>

                <div className={styles.faqCard}>
                  <button type="button" className={styles.faqQuestion} onClick={() => toggleFaq(1)}>
                    <span>Q1: ใช้งาน AI Voice Coach แล้วระบบไม่ได้ยินเสียงพูด หรือมีข้อความแจ้งเตือนไมโครโฟน</span>
                    <span>{expandedFaq === 1 ? '▲' : '▼'}</span>
                  </button>
                  {expandedFaq === 1 && (
                    <div className={styles.faqAnswer}>
                      <strong>แนวทางแก้ไข:</strong>
                      <ol style={{ paddingLeft: 18, marginTop: 6 }}>
                        <li>ตรวจสอบว่าเบราว์เซอร์ได้รับอนุญาตให้เข้าถึงไมโครโฟนหรือไม่ (สังเกตไอคอนแม่กุญแจที่แถบ URL → สิทธิ์อนุญาต → ไมโครโฟน = อนุญาต)</li>
                        <li>หากใช้บน iOS ให้เปิดผ่าน Safari แทนเบราว์เซอร์อื่น และตรวจสอบว่าไม่ได้เปิดโหมดประหยัดพลังงานระดับสูง</li>
                        <li>แนะนำให้สวมหูฟังสมอลทอล์กเพื่อลดเสียงสะท้อนจากลำโพง</li>
                      </ol>
                    </div>
                  )}
                </div>

                <div className={styles.faqCard}>
                  <button type="button" className={styles.faqQuestion} onClick={() => toggleFaq(2)}>
                    <span>Q2: กล้องไม่เปิดเมื่อกดใช้งาน AI Scan หรือ AR 3D View</span>
                    <span>{expandedFaq === 2 ? '▲' : '▼'}</span>
                  </button>
                  {expandedFaq === 2 && (
                    <div className={styles.faqAnswer}>
                      <strong>แนวทางแก้ไข:</strong>
                      <ol style={{ paddingLeft: 18, marginTop: 6 }}>
                        <li>เบราว์เซอร์ต้องทำงานผ่านโปรโตคอลความปลอดภัย HTTPS หรือ Localhost เท่านั้น</li>
                        <li>ปิดแอปพลิเคชันอื่นที่อาจกำลังใช้งานกล้องอยู่ (เช่น Zoom, Line, Camera) แล้วรีเฟรชหน้าเว็บอีกครั้ง</li>
                        <li>สำหรับอุปกรณ์ที่ไม่รองรับ WebXR ระบบจะแสดงผลเป็นโมเดล 3D แบบ 360 องศาบนหน้าจอให้โดยอัตโนมัติ</li>
                      </ol>
                    </div>
                  )}
                </div>

                <div className={styles.faqCard}>
                  <button type="button" className={styles.faqQuestion} onClick={() => toggleFaq(3)}>
                    <span>Q3: นักเรียนไม่พบชื่อห้องเรียน หรือกรอกรหัสเชิญไม่สำเร็จ</span>
                    <span>{expandedFaq === 3 ? '▲' : '▼'}</span>
                  </button>
                  {expandedFaq === 3 && (
                    <div className={styles.faqAnswer}>
                      <strong>แนวทางแก้ไข:</strong> ตรวจสอบว่าครูผู้สอนได้สร้างห้องเรียนและเปิดใช้งานรหัสเชิญแล้วหรือไม่ รหัสเชิญเป็นตัวพิมพ์ใหญ่ เช่น <code>KRUPIM</code> หากยังไม่พบ สามารถให้ครูเพิ่มนักเรียนเข้าห้องเรียนจาก Teacher Console โดยตรงได้
                    </div>
                  )}
                </div>

                <div className={styles.faqCard}>
                  <button type="button" className={styles.faqQuestion} onClick={() => toggleFaq(4)}>
                    <span>Q4: ข้อมูลคะแนนและเกียรติบัตรปลอดภัยหรือไม่? มีการสำรองข้อมูลอย่างไร?</span>
                    <span>{expandedFaq === 4 ? '▲' : '▼'}</span>
                  </button>
                  {expandedFaq === 4 && (
                    <div className={styles.faqAnswer}>
                      <strong>คำตอบ:</strong> ข้อมูลทั้งหมดถูกจัดเก็บลงฐานข้อมูล PostgreSQL พร้อมระบบสำรองข้อมูลอัตโนมัติ (Automated Database Backup) ตามมาตรฐาน PDPA โดยเกียรติบัตรทุกใบจะมีการออก Verification Code สากลที่ไม่ซ้ำกัน สามารถตรวจสอบย้อนหลังได้ตลอดเวลา
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Document Footer */}
            <footer className={styles.docFooter}>
              <div>
                <strong>FINE MODEL · AR 3D+AI Scan</strong> — นวัตกรรมการจัดการเรียนรู้ภาษาอังกฤษเพื่องานบริการ โดย นางสาวอนัญญา วิชัยผิน แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  เวอร์ชันเอกสาร: 2.4.0 (อัปเดตล่าสุด: พฤศจิกายน 2569) · ครอบคลุมทุกบทบาทและฟังก์ชัน
                </div>
              </div>
              <div className={styles.docFooterLinks}>
                <Link href="/" className={styles.docFooterLink}>หน้าแรก</Link>
                <Link href="/role-select" className={styles.docFooterLink}>เลือกบทบาท</Link>
                <Link href="/student/dashboard" className={styles.docFooterLink}>นักเรียน</Link>
                <Link href="/teacher/dashboard" className={styles.docFooterLink}>ครู</Link>
                <Link href="/admin/dashboard" className={styles.docFooterLink}>ผู้ดูแลระบบ</Link>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  )
}

