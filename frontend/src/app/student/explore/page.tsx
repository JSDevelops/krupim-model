'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { authenticatedFetch } from '@/lib/api'
import { analyzeImage as analyzeImageAPI } from '@/lib/gemini'
import { toast } from 'sonner'
import SpeechSpeedToggle, { getStoredSpeechRate } from '@/components/SpeechSpeedToggle'
import ExploreIcon from './ExploreIcon'
import styles from './explore.module.css'
import { WEEK2_MISSION_ITEMS, matchMissionItem, type MissionCategory, type Week2MissionItem } from './week2-mission'

interface Equipment {
  id?: string
  name: string
  nameEn: string
  emoji: string
  use: string
  sentence: string
  pronounce?: string
  ph?: string
  imageUrl?: string
  glbUrl?: string
  usdzUrl?: string
  category?: string
  categoryTh?: string
  modelId?: string
}

type FineAnalysis = {
  familiarize?: { desc?: string; location?: string }
  interact?: { pronunciation?: string; english_phrases?: string[]; roleplay_prompt?: string }
  navigate?: { service_steps?: string[]; safety_rules?: string }
  exhibit?: { quiz_question?: string; quiz_options?: string[]; correct_answer?: string }
}

type ScanResult = {
  name?: string
  nameTh?: string
  name_en?: string
  name_th?: string
  category?: string
  subcategory?: string
  description?: string
  use?: string
  location?: string
  service_tips?: string
  tips?: string
  sentence?: string
  pronounce?: string
  confidence?: number
  english_phrases?: string[]
  is_fallback?: boolean
  fallback_reason?: string
  fine_analysis?: FineAnalysis
}

const FINE_TABS = [
  { id: 'F', label: 'รู้จัก' },
  { id: 'I', label: 'ฝึกพูด' },
  { id: 'N', label: 'ขั้นตอน' },
  { id: 'E', label: 'ทบทวน' },
] as const

function isImageSource(value: string) {
  return value.startsWith('data:image') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')
}

async function prepareImageForScan(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('กรุณาเลือกไฟล์รูปภาพ')
  if (file.size > 15 * 1024 * 1024) throw new Error('รูปภาพต้องมีขนาดไม่เกิน 15 MB')

  const bitmap = await createImageBitmap(file)
  const maxDimension = 1280
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) {
    bitmap.close()
    throw new Error('ไม่สามารถเตรียมรูปภาพได้')
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const dataUrl = canvas.toDataURL('image/jpeg', 0.76)
  return { dataUrl, base64: dataUrl.slice(dataUrl.indexOf(',') + 1), mimeType: 'image/jpeg' }
}

function EquipmentVisual({ item, size = 22 }: { item: Equipment; size?: number }) {
  if (item.imageUrl) {
    return <Image src={item.imageUrl} alt="" fill sizes="48px" unoptimized />
  }
  if (item.emoji && isImageSource(item.emoji)) {
    return <Image src={item.emoji} alt="" fill sizes="48px" unoptimized />
  }
  return <ExploreIcon name="cube" size={size} />
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'vocabulary' | 'scan'>('mission')
  const [selectedMissionWeek, setSelectedMissionWeek] = useState<1 | 2>(1)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [viewItem, setViewItem] = useState<Equipment | null>(null)
  const [showVocabulary, setShowVocabulary] = useState(false)
  const [visibleCount, setVisibleCount] = useState(40)
  const [speaking, setSpeaking] = useState<string | null>(null)
  const [scanAnim, setScanAnim] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanError, setScanError] = useState('')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [autoScan, setAutoScan] = useState(false)
  const [matchedModelId, setMatchedModelId] = useState<string | null>(null)
  const [fineTab, setFineTab] = useState<'F' | 'I' | 'N' | 'E'>('F')
  const [quizSelected, setQuizSelected] = useState<string | null>(null)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [speechScore, setSpeechScore] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [speechRate, setSpeechRate] = useState<number>(() => getStoredSpeechRate())

  // ── Week 1 Tableware State ──
  const [week1Category, setWeek1Category] = useState<'ALL' | 'cutlery' | 'glass' | 'tableware'>('ALL')
  const [week1Search, setWeek1Search] = useState('')

  // ── Week 2 Mission State ──
  const [missionProgress, setMissionProgress] = useState<Record<string, { scanned: boolean; score?: number; timestamp?: string }>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const saved = localStorage.getItem('finemodel_week2_f_mission')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [selectedMissionCategory, setSelectedMissionCategory] = useState<'ALL' | MissionCategory>('ALL')
  const [isSubmittingMission, setIsSubmittingMission] = useState(false)
  const [missionSubmitted, setMissionSubmitted] = useState(false)
  const week2AssignmentId = 'a1111111-1111-4111-8111-222222222201'
  const [activeSpeechMissionId, setActiveSpeechMissionId] = useState<string | null>(null)

  // ── Fallback Scan Mode State ──
  const [showFallbackModal, setShowFallbackModal] = useState(false)
  const [fallbackSearch, setFallbackSearch] = useState('')
  const [fallbackFilter, setFallbackFilter] = useState<'ALL' | 'WEEK1' | 'WEEK2'>('ALL')
  const [currentScanHint, setCurrentScanHint] = useState<string | null>(null)

  // ── Real-time Live Scan State ──
  const [liveDetected, setLiveDetected] = useState<{
    nameEn: string
    nameTh: string
    confidence: number
    result: ScanResult
    image?: string
  } | null>(null)
  const [isLiveScanning, setIsLiveScanning] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)
  const autoScanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const requestPendingRef = useRef(false)
  const equipmentRef = useRef<Equipment[]>([])
  const missionSliderRef = useRef<HTMLDivElement>(null)

  const scrollMissionSlider = (direction: 'left' | 'right') => {
    if (missionSliderRef.current) {
      missionSliderRef.current.scrollBy({
        left: direction === 'left' ? -290 : 290,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mode') === 'scan') {
      const timer = window.setTimeout(() => setActiveTab('scan'), 0)
      return () => window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function loadEquipment() {
      try {
        const [response, { defaultEquipment }] = await Promise.all([
          authenticatedFetch('/api/student/explore', { signal: controller.signal }),
          import('./equipment-data'),
        ])
        if (!response.ok) throw new Error('โหลดรายการคำศัพท์ไม่สำเร็จ')
        const payload = await response.json() as { items?: Equipment[] }
        const merged = new Map<string, Equipment>()
        for (const item of [...(payload.items || []), ...defaultEquipment]) {
          const key = item.nameEn.trim().toLocaleLowerCase('en')
          if (!merged.has(key)) merged.set(key, item)
        }
        const items = [...merged.values()].filter(item => Boolean(item.imageUrl || item.glbUrl))
        equipmentRef.current = items
        setEquipment(items)
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Failed to load explore vocabulary:', error)
        const { defaultEquipment } = await import('./equipment-data')
        equipmentRef.current = defaultEquipment
        setEquipment(defaultEquipment)
      }
    }
    void loadEquipment()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop())
      window.speechSynthesis?.cancel()
      recognitionRef.current?.stop()
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsCameraActive(false)
  }, [])

  async function startCamera() {
    if (streamRef.current?.active) return
    setScanError('')
    setLiveDetected(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError('อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับกล้อง กรุณาอัปโหลดรูปภาพแทน')
      return
    }
    try {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 960 }, height: { ideal: 720 } },
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsCameraActive(true)
      setAutoScan(false)
    } catch (error) {
      console.error('Camera unavailable:', error)
      setScanError('เปิดกล้องไม่ได้ กรุณาตรวจสอบสิทธิ์กล้องหรืออัปโหลดรูปภาพแทน')
      setIsCameraActive(false)
    }
  }

  const applyScanResult = useCallback((result: ScanResult, image?: string) => {
    if (image) setPreviewImage(image)
    setScanResult(result)
    setFineTab('F')
    setQuizSelected(null)
    setQuizAnswered(false)
    setSpeechScore(null)
    setAutoScan(false)
    stopCamera()
    const normalizedName = String(result.name_en || result.name || '').trim().toLocaleLowerCase('en')
    const matched = equipmentRef.current.find(item => item.nameEn.trim().toLocaleLowerCase('en') === normalizedName)
    setMatchedModelId(matched?.modelId || null)

    // ── Auto-Detect Week 2 Mission Item ──
    const searchTarget = `${result.name_en || ''} ${result.name || ''} ${result.name_th || ''}`
    const missionMatch = matchMissionItem(searchTarget)
    if (missionMatch) {
      setMissionProgress(prev => {
        const next = {
          ...prev,
          [missionMatch.id]: {
            scanned: true,
            score: prev[missionMatch.id]?.score || 100,
            timestamp: new Date().toISOString(),
          },
        }
        try {
          localStorage.setItem('finemodel_week2_f_mission', JSON.stringify(next))
        } catch {}
        return next
      })
      toast.success(`🎯 ภารกิจสัปดาห์ที่ 2: สแกน "${missionMatch.nameEn}" สำเร็จแล้ว!`, {
        description: `จัดอยู่ในหมวดหมู่: ${missionMatch.categoryTh} (ระบบบันทึกเช็คลิสต์แล้ว ✓)`,
      })
    }
  }, [stopCamera])

  async function triggerFallbackScan(item: { nameEn: string; nameTh?: string; name?: string; categoryTh?: string }) {
    setScanAnim(true)
    setScanError('')
    setShowFallbackModal(false)
    try {
      const result = await analyzeImageAPI('', 'image/jpeg', {
        forceFallback: true,
        fallbackItemEn: item.nameEn,
      }) as ScanResult
      if (!result) throw new Error('ระบบไม่ส่งผลการจำลองกลับมา')
      applyScanResult(result)
      toast.success(`🎯 โหมดสำรอง: เปิดข้อมูล "${item.nameEn}"`, {
        description: 'ระบบดึงเนื้อหาจากคลังบทเรียน FINE Model สำหรับเมนูนี้เรียบร้อยแล้ว',
      })
    } catch (error) {
      console.error('Trigger fallback scan failed:', error)
      toast.error('ไม่สามารถจำลองสแกนได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setScanAnim(false)
    }
  }

  async function analyzeImage(base64: string, mimeType: string, image?: string, hint?: string) {
    setScanAnim(true)
    setScanError('')
    try {
      const result = await analyzeImageAPI(base64, mimeType, {
        fallbackItemEn: hint || currentScanHint || undefined
      }) as ScanResult
      if (!result) throw new Error('ระบบ AI ไม่ส่งผลการวิเคราะห์กลับมา')
      applyScanResult(result, image)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถวิเคราะห์รูปภาพได้'
      const normalized = message.toLowerCase()
      if (normalized.includes('429') || normalized.includes('quota') || normalized.includes('rate limit')) {
        setScanError('ระบบ AI มีคำขอหนาแน่นชั่วคราว (โควต้าเต็ม) คุณสามารถใช้ "โหมดเลือกวัตถุจำลอง (Fallback Scan)" เพื่อทำภารกิจต่อได้ทันที')
      } else if (normalized.includes('api key') || normalized.includes('unauthorized') || normalized.includes('403')) {
        setScanError('การตั้งค่าผู้ให้บริการ AI ไม่สมบูรณ์ กรุณาใช้โหมดเลือกวัตถุจำลอง')
      } else {
        setScanError(message)
      }
    } finally {
      setScanAnim(false)
    }
  }

  const captureAutoFrame = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || requestPendingRef.current || scanAnim || scanResult || activeTab !== 'scan' || document.visibilityState !== 'visible') return
    if (!video.videoWidth || !video.videoHeight) return

    // Scale frame down to 440px wide for rapid real-time AI analysis (~20-25KB)
    const scale = Math.min(1, 440 / video.videoWidth)
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.65)
    requestPendingRef.current = true
    setIsLiveScanning(true)
    try {
      const result = await analyzeImageAPI(dataUrl.slice(dataUrl.indexOf(',') + 1), 'image/jpeg', {
        fallbackItemEn: currentScanHint || undefined
      }) as ScanResult
      if (result && (result.confidence || 0) >= 55) {
        setLiveDetected({
          nameEn: result.name_en || result.name || 'Equipment',
          nameTh: result.name_th || '',
          confidence: result.confidence || 85,
          result,
          image: dataUrl,
        })

        // Auto-Check Week 2 Mission Item continuously on the fly
        const searchTarget = `${result.name_en || ''} ${result.name || ''} ${result.name_th || ''}`
        const missionMatch = matchMissionItem(searchTarget)
        if (missionMatch) {
          setMissionProgress(prev => {
            const next = {
              ...prev,
              [missionMatch.id]: {
                scanned: true,
                score: prev[missionMatch.id]?.score || 100,
                timestamp: new Date().toISOString(),
              },
            }
            try {
              localStorage.setItem('finemodel_week2_f_mission', JSON.stringify(next))
            } catch {}
            return next
          })
        }
      }
    } catch (error) {
      console.warn('Realtime scan frame failed:', error)
      const msg = error instanceof Error ? error.message : ''
      if (msg.includes('โควต้า') || msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        setAutoScan(false)
        setScanError('โควต้า AI รายวันของระบบเต็มชั่วคราว (Google Gemini Free Tier) กรุณากดปุ่ม "🎯 เลือกจำลอง" ด้านบน เพื่อเลือกวัตถุที่คุณกำลังสแกนอยู่ หรือให้อาจารย์อัปเดต API Key')
      }
    } finally {
      requestPendingRef.current = false
      setIsLiveScanning(false)
    }
  }, [activeTab, currentScanHint, scanAnim, scanResult])

  useEffect(() => {
    if (isCameraActive && autoScan && activeTab === 'scan' && !scanResult) {
      autoScanTimerRef.current = setInterval(() => void captureAutoFrame(), 2600)
    }
    return () => {
      if (autoScanTimerRef.current) clearInterval(autoScanTimerRef.current)
      autoScanTimerRef.current = null
    }
  }, [activeTab, autoScan, captureAutoFrame, isCameraActive, scanResult])

  async function captureFrame() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !isCameraActive) {
      await startCamera()
      return
    }
    canvas.width = video.videoWidth || 960
    canvas.height = video.videoHeight || 720
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.76)
    setAutoScan(false)
    await analyzeImage(dataUrl.slice(dataUrl.indexOf(',') + 1), 'image/jpeg', dataUrl, currentScanHint || undefined)
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const prepared = await prepareImageForScan(file)
      await analyzeImage(prepared.base64, prepared.mimeType, prepared.dataUrl, currentScanHint || undefined)
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'ไม่สามารถอ่านรูปภาพได้')
    } finally {
      event.target.value = ''
    }
  }

  function resetScan() {
    setScanResult(null)
    setPreviewImage(null)
    setMatchedModelId(null)
    setQuizSelected(null)
    setQuizAnswered(false)
    setSpeechScore(null)
    setScanError('')
    setCurrentScanHint(null)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const week = params.get('week')
      if (week === '2') {
        setActiveTab('mission')
        setSelectedMissionWeek(2)
      } else if (week === '1') {
        setActiveTab('mission')
        setSelectedMissionWeek(1)
      }
    }
  }, [])

  function changeTab(tab: 'mission' | 'vocabulary' | 'scan' | 'library' | 'week1' | 'week2') {
    let target: 'mission' | 'vocabulary' | 'scan' = 'mission'
    if (tab === 'vocabulary' || tab === 'library') {
      target = 'vocabulary'
    } else if (tab === 'scan') {
      target = 'scan'
    } else if (tab === 'week1') {
      target = 'mission'
      setSelectedMissionWeek(1)
    } else if (tab === 'week2') {
      target = 'mission'
      setSelectedMissionWeek(2)
    } else {
      target = 'mission'
    }

    if (target !== 'scan') {
      setAutoScan(false)
      stopCamera()
    }
    setActiveTab(target)
  }

  function speak(text: string, id: string) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = speechRate
    utterance.onstart = () => setSpeaking(id)
    utterance.onend = () => setSpeaking(null)
    utterance.onerror = () => setSpeaking(null)
    window.speechSynthesis.speak(utterance)
  }

  function evaluateSpeech(spoken: string, target: string) {
    const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9']/g, '')
    const targetWords = target.split(/\s+/).map(clean).filter(Boolean)
    const spokenWords = new Set(spoken.split(/\s+/).map(clean).filter(Boolean))
    const matched = targetWords.filter(word => spokenWords.has(word)).length
    const score = targetWords.length ? Math.round((matched / targetWords.length) * 100) : 0
    setSpeechScore(score)

    if (activeSpeechMissionId) {
      setMissionProgress(prev => {
        const next = {
          ...prev,
          [activeSpeechMissionId]: {
            scanned: true,
            score,
            timestamp: new Date().toISOString(),
          },
        }
        try {
          localStorage.setItem('finemodel_week2_f_mission', JSON.stringify(next))
        } catch {}
        return next
      })
      toast.success(`🎙️ ประเมินการออกเสียง: ได้ ${score}%`, {
        description: score >= 80 ? 'ยอดเยี่ยมมาก! สำเนียงถูกต้องชัดเจน' : 'แนะนำให้ฝึกออกเสียงอีกครั้งเพื่อความแม่นยำ',
      })
      setActiveSpeechMissionId(null)
    }
  }

  function startMissionSpeechPractice(item: Week2MissionItem) {
    setActiveSpeechMissionId(item.id)
    startSpeechPractice(item.nameEn)
  }

  function toggleMissionItem(id: string) {
    setMissionProgress(prev => {
      const isDone = Boolean(prev[id]?.scanned)
      const next = {
        ...prev,
        [id]: isDone ? { scanned: false } : { scanned: true, score: 100, timestamp: new Date().toISOString() },
      }
      try {
        localStorage.setItem('finemodel_week2_f_mission', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  async function submitWeek2Mission() {
    const completedItems = WEEK2_MISSION_ITEMS.filter(item => missionProgress[item.id]?.scanned)
    if (completedItems.length === 0) {
      toast.warning('กรุณาสแกนหรือซ้อมอ่านออกเสียงรายการอาหารและเครื่องดื่มก่อนส่งงาน')
      return
    }

    setIsSubmittingMission(true)
    try {
      const scores = completedItems.map(i => missionProgress[i.id]?.score || 95)
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

      const response = await authenticatedFetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: week2AssignmentId,
          attachmentName: `AI Scan Learning Record สัปดาห์ที่ 2 (${completedItems.length}/20 รายการ • คะแนนเฉลี่ย ${avgScore}%)`,
          attachmentUrl: `https://www.krupim-finemodel3d-ar.com/student/explore?week=2&items=${completedItems.length}`,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'ส่งงานไม่สำเร็จ')
      }

      setMissionSubmitted(true)
      toast.success('🎉 ส่งงานและบันทึกผลการสแกนสัปดาห์ที่ 2 [F] เรียบร้อยแล้ว!', {
        description: `บันทึกรายการสำเร็จ ${completedItems.length}/20 รายการ พร้อมส่งตรงถึงแดชบอร์ดครูพิมพ์`,
      })
      window.dispatchEvent(new Event('assignment-submitted'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถส่งงานได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSubmittingMission(false)
    }
  }

  function startSpeechPractice(target: string) {
    window.speechSynthesis?.cancel()
    const SpeechRecognition = (window as typeof window & {
      SpeechRecognition?: new () => {
        lang: string
        interimResults: boolean
        onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void
        onerror: () => void
        onend: () => void
        start: () => void
        stop: () => void
      }
      webkitSpeechRecognition?: new () => {
        lang: string
        interimResults: boolean
        onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void
        onerror: () => void
        onend: () => void
        start: () => void
        stop: () => void
      }
    }).SpeechRecognition || (window as typeof window & { webkitSpeechRecognition?: new () => never }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.warning('เบราว์เซอร์นี้ยังไม่รองรับการประเมินเสียงพูด')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.onresult = event => evaluateSpeech(event.results[0][0].transcript || '', target)
    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)
    recognitionRef.current = recognition
    setSpeechScore(null)
    setIsRecording(true)
    recognition.start()
  }

  const featuredItems = useMemo(() => equipment.slice(0, 6), [equipment])
  const visibleVocabulary = useMemo(() => equipment.slice(0, visibleCount), [equipment, visibleCount])

  const filteredWeek1Equipment = useMemo(() => {
    const q = week1Search.trim().toLowerCase()
    return equipment.filter(item => {
      const cat = (item.category || '').toLowerCase()
      const matchCat = week1Category === 'ALL' || cat === week1Category.toLowerCase()
      if (!matchCat) return false
      if (!q) return true
      return (
        item.nameEn.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.use && item.use.toLowerCase().includes(q))
      )
    })
  }, [equipment, week1Category, week1Search])

  const fallbackAllCandidates = useMemo(() => {
    const list: Array<{ nameEn: string; nameTh: string; name?: string; emoji?: string; categoryTh?: string; isMission?: boolean }> = []
    const seen = new Set<string>()

    // 1. สัปดาห์ที่ 1: Equipment items (เรียงไว้บนสุด)
    for (const eq of equipment) {
      const key = eq.nameEn.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        list.push({
          nameEn: eq.nameEn,
          nameTh: eq.name,
          name: eq.name,
          emoji: eq.emoji && !isImageSource(eq.emoji) ? eq.emoji : '',
          categoryTh: `สัปดาห์ที่ 1 • ${eq.categoryTh || 'อุปกรณ์บนโต๊ะอาหาร'}`,
          isMission: false,
        })
      }
    }

    // 2. สัปดาห์ที่ 2: Week 2 Mission Items
    for (const m of WEEK2_MISSION_ITEMS) {
      const key = m.nameEn.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        list.push({
          nameEn: m.nameEn,
          nameTh: m.nameTh,
          name: m.nameTh,
          emoji: m.emoji,
          categoryTh: `สัปดาห์ที่ 2 • ${m.categoryTh}`,
          isMission: true,
        })
      }
    }

    return list
  }, [equipment])

  const filteredFallbackItems = useMemo(() => {
    const search = fallbackSearch.trim().toLowerCase()
    return fallbackAllCandidates.filter(item => {
      if (fallbackFilter === 'WEEK1' && item.isMission) return false
      if (fallbackFilter === 'WEEK2' && !item.isMission) return false
      if (!search) return true
      return (
        item.nameEn.toLowerCase().includes(search) ||
        item.nameTh.toLowerCase().includes(search) ||
        (item.categoryTh && item.categoryTh.toLowerCase().includes(search))
      )
    })
  }, [fallbackAllCandidates, fallbackFilter, fallbackSearch])
  const resultName = scanResult?.name_en || scanResult?.name || 'Unknown object'
  const resultThai = scanResult?.name_th || scanResult?.nameTh || 'ไม่พบชื่อภาษาไทย'
  const phrases = scanResult?.fine_analysis?.interact?.english_phrases || scanResult?.english_phrases || []
  const practicePhrase = phrases[0] || scanResult?.sentence || resultName

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><ExploreIcon name="sparkles" size={16} /> F — Familiarize</div>
            <h1 className={styles.title}>สำรวจอุปกรณ์และเรียนรู้คำศัพท์งานบริการ</h1>
            <p className={styles.subtitle}>เลือกดูคลังคำศัพท์หรือใช้ AI Scan วิเคราะห์วัตถุ แล้วฝึกเรียนรู้ตามกระบวนการ F–I–N–E ได้ในหน้าเดียว</p>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statIcon}><ExploreIcon name="book" /></span>
              <span><strong className={styles.statValue}>{equipment.length || '—'}</strong><small className={styles.statLabel}>คำศัพท์พร้อมเรียนรู้</small></span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}><ExploreIcon name="scan" /></span>
              <span><strong className={styles.statValue}>AI Vision</strong><small className={styles.statLabel}>วิเคราะห์ภาพตามวัตถุจริง</small></span>
            </div>
          </div>
        </section>

        {/* ── Tabs Navigation: 3 ปุ่มตามที่ผู้ใช้กำหนด ── */}
        <div className={styles.tabs} role="tablist" aria-label="โหมดการเรียนรู้">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mission'}
            className={`${styles.tab} ${activeTab === 'mission' ? styles.tabActive : ''}`}
            onClick={() => changeTab('mission')}
          >
            <ExploreIcon name="sparkles" size={16} /> ภารกิจประจำสัปดาห์
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'vocabulary'}
            className={`${styles.tab} ${activeTab === 'vocabulary' ? styles.tabActive : ''}`}
            onClick={() => changeTab('vocabulary')}
          >
            <ExploreIcon name="book" size={16} /> คำศัพท์
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'scan'}
            className={`${styles.tab} ${activeTab === 'scan' ? styles.tabActive : ''}`}
            onClick={() => changeTab('scan')}
          >
            <ExploreIcon name="camera" size={16} /> AR+AI Scan
          </button>
        </div>

        {/* Speed Controller Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '6px 0 14px' }}>
          <SpeechSpeedToggle currentRate={speechRate} onRateChange={setSpeechRate} />
        </div>

        {/* ── TAB 1: ภารกิจประจำสัปดาห์ (สัปดาห์ที่ 1 อยู่บนสุด) ── */}
        {activeTab === 'mission' && (
          <section className={styles.missionSection}>
            <div className={styles.missionCard}>
              <div className={styles.missionHeader}>
                <div>
                  <span className={styles.missionBadge}>
                    <ExploreIcon name="sparkles" size={14} /> ภารกิจประจำสัปดาห์ [F]: Familiarize
                  </span>
                  <h2 className={styles.missionTitle}>
                    {selectedMissionWeek === 1
                      ? 'สัปดาห์ที่ 1: อุปกรณ์บนโต๊ะอาหาร (51 รายการ)'
                      : 'สัปดาห์ที่ 2: ภารกิจ AI Scan 20 เมนูอาหารและเครื่องดื่ม'}
                  </h2>
                  <p className={styles.missionSubtitle}>
                    {selectedMissionWeek === 1
                      ? 'สำรวจอุปกรณ์บนโต๊ะอาหาร ช้อน ส้อม มีด แก้ว จาน และชาม พร้อมโมเดล 3 มิติ และการฝึกออกเสียง'
                      : 'ใช้ AI Scan สแกนภาพ/โมเดลจริง หรือกดฟังเสียงและฝึกออกเสียงคำศัพท์ 4 หมวดหมู่ (20 รายการ) เพื่อบันทึกผลการเรียนรู้และส่งงาน'}
                  </p>
                </div>
              </div>

              {/* Week Toggle Pills (สัปดาห์ที่ 1 อยู่ซ้ายสุด/บนสุด) */}
              <div style={{ display: 'flex', gap: 8, margin: '14px 0 16px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`${styles.missionFilterBtn} ${selectedMissionWeek === 1 ? styles.missionFilterBtnActive : ''}`}
                  onClick={() => setSelectedMissionWeek(1)}
                  style={{ fontWeight: 600 }}
                >
                  <ExploreIcon name="book" size={14} /> สัปดาห์ที่ 1: อุปกรณ์บนโต๊ะอาหาร (51 รายการ)
                </button>
                <button
                  type="button"
                  className={`${styles.missionFilterBtn} ${selectedMissionWeek === 2 ? styles.missionFilterBtnActive : ''}`}
                  onClick={() => setSelectedMissionWeek(2)}
                  style={{ fontWeight: 600 }}
                >
                  <ExploreIcon name="sparkles" size={14} /> สัปดาห์ที่ 2: เมนูอาหาร 20 ชนิด
                </button>
              </div>

              {/* ── Sub-content for Week 1 Mission ── */}
              {selectedMissionWeek === 1 && (
                <div>
                  {/* Filter Pills and Search for Week 1 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="search"
                        value={week1Search}
                        onChange={e => setWeek1Search(e.target.value)}
                        placeholder="ค้นหาชื่ออุปกรณ์ (เช่น Fork, Knife, Glass, Plate, ช้อน, ส้อม, จาน)..."
                        style={{
                          flex: '1 1 240px',
                          padding: '9px 14px',
                          borderRadius: 12,
                          border: '1px solid #c9d5ce',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                      {week1Search && (
                        <button
                          type="button"
                          onClick={() => setWeek1Search('')}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 10,
                            border: '1px solid #d0ded6',
                            background: '#ffffff',
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                        >
                          ล้างการค้นหา
                        </button>
                      )}
                    </div>

                    <div className={styles.missionCategoryFilters} style={{ margin: 0 }}>
                      {[
                        { id: 'ALL', label: `ทั้งหมด (${equipment.length})` },
                        { id: 'cutlery', label: `ช้อน ส้อม มีด (${equipment.filter(e => (e.category || '').toLowerCase() === 'cutlery').length})` },
                        { id: 'glass', label: `แก้วเครื่องดื่ม (${equipment.filter(e => (e.category || '').toLowerCase() === 'glass').length})` },
                        { id: 'tableware', label: `จานและชาม (${equipment.filter(e => (e.category || '').toLowerCase() === 'tableware').length})` },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          className={`${styles.missionFilterBtn} ${week1Category === tab.id ? styles.missionFilterBtnActive : ''}`}
                          onClick={() => setWeek1Category(tab.id as 'ALL' | 'cutlery' | 'glass' | 'tableware')}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Week 1 Equipment Grid */}
                  <div className={styles.vocabGrid} style={{ padding: '4px 0' }}>
                    {filteredWeek1Equipment.map(item => (
                      <button
                        type="button"
                        className={styles.vocabCard}
                        key={item.nameEn}
                        onClick={() => setViewItem(item)}
                      >
                        <span className={styles.itemVisual}>
                          <EquipmentVisual item={item} />
                        </span>
                        <span className={styles.itemText}>
                          <span className={styles.itemEn}>{item.nameEn}</span>
                          <span className={styles.itemTh}>{item.name}</span>
                          <span style={{ fontSize: '10px', color: '#174b37', fontWeight: 600, marginTop: 2 }}>
                            {item.categoryTh || item.category || 'อุปกรณ์บนโต๊ะอาหาร'}
                            {(item.glbUrl || item.usdzUrl) ? ' • มีโมเดล 3 มิติ' : ''}
                          </span>
                        </span>
                        <span className={styles.cardArrow}>
                          <ExploreIcon name="arrow" size={16} />
                        </span>
                      </button>
                    ))}
                  </div>

                  {filteredWeek1Equipment.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#68776f', fontSize: 13 }}>
                      ไม่พบคำศัพท์ที่ตรงกับ "{week1Search}" ในหมวดหมู่นี้
                    </div>
                  )}
                </div>
              )}

              {/* ── Sub-content for Week 2 Mission ── */}
              {selectedMissionWeek === 2 && (
                <div>
                  {/* Progress Bar */}
                  {(() => {
                    const completedCount = WEEK2_MISSION_ITEMS.filter(i => missionProgress[i.id]?.scanned).length
                    const percent = Math.round((completedCount / WEEK2_MISSION_ITEMS.length) * 100)
                    return (
                      <div className={styles.missionProgressWrap}>
                        <div className={styles.missionProgressHeader}>
                          <span>ความคืบหน้าการสแกนและการฝึกฝน</span>
                          <strong>
                            {completedCount} / {WEEK2_MISSION_ITEMS.length} เมนู ({percent}%)
                          </strong>
                        </div>
                        <div className={styles.missionProgressBar}>
                          <div className={styles.missionProgressFill} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )
                  })()}

                  {/* Category Filter Pills (Cleaned, no emojis) */}
                  <div className={styles.missionCategoryFilters}>
                    {(['ALL', 'Appetizers', 'Main Courses', 'Desserts', 'Beverages'] as const).map(cat => {
                      const label = cat === 'ALL' ? 'ทั้งหมด (20)' :
                        cat === 'Appetizers' ? 'Appetizers (4)' :
                        cat === 'Main Courses' ? 'Main Courses (4)' :
                        cat === 'Desserts' ? 'Desserts (4)' : 'Beverages (8)'
                      return (
                        <button
                          key={cat}
                          type="button"
                          className={`${styles.missionFilterBtn} ${selectedMissionCategory === cat ? styles.missionFilterBtnActive : ''}`}
                          onClick={() => setSelectedMissionCategory(cat)}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Slider Controls */}
                  <div className={styles.missionSliderControls}>
                    <div style={{ flex: 1 }} />
                    <div className={styles.missionSliderArrows}>
                      <button
                        type="button"
                        onClick={() => scrollMissionSlider('left')}
                        className={styles.missionSliderArrowBtn}
                        aria-label="เลื่อนซ้าย"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollMissionSlider('right')}
                        className={styles.missionSliderArrowBtn}
                        aria-label="เลื่อนขวา"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  {/* 20 Mission Items Single-Row Slider */}
                  <div ref={missionSliderRef} className={styles.missionGrid}>
                    {WEEK2_MISSION_ITEMS.filter(item => selectedMissionCategory === 'ALL' || item.category === selectedMissionCategory).map(item => {
                      const prog = missionProgress[item.id]
                      const isDone = Boolean(prog?.scanned)
                      return (
                        <div
                          key={item.id}
                          className={`${styles.missionItemCard} ${isDone ? styles.missionItemCompleted : ''}`}
                        >
                          <div className={styles.missionItemTop}>
                            <span className={styles.missionItemCategoryBadge}>{item.category}</span>
                            <button
                              type="button"
                              className={`${styles.missionCheckBadge} ${isDone ? styles.missionCheckDone : styles.missionCheckPending}`}
                              onClick={() => toggleMissionItem(item.id)}
                              title="คลิกเพื่อสลับสถานะ"
                              style={{ border: 'none', cursor: 'pointer', font: 'inherit' }}
                            >
                              {isDone ? `✓ สแกนแล้ว ${prog?.score ? `(${prog.score}%)` : ''}` : 'รอสแกน'}
                            </button>
                          </div>
                          <h4 className={styles.missionItemEn}>{item.nameEn}</h4>
                          <p className={styles.missionItemTh}>{item.nameTh} • <span style={{ color: '#174b37', fontWeight: 600 }}>{item.categoryTh}</span></p>
                          <p className={styles.missionItemPronounce}>{item.pronounce}</p>

                          <div className={styles.missionItemActions}>
                            <button
                              type="button"
                              className={styles.missionActionBtn}
                              onClick={() => speak(item.nameEn, item.id)}
                              title="ฟังการออกเสียง"
                            >
                              <ExploreIcon name="volume" size={13} />
                              <span>{speaking === item.id ? 'อ่าน...' : 'ฟังเสียง'}</span>
                            </button>
                            <button
                              type="button"
                              className={styles.missionActionBtn}
                              onClick={() => startMissionSpeechPractice(item)}
                              title="ฝึกพูดออกเสียงด้วยไมโครโฟน"
                            >
                              <ExploreIcon name="mic" size={13} />
                              <span>{isRecording && activeSpeechMissionId === item.id ? 'ฟัง...' : 'ฝึกพูด'}</span>
                            </button>
                            <button
                              type="button"
                              className={styles.missionActionBtn}
                              onClick={() => {
                                setCurrentScanHint(item.nameEn)
                                changeTab('scan')
                                void startCamera()
                                toast.info(`เตรียมสแกน: "${item.nameEn}"`, {
                                  description: 'เล็งกล้องไปที่วัตถุ (หาก AI ขัดข้อง ระบบสำรองจะวิเคราะห์รายการนี้ให้ทันที)',
                                })
                              }}
                              title="เปิดกล้อง AI Scan เมนูนี้"
                            >
                              <ExploreIcon name="camera" size={13} />
                              <span>สแกน</span>
                            </button>
                            <button
                              type="button"
                              className={styles.missionActionBtn}
                              onClick={() => void triggerFallbackScan(item)}
                              title="จำลองผลการสแกนด้วยระบบสำรอง (Curriculum Fallback)"
                              style={{ background: '#fcf6e8', borderColor: '#e4d3a8', color: '#7a5a16' }}
                            >
                              <ExploreIcon name="layers" size={13} />
                              <span>จำลอง</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* 1-Click Submit Banner */}
                  {(() => {
                    const completedCount = WEEK2_MISSION_ITEMS.filter(i => missionProgress[i.id]?.scanned).length
                    return (
                      <div className={styles.missionSubmitBanner}>
                        <div className={styles.missionSubmitText}>
                          <h4>
                            {missionSubmitted ? 'ส่งงานสัปดาห์ที่ 2 [F] เรียบร้อยแล้ว' : 'พร้อมประเมินและส่งงานสัปดาห์ที่ 2'}
                          </h4>
                          <p>
                            {missionSubmitted
                              ? `บันทึกรายการสำเร็จ ${completedCount}/20 เมนู ส่งเข้าสู่ระบบคุณครูเรียบร้อยแล้ว (สามารถส่งซ้ำเพื่ออัปเดตคะแนนได้)`
                              : `สแกนครบแล้ว ${completedCount}/20 รายการ กดปุ่มนี้เพื่อส่งงานตรงเข้าสู่ระบบคุณครูทันที`}
                          </p>
                        </div>
                        <button
                          type="button"
                          className={styles.missionSubmitBtn}
                          onClick={submitWeek2Mission}
                          disabled={isSubmittingMission || completedCount === 0}
                        >
                          <ExploreIcon name="check" size={16} />
                          <span>{isSubmittingMission ? 'กำลังส่งงาน...' : missionSubmitted ? 'ส่งงานเรียบร้อย (กดส่งซ้ำได้)' : 'บันทึกผลและส่งงานสัปดาห์ที่ 2 [F]'}</span>
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── TAB 2: คำศัพท์ (Vocabulary Library) ── */}
        {activeTab === 'vocabulary' && (
          <section className={styles.missionSection}>
            <div className={styles.missionCard}>
              <div className={styles.missionHeader}>
                <div>
                  <span className={styles.missionBadge}>
                    <ExploreIcon name="book" size={14} /> คลังคำศัพท์วิชาชีพ
                  </span>
                  <h2 className={styles.missionTitle}>คลังคำศัพท์งานบริการอาหารและเครื่องดื่ม (51 รายการ)</h2>
                  <p className={styles.missionSubtitle}>
                    ค้นหาและศึกษาคำศัพท์อุปกรณ์บนโต๊ะอาหารมาตรฐานสากล พร้อมโมเดล 3 มิติ การออกเสียงภาษาอังกฤษ และประโยคใช้งานจริง
                  </p>
                </div>
              </div>

              {/* Filter Pills and Search */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '14px 0 16px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="search"
                    value={week1Search}
                    onChange={e => setWeek1Search(e.target.value)}
                    placeholder="ค้นหาชื่ออุปกรณ์ (เช่น Fork, Knife, Glass, Plate, ช้อน, ส้อม, จาน)..."
                    style={{
                      flex: '1 1 240px',
                      padding: '9px 14px',
                      borderRadius: 12,
                      border: '1px solid #c9d5ce',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                  {week1Search && (
                    <button
                      type="button"
                      onClick={() => setWeek1Search('')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: '1px solid #d0ded6',
                        background: '#ffffff',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ล้างการค้นหา
                    </button>
                  )}
                </div>

                <div className={styles.missionCategoryFilters} style={{ margin: 0 }}>
                  {[
                    { id: 'ALL', label: `ทั้งหมด (${equipment.length})` },
                    { id: 'cutlery', label: `ช้อน ส้อม มีด (${equipment.filter(e => (e.category || '').toLowerCase() === 'cutlery').length})` },
                    { id: 'glass', label: `แก้วเครื่องดื่ม (${equipment.filter(e => (e.category || '').toLowerCase() === 'glass').length})` },
                    { id: 'tableware', label: `จานและชาม (${equipment.filter(e => (e.category || '').toLowerCase() === 'tableware').length})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`${styles.missionFilterBtn} ${week1Category === tab.id ? styles.missionFilterBtnActive : ''}`}
                      onClick={() => setWeek1Category(tab.id as 'ALL' | 'cutlery' | 'glass' | 'tableware')}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment Grid */}
              <div className={styles.vocabGrid} style={{ padding: '4px 0' }}>
                {filteredWeek1Equipment.map(item => (
                  <button
                    type="button"
                    className={styles.vocabCard}
                    key={item.nameEn}
                    onClick={() => setViewItem(item)}
                  >
                    <span className={styles.itemVisual}>
                      <EquipmentVisual item={item} />
                    </span>
                    <span className={styles.itemText}>
                      <span className={styles.itemEn}>{item.nameEn}</span>
                      <span className={styles.itemTh}>{item.name}</span>
                      <span style={{ fontSize: '10px', color: '#174b37', fontWeight: 600, marginTop: 2 }}>
                        {item.categoryTh || item.category || 'อุปกรณ์บนโต๊ะอาหาร'}
                        {(item.glbUrl || item.usdzUrl) ? ' • มีโมเดล 3 มิติ' : ''}
                      </span>
                    </span>
                    <span className={styles.cardArrow}>
                      <ExploreIcon name="arrow" size={16} />
                    </span>
                  </button>
                ))}
              </div>

              {filteredWeek1Equipment.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#68776f', fontSize: 13 }}>
                  ไม่พบคำศัพท์ที่ตรงกับ "{week1Search}" ในหมวดหมู่นี้
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── TAB 3: AR+AI Scan (กล้องและวิเคราะห์ภาพ) ── */}
        {activeTab === 'scan' && (
          <div className={styles.cameraLayout}>
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              padding: '12px 18px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #eaf4ee, #d8ebe1)',
              border: '1px solid #c2ded0',
              color: '#174b37',
              fontSize: '12.5px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ExploreIcon name="sparkles" size={16} />
                <span>
                  <strong>ภารกิจสัปดาห์ที่ 2:</strong> สแกนสำเร็จแล้ว{' '}
                  {WEEK2_MISSION_ITEMS.filter(i => missionProgress[i.id]?.scanned).length}/20 เมนู
                </span>
              </div>
              <button
                type="button"
                onClick={() => changeTab('week2')}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  background: '#174b37',
                  color: '#ffffff',
                  padding: '6px 14px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ดูรายการเช็คลิสต์ & ส่งงาน →
              </button>
            </div>
            <section className={styles.cameraCard}>
              <div className={styles.cameraViewport}>
                <canvas ref={canvasRef} hidden />
                {scanResult && previewImage ? (
                  <Image className={styles.cameraMedia} src={previewImage} alt="ภาพที่ใช้วิเคราะห์" fill sizes="(max-width: 860px) 100vw, 48vw" unoptimized />
                ) : (
                  <video ref={videoRef} className={styles.cameraMedia} playsInline autoPlay muted hidden={!isCameraActive} />
                )}

                {!isCameraActive && !scanResult && (
                  <div className={styles.cameraEmpty}>
                    <span className={styles.scanPickerBadge}>
                      <ExploreIcon name="scan" size={13} /> โปรดเลือก Scan
                    </span>
                    <h3>เลือกรูปแบบการสแกนที่ต้องการ</h3>
                    <p>เลือกใช้งานระหว่างโมเดล AR 3 มิติ หรือเปิดกล้อง AI สแกนวัตถุสดแบบเรียลไทม์</p>

                    <div className={styles.scanDualActions}>
                      <Link
                        href="/student/scanner"
                        className={`${styles.scanOptionBtn} ${styles.scanBtnAr}`}
                        title="เปิดกล้องสแกน QR Code เพื่อวางโมเดล AR 3 มิติเสมือนจริงบนโต๊ะ"
                      >
                        <span className={styles.scanBtnIconWrap}>
                          <ExploreIcon name="cube" size={24} />
                        </span>
                        <strong className={styles.scanBtnTitle}>AR 3D</strong>
                        <span className={styles.scanBtnDesc}>โมเดล 3 มิติเสมือนจริง</span>
                      </Link>

                      <button
                        type="button"
                        className={`${styles.scanOptionBtn} ${styles.scanBtnLive}`}
                        onClick={() => void startCamera()}
                        title="เปิดกล้องสแกนวัตถุและเมนูอาหารสดแบบเรียลไทม์ด้วย AI"
                      >
                        <span className={styles.scanBtnIconWrap}>
                          <ExploreIcon name="sparkles" size={24} />
                        </span>
                        <strong className={styles.scanBtnTitle}>AI Live</strong>
                        <span className={styles.scanBtnDesc}>สแกนวัตถุสดเรียลไทม์</span>
                      </button>
                    </div>

                    <div className={styles.scanSecondaryRow}>
                      <span>หรือ</span>
                      <button
                        type="button"
                        className={styles.scanTextLink}
                        onClick={() => fileInputRef.current?.click()}
                        title="เลือกรูปภาพจากเครื่องเพื่อวิเคราะห์"
                      >
                        <ExploreIcon name="upload" size={12} /> อัปโหลดรูปภาพ
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        className={styles.scanTextLink}
                        onClick={() => setShowFallbackModal(true)}
                        title="เลือกวัตถุจากคลังเพื่อจำลองผลสแกน"
                      >
                        <ExploreIcon name="layers" size={12} /> โหมดจำลอง
                      </button>
                    </div>
                  </div>
                )}

                {isCameraActive && !scanResult && (
                  <>
                    <div className={styles.cameraTop}>
                      <span className={styles.statusBadge}>
                        <span className={styles.statusDot} />
                        กล้อง AI Scan พร้อมทำงาน
                      </span>
                      <button
                        type="button"
                        onClick={stopCamera}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '5px 12px',
                          borderRadius: 999,
                          background: 'rgba(0, 0, 0, 0.45)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          fontSize: '11px',
                          cursor: 'pointer',
                          backdropFilter: 'blur(8px)',
                        }}
                        title="ปิดกล้องและกลับสู่หน้าเลือกรูปแบบ Scan"
                      >
                        ✕ ปิดกล้อง
                      </button>
                    </div>
                    <div className={styles.scanCorners} />
                    {scanAnim && <div className={styles.scanLine} />}

                    <div className={styles.cameraBottom}>
                      <button
                        type="button"
                        className={`${styles.primaryButton} ${styles.analyzeButton} ${scanAnim ? styles.buttonDisabled : ''}`}
                        disabled={scanAnim}
                        onClick={() => void captureFrame()}
                      >
                        <ExploreIcon name={scanAnim ? 'refresh' : 'scan'} size={18} />
                        {scanAnim ? 'AI กำลังวิเคราะห์ภาพ...' : 'สแกนและวิเคราะห์ทันที'}
                      </button>
                    </div>
                  </>
                )}

                {scanError && (
                  <div className={styles.errorBanner}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ExploreIcon name="alert" size={17} /> <span>{scanError}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.errorFallbackAction}
                      onClick={() => setShowFallbackModal(true)}
                    >
                      ⚡ คลิกเปิดโหมดจำลอง (เลือกวัตถุเพื่อทำภารกิจต่อ)
                    </button>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={event => void handleFileChange(event)} />
            </section>

            <section className={`${styles.panel} ${styles.resultPanel}`}>
              {!scanResult ? (
                <div className={styles.resultEmpty}>
                  <span className={styles.resultEmptyIcon}><ExploreIcon name="sparkles" size={30} /></span>
                  <h3>ผลวิเคราะห์จะแสดงที่นี่</h3>
                  <p>จัดวัตถุให้อยู่กลางภาพ มีแสงเพียงพอ หรือใช้โหมดเลือกวัตถุจำลอง (Fallback Scan) เพื่อเรียนรู้ได้ทันที</p>
                </div>
              ) : (
                <div className={styles.resultContent}>
                  {/* Action Bar: Return to Real-time Live Camera Scan */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setScanResult(null)
                        setLiveDetected(null)
                        void startCamera()
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 10,
                        background: '#184735',
                        color: '#ffffff',
                        border: '1px solid #13392a',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <ExploreIcon name="camera" size={15} /> 🔄 สแกนวัตถุชิ้นอื่นต่อไป (กลับสู่กล้องสดเรียลไทม์)
                    </button>
                  </div>

                  <header className={styles.resultHeader}>
                    <span className={styles.headingIcon}><ExploreIcon name="cube" /></span>
                    <div className={styles.resultHeaderText}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h2 className={styles.resultName}>{resultName}</h2>
                        {scanResult.is_fallback && (
                          <span className={styles.fallbackBadge} title={scanResult.fallback_reason || 'ระบบสำรองบทเรียน FINE Model'}>
                            💡 ระบบสำรอง (Curriculum Fallback)
                          </span>
                        )}
                      </div>
                      <p className={styles.resultThai}>{resultThai}</p>
                    </div>
                    {scanResult.confidence != null && <span className={styles.confidence}>{Math.round(scanResult.confidence)}% มั่นใจ</span>}
                    <button type="button" className={styles.iconButton} aria-label="ฟังชื่อภาษาอังกฤษ" onClick={() => speak(resultName, 'result-name')}><ExploreIcon name="volume" size={17} /></button>
                  </header>

                  {scanResult.is_fallback && (
                    <div className={styles.fallbackNotice}>
                      <ExploreIcon name="sparkles" size={16} />
                      <div>
                        <strong>ระบบสำรองบทเรียน FINE Model กำลังทำงาน:</strong> ตรวจพบโควต้า AI มีคำขอหนาแน่นชั่วคราว ระบบดึงข้อมูลจากคลังหลักสูตรมาตรฐาน เพื่อให้นักเรียนสามารถฝึกพูด ฟังเสียง ทบทวน และส่งงานสัปดาห์ที่ 2 ได้อย่างราบรื่น
                      </div>
                    </div>
                  )}

                  <div className={styles.fineTabs}>
                    {FINE_TABS.map(tab => (
                      <button type="button" key={tab.id} className={`${styles.fineTab} ${fineTab === tab.id ? styles.fineTabActive : ''}`} onClick={() => setFineTab(tab.id)}>
                        {tab.id} · {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className={styles.fineBody}>
                    {fineTab === 'F' && <>
                      <div className={styles.infoCard}><div className={styles.infoLabel}><ExploreIcon name="info" size={15} /> รายละเอียดและการใช้งาน</div><p>{scanResult.fine_analysis?.familiarize?.desc || scanResult.description || scanResult.use || 'ยังไม่มีรายละเอียดสำหรับวัตถุนี้'}</p></div>
                      <div className={`${styles.infoCard} ${styles.infoCardGold}`}><div className={styles.infoLabel}><ExploreIcon name="location" size={15} /> ตำแหน่งที่พบหรือจัดวาง</div><p>{scanResult.fine_analysis?.familiarize?.location || scanResult.location || 'ยังไม่มีข้อมูลตำแหน่ง'}</p></div>
                    </>}

                    {fineTab === 'I' && <>
                      <div className={styles.infoCard}><div className={styles.infoLabel}><ExploreIcon name="mic" size={15} /> การออกเสียง</div><p>{scanResult.fine_analysis?.interact?.pronunciation || scanResult.pronounce || resultName}</p></div>
                      {(phrases.length ? phrases : [practicePhrase]).map((phrase, index) => (
                        <div className={styles.phrase} key={`${phrase}-${index}`}><span>{phrase}</span><button type="button" className={styles.iconButton} aria-label="ฟังประโยค" onClick={() => speak(phrase, `phrase-${index}`)}><ExploreIcon name="volume" size={16} /></button></div>
                      ))}
                      <button type="button" className={styles.ghostButton} style={{ width: '100%', marginTop: 10 }} onClick={() => isRecording ? recognitionRef.current?.stop() : startSpeechPractice(practicePhrase)}>
                        <ExploreIcon name={isRecording ? 'pause' : 'mic'} size={16} /> {isRecording ? 'หยุดบันทึกเสียง' : 'บันทึกเสียงและประเมิน'}
                      </button>
                      {speechScore != null && <div className={styles.score}>{speechScore}%</div>}
                    </>}

                    {fineTab === 'N' && <>
                      {(scanResult.fine_analysis?.navigate?.service_steps || []).length ? (
                        (scanResult.fine_analysis?.navigate?.service_steps || []).map((step, index) => <div className={styles.infoCard} key={step}><div className={styles.infoLabel}><span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span> ขั้นตอนการปฏิบัติ</div><p>{step}</p></div>)
                      ) : <div className={styles.infoCard}><p>{scanResult.service_tips || scanResult.tips || 'ยังไม่มีขั้นตอนแนะนำเพิ่มเติม'}</p></div>}
                      {scanResult.fine_analysis?.navigate?.safety_rules && <div className={`${styles.infoCard} ${styles.infoCardGold}`}><div className={styles.infoLabel}><ExploreIcon name="shield" size={15} /> ความปลอดภัยและสุขอนามัย</div><p>{scanResult.fine_analysis.navigate.safety_rules}</p></div>}
                    </>}

                    {fineTab === 'E' && (
                      scanResult.fine_analysis?.exhibit?.quiz_question ? <div className={styles.infoCard}>
                        <div className={styles.infoLabel}><ExploreIcon name="check" size={15} /> คำถามทบทวน</div>
                        <p>{scanResult.fine_analysis.exhibit.quiz_question}</p>
                        {(scanResult.fine_analysis.exhibit.quiz_options || []).map(option => {
                          const correct = option === scanResult.fine_analysis?.exhibit?.correct_answer
                          const selected = option === quizSelected
                          const stateClass = quizAnswered && correct ? styles.quizCorrect : quizAnswered && selected ? styles.quizWrong : ''
                          return <button type="button" className={`${styles.quizOption} ${stateClass}`} key={option} disabled={quizAnswered} onClick={() => { setQuizSelected(option); setQuizAnswered(true) }}><ExploreIcon name={quizAnswered && correct ? 'check' : 'info'} size={15} /> {option}</button>
                        })}
                      </div> : <div className={styles.infoCard}><p>ผลวิเคราะห์นี้ยังไม่มีคำถามทบทวน</p></div>
                    )}
                  </div>

                  <div className={styles.resultActions}>
                    {matchedModelId ? <Link className={styles.primaryButton} href={`/student/ar-view?id=${matchedModelId}`}><ExploreIcon name="cube" size={16} /> เปิดโมเดล AR</Link> : <button type="button" className={`${styles.ghostButton} ${styles.buttonDisabled}`} disabled><ExploreIcon name="cube" size={16} /> ยังไม่มีโมเดล AR</button>}
                    <Link className={styles.ghostButton} href={`/chat?q=${encodeURIComponent(`ช่วยแนะนำคำศัพท์และประโยคงานบริการสำหรับ "${resultName}"`)}`}><ExploreIcon name="message" size={16} /> ถามผู้ช่วย AI</Link>
                    <button type="button" className={styles.ghostButton} onClick={resetScan}><ExploreIcon name="refresh" size={16} /> สแกนใหม่</button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {showVocabulary && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setShowVocabulary(false)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="vocabulary-title" onMouseDown={event => event.stopPropagation()}>
            <header className={styles.modalHeader}><div><h3 id="vocabulary-title">คลังคำศัพท์ทั้งหมด</h3><p>{equipment.length} คำจากบทเรียนและข้อมูลที่ครูเพิ่ม</p></div><button type="button" className={styles.iconButton} aria-label="ปิด" onClick={() => setShowVocabulary(false)}><ExploreIcon name="close" size={17} /></button></header>
            <div className={`${styles.modalList} ${styles.hideScrollbar}`}>
              {visibleVocabulary.map(item => (
                <div
                  className={styles.vocabCard}
                  key={item.nameEn}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setViewItem(item); setShowVocabulary(false) }}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      setViewItem(item)
                      setShowVocabulary(false)
                    }
                  }}
                >
                  <span className={styles.itemVisual}><EquipmentVisual item={item} /></span>
                  <span className={styles.itemText}><span className={styles.itemEn}>{item.nameEn}</span><span className={styles.itemTh}>{item.name}</span></span>
                  <button type="button" className={styles.iconButton} aria-label={`ฟัง ${item.nameEn}`} onClick={event => { event.stopPropagation(); speak(item.nameEn, `all-${item.nameEn}`) }}><ExploreIcon name="volume" size={15} /></button>
                </div>
              ))}
              {visibleCount < equipment.length && <button type="button" className={`${styles.ghostButton} ${styles.loadMore}`} onClick={() => setVisibleCount(count => count + 40)}>แสดงเพิ่มอีก {Math.min(40, equipment.length - visibleCount)} คำ</button>}
            </div>
          </section>
        </div>
      )}

      {viewItem && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setViewItem(null)}>
          <section className={`${styles.modal} ${styles.modalSmall}`} role="dialog" aria-modal="true" aria-labelledby="detail-title" onMouseDown={event => event.stopPropagation()}>
            <header className={styles.modalHeader}><div><h3 id="detail-title">รายละเอียดคำศัพท์</h3><p>ฟัง ออกเสียง และนำไปใช้ในงานบริการ</p></div><button type="button" className={styles.iconButton} aria-label="ปิด" onClick={() => setViewItem(null)}><ExploreIcon name="close" size={17} /></button></header>
            <div className={styles.detailBody}>
              <div className={styles.detailTop}><span className={styles.itemVisual}><EquipmentVisual item={viewItem} size={27} /></span><div><h3>{viewItem.nameEn}</h3><p>{viewItem.name}</p></div></div>
              <div className={styles.infoCard}><div className={styles.infoLabel}><ExploreIcon name="info" size={15} /> วิธีใช้งาน</div><p>{viewItem.use}</p></div>
              <div className={`${styles.infoCard} ${styles.infoCardGold}`}><div className={styles.infoLabel}><ExploreIcon name="message" size={15} /> ประโยคตัวอย่าง</div><p>{viewItem.sentence}</p></div>
              <div className={styles.detailActions}>
                <button type="button" className={styles.ghostButton} onClick={() => speak(viewItem.nameEn, 'detail-name')}><ExploreIcon name="volume" size={16} /> ฟังชื่อ</button>
                <button type="button" className={styles.primaryButton} onClick={() => speak(viewItem.sentence, 'detail-sentence')}><ExploreIcon name="volume" size={16} /> ฟังประโยค</button>
                {(viewItem.modelId || viewItem.id || viewItem.glbUrl || viewItem.usdzUrl) && (
                  <Link
                    href={viewItem.modelId || viewItem.id ? `/student/ar-view?id=${encodeURIComponent(viewItem.modelId || viewItem.id || '')}` : `/student/ar-view?nameEn=${encodeURIComponent(viewItem.nameEn)}&nameTh=${encodeURIComponent(viewItem.name)}`}
                    className={styles.primaryButton}
                    style={{ gridColumn: '1 / -1', marginTop: 6 }}
                  >
                    <ExploreIcon name="cube" size={16} /> ดูโมเดล AR 3D
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {showFallbackModal && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setShowFallbackModal(false)}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fallback-modal-title"
            onMouseDown={event => event.stopPropagation()}
            style={{ maxWidth: 680 }}
          >
            <header className={styles.modalHeader}>
              <div>
                <h3 id="fallback-modal-title">โหมดสแกนจำลอง (Fallback Simulator)</h3>
                <p>เลือกอุปกรณ์หรือเมนูอาหารเพื่อจำลองการสแกนและบันทึกผลการเรียนรู้ได้ทันที</p>
              </div>
              <button type="button" className={styles.iconButton} aria-label="ปิด" onClick={() => setShowFallbackModal(false)}>
                <ExploreIcon name="close" size={17} />
              </button>
            </header>

            {/* Filter Tabs & Search */}
            <div style={{ padding: '14px 18px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="search"
                placeholder="ค้นหาชื่ออุปกรณ์หรือเมนูอาหาร (เช่น Fork, Caesar Salad, Ribeye, ซุป)..."
                value={fallbackSearch}
                onChange={e => setFallbackSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid #c9d5ce',
                  fontSize: 13,
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'ทั้งหมด' },
                  { id: 'WEEK1', label: 'สัปดาห์ที่ 1: อุปกรณ์บนโต๊ะอาหาร (51)' },
                  { id: 'WEEK2', label: 'สัปดาห์ที่ 2: เมนูอาหารและเครื่องดื่ม (20)' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFallbackFilter(tab.id as 'ALL' | 'WEEK1' | 'WEEK2')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 99,
                      border: '1px solid',
                      borderColor: fallbackFilter === tab.id ? '#174b37' : '#d2ded7',
                      background: fallbackFilter === tab.id ? '#174b37' : '#ffffff',
                      color: fallbackFilter === tab.id ? '#ffffff' : '#415247',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fallbackModalGrid} style={{ margin: '8px 18px 18px' }}>
              {filteredFallbackItems.map(item => (
                <div
                  key={item.nameEn}
                  className={styles.fallbackItemCard}
                  onClick={() => void triggerFallbackScan(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') void triggerFallbackScan(item)
                  }}
                >
                  <span className={styles.fallbackItemEmoji}>{item.emoji || '🍽️'}</span>
                  <div className={styles.fallbackItemInfo}>
                    <h5 className={styles.fallbackItemNameEn}>{item.nameEn}</h5>
                    <p className={styles.fallbackItemNameTh}>{item.nameTh || item.name}</p>
                    <span className={styles.fallbackItemBadge}>{item.categoryTh || 'บทเรียน FINE'}</span>
                  </div>
                </div>
              ))}
              {filteredFallbackItems.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px 0', color: '#7a857e', fontSize: 13 }}>
                  ไม่พบรายการที่ตรงกับ &quot;{fallbackSearch}&quot;
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <span className="sr-only" aria-live="polite">{speaking ? 'กำลังเล่นเสียง' : ''}</span>
    </main>
  )
}
