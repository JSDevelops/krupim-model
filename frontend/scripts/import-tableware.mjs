import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

const tablewareItems = [
  {
    nameEn: 'Appetizer Plate',
    nameTh: 'จานอาหารเรียกน้ำย่อย',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈæpətaɪzər pleɪt/',
    useDesc: 'จานขนาดเล็กสำหรับเสิร์ฟอาหารเรียกน้ำย่อย ของว่าง หรืออาหารจานเล็กก่อนอาหารมื้อหลัก',
    sentence: 'The appetizer plate is used to serve small starters before the main course.',
    file: 'tableware_appetizer_plate.webp'
  },
  {
    nameEn: 'Soup Bowl (Soup Plate)',
    nameTh: 'ชามซุป (จานซุป)',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/suːp boʊl/',
    useDesc: 'ภาชนะสำหรับเสิร์ฟซุป แกง หรืออาหารที่มีน้ำเป็นส่วนประกอบ โดยมีขอบลึกกว่าจานทั่วไป',
    sentence: 'The soup bowl is used to serve hot soup.',
    file: 'tableware_soup_bowl.webp'
  },
  {
    nameEn: 'Cereal Bowl',
    nameTh: 'ชามซีเรียล',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈsɪəriəl boʊl/',
    useDesc: 'ชามสำหรับเสิร์ฟซีเรียล ข้าวต้ม ผลไม้ หรืออาหารเช้าที่รับประทานร่วมกับนมหรือของเหลว',
    sentence: 'She uses a cereal bowl for breakfast.',
    file: 'tableware_cereal_bowl.webp'
  },
  {
    nameEn: 'Salad Bowl',
    nameTh: 'ชามสลัด',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈsæləd boʊl/',
    useDesc: 'ชามสำหรับเสิร์ฟสลัด ผัก หรืออาหารประเภทคลุกเคล้า',
    sentence: 'The salad bowl is placed in the center of the table.',
    file: 'tableware_salad_bowl.webp'
  },
  {
    nameEn: 'Dessert Bowl',
    nameTh: 'ชามของหวาน',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/dɪˈzɜːrt boʊl/',
    useDesc: 'ชามขนาดเล็กสำหรับเสิร์ฟของหวาน เช่น ไอศกรีม ผลไม้ หรือพุดดิ้ง',
    sentence: 'The dessert bowl is used for serving ice cream.',
    file: 'tableware_dessert_bowl.webp'
  },
  {
    nameEn: 'Bouillon Cup (Broth Bowl)',
    nameTh: 'ถ้วยน้ำซุป (ชามน้ำซุป)',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈbuːjɒn kʌp/',
    useDesc: 'ถ้วยมีหูจับสำหรับเสิร์ฟน้ำซุป น้ำแกง หรือซุปใส สามารถถือรับประทานได้สะดวก',
    sentence: 'The bouillon cup is used to serve clear broth.',
    file: 'tableware_bouillon_cup.webp'
  },
  {
    nameEn: 'Ramekin',
    nameTh: 'ถ้วยราเมคิน / ถ้วยอบขนาดเล็ก',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈræməkɪn/',
    useDesc: 'ถ้วยขนาดเล็กสำหรับใส่ซอส เครื่องปรุง ของหวาน หรืออาหารที่ต้องนำเข้าอบ',
    sentence: 'The sauce is served in a small ramekin.',
    file: 'tableware_ramekin.webp'
  },
  {
    nameEn: 'Finger Bowl',
    nameTh: 'ถ้วยล้างปลายนิ้ว',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈfɪŋɡər boʊl/',
    useDesc: 'ถ้วยขนาดเล็กที่ใส่น้ำสำหรับล้างปลายนิ้วบนโต๊ะอาหาร โดยเฉพาะในการรับประทานอาหารที่ใช้มือ',
    sentence: 'The finger bowl is placed on the table after the meal.',
    file: 'tableware_finger_bowl.webp'
  },
  {
    nameEn: 'Tea Cup',
    nameTh: 'ถ้วยชา',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/tiː kʌp/',
    useDesc: 'ถ้วยสำหรับเสิร์ฟและดื่มชา มักใช้คู่กับจานรองถ้วยชา',
    sentence: 'The waiter serves tea in a tea cup.',
    file: 'tableware_tea_cup.webp'
  },
  {
    nameEn: 'Coffee Cup',
    nameTh: 'ถ้วยกาแฟ',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈkɔːfi kʌp/',
    useDesc: 'ถ้วยสำหรับเสิร์ฟและดื่มกาแฟร้อน โดยทั่วไปใช้คู่กับจานรอง',
    sentence: 'The coffee cup is placed on the saucer.',
    file: 'tableware_coffee_cup.webp'
  },
  {
    nameEn: 'Espresso Cup (Demitasse Cup)',
    nameTh: 'ถ้วยเอสเปรสโซ (ถ้วยเดอมิตาส)',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/eˈspresoʊ kʌp/',
    useDesc: 'ถ้วยขนาดเล็กสำหรับเสิร์ฟกาแฟเอสเปรสโซหรือกาแฟเข้มข้นในปริมาณน้อย',
    sentence: 'The espresso is served in a small espresso cup.',
    file: 'tableware_espresso_cup.webp'
  },
  {
    nameEn: 'Cappuccino Cup',
    nameTh: 'ถ้วยคาปูชิโน',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˌkæpəˈtʃiːnoʊ kʌp/',
    useDesc: 'ถ้วยสำหรับเสิร์ฟกาแฟคาปูชิโน โดยมีขนาดใหญ่กว่าถ้วยเอสเปรสโซ',
    sentence: 'The cappuccino is served in a cappuccino cup.',
    file: 'tableware_cappuccino_cup.webp'
  },
  {
    nameEn: 'Saucer',
    nameTh: 'จานรองถ้วย',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈsɔːsər/',
    useDesc: 'จานขนาดเล็กสำหรับรองถ้วยชา กาแฟ หรือเครื่องดื่มร้อน และใช้รองป้องกันของเหลวหกบนโต๊ะ',
    sentence: 'The cup is placed on the saucer.',
    file: 'tableware_saucer.webp'
  },
  {
    nameEn: 'Mug',
    nameTh: 'แก้วมัค / ถ้วยมีหู',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/mʌɡ/',
    useDesc: 'แก้วหรือถ้วยขนาดค่อนข้างใหญ่ที่มีหูจับ สำหรับเสิร์ฟกาแฟ ชา หรือเครื่องดื่มร้อนและเย็น',
    sentence: 'He drinks coffee from a large mug.',
    file: 'tableware_mug.webp'
  },
  {
    nameEn: 'Serving Platter (Oval Platter)',
    nameTh: 'จานเสิร์ฟอาหาร (จานเสิร์ฟทรงรี)',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈsɜːrvɪŋ ˈplætər/',
    useDesc: 'จานขนาดใหญ่สำหรับจัดวางและเสิร์ฟอาหารหลายชนิด โดยเฉพาะอาหารที่ต้องเสิร์ฟเป็นชุด',
    sentence: 'The roast chicken is served on an oval platter.',
    file: 'tableware_serving_platter_oval.webp'
  },
  {
    nameEn: 'Serving Platter (Meat Platter)',
    nameTh: 'จานเสิร์ฟอาหาร (จานเสิร์ฟเนื้อ)',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈsɜːrvɪŋ ˈplætər/',
    useDesc: 'จานขนาดใหญ่สำหรับจัดวางและเสิร์ฟเนื้อสัตว์ อาหารจานหลัก หรืออาหารที่หั่นเป็นชิ้น',
    sentence: 'The sliced meat is arranged on the meat platter.',
    file: 'tableware_serving_platter_meat.webp'
  },
  {
    nameEn: 'Soup Tureen',
    nameTh: 'หม้อซุปสำหรับเสิร์ฟ',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/suːp təˈriːn/',
    useDesc: 'ภาชนะขนาดใหญ่สำหรับใส่และเสิร์ฟซุปหรืออาหารประเภทน้ำให้กับผู้รับประทานหลายคน มักมีฝาปิดและหูจับ',
    sentence: 'The soup is served from a large soup tureen.',
    file: 'tableware_soup_tureen.webp'
  },
  {
    nameEn: 'Soup Tureen (Open with Ladle)',
    nameTh: 'หม้อซุปสำหรับเสิร์ฟ (แบบเปิดพร้อมกระบวย)',
    category: 'tableware',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/suːp təˈriːn/',
    useDesc: 'ภาชนะขนาดใหญ่สำหรับเสิร์ฟซุปหรืออาหารประเภทน้ำ โดยเปิดฝาและใช้กระบวยตักแบ่งให้ผู้รับประทาน',
    sentence: 'The soup tureen is open and ready to serve with a ladle.',
    file: 'tableware_soup_tureen_open.webp'
  }
];

async function updateDb(connStr, label) {
  console.log('Connecting to', label, '...');
  const client = new Client({
    connectionString: connStr,
    ssl: connStr.includes('railway') || connStr.includes('supabase') ? { rejectUnauthorized: false } : undefined
  });
  await client.connect();

  // If "Soup Bowl" exists and "Soup Bowl (Soup Plate)" does not, rename it so glb/usdz 3D models are preserved
  const checkOldSoup = await client.query("SELECT id, glb_url, usdz_url FROM vocabulary_items WHERE name_en = 'Soup Bowl'");
  const checkNewSoup = await client.query("SELECT id FROM vocabulary_items WHERE name_en = 'Soup Bowl (Soup Plate)'");
  if (checkOldSoup.rows.length > 0 && checkNewSoup.rows.length === 0) {
    console.log('  Migrating "Soup Bowl" -> "Soup Bowl (Soup Plate)" to preserve 3D models...');
    await client.query("UPDATE vocabulary_items SET name_en = 'Soup Bowl (Soup Plate)' WHERE name_en = 'Soup Bowl'");
  }

  for (const item of tablewareItems) {
    const filePath = path.join('public', 'uploads', item.file);
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
    `, [item.nameEn, item.nameTh, item.category, item.categoryTh, item.pronounce, item.useDesc, item.sentence, base64Url]);
    console.log('  Upserted:', item.nameEn);
  }

  const total = await client.query('SELECT count(*) FROM vocabulary_items');
  const tablewareCount = await client.query("SELECT count(*) FROM vocabulary_items WHERE category = 'tableware'");
  console.log(`  📊 Total items in ${label}:`, total.rows[0].count, `(Tableware: ${tablewareCount.rows[0].count})`);

  await client.end();
  console.log('✅ Done updating', label);
}

async function run() {
  const prodConn = 'postgresql://postgres:fiKyHoXHVqBTwcvXYCJuBxEiGqXURbwV@maglev.proxy.rlwy.net:12104/railway';
  await updateDb(prodConn, 'Production Railway');

  const localEnv = fs.readFileSync('.env.local', 'utf8');
  const match = localEnv.match(/DATABASE_URL=([^\s]+)/);
  if (match) {
    try {
      await updateDb(match[1], 'Local PostgreSQL');
    } catch (e) {
      console.warn('⚠️ Local DB update skipped or failed:', e.message);
    }
  }
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
