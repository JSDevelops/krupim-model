'use client'
import { useState, useEffect } from 'react'
import { useRole } from '@/context/RoleContext'

interface KsaDetail {
  key: 'K' | 'S' | 'A' | 'C'
  label: string
  labelEn: string
  score: number
  icon: string
  color: string
  bg: string
  items: string[]
}

const defaultKsaList: KsaDetail[] = [
  { key: 'K', label: 'ความรู้', labelEn: 'Knowledge', score: 80, icon: '📚', color: '#1E4D3A', bg: '#EAF3EE', items: ['คำศัพท์ร้านอาหาร', 'ระดับมาตรฐานจัดโต๊ะ', 'ประโยคภาษาอังกฤษงานบาร์'] },
  { key: 'S', label: 'ทักษะปฏิบัติ', labelEn: 'Skills', score: 75, icon: '🎯', color: '#A6882A', bg: '#FBF6E9', items: ['การสแกนกล้อง AR', 'การจัดสเกลจานช้อนส้อม', 'การจำลองบทสนทนา AI'] },
  { key: 'A', label: 'เจตคติวิชาชีพ', labelEn: 'Attitude', score: 82, icon: '💫', color: '#C9A84C', bg: '#FBF6E9', items: ['ตรงต่อเวลาส่งงาน', 'จิตวิญญาณงานบริการ', 'ความมุ่งมั่นพัฒนาตนเอง'] },
  { key: 'C', label: 'สมรรถนะความพร้อม', labelEn: 'Competency', score: 70, icon: '⭐', color: '#1E4D3A', bg: '#EAF3EE', items: ['แก้ปัญหาเฉพาะหน้าเสิร์ฟ', 'สื่อสารภาษาอังกฤษคล่องตัว', 'ความพร้อมปฏิบัติงานจริง'] },
]

const weeklyActivityLogs = [
  { day: 'จ', count: 2 },
  { day: 'อ', count: 5 },
  { day: 'พ', count: 3 },
  { day: 'พฤ', count: 6 },
  { day: 'ศ', count: 8 },
  { day: 'ส', count: 1 },
  { day: 'อา', count: 4 }
]

export default function StudentProgressPage() {
  const { user } = useRole()
  const [registryStudent, setRegistryStudent] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const stored = localStorage.getItem('classroomStudents')
      if (stored) {
        try {
          const list = JSON.parse(stored)
          const found = list.find((s: any) => s.name === user.name)
          if (found) {
            setRegistryStudent(found)
          }
        } catch (e) {}
      }
    }
  }, [user])

  const kScore = registryStudent?.ksa?.K ?? 80
  const sScore = registryStudent?.ksa?.S ?? 75
  const aScore = registryStudent?.ksa?.A ?? 82
  const cScore = registryStudent?.ksa?.C ?? 70
  const sessionsCount = registryStudent?.sessions ?? 45

  const ksaData: KsaDetail[] = [
    { ...defaultKsaList[0], score: kScore },
    { ...defaultKsaList[1], score: sScore },
    { ...defaultKsaList[2], score: aScore },
    { ...defaultKsaList[3], score: cScore },
  ]

  const overall = Math.round((kScore * 0.2) + (sScore * 0.3) + (aScore * 0.1) + (cScore * 0.4))
  const isCertified = kScore >= 60 && sScore >= 60 && aScore >= 60 && cScore >= 60 && overall >= 70

  return (
    <div className="page-content" style={{ paddingBottom: '80px', textAlign: 'left' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #102B1F, #1E4D3A)', padding: '52px var(--space-4) var(--space-5)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 800, margin: 0 }}>📊 รายงานความก้าวหน้า KSA-C</h1>
        <p style={{ color: 'rgba(253,250,244,0.75)', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>
          วิเคราะห์สัดส่วนคะแนนสะสมและระดับความพร้อมการออกใบรับรอง
        </p>

        {/* Circular Progress Display Card */}
        <div style={{ background: 'white', color: '#4A4138', borderRadius: '18px', padding: '20px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="38" fill="none" stroke="#EFEBE4" strokeWidth="8"/>
              <circle
                cx="45"
                cy="45"
                r="38"
                fill="none"
                stroke="#1E4D3A"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 38 * overall / 100} ${2 * Math.PI * 38 * (1 - overall / 100)}`}
                transform="rotate(-90 45 45)"
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 850, color: '#1E4D3A' }}>{overall}%</span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>คะแนนรวม</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A' }}>
              {isCertified ? '🏆 ผ่านการรับรองแล้ว' : '⚠️ ยังค้างการประเมิน'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>เข้าใช้งานสะสม: {sessionsCount} ครั้ง</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isCertified ? 'สิทธิ์การพิมพ์ใบประกาศนียบัตร PDF ปลดล็อกแล้ว!' : 'ต้องการคะแนนขั้นต่ำ 60% ในทุกทักษะ และเกรดเฉลี่ยรวม 70%'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Weekly Activities Chart Widget */}
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1E4D3A', margin: '0 0 10px 0' }}>📈 กิจกรรม 7 วันที่ผ่านมา</h2>
          <div style={{ background: 'white', border: '1px solid #EDE9E1', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', paddingBottom: '4px' }}>
              {weeklyActivityLogs.map((log, i) => {
                const heightPct = Math.min((log.count / 10) * 100, 100)
                return (
                  <div key={log.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px' }}>
                    <div style={{ width: '14px', height: '80px', background: '#F5F0E6', borderRadius: '20px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: `${heightPct}%`, background: i === 4 ? '#A6882A' : '#1E4D3A', borderRadius: '20px' }} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{log.day}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', borderTop: '1px solid #EDE9E1', paddingTop: '8px' }}>
              <span>ขั้นต่ำ: 0</span>
              <span>กิจกรรมฝึกทักษะสะสม</span>
              <span>สูงสุด: 10 ครั้ง/วัน</span>
            </div>
          </div>
        </div>

        {/* KSA-C Detailed Dimensions List */}
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1E4D3A', margin: '0 0 12px 0' }}>📋 สรุปรายละเอียดผลสมรรถนะวิชาชีพ</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ksaData.map(k => (
              <div key={k.key} style={{ background: 'white', border: '1px solid #EDE9E1', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, background: k.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '15px' }}>
                    {k.key}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#4A4138' }}>{k.label} ({k.labelEn})</span>
                      <span style={{ fontSize: '14px', fontWeight: 850, color: k.color }}>{k.score}%</span>
                    </div>
                    <div className="progress-bar-wrap" style={{ height: '6px', background: '#EDE9E1', borderRadius: '3px', marginTop: '6px' }}>
                      <div style={{ width: `${k.score}%`, height: '100%', background: k.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '22px' }}>{k.icon}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: '#FBF6E9', padding: '10px', borderRadius: '10px' }}>
                  {k.items.map((item, i) => (
                    <div key={i} style={{ fontSize: '10.5px', color: '#4A4138', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: k.color }}>✓</span> {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
