/**
 * Intelligent Fallback Dialogue Engine for Chat
 * Activated when AI provider is rate-limited (429) or offline.
 */

interface TopicKnowledge {
  keywords: string[]
  response: string
}

const KNOWLEDGE_BASE: TopicKnowledge[] = [
  {
    keywords: ['table setting', 'จัดโต๊ะ', 'วางอุปกรณ์', 'outside-in', 'ลำดับอุปกรณ์'],
    response: `หลักการจัดโต๊ะอาหารแบบสากล (Fine Dining Table Setting) มีหัวใจสำคัญคือ **"Outside-In" (จากด้านนอกเข้าสู่ด้านใน)** ครับ:

1. **อุปกรณ์ด้านซ้าย:** ส้อมสลัด (Salad Fork) อยู่นอกสุด และ ส้อมอาหารค่ำ (Dinner Fork) อยู่ด้านใน
2. **อุปกรณ์ด้านขวา:** ช้อนซุป (Soup Spoon) อยู่นอกสุด ถัดมาเป็นมีดปลา (Fish Knife) และมีดอาหารค่ำ (Dinner Knife) ติดกับจานหลัก
3. **ด้านบนจาน:** ช้อนและส้อมของหวาน (Dessert Spoon & Fork)
4. **ด้านขวาบน:** แก้วน้ำ (Water Goblet) และแก้วไวน์ (Wine Glasses) เรียงตามลำดับคอร์ส

💡 *ประโยคแนะนำลูกค้า:* "Please feel free to use the cutlery starting from the outside and working your way in for each course."`
  },
  {
    keywords: ['fork', 'ส้อม', 'dinner fork', 'salad fork', 'fish fork'],
    response: `ประเภทของส้อมในงานบริการอาหารมาตรฐานสากล:

• **Dinner Fork (ส้อมอาหารค่ำ):** ส้อมหลักขนาดใหญ่ที่สุด อยู่ซ้ายมือติดกับจานหลัก
• **Salad Fork (ส้อมสลัด):** ขนาดเล็กกว่าส้อมหลัก สำหรับทานสลัดหรืออาหารเรียกน้ำย่อย
• **Fish Fork (ส้อมปลา):** ฟันส้อมมักมีรอยบากเล็กน้อยเพื่อช่วยเลาะก้างปลา
• **Dessert Fork (ส้อมของหวาน):** วางอยู่ด้านบนของจานหลัก

💡 *คำศัพท์ฝึกออกเสียง:*
- Dinner Fork (/ˈdɪnər fɔːrk/)
- "Could I bring you an extra dessert fork, sir?"`
  },
  {
    keywords: ['knife', 'มีด', 'dinner knife', 'steak knife', 'butter knife'],
    response: `ประเภทของมีดในงานบริการอาหาร:

• **Dinner Knife (มีดอาหารค่ำ):** วางทางขวา หันคมมีดเข้าหาจานเสมอ
• **Steak Knife (มีดสเต๊ก):** ใบมีดมีฟันปลาคม สำหรับหั่นเนื้อสัตว์
• **Butter Knife (มีดทาเนย):** วางบนจานขนมปัง (B&B Plate) ทางด้านซ้ายบน
• **Fish Knife (มีดปลา):** ใบมีดกว้างและปลายมน ไม่คมมาก เพื่อช่วยแซะเนื้อปลา

💡 *กฎสำคัญ:* คมมีด (Blade) ต้องหันเข้าหาจานอาหารเสมอเพื่อมารยาทและความปลอดภัยครับ`
  },
  {
    keywords: ['glass', 'แก้ว', 'wine glass', 'water goblet', 'champagne'],
    response: `การจัดแก้วเครื่องดื่มบนโต๊ะอาหาร (Glassware Placement):

• **Water Goblet (แก้วน้ำ):** วางอยู่เหนือมีดอาหารค่ำ เป็นแก้วหลักใบแรก
• **Red Wine Glass (แก้วไวน์แดง):** ตัวกระเปาะใหญ่ ปากกว้าง เพื่อให้ออกซิเจนช่วยเปิดกลิ่นไวน์
• **White Wine Glass (แก้วไวน์ขาว):** กระเปาะทรงทิวลิปเพรียวกว่า เพื่อรักษาอุณหภูมิความเย็น
• **Champagne Flute (แก้วแชมเปญ):** ทรงสูงยาวเพื่อกักเก็บฟองพราย (Bubbles)

💡 *ประโยคบริการ:* "Would you care for some still or sparkling water to begin with?"`
  },
  {
    keywords: ['fine model', 'fine', 'โมเดล fine', 'การเรียนรู้'],
    response: `กระบวนการจัดการเรียนรู้ตาม **FINE Model** 4 ขั้นตอน:

1. **F – Familiarize (สร้างความคุ้นเคย):** สแกนวัตถุ 3 มิติ สำรวจคำศัพท์ อุปกรณ์ และเมนูอาหาร
2. **I – Interact (โต้ตอบและฝึกปฏิบัติ):** ฝึกฟังเสียง ออกเสียง และสนทนากับระบบจำลอง
3. **N – Navigate (นำทางสู่สถานการณ์จำลอง):** แก้ปัญหาในการบริการจริงผ่าน 3D Simulation
4. **E – Exhibit (สะท้อนผลและประเมินสมรรถนะ):** แบบทดสอบ ประเมินผล และสรุปองค์ความรู้

ครูพิมพ์ขอเป็นกำลังใจให้ฝึกฝนต่อเนื่องนะครับ!`
  },
  {
    keywords: ['สวัสดี', 'hello', 'hi', 'ทักทาย', 'good morning', 'good evening'],
    response: `สวัสดีครับ! ยินดีต้อนรับสู่ระบบฝึกอบรม **FINE Model AI Learning Assistant** ครับ 

ผมพร้อมช่วยแนะนำ:
1. การจัดโต๊ะอาหาร (Table Setting) และการใช้อุปกรณ์
2. คำศัพท์และประโยคภาษาอังกฤษในงานบริการห้องอาหาร
3. การเตรียมตัวทำภารกิจสัปดาห์ที่ 1 และ 2

ผู้เรียนสามารถพิมพ์คำศัพท์หรือสถานการณ์ที่ต้องการฝึกถามได้เลยครับ!`
  }
]

export function generateChatFallback(userMessage: string): string {
  const normalized = userMessage.toLowerCase().trim()

  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some(k => normalized.includes(k.toLowerCase()))) {
      return item.response
    }
  }

  return `ขออภัยในความไม่สะดวกครับ ขณะนี้ช่องทาง AI หลักกำลังมีผู้ใช้งานหนาแน่น ระบบดึงข้อมูลจาก **คลังความรู้มาตรฐาน FINE Model** มาให้คำแนะนำดังนี้ครับ:

สำหรับการบริการอาหารและเครื่องดื่มมาตรฐานระดับสากล มีหลักปฏิบัติสำคัญ 3 ประการ:
1. **Professional Communication:** ใช้ภาษาที่สุภาพ ชัดเจน เช่น *"Certainly, right away sir/madam."*
2. **Table Etiquette:** เข้าเสิร์ฟอาหารจากทางด้านขวาของลูกค้า และเก็บจานจากทางด้านขวา (เว้นแต่จานขนมปังหรือสลัดเฉพาะ)
3. **Product Knowledge:** จดจำชื่ออุปกรณ์ ส่วนผสม และวิธีการรับประทานเพื่อให้คำแนะนำแก่ลูกค้าได้อย่างมั่นใจ

ผู้เรียนสามารถฝึกพูดคำศัพท์ในหน้า **"สำรวจอุปกรณ์ (Explore)"** หรือสอบถามเรื่องการจัดโต๊ะอาหารและแก้วน้ำเพิ่มเติมได้ตลอดเวลาครับ!`
}
