'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function LivePage() {
  const [status, setStatus] = useState<'idle' | 'listening' | 'responding' | 'ended'>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.lang = 'en-US'
        rec.interimResults = false
        rec.maxAlternatives = 1
        
        rec.onstart = () => {
          setStatus('listening')
          setErrorMessage('')
        }

        rec.onresult = async (event: any) => {
          const spokenText = event.results[0][0].transcript || ''
          setTranscript(spokenText)
          setStatus('responding')
          
          // ส่งข้อความประมวลผลผ่านหลังบ้านไปยัง Gemini
          await sendToGemini(spokenText)
        }

        rec.onerror = (e: any) => {
          console.error('Speech recognition error:', e.error)
          if (e.error === 'no-speech') {
            setErrorMessage('ไม่ได้ยินเสียงพูด! กรุณาลองแตะไมค์อีกครั้งและพูดประโยคภาษาอังกฤษ')
          } else {
            setErrorMessage(`เกิดข้อผิดพลาดของไมค์: ${e.error}`)
          }
          setStatus('idle')
        }

        rec.onend = () => {
          // หากผลลัพธ์ได้รับการส่งต่อไปตอบแล้ว จะควบคุม State ด้วย response
        }

        recognitionRef.current = rec
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
      if (synthesisRef.current) synthesisRef.current.cancel()
    }
  }, [])

  // ฟังก์ชันยิงข้อความไปยัง Gemini API จริงผ่าน Backend
  async function sendToGemini(text: string) {
    try {
      const activeProvider = typeof window !== 'undefined' ? localStorage.getItem('activeAiProvider') || 'gemini' : 'gemini'
      const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : ''
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('openaiApiKey') || '' : ''
      const claudeKey = typeof window !== 'undefined' ? localStorage.getItem('claudeApiKey') || '' : ''
      const savedUserInfo = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null
      let parsedUser: any = null
      try { parsedUser = savedUserInfo ? JSON.parse(savedUserInfo) : null } catch {}
      const studentId = parsedUser?.id || 'student-001'
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const resp = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-ai-provider': activeProvider,
          'x-gemini-key': geminiKey,
          'x-openai-key': openaiKey,
          'x-claude-key': claudeKey
        },
        body: JSON.stringify({
          message: `ในฐานะลูกค้าในสถานการณ์จำลองโรงแรม 5 ดาว โต้ตอบกับเด็กเสิร์ฟสั้นๆ 1-2 ประโยค (ตอบเป็นภาษาอังกฤษอย่างเดียวเท่านั้นและห้ามพิมพ์ข้อความกำกับอื่นๆ) เมื่อเขาพูดประโยคนี้: "${text}"`,
          history: [],
          student_id: studentId,
          session_type: 'gemini_live',
          topic: 'Live Interactive Roleplay',
          session_id: sessionId
        })
      })

      if (!resp.ok) {
        throw new Error('API Request failed')
      }

      const data = await resp.json()
      if (data.session_id) {
        setSessionId(data.session_id)
      }
      const aiReply = data.response || 'Excuse me, could you repeat that please?'
      
      setResponse(aiReply)
      setStatus('idle')

      // สังเคราะห์เสียงพูดตอบกลับภาษาอังกฤษทันทีที่ได้คำตอบ
      speakBack(aiReply)
    } catch (err: any) {
      console.error('Error connecting to Gemini API:', err)
      const fallbackReply = 'Welcome to our restaurant. May I have your name and reservation details please?'
      setResponse(fallbackReply)
      setStatus('idle')
      speakBack(fallbackReply)
    }
  }

  // ฟังก์ชันให้เบราว์เซอร์อ่านเสียง AI ตอบกลับภาษาอังกฤษ (Text-to-Speech)
  function speakBack(text: string) {
    if (synthesisRef.current) {
      synthesisRef.current.cancel() // ล้างคิวเสียงเก่า
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.88 // ช้าลงเล็กน้อยเพื่อให้เด็กฟังทันชัดเจน
      synthesisRef.current.speak(utterance)
    }
  }

  // เริ่มต้นเปิดไมค์ดักฟังเสียงนักเรียน
  function handleStartMic() {
    if (synthesisRef.current) {
      synthesisRef.current.cancel() // สั่งให้หยุดเสียงพูด AI ทันทีเมื่อจะคุย
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        recognitionRef.current.abort()
        setTimeout(() => recognitionRef.current.start(), 300)
      }
    } else {
      alert('เบราว์เซอร์นี้ไม่รองรับการดักจับเสียงพูดของแอป! โปรดใช้ Google Chrome หรือ Safari เวอร์ชันใหม่')
    }
  }

  return (
    <div className="live-page" style={{ background: '#090E16', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div className="live-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '48px 16px 16px', background: 'rgba(0,0,0,0.2)' }}>
        <Link href="/dashboard" style={{ color: '#C9A84C', fontSize: 22, textDecoration: 'none', fontWeight: 900 }}>‹</Link>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>Gemini Live Coach</div>
          <div style={{ color: '#C9A84C', fontSize: 10.5, fontWeight: 700, marginTop: 2, letterSpacing: '0.8px' }}>🎙️ REAL-TIME VOICE TRAINING</div>
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* Visual Pulsing Voice Area */}
      <div className="live-viz" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 280 }}>
        
        {/* Pulsing visual circles */}
        <div className="live-bg-circles" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="live-circle live-c1" style={{ animation: status === 'listening' ? 'livePulse 1s infinite' : status === 'responding' ? 'livePulseBlue 1.2s infinite' : 'none' }} />
          <div className="live-circle live-c2" style={{ animation: status === 'listening' ? 'livePulse 1.3s infinite 0.3s' : status === 'responding' ? 'livePulseBlue 1.5s infinite 0.3s' : 'none' }} />
          <div className="live-circle live-c3" style={{ animation: status === 'listening' ? 'livePulse 1.6s infinite 0.6s' : status === 'responding' ? 'livePulseBlue 1.8s infinite 0.6s' : 'none' }} />
        </div>

        {/* Microphone main interactive button */}
        <div 
          onClick={status === 'idle' ? handleStartMic : undefined}
          style={{
            width: 100, height: 100, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: status === 'listening' ? '0 0 50px rgba(220,53,69,0.5)' : status === 'responding' ? '0 0 50px rgba(0,188,212,0.5)' : '0 0 40px rgba(201,168,76,0.3)',
            position: 'relative', zIndex: 10, transition: 'all 0.3s',
            background: status === 'listening' ? 'radial-gradient(circle, #dc3545, #bd2130)' : status === 'responding' ? 'radial-gradient(circle, #00BCD4, #0097A7)' : 'linear-gradient(135deg, #102B1F, #1E4D3A)',
            border: '2px solid #C9A84C', cursor: status === 'idle' ? 'pointer' : 'default'
          }}
        >
          <span style={{ fontSize: 34, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
            {status === 'idle' ? '🎙️' : status === 'listening' ? '🔴' : status === 'responding' ? '🤖' : '✅'}
          </span>
        </div>

        <div className="live-status-text" style={{ marginTop: 24, color: status === 'listening' ? '#F44336' : status === 'responding' ? '#00BCD4' : '#C9A84C', fontSize: 13, fontWeight: 800 }}>
          {status === 'idle' && 'แตะที่ไมโครโฟนเพื่อพูดภาษาอังกฤษ'}
          {status === 'listening' && 'กำลังบันทึกเสียงพูดของคุณ...'}
          {status === 'responding' && 'Gemini AI กำลังประมวลผลคำตอบ...'}
        </div>

        {errorMessage && (
          <div style={{ background: 'rgba(220,53,69,0.15)', border: '1px solid #dc3545', color: '#ff8a93', fontSize: 11, padding: '8px 16px', borderRadius: 8, marginTop: 12, maxWidth: '280px', zIndex: 10 }}>
            ⚠️ {errorMessage}
          </div>
        )}
      </div>

      {/* Transcript, Output & Help Suggestions */}
      <div className="live-content" style={{ background: '#FDFAF4', borderRadius: '24px 24px 0 0', padding: 24, color: '#1A1410', flexShrink: 0 }}>
        
        {transcript && (
          <div className="live-transcript" style={{ background: 'white', borderRadius: 16, padding: '14px 16px', marginBottom: 14, border: '1px solid #EDE9E1', textAlign: 'left' }}>
            <div className="live-transcript-label" style={{ fontSize: 11, color: '#8C8272', fontWeight: 800, marginBottom: 4 }}>🗣️ คุณพูด:</div>
            <div className="live-transcript-text" style={{ fontSize: 14.5, color: '#102B1F', fontWeight: 700, fontStyle: 'italic' }}>"{transcript}"</div>
          </div>
        )}

        {response && (
          <div className="live-response" style={{ background: 'white', borderRadius: 16, padding: '16px', border: '1.5px solid #C9A84C', textAlign: 'left', boxShadow: '0 4px 12px rgba(16,43,31,0.03)' }}>
            <div className="live-response-header" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <span style={{ fontWeight: 900, fontSize: 13.5, color: '#1E4D3A' }}>Gemini ตอบกลับ:</span>
            </div>
            <div className="live-response-text" style={{ fontSize: 14, color: '#4A4138', lineHeight: 1.6, marginBottom: 12 }}>{response}</div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => speakBack(response)}
                style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1.5px solid #1E4D3A', background: 'transparent', color: '#1E4D3A', fontSize: 11.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}
              >
                🔊 ฟังซ้ำ
              </button>
              <button 
                onClick={handleStartMic}
                style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #102B1F, #1E4D3A)', color: 'white', fontSize: 11.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}
              >
                🎙️ ตอบกลับ AI
              </button>
            </div>
          </div>
        )}

        {status === 'idle' && !transcript && (
          <div className="live-tips" style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1E4D3A', marginBottom: 12, margin: 0 }}>💡 ลองเริ่มพูดทักทายหรือตอบรับบริการ:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Good evening, sir. Welcome to FINE restaurant.',
                'Do you have a reservation for tonight?',
                'Certainly, follow me to your table please.',
                'Would you like red wine or white wine with your fish?'
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: '#A6882A', fontWeight: 800, fontSize: 12 }}>{i+1}.</span>
                  <span style={{ fontStyle: 'italic', color: '#554D41', fontSize: 12.5, fontWeight: 650 }}>"{t}"</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .live-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .live-c1 { width: 160px; height: 160px; }
        .live-c2 { width: 220px; height: 220px; }
        .live-c3 { width: 280px; height: 280px; }
        
        @keyframes livePulse {
          0% { transform: scale(0.95); opacity: 0.9; border-color: rgba(220,53,69,0.3); }
          50% { transform: scale(1.06); opacity: 0.4; border-color: rgba(220,53,69,0.7); }
          100% { transform: scale(0.95); opacity: 0.9; border-color: rgba(220,53,69,0.3); }
        }
        
        @keyframes livePulseBlue {
          0% { transform: scale(0.95); opacity: 0.9; border-color: rgba(0,188,212,0.3); }
          50% { transform: scale(1.06); opacity: 0.4; border-color: rgba(0,188,212,0.7); }
          100% { transform: scale(0.95); opacity: 0.9; border-color: rgba(0,188,212,0.3); }
        }
      `}</style>
    </div>
  )
}
