'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'model'
  text: string
  timestamp: Date
}

const suggestPrompts = [
  'วิธีทักทายลูกค้าภาษาอังกฤษ?',
  'อธิบาย Table Setting มาตรฐาน',
  'ฝึกรับออร์เดอร์ภาษาอังกฤษ',
  'วิธีแนะนำเมนูอาหาร',
  'การจัดการข้อร้องเรียนลูกค้า',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'สวัสดีครับ! ผมคือ AI ผู้ช่วยของ FINE MODEL 🎓\n\nผมพร้อมช่วยคุณเรียนรู้การบริการอาหารและเครื่องดื่ม ถามผมได้เลยครับ!\n\n💡 ลองถามเกี่ยวกับ:\n• การทักทายลูกค้าภาษาอังกฤษ\n• มาตรฐาน Table Setting\n• การรับออร์เดอร์อาหาร',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingMsg, setSpeakingMsg] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<any>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Setup Web Speech APIs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.lang = 'th-TH' // ตั้งเป็นภาษาไทยเป็นหลัก สามารถฟังอังกฤษได้เช่นกัน
        rec.interimResults = false
        
        rec.onstart = () => {
          setIsListening(true)
        }

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript || ''
          setInput(prev => (prev + ' ' + resultText).trim())
        }

        rec.onerror = (e: any) => {
          console.error('Speech recognition error in Chat:', e.error)
          setIsListening(false)
        }

        rec.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = rec
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
      if (synthesisRef.current) synthesisRef.current.cancel()
    }
  }, [])

  // ฟังก์ชันสลับเปิดปิดไมค์บันทึกเสียง
  function handleToggleMic() {
    if (!recognitionRef.current) {
      alert('บราวเซอร์นี้ไม่สนับสนุนการวิเคราะห์เสียงพูด! กรุณาใช้ Google Chrome')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      // ก่อนบันทึกเสียงให้ตรวจสอบและหยุดเสียงสังเคราะห์ที่กำลังเล่นอยู่
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
        setSpeakingMsg(null)
      }
      try {
        recognitionRef.current.start()
      } catch (e) {
        recognitionRef.current.abort()
        setTimeout(() => recognitionRef.current.start(), 300)
      }
    }
  }

  // ฟังก์ชันให้สังเคราะห์เสียงพูดข้อความของ AI (Text-to-Speech)
  function handleSpeakMsg(text: string, msgIdx: number) {
    if (!synthesisRef.current) return

    if (speakingMsg === msgIdx) {
      synthesisRef.current.cancel()
      setSpeakingMsg(null)
      return
    }

    synthesisRef.current.cancel()
    // ล้างอักขระพิเศษหรืออิโมจิก่อนให้ออกเสียง
    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    // ตรวจสอบภาษาเพื่อเลือกเสียงอ่านที่ตรง (ไทย หรือ อังกฤษ)
    const hasEnglish = /[a-zA-Z]/.test(cleanText)
    utterance.lang = hasEnglish ? 'en-US' : 'th-TH'
    utterance.rate = hasEnglish ? 0.9 : 1.0

    utterance.onend = () => setSpeakingMsg(null)
    utterance.onerror = () => setSpeakingMsg(null)

    setSpeakingMsg(msgIdx)
    synthesisRef.current.speak(utterance)
  }

  async function sendMessage(text?: string) {
    const msg = text || input.trim()
    if (!msg || loading) return

    setInput('')
    const userMsg: Message = { role: 'user', text: msg, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // สั่งหยุดเสียง AI พูดทันทีเมื่อมีการส่งแชทใหม่
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setSpeakingMsg(null)
    }

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
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-ai-provider': activeProvider,
          'x-gemini-key': geminiKey,
          'x-openai-key': openaiKey,
          'x-claude-key': claudeKey
        },
        body: JSON.stringify({
          message: msg,
          history: messages.map(m => ({ role: m.role, text: m.text })),
          student_id: studentId,
          session_type: 'gemini_chat',
          topic: 'Learning Conversation',
          session_id: sessionId
        })
      })
      const data = await response.json()
      if (data.session_id) {
        setSessionId(data.session_id)
      }
      const aiMsg: Message = { role: 'model', text: data.response, timestamp: new Date() }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      const errMsg: Message = {
        role: 'model',
        text: '⚠️ ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <Link href="/student/dashboard" className="premium-back-btn">‹</Link>
        <div className="chat-header-info">
          <div className="chat-gemini-icon">✨</div>
          <div>
            <div className="chat-title">Gemini AI</div>
            <div className="chat-status">
              <span className="status-dot" />
              ผู้ช่วยการเรียนรู้
            </div>
          </div>
        </div>
        <button className="btn-icon btn-ghost" style={{fontSize:18}}>⋮</button>
      </div>

      {/* Messages */}
      <div className="chat-messages chat-scroll">
        {messages.map((msg, i) => (
          <div key={i} className={`msg-row ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
            {msg.role === 'model' && (
              <div className="msg-avatar">✨</div>
            )}
            <div className="msg-content">
              <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                {(msg.text || '').split('\n').map((line, j) => (
                  <span key={j}>{line}{j < (msg.text || '').split('\n').length - 1 && <br />}</span>
                ))}
              </div>
              <div className="msg-time" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginTop: 4 }}>
                {formatTime(msg.timestamp)}
                {msg.role === 'model' && (
                  <button 
                    onClick={() => handleSpeakMsg(msg.text, i)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontSize: 12, padding: '2px', color: speakingMsg === i ? '#A6882A' : '#8C8272',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="ออกเสียงข้อความนี้"
                  >
                    {speakingMsg === i ? '⏹️ หยุด' : '🔊 ฟังเสียง'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg-row msg-ai">
            <div className="msg-avatar">✨</div>
            <div className="typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length < 3 && (
        <div className="suggest-wrap">
          <div className="scroll-x">
            <div className="suggest-row">
              {suggestPrompts.map((p, i) => (
                <button key={i} className="suggest-chip" onClick={() => sendMessage(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input controls with Speech integration */}
      <div className="chat-input-wrap">
        <div className="chat-input-inner" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          
          {/* Microphone recording button */}
          <button
            onClick={handleToggleMic}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none',
              background: isListening ? '#dc3545' : '#EAF3EE',
              color: isListening ? 'white' : '#1E4D3A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16, transition: 'all 0.2s',
              boxShadow: isListening ? '0 0 12px rgba(220, 53, 69, 0.4)' : 'none',
              animation: isListening ? 'pulseMic 1.2s infinite' : 'none'
            }}
            title={isListening ? 'หยุดรับเสียง' : 'พูดใส่ไมโครโฟน'}
          >
            {isListening ? '🔴' : '🎤'}
          </button>

          <input
            ref={inputRef}
            className="chat-input"
            style={{ flex: 1 }}
            placeholder={isListening ? 'กำลังรับเสียงพูดของคุณ...' : 'พิมพ์ข้อความ...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? <span className="spinner" style={{width:18,height:18,borderWidth:2}} /> : '➤'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg-primary);
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 48px var(--space-4) var(--space-3);
          background: white;
          border-bottom: 1px solid var(--gray-200);
          box-shadow: var(--shadow-sm);
        }
        .chat-header-info {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .chat-gemini-icon {
          width: 40px; height: 40px;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: white;
          font-size: 20px;
          box-shadow: var(--shadow-md);
        }
        .chat-title {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 15px;
        }
        .chat-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .status-dot {
          width: 6px; height: 6px;
          background: var(--success);
          border-radius: 50%;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          background: #F3EFE6;
        }
        .msg-row {
          display: flex;
          gap: var(--space-2);
          max-width: 85%;
        }
        .msg-user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .msg-ai {
          align-self: flex-start;
        }
        .msg-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex; align-items: center; justify-content: center;
          color: white;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
        }
        .msg-content {
          display: flex;
          flex-direction: column;
        }
        .chat-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          box-shadow: var(--shadow-sm);
          text-align: left;
        }
        .chat-bubble-user {
          background: linear-gradient(135deg, #1E4D3A, #102B1F);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble-ai {
          background: white;
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
          border: 1px solid #EDE9E1;
        }
        .msg-time {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .typing-indicator {
          background: white;
          padding: 12px 18px;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          border: 1px solid #EDE9E1;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .typing-indicator span {
          width: 6px; height: 6px;
          background: var(--text-muted);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        
        .suggest-wrap {
          padding: var(--space-2) var(--space-4);
          background: #F3EFE6;
        }
        .scroll-x {
          overflow-x: auto;
          white-space: nowrap;
          padding-bottom: 4px;
        }
        .suggest-row {
          display: inline-flex;
          gap: var(--space-2);
        }
        .suggest-chip {
          padding: 8px 16px;
          background: white;
          border: 1px solid #EDE9E1;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          color: #1E4D3A;
          cursor: pointer;
          font-family: var(--font-primary);
          transition: all 0.2s;
        }
        .suggest-chip:hover {
          background: #EAF3EE;
          border-color: #1E4D3A;
        }
        .chat-input-wrap {
          padding: var(--space-3) var(--space-4) calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
          background: white;
          border-top: 1px solid var(--gray-200);
        }
        .chat-input-inner {
          background: var(--gray-100);
          border-radius: 100px;
          padding: 4px 6px 4px 12px;
        }
        .chat-input {
          border: none;
          background: transparent;
          padding: 8px 0;
          font-size: 14px;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-primary);
        }
        .chat-send {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #102B1F, #1E4D3A);
          color: white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .chat-send:disabled {
          background: var(--gray-300);
          cursor: not-allowed;
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        @keyframes pulseMic {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(220, 53, 69, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
      `}</style>
    </div>
  )
}
