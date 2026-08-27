'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { localData } from '@/lib/localData'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import StudentIcon from '../StudentIcon'
import styles from './ar-view.module.css'

type ARModel = { id: string; nameEn: string; nameTh: string; desc: string; glbUrl: string; usdzUrl?: string; pronounce?: string; sentence?: string }
type RecognitionResultEvent = { results: ArrayLike<{ 0: { transcript: string } }> }
type Recognition = { lang: string; interimResults: boolean; maxAlternatives: number; onresult: ((event: RecognitionResultEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void }
type RecognitionConstructor = new () => Recognition

const FALLBACK_MODEL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
const DISTRACTORS = ['จานสลัดเดี่ยว', 'ช้อนตักแกง', 'ถ้วยน้ำจิ้ม', 'มีดหั่นเนื้อสเต็ก', 'แก้วเครื่องดื่มค็อกเทล', 'ถาดไม้วางจาน', 'ผ้าเช็ดปากลูกค้า', 'เหยือกแก้วใส่น้ำ', 'ที่เปิดขวดไวน์', 'ชามใส่สลัดผัก']

function mapRow(row: Record<string, unknown>): ARModel {
  return { id: String(row.id || ''), nameEn: String(row.name_en || row.nameEn || ''), nameTh: String(row.name_th || row.nameTh || ''), desc: String(row.description || row.desc || ''), glbUrl: String(row.glb_url || row.glbUrl || FALLBACK_MODEL), usdzUrl: String(row.usdz_url || row.usdzUrl || ''), pronounce: String(row.pronounce || ''), sentence: String(row.sentence || row.service_tips || '') }
}

function buildOptions(answer: string) {
  const wrong = DISTRACTORS.filter(item => item !== answer).sort(() => Math.random() - .5).slice(0, 2)
  return [answer, ...wrong].sort(() => Math.random() - .5)
}

function ARViewerContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const [model, setModel] = useState<ARModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [speechOpen, setSpeechOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [spokenText, setSpokenText] = useState('')
  const [speechScore, setSpeechScore] = useState<number | null>(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const options = useMemo(() => model ? buildOptions(model.nameTh) : [], [model])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      if (!id && !searchParams.get('nameEn')) { if (active) setLoading(false); return }
      try {
        for (const table of ['ar_items', 'ai_scan_items'] as const) {
          const { data, error } = await localData.from(table).select('*').eq('id', id).single()
          if (data && !error) { if (active) setModel(mapRow(data as Record<string, unknown>)); return }
        }
        const { data } = await localData.from('fine_lesson_plans').select('vocabulary').eq('id', 'ar-items-store').single()
        const legacy = Array.isArray(data?.vocabulary) ? data.vocabulary.find((item: { id?: string }) => item.id === id) : null
        if (legacy) { if (active) setModel(mapRow(legacy as Record<string, unknown>)); return }
        const nameEn = searchParams.get('nameEn')
        if (nameEn && active) setModel({ id, nameEn, nameTh: searchParams.get('nameTh') || '', desc: searchParams.get('desc') || '', glbUrl: searchParams.get('glbUrl') || FALLBACK_MODEL, usdzUrl: searchParams.get('usdzUrl') || '', pronounce: searchParams.get('pronounce') || '', sentence: searchParams.get('sentence') || '' })
      } catch (error) { console.warn('Unable to load AR model:', error) }
      finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false; window.speechSynthesis?.cancel() }
  }, [id, searchParams])

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return toast.warning('เบราว์เซอร์นี้ไม่รองรับการออกเสียง')
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'en-US'; utterance.rate = .85; window.speechSynthesis.speak(utterance)
  }

  function startSpeech() {
    const speechWindow = window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
    const Constructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Constructor) return toast.warning('กรุณาใช้ Chrome หรือ Safari เวอร์ชันล่าสุดเพื่อฝึกออกเสียง')
    setSpeechOpen(true); setListening(true); setSpokenText(''); setSpeechScore(null)
    const recognition = new Constructor(); recognition.lang = 'en-US'; recognition.interimResults = false; recognition.maxAlternatives = 1
    recognition.onresult = event => { const transcript = event.results[0]?.[0]?.transcript || ''; const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(); const targetWords = normalize(model?.nameEn || '').split(' ').filter(Boolean); const spokenWords = normalize(transcript).split(' ').filter(Boolean); setSpokenText(transcript); setSpeechScore(targetWords.length ? Math.round(targetWords.filter(word => spokenWords.includes(word)).length / targetWords.length * 100) : 0) }
    recognition.onerror = () => { setListening(false); toast.error('ไม่สามารถรับเสียงได้ กรุณาตรวจสอบสิทธิ์ไมโครโฟน') }
    recognition.onend = () => setListening(false); recognition.start()
  }

  async function answerQuiz() {
    if (!selected || !model) return
    setAnswered(true)
    if (selected === model.nameTh) {
      toast.success('ตอบถูกต้อง บันทึกคะแนนแล้ว')
      try { await authenticatedFetch('/api/student/exhibit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score: 100, total: 100 }) }) } catch { /* retry from exhibit page */ }
    }
  }

  if (loading) return <main className={styles.statePage}><span className={styles.stateIcon}><StudentIcon name="refresh" size={28} /></span><strong>กำลังเตรียมโมเดล 3 มิติ</strong><p>การดาวน์โหลดอาจใช้เวลาสักครู่ตามความเร็วอินเทอร์เน็ต</p></main>
  if (!model) return <main className={styles.statePage}><span className={styles.errorIcon}><StudentIcon name="info" size={28} /></span><strong>ไม่พบโมเดล 3 มิติ</strong><p>QR Code อาจไม่ถูกต้อง หรือโมเดลถูกนำออกจากบทเรียนแล้ว</p><Link className={styles.primaryButton} href="/student/scanner"><StudentIcon name="camera" size={17} />กลับไปสแกนใหม่</Link></main>

  return <main className={styles.page}>
    <section className={styles.viewer} aria-label={`โมเดล 3 มิติ ${model.nameEn}`}>
      {/* @ts-expect-error model-viewer is a registered web component */}
      <model-viewer src={model.glbUrl} ios-src={model.usdzUrl || undefined} ar ar-modes="webxr scene-viewer quick-look" camera-controls auto-rotate shadow-intensity="1.4" class={styles.modelViewer}>
        <button slot="ar-button" className={styles.arButton}><StudentIcon name="cube" size={17} />วางโมเดลในพื้นที่จริง</button>
      {/* @ts-expect-error model-viewer is a registered web component */}
      </model-viewer>
      <Link href="/student/explore" className={styles.backButton} aria-label="กลับหน้าสำรวจ"><StudentIcon name="arrowLeft" size={19} /></Link>
      <span className={styles.viewerHint}><StudentIcon name="target" size={15} />ลากเพื่อหมุน บีบเพื่อซูม</span>
    </section>
    <section className={styles.learningCard}>
      <header className={styles.wordHeader}><div><span className={styles.eyebrow}>AR vocabulary</span><h1>{model.nameEn}</h1><p>{model.pronounce || model.nameTh}</p></div><button type="button" className={styles.iconButton} onClick={() => speak(model.nameEn)} aria-label="ฟังคำศัพท์"><StudentIcon name="volume" size={20} /></button></header>
      <h2>{model.nameTh}</h2><p className={styles.description}>{model.desc || 'เรียนรู้ชื่ออุปกรณ์ การออกเสียง และการประยุกต์ใช้ในงานบริการ'}</p>
      {model.sentence && <div className={styles.sentence}><div><span>ตัวอย่างประโยคบริการ</span><p>{model.sentence}</p></div><button type="button" onClick={() => speak(model.sentence || '')} aria-label="ฟังประโยค"><StudentIcon name="volume" size={18} /></button></div>}
      <div className={styles.actions}><button type="button" className={styles.primaryButton} onClick={startSpeech}><StudentIcon name="mic" size={17} />ฝึกออกเสียง</button><button type="button" className={styles.secondaryButton} onClick={() => { setQuizOpen(true); setSelected(null); setAnswered(false) }}><StudentIcon name="task" size={17} />ทดสอบความรู้</button></div>
    </section>
    {speechOpen && <div className={styles.modalBackdrop} onMouseDown={event => event.target === event.currentTarget && setSpeechOpen(false)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="speech-title"><header><span className={styles.modalIcon}><StudentIcon name="mic" /></span><div><h2 id="speech-title">ฝึกออกเสียง</h2><p>พูดคำศัพท์ให้ชัดเจนหนึ่งครั้ง</p></div><button type="button" onClick={() => setSpeechOpen(false)} aria-label="ปิด"><StudentIcon name="x" size={17} /></button></header><div className={styles.modalBody}><div className={styles.targetWord}>{model.nameEn}</div>{listening ? <div className={styles.listening}><span /><strong>กำลังฟังเสียงของคุณ</strong></div> : <div className={styles.speechResult}>{spokenText && <p>ระบบได้ยิน “{spokenText}”</p>}{speechScore !== null && <><strong>{speechScore}%</strong><span>{speechScore >= 80 ? 'ออกเสียงได้ชัดเจนมาก' : speechScore >= 50 ? 'ทำได้ดี ลองเน้นเสียงแต่ละคำอีกครั้ง' : 'ลองพูดช้าลงและออกเสียงทีละคำ'}</span></>}</div>}</div><footer><button type="button" className={styles.primaryButton} disabled={listening} onClick={startSpeech}><StudentIcon name="refresh" size={16} />ลองอีกครั้ง</button><button type="button" className={styles.ghostButton} onClick={() => setSpeechOpen(false)}>ปิด</button></footer></section></div>}
    {quizOpen && <div className={styles.modalBackdrop} onMouseDown={event => event.target === event.currentTarget && setQuizOpen(false)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="quiz-title"><header><span className={styles.modalIcon}><StudentIcon name="task" /></span><div><h2 id="quiz-title">ทดสอบคำศัพท์</h2><p>อุปกรณ์ชิ้นนี้ภาษาไทยเรียกว่าอะไร</p></div><button type="button" onClick={() => setQuizOpen(false)} aria-label="ปิด"><StudentIcon name="x" size={17} /></button></header><div className={styles.modalBody}><div className={styles.targetWord}>{model.nameEn}</div><div className={styles.options}>{options.map((option, index) => <button type="button" key={option} disabled={answered} onClick={() => setSelected(option)} className={`${styles.option} ${selected === option ? styles.selected : ''} ${answered && option === model.nameTh ? styles.correct : ''} ${answered && selected === option && option !== model.nameTh ? styles.wrong : ''}`}><span>{String.fromCharCode(65 + index)}</span>{option}{answered && option === model.nameTh && <StudentIcon name="check" size={17} />}</button>)}</div>{answered && <div className={selected === model.nameTh ? styles.answerCorrect : styles.answerWrong}><StudentIcon name={selected === model.nameTh ? 'check' : 'info'} size={17} />{selected === model.nameTh ? 'ตอบถูกต้อง คะแนนถูกบันทึกแล้ว' : `คำตอบที่ถูกคือ ${model.nameTh}`}</div>}</div><footer>{answered ? <button type="button" className={styles.primaryButton} onClick={() => { setSelected(null); setAnswered(false) }}><StudentIcon name="refresh" size={16} />ทำอีกครั้ง</button> : <button type="button" className={styles.primaryButton} disabled={!selected} onClick={answerQuiz}>ตรวจคำตอบ</button>}<button type="button" className={styles.ghostButton} onClick={() => setQuizOpen(false)}>ปิด</button></footer></section></div>}
  </main>
}

export default function ARViewerPage() { return <Suspense fallback={<main className={styles.statePage}>กำลังโหลดโมเดล 3 มิติ</main>}><ARViewerContent /></Suspense> }
