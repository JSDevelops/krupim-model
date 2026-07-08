'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
  
  // Real-time Scanning & Interactive States
  const [autoScan, setAutoScan] = useState(false)
  const [matchedModelId, setMatchedModelId] = useState<string | null>(null)
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [fineTab, setFineTab] = useState<'F' | 'I' | 'N' | 'E'>('F')

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

  const autoScanTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRequestPendingRef = useRef(false)

  // จัดการควบคุมสถานะเปิด-ปิดกล้องวิดีโอเมื่อสลับแท็บ
  useEffect(() => {
    if (activeTab === 'ai') {
      startVRCamera()
    } else {
      stopVRCamera()
      setAutoScan(false)
    }

    return () => {
      stopVRCamera()
    }
  }, [activeTab])

  // Load real equipment items from Supabase
  useEffect(() => {
    async function loadEquipment() {
      const supabaseUrl = typeof window !== 'undefined' ? localStorage.getItem('supabaseUrl') : null
      const supabaseAnonKey = typeof window !== 'undefined' ? localStorage.getItem('supabaseAnonKey') : null
      if (supabaseUrl && supabaseAnonKey) {
        try {
          const { createClient } = await import('@supabase/supabase-js')
          const client = createClient(supabaseUrl, supabaseAnonKey)
          const { data, error } = await client
            .from('ai_scan_items')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (data && data.length > 0) {
            const mapped = data.map((x: any) => ({
              name: x.name_th,
              nameEn: x.name_en,
              emoji: x.image_url || (x.name_en.toLowerCase().includes('glass') || x.name_en.toLowerCase().includes('wine') ? '🍷' :
                     x.name_en.toLowerCase().includes('teapot') || x.name_en.toLowerCase().includes('tea') ? '🫖' :
                     x.name_en.toLowerCase().includes('spoon') || x.name_en.toLowerCase().includes('soup') ? '🥄' : '📦'),
              use: x.description || 'ไม่มีรายละเอียดวิธีใช้งานสำหรับอุปกรณ์ชิ้นนี้',
              sentence: x.service_tips || 'Please handle this item with care.'
            }))
            // Merge defaults and filter out duplicates
            setEquipment(() => {
              const existingNames = new Set(mapped.map(x => x.nameEn.toLowerCase()))
              const filteredDefaults = defaultEquipment.filter(x => !existingNames.has(x.nameEn.toLowerCase()))
              return [...mapped, ...filteredDefaults]
            })
          }
        } catch (err) {
          console.error('Failed to load dynamic equipment from Supabase:', err)
        }
      }
    }
    loadEquipment()
  }, [])

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
    setMatchedModelId(null)
    setQuizSelectedOption(null)
    setQuizAnswered(false)
    setFineTab('F')
    try {
      const activeProvider = typeof window !== 'undefined' ? localStorage.getItem('activeAiProvider') || 'gemini' : 'gemini'
      const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : ''
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('openaiApiKey') || '' : ''
      const claudeKey = typeof window !== 'undefined' ? localStorage.getItem('claudeApiKey') || '' : ''
      
      let data = null
      let usedDirectGemini = false

      // If a custom Gemini Key is saved in localStorage, call Gemini API directly from the browser!
      // This bypasses any backend server issues (such as Railway suspensions).
      if (geminiKey && geminiKey.trim().startsWith('AIzaSy')) {
        try {
          console.log('Using direct client-side Gemini API call...');
          const systemPrompt = `คุณเป็น AI ผู้เชี่ยวชาญการวิเคราะห์และระบุวัตถุจากภาพถ่ายตามความเป็นจริง (Object Identification AI)
วิเคราะห์ภาพวัตถุที่เห็นในภาพนี้ตามจริงที่ปรากฏ 100% (ตัวอย่างเช่น หากเห็นเป็นขวดน้ำพลาสติก ขวดกาแฟ แก้วพลาสติก ของเล่น โทรศัพท์มือถือ หรือสิ่งของทั่วไป ให้ระบุชื่อที่เป็นสิ่งนั้นจริงๆ โดยตรงตามความจริงที่กล้องจับภาพได้ ไม่ต้องพยายามเปรียบเทียบหรือบิดเบือนให้กลายเป็นชิ้นส่วนจัดโต๊ะอาหารระดับห้าดาวของโรงแรมหรูหากไม่ใช่สิ่งนั้นจริงๆ)
และส่งค่ากลับมาเป็นรูปแบบ JSON เท่านั้น (ห้ามเขียนข้อความเกริ่นนำหรือปิดท้ายใดๆ นอกเหนือจาก JSON):
{
  "name_th": "ชื่อวัตถุภาษาไทยตามความจริง เช่น ขวดกาแฟพลาสติก, ส้อมอาหาร, ขวดน้ำดื่ม",
  "name_en": "ชื่อวัตถุภาษาอังกฤษตามความจริง เช่น Plastic Coffee Bottle, Dinner Fork, Plastic Water Bottle",
  "category": "food หรือ beverage หรือ equipment หรือ tableware หรือ general (สำหรับของใช้ทั่วไป)",
  "subcategory": "หมวดย่อยเชิงลึก เช่น Plastic Container, Stemware, Flatware, Dinnerware, Electronics",
  "description": "คำอธิบายลักษณะ หน้าที่ และประโยชน์การใช้งานตามจริงของวัตถุชิ้นนั้นๆ",
  "location": "ตำแหน่งหรือจุดที่เรามักจะพบเจอวัตถุชนิดนี้ในชีวิตจริง",
  "service_tips": "เคล็ดลับการจัดเตรียม สุขอนามัย หรือทักษะการหยิบจับดูแลรักษาของสิ่งนั้นๆ 1-2 ข้อ",
  "english_phrases": ["ประโยคภาษาอังกฤษที่เกี่ยวข้องกับการแนะนำ การหยิบใช้ หรือการบริการสิ่งนี้กับลูกค้า/คู่สนทนา 1", "ประโยคแนะนำ/สื่อสารที่ 2"],
  "pronounce": "คำอ่านสัทอักษร (Phonetic Transcription) ภาษาอังกฤษ เช่น /'plæs.tɪk 'kɒf.i 'bɒt.əl/",
  "confidence": 95,
  "fine_analysis": {
    "familiarize": {
      "desc": "คำอธิบายรูปร่างลักษณะ หน้าที่และประโยชน์ใช้สอยโดยละเอียดตามจริง",
      "location": "ตำแหน่งหรือการวางจัดเตรียมเป็นปกติ"
    },
    "interact": {
      "pronunciation": "คำอ่านออกเสียงภาษาอังกฤษเลียนแบบสัทอักษรหรือคำอ่านไทยเชิงอังกฤษ",
      "english_phrases": ["ประโยคแนะนำ/สื่อสารในงานบริการ 1", "ประโยคแนะนำ/สื่อสารในงานบริการ 2"],
      "roleplay_prompt": "โจทย์สั้นๆ สำหรับฝึกพูดบทบาทสมมติเกี่ยวกับการแนะนำหรือบริการสิ่งนี้"
    },
    "navigate": {
      "service_steps": [
        "ขั้นตอนการจัดเตรียมสุขอนามัย/ความสะอาดก่อนใช้งาน",
        "ขั้นตอนการเสิร์ฟ/การวางตำแหน่งใช้งานหลัก",
        "ขั้นตอนการเก็บถอน/การทิ้งหรือทำความสะอาดหลังเสร็จงาน"
      ],
      "safety_rules": "ข้อควรระวังสำคัญด้านสุขอนามัยหรือความปลอดภัยที่ต้องระวัง"
    },
    "exhibit": {
      "quiz_question": "คำถามปรนัยทบทวนความรู้เกี่ยวกับคุณสมบัติหรือการหยิบจับสิ่งนี้ 1 ข้อ",
      "quiz_options": ["ตัวเลือกผิด 1", "ตัวเลือกถูก", "ตัวเลือกผิด 2"],
      "correct_answer": "ตัวเลือกถูก (ต้องตรงกับตัวเลือกใน quiz_options ตัวใดตัวหนึ่งพอดี)"
    }
  }
}`

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: systemPrompt },
                      { inlineData: { mimeType: mimeType || 'image/jpeg', data: base64 } }
                    ]
                  }
                ],
                generationConfig: { responseMimeType: 'application/json' }
              })
            }
          )

          if (response.ok) {
            const resData = await response.json()
            const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || ''
            const jsonMatch = rawText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              data = JSON.parse(jsonMatch[0])
              usedDirectGemini = true
            }
          }
        } catch (directErr) {
          console.warn('Direct client-side Gemini call failed, falling back to backend:', directErr)
        }
      }

      if (!usedDirectGemini) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
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
          throw new Error('การสแกนล้มเหลว')
        }

        data = await resp.json()
      }

      if (!data) throw new Error('ไม่สามารถวิเคราะห์ข้อมูลได้')

      setAiItem(data)
      setAiScanned(true)
      stopVRCamera()
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
    } catch (e: any) {
      console.error('Scan Error in frontend:', e)
      
      let errMsg = 'ไม่สามารถวิเคราะห์ชิ้นอุปกรณ์นี้ได้ กรุณาลองใหม่อีกครั้ง'
      const errStr = String(e.message || e).toLowerCase()
      
      if (errStr.includes('failed to fetch') || errStr.includes('load failed') || errStr.includes('networkerror')) {
        errMsg = '⚠️ ไม่สามารถสแกนได้: ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์หลังบ้านได้ (เซิร์ฟเวอร์ออฟไลน์หรือปัญหาเครือข่าย)'
      } else if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('rate limit') || errStr.includes('too many requests')) {
        errMsg = '⚠️ ไม่สามารถสแกนได้: โควตาการใช้งานฟรีของ Gemini API เต็มแล้ว กรุณาใส่คีย์ส่วนตัวในหน้าตั้งค่าโปรไฟล์เพื่อใช้งานต่อ'
      } else if (errStr.includes('api key') || errStr.includes('unauthorized') || errStr.includes('403') || errStr.includes('not found')) {
        errMsg = '⚠️ ไม่สามารถสแกนได้: คีย์ API ไม่ถูกต้อง หมดอายุ หรือไม่มีสิทธิ์เข้าถึงโมเดลนี้'
      } else if (e.message) {
        errMsg = `⚠️ ไม่สามารถสแกนได้: ${e.message}`
      }
      
      setScanError(errMsg)
      setAiItem(null)
      setAiScanned(false)
    } finally {
      setScanAnim(false)
    }
  }

  // Auto-scan capturing frame for explorer
  async function captureAutoScanFrame() {
    if (!videoRef.current || !canvasRef.current || isRequestPendingRef.current || scanAnim || aiScanned || activeTab !== 'ai') return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (video.videoWidth === 0 || video.videoHeight === 0) return
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    const base64 = dataUrl.split(',')[1]
    
    isRequestPendingRef.current = true
    setScanAnim(true)
    setScanError('')
    
    try {
      const activeProvider = typeof window !== 'undefined' ? localStorage.getItem('activeAiProvider') || 'gemini' : 'gemini'
      const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') || '' : ''
      const openaiKey = typeof window !== 'undefined' ? localStorage.getItem('openaiApiKey') || '' : ''
      const claudeKey = typeof window !== 'undefined' ? localStorage.getItem('claudeApiKey') || '' : ''
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      
      const resp = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-ai-provider': activeProvider,
          'x-gemini-key': geminiKey,
          'x-openai-key': openaiKey,
          'x-claude-key': claudeKey
        },
        body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' })
      })
      if (!resp.ok) throw new Error('Scan failed')
      const data = await resp.json()
      
      if (data.confidence && data.confidence > 55) {
        setPreviewImage(dataUrl)
        setAiItem(data)
        setAiScanned(true)
        stopVRCamera()
        setAutoScan(false)
        setMatchedModelId(null)
        setQuizSelectedOption(null)
        setQuizAnswered(false)
        setFineTab('F')
        
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
          console.error(dbErr)
        }
      }
    } catch (e) {
      console.warn('Real-time frame scan error:', e)
    } finally {
      setScanAnim(false)
      isRequestPendingRef.current = false
    }
  }

  // Setup auto scan loop for explorer
  useEffect(() => {
    if (isCameraActive && autoScan && activeTab === 'ai' && !aiScanned) {
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
  }, [isCameraActive, autoScan, activeTab, aiScanned])

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
        setPreviewImage(dataUrl)
        const base64 = dataUrl.split(',')[1]
        setAutoScan(false)
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
            <div 
              onClick={() => window.location.href = '/student/scanner'}
              style={{
                cursor: 'pointer',
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

            {/* Equipment List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 13.5, fontWeight: 800, color: '#1E4D3A', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📖 เรียนรู้คำศัพท์
                </h2>
                <button
                  onClick={() => setShowVocabPopup(true)}
                  style={{ border: 'none', fontSize: 10.5, color: '#1E4D3A', background: '#EAF3EE', padding: '4px 12px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  ดูทั้งหมด ({equipment.length} คำ) ➔
                </button>
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
          <div className={`ai-scanner-layout ${aiScanned && aiItem ? 'has-results' : ''}`}>
            {/* Hidden Canvas for Live Video Capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Immersive VR Camera Simulator (Height-fitted container) */}
            <div className="camera-container" style={{
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
              {/* 1. Live Video background or Frozen Preview */}
              {aiScanned && previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Scanned Preview" 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 1
                  }}
                />
              ) : (
                <video 
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    zIndex: 1,
                    display: isCameraActive ? 'block' : 'none'
                  }}
                />
              )}
              {!isCameraActive && !aiScanned && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, background: '#090F0B' }}>
                  <span style={{ fontSize: 48, animation: 'spin 10s linear infinite' }}>📡</span>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5, fontWeight: 700, letterSpacing: '0.5px' }}>กำลังเชื่อมต่อกล้องระบบ VR Scan...</div>
                </div>
              )}

              {/* 2. Absolute Floating Header (Top bar) */}
              <div style={{
                position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10,
                display: 'flex', flexDirection: 'column', gap: 10
              }}>
                {/* Error Banner */}
                {scanError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.92)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: 12,
                    fontSize: 10.5,
                    fontWeight: 800,
                    textAlign: 'center',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                    fontFamily: 'var(--font-primary)'
                  }}>
                    ⚠️ {scanError}
                  </div>
                )}

                {/* Upper row: Navigation & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 6 }}>
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

                  {/* Live simulation tag */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(30, 77, 58, 0.5)',
                    border: '1.5px solid rgba(34, 197, 94, 0.3)',
                    padding: '7px 12px',
                    borderRadius: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    flexShrink: 0
                  }}>
                    <span style={{ width: 5.5, height: 5.5, borderRadius: '50%', background: '#22c55e', animation: 'pulseMic 1.2s infinite' }} />
                    <span style={{ color: '#22c55e', fontSize: 8.5, fontWeight: 955, letterSpacing: '0.5px' }}>LIVE AR SIMULATION</span>
                  </div>
                </div>

                {/* Lower row: Tab Switcher (Centered) - HIDE when scanned */}
                {!aiScanned && (
                  <div style={{
                    alignSelf: 'center',
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
                )}
              </div>

              {/* 3. Gold view brackets (Enclosing target in center) */}
              {!aiScanned && (
                <div style={{
                  position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)',
                  zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                  <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 8, pointerEvents: 'none' }}>
                    {/* Brackets */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, borderLeft: '3.5px solid #C9A84C', borderTop: '3.5px solid #C9A84C', borderRadius: '4px 0 0 0' }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 22, height: 22, borderRight: '3.5px solid #C9A84C', borderTop: '3.5px solid #C9A84C', borderRadius: '0 4px 0 0' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: 22, height: 22, borderLeft: '3.5px solid #C9A84C', borderBottom: '3.5px solid #C9A84C', borderRadius: '0 0 0 4px' }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRight: '3.5px solid #C9A84C', borderBottom: '3.5px solid #C9A84C', borderRadius: '0 0 4px 0' }} />
                    
                    {/* Pulsing ring inside */}
                    <div style={{
                      position: 'absolute', inset: 22,
                      border: '1.5px dashed rgba(201, 168, 76, 0.4)',
                      borderRadius: '50%',
                      animation: 'spin 16s linear infinite'
                    }} />
                  </div>

                  {/* Auto-Scan toggle button overlay inside camera view */}
                  <button 
                    onClick={() => setAutoScan(!autoScan)}
                    type="button"
                    style={{
                      background: autoScan ? 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)' : 'rgba(15, 28, 41, 0.85)',
                      color: autoScan ? '#C9A84C' : 'white',
                      border: '1.5px solid ' + (autoScan ? '#C9A84C' : 'rgba(255,255,255,0.25)'),
                      borderRadius: 100,
                      padding: '6px 14px',
                      fontSize: 10,
                      fontWeight: 900,
                      cursor: 'pointer',
                      zIndex: 20,
                      boxShadow: autoScan ? '0 0 10px rgba(201,168,76,0.3)' : 'none',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    {autoScan ? '🔵 Auto-Scanning: ON' : '📷 Auto-Scan: OFF'}
                  </button>

                  <div style={{
                    color: 'white', fontSize: 9, fontWeight: 900, marginTop: 8,
                    letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.85)',
                    textAlign: 'center', textTransform: 'uppercase', pointerEvents: 'none'
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
            </div>

            {/* 4. Translucent Floating AI Result Card (Moved outside camera-container as a sibling) */}
            {aiScanned && aiItem && (
              <div className="results-container">
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 10,
                  animation: 'fadeInUp 0.4s ease'
                }}>
                  {/* Holographic transparent card */}
                  <div style={{
                    background: 'rgba(15, 28, 41, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: 22,
                    color: 'white',
                    padding: '16px 18px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{
                        background: 'rgba(201, 168, 76, 0.15)', color: '#C9A84C',
                        border: '1px solid rgba(201, 168, 76, 0.35)',
                        fontSize: 9, fontWeight: 900, padding: '4px 10px', borderRadius: 100,
                        letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        ⚙️ FINE MODEL ANALYZED
                      </span>
                      
                      <button
                        onClick={() => speak(aiItem.name_en || aiItem.name, 'ai-name')}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)', border: 'none',
                          color: '#C9A84C', width: 30, height: 30, borderRadius: '50%',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, transition: 'background 0.2s'
                        }}
                      >
                        🔊
                      </button>
                    </div>

                    {/* Titles */}
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'white', margin: '0 0 2px' }}>{aiItem.name_en || aiItem.name}</h3>
                    <h4 style={{ fontSize: 13, color: '#C9A84C', fontWeight: 700, margin: '0 0 12px' }}>{aiItem.name_th || aiItem.nameTh}</h4>

                    {/* FINE Tab Navigation */}
                    <div style={{
                      display: 'flex',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 10,
                      padding: 3,
                      marginBottom: 12,
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      {(['F', 'I', 'N', 'E'] as const).map(tab => {
                        const isActive = fineTab === tab
                        const label = tab === 'F' ? 'Familiarize' : tab === 'I' ? 'Interact' : tab === 'N' ? 'Navigate' : 'Exhibit'
                        return (
                          <button
                            key={tab}
                            onClick={() => setFineTab(tab)}
                            type="button"
                            style={{
                              flex: 1,
                              padding: '6px 2px',
                              border: 'none',
                              background: isActive ? '#C9A84C' : 'transparent',
                              color: isActive ? '#0F1C29' : 'rgba(255,255,255,0.7)',
                              fontWeight: isActive ? 900 : 700,
                              fontSize: 9.5,
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontFamily: 'var(--font-primary)'
                            }}
                          >
                            {isActive ? label : tab}
                          </button>
                        )
                      })}
                    </div>

                    {/* TAB F: Familiarize */}
                    {fineTab === 'F' && (
                      <div style={{ animation: 'fadeInUp 0.3s ease', fontSize: 12 }}>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 9, color: '#C9A84C', fontWeight: 900, marginBottom: 3, letterSpacing: '0.5px' }}>ลักษณะและการใช้งาน (F-FAMILIARIZE):</div>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.45 }}>
                            {aiItem.fine_analysis?.familiarize?.desc || aiItem.use || aiItem.description}
                          </p>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: '#C9A84C', fontWeight: 900, marginBottom: 3, letterSpacing: '0.5px' }}>ตำแหน่งการจัดวางมาตรฐาน:</div>
                          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
                            {aiItem.fine_analysis?.familiarize?.location || aiItem.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* TAB I: Interact */}
                    {fineTab === 'I' && (
                      <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: 10, marginBottom: 10 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 'bold' }}>{aiItem.name_en || aiItem.name}</span>
                          {aiItem.fine_analysis?.interact?.pronunciation && (
                            <span style={{ fontSize: 11, color: '#C9A84C', fontStyle: 'italic' }}>({aiItem.fine_analysis.interact.pronunciation})</span>
                          )}
                          <button
                            onClick={() => speak(aiItem.name_en || aiItem.name, 'ai-name-i')}
                            type="button"
                            style={{ marginLeft: 'auto', border: 'none', background: 'rgba(255,255,255,0.1)', width: 26, height: 26, borderRadius: '50%', color: '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}
                          >
                            🔊
                          </button>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 9, color: '#C9A84C', fontWeight: 900, marginBottom: 4, letterSpacing: '0.5px' }}>ประโยคบริการลูกค้าภาษาอังกฤษ (I-INTERACT):</div>
                          {(aiItem.fine_analysis?.interact?.english_phrases || aiItem.english_phrases || []).map((phrase: string, idx: number) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: 8, marginBottom: 4, fontSize: 11 }}>
                              <span style={{ fontStyle: 'italic', flex: 1, color: 'rgba(255,255,255,0.85)' }}>"{phrase}"</span>
                              <button
                                onClick={() => speak(phrase, 'phrase-' + idx)}
                                type="button"
                                style={{ border: 'none', background: 'transparent', color: '#C9A84C', cursor: 'pointer', fontSize: 11 }}
                              >
                                🔊
                              </button>
                            </div>
                          ))}
                        </div>

                        {aiItem.fine_analysis?.interact?.roleplay_prompt && (
                          <div style={{ background: 'rgba(201, 168, 76, 0.1)', borderLeft: '3px solid #C9A84C', padding: 8, borderRadius: 8, marginBottom: 12, fontSize: 11 }}>
                            <div style={{ fontWeight: 'bold', color: '#C9A84C', fontSize: 9, marginBottom: 2 }}>โจทย์บทบาทสมมติ (Role-play Practice):</div>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>{aiItem.fine_analysis.interact.roleplay_prompt}</p>
                          </div>
                        )}

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                          <div style={{ fontSize: 9, color: '#eab308', fontWeight: 900, marginBottom: 4, letterSpacing: '0.5px' }}>🎙️ บันทึกเสียงทดสอบการพูด:</div>
                          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(234,179,8,0.3)', borderRadius: 8, padding: 8, fontSize: 11.5, fontStyle: 'italic', marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>
                            "{aiItem.fine_analysis?.interact?.english_phrases?.[0] || aiItem.sentence}"
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {isRecording ? (
                              <button
                                onClick={stopSpeechPractice}
                                type="button"
                                style={{ width: '100%', padding: '8px', borderRadius: 100, border: 'none', background: '#dc3545', color: 'white', fontSize: 11, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, animation: 'pulseMic 1.2s infinite' }}
                              >
                                ⏹️ Stop Recording
                              </button>
                            ) : (
                              <button
                                onClick={() => startSpeechPractice(aiItem.fine_analysis?.interact?.english_phrases?.[0] || aiItem.sentence)}
                                type="button"
                                style={{ width: '100%', padding: '8px', borderRadius: 100, border: 'none', background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: 'white', fontSize: 11, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                              >
                                🎙️ Record & Evaluate
                              </button>
                            )}

                            {speechScore !== null && (
                              <div style={{ background: 'rgba(0,0,0,0.35)', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>คะแนนความถูกต้อง:</span>
                                  <span style={{ color: speechScore >= 80 ? '#22c55e' : '#eab308', fontWeight: 'bold' }}>{speechScore}% Match</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, lineHeight: 1.3 }}>
                                  {speechDiff.map((word, wIdx) => (
                                    <span key={wIdx} style={{ fontSize: 11, fontWeight: 'bold', color: word.status === 'correct' ? '#22c55e' : '#ef4444' }}>
                                      {word.text}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB N: Navigate */}
                    {fineTab === 'N' && (
                      <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 9, color: '#C9A84C', fontWeight: 900, marginBottom: 6, letterSpacing: '0.5px' }}>ขั้นตอนการปฏิบัติการบริการ (N-NAVIGATE):</div>
                          {(aiItem.fine_analysis?.navigate?.service_steps || []).length > 0 ? (
                            (aiItem.fine_analysis?.navigate?.service_steps || []).map((step: string, idx: number) => (
                              <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, fontSize: 11.5, alignItems: 'flex-start' }}>
                                <span style={{ background: '#C9A84C', color: '#0F1C29', borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0, fontWeight: 'bold', marginTop: 1 }}>{idx + 1}</span>
                                <span style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{step}</span>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{aiItem.tips || aiItem.service_tips || 'ไม่มีขั้นตอนแนะนำเพิ่มเติมสำหรับอุปกรณ์ชิ้นนี้'}</p>
                          )}
                        </div>

                        {aiItem.fine_analysis?.navigate?.safety_rules && (
                          <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderLeft: '3px solid #ef4444', padding: 8, borderRadius: 8, fontSize: 11 }}>
                            <div style={{ fontWeight: 'bold', color: '#ef4444', fontSize: 9, marginBottom: 2 }}>⚠️ กฎและข้อควรระวังสุขอนามัย:</div>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)' }}>{aiItem.fine_analysis.navigate.safety_rules}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB E: Exhibit */}
                    {fineTab === 'E' && (
                      <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                        <div style={{ fontSize: 9, color: '#C9A84C', fontWeight: 900, marginBottom: 6, letterSpacing: '0.5px' }}>แบบทดสอบประเมินตนเอง (E-EXHIBIT):</div>
                        {aiItem.fine_analysis?.exhibit?.quiz_question ? (
                          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: 10, borderRadius: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 'bold', color: 'white', marginBottom: 8, lineHeight: 1.4 }}>
                              ❓ {aiItem.fine_analysis.exhibit.quiz_question}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {(aiItem.fine_analysis.exhibit.quiz_options || []).map((option: string, idx: number) => {
                                const isSelected = quizSelectedOption === option
                                const isCorrect = option === aiItem.fine_analysis?.exhibit?.correct_answer
                                let btnBg = 'rgba(255,255,255,0.06)'
                                let btnBorder = '1px solid rgba(255,255,255,0.1)'
                                let btnColor = 'white'
                                
                                if (quizAnswered) {
                                  if (isCorrect) {
                                    btnBg = 'rgba(34, 197, 94, 0.2)'
                                    btnBorder = '1.5px solid #22c55e'
                                    btnColor = '#22c55e'
                                  } else if (isSelected) {
                                    btnBg = 'rgba(239, 68, 68, 0.2)'
                                    btnBorder = '1.5px solid #ef4444'
                                    btnColor = '#ef4444'
                                  } else {
                                    btnBg = 'rgba(255,255,255,0.02)'
                                    btnBorder = '1px solid rgba(255,255,255,0.04)'
                                    btnColor = 'rgba(255,255,255,0.4)'
                                  }
                                } else if (isSelected) {
                                  btnBg = 'rgba(201, 168, 76, 0.2)'
                                  btnBorder = '1.5px solid #C9A84C'
                                  btnColor = '#C9A84C'
                                }
                                
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      if (quizAnswered) return
                                      setQuizSelectedOption(option)
                                      setQuizAnswered(true)
                                    }}
                                    type="button"
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      borderRadius: 8,
                                      background: btnBg,
                                      border: btnBorder,
                                      color: btnColor,
                                      fontSize: 11,
                                      textAlign: 'left',
                                      cursor: quizAnswered ? 'default' : 'pointer',
                                      transition: 'all 0.2s',
                                      fontWeight: 700
                                    }}
                                  >
                                    {idx + 1}. {option}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', margin: 0 }}>ไม่มีแบบทดสอบสำหรับอุปกรณ์ชิ้นนี้</p>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Area */}
                    <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 14 }}>
                      <button
                        onClick={() => { 
                          setAiScanned(false)
                          setAiItem(null)
                          setPreviewImage(null)
                          setSpeechScore(null)
                          setStudentSpeech('')
                          setMatchedModelId(null)
                          setAutoScan(false)
                          startVRCamera()
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.12)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'white',
                          padding: '10px 14px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          fontFamily: 'var(--font-primary)'
                        }}
                      >
                        🔄 สแกนใหม่
                      </button>
                      
                      {matchedModelId ? (
                        <Link
                          href={`/student/ar-view?id=${matchedModelId}`}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #A6882A 0%, #C9A84C 100%)',
                            border: 'none',
                            color: 'white',
                            padding: '10px 14px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 900,
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-primary)'
                          }}
                        >
                          📱 ส่อง AR จริง
                        </Link>
                      ) : (
                        <Link
                          href="/chat"
                          style={{
                            flex: 1,
                            background: 'rgba(56, 189, 248, 0.25)',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            color: '#38bdf8',
                            padding: '10px 14px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 900,
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-primary)'
                          }}
                        >
                          💬 ถาม AI
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
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
        .ai-scanner-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
        .ai-scanner-layout.has-results {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ai-scanner-layout.has-results .camera-container {
          height: 32vh !important;
          min-height: 240px !important;
        }
        .ai-scanner-layout.has-results .results-container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .ai-scanner-layout.has-results {
            flex-direction: row;
            align-items: stretch;
          }
          .ai-scanner-layout.has-results .camera-container {
            width: 42% !important;
            height: 74vh !important;
            min-height: 520px !important;
          }
          .ai-scanner-layout.has-results .results-container {
            width: 58% !important;
            height: 74vh !important;
            min-height: 520px !important;
            max-height: 74vh !important;
            overflow-y: auto;
          }
        }
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
