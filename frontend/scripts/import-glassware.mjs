import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

const glasses = [
  {
    nameEn: 'Water Goblet',
    nameTh: 'แก้วน้ำ',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/ˈwɔːtər ˈɡɑːblət/',
    useDesc: 'แก้วทรงมีขาสำหรับเสิร์ฟน้ำดื่ม น้ำเปล่า หรือน้ำแร่บนโต๊ะอาหาร มักใช้ในงานบริการอาหารและโรงแรม',
    sentence: 'Please serve the water in a water goblet.',
    file: 'glass_water_goblet.webp'
  },
  {
    nameEn: 'Highball Glass',
    nameTh: 'แก้วไฮบอล',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/ˈhaɪbɔːl ɡlæs/',
    useDesc: 'แก้วทรงสูง ใช้เสิร์ฟเครื่องดื่มผสม เช่น Highball, Whisky Soda, น้ำอัดลม และค็อกเทลที่มีปริมาณมาก มักเสิร์ฟพร้อมน้ำแข็ง',
    sentence: 'Please serve the cocktail in a highball glass.',
    file: 'glass_highball_glass.webp'
  },
  {
    nameEn: 'Collins Glass',
    nameTh: 'แก้วคอลลินส์',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/ˈkɑːlɪnz ɡlæs/',
    useDesc: 'แก้วทรงสูงและเรียวยาว ใช้สำหรับเสิร์ฟค็อกเทลประเภท Collins เช่น Tom Collins รวมถึงเครื่องดื่มผสมและเครื่องดื่มที่มีโซดา',
    sentence: 'A Tom Collins is usually served in a Collins glass.',
    file: 'glass_collins_glass.webp'
  },
  {
    nameEn: 'Red Wine Glass',
    nameTh: 'แก้วไวน์แดง',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/red waɪn ɡlæs/',
    useDesc: 'แก้วไวน์ที่มีโถแก้วค่อนข้างกว้าง ช่วยให้ไวน์แดงสัมผัสอากาศและพัฒนากลิ่น เหมาะสำหรับการเสิร์ฟไวน์แดง',
    sentence: 'Please pour the red wine into a red wine glass.',
    file: 'glass_red_wine_glass.webp'
  },
  {
    nameEn: 'White Wine Glass',
    nameTh: 'แก้วไวน์ขาว',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/waɪt waɪn ɡlæs/',
    useDesc: 'แก้วไวน์ที่มีขนาดเล็กและแคบกว่าแก้วไวน์แดง ใช้เสิร์ฟไวน์ขาวและช่วยรักษาอุณหภูมิและกลิ่นของไวน์',
    sentence: 'White wine should be served in a white wine glass.',
    file: 'glass_white_wine_glass.webp'
  },
  {
    nameEn: 'Champagne Flute',
    nameTh: 'แก้วแชมเปญฟลูต',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/ʃæmˈpeɪn fluːt/',
    useDesc: 'แก้วทรงสูงเรียว มีขา ใช้เสิร์ฟแชมเปญและไวน์สปาร์กลิง ช่วยรักษาฟองและความซ่าของเครื่องดื่ม',
    sentence: 'Please serve the champagne in a champagne flute.',
    file: 'glass_champagne_flute.webp'
  },
  {
    nameEn: 'Champagne Coupe',
    nameTh: 'แก้วแชมเปญคูเป้',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/ʃæmˈpeɪn kuːp/',
    useDesc: 'แก้วแชมเปญทรงตื้น ปากกว้าง มีขา ใช้สำหรับเสิร์ฟแชมเปญ ค็อกเทล และเครื่องดื่มที่ต้องการนำเสนอในรูปแบบคลาสสิก',
    sentence: 'The champagne is served in a coupe glass.',
    file: 'glass_champagne_coupe.webp'
  },
  {
    nameEn: 'Martini Glass',
    nameTh: 'แก้วมาร์ตินี่',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/mɑːrˈtiːni ɡlæs/',
    useDesc: 'แก้วก้านยาวที่มีปากกว้างและรูปทรงกรวย ใช้เสิร์ฟ Martini และค็อกเทลประเภทที่ไม่ใส่น้ำแข็งในแก้ว',
    sentence: 'Please serve the Martini in a martini glass.',
    file: 'glass_martini_glass.webp'
  },
  {
    nameEn: 'Rock Glass',
    nameTh: 'แก้วร็อก / แก้ววิสกี้',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/rɑːk ɡlæs/',
    useDesc: 'แก้วทรงเตี้ย ปากกว้าง และก้นหนา ใช้เสิร์ฟวิสกี้ บรั่นดี และเครื่องดื่มประเภท Spirits แบบเพียวหรือใส่น้ำแข็ง',
    sentence: 'Please serve the whisky in a rock glass.',
    file: 'glass_rock_glass.webp'
  },
  {
    nameEn: 'Margarita Glass',
    nameTh: 'แก้วมาร์การิต้า',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/ˌmɑːrɡəˈriːtə ɡlæs/',
    useDesc: 'แก้วก้านที่มีรูปทรงเป็นชั้นหรือปากกว้าง ใช้เสิร์ฟ Margarita และค็อกเทลที่มีลักษณะคล้ายกัน โดยมักตกแต่งขอบแก้วด้วยเกลือ',
    sentence: 'The Margarita is served in a margarita glass.',
    file: 'glass_margarita_glass.webp'
  },
  {
    nameEn: 'Hurricane Glass',
    nameTh: 'แก้วเฮอริเคน',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/ˈhɜːrɪkeɪn ɡlæs/',
    useDesc: 'แก้วทรงสูงที่มีส่วนโค้งคล้ายตะเกียง ใช้เสิร์ฟค็อกเทลที่มีปริมาณมาก เช่น Hurricane และเครื่องดื่มผลไม้หรือเครื่องดื่มเขตร้อน',
    sentence: 'Please serve the tropical cocktail in a hurricane glass.',
    file: 'glass_hurricane_glass.webp'
  },
  {
    nameEn: 'Shot Glass',
    nameTh: 'แก้วช็อต',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/ʃɑːt ɡlæs/',
    useDesc: 'แก้วขนาดเล็ก ใช้สำหรับเสิร์ฟเครื่องดื่ม Spirits ในปริมาณเล็ก เช่น Tequila, Vodka หรือเครื่องดื่มสำหรับการดื่มแบบ Shot',
    sentence: 'Please pour the tequila into a shot glass.',
    file: 'glass_shot_glass.webp'
  },
  {
    nameEn: 'Beer Pilsner Glass',
    nameTh: 'แก้วเบียร์พิลส์เนอร์',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/bɪr ˈpɪlsnər ɡlæs/',
    useDesc: 'แก้วเบียร์ทรงสูงและเรียว ใช้เสิร์ฟเบียร์ประเภท Pilsner และ Lager ช่วยให้เห็นสีของเบียร์และรักษาชั้นฟอง',
    sentence: 'Please serve the Pilsner beer in a Pilsner glass.',
    file: 'glass_beer_pilsner_glass.webp'
  },
  {
    nameEn: 'Beer Mug',
    nameTh: 'แก้วเบียร์มีหูจับ',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/bɪr mʌɡ/',
    useDesc: 'แก้วเบียร์ที่มีหูจับ ใช้สำหรับเสิร์ฟเบียร์หลายประเภท โดยเฉพาะเบียร์ที่เสิร์ฟในปริมาณมากและเหมาะกับการถือด้วยมือจับ',
    sentence: 'Please serve the beer in a beer mug.',
    file: 'glass_beer_mug.webp'
  },
  {
    nameEn: 'Brandy Snifter',
    nameTh: 'แก้วบรั่นดี / แก้วสนิฟเตอร์',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/ˈbrændi ˈsnɪftər/',
    useDesc: 'แก้วก้านสั้น โถแก้วกลมและปากแคบ ใช้สำหรับเสิร์ฟ Brandy หรือ Cognac ช่วยกักเก็บและรวมกลิ่นหอมของเครื่องดื่ม',
    sentence: 'Brandy is traditionally served in a brandy snifter.',
    file: 'glass_brandy_snifter.webp'
  },
  {
    nameEn: 'Irish Coffee Glass',
    nameTh: 'แก้วไอริชคอฟฟี่',
    category: 'glassware',
    categoryTh: 'เครื่องแก้ว',
    pronounce: '/ˌaɪrɪʃ ˈkɔːfi ɡlæs/',
    useDesc: 'แก้วใสทนความร้อน มีหูจับและก้าน ใช้เสิร์ฟ Irish Coffee และเครื่องดื่มกาแฟร้อนที่ต้องการให้เห็นชั้นของเครื่องดื่ม',
    sentence: 'Please serve the Irish coffee in an Irish coffee glass.',
    file: 'glass_irish_coffee_glass.webp'
  }
];

async function updateDb(connStr, label) {
  console.log('Connecting to', label, '...');
  const client = new Client({
    connectionString: connStr,
    ssl: connStr.includes('railway') || connStr.includes('supabase') ? { rejectUnauthorized: false } : undefined
  });
  await client.connect();

  for (const g of glasses) {
    const filePath = path.join('public', 'uploads', g.file);
    const buf = fs.readFileSync(filePath);
    const base64Url = 'data:image/webp;base64,' + buf.toString('base64');

    await client.query(`
      INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (name_en) DO UPDATE SET
        name_th = EXCLUDED.name_th,
        category = EXCLUDED.category,
        category_th = EXCLUDED.category_th,
        pronounce = EXCLUDED.pronounce,
        use_desc = EXCLUDED.use_desc,
        sentence = EXCLUDED.sentence,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
    `, [g.nameEn, g.nameTh, g.category, g.categoryTh, g.pronounce, g.useDesc, g.sentence, base64Url]);
    console.log('  Upserted:', g.nameEn);
  }
  await client.end();
  console.log('✅ Done updating', label);
}

async function run() {
  const prodConn = 'postgresql://postgres:fiKyHoXHVqBTwcvXYCJuBxEiGqXURbwV@maglev.proxy.rlwy.net:12104/railway';
  await updateDb(prodConn, 'Production Railway');

  const localEnv = fs.readFileSync('.env.local', 'utf8');
  const match = localEnv.match(/DATABASE_URL=([^\s]+)/);
  if (match) {
    await updateDb(match[1], 'Local PostgreSQL');
  }
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
