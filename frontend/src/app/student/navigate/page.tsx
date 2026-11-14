'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { authenticatedFetch } from '@/lib/api'
import { toast } from 'sonner'
import SpeechSpeedToggle, { getStoredSpeechRate } from '@/components/SpeechSpeedToggle'
import NavigateIcon from './NavigateIcon'
import styles from './navigate.module.css'

type VocabularyItem = { word: string; pronunciation: string; meaning: string }
type Scenario = {
  id: string
  weeks?: string
  weekNum?: number
  title: string
  titleTh: string
  role: string
  description: string
  activity: string
  videoUrl?: string
  vocabulary: VocabularyItem[]
  sentences: string[]
}

export function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/)
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&enablejsapi=1`
  }
  if (/^[\w-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}?rel=0&modestbranding=1&enablejsapi=1`
  }
  return null
}

function getScenarioWeek(s: Scenario, fallbackIndex: number): number {
  if (typeof s.weekNum === 'number' && s.weekNum > 0) return s.weekNum
  const m = s.weeks?.match(/\d+/) || s.id?.match(/week-(\d+)/) || s.title?.match(/สัปดาห์ที่\s*(\d+)/)
  return m ? parseInt(m[1] || m[0], 10) : fallbackIndex + 1
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
type DetailView = 'video' | 'overview' | 'decision' | 'vocabulary' | 'sentences'

type DecisionOption = {
  text: string
  isCorrect: boolean
  feedback: string
}

type Dilemma = {
  situation: string
  prompt: string
  options: DecisionOption[]
}

const scenarioDilemmas: Record<string, Dilemma> = {
  'table-setting': {
    situation: 'ลูกค้านั่งที่โต๊ะแล้วสังเกตเห็นว่าบนโต๊ะมีส้อม 3 คัน มีด 2 เล่ม และช้อนซุป ลูกค้าถามพนักงานว่า "ฉันควรเริ่มใช้อุปกรณ์คันไหนก่อนสำหรับอาหารจานแรก?"',
    prompt: 'ในฐานะพนักงานบริการ คุณควรแนะนำลูกค้าอย่างไรให้ถูกต้องตามมาตรฐานสากล?',
    options: [
      {
        text: 'แนะนำด้วยรอยยิ้มอย่างสุภาพว่า "ขออนุญาตแนะนำให้ใช้อุปกรณ์จากคู่ที่อยู่วงนอกสุดก่อนครับ (Outside-In) โดยเริ่มจากช้อนซุปและส้อมสลัดด้านนอกครับ"',
        isCorrect: true,
        feedback: 'ถูกต้องยอดเยี่ยม! หลักการ Outside-In เป็นหัวใจของ Table Setting สากล การอธิบายอย่างสุภาพช่วยสร้างความมั่นใจให้ผู้รับบริการ',
      },
      {
        text: 'ตอบลูกค้าว่า "ใช้อันไหนก็ได้ครับตามใจชอบ ไม่ซีเรียส"',
        isCorrect: false,
        feedback: 'ยังไม่ถูกต้อง: การบริการระดับมืออาชีพควรให้คำแนะนำที่ถูกต้องตามมารยาทสากล เพื่อรักษามาตรฐานของมื้ออาหาร',
      },
      {
        text: 'เดินไปหยิบอุปกรณ์ที่เหลือออก แล้วบอกว่าเดี๋ยวค่อยเอามาให้ทีละคอร์ส',
        isCorrect: false,
        feedback: 'ยังไม่ถูกต้อง: การจัดโต๊ะแบบ Full Course วัตถุประสงค์คือเตรียมความพร้อมล่วงหน้า การหยิบออกทำให้เสียมาตรฐาน',
      },
    ],
  },
  'guest-welcome': {
    situation: 'ลูกค้า 2 ท่านเดินเข้ามาในห้องอาหารช่วงเวลา 19:30 น. ซึ่งมีลูกค้าแน่นร้าน ลูกค้าแจ้งว่าไม่ได้จองโต๊ะล่วงหน้าไว้ แต่อยากได้โต๊ะริมหน้าต่าง',
    prompt: 'ในฐานะ Restaurant Host คุณควรปฏิบัติและสื่อสารอย่างไร?',
    options: [
      {
        text: 'ตรวจสอบตาราง หากโต๊ะริมหน้าต่างมีคิวจอง ให้กล่าวขออภัยอย่างจริงใจ เสนอโต๊ะว่างในโซนที่เงียบสงบแทน พร้อมเสนอเสิร์ฟเครื่องดื่มต้อนรับระหว่างรอจัดโต๊ะ',
        isCorrect: true,
        feedback: 'ยอดเยี่ยมมาก! การกล่าวขออภัยอย่างสุภาพ เสนอทางเลือกที่ดีแทน (Alternative Solution) และดูแลลูกค้าต่อเนื่อง เป็นหัวใจของ Service Mind',
      },
      {
        text: 'ตอบปฏิเสธทันทีว่า "โต๊ะริมหน้าต่างเต็มหมดแล้ว สำหรับคนที่จองเท่านั้นครับ"',
        isCorrect: false,
        feedback: 'ยังไม่เหมาะสม: การปฏิเสธทันทีโดยไม่เสนอทางเลือกทดแทนทำให้ลูกค้ารู้สึกไม่ได้รับการต้อนรับ',
      },
      {
        text: 'ให้ลูกค้านั่งโต๊ะริมหน้าต่างไปก่อน แล้วค่อยเชิญลุกเมื่อลูกค้าที่จองจริงมาถึง',
        isCorrect: false,
        feedback: 'ห้ามปฏิบัติเด็ดขาด: จะสร้างความไม่พอใจอย่างรุนแรงทั้งแก่ลูกค้าที่นั่งอยู่และลูกค้าที่จองล่วงหน้า',
      },
    ],
  },
  'service-recovery': {
    situation: 'ลูกค้าสั่งสเต๊กเนื้อแบบ Medium Rare แต่เมื่ออาหารมาเสิร์ฟและลูกค้าหั่นดู พบว่าเนื้อสุกเกินไปเป็น Well Done ลูกค้ามีสีหน้าไม่พอใจและเรียกพนักงาน',
    prompt: 'ตามหลัก Service Recovery สากล คุณควรทำสิ่งใดเป็นอันดับแรก?',
    options: [
      {
        text: 'สบตาลูกค้า รับฟังอย่างตั้งใจ กล่าวขออภัยอย่างจริงใจโดยไม่โต้แย้ง และรีบนำจานกลับเข้าครัวเพื่อปรุงจานใหม่ตามระดับความสุกที่ถูกต้องทันที',
        isCorrect: true,
        feedback: 'ถูกต้องที่สุด! กฎเหล็กของ Service Recovery คือ ฟัง (Listen), ขออภัย (Apologize) และแก้ไขปัญหาทันที (Act Immediately)',
      },
      {
        text: 'อธิบายว่าเนื้อระดับนี้คือ Medium Rare ตามมาตรฐานของเชฟในครัว',
        isCorrect: false,
        feedback: 'ไม่ถูกต้อง: การโต้แย้งกับลูกค้าเรื่องความสุกจะทำให้ลูกค้ารู้สึกว่าพนักงานไม่ใส่ใจความต้องการของเขา',
      },
      {
        text: 'ขอให้ลูกค้ารับประทานไปก่อน แล้วเสนอจะลดราคาเครื่องดื่มให้ 10%',
        isCorrect: false,
        feedback: 'ไม่ถูกต้อง: เมื่ออาหารหลักไม่ตรงตามที่สั่ง ต้องแก้ไขที่ตัวอาหารก่อนเสมอ ไม่ควรให้ลูกค้ารับประทานสิ่งที่ไม่ต้องการ',
      },
    ],
  },
  'order-taking': {
    situation: 'ลูกค้าสอบถามว่า "เมนูสเต๊กปลากะพงขาวนี้มีส่วนผสมของถั่วหรือผลิตภัณฑ์จากนมหรือไม่ พอดีฉันมีอาการแพ้อาหารรุนแรง"',
    prompt: 'ในฐานะพนักงานรับออร์เดอร์ คุณควรปฏิบัติตนอย่างไรเพื่อความปลอดภัยสูงสุดของลูกค้า?',
    options: [
      {
        text: 'จดบันทึกอาการแพ้อย่างชัดเจน แจ้งลูกค้าอย่างสุภาพว่าจะขอตรวจสอบสูตรและกระบวนการปรุงกับหัวหน้าเชฟในครัวทันทีเพื่อความปลอดภัย 100%',
        isCorrect: true,
        feedback: 'ถูกต้องที่สุด! เรื่องการแพ้อาหาร (Food Allergies) คือความเป็นความตาย ห้ามคาดเดาเองเด็ดขาด ต้องตรวจสอบกับครัวเสมอ',
      },
      {
        text: 'ตอบตามความรู้สึกว่า "น่าจะไม่มีครับ ทานได้แน่นอน"',
        isCorrect: false,
        feedback: 'อันตรายร้ายแรง! หากลูกค้าแพ้อาหารรุนแรง (Anaphylaxis) อาจเป็นอันตรายถึงชีวิตและห้องอาหารต้องรับผิดชอบทางกฎหมาย',
      },
      {
        text: 'แนะนำให้ลูกค้าเปลี่ยนไปสั่งน้ำเปล่าแทนเพื่อตัดปัญหา',
        isCorrect: false,
        feedback: 'ไม่เหมาะสม: เป็นการบริการที่ไม่ใส่ใจและทำให้ลูกค้ารู้สึกไม่ได้รับการต้อนรับ',
      },
    ],
  },
  'payment-farewell': {
    situation: 'ลูกค้าเรียกเก็บเงินและต้องการแยกจ่ายบิล (Split Bill) เป็น 3 ท่านโดยแต่ละท่านสั่งรายการอาหารไม่เท่ากัน',
    prompt: 'ในฐานะพนักงานบริการ คุณควรจัดการและสื่อสารกับลูกค้าอย่างไร?',
    options: [
      {
        text: 'ยิ้มแย้มและตอบรับอย่างสุภาพ "ยินดีครับ ขออนุญาตตรวจสอบรายการของแต่ละท่านสักครู่เพื่อพิมพ์บิลแยกให้ถูกต้องครับ"',
        isCorrect: true,
        feedback: 'ถูกต้องยอดเยี่ยม! การบริการที่ยืดหยุ่นและรอบคอบในการคิดเงินสร้างความประทับใจสุดท้าย (Last Impression) ที่น่าจดจำ',
      },
      {
        text: 'บอกลูกค้าว่าร้านไม่มีนโยบายแยกบิล ให้ลูกค้าไปโอนเงินหารกันเอง',
        isCorrect: false,
        feedback: 'ไม่เหมาะสม: การปฏิเสธความช่วยเหลือในขั้นตอนสุดท้ายทำลายความประทับใจที่ดีของมื้ออาหารทั้งหมด',
      },
      {
        text: 'หยิบบิลรวมไปให้แล้วคิดเงินมั่วๆ หาร 3 คนเท่ากันโดยไม่ดูรายการ',
        isCorrect: false,
        feedback: 'ไม่ถูกต้อง: การคิดเงินไม่ตรงตามที่ลูกค้าบริโภคจริงจะนำไปสู่ข้อร้องเรียนเรื่องความไม่โปร่งใส',
      },
    ],
  },
}

function resolveScenarioDilemma(scenario: Scenario): Dilemma {
  // 1. Direct ID match
  if (scenarioDilemmas[scenario.id]) {
    return scenarioDilemmas[scenario.id]
  }

  // 2. Keyword matching on title, titleTh, description, activity
  const combined = `${scenario.id} ${scenario.title} ${scenario.titleTh} ${scenario.description} ${scenario.activity}`.toLowerCase()

  if (combined.includes('order') || combined.includes('menu') || combined.includes('สั่ง') || combined.includes('แนะนำ')) {
    return scenarioDilemmas['order-taking']
  }
  if (combined.includes('recover') || combined.includes('complain') || combined.includes('ร้องเรียน') || combined.includes('ช้า') || combined.includes('ผิด')) {
    return scenarioDilemmas['service-recovery']
  }
  if (combined.includes('bill') || combined.includes('pay') || combined.includes('จ่าย') || combined.includes('เช็คบิล') || combined.includes('อำลา')) {
    return scenarioDilemmas['payment-farewell']
  }
  if (combined.includes('welcome') || combined.includes('greet') || combined.includes('reserv') || combined.includes('ต้อนรับ') || combined.includes('จอง')) {
    return scenarioDilemmas['guest-welcome']
  }
  if (combined.includes('table') || combined.includes('setting') || combined.includes('fork') || combined.includes('spoon') || combined.includes('โต๊ะ') || combined.includes('มีด') || combined.includes('ส้อม')) {
    return scenarioDilemmas['table-setting']
  }

  // 3. Dynamic smart fallback customized to the actual scenario lesson
  const mainVocab = scenario.vocabulary.length > 0 ? scenario.vocabulary[0].word : 'Service'
  return {
    situation: `ในการปฏิบัติงานตามสถานการณ์ "${scenario.titleTh || scenario.title}" ลูกค้าชาวต่างชาติสอบถามและต้องการบริการเกี่ยวกับ "${scenario.title}"`,
    prompt: `ในฐานะพนักงานบริการระดับมืออาชีพ คุณควรตัดสินใจเลือกแนวทางการสื่อสารและการปฏิบัติข้อใด? (เน้นทักษะ: ${mainVocab})`,
    options: [
      {
        text: `ทักทายด้วยรอยยิ้มอย่างสุภาพ สื่อสารด้วยภาษาอังกฤษที่ชัดเจนและมั่นใจ และให้คำแนะนำหรือบริการตามขั้นตอนมาตรฐานสากลทันที`,
        isCorrect: true,
        feedback: 'ถูกต้องยอดเยี่ยม! การสื่อสารด้วยความสุภาพ มั่นใจ และมี Service Mind คือหัวใจสำคัญของมาตรฐานงานบริการสากล',
      },
      {
        text: 'ยืนนิ่ง ไม่สบตาลูกค้า และพยายามเดินเลี่ยงไปทางอื่นเพราะไม่มั่นใจในการสื่อสารภาษาอังกฤษ',
        isCorrect: false,
        feedback: 'ไม่ถูกต้อง: การหลีกเลี่ยงการบริการจะทำให้ลูกค้ารู้สึกขาดการดูแล หากไม่มั่นใจควรใช้ประโยคพื้นฐานหรือขอให้ผู้จัดการช่วยเหลือ',
      },
      {
        text: 'ตอบลูกค้าเป็นคำสั้นๆ แบบห้วนๆ และแสดงสีหน้าตึงเครียด',
        isCorrect: false,
        feedback: 'ไม่เหมาะสม: มารยาทและภาษากาย (Body Language) เป็นส่วนสำคัญอย่างยิ่งในการสร้างความประทับใจให้ผู้รับบริการ',
      },
    ],
  }
}

const defaultScenarios: Scenario[] = [
  {
    id: 'table-setting',
    title: 'Table Setting Challenge',
    titleTh: 'การจัดโต๊ะอาหารแบบเป็นทางการ',
    role: 'Food & Beverage Staff',
    description: 'ฝึกจัดลำดับอุปกรณ์บนโต๊ะอาหารแบบตะวันตก พร้อมเรียนรู้คำศัพท์และประโยคที่ใช้แนะนำการจัดโต๊ะแก่ผู้รับบริการ',
    activity: 'สำรวจอุปกรณ์ เรียนรู้หลัก Outside-In และทดลองอธิบายการจัดโต๊ะด้วยภาษาอังกฤษ',
    videoUrl: 'https://www.youtube.com/watch?v=Gk6Wq_8zE_s',
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
    videoUrl: 'https://www.youtube.com/watch?v=kYv9rE2t3e8',
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
    videoUrl: 'https://www.youtube.com/watch?v=0k1L7G9g7x8',
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
  const [speechRate, setSpeechRate] = useState<number>(() => getStoredSpeechRate())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'phase1' | 'phase2' | 'phase3' | 'phase4'>('all')
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<DetailView>('video')
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
        if (payload.scenarios?.length) {
          const sorted = [...payload.scenarios].sort((a, b) => {
            return getScenarioWeek(a, 0) - getScenarioWeek(b, 0)
          })
          setScenarios(sorted)
        }
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

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((s, idx) => {
      const week = getScenarioWeek(s, idx)
      if (selectedPhase === 'phase1' && (week < 1 || week > 4)) return false
      if (selectedPhase === 'phase2' && (week < 5 || week > 11)) return false
      if (selectedPhase === 'phase3' && (week < 12 || week > 16)) return false
      if (selectedPhase === 'phase4' && (week < 17 || week > 18)) return false

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const text = `${s.weeks || ''} สัปดาห์ที่ ${week} ${s.title} ${s.titleTh} ${s.description}`.toLowerCase()
        return text.includes(q)
      }
      return true
    })
  }, [scenarios, selectedPhase, searchQuery])

  function stopMedia() {
    window.speechSynthesis?.cancel()
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setSpeakingId(null)
    setRecordingId(null)
  }

  const [selectedDecision, setSelectedDecision] = useState<number | null>(null)
  const [decisionAnswered, setDecisionAnswered] = useState(false)

  function openScenario(id: string) {
    stopMedia()
    setActiveScenarioId(id)
    setActiveView('video')
    setExpandedWord(null)
    setSelectedDecision(null)
    setDecisionAnswered(false)
  }

  function closeScenario() {
    stopMedia()
    setActiveScenarioId(null)
    setActiveView('video')
    setExpandedWord(null)
    setSelectedDecision(null)
    setDecisionAnswered(false)
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
    utterance.rate = speechRate
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
      const evalRes = evaluateSentence(sentence, transcript)
      setResults(previous => ({ ...previous, [id]: evalRes }))
      if (evalRes.score >= 75) {
        toast.success(`ยอดเยี่ยม! ความถูกต้อง ${evalRes.score}% (+5 สมรรถนะ)`)
        void authenticatedFetch('/api/student/interact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: evalRes.score,
            sentence: `Scenario Speech: ${sentence}`,
          }),
        }).catch(() => undefined)
      } else {
        toast.warning(`ความถูกต้อง ${evalRes.score}% ลองฟังเสียงต้นแบบแล้วฝึกพูดใหม่อีกครั้ง`)
      }
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
    const dilemma: Dilemma = resolveScenarioDilemma(activeScenario)

    const tabs: Array<{ id: DetailView; label: string; count?: number }> = [
      { id: 'video', label: '🎬 วิดีโอ & ฝึกพูด' },
      { id: 'overview', label: 'ภาพรวม' },
      { id: 'decision', label: 'ตัดสินใจแก้ปัญหา' },
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0 14px' }}>
            <SpeechSpeedToggle currentRate={speechRate} onRateChange={setSpeechRate} />
          </div>

          {activeView === 'video' && (
            <section className={styles.contentSection}>
              <header className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionEyebrow}>Video Scenario & Speech Practice</span>
                  <h2>วิดีโอสถานการณ์จำลอง & ฝึกบทสนทนา</h2>
                  <p>ชมคลิปตัวอย่างจำลองสถานการณ์จากคุณครู และฝึกพูดประโยคบริการรายบุคคล</p>
                </div>
              </header>

              <div className={styles.videoSection}>
                {getYouTubeEmbedUrl(activeScenario.videoUrl) ? (
                  <div className={styles.videoCard}>
                    <div className={styles.videoWrapper}>
                      <iframe
                        src={getYouTubeEmbedUrl(activeScenario.videoUrl)!}
                        title={`วิดีโอสถานการณ์: ${activeScenario.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className={styles.videoContextBox}>
                      <div className={styles.videoContextItem}>
                        <span className={styles.videoContextLabel}>
                          <NavigateIcon name="target" size={14} /> แนวทางการเรียนรู้ & ประเด็นสังเกตจากคลิป
                        </span>
                        <p className={styles.videoContextText}>
                          {activeScenario.activity || 'สังเกตการจัดอุปกรณ์ ลำดับขั้นตอนการบริการ และการสื่อสารอย่างสุภาพ'}
                        </p>
                      </div>
                      <div className={styles.videoContextItem}>
                        <span className={styles.videoContextLabel}>
                          <NavigateIcon name="info" size={14} /> โครงเรื่องสถานการณ์ (Storyline)
                        </span>
                        <p className={styles.videoContextText}>{activeScenario.description}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyVideoBox}>
                    <NavigateIcon name="video" size={36} />
                    <strong>คุณครูยังไม่ได้แนบวิดีโอตัวอย่างสำหรับสถานการณ์นี้</strong>
                    <p>สามารถอ่านโครงเรื่อง แนวทางการเรียนรู้ และเริ่มฝึกพูดประโยคบริการด้านล่างได้ทันที</p>
                  </div>
                )}

                <div className={styles.videoPracticeCard}>
                  <div className={styles.videoPracticeHeader}>
                    <div>
                      <h3 style={{ fontSize: 16, margin: 0, color: '#153f30', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <NavigateIcon name="mic" size={18} /> ฝึกพูดประโยคจากสถานการณ์นี้ (Speaking Practice)
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#566e62' }}>
                        ฟังเสียงต้นแบบเจ้าของภาษา กดปุ่มไมโครโฟนเพื่อพูดตาม และรับการตรวจประเมินความถูกต้องรายคำแบบทันที
                      </p>
                    </div>
                  </div>

                  {activeScenario.sentences.length > 0 ? (
                    <div className={styles.sentenceList} style={{ marginTop: 14 }}>
                      {activeScenario.sentences.map((sentence, index) => {
                        const id = `video-sentence-${activeScenario.id}-${index}`
                        const audioId = `audio-${id}`
                        const result = results[id]
                        const recording = recordingId === id
                        return (
                          <article className={styles.sentenceCard} key={`${sentence}-${index}`}>
                            <div className={styles.sentenceTop}>
                              <span className={styles.sentenceIndex}>{String(index + 1).padStart(2, '0')}</span>
                              <p>{sentence}</p>
                            </div>
                            <div className={styles.sentenceActions}>
                              <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => speak(sentence, audioId)}
                              >
                                <NavigateIcon name={speakingId === audioId ? 'pause' : 'volume'} size={16} />
                                {speakingId === audioId ? 'หยุดเสียง' : 'ฟังเสียงต้นแบบ'}
                              </button>
                              <button
                                type="button"
                                className={`${styles.primaryButton} ${recording ? styles.recording : ''}`}
                                onClick={() => practice(sentence, id)}
                              >
                                <NavigateIcon name={recording ? 'pause' : 'mic'} size={16} />
                                {recording ? 'หยุดบันทึกเสียง' : 'พูดตามและประเมิน'}
                              </button>
                            </div>
                            {result && (
                              <div className={styles.resultPanel} aria-live="polite">
                                <div className={styles.resultHeader}>
                                  <span className={styles.resultIcon}>
                                    <NavigateIcon name={result.score >= 75 ? 'check' : 'refresh'} />
                                  </span>
                                  <div>
                                    <strong>ผลการประเมิน</strong>
                                    <span>
                                      {result.score >= 75
                                        ? 'ทำได้ดีมาก ผ่านเกณฑ์สมรรถนะ (+5 แต้ม)'
                                        : 'ฟังเสียงต้นแบบแล้วลองพูดใหม่อีกครั้ง'}
                                    </span>
                                  </div>
                                  <b>{result.score}%</b>
                                </div>
                                <div className={styles.wordResults}>
                                  {result.words.map((word, wordIndex) => (
                                    <span
                                      className={word.correct ? styles.correct : styles.incorrect}
                                      key={`${word.word}-${wordIndex}`}
                                    >
                                      {word.word}
                                    </span>
                                  ))}
                                </div>
                                <p className={styles.transcript}>ระบบได้ยิน: “{result.transcript}”</p>
                              </div>
                            )}
                          </article>
                        )
                      })}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <NavigateIcon name="message" size={24} />
                      <strong>ยังไม่มีประโยคฝึกในสถานการณ์นี้</strong>
                      <span>คุณครูสามารถเพิ่มประโยคได้จากหน้าแผนการสอน</span>
                    </div>
                  )}

                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => selectView('decision')}
                    >
                      <NavigateIcon name="target" size={16} /> ไปทดสอบการตัดสินใจ (Dilemma)
                    </button>
                    <Link
                      className={styles.launchButton}
                      href="/student/exhibit"
                    >
                      ไปขั้นถัดไป: E · Exhibit (สรุปผลและสะสมผลงาน) <NavigateIcon name="arrowRight" size={17} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeView === 'decision' && (
            <section className={styles.contentSection}>
              <header className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionEyebrow}>Branching Decision Dilemma</span>
                  <h2>ความท้าทายและการตัดสินใจเฉพาะหน้า</h2>
                  <p>วิเคราะห์สถานการณ์ เลือกแนวทางการปฏิบัติที่ดีที่สุดตามหลักมาตรฐานสากล</p>
                </div>
              </header>

              <div className={styles.dilemmaCard}>
                <div className={styles.dilemmaSituation}>
                  <h3>สถานการณ์จำลอง (Situation):</h3>
                  <p>{dilemma.situation}</p>
                </div>

                <p style={{ fontWeight: 500, fontSize: 13, color: '#1f382e', margin: '14px 0 8px' }}>
                  ❓ {dilemma.prompt}
                </p>

                <div className={styles.optionsGrid}>
                  {dilemma.options.map((opt, idx) => {
                    const isSelected = selectedDecision === idx
                    let btnClass = styles.optionBtn
                    if (isSelected) {
                      btnClass += ` ${styles.optionSelected}`
                      if (decisionAnswered) {
                        btnClass += opt.isCorrect ? ` ${styles.optionCorrect}` : ` ${styles.optionIncorrect}`
                      }
                    }
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={btnClass}
                        onClick={() => {
                          setSelectedDecision(idx)
                          setDecisionAnswered(true)
                          if (opt.isCorrect) {
                            toast.success('คำตอบถูกต้อง! +10 คะแนนสมรรถนะ (Competency)')
                            void authenticatedFetch('/api/student/interact', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ score: 100, sentence: `Decision: ${activeScenario.title}` }),
                            }).catch(() => undefined)
                          } else {
                            toast.warning('ยังไม่ตรงตามมาตรฐานงานบริการ ลองอ่านคำอธิบายเพิ่มเติม')
                          }
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#275f4d' }}>{String.fromCharCode(65 + idx)}.</span>
                        <span>{opt.text}</span>
                      </button>
                    )
                  })}
                </div>

                {decisionAnswered && selectedDecision !== null && (
                  <div className={`${styles.optionFeedback} ${dilemma.options[selectedDecision].isCorrect ? styles.optionFeedbackSuccess : styles.optionFeedbackFail}`}>
                    <strong>
                      {dilemma.options[selectedDecision].isCorrect ? '✅ คำอธิบายความถูกต้องตามมาตรฐานวิชาชีพ:' : '❌ คำแนะนำเพื่อการพัฒนา:'}
                    </strong>
                    <p style={{ margin: '6px 0 0' }}>{dilemma.options[selectedDecision].feedback}</p>
                    {dilemma.options[selectedDecision].isCorrect && (
                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={() => selectView('sentences')}
                        >
                          ไปฝึกพูดประโยคในสถานการณ์นี้ <NavigateIcon name="arrowRight" size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

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
                  <li><span>02</span><div><strong>ชมวิดีโอสถานการณ์</strong><p>สังเกตการปฏิบัติงานจริงและประเด็นสำคัญ</p></div></li>
                  <li><span>03</span><div><strong>ฝึกพูดประโยคบริการ</strong><p>ฟังเสียงต้นแบบและฝึกออกเสียงรายคำ</p></div></li>
                </ol>
                <button type="button" className={styles.launchButton} onClick={() => selectView('video')}>ชมวิดีโอ & ฝึกพูดทันที <NavigateIcon name="arrowRight" size={17} /></button>
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
          <header className={styles.catalogueHeader}>
            <div>
              <span className={styles.sectionEyebrow}>Scenario library</span>
              <h2>เลือกสถานการณ์ที่ต้องการฝึก</h2>
              <p>เนื้อหาจากแผนการสอนของคุณครู พร้อมใช้งานได้ทันที (เรียงลำดับจากสัปดาห์ที่ 1 ถึง 18)</p>
            </div>
          </header>

          {/* Search & Phase Filters */}
          <div className={styles.filterControls}>
            <div className={styles.searchWrap}>
              <NavigateIcon name="compass" size={16} />
              <input
                type="search"
                className={styles.searchInput}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหาสถานการณ์ (เช่น สัปดาห์ที่ 1, Cutlery, Table Setting, Taking Orders, Complaints)..."
              />
              {searchQuery && (
                <button type="button" className={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>
                  ✕ ล้างการค้นหา
                </button>
              )}
            </div>

            <div className={styles.phaseTabs}>
              {[
                { id: 'all', label: 'ทั้งหมด (สัปดาห์ที่ 1 - 18)' },
                { id: 'phase1', label: 'ระยะที่ 1: อุปกรณ์ & เมนู (สัปดาห์ 1-4)' },
                { id: 'phase2', label: 'ระยะที่ 2: ต้อนรับ & รับออร์เดอร์ (สัปดาห์ 5-11)' },
                { id: 'phase3', label: 'ระยะที่ 3: คำขอพิเศษ & ร้องเรียน (สัปดาห์ 12-16)' },
                { id: 'phase4', label: 'ระยะที่ 4: บริการครบวงจร (สัปดาห์ 17-18)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.phaseTab} ${selectedPhase === tab.id ? styles.phaseTabActive : ''}`}
                  onClick={() => setSelectedPhase(tab.id as typeof selectedPhase)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.scenarioGrid}>
            {filteredScenarios.map((scenario, index) => {
              const weekNum = getScenarioWeek(scenario, index)
              const cleanTitle = scenario.title.replace(/^แผนการจัดการเรียนรู้\s*สัปดาห์ที่\s*\d+\s*:\s*/i, '').trim()
              return (
                <button type="button" className={styles.scenarioCard} key={scenario.id} onClick={() => openScenario(scenario.id)}>
                  <span className={styles.scenarioAccent} aria-hidden="true" />
                  <span className={styles.scenarioTop}>
                    <span className={styles.weekPill}>
                      สัปดาห์ที่ {weekNum}
                    </span>
                    <span className={styles.scenarioIcon}><NavigateIcon name="compass" /></span>
                  </span>
                  <span className={styles.scenarioCopy}>
                    <span className={styles.scenarioLabel}>Service Scenario · สัปดาห์ที่ {String(weekNum).padStart(2, '0')}</span>
                    <strong>{cleanTitle || scenario.title}</strong>
                    <span className={styles.scenarioThai}>{scenario.titleTh}</span>
                    <span className={styles.scenarioDescription}>{scenario.description}</span>
                  </span>
                  <span className={styles.scenarioFooter}>
                    <span><NavigateIcon name="book" size={14} /> {scenario.vocabulary.length} คำศัพท์</span>
                    <span><NavigateIcon name="message" size={14} /> {scenario.sentences.length} ประโยค</span>
                    <span className={styles.openLabel}>เปิดสถานการณ์ <NavigateIcon name="arrowRight" size={15} /></span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
