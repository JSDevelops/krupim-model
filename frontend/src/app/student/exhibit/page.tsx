'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { authenticatedFetch } from '@/lib/api'
import StudentIcon, { type StudentIconName } from '../StudentIcon'
import styles from '../studentPages.module.css'

type HistoryType = 'chat' | 'live' | 'simulation'
type HistoryEntry = { id: string; occurredAt: string; type: HistoryType; preview: string; score: number | null; durationMinutes: number }
type Scores = { averageScore: number; knowledgeScore: number; skillsScore: number; attitudeScore: number; competencyScore: number; assessments: number }
type QuizQuestion = { question: string; options: string[]; correct: number }

const emptyScores: Scores = { averageScore: 0, knowledgeScore: 0, skillsScore: 0, attitudeScore: 0, competencyScore: 0, assessments: 0 }
const quizBank: QuizQuestion[] = [
  { question: 'What is a dinner fork used for?', options: ['Soup course', 'Main course', 'Dessert', 'Bread'], correct: 1 },
  { question: 'Where is the water goblet placed?', options: ['Left of the plate', 'Below the knife', 'Above the knife', 'Next to the fork'], correct: 2 },
  { question: 'What does Outside-In mean in table setting?', options: ['Use center utensils first', 'Use outermost utensils first', 'Use left side first', 'Use right side first'], correct: 1 },
  { question: 'Which phrase is appropriate for welcoming a guest?', options: ['What do you want?', 'Good evening. Welcome to our restaurant.', 'Sit down.', 'You want food?'], correct: 1 },
  { question: 'How should you apologize for a delay?', options: ['Sorry.', 'Wait.', 'I apologize for the inconvenience.', 'Not my fault.'], correct: 2 },
]

function historyDetails(type: HistoryType): { label: string; icon: StudentIconName; className: string } {
  if (type === 'live') return { label: 'Live Coach', icon: 'message', className: styles.live }
  if (type === 'simulation') return { label: 'Simulation', icon: 'target', className: styles.simulation }
  return { label: 'AI Chat', icon: 'message', className: '' }
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default function ExhibitPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'quiz' | 'score'>('history')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [scores, setScores] = useState<Scores>(emptyScores)
  const [quizStarted, setQuizStarted] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [quizDone, setQuizDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await authenticatedFetch('/api/student/exhibit', { signal: controller.signal })
        if (!response.ok) return
        const payload = await response.json() as { history?: HistoryEntry[]; scores?: Scores }
        setHistory(payload.history || [])
        setScores(payload.scores || emptyScores)
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Unable to load exhibit data:', error)
      }
    }
    void load()
    return () => { controller.abort(); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const measuredScores = history.map(item => item.score).filter((score): score is number => score !== null)
  const historyAverage = measuredScores.length ? Math.round(measuredScores.reduce((sum, score) => sum + score, 0) / measuredScores.length) : scores.averageScore
  const quizScore = quizDone ? Math.round((answers.filter(Boolean).length / quizBank.length) * 100) : 0
  const breakdown = useMemo(() => (['simulation', 'chat', 'live'] as HistoryType[]).map(type => {
    const values = history.filter(item => item.type === type && item.score !== null).map(item => item.score as number)
    return { type, score: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0 }
  }), [history])

  function chooseAnswer(index: number) {
    if (selected !== null) return
    setSelected(index)
    const correct = index === quizBank[questionIndex].correct
    timerRef.current = setTimeout(() => {
      const next = [...answers, correct]
      setAnswers(next)
      if (questionIndex < quizBank.length - 1) { setQuestionIndex(value => value + 1); setSelected(null) }
      else {
        setQuizDone(true)
        const score = Math.round((next.filter(Boolean).length / quizBank.length) * 100)
        void authenticatedFetch('/api/student/exhibit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score }) }).catch(error => console.warn('Unable to save quiz score:', error))
      }
    }, 650)
  }

  function resetQuiz() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setQuestionIndex(0); setSelected(null); setAnswers([]); setQuizDone(false); setQuizStarted(false)
  }

  const tabs = [
    { id: 'history' as const, label: 'บันทึก', icon: 'history' as StudentIconName },
    { id: 'quiz' as const, label: 'แบบทดสอบ', icon: 'exhibit' as StudentIconName },
    { id: 'score' as const, label: 'คะแนน', icon: 'chart' as StudentIconName },
  ]

  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.hero}><div className={styles.heroContent}>
      <div className={styles.eyebrow}><StudentIcon name="sparkles" size={15} /> E — Exhibit</div>
      <h1 className={styles.title}>ทบทวนผลการฝึกและวัดความก้าวหน้า</h1>
      <p className={styles.subtitle}>ดูประวัติการสนทนา ทดสอบความรู้ และติดตามคะแนนรายด้าน เพื่อวางแผนการฝึกครั้งถัดไปอย่างชัดเจน</p>
    </div><div className={styles.heroStats}>
      <div><strong>{history.length}</strong><span>รายการฝึก</span></div><div><strong>{historyAverage}%</strong><span>คะแนนเฉลี่ย</span></div><div><strong>{scores.assessments}</strong><span>แบบประเมิน</span></div>
    </div></section>

    <nav className={styles.tabs} aria-label="เนื้อหาหน้า Exhibit">{tabs.map(tab => <button type="button" key={tab.id} className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.id)}><StudentIcon name={tab.icon} size={15} /><span>{tab.label}</span></button>)}</nav>

    <section className={styles.content}>
      {activeTab === 'history' && <><header className={styles.sectionHeader}><h2>ประวัติการฝึกทั้งหมด</h2><p>เรียงจากกิจกรรมล่าสุดและแสดงผลจากฐานข้อมูลจริง</p></header>
        {history.length ? <div className={styles.historyList}>{history.map(entry => { const detail = historyDetails(entry.type); return <article className={styles.historyCard} key={entry.id}>
          <span className={`${styles.historyIcon} ${detail.className}`}><StudentIcon name={detail.icon} /></span><div className={styles.historyCopy}><strong>{detail.label}</strong><p>{entry.preview}</p><div className={styles.historyMeta}><span><StudentIcon name="calendar" size={13} />{formatDate(entry.occurredAt)}</span><span><StudentIcon name="clock" size={13} />{entry.durationMinutes} นาที</span></div></div>{entry.score !== null && <span className={`${styles.scorePill} ${entry.score < 70 ? styles.low : ''}`}>{entry.score}%</span>}
        </article>})}</div> : <div className={`${styles.card} ${styles.empty}`}><StudentIcon name="history" size={26} /><strong>ยังไม่มีประวัติการฝึก</strong><span>เริ่มฝึกจากหน้า Interact หรือ Navigate แล้วผลจะปรากฏในหน้านี้</span></div>}
      </>}

      {activeTab === 'quiz' && <>{!quizStarted && !quizDone && <div className={`${styles.card} ${styles.quizIntro}`}><span className={styles.largeIcon}><StudentIcon name="exhibit" size={27} /></span><h2>แบบทดสอบ F&amp;B Service</h2><p>ทดสอบคำศัพท์และการเลือกประโยคในสถานการณ์งานบริการ</p><div className={styles.factGrid}><div className={styles.fact}><span>จำนวนคำถาม</span><strong>{quizBank.length} ข้อ</strong></div><div className={styles.fact}><span>คะแนนผ่าน</span><strong>70%</strong></div><div className={styles.fact}><span>ทักษะที่วัด</span><strong>Knowledge + Skills</strong></div><div className={styles.fact}><span>เวลาโดยประมาณ</span><strong>5 นาที</strong></div></div><button type="button" className={`${styles.button} ${styles.full}`} onClick={() => setQuizStarted(true)}>เริ่มทำแบบทดสอบ <StudentIcon name="arrowRight" size={16} /></button></div>}
        {quizStarted && !quizDone && <div className={styles.card}><div className={styles.progressRow}><div className={styles.progressTrack}><div className={styles.progressBar} style={{ width: `${((questionIndex + 1) / quizBank.length) * 100}%` }} /></div><span>{questionIndex + 1}/{quizBank.length}</span></div><span className={styles.questionLabel}>คำถามที่ {questionIndex + 1}</span><h2 className={styles.question}>{quizBank[questionIndex].question}</h2><div className={styles.options}>{quizBank[questionIndex].options.map((option, index) => { const correct = selected !== null && index === quizBank[questionIndex].correct; const wrong = selected === index && !correct; return <button type="button" disabled={selected !== null} className={`${styles.option} ${correct ? styles.optionCorrect : ''} ${wrong ? styles.optionWrong : ''}`} key={option} onClick={() => chooseAnswer(index)}><span className={styles.optionLetter}>{String.fromCharCode(65 + index)}</span><span>{option}</span>{(correct || wrong) && <StudentIcon name={correct ? 'check' : 'x'} size={16} />}</button>})}</div></div>}
        {quizDone && <div className={`${styles.card} ${styles.quizResult}`}><span className={styles.largeIcon}><StudentIcon name={quizScore >= 70 ? 'award' : 'refresh'} size={28} /></span><span className={styles.questionLabel}>คะแนนของคุณ</span><div className={styles.scoreValue}>{quizScore}%</div><strong>{answers.filter(Boolean)}/{quizBank.length} ข้อถูกต้อง</strong><p className={styles.resultNote}>{quizScore >= 70 ? 'ผ่านเกณฑ์แล้ว คุณสามารถทบทวนบทเรียนและกลับมาทำใหม่เพื่อรักษาความแม่นยำ' : 'ยังไม่ถึงเกณฑ์ แนะนำให้ทบทวนคำศัพท์และประโยคใน Navigate ก่อนลองอีกครั้ง'}</p><button type="button" className={`${styles.button} ${styles.full}`} onClick={resetQuiz}><StudentIcon name="refresh" size={16} />ทำแบบทดสอบใหม่</button></div>}
      </>}

      {activeTab === 'score' && <div className={styles.scoreGrid}><div className={styles.card}><div className={styles.cardTitle}><span className={styles.iconBox}><StudentIcon name="chart" /></span><div><h2>คะแนนเฉลี่ยสะสม</h2><p>จากกิจกรรมที่มีการประเมินผล</p></div></div><div className={styles.scoreRing} style={{ '--score': `${historyAverage}%` } as React.CSSProperties}><div><strong>{historyAverage}%</strong><span>คะแนนเฉลี่ย</span></div></div><div className={styles.level}>{historyAverage >= 80 ? 'ระดับยอดเยี่ยม' : historyAverage >= 70 ? 'ระดับดี' : 'กำลังพัฒนา'}</div></div>
        <div className={styles.card}><div className={styles.cardTitle}><span className={`${styles.iconBox} ${styles.blueIcon}`}><StudentIcon name="target" /></span><div><h2>คะแนนแยกตามประเภท</h2><p>เปรียบเทียบประสิทธิภาพของแต่ละกิจกรรม</p></div></div><div className={styles.breakdown}>{breakdown.map(item => { const detail = historyDetails(item.type); return <div key={item.type}><div className={styles.metricTop}><span>{detail.label}</span><strong>{item.score}%</strong></div><div className={styles.metricTrack}><div className={styles.metricBar} style={{ width: `${item.score}%`, background: item.type === 'simulation' ? '#915363' : item.type === 'live' ? '#4d7896' : '#39745d' }} /></div></div>})}</div></div>
        <div className={styles.card}><div className={styles.cardTitle}><span className={`${styles.iconBox} ${styles.goldIcon}`}><StudentIcon name="award" /></span><div><h2>ผลต่อสมรรถนะ KSA-C</h2><p>คะแนนล่าสุดจากแบบประเมินของคุณครู</p></div></div><div className={styles.ksaList}>{[['K','Knowledge — ความรู้',scores.knowledgeScore],['S','Skills — ทักษะ',scores.skillsScore],['A','Attitude — เจตคติ',scores.attitudeScore],['C','Competency — สมรรถนะ',scores.competencyScore]].map(([key,label,value]) => <div className={styles.ksaItem} key={String(key)}><span className={styles.ksaKey}>{key}</span><div><strong>{label}: {value}%</strong><p>อัปเดตจากผลการประเมินในระบบ</p></div></div>)}</div></div>
      </div>}
    </section>
  </div></main>
}
