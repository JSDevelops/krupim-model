'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { authenticatedFetch } from '@/lib/api'
import { analyzeImage as analyzeImageAPI } from '@/lib/gemini'
import { toast } from 'sonner'
import ExploreIcon from './ExploreIcon'
import styles from './explore.module.css'

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
  description?: string
  use?: string
  location?: string
  service_tips?: string
  tips?: string
  sentence?: string
  pronounce?: string
  confidence?: number
  english_phrases?: string[]
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
  const [activeTab, setActiveTab] = useState<'library' | 'scan'>('library')
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

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)
  const autoScanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const requestPendingRef = useRef(false)
  const equipmentRef = useRef<Equipment[]>([])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mode') !== 'scan') return
    const timer = window.setTimeout(() => setActiveTab('scan'), 0)
    return () => window.clearTimeout(timer)
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
        const items = [...merged.values()]
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
  }, [stopCamera])

  async function analyzeImage(base64: string, mimeType: string, image?: string) {
    setScanAnim(true)
    setScanError('')
    try {
      const result = await analyzeImageAPI(base64, mimeType) as ScanResult
      if (!result) throw new Error('ระบบ AI ไม่ส่งผลการวิเคราะห์กลับมา')
      applyScanResult(result, image)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถวิเคราะห์รูปภาพได้'
      const normalized = message.toLowerCase()
      if (normalized.includes('429') || normalized.includes('quota') || normalized.includes('rate limit')) {
        setScanError('ระบบ AI มีคำขอจำนวนมาก กรุณารอประมาณ 1 นาทีแล้วลองใหม่')
      } else if (normalized.includes('api key') || normalized.includes('unauthorized') || normalized.includes('403')) {
        setScanError('การตั้งค่าผู้ให้บริการ AI ไม่สมบูรณ์ กรุณาแจ้งผู้ดูแลระบบ')
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

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    requestPendingRef.current = true
    try {
      const result = await analyzeImageAPI(dataUrl.slice(dataUrl.indexOf(',') + 1), 'image/jpeg') as ScanResult
      if ((result.confidence || 0) >= 60) applyScanResult(result, dataUrl)
    } catch (error) {
      console.warn('Auto scan frame failed:', error)
    } finally {
      requestPendingRef.current = false
    }
  }, [activeTab, applyScanResult, scanAnim, scanResult])

  useEffect(() => {
    if (isCameraActive && autoScan && activeTab === 'scan' && !scanResult) {
      autoScanTimerRef.current = setInterval(() => void captureAutoFrame(), 8000)
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
    await analyzeImage(dataUrl.slice(dataUrl.indexOf(',') + 1), 'image/jpeg', dataUrl)
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const prepared = await prepareImageForScan(file)
      await analyzeImage(prepared.base64, prepared.mimeType, prepared.dataUrl)
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
  }

  function changeTab(tab: 'library' | 'scan') {
    if (tab === 'library') {
      setAutoScan(false)
      stopCamera()
    }
    setActiveTab(tab)
  }

  function speak(text: string, id: string) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
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
    setSpeechScore(targetWords.length ? Math.round((matched / targetWords.length) * 100) : 0)
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

        <div className={styles.tabs} role="tablist" aria-label="โหมดสำรวจ">
          <button type="button" role="tab" aria-selected={activeTab === 'library'} className={`${styles.tab} ${activeTab === 'library' ? styles.tabActive : ''}`} onClick={() => changeTab('library')}>
            <ExploreIcon name="book" size={18} /> คลังคำศัพท์
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'scan'} className={`${styles.tab} ${activeTab === 'scan' ? styles.tabActive : ''}`} onClick={() => changeTab('scan')}>
            <ExploreIcon name="camera" size={18} /> AI Scan
          </button>
        </div>

        {activeTab === 'library' ? (
          <div className={styles.contentGrid}>
            <section className={styles.panel}>
              <header className={styles.panelHeader}>
                <div className={styles.headingGroup}>
                  <span className={styles.headingIcon}><ExploreIcon name="layers" /></span>
                  <div><h2 className={styles.panelTitle}>คำศัพท์แนะนำ</h2><p className={styles.panelDesc}>เลือกคำศัพท์เพื่อดูวิธีใช้และประโยคตัวอย่าง</p></div>
                </div>
                <button type="button" className={styles.textButton} onClick={() => { setVisibleCount(40); setShowVocabulary(true) }}>
                  ดูทั้งหมด <ExploreIcon name="arrow" size={14} />
                </button>
              </header>
              <div className={styles.vocabGrid}>
                {featuredItems.map(item => (
                  <button type="button" className={styles.vocabCard} key={item.nameEn} onClick={() => setViewItem(item)}>
                    <span className={styles.itemVisual}><EquipmentVisual item={item} /></span>
                    <span className={styles.itemText}><span className={styles.itemEn}>{item.nameEn}</span><span className={styles.itemTh}>{item.name}</span></span>
                    <span className={styles.cardArrow}><ExploreIcon name="arrow" size={16} /></span>
                  </button>
                ))}
              </div>
            </section>

            <aside className={`${styles.panel} ${styles.guide}`}>
              <div className={styles.headingGroup}>
                <span className={styles.headingIcon}><ExploreIcon name="lightbulb" /></span>
                <div><h2 className={styles.panelTitle}>เริ่มเรียนรู้อย่างไร</h2><p className={styles.panelDesc}>ใช้เวลาไม่กี่นาทีต่อหนึ่งคำศัพท์</p></div>
              </div>
              <div className={styles.steps}>
                {[
                  ['01', 'เลือกอุปกรณ์', 'เปิดดูชื่อภาษาอังกฤษและความหมายภาษาไทย'],
                  ['02', 'ฟังการออกเสียง', 'กดฟังชื่อหรือประโยคตัวอย่างได้ทันที'],
                  ['03', 'นำไปใช้จริง', 'ศึกษาวิธีใช้และฝึกพูดในบริบทงานบริการ'],
                ].map(([number, title, detail]) => (
                  <div className={styles.step} key={number}><span className={styles.stepNumber}>{number}</span><div><strong>{title}</strong><p>{detail}</p></div></div>
                ))}
              </div>
            </aside>
          </div>
        ) : (
          <div className={styles.cameraLayout}>
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
                    <span className={styles.cameraEmptyIcon}><ExploreIcon name="camera" size={34} /></span>
                    <h3>กล้องจะเปิดเมื่อคุณอนุญาต</h3>
                    <p>ระบบไม่เปิดกล้องอัตโนมัติ ช่วยประหยัดแบตเตอรี่และรักษาความเป็นส่วนตัว คุณสามารถเลือกอัปโหลดรูปแทนได้</p>
                    <div className={styles.cameraActions}>
                      <button type="button" className={styles.primaryButton} onClick={() => void startCamera()}><ExploreIcon name="camera" size={17} /> เปิดกล้อง</button>
                      <button type="button" className={styles.secondaryButton} onClick={() => fileInputRef.current?.click()}><ExploreIcon name="upload" size={17} /> เลือกรูปภาพ</button>
                    </div>
                  </div>
                )}

                {isCameraActive && !scanResult && (
                  <>
                    <div className={styles.cameraTop}>
                      <span className={styles.statusBadge}><span className={styles.statusDot} /> กล้องพร้อมใช้งาน</span>
                      <button type="button" className={`${styles.autoButton} ${autoScan ? styles.autoActive : ''}`} onClick={() => setAutoScan(value => !value)}>
                        <ExploreIcon name="scan" size={14} /> สแกนอัตโนมัติ {autoScan ? 'เปิด' : 'ปิด'}
                      </button>
                    </div>
                    <div className={styles.scanCorners} />
                    {scanAnim && <div className={styles.scanLine} />}
                    <div className={styles.cameraBottom}>
                      <button type="button" className={`${styles.primaryButton} ${styles.analyzeButton} ${scanAnim ? styles.buttonDisabled : ''}`} disabled={scanAnim} onClick={() => void captureFrame()}>
                        <ExploreIcon name={scanAnim ? 'refresh' : 'scan'} size={18} /> {scanAnim ? 'กำลังวิเคราะห์...' : 'ถ่ายภาพและวิเคราะห์'}
                      </button>
                    </div>
                  </>
                )}

                {scanError && <div className={styles.errorBanner}><ExploreIcon name="alert" size={17} /> <span>{scanError}</span></div>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={event => void handleFileChange(event)} />
            </section>

            <section className={`${styles.panel} ${styles.resultPanel}`}>
              {!scanResult ? (
                <div className={styles.resultEmpty}>
                  <span className={styles.resultEmptyIcon}><ExploreIcon name="sparkles" size={30} /></span>
                  <h3>ผลวิเคราะห์จะแสดงที่นี่</h3>
                  <p>จัดวัตถุให้อยู่กลางภาพ มีแสงเพียงพอ และหลีกเลี่ยงฉากหลังที่มีรายละเอียดมากเกินไป</p>
                </div>
              ) : (
                <div className={styles.resultContent}>
                  <header className={styles.resultHeader}>
                    <span className={styles.headingIcon}><ExploreIcon name="cube" /></span>
                    <div className={styles.resultHeaderText}><h2 className={styles.resultName}>{resultName}</h2><p className={styles.resultThai}>{resultThai}</p></div>
                    {scanResult.confidence != null && <span className={styles.confidence}>{Math.round(scanResult.confidence)}% มั่นใจ</span>}
                    <button type="button" className={styles.iconButton} aria-label="ฟังชื่อภาษาอังกฤษ" onClick={() => speak(resultName, 'result-name')}><ExploreIcon name="volume" size={17} /></button>
                  </header>

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

      <span className="sr-only" aria-live="polite">{speaking ? 'กำลังเล่นเสียง' : ''}</span>
    </main>
  )
}
