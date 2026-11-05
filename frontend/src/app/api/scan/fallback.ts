import { queryDb } from '@/lib/db'
import { WEEK2_MISSION_ITEMS, type Week2MissionItem } from '@/app/student/explore/week2-mission'
import { defaultEquipment, type Equipment } from '@/app/student/explore/equipment-data'

export type FineAnalysisPayload = {
  familiarize: { desc: string; location: string }
  interact: { pronunciation: string; english_phrases: string[]; roleplay_prompt: string }
  navigate: { service_steps: string[]; safety_rules: string }
  exhibit: { quiz_question: string; quiz_options: string[]; correct_answer: string }
}

export type ScanResponsePayload = {
  name_th: string
  name_en: string
  category: string
  subcategory: string
  description: string
  location: string
  service_tips: string
  english_phrases: string[]
  pronounce: string
  confidence: number
  is_fallback: boolean
  fallback_reason?: string
  fine_analysis: FineAnalysisPayload
}

type DbVocabularyRow = {
  id: string
  name_th: string
  name_en: string
  category: string | null
  category_th: string | null
  use_desc: string | null
  sentence: string | null
  pronounce: string | null
  glb_url: string | null
  usdz_url: string | null
}

function buildFineAnalysis(item: {
  name_th: string
  name_en: string
  category?: string | null
  category_th?: string | null
  use_desc?: string | null
  sentence?: string | null
  pronounce?: string | null
}): ScanResponsePayload {
  const nameEn = item.name_en || 'Dining Equipment'
  const nameTh = item.name_th || 'อุปกรณ์งานบริการ'
  const category = item.category || 'tableware'
  const categoryTh = item.category_th || 'งานบริการอาหารและเครื่องดื่ม'
  const desc = item.use_desc || `${nameTh} (${nameEn}) เป็นรายการสำคัญที่ใช้ในมาตรฐานงานบริการอาหารและเครื่องดื่ม FINE Model`
  const pronounce = item.pronounce || nameEn
  const sentence = item.sentence || `This is our standard ${nameEn} prepared for table service.`

  const serviceSteps = [
    `1. ตรวจสอบความสะอาด ความสมบูรณ์ และสุขอนามัยของ ${nameEn} ก่อนนำไปจัดวางหรือบริการ`,
    `2. จัดวางในตำแหน่งที่ถูกต้องตามมาตรฐานสากลบนโต๊ะอาหาร (Table Setup)`,
    `3. แนะนำและบริการลูกค้าด้วยความสุภาพ พร้อมเก็บถอนอย่างถูกวิธีหลังเสร็จสิ้นการบริการ`
  ]

  const safetyRules = category === 'food' || category === 'beverage'
    ? 'รักษาอุณหภูมิที่เหมาะสม ป้องกันการปนเปื้อนข้าม (Cross-contamination) และตรวจสอบวันหมดอายุ'
    : 'ระวังการตกหล่น แตกหัก และหยิบจับบริเวณด้ามจับหรือฐานเพื่อรักษามาตรฐานสุขอนามัย'

  const quizQuestion = `วัตถุชิ้นนี้ (${nameEn} / ${nameTh}) จัดอยู่ในหมวดหมู่ใดตามหลักสูตร FINE Model?`
  const quizOptions = [
    categoryTh,
    'อุปกรณ์สำหรับงานทำความสะอาดห้องพัก (Housekeeping)',
    'เอกสารสำหรับเคาน์เตอร์ต้อนรับส่วนหน้า (Front Desk)'
  ]

  return {
    name_th: nameTh,
    name_en: nameEn,
    category,
    subcategory: categoryTh,
    description: desc,
    location: 'โต๊ะอาหาร ห้องอาหารมาตรฐาน หรือจุดจัดเตรียมบริการอาหารและเครื่องดื่ม',
    service_tips: `การดูแลรักษา: ${desc} ควรตรวจสอบความสะอาดก่อนจัดเสิร์ฟทุกครั้ง`,
    english_phrases: [
      sentence,
      `May I present the ${nameEn} for your dining experience, sir/madam?`,
      `Please enjoy your meal with our freshly prepared ${nameEn}.`
    ],
    pronounce,
    confidence: 96,
    is_fallback: true,
    fallback_reason: 'ระบบเปิดใช้งานโหมดสำรอง (Curriculum Fallback Engine) อัตโนมัติ เพื่อให้นักเรียนทำภารกิจและส่งงานได้ต่อเนื่อง',
    fine_analysis: {
      familiarize: {
        desc,
        location: 'จัดวางบนโต๊ะอาหารตามมาตรฐาน FINE Model (ด้านขวาหรือจุดบริการที่กำหนด)'
      },
      interact: {
        pronunciation: pronounce,
        english_phrases: [
          sentence,
          `Would you care for some ${nameEn}?`,
          `Here is your ${nameEn}, enjoy your meal!`
        ],
        roleplay_prompt: `ฝึกแนะนำ ${nameEn} แก่ลูกค้าเป็นภาษาอังกฤษด้วยน้ำเสียงสุภาพและเป็นมิตร`
      },
      navigate: {
        service_steps: serviceSteps,
        safety_rules: safetyRules
      },
      exhibit: {
        quiz_question: quizQuestion,
        quiz_options: quizOptions,
        correct_answer: categoryTh
      }
    }
  }
}

export async function generateFallbackScan(itemHint?: string): Promise<ScanResponsePayload> {
  const cleanHint = (itemHint || '').trim().toLowerCase()

  // 1. Try querying PostgreSQL database for matching vocabulary
  try {
    if (cleanHint) {
      const result = await queryDb<DbVocabularyRow>(
        `SELECT id, name_th, name_en, category, category_th, use_desc, sentence, pronounce, glb_url, usdz_url
         FROM vocabulary_items
         WHERE LOWER(name_en) = LOWER($1) OR LOWER(name_th) = LOWER($1)
            OR LOWER(name_en) LIKE LOWER($2) OR LOWER(name_th) LIKE LOWER($2)
         ORDER BY updated_at DESC
         LIMIT 1`,
        [cleanHint, `%${cleanHint}%`]
      )
      if (result?.rows && result.rows.length > 0) {
        return buildFineAnalysis(result.rows[0])
      }
    } else {
      // Pick a random or featured vocabulary item from DB
      const result = await queryDb<DbVocabularyRow>(
        `SELECT id, name_th, name_en, category, category_th, use_desc, sentence, pronounce, glb_url, usdz_url
         FROM vocabulary_items
         ORDER BY RANDOM()
         LIMIT 1`
      )
      if (result?.rows && result.rows.length > 0) {
        return buildFineAnalysis(result.rows[0])
      }
    }
  } catch (dbErr) {
    console.warn('[FallbackScan] Database query failed, proceeding with in-memory curriculum catalog:', dbErr)
  }

  // 2. Search in Week 2 Mission Items
  if (cleanHint) {
    const missionItem = WEEK2_MISSION_ITEMS.find((m: Week2MissionItem) =>
      m.nameEn.toLowerCase() === cleanHint ||
      m.nameTh.includes(cleanHint) ||
      m.id.toLowerCase() === cleanHint ||
      m.keywords.some((k: string) => cleanHint.includes(k) || k.includes(cleanHint))
    )
    if (missionItem) {
      return buildFineAnalysis({
        name_th: missionItem.nameTh,
        name_en: missionItem.nameEn,
        category: missionItem.category.toLowerCase().replace(/\s+/g, '_'),
        category_th: missionItem.categoryTh,
        use_desc: `${missionItem.nameTh} (${missionItem.nameEn}) เป็นเมนูในหมวด ${missionItem.categoryTh} สำหรับฝึกทักษะการบริการ`,
        sentence: missionItem.sampleSentence,
        pronounce: missionItem.pronounce
      })
    }

    // Search in defaultEquipment (51 items)
    const eqItem = defaultEquipment.find((e: Equipment) =>
      e.nameEn.toLowerCase() === cleanHint ||
      e.name.includes(cleanHint) ||
      cleanHint.includes(e.nameEn.toLowerCase())
    )
    if (eqItem) {
      return buildFineAnalysis({
        name_th: eqItem.name,
        name_en: eqItem.nameEn,
        category: eqItem.category || 'tableware',
        category_th: eqItem.categoryTh || 'เครื่องใช้บนโต๊ะอาหาร',
        use_desc: eqItem.use,
        sentence: eqItem.sentence,
        pronounce: eqItem.pronounce
      })
    }
  }

  // 3. Fallback default: Pick a high-value curriculum item (Appetizer Plate or Caesar Salad)
  const defaultItem = defaultEquipment[0] || {
    name: 'จานอาหารเรียกน้ำย่อย',
    nameEn: 'Appetizer Plate',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    use: 'จานขนาดเล็กสำหรับเสิร์ฟอาหารเรียกน้ำย่อย ของว่าง หรืออาหารจานเล็กก่อนอาหารมื้อหลัก',
    sentence: 'The appetizer plate is used to serve small starters before the main course.',
    pronounce: '/ˈæpətaɪzər pleɪt/'
  }

  return buildFineAnalysis({
    name_th: defaultItem.name,
    name_en: defaultItem.nameEn,
    category: defaultItem.category,
    category_th: defaultItem.categoryTh,
    use_desc: defaultItem.use,
    sentence: defaultItem.sentence,
    pronounce: defaultItem.pronounce
  })
}
