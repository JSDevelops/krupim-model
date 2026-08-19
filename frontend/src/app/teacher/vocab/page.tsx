'use client'
import { useState, useEffect } from 'react'

interface Equipment {
  name: string
  nameEn: string
  emoji: string // เก็บได้ทั้ง Emoji หรือรูปภาพแบบ Base64 (data:image)
  use: string
  sentence: string
  ph?: string
}

// ข้อมูลคำศัพท์เริ่มต้นครอบคลุมทั้ง 10 หมวดหมู่อุปกรณ์ห้องอาหาร (Restaurant Equipment)
const initialVocabulary: Equipment[] = [
  // หมวดที่ 1 อุปกรณ์เครื่องใช้บนโต๊ะอาหาร (Tableware)
  { name: 'จานอาหารหลัก', nameEn: 'Dinner Plate', emoji: '🍽️', use: 'ใส่อาหารจานหลัก', sentence: 'The dinner plate is used for serving main courses.', ph: '/ˈdɪnər pleɪt/' },
  { name: 'จานสลัด', nameEn: 'Salad Plate', emoji: '🥗', use: 'ใส่สลัดหรืออาหารเรียกน้ำย่อย', sentence: 'The salad plate is used for appetizers or salad.', ph: '/ˈsæləd pleɪt/' },
  { name: 'จานขนมปัง', nameEn: 'Bread Plate', emoji: '🍞', use: 'วางขนมปังและเนย', sentence: 'The bread plate is placed on the left side of the setting.', ph: '/bred pleɪt/' },
  { name: 'จานรองถ้วยชา', nameEn: 'Saucer', emoji: '☕', use: 'รองถ้วยชาและกาแฟ', sentence: 'Place the cup neatly on the saucer.', ph: '/ˈsɔːsər/' },
  { name: 'ถ้วยซุป', nameEn: 'Soup Bowl', emoji: '🥣', use: 'ใส่ซุป', sentence: 'The soup bowl is used for serving hot soup.', ph: '/suːp bəʊl/' },
  { name: 'ถ้วยกาแฟ', nameEn: 'Coffee Cup', emoji: '☕', use: 'ใส่กาแฟ', sentence: 'We serve freshly brewed coffee in a coffee cup.', ph: '/ˈkɒfi kʌp/' },
  { name: 'ถ้วยชา', nameEn: 'Tea Cup', emoji: '🍵', use: 'ใส่ชา', sentence: 'Here is your tea cup for hot Jasmine tea.', ph: '/tiː kʌp/' },
  { name: 'ชามของหวาน', nameEn: 'Dessert Bowl', emoji: '🍨', use: 'ใส่ของหวาน', sentence: 'The dessert bowl is ideal for ice cream and fruits.', ph: '/dɪˈzɜːt bəʊl/' },
  { name: 'ถ้วยน้ำจิ้ม', nameEn: 'Sauce Dish', emoji: '🍲', use: 'ใส่น้ำจิ้ม', sentence: 'Pass the sauce dish to the guest.', ph: '/sɔːs dɪʃ/' },

  // หมวดที่ 2 เครื่องเงินและช้อนส้อม (Flatware / Cutlery)
  { name: 'มีดอาหารหลัก', nameEn: 'Dinner Knife', emoji: '🔪', use: 'ตัดอาหารจานหลัก', sentence: 'This is a dinner knife. It is used for cutting food.', ph: '/ˈdɪnər naɪf/' },
  { name: 'ส้อมอาหารหลัก', nameEn: 'Dinner Fork', emoji: '🍴', use: 'รับประทานอาหารจานหลัก', sentence: 'This is a dinner fork. It is used for the main course.', ph: '/ˈdɪnər fɔːk/' },
  { name: 'ช้อนอาหาร', nameEn: 'Dinner Spoon', emoji: '🥄', use: 'รับประทานอาหาร', sentence: 'The dinner spoon is used for rice or main food.', ph: '/ˈdɪnər spuːn/' },
  { name: 'ช้อนซุป', nameEn: 'Soup Spoon', emoji: '🥄', use: 'รับประทานซุป', sentence: 'Use the soup spoon for drinking soup.', ph: '/suːp spuːn/' },
  { name: 'มีดเนย', nameEn: 'Butter Knife', emoji: '🔪', use: 'ทาเนยบนขนมปัง', sentence: 'Use the butter knife to spread butter on your bread.', ph: '/ˈbʌtər naɪf/' },
  { name: 'ส้อมสลัด', nameEn: 'Salad Fork', emoji: '🥗', use: 'รับประทานสลัด', sentence: 'The salad fork is slightly smaller than the dinner fork.', ph: '/ˈsæləd fɔːk/' },
  { name: 'มีดปลา', nameEn: 'Fish Knife', emoji: '🐟', use: 'รับประทานปลา', sentence: 'The fish knife has a special blunt blade for lifting fish bones.', ph: '/fɪʃ naɪf/' },
  { name: 'ส้อมปลา', nameEn: 'Fish Fork', emoji: '🐟', use: 'รับประทานปลา', sentence: 'Use the fish fork along with the fish knife.', ph: '/fɪʃ fɔːk/' },
  { name: 'ช้อนของหวาน', nameEn: 'Dessert Spoon', emoji: '🍨', use: 'รับประทานของหวาน', sentence: 'The dessert spoon is served with puddings and cakes.', ph: '/dɪˈzɜːt spuːn/' },
  { name: 'ส้อมของหวาน', nameEn: 'Dessert Fork', emoji: '🍰', use: 'รับประทานของหวาน', sentence: 'Use the dessert fork for fruit or cake.', ph: '/dɪˈzɜːt fɔːk/' },
  { name: 'ช้อนชา', nameEn: 'Tea Spoon', emoji: '🥄', use: 'คนชา กาแฟ', sentence: 'Stir your hot tea gently with the tea spoon.', ph: '/tiː spuːn/' },
  { name: 'ช้อนกาแฟ', nameEn: 'Coffee Spoon', emoji: '☕', use: 'คนกาแฟเอสเปรสโซ', sentence: 'The coffee spoon is designed for small espresso cups.', ph: '/ˈkɒfi spuːn/' },

  // หมวดที่ 3 เครื่องแก้ว (Glassware)
  { name: 'แก้วน้ำเปล่า', nameEn: 'Water Goblet', emoji: '🍷', use: 'ใช้สำหรับบริการน้ำเปล่า', sentence: 'Water goblet is filled with ice water.', ph: '/ˈwɔːtər ˈɡɒblət/' },
  { name: 'แก้วไวน์แดง', nameEn: 'Red Wine Glass', emoji: '🍷', use: 'บริการไวน์แดง', sentence: 'Red wine glass has a large, round bowl.', ph: '/red waɪn ɡlɑːs/' },
  { name: 'แก้วไวน์ขาว', nameEn: 'White Wine Glass', emoji: '🥂', use: 'บริการไวน์ขาว', sentence: 'White wine glass is smaller to preserve chilled temperature.', ph: '/waɪt waɪn ɡlɑːs/' },
  { name: 'แก้วแชมเปญ', nameEn: 'Champagne Flute', emoji: '🥂', use: 'บริการแชมเปญ', sentence: 'Champagne flute keeps bubbles sparkling longer.', ph: '/ʃæmˈpeɪn fluːt/' },
  { name: 'แก้วค็อกเทล', nameEn: 'Cocktail Glass', emoji: '🍸', use: 'บริการค็อกเทล', sentence: 'Cocktail glass is classic V-shaped glass.', ph: '/ˈkɒkteɪl ɡlɑːs/' },
  { name: 'แก้วไฮบอล', nameEn: 'Highball Glass', emoji: '🥤', use: 'บริการเครื่องดื่มผสม', sentence: 'Highball glass is used for long drinks and juices.', ph: '/ˈhaɪbɔːl ɡlɑːs/' },
  { name: 'แก้วร็อกส์', nameEn: 'Rocks Glass', emoji: '🥃', use: 'บริการวิสกี้', sentence: 'Rocks glass is used for spirits served on the rocks.', ph: '/rɒks ɡlɑːs/' },
  { name: 'แก้วเบียร์', nameEn: 'Beer Glass', emoji: '🍺', use: 'บริการเบียร์', sentence: 'Pour beer carefully into the beer glass.', ph: '/bɪər ɡlɑːs/' },
  { name: 'แก้วบรั่นดี', nameEn: 'Brandy Snifter', emoji: '🥃', use: 'บริการบรั่นดี', sentence: 'Hold the brandy snifter in your palm to warm it.', ph: '/ˈbrændi ˈsnɪf.tər/' },
  { name: 'แก้วมาร์ตินี', nameEn: 'Martini Glass', emoji: '🍸', use: 'บริการมาร์ตินี', sentence: 'Serve chilled Martini in a martini glass with an olive.', ph: '/mɑːˈtiːni ɡlɑːs/' },

  // หมวดที่ 4 เครื่องลินิน (Linen)
  { name: 'ผ้าปูโต๊ะ', nameEn: 'Table Cloth', emoji: '🟫', use: 'ปูโต๊ะอาหาร', sentence: 'The table cloth must be clean and unwrinkled.', ph: '/ˈteɪbl klɒθ/' },
  { name: 'ผ้ารองโต๊ะ', nameEn: 'Under Cloth', emoji: '⬛', use: 'รองผ้าปูโต๊ะเพื่อลดเสียง', sentence: 'Under cloth absorbs noise and softens the table surface.', ph: '/ˈʌndər klɒθ/' },
  { name: 'ผ้าเช็ดปาก', nameEn: 'Napkin', emoji: '🎗️', use: 'เช็ดปากและตกแต่งโต๊ะ', sentence: 'Fold the napkin neatly on the guest plate.', ph: '/ˈnæpkɪn/' },
  { name: 'ผ้าคลุมถาด', nameEn: 'Tray Cloth', emoji: '📐', use: 'รองถาดเสิร์ฟกันลื่น', sentence: 'Place a tray cloth to prevent glasses from slipping.', ph: '/treɪ klɒθ/' },
  { name: 'ผ้าเช็ดแก้ว', nameEn: 'Glass Cloth', emoji: '🧺', use: 'เช็ดทำความสะอาดแก้ว', sentence: 'Polishing glasses with a lint-free glass cloth.', ph: '/ɡlɑːs klɒθ/' },
  { name: 'ผ้าเช็ดเครื่องเงิน', nameEn: 'Polishing Cloth', emoji: '✨', use: 'เช็ดเครื่องเงินและช้อนส้อม', sentence: 'Use polishing cloth for shiny flatware.', ph: '/ˈpɒlɪʃɪŋ klɒθ/' },

  // หมวดที่ 5 อุปกรณ์เครื่องปรุง (Condiment Set)
  { name: 'ขวดเกลือ', nameEn: 'Salt Shaker', emoji: '🧂', use: 'ใส่เกลือปรุงรส', sentence: 'Salt shaker is placed next to pepper shaker.', ph: '/sɔːlt ˈʃeɪkər/' },
  { name: 'ขวดพริกไทย', nameEn: 'Pepper Shaker', emoji: '🌶️', use: 'ใส่พริกไทยปรุงรส', sentence: 'Offer fresh pepper shaker to guests.', ph: '/ˈpepər ˈʃeɪkər/' },
  { name: 'โถน้ำตาล', nameEn: 'Sugar Bowl', emoji: '🍯', use: 'ใส่น้ำตาล', sentence: 'Sugar bowl is served with coffee and tea service.', ph: '/ˈʃʊɡər bəʊl/' },
  { name: 'ขวดซอส', nameEn: 'Sauce Bottle', emoji: '🍾', use: 'ใส่ซอสปรุงรส', sentence: 'Sauce bottle provides extra flavor for meals.', ph: '/sɔːs ˈbɒtl/' },
  { name: 'ขวดน้ำส้มสายชู', nameEn: 'Vinegar Bottle', emoji: '🏺', use: 'ใส่น้ำส้มสายชู', sentence: 'Vinegar bottle is part of salad dressing condiments.', ph: '/ˈvɪnɪɡər ˈbɒtl/' },
  { name: 'ขวดน้ำมันมะกอก', nameEn: 'Olive Oil Bottle', emoji: '🫒', use: 'ใส่น้ำมันมะกอก', sentence: 'Serve extra virgin olive oil bottle with bread.', ph: '/ˈɒlɪv ɔɪl ˈbɒtl/' },

  // หมวดที่ 6 อุปกรณ์บริการอาหาร (Service Equipment)
  { name: 'ถาดเสิร์ฟอาหาร', nameEn: 'Service Tray', emoji: '🪞', use: 'เสิร์ฟอาหาร', sentence: 'Carry food items safely using a service tray.', ph: '/ˈsɜːvɪs treɪ/' },
  { name: 'ถาดเครื่องดื่ม', nameEn: 'Beverage Tray', emoji: '🍸', use: 'เสิร์ฟเครื่องดื่ม', sentence: 'Beverage tray should be held with one hand from below.', ph: '/ˈbevərɪdʒ treɪ/' },
  { name: 'ถาดกลม', nameEn: 'Round Tray', emoji: '⭕', use: 'เสิร์ฟอาหารและแก้วน้ำ', sentence: 'Round tray is standard for beverage service.', ph: '/raʊnd treɪ/' },
  { name: 'ถาดสี่เหลี่ยม', nameEn: 'Rectangular Tray', emoji: '▭', use: 'เสิร์ฟอาหารจานใหญ่', sentence: 'Rectangular tray carries multiple plates easily.', ph: '/rekˈtæŋɡjələr treɪ/' },
  { name: 'เหยือกน้ำ', nameEn: 'Water Pitcher', emoji: '🫖', use: 'เติมน้ำเปล่า', sentence: 'Refill guests water glasses with water pitcher.', ph: '/ˈwɔːtər ˈpɪtʃər/' },
  { name: 'เหยือกกาแฟ', nameEn: 'Coffee Pot', emoji: '☕', use: 'เสิร์ฟกาแฟร้อน', sentence: 'Pour hot coffee carefully from the coffee pot.', ph: '/ˈkɒfi pɒt/' },
  { name: 'กาน้ำชา', nameEn: 'Tea Pot', emoji: '🫖', use: 'เสิร์ฟชาร้อน', sentence: 'Tea pot holds hot water for steeping tea.', ph: '/tiː pɒt/' },
  { name: 'ถังน้ำแข็ง', nameEn: 'Ice Bucket', emoji: '🧊', use: 'แช่ไวน์และใส่น้ำแข็ง', sentence: 'Ice bucket keeps wine bottles nicely chilled.', ph: '/aɪs ˈbʌkɪt/' },
  { name: 'คีมคีบน้ำแข็ง', nameEn: 'Ice Tong', emoji: '🥢', use: 'คีบน้ำแข็ง', sentence: 'Pick up ice cubes hygienically with ice tong.', ph: '/aɪs tɒŋ/' },
  { name: 'ที่เปิดไวน์', nameEn: 'Wine Opener', emoji: '🍷', use: 'เปิดขวดไวน์', sentence: 'Servers should carry a wine opener at all times.', ph: '/waɪn ˈəʊpnər/' },

  // หมวดที่ 7 อุปกรณ์สำหรับบริการไวน์และเครื่องดื่ม (Beverage Equipment)
  { name: 'ตะกร้าไวน์', nameEn: 'Wine Basket', emoji: '🧺', use: 'วางขวดไวน์แดงวินเทจ', sentence: 'Wine basket presents aged red wine horizontally.', ph: '/waɪn ˈbɑːskɪt/' },
  { name: 'ถังแช่ไวน์', nameEn: 'Wine Cooler', emoji: '🍾', use: 'แช่ไวน์ให้เย็น', sentence: 'Keep white wine cold in a wine cooler filled with ice.', ph: '/waɪn ˈkuːlər/' },
  { name: 'จุกปิดขวดไวน์', nameEn: 'Wine Stopper', emoji: '🍾', use: 'ปิดขวดไวน์เพื่อรักษาคุณภาพ', sentence: 'Seal opened wine bottle with a wine stopper.', ph: '/waɪn ˈstɒpər/' },
  { name: 'เครื่องรินไวน์', nameEn: 'Wine Pourer', emoji: '🍷', use: 'รินไวน์ไม่ให้หยดเลอะเทอะ', sentence: 'Wine pourer prevents dripping on the tablecloth.', ph: '/waɪn ˈpɔːrər/' },
  { name: 'ที่เปิดขวด', nameEn: 'Bottle Opener', emoji: '🍾', use: 'เปิดฝาขวดเครื่องดื่ม', sentence: 'Use bottle opener for soda and beer bottles.', ph: '/ˈbɒtl ˈəʊpnər/' },
  { name: 'ที่เปิดไวน์แบบเกลียว', nameEn: 'Corkscrew', emoji: '🔩', use: 'ถอดจุกคอร์กขวดไวน์', sentence: 'Insert corkscrew into the center of cork.', ph: '/ˈkɔːkskruː/' },

  // หมวดที่ 8 อุปกรณ์ Gueridon (การบริการด้วยรถเข็น)
  { name: 'รถเข็นบริการ', nameEn: 'Gueridon Trolley', emoji: '🛒', use: 'เตรียมและปรุงอาหารต่อหน้าลูกค้าที่โต๊ะ', sentence: 'Gueridon trolley is used for side-table cooking service.', ph: '/ˈɡerɪdɒn ˈtrɒli/' },
  { name: 'เตาแอลกอฮอล์', nameEn: 'Spirit Lamp', emoji: '🔥', use: 'ให้ความร้อนบนรถเข็น', sentence: 'Spirit lamp provides flame for flambé dishes.', ph: '/ˈspɪrɪt læmp/' },
  { name: 'กระทะฟลอมเบ', nameEn: 'Flambé Pan', emoji: '🍳', use: 'ทำอาหารฟลอมเบ (ราดเหล้าจุดไฟ)', sentence: 'Prepare Crepe Suzette using a flambé pan.', ph: '/flɒmˈbeɪ pæn/' },
  { name: 'เขียงเตรียมอาหาร', nameEn: 'Cutting Board', emoji: '🪵', use: 'แล่เนื้อหรือหั่นเตรียมอาหาร', sentence: 'Carve roasted meat on a clean cutting board.', ph: '/ˈkʌtɪŋ bɔːd/' },
  { name: 'มีดเชฟ', nameEn: 'Chef\'s Knife', emoji: '🔪', use: 'หั่นและตัดแล่ส่วนผสม', sentence: 'Chef\'s knife cuts meat smoothly for serving.', ph: '/ʃefs naɪf/' },
  { name: 'คีมคีบอาหารบริการ', nameEn: 'Serving Tong', emoji: '🥢', use: 'คีบอาหารเสิร์ฟลูกค้า', sentence: 'Transfer food onto guest plates using serving tong.', ph: '/ˈsɜːvɪŋ tɒŋ/' },

  // หมวดที่ 9 อุปกรณ์จัดโต๊ะ (Table Setting Accessories)
  { name: 'เชิงเทียน', nameEn: 'Candle Holder', emoji: '🕯️', use: 'วางเทียนตกแต่งโต๊ะอาหาร', sentence: 'Candle holder adds romantic atmosphere to dinner.', ph: '/ˈkændl ˈhəʊldər/' },
  { name: 'แจกันดอกไม้', nameEn: 'Flower Vase', emoji: '💐', use: 'ตกแต่งโต๊ะอาหาร', sentence: 'Flower vase centerpieces should not block guest eye lines.', ph: '/ˈflaʊər vɑːz/' },
  { name: 'ป้ายหมายเลขโต๊ะ', nameEn: 'Table Number', emoji: '🔢', use: 'ระบุหมายเลขโต๊ะอาหาร', sentence: 'Table number helps servers identify guest tables.', ph: '/ˈteɪbl ˈnʌmbər/' },
  { name: 'การ์ดเมนู', nameEn: 'Menu Card', emoji: '📜', use: 'แสดงรายการอาหารและเครื่องดื่ม', sentence: 'Present the menu card from the right side of guest.', ph: '/ˈmenjuː kɑːd/' },
  { name: 'แผ่นจานรอง', nameEn: 'Charger Plate', emoji: '📀', use: 'รองจานอาหารเพื่อความสวยงาม', sentence: 'Charger plate remains on table until main course.', ph: '/ˈtʃɑːdʒər pleɪt/' },
  { name: 'ที่รองแก้ว', nameEn: 'Coaster', emoji: '⭕', use: 'รองแก้วเครื่องดื่ม', sentence: 'Place a coaster under cold drink glasses.', ph: '/ˈkəʊstər/' },

  // หมวดที่ 10 อุปกรณ์สถานีบริการ (Side Station Equipment)
  { name: 'ตู้เก็บอุปกรณ์', nameEn: 'Sideboard', emoji: '🗄️', use: 'เก็บสำรองอุปกรณ์บริการ', sentence: 'Sideboard holds extra cutlery, napkins and glasses.', ph: '/ˈsaɪdbɔːd/' },
  { name: 'ถังเก็บช้อนส้อม', nameEn: 'Cutlery Holder', emoji: '🍴', use: 'จัดเก็บช้อนส้อมเป็นหมวดหมู่', sentence: 'Keep clean spoons and forks sorted in cutlery holder.', ph: '/ˈkʌtləri ˈhəʊldər/' },
  { name: 'ถังขยะบริการ', nameEn: 'Waste Bin', emoji: '🗑️', use: 'ทิ้งขยะเศษวัสดุ', sentence: 'Keep waste bin hidden inside side station cabinet.', ph: '/weɪst bɪn/' },
  { name: 'ถังเก็บน้ำแข็ง', nameEn: 'Ice Bin', emoji: '🧊', use: 'เก็บสำรองน้ำแข็งสะอาด', sentence: 'Ice bin stores ice for beverage service.', ph: '/aɪs bɪn/' },
  { name: 'ถาดเก็บจาน', nameEn: 'Plate Rack', emoji: '🍽️', use: 'จัดเก็บจานอาหาร', sentence: 'Stack clean plates carefully in the plate rack.', ph: '/pleɪt ræk/' },
  { name: 'ตะกร้าเก็บผ้า', nameEn: 'Linen Basket', emoji: '🧺', use: 'เก็บผ้าเช็ดปากและผ้าปูโต๊ะที่ใช้แล้ว', sentence: 'Place used napkins in the linen basket.', ph: '/ˈlɪnɪn ˈbɑːskɪt/' }
]

export default function TeacherVocabPage() {
  const [vocabList, setVocabList] = useState<Equipment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTargetNameEn, setEditingTargetNameEn] = useState<string | null>(null)
  
  // States สำหรับ Modal ฟอร์ม
  const [showModal, setShowModal] = useState(false)
  const [nameEn, setNameEn] = useState('')
  const [name, setName] = useState('')
  const [ph, setPh] = useState('')
  const [emoji, setEmoji] = useState('🍴') // ใช้เก็บ Base64 หรือ Emoji หรือ URL
  const [use, setUse] = useState('')
  const [sentence, setSentence] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('teacherVocabulary')
      if (stored) {
        try { setVocabList(JSON.parse(stored)) } catch (e) {}
      } else {
        localStorage.setItem('teacherVocabulary', JSON.stringify(initialVocabulary))
        setVocabList(initialVocabulary)
      }
    }
  }, [])

  function saveToLocalStorage(newList: Equipment[]) {
    setVocabList(newList)
    try {
      localStorage.setItem('teacherVocabulary', JSON.stringify(newList))
    } catch (e: any) {
      console.error('Storage error:', e)
      alert('⚠️ หน่วยความจำเครื่องเต็ม ไม่สามารถบันทึกได้ โปรดใช้รูปภาพที่มีขนาดเล็กลง')
    }
  }

  function handleResetDefault() {
    if (confirm('คุณต้องการรีเซ็ตคลังคำศัพท์กลับเป็นชุดมาตรฐาน 10 หมวดหมู่จากเอกสาร PDF หรือไม่?')) {
      saveToLocalStorage(initialVocabulary)
    }
  }

  function openCreateModal() {
    setEditingTargetNameEn(null)
    setNameEn('')
    setName('')
    setPh('')
    setEmoji('🍴')
    setUse('')
    setSentence('')
    setShowModal(true)
  }

  function openEditModal(item: Equipment) {
    setEditingTargetNameEn(item.nameEn)
    setNameEn(item.nameEn)
    setName(item.name)
    setPh(item.ph || '')
    setEmoji(item.emoji)
    setUse(item.use)
    setSentence(item.sentence)
    setShowModal(true)
  }

  // 📸 บีบอัดรูปภาพอัตโนมัติเป็นสี่เหลี่ยมจัตุรัส 1:1 ขนาด 256x256 (ลดขนาดเหลือ ~20KB หมดปัญหา Storage เต็ม)
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const TARGET_SIZE = 256
        canvas.width = TARGET_SIZE
        canvas.height = TARGET_SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setEmoji(rawDataUrl)
          return
        }

        // Crop 1:1 square center
        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE)
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82)
        setEmoji(compressedBase64)
      }
      img.src = rawDataUrl
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nameEn || !name) return

    const newItem: Equipment = { name, nameEn, emoji, use, sentence, ph }
    let updated = [...vocabList]

    if (editingTargetNameEn !== null) {
      const targetIdx = updated.findIndex(v => v.nameEn.toLowerCase() === editingTargetNameEn.toLowerCase())
      if (targetIdx !== -1) {
        updated[targetIdx] = newItem
      } else {
        updated.unshift(newItem)
      }
    } else {
      // Check if already exists
      const existingIdx = updated.findIndex(v => v.nameEn.toLowerCase() === nameEn.toLowerCase())
      if (existingIdx !== -1) {
        updated[existingIdx] = newItem
      } else {
        updated.unshift(newItem)
      }
    }

    saveToLocalStorage(updated)
    setShowModal(false)
    alert('✅ บันทึกคำศัพท์และรูปภาพเรียบร้อยแล้ว!')
  }

  function handleDelete(itemToDelete: Equipment) {
    if (confirm(`คุณต้องการลบคำศัพท์ "${itemToDelete.nameEn} (${itemToDelete.name})" ออกจากคลังหรือไม่?`)) {
      const updated = vocabList.filter(v => v.nameEn.toLowerCase() !== itemToDelete.nameEn.toLowerCase())
      saveToLocalStorage(updated)
    }
  }

  const filteredVocab = vocabList.filter(item => 
    item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F6F3F9', paddingBottom: 90 }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #4A126B 0%, #68239F 60%, #7B1FA2 100%)',
        padding: '52px 20px 24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(104,35,159,0.25)'
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <span style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100, display: 'inline-block', marginBottom: 8, letterSpacing: '0.8px' }}>TEACHER PLATFORM</span>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>📖 การจัดการคลังคำศัพท์</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>เพิ่ม แก้ไข ลบ คำศัพท์และตัวอย่างประโยคเพื่อให้แสดงบนแอปนักเรียน</p>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        {/* Controls row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input 
            type="text" 
            placeholder="🔍 ค้นหาคำศัพท์ อังกฤษ/ไทย..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 14,
              border: '1.5px solid #EDE9E1', outline: 'none',
              fontSize: 13.5, background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          />
          <button 
            onClick={openCreateModal}
            style={{
              padding: '0 16px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #4A126B, #68239F)',
              color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(104,35,159,0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            ➕ เพิ่มคำศัพท์
          </button>
          <button 
            onClick={handleResetDefault}
            style={{
              padding: '0 14px', borderRadius: 14, border: '1px solid #7B1FA2',
              background: '#F0EAF8',
              color: '#68239F', fontSize: 12, fontWeight: 800, cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="โหลดคำศัพท์มาตรฐาน 10 หมวดหมู่จากเอกสาร PDF"
          >
            🔄 รีเซ็ตคลัง PDF
          </button>
        </div>

        {/* Vocab count */}
        <div style={{ fontSize: 12, color: '#8C8272', fontWeight: 700 }}>
          คำศัพท์ทั้งหมด {filteredVocab.length} รายการ (ครอบคลุมอุปกรณ์ 10 หมวดหมู่)
        </div>

        {/* Vocab cards list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredVocab.map((item, index) => (
            <div 
              key={index} 
              style={{
                background: 'white', borderRadius: 18, padding: '14px 16px',
                border: '1px solid #EDE9E1', boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex', alignItems: 'center', gap: 14
              }}
            >
              {/* รูปภาพอัตราส่วน 1:1 ขนาด 48px พร้อมขอบโค้ง */}
              <div style={{
                width: 48, height: 48, background: '#F6F3F9',
                borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '1.5px solid rgba(123,31,162,0.1)', flexShrink: 0
              }}>
                {item.emoji && (item.emoji.startsWith('data:image') || item.emoji.startsWith('http') || item.emoji.startsWith('/')) ? (
                  <img src={item.emoji} alt={item.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 26 }}>{item.emoji}</span>
                )}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 14.5, color: '#1A1410' }}>{item.nameEn}</span>
                  {item.ph && <span style={{ fontSize: 10, color: '#8C8272', fontFamily: 'monospace' }}>{item.ph}</span>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#68239F', marginTop: 1 }}>{item.name}</div>
                <div style={{ fontSize: 10.5, color: '#8C8272', marginTop: 4, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>วิธีใช้: </strong>{item.use}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  onClick={() => openEditModal(item)}
                  style={{
                    width: 32, height: 32, borderRadius: 10, border: 'none',
                    background: '#F0EAF8', color: '#68239F', cursor: 'pointer',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="แก้ไข"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(item)}
                  style={{
                    width: 32, height: 32, borderRadius: 10, border: 'none',
                    background: '#FAE8EB', color: '#8B2635', cursor: 'pointer',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="ลบ"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CREATE / EDIT DIALOG (MODAL POPUP) ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(74,18,107,0.4)',
          zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }} onClick={() => setShowModal(false)}>
          <form 
            onSubmit={handleSubmit}
            onClick={e => e.stopPropagation()} 
            style={{
              background: 'white', borderRadius: 24, padding: '24px',
              width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 14,
              boxShadow: '0 12px 36px rgba(0,0,0,0.15)', animation: 'scaleUp 0.25s ease'
            }}
          >
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#4A126B', margin: 0 }}>
                {editingTargetNameEn !== null ? '✏️ แก้ไขคำศัพท์' : '➕ เพิ่มคำศัพท์ใหม่'}
              </h3>
              <p style={{ fontSize: 11.5, color: '#8C8272', margin: '2px 0 0' }}>อัปเดตรูปภาพจริงขนาด 1:1 พร้อมความหมายคำศัพท์</p>
            </div>

            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {/* 📸 Image Upload Field with 1:1 Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px', background: '#F6F3F9', borderRadius: 16, border: '1.5px dashed rgba(123,31,162,0.2)' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 12, background: 'white',
                  border: '1.5px solid #EDE9E1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', position: 'relative'
                }}>
                  {emoji && (emoji.startsWith('data:image') || emoji.startsWith('http') || emoji.startsWith('/')) ? (
                    <img src={emoji} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 32 }}>{emoji || '🍴'}</span>
                  )}
                </div>
                
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ fontSize: 11.5, width: '100%', maxWidth: '220px', color: '#68239F' }}
                />
                <span style={{ fontSize: 10, color: '#8C8272' }}>อัตราส่วนภาพแนะนำ 1:1 ขนาดสูงสุดไม่เกิน 2 MB</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 10, alignItems: 'center' }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>คำอังกฤษ</label>
                <input 
                  type="text" 
                  value={nameEn} 
                  onChange={e => setNameEn(e.target.value)} 
                  placeholder="เช่น Water Goblet" 
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none' }}
                  required
                />

                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>คำสัทอักษร</label>
                <input 
                  type="text" 
                  value={ph} 
                  onChange={e => setPh(e.target.value)} 
                  placeholder="เช่น /ˈwɔːtər ˈɡɒblət/" 
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none' }}
                />

                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>คำแปลไทย</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="เช่น แก้วน้ำเปล่า" 
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none' }}
                  required
                />

                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>วิธีใช้งาน</label>
                <textarea 
                  value={use} 
                  onChange={e => setUse(e.target.value)} 
                  placeholder="เช่น ใช้สำหรับตั้งวางทางด้านขวาของจานหลัก" 
                  rows={2}
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  required
                />

                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A4138' }}>ตัวอย่างประโยค</label>
                <textarea 
                  value={sentence} 
                  onChange={e => setSentence(e.target.value)} 
                  placeholder="เช่น Would you like some water, sir?" 
                  rows={2}
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EDE9E1', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #EDE9E1', background: 'white', color: '#8C8272', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
              <button 
                type="submit"
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #4A126B, #68239F)', color: 'white', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                💾 บันทึกคำศัพท์
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
