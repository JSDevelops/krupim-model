'use client'
import { useState, useRef, useCallback } from 'react'
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
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function analyzeImage(base64: string, mimeType: string) {
    setScanning(true)
    setError('')
    setResult(null)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const resp = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType })
      })
      if (!resp.ok) throw new Error('Scan failed')
      const data = await resp.json()
      setResult(data)
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
    const stream = videoRef.current.srcObject as MediaStream
    stream?.getTracks().forEach(t => t.stop())
    setCamMode(false)
    
    await analyzeImage(base64, 'image/jpeg')
  }

  function reset() {
    setResult(null)
    setPreview(null)
    setError('')
    setCamMode(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const cat = result ? (categoryColors[result.category] || categoryColors.food) : null

  return (
    <div className="page-content no-nav" style={{background: '#0D0D1A', minHeight: '100vh'}}>
      <div className="scan-header">
        <Link href="/student/dashboard" className="premium-back-btn">‹</Link>
        <div>
          <div style={{color:'white', fontWeight:700, fontSize:16}}>AI Scan</div>
          <div style={{color:'rgba(255,255,255,0.6)', fontSize:11}}>วิเคราะห์ด้วย Gemini Vision</div>
        </div>
        <div style={{width:44}} />
      </div>

      {/* Camera / Preview Area */}
      <div className="scan-viewfinder">
        {camMode ? (
          <div className="cam-view">
            <video ref={videoRef} autoPlay playsInline muted className="cam-video" />
            <canvas ref={canvasRef} style={{display:'none'}} />
            <div className="cam-overlay">
              <div className="scan-frame" />
              <p style={{color:'rgba(255,255,255,0.8)', fontSize:13, marginTop:16}}>จัดวางสิ่งของให้อยู่ในกรอบ</p>
            </div>
            <div className="cam-controls">
              <button onClick={reset} className="cam-btn-cancel">ยกเลิก</button>
              <button onClick={capturePhoto} className="cam-btn-capture">
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
            <div className="scan-icon-wrap">
              <span style={{fontSize:60}}>🤖</span>
            </div>
            <p style={{color:'rgba(255,255,255,0.7)', fontSize:14, textAlign:'center', lineHeight:1.6}}>
              ถ่ายภาพหรืออัพโหลดรูปอาหาร<br/>เครื่องดื่ม หรืออุปกรณ์<br/>เพื่อวิเคราะห์ด้วย AI
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!camMode && !scanning && !result && (
        <div className="scan-actions">
          <button className="scan-btn-primary" onClick={startCamera}>
            <span style={{fontSize:22}}>📷</span>
            ถ่ายภาพ
          </button>
          <button className="scan-btn-secondary" onClick={() => fileRef.current?.click()}>
            <span style={{fontSize:22}}>🖼️</span>
            เลือกจากคลัง
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFileSelect} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="scan-error">⚠️ {error}</div>
      )}

      {/* Result */}
      {result && cat && (
        <div className="scan-result animate-slide-up">
          <div className="result-header" style={{background: cat.bg}}>
            <div className="result-icon" style={{background: cat.color}}>
              <span style={{fontSize:28}}>{cat.emoji}</span>
            </div>
            <div className="result-title-wrap">
              <div className="result-name-th">{result.name_th}</div>
              <div className="result-name-en">{result.name_en}</div>
              <div className="badge" style={{background: cat.color, color:'white', marginTop:4}}>
                {result.subcategory || result.category}
              </div>
            </div>
            <div className="result-confidence">
              <div style={{fontSize:20, fontWeight:700, color: cat.color}}>{result.confidence}%</div>
              <div style={{fontSize:10, color:'var(--text-muted)'}}>ความมั่นใจ</div>
            </div>
          </div>

          <div className="result-body">
            <div className="result-section">
              <div className="result-section-title">📝 คำอธิบาย</div>
              <p className="result-text">{result.description}</p>
            </div>

            <div className="result-section">
              <div className="result-section-title">💡 เคล็ดลับการบริการ</div>
              <p className="result-text">{result.service_tips}</p>
            </div>

            {result.english_phrases && result.english_phrases.length > 0 && (
              <div className="result-section">
                <div className="result-section-title">🇬🇧 ประโยคภาษาอังกฤษ</div>
                {result.english_phrases.map((p, i) => (
                  <div key={i} className="english-phrase">
                    <span style={{color: cat.color, fontWeight:600}}>→</span> {p}
                  </div>
                ))}
              </div>
            )}

            <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
              <button onClick={reset} className="btn btn-outline" style={{flex:1}}>
                🔄 สแกนใหม่
              </button>
              <Link href="/chat" className="btn btn-primary" style={{flex:1, textDecoration:'none'}}>
                💬 ถาม AI
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Scanning state bottom */}
      {scanning && (
        <div className="scan-status">
          <span className="animate-pulse" style={{fontSize:18}}>🤖</span>
          Gemini กำลังวิเคราะห์ภาพ...
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
        }
        .scan-frame {
          width: 200px; height: 200px;
          border: 2px solid rgba(255,255,255,0.8);
          border-radius: var(--radius-lg);
          position: relative;
        }
        .scan-frame::before, .scan-frame::after {
          content: '';
          position: absolute;
          width: 24px; height: 24px;
          border-color: var(--accent);
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
      `}</style>
    </div>
  )
}
