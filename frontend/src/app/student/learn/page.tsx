'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'

interface LessonPlan {
  id: string
  title: string
  subject: string
  level: string
  term: string
  duration: string
  targetClass: string
  weeks: string
  concept: string
  objectivesK: string[]
  objectivesS: string[]
  objectivesA: string[]
  objectivesAP: string[]
  vocabulary: string[]
  sentences: string[]
  activitiesLead: string
  activitiesF: string
  activitiesI: string
  activitiesN: string
  activitiesE: string
  activitiesWrap: string
  teacherName?: string
  teacherEmail?: string
}

const fallbackPlans: LessonPlan[] = [
  {
    id: 'plan-w1',
    title: 'หน่วยที่ 1: Restaurant Equipment Vocabulary',
    subject: '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service) (2-2-3)',
    level: 'ปวช.1 สาขาวิชาการโรงแรม',
    term: 'ภาคเรียนที่ 1',
    duration: '4 ชั่วโมง (240 นาที)',
    targetClass: 'ปวช.1/1',
    weeks: 'สัปดาห์ที่ 1',
    concept: 'การเรียนรู้คำศัพท์และอุปกรณ์ในห้องอาหารเป็นพื้นฐานสำคัญของการปฏิบัติงานบริการอาหารและเครื่องดื่ม ผู้เรียนจำเป็นต้องมีความรู้เกี่ยวกับชื่ออุปกรณ์ หน้าที่ วิธีการใช้งาน และสามารถสื่อสารภาษาอังกฤษในบริบทงานบริการได้อย่างถูกต้อง โดยบูรณาการ FINE Model 3D ร่วมกับเทคโนโลยี AR, AI และ Simulation-Based Learning',
    objectivesK: [
      'บอกชื่ออุปกรณ์ในห้องอาหารประเภท Cutlery, Glassware เป็นภาษาอังกฤษได้ถูกต้อง',
      'อธิบายหน้าที่และการใช้งานของอุปกรณ์บนโต๊ะอาหารแต่ละประเภทได้',
      'อธิบายหลักการจัดวางอุปกรณ์บนโต๊ะอาหารตามมาตรฐานแบบ Casual และ Formal ได้'
    ],
    objectivesS: [
      'ออกเสียงคำศัพท์อุปกรณ์และพูดประโยคสื่อสารผ่านระบบ AI ได้ถูกต้องตามหลักสัทศาสตร์',
      'ใช้เทคโนโลยี AR เพื่อสแกนและเรียนรู้โมเดลอุปกรณ์ 3D ได้อย่างคล่องแคล่ว',
      'จำแนกและจัดวางอุปกรณ์บนโต๊ะอาหารในสถานการณ์จำลอง (Simulation) ได้ถูกต้องตามหลัก Outside-In'
    ],
    objectivesA: [
      'มีความรับผิดชอบและวินัยในการปฏิบัติงานตามขั้นตอน',
      'มีความกล้าแสดงออกและมั่นใจในการใช้ภาษาอังกฤษเพื่อการสื่อสาร',
      'มีทักษะการทำงานร่วมกับผู้อื่นในฐานะทีมงานบริการ (Teamwork)',
      'เจตคติที่ดีและมีจิตบริการ (Service Mind) ต่อวิชาชีพการโรงแรม'
    ],
    objectivesAP: [
      'เลือกใช้อุปกรณ์ในห้องอาหารได้เหมาะสมกับประเภทการบริการ',
      'จัดวางอุปกรณ์บนโต๊ะอาหารตามสถานการณ์ที่กำหนดได้อย่างถูกต้อง',
      'ประยุกต์ใช้คำศัพท์ภาษาอังกฤษในการอธิบายอุปกรณ์และการจัดโต๊ะอาหารในสถานการณ์จำลองได้'
    ],
    vocabulary: [
      'Cutlery: Dinner Fork, Dinner Knife, Soup Spoon, Dessert Spoon, Teaspoon',
      'Glassware: Water Goblet, Red Wine Glass, White Wine Glass, Juice Glass, Champagne Glass'
    ],
    sentences: [
      'This is a [Equipment Name].',
      'It is used for [Function].',
      'We use [Equipment Name] for [Action].'
    ],
    activitiesLead: 'ครูเปิดวิดีโอ Food & Beverage Terminology Explained เพื่อกระตุ้นความคิดเรื่องอุปกรณ์ และชวนคิดเรื่องผลกระทบของการหยิบอุปกรณ์ผิดประเภท',
    activitiesF: 'ครูแจกใบงานคำศัพท์สแกน QR Code ดูโมเดล AR 3D (Cutlery / Glassware) จับคู่คำศัพท์ภาษาอังกฤษกับภาพโมเดล และใช้ AI Scan วิเคราะห์อุปกรณ์จริง',
    activitiesI: 'ฝึกออกเสียงคำศัพท์และแต่งประโยคระบุหน้าที่ผ่านระบบ Gemini และ Gemini Live และจัดกิจกรรมคู่หู (Pair Work) ถามตอบชิ้นอุปกรณ์',
    activitiesN: 'ทำกิจกรรมกลุ่ม "Restaurant Table Setup Challenge" แข่งจัดโต๊ะอาหารแบบเป็นทางการ (Formal Western) ตามหลัก Outside-In',
    activitiesE: 'ตัวแทนกลุ่มนำเสนอผลงานจัดโต๊ะเป็นภาษาอังกฤษ, ทำแบบทดสอบศัพท์ในห้องเรียนออนไลน์ (Quiz), ประเมินรายบุคคล',
    activitiesWrap: 'ครูและผู้เรียนสรุปหลักการร่วมกันเกี่ยวกับการจัดอุปกรณ์ และทำ Exit Ticket สรุปคำศัพท์ 5 คำก่อนออกจากห้องเรียน'
  }
]

export default function StudentLearnPage() {
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null)
  const { user } = useRole()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lessonPlans')
      let list: LessonPlan[] = []
      if (stored) {
        try {
          list = JSON.parse(stored)
        } catch (e) {}
      }
      
      if (!list || list.length === 0) {
        list = fallbackPlans
      }

      // Filter: only show plans matching the student's registered teacher
      // If student registered via invitation link, user.teacherName holds the teacher
      const studentTeacher = user?.teacherName || 'ครูสมหญิง รักเรียน'

      const filtered = list.filter(p => {
        const planTeacher = p.teacherName || 'ครูสมหญิง รักเรียน'
        return planTeacher.trim().toLowerCase() === studentTeacher.trim().toLowerCase()
      })

      setPlans(filtered)
      if (filtered.length > 0) {
        setExpandedPlanId(filtered[0].id)
      } else {
        setExpandedPlanId(null)
      }
    }
  }, [user])

  function togglePlan(id: string) {
    setExpandedPlanId(prev => (prev === id ? null : id))
  }

  return (
    <div className="page-content" style={{ paddingBottom: '80px', textAlign: 'left' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #102B1F, #1E4D3A)', padding: '52px var(--space-4) var(--space-5)', color: 'white' }}>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 800, margin: 0 }}>📚 แผนการจัดกิจกรรมตามหลักสูตรครูพิมพ์</h1>
        <p style={{ color: 'rgba(253,250,244,0.75)', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>
          เรียนรู้ทักษะ F&B และการบริการอาหารตามโครงสร้างหน่วยการจัดกิจกรรม 5 มิติ
        </p>
      </div>

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Dynamic List from Teacher's Lesson Plans */}
        {plans.map((plan, index) => {
          const isExpanded = expandedPlanId === plan.id
          return (
            <div key={plan.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #EDE9E1', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              
              {/* Plan Row Header */}
              <div
                onClick={() => togglePlan(plan.id)}
                style={{
                  background: index % 2 === 0 ? '#EAF3EE' : '#FBF6E9',
                  padding: '16px', display: 'flex', alignItems: 'center', gap: '14px',
                  cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s'
                }}
              >
                <div style={{ width: 36, height: 36, background: index % 2 === 0 ? '#1E4D3A' : '#A6882A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '12.5px' }}>
                  W{index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: index % 2 === 0 ? '#1E4D3A' : '#A6882A' }}>{plan.weeks}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#4A4138', marginTop: '2px' }}>{plan.title}</div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {isExpanded ? '▲ ซ่อน' : '▼ ดูแผน'}
                </div>
              </div>

              {/* Course details expanded */}
              {isExpanded && (
                <div style={{ padding: '16px', background: '#FDFAF4', borderTop: '1px solid #EDE9E1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Subject and Target class details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #EDE9E1', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <div>🏷️ วิชา: <span style={{ fontWeight: 700, color: '#1E4D3A' }}>F&B Service</span></div>
                    <div>👥 ระดับชั้น: <span style={{ fontWeight: 700, color: '#1E4D3A' }}>{plan.level}</span></div>
                    <div>⏱️ ระยะเวลา: <span style={{ fontWeight: 700, color: '#1E4D3A' }}>{plan.duration}</span></div>
                    <div>🏫 ห้องเรียน: <span style={{ fontWeight: 700, color: '#1E4D3A' }}>{plan.targetClass}</span></div>
                  </div>

                  {/* Concept */}
                  <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #EDE9E1' }}>
                    <div style={{ fontSize: '11px', color: '#A6882A', fontWeight: 700 }}>💡 สาระสำคัญประจำคาบ:</div>
                    <p style={{ fontSize: '11.5px', color: '#4A4138', marginTop: '4px', lineHeight: '1.6', margin: '4px 0 0 0' }}>
                      {plan.concept}
                    </p>
                  </div>

                  {/* Vocabulary & Target sentences */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                    
                    {plan.vocabulary && plan.vocabulary.length > 0 && (
                      <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #EDE9E1' }}>
                        <div style={{ fontSize: '11.5px', color: '#1E4D3A', fontWeight: 700, marginBottom: '6px' }}>📝 คำศัพท์เป้าหมาย (Vocabulary):</div>
                        {plan.vocabulary.map((voc, i) => (
                          <div key={i} style={{ fontSize: '11px', color: '#4A4138', marginBottom: '3px' }}>
                            • {voc}
                          </div>
                        ))}
                      </div>
                    )}

                    {plan.sentences && plan.sentences.length > 0 && (
                      <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #EDE9E1' }}>
                        <div style={{ fontSize: '11.5px', color: '#1E4D3A', fontWeight: 700, marginBottom: '6px' }}>💬 ประโยคสื่อสารที่ใช้ฝึก (Target Sentences):</div>
                        {plan.sentences.map((sent, i) => (
                          <div key={i} style={{ fontSize: '11px', color: '#4A4138', marginBottom: '3px', fontStyle: 'italic' }}>
                            • {sent}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Objectives KSA Checklist */}
                  <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #EDE9E1' }}>
                    <div style={{ fontSize: '11.5px', color: '#A6882A', fontWeight: 700, marginBottom: '8px' }}>🎯 เป้าหมายการเรียนรู้ (Objectives Checklist):</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {plan.objectivesK?.map((obj, i) => (
                        <div key={i} style={{ fontSize: '11px', color: '#4A4138', display: 'flex', gap: '6px' }}>
                          <span style={{ color: '#1E4D3A' }}>[K]</span> <span>{obj}</span>
                        </div>
                      ))}
                      {plan.objectivesS?.map((obj, i) => (
                        <div key={i} style={{ fontSize: '11px', color: '#4A4138', display: 'flex', gap: '6px' }}>
                          <span style={{ color: '#A6882A' }}>[S]</span> <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FINE Model 5-Step Learning Loop */}
                  <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1E4D3A', margin: '6px 0 0 0' }}>🏃 ขั้นตอนการเรียนรู้ผ่านเทคโนโลยี (FINE 5-Step Loop)</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* Step 1: Lead-in */}
                    <div style={{ background: 'white', border: '1px solid #EDE9E1', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#4A4138' }}>1. ขั้นกระตุ้นคิด (Lead-In)</span>
                        <span style={{ background: '#EDE9E1', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>ห้องเรียน</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 0 0' }}>
                        {plan.activitiesLead}
                      </p>
                    </div>

                    {/* Step 2: Familiarize */}
                    <div style={{ background: 'white', border: '1px solid #EDE9E1', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1E4D3A' }}>2. ขั้นส่องอุปกรณ์ (Familiarize)</span>
                        <span style={{ background: '#EAF3EE', color: '#1E4D3A', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>3D / AR / AI Scan</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 8px 0' }}>
                        {plan.activitiesF}
                      </p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link href="/student/explore" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '10px', borderRadius: '6px', textDecoration: 'none', color: '#A6882A', borderColor: 'rgba(201,168,76,0.3)', fontWeight: 700 }}>
                          👁️ พรีวิว 3D
                        </Link>
                        <Link href="/ai-scan" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '10px', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, border: 'none' }}>
                          📸 เปิดกล้อง AI Scan
                        </Link>
                      </div>
                    </div>

                    {/* Step 3: Interact */}
                    <div style={{ background: 'white', border: '1px solid #EDE9E1', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#A6882A' }}>3. ขั้นโต้ตอบสนทนา (Interact)</span>
                        <span style={{ background: '#FBF6E9', color: '#A6882A', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>Gemini AI</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 8px 0' }}>
                        {plan.activitiesI}
                      </p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link href="/chat" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '10px', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, border: 'none' }}>
                          💬 สนทนาอัจฉริยะ AI Chat
                        </Link>
                      </div>
                    </div>

                    {/* Step 4: Navigate */}
                    <div style={{ background: 'white', border: '1px solid #EDE9E1', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#8B2635' }}>4. ขั้นแก้ปัญหาเฉพาะหน้า (Navigate)</span>
                        <span style={{ background: '#FAE8EB', color: '#8B2635', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>Simulation</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 8px 0' }}>
                        {plan.activitiesN}
                      </p>
                      <Link href="/simulation" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center', padding: '8px 16px', fontSize: '11px', borderRadius: '8px', fontWeight: 700, border: 'none' }}>
                        🎭 เข้าห้องจำลองบทบาทลูกค้า (Start Simulation)
                      </Link>
                    </div>

                    {/* Step 5: Exhibit & Wrap */}
                    <div style={{ background: 'white', border: '1px solid #EDE9E1', borderRadius: '10px', padding: '12px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#4A4138' }}>5. ขั้นประเมินผลงาน (Exhibit & Wrap)</span>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 0 0' }}>
                        • {plan.activitiesE} <br />
                        • {plan.activitiesWrap}
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )
        })}
      </div>

    </div>
  )
}
