'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface ARModel {
  id: string
  nameEn: string
  nameTh: string
  desc: string
  glbUrl?: string
  usdzUrl?: string
  pronounce?: string
  sentence?: string
  imageUrl?: string
}

function ARViewerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  
  const [model, setModel] = useState<ARModel | null>(null)
  const [loading, setLoading] = useState(true)

  // TTS & STT & Quiz States
  const [isListening, setIsListening] = useState(false)
  const [sttScore, setSttScore] = useState<number | null>(null)
  const [spokenText, setSpokenText] = useState('')
  const [showSttModal, setShowSttModal] = useState(false)

  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null)
  const [quizOptions, setQuizOptions] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      async function loadModel() {
        const fallbackGlb = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'

        // ─── 1. Try ai_scan_items table (primary — teacher-created items) ───
        try {
          const { data, error } = await supabase
            .from('ai_scan_items')
            .select('id, name_th, name_en, description, service_tips, image_url, glb_url, usdz_url, pronounce')
            .eq('id', id)
            .single()

          if (data && !error) {
            setModel({
              id: data.id,
              nameEn: data.name_en || '',
              nameTh: data.name_th || '',
              desc: data.description || '',
              glbUrl: (data as any).glb_url || fallbackGlb,
              usdzUrl: (data as any).usdz_url || '',
              pronounce: (data as any).pronounce || '',
              sentence: data.service_tips || '',
              imageUrl: data.image_url || ''
            })
            setLoading(false)
            return
          }
        } catch (e) {
          console.warn('ai_scan_items fetch failed, trying legacy store:', e)
        }

        // ─── 2. Legacy: fine_lesson_plans 'ar-items-store' ───
        try {
          const { data, error } = await supabase
            .from('fine_lesson_plans')
            .select('vocabulary')
            .eq('id', 'ar-items-store')
            .single()

          if (data && data.vocabulary) {
            const items = data.vocabulary as any[]
            const found = items.find(m => m.id === id)
            if (found) {
              setModel({
                ...found,
                glbUrl: found.glbUrl || fallbackGlb
              })
              setLoading(false)
              return
            }
          }
        } catch (e) {
          console.warn('fine_lesson_plans fetch failed:', e)
        }

        // ─── 3. URL search parameters (for QR codes with embedded data) ───
        const qNameEn = searchParams.get('nameEn')
        const qNameTh = searchParams.get('nameTh')
        const qDesc = searchParams.get('desc')
        const qGlbUrl = searchParams.get('glbUrl')
        const qUsdzUrl = searchParams.get('usdzUrl')
        const qPronounce = searchParams.get('pronounce')
        const qSentence = searchParams.get('sentence')
        const qImageUrl = searchParams.get('imageUrl')

        if (qNameEn) {
          setModel({
            id: id || '',
            nameEn: qNameEn,
            nameTh: qNameTh || '',
            desc: qDesc || '',
            glbUrl: qGlbUrl || fallbackGlb,
            usdzUrl: qUsdzUrl || '',
            pronounce: qPronounce || '',
            sentence: qSentence || '',
            imageUrl: qImageUrl || ''
          })
          setLoading(false)
          return
        }

        // ─── 4. localStorage fallback ───
        const storedModels = localStorage.getItem('arItems')
        if (storedModels) {
          try {
            const parsed = JSON.parse(storedModels)
            const found = parsed.find((m: any) => m.id === id)
            if (found) {
              setModel({ ...found, glbUrl: found.glbUrl || fallbackGlb })
              setLoading(false)
              return
            }
          } catch (e) {}
        }

        setLoading(false)
      }
      loadModel()
    }
  }, [id, searchParams])

  // Initialize Quiz options
  useEffect(() => {
    if (model) {
      const pool = [
        'จานสลัดเดี่ยว', 'ช้อนตักแกง', 'ถ้วยน้ำจิ้ม', 'มีดหั่นเนื้อสเต็ก', 
        'แก้วเครื่องดื่มค็อกเทล', 'ถาดไม้วางจาน', 'ผ้าเช็ดปากลูกค้า', 
        'เหยือกแก้วใส่น้ำ', 'ที่เปิดขวดไวน์', 'ชามใส่สลัดผัก',
        'ส้อมทานขนมหวาน', 'ถ้วยน้ำชาเซรามิก', 'เครื่องคั้นน้ำผลไม้'
      ]
      const filteredPool = pool.filter(o => o !== model.nameTh)
      const shuffled = filteredPool.sort(() => 0.5 - Math.random())
      const wrong1 = shuffled[0]
      const wrong2 = shuffled[1]
      const opts = [model.nameTh, wrong1, wrong2].sort(() => 0.5 - Math.random())
      setQuizOptions(opts)
      setQuizAnswered(false)
      setQuizSelectedOption(null)
    }
  }, [model])

  // Text-To-Speech (TTS)
  const speakText = (textToSpeak: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = 'en-US'
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    } else {
      alert('เบราว์เซอร์ของคุณไม่รองรับการออกเสียงแบบอัตโนมัติ')
    }
  }

  // Speech-To-Text (STT) Pronunciation Check
  const startSTT = () => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('เบราว์เซอร์ของคุณไม่สนับสนุนการจดจำเสียงพูด กรุณาใช้ Chrome หรือ Safari บนมือถือครับ')
      return
    }

    setIsListening(true)
    setSpokenText('')
    setSttScore(null)
    setShowSttModal(true)

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript
      setSpokenText(result)

      // Compare text
      const target = (model?.nameEn || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
      const spoken = result.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()

      if (target === spoken) {
        setSttScore(100)
      } else {
        const targetWords = target.split(' ')
        const spokenWords = spoken.split(' ')
        let matches = 0
        targetWords.forEach(w => {
          if (spokenWords.includes(w)) matches++
        })
        const score = Math.round((matches / targetWords.length) * 100)
        setSttScore(score)
      }
    }

    recognition.onerror = (e: any) => {
      console.error(e)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F0E6', color: '#1E4D3A' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>🌀</div>
        <div style={{ fontWeight: 700, fontSize: '18px' }}>กำลังดาวน์โหลดข้อมูล 3 มิติ...</div>
      </div>
    )
  }

  if (!model) {
    return (
      <div className="student-container" style={{ background: '#F5F0E6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#8B2635', marginBottom: '8px' }}>ไม่พบโมเดล 3 มิติ</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>การ์ดคิวอาร์โค้ดนี้อาจไม่ถูกต้อง หรือโมเดลในระบบได้รับการปรับปรุงใหม่</p>
          <button onClick={() => router.push('/student/scanner')} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            กลับไปหน้าระบบสแกน
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: 'radial-gradient(circle, #eef4f1 0%, #d4e3dc 100%)', overflow: 'hidden' }}>
      
      {/* 3D Viewer Container */}
      <div style={{ width: '100%', height: '58vh', position: 'relative' }}>
        {/* @ts-ignore */}
        <model-viewer
          src={model.glbUrl}
          ios-src={model.usdzUrl || undefined}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1.5"
          shadow-softness="1"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        >
          <div className="progress-bar hide" slot="progress-bar">
            <div className="update-bar"></div>
          </div>
          
          {/* iOS / Android Native AR trigger button overlay */}
          <button slot="ar-button" id="ar-button" style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 28px',
            borderRadius: '100px',
            background: 'linear-gradient(135deg, #102B1F 0%, #1a4231 100%)',
            color: '#C9A84C',
            border: '2px solid #C9A84C',
            fontWeight: 800,
            fontSize: '15px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 100,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🕶️ นำไปวางในห้องเรียน (AR)
          </button>
        {/* @ts-ignore */}
        </model-viewer>

        {/* Floating Scanner exit button */}
        <button 
          onClick={() => router.push('/student/explore')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            cursor: 'pointer',
            zIndex: 200
          }}
        >
          ✕
        </button>
      </div>

      {/* Glassmorphic Educational Overlay Card */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '42vh',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '2px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '32px 32px 0 0',
        padding: '24px 20px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 150
      }}>
        
        {/* Word Info & TTS Button */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#102B1F', margin: 0 }}>
                {model.nameEn}
              </h2>
              {model.pronounce && (
                <span style={{ fontSize: '14px', color: '#A6882A', fontStyle: 'italic', fontWeight: 600 }}>
                  {model.pronounce}
                </span>
              )}
            </div>
            {/* Pronounce Button */}
            <button 
              onClick={() => speakText(model.nameEn)}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#EAF3EE',
                border: 'none',
                color: '#1E4D3A',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(30,77,58,0.15)'
              }}
              title="ฟังเสียงอ่านออกเสียง"
            >
              🔊
            </button>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#A6882A', margin: '0 0 10px 0' }}>
            {model.nameTh}
          </h3>

          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
            {model.desc}
          </p>

          {/* Example Sentence Section */}
          {model.sentence && (
            <div style={{
              background: 'rgba(201,168,76,0.1)',
              borderLeft: '4px solid #C9A84C',
              padding: '10px 14px',
              borderRadius: '0 12px 12px 0',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '10px', color: '#A6882A', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Example Sentence (ตัวอย่างประโยคบริการ)
                </span>
                <button 
                  onClick={() => speakText(model.sentence || '')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                >
                  🔊 ฟังประโยค
                </button>
              </div>
              <p style={{ fontStyle: 'italic', fontWeight: 600, color: '#102B1F', fontSize: '13px', margin: 0 }}>
                "{model.sentence}"
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons Panel */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: 'auto' }}>
          <button 
            onClick={startSTT}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1E4D3A 0%, #102B1F 100%)',
              color: '#FFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16,43,31,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            🎙️ ฝึกพูดคำศัพท์
          </button>
          
          <button 
            onClick={() => setShowQuizModal(true)}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #C9A84C 0%, #A6882A 100%)',
              color: '#FFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(166,136,42,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            📝 ทดสอบความรู้
          </button>
        </div>

      </div>

      {/* 1. Speech Recognition Practice Modal */}
      {showSttModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            width: '90%', maxWidth: '380px', background: '#FFF',
            borderRadius: '24px', padding: '24px', textAlign: 'center',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            border: '2px solid #1E4D3A'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E4D3A', margin: '0 0 16px 0' }}>
              🎙️ ทดสอบการออกเสียงของคุณ
            </h3>
            
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              กดปุ่มไมโครโฟนแล้วพูดว่า:
            </p>
            
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#A6882A', background: '#F9F6F0', padding: '16px', borderRadius: '16px', marginBottom: '24px', letterSpacing: '0.5px' }}>
              {model.nameEn}
            </div>

            {isListening ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: '#FAE8EB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', animation: 'pulse 1.2s infinite'
                }}>
                  🔴
                </div>
                <span style={{ color: '#8B2635', fontWeight: 700, fontSize: '14px' }}>กำลังฟังเสียงพูดของคุณ...</span>
              </div>
            ) : (
              <div style={{ marginBottom: '24px' }}>
                {spokenText && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>คุณพูดว่า:</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#102B1F' }}>"{spokenText}"</div>
                  </div>
                )}

                {sttScore !== null && (
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>คะแนนความถูกต้อง:</div>
                    <div style={{
                      fontSize: '36px', fontWeight: 900, 
                      color: sttScore >= 80 ? '#1E4D3A' : sttScore >= 50 ? '#A6882A' : '#8B2635',
                      margin: '4px 0'
                    }}>
                      {sttScore}%
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>
                      {sttScore >= 80 ? '🌟 ยอดเยี่ยมมาก! สำเนียงถูกต้อง' : sttScore >= 50 ? '👍 เก่งมาก! ลองออกเสียงให้ชัดเจนขึ้นอีกนิด' : '💪 ลองใหม่อีกครั้ง พยายามออกเสียงช้าๆ ชัดๆ'}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={startSTT}
                disabled={isListening}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: '#1E4D3A', color: '#FFF', border: 'none',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  opacity: isListening ? 0.6 : 1
                }}
              >
                🔄 ลองพูดใหม่
              </button>
              <button 
                onClick={() => setShowSttModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: '#F0EEE9', color: '#555', border: 'none',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quick Vocabulary Quiz Modal */}
      {showQuizModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            width: '90%', maxWidth: '380px', background: '#FFF',
            borderRadius: '24px', padding: '24px', textAlign: 'center',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            border: '2px solid #C9A84C'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E4D3A', margin: '0 0 8px 0' }}>
              📝 แบบทดสอบความรู้สั้น
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              อุปกรณ์ชิ้นนี้ภาษาไทยเรียกว่าอะไร?
            </p>

            <div style={{ fontSize: '22px', fontWeight: 900, color: '#1E4D3A', background: '#EAF3EE', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
              {model.nameEn}
            </div>

            {/* Multiple Choice Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {quizOptions.map((option, idx) => {
                const isSelected = quizSelectedOption === option
                const isCorrect = option === model.nameTh
                let btnStyle: React.CSSProperties = {
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1.5px solid #EDE9E1',
                  background: '#FFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }

                if (quizAnswered) {
                  if (isCorrect) {
                    btnStyle = { ...btnStyle, background: '#EAF3EE', borderColor: '#1E4D3A', color: '#1E4D3A', fontWeight: 800 }
                  } else if (isSelected) {
                    btnStyle = { ...btnStyle, background: '#FAE8EB', borderColor: '#8B2635', color: '#8B2635' }
                  } else {
                    btnStyle = { ...btnStyle, opacity: 0.6 }
                  }
                } else if (isSelected) {
                  btnStyle = { ...btnStyle, borderColor: '#C9A84C', background: '#FDFAF4' }
                }

                return (
                  <button 
                    key={idx}
                    disabled={quizAnswered}
                    onClick={() => setQuizSelectedOption(option)}
                    style={btnStyle}
                  >
                    <span style={{ marginRight: '8px', color: isSelected ? '#C9A84C' : '#999' }}>
                      {idx === 0 ? 'A.' : idx === 1 ? 'B.' : 'C.'}
                    </span>
                    {option}
                  </button>
                )
              })}
            </div>

            {/* Answer Display */}
            {quizAnswered && (
              <div style={{
                background: quizSelectedOption === model.nameTh ? '#EAF3EE' : '#FAE8EB',
                color: quizSelectedOption === model.nameTh ? '#1E4D3A' : '#8B2635',
                padding: '12px', borderRadius: '12px', marginBottom: '24px', fontWeight: 700, fontSize: '13px'
              }}>
                {quizSelectedOption === model.nameTh ? '🎉 ตอบถูก! คุณได้รับ 10 คะแนนความรู้' : '❌ ตอบผิด! ลองอ่านรายละเอียดแล้วตอบอีกครั้ง'}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {!quizAnswered ? (
                <button 
                  disabled={!quizSelectedOption}
                  onClick={() => setQuizAnswered(true)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: quizSelectedOption ? '#1E4D3A' : '#CCC',
                    color: '#FFF', border: 'none',
                    fontWeight: 700, fontSize: '13px', cursor: quizSelectedOption ? 'pointer' : 'default'
                  }}
                >
                  ส่งคำตอบ
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setQuizAnswered(false)
                    setQuizSelectedOption(null)
                    // Reshuffle options
                    const pool = ['จานสลัดเดี่ยว', 'ช้อนตักแกง', 'ถ้วยน้ำจิ้ม', 'มีดหั่นเนื้อสเต็ก', 'แก้วเครื่องดื่มค็อกเทล']
                    const filteredPool = pool.filter(o => o !== model.nameTh)
                    const shuffled = filteredPool.sort(() => 0.5 - Math.random())
                    const opts = [model.nameTh, shuffled[0], shuffled[1]].sort(() => 0.5 - Math.random())
                    setQuizOptions(opts)
                  }}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: '#1E4D3A', color: '#FFF', border: 'none',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  🔄 เล่นอีกครั้ง
                </button>
              )}
              <button 
                onClick={() => setShowQuizModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: '#F0EEE9', color: '#555', border: 'none',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded microphone animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,38,53, 0.4); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(139,38,53, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,38,53, 0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  )
}

export default function ARViewerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>กำลังโหลดโมเดล 3 มิติ...</div>}>
      <ARViewerContent />
    </Suspense>
  )
}
