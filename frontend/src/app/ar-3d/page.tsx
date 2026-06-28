'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface AR3DItem {
  id: string
  nameEn: string
  nameTh: string
  pronounce: string
  sentence: string
  desc: string
  imageUrl: string
}

// Fallback items if localStorage is empty
const defaultAr3dItems: AR3DItem[] = [
  { id: 'item-001', nameEn: 'Espresso Coffee Cup', nameTh: 'แก้วกาแฟเอสเปรสโซ่', pronounce: '/es-pres-oh kup/', sentence: 'Please serve the double espresso in a pre-heated cup.', desc: 'ถ้วยเซรามิกขนาดเล็ก (Demitasse) สำหรับเสิร์ฟกาแฟเอสเปรสโซ่ พร้อมจานรอง', imageUrl: '/images/espresso_cup_3d.png' },
  { id: 'item-002', nameEn: 'Cocktail Shaker', nameTh: 'กระบอกเขย่าค็อกเทล', pronounce: '/kok-teyl shey-ker/', sentence: 'Pour the ingredients into the cocktail shaker with ice.', desc: 'กระบอกโลหะแฮนด์ทัมเบลอร์สำหรับใช้เขย่าผสมเครื่องดื่มและกรองน้ำแข็งออก', imageUrl: '/images/cocktail_shaker_3d.png' },
  { id: 'item-003', nameEn: 'Wine Glass', nameTh: 'แก้วไวน์แดง', pronounce: '/wahyn glas/', sentence: 'Hold the wine glass by the stem to prevent warming the wine.', desc: 'แก้วคริสตัลทรงกว้างรูปทรงดอกทิวลิปสำหรับจับเสิร์ฟเครื่องดื่มไวน์แดงเพื่อรับกลิ่นหอม', imageUrl: '/images/wine_glass_3d.png' },
  { id: 'item-004', nameEn: 'Soup Spoon', nameTh: 'ช้อนตักซุป', pronounce: '/soop spoon/', sentence: 'Place the soup spoon on the right side of the dinner plate.', desc: 'ช้อนตักซุปปลายมนหัวกลมกว้างออกแบบพิเศษสำหรับการรับประทานอาหารประเภทซุปใสหรือซุปข้น', imageUrl: '/images/soup_spoon_3d.png' },
  { id: 'item-005', nameEn: 'Dinner Plate', nameTh: 'จานอาหารหลัก', pronounce: '/din-er pleyt/', sentence: 'Serve the main course on a warm dinner plate.', desc: 'จานกระเบื้องเซรามิกสีขาวขนาดเส้นผ่านศูนย์กลาง 10-12 นิ้วสำหรับจัดเสิร์ฟอาหารจานหลักหลักสูตรสากล', imageUrl: '/images/plate_3d.png' }
]

export default function AR3DPage() {
  const [arItems, setArItems] = useState<AR3DItem[]>([])
  const [selected, setSelected] = useState<AR3DItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRotating, setIsRotating] = useState(true) // สำหรับควบคุม CSS 360 Rotation Animation
  const [speaking, setSpeaking] = useState<string | null>(null)

  // 1. โหลดข้อมูลแบบไดนามิกจาก localStorage คีย์เดียวกับที่คุณครูบริหารจัดการ
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('arItems')
      let loadedItems: AR3DItem[] = []
      if (stored) {
        try {
          loadedItems = JSON.parse(stored)
        } catch (e) {
          loadedItems = defaultAr3dItems
        }
      } else {
        loadedItems = defaultAr3dItems
        localStorage.setItem('arItems', JSON.stringify(defaultAr3dItems))
      }
      setArItems(loadedItems)

      // 2. ตรวจหาพารามิเตอร์ scanId เพื่อประมวลผลการสแกน QR Code เปิดอัตโนมัติ
      const params = new URLSearchParams(window.location.search)
      const scanId = params.get('scanId')
      if (scanId) {
        const matched = loadedItems.find(item => item.id === scanId)
        if (matched) {
          setSelected(matched)
          // แจ้งเตือนเล็กน้อยเพื่อให้ทราบว่าสแกนสำเร็จ
          alert(`⚡ สแกนสำเร็จ! กำลังเปิดโมเดล 3D ของ "${matched.nameEn}"`)
        }
      }
    }
  }, [])

  // ฟังก์ชันออกเสียงคำศัพท์ภาษาอังกฤษ
  function speak(text: string, id: string) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const ut = new SpeechSynthesisUtterance(text)
      ut.lang = 'en-US'
      ut.rate = 0.85
      setSpeaking(id)
      ut.onend = () => setSpeaking(null)
      window.speechSynthesis.speak(ut)
    }
  }

  const filtered = arItems.filter(item => 
    item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameTh.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-content no-nav" style={{ background: '#FDFAF4', minHeight: '100vh', paddingBottom: '90px' }}>
      
      {/* Header — Luxury styling matching student explorer */}
      <div style={{
        background: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)',
        padding: '52px 20px 24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '2.5px solid #C9A84C'
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Link href="/student/dashboard" className="premium-back-btn">
            ‹
          </Link>
          <div style={{ textAlign: 'center' }}>
            <span style={{ background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', fontSize: 10, fontWeight: 800, padding: '2px 12px', borderRadius: 100, letterSpacing: '0.8px' }}>
              AR & 3D LEARNING
            </span>
            <h1 style={{ fontSize: 17, fontWeight: 800, margin: '4px 0 0' }}>ระบบกล้องสแกน AR อุปกรณ์</h1>
          </div>
          <div style={{ width: 36 }} />
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', marginTop: 14 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
          <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ค้นหาอุปกรณ์ 3D เช่น Wine Glass, Soup Spoon..." 
            style={{
              width: '100%', padding: '12px 12px 12px 42px', background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 14, color: 'white',
              fontFamily: 'var(--font-primary)', fontSize: 13, outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Title section */}
      <div style={{ padding: '16px 16px 0', fontSize: 12, fontWeight: 700, color: '#1E4D3A' }}>
        คลังอุปกรณ์โต้ตอบได้ทั้งหมด ({filtered.length} รายการ)
      </div>

      {/* Main Grid List */}
      <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map(item => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            style={{
              background: 'white', borderRadius: 20, padding: 12,
              border: '1.5px solid rgba(237,233,225,0.80)',
              display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16,43,31,0.03)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {/* 3D Box preview thumbnail */}
            <div style={{
              height: 100, background: '#0D0F0E', borderRadius: 14,
              border: '1px solid rgba(201,168,76,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
            }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'white', fontSize: 24 }}>🍽️</span>
              )}
              <span style={{ position: 'absolute', top: 6, right: 6, background: 'linear-gradient(135deg, #102B1F, #1E4D3A)', color: '#C9A84C', fontSize: 8, fontWeight: 900, padding: '2px 6px', borderRadius: 6 }}>
                3D VIEW
              </span>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1A1410', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.nameEn}</div>
              <div style={{ fontSize: 11, color: '#A6882A', fontWeight: 700, marginTop: 1 }}>{item.nameTh}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL: 3D AR VIEW ENGINE (โหมดสแกนโต้ตอบ) ── */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.6)',
          zIndex: 1300, display: 'flex', alignItems: 'flex-end'
        }} onClick={() => setSelected(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 500, margin: '0 auto',
              background: '#FDFAF4', borderRadius: '24px 24px 0 0',
              padding: '20px 20px 36px', maxHeight: '92vh', display: 'flex',
              flexDirection: 'column', animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div style={{ width: 36, height: 4, background: '#EDE9E1', borderRadius: 100, margin: '0 auto 16px', flexShrink: 0 }} />

            {/* Title block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1E4D3A', margin: 0 }}>🎥 3D AR Simulator</h3>
                <span style={{ fontSize: 11, color: '#A6882A', fontWeight: 700 }}>สัมผัสวัตถุจำลอง 3 มิติเสมือนจริง</span>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none',
                  background: '#EDE9E1', color: '#4A4138', fontWeight: 'bold',
                  fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >✕</button>
            </div>

            {/* 🔮 INTERACTIVE 3D VIEWER WINDOW */}
            <div style={{
              height: 240, background: '#0a0a0a', borderRadius: 18,
              border: '2px solid #C9A84C', display: 'flex', alignItems: 'center',
              justifyContent: 'center', position: 'relative', overflow: 'hidden',
              boxShadow: 'inset 0 0 32px rgba(0,0,0,0.95), 0 8px 24px rgba(16,43,31,0.1)'
            }}>
              {/* Starry tech mesh background */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle, #fff 10%, transparent 11%) 0 0/12px 12px' }} />

              {/* 🔄 Rotatable Image Container */}
              <div 
                className={isRotating ? 'rotate-animation' : ''} 
                style={{
                  width: 140, height: 140, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'transform 0.4s'
                }}
              >
                {selected.imageUrl ? (
                  <img 
                    src={selected.imageUrl} 
                    alt={selected.nameEn} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))' }} 
                  />
                ) : (
                  <span style={{ fontSize: 72 }}>🍽️</span>
                )}
              </div>

              {/* Hologram rotate ring under the item */}
              <div style={{
                position: 'absolute', bottom: 35, width: 150, height: 24,
                borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.3)',
                background: 'rgba(201,168,76,0.05)', transform: 'rotateX(75deg)',
                boxShadow: '0 0 15px rgba(201,168,76,0.3)', pointerEvents: 'none'
              }} />

              {/* Active controls inside overlay */}
              <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 6 }}>
                <button 
                  onClick={() => setIsRotating(!isRotating)}
                  style={{
                    background: 'rgba(16,43,31,0.85)', color: '#FDFAF4', border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {isRotating ? '⏸️ หยุดหมุน' : '🔄 หมุนรอบ'}
                </button>
              </div>

              <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(201,168,76,0.2)', border: '1px solid #C9A84C', color: '#C9A84C', fontSize: 8.5, fontWeight: 900, padding: '2px 8px', borderRadius: 6, letterSpacing: '0.8px' }}>
                ✦ 3D SIMULATION
              </span>
            </div>

            {/* Metadata Information Area */}
            <div style={{ marginTop: 14, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: 18, fontWeight: 850, color: '#1E4D3A', margin: 0 }}>{selected.nameEn}</h4>
                  <p style={{ fontSize: 12.5, color: '#A6882A', fontWeight: 700, margin: '2px 0 0' }}>{selected.nameTh}</p>
                </div>
                
                <button 
                  onClick={() => speak(selected.nameEn, 'item-pron')}
                  style={{
                    background: speaking === 'item-pron' ? '#1E4D3A' : '#EAF3EE',
                    color: speaking === 'item-pron' ? 'white' : '#1E4D3A',
                    border: 'none', borderRadius: 100, width: 34, height: 34,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14
                  }}
                  title="ฟังคำอ่านเสียง"
                >
                  🔊
                </button>
              </div>

              {selected.pronounce && (
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#8C8272', marginTop: 4 }}>
                  คำอ่านสัทอักษร: {selected.pronounce}
                </div>
              )}

              {/* Description box */}
              <div style={{ background: 'white', borderRadius: 14, padding: '12px 14px', border: '1px solid #EDE9E1', marginTop: 12, textAlign: 'left' }}>
                <span style={{ fontSize: 9.5, color: '#A6882A', fontWeight: 800, display: 'block', marginBottom: 4, letterSpacing: '0.5px' }}>📋 คำอธิบายหน้าทีใช้อุปกรณ์</span>
                <p style={{ fontSize: 12.5, color: '#4A4138', margin: 0, lineHeight: 1.6 }}>{selected.desc}</p>
              </div>

              {/* Example sentence box */}
              <div style={{ background: '#EAF3EE', borderRadius: 14, padding: '12px 14px', border: '1.5px solid rgba(30,77,58,0.08)', marginTop: 10, textAlign: 'left' }}>
                <span style={{ fontSize: 9.5, color: '#1E4D3A', fontWeight: 800, display: 'block', marginBottom: 4, letterSpacing: '0.5px' }}>🗣️ ประโยคภาษาอังกฤษตัวอย่าง</span>
                <p style={{ fontSize: 13, color: '#1E4D3A', fontWeight: 700, fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>"{selected.sentence}"</p>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Link 
                  href="/chat"
                  style={{
                    flex: 1, padding: '12px', borderRadius: 14, border: '1.5px solid #1E4D3A',
                    background: 'transparent', color: '#1E4D3A', fontWeight: 800, fontSize: 13,
                    textAlign: 'center', textDecoration: 'none', fontFamily: 'var(--font-primary)'
                  }}
                >
                  💬 สอบถามผู้ช่วย AI
                </Link>
                <button 
                  onClick={() => alert('จำลองการสแกนกล้อง AR (Augmented Reality) คัดส่องผ่านกล้องถ่ายรูปจริงเสร็จสมบูรณ์!')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 14, border: 'none',
                    background: 'linear-gradient(135deg, #102B1F, #1E4D3A)', color: 'white',
                    fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-primary)'
                  }}
                >
                  📱 ส่องกล้อง AR จริง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 360 rotation keyframe styling */}
      <style jsx global>{`
        @keyframes rotate3dItem {
          0% { transform: rotateY(0deg) rotateX(8deg); }
          50% { transform: rotateY(180deg) rotateX(-4deg); }
          100% { transform: rotateY(360deg) rotateX(8deg); }
        }
        .rotate-animation {
          animation: rotate3dItem 8s linear infinite;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
