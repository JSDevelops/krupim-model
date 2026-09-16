export type MissionCategory = 'Appetizers' | 'Main Courses' | 'Desserts' | 'Beverages'

export interface Week2MissionItem {
  id: string
  nameEn: string
  nameTh: string
  category: MissionCategory
  categoryTh: string
  emoji: string
  pronounce: string
  sampleSentence: string
  keywords: string[]
}

export const WEEK2_MISSION_ITEMS: Week2MissionItem[] = [
  // ── 🥗 Appetizers (อาหารเรียกน้ำย่อย) ──
  {
    id: 'caesar-salad',
    nameEn: 'Caesar Salad',
    nameTh: 'สลัดซีซาร์',
    category: 'Appetizers',
    categoryTh: 'อาหารเรียกน้ำย่อย',
    emoji: '🥗',
    pronounce: '/ˈsiːzər ˈsæləd/',
    sampleSentence: 'Caesar Salad is categorized as an appetizer.',
    keywords: ['caesar salad', 'caesar', 'salad'],
  },
  {
    id: 'garlic-bread',
    nameEn: 'Garlic Bread',
    nameTh: 'ขนมปังกระเทียม',
    category: 'Appetizers',
    categoryTh: 'อาหารเรียกน้ำย่อย',
    emoji: '🥖',
    pronounce: '/ˈɡɑːrlɪk bred/',
    sampleSentence: 'Garlic Bread is served warm before the main course.',
    keywords: ['garlic bread', 'bread', 'baguette'],
  },
  {
    id: 'spring-rolls',
    nameEn: 'Spring Rolls',
    nameTh: 'ปอเปี๊ยะทอด',
    category: 'Appetizers',
    categoryTh: 'อาหารเรียกน้ำย่อย',
    emoji: '🥢',
    pronounce: '/sprɪŋ roʊlz/',
    sampleSentence: 'Crispy spring rolls are a popular Asian appetizer.',
    keywords: ['spring roll', 'spring rolls', 'egg roll'],
  },
  {
    id: 'mushroom-soup',
    nameEn: 'Mushroom Soup',
    nameTh: 'ซุปเห็ด',
    category: 'Appetizers',
    categoryTh: 'อาหารเรียกน้ำย่อย',
    emoji: '🥣',
    pronounce: '/ˈmʌʃruːm suːp/',
    sampleSentence: 'Cream of mushroom soup is served in a bouillon cup.',
    keywords: ['mushroom soup', 'soup', 'cream of mushroom'],
  },

  // ── 🥩 Main Courses (อาหารจานหลัก) ──
  {
    id: 'grilled-ribeye-steak',
    nameEn: 'Grilled Ribeye Steak',
    nameTh: 'สเต็กเนื้อริบอาย',
    category: 'Main Courses',
    categoryTh: 'อาหารจานหลัก',
    emoji: '🥩',
    pronounce: '/ɡrɪld ˈrɪbaɪ steɪk/',
    sampleSentence: 'Grilled Ribeye Steak is our signature main course.',
    keywords: ['grilled ribeye steak', 'ribeye steak', 'steak', 'beef'],
  },
  {
    id: 'salmon-fillet',
    nameEn: 'Salmon Fillet',
    nameTh: 'สเต็กปลาแซลมอน',
    category: 'Main Courses',
    categoryTh: 'อาหารจานหลัก',
    emoji: '🐟',
    pronounce: '/ˈsæmən ˈfɪleɪ/',
    sampleSentence: 'Pan-seared salmon fillet is served with lemon butter sauce.',
    keywords: ['salmon fillet', 'salmon', 'grilled salmon', 'fish'],
  },
  {
    id: 'spaghetti-carbonara',
    nameEn: 'Spaghetti Carbonara',
    nameTh: 'สปาเก็ตตี้คาโบนาร่า',
    category: 'Main Courses',
    categoryTh: 'อาหารจานหลัก',
    emoji: '🍝',
    pronounce: '/spəˈɡɛti ˌkɑːrbəˈnɑːrə/',
    sampleSentence: 'Spaghetti Carbonara is categorized as a main course.',
    keywords: ['spaghetti carbonara', 'carbonara', 'spaghetti', 'pasta'],
  },
  {
    id: 'roasted-chicken',
    nameEn: 'Roasted Chicken',
    nameTh: 'ไก่อบ',
    category: 'Main Courses',
    categoryTh: 'อาหารจานหลัก',
    emoji: '🍗',
    pronounce: '/ˈroʊstɪd ˈtʃɪkɪn/',
    sampleSentence: 'Herb roasted chicken is served with seasonal vegetables.',
    keywords: ['roasted chicken', 'roast chicken', 'chicken'],
  },

  // ── 🍰 Desserts (ของหวาน) ──
  {
    id: 'chocolate-lava-cake',
    nameEn: 'Chocolate Lava Cake',
    nameTh: 'เค้กช็อกโกแลตลาวา',
    category: 'Desserts',
    categoryTh: 'ของหวาน',
    emoji: '🍫',
    pronounce: '/ˈtʃɔːklət ˈlɑːvə keɪk/',
    sampleSentence: 'Chocolate Lava Cake is categorized as a dessert.',
    keywords: ['chocolate lava cake', 'chocolate cake', 'lava cake', 'cake'],
  },
  {
    id: 'tiramisu',
    nameEn: 'Tiramisu',
    nameTh: 'ทีรามิสุ',
    category: 'Desserts',
    categoryTh: 'ของหวาน',
    emoji: '☕',
    pronounce: '/ˌtɪrəmɪˈsuː/',
    sampleSentence: 'Tiramisu is a classic Italian coffee-flavored dessert.',
    keywords: ['tiramisu', 'italian dessert'],
  },
  {
    id: 'panna-cotta',
    nameEn: 'Panna Cotta',
    nameTh: 'พานาคอตต้า',
    category: 'Desserts',
    categoryTh: 'ของหวาน',
    emoji: '🍮',
    pronounce: '/ˌpænə ˈkɒtə/',
    sampleSentence: 'Panna Cotta is served chilled with berry coulis.',
    keywords: ['panna cotta', 'pudding'],
  },
  {
    id: 'ice-cream-vanilla',
    nameEn: 'Ice Cream Vanilla',
    nameTh: 'ไอศกรีมวานิลลา',
    category: 'Desserts',
    categoryTh: 'ของหวาน',
    emoji: '🍨',
    pronounce: '/aɪs kriːm vəˈnɪlə/',
    sampleSentence: 'Vanilla ice cream is served in a dessert bowl with a mint leaf.',
    keywords: ['ice cream vanilla', 'vanilla ice cream', 'ice cream'],
  },

  // ── 🍹 Beverages (เครื่องดื่ม) ──
  {
    id: 'mineral-water',
    nameEn: 'Mineral Water',
    nameTh: 'น้ำแร่',
    category: 'Beverages',
    categoryTh: 'เครื่องดื่ม',
    emoji: '💧',
    pronounce: '/ˈmɪnərəl ˈwɔːtər/',
    sampleSentence: 'Would you prefer sparkling or still mineral water?',
    keywords: ['mineral water', 'water', 'sparkling water', 'bottle water'],
  },
  {
    id: 'orange-juice',
    nameEn: 'Orange Juice',
    nameTh: 'น้ำส้มคั้น',
    category: 'Beverages',
    categoryTh: 'เครื่องดื่ม',
    emoji: '🍊',
    pronounce: '/ˈɔːrɪndʒ dʒuːs/',
    sampleSentence: 'Freshly squeezed orange juice is served chilled.',
    keywords: ['orange juice', 'juice', 'fresh orange'],
  },
  {
    id: 'soft-drinks',
    nameEn: 'Soft Drinks',
    nameTh: 'น้ำอัดลม',
    category: 'Beverages',
    categoryTh: 'เครื่องดื่ม',
    emoji: '🥤',
    pronounce: '/sɔːft drɪŋks/',
    sampleSentence: 'Soft drinks are categorized as non-alcoholic beverages.',
    keywords: ['soft drinks', 'soft drink', 'soda', 'cola'],
  },
  {
    id: 'virgin-mojito',
    nameEn: 'Virgin Mojito',
    nameTh: 'เวอร์จิ้นโมฮีโต้',
    category: 'Beverages',
    categoryTh: 'เครื่องดื่ม',
    emoji: '🍸',
    pronounce: '/ˈvɜːrdʒɪn moʊˈhiːtoʊ/',
    sampleSentence: 'Virgin Mojito belongs to non-alcoholic beverages.',
    keywords: ['virgin mojito', 'mojito', 'mocktail'],
  },
  {
    id: 'espresso',
    nameEn: 'Espresso',
    nameTh: 'กาแฟเอสเปรสโซ',
    category: 'Beverages',
    categoryTh: 'เครื่องดื่ม',
    emoji: '☕',
    pronounce: '/eˈspresoʊ/',
    sampleSentence: 'Espresso belongs to hot beverages and is served in a demitasse cup.',
    keywords: ['espresso', 'coffee espresso'],
  },
  {
    id: 'cappuccino',
    nameEn: 'Cappuccino',
    nameTh: 'กาแฟคาปูชิโน',
    category: 'Beverages',
    categoryTh: 'เครื่องดื่ม',
    emoji: '☕',
    pronounce: '/ˌkæpəˈtʃiːnoʊ/',
    sampleSentence: 'Cappuccino is topped with steamed milk foam and cocoa powder.',
    keywords: ['cappuccino', 'coffee cappuccino'],
  },
  {
    id: 'iced-americano',
    nameEn: 'Iced Americano',
    nameTh: 'อเมริกาโน่เย็น',
    category: 'Beverages',
    categoryTh: 'เครื่องดื่ม',
    emoji: '🧊',
    pronounce: '/aɪst əˌmerɪˈkɑːnoʊ/',
    sampleSentence: 'Iced Americano is made by pouring espresso over cold water and ice.',
    keywords: ['iced americano', 'americano', 'iced coffee'],
  },
  {
    id: 'hot-green-tea',
    nameEn: 'Hot Green Tea',
    nameTh: 'ชาเขียวร้อน',
    category: 'Beverages',
    categoryTh: 'เครื่องดื่ม',
    emoji: '🍵',
    pronounce: '/hɑːt ɡriːn tiː/',
    sampleSentence: 'Hot Green Tea is served in a ceramic cup after meals.',
    keywords: ['hot green tea', 'green tea', 'tea', 'hot tea'],
  },
]

export function matchMissionItem(text: string): Week2MissionItem | null {
  if (!text) return null
  const clean = text.toLowerCase().trim()
  for (const item of WEEK2_MISSION_ITEMS) {
    if (clean.includes(item.nameEn.toLowerCase()) || clean.includes(item.nameTh)) {
      return item
    }
    for (const kw of item.keywords) {
      if (clean.includes(kw)) return item
    }
  }
  return null
}
