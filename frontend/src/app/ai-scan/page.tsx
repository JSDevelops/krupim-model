'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface FineAnalysis {
  familiarize?: {
    desc: string
    location: string
  }
  interact?: {
    pronunciation: string
    english_phrases: string[]
    roleplay_prompt?: string
  }
  navigate?: {
    service_steps: string[]
    safety_rules?: string
  }
  exhibit?: {
    quiz_question: string
    quiz_options: string[]
    correct_answer: string
  }
}

interface ScanResult {
  name_th: string
  name_en: string
  category: string
  subcategory?: string
  description: string
  location?: string
  service_tips: string
  english_phrases?: string[]
  pronounce?: string
  confidence: number
  fine_analysis?: FineAnalysis
}

const categoryColors: Record<string, { bg: string; color: string; emoji: string }> = {
  food: { bg: '#E8F5E9', color: '#2E7D32', emoji: '🍽️' },
  beverage: { bg: '#E3F2FD', color: '#1565C0', emoji: '🥤' },
  equipment: { bg: '#FFF3E0', color: '#E65100', emoji: '⚙️' },
  tableware: { bg: '#F3E5F5', color: '#7B1FA2', emoji: '🥄' },
}

export default function AIScanPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [camMode, setCamMode] = useState(false)
  
  // Real-time Scanning & Interactive States
  const [autoScan, setAutoScan] = useState(false)
  const [matchedModelId, setMatchedModelId] = useState<string | null>(null)
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [activeTab, setActiveTab] = useState<'F' | 'I' | 'N' | 'E'>('F')
  
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const autoScanTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRequestPendingRef = useRef(false)

  // Speech output helper
  function speakText(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const ut = new SpeechSynthesisUtterance(text)
      ut.lang = 'en-US'
      ut.rate = 0.85
      window.speechSynthesis.speak(ut)
    }
  }

  // Auto-scan capturing frame
  const captureAutoScanFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isRequestPendingRef.current || scanning || result) return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    
    // Safety check for video dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) return
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    const base64 = dataUrl.split(',')[1]
    
    isRequestPendingRef.current = true
    setScanning(true)
    setError('')
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://krupim-model-production.up.railway.app'
      const resp = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' })
      })
      if (!resp.ok) throw new Error('Scan failed')
      const data = (await resp.json()) as ScanResult
      
      // If AI detects something with high confidence
      if (data.confidence && data.confidence > 55) {
        setResult(data)
        setPreview(dataUrl)
        
        // Stop camera stream
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach(t => t.stop())
          videoRef.current.srcObject = null
        }
        setCamMode(false)
        setAutoScan(false)
        setMatchedModelId(null)
        setQuizSelectedOption(null)
        setQuizAnswered(false)
        setActiveTab('F')
        
        // Look up matching 3D model in database
        try {
          const { data: matchedItem } = await supabase
            .from('ai_scan_items')
            .select('id, glb_url')
            .eq('name_en', data.name_en)
            .maybeSingle()
          if (matchedItem && matchedItem.glb_url) {
            setMatchedModelId(matchedItem.id)
          }
        } catch (dbErr) {
          console.error('Database match check error:', dbErr)
        }
      }
    } catch (e) {
      console.warn('Real-time frame scan error:', e)
    } finally {
      setScanning(false)
      isRequestPendingRef.current = false
    }
  }, [scanning, result])

  // Setup auto scan timer loop
  useEffect(() => {
    if (camMode && autoScan && !result) {
      autoScanTimerRef.current = setInterval(() => {
        captureAutoScanFrame()
      }, 3500)
    } else {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current)
        autoScanTimerRef.current = null
      }
    }
    return () => {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current)
      }
    }
  }, [camMode, autoScan, result, captureAutoScanFrame])

  async function analyzeImage(base64: string, mimeType: string) {
    setScanning(true)
    setError('')
    setResult(null)
    setMatchedModelId(null)
    setQuizSelectedOption(null)
    setQuizAnswered(false)
    setActiveTab('F')
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://krupim-model-production.up.railway.app'
      const resp = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType })
      })
      if (!resp.ok) throw new Error('Scan failed')
      const data = await resp.json()
      setResult(data)

      // Look up matching 3D model in database
      try {
        const { data: matchedItem } = await supabase
          .from('ai_scan_items')
          .select('id, glb_url')
          .eq('name_en', data.name_en)
          .maybeSingle()
        if (matchedItem && matchedItem.glb_url) {
          setMatchedModelId(matchedItem.id)
        }
      } catch (err) {
        console.error('Database match check error:', err)
      }
    } catch (e) {
      setError('ไม่สามารถวิเคราะห์ภาพได้ กรุณาลองใหม่')
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

  async function startCamera() {
    setCamMode(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (e) {
      setError('ไม่สามารถเปิดกล้องได้')
      setCamMode(false)
    }
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
    
    // Stop camera
    if (videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setCamMode(false)
    setAutoScan(false)
    
    await analyzeImage(base64, 'image/jpeg')
  }

  function reset() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setResult(null)
    setPreview(null)
    setError('')
    setCamMode(false)
    setAutoScan(false)
    setMatchedModelId(null)
    setQuizSelectedOption(null)
    setQuizAnswered(false)
    setActiveTab('F')
    if (fileRef.current) fileRef.current.value = ''
  }

  const cat = result ? (categoryColors[result.category] || categoryColors.food) : null

  return (
    <div className="page-content no-nav" style={{background: '#0D0D1A', minHeight: '100vh'}}>
      <div className="scan-header">
        <Link href="/student/dashboard" className="premium-back-btn">‹</Link>
        <div>
          <div style={{color:'white', fontWeight:700, fontSize:16}}>AI Real-time Scan</div>
          <div style={{color:'rgba(255,255,255,0.6)', fontSize:11}}>วิเคราะห์แบบเรียลไทม์ด้วย FINE MODEL</div>
        </div>
        <div style={{width:44}} />
      </div>

      {/* Camera / Preview Area */}
      <div className="scan-viewfinder" style={{ height: '320px' }}>
        {camMode ? (
          <div className="cam-view">
            <video ref={videoRef} autoPlay playsInline muted className="cam-video" />
            <canvas ref={canvasRef} style={{display:'none'}} />
            <div className="cam-overlay">
              <div className="scan-frame" />
              <button 
                onClick={() => setAutoScan(!autoScan)}
                type="button"
                style={{
                  background: autoScan ? 'linear-gradient(135deg, #E65100, #EF6C00)' : 'rgba(0,0,0,0.6)',
                  color: 'white',
                  border: '1.5px solid ' + (autoScan ? '#FFF3E0' : 'rgba(255,255,255,0.3)'),
                  borderRadius: 20,
                  padding: '6px 16px',
                  fontSize: 12,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: 12,
                  zIndex: 20,
                  boxShadow: autoScan ? '0 0 12px rgba(230,81,0,0.5)' : 'none'
                }}
              >
                {autoScan ? '🔵 กำลังสแกนเรียลไทม์อัตโนมัติ...' : '📷 เปิดสแกนเรียลไทม์ (Auto)'}
              </button>
              <p style={{color:'rgba(255,255,255,0.8)', fontSize:11, marginTop:8}}>
                {autoScan ? 'ถือกล้องนิ่งๆ รอ AI ตรวจจับและประมวลผล' : 'จัดวางอุปกรณ์ให้อยู่ในกรอบแล้วกดปุ่มถ่าย'}
              </p>
            </div>
            <div className="cam-controls">
              <button onClick={reset} className="cam-btn-cancel">ยกเลิก</button>
              <button onClick={capturePhoto} className="cam-btn-capture" title="ถ่ายภาพวิเคราะห์">
                <div className="capture-btn-inner" />
              </button>
              <div style={{width:64}} />
            </div>
          </div>
        ) : preview ? (
          <div className="preview-view">
            <img src={preview} alt="Preview" className="preview-img" />
            {scanning && (
              <div className="scan-loading">
                <div className="scan-pulse" />
                <div className="scan-line" />
                <div style={{color:'white', fontSize:13, marginTop:12}}>กำลังวิเคราะห์...</div>
              </div>
            )}
          </div>
        ) : (
          <div className="scan-placeholder">
            <div className="scan-icon-wrap" style={{ borderStyle: 'solid', borderColor: '#C9A84C' }}>
              <span style={{fontSize:60}}>🤖</span>
            </div>
            <p style={{color:'rgba(255,255,255,0.7)', fontSize:14, textAlign:'center', lineHeight:1.6}}>
              ส่องกล้องสแกนวัสดุ/อุปกรณ์จริง<br/>หรืออัปโหลดรูปภาพอาหารและเครื่องดื่ม<br/>เพื่อวิเคราะห์ตามหลัก FINE MODEL
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!camMode && !scanning && !result && (
        <div className="scan-actions">
          <button className="scan-btn-primary" onClick={startCamera}>
            <span style={{fontSize:22}}>📷</span>
            เปิดกล้องสแกนวัตถุ
          </button>
          <button className="scan-btn-secondary" onClick={() => fileRef.current?.click()}>
            <span style={{fontSize:22}}>🖼️</span>
            อัปโหลดภาพถ่าย
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFileSelect} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="scan-error" style={{ marginTop: 12 }}>⚠️ {error}</div>
      )}

      {/* Result */}
      {result && cat && (
        <div className="scan-result animate-slide-up" style={{ borderRadius: '24px 24px 0 0', background: '#FDFAF4' }}>
          <div className="result-header" style={{background: cat.bg, borderBottom: '1px solid rgba(0,0,0,0.06)'}}>
            <div className="result-icon" style={{background: cat.color}}>
              <span style={{fontSize:28}}>{cat.emoji}</span>
            </div>
            <div className="result-title-wrap">
              <div className="result-name-th" style={{color: '#102B1F'}}>{result.name_th}</div>
              <div className="result-name-en" style={{color: '#666'}}>{result.name_en}</div>
              <div className="badge" style={{background: cat.color, color:'white', marginTop:4, fontSize: 10, fontWeight: 700}}>
                {result.subcategory || result.category}
              </div>
            </div>
            <div className="result-confidence">
              <div style={{fontSize:20, fontWeight:700, color: cat.color}}>{result.confidence}%</div>
              <div style={{fontSize:9, color:'#888', fontWeight: 600}}>ความมั่นใจ AI</div>
            </div>
          </div>

          <div className="result-body" style={{ background: '#FDFAF4', padding: '16px 20px 32px' }}>
            
            {/* FINE Tab Navigation */}
            <div style={{
              display: 'flex',
              background: '#EDE9E1',
              borderRadius: 12,
              padding: 4,
              marginBottom: 20
            }}>
              {(['F', 'I', 'N', 'E'] as const).map(tab => {
                const isActive = activeTab === tab
                const label = tab === 'F' ? 'F-Familiarize' : tab === 'I' ? 'I-Interact' : tab === 'N' ? 'N-Navigate' : 'E-Exhibit'
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                    style={{
                      flex: 1,
                      padding: '8px 2px',
                      border: 'none',
                      background: isActive ? '#102B1F' : 'transparent',
                      color: isActive ? '#C9A84C' : '#555',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: 10.5,
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* TAB F: Familiarize */}
            {activeTab === 'F' && (
              <div className="animate-fade-in">
                <div className="result-section">
                  <div className="result-section-title" style={{color: '#102B1F'}}>📝 ลักษณะและการใช้งาน (F-Familiarize)</div>
                  <p className="result-text" style={{fontSize: 13.5, color: '#4A4138', lineHeight: 1.6}}>
                    {result.fine_analysis?.familiarize?.desc || result.description}
                  </p>
                </div>
                <div className="result-section" style={{marginTop: 14}}>
                  <div className="result-section-title" style={{color: '#102B1F'}}>📍 ตำแหน่งการจัดวางบนโต๊ะอาหาร</div>
                  <p className="result-text" style={{fontSize: 13.5, color: '#4A4138', lineHeight: 1.6}}>
                    {result.fine_analysis?.familiarize?.location || result.location || 'จัดวางตามมาตรฐานการจัดโต๊ะ Place Setting'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB I: Interact */}
            {activeTab === 'I' && (
              <div className="animate-fade-in">
                <div className="result-section">
                  <div className="result-section-title" style={{color: '#102B1F'}}>🔊 การออกเสียงศัพท์บริการ (I-Interact)</div>
                  <div style={{display:'flex', alignItems:'center', gap:10, background:'white', border: '1px solid #EDE9E1', padding:'10px 14px', borderRadius:14, marginBottom:12}}>
                    <span style={{fontSize:15, fontWeight:800, color:'#102B1F'}}>{result.name_en}</span>
                    {result.fine_analysis?.interact?.pronunciation && (
                      <span style={{fontSize:12, color:'#A6882A', fontStyle:'italic', fontWeight: 600}}>{result.fine_analysis?.interact?.pronunciation}</span>
                    )}
                    <button 
                      onClick={() => speakText(result.name_en)}
                      type="button"
                      style={{marginLeft:'auto', border:'none', background:'#EAF3EE', width:32, height:32, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}
                      title="ฟังเสียงคำอ่าน"
                    >
                      🔊
                    </button>
                  </div>
                </div>
                <div className="result-section">
                  <div className="result-section-title" style={{color: '#102B1F'}}>🗣️ ประโยคภาษาอังกฤษสื่อสารกับลูกค้า</div>
                  {(result.fine_analysis?.interact?.english_phrases || result.english_phrases || []).map((phrase, idx) => (
                    <div key={idx} style={{background:'white', border: '1px solid #EDE9E1', padding:'10px 12px', borderRadius:10, marginBottom:6, fontSize:13, display:'flex', alignItems:'center', gap:8}}>
                      <span style={{color:cat.color, fontWeight:'bold'}}>→</span>
                      <span style={{fontStyle:'italic', flex:1, color:'#333'}}>{phrase}</span>
                      <button 
                        onClick={() => speakText(phrase)}
                        type="button"
                        style={{border:'none', background:'transparent', cursor:'pointer', fontSize:14}}
                      >
                        🔊
                      </button>
                    </div>
                  ))}
                </div>
                {result.fine_analysis?.interact?.roleplay_prompt && (
                  <div className="result-section" style={{background:'#FFF7E6', padding:12, borderRadius:12, borderLeft:'4px solid #C9A84C', marginTop:14}}>
                    <div style={{fontSize:10, fontWeight:900, color:'#A6882A', textTransform:'uppercase', letterSpacing: '0.5px'}}>โจทย์บทบาทสมมติ (Role-play Practice)</div>
                    <p style={{margin:'4px 0 0 0', fontSize:12.5, color:'#4A4138', fontWeight:700}}>{result.fine_analysis?.interact?.roleplay_prompt}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB N: Navigate */}
            {activeTab === 'N' && (
              <div className="animate-fade-in">
                <div className="result-section">
                  <div className="result-section-title" style={{color: '#102B1F'}}>📋 ขั้นตอนมาตรฐานปฏิบัติงาน (N-Navigate)</div>
                  {(result.fine_analysis?.navigate?.service_steps || []).length > 0 ? (
                    (result.fine_analysis?.navigate?.service_steps || []).map((step, idx) => (
                      <div key={idx} style={{display:'flex', gap:10, marginBottom:10, fontSize:13.5, alignItems: 'flex-start'}}>
                        <span style={{background:'#102B1F', color:'#C9A84C', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0, fontWeight:'bold', marginTop: 1}}>{idx + 1}</span>
                        <span style={{color:'#4A4138', lineHeight:1.5}}>{step}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{fontSize:13.5, color:'#4A4138'}}>{result.service_tips}</p>
                  )}
                </div>
                {result.fine_analysis?.navigate?.safety_rules && (
                  <div className="result-section" style={{background:'#FFF0F2', padding:12, borderRadius:12, borderLeft:'4px solid #D32F2F', marginTop:16}}>
                    <div style={{fontSize:10, fontWeight:900, color:'#D32F2F', textTransform:'uppercase', letterSpacing: '0.5px'}}>⚠️ ข้อควรระวังและสุขอนามัยบริการ</div>
                    <p style={{margin:'4px 0 0 0', fontSize:12.5, color:'#555', fontWeight:700}}>{result.fine_analysis?.navigate?.safety_rules}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB E: Exhibit */}
            {activeTab === 'E' && (
              <div className="animate-fade-in">
                <div className="result-section">
                  <div className="result-section-title" style={{color: '#102B1F'}}>📝 คำถามประเมินตนเอง (E-Exhibit)</div>
                  {result.fine_analysis?.exhibit?.quiz_question ? (
                    <div style={{background:'white', border:'1.5px solid #EDE9E1', padding:16, borderRadius:18}}>
                      <div style={{fontSize:14, fontWeight:800, color:'#102B1F', marginBottom:12, lineHeight: 1.5}}>
                        ❓ {result.fine_analysis?.exhibit?.quiz_question}
                      </div>
                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        {(result.fine_analysis?.exhibit?.quiz_options || []).map((option, idx) => {
                          const isSelected = quizSelectedOption === option
                          const isCorrect = option === result.fine_analysis?.exhibit?.correct_answer
                          let btnBg = 'white'
                          let btnBorder = '1px solid #EDE9E1'
                          let btnColor = '#4A4138'
                          
                          if (quizAnswered) {
                            if (isCorrect) {
                              btnBg = '#EAF3EE'
                              btnBorder = '1.5px solid #1E4D3A'
                              btnColor = '#1E4D3A'
                            } else if (isSelected) {
                              btnBg = '#FDF0F2'
                              btnBorder = '1.5px solid #D32F2F'
                              btnColor = '#D32F2F'
                            } else {
                              btnBg = 'white'
                              btnBorder = '1px solid #F5F5F5'
                              btnColor = '#999'
                            }
                          } else if (isSelected) {
                            btnBg = '#FDFAF4'
                            btnBorder = '1.5px solid #C9A84C'
                          }

                          return (
                            <button
                              key={idx}
                              disabled={quizAnswered}
                              onClick={() => setQuizSelectedOption(option)}
                              type="button"
                              style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: btnBorder,
                                background: btnBg,
                                color: btnColor,
                                borderRadius: 12,
                                fontSize: 13,
                                fontWeight: isSelected || (quizAnswered && isCorrect) ? 'bold' : 'normal',
                                textAlign: 'left',
                                cursor: quizAnswered ? 'default' : 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <span style={{ marginRight: 6, color: isSelected ? '#C9A84C' : '#888' }}>
                                {idx === 0 ? 'A.' : idx === 1 ? 'B.' : 'C.'}
                              </span>
                              {option}
                            </button>
                          )
                        })}
                      </div>
                      
                      {!quizAnswered ? (
                        <button
                          disabled={!quizSelectedOption}
                          onClick={() => setQuizAnswered(true)}
                          type="button"
                          style={{
                            width: '100%',
                            marginTop: 14,
                            padding: '12px',
                            background: quizSelectedOption ? 'linear-gradient(135deg, #102B1F, #1E4D3A)' : '#CCC',
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            fontWeight: 'bold',
                            fontSize: 13,
                            cursor: quizSelectedOption ? 'pointer' : 'default'
                          }}
                        >
                          ส่งคำตอบ
                        </button>
                      ) : (
                        <div style={{
                          marginTop: 14,
                          padding: '10px',
                          background: quizSelectedOption === result.fine_analysis?.exhibit?.correct_answer ? '#EAF3EE' : '#FDF0F2',
                          color: quizSelectedOption === result.fine_analysis?.exhibit?.correct_answer ? '#1E4D3A' : '#D32F2F',
                          borderRadius: 10,
                          fontSize: 12.5,
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          {quizSelectedOption === result.fine_analysis?.exhibit?.correct_answer ? '🎉 ยอดเยี่ยม! คุณตอบถูกต้อง ได้รับ 10 คะแนนความรู้' : '❌ คำตอบยังไม่ถูก ลองศึกษาข้อมูลใน F-Familiarize ใหม่นะครับ'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{fontSize:13, color:'#666'}}>ไม่มีชุดแบบทดสอบรองรับสำหรับอุปกรณ์จำลองนี้</p>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{display:'flex', gap:'10px', marginTop:'24px'}}>
              <button onClick={reset} className="btn btn-outline" style={{flex:1, borderRadius: 14, background: 'transparent', border: '1.5px solid #1E4D3A', color: '#1E4D3A', fontWeight: 800, fontFamily: 'var(--font-primary)'}}>
                🔄 สแกนชิ้นใหม่
              </button>
              {matchedModelId ? (
                <Link href={`/student/ar-view?id=${matchedModelId}`} className="btn btn-primary" style={{flex:1, borderRadius: 14, background: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)', color: 'white', fontWeight: 800, textDecoration:'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-primary)'}}>
                  📱 ส่องกล้อง AR จริง
                </Link>
              ) : (
                <Link href={result ? `/chat?q=${encodeURIComponent(`ช่วยแนะนำคำศัพท์ ประโยคสนทนาภาษาอังกฤษ และการจัดวาง/การบริการของ "${result.name_en}" (${result.name_th}) ในฐานะบริกรโรงแรมให้หน่อยครับ`)}` : '/chat'} className="btn btn-primary" style={{flex:1, borderRadius: 14, background: 'linear-gradient(135deg, #C9A84C 0%, #A6882A 100%)', color: 'white', fontWeight: 800, textDecoration:'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-primary)'}}>
                  💬 ถามผู้ช่วย AI
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scanning status footer overlay */}
      {scanning && (
        <div className="scan-status" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', bottom: 0, left:0, right:0, zIndex: 1000 }}>
          <span className="animate-pulse" style={{fontSize:18}}>🤖</span>
          Gemini Vision กำลังวิเคราะห์วัตถุแบบเรียลไทม์...
        </div>
      )}

      <style jsx>{`
        .scan-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 48px var(--space-4) var(--space-3);
          position: relative;
          z-index: 10;
        }
        .scan-viewfinder {
          height: 300px;
          position: relative;
          overflow: hidden;
          background: #1A1A2E;
        }
        .cam-view { position: relative; width: 100%; height: 100%; }
        .cam-video { width: 100%; height: 100%; object-fit: cover; }
        .cam-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.1);
        }
        .scan-frame {
          width: 180px; height: 180px;
          border: 2px solid rgba(255,255,255,0.4);
          border-radius: var(--radius-lg);
          position: relative;
        }
        .scan-frame::before, .scan-frame::after {
          content: '';
          position: absolute;
          width: 24px; height: 24px;
          border-color: #C9A84C;
          border-style: solid;
          border-radius: 2px;
        }
        .scan-frame::before { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
        .scan-frame::after { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }
        .cam-controls {
          position: absolute;
          bottom: var(--space-4);
          left: 0; right: 0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 var(--space-6);
          z-index: 30;
        }
        .cam-btn-cancel {
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          padding: 10px 18px;
          border-radius: var(--radius-full);
          font-family: var(--font-primary);
          font-size: 14px;
          cursor: pointer;
        }
        .cam-btn-capture {
          width: 64px; height: 64px;
          border: 4px solid white;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .capture-btn-inner {
          width: 50px; height: 50px;
          background: white;
          border-radius: 50%;
        }
        .preview-view { position: relative; width: 100%; height: 100%; }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }
        .scan-loading {
          position: absolute;
          inset: 0;
          background: rgba(13,13,26,0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .scan-pulse {
          width: 80px; height: 80px;
          border: 3px solid var(--primary);
          border-radius: 50%;
          animation: scanPulse 1.5s ease-in-out infinite;
        }
        @keyframes scanPulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .scan-line {
          width: 200px; height: 3px;
          background: var(--gradient-accent);
          border-radius: 2px;
          margin-top: 12px;
          animation: scanLine 2s ease-in-out infinite;
        }
        @keyframes scanLine {
          0%, 100% { transform: scaleX(0.3); opacity: 0.5; }
          50% { transform: scaleX(1); opacity: 1; }
        }
        .scan-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: var(--space-4);
        }
        .scan-icon-wrap {
          width: 100px; height: 100px;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed rgba(255,255,255,0.2);
        }
        .scan-actions {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-4);
        }
        .scan-btn-primary {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          background: var(--gradient-primary);
          border: none;
          border-radius: var(--radius-lg);
          color: white;
          font-family: var(--font-primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: var(--shadow-colored);
        }
        .scan-btn-secondary {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: var(--radius-lg);
          color: rgba(255,255,255,0.85);
          font-family: var(--font-primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .scan-error {
          margin: 0 var(--space-4);
          padding: 12px var(--space-4);
          background: var(--error-50);
          color: var(--error);
          border-radius: var(--radius-md);
          font-size: 13px;
        }
        .scan-result {
          background: white;
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          overflow: hidden;
          margin-top: auto;
        }
        .result-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
        }
        .result-icon {
          width: 56px; height: 56px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .result-title-wrap { flex: 1; }
        .result-name-th { font-size: 18px; font-weight: 700; color: var(--text-primary); }
        .result-name-en { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
        .result-confidence { text-align: center; flex-shrink: 0; }
        .result-body { padding: var(--space-4) var(--space-5) var(--space-6); }
        .result-section { margin-bottom: var(--space-4); }
        .result-section-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: var(--space-2);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .result-text { font-size: 14px; color: var(--text-primary); line-height: 1.6; }
        .english-phrase {
          font-size: 14px;
          color: var(--text-primary);
          padding: 6px 12px;
          background: var(--gray-50);
          border-radius: var(--radius-sm);
          margin-bottom: 4px;
          font-style: italic;
          display: flex;
          gap: 8px;
        }
        .scan-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-4);
          color: rgba(255,255,255,0.7);
          font-size: 13px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
