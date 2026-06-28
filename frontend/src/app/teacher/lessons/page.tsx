'use client'
import { useState, useEffect } from 'react'
import { useRole } from '@/context/RoleContext'
import { supabase } from '@/lib/supabase'

// Detailed Lesson Plan Interface matching PDF structure
interface LessonPlan {
  id: string
  title: string
  subject: string
  level: string
  term: string
  duration: string
  targetClass: string
  weeks: string
  concept: string
  objectivesK: string[]
  objectivesS: string[]
  objectivesA: string[]
  objectivesAP: string[]
  vocabulary: string[]
  sentences: string[]
  activitiesLead: string
  activitiesF: string
  activitiesI: string
  activitiesN: string
  activitiesE: string
  activitiesWrap: string
  teacherName?: string
  teacherEmail?: string
}

interface AIScenario {
  id: string
  title: string
  lessonPlanId: string
  lessonPlanTitle: string
  category: 'Interact' | 'Navigate'
  prompt: string
  character: string
  imageUrl?: string
}

interface AR3DItem {
  id: string
  nameEn: string
  nameTh: string
  pronounce: string
  sentence: string
  desc: string
  imageUrl?: string
  glbUrl?: string
  usdzUrl?: string
}

interface Student {
  id: string
  studentId: string
  name: string
  class: string
  ksa: { K: number; S: number; A: number; C: number }
  sessions: number
  lastActive: string
  durationHours: number
  device: string
  logs: { time: string; action: string; score?: string }[]
}

// Initial Data loaded from PDF Example
const initialPlans: LessonPlan[] = [
  {
    id: 'plan-w1',
    title: 'หน่วยที่ 1: Restaurant Equipment Vocabulary',
    subject: '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service) (2-2-3)',
    level: 'ปวช.1 สาขาวิชาการโรงแรม',
    term: 'ภาคเรียนที่ 1',
    duration: '4 ชั่วโมง (240 นาที)',
    targetClass: 'ปวช.1/1',
    weeks: 'สัปดาห์ที่ 1',
    concept: 'การเรียนรู้คำศัพท์และอุปกรณ์ในห้องอาหารเป็นพื้นฐานสำคัญของการปฏิบัติงานบริการอาหารและเครื่องดื่ม ผู้เรียนจำเป็นต้องมีความรู้เกี่ยวกับชื่ออุปกรณ์ หน้าที่ วิธีการใช้งาน และสามารถสื่อสารภาษาอังกฤษในบริบทงานบริการได้อย่างถูกต้อง โดยบูรณาการ FINE Model 3D ร่วมกับเทคโนโลยี AR, AI และ Simulation-Based Learning',
    objectivesK: [
      'บอกชื่ออุปกรณ์ในห้องอาหารประเภท Cutlery, Glassware เป็นภาษาอังกฤษได้ถูกต้อง',
      'อธิบายหน้าที่และการใช้งานของอุปกรณ์บนโต๊ะอาหารแต่ละประเภทได้',
      'อธิบายหลักการจัดวางอุปกรณ์บนโต๊ะอาหารตามมาตรฐานแบบ Casual และ Formal ได้'
    ],
    objectivesS: [
      'ออกเสียงคำศัพท์อุปกรณ์และพูดประโยคสื่อสารผ่านระบบ AI ได้ถูกต้องตามหลักสัทศาสตร์',
      'ใช้เทคโนโลยี AR เพื่อสแกนและเรียนรู้โมเดลอุปกรณ์ 3D ได้อย่างคล่องแคล่ว',
      'จำแนกและจัดวางอุปกรณ์บนโต๊ะอาหารในสถานการณ์จำลอง (Simulation) ได้ถูกต้องตามหลัก Outside-In'
    ],
    objectivesA: [
      'มีความรับผิดชอบและวินัยในการปฏิบัติงานตามขั้นตอน',
      'มีความกล้าแสดงออกและมั่นใจในการใช้ภาษาอังกฤษเพื่อการสื่อสาร',
      'มีทักษะการทำงานร่วมกับผู้อื่นในฐานะทีมงานบริการ (Teamwork)',
      'เจตคติที่ดีและมีจิตบริการ (Service Mind) ต่อวิชาชีพการโรงแรม'
    ],
    objectivesAP: [
      'เลือกใช้อุปกรณ์ในห้องอาหารได้เหมาะสมกับประเภทการบริการ',
      'จัดวางอุปกรณ์บนโต๊ะอาหารตามสถานการณ์ที่กำหนดได้อย่างถูกต้อง',
      'ประยุกต์ใช้คำศัพท์ภาษาอังกฤษในการอธิบายอุปกรณ์และการจัดโต๊ะอาหารในสถานการณ์จำลองได้'
    ],
    vocabulary: [
      'Cutlery: Dinner Fork, Dinner Knife, Soup Spoon, Dessert Spoon, Teaspoon',
      'Glassware: Water Goblet, Red Wine Glass, White Wine Glass, Juice Glass, Champagne Glass'
    ],
    sentences: [
      'This is a [Equipment Name].',
      'It is used for [Function].',
      'We use [Equipment Name] for [Action].'
    ],
    activitiesLead: 'ครูเปิดวิดีโอ Food & Beverage Terminology Explained เพื่อกระตุ้นความคิดเรื่องอุปกรณ์ และชวนคิดเรื่องผลกระทบของการหยิบอุปกรณ์ผิดประเภท',
    activitiesF: 'ครูแจกใบงานคำศัพท์สแกน QR Code ดูโมเดล AR 3D (Cutlery / Glassware) จับคู่คำศัพท์ภาษาอังกฤษกับภาพโมเดล และใช้ AI Scan วิเคราะห์อุปกรณ์จริง',
    activitiesI: 'ฝึกออกเสียงคำศัพท์และแต่งประโยคระบุหน้าที่ผ่านระบบ Gemini และ Gemini Live และจัดกิจกรรมคู่หู (Pair Work) ถามตอบชิ้นอุปกรณ์',
    activitiesN: 'ทำกิจกรรมกลุ่ม "Restaurant Table Setup Challenge" แข่งจัดโต๊ะอาหารแบบเป็นทางการ (Formal Western) ตามหลัก Outside-In',
    activitiesE: 'ตัวแทนกลุ่มนำเสนอผลงานจัดโต๊ะเป็นภาษาอังกฤษ, ทำแบบทดสอบศัพท์ในห้องเรียนออนไลน์ (Quiz), ประเมินรายบุคคล',
    activitiesWrap: 'ครูและผู้เรียนสรุปหลักการร่วมกันเกี่ยวกับการจัดอุปกรณ์ และทำ Exit Ticket สรุปคำศัพท์ 5 คำก่อนออกจากห้องเรียน',
    teacherName: 'ครูสมหญิง รักเรียน',
    teacherEmail: 'teacher@school.ac.th'
  }
]

const initialScenarios: AIScenario[] = [
  { id: 'sc-1', title: 'การทักทายและลงทะเบียนลูกค้าที่ประตูเลาจน์', lessonPlanId: 'plan-w1', lessonPlanTitle: 'หน่วยที่ 1: Restaurant Equipment Vocabulary', category: 'Interact', prompt: 'คุณเป็นแขก VIP ชื่อ Mr. Smith ที่จองห้องพักราคาพิเศษไว้...', character: 'Mr. Smith (ลูกค้าผู้สุขุม)' },
  { id: 'sc-2', title: 'การอธิบายไวน์ขาวและไวน์แดงสำหรับคอร์สปลา', lessonPlanId: 'plan-w1', lessonPlanTitle: 'หน่วยที่ 1: Restaurant Equipment Vocabulary', category: 'Navigate', prompt: 'คุณต้องการสั่งปลาแซลมอนย่าง แต่สับสนว่าจะคู่กับไวน์ขาวตัวไหน...', character: 'Mrs. Davis (ลูกค้าคอไวน์)', imageUrl: '/images/hotel_wine_service.png' }
]

const initialARItems: AR3DItem[] = [
  { id: 'item-001', nameEn: 'Espresso Coffee Cup', nameTh: 'แก้วกาแฟเอสเปรสโซ่', pronounce: '/es-pres-oh kup/', sentence: 'Please serve the double espresso in a pre-heated cup.', desc: 'ถ้วยเซรามิกขนาดเล็ก (Demitasse) สำหรับเสิร์ฟกาแฟเอสเปรสโซ่ พร้อมจานรอง', imageUrl: '/images/espresso_cup_3d.png' },
  { id: 'item-002', nameEn: 'Cocktail Shaker', nameTh: 'กระบอกเขย่าค็อกเทล', pronounce: '/kok-teyl shey-ker/', sentence: 'Pour the ingredients into the cocktail shaker with ice.', desc: 'กระบอกโลหะแฮนด์ทัมเบลอร์สำหรับใช้เขย่าผสมเครื่องดื่มและกรองน้ำแข็งออก', imageUrl: '/images/cocktail_shaker_3d.png' },
  { id: 'item-003', nameEn: 'Wine Glass', nameTh: 'แก้วไวน์แดง', pronounce: '/wahyn glas/', sentence: 'Hold the wine glass by the stem to prevent warming the wine.', desc: 'แก้วคริสตัลทรงกว้างรูปทรงดอกทิวลิปสำหรับจับเสิร์ฟเครื่องดื่มไวน์แดงเพื่อรับกลิ่นหอม', imageUrl: '/images/wine_glass_3d.png', glbUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WineGlass/glTF-Binary/WineGlass.glb' },
  { id: 'item-004', nameEn: 'Soup Spoon', nameTh: 'ช้อนตักซุป', pronounce: '/soop spoon/', sentence: 'Place the soup spoon on the right side of the dinner plate.', desc: 'ช้อนตักซุปปลายมนหัวกลมกว้างออกแบบพิเศษสำหรับการรับประทานอาหารประเภทซุปใสหรือซุปข้น', imageUrl: '/images/soup_spoon_3d.png' },
  { id: 'item-005', nameEn: 'Dinner Plate', nameTh: 'จานอาหารหลัก', pronounce: '/din-er pleyt/', sentence: 'Serve the main course on a warm dinner plate.', desc: 'จานกระเบื้องเซรามิกสีขาวขนาดเส้นผ่านศูนย์กลาง 10-12 นิ้วสำหรับจัดเสิร์ฟอาหารจานหลักหลักสูตรสากล', imageUrl: '/images/plate_3d.png' }
]

const initialStudents: Student[] = [
  {
    id: 'std-1',
    studentId: '6720701-0001',
    name: 'นายสมชาย ใจดี',
    class: 'ปวช.1/1',
    ksa: { K: 82, S: 76, A: 85, C: 72 },
    sessions: 35,
    lastActive: '2 ชั่วโมงที่แล้ว',
    durationHours: 12.5,
    device: 'iPhone 15 Pro (Safari Mobile)',
    logs: [
      { time: '28 มิ.ย. 2569 11:20', action: 'ฝึกโต้ตอบ AI บทสนทนาการทักทาย Mr. Smith', score: '24/30 คะแนน (ผ่าน)' },
      { time: '27 มิ.ย. 2569 14:40', action: 'สแกน AR โมเดล 3D: Espresso Coffee Cup', score: 'สำเร็จ (ส่องกล้องสถิติกลมกล่อม)' },
      { time: '25 มิ.ย. 2569 09:15', action: 'ทำแบบทดสอบอุปกรณ์ในห้องอาหาร (Cutlery)', score: '8/10 คะแนน (ผ่าน)' }
    ]
  },
  {
    id: 'std-2',
    studentId: '6720701-0002',
    name: 'นางสาวมาลี สวยงาม',
    class: 'ปวช.1/1',
    ksa: { K: 95, S: 92, A: 94, C: 88 },
    sessions: 48,
    lastActive: '10 นาทีที่แล้ว',
    durationHours: 24.8,
    device: 'iPad Pro M4 (Chrome Mobile)',
    logs: [
      { time: '28 มิ.ย. 2569 12:45', action: 'ฝึกสนทนาระดับสูงอธิบายไวน์คอร์สปลากับ Mrs. Davis', score: '29/30 คะแนน (ดีเยี่ยม)' },
      { time: '28 มิ.ย. 2569 12:20', action: 'สแกน AR วิเคราะห์โมเดล 3D: Cocktail Shaker', score: 'สำเร็จ (วิเคราะห์สี/ส่วนประกอบ)' },
      { time: '27 มิ.ย. 2569 16:30', action: 'ทำแบบประเมินพฤติกรรมการเสิร์ฟอาหาร (Rubric)', score: '9/10 คะแนน' }
    ]
  },
  {
    id: 'std-3',
    studentId: '6720701-0003',
    name: 'นายพิชัย นักเรียน',
    class: 'ปวช.1/2',
    ksa: { K: 58, S: 52, A: 65, C: 48 },
    sessions: 15,
    lastActive: '3 วันที่แล้ว',
    durationHours: 4.2,
    device: 'Samsung Galaxy S24 (Android Chrome)',
    logs: [
      { time: '25 มิ.ย. 2569 10:10', action: 'เข้าห้องเรียนสแกนสมัครผ่านลิงก์ครูพิมพ์', score: 'ลงทะเบียนเข้าชั้นเรียน ปวช.1/2' },
      { time: '25 มิ.ย. 2569 10:30', action: 'ทำแบบทดสอบปฐมนิเทศ F&B Service Vocabulary', score: '5/10 คะแนน (ไม่ผ่าน)' }
    ]
  }
]

function generateScenarioSVG(title: string, character: string, category: string): string {
  const isInteract = category === 'Interact';
  const bgColor1 = isInteract ? '#102B1F' : '#8B2635';
  const bgColor2 = isInteract ? '#1E4D3A' : '#A62639';
  const emoji = isInteract ? '💬' : '🎭';
  const label = isInteract ? 'INTERACT SESSION' : 'NAVIGATE CHALLENGE';
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${bgColor2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <rect x="15" y="15" width="370" height="370" rx="20" fill="none" stroke="#C9A84C" stroke-width="2" stroke-opacity="0.4" />
      <rect x="30" y="35" width="160" height="26" rx="13" fill="#C9A84C" />
      <text x="110" y="52" fill="#102B1F" font-family="system-ui, sans-serif" font-size="10" font-weight="900" text-anchor="middle" letter-spacing="1">${label}</text>
      <text x="200" y="190" font-size="90" text-anchor="middle">${emoji}</text>
      <text x="200" y="270" fill="#FDFAF4" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">${character || 'ลูกค้าจำลอง'}</text>
      <text x="200" y="310" fill="#C9A84C" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">${title.substring(0, 26)}${title.length > 26 ? '...' : ''}</text>
      <text x="200" y="350" fill="#FDFAF4" fill-opacity="0.5" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle" letter-spacing="2">FINE MODEL AI SERVICE</text>
    </svg>
  `.trim().replace(/\\n/g, '').replace(/"/g, "'");
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function TeacherLessonsDashboard() {
  const { user } = useRole()
  const [activeTab, setActiveTab] = useState<'4.1' | '4.2' | '4.3' | '4.4' | '4.5'>('4.1')

  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [inviteShortCode, setInviteShortCode] = useState<string | null>(null)

  // Load plans on mount
  useEffect(() => {
    async function loadPlans() {
      const { data, error } = await supabase.from('fine_lesson_plans').select('*')
      if (data && data.length > 0) {
        const mappedPlans = data.map(dbPlan => ({
          id: dbPlan.id,
          title: dbPlan.title,
          subject: dbPlan.subject,
          level: dbPlan.level,
          term: dbPlan.term,
          duration: dbPlan.duration,
          targetClass: dbPlan.target_class,
          weeks: dbPlan.weeks,
          concept: dbPlan.concept,
          objectivesK: dbPlan.objectives_k || [],
          objectivesS: dbPlan.objectives_s || [],
          objectivesA: dbPlan.objectives_a || [],
          objectivesAP: dbPlan.objectives_ap || [],
          vocabulary: dbPlan.vocabulary || [],
          sentences: dbPlan.sentences || [],
          activitiesLead: dbPlan.activities_lead,
          activitiesF: dbPlan.activities_f,
          activitiesI: dbPlan.activities_i,
          activitiesN: dbPlan.activities_n,
          activitiesE: dbPlan.activities_e,
          activitiesWrap: dbPlan.activities_wrap,
          teacherName: dbPlan.teacher_name,
          teacherEmail: dbPlan.teacher_email
        }))
        setPlans(mappedPlans)
      } else {
        setPlans(initialPlans)
      }
    }
    loadPlans()
  }, [])

  // Sync plans to Supabase when changed
  useEffect(() => {
    if (typeof window !== 'undefined' && plans.length > 0) {
      const dbPlans = plans.map(p => ({
        id: p.id,
        title: p.title,
        subject: p.subject,
        level: p.level,
        term: p.term,
        duration: p.duration,
        target_class: p.targetClass,
        weeks: p.weeks,
        concept: p.concept,
        objectives_k: p.objectivesK,
        objectives_s: p.objectivesS,
        objectives_a: p.objectivesA,
        objectives_ap: p.objectivesAP,
        vocabulary: p.vocabulary,
        sentences: p.sentences,
        activities_lead: p.activitiesLead,
        activities_f: p.activitiesF,
        activities_i: p.activitiesI,
        activities_n: p.activitiesN,
        activities_e: p.activitiesE,
        activities_wrap: p.activitiesWrap,
        teacher_name: p.teacherName,
        teacher_email: p.teacherEmail
      }))
      supabase.from('fine_lesson_plans').upsert(dbPlans).then()
    }
  }, [plans])

  const [scenarios, setScenarios] = useState<AIScenario[]>(initialScenarios)
  const [arItems, setARItems] = useState<AR3DItem[]>([])
  const [students, setStudents] = useState<Student[]>(initialStudents)
  
  // Qr Modal controls
  const [showQrModal, setShowQrModal] = useState(false)
  const [selectedQrItem, setSelectedQrItem] = useState<AR3DItem | null>(null)

  // Load AR items on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam === '4.5') {
        setActiveTab('4.5')
      }

      async function fetchARItems() {
        try {
          const { data, error } = await supabase
            .from('fine_lesson_plans')
            .select('vocabulary')
            .eq('id', 'ar-items-store')
            .single()
          
          if (data && data.vocabulary) {
            const items = data.vocabulary as AR3DItem[]
            setARItems(items)
            localStorage.setItem('arItems', JSON.stringify(items))
            return
          }
        } catch (e) {
          console.error('Error fetching from Supabase:', e)
        }

        // Fallback to localStorage
        const stored = localStorage.getItem('arItems')
        if (stored) {
          try {
            setARItems(JSON.parse(stored))
          } catch (e) {
            setARItems(initialARItems)
          }
        } else {
          setARItems(initialARItems)
          localStorage.setItem('arItems', JSON.stringify(initialARItems))
        }
      }
      fetchARItems()
    }
  }, [])

  // Sync AR items to localStorage & Supabase when changed
  useEffect(() => {
    if (typeof window !== 'undefined' && arItems.length > 0) {
      localStorage.setItem('arItems', JSON.stringify(arItems))
      
      async function syncToSupabase() {
        try {
          await supabase
            .from('fine_lesson_plans')
            .upsert({
              id: 'ar-items-store',
              title: 'AR 3D Items Repository',
              vocabulary: arItems
            })
        } catch (e) {
          console.error('Error syncing to Supabase:', e)
        }
      }
      syncToSupabase()
    }
  }, [arItems])

  // Clipboard copy state
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // 4.1 Lesson Plan states
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [viewSyllabusPlan, setViewSyllabusPlan] = useState<LessonPlan | null>(null)
  const [editPlanId, setEditPlanId] = useState<string | null>(null)
  const [activeInvitePlan, setActiveInvitePlan] = useState<LessonPlan | null>(null)
  const [expandedPlans, setExpandedPlans] = useState<string[]>(['plan-w1'])

  function togglePlan(id: string) {
    setExpandedPlans(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }
  
  // Form fields
  const [pTitle, setPTitle] = useState('')
  const [pSubject, setPSubject] = useState('20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service) (2-2-3)')
  const [pLevel, setPLevel] = useState('ปวช.1 สาขาวิชาการโรงแรม')
  const [pTerm, setPTerm] = useState('ภาคเรียนที่ 1')
  const [pDuration, setPDuration] = useState('4 ชั่วโมง/สัปดาห์')
  const [pClass, setPClass] = useState('ปวช.1/1')
  const [pWeeks, setPWeeks] = useState('สัปดาห์ที่ 1')
  const [pConcept, setPConcept] = useState('')
  const [pK, setPK] = useState<string>('')
  const [pS, setPS] = useState<string>('')
  const [pA, setPA] = useState<string>('')
  const [pAP, setPAP] = useState<string>('')
  const [pVocab, setPVocab] = useState<string>('')
  const [pSentences, setPSentences] = useState<string>('')
  const [pLead, setPLead] = useState('')
  const [pFamiliarize, setPFamiliarize] = useState('')
  const [pInteract, setPInteract] = useState('')
  const [pNavigate, setPNavigate] = useState('')
  const [pExhibit, setPExhibit] = useState('')
  const [pWrap, setPWrap] = useState('')

  // 4.2 AI Scenario states
  const [sTitle, setSTitle] = useState('')
  const [sPlanId, setSPlanId] = useState('plan-w1')
  const [sCategory, setSCategory] = useState<'Interact' | 'Navigate'>('Interact')
  const [sPrompt, setSPrompt] = useState('')
  const [sCharacter, setSCharacter] = useState('')
  const [sImageUrl, setSImageUrl] = useState('')
  const [creationMode, setCreationMode] = useState<'manual' | 'ai'>('manual')
  const [aiFocusTopic, setAiFocusTopic] = useState('บริการต้อนรับลูกค้า VIP ด้านที่พักและอาหารค่ำแบบ Fine Dining')
  const [aiGeneratingScenario, setAiGeneratingScenario] = useState(false)
  const [aiGeneratingImage, setAiGeneratingImage] = useState(false)
  const [editScenarioId, setEditScenarioId] = useState<string | null>(null)

  // 4.5 AR Item states
  const [arEn, setAREn] = useState('')
  const [arTh, setARTh] = useState('')
  const [arPron, setARPron] = useState('')
  const [arSent, setARSent] = useState('')
  const [arDesc, setARDesc] = useState('')
  const [arImageUrl, setArImageUrl] = useState('')
  const [arGlbUrl, setArGlbUrl] = useState('')
  const [arUsdzUrl, setArUsdzUrl] = useState('')
  const [arCreationMode, setArCreationMode] = useState<'manual' | 'ai'>('manual')
  const [arAiTopic, setArAiTopic] = useState('แก้วไวน์แดงคริสตัล (Crystal Wine Glass)')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiGenerating3DImage, setAiGenerating3DImage] = useState(false)

  // 4.4 Assessment rubric states
  const [rubrics, setRubrics] = useState([
    { id: 'r1', name: 'เกณฑ์ประเมินการพูดและการทักทาย (Speaking Rubric)', max: 30, ksa: 'Skill (S)' },
    { id: 'r2', name: 'ประเมินพฤติกรรมการเสิร์ฟจริง (Observation Form)', max: 10, ksa: 'Attribute (A)' },
    { id: 'r3', name: 'ประเมินแบบจำลองภารกิจบริการลูกค้า (Simulation Rubric)', max: 40, ksa: 'Competency (C)' }
  ])
  const [newRubricName, setNewRubricName] = useState('')
  const [newRubricMax, setNewRubricMax] = useState(20)
  const [newRubricKsa, setNewRubricKsa] = useState('Skill (S)')

  // 4.3 Detailed Platform logs states
  const [selectedStudentLog, setSelectedStudentLog] = useState<Student | null>(null)
  const [sortByScore, setSortByScore] = useState<'none' | 'desc' | 'asc'>('none')

  // Load standard Week 1 template
  function loadWeek1Template() {
    setPTitle('หน่วยที่ 1: Restaurant Equipment Vocabulary')
    setPSubject('20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service) (2-2-3)')
    setPLevel('ปวช.1 สาขาวิชาการโรงแรม')
    setPTerm('ภาคเรียนที่ 1')
    setPDuration('4 ชั่วโมง (240 นาที)')
    setPClass('ปวช.1/1')
    setPWeeks('สัปดาห์ที่ 1')
    setPConcept('การเรียนรู้คำศัพท์และอุปกรณ์ในห้องอาหารเป็นพื้นฐานสำคัญของการปฏิบัติงานบริการอาหารและเครื่องดื่ม ผู้เรียนจำเป็นต้องมีความรู้เกี่ยวกับชื่ออุปกรณ์ หน้าที่ วิธีการใช้งาน และสามารถสื่อสารภาษาอังกฤษในบริบทงานบริการได้อย่างถูกต้อง โดยบูรณาการ FINE Model 3D ร่วมกับเทคโนโลยี AR, AI และ Simulation-Based Learning')
    setPK('บอกชื่ออุปกรณ์ Cutlery, Glassware ได้ถูกต้อง\nอธิบายหน้าที่ชิ้นอุปกรณ์แต่ละประเภทได้\nอธิบายการจัดวางแบบ Casual และ Formal ได้')
    setPS('ออกเสียงศัพท์ผ่าน AI ถูกต้อง\nใช้เทคโนโลยี AR สแกนโมเดล 3D\nจัดวางโต๊ะตามหลัก Outside-In ใน Simulation')
    setPA('ความรับผิดชอบและวินัย\nความมั่นใจการสื่อสารอังกฤษ\nทักษะการทำงานร่วมกับผู้อื่น\nจิตบริการต่อวิชาชีพการโรงแรม')
    setPAP('เลือกใช้อุปกรณ์ได้เหมาะสม\nจัดอุปกรณ์โต๊ะอาหารตามโจทย์\nอธิบายการจัดวางในสถานการณ์จำลอง')
    setPVocab('Cutlery: Dinner Fork, Dinner Knife, Soup Spoon, Dessert Spoon\nGlassware: Water Goblet, Red Wine Glass, White Wine Glass, Champagne Glass')
    setPSentences('This is a [Equipment].\nIt is used for [Function].\nWe use [Equipment] for [Action].')
    setPLead('เปิดวิดีโอกระตุ้นการเรียนรู้ F&B Terminology และระดมสมองคำถามนำเข้าบทเรียน')
    setPFamiliarize('แจกใบงานศัพท์, สแกน QR Code ดูโมเดล AR 3D, จัดคู่คำศัพท์วางข้างโต๊ะจริง และใช้ AI Scan วิเคราะห์อุปกรณ์จริง')
    setPInteract('นักเรียนฝึกออกเสียงและแต่งประโยคในแอปกับ AI Gemini และ Gemini Live และเล่นคู่หูทายชิ้นอุปกรณ์')
    setPNavigate('แข่งจัดโต๊ะ "Restaurant Table Setup Challenge" แบบกลุ่มตามการ์ดโจทย์ระดับโรงแรม 6 ดาว')
    setPExhibit('นำเสนอผลงานพูดอังกฤษหน้าโต๊ะ, ทดสอบวิชาการคำศัพท์ (Quiz), บันทึกการส่งงาน Rubric')
    setPWrap('ครูและนักเรียนสะสมความรู้ประมวลผล สรุปชิ้นงาน และทำ Exit Ticket ส่งคำศัพท์ 5 คำก่อนกลับบ้าน')
  }

  // 4.1 Plan CRUD functions
  function handleOpenPlanCreate() {
    setEditPlanId(null)
    setPTitle('')
    setPConcept('')
    setPK('')
    setPS('')
    setPA('')
    setPAP('')
    setPVocab('')
    setPSentences('')
    setPLead('')
    setPFamiliarize('')
    setPInteract('')
    setPNavigate('')
    setPExhibit('')
    setPWrap('')
    setShowPlanModal(true)
  }

  function handleOpenPlanEdit(plan: LessonPlan) {
    setEditPlanId(plan.id)
    setPTitle(plan.title)
    setPSubject(plan.subject)
    setPLevel(plan.level)
    setPTerm(plan.term)
    setPDuration(plan.duration)
    setPClass(plan.targetClass)
    setPWeeks(plan.weeks)
    setPConcept(plan.concept)
    setPK(plan.objectivesK.join('\n'))
    setPS(plan.objectivesS.join('\n'))
    setPA(plan.objectivesA.join('\n'))
    setPAP(plan.objectivesAP.join('\n'))
    setPVocab(plan.vocabulary.join('\n'))
    setPSentences(plan.sentences.join('\n'))
    setPLead(plan.activitiesLead)
    setPFamiliarize(plan.activitiesF)
    setPInteract(plan.activitiesI)
    setPNavigate(plan.activitiesN)
    setPExhibit(plan.activitiesE)
    setPWrap(plan.activitiesWrap)
    setShowPlanModal(true)
  }

  function handleSavePlan(e: React.FormEvent) {
    e.preventDefault()
    if (!pTitle) return

    const parsedK = pK.split('\n').filter(Boolean)
    const parsedS = pS.split('\n').filter(Boolean)
    const parsedA = pA.split('\n').filter(Boolean)
    const parsedAP = pAP.split('\n').filter(Boolean)
    const parsedVoc = pVocab.split('\n').filter(Boolean)
    const parsedSent = pSentences.split('\n').filter(Boolean)

    if (editPlanId) {
      // Edit
      setPlans(prev => prev.map(p => p.id === editPlanId ? {
        ...p,
        title: pTitle,
        subject: pSubject,
        level: pLevel,
        term: pTerm,
        duration: pDuration,
        targetClass: pClass,
        weeks: pWeeks,
        concept: pConcept,
        objectivesK: parsedK,
        objectivesS: parsedS,
        objectivesA: parsedA,
        objectivesAP: parsedAP,
        vocabulary: parsedVoc,
        sentences: parsedSent,
        activitiesLead: pLead,
        activitiesF: pFamiliarize,
        activitiesI: pInteract,
        activitiesN: pNavigate,
        activitiesE: pExhibit,
        activitiesWrap: pWrap,
        teacherName: p.teacherName || user?.name || 'ครูสมหญิง รักเรียน',
        teacherEmail: p.teacherEmail || user?.email || 'teacher@school.ac.th'
      } : p))
      alert('แก้ไขแผนการจัดการเรียนรู้รายสัปดาห์เรียบร้อย!')
    } else {
      // Create
      const newPlan: LessonPlan = {
        id: `plan-${Date.now()}`,
        title: pTitle,
        subject: pSubject,
        level: pLevel,
        term: pTerm,
        duration: pDuration,
        targetClass: pClass,
        weeks: pWeeks,
        concept: pConcept || 'รายละเอียดสาระสำคัญ',
        objectivesK: parsedK.length ? parsedK : ['บอกชื่ออุปกรณ์ได้ถูกต้อง'],
        objectivesS: parsedS.length ? parsedS : ['ออกเสียงผ่าน AI ถูกต้อง'],
        objectivesA: parsedA.length ? parsedA : ['มีความรับผิดชอบ'],
        objectivesAP: parsedAP.length ? parsedAP : ['เลือกใช้อุปกรณ์ได้ถูกต้อง'],
        vocabulary: parsedVoc.length ? parsedVoc : ['Cutlery, Glassware'],
        sentences: parsedSent.length ? parsedSent : ['This is a cup.'],
        activitiesLead: pLead || 'ขั้นนำเข้าสู่บทเรียน',
        activitiesF: pFamiliarize || 'กิจกรรม Familiarize (AR)',
        activitiesI: pInteract || 'กิจกรรม Interact (AI)',
        activitiesN: pNavigate || 'กิจกรรม Navigate (Simulation)',
        activitiesE: pExhibit || 'กิจกรรม Exhibit (Rubric)',
        activitiesWrap: pWrap || 'ขั้นสรุปการเรียนรู้',
        teacherName: user?.name || 'ครูสมหญิง รักเรียน',
        teacherEmail: user?.email || 'teacher@school.ac.th'
      }
      setPlans(prev => [newPlan, ...prev])
      alert('สร้างแผนการจัดการเรียนรู้รายสัปดาห์สำเร็จ!')
    }
    setShowPlanModal(false)
  }

  function handleDeletePlan(id: string) {
    if (confirm('คุณต้องการลบแผนการจัดการเรียนรู้นี้หรือไม่?')) {
      setPlans(prev => prev.filter(p => p.id !== id))
      supabase.from('fine_lesson_plans').delete().eq('id', id).then()
    }
  }

  function handleShowInviteModal(plan: LessonPlan) {
    setActiveInvitePlan(plan)
    const teacherName = user?.name || 'ครูผู้สอน'
    const schoolName = user?.school || 'วิทยาลัยอาชีวศึกษา'
    
    const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setInviteShortCode(shortCode)
    
    supabase.from('class_invites').insert({
      short_code: shortCode,
      target_class: plan.targetClass,
      teacher_name: teacherName,
      school_name: schoolName,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }).then()

    const origin = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? window.location.origin
      : 'https://krupim-finemodel3d-ar.com'
    const url = `${origin}/register-student?code=${shortCode}`
    
    navigator.clipboard.writeText(url)
    setCopiedId(plan.id)
    setTimeout(() => setCopiedId(null), 3000)
  }

  // 4.2 AI Scenario Builder
  function handleAddScenario(e: React.FormEvent) {
    e.preventDefault()
    if (!sTitle || !sPrompt) return

    const linkedPlan = plans.find(p => p.id === sPlanId)
    const planTitle = linkedPlan ? linkedPlan.title : 'แผนการเรียนรู้อื่นๆ'

    if (editScenarioId) {
      // Edit mode
      setScenarios(prev => prev.map(s => s.id === editScenarioId ? {
        ...s,
        title: sTitle,
        lessonPlanId: sPlanId,
        lessonPlanTitle: planTitle,
        category: sCategory,
        prompt: sPrompt,
        character: sCharacter || 'ลูกค้าทั่วไป',
        imageUrl: sImageUrl || undefined
      } : s))
      setEditScenarioId(null)
      alert('แก้ไขสถานการณ์จำลอง AI สำเร็จ!')
    } else {
      // Create mode
      const newSc: AIScenario = {
        id: `sc-${Date.now()}`,
        title: sTitle,
        lessonPlanId: sPlanId,
        lessonPlanTitle: planTitle,
        category: sCategory,
        prompt: sPrompt,
        character: sCharacter || 'ลูกค้าทั่วไป',
        imageUrl: sImageUrl || undefined
      }
      setScenarios(prev => [newSc, ...prev])
      alert('สร้างสถานการณ์จำลอง AI สำเร็จ!')
    }

    setSTitle('')
    setSPrompt('')
    setSCharacter('')
    setSImageUrl('')
  }

  function handleOpenScenarioEdit(sc: AIScenario) {
    setEditScenarioId(sc.id)
    setSTitle(sc.title)
    setSPlanId(sc.lessonPlanId)
    setSCategory(sc.category)
    setSPrompt(sc.prompt)
    setSCharacter(sc.character)
    setSImageUrl(sc.imageUrl || '')
  }

  async function handleAIGenerateScenario() {
    if (!aiFocusTopic) {
      alert('กรุณากรอกหัวข้อจุดประสงค์จำลองก่อน')
      return
    }
    setAiGeneratingScenario(true)
    
    const linkedPlan = plans.find(p => p.id === sPlanId)
    const planContext = linkedPlan ? `แผนการสอนเรื่อง: ${linkedPlan.title}. คลังคำศัพท์ที่เรียน: ${linkedPlan.vocabulary.join(', ')}` : ''

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const resp = await fetch(`${backendUrl}/api/blog/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `ออกแบบบทบาทสมมติ (System Prompt) ของลูกค้าภาษาอังกฤษระดับ 5 ดาว สำหรับนักเรียนฝึกบริการอาหารโรงแรม หัวข้อโจทย์: ${aiFocusTopic}. ข้อมูลบริบทบทเรียน: ${planContext}.`,
          category: 'Hotel Scenario',
          tone: 'Professional System Prompt for AI chatbot roleplay',
          keywords: aiFocusTopic
        })
      })

      if (!resp.ok) throw new Error()
      const data = await resp.json()
      
      // Auto-populate based on AI result
      const autoTitle = `AI Scenario: ${aiFocusTopic}`
      const autoCharacter = 'Guest / แขกผู้ใช้บริการ (AI Generated)'
      setSTitle(autoTitle)
      setSCharacter(autoCharacter)
      setSPrompt(data.content || `คุณเป็นลูกค้าโรงแรมห้าดาวที่พบปัญหาคือ: ${aiFocusTopic}. หน้าที่ของคุณคือโต้ตอบเป็นภาษาอังกฤษเพื่อให้บริกรแก้ปัญหาตามหลักการบริการที่เป็นเลิศ (Service Mind)`)
      setSImageUrl(generateScenarioSVG(autoTitle, autoCharacter, sCategory))
      alert('เจเนอเรตสถานการณ์และเขียน System Prompt สำเร็จ! กรุณาตรวจสอบและกดบันทึก')
    } catch {
      // Fallback in case of offline/error
      setSTitle(`จำลองสถานการณ์: ${aiFocusTopic}`)
      setSCharacter('Guest Mr. David (AI Fallback)')
      setSPrompt(`You are Mr. David, a customer at a luxury hotel restaurant. You want to practice: ${aiFocusTopic}. Respond politely in English but require proper vocabulary. When the service student serves correctly, congratulate them.`)
      alert('สร้างสถานการณ์สำเร็จ (Fallback Mode)')
    } finally {
      setAiGeneratingScenario(false)
    }
  }

  function handleDeleteScenario(id: string) {
    setScenarios(prev => prev.filter(s => s.id !== id))
  }

  // 4.5 AI Gemini Description Helper
  async function generateARDescription() {
    if (!arEn) {
      alert('กรุณากรอกชื่อภาษาอังกฤษก่อนเพื่อให้ AI สรุปข้อมูลให้')
      return
    }
    setAiGenerating(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const resp = await fetch(`${backendUrl}/api/blog/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `เขียนอธิบายสั้นๆ เกี่ยวกับอุปกรณ์บริการอาหารและบาร์: "${arEn}" สำหรับการเรียนรู้วิชาโรงแรม`,
          category: 'Table Setting',
          tone: 'ให้ความรู้และวิชาการสั้นๆ 1 ประโยค',
          keywords: arEn
        })
      })
      if (!resp.ok) throw new Error()
      const data = await resp.json()
      setARDesc(data.excerpt || `อุปกรณ์หลักระดับพรีเมียมสำหรับการเสิร์ฟ ${arEn}`)
    } catch {
      setARDesc(`อุปกรณ์ระดับมืออาชีพสำหรับใช้ในการเสิร์ฟและการจัดการในแผนกอาหารและเครื่องดื่ม`)
    } finally {
      setAiGenerating(false)
    }
  }

  async function handleAIGenerateARItem() {
    if (!arAiTopic) {
      alert('กรุณากรอกชื่ออุปกรณ์ที่ต้องการให้ AI เจนรายละเอียดให้')
      return
    }
    setAiGenerating(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const resp = await fetch(`${backendUrl}/api/blog/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `เขียนข้อมูลเกี่ยวกับอุปกรณ์ในห้องอาหารหรือบาร์โรงแรม: ${arAiTopic} สำหรับใช้ฝึกสอนเด็กปวช.
ตอบกลับในรูปแบบเดียวบรรทัดเดียวเท่านั้น ห้ามมีเครื่องหมายอัญประกาศครอบ ห้ามมีคำอธิบายอื่น ห้ามเขียนอักษรอื่นนอกจากรูปแบบนี้:
ชื่อภาษาอังกฤษ|ชื่อภาษาไทย|คำอ่านออกเสียง|ประโยคภาษาอังกฤษตัวอย่างการใช้งานเสิร์ฟ|คำอธิบายสั้นๆ ภาษาไทย`
        })
      })
      if (!resp.ok) throw new Error()
      const data = await resp.json()
      const content = data.content || ''
      const parts = content.split('|')
      if (parts.length >= 5) {
        const autoEn = parts[0].trim().replace(/^"|"$/g, '')
        const autoTh = parts[1].trim().replace(/^"|"$/g, '')
        const autoPron = parts[2].trim().replace(/^"|"$/g, '')
        const autoSent = parts[3].trim().replace(/^"|"$/g, '')
        const autoDesc = parts[4].trim().replace(/^"|"$/g, '')
        
        setAREn(autoEn)
        setARTh(autoTh)
        setARPron(autoPron)
        setARSent(autoSent)
        setARDesc(autoDesc)

        // Map Image URL based on keywords
        const lowerEn = autoEn.toLowerCase()
        let autoImg = '/images/espresso_cup_3d.png'
        if (lowerEn.includes('spoon') || lowerEn.includes('cutlery') || lowerEn.includes('fork') || lowerEn.includes('knife')) {
          autoImg = '/images/soup_spoon_3d.png'
        } else if (lowerEn.includes('glass') || lowerEn.includes('wine') || lowerEn.includes('champagne') || lowerEn.includes('goblet')) {
          autoImg = '/images/wine_glass_3d.png'
        } else if (lowerEn.includes('plate') || lowerEn.includes('dish') || lowerEn.includes('bowl')) {
          autoImg = '/images/plate_3d.png'
        } else if (lowerEn.includes('shaker') || lowerEn.includes('cocktail') || lowerEn.includes('mix')) {
          autoImg = '/images/cocktail_shaker_3d.png'
        }
        setArImageUrl(autoImg)
        setArCreationMode('manual')
        alert('AI จัดร่างรายละเอียดและแมปภาพโมเดล 3D สำเร็จ! ท่านสามารถตรวจสอบและกดบันทึกเข้าคลังด้านล่าง')
      } else {
        throw new Error('Invalid format')
      }
    } catch {
      // Fallback
      setAREn(arAiTopic)
      setARTh(arAiTopic)
      setARPron('/pronunciation/')
      setARSent(`Please use the ${arAiTopic} for professional F&B service.`)
      setARDesc(`อุปกรณ์จำลองการจัดเสิร์ฟ: ${arAiTopic}`)
      
      const lowerEn = arAiTopic.toLowerCase()
      let autoImg = '/images/espresso_cup_3d.png'
      if (lowerEn.includes('spoon') || lowerEn.includes('cutlery') || lowerEn.includes('fork') || lowerEn.includes('knife')) {
        autoImg = '/images/soup_spoon_3d.png'
      } else if (lowerEn.includes('glass') || lowerEn.includes('wine') || lowerEn.includes('champagne') || lowerEn.includes('goblet')) {
        autoImg = '/images/wine_glass_3d.png'
      } else if (lowerEn.includes('plate') || lowerEn.includes('dish') || lowerEn.includes('bowl')) {
        autoImg = '/images/plate_3d.png'
      } else if (lowerEn.includes('shaker') || lowerEn.includes('cocktail') || lowerEn.includes('mix')) {
        autoImg = '/images/cocktail_shaker_3d.png'
      }
      setArImageUrl(autoImg)
      setArCreationMode('manual')
      alert('จัดร่างอุปกรณ์สำเร็จ (โหมดจำลองออฟไลน์)')
    } finally {
      setAiGenerating(false)
    }
  }

  // 4.5 AR Item Creator
  function handleAddARItem(e: React.FormEvent) {
    e.preventDefault()
    if (!arEn || !arTh) return

    const newItem: AR3DItem = {
      id: `item-${Date.now()}`,
      nameEn: arEn,
      nameTh: arTh,
      pronounce: arPron || `/name/`,
      sentence: arSent || 'Please use this item correctly.',
      desc: arDesc || 'คำอธิบายทั่วไปเกี่ยวกับชิ้นอุปกรณ์',
      imageUrl: arImageUrl || '/images/espresso_cup_3d.png',
      glbUrl: arGlbUrl || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      usdzUrl: arUsdzUrl
    }

    setARItems(prev => [...prev, newItem])
    setAREn('')
    setARTh('')
    setARPron('')
    setARSent('')
    setARDesc('')
    setArImageUrl('')
    setArGlbUrl('')
    setArUsdzUrl('')
    alert('เพิ่มโมเดล 3 มิติ และสแกนอุปกรณ์เข้าคลังสำเร็จ!')
  }

  function handleDeleteARItem(id: string) {
    setARItems(prev => prev.filter(i => i.id !== id))
  }

  // 4.4 Assessment Builder
  function handleAddRubric(e: React.FormEvent) {
    e.preventDefault()
    if (!newRubricName) return
    const newRb = {
      id: `r-${Date.now()}`,
      name: newRubricName,
      max: newRubricMax,
      ksa: newRubricKsa
    }
    setRubrics(prev => [...prev, newRb])
    setNewRubricName('')
    alert('บันทึกเกณฑ์รูบริคสำเร็จ!')
  }

  function handleDeleteRubric(id: string) {
    setRubrics(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>
      
      {/* LEFT SIDEBAR: Sub-Menu Selection Card */}
      <div className="erp-card" style={{ width: '280px', flexShrink: 0, padding: '16px' }}>
        <div style={{ fontWeight: 700, fontSize: '12px', color: '#C9A84C', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', paddingLeft: '8px' }}>
          เมนูจัดการเรียนรู้
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: '4.1', label: 'Lesson Plan', icon: '📖' },
            { id: '4.5', label: 'AR & 3D Items', icon: '🎨' },
            { id: '4.2', label: 'AI Scenario', icon: '⚡' },
            { id: '4.4', label: 'Assessment', icon: '📋' },
            { id: '4.3', label: 'Class Analytics', icon: '📊' },
          ].map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  padding: '12px 16px', border: 'none', borderRadius: '12px',
                  fontFamily: 'var(--font-primary)', fontSize: '13px', fontWeight: isActive ? 700 : 500,
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  background: isActive ? 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)' : 'transparent',
                  color: isActive ? '#FDFAF4' : '#4A4138',
                  boxShadow: isActive ? '0 4px 12px rgba(16,43,31,0.15)' : 'none',
                  borderLeft: isActive ? '4px solid #C9A84C' : 'none'
                }}
              >
                <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* RIGHT CONTENT CONTAINER */}
      <div style={{ flex: 1, minWidth: 0 }}>
        
        {/* =============================================================== */}
        {/* TAB 4.1: Lesson Plan */}
        {/* =============================================================== */}
        {activeTab === '4.1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#C9A84C', fontWeight: 650, letterSpacing: '1px' }}>WEEKLY SYLLABUS BUILDER</span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px', color: '#1E4D3A' }}>ออกแบบแผนการสอน FINE MODEL</h2>
              </div>
              <button onClick={handleOpenPlanCreate} className="btn btn-primary" style={{ border: 'none', padding: '10px 18px' }}>
                ➕ สร้างแผนรายสัปดาห์ใหม่
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {plans.map(p => {
                const isExpanded = expandedPlans.includes(p.id)
                return (
                  <div key={p.id} className="erp-card" style={{ borderLeft: '4px solid #C9A84C', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div onClick={() => togglePlan(p.id)} style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge" style={{ background: '#EAF3EE', color: '#1E4D3A', fontWeight: 700 }}>{p.weeks}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ห้องเรียนที่จัดสอน: {p.targetClass}</span>
                          <span style={{ fontSize: '11px', color: '#A6882A', fontWeight: 700 }}>{isExpanded ? '▲ ซ่อนแผน' : '▼ ดูรายละเอียดแผน'}</span>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E4D3A', marginTop: '6px' }}>{p.title}</h3>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>รายวิชา: {p.subject}</div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => setViewSyllabusPlan(p)} className="btn btn-primary btn-sm" style={{ border: 'none', padding: '6px 12px' }}>
                          📄 พิมพ์คู่มือแผนการสอน
                        </button>
                        <button onClick={() => handleShowInviteModal(p)} className="btn btn-outline btn-sm" style={{ borderColor: 'rgba(201,168,76,0.3)', color: '#A6882A' }}>
                          🔗 {copiedId === p.id ? 'ก๊อปปี้แล้ว!' : 'แชร์ลิงก์ / QR'}
                        </button>
                        <button onClick={() => handleOpenPlanEdit(p)} className="btn btn-outline btn-sm">แก้ไข</button>
                        <button onClick={() => handleDeletePlan(p.id)} className="btn btn-outline btn-sm" style={{ color: '#8B2635', borderColor: '#FAE8EB' }}>ลบ</button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid #EDE9E1', paddingTop: '14px' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, background: '#FDFAF4', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #C9A84C', margin: 0 }}>
                          <strong>สาระสำคัญ:</strong> {p.concept}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A', margin: '0 0 6px 0' }}>🎯 จุดประสงค์รายวิชา (KSA)</h4>
                            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '20px', margin: 0, lineHeight: 1.6 }}>
                              {p.objectivesK.map((o, idx) => <li key={idx}><strong>K:</strong> {o}</li>)}
                              {p.objectivesS.map((o, idx) => <li key={idx}><strong>S:</strong> {o}</li>)}
                              {p.objectivesA.map((o, idx) => <li key={idx}><strong>A:</strong> {o}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A', margin: '0 0 6px 0' }}>📚 คลังคำศัพท์ & รูปประโยค</h4>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: '#FDFAF4', padding: '10px', borderRadius: '8px', lineHeight: 1.5 }}>
                              <strong>Vocabulary:</strong> {p.vocabulary.join(', ')}<br />
                              <strong>Sentences:</strong> {p.sentences.join(' / ')}
                            </div>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '14px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A', margin: '0 0 8px 0' }}>🚀 ลำดับกิจกรรมการเรียนรู้แบบละเอียด (FINE Model)</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                            {[
                              { label: 'Familiarize (F)', content: p.activitiesF, icon: '🤖' },
                              { label: 'Interact (I)', content: p.activitiesI, icon: '💬' },
                              { label: 'Navigate (N)', content: p.activitiesN, icon: '🎭' },
                              { label: 'Exhibit (E)', content: p.activitiesE, icon: '🏆' }
                            ].map(st => (
                              <div key={st.label} style={{ background: '#FDFAF4', padding: '10px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.1)' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E4D3A' }}>{st.icon} {st.label}</div>
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0, lineHeight: 1.4 }}>{st.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4.2: AI Scenario */}
        {/* =============================================================== */}
        {activeTab === '4.2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="erp-card">
              <span style={{ fontSize: '11px', color: '#C9A84C', fontWeight: 650, letterSpacing: '1px' }}>AI SCENARIO GENERATOR</span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px', color: '#1E4D3A' }}>จัดการสถานการณ์ฝึกปฏิบัติผ่าน AI</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Scenario list */}
              <div className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E4D3A', borderBottom: '1px solid #EDE9E1', paddingBottom: '8px', margin: 0 }}>
                  สถานการณ์ในระบบปัจจุบัน ({scenarios.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {scenarios.map(s => (
                    <div key={s.id} style={{ padding: '12px', background: '#FDFAF4', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'start' }}>
                      {s.imageUrl && (
                        <img src={s.imageUrl} alt={s.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span className="badge" style={{ background: '#EAF3EE', color: '#1E4D3A', fontSize: '9px' }}>{s.category}</span>
                          <span style={{ fontSize: '10px', color: '#A6882A', fontWeight: 700 }}>บทเรียน: {s.lessonPlanTitle}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>บทบาท AI: {s.character}</span>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px', color: '#1E4D3A', margin: '4px 0 0 0' }}>{s.title}</h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic', lineHeight: 1.4, wordBreak: 'break-word', margin: '4px 0 0 0' }}>{s.prompt}</p>
                      </div>
                      
                      {/* Scenario Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                        <button
                          onClick={() => handleOpenScenarioEdit(s)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 8px', fontSize: '10px', borderColor: 'rgba(201,168,76,0.3)', color: '#A6882A' }}
                        >
                          แก้ไข
                        </button>
                        <button onClick={() => handleDeleteScenario(s.id)} style={{ border: 'none', background: 'transparent', color: '#8B2635', fontSize: '15px', cursor: 'pointer' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Creator Form with Manual / AI options */}
              <div className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ borderBottom: '1px solid #EDE9E1', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E4D3A', margin: 0 }}>
                    {editScenarioId ? '📝 แก้ไขสถานการณ์จำลอง AI' : '➕ จัดทำสถานการณ์จำลอง AI'}
                  </h3>
                  {editScenarioId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditScenarioId(null);
                        setSTitle('');
                        setSPrompt('');
                        setSCharacter('');
                        setSImageUrl('');
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#8B2635', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ยกเลิกแก้ไข ✕
                    </button>
                  )}
                </div>
                
                <div style={{ borderBottom: '1px solid #EDE9E1', paddingBottom: '10px' }}>
                  {/* Mode switcher tabs */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setCreationMode('manual')}
                      style={{
                        flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.3)',
                        fontFamily: 'var(--font-primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                        background: creationMode === 'manual' ? '#1E4D3A' : '#FDFAF4',
                        color: creationMode === 'manual' ? '#FDFAF4' : '#1E4D3A'
                      }}
                    >
                      ✏️ สร้างแบบจำลอง
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreationMode('ai')}
                      style={{
                        flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.3)',
                        fontFamily: 'var(--font-primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                        background: creationMode === 'ai' ? '#A6882A' : '#FDFAF4',
                        color: creationMode === 'ai' ? '#FDFAF4' : '#A6882A'
                      }}
                    >
                      🤖 เขียนด้วย AI Gemini
                    </button>
                  </div>
                </div>

                <div className="erp-form-group">
                  <label className="erp-label">เชื่อมโยงต่อเนื่องจากแผนการสอน (Lesson Plan)</label>
                  <select className="erp-input" value={sPlanId} onChange={e => setSPlanId(e.target.value)}>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.weeks} - {p.title}</option>
                    ))}
                  </select>
                </div>

                {creationMode === 'ai' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(201,168,76,0.06)', padding: '14px', borderRadius: '12px', border: '1.5px dashed rgba(201,168,76,0.3)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#A6882A', margin: 0 }}>🤖 เครื่องมือช่วยแต่งโจทย์ด้วย AI Gemini</h4>
                    <div className="erp-form-group">
                      <label className="erp-label">ต้องการจำลองโจทย์ประเด็นใด? (Focus Topic)</label>
                      <textarea
                        className="erp-input"
                        rows={2}
                        value={aiFocusTopic}
                        onChange={e => setAiFocusTopic(e.target.value)}
                        placeholder="เช่น แขกมาสั่งสเต็กเนื้อแต่สเต็กที่สั่งมาสุกเกินไป (Overcooked) บริกรต้องเปลี่ยนและปลอบประโลมลูกค้า..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAIGenerateScenario}
                      disabled={aiGeneratingScenario}
                      style={{
                        background: '#A6882A', color: '#FDFAF4', border: 'none', borderRadius: '8px',
                        padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {aiGeneratingScenario ? '⏳ AI กำลังร่างสถานการณ์และเขียน Prompt...' : '🤖 ร่างโจทย์และ System Prompt'}
                    </button>
                  </div>
                ) : null}

                <form onSubmit={handleAddScenario} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="erp-form-group">
                    <label className="erp-label">ชื่อกิจกรรมสถานการณ์จำลอง</label>
                    <input className="erp-input" value={sTitle} onChange={e => setSTitle(e.target.value)} placeholder="เช่น การรับมือแขกตำหนิอาหาร" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
                    <div className="erp-form-group">
                      <label className="erp-label">ประเภทกิจกรรม</label>
                      <select className="erp-input" value={sCategory} onChange={e => setSCategory(e.target.value as any)}>
                        <option value="Interact">Interact (ทักทายโต้ตอบ)</option>
                        <option value="Navigate">Navigate (รับออเดอร์/แก้ปัญหา)</option>
                      </select>
                    </div>
                    <div className="erp-form-group">
                      <label className="erp-label">บทบาท AI (Character)</label>
                      <input className="erp-input" value={sCharacter} onChange={e => setSCharacter(e.target.value)} placeholder="เช่น Rachel (แขก VIP เรื่องมาก)" />
                    </div>
                  </div>
                  
                  <div className="erp-form-group">
                    <label className="erp-label">รูปภาพประกอบสถานการณ์ (URL)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input className="erp-input" value={sImageUrl} onChange={e => setSImageUrl(e.target.value)} placeholder="เช่น /images/hotel_wine_service.png" />
                      <button
                        type="button"
                        onClick={async () => {
                          const titleText = sTitle || aiFocusTopic || 'สถานการณ์ F&B';
                          const characterText = sCharacter || 'Guest / แขกผู้ใช้บริการ';
                          setAiGeneratingImage(true);
                          setTimeout(() => {
                            const generatedSvgUrl = generateScenarioSVG(titleText, characterText, sCategory);
                            setSImageUrl(generatedSvgUrl);
                            setAiGeneratingImage(false);
                            alert('AI ออกแบบรูปภาพประกอบตามข้อมูลหัวข้อและบทบาทเสร็จสิ้น! 🎨');
                          }, 800);
                        }}
                        className="btn btn-outline"
                        style={{ border: '1px solid #A6882A', color: '#A6882A', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 700 }}
                      >
                        {aiGeneratingImage ? '⏳...' : '🎨 เจนรูปภาพ'}
                      </button>
                    </div>
                  </div>

                  <div className="erp-form-group">
                    <label className="erp-label">System Prompt ป้อนคำสั่งควบคุม AI (สำหรับ Gemini Live)</label>
                    <textarea className="erp-input" rows={3} value={sPrompt} onChange={e => setSPrompt(e.target.value)} placeholder="รายละเอียดข้อความที่จะสั่งให้ AI สวมบทบาทในการพูดตอบโต้..." required />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 700, marginTop: '6px' }}>
                    {editScenarioId ? 'บันทึกการแก้ไขสถานการณ์ AI' : 'บันทึกเข้าเซิร์ฟเวอร์ AI Scenario'}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4.3: Class Analytics */}
        {/* =============================================================== */}
        {activeTab === '4.3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#C9A84C', fontWeight: 650, letterSpacing: '1px' }}>CLASS PERFORMANCE</span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px', color: '#1E4D3A' }}>รายงานและสถิติสมรรถนะนักเรียนรายคน</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#A6882A' }}>เรียงลำดับคะแนนเฉลี่ย:</span>
                <select
                  value={sortByScore}
                  onChange={e => setSortByScore(e.target.value as any)}
                  className="erp-input"
                  style={{ width: '180px', padding: '6px 12px', fontSize: '12px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.3)', cursor: 'pointer' }}
                >
                  <option value="none">ค่าเริ่มต้น (รหัสนักเรียน)</option>
                  <option value="desc">คะแนนเฉลี่ย สูง ➡️ ต่ำ</option>
                  <option value="asc">คะแนนเฉลี่ย ต่ำ ➡️ สูง</option>
                </select>
              </div>
            </div>

            <div className="erp-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="erp-table-container">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>นักเรียน</th>
                      <th>ชั้นเรียน</th>
                      <th style={{ textAlign: 'center' }}>Knowledge (K)</th>
                      <th style={{ textAlign: 'center' }}>Skills (S)</th>
                      <th style={{ textAlign: 'center' }}>Attribute (A)</th>
                      <th style={{ textAlign: 'center' }}>Competency (C)</th>
                      <th style={{ textAlign: 'center' }}>คะแนนเฉลี่ย</th>
                      <th>สถานะผ่านเกณฑ์ (70%)</th>
                      <th style={{ textAlign: 'center' }}>ประวัติการเข้าใช้งาน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let sortedStudents = [...students];
                      if (sortByScore === 'desc') {
                        sortedStudents.sort((a, b) => {
                          const avgA = (a.ksa.K * 0.2) + (a.ksa.S * 0.3) + (a.ksa.A * 0.1) + (a.ksa.C * 0.4);
                          const avgB = (b.ksa.K * 0.2) + (b.ksa.S * 0.3) + (b.ksa.A * 0.1) + (b.ksa.C * 0.4);
                          return avgB - avgA;
                        });
                      } else if (sortByScore === 'asc') {
                        sortedStudents.sort((a, b) => {
                          const avgA = (a.ksa.K * 0.2) + (a.ksa.S * 0.3) + (a.ksa.A * 0.1) + (a.ksa.C * 0.4);
                          const avgB = (b.ksa.K * 0.2) + (b.ksa.S * 0.3) + (b.ksa.A * 0.1) + (b.ksa.C * 0.4);
                          return avgA - avgB;
                        });
                      }
                      return sortedStudents.map(s => {
                        const total = Math.round((s.ksa.K * 0.2) + (s.ksa.S * 0.3) + (s.ksa.A * 0.1) + (s.ksa.C * 0.4))
                        const passed = s.ksa.K >= 60 && s.ksa.S >= 60 && s.ksa.A >= 60 && s.ksa.C >= 60 && total >= 70
                        return (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 700 }}>👨‍🎓 {s.name}</td>
                            <td>{s.class}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.ksa.K}%</td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.ksa.S}%</td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.ksa.A}%</td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.ksa.C}%</td>
                            <td style={{ textAlign: 'center', fontSize: '14px', fontWeight: 800, color: passed ? '#1E4D3A' : '#8B2635' }}>
                              {total}%
                            </td>
                            <td>
                              <span className="badge" style={{ background: passed ? '#EAF3EE' : '#FAE8EB', color: passed ? '#1E4D3A' : '#8B2635' }}>
                                {passed ? '🏆 ผ่านสมรรถนะ' : '⚠️ ยังไม่ผ่าน'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => setSelectedStudentLog(s)}
                                className="btn btn-outline btn-sm"
                                style={{ borderColor: 'rgba(201,168,76,0.3)', color: '#A6882A', padding: '4px 10px' }}
                              >
                                🔍 ตรวจประวัติ
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4.4: Assessment */}
        {/* =============================================================== */}
        {activeTab === '4.4' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="erp-card">
              <span style={{ fontSize: '11px', color: '#C9A84C', fontWeight: 650, letterSpacing: '1px' }}>RUBRIC & ASSESSMENT BUILDER</span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px', color: '#1E4D3A' }}>จัดการเครื่องมือและรูบริคการประเมินผล</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
              <div className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E4D3A' }}>เครื่องมือวัดผลสะสมหลัก</h3>
                {rubrics.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#FDFAF4', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{r.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>น้ำหนักเก็บ: {r.ksa} · คะแนนเต็ม: {r.max} คะแนน</div>
                    </div>
                    <button onClick={() => handleDeleteRubric(r.id)} style={{ background: 'transparent', border: 'none', color: '#8B2635', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddRubric} className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E4D3A' }}>➕ สร้างเกณฑ์ประเมินใหม่</h3>
                <div className="erp-form-group">
                  <label className="erp-label">ชื่อเครื่องมือประเมิน</label>
                  <input className="erp-input" value={newRubricName} onChange={e => setNewRubricName(e.target.value)} placeholder="เช่น แบบประเมินบุคลิกเสิร์ฟไวน์..." required />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">คะแนนเต็ม</label>
                  <input type="number" className="erp-input" value={newRubricMax} onChange={e => setNewRubricMax(Number(e.target.value))} required />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">กลุ่มประเมิน KSA-C</label>
                  <select className="erp-input" value={newRubricKsa} onChange={e => setNewRubricKsa(e.target.value)}>
                    <option value="Knowledge (K)">Knowledge (K)</option>
                    <option value="Skill (S)">Skill (S)</option>
                    <option value="Attribute (A)">Attribute (A)</option>
                    <option value="Competency (C)">Competency (C)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ border: 'none', padding: '10px' }}>
                  บันทึกเครื่องมือวัดผล
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4.5: AR & 3D Items */}
        {/* =============================================================== */}
        {activeTab === '4.5' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="erp-card">
              <span style={{ fontSize: '11px', color: '#C9A84C', fontWeight: 650, letterSpacing: '1px' }}>AR & 3D MANAGER</span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px', color: '#1E4D3A' }}>จัดการคลังอุปกรณ์ AR & โมเดล 3 มิติ</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                เพิ่มรูปภาพ คำศัพท์ และกำหนดรูปทรง 3 มิติให้ผู้เรียนส่องผ่านกล้องมือถือสแกนวัตถุได้จริง
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Form Container with Toggles */}
              <div className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Mode Selector Header */}
                <div style={{ display: 'flex', borderBottom: '2px solid #EDE9E1', paddingBottom: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setArCreationMode('manual')}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: arCreationMode === 'manual' ? '#1E4D3A' : 'var(--text-muted)',
                      borderBottom: arCreationMode === 'manual' ? '3px solid #1E4D3A' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    🔨 สร้างแบบจำลอง (ด้วยตัวเอง)
                  </button>
                  <button
                    type="button"
                    onClick={() => setArCreationMode('ai')}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: arCreationMode === 'ai' ? '#1E4D3A' : 'var(--text-muted)',
                      borderBottom: arCreationMode === 'ai' ? '3px solid #1E4D3A' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ สร้างด้วย AI (ระบบอัตโนมัติ)
                  </button>
                </div>

                {arCreationMode === 'ai' ? (
                  // AI Auto generation form
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="erp-form-group">
                      <label className="erp-label">ระบุเครื่องมือหรืออุปกรณ์โรงแรมที่ต้องการให้ AI ร่างแบบจำลอง</label>
                      <input
                        className="erp-input"
                        value={arAiTopic}
                        onChange={e => setArAiTopic(e.target.value)}
                        placeholder="เช่น ช้อนตักซุป (Soup Spoon), แก้วแชมเปญ, มีดหั่นชีส..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAIGenerateARItem}
                      disabled={aiGenerating}
                      className="btn btn-primary"
                      style={{ border: 'none', padding: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {aiGenerating ? '⏳ กำลังวิเคราะห์และเจเนอเรตโมเดล...' : '⚡ ร่างโมเดลและรายละเอียดด้วย AI'}
                    </button>
                  </div>
                ) : (
                  // Manual form (with image generator)
                  <form onSubmit={handleAddARItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E4D3A', borderBottom: '1px solid #EDE9E1', paddingBottom: '8px', margin: 0 }}>
                      รายละเอียดทั่วไป (GENERAL INFO)
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="erp-form-group">
                        <label className="erp-label">ชื่อภาษาอังกฤษ *</label>
                        <input className="erp-input" value={arEn} onChange={e => setAREn(e.target.value)} placeholder="e.g. Soup Spoon" required />
                      </div>
                      <div className="erp-form-group">
                        <label className="erp-label">ชื่อภาษาไทย *</label>
                        <input className="erp-input" value={arTh} onChange={e => setARTh(e.target.value)} placeholder="e.g. ช้อนซุป" required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                      <div className="erp-form-group">
                        <label className="erp-label">คำอ่านออกเสียงสะกด</label>
                        <input className="erp-input" value={arPron} onChange={e => setARPron(e.target.value)} placeholder="e.g. /soop spoon/" />
                      </div>
                      <div className="erp-form-group">
                        <label className="erp-label">ประโยคตัวอย่างการเสิร์ฟ/จัด</label>
                        <input className="erp-input" value={arSent} onChange={e => setARSent(e.target.value)} placeholder="e.g. Place the spoon..." />
                      </div>
                    </div>

                    <div className="erp-form-group">
                      <label className="erp-label">คำอธิบายอุปกรณ์ (DESCRIPTION)</label>
                      <textarea className="erp-input" rows={2} value={arDesc} onChange={e => setARDesc(e.target.value)} placeholder="อธิบายการใช้งานอุปกรณ์หรืองานบริการอาหาร..." />
                    </div>

                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E4D3A', borderBottom: '1px solid #EDE9E1', paddingBottom: '8px', marginTop: '10px', margin: '10px 0 0 0' }}>
                      🎨 พรีวิวและอัปโหลดภาพโมเดล 3 มิติ
                    </h3>

                    <div className="erp-form-group">
                      <label className="erp-label">รูปภาพโมเดล 3D (Image URL หรืออัปโหลดไฟล์)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input className="erp-input" value={arImageUrl} onChange={e => setArImageUrl(e.target.value)} placeholder="เช่น /images/espresso_cup_3d.png" />
                        <input
                          type="file"
                          accept="image/*"
                          id="ar-image-upload"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setArImageUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('ar-image-upload')?.click()}
                          className="btn btn-outline"
                          style={{ border: '1px solid #A6882A', color: '#A6882A', whiteSpace: 'nowrap', fontSize: '12px', fontWeight: 700 }}
                        >
                          📤 อัพไฟล์ภาพ
                        </button>
                      </div>
                    </div>

                    <div className="erp-form-group">
                      <label className="erp-label">โมเดล 3D (.glb URL) [สำหรับ Web / Android]</label>
                      <input className="erp-input" value={arGlbUrl} onChange={e => setArGlbUrl(e.target.value)} placeholder="เช่น https://modelviewer.dev/shared-assets/models/Astronaut.glb" />
                    </div>

                    <div className="erp-form-group">
                      <label className="erp-label">โมเดล 3D (.usdz URL) [สำหรับ iPhone / iPad / iOS]</label>
                      <input className="erp-input" value={arUsdzUrl} onChange={e => setArUsdzUrl(e.target.value)} placeholder="เช่น https://modelviewer.dev/shared-assets/models/Astronaut.usdz" />
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>* ใส่ลิงก์ไฟล์ .usdz สำหรับแสดงผล AR Quick Look บน iPhone/iPad (หากไม่ใส่จะใช้โมเดลของ Android ทดแทน)</p>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ border: 'none', padding: '12px', fontWeight: 700, marginTop: '8px' }}>
                      บันทึกชิ้นงานเข้าคลัง 3D
                    </button>
                  </form>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E4D3A', margin: 0 }}>อุปกรณ์การเรียนรู้ทั้งหมด ({arItems.length})</h3>
                  <button type="button" onClick={() => setARItems(initialARItems)} style={{ background: 'transparent', border: 'none', color: '#A6882A', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                    🔄 โหลดชุดตัวอย่างมาตรฐาน
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {arItems.map(item => (
                    <div key={item.id} style={{ background: '#FDFAF4', border: '1.5px solid rgba(201,168,76,0.2)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative' }}>
                      <button onClick={() => handleDeleteARItem(item.id)} style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', background: 'rgba(139,38,53,0.1)', border: 'none', borderRadius: '8px', color: '#8B2635', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        🗑️
                      </button>
                      
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>{item.nameEn}</h4>
                        </div>
                        <span style={{ fontSize: '11px', color: '#A6882A', fontWeight: 700 }}>{item.nameTh}</span>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4, margin: '6px 0 0 0', textAlign: 'left' }}>{item.desc}</p>
                      </div>

                      {/* Photorealistic 3D rendering card thumbnail */}
                      <div style={{ height: '140px', background: '#0a0a0a', borderRadius: '12px', border: '1.5px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: '#fff', fontSize: '12px' }}>ไม่มีภาพโมเดล</span>
                        )}
                        <span style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '9px', color: '#C9A84C', fontWeight: 700, background: 'rgba(16,43,31,0.85)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(4px)' }}>
                          🎥 3D AR VIEW ACTIVE
                        </span>
                      </div>

                      <div style={{ padding: '8px 12px', background: 'rgba(201,168,76,0.06)', borderRadius: '8px', fontSize: '11px', fontStyle: 'italic', borderLeft: '3px solid #C9A84C', textAlign: 'left' }}>
                        "{item.sentence}"
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid #EDE9E1', paddingTop: '10px' }}>
                        <span>ID: {item.id.slice(0, 10)}...</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ background: '#EAF3EE', color: '#1E4D3A', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Quiz ✓</span>
                          <button 
                            onClick={() => { setSelectedQrItem(item); setShowQrModal(true); }}
                            style={{ 
                              background: '#F5F0E6', color: '#A6882A', padding: '2px 8px', borderRadius: '4px', fontWeight: 700,
                              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-primary)'
                            }}
                          >
                            📷 QR Code
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4.1 Create/Edit Plan Modal (Fully customized Weekly Syllabus Template) */}
      {showPlanModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="erp-card" style={{ width: '700px', maxHeight: '90vh', overflowY: 'auto', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E4D3A' }}>
                {editPlanId ? '📖 แก้ไขแผนการจัดการเรียนรู้มุ่งเน้นสมรรถนะ' : '📖 สร้างแผนการจัดการเรียนรู้รายสัปดาห์ใหม่'}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowPlanModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>
            </div>
            
            <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">ชื่อหน่วยการเรียนรู้/เรื่อง</label>
                  <input className="erp-input" value={pTitle} onChange={e => setPTitle(e.target.value)} placeholder="เช่น หน่วยที่ 1 Restaurant Equipment Vocabulary" required />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">ชั้นเรียนเป้าหมาย</label>
                  <select className="erp-input" value={pClass} onChange={e => setPClass(e.target.value)}>
                    <option value="ปวช.1/1">ปวช.1/1</option>
                    <option value="ปวช.1/2">ปวช.1/2</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">สัปดาห์ที่เรียน</label>
                  <input className="erp-input" value={pWeeks} onChange={e => setPWeeks(e.target.value)} placeholder="เช่น สัปดาห์ที่ 1" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">รายวิชาและรหัสวิชา</label>
                  <input className="erp-input" value={pSubject} onChange={e => setPSubject(e.target.value)} required />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">ระดับชั้น / สาขา</label>
                  <input className="erp-input" value={pLevel} onChange={e => setPLevel(e.target.value)} required />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">เวลาเรียน (ชั่วโมง)</label>
                  <input className="erp-input" value={pDuration} onChange={e => setPDuration(e.target.value)} required />
                </div>
              </div>

              <div className="erp-form-group">
                <label className="erp-label">สาระสำคัญ (CONCEPT)</label>
                <textarea className="erp-input" rows={2} value={pConcept} onChange={e => setPConcept(e.target.value)} placeholder="สรุปหัวใจหลักของการเรียนสัปดาห์นี้..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">🎯 จุดประสงค์ความรู้ (Knowledge: K)</label>
                  <textarea className="erp-input" rows={3} value={pK} onChange={e => setPK(e.target.value)} placeholder="ระบุสิ่งที่ผู้เรียนจะรู้ (แยกทีละบรรทัด)..." />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">💪 จุดประสงค์ทักษะ (Skills: S)</label>
                  <textarea className="erp-input" rows={3} value={pS} onChange={e => setPS(e.target.value)} placeholder="ระบุสิ่งที่ผู้เรียนจะทำได้ (แยกทีละบรรทัด)..." />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">❤️ จุดประสงค์คุณลักษณะ (Attributes: A)</label>
                  <textarea className="erp-input" rows={2} value={pA} onChange={e => setPA(e.target.value)} placeholder="ระบุทัศนคติ/วินัย/จิตบริการ..." />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">💼 จุดประสงค์การประยุกต์ใช้ (Application: AP)</label>
                  <textarea className="erp-input" rows={2} value={pAP} onChange={e => setPAP(e.target.value)} placeholder="การต่อยอดแก้ปัญหาหน้างานจำลอง..." />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="erp-form-group">
                  <label className="erp-label">📖 คำศัพท์อุปกรณ์ (Vocabulary list)</label>
                  <textarea className="erp-input" rows={2} value={pVocab} onChange={e => setPVocab(e.target.value)} placeholder="เช่น Cutlery: Dinner Fork, Water Goblet..." />
                </div>
                <div className="erp-form-group">
                  <label className="erp-label">💬 ประโยคสื่อสารมาตรฐาน (Target Sentences)</label>
                  <textarea className="erp-input" rows={2} value={pSentences} onChange={e => setPSentences(e.target.value)} placeholder="เช่น This is a... / It is used for..." />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #EDE9E1', paddingTop: '10px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E4D3A', marginBottom: '8px' }}>✦ รายละเอียดขั้นตอนการจัดเรียนรู้รายชั่วโมง (F-I-N-E)</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="erp-form-group">
                    <label className="erp-label">ขั้นนำเข้าสู่บทเรียน (Warm-up)</label>
                    <textarea className="erp-input" rows={2} value={pLead} onChange={e => setPLead(e.target.value)} placeholder="การดึงดูดความสนใจผ่านสื่อวิดีโอ..." />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">🤖 Familiarize (F) - ส่อง AR / สแกนวัตถุ</label>
                    <textarea className="erp-input" rows={2} value={pFamiliarize} onChange={e => setPFamiliarize(e.target.value)} placeholder="ฝึกศัพท์ผ่านสื่อสามมิติและตรวจอุปกรณ์จริง..." />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">💬 Interact (I) - ฝึกโต้ตอบเจมินายพูดสปีคกิ้ง</label>
                    <textarea className="erp-input" rows={2} value={pInteract} onChange={e => setPInteract(e.target.value)} placeholder="ฝึกสนทนาโต้ตอบกับ AI Gemini..." />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">🎭 Navigate (N) - จำลองสถานการณ์บริการ</label>
                    <textarea className="erp-input" rows={2} value={pNavigate} onChange={e => setPNavigate(e.target.value)} placeholder="แข่งทำโจทย์การจัดโต๊ะและเสิร์ฟแบบทีม..." />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div className="erp-form-group">
                    <label className="erp-label">🏆 Exhibit (E) - โชว์ผลสัมฤทธิ์ / รูบริค</label>
                    <textarea className="erp-input" rows={2} value={pExhibit} onChange={e => setPExhibit(e.target.value)} placeholder="การทดสอบคำศัพท์รายบุคคลและประเมิน Rubric..." />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">ขั้นสรุปและสะท้อนคิด (Reflection & Exit ticket)</label>
                    <textarea className="erp-input" rows={2} value={pWrap} onChange={e => setPWrap(e.target.value)} placeholder="การเขียนสะสมหลังคาบเรียนและบัตรออกห้องเรียน..." />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 700 }}>
                {editPlanId ? 'บันทึกการแก้ไขหลักสูตร' : 'บันทึกและสร้างรหัสแชร์แผนการสอน'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Syllabus Plan printable detail view modal */}
      {viewSyllabusPlan && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div className="erp-card" style={{ width: '800px', maxHeight: '95vh', overflowY: 'auto', background: '#ffffff', color: '#1a1a1a', display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #1E4D3A', paddingBottom: '16px' }}>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1E4D3A' }}>แผนการจัดการเรียนรู้รายสัปดาห์</h1>
                <div style={{ fontSize: '13px', marginTop: '4px', fontWeight: 600 }}>รายวิชา: {viewSyllabusPlan.subject}</div>
                <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>ระดับชั้น: {viewSyllabusPlan.level} · เวลาเรียน: {viewSyllabusPlan.duration} · ห้อง: {viewSyllabusPlan.targetClass}</div>
              </div>
              <button onClick={() => window.print()} style={{ background: '#1E4D3A', border: 'none', borderRadius: '8px', color: 'white', padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                🖨️ พิมพ์แผนการสอน
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', fontSize: '13.5px', lineHeight: 1.6 }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>แผนการจัดการเรียนรู้ {viewSyllabusPlan.weeks}</h3>
                <p style={{ marginTop: '8px' }}><strong>หัวข้อหน่วยการสอน:</strong> {viewSyllabusPlan.title}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1E4D3A' }}>1. สาระสำคัญ</h3>
                <p style={{ marginTop: '4px', color: '#333' }}>{viewSyllabusPlan.concept}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1E4D3A' }}>2. จุดประสงค์การเรียนรู้มุ่งเน้นสมรรถนะ (KSA)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '6px' }}>
                  <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                    <strong>ด้านความรู้ (Knowledge: K):</strong>
                    <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                      {viewSyllabusPlan.objectivesK.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                    <strong>ด้านทักษะ (Skills: S):</strong>
                    <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                      {viewSyllabusPlan.objectivesS.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                  <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                    <strong>ด้านคุณลักษณะพึงประสงค์ (Attributes: A):</strong>
                    <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                      {viewSyllabusPlan.objectivesA.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                    <strong>ด้านการประยุกต์ใช้ (Application: AP):</strong>
                    <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                      {viewSyllabusPlan.objectivesAP.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1E4D3A' }}>3. สาระการเรียนรู้และคลังคำศัพท์</h3>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px', marginTop: '4px' }}>
                  <strong>คำศัพท์จำลอง (Vocabulary list):</strong> {viewSyllabusPlan.vocabulary.join(' / ')}<br />
                  <strong>รูปประโยคพื้นฐานการให้บริการ:</strong> {viewSyllabusPlan.sentences.join(' / ')}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1E4D3A' }}>4. ขั้นตอนการเรียนการสอน (กระบวนการตาม FINE Model 3D)</h3>
                <ol style={{ paddingLeft: '20px', marginTop: '6px' }}>
                  <li><strong>ขั้นนำเข้าสู่บทเรียน (20 นาที):</strong> {viewSyllabusPlan.activitiesLead}</li>
                  <li><strong>ขั้น Familiarize (F) (60 นาที):</strong> {viewSyllabusPlan.activitiesF}</li>
                  <li><strong>ขั้น Interact (I) (50 นาที):</strong> {viewSyllabusPlan.activitiesI}</li>
                  <li><strong>ขั้น Navigate (N) (55 นาที):</strong> {viewSyllabusPlan.activitiesN}</li>
                  <li><strong>ขั้น Exhibit (E) (35 นาที):</strong> {viewSyllabusPlan.activitiesE}</li>
                  <li><strong>ขั้นสรุปและสะท้อนประมวลคิด (20 นาที):</strong> {viewSyllabusPlan.activitiesWrap}</li>
                </ol>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', borderTop: '1.5px solid #1E4D3A', paddingTop: '20px', marginTop: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setViewSyllabusPlan(null)} className="btn btn-outline" style={{ padding: '10px 24px', borderColor: '#333', color: '#333' }}>
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.1 Invite Link & QR Code Modal */}
      {activeInvitePlan && (() => {
        const teacherName = user?.name || 'ครูผู้สอน'
        const schoolName = user?.school || 'วิทยาลัยอาชีวศึกษา'
        const origin = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
          ? window.location.origin
          : 'https://krupim-finemodel3d-ar.com'
        const url = `${origin}/register-student?code=${inviteShortCode || ''}`
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`

        return (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
            <div className="erp-card" style={{ width: '450px', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '30px', textAlign: 'center' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>🔗 ลิงก์และ QR Code ลงทะเบียนเข้าเรียน</h3>
                <button onClick={() => setActiveInvitePlan(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <div>
                <span className="badge" style={{ background: '#EAF3EE', color: '#1E4D3A', fontWeight: 700 }}>
                  ชั้นเรียน: {activeInvitePlan.targetClass}
                </span>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  สำหรับหน่วยการเรียนรู้: <strong>{activeInvitePlan.title}</strong>
                </div>
              </div>

              {/* QR Code */}
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1.5px solid rgba(201,168,76,0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <img
                  src={qrUrl}
                  alt="Syllabus Register QR Code"
                  style={{ width: '200px', height: '200px', display: 'block' }}
                />
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                💡 ให้นักเรียนใช้กล้องมือถือสแกนคิวอาร์โค้ดนี้เพื่อสมัครและเข้าร่วมชั้นเรียน
              </p>

              {/* URL Text Container */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#A6882A' }}>ลิงก์สำหรับคัดลอกส่งทางแชท/ไลน์</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={url}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #D8D2C6', borderRadius: '8px', fontSize: '11px', background: '#FDFAF4', color: '#555' }}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(url)
                      alert('คัดลอกลิงก์เชิญนักเรียนไปยังคลิปบอร์ดแล้ว!')
                    }}
                    className="btn btn-primary"
                    style={{ border: 'none', padding: '8px 16px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    คัดลอก
                  </button>
                </div>
              </div>

              <button
                onClick={() => setActiveInvitePlan(null)}
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', borderColor: '#C9A84C', color: '#A6882A', fontWeight: 700 }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )
      })()}

      {/* 4.3 Student Platform Activity Log Modal */}
      {selectedStudentLog && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 }}>
          <div className="erp-card" style={{ width: '650px', maxHeight: '90vh', overflowY: 'auto', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE9E1', paddingBottom: '12px' }}>
              <div>
                <span className="badge" style={{ background: '#EAF3EE', color: '#1E4D3A', fontWeight: 700 }}>{selectedStudentLog.class}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E4D3A', margin: '4px 0 0 0' }}>👨‍🎓 ประวัติการใช้งานแพลตฟอร์มรายบุคคล</h3>
              </div>
              <button onClick={() => setSelectedStudentLog(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Profile Summary Card */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.15)', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A' }}>{selectedStudentLog.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>รหัสประจำตัว: {selectedStudentLog.studentId}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>อุปกรณ์จำลองล่าสุด: {selectedStudentLog.device}</div>
              </div>
              <div style={{ borderLeft: '1px solid #EDE9E1', paddingLeft: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>⏳ ล็อกอินสะสม: <strong>{selectedStudentLog.sessions} ครั้ง</strong></div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>⏱️ เวลาเรียน: <strong>{selectedStudentLog.durationHours} ชั่วโมง</strong></div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>🟢 ใช้ล่าสุด: <strong style={{ color: '#1E4D3A' }}>{selectedStudentLog.lastActive}</strong></div>
              </div>
            </div>

            {/* KSA Performance Bars */}
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1E4D3A', marginBottom: '8px', margin: 0 }}>📊 สมรรถนะความพร้อมการเรียนรู้มุ่งเน้น (KSA-C Model)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.1)', marginTop: '8px' }}>
                {[
                  { label: 'Knowledge (K) - สาระความรู้คำศัพท์', val: selectedStudentLog.ksa.K, color: '#A6882A' },
                  { label: 'Skills (S) - ทักษะสนทนาและสแกน AR', val: selectedStudentLog.ksa.S, color: '#1E4D3A' },
                  { label: 'Attributes (A) - จิตบริการและวินัยส่งงาน', val: selectedStudentLog.ksa.A, color: '#554D41' },
                  { label: 'Competency (C) - ความพร้อมปฏิบัติบริการจริง', val: selectedStudentLog.ksa.C, color: '#C9A84C' }
                ].map(bar => (
                  <div key={bar.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                      <span>{bar.label}</span>
                      <span>{bar.val}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#EDE9E1', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ width: `${bar.val}%`, height: '100%', background: bar.color, borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Logs */}
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1E4D3A', marginBottom: '8px', margin: 0 }}>📝 ล็อกประวัติการฝึกปฏิบัติล่าสุด (Activity Logs)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginTop: '8px' }}>
                {selectedStudentLog.logs.map((log, idx) => (
                  <div key={idx} style={{ padding: '10px 12px', background: 'white', borderRadius: '8px', border: '1px solid #EDE9E1', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>{log.action}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{log.time}</div>
                    </div>
                    <span className="badge" style={{ background: '#F5F0E6', color: '#A6882A', fontWeight: 700, fontSize: '10px' }}>
                      {log.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setSelectedStudentLog(null)} className="btn btn-primary" style={{ width: '100%', padding: '12px', border: 'none', fontWeight: 700, marginTop: '8px' }}>
              ปิดหน้าต่างตรวจสอบ
            </button>
          </div>
        </div>
      )}

      {/* 4.5.1 QR Code Modal for AR Items */}
      {showQrModal && selectedQrItem && (() => {
        const studentLink = typeof window !== 'undefined' 
          ? `${window.location.origin}/student/ar-view?id=${selectedQrItem.id}` 
          : `/student/ar-view?id=${selectedQrItem.id}`;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(studentLink)}`;
        
        return (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }}>
            <div className="erp-card" style={{ width: '400px', background: '#FDFAF4', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid #EDE9E1', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>📷 การ์ด QR Code อุปกรณ์ AR 3D</h3>
                <button onClick={() => { setShowQrModal(false); setSelectedQrItem(null); }} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              {/* Printable Card Area */}
              <div id="printable-qr-card" style={{ background: 'white', padding: '24px 16px', borderRadius: '16px', border: '2px solid #C9A84C', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: '#102B1F', color: '#C9A84C', fontSize: '9px', fontWeight: 900, padding: '4px 12px', borderRadius: '100px', letterSpacing: '1px' }}>
                  FINE MODE AR LEARNING
                </span>
                
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#1E4D3A', margin: '4px 0 0' }}>{selectedQrItem.nameEn}</h4>
                <span style={{ fontSize: '12px', color: '#A6882A', fontWeight: 700 }}>{selectedQrItem.nameTh}</span>
                
                {/* QR Code Generated Image with FINE Center Logo */}
                <div style={{ position: 'relative', width: '180px', height: '180px', border: '1px solid #EDE9E1', borderRadius: '12px', padding: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={qrApiUrl} alt="QR Code" style={{ width: '100%', height: '100%' }} />
                  {/* Central FINE Logo */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#102B1F',
                    border: '1.5px solid #C9A84C',
                    padding: '3px 6px',
                    borderRadius: '6px',
                    color: '#C9A84C',
                    fontWeight: 900,
                    fontSize: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    pointerEvents: 'none'
                  }}>
                    FINE
                  </div>
                </div>
                
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  สแกนเพื่อเรียกดูโมเดล 3D แบบโต้ตอบได้ 360° หมุนดูรอบตัวผ่านมือถือของผู้เรียน
                </span>
              </div>

              {/* Control Buttons */}
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(studentLink);
                    alert('คัดลอกลิงก์การ์ด AR สำหรับนักเรียนเรียบร้อยแล้ว!');
                  }}
                  className="btn btn-outline" 
                  style={{ padding: '10px', borderColor: '#1E4D3A', color: '#1E4D3A', fontWeight: 700, fontSize: '12px' }}
                >
                  🔗 คัดลอกลิงก์
                </button>
                <button 
                  onClick={() => {
                    const printContent = document.getElementById('printable-qr-card')?.innerHTML;
                    if (!printContent) return;
                    const win = window.open('', '_blank');
                    if (win) {
                      win.document.write(`
                        <html>
                          <head>
                            <title>Print QR - ${selectedQrItem.nameEn}</title>
                            <style>
                              body { font-family: 'Kanit', sans-serif; display: flex; align-items: center; justify-content: center; height: 95vh; margin: 0; }
                              #card { border: 3px solid #C9A84C; border-radius: 20px; padding: 40px 30px; text-align: center; max-width: 320px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                              span.badge { background: #102B1F; color: #C9A84C; font-size: 10px; font-weight: bold; padding: 6px 16px; border-radius: 100px; text-transform: uppercase; letter-spacing: 1px; }
                              h2 { color: #1E4D3A; margin: 15px 0 5px; font-size: 22px; }
                              h3 { color: #A6882A; margin: 0 0 15px; font-size: 15px; }
                              img { width: 220px; height: 220px; border: 1px solid #eee; padding: 10px; border-radius: 12px; }
                              p { font-size: 11px; color: #666; margin-top: 15px; line-height: 1.4; }
                            </style>
                          </head>
                          <body>
                            <div id="card">
                              <span class="badge">FINE MODE AR LEARNING</span>
                              <h2>${selectedQrItem.nameEn}</h2>
                              <h3>${selectedQrItem.nameTh}</h3>
                              <img src="${qrApiUrl}" />
                              <p>สแกนเพื่อเปิดแบบจำลอง 3D และทดลองใช้เครื่องมือในวิชาโรงแรมสากล</p>
                            </div>
                            <script>
                              window.onload = function() { window.print(); window.close(); }
                            </script>
                          </body>
                        </html>
                      `);
                      win.document.close();
                    }
                  }} 
                  className="btn btn-outline" 
                  style={{ padding: '10px', borderColor: '#C9A84C', color: '#A6882A', fontWeight: 700, fontSize: '12px' }}
                >
                  🖨️ พิมพ์การ์ด
                </button>
                <button 
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = qrApiUrl;
                    link.download = `QR_${selectedQrItem.nameEn.replace(/\s+/g, '_')}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '10px', border: 'none', fontWeight: 700, fontSize: '12px' }}
                >
                  💾 ดาวน์โหลด QR
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  )
}
