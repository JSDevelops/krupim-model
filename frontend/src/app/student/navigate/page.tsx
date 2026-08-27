'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import NavigateIcon from './NavigateIcon'
import styles from './navigate.module.css'

type VocabularyItem = { word: string; pronunciation: string; meaning: string }
type Scenario = {
  id: string
  title: string
  titleTh: string
  role: string
  description: string
  activity: string
  vocabulary: VocabularyItem[]
  sentences: string[]
}
type PracticeResult = {
  score: number
  transcript: string
  words: Array<{ word: string; correct: boolean }>
}
type SpeechRecognitionInstance = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onstart: () => void
  onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void
  onerror: (event: { error?: string }) => void
  onend: () => void
  start: () => void
  stop: () => void
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance
type DetailView = 'overview' | 'vocabulary' | 'sentences'

const defaultScenarios: Scenario[] = [
  {
    id: 'table-setting',
    title: 'Table Setting Challenge',
    titleTh: 'การจัดโต๊ะอาหารแบบเป็นทางการ',
    role: 'Food & Beverage Staff',
    description: 'ฝึกจัดลำดับอุปกรณ์บนโต๊ะอาหารแบบตะวันตก พร้อมเรียนรู้คำศัพท์และประโยคที่ใช้แนะนำการจัดโต๊ะแก่ผู้รับบริการ',
    activity: 'สำรวจอุปกรณ์ เรียนรู้หลัก Outside-In และทดลองอธิบายการจัดโต๊ะด้วยภาษาอังกฤษ',
    vocabulary: [
      { word: 'Cutlery', pronunciation: '/ˈkʌtləri/', meaning: 'ชุดมีด ช้อน และส้อมสำหรับรับประทานอาหาร' },
      { word: 'Glassware', pronunciation: '/ˈɡlɑːsweə(r)/', meaning: 'เครื่องแก้วที่ใช้บนโต๊ะอาหาร' },
      { word: 'Napkin', pronunciation: '/ˈnæpkɪn/', meaning: 'ผ้าเช็ดปาก' },
      { word: 'Outside-In', pronunciation: '/ˌaʊtˈsaɪd ɪn/', meaning: 'หลักการใช้อุปกรณ์จากด้านนอกเข้าด้านใน' },
    ],
    sentences: [
      'Good evening. Welcome to our fine dining restaurant.',
      'Allow me to explain the cutlery setting.',
      'We use the cutlery from the outside in.',
    ],
  },
  {
    id: 'guest-welcome',
    title: 'Guest Welcome',
    titleTh: 'การต้อนรับและนำลูกค้าไปยังโต๊ะ',
    role: 'Restaurant Host',
    description: 'ฝึกขั้นตอนการต้อนรับ ตรวจสอบการจอง และนำผู้รับบริการไปยังโต๊ะอย่างสุภาพและเป็นมืออาชีพ',
    activity: 'ฝึกเลือกประโยคต้อนรับให้เหมาะสมกับสถานการณ์และน้ำเสียงของผู้รับบริการ',
    vocabulary: [
      { word: 'Reservation', pronunciation: '/ˌrezəˈveɪʃn/', meaning: 'การจองโต๊ะล่วงหน้า' },
      { word: 'Available', pronunciation: '/əˈveɪləbl/', meaning: 'ว่างหรือพร้อมให้บริการ' },
      { word: 'Accompany', pronunciation: '/əˈkʌmpəni/', meaning: 'พาไปหรือไปเป็นเพื่อน' },
    ],
    sentences: [
      'Do you have a reservation with us?',
      'Your table is ready. Please follow me.',
      'May I help you with your belongings?',
    ],
  },
  {
    id: 'service-recovery',
    title: 'Service Recovery',
    titleTh: 'การรับมือข้อร้องเรียนของลูกค้า',
    role: 'Service Staff',
    description: 'ฝึกฟังปัญหา กล่าวขอโทษ และเสนอแนวทางแก้ไขอย่างเป็นระบบ เพื่อสร้างความมั่นใจให้ผู้รับบริการ',
    activity: 'วิเคราะห์สถานการณ์ เลือกคำตอบที่เหมาะสม และฝึกพูดประโยคขอโทษอย่างจริงใจ',
    vocabulary: [
      { word: 'Apologize', pronunciation: '/əˈpɒlədʒaɪz/', meaning: 'กล่าวขอโทษ' },
      { word: 'Inconvenience', pronunciation: '/ˌɪnkənˈviːniəns/', meaning: 'ความไม่สะดวก' },
      { word: 'Replacement', pronunciation: '/rɪˈpleɪsmənt/', meaning: 'สิ่งที่นำมาเปลี่ยนทดแทน' },
    ],
    sentences: [
      'I sincerely apologize for the inconvenience.',
      'Let me replace that for you right away.',
      'Thank you for bringing this to our attention.',
    ],
  },
]

function cleanWord(value: string) {
  return value.toLocaleLowerCase('en').replace(/[^a-z0-9']/g, '')
}

function evaluateSentence(target: string, spoken: string): PracticeResult {
  const spokenPool = spoken.split(/\s+/).map(cleanWord).filter(Boolean)
  const words = target.split(/\s+/).map(word => {
    const matchIndex = spokenPool.indexOf(cleanWord(word))
    if (matchIndex >= 0) spokenPool.splice(matchIndex, 1)
    return { word, correct: matchIndex >= 0 }
  })
  const correct = words.filter(word => word.correct).length
  return { score: words.length ? Math.round((correct / words.length) * 100) : 0, transcript: spoken, words }
}

export default function NavigatePage() {
  const [scenarios, setScenarios] = useState(defaultScenarios)
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<DetailView>('overview')
  const [expandedWord, setExpandedWord] = useState<number | null>(null)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, PracticeResult>>({})
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function loadScenarios() {
      try {
        const response = await authenticatedFetch('/api/student/navigate', { signal: controller.signal })
        if (!response.ok) return
        const payload = await response.json() as { scenarios?: Scenario[] }
        if (payload.scenarios?.length) setScenarios(payload.scenarios)
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Unable to load navigation scenarios:', error)
      }
    }
    void loadScenarios()
    return () => controller.abort()
  }, [])

  useEffect(() => () => {
    window.speechSynthesis?.cancel()
    recognitionRef.current?.stop()
    recognitionRef.current = null
  }, [])

  const activeScenario = scenarios.find(item => item.id === activeScenarioId) || null
  const totals = useMemo(() => ({
    vocabulary: scenarios.reduce((sum, item) => sum + item.vocabulary.length, 0),
    sentences: scenarios.reduce((sum, item) => sum + item.sentences.length, 0),
  }), [scenarios])

  function stopMedia() {
    window.speechSynthesis?.cancel()
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setSpeakingId(null)
    setRecordingId(null)
  }

  function openScenario(id: string) {
    stopMedia()
    setActiveScenarioId(id)
    setActiveView('overview')
    setExpandedWord(null)
  }

  function closeScenario() {
    stopMedia()
    setActiveScenarioId(null)
    setActiveView('overview')
    setExpandedWord(null)
  }

  function selectView(view: DetailView) {
    stopMedia()
    setActiveView(view)
  }

  function speak(text: string, id: string) {
    if (!window.speechSynthesis) {
      toast.warning('เบราว์เซอร์นี้ยังไม่รองรับการอ่านออกเสียง')
      return
    }
    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }
    recognitionRef.current?.stop()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.84
    utterance.onstart = () => setSpeakingId(id)
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  function practice(sentence: string, id: string) {
    if (recordingId === id) {
      recognitionRef.current?.stop()
      return
    }
    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.warning('เบราว์เซอร์นี้ยังไม่รองรับการประเมินเสียงพูด', { description: 'แนะนำให้ใช้งานผ่าน Google Chrome' })
      return
    }
    stopMedia()
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setRecordingId(id)
    recognition.onresult = event => {
      const transcript = event.results[0]?.[0]?.transcript || ''
      setResults(previous => ({ ...previous, [id]: evaluateSentence(sentence, transcript) }))
    }
    recognition.onerror = event => {
      console.warn('Speech recognition error:', event.error)
      setRecordingId(null)
    }
    recognition.onend = () => {
      setRecordingId(null)
      recognitionRef.current = null
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  if (activeScenario) {
    const tabs: Array<{ id: DetailView; label: string; count?: number }> = [
      { id: 'overview', label: 'ภาพรวม' },
      { id: 'vocabulary', label: 'คำศัพท์', count: activeScenario.vocabulary.length },
      { id: 'sentences', label: 'ฝึกประโยค', count: activeScenario.sentences.length },
    ]
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <section className={`${styles.hero} ${styles.detailHero}`}>
            <div className={styles.heroContent}>
              <div className={styles.heroTopline}>
                <button type="button" className={styles.backButton} onClick={closeScenario} aria-label="กลับไปหน้ารายการสถานการณ์"><NavigateIcon name="arrowLeft" size={18} /></button>
                <span className={styles.eyebrow}><NavigateIcon name="compass" size={15} /> N — Navigate</span>
              </div>
              <h1 className={styles.detailTitle}>{activeScenario.title}</h1>
              <p className={styles.detailSubtitle}>{activeScenario.titleTh}</p>
              <div className={styles.metaRow}>
                <span><NavigateIcon name="user" size={14} /> {activeScenario.role}</span>
                <span><NavigateIcon name="book" size={14} /> {activeScenario.vocabulary.length} คำศัพท์</span>
                <span><NavigateIcon name="message" size={14} /> {activeScenario.sentences.length} ประโยค</span>
              </div>
            </div>
          </section>

          <nav className={styles.tabs} aria-label="เนื้อหาสถานการณ์">
            {tabs.map(tab => <button key={tab.id} type="button" className={`${styles.tab} ${activeView === tab.id ? styles.tabActive : ''}`} onClick={() => selectView(tab.id)}><span>{tab.label}</span>{tab.count !== undefined && <span className={styles.tabCount}>{tab.count}</span>}</button>)}
          </nav>

          {activeView === 'overview' && (
            <div className={styles.overviewGrid}>
              <section className={styles.card}>
                <header className={styles.cardHeader}><span className={styles.cardIcon}><NavigateIcon name="info" /></span><div><h2>รายละเอียดสถานการณ์</h2><p>ทำความเข้าใจบริบทก่อนเริ่มฝึก</p></div></header>
                <div className={styles.cardBody}>
                  <p className={styles.description}>{activeScenario.description}</p>
                  {activeScenario.activity && <div className={styles.activity}><strong>กิจกรรม Navigate</strong><span>{activeScenario.activity}</span></div>}
                </div>
              </section>
              <aside className={`${styles.card} ${styles.guideCard}`}>
                <header className={styles.cardHeader}><span className={`${styles.cardIcon} ${styles.goldIcon}`}><NavigateIcon name="target" /></span><div><h2>ลำดับการฝึก</h2><p>เรียนรู้ให้ครบใน 3 ขั้นตอน</p></div></header>
                <ol className={styles.steps}>
                  <li><span>01</span><div><strong>ทำความเข้าใจบริบท</strong><p>อ่านบทบาทและเป้าหมายของสถานการณ์</p></div></li>
                  <li><span>02</span><div><strong>เตรียมคำศัพท์และประโยค</strong><p>ฟังเสียงต้นแบบและฝึกพูดให้คล่อง</p></div></li>
                  <li><span>03</span><div><strong>ทดลองสถานการณ์จริง</strong><p>นำความรู้ไปใช้ในห้องจำลอง</p></div></li>
                </ol>
                <Link className={styles.launchButton} href={`/simulation?scenario=${encodeURIComponent(activeScenario.id)}`}>เริ่มสถานการณ์จำลอง <NavigateIcon name="arrowRight" size={17} /></Link>
              </aside>
            </div>
          )}

          {activeView === 'vocabulary' && (
            <section className={styles.contentSection}>
              <header className={styles.sectionHeader}><div><span className={styles.sectionEyebrow}>Vocabulary</span><h2>คำศัพท์สำคัญในสถานการณ์</h2><p>เลือกคำศัพท์เพื่อดูความหมายและฟังการออกเสียง</p></div></header>
              {activeScenario.vocabulary.length ? <div className={styles.vocabGrid}>
                {activeScenario.vocabulary.map((item, index) => {
                  const expanded = expandedWord === index
                  const audioId = `word-${activeScenario.id}-${index}`
                  return <article className={`${styles.vocabCard} ${expanded ? styles.vocabExpanded : ''}`} key={`${item.word}-${index}`}>
                    <button type="button" className={styles.vocabSummary} onClick={() => setExpandedWord(expanded ? null : index)} aria-expanded={expanded}>
                      <span className={styles.wordIndex}>{String(index + 1).padStart(2, '0')}</span>
                      <span className={styles.wordCopy}><strong>{item.word}</strong><span>{item.pronunciation || 'แตะเพื่อดูความหมาย'}</span></span>
                      <span className={styles.chevron}><NavigateIcon name="chevron" size={17} /></span>
                    </button>
                    {expanded && <div className={styles.vocabDetail}><p>{item.meaning}</p><button type="button" className={styles.secondaryButton} onClick={() => speak(item.word, audioId)}><NavigateIcon name={speakingId === audioId ? 'pause' : 'volume'} size={16} />{speakingId === audioId ? 'หยุดเสียง' : 'ฟังการออกเสียง'}</button></div>}
                  </article>
                })}
              </div> : <div className={styles.emptyState}><NavigateIcon name="book" size={24} /><strong>ยังไม่มีคำศัพท์ในสถานการณ์นี้</strong><span>คุณครูสามารถเพิ่มคำศัพท์ได้จากหน้าแผนการสอน</span></div>}
            </section>
          )}

          {activeView === 'sentences' && (
            <section className={styles.contentSection}>
              <header className={styles.sectionHeader}><div><span className={styles.sectionEyebrow}>Speaking practice</span><h2>ฝึกประโยคงานบริการ</h2><p>ฟังเสียงต้นแบบ พูดตาม และตรวจความถูกต้องรายคำ</p></div></header>
              {activeScenario.sentences.length ? <div className={styles.sentenceList}>
                {activeScenario.sentences.map((sentence, index) => {
                  const id = `sentence-${activeScenario.id}-${index}`
                  const audioId = `audio-${id}`
                  const result = results[id]
                  const recording = recordingId === id
                  return <article className={styles.sentenceCard} key={`${sentence}-${index}`}>
                    <div className={styles.sentenceTop}><span className={styles.sentenceIndex}>{String(index + 1).padStart(2, '0')}</span><p>{sentence}</p></div>
                    <div className={styles.sentenceActions}>
                      <button type="button" className={styles.secondaryButton} onClick={() => speak(sentence, audioId)}><NavigateIcon name={speakingId === audioId ? 'pause' : 'volume'} size={16} />{speakingId === audioId ? 'หยุดเสียง' : 'ฟังเสียงต้นแบบ'}</button>
                      <button type="button" className={`${styles.primaryButton} ${recording ? styles.recording : ''}`} onClick={() => practice(sentence, id)}><NavigateIcon name={recording ? 'pause' : 'mic'} size={16} />{recording ? 'หยุดบันทึกเสียง' : 'พูดตามและประเมิน'}</button>
                    </div>
                    {result && <div className={styles.resultPanel} aria-live="polite">
                      <div className={styles.resultHeader}><span className={styles.resultIcon}><NavigateIcon name={result.score >= 75 ? 'check' : 'refresh'} /></span><div><strong>ผลการประเมิน</strong><span>{result.score >= 75 ? 'ทำได้ดี ลองฝึกอีกครั้งเพื่อเพิ่มความคล่อง' : 'ฟังต้นแบบแล้วลองพูดช้าลงอีกครั้ง'}</span></div><b>{result.score}%</b></div>
                      <div className={styles.wordResults}>{result.words.map((word, wordIndex) => <span className={word.correct ? styles.correct : styles.incorrect} key={`${word.word}-${wordIndex}`}>{word.word}</span>)}</div>
                      <p className={styles.transcript}>ระบบได้ยิน: “{result.transcript}”</p>
                    </div>}
                  </article>
                })}
              </div> : <div className={styles.emptyState}><NavigateIcon name="message" size={24} /><strong>ยังไม่มีประโยคฝึกในสถานการณ์นี้</strong><span>คุณครูสามารถเพิ่มประโยคได้จากหน้าแผนการสอน</span></div>}
            </section>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}><NavigateIcon name="sparkles" size={15} /> N — Navigate</div>
            <h1 className={styles.title}>ฝึกสถานการณ์งานบริการอย่างเป็นระบบ</h1>
            <p className={styles.subtitle}>เลือกสถานการณ์ เตรียมคำศัพท์และประโยคสำคัญ ก่อนนำความรู้ไปทดลองใช้ในห้องจำลองเสมือนจริง</p>
            <Link className={styles.heroLink} href="/student/explore"><NavigateIcon name="arrowLeft" size={15} /> กลับไปหน้าสำรวจ</Link>
          </div>
          <div className={styles.heroStats}>
            <div><strong>{scenarios.length}</strong><span>สถานการณ์</span></div>
            <div><strong>{totals.vocabulary}</strong><span>คำศัพท์</span></div>
            <div><strong>{totals.sentences}</strong><span>ประโยคฝึก</span></div>
          </div>
        </section>

        <section className={styles.catalogue}>
          <header className={styles.catalogueHeader}><div><span className={styles.sectionEyebrow}>Scenario library</span><h2>เลือกสถานการณ์ที่ต้องการฝึก</h2><p>เนื้อหาจากแผนการสอนของคุณครู พร้อมใช้งานได้ทันที</p></div></header>
          <div className={styles.scenarioGrid}>
            {scenarios.map((scenario, index) => <button type="button" className={styles.scenarioCard} key={scenario.id} onClick={() => openScenario(scenario.id)}>
              <span className={styles.scenarioAccent} aria-hidden="true" />
              <span className={styles.scenarioTop}><span className={styles.scenarioNumber}>{String(index + 1).padStart(2, '0')}</span><span className={styles.scenarioIcon}><NavigateIcon name="compass" /></span></span>
              <span className={styles.scenarioCopy}><span className={styles.scenarioLabel}>Service scenario</span><strong>{scenario.title}</strong><span className={styles.scenarioThai}>{scenario.titleTh}</span><span className={styles.scenarioDescription}>{scenario.description}</span></span>
              <span className={styles.scenarioFooter}><span><NavigateIcon name="book" size={14} /> {scenario.vocabulary.length} คำศัพท์</span><span><NavigateIcon name="message" size={14} /> {scenario.sentences.length} ประโยค</span><span className={styles.openLabel}>เปิดสถานการณ์ <NavigateIcon name="arrowRight" size={15} /></span></span>
            </button>)}
          </div>
        </section>
      </div>
    </main>
  )
}
