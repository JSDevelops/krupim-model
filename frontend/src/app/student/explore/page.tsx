'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Equipment {
  name: string
  nameEn: string
  emoji: string
  use: string
  sentence: string
}

const defaultEquipment: Equipment[] = [
  { name: 'ส้อมอาหาร', nameEn: 'Dinner Fork', emoji: '🍴', use: 'ใช้สำหรับรับประทานอาหารหลัก', sentence: 'This is a dinner fork. It is used for the main course.' },
  { name: 'มีดอาหาร', nameEn: 'Dinner Knife', emoji: '🔪', use: 'ใช้สำหรับตัดอาหาร', sentence: 'This is a dinner knife. It is used for cutting food.' },
  { name: 'ช้อนซุป', nameEn: 'Soup Spoon', emoji: '🥄', use: 'ใช้สำหรับตักซุป', sentence: 'This is a soup spoon. It is used for drinking soup.' },
  { name: 'แก้วน้ำ', nameEn: 'Water Goblet', emoji: '🍷', use: 'ใช้สำหรับบริการน้ำเปล่า', sentence: 'This is a water goblet. It is used for serving water.' },
  { name: 'ถ้วยกาแฟ', nameEn: 'Espresso Cup', emoji: '☕', use: 'ใช้สำหรับเสิร์ฟกาแฟเอสเพรสโซ่', sentence: 'This is an espresso cup. It is used for serving espresso.' },
  { name: 'แก้วแชมเปญ', nameEn: 'Champagne Flute', emoji: '🥂', use: 'ใช้สำหรับเสิร์ฟแชมเปญ', sentence: 'This is a champagne flute. It is used for serving champagne.' },
]

const aiResults = [
  { name: 'Wine Glass', nameTh: 'แก้วไวน์', use: 'ใช้สำหรับบริการไวน์แดงหรือไวน์ขาวระหว่างมื้ออาหาร', sentence: 'Would you like a glass of red wine with your steak, sir?', emoji: '🍷' },
  { name: 'Bread Plate', nameTh: 'จานขนมปัง', use: 'จานขนาดเล็กสำหรับวางขนมปังและเนย วางไว้ด้านซ้ายมือของผู้รับบริการ', sentence: 'The bread plate is placed on the left side of your table setting.', emoji: '🍽️' },
  { name: 'Coffee Cup', nameTh: 'ถ้วยกาแฟ', use: 'ใช้สำหรับบริการกาแฟร้อนหรือชาหลังมื้ออาหาร', sentence: 'We serve freshly brewed coffee after the main course.', emoji: '☕' },
]

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'ai'>('qr')
  const [equipment, setEquipment] = useState<Equipment[]>(defaultEquipment)
  const [viewItem, setViewItem] = useState<Equipment | null>(null)
  const [speaking, setSpeaking] = useState<string | null>(null)
  const [scanAnim, setScanAnim] = useState(false)
  const [aiScanned, setAiScanned] = useState(false)
  const [aiItem, setAiItem] = useState<any>(null)
  const [showVocabPopup, setShowVocabPopup] = useState(false) 
  const [scanError, setScanError] = useState('')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // Voice Evaluation States
  const [studentSpeech, setStudentSpeech] = useState('')
  const [speechScore, setSpeechScore] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [speechDiff, setSpeechDiff] = useState<{ text: string; status: 'correct' | 'missing' }[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)

  // จัดการควบคุมสถานะเปิด-ปิดกล้องวิดีโอเมื่อสลับแท็บ
  useEffect(() => {
    if (activeTab === 'ai') {
      startVRCamera()
    } else {
      stopVRCamera()
    }

    return () => {
      stopVRCamera()
    }
  }, [activeTab])

  // ฟังก์ชันสตาร์ทกล้องสตรีมมิ่งสด
  async function startVRCamera() {
    setScanError('')
    try {
      // 1. ลองดึงกล้องหลังสําหรับมือถือ (environment facingMode)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setIsCameraActive(true)
    } catch (e) {
      console.log('Environment camera failed, trying fallback default user camera...', e)
      try {
        // 2. หากหาไม่เจอ (เช่น โน้ตบุ๊ก Mac/PC) ให้เรียกกล้อง Default/FaceTime หน้าเว็บ
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true
        })
        streamRef.current = fallbackStream
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream
          videoRef.current.play()
        }
        setIsCameraActive(true)
      } catch (fallbackErr) {
        console.error('All camera streams failed:', fallbackErr)
        setScanError('ไม่สามารถเชื่อมต่อกล้องถ่ายภาพสดได้ กรุณาตรวจสอบและอนุมัติสิทธิ์การเข้าถึงกล้อง')
        setIsCameraActive(false)
      }
    }
  }
  function stopVRCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  function speak(text: string, id: string) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.onstart = () => setSpeaking(id)
      utterance.onend = () => setSpeaking(null)
      window.speechSynthesis.speak(utterance)
    }
  }

  // เรียกใช้หลังบ้าน /api/scan เพื่อวิเคราะห์ภาพจริงด้วย Gemini Vision
  async function analyzeImage(base64: string, mimeType: string) {
    setScanAnim(true)
    setScanError('')
    setAiScanned(false)
    setAiItem(null)

    try {
      const storedApiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : ''
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const resp = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': storedApiKey
        },
        body: JSON.stringify({ imageBase64: base64, mimeType })
      })

      if (!resp.ok) {
        throw new Error('การสแกนล้มเหลว')
      }

      // แปลงโครงสร้างคำตอบเพื่อให้ตรงกับการนำไปใช้แสดงผล
      const data = await resp.json()
      setAiItem({

        name: data.name_en || 'Unknown Object',
        nameTh: data.name_th || 'ไม่สามารถระบุได้',
        use: data.description || 'ไม่มีรายละเอียดวิธีใช้งานสำหรับอุปกรณ์ชิ้นนี้',
        location: data.location || 'จัดตั้งอยู่บนโต๊ะอาหารสำหรับการใช้ร่วมบริการอาหารจานหลัก',
        sentence: data.english_phrases?.[0] || 'Hello, how can I help you today?',
        tips: data.service_tips || ''
      })
      setAiScanned(true)
    } catch (e) {
      setScanError('ไม่สามารถวิเคราะห์ชิ้นอุปกรณ์นี้ได้ กรุณาลองใหม่')
      // Fallback mock item for demo
      const mock = aiResults[Math.floor(Math.random() * aiResults.length)]
      setAiItem({
        name: mock.name,
        nameTh: mock.nameTh,
        use: mock.use,
        location: 'จัดวางอยู่บนโต๊ะฝั่งขวามือถัดจากจานอาหารหลัก หรือเบิกจากเคาน์เตอร์บาร์น้ำ',
        sentence: mock.sentence,
        tips: 'ควรรักษาความสะอาดเช็ดคราบรอยนิ้วมือก่อนนำเสิร์ฟ'
      })
      setAiScanned(true)
    } finally {
      setScanAnim(false)
    }
  }

  // ฟังก์ชันจับภาพจากวิดีโอสดในแคนวาส (Capture Real-time Frame)
  async function captureVRFrame() {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      // หากกล้องไม่พร้อมให้เรียกตัวเลือกไฟล์แทน
      startVRCamera()
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    try {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        const base64 = dataUrl.split(',')[1]
        await analyzeImage(base64, 'image/jpeg')
      }
    } catch (err) {
      console.error('Frame capture failed:', err)
      setScanError('ไม่สามารถดึงรูปภาพจากกล้องสแกนสดได้')
    }
  }

  function handleTriggerUpload() {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setPreviewImage(dataUrl)
      const base64 = dataUrl.split(',')[1]
      await analyzeImage(base64, file.type)
    }
    reader.readAsDataURL(file)
  }

  // เริ่มอัดเสียงประเมินประโยคภาษาอังกฤษของเด็กนักเรียน
  function startSpeechPractice(targetText: string) {
    if (typeof window === 'undefined') return
    
    // หยุด TTS ที่กําลังเปิดเล่นอยู่ก่อน
    if (window.speechSynthesis) window.speechSynthesis.cancel()

    setStudentSpeech('')
    setSpeechScore(null)
    setSpeechDiff([])
    setIsRecording(true)

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('บราวเซอร์ของคุณไม่สนับสนุนการทำงาน Web Speech API คลื่นเสียงวิเคราะห์')
      setIsRecording(false)
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = false

    rec.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript || ''
      setStudentSpeech(spokenText)
      evaluatePronunciation(spokenText, targetText)
    }

    rec.onerror = (e: any) => {
      console.error('Speech recognition failed in explore page:', e.error)
      setIsRecording(false)
    }

    rec.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = rec
    rec.start()
  }

  // สั่งหยุดตรวจจับบันทึกเสียงและปิดแทร็ค
  function stopSpeechPractice() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  // คำนวณร้อยละและออกเปรียบเทียบคำสะกดแบบเรียลไทม์ (Word-by-word Diff & Match Grade)
  function evaluatePronunciation(spoken: string, target: string) {
    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim()
    
    const targetWords = target.split(/\s+/).map(cleanWord).filter(Boolean)
    const spokenWords = spoken.split(/\s+/).map(cleanWord).filter(Boolean)
    
    let matchedCount = 0
    const diffResult = target.split(/\s+/).map(origWord => {
      const cleaned = cleanWord(origWord)
      const foundIdx = spokenWords.indexOf(cleaned)
      if (foundIdx !== -1) {
        matchedCount++
        // ลบคำที่ถูกจับคู่ออกเพื่อไม่ให้จับคู่ซ้ำ
        spokenWords.splice(foundIdx, 1)
        return { text: origWord, status: 'correct' as const }
      }
      return { text: origWord, status: 'missing' as const }
    })

    const pct = targetWords.length > 0 ? Math.round((matchedCount / targetWords.length) * 100) : 0
    setSpeechScore(pct)
    setSpeechDiff(diffResult)
  }


  const mainDisplayedItems = equipment.slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: '#F3EFE6', paddingBottom: 80 }}>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(160deg, #102B1F 0%, #1E4D3A 55%, #2A6B52 100%)',
        padding: '52px 20px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(201,168,76,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: 20, right: 20, width: 80, height: 80, background: 'rgba(201,168,76,0.06)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.5px' }}>F — FINE MODEL</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', lineHeight: 1.2 }}>Familiarize</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '0 0 20px' }}>สำรวจและเรียนรู้อุปกรณ์ผ่านเทคโนโลยี</p>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: 'rgba(10,8,6,0.5)', borderRadius: 18, padding: 6, gap: 6, border: '1px solid rgba(201,168,76,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', marginBottom: 2 }}>
            {[
              { id: 'qr', icon: '📷', label: 'สแกน QR Code', sub: 'สแกนบัตรอุปกรณ์', activeBg: 'linear-gradient(135deg, #102B1F, #1E4D3A)' },
              { id: 'ai', icon: '✨', label: 'AI Scan', sub: 'วิเคราะห์ถ่ายภาพ', activeBg: 'linear-gradient(135deg, #A6882A, #C9A84C)' },
            ].map(t => {
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  style={{
                    flex: 1, padding: '12px 10px', borderRadius: 14, border: 'none',
                    background: isActive ? t.activeBg : 'transparent',
                    color: 'white',
                    cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive ? '0 4px 16px rgba(0,0,0,0.3), 0 0 8px rgba(255,255,255,0.1)' : 'none',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 3, filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none' }}>{t.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: isActive ? 'white' : 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-primary)' }}>{t.label}</div>
                  <div style={{ fontSize: 9, color: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-primary)', marginTop: 1 }}>{t.sub}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom wave */}
        <svg viewBox="0 0 500 28" style={{ display: 'block', marginTop: 4, width: '100%' }} preserveAspectRatio="none">
          <path d="M0 28 Q125 0 250 16 Q375 32 500 8 L500 28 Z" fill="#F3EFE6"/>
        </svg>
      </div>

      <div style={{ padding: '8px 16px 0' }}>

        {/* === QR SCAN TAB === */}
        {activeTab === 'qr' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* QR Scanner Visual */}
            <Link href="/ar-3d" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)',
                borderRadius: 22, padding: '24px 20px',
                display: 'flex', alignItems: 'center', gap: 18,
                boxShadow: '0 10px 30px rgba(30,77,58,0.35), 0 4px 12px rgba(201,168,76,0.15)',
                border: '2.5px solid #C9A84C',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  width: 58, height: 58, background: 'rgba(255,255,255,0.12)',
                  borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #C9A84C', flexShrink: 0,
                  fontSize: 28,
                  boxShadow: '0 0 14px rgba(201,168,76,0.4) inset',
                }}>📷</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#C9A84C', fontSize: 11, fontWeight: 900, letterSpacing: '1px', marginBottom: 2 }}>🚀 ACTIVE AR CAMERA</div>
                  <div style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>สแกน QR Code อุปกรณ์</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11.5, marginTop: 4, lineHeight: 1.3 }}>ส่องกล้องไปที่รูปอุปกรณ์เพื่อเปิดภาพ 3D AR</div>
                </div>
                <div style={{ color: '#C9A84C', fontSize: 24, fontWeight: 'bold' }}>⚡</div>
              </div>
            </Link>

            {/* Equipment List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 13.5, fontWeight: 800, color: '#1E4D3A', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📖 เรียนรู้คำศัพท์
                </h2>
                <span style={{ fontSize: 10, color: '#1E4D3A', background: '#EAF3EE', padding: '3px 10px', borderRadius: 100, fontWeight: 800 }}>
                  {equipment.length} คำ
                </span>
              </div>

              {/* แสดงผล 3 รายการแรกทางหน้าหลัก */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mainDisplayedItems.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setViewItem(item)}
                    style={{
                      background: 'white', borderRadius: 18, padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 14,
                      boxShadow: '0 3px 14px rgba(16,43,31,0.05)',
                      border: '1.5px solid rgba(237,233,225,0.80)', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, background: '#EAF3EE',
                      borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, flexShrink: 0,
                    }}>{item.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#1E4D3A', marginBottom: 2 }}>{item.nameEn}</div>
                      <div style={{ fontSize: 11.5, color: '#6B7280' }}>{item.name}</div>
                    </div>
                    <div style={{ color: '#C9A84C', fontSize: 18 }}>›</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === AI SCAN TAB === */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Hidden Canvas for Live Video Capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Immersive VR Camera Simulator (Height-fitted container) */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '74vh',
              minHeight: 520,
              background: '#040806',
              borderRadius: 28,
              overflow: 'hidden',
              border: '2.5px solid #C9A84C',
              boxShadow: '0 20px 48px rgba(10,43,26,0.35)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* 1. Live Video background */}
              {isCameraActive ? (
                <video 
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, background: '#090F0B' }}>
                  <span style={{ fontSize: 48, animation: 'spin 10s linear infinite' }}>📡</span>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5, fontWeight: 700, letterSpacing: '0.5px' }}>กำลังเชื่อมต่อกล้องระบบ VR Scan...</div>
                </div>
              )}

              {/* 2. Absolute Floating Header (Top bar) */}
              <div style={{
                position: 'absolute', top: 14, left: 14, right: 14, zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6
              }}>
                {/* Home Badge */}
                <Link href="/student/dashboard" style={{
                  background: 'rgba(15, 28, 41, 0.75)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '7px 14px',
                  borderRadius: 100,
                  fontSize: 11.5,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ← Home
                </Link>

                {/* Sub Tab Switcher */}
                <div style={{
                  display: 'flex',
                  gap: 3,
                  background: 'rgba(15, 28, 41, 0.75)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  padding: 4,
                  borderRadius: 100,
                  border: '1.5px solid rgba(201, 168, 76, 0.25)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <button 
                    onClick={() => setActiveTab('qr')} 
                    style={{
                      background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)',
                      fontSize: 10.5, fontWeight: 800, padding: '5px 12px', borderRadius: 100, cursor: 'pointer',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    QR Model
                  </button>
                  <button 
                    style={{
                      background: 'linear-gradient(135deg, #A6882A 0%, #C9A84C 100%)',
                      border: 'none', color: 'white',
                      fontSize: 10.5, fontWeight: 900, padding: '5px 12px', borderRadius: 100, cursor: 'pointer',
                      fontFamily: 'var(--font-primary)',
                      boxShadow: '0 2px 8px rgba(201,168,76,0.3)'
                    }}
                  >
                    AI Scanner
                  </button>
                </div>

                {/* Live simulation tag */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(30, 77, 58, 0.5)',
                  border: '1.5px solid rgba(34, 197, 94, 0.3)',
                  padding: '7px 12px',
                  borderRadius: 100,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <span style={{ width: 5.5, height: 5.5, borderRadius: '50%', background: '#22c55e', animation: 'pulseMic 1.2s infinite' }} />
                  <span style={{ color: '#22c55e', fontSize: 8.5, fontWeight: 955, letterSpacing: '0.5px' }}>LIVE AR SIMULATION</span>
                </div>
              </div>

              {/* 3. Gold view brackets (Enclosing target in center) */}
              {!aiScanned && (
                <div style={{
                  position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)',
                  zIndex: 5, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                  <div style={{ position: 'relative', width: 160, height: 160 }}>
                    {/* Brackets */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 26, height: 26, borderLeft: '4px solid #C9A84C', borderTop: '4px solid #C9A84C', borderRadius: '8px 0 0 0' }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 26, height: 26, borderRight: '4px solid #C9A84C', borderTop: '4px solid #C9A84C', borderRadius: '0 8px 0 0' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: 26, height: 26, borderLeft: '4px solid #C9A84C', borderBottom: '4px solid #C9A84C', borderRadius: '0 0 0 8px' }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRight: '4px solid #C9A84C', borderBottom: '4px solid #C9A84C', borderRadius: '0 0 8px 0' }} />
                    
                    {/* Pulsing ring inside */}
                    <div style={{
                      position: 'absolute', inset: 26,
                      border: '1px dashed rgba(201, 168, 76, 0.4)',
                      borderRadius: '50%',
                      animation: 'spin 16s linear infinite'
                    }} />
                  </div>
                  <div style={{
                    color: 'white', fontSize: 10, fontWeight: 900, marginTop: 14,
                    letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.85)',
                    textAlign: 'center', textTransform: 'uppercase'
                  }}>
                    {scanAnim ? 'ANALYZING TARGET MESH...' : 'ALIGN TARGET TO DETECT OBJECT'}
                  </div>
                </div>
              )}

              {/* Laser Sweeper Line */}
              {scanAnim && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: '4px',
                  background: '#A6882A',
                  boxShadow: '0 0 14px #C9A84C, 0 0 24px #C9A84C',
                  animation: 'scanLine 1.5s ease-in-out infinite',
                  zIndex: 4
                }} />
              )}

              {/* 4. Translucent Floating AI Result Card (overlaid on top of camera) */}
              {aiScanned && aiItem && (
                <div style={{
                  position: 'absolute', top: 78, left: 14, right: 14, zIndex: 6,
                  display: 'flex', flexDirection: 'column', gap: 10,
                  maxHeight: 'calc(100% - 92px)', overflowY: 'auto',
                  animation: 'fadeInUp 0.4s ease'
                }}>
                  {/* Holographic transparent card */}
                  <div style={{
                    background: 'rgba(15, 28, 41, 0.88)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: 22,
                    color: 'white',
                    padding: '16px 18px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.65)'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{
                        background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        fontSize: 9.5, fontWeight: 900, padding: '4px 10px', borderRadius: 100,
                        letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        ⚙️ AI ANALYZED
                      </span>
                      
                      <button
                        onClick={() => speak(aiItem.sentence, 'ai-sentence')}
                        style={{
                          background: 'rgba(56, 189, 248, 0.2)', border: 'none',
                          color: '#38bdf8', width: 34, height: 34, borderRadius: '50%',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.35)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)'}
                      >
                        🔊
                      </button>
                    </div>

                    {/* Titles */}
                    <h3 style={{ fontSize: 18.5, fontWeight: 800, color: 'white', margin: '0 0 2px' }}>{aiItem.name}</h3>
                    <h4 style={{ fontSize: 14, color: '#38bdf8', fontWeight: 700, margin: '0 0 14px' }}>{aiItem.nameTh}</h4>

                    {/* Description & Placement */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 9.5, color: '#38bdf8', fontWeight: 900, marginBottom: 3, letterSpacing: '0.5px' }}>DESCRIPTION:</div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.45 }}>{aiItem.use}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>{aiItem.location}</p>
                      </div>
                    </div>

                    {/* AI Pronunciation Coach */}
                    <div style={{ borderTop: '1.5px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
                      <div style={{
                        fontSize: 9.5, color: '#eab308', fontWeight: 900, marginBottom: 6,
                        letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        🎙️ AI PRONUNCIATION COACH
                      </div>
                      
                      <div style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1.5px solid rgba(234, 179, 8, 0.35)',
                        borderRadius: 12,
                        padding: '11px 13px',
                        fontSize: 12.5,
                        color: 'white',
                        fontStyle: 'italic',
                        fontWeight: 650,
                        marginBottom: 10,
                        lineHeight: 1.45
                      }}>
                        "{aiItem.sentence}"
                      </div>

                      {/* Microphone Controls */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {isRecording ? (
                          <button
                            onClick={stopSpeechPractice}
                            style={{
                              width: '100%', padding: '10px', borderRadius: 100, border: 'none',
                              background: '#dc3545', color: 'white', fontSize: 11.5, fontWeight: 800,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              boxShadow: '0 0 12px rgba(220,53,69,0.3)',
                              animation: 'pulseMic 1.2s infinite'
                            }}
                          >
                            ⏹️ Stop Recording
                          </button>
                        ) : (
                          <button
                            onClick={() => startSpeechPractice(aiItem.sentence)}
                            style={{
                              width: '100%', padding: '10px', borderRadius: 100, border: 'none',
                              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                              color: 'white', fontSize: 11.5, fontWeight: 900,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              boxShadow: '0 4px 12px rgba(234,179,8,0.2)'
                            }}
                          >
                            🎙️ Record Speech
                          </button>
                        )}

                        {/* Pronunciation Feedback Panel */}
                        {speechScore !== null && (
                          <div style={{
                            background: 'rgba(0, 0, 0, 0.35)',
                            padding: '12px 14px',
                            borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginTop: 4
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Accuracy Score:</span>
                              <span style={{
                                fontSize: 10, fontWeight: 950, padding: '2px 8px', borderRadius: 100,
                                background: speechScore >= 80 ? '#22c55e' : '#eab308',
                                color: 'white'
                              }}>
                                {speechScore}% Match
                              </span>
                            </div>

                            {/* Word Highlights */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', lineHeight: 1.4 }}>
                              {speechDiff.map((word, wIdx) => (
                                <span
                                  key={wIdx}
                                  style={{
                                    fontSize: 12, fontWeight: 800,
                                    color: word.status === 'correct' ? '#22c55e' : '#ef4444'
                                  }}
                                >
                                  {word.text}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setAiScanned(false); setAiItem(null); setSpeechScore(null); setStudentSpeech('') }}
                    style={{
                      alignSelf: 'center',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      padding: '8px 20px',
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                  >
                    🔄 Scan Another Object
                  </button>
                </div>
              )}

              {/* 5. Immersive Bottom Analyze Trigger */}
              {!aiScanned && (
                <div style={{
                  position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 10,
                  display: 'flex', flexDirection: 'column', gap: 8
                }}>
                  {/* File Pick Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  <button
                    onClick={captureVRFrame}
                    disabled={scanAnim || !isCameraActive}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 100, border: 'none',
                      background: scanAnim ? 'rgba(255,255,255,0.18)' : 'linear-gradient(135deg, #A6882A 0%, #C9A84C 100%)',
                      color: 'white',
                      fontSize: 13, fontWeight: 900, cursor: isCameraActive ? 'pointer' : 'not-allowed',
                      boxShadow: '0 8px 24px rgba(201,168,76,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.2s'
                    }}
                  >
                    📷 {scanAnim ? 'Decoding Target Mesh...' : 'Analyze Object with Gemini AI'}
                  </button>

                  {/* Fallback File Uploader for Laptop Tests */}
                  {!isCameraActive && (
                    <button
                      onClick={handleTriggerUpload}
                      disabled={scanAnim}
                      style={{
                        width: '100%', padding: '11px', borderRadius: 100,
                        border: '1.5px dashed #C9A84C',
                        background: 'rgba(201,168,76,0.12)',
                        color: '#C9A84C',
                        fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.22)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.12)'}
                    >
                      📁 Upload Photo from Device
                    </button>
                  )}
                </div>
              )}
            {/* Tip card */}
            {!aiScanned && (
              <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: '1px solid #EDE9E1', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 12.5, color: '#1E4D3A', marginBottom: 4 }}>วิธีใช้ AI Scan</div>
                  <div style={{ fontSize: 11, color: '#8C8272', lineHeight: 1.6 }}>กดปุ่ม "เปิดกล้อง AI Scan" แล้วถ่ายรูปอุปกรณ์ในห้องอาหาร เช่น ส้อม มีด ช้อน หรือแก้วน้ำ AI จะระบุชื่อ วิธีใช้ และประโยคสนทนา พร้อมให้คุณฝึกพูดตามได้ทันที</div>
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* ── POPUP: SHOW ALL VOCABULARY (Bottom Sheet Style) ── */}
      {showVocabPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.6)', zIndex: 1200, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowVocabPopup(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 500, margin: '0 auto',
              background: '#FDFAF4', borderRadius: '24px 24px 0 0',
              padding: '20px 20px 36px', maxHeight: '82vh', display: 'flex', flexDirection: 'column',
              animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div style={{ width: 36, height: 4, background: '#EDE9E1', borderRadius: 100, margin: '0 auto 16px', flexShrink: 0 }} />
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#1E4D3A', margin: 0 }}>📖 รายการคำศัพท์ทั้งหมด</h3>
                <p style={{ fontSize: 11.5, color: '#8C8272', margin: '2px 0 0' }}>จากบทเรียนและแผนการสอนที่กำลังเรียนรู้</p>
              </div>
              <button
                onClick={() => setShowVocabPopup(false)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none',
                  background: '#EDE9E1', color: '#4A4138', fontWeight: 'bold',
                  fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Scrollable list of ALL vocabulary */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
              {equipment.map((item, i) => (
                <div
                  key={i}
                  onClick={() => { setViewItem(item); setShowVocabPopup(false); }}
                  style={{
                    background: 'white', borderRadius: 16, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    border: '1px solid rgba(237,233,225,0.90)', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, background: i % 2 === 0 ? '#EAF3EE' : '#FBF6E9',
                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    {item.emoji && item.emoji.startsWith('data:image') ? (
                      <img src={item.emoji} alt={item.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 22 }}>{item.emoji}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#1A1410' }}>{item.nameEn}</div>
                    <div style={{ fontSize: 11, color: '#8C8272', marginTop: 1 }}>{item.name}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(item.nameEn, `popup-${i}`) }}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', border: 'none',
                      background: speaking === `popup-${i}` ? '#1E4D3A' : '#EAF3EE',
                      color: speaking === `popup-${i}` ? 'white' : '#1E4D3A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13,
                      flexShrink: 0,
                    }}
                  >🔊</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,43,31,0.5)', zIndex: 1300, display: 'flex', alignItems: 'flex-end' }} onClick={() => setViewItem(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 500, margin: '0 auto',
              background: '#FDFAF4', borderRadius: '24px 24px 0 0',
              padding: '20px 20px 36px', animation: 'slideUp 0.3s ease',
            }}
          >
            <div style={{ width: 36, height: 4, background: '#EDE9E1', borderRadius: 100, margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ 
                width: 64, height: 64, background: '#EAF3EE', borderRadius: 18, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.05)' 
              }}>
                {viewItem.emoji && viewItem.emoji.startsWith('data:image') ? (
                  <img src={viewItem.emoji} alt={viewItem.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 34 }}>{viewItem.emoji}</span>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1E4D3A', margin: '0 0 2px' }}>{viewItem.nameEn}</h3>
                <p style={{ fontSize: 13, color: '#A6882A', fontWeight: 700, margin: 0 }}>{viewItem.name}</p>
              </div>
            </div>
            <div style={{ background: '#FBF6E9', borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#A6882A', fontWeight: 800, marginBottom: 4 }}>วิธีใช้งาน</div>
              <p style={{ fontSize: 12.5, color: '#4A4138', margin: 0, lineHeight: 1.6 }}>{viewItem.use}</p>
            </div>
            <div style={{ background: '#EAF3EE', borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: '#1E4D3A', fontWeight: 800, marginBottom: 6 }}>ตัวอย่างประโยค</div>
              <p style={{ fontSize: 13, color: '#1E4D3A', fontWeight: 700, fontStyle: 'italic', margin: '0 0 10px' }}>"{viewItem.sentence}"</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => speak(viewItem.sentence, 'modal-listen')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #1E4D3A', background: 'transparent', color: '#1E4D3A', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>🔊 ฟัง</button>
                <button onClick={() => speak(viewItem.sentence, 'modal-practice')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#1E4D3A,#2A6B52)', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>🎤 พูดตาม</button>
              </div>
            </div>
            <button onClick={() => setViewItem(null)} style={{ width: '100%', padding: '13px', borderRadius: 14, border: '1.5px solid #EDE9E1', background: 'white', color: '#8C8272', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>ปิด</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scanLine {
          0% { top: 10px; }
          100% { top: 120px; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
