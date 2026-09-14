'use client'

import Link from 'next/link'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { localData } from '@/lib/localData'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import StudentIcon from '../StudentIcon'
import styles from './ar-view.module.css'

// ─── Types ────────────────────────────────────────────────────
type ARModel = {
  id: string
  nameEn: string
  nameTh: string
  desc: string
  glbUrl: string
  usdzUrl?: string
  pronounce?: string
  sentence?: string
}

type RecognitionResultEvent = { results: ArrayLike<{ 0: { transcript: string } }> }
type Recognition = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: RecognitionResultEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
}
type RecognitionConstructor = new () => Recognition

/** AR support state: null = not yet detected, true/false = result */
type ARSupport =
  | { checked: false }
  | { checked: true; webxr: boolean; quicklook: boolean }

// ─── Constants ───────────────────────────────────────────────
const FALLBACK_MODEL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
const DISTRACTORS = [
  'จานสลัดเดี่ยว', 'ช้อนตักแกง', 'ถ้วยน้ำจิ้ม', 'มีดหั่นเนื้อสเต็ก',
  'แก้วเครื่องดื่มค็อกเทล', 'ถาดไม้วางจาน', 'ผ้าเช็ดปากลูกค้า',
  'เหยือกแก้วใส่น้ำ', 'ที่เปิดขวดไวน์', 'ชามใส่สลัดผัก',
]

// ─── Helpers ─────────────────────────────────────────────────
function mapRow(row: Record<string, unknown>): ARModel {
  return {
    id: String(row.id || ''),
    nameEn: String(row.name_en || row.nameEn || ''),
    nameTh: String(row.name_th || row.nameTh || ''),
    desc: String(row.description || row.desc || row.use_desc || ''),
    glbUrl: String(row.glb_url || row.glbUrl || FALLBACK_MODEL),
    usdzUrl: String(row.usdz_url || row.usdzUrl || ''),
    pronounce: String(row.pronounce || ''),
    sentence: String(row.sentence || row.service_tips || ''),
  }
}

function buildOptions(answer: string) {
  const wrong = DISTRACTORS.filter(item => item !== answer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
  return [answer, ...wrong].sort(() => Math.random() - 0.5)
}

/**
 * Detect whether this device & browser can use AR.
 * - WebXR (immersive-ar): Android Chrome 81+
 * - Quick Look: iOS Safari (detected by checking the 'ar' attribute support on <a>)
 */
async function detectARSupport(): Promise<{ webxr: boolean; quicklook: boolean }> {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  // iOS Quick Look: only Safari supports it. Detect via <a rel="ar"> support.
  const quicklook = isIOS && isSafari && (() => {
    const anchor = document.createElement('a')
    return anchor.relList.supports('ar')
  })()

  // WebXR: try the XR API
  let webxr = false
  try {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      webxr = await (navigator as Navigator & { xr: { isSessionSupported(mode: string): Promise<boolean> } })
        .xr.isSessionSupported('immersive-ar')
    }
  } catch {
    webxr = false
  }

  return { webxr, quicklook }
}

/**
 * Returns a user-facing AR button label based on platform capabilities.
 */
function arButtonLabel(support: ARSupport, hasUsdz: boolean): string {
  if (!support.checked) return 'วางโมเดลในพื้นที่จริง'
  if (support.quicklook && hasUsdz) return 'เปิด AR ด้วย Quick Look (iOS)'
  if (support.webxr) return 'เปิด AR ด้วย Scene Viewer (Android)'
  return 'วางโมเดลในพื้นที่จริง'
}

/** True when AR is possible on this device */
function isARAvailable(support: ARSupport, hasUsdz: boolean): boolean {
  if (!support.checked) return true // optimistically show until checked
  return support.webxr || (support.quicklook && hasUsdz)
}

// ─── ARViewerContent (needs Suspense for useSearchParams) ─────
function ARViewerContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''

  const [model, setModel] = useState<ARModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [modelProgress, setModelProgress] = useState(0) // 0–100
  const [arSupport, setArSupport] = useState<ARSupport>({ checked: false })

  // Speech practice
  const [speechOpen, setSpeechOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [spokenText, setSpokenText] = useState('')
  const [speechScore, setSpeechScore] = useState<number | null>(null)

  // Quiz
  const [quizOpen, setQuizOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  const options = useMemo(() => model ? buildOptions(model.nameTh) : [], [model])

  // Ref to the model-viewer DOM element (for progress events)
  const viewerRef = useRef<HTMLElement | null>(null)
  // Ref for iOS AR anchor (Quick Look fallback)
  const iosArRef = useRef<HTMLAnchorElement | null>(null)

  // ─── 1. Detect AR support after mount ─────────────────────
  useEffect(() => {
    void detectARSupport().then(result => setArSupport({ checked: true, ...result }))
  }, [])

  // ─── 2. HTTPS guard ───────────────────────────────────────
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      toast.warning(
        'AR ต้องการ HTTPS — กรุณาเปิดผ่าน Vercel URL หรือ ngrok เพื่อใช้งาน AR บนมือถือ',
        { duration: 8000 },
      )
    }
  }, [])

  // ─── 3. Load model data ───────────────────────────────────
  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setModelProgress(0)
      if (!id && !searchParams.get('nameEn')) {
        if (active) setLoading(false)
        return
      }
      try {
        if (id) {
          for (const table of ['ar_items', 'vocabulary_items', 'ai_scan_items'] as const) {
            const { data, error } = await localData.from(table).select('*').eq('id', id).single()
            if (data && !error) {
              if (active) setModel(mapRow(data as Record<string, unknown>))
              return
            }
          }
          // Legacy vocabulary store
          const { data } = await localData.from('fine_lesson_plans').select('vocabulary').eq('id', 'ar-items-store').single()
          const legacy = Array.isArray(data?.vocabulary)
            ? data.vocabulary.find((item: { id?: string }) => item.id === id)
            : null
          if (legacy) {
            if (active) setModel(mapRow(legacy as Record<string, unknown>))
            return
          }
        }
        // Fallback: inline query params
        const nameEn = searchParams.get('nameEn')
        if (nameEn && active) {
          setModel({
            id,
            nameEn,
            nameTh: searchParams.get('nameTh') || '',
            desc: searchParams.get('desc') || '',
            glbUrl: searchParams.get('glbUrl') || FALLBACK_MODEL,
            usdzUrl: searchParams.get('usdzUrl') || '',
            pronounce: searchParams.get('pronounce') || '',
            sentence: searchParams.get('sentence') || '',
          })
        }
      } catch (error) {
        console.warn('Unable to load AR model:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
      window.speechSynthesis?.cancel()
    }
  }, [id, searchParams])

  // ─── 4. model-viewer progress & AR events ────────────────
  // We attach events to the <model-viewer> element via its ref callback.
  const attachViewerEvents = useCallback((el: HTMLElement | null) => {
    viewerRef.current = el
    if (!el) return

    // GLB loading progress
    const onProgress = (event: Event) => {
      const progress = (event as CustomEvent<{ totalProgress: number }>).detail?.totalProgress ?? 0
      setModelProgress(Math.round(progress * 100))
    }

    // AR session started/ended
    const onARStatus = (event: Event) => {
      const status = (event as CustomEvent<{ status: string }>).detail?.status
      if (status === 'failed') {
        toast.error('ไม่สามารถเปิด AR ได้ กรุณาตรวจสอบสิทธิ์กล้องและเปิดผ่าน HTTPS')
      }
    }

    el.addEventListener('progress', onProgress)
    el.addEventListener('ar-status', onARStatus)
    return () => {
      el.removeEventListener('progress', onProgress)
      el.removeEventListener('ar-status', onARStatus)
    }
  }, [])

  // ─── 5. iOS Quick Look: activate via hidden <a rel="ar"> ─
  // On iOS Safari, model-viewer's AR button works but as a safety net we
  // also provide a direct anchor. The viewer itself handles it via slot.
  const handleIOSARFallback = useCallback(() => {
    if (iosArRef.current) {
      iosArRef.current.click()
    }
  }, [])

  // ─── 6. Speech practice ──────────────────────────────────
  function speak(text: string) {
    if (!('speechSynthesis' in window)) return toast.warning('เบราว์เซอร์นี้ไม่รองรับการออกเสียง')
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    const voices = window.speechSynthesis.getVoices()
    utterance.voice =
      voices.find(v => v.lang.startsWith('en') && /Google|Natural/.test(v.name)) ||
      voices.find(v => v.lang.startsWith('en')) ||
      null
    window.speechSynthesis.speak(utterance)
  }

  function startSpeech() {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: RecognitionConstructor
      webkitSpeechRecognition?: RecognitionConstructor
    }
    const Constructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Constructor) return toast.warning('กรุณาใช้ Chrome หรือ Safari เวอร์ชันล่าสุดเพื่อฝึกออกเสียง')
    setSpeechOpen(true)
    setListening(true)
    setSpokenText('')
    setSpeechScore(null)
    const recognition = new Constructor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = event => {
      const transcript = event.results[0]?.[0]?.transcript || ''
      const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
      const targetWords = normalize(model?.nameEn || '').split(' ').filter(Boolean)
      const spokenWords = normalize(transcript).split(' ').filter(Boolean)
      setSpokenText(transcript)
      setSpeechScore(
        targetWords.length
          ? Math.round(targetWords.filter(word => spokenWords.includes(word)).length / targetWords.length * 100)
          : 0,
      )
    }
    recognition.onerror = () => {
      setListening(false)
      toast.error('ไม่สามารถรับเสียงได้ กรุณาตรวจสอบสิทธิ์ไมโครโฟน')
    }
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  // ─── 7. Quiz ──────────────────────────────────────────────
  async function answerQuiz() {
    if (!selected || !model) return
    setAnswered(true)
    if (selected === model.nameTh) {
      toast.success('ตอบถูกต้อง บันทึกคะแนนแล้ว')
      try {
        await authenticatedFetch('/api/student/exhibit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: 100, total: 100 }),
        })
      } catch { /* retry from exhibit page */ }
    }
  }

  // ─── Derived ─────────────────────────────────────────────
  const hasUsdz = Boolean(model?.usdzUrl)
  const arAvailable = isARAvailable(arSupport, hasUsdz)
  const arLabel = arButtonLabel(arSupport, hasUsdz)
  const isLoadingModel = modelProgress > 0 && modelProgress < 100

  // ─── States ──────────────────────────────────────────────
  if (loading) {
    return (
      <main className={styles.statePage}>
        <span className={styles.stateIcon}><StudentIcon name="refresh" size={28} /></span>
        <strong>กำลังเตรียมโมเดล 3 มิติ</strong>
        <p>การดาวน์โหลดอาจใช้เวลาสักครู่ตามความเร็วอินเทอร์เน็ต</p>
      </main>
    )
  }

  if (!model) {
    return (
      <main className={styles.statePage}>
        <span className={styles.errorIcon}><StudentIcon name="info" size={28} /></span>
        <strong>ไม่พบโมเดล 3 มิติ</strong>
        <p>QR Code อาจไม่ถูกต้อง หรือโมเดลถูกนำออกจากบทเรียนแล้ว</p>
        <Link className={styles.primaryButton} href="/student/scanner">
          <StudentIcon name="camera" size={17} />
          กลับไปสแกนใหม่
        </Link>
      </main>
    )
  }

  // ─── Main render ─────────────────────────────────────────
  return (
    <main className={styles.page}>
      {/* ─── 3D viewer section ─────────────────────────── */}
      <section className={styles.viewer} aria-label={`โมเดล 3 มิติ ${model.nameEn}`}>

        {/* GLB loading progress bar (visible while model-viewer streams the file) */}
        {isLoadingModel && (
          <div
            className={styles.loadingBar}
            role="progressbar"
            aria-valuenow={modelProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`กำลังโหลดโมเดล ${modelProgress}%`}
          >
            <span style={{ width: `${modelProgress}%` }} />
          </div>
        )}

        {/*
          model-viewer web component.
          - ar-modes priority: webxr (Android) → scene-viewer (Android fallback) → quick-look (iOS)
          - ios-src: USDZ path required for Quick Look on iOS Safari
          - xr-environment: shows real-world shadows in WebXR sessions
          - shadow-intensity / shadow-softness: realistic shadows
        */}
        <model-viewer
          ref={attachViewerEvents as unknown as React.Ref<HTMLElement>}
          src={model.glbUrl}
          ios-src={hasUsdz ? model.usdzUrl : undefined}
          alt={`โมเดล 3 มิติ ${model.nameEn}`}
          ar=""
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          camera-controls=""
          auto-rotate=""
          shadow-intensity="1.4"
          shadow-softness="0.7"
          exposure="1.0"
          loading="eager"
          reveal="auto"
          class={styles.modelViewer}
        >
          {/*
            AR button slot.
            model-viewer shows this button only when AR is available on the device.
            We add our own label text so it reflects the platform.
          */}
          <button
            slot="ar-button"
            className={styles.arButton}
            aria-label={arLabel}
          >
            <StudentIcon name="cube" size={17} />
            {arLabel}
          </button>
        </model-viewer>

        {/*
          iOS Quick Look safety net.
          If the model-viewer AR button fails (e.g. Chrome iOS which doesn't support Quick Look),
          we show a dedicated note. For Safari iOS, this anchor provides a direct fallback.
          The anchor MUST wrap an <img> or be rel="ar" + href pointing to the .usdz file.
          We keep it visually hidden and trigger it programmatically only when needed.
        */}
        {hasUsdz && (
          <a
            ref={iosArRef}
            href={model.usdzUrl}
            rel="ar"
            aria-hidden="true"
            style={{ display: 'none' }}
          >
            {/* Required child for Quick Look activation */}
            <img src={model.glbUrl} alt="" />
          </a>
        )}

        {/* Back button */}
        <Link href="/student/explore" className={styles.backButton} aria-label="กลับหน้าสำรวจ">
          <StudentIcon name="arrowLeft" size={19} />
        </Link>

        {/* Viewer hint */}
        <span className={styles.viewerHint}>
          <StudentIcon name="target" size={15} />
          ลากเพื่อหมุน บีบเพื่อซูม
        </span>

        {/* AR not-supported banner — shown only when we've checked and know it's unsupported */}
        {arSupport.checked && !arAvailable && (
          <div className={styles.arUnsupported} role="status">
            <StudentIcon name="info" size={15} />
            {hasUsdz
              ? 'AR ใช้ได้บน Safari (iOS) และ Chrome (Android) เท่านั้น'
              : 'ไม่มีไฟล์ USDZ — AR บน iOS ยังไม่พร้อมใช้งาน'}
          </div>
        )}

        {/* iOS Chrome notice: model-viewer AR button won't work — show manual fallback */}
        {arSupport.checked &&
          /iphone|ipad|ipod/i.test(navigator.userAgent) &&
          !/^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
          hasUsdz && (
          <button
            type="button"
            className={styles.arFallbackButton}
            onClick={handleIOSARFallback}
          >
            <StudentIcon name="cube" size={17} />
            เปิด AR (Quick Look) ด้วย Safari
          </button>
        )}
      </section>

      {/* ─── Learning card ─────────────────────────────── */}
      <section className={styles.learningCard}>
        <header className={styles.wordHeader}>
          <div>
            <span className={styles.eyebrow}>AR vocabulary</span>
            <h1>{model.nameEn}</h1>
            <p>{model.pronounce || model.nameTh}</p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => speak(model.nameEn)}
            aria-label="ฟังคำศัพท์"
          >
            <StudentIcon name="volume" size={20} />
          </button>
        </header>

        <h2>{model.nameTh}</h2>
        <p className={styles.description}>
          {model.desc || 'เรียนรู้ชื่ออุปกรณ์ การออกเสียง และการประยุกต์ใช้ในงานบริการ'}
        </p>

        {model.sentence && (
          <div className={styles.sentence}>
            <div>
              <span>ตัวอย่างประโยคบริการ</span>
              <p>{model.sentence}</p>
            </div>
            <button type="button" onClick={() => speak(model.sentence || '')} aria-label="ฟังประโยค">
              <StudentIcon name="volume" size={18} />
            </button>
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={startSpeech}>
            <StudentIcon name="mic" size={17} />ฝึกออกเสียง
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => { setQuizOpen(true); setSelected(null); setAnswered(false) }}
          >
            <StudentIcon name="task" size={17} />ทดสอบความรู้
          </button>
        </div>

        {/* Platform AR guide chips */}
        <div className={styles.arGuide}>
          <span className={styles.arChip}>
            <StudentIcon name="cube" size={12} />
            Android → Chrome
          </span>
          <span className={styles.arChip}>
            <StudentIcon name="cube" size={12} />
            iOS → Safari เท่านั้น
          </span>
          <span className={styles.arChip}>
            <StudentIcon name="lock" size={12} />
            ต้องการ HTTPS
          </span>
        </div>
      </section>

      {/* ─── Speech practice modal ─────────────────────── */}
      {speechOpen && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={event => event.target === event.currentTarget && setSpeechOpen(false)}
        >
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="speech-title">
            <header>
              <span className={styles.modalIcon}><StudentIcon name="mic" /></span>
              <div>
                <h2 id="speech-title">ฝึกออกเสียง</h2>
                <p>พูดคำศัพท์ให้ชัดเจนหนึ่งครั้ง</p>
              </div>
              <button type="button" onClick={() => setSpeechOpen(false)} aria-label="ปิด">
                <StudentIcon name="x" size={17} />
              </button>
            </header>
            <div className={styles.modalBody}>
              <div className={styles.targetWord}>{model.nameEn}</div>
              {listening ? (
                <div className={styles.listening}>
                  <span />
                  <strong>กำลังฟังเสียงของคุณ</strong>
                </div>
              ) : (
                <div className={styles.speechResult}>
                  {spokenText && <p>ระบบได้ยิน &ldquo;{spokenText}&rdquo;</p>}
                  {speechScore !== null && (
                    <>
                      <strong>{speechScore}%</strong>
                      <span>
                        {speechScore >= 80
                          ? 'ออกเสียงได้ชัดเจนมาก'
                          : speechScore >= 50
                            ? 'ทำได้ดี ลองเน้นเสียงแต่ละคำอีกครั้ง'
                            : 'ลองพูดช้าลงและออกเสียงทีละคำ'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <footer>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={listening}
                onClick={startSpeech}
              >
                <StudentIcon name="refresh" size={16} />ลองอีกครั้ง
              </button>
              <button type="button" className={styles.ghostButton} onClick={() => setSpeechOpen(false)}>
                ปิด
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* ─── Quiz modal ────────────────────────────────── */}
      {quizOpen && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={event => event.target === event.currentTarget && setQuizOpen(false)}
        >
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="quiz-title">
            <header>
              <span className={styles.modalIcon}><StudentIcon name="task" /></span>
              <div>
                <h2 id="quiz-title">ทดสอบคำศัพท์</h2>
                <p>อุปกรณ์ชิ้นนี้ภาษาไทยเรียกว่าอะไร</p>
              </div>
              <button type="button" onClick={() => setQuizOpen(false)} aria-label="ปิด">
                <StudentIcon name="x" size={17} />
              </button>
            </header>
            <div className={styles.modalBody}>
              <div className={styles.targetWord}>{model.nameEn}</div>
              <div className={styles.options}>
                {options.map((option, index) => (
                  <button
                    type="button"
                    key={option}
                    disabled={answered}
                    onClick={() => setSelected(option)}
                    className={[
                      styles.option,
                      selected === option ? styles.selected : '',
                      answered && option === model.nameTh ? styles.correct : '',
                      answered && selected === option && option !== model.nameTh ? styles.wrong : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    {option}
                    {answered && option === model.nameTh && <StudentIcon name="check" size={17} />}
                  </button>
                ))}
              </div>
              {answered && (
                <div className={selected === model.nameTh ? styles.answerCorrect : styles.answerWrong}>
                  <StudentIcon name={selected === model.nameTh ? 'check' : 'info'} size={17} />
                  {selected === model.nameTh
                    ? 'ตอบถูกต้อง คะแนนถูกบันทึกแล้ว'
                    : `คำตอบที่ถูกคือ ${model.nameTh}`}
                </div>
              )}
            </div>
            <footer>
              {answered ? (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => { setSelected(null); setAnswered(false) }}
                >
                  <StudentIcon name="refresh" size={16} />ทำอีกครั้ง
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={!selected}
                  onClick={() => void answerQuiz()}
                >
                  ตรวจคำตอบ
                </button>
              )}
              <button type="button" className={styles.ghostButton} onClick={() => setQuizOpen(false)}>
                ปิด
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}

// ─── Page export ─────────────────────────────────────────────
export default function ARViewerPage() {
  return (
    <Suspense fallback={<main className={styles.statePage}>กำลังโหลดโมเดล 3 มิติ</main>}>
      <ARViewerContent />
    </Suspense>
  )
}
