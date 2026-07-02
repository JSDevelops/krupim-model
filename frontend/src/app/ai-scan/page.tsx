'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface ScanResult {
  name_th: string
  name_en: string
  category: string
  subcategory?: string
  description: string
  service_tips: string
  english_phrases?: string[]
  confidence: number
  location?: string
}

const categoryColors: Record<string, { bg: string; color: string; emoji: string }> = {
  food: { bg: 'rgba(46, 125, 50, 0.15)', color: '#4CAF50', emoji: '🍽️' },
  beverage: { bg: 'rgba(21, 101, 192, 0.15)', color: '#2196F3', emoji: '🥤' },
  equipment: { bg: 'rgba(230, 81, 0, 0.15)', color: '#FF9800', emoji: '⚙️' },
  tableware: { bg: 'rgba(123, 31, 162, 0.15)', color: '#E040FB', emoji: '🥄' },
}

export default function AIScanPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [camMode, setCamMode] = useState(false)

  // Speech Recognition & Synthesis States
  const [speaking, setSpeaking] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [speechScore, setSpeechScore] = useState<number | null>(null)
  const [studentSpeech, setStudentSpeech] = useState('')
  const [speechDiff, setSpeechDiff] = useState<{ text: string; status: 'correct' | 'missing' }[]>([])

  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Speech-to-Text Pronunciation Evaluation
  function startSpeechPractice(targetText: string) {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('เบราว์เซอร์ของคุณไม่สนับสนุนการจดจำเสียงพูด กรุณาใช้ Google Chrome หรือ Safari บนมือถือครับ')
      return
    }

    setIsRecording(true)
    setStudentSpeech('')
    setSpeechScore(null)
    setSpeechDiff([])

    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript
      setStudentSpeech(spoken)
      evaluatePronunciation(spoken, targetText)
    }

    rec.onerror = (err: any) => {
      console.error('Speech recognition error:', err)
      setIsRecording(false)
    }

    rec.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = rec
    rec.start()
  }

  function stopSpeechPractice() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

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
        spokenWords.splice(foundIdx, 1)
        return { text: origWord, status: 'correct' as const }
      }
      return { text: origWord, status: 'missing' as const }
    })

    const pct = targetWords.length > 0 ? Math.round((matchedCount / targetWords.length) * 100) : 0
    setSpeechScore(pct)
    setSpeechDiff(diffResult)
  }

  // Text-to-Speech (TTS)
  function speak(text: string, id: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.85
      utterance.onstart = () => setSpeaking(id)
      utterance.onend = () => setSpeaking(null)
      window.speechSynthesis.speak(utterance)
    } else {
      alert('ขออภัย เบราว์เซอร์ของคุณไม่รองรับการสังเคราะห์เสียง')
    }
  }

  // Start Camera with fallbacks
  async function startCamera() {
    setCamMode(true)
    setError('')
    setResult(null)
    setPreview(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (e) {
      console.log('Environment camera failed, trying fallback default:', e)
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true })
        streamRef.current = fallbackStream
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream
          videoRef.current.play()
        }
      } catch (fallbackErr) {
        setError('ไม่สามารถเชื่อมต่อกล้องถ่ายภาพได้ กรุณาอนุมัติสิทธิ์เข้าใช้งานกล้อง')
        setCamMode(false)
      }
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCamMode(false)
  }

  async function analyzeImage(base64: string, mimeType: string) {
    setScanning(true)
    setError('')
    setResult(null)
    
    // Get keys and provider from localStorage (multi-llm support)
    const activeProvider = typeof window !== 'undefined' ? localStorage.getItem('activeAiProvider') || 'gemini' : 'gemini'
    const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : ''
    const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('openaiApiKey') || '' : ''
    const claudeKey = typeof window !== 'undefined' ? localStorage.getItem('claudeApiKey') || '' : ''
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

    try {
      const resp = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-ai-provider': activeProvider,
          'x-gemini-key': geminiKey,
          'x-openai-key': openaiKey,
          'x-claude-key': claudeKey
        },
        body: JSON.stringify({ imageBase64: base64, mimeType })
      })

      if (!resp.ok) {
        throw new Error('Scan failed')
      }

      const data = await resp.json()
      setResult(data)
    } catch (e) {
      setError('ไม่สามารถวิเคราะห์สิ่งของชิ้นนี้ได้ กรุณาลองใหม่อีกครั้ง')
      console.error(e)
    } finally {
      setScanning(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)
      const base64 = dataUrl.split(',')[1]
      await analyzeImage(base64, file.type)
    }
    reader.readAsDataURL(file)
  }

  async function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setPreview(dataUrl)
    const base64 = dataUrl.split(',')[1]
    
    stopCamera()
    await analyzeImage(base64, 'image/jpeg')
  }

  function reset() {
    setResult(null)
    setPreview(null)
    setError('')
    stopCamera()
    setSpeechScore(null)
    setStudentSpeech('')
    setSpeechDiff([])
    if (fileRef.current) fileRef.current.value = ''
  }

  const cat = result ? (categoryColors[result.category] || categoryColors.food) : null

  return (
    <div className="page-content no-nav" style={{ background: '#080F0C', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* 1. Immersive Camera Mode (True Fullscreen) */}
      {camMode && (
        <div className="immersive-camera-wrapper">
          <video ref={videoRef} autoPlay playsInline muted className="fullscreen-video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Laser Sweeper Line */}
          {scanning && <div className="scanning-laser" />}

          {/* Target Reticle Frame Overlay */}
          <div className="scanning-reticle-overlay">
            <div className="reticle-box">
              <div className="corner corner-tl" />
              <div className="corner corner-tr" />
              <div className="corner corner-bl" />
              <div className="corner corner-br" />
              <div className="pulse-ring" />
            </div>
            <p className="scanner-instruction">
              {scanning ? 'กำลังวิเคราะห์รูปร่างวัตถุ...' : 'จัดวางอุปกรณ์ในกรอบเล็งเพื่อสแกน'}
            </p>
          </div>

          {/* Floating Top HUD Bar */}
          <div className="hud-top-bar">
            <button onClick={stopCamera} className="hud-back-btn">‹</button>
            <div className="hud-title-wrap">
              <span className="hud-main-title">AI Object Scanner</span>
              <span className="hud-sub-title">FINE MODEL LEARNING</span>
            </div>
            <div className="hud-provider-badge">
              <span className="live-dot" />
              VISION AI
            </div>
          </div>

          {/* Floating Bottom HUD Controls */}
          <div className="hud-bottom-bar">
            <button onClick={stopCamera} className="hud-btn-cancel">ปิดกล้อง</button>
            <button onClick={capturePhoto} className="hud-btn-capture" title="ถ่ายภาพวิเคราะห์">
              <div className="capture-inner-circle" />
            </button>
            <button onClick={() => { stopCamera(); fileRef.current?.click() }} className="hud-btn-gallery">เลือกภาพ</button>
          </div>
        </div>
      )}

      {/* 2. Header and Main Layout in Standby / Result Mode */}
      {!camMode && (
        <div className="scan-header">
          <Link href="/student/explore" className="premium-back-btn">‹</Link>
          <div style={{ flex: 1, textAlign: 'center', marginRight: 32 }}>
            <div style={{ color: 'white', fontWeight: 900, fontSize: 18, letterSpacing: '0.5px' }}>AI Scan</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>วิเคราะห์สิ่งของจริงด้วย Vision AI</div>
          </div>
        </div>
      )}

      {/* Standby Interface */}
      {!camMode && !result && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px 20px', gap: 24 }}>
          {preview ? (
            <div className="static-preview-container">
              <img src={preview} alt="Preview" className="static-preview-img" />
              {scanning && (
                <div className="scan-loading-overlay">
                  <div className="pulse-ring-static" />
                  <div className="laser-bar-static" />
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 700, marginTop: 12 }}>Gemini กำลังถอดรหัสโครงสร้าง...</div>
                </div>
              )}
            </div>
          ) : (
            <div className="scan-standby-card">
              <div className="robot-logo-wrap">
                <span className="robot-logo-emoji">🤖</span>
              </div>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 800, margin: '0 0 8px', textAlign: 'center' }}>ระบบวิเคราะห์ภาพวัตถุด้วย AI</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
                ถ่ายภาพหรือเปิดไฟล์ภาพอุปกรณ์อาหาร เครื่องดื่ม หรืออุปกรณ์การจัดโต๊ะอาหาร (Tableware) เพื่อให้ AI ค้นหาศัพท์ภาษาอังกฤษ ความหมาย ตำแหน่งจัดวางที่ถูกต้อง และฝึกสนทนา
              </p>
            </div>
          )}

          {error && (
            <div className="scan-error">⚠️ {error}</div>
          )}

          {!scanning && (
            <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="immersive-action-btn-camera" onClick={startCamera}>
                <span style={{ fontSize: 20 }}>📷</span>
                เปิดกล้องถ่ายภาพวัตถุ
              </button>
              <button className="immersive-action-btn-upload" onClick={() => fileRef.current?.click()}>
                <span style={{ fontSize: 18 }}>📁</span>
                เลือกรูปจากอัลบั้มมือถือ
              </button>
            </div>
          )}

          {!scanning && !preview && (
            <div className="tips-panel-container">
              <span style={{ fontSize: 24, filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.3))' }}>💡</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#C9A84C', fontWeight: 800, fontSize: 13, marginBottom: 3 }}>แนะนำสำหรับบริการ</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5, lineHeight: 1.5 }}>พยายามถ่ายภาพในระยะห่างที่เห็นอุปกรณ์ชัดเจนและเป็นระเบียบ เพื่อจำลองความมั่นใจของ AI ได้ดีที่สุด</div>
              </div>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
        </div>
      )}

      {/* 3. Slide-up Result Glassmorphic Sheet */}
      {result && cat && !camMode && (
        <div className="scan-result-sheet-overlay">
          {preview && (
            <div className="result-backdrop-image-container">
              <img src={preview} alt="Scanned background" className="result-backdrop-img" />
            </div>
          )}

          <div className="result-sheet-content">
            <div className="sheet-drag-handle" />

            <div className="result-sheet-header" style={{ borderLeft: `5px solid ${cat.color}` }}>
              <div className="result-icon-pill" style={{ background: cat.bg, color: cat.color }}>
                <span style={{ fontSize: 24 }}>{cat.emoji}</span>
              </div>
              <div className="result-titles">
                <div className="result-name-en-main">{result.name_en}</div>
                <div className="result-name-th-sub">{result.name_th}</div>
                <div className="result-category-badge" style={{ background: cat.color }}>
                  {result.subcategory || result.category}
                </div>
              </div>
              <div className="result-gauge-wrap">
                <div className="confidence-gauge" style={{ borderColor: cat.color }}>
                  <span style={{ color: cat.color, fontWeight: 900 }}>{result.confidence}%</span>
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: 700 }}>ความมั่นใจ</div>
              </div>
            </div>

            <div className="result-sheet-body">
              <div className="result-detail-card">
                <div className="detail-section-title">📝 วิธีการใช้งาน & หน้าที่ (Usage)</div>
                <p className="detail-text-body">{result.description}</p>
              </div>

              {result.location && (
                <div className="result-detail-card">
                  <div className="detail-section-title">📍 ตำแหน่งการจัดวางมาตรฐานบนโต๊ะ (Placement)</div>
                  <p className="detail-text-body" style={{ fontStyle: 'italic', color: '#D4C9B3' }}>{result.location}</p>
                </div>
              )}

              <div className="result-detail-card" style={{ borderLeft: '4px solid #C9A84C', background: 'rgba(201,168,76,0.06)' }}>
                <div className="detail-section-title" style={{ color: '#C9A84C' }}>💡 เคล็ดลับงานบริการของบริกร (Service Tips)</div>
                <p className="detail-text-body">{result.service_tips}</p>
              </div>

              {/* Speech & Conversation Coach (STT & TTS) */}
              {result.english_phrases && result.english_phrases.length > 0 && (
                <div className="result-detail-card coach-card">
                  <div className="detail-section-title" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🗣️</span> AI English Service Coach (ฝึกสำเนียงวิชาชีพ)
                  </div>

                  {result.english_phrases.map((phrase, i) => {
                    const isSpeakingThis = speaking === `phrase-${i}`
                    return (
                      <div key={i} className="immersive-phrase-box">
                        <div className="phrase-upper-row">
                          <p className="phrase-english-text">"{phrase}"</p>
                          <button 
                            onClick={() => speak(phrase, `phrase-${i}`)}
                            className={`speak-trigger-btn ${isSpeakingThis ? 'is-speaking' : ''}`}
                          >
                            🔊 {isSpeakingThis ? 'กำลังพูด...' : 'ฟังเสียง'}
                          </button>
                        </div>

                        {/* Pronunciation evaluation panel */}
                        <div className="speech-practice-row">
                          {isRecording ? (
                            <button onClick={stopSpeechPractice} className="speech-record-btn stop-recording">
                              ⏹️ หยุดพูด
                            </button>
                          ) : (
                            <button onClick={() => startSpeechPractice(phrase)} className="speech-record-btn start-recording">
                              🎙️ กดแล้วฝึกพูดประโยคนี้
                            </button>
                          )}

                          {studentSpeech && (
                            <div className="student-speech-container">
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>คุณพูดว่า:</div>
                              <p className="student-speech-text">"{studentSpeech}"</p>
                            </div>
                          )}

                          {speechScore !== null && (
                            <div className="speech-score-display">
                              <div className="score-summary-bar">
                                <span className="score-label">คะแนนความถูกต้อง:</span>
                                <span className={`score-badge ${speechScore >= 80 ? 'score-high' : speechScore >= 50 ? 'score-mid' : 'score-low'}`}>
                                  {speechScore}% Match
                                </span>
                              </div>
                              <div className="diff-highlight-box">
                                {speechDiff.map((word, wIdx) => (
                                  <span key={wIdx} className={`diff-word-span ${word.status === 'correct' ? 'word-correct' : 'word-missing'}`}>
                                    {word.text}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={reset} className="sheet-btn-secondary" style={{ flex: 1 }}>
                  🔄 สแกนชิ้นใหม่
                </button>
                <Link href="/student/interact" className="sheet-btn-primary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  💬 ปรึกษา AI ต่อยอด
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX (Highly Premium & Immersive Layout) */}
      <style jsx>{`
        /* Fullscreen Camera Layout */
        .immersive-camera-wrapper {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1000;
          background: #000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .fullscreen-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        /* Scanning overlay reticle */
        .scanning-reticle-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 5;
          pointer-events: none;
        }
        .reticle-box {
          width: 250px;
          height: 250px;
          border: 1px dashed rgba(255, 255, 255, 0.25);
          border-radius: 24px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .corner {
          position: absolute;
          width: 32px;
          height: 32px;
          border-color: #C9A84C;
          border-style: solid;
        }
        .corner-tl { top: -2px; left: -2px; border-width: 4px 0 0 4px; border-radius: 14px 0 0 0; }
        .corner-tr { top: -2px; right: -2px; border-width: 4px 4px 0 0; border-radius: 0 14px 0 0; }
        .corner-bl { bottom: -2px; left: -2px; border-width: 0 0 4px 4px; border-radius: 0 0 0 14px; }
        .corner-br { bottom: -2px; right: -2px; border-width: 0 4px 4px 0; border-radius: 0 0 14px 0; }

        .pulse-ring {
          width: 200px;
          height: 200px;
          border: 2px dashed rgba(201, 168, 76, 0.35);
          border-radius: 50%;
          animation: spinCircular 20s linear infinite;
        }
        @keyframes spinCircular {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .scanner-instruction {
          color: white;
          font-size: 12px;
          font-weight: 700;
          margin-top: 24px;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
          text-transform: uppercase;
        }

        .scanning-laser {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, transparent, #C9A84C, transparent);
          box-shadow: 0 0 14px #C9A84C, 0 0 28px #C9A84C;
          animation: scanSweeper 2.2s ease-in-out infinite;
          z-index: 4;
        }
        @keyframes scanSweeper {
          0% { top: 15%; }
          50% { top: 85%; }
          100% { top: 15%; }
        }

        /* Top HUD */
        .hud-top-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 44px 20px 24px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);
        }
        .hud-back-btn {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: white;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .hud-title-wrap {
          text-align: center;
        }
        .hud-main-title {
          display: block;
          color: white;
          font-weight: 800;
          font-size: 14.5px;
          letter-spacing: 0.5px;
        }
        .hud-sub-title {
          display: block;
          color: #C9A84C;
          font-weight: 700;
          font-size: 9px;
          letter-spacing: 1px;
          margin-top: 1px;
        }
        .hud-provider-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(30, 77, 58, 0.65);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #22C55E;
          font-size: 9px;
          font-weight: 900;
          padding: 6px 12px;
          border-radius: 100px;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          background: #22C55E;
          border-radius: 50%;
          animation: pulseMic 1.2s infinite;
        }

        /* Bottom HUD */
        .hud-bottom-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 30px 48px;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);
        }
        .hud-btn-cancel, .hud-btn-gallery {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 12.5px;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 100px;
          cursor: pointer;
        }
        .hud-btn-capture {
          width: 78px;
          height: 78px;
          border: 4px solid white;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .hud-btn-capture:active {
          transform: scale(0.9);
        }
        .capture-inner-circle {
          width: 58px;
          height: 58px;
          background: white;
          border-radius: 50%;
        }

        /* Standby Interface Headers */
        .scan-header {
          display: flex;
          align-items: center;
          padding: 48px 16px 14px;
          background: #0D1612;
          border-bottom: 1.5px solid rgba(255,255,255,0.06);
        }
        .premium-back-btn {
          color: white;
          text-decoration: none;
          font-size: 32px;
          padding: 0 12px;
        }

        /* Static Uploader preview and loader */
        .static-preview-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          height: 280px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          border: 2px solid rgba(255,255,255,0.1);
        }
        .static-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .scan-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(8, 15, 12, 0.85);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }
        .pulse-ring-static {
          width: 64px;
          height: 64px;
          border: 3px solid #C9A84C;
          border-radius: 50%;
          animation: staticPulse 1.4s infinite ease-in-out;
        }
        @keyframes staticPulse {
          0% { transform: scale(0.85); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .scan-standby-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.04);
          border: 1.5px dashed rgba(255,255,255,0.12);
          border-radius: 24px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .robot-logo-wrap {
          width: 90px;
          height: 90px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px dashed rgba(201, 168, 76, 0.35);
          margin-bottom: 20px;
        }
        .robot-logo-emoji {
          font-size: 48px;
        }

        /* Action Buttons */
        .immersive-action-btn-camera {
          width: 100%;
          padding: 15px;
          border-radius: 100px;
          border: none;
          background: linear-gradient(135deg, #1E4D3A 0%, #102B1F 100%);
          color: white;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(16,43,31,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .immersive-action-btn-upload {
          width: 100%;
          padding: 14px;
          border-radius: 100px;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          color: #FFF;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .tips-panel-container {
          background: rgba(201, 168, 76, 0.08);
          border: 1.5px solid rgba(201, 168, 76, 0.18);
          border-radius: 18px;
          padding: 14px 18px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          width: 100%;
          max-width: 400px;
        }

        /* Bottom Sheet Results */
        .scan-result-sheet-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 9, 8, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 900;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          animation: fadeInOverlay 0.3s ease;
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .result-backdrop-image-container {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 35%;
          z-index: 1;
          overflow: hidden;
        }
        .result-backdrop-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.25;
          filter: blur(8px);
        }

        .result-sheet-content {
          position: relative;
          z-index: 2;
          background: rgba(12, 21, 18, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 2px solid rgba(255, 255, 255, 0.12);
          border-radius: 30px 30px 0 0;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
          animation: slideUpSheet 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .sheet-drag-handle {
          width: 40px;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          margin: 12px auto 8px;
        }

        .result-sheet-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .result-icon-pill {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .result-titles {
          flex: 1;
        }
        .result-name-en-main {
          color: white;
          font-weight: 900;
          font-size: 19px;
        }
        .result-name-th-sub {
          color: #A6882A;
          font-weight: 750;
          font-size: 14px;
          margin-top: 1px;
        }
        .result-category-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 800;
          color: white;
          padding: 3px 8px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 5px;
        }
        .result-gauge-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .confidence-gauge {
          width: 48px;
          height: 48px;
          border: 3px solid;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        }

        .result-sheet-body {
          padding: 16px 20px 32px;
        }
        .result-detail-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 12px;
        }
        .detail-section-title {
          font-size: 10px;
          font-weight: 900;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .detail-text-body {
          font-size: 13.5px;
          color: rgba(255,255,255,0.85);
          line-height: 1.55;
          margin: 0;
        }

        /* Language Coach */
        .coach-card {
          background: rgba(56, 189, 248, 0.03);
          border: 1.5px solid rgba(56, 189, 248, 0.15);
        }
        .immersive-phrase-box {
          background: rgba(0, 0, 0, 0.25);
          border-radius: 12px;
          padding: 12px;
          margin-top: 10px;
        }
        .phrase-upper-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .phrase-english-text {
          font-size: 14px;
          font-style: italic;
          font-weight: 650;
          color: white;
          margin: 0;
          line-height: 1.45;
        }
        .speak-trigger-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 5px 10px;
          border-radius: 6px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .speak-trigger-btn.is-speaking {
          background: rgba(56, 189, 248, 0.25);
          border-color: #38bdf8;
          color: #38bdf8;
          animation: pulseMic 1.2s infinite;
        }

        .speech-practice-row {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .speech-record-btn {
          width: 100%;
          padding: 8px;
          border-radius: 8px;
          border: none;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }
        .speech-record-btn.start-recording {
          background: #EAB308;
          color: #000;
        }
        .speech-record-btn.stop-recording {
          background: #EF4444;
          color: white;
          animation: pulseMic 1.2s infinite;
        }

        .student-speech-container {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 8px;
          font-size: 12px;
        }
        .student-speech-text {
          margin: 0;
          color: #D4C9B3;
          font-weight: 600;
        }

        .speech-score-display {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 8px;
        }
        .score-summary-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .score-label {
          font-size: 10.5px;
          color: rgba(255,255,255,0.4);
          font-weight: 700;
        }
        .score-badge {
          font-size: 9.5px;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 100px;
          color: white;
        }
        .score-high { background: #22C55E; }
        .score-mid { background: #EAB308; }
        .score-low { background: #EF4444; }

        .diff-highlight-box {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          line-height: 1.4;
        }
        .diff-word-span {
          font-size: 12px;
          font-weight: 800;
        }
        .word-correct { color: #22C55E; }
        .word-missing { color: #EF4444; text-decoration: line-through; }

        .sheet-btn-primary {
          background: linear-gradient(135deg, #1E4D3A 0%, #102B1F 100%);
          color: white;
          border: none;
          font-size: 13px;
          font-weight: 800;
          padding: 14px;
          border-radius: 12px;
          cursor: pointer;
        }
        .sheet-btn-secondary {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.15);
          color: white;
          font-size: 13px;
          font-weight: 800;
          padding: 14px;
          border-radius: 12px;
          cursor: pointer;
        }

        /* Banner footer loader */
        .scanning-banner-footer {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(12, 21, 18, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          padding: 10px 20px;
          color: white;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.5);
          z-index: 100;
        }
        .scanner-pulsing-dot {
          width: 8px;
          height: 8px;
          background: #C9A84C;
          border-radius: 50%;
          animation: pulseMic 1.2s infinite;
        }

        .scan-error {
          width: 100%;
          max-width: 400px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #EF4444;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        @keyframes pulseMic {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
