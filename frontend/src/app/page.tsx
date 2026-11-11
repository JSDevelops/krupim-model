import Image from 'next/image'
import Link from 'next/link'
import styles from './landing.module.css'

export const metadata = {
  title: 'FINE MODEL AR AI 3D — นวัตกรรมการจัดการเรียนรู้ภาษาอังกฤษเพื่องานบริการ',
  description: 'แพลตฟอร์มการจัดการเรียนรู้ภาษาอังกฤษเพื่องานบริการด้วยโมเดล FINE ผสานเทคโนโลยีเสมือนจริง AR 3D และปัญญาประดิษฐ์ AI สำหรับนักเรียน ครูผู้สอน และผู้ดูแลระบบ',
}

export default function HomePage() {
  return (
    <div className={styles.landingPage}>
      {/* Background Ambience */}
      <div className={styles.landingBgDecor} aria-hidden="true" />

      {/* Header & Navbar */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.navWrap}>
            <Link href="/" className={styles.brand} aria-label="FINE MODEL หน้าแรก">
              <Image
                src="/logo.png"
                alt="FINE MODEL Logo"
                width={44}
                height={44}
                className={styles.brandLogo}
                priority
              />
              <div className={styles.brandText}>
                <span className={styles.brandTitle}>FINE MODEL</span>
                <span className={styles.brandSubtitle}>AR AI 3D · งานครูพิมพ์</span>
              </div>
            </Link>

            <nav className={styles.navLinks} aria-label="เมนูหลัก">
              <a href="#fine-model" className={styles.navLink}>กระบวนการ FINE</a>
              <a href="#user-roles" className={styles.navLink}>3 บทบาทผู้ใช้งาน</a>
              <a href="#showcase" className={styles.navLink}>สื่อการสอน 3D</a>
              <Link href="/docs" className={styles.navLink}>คู่มือ & สิทธิ์</Link>
            </nav>

            <div className={styles.navActions}>
              <Link href="/role-select" className={styles.signInBtn}>
                <span>เข้าสู่ระบบ</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className={styles.hero} aria-label="บทนำโครงการ">
          <div className={styles.container}>
            <div className={styles.heroBadge}>
              <span>✨ นวัตกรรมการจัดการเรียนรู้ภาษาอังกฤษเพื่องานบริการ</span>
            </div>

            <h1 className={styles.heroTitle}>
              ยกระดับทักษะงานบริการด้วย <br />
              <span className={styles.heroHighlight}>FINE MODEL · AR 3D · AI</span>
            </h1>

            <p className={styles.heroDesc}>
              แพลตฟอร์มการเรียนรู้ยุคใหม่ที่บูรณาการกระบวนการ FINE เข้ากับสื่อเสมือนจริง AR 3D 
              และปัญญาประดิษฐ์ AI เพื่อพัฒนาสมรรถนะการสื่อสารและการบริการอย่างมืออาชีพ 
              พร้อมระบบประเมินผล KSA-C และแฟ้มสะสมงาน E-Portfolio ดิจิทัล
            </p>

            <div className={styles.heroCtaGroup}>
              <Link href="/register-student" className={styles.secondaryCta}>
                <span>🎒 สมัครสมาชิกนักเรียน</span>
              </Link>
              <Link href="/register-teacher" className={styles.secondaryCta}>
                <span>👨‍🏫 สมัครสมาชิกครู</span>
              </Link>
            </div>

            {/* 4 Feature Badges */}
            <div className={styles.pillGrid}>
              <div className={styles.pillItem}>
                <span aria-hidden="true">📦</span>
                <span>สื่อสามมิติ AR 3D เสมือนจริง</span>
              </div>
              <div className={styles.pillItem}>
                <span aria-hidden="true">🤖</span>
                <span>AI Scan & AI Voice ฝึกพูดโต้ตอบ</span>
              </div>
              <div className={styles.pillItem}>
                <span aria-hidden="true">📊</span>
                <span>วัดผลสมรรถนะ KSA-C รายบุคคล</span>
              </div>
              <div className={styles.pillItem}>
                <span aria-hidden="true">🏆</span>
                <span>เกียรติบัตร E-Portfolio พร้อมรหัสตรวจ</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: FINE MODEL 4 STEPS */}
        <section id="fine-model" className={styles.fineSection} aria-label="กระบวนการเรียนรู้ FINE Model">
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <div className={styles.sectionEyebrow}>LEARNING FRAMEWORK</div>
              <h2 className={styles.sectionTitle}>กระบวนการเรียนรู้ FINE MODEL</h2>
              <p className={styles.sectionDesc}>
                4 ขั้นตอนการเรียนรู้ที่ถูกออกแบบขึ้นอย่างเป็นระบบ เพื่อสร้างความมั่นใจ 
                และพัฒนาทักษะภาษาอังกฤษเพื่องานบริการจากพื้นฐานสู่การลงมือปฏิบัติจริง
              </p>
            </header>

            <div className={styles.fineGrid}>
              {/* Step 1: F */}
              <article className={styles.fineCard}>
                <div className={styles.fineCardLetter}>
                  <span>F</span>
                  <span className={styles.fineStepChip}>ขั้นที่ 1</span>
                </div>
                <h3 className={styles.fineCardTitle}>F · Familiarize (สำรวจ &amp; ค้นหา)</h3>
                <p className={styles.fineCardDesc}>
                  สร้างความคุ้นเคยกับคำศัพท์ เมนูอาหาร และอุปกรณ์งานบริการ ผ่านโมเดล AR 3D 
                  และฟังก์ชัน AI Scan สแกนคำศัพท์จากภาพเพื่อเรียนรู้การออกเสียงที่ถูกต้อง
                </p>
                <ul className={styles.fineCardFeatures}>
                  <li><span>✓</span> สำรวจโมเดล 3D หมุนและซูม 360 องศา</li>
                  <li><span>✓</span> สแกนภาพตรวจจับคำศัพท์ด้วย AI Vision</li>
                  <li><span>✓</span> คลังคำศัพท์และเสียงอ่านมาตรฐานสากล</li>
                </ul>
              </article>

              {/* Step 2: I */}
              <article className={styles.fineCard}>
                <div className={styles.fineCardLetter}>
                  <span>I</span>
                  <span className={styles.fineStepChip}>ขั้นที่ 2</span>
                </div>
                <h3 className={styles.fineCardTitle}>I · Interact (สนทนา &amp; สื่อสาร)</h3>
                <p className={styles.fineCardDesc}>
                  ฝึกพูดและสนทนาภาษาอังกฤษกับ AI Voice Assistant ในบรรยากาศการบริการเสมือนจริง 
                  จำลองการทักทาย ต้อนรับ แนะนำรายการอาหาร และรับออเดอร์
                </p>
                <ul className={styles.fineCardFeatures}>
                  <li><span>✓</span> สนทนาเสียงโต้ตอบกับ AI ภาษาอังกฤษ</li>
                  <li><span>✓</span> วิเคราะห์สำเนียงและให้คำแนะนำแบบสดๆ</li>
                  <li><span>✓</span> รูปประโยคการบริการตามมาตรฐานวิชาชีพ</li>
                </ul>
              </article>

              {/* Step 3: N */}
              <article className={styles.fineCard}>
                <div className={styles.fineCardLetter}>
                  <span>N</span>
                  <span className={styles.fineStepChip}>ขั้นที่ 3</span>
                </div>
                <h3 className={styles.fineCardTitle}>N · Navigate (จำลอง &amp; แก้ปัญหา)</h3>
                <p className={styles.fineCardDesc}>
                  เผชิญสถานการณ์จำลอง (Scenario Simulation) ที่ซับซ้อนขึ้น ฝึกการตัดสินใจ 
                  การรับมือข้อร้องเรียน และการแก้ไขปัญหาเฉพาะหน้าในงานบริการด้วย Service Mind
                </p>
                <ul className={styles.fineCardFeatures}>
                  <li><span>✓</span> สถานการณ์จำลองแบบแตกกิ่ง (Branching)</li>
                  <li><span>✓</span> วัดไหวพริบและการบริการลูกค้าเฉพาะหน้า</li>
                  <li><span>✓</span> คะแนนตัดสินใจตามมาตรฐานโรงแรมสากล</li>
                </ul>
              </article>

              {/* Step 4: E */}
              <article className={styles.fineCard}>
                <div className={styles.fineCardLetter}>
                  <span>E</span>
                  <span className={styles.fineStepChip}>ขั้นที่ 4</span>
                </div>
                <h3 className={styles.fineCardTitle}>E · Exhibit (สรุป &amp; แสดงผลสัมฤทธิ์)</h3>
                <p className={styles.fineCardDesc}>
                  ประเมินผลสมรรถนะครบ 4 มิติ (K-S-A-C) ส่งงานและรับผลสะท้อนกลับจากครู 
                  พร้อมรับใบประกาศนียบัตรดิจิทัลและแฟ้มสะสมงาน E-Portfolio เพื่อใช้ศึกษาต่อหรือสมัครงาน
                </p>
                <ul className={styles.fineCardFeatures}>
                  <li><span>✓</span> ประเมิน KSA-C (ความรู้, ทักษะ, เจตคติ, สมรรถนะ)</li>
                  <li><span>✓</span> ดาวน์โหลด FINE E-Portfolio ดิจิทัล (PDF)</li>
                  <li><span>✓</span> ใบประกาศนียบัตรพร้อมระบบตรวจรหัสออนไลน์</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* SECTION 2: 3 USER ROLES */}
        <section id="user-roles" className={styles.rolesSection} aria-label="3 บทบาทผู้ใช้งานในระบบ">
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <div className={styles.sectionEyebrow}>USER ROLES &amp; ECOSYSTEM</div>
              <h2 className={styles.sectionTitle}>ออกแบบมาเพื่อทุกบทบาทในสถานศึกษา</h2>
              <p className={styles.sectionDesc}>
                ระบบมีการแบ่งสิทธิ์การทำงานอย่างรัดกุม ตอบโจทย์ผู้ใช้งานทุกระดับได้อย่างมีประสิทธิภาพ
              </p>
            </header>

            <div className={styles.rolesGrid}>
              {/* Role 1: Student */}
              <article className={styles.roleCard}>
                <div className={styles.roleHeader}>
                  <div className={styles.roleIconBox} aria-hidden="true">🎒</div>
                  <div className={styles.roleHeaderCopy}>
                    <h3>นักเรียน / นักศึกษา</h3>
                    <span>STUDENT PORTAL</span>
                  </div>
                </div>
                <p className={styles.roleDesc}>
                  พื้นที่การเรียนรู้ส่วนบุคคล เข้าถึงบทเรียน 3D ทำกิจกรรมโต้ตอบ ส่งงาน และสะสมคะแนนสมรรถนะ
                </p>
                <ul className={styles.roleList}>
                  <li><span>•</span> เรียนรู้บทเรียน AR 3D และสแกนคำศัพท์ด้วย AI Scan</li>
                  <li><span>•</span> ฝึกพูดกับ AI Voice Assistant ในสถานการณ์บริการจริง</li>
                  <li><span>•</span> ตรวจสอบการบ้าน ส่งงาน และดูคะแนนประเมิน KSA-C</li>
                  <li><span>•</span> รับกระดิ่งแจ้งเตือนข่าวสาร และโหลดใบรับรอง E-Portfolio</li>
                </ul>
                <Link href="/role-select" className={styles.roleButton}>
                  เข้าสู่ระบบนักเรียน →
                </Link>
              </article>

              {/* Role 2: Teacher */}
              <article className={styles.roleCard}>
                <div className={styles.roleHeader}>
                  <div className={styles.roleIconBox} aria-hidden="true">👨‍🏫</div>
                  <div className={styles.roleHeaderCopy}>
                    <h3>ครูผู้สอน</h3>
                    <span>TEACHER CONSOLE</span>
                  </div>
                </div>
                <p className={styles.roleDesc}>
                  ระบบบริหารการจัดการเรียนรู้ จัดการชั้นเรียน มอบหมายงาน ตรวจประเมิน และควบคุมแผนการสอน
                </p>
                <ul className={styles.roleList}>
                  <li><span>•</span> แผนการสอน FINE Model ครบทั้ง 18 สัปดาห์ พร้อมสื่อการสอน</li>
                  <li><span>•</span> จัดการห้องเรียน เชิญนักเรียน และดูแลทะเบียนชั้นเรียน</li>
                  <li><span>•</span> มอบหมายงาน ตรวจการบ้าน และให้คะแนนสมรรถนะ KSA-C</li>
                  <li><span>•</span> เขียนประกาศแจ้งเตือนเฉพาะกลุ่ม และมี AI ช่วยร่างเนื้อหา</li>
                </ul>
                <Link href="/role-select" className={styles.roleButton}>
                  เข้าสู่ระบบครูผู้สอน →
                </Link>
              </article>

              {/* Role 3: Administrator */}
              <article className={styles.roleCard}>
                <div className={styles.roleHeader}>
                  <div className={styles.roleIconBox} aria-hidden="true">🏛️</div>
                  <div className={styles.roleHeaderCopy}>
                    <h3>ผู้ดูแลระบบ</h3>
                    <span>ADMIN CONSOLE</span>
                  </div>
                </div>
                <p className={styles.roleDesc}>
                  ศูนย์ควบคุมความปลอดภัยและภาพรวมระบบ มอนิเตอร์ทรัพยากร และกำกับดูแลสิทธิ์การเข้าถึง
                </p>
                <ul className={styles.roleList}>
                  <li><span>•</span> ตรวจสอบและอนุมัติบัญชีครูผู้สอน และจัดการผู้ใช้ทั้งระบบ</li>
                  <li><span>•</span> มอนิเตอร์สุขภาพเซิร์ฟเวอร์, RAM, และความเร็ว DB เรียลไทม์</li>
                  <li><span>•</span> ตรวจสอบการใช้งาน Token AI และอนุมัติคำขอจัดสรรโควต้า</li>
                  <li><span>•</span> ประชาสัมพันธ์ข่าวสาร ประกาศด่วน และตรวจประวัติความปลอดภัย</li>
                </ul>
                <Link href="/role-select" className={styles.roleButton}>
                  เข้าสู่ระบบผู้ดูแลระบบ →
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* SECTION 3: 3D EQUIPMENT SHOWCASE */}
        <section id="showcase" className={styles.showcaseSection} aria-label="สื่อการเรียนรู้ 3 มิติ">
          <div className={styles.container}>
            <header className={styles.sectionHeader}>
              <div className={styles.sectionEyebrow}>INTERACTIVE ASSETS</div>
              <h2 className={styles.sectionTitle}>สื่อจำลอง 3 มิติในงานบริการ</h2>
              <p className={styles.sectionDesc}>
                ตัวอย่างโมเดล 3D อุปกรณ์เครื่องใช้ในงานบริการอาหารและเครื่องดื่มที่นำมาใช้ในบทเรียน
              </p>
            </header>

            <div className={styles.showcaseGrid}>
              <div className={styles.showcaseCard}>
                <Image
                  src="/images/wine_glass_3d.png"
                  alt="Wine Glass 3D"
                  width={110}
                  height={110}
                  className={styles.showcaseImg}
                />
                <h4 className={styles.showcaseTitle}>Wine Glass (แก้วไวน์)</h4>
                <span className={styles.showcaseTag}>Glassware · Beverage</span>
              </div>

              <div className={styles.showcaseCard}>
                <Image
                  src="/images/espresso_cup_3d.png"
                  alt="Espresso Cup 3D"
                  width={110}
                  height={110}
                  className={styles.showcaseImg}
                />
                <h4 className={styles.showcaseTitle}>Espresso Cup (ถ้วยกาแฟ)</h4>
                <span className={styles.showcaseTag}>Chinaware · Coffee</span>
              </div>

              <div className={styles.showcaseCard}>
                <Image
                  src="/images/plate_3d.png"
                  alt="Dinner Plate 3D"
                  width={110}
                  height={110}
                  className={styles.showcaseImg}
                />
                <h4 className={styles.showcaseTitle}>Dinner Plate (จานอาหาร)</h4>
                <span className={styles.showcaseTag}>Chinaware · Dining</span>
              </div>

              <div className={styles.showcaseCard}>
                <Image
                  src="/images/cocktail_shaker_3d.png"
                  alt="Cocktail Shaker 3D"
                  width={110}
                  height={110}
                  className={styles.showcaseImg}
                />
                <h4 className={styles.showcaseTitle}>Cocktail Shaker (เชคเกอร์)</h4>
                <span className={styles.showcaseTag}>Bar Equipment · Mixing</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <h4>FINE MODEL AR AI 3D</h4>
              <p>
                แพลตฟอร์มการจัดการเรียนรู้ภาษาอังกฤษเพื่องานบริการด้วยโมเดล FINE 
                ผสานเทคโนโลยีเสมือนจริง AR 3D และปัญญาประดิษฐ์ AI · นวัตกรรมเพื่อการศึกษาโดย ครูพิมพ์
              </p>
            </div>

            <nav className={styles.footerLinks} aria-label="ลิงก์ท้ายหน้าเว็บ">
              <Link href="/role-select" className={styles.footerLink}>เข้าสู่ระบบ</Link>
              <Link href="/docs" className={styles.footerLink}>คู่มือการใช้งาน & สิทธิ์</Link>
              <Link href="/register-student" className={styles.footerLink}>สมัครนักเรียน</Link>
              <Link href="/register-teacher" className={styles.footerLink}>สมัครครู</Link>
              <Link href="/role-select" className={styles.footerLink}>เลือกบทบาท</Link>
            </nav>
          </div>

          <div className={styles.footerBottom}>
            <span>© 2026 FINE MODEL AR AI 3D (งานครูพิมพ์). All rights reserved.</span>
            <span>🔒 คุ้มครองข้อมูลส่วนบุคคลตามมาตรฐาน PDPA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
