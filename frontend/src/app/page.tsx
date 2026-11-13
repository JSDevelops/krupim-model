import Image from 'next/image'
import Link from 'next/link'
import ActivityGallery from '@/components/landing/ActivityGallery'
import StudentAppSlider from '@/components/landing/StudentAppSlider'
import TeacherConsoleSlider from '@/components/landing/TeacherConsoleSlider'
import ScenarioStepSlider from '@/components/landing/ScenarioStepSlider'
import styles from './landing.module.css'

export const metadata = {
  title: 'FINE MODEL (AR 3D+AI Scan) — นวัตกรรมการจัดการเรียนรู้ภาษาอังกฤษเพื่องานบริการ โดย นางสาวอนัญญา วิชัยผิน',
  description: 'แพลตฟอร์มการจัดการเรียนรู้ภาษาอังกฤษเพื่องานบริการด้วยโมเดล FINE ผสานเทคโนโลยีเสมือนจริง AR 3D และปัญญาประดิษฐ์ AI Scan วิจัยและพัฒนาโดย นางสาวอนัญญา วิชัยผิน แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์',
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
                <span className={styles.brandSubtitle}>AR 3D+AI Scan · ครูพิม</span>
              </div>
            </Link>

            <nav className={styles.navLinks} aria-label="เมนูหลัก">
              <Link href="/" className={styles.navLink}>หน้าแรก</Link>

              {/* เทคโนโลยีอัจฉริยะ Dropdown */}
              <div className={styles.navDropdown}>
                <a href="#pillars" className={styles.navDropdownTrigger}>
                  <span>เทคโนโลยีอัจฉริยะ</span>
                  <svg className={styles.dropdownCaret} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </a>
                <div className={styles.navDropdownMenu}>
                  <a href="#student-app" className={styles.dropdownItem}>
                    <span>แอปพลิเคชันนักเรียน</span>
                  </a>
                  <a href="#teacher-console" className={styles.dropdownItem}>
                    <span>ระบบครูผู้สอน</span>
                  </a>
                </div>
              </div>

              {/* กระบวนการ FINE Dropdown */}
              <div className={styles.navDropdown}>
                <a href="#fine-process" className={styles.navDropdownTrigger}>
                  <span>กระบวนการ FINE</span>
                  <svg className={styles.dropdownCaret} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </a>
                <div className={styles.navDropdownMenu}>
                  <a href="#scenario" className={styles.dropdownItem}>
                    <span>สถานการณ์จำลอง</span>
                  </a>
                  <a href="#ksac" className={styles.dropdownItem}>
                    <span>สมรรถนะ KSA-C</span>
                  </a>
                </div>
              </div>

              <Link href="/docs" className={styles.navLink}>คู่มือการใช้งาน</Link>
              <a href="#instructor" className={styles.navLink}>ครูผู้จัดทำ</a>
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
        {/* =================================================================
            HERO SECTION (Split Layout with Kru Pim as Cover Image)
            ================================================================= */}
        <section className={styles.hero} aria-label="บทนำโครงการ">
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              {/* Left Content */}
              <div className={styles.heroContent}>
                <div className={styles.heroEyebrowBadge}>
                  <span className={styles.heroEyebrowDot} />
                  <span>นวัตกรรมการศึกษา · วิจัยและพัฒนาโดย นางสาวอนัญญา วิชัยผิน · วิทยาลัยเทคนิคกาฬสินธุ์</span>
                </div>

                <h1 className={styles.heroTitle}>
                  ยกระดับทักษะงานบริการด้วย <br />
                  <span className={styles.heroHighlight}>FINE MODEL · AR 3D+AI Scan</span>
                </h1>

                <p className={styles.heroDesc}>
                  แพลตฟอร์มการจัดการเรียนรู้ภาษาอังกฤษเพื่องานบริการอาหารและเครื่องดื่ม 
                  บูรณาการกระบวนการ FINE เข้ากับสื่อเสมือนจริง AR 3D และปัญญาประดิษฐ์ AI 
                  พัฒนาสมรรถนะการสื่อสารและการปฏิบัติงานตามมาตรฐานวิชาชีพระดับสากล
                </p>

                <div className={styles.heroCtaGroup}>
                  <Link href="/role-select" className={styles.primaryCta}>
                    <span>เริ่มต้นเรียนรู้ / เข้าสู่ระบบ</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link href="/docs" className={styles.secondaryCta}>
                    <span>คู่มือการใช้งานระบบ</span>
                  </Link>
                </div>

                {/* Trust Stats Row */}
                <div className={styles.heroStatsRow}>
                  <div className={styles.heroStatItem}>
                    <span className={styles.heroStatNumber}>18 สัปดาห์</span>
                    <span className={styles.heroStatLabel}>แผนการสอนบูรณาการ</span>
                  </div>
                  <div className={styles.heroStatItem}>
                    <span className={styles.heroStatNumber}>4 ขั้นตอน</span>
                    <span className={styles.heroStatLabel}>กระบวนการ FINE Model</span>
                  </div>
                  <div className={styles.heroStatItem}>
                    <span className={styles.heroStatNumber}>4 มิติ</span>
                    <span className={styles.heroStatLabel}>สมรรถนะ KSA-C</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Visual with Kru Pim Portrait */}
              <div className={styles.heroVisual}>
                <div className={styles.heroVisualCard}>
                  <Image
                    src="/images/krupim_hero.png"
                    alt="นางสาวอนัญญา วิชัยผิน แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์ ผู้พัฒนานวัตกรรม FINE MODEL"
                    width={400}
                    height={520}
                    className={styles.heroCoverImage}
                    priority
                  />
                  {/* Floating Badge 1 */}
                  <div className={styles.heroFloatingBadge1}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#215c43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    <div>
                      <div className={styles.heroFloatingBadge1Title}>นางสาวอนัญญา วิชัยผิน</div>
                      <div className={styles.heroFloatingBadge1Sub}>แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์</div>
                    </div>
                  </div>

                  {/* Floating Badge 2 */}
                  <div className={styles.heroFloatingBadge2}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span className={styles.heroFloatingBadge2Title}>สื่อการสอน AR 3D & AI Scan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            FLOATING 4 PILLARS (Inspired by Pinterest "Our Services" Cards)
            ================================================================= */}
        <section id="pillars" className={styles.floatingPillarsSection} aria-label="เทคโนโลยีอัจฉริยะ">
          <div className={styles.container}>
            <div className={styles.floatingPillarsGrid}>
              {/* Card 1: Solid Emerald Intro Card */}
              <div className={styles.pillarCardIntro}>
                <div className={styles.pillarIntroTag}>TECH PILLARS</div>
                <h2 className={styles.pillarIntroTitle}>เทคโนโลยีอัจฉริยะ</h2>
                <p className={styles.pillarIntroDesc}>
                  ผสานเทคโนโลยีเสมือนจริงและปัญญาประดิษฐ์ สร้างประสบการณ์เรียนรู้สมจริง
                </p>
              </div>

              {/* Card 2: AR + 3D Learning Objects */}
              <div className={styles.pillarCard}>
                <div className={styles.pillarIconBox}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <h3 className={styles.pillarCardTitle}>AR + 3D Learning Objects</h3>
                <p className={styles.pillarCardDesc}>
                  สื่อสามมิติเสมือนจริง หมุน ซูม และสำรวจอุปกรณ์งานบริการ 360 องศา สะดวกผ่าน QR Code ทุกที่ทุกเวลา
                </p>
              </div>

              {/* Card 3: AI Scan & Vision */}
              <div className={styles.pillarCard}>
                <div className={styles.pillarIconBox}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2"/>
                    <circle cx="12" cy="5" r="2"/>
                    <path d="M12 7v4"/>
                    <line x1="8" y1="16" x2="8" y2="16"/>
                    <line x1="16" y1="16" x2="16" y2="16"/>
                  </svg>
                </div>
                <h3 className={styles.pillarCardTitle}>AI Scan & Hospitality Vision</h3>
                <p className={styles.pillarCardDesc}>
                  สแกนวัตถุและเมนูอาหารจากภาพจริง เพื่อเรียนรู้คำศัพท์ สำนวน และบริบทงานบริการด้วย AI ทันที
                </p>
              </div>

              {/* Card 4: Gemini Live & Simulation */}
              <div className={styles.pillarCard}>
                <div className={styles.pillarIconBox}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </div>
                <h3 className={styles.pillarCardTitle}>Gemini Live &amp; Simulation</h3>
                <p className={styles.pillarCardDesc}>
                  ฝึกสนทนาโต้ตอบภาษาอังกฤษด้วยเสียงเรียลไทม์ และเผชิญสถานการณ์บริการจำลองเพื่อฝึกแก้ปัญหาเฉพาะหน้า
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            STUDENT MOBILE APP SHOWCASE & REGISTRATION SECTION
            ================================================================= */}
        <section id="student-app" className={styles.studentAppSection} aria-label="แอปพลิเคชัน FINE MODEL สำหรับนักเรียน">
          <div className={styles.container}>
            <div className={styles.studentAppCard}>
              <div className={styles.studentAppGrid}>
                {/* Left: Interactive Mobile App Mockup Slider */}
                <div className={styles.studentAppMockupCol}>
                  <StudentAppSlider />
                </div>

                {/* Right: Content for Students + Registration CTA */}
                <div className={styles.studentAppInfoCol}>
                  <div className={styles.studentAppEyebrow}>
                    <span className={styles.studentAppEyebrowIcon}>✨</span>
                    <span>STUDENT APPLICATION · FINE MODEL AR 3D+AI SCAN</span>
                  </div>

                  <h2 className={styles.studentAppTitle}>
                    เรียนรู้และฝึกปฏิบัติงานบริการ <br />
                    <span className={styles.studentAppTitleHighlight}>ผ่านแอปพลิเคชัน FINE MODEL AR 3D+AI Scan</span>
                  </h2>

                  <p className={styles.studentAppDesc}>
                    ออกแบบสำหรับนักเรียนแผนกวิชาการโรงแรมโดยเฉพาะ ให้คุณเข้าถึงการเรียนรู้อย่างเป็นระบบ 
                    สแกนวัตถุเครื่องมือบริการ 3 มิติ ฝึกสนทนาภาษาอังกฤษกับ AI แบบเรียลไทม์ 
                    และติดตามความก้าวหน้าตามวงรอบ FINE Model ได้ทุกที่ทุกเวลาตลอด 24 ชั่วโมง
                  </p>

                  {/* 4 Feature Highlights */}
                  <div className={styles.studentAppFeatureGrid}>
                    <div className={styles.studentAppFeatureItem}>
                      <div className={styles.studentFeatureIconBox}>
                        <span>F</span>
                      </div>
                      <div className={styles.studentFeatureText}>
                        <div className={styles.studentFeatureHeading}>F · FAMILIARIZE &amp; AI SCAN</div>
                        <p className={styles.studentFeaturePara}>
                          สแกนวัตถุอุปกรณ์จริงด้วย AI และสำรวจคลังโมเดล 3D เสมือนจริง หมุนดูได้ 360° จดจำคำศัพท์เฉพาะทาง
                        </p>
                      </div>
                    </div>

                    <div className={styles.studentAppFeatureItem}>
                      <div className={styles.studentFeatureIconBox}>
                        <span>I</span>
                      </div>
                      <div className={styles.studentFeatureText}>
                        <div className={styles.studentFeatureHeading}>I · INTERACT &amp; VOICE COACH</div>
                        <p className={styles.studentFeaturePara}>
                          ฝึกออกเสียงประโยคบริการอาหารและเครื่องดื่ม ฟังเสียงเจ้าของภาษา และรับคำแนะนำการออกเสียงเรียลไทม์
                        </p>
                      </div>
                    </div>

                    <div className={styles.studentAppFeatureItem}>
                      <div className={styles.studentFeatureIconBox}>
                        <span>N</span>
                      </div>
                      <div className={styles.studentFeatureText}>
                        <div className={styles.studentFeatureHeading}>N · NATIVE SCENARIO SIMULATION</div>
                        <p className={styles.studentFeaturePara}>
                          จำลองสถานการณ์ต้อนรับและบริการลูกค้าจริง โต้ตอบบทสนทนาภาษาอังกฤษกับ Mr. Robert Smith
                        </p>
                      </div>
                    </div>

                    <div className={styles.studentAppFeatureItem}>
                      <div className={styles.studentFeatureIconBox}>
                        <span>E</span>
                      </div>
                      <div className={styles.studentFeatureText}>
                        <div className={styles.studentFeatureHeading}>E · EXHIBIT &amp; E-PORTFOLIO</div>
                        <p className={styles.studentFeaturePara}>
                          บันทึกความก้าวหน้า สะสมผลงานและคะแนนประเมินสมรรถนะ KSA-C ลงในแฟ้มสะสมงานดิจิทัลอัตโนมัติ
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Register & Sign In */}
                  <div className={styles.studentAppCtaWrap}>
                    <Link href="/register-student" className={styles.studentRegisterBtn}>
                      <span className={styles.btnIcon}>📝</span>
                      <span>ลงทะเบียนนักเรียน (เริ่มต้นใช้งาน)</span>
                      <span className={styles.btnArrow}>→</span>
                    </Link>
                    <Link href="/role-select" className={styles.studentLoginBtn}>
                      <span>เข้าสู่ระบบนักเรียน</span>
                    </Link>
                  </div>

                  <div className={styles.studentAppNote}>
                    <span className={styles.noteCheck}>✓</span>
                    <span>เข้าเรียนฟรี · เข้าสู่ห้องเรียนและเริ่มฝึกฝนได้ทันที ไม่ต้องติดตั้งโปรแกรมเพิ่มเติม</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            TEACHER CONSOLE & MANAGEMENT SECTION
            ================================================================= */}
        <section id="teacher-console" className={styles.teacherSection} aria-label="ระบบบริหารจัดการการเรียนรู้สำหรับครูผู้สอน">
          <div className={styles.container}>
            <div className={styles.teacherCard}>
              <div className={styles.teacherGrid}>
                {/* Left: Info, Features & Actions */}
                <div className={styles.teacherInfoCol}>
                  <div className={styles.teacherEyebrow}>
                    <span className={styles.teacherEyebrowIcon}>🎓</span>
                    <span>TEACHER CONSOLE · แพลตฟอร์มบริหารการเรียนรู้สำหรับครู</span>
                  </div>

                  <h2 className={styles.teacherTitle}>
                    ยกระดับการสอนอย่างมืออาชีพ <br />
                    <span className={styles.teacherTitleHighlight}>ด้วยระบบบริหารจัดการ Teacher Console</span>
                  </h2>

                  <p className={styles.teacherDesc}>
                    ออกแบบสำหรับครูแผนกวิชาการโรงแรมโดยเฉพาะ ช่วยครูพิมจัดทำแผนการสอนบูรณาการ 18 สัปดาห์ 
                    ตรวจประเมินสมรรถนะ KSA-C รายบุคคล และบริหารคลังสื่อ AR 3D และคลังคำศัพท์วิชาชีพได้อย่างมีประสิทธิภาพในหน้าจอเดียว
                  </p>

                  {/* 4 Feature Highlights */}
                  <div className={styles.teacherFeatureGrid}>
                    <div className={styles.teacherFeatureItem}>
                      <div className={styles.teacherFeatureIconBox}>
                        <span>📊</span>
                      </div>
                      <div className={styles.teacherFeatureText}>
                        <div className={styles.teacherFeatureHeading}>แดชบอร์ด &amp; วัดสมรรถนะ KSA-C</div>
                        <p className={styles.teacherFeaturePara}>
                          ติดตามความก้าวหน้า ตรวจงานนักเรียนรายบุคคล และตรวจสอบโควต้า AI ประจำวันของห้องเรียน
                        </p>
                      </div>
                    </div>

                    <div className={styles.teacherFeatureItem}>
                      <div className={styles.teacherFeatureIconBox}>
                        <span>📑</span>
                      </div>
                      <div className={styles.teacherFeatureText}>
                        <div className={styles.teacherFeatureHeading}>แผนการสอนบูรณาการ 18 สัปดาห์</div>
                        <p className={styles.teacherFeaturePara}>
                          จัดระบบแผนการเรียนรู้ตามวงรอบ FINE Model ครบถ้วน 220 วัตถุประสงค์เชิงสมรรถนะ
                        </p>
                      </div>
                    </div>

                    <div className={styles.teacherFeatureItem}>
                      <div className={styles.teacherFeatureIconBox}>
                        <span>📦</span>
                      </div>
                      <div className={styles.teacherFeatureText}>
                        <div className={styles.teacherFeatureHeading}>คลังสื่อ AR 3D &amp; คำศัพท์ 51 รายการ</div>
                        <p className={styles.teacherFeaturePara}>
                          อัปโหลดไฟล์โมเดล 3 มิติ (.GLB / .USDZ) เชื่อมโยงคำศัพท์ สัทอักษร และประโยคฝึกพูด
                        </p>
                      </div>
                    </div>

                    <div className={styles.teacherFeatureItem}>
                      <div className={styles.teacherFeatureIconBox}>
                        <span>👥</span>
                      </div>
                      <div className={styles.teacherFeatureText}>
                        <div className={styles.teacherFeatureHeading}>จัดการห้องเรียน &amp; นักเรียน 42 คน</div>
                        <p className={styles.teacherFeaturePara}>
                          บริหารสมาชิกชั้นเรียน ปวช.1 และ ปวช.2 ระบบสร้างลิงก์เชิญ และรายงานผลการเรียนรู้แบบเรียลไทม์
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Login Teacher & Register Teacher */}
                  <div className={styles.teacherCtaWrap}>
                    <Link href="/role-select" className={styles.teacherLoginBtn}>
                      <span className={styles.btnIcon}>🔐</span>
                      <span>เข้าสู่ระบบครูผู้สอน</span>
                      <span className={styles.btnArrow}>→</span>
                    </Link>
                    <Link href="/register-teacher" className={styles.teacherRegisterBtn}>
                      <span>ลงทะเบียนครูผู้สอน</span>
                    </Link>
                    <Link href="/docs" className={styles.teacherDocsBtn}>
                      <span>คู่มือการใช้งานระบบ</span>
                    </Link>
                  </div>

                  <div className={styles.teacherNote}>
                    <span className={styles.noteCheck}>✓</span>
                    <span>ระบบคลาวด์มาตรฐานความปลอดภัยสูง · พร้อมใช้งานผ่านเว็บเบราว์เซอร์บน PC และแท็บเล็ต</span>
                  </div>
                </div>

                {/* Right: Desktop/Browser Mockup Slider */}
                <div className={styles.teacherMockupCol}>
                  <TeacherConsoleSlider />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            AUTHENTIC LEARNING GALLERY (Active Learning & Real-World Simulation)
            ================================================================= */}
        <ActivityGallery />

        {/* =================================================================
            LEARNING PROCESS ROAD (01-04 Inspired by Pinterest Process Road)
            ================================================================= */}
        <section id="fine-process" className={styles.processSection} aria-label="กระบวนการเรียนรู้ FINE Model">
          <div className={styles.container}>
            <div className={styles.sectionEyebrow}>FINE LEARNING PROCESS</div>
            <h2 className={styles.sectionTitle}>เส้นทางการเรียนรู้ 4 ขั้นตอน (FINE Process Road)</h2>
            <p className={styles.sectionDesc}>
              กระบวนการจัดการเรียนรู้ที่ออกแบบอย่างเป็นระบบ เพื่อนำผู้เรียนจากพื้นฐานความคุ้นเคยสู่สมรรถนะวิชาชีพ
            </p>

            <div className={styles.processGrid}>
              {/* Steps List */}
              <div className={styles.processList}>
                {/* Step 01: F */}
                <div className={styles.processItem}>
                  <div className={styles.processNumber}>01.</div>
                  <div className={styles.processBody}>
                    <span className={styles.processStepTag}>ขั้นที่ 1 · Exploration</span>
                    <h3 className={styles.processStepTitle}>F · Familiarize (การสร้างความคุ้นเคย)</h3>
                    <p className={styles.processStepDesc}>
                      เรียนรู้คำศัพท์ สำนวน อุปกรณ์ เมนูอาหาร และบริการงานอาหาร ผ่านโมเดล AR 3D 
                      และฟังก์ชัน AI Scan วิเคราะห์วัตถุจริงเพื่อสร้างความคุ้นเคยก่อนลงมือปฏิบัติ
                    </p>
                  </div>
                </div>

                {/* Step 02: I */}
                <div className={styles.processItem}>
                  <div className={styles.processNumber}>02.</div>
                  <div className={styles.processBody}>
                    <span className={styles.processStepTag}>ขั้นที่ 2 · Interaction</span>
                    <h3 className={styles.processStepTitle}>I · Interact (การมีปฏิสัมพันธ์)</h3>
                    <p className={styles.processStepDesc}>
                      ฝึกสนทนาและโต้ตอบภาษาอังกฤษ ใช้ Gemini และ Gemini Live เป็นผู้สนทนาจำลองบทบาทลูกค้า 
                      ฝึกการฟัง การออกเสียง และการตอบสนองอย่างเป็นธรรมชาติ
                    </p>
                  </div>
                </div>

                {/* Step 03: N */}
                <div className={styles.processItem}>
                  <div className={styles.processNumber}>03.</div>
                  <div className={styles.processBody}>
                    <span className={styles.processStepTag}>ขั้นที่ 3 · Simulation</span>
                    <h3 className={styles.processStepTitle}>N · Navigate Service Situations (การฝึกปฏิบัติในสถานการณ์บริการ)</h3>
                    <p className={styles.processStepDesc}>
                      ฝึกใช้ภาษาอังกฤษในการบริการจริง เผชิญสถานการณ์จำลอง (Simulation) ที่หลากหลาย 
                      ฝึกการตัดสินใจ การรับมือข้อร้องเรียน และการแก้ไขปัญหาเฉพาะหน้า
                    </p>
                  </div>
                </div>

                {/* Step 04: E */}
                <div className={styles.processItem}>
                  <div className={styles.processNumber}>04.</div>
                  <div className={styles.processBody}>
                    <span className={styles.processStepTag}>ขั้นที่ 4 · Demonstration</span>
                    <h3 className={styles.processStepTitle}>E · Exhibit Professional Performance (การแสดงสมรรถนะวิชาชีพ)</h3>
                    <p className={styles.processStepDesc}>
                      แสดงสมรรถนะผ่านการปฏิบัติจริง ประเมินตามสภาพจริงด้วยเกณฑ์มาตรฐานวิชาชีพ 
                      และจัดทำแฟ้มสะสมผลงาน E-Portfolio ดิจิทัลพร้อมใบประกาศนียบัตร
                    </p>
                  </div>
                </div>
              </div>

              {/* Graphic Mask on the Right: Hospitality Students Table Setting */}
              <div className={styles.processVisualWrap}>
                <Image
                  src="/images/hotel_students_table.jpg"
                  alt="การฝึกปฏิบัติการจัดโต๊ะอาหารและงานบริการ แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์"
                  width={600}
                  height={463}
                  className={styles.processVisualImage}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            SCENARIO IN ACTION (Table Setup & Service Preparation Checklist)
            ================================================================= */}
        <section id="scenario" className={styles.scenarioSection} aria-label="สถานการณ์จำลองงานบริการจริง">
          <div className={styles.container}>
            <div className={styles.sectionEyebrow}>VOCATIONAL EXCELLENCE IN PRACTICE</div>
            <h2 className={styles.sectionTitle}>ตัวอย่างสถานการณ์จำลอง: มาตรฐานการบริการอาหารและเครื่องดื่ม (F&amp;B Service Guide)</h2>
            <p className={styles.sectionDesc}>
              ผู้เรียนจะได้ฝึกฝนมาตรฐานการบริการอาหารและเครื่องดื่มระดับโรงแรม 5-6 ดาว 
              ผ่านขั้นตอนปฏิบัติจริงที่สอดคล้องกับเกณฑ์มาตรฐานวิชาชีพสากล พร้อมระบบตรวจสอบสมรรถนะตามขั้นตอน
            </p>

            <ScenarioStepSlider />
          </div>
        </section>

        {/* =================================================================
            KSA-C COMPETENCY FRAMEWORK SECTION
            ================================================================= */}
        <section id="ksac" className={styles.ksacSection} aria-label="กรอบสมรรถนะ KSA-C">
          <div className={styles.container}>
            <div className={styles.sectionEyebrow}>EVALUATION &amp; STANDARDS</div>
            <h2 className={styles.sectionTitle}>กรอบการพัฒนาสมรรถนะ 4 มิติ (KSA-C Framework)</h2>
            <p className={styles.sectionDesc}>
              การวัดและประเมินผลสมรรถนะรายบุคคลอย่างรอบด้าน เพื่อพัฒนาผู้เรียนสู่การปฏิบัติงานระดับมืออาชีพ
            </p>

            <div className={styles.ksacGrid}>
              {/* K: Knowledge */}
              <div className={styles.ksacCard}>
                <div className={styles.ksacLetterBadge}>K</div>
                <h3 className={styles.ksacCardTitle}>Knowledge</h3>
                <div className={styles.ksacCardThai}>ด้านความรู้เชิงวิชาชีพ</div>
                <p className={styles.ksacCardDesc}>
                  ความรู้วิชาชีพจากการวิเคราะห์อุปกรณ์ เมนูอาหาร เครื่องดื่ม คำศัพท์ สำนวนภาษาอังกฤษ และวัฒนธรรมงานบริการ
                </p>
              </div>

              {/* S: Skills */}
              <div className={styles.ksacCard}>
                <div className={styles.ksacLetterBadge}>S</div>
                <h3 className={styles.ksacCardTitle}>Skills</h3>
                <div className={styles.ksacCardThai}>ด้านทักษะปฏิบัติ</div>
                <p className={styles.ksacCardDesc}>
                  ทักษะการฟัง พูด อ่าน เขียน การรับคำสั่งอาหาร การสื่อสารกับลูกค้า และการแก้ไขปัญหาเฉพาะหน้าในสถานการณ์จริง
                </p>
              </div>

              {/* A: Attitude */}
              <div className={styles.ksacCard}>
                <div className={styles.ksacLetterBadge}>A</div>
                <h3 className={styles.ksacCardTitle}>Attitude</h3>
                <div className={styles.ksacCardThai}>ด้านเจตคติและคุณลักษณะ</div>
                <p className={styles.ksacCardDesc}>
                  ความรับผิดชอบ ความใส่ใจในรายละเอียด จิตใจในการให้บริการ (Service Mind) ความมั่นใจ และความกล้าแสดงออก
                </p>
              </div>

              {/* C: Competency */}
              <div className={styles.ksacCard}>
                <div className={styles.ksacLetterBadge}>C</div>
                <h3 className={styles.ksacCardTitle}>Competency</h3>
                <div className={styles.ksacCardThai}>ด้านสมรรถนะวิชาชีพ</div>
                <p className={styles.ksacCardDesc}>
                  สมรรถนะการสื่อสารภาษาอังกฤษในงานบริการ การปฏิบัติงานตามมาตรฐานวิชาชีพ และการทำงานร่วมกับผู้อื่น
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            ABOUT INSTRUCTOR & INSTITUTION PROFILE
            ================================================================= */}
        <section id="instructor" className={styles.authorSection} aria-label="ข้อมูลครูผู้จัดทำ">
          <div className={styles.container}>
            <div className={styles.authorCard}>
              <div className={styles.authorPhotoWrap}>
                <Image
                  src="/images/krupim_hero.png"
                  alt="นางสาวอนัญญา วิชัยผิน แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์"
                  width={240}
                  height={320}
                  className={styles.authorPhoto}
                />
              </div>

              <div className={styles.authorContent}>
                <span className={styles.authorRoleTag}>ผู้วิจัยและพัฒนานวัตกรรมการจัดการเรียนรู้</span>
                <h2 className={styles.authorName}>นางสาวอนัญญา วิชัยผิน</h2>
                <div className={styles.authorAffiliation}>
                  แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์
                </div>
                <p className={styles.authorBio}>
                  มุ่งมั่นพัฒนานวัตกรรมการศึกษาเพื่อยกระดับทักษะภาษาอังกฤษและสมรรถนะวิชาชีพของผู้เรียน 
                  โดยนำเทคโนโลยีเสมือนจริง AR 3D และปัญญาประดิษฐ์ AI มาประยุกต์ใช้เพื่อสร้างห้องเรียนยุคใหม่ 
                  ที่ผู้เรียนสามารถฝึกฝนได้อย่างมั่นใจ เข้าถึงได้สะดวก และนำไปประกอบอาชีพได้จริง
                </p>

                <div className={styles.authorCheckGrid}>
                  <div className={styles.authorCheckItem}>
                    <span className={styles.authorCheckIcon}>✓</span>
                    <span>สอดคล้องตามเกณฑ์มาตรฐานสมรรถนะวิชาชีพ</span>
                  </div>
                  <div className={styles.authorCheckItem}>
                    <span className={styles.authorCheckIcon}>✓</span>
                    <span>รองรับการประเมินผลตามสภาพจริง KSA-C</span>
                  </div>
                  <div className={styles.authorCheckItem}>
                    <span className={styles.authorCheckIcon}>✓</span>
                    <span>คลังสื่อจำลอง AR 3D หมุนได้ 360 องศา</span>
                  </div>
                  <div className={styles.authorCheckItem}>
                    <span className={styles.authorCheckIcon}>✓</span>
                    <span>ระบบแฟ้มสะสมงาน E-Portfolio ดิจิทัล</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            QUOTE & INSPIRATION BANNER
            ================================================================= */}
        <section className={styles.quoteSection} aria-label="วิสัยทัศน์นวัตกรรม">
          <div className={styles.container}>
            <div className={styles.quoteCard}>
              <div className={styles.quoteMark} aria-hidden="true">“</div>
              <p className={styles.quoteText}>
                นวัตกรรมการเรียนรู้ที่เข้าถึงง่าย ใช้เทคโนโลยีอย่างชาญฉลาด พัฒนาผู้เรียนสู่สมรรถนะวิชาชีพที่ยั่งยืน
              </p>
              <div className={styles.quoteAuthor}>
                — นางสาวอนัญญา วิชัยผิน · แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            READY TO START (Bottom Action Card)
            ================================================================= */}
        <section className={styles.readyCtaSection} aria-label="เริ่มต้นใช้งาน">
          <div className={styles.container}>
            <div className={styles.readyCtaCard}>
              <div className={styles.readyCtaCopy}>
                <h3>พร้อมเริ่มต้นพัฒนาสมรรถนะงานบริการด้วย FINE Model?</h3>
                <p>เข้าสู่ระบบเพื่อเข้าถึงบทเรียน 3D สแกนคำศัพท์ด้วย AI และเริ่มสะสมคะแนนสมรรถนะได้ทันที</p>
              </div>
              <Link href="/role-select" className={styles.primaryCta}>
                <span>เข้าสู่ระบบ / เลือกบทบาท</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <h4>FINE MODEL · AR 3D+AI Scan</h4>
              <p>
                แพลตฟอร์มการจัดการเรียนรู้ภาษาอังกฤษเพื่องานบริการอาหารและเครื่องดื่มด้วยโมเดล FINE 
                ผสานเทคโนโลยีเสมือนจริง AR 3D และปัญญาประดิษฐ์ AI Scan · นวัตกรรมเพื่อการศึกษาโดย นางสาวอนัญญา วิชัยผิน แผนกวิชาการโรงแรม วิทยาลัยเทคนิคกาฬสินธุ์
              </p>
            </div>

            <nav className={styles.footerLinks} aria-label="ลิงก์ท้ายหน้าเว็บ">
              <Link href="/role-select" className={styles.footerLink}>เข้าสู่ระบบ</Link>
              <Link href="/docs" className={styles.footerLink}>คู่มือการใช้งาน</Link>
              <Link href="/register-student" className={styles.footerLink}>สมัครนักเรียน</Link>
              <Link href="/register-teacher" className={styles.footerLink}>สมัครครู</Link>
              <Link href="/role-select" className={styles.footerLink}>เลือกบทบาท</Link>
            </nav>
          </div>

          <div className={styles.footerBottom}>
            <span>© 2026 FINE MODEL · AR 3D+AI Scan (นางสาวอนัญญา วิชัยผิน · วิทยาลัยเทคนิคกาฬสินธุ์). All rights reserved.</span>
            <span>🔒 คุ้มครองข้อมูลส่วนบุคคลตามมาตรฐาน PDPA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
