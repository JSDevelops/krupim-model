'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const autoAR = searchParams.get('ar') === '1'

  const [model, setModel] = useState<ARModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [isWebXRSupported, setIsWebXRSupported] = useState<boolean | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [arLaunched, setArLaunched] = useState(false)

  // TTS & STT & Quiz States
  const [isListening, setIsListening] = useState(false)
  const [sttScore, setSttScore] = useState<number | null>(null)
  const [spokenText, setSpokenText] = useState('')
  const [showSttModal, setShowSttModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null)
  const [quizOptions, setQuizOptions] = useState<string[]>([])

  const modelViewerRef = useRef<any>(null)
  const arBtnRef = useRef<HTMLButtonElement>(null)

  // ─── Detect Device & WebXR ───────────────────────────────────────────────
  useEffect(() => {
    const ua = navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    setIsIOS(ios)

    if (ios) {
      setIsWebXRSupported(false) // iOS ใช้ AR Quick Look แทน
    } else if ('xr' in navigator) {
      ;(navigator as any).xr.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setIsWebXRSupported(supported)
      }).catch(() => setIsWebXRSupported(false))
    } else {
      setIsWebXRSupported(false)
    }
  }, [])

  // ─── Load Model Data ──────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      async function loadModel() {
        const fallbackGlb = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'

        // ─── 1. ar_items (ตารางหลัก — ครูสร้างจากหน้า AR & 3D Items) ───
        try {
          const { data, error } = await supabase
            .from('ar_items')
            .select('*')
            .eq('id', id)
            .single()
          if (data && !error) {
            setModel({
              id: data.id,
              nameEn: data.name_en || '',
              nameTh: data.name_th || '',
              desc: data.description || '',
              glbUrl: data.glb_url || fallbackGlb,
              usdzUrl: data.usdz_url || '',
              pronounce: data.pronounce || '',
              sentence: data.sentence || '',
              imageUrl: data.image_url || ''
            })
            setLoading(false)
            return
          }
        } catch (e) { console.warn('ar_items lookup failed:', e) }

        // ─── 2. ai_scan_items (AI Scan ผ่านกล้อง) ───
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
        } catch (e) { console.warn('ai_scan_items lookup failed:', e) }

        // ─── 3. Legacy fine_lesson_plans ───
        try {
          const { data, error } = await supabase
            .from('fine_lesson_plans')
            .select('vocabulary')
            .eq('id', 'ar-items-store')
            .single()
          if (data && data.vocabulary) {
            const items = data.vocabulary as any[]
            const found = items.find((m: any) => m.id === id)
            if (found) {
              setModel({ ...found, glbUrl: found.glbUrl || fallbackGlb })
              setLoading(false)
              return
            }
          }
        } catch (e) { console.warn('fine_lesson_plans lookup failed:', e) }

        // ─── 4. URL search params (QR embedded data) ───
        const qNameEn = searchParams.get('nameEn')
        if (qNameEn) {
          setModel({
            id: id || '',
            nameEn: qNameEn,
            nameTh: searchParams.get('nameTh') || '',
            desc: searchParams.get('desc') || '',
            glbUrl: searchParams.get('glbUrl') || fallbackGlb,
            usdzUrl: searchParams.get('usdzUrl') || '',
            pronounce: searchParams.get('pronounce') || '',
            sentence: searchParams.get('sentence') || '',
            imageUrl: searchParams.get('imageUrl') || ''
          })
          setLoading(false)
          return
        }

        // ─── 5. localStorage fallback ───
        const stored = localStorage.getItem('arItems')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
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

  // ─── Auto-click AR button when ?ar=1 ─────────────────────────────────────
  useEffect(() => {
    if (autoAR && model && arBtnRef.current && !arLaunched) {
      const timer = setTimeout(() => {
        arBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [autoAR, model, arLaunched])

  // ─── Quiz options init ────────────────────────────────────────────────────
  useEffect(() => {
    if (model) {
      const pool = [
        'จานสลัดเดี่ยว', 'ช้อนตักแกง', 'ถ้วยน้ำจิ้ม', 'มีดหั่นเนื้อสเต็ก',
        'แก้วเครื่องดื่มค็อกเทล', 'ถาดไม้วางจาน', 'ผ้าเช็ดปากลูกค้า',
        'เหยือกแก้วใส่น้ำ', 'ที่เปิดขวดไวน์', 'ชามใส่สลัดผัก',
        'ส้อมทานขนมหวาน', 'ถ้วยน้ำชาเซรามิก', 'เครื่องคั้นน้ำผลไม้'
      ]
      const filtered = pool.filter(o => o !== model.nameTh)
      const shuffled = filtered.sort(() => 0.5 - Math.random())
      setQuizOptions([model.nameTh, shuffled[0], shuffled[1]].sort(() => 0.5 - Math.random()))
      setQuizAnswered(false)
      setQuizSelectedOption(null)
    }
  }, [model])

  // ─── TTS ──────────────────────────────────────────────────────────────────
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-US'; u.rate = 0.85
      window.speechSynthesis.speak(u)
    }
  }

  // ─── STT ──────────────────────────────────────────────────────────────────
  const startSTT = () => {
    if (typeof window === 'undefined') return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('เบราว์เซอร์ไม่รองรับ กรุณาใช้ Chrome หรือ Safari'); return }
    setIsListening(true); setSpokenText(''); setSttScore(null); setShowSttModal(true)
    const r = new SR()
    r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 1
    r.onresult = (e: any) => {
      const result = e.results[0][0].transcript
      setSpokenText(result)
      const target = (model?.nameEn || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
      const spoken = result.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
      if (target === spoken) { setSttScore(100) } else {
        const tw = target.split(' '), sw = spoken.split(' ')
        const matches = tw.filter(w => sw.includes(w)).length
        setSttScore(Math.round((matches / tw.length) * 100))
      }
    }
    r.onerror = () => setIsListening(false)
    r.onend = () => setIsListening(false)
    r.start()
  }

  // ─── Loading Screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #040D07 0%, #0A1F12 50%, #102B1F 100%)',
        color: '#C9A84C'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'arPulse 1.5s ease-in-out infinite' }}>
          🕶️
        </div>
        <div style={{ fontWeight: 800, fontSize: '18px', color: '#C9A84C', marginBottom: '8px' }}>
          กำลังโหลดโมเดล 3 มิติ...
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(201,168,76,0.6)' }}>เตรียม AR Experience</div>
        <style>{`@keyframes arPulse { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.15); opacity:0.8; } }`}</style>
      </div>
    )
  }

  // ─── Not Found ────────────────────────────────────────────────────────────
  if (!model) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #040D07 0%, #0A1F12 100%)', padding: '24px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '24px', padding: '40px', textAlign: 'center', maxWidth: '360px'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FAA', marginBottom: '8px' }}>
            ไม่พบโมเดล 3 มิติ
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.6 }}>
            QR Code นี้อาจหมดอายุหรือโมเดลได้รับการปรับปรุงใหม่<br />กรุณาขอ QR Card ใหม่จากครู
          </p>
          <button onClick={() => router.push('/student/explore')}
            style={{
              width: '100%', padding: '14px', borderRadius: '16px', border: 'none',
              background: 'linear-gradient(135deg, #C9A84C, #A6882A)',
              color: '#102B1F', fontWeight: 800, fontSize: '15px', cursor: 'pointer'
            }}>
            ← กลับหน้าสำรวจ
          </button>
        </div>
      </div>
    )
  }

  // ─── Main AR View ─────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #040D07 0%, #0A1F12 40%, #102B1F 100%)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', zIndex: 300,
        background: 'linear-gradient(to bottom, rgba(4,13,7,0.95), transparent)',
        backdropFilter: 'blur(8px)'
      }}>
        <button onClick={() => router.push('/student/explore')}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
            color: '#C9A84C', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
          ←
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)',
            color: '#C9A84C', fontSize: '10px', fontWeight: 800, padding: '4px 12px',
            borderRadius: '100px', letterSpacing: '1.5px'
          }}>
            🕶️ AR 3D VIEWER
          </div>
        </div>
        <button onClick={() => speakText(model.nameEn)}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
            color: '#C9A84C', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
          🔊
        </button>
      </div>

      {/* ── 3D Model Viewer ── */}
      <div style={{ width: '100%', height: '55vh', position: 'relative', marginTop: '64px' }}>
        {/* @ts-ignore */}
        <model-viewer
          ref={modelViewerRef}
          src={model.glbUrl}
          ios-src={model.usdzUrl || undefined}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          auto-rotate-delay="500"
          rotation-per-second="20deg"
          shadow-intensity="1.5"
          shadow-softness="0.8"
          environment-image="neutral"
          exposure="1.2"
          style={{ width: '100%', height: '100%', background: 'transparent', '--poster-color': 'transparent' } as any}
        >
          {/* ── Custom AR Button inside model-viewer slot ── */}
          <button
            ref={arBtnRef}
            slot="ar-button"
            onClick={() => setArLaunched(true)}
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '16px 32px',
              borderRadius: '100px',
              background: 'linear-gradient(135deg, #C9A84C 0%, #A6882A 100%)',
              color: '#0A1F12',
              border: 'none',
              fontWeight: 900,
              fontSize: '16px',
              boxShadow: '0 0 0 0 rgba(201,168,76,0.6)',
              animation: 'arGlow 2s ease-in-out infinite',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              letterSpacing: '0.3px',
              zIndex: 100
            }}>
            🕶️ เปิด AR วางในโลกจริง
          </button>
          {/* @ts-ignore */}
        </model-viewer>

        {/* Device instruction overlay */}
        {!arLaunched && (
          <div style={{
            position: 'absolute', bottom: '80px', left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '12px', padding: '8px 16px',
            color: 'rgba(201,168,76,0.8)', fontSize: '11px', fontWeight: 700,
            whiteSpace: 'nowrap', zIndex: 90
          }}>
            {isIOS
              ? '📱 iOS: กด AR แล้วเปิดใน AR Quick Look'
              : isWebXRSupported
                ? '🤖 Android: กด AR แล้ววางบนพื้นหรือโต๊ะ'
                : '👆 กดปุ่มสีทองด้านล่างเพื่อเปิด AR'}
          </div>
        )}
      </div>

      {/* ── AR Instructions Card ── */}
      {!arLaunched && (
        <div style={{
          margin: '0 16px 12px',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '24px', flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#C9A84C', marginBottom: '4px' }}>
              วิธีใช้งาน AR
            </div>
            <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              {isIOS
                ? '1. กดปุ่ม AR สีทอง → เลือก "Open in AR" → ชี้กล้องที่พื้น → แตะเพื่อวางวัตถุ'
                : '1. กดปุ่ม AR สีทอง → ชี้กล้องไปที่พื้นหรือโต๊ะ → แตะหน้าจอเพื่อวางวัตถุ 3 มิติ'}
            </div>
          </div>
        </div>
      )}

      {/* ── Info Card (bottom sheet) ── */}
      <div style={{
        flex: 1,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(201,168,76,0.15)',
        borderRadius: '28px 28px 0 0',
        padding: '20px 20px 100px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Name row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#FDFAF4', margin: 0, lineHeight: 1.1 }}>
              {model.nameEn}
            </h2>
            {model.pronounce && (
              <span style={{ fontSize: '13px', color: '#C9A84C', fontStyle: 'italic', fontWeight: 600 }}>
                {model.pronounce}
              </span>
            )}
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(201,168,76,0.7)', marginTop: '2px' }}>
              {model.nameTh}
            </div>
          </div>
          <div style={{
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '12px', padding: '8px 14px', fontSize: '11px',
            fontWeight: 800, color: '#C9A84C', letterSpacing: '0.5px'
          }}>
            FINE MODEL
          </div>
        </div>

        {/* Description */}
        {model.desc && (
          <p style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0
          }}>
            {model.desc}
          </p>
        )}

        {/* Example sentence */}
        {model.sentence && (
          <div style={{
            background: 'rgba(201,168,76,0.06)',
            borderLeft: '3px solid #C9A84C',
            padding: '12px 14px',
            borderRadius: '0 12px 12px 0'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'
            }}>
              <span style={{ fontSize: '10px', color: '#C9A84C', fontWeight: 800, letterSpacing: '0.8px' }}>
                EXAMPLE SENTENCE
              </span>
              <button onClick={() => speakText(model.sentence || '')}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '11px', color: '#C9A84C', fontWeight: 700
                }}>
                🔊 ฟัง
              </button>
            </div>
            <p style={{ fontStyle: 'italic', fontWeight: 600, color: '#FDFAF4', fontSize: '13px', margin: 0 }}>
              "{model.sentence}"
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
          <button onClick={startSTT} style={{
            flex: 1, padding: '14px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #1E4D3A, #102B1F)',
            color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)',
            fontWeight: 800, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
          }}>
            🎙️ ฝึกพูด
          </button>
          <button onClick={() => setShowQuizModal(true)} style={{
            flex: 1, padding: '14px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
            color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)',
            fontWeight: 800, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
          }}>
            📝 ทดสอบ
          </button>
        </div>
      </div>

      {/* ── STT Modal ── */}
      {showSttModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '380px',
            background: '#0F1E14', borderRadius: '28px', padding: '28px',
            textAlign: 'center', border: '1px solid rgba(201,168,76,0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#C9A84C', margin: '0 0 16px' }}>
              🎙️ ทดสอบการออกเสียง
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
              กดไมโครโฟนแล้วพูดว่า:
            </p>
            <div style={{
              fontSize: '22px', fontWeight: 900, color: '#C9A84C',
              background: 'rgba(201,168,76,0.08)', padding: '16px', borderRadius: '16px',
              marginBottom: '24px', border: '1px solid rgba(201,168,76,0.2)'
            }}>
              {model.nameEn}
            </div>

            {isListening ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(139,38,53,0.2)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '28px', animation: 'sttPulse 1.2s infinite',
                  border: '2px solid #8B2635'
                }}>🎙️</div>
                <span style={{ color: '#FAA', fontWeight: 700, fontSize: '14px' }}>กำลังฟัง...</span>
              </div>
            ) : (
              <div style={{ marginBottom: '24px' }}>
                {spokenText && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>คุณพูดว่า:</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#FDFAF4' }}>"{spokenText}"</div>
                  </div>
                )}
                {sttScore !== null && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>คะแนนความถูกต้อง</div>
                    <div style={{
                      fontSize: '42px', fontWeight: 900, margin: '4px 0',
                      color: sttScore >= 80 ? '#4ADE80' : sttScore >= 50 ? '#C9A84C' : '#F87171'
                    }}>{sttScore}%</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                      {sttScore >= 80 ? '🌟 ยอดเยี่ยม! สำเนียงถูกต้อง' : sttScore >= 50 ? '👍 เก่งมาก! ลองฝึกอีกครั้ง' : '💪 ลองพูดช้าๆ ชัดขึ้น'}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={startSTT} disabled={isListening} style={{
                flex: 1, padding: '12px', borderRadius: '12px',
                background: '#1E4D3A', color: '#C9A84C', border: 'none',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: isListening ? 0.5 : 1
              }}>🔄 ลองใหม่</button>
              <button onClick={() => setShowSttModal(false)} style={{
                flex: 1, padding: '12px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
                border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
              }}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quiz Modal ── */}
      {showQuizModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '380px',
            background: '#0F1E14', borderRadius: '28px', padding: '28px',
            textAlign: 'center', border: '1px solid rgba(201,168,76,0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#C9A84C', margin: '0 0 8px' }}>
              📝 ทดสอบความรู้
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
              อุปกรณ์ชิ้นนี้ภาษาไทยเรียกว่าอะไร?
            </p>
            <div style={{
              fontSize: '22px', fontWeight: 900, color: '#FDFAF4',
              background: 'rgba(201,168,76,0.08)', padding: '16px', borderRadius: '16px',
              marginBottom: '20px', border: '1px solid rgba(201,168,76,0.2)'
            }}>
              {model.nameEn}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {quizOptions.map((opt, idx) => {
                const isSelected = quizSelectedOption === opt
                const isCorrect = opt === model.nameTh
                let bg = 'rgba(255,255,255,0.04)'
                let borderColor = 'rgba(255,255,255,0.1)'
                let color = 'rgba(255,255,255,0.8)'
                if (quizAnswered) {
                  if (isCorrect) { bg = 'rgba(74,222,128,0.15)'; borderColor = '#4ADE80'; color = '#4ADE80' }
                  else if (isSelected) { bg = 'rgba(248,113,113,0.15)'; borderColor = '#F87171'; color = '#F87171' }
                  else { bg = 'rgba(255,255,255,0.02)'; color = 'rgba(255,255,255,0.3)' }
                } else if (isSelected) { bg = 'rgba(201,168,76,0.12)'; borderColor = '#C9A84C'; color = '#C9A84C' }
                return (
                  <button key={idx} disabled={quizAnswered} onClick={() => setQuizSelectedOption(opt)} style={{
                    padding: '14px', borderRadius: '12px', border: `1.5px solid ${borderColor}`,
                    background: bg, color, fontWeight: 700, fontSize: '14px',
                    cursor: quizAnswered ? 'default' : 'pointer', textAlign: 'left',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <span style={{ fontSize: '12px', opacity: 0.6 }}>{['A', 'B', 'C'][idx]}.</span>
                    {opt}
                  </button>
                )
              })}
            </div>

            {quizAnswered && (
              <div style={{
                padding: '12px', borderRadius: '12px', marginBottom: '16px',
                background: quizSelectedOption === model.nameTh ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                color: quizSelectedOption === model.nameTh ? '#4ADE80' : '#F87171',
                fontWeight: 700, fontSize: '13px'
              }}>
                {quizSelectedOption === model.nameTh ? '🎉 ถูกต้อง! ยอดเยี่ยมมาก' : `❌ ผิด! คำตอบที่ถูกคือ "${model.nameTh}"`}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              {!quizAnswered ? (
                <button disabled={!quizSelectedOption} onClick={() => setQuizAnswered(true)} style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: quizSelectedOption ? 'linear-gradient(135deg, #C9A84C, #A6882A)' : 'rgba(255,255,255,0.08)',
                  color: quizSelectedOption ? '#0A1F12' : 'rgba(255,255,255,0.3)',
                  fontWeight: 800, fontSize: '13px', cursor: quizSelectedOption ? 'pointer' : 'default'
                }}>ส่งคำตอบ</button>
              ) : (
                <button onClick={() => {
                  setQuizAnswered(false); setQuizSelectedOption(null)
                  const pool = ['จานสลัดเดี่ยว', 'ช้อนตักแกง', 'ถ้วยน้ำจิ้ม', 'มีดหั่นเนื้อสเต็ก', 'แก้วเครื่องดื่มค็อกเทล']
                  const f = pool.filter(o => o !== model.nameTh).sort(() => 0.5 - Math.random())
                  setQuizOptions([model.nameTh, f[0], f[1]].sort(() => 0.5 - Math.random()))
                }} style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #C9A84C, #A6882A)',
                  color: '#0A1F12', fontWeight: 800, fontSize: '13px', cursor: 'pointer'
                }}>🔄 เล่นใหม่</button>
              )}
              <button onClick={() => setShowQuizModal(false)} style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer'
              }}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Global Animations ── */}
      <style>{`
        @keyframes arGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.5), 0 8px 24px rgba(201,168,76,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(201,168,76,0), 0 12px 32px rgba(201,168,76,0.5); }
        }
        @keyframes sttPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,38,53,0.5); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 12px rgba(139,38,53,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,38,53,0); }
        }
        model-viewer {
          --progress-bar-color: #C9A84C;
          --progress-mask: transparent;
        }
        model-viewer::part(default-ar-button) { display: none; }
      `}</style>
    </div>
  )
}

export default function ARViewerPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #040D07, #102B1F)', color: '#C9A84C',
        fontSize: '18px', fontWeight: 700
      }}>
        🕶️ กำลังโหลด AR...
      </div>
    }>
      <ARViewerContent />
    </Suspense>
  )
}
