'use client'
import { useState } from 'react'

export default function TeacherManualPage() {
  const [activeTopic, setActiveTopic] = useState('lessons')

  const topics = [
    { id: 'lessons', label: 'แผนการสอน FINE MODEL', emoji: '📖' },
    { id: 'ar3d', label: 'คลังอุปกรณ์ AR & 3D', emoji: '🎨' },
    { id: 'scenario', label: 'สถานการณ์จำลอง AI', emoji: '⚡' },
    { id: 'assignments', label: 'งานและกิจกรรม', emoji: '📋' },
    { id: 'students', label: 'ทะเบียนและการรับรอง', emoji: '👥' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)', color: '#FDFAF4', padding: '24px', borderRadius: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#C9A84C', margin: 0 }}>📚 คู่มือการใช้งานระบบบริหารการเรียนรู้ FINE Model สำหรับคุณครู</h2>
          <p style={{ color: 'rgba(253,250,244,0.85)', fontSize: '13.5px', marginTop: '6px', margin: '6px 0 0 0' }}>
            แนวทางปฏิบัติการโรงแรมและการสอนทักษะบริการอาหาร (F&B) ผ่านระบบแผนการสอน 3D, กล้องสแกน AR และ AI ประเมินผล KSA-C
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>
        
        {/* Navigation Sidebar inside page */}
        <div className="erp-card" style={{ width: '280px', flexShrink: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #EDE9E1', borderRadius: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#A6882A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
            หัวข้อคู่มือวิชาชีพ
          </div>
          {topics.map(t => {
            const isActive = activeTopic === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTopic(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  padding: '12px 16px', border: 'none', borderRadius: '10px',
                  fontFamily: 'var(--font-primary)', fontSize: '13.5px', fontWeight: isActive ? 800 : 500,
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  background: isActive ? 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)' : 'transparent',
                  color: isActive ? '#FDFAF4' : '#4A4138',
                  boxShadow: isActive ? '0 4px 12px rgba(16,43,31,0.1)' : 'none',
                }}
              >
                <span style={{ fontSize: '16px' }}>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content Details Display Area */}
        <div className="erp-card" style={{ flex: 1, minWidth: 0, padding: '28px', textAlign: 'left', border: '1px solid #EDE9E1', borderRadius: '16px', background: '#FDFAF4' }}>
          
          {/* 1. Lessons Plan Guide */}
          {activeTopic === 'lessons' && (
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#1E4D3A', marginBottom: '16px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📖 1. ระบบวางแผนการจัดการเรียนรู้อัจฉริยะ (Lesson Plan Manager)
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                ช่วยให้คุณครูผู้สอน F&B จัดหมวดหมู่เนื้อหาการโรงแรมให้สอดคล้องกับมาตรฐานทักษะสากล 
                โดยสามารถกำหนดช่วงเวลา สอนคำศัพท์ ประโยคสนทนา และจัดทำลิงก์เชิญชั้นเรียนเพื่อส่งข้อมูลตรงถึงมือถือผู้เรียน
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#white', border: '1px solid #EDE9E1', padding: '18px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1E4D3A', marginBottom: '10px' }}>⚙️ ขั้นตอนการสร้างและเผยแพร่แผนการสอน:</div>
                  <ol style={{ paddingLeft: '20px', fontSize: '13px', color: '#4A4138', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.6 }}>
                    <li><strong>กดเพิ่มแผนการสอน:</strong> คลิกปุ่ม <code>+ สร้างแผนใหม่</code> บนขวาของตารางรายการแผน</li>
                    <li><strong>กรอกรายละเอียดโครงสร้างหลักสูตร:</strong> กำหนด สัปดาห์ (เช่น สัปดาห์ที่ 2), ชื่อหน่วย (เช่น แก้วและเครื่องดื่ม), รหัสวิชา, ห้องเรียน (เช่น ปวช.1/1) และเวลาเรียน</li>
                    <li><strong>กำหนดเกณฑ์สมรรถนะ (KSA-C):</strong> กรอกความรู้ที่ต้องได้ (Knowledge), ทักษะการออกเสียงที่ปฏิบัติจริง (Skill), เจตคติในการทำงานบริการ (Attribute) และทักษะประยุกต์ใช้งานในสถานการณ์จำลอง (Competency)</li>
                    <li><strong>ระบุคลังคำศัพท์และประโยคฝึกพูด:</strong> ใส่ชื่ออุปกรณ์ (เช่น Red Wine Glass) และประโยคฝึกเสิร์ฟภาษาอังกฤษ เพื่อนำไปวิเคราะห์ประเมินผลเสียงของนักเรียน</li>
                    <li><strong>บันทึกระบบสด (Supabase Sync):</strong> ระบบจะทำการ Upsert บันทึกข้อมูลแผนลงคลาวด์อัตโนมัติ ซึ่งนักเรียนจะสามารถเห็นบทเรียนนี้ได้ทันทีที่กดแถบ Learn</li>
                  </ol>
                </div>

                <div style={{ background: '#EAF3EE', borderLeft: '4px solid #1E4D3A', padding: '16px', borderRadius: '0 12px 12px 0' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1E4D3A' }}>🔗 ระบบเชิญผู้เรียน (Classroom Invitations):</div>
                  <p style={{ fontSize: '13px', color: '#4A4138', marginTop: '6px', lineHeight: 1.6, margin: '6px 0 0 0' }}>
                    เมื่อสร้างแผนเสร็จสิ้น คุณครูสามารถคลิก <strong>"สร้างรหัสเชิญนักเรียน"</strong> ระบบจะสุ่มรหัส 6 หลัก (เช่น <code>E9K3W2</code>) 
                    เพื่อให้นักเรียนกรอกสมัครผ่านหน้า Register ซึ่งจะจับคู่ประวัตินักเรียนและห้องเรียนเข้ากับบัญชีคุณครูโดยตรงโดยไม่ต้องจับคู่เองภายหลัง
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. AR & 3D Items Guide */}
          {activeTopic === 'ar3d' && (
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#1E4D3A', marginBottom: '16px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎨 2. ระบบจัดการคลังอุปกรณ์เสมือนจริง (AR & 3D Items Manager)
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                เครื่องมือขับเคลื่อนการสร้างแบบจำลอง 3 มิติเชิงปฏิบัติการโรงแรม มีการเชื่อมโยงระบบผลิตวัตถุอัตโนมัติด้วย AI และโหมดสร้างแมนนวลเพื่อความยืดหยุ่นสูง
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#white', border: '1px solid #EDE9E1', padding: '18px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#A6882A', marginBottom: '12px' }}>🔨 โหมดสร้างด้วยตนเอง (Manual Mode):</div>
                  <p style={{ fontSize: '13px', color: '#4A4138', margin: '0 0 10px 0', lineHeight: 1.6 }}>
                    หากคุณครูมีไฟล์โมเดลอยู่แล้ว หรือต้องการเลือกรูปภาพพรีวิวเอง:
                  </p>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#4A4138', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.6 }}>
                    <li>กรอกชื่อไทย/อังกฤษ หมวดหมู่ และประโยคอธิบายหน้าที่ของอุปกรณ์</li>
                    <li>อัปโหลดรูปถ่ายจริงโดยกดปุ่ม <code>📤 อัพไฟล์ภาพ</code> เพื่อใช้ทำภาพตัวอย่างการ์ดสแกน</li>
                    <li>วางลิงก์ไฟล์โมเดล 3D ฟอร์แมต <strong>.glb</strong> (สำหรับ Android/Web) และ <strong>.usdz</strong> (สำหรับ iOS) แล้วกดบันทึกเข้าคลัง</li>
                  </ul>
                </div>

                <div style={{ background: '#FBF6E9', borderLeft: '4px solid #A6882A', padding: '18px', borderRadius: '0 12px 12px 0' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#A6882A', marginBottom: '8px' }}>⚡ โหมดสร้างด้วย AI อัตโนมัติ (12-Step Wizard):</div>
                  <p style={{ fontSize: '13px', color: '#4A4138', lineHeight: 1.6, margin: 0 }}>
                    ฟังก์ชันอัจฉริยะช่วยปั้นโมเดลเสร็จสิ้นใน 12 ขั้นตอน:
                  </p>
                  <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: '#4A4138', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>ขั้น 1-4:</strong> ครูป้อนคำศัพท์ (เช่น Crystal Wine Glass) ระบบ AI (Gemini) จะวิเคราะห์ แปลคำศัพท์ และสืบค้นภาพสเก็ตช์อ้างอิง</li>
                    <li><strong>ขั้น 5-7:</strong> ระบบส่งข้อมูลไปยัง **Tripo3D API** เพื่อถอดโครงรูปทรง 3D ความละเอียดสูง และดาวน์โหลดไฟล์โมเดลอัตโนมัติ</li>
                    <li><strong>ขั้น 8-10:</strong> ระบบสร้างคำออกเสียงสัทศาสตร์และลิงก์สแกนบทเรียน พร้อมแสดงหน้าต่างพรีวิวเสมือนจริงของนักเรียน</li>
                    <li><strong>ขั้น 11-12:</strong> สรุปคะแนนความเสถียรและปิดหน้าต่างโดยข้อมูลทั้งหมดจะถูกส่งกลับมาที่หน้า Manual อัตโนมัติเพื่อให้คุณครูตรวจเช็คก่อนบันทึกจริง</li>
                  </ul>
                </div>

                <div style={{ background: '#EAF3EE', border: '1px solid #1E4D3A', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1E4D3A', marginBottom: '8px' }}>📐 การนำโค้ด Python Script ไปใช้งาน in Blender (Blender Integration):</div>
                  <p style={{ fontSize: '13px', color: '#4A4138', lineHeight: 1.6, margin: 0 }}>
                    สำหรับอาจารย์ที่ต้องการสัดส่วนโค้งแก้วน้ำ จาน ช้อน ที่สมบูรณ์แบบ สามารถสลับไปที่แถบ <strong>"4.4 โค้ด Blender"</strong> 
                    เพื่อคัดลอกสคริปต์คำสั่งภาษา Python (รันด้วยโมดูล <code>bpy</code>) นำไปวางรันในโปรแกรม Blender เพื่อให้โปรแกรมหมุนสร้างตาข่ายวัตถุแบบเรียบเนียนร้อยเปอร์เซ็นต์ได้ฟรี
                  </p>
                </div>

                <div style={{ background: '#F5F0E6', border: '1px solid #EDE9E1', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#4A4138', marginBottom: '8px' }}>🖨️ การพิมพ์การ์ดสื่อการเรียนรู้ AR QR Card:</div>
                  <p style={{ fontSize: '13px', color: '#4A4138', lineHeight: 1.6, margin: 0 }}>
                    ในคลังอุปกรณ์วิชาชีพ (แถบ 4.5) ครูสามารถกดปุ่ม <code>พิมพ์การ์ด QR</code> เพื่อเปิดตัวเลือกการจัดหน้าสิ่งพิมพ์สีทองคลาสสิก 
                    โดยระบบจะใส่คำศัพท์ คำแปล คำอ่านภาษาอังกฤษ พร้อม QR Code ประจำอุปกรณ์ ครูสามารถส่งพิมพ์ทางเครื่องพิมพ์กระดาษเพื่อให้ผู้เรียนพกพาหรือวางสแกนบนโต๊ะจัดเสิร์ฟจำลองได้สะดวกสบาย
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. AI Scenario Guide */}
          {activeTopic === 'scenario' && (
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#1E4D3A', marginBottom: '16px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚡ 3. ระบบจำลองบทบาทบทสนทนาโต้ตอบ (AI Scenario Creator)
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                ระบบฝึกความกล้าและทักษะภาษาอังกฤษสื่อสารกับลูกค้าจำลองผ่านบริการแชตของ Gemini 
                ช่วยสร้างสภาพแวดล้อมเสมือนจริงให้พนักงานโรงแรมทดลองแก้สถานการณ์ปัญหาเฉพาะหน้า
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#white', border: '1px solid #EDE9E1', padding: '18px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1E4D3A', marginBottom: '10px' }}>📢 เคล็ดลับการตั้งค่าบทสนทนาจำลอง:</div>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#4A4138', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.6 }}>
                    <li><strong>กำหนดความยาก (Difficulty):</strong> ตั้งค่าได้ 3 ระดับ (ง่าย/ปานกลาง/ยาก) ระดับยากสุดลูกค้าจะใช้น้ำเสียงตำหนิหรือมีข้อเรียกร้องซับซ้อนเพื่อให้ผู้เรียนใช้ไหวพริบสูงสุด</li>
                    <li><strong>ร่าง Rubrics อัตโนมัติ:</strong> คุณครูสามารถเขียนกฎเกณฑ์การให้คะแนน เช่น คะแนนมารยาทการต้อนรับ 30%, การแก้ปัญหาได้ตรงจุด 40%, สำนวนการพูดการบริการ 30%</li>
                    <li><strong>ระบบตรวจสอบความถูกต้อง:</strong> ระบบประเมินเบื้องหลังจะสแกนคำพูดจากไมโครโฟนนักเรียน เปรียบเทียบกับสำนวนมาตรฐานโรงแรมเพื่อหาความถี่และการออกเสียงที่สุภาพ</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 4. Assignments Guide */}
          {activeTopic === 'assignments' && (
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#1E4D3A', marginBottom: '16px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📋 4. ระบบตรวจคะแนนและบันทึกกิจกรรม (Tasks & Activities Console)
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                ศูนย์ตรวจรับงานส่งและบันทึกประวัติความก้าวหน้าการเรียนรู้รายบุคคลของนักเรียนที่มอบหมายในชั้นเรียน
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#white', border: '1px solid #EDE9E1', padding: '18px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1E4D3A', marginBottom: '10px' }}>🔍 ขั้นตอนการตรวจกิจกรรมการเรียนรู้:</div>
                  <ol style={{ paddingLeft: '20px', fontSize: '13px', color: '#4A4138', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.6 }}>
                    <li>เปิดเข้าหน้างานที่สั่งการและเลือกคลิกปุ่ม <code>📊 รายงานส่งงาน</code></li>
                    <li>ระบบจะแสดงหลักฐานประกอบการประเมิน เช่น ภาพแคปเจอร์มุมกล้อง AR คู่กับชิ้นงานจริง หรือไฟล์บันทึกประวัติการทำแบบทดสอบและคะแนน AI Match ของนักเรียน</li>
                    <li>ตรวจสอบความสมบูรณ์และกรอกระดับคะแนนจริง</li>
                    <li>เขียนระบุข้อบกพร่องหรือจุดเด่นในช่อง <strong>"คำติชมของผู้สอน (Teacher Feedback)"</strong> เพื่อพัฒนานักเรียนเป็นรายบุคคล</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* 5. Student Registry & KSA-C Guide */}
          {activeTopic === 'students' && (
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#1E4D3A', marginBottom: '16px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                👥 5. ระบบทะเบียนและเกณฑ์การวัดคะแนน KSA-C (Student Registry & Evaluation)
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                โครงสร้างการประเมินผลสัมฤทธิ์ทางการเรียนและการออกเอกสารรับรองสมรรถนะวิชาชีพแก่นักเรียนที่สะสมเกณฑ์ครบถ้วน
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#white', border: '1px solid #EDE9E1', padding: '18px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#A6882A', marginBottom: '12px' }}>📊 สูตรคำนวณคะแนนสมรรถนะปลายภาค (KSA-C Model):</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#4A4138', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #EDE9E1', fontWeight: 800, color: '#1E4D3A' }}>
                        <th style={{ padding: '8px 0' }}>มิติการประเมิน</th>
                        <th style={{ padding: '8px 0' }}>สัดส่วน</th>
                        <th style={{ padding: '8px 0' }}>เครื่องมือวัดผล</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #EDE9E1' }}>
                        <td style={{ padding: '10px 0' }}><strong>K</strong> (Knowledge - ความรู้)</td>
                        <td>20%</td>
                        <td>แบบทดสอบทฤษฎีศัพท์และหน้าที่อุปกรณ์ภายในบทเรียน (Quiz)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EDE9E1' }}>
                        <td style={{ padding: '10px 0' }}><strong>S</strong> (Skill - ทักษะปฏิบัติ)</td>
                        <td>30%</td>
                        <td>ความถูกต้องในการสแกน AR และการออกเสียงประโยคภาษาอังกฤษผ่าน AI Engine</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #EDE9E1' }}>
                        <td style={{ padding: '10px 0' }}><strong>A</strong> (Attribute - คุณลักษณะ)</td>
                        <td>10%</td>
                        <td>ประวัติชั่วโมงเรียน อัตราความกระตือรือร้นและระเบียบการปฏิบัติตนตามขั้นตอน</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 0' }}><strong>C</strong> (Competency - สมรรถนะบูรณาการ)</td>
                        <td>40%</td>
                        <td>ผลประเมินจากการแก้ปัญหาสนทนาและจัดวางโต๊ะอาหารในแบบจำลอง (Simulation)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ background: '#F5F0E6', padding: '16px', borderRadius: '12px', border: '1px solid #C9A84C' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1E4D3A', marginBottom: '8px' }}>🎓 เงื่อนไขการรับใบประกาศเกียรติคุณสมรรถนะ:</div>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#4A4138', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.6 }}>
                    <li>1. นักเรียนต้องทำคะแนนประเมินในแต่ละมิติ (K, S, A, C) <strong>ไม่ต่ำกว่า 60 คะแนน</strong></li>
                    <li>2. คะแนนเฉลี่ยรวมสะสมถ่วงน้ำหนักปลายภาคเรียน <strong>ต้องได้ไม่ต่ำกว่า 70 คะแนน</strong></li>
                    <li>3. เมื่อผู้เรียนคนใดมีสิทธิ์ครบถ้วน บนหน้าจอตรวจการประเมินของครูจะปรากฏปุ่มสีทอง <code>🖨️ พิมพ์ใบรับรองสมรรถนะ (PDF)</code> ให้ครูคลิกดาวน์โหลดแจกจ่ายให้กับนักเรียนเพื่อใช้สมัครงานในอนาคตได้ทันที</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
    </div>
  )
}
