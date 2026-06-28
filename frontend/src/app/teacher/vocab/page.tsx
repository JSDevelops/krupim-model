'use client'
import { useState, useEffect } from 'react'

interface Equipment {
  name: string
  nameEn: string
  emoji: string // เก็บได้ทั้ง Emoji หรือรูปภาพแบบ Base64 (data:image)
  use: string
  sentence: string
  ph?: string
}

// ข้อมูลเริ่มต้นใช้ Emoji แบบเดิมไปก่อน
const initialVocabulary: Equipment[] = [
  { name: 'ส้อมอาหาร', nameEn: 'Dinner Fork', emoji: '🍴', use: 'ใช้สำหรับรับประทานอาหารหลัก', sentence: 'This is a dinner fork. It is used for the main course.', ph: '/ˈkʌtləri/' },
  { name: 'มีดอาหาร', nameEn: 'Dinner Knife', emoji: '🔪', use: 'ใช้สำหรับตัดอาหาร', sentence: 'This is a dinner knife. It is used for cutting food.', ph: '/ˈdɪnər naɪf/' },
  { name: 'ช้อนซุป', nameEn: 'Soup Spoon', emoji: '🥄', use: 'ใช้สำหรับตักซุป', sentence: 'This is a soup spoon. It is used for drinking soup.', ph: '/suːp spuːn/' },
  { name: 'แก้วน้ำ', nameEn: 'Water Goblet', emoji: '🍷', use: 'ใช้สำหรับบริการน้ำเปล่า', sentence: 'This is a water goblet. It is used for serving water.', ph: '/ˈwɔːtər ˈɡɒblət/' },
  { name: 'ถ้วยกาแฟ', nameEn: 'Espresso Cup', emoji: '☕', use: 'ใช้สำหรับเสิร์ฟกาแฟเอสเพรสโซ่', sentence: 'This is an espresso cup. It is used for serving espresso.', ph: '/eˈspresəʊ kʌp/' },
  { name: 'แก้วแชมเปญ', nameEn: 'Champagne Flute', emoji: '🥂', use: 'ใช้สำหรับเสิร์ฟแชมเปญ', sentence: 'This is a champagne flute. It is used for serving champagne.', ph: '/ʃæmˈpeɪn fluːt/' },
]

export default function TeacherVocabPage() {
  const [vocabList, setVocabList] = useState<Equipment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  
  // States สำหรับ Modal ฟอร์ม
  const [showModal, setShowModal] = useState(false)
  const [nameEn, setNameEn] = useState('')
  const [name, setName] = useState('')
  const [ph, setPh] = useState('')
  const [emoji, setEmoji] = useState('🍴') // ใช้เก็บ Base64 หรือ Emoji
  const [use, setUse] = useState('')
  const [sentence, setSentence] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('teacherVocabulary')
      if (stored) {
        try { setVocabList(JSON.parse(stored)) } catch (e) {}
      } else {
        localStorage.setItem('teacherVocabulary', JSON.stringify(initialVocabulary))
        setVocabList(initialVocabulary)
      }
    }
  }, [])

  function saveToLocalStorage(newList: Equipment[]) {
    setVocabList(newList)
    localStorage.setItem('teacherVocabulary', JSON.stringify(newList))
  }

  function openCreateModal() {
    setEditingIndex(null)
    setNameEn('')
    setName('')
    setPh('')
    setEmoji('🍴')
    setUse('')
    setSentence('')
    setShowModal(true)
  }

  function openEditModal(index: number, item: Equipment) {
    setEditingIndex(index)
    setNameEn(item.nameEn)
    setName(item.name)
    setPh(item.ph || '')
    setEmoji(item.emoji)
    setUse(item.use)
    setSentence(item.sentence)
    setShowModal(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. ตรวจเช็คขนาดไฟล์ไม่เกิน 2 MB
    const maxSize = 2 * 1024 * 1024 // 2 Megabytes
    if (file.size > maxSize) {
      alert('ขนาดไฟล์ภาพใหญ่เกิน 2 MB! โปรดลดขนาดรูปภาพหรือเลือกรูปภาพอื่นที่มีขนาดเล็กลง')
      e.target.value = '' // Clear input
      return
    }

    // 2. แปลงรูปเป็น Base64 (1:1 จะจัดการโดยการใช้ CSS Object-Fit: cover ในตัวแสดงผล)
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setEmoji(base64)
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nameEn || !name) return

    const newItem: Equipment = { name, nameEn, emoji, use, sentence, ph }
    let updated = [...vocabList]

    if (editingIndex !== null) {
      updated[editingIndex] = newItem
    } else {
      updated.unshift(newItem)
    }

    saveToLocalStorage(updated)
    setShowModal(false)
  }

  function handleDelete(index: number) {
    if (confirm('คุณต้องการลบคำศัพท์นี้ออกจากคลังหรือไม่?')) {
      const updated = vocabList.filter((_, i) => i !== index)
      saveToLocalStorage(updated)
    }
  }

  const filteredVocab = vocabList.filter(item => 
    item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F6F3F9', paddingBottom: 90 }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #4A126B 0%, #68239F 60%, #7B1FA2 100%)',
        padding: '52px 20px 24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(104,35,159,0.25)'
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <span style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100, display: 'inline-block', marginBottom: 8, letterSpacing: '0.8px' }}>TEACHER PLATFORM</span>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>📖 การจัดการคลังคำศัพท์</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>เพิ่ม แก้ไข ลบ คำศัพท์และตัวอย่างประโยคเพื่อให้แสดงบนแอปนักเรียน</p>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        {/* Controls row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input 
            type="text" 
            placeholder="🔍 ค้นหาคำศัพท์ อังกฤษ/ไทย..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 14,
              border: '1.5px solid #EDE9E1', outline: 'none',
              fontSize: 13.5, background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          />
          <button 
            onClick={openCreateModal}
            style={{
              padding: '0 16px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #4A126B, #68239F)',
              color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(104,35,159,0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            ➕ เพิ่มคำศัพท์
          </button>
        </div>

        {/* Vocab count */}
        <div style={{ fontSize: 12, color: '#8C8272', fontWeight: 700 }}>
          คำศัพท์ทั้งหมด {filteredVocab.length} รายการ
        </div>

        {/* Vocab cards list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredVocab.map((item, index) => (
            <div 
              key={index} 
              style={{
                background: 'white', borderRadius: 18, padding: '14px 16px',
                border: '1px solid #EDE9E1', boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex', alignItems: 'center', gap: 14
              }}
            >
              {/* รูปภาพอัตราส่วน 1:1 ขนาด 48px พร้อมขอบโค้ง */}
              <div style={{
                width: 48, height: 48, background: '#F6F3F9',
                borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '1.5px solid rgba(123,31,162,0.1)', flexShrink: 0
              }}>
                {item.emoji && item.emoji.startsWith('data:image') ? (
                  <img src={item.emoji} alt={item.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 26 }}>{item.emoji}</span>
                )}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 14.5, color: '#1A1410' }}>{item.nameEn}</span>
                  {item.ph && <span style={{ fontSize: 10, color: '#8C8272', fontFamily: 'monospace' }}>{item.ph}</span>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#68239F', marginTop: 1 }}>{item.name}</div>
                <div style={{ fontSize: 10.5, color: '#8C8272', marginTop: 4, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>วิธีใช้: </strong>{item.use}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  onClick={() => openEditModal(index, item)}
                  style={{
                    width: 32, height: 32, borderRadius: 10, border: 'none',
                    background: '#F0EAF8', color: '#68239F', cursor: 'pointer',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="แก้ไข"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(index)}
                  style={{
                    width: 32, height: 32, borderRadius: 10, border: 'none',
                    background: '#FAE8EB', color: '#8B2635', cursor: 'pointer',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="ลบ"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CREATE / EDIT DIALOG (MODAL POPUP) ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(74,18,107,0.4)',
          zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }} onClick={() => setShowModal(false)}>
          <form 
            onSubmit={handleSubmit}
            onClick={e => e.stopPropagation()} 
            style={{
              background: 'white', borderRadius: 24, padding: '24px',
              width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 14,
              boxShadow: '0 12px 36px rgba(0,0,0,0.15)', animation: 'scaleUp 0.25s ease'
            }}
          >
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#4A126B', margin: 0 }}>
                {editingIndex !== null ? '✏️ แก้ไขคำศัพท์' : '➕ เพิ่มคำศัพท์ใหม่'}
              </h3>
              <p style={{ fontSize: 11.5, color: '#8C8272', margin: '2px 0 0' }}>อัปเดตรูปภาพจริงขนาด 1:1 (ไม่เกิน 2MB) พร้อมความหมายคำศัพท์</p>
            </div>

            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {/* 📸 Image Upload Field with 1:1 Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px', background: '#F6F3F9', borderRadius: 16, border: '1.5px dashed rgba(123,31,162,0.2)' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 12, background: 'white',
                  border: '1.5px solid #EDE9E1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', position: 'relative'
                }}>
                  {emoji && emoji.startsWith('data:image') ? (
                    <img src={emoji} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 32 }}>{emoji || '🍴'}</span>
                  )}
                </div>
                
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ fontSize: 11.5, width: '100%', maxWidth: '220px', color: '#68239F' }}
                />
                <span style={{ fontSize: 10, color: '#8C8272' }}>อัตราส่วนภาพแนะนำ 1:1 ขนาดสูงสุดไม่เกิน 2 MB</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 10, alignItems: 'center' }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>คำอังกฤษ</label>
                <input 
                  type="text" 
                  value={nameEn} 
                  onChange={e => setNameEn(e.target.value)} 
                  placeholder="เช่น Water Goblet" 
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none' }}
                  required
                />

                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>คำสัทอักษร</label>
                <input 
                  type="text" 
                  value={ph} 
                  onChange={e => setPh(e.target.value)} 
                  placeholder="เช่น /ˈwɔːtər ˈɡɒblət/" 
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none' }}
                />

                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>คำแปลไทย</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="เช่น แก้วน้ำเปล่า" 
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none' }}
                  required
                />

                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>วิธีใช้งาน</label>
                <textarea 
                  value={use} 
                  onChange={e => setUse(e.target.value)} 
                  placeholder="เช่น ใช้สำหรับตั้งวางทางด้านขวาของจานหลัก" 
                  rows={2}
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  required
                />

                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>ตัวอย่างประโยค</label>
                <textarea 
                  value={sentence} 
                  onChange={e => setSentence(e.target.value)} 
                  placeholder="เช่น Would you like some water, sir?" 
                  rows={2}
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #EDE9E1', background: 'white', color: '#8C8272', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
              <button 
                type="submit"
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #4A126B, #68239F)', color: 'white', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                💾 บันทึกคำศัพท์
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
