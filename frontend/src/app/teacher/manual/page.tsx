'use client'
import { useState } from 'react'

export default function TeacherManualPage() {
  const [activeTopic, setActiveTopic] = useState('lessons')

  const topics = [
    { id: 'lessons', label: 'แผนการสอน FINE', emoji: '📖' },
    { id: 'ar3d', label: 'คลังอุปกรณ์ AR & 3D', emoji: '🎨' },
    { id: 'scenario', label: 'สถานการณ์จำลอง AI', emoji: '⚡' },
    { id: 'assignments', label: 'งานและกิจกรรม', emoji: '📋' },
    { id: 'students', label: 'ทะเบียนและการรับรอง', emoji: '👥' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1E4D3A', margin: 0 }}>📚 คู่มือการใช้งานระบบบริหารการเรียนรู้ FINE Model</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', margin: '4px 0 0 0' }}>
            คู่มือการสอนระดับปฏิบัติการโรงแรมและการใช้งานฟังก์ชันสนับสนุนสมรรถนะวิชาชีพ F&B
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>
        
        {/* Navigation Sidebar inside page */}
        <div className="erp-card" style={{ width: '260px', flexShrink: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#A6882A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
            หัวข้อการเรียนรู้
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
                  fontFamily: 'var(--font-primary)', fontSize: '13px', fontWeight: isActive ? 700 : 500,
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  background: isActive ? 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)' : 'transparent',
                  color: isActive ? '#FDFAF4' : '#4A4138',
                  boxShadow: isActive ? '0 4px 10px rgba(16,43,31,0.1)' : 'none',
                }}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content Details Display Area */}
        <div className="erp-card" style={{ flex: 1, minWidth: 0, padding: '24px', textAlign: 'left' }}>
          
          {activeTopic === 'lessons' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E4D3A', marginBottom: '16px', marginTop: 0 }}>
                📖 ระบบวางแผนการจัดการเรียนรู้รายสัปดาห์ (Lesson Plan Planner)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                ระบบวางแผนการสอนรายสัปดาห์ออกแบบมาเพื่อสนับสนุนครูผู้สอนในการร่างโครงสร้าง แผนกิจกรรมการโรงแรมและการบริหารอาหารเครื่องดื่ม 
                เชื่อมต่อแนวทาง FINE Model เพื่อคุมสมรรถนะการเรียนรู้ได้ตรงจุด
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div style={{ background: '#FBF6E9', borderLeft: '4px solid #A6882A', padding: '14px', borderRadius: '0 8px 8px 0' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#A6882A' }}>ขั้นตอนการสร้างแผนการจัดการเรียนรู้:</div>
                  <ul style={{ paddingLeft: '20px', fontSize: '12px', color: '#4A4138', marginTop: '6px', lineHeight: 1.8 }}>
                    <li><strong>ขั้นตอนที่ 1:</strong> กดปุ่ม "➕ เพิ่มแผนการสอนสัปดาห์ใหม่" ที่หน้ารายการแผนการสอน</li>
                    <li><strong>ขั้นตอนที่ 2:</strong> เลือกหัวข้อเรื่องและระดับชั้นเรียนที่ต้องการมอบหมาย</li>
                    <li><strong>ขั้นตอนที่ 3:</strong> ป้อนวัตถุประสงค์เชิงสมรรถนะ กิจกรรมการจัดการชั้นเรียน และแนวทางการประเมินผล</li>
                    <li><strong>ขั้นตอนที่ 4:</strong> บันทึกข้อมูลเข้าระบบเพื่อเปิดการพรีวิวแผนจัดแสดงให้นักเรียนเข้ามาเรียนรู้</li>
                  </ul>
                </div>

                <div style={{ background: '#EAF3EE', borderLeft: '4px solid #1E4D3A', padding: '14px', borderRadius: '0 8px 8px 0' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1E4D3A' }}>💡 เคล็ดลับการวางแผนอิง FINE Model:</div>
                  <p style={{ fontSize: '12px', color: '#4A4138', marginTop: '4px', lineHeight: 1.6 }}>
                    การเขียนกิจกรรมควรแบ่งน้ำหนักตามสมรรถนะให้ชัดเจน เพื่อให้สอดคล้องกับคลังอุปกรณ์ 3D ในสัปดาห์นั้น ๆ และกำหนด Rubrics การประเมินผลก่อนเริ่มสอนเพื่อความเป็นธรรมในการให้คะแนน
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'ar3d' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E4D3A', marginBottom: '16px', marginTop: 0 }}>
                🎨 ระบบจัดการคลังอุปกรณ์เสมือนจริง AR & 3D Items Manager
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                เครื่องมือจัดทำอุปกรณ์งานโรงแรมให้มีภาพพรีวิวสตูดิโอ 3 มิติเสมือนจริง โดยรองรับการอัปโหลดไฟล์รูปถ่ายจริงจากหน้าบาร์เครื่องดื่มหรือโต๊ะอาหารของวิทยาลัย เพื่อประกอบการเรียนการสอนโดยไม่ต้องตั้งค่า Mesh ยุ่งยาก
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div style={{ background: '#F5F0E6', padding: '14px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1E4D3A' }}>การสร้างและเพิ่มรูปภาพแบบจำลอง 3D:</div>
                  <ul style={{ paddingLeft: '20px', fontSize: '12px', color: '#4A4138', marginTop: '6px', lineHeight: 1.8 }}>
                    <li><strong>🔨 โหมดสร้างแบบจำลอง (ด้วยตัวเอง):</strong> กรอกชื่ออุปกรณ์ รายละเอียด เลือกรูปประเภทสิ่งของ และคลิกปุ่ม <strong>"📤 อัพไฟล์ภาพ"</strong> เพื่ออัปโหลดไฟล์ภาพ JPEG/PNG จากโทรศัพท์มือถือหรือคอมพิวเตอร์พรีวิวได้ทันที</li>
                    <li><strong>⚡ โหมดสร้างด้วย AI (ระบบอัตโนมัติ):</strong> พิมพ์ชื่อคำค้นหาภาษาอังกฤษของอุปกรณ์ (เช่น Wine glass, Soup spoon) ระบบ AI จะแมปวิเคราะห์สร้างภาพพรีวิวสตูดิโอโมเดล 3D ที่สมบูรณ์แบบให้อัตโนมัติ</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'scenario' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E4D3A', marginBottom: '16px', marginTop: 0 }}>
                ⚡ ระบบจำลองบทบาทบทสนทนาโต้ตอบ AI Scenario Creator
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                สร้างระบบจำลองบทสนทนาจำลองในภัตตาคารหรู เพื่อให้นักเรียนฝึกพูดทักษะการโรงแรมด้วยภาษาอังกฤษโต้ตอบกับลูกค้า AI (Gemini) และวาดภาพประกอบสถานการณ์เพื่อความสมจริง
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div style={{ background: '#FBF6E9', borderLeft: '4px solid #A6882A', padding: '14px', borderRadius: '0 8px 8px 0' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#A6882A' }}>ฟังก์ชันการจำลองภาพแบบ Dynamic Art:</div>
                  <p style={{ fontSize: '12px', color: '#4A4138', marginTop: '4px', lineHeight: 1.6 }}>
                    ระบบจะเจนรูปภาพ Dynamic SVG Poster ประกอบสถานการณ์เรียนรู้ให้เข้ากับชื่อหัวข้อ บทบาทสมมติ และบทสนทนาของคาบเรียนนั้น ๆ อัตโนมัติ โดยผู้สอนสามารถแก้ไขบทพูด ลบ หรือเพิ่มรายละเอียดโจทย์ได้ยืดหยุ่น
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'assignments' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E4D3A', marginBottom: '16px', marginTop: 0 }}>
                📋 ระบบงานและกิจกรรมวิชาชีพ (Tasks & Activities Console)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                ระบบตรวจงานและให้คะแนนรายสัปดาห์ ช่วยให้ครูโรงแรมสามารถประเมินทักษะและบันทึกคะแนนสะสมย้อนหลังจากการสแกนโมเดล AR หรือการสนทนาโต้ตอบของนักเรียน
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div style={{ background: '#EAF3EE', borderLeft: '4px solid #1E4D3A', padding: '14px', borderRadius: '0 8px 8px 0' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1E4D3A' }}>วิธีการตรวจคะแนนชิ้นงานส่งสะสม:</div>
                  <ul style={{ paddingLeft: '20px', fontSize: '12px', color: '#4A4138', marginTop: '6px', lineHeight: 1.8 }}>
                    <li><strong>ขั้นที่ 1:</strong> เปิดดูรายการงานและคลิกปุ่ม **"📊 รายงานส่งงาน"**</li>
                    <li><strong>ขั้นที่ 2:</strong> ตรวจสอบประวัติการส่งชิ้นงานของนักเรียน (เช่น ภาพแคปเจอร์สแกนกล้อง AR หรือไฟล์คลิปบันทึกเสียงสนทนา)</li>
                    <li><strong>ขั้นที่ 3:</strong> ใส่เกรดคะแนนจริง และเขียนคำวิจารณ์คำติชม (Teacher Feedback) รายบุคคลเพื่อชี้แนะแนวทางพัฒนาเชิงทักษะ</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'students' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E4D3A', marginBottom: '16px', marginTop: 0 }}>
                👥 ระบบทะเบียนและรับรองสมรรถนะนักเรียน (Student Registry & Certification)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                ทะเบียนข้อมูลประวัตินักเรียนและระบบการให้คะแนนถ่วงน้ำหนักรวมแบบ KSA-C (Knowledge 20% · Skill 30% · Attribute 10% · Competency 40%) เพื่อการออกเกียรติบัตรรับรองสมรรถนะวิชาชีพโรงแรมปลายภาค
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div style={{ background: '#F5F0E6', padding: '14px', borderRadius: '8px', border: '1px solid #EDE9E1' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#A6882A' }}>เกณฑ์การผ่านรับรองสมรรถนะวิชาชีพ:</div>
                  <ul style={{ paddingLeft: '20px', fontSize: '12px', color: '#4A4138', marginTop: '6px', lineHeight: 1.8 }}>
                    <li>1. คะแนนในแต่ละมิติ (K, S, A, C) ต้อง **ไม่ต่ำกว่า 60%**</li>
                    <li>2. ผลสัมฤทธิ์คะแนนเฉลี่ยถ่วงน้ำหนักรวมสะสมปลายภาคเรียน ต้อง **ไม่ต่ำกว่า 70%**</li>
                    <li>3. เมื่อผ่านเกณฑ์ครบถ้วน ระบบจะเปิดปุ่ม **"🖨️ พิมพ์ใบรับรองสมรรถนะ (PDF)"** บนแถบประวัตินักเรียนทันที</li>
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
