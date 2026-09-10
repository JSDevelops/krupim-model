import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

/**
 * 17 Cutlery items: Forks, Knives, Spoons
 * Images were cropped from the reference grid image (1024x558, 6-col x 3-row layout)
 * Row 0 → Forks, Row 1 → Forks + Knives, Row 2 → Knives + Spoons
 * Note: Row 1 Col 1 is "Fruit Fork" (duplicate label in image — same item shown twice)
 *       Row 2 Col 0 shows "Fhisert Knife" (typo in image) → imported as "Fish Serving Knife"
 */
const cutleryItems = [
  // ─── กลุ่มส้อม (Forks) ──────────────────────────────────────────────────────
  {
    nameEn: 'Dinner Fork',
    nameTh: 'ส้อมรับประทานอาหาร',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈdɪnər fɔːrk/',
    useDesc: 'ส้อมขนาดมาตรฐานสำหรับใช้รับประทานอาหารมื้อหลัก เช่น ข้าว เนื้อสัตว์ ผัก และอาหารทั่วไป',
    sentence: 'The dinner fork is placed on the left side of the plate.',
    file: 'cutlery_dinner_fork.webp',
  },
  {
    nameEn: 'Salad Fork',
    nameTh: 'ส้อมสลัด',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈsæləd fɔːrk/',
    useDesc: 'ส้อมขนาดเล็กกว่าส้อมอาหารหลัก ใช้สำหรับรับประทานสลัดและอาหารเรียกน้ำย่อย',
    sentence: 'Use the salad fork to eat the salad.',
    file: 'cutlery_salad_fork.webp',
  },
  {
    nameEn: 'Dessert Fork',
    nameTh: 'ส้อมขนมหวาน',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/dɪˈzɜːrt fɔːrk/',
    useDesc: 'ส้อมขนาดเล็กสำหรับรับประทานเค้ก ขนมหวาน และผลไม้',
    sentence: 'She uses a dessert fork to eat the cake.',
    file: 'cutlery_dessert_fork.webp',
  },
  {
    nameEn: 'Fish Fork',
    nameTh: 'ส้อมสำหรับรับประทานปลา',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/fɪʃ fɔːrk/',
    useDesc: 'ส้อมที่ออกแบบสำหรับรับประทานอาหารประเภทปลา โดยมีรูปทรงเหมาะกับการแยกและจับเนื้อปลา',
    sentence: 'The fish fork is used for eating fish.',
    file: 'cutlery_fish_fork.webp',
  },
  {
    nameEn: 'Oyster Fork',
    nameTh: 'ส้อมหอยนางรม',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈɔɪstər fɔːrk/',
    useDesc: 'ส้อมขนาดเล็กสำหรับรับประทานหอยนางรมและอาหารทะเลประเภทต่าง ๆ',
    sentence: 'The oyster fork is used to eat oysters.',
    file: 'cutlery_oyster_fork.webp',
  },
  {
    nameEn: 'Snail Fork',
    nameTh: 'ส้อมสำหรับรับประทานหอยทาก',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/sneɪl fɔːrk/',
    useDesc: 'ส้อมขนาดเล็กปลายแหลม ใช้สำหรับคีบหรือดึงเนื้อหอยทากออกจากเปลือก',
    sentence: 'The waiter brought a snail fork with the dish.',
    file: 'cutlery_snail_fork.webp',
  },
  {
    nameEn: 'Fruit Fork',
    nameTh: 'ส้อมผลไม้',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/fruːt fɔːrk/',
    useDesc: 'ส้อมขนาดเล็กสำหรับรับประทานผลไม้และของว่าง',
    sentence: 'Use the fruit fork to pick up the pieces of fruit.',
    file: 'cutlery_fruit_fork.webp',
  },
  // ─── กลุ่มมีด (Knives) ──────────────────────────────────────────────────────
  {
    nameEn: 'Dinner Knife',
    nameTh: 'มีดรับประทานอาหาร',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈdɪnər naɪf/',
    useDesc: 'มีดมาตรฐานสำหรับใช้ตัดและรับประทานอาหารในมื้อหลัก',
    sentence: 'The dinner knife is placed on the right side of the plate.',
    file: 'cutlery_dinner_knife.webp',
  },
  {
    nameEn: 'Steak Knife',
    nameTh: 'มีดสเต๊ก',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/steɪk naɪf/',
    useDesc: 'มีดที่มีคมเหมาะสำหรับตัดเนื้อสเต๊กและเนื้อสัตว์',
    sentence: 'A steak knife is used to cut meat.',
    file: 'cutlery_steak_knife.webp',
  },
  {
    nameEn: 'Butter Knife',
    nameTh: 'มีดทาเนย',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈbʌtər naɪf/',
    useDesc: 'มีดปลายมนสำหรับตักและทาเนย แยม หรือสเปรดบนขนมปัง',
    sentence: 'Use the butter knife to spread butter on the bread.',
    file: 'cutlery_butter_knife.webp',
  },
  {
    nameEn: 'Fish Knife',
    nameTh: 'มีดสำหรับรับประทานปลา',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/fɪʃ naɪf/',
    useDesc: 'มีดที่ออกแบบสำหรับแยกและรับประทานเนื้อปลา',
    sentence: 'The fish knife is used to separate the fish from the bones.',
    file: 'cutlery_fish_knife.webp',
  },
  {
    nameEn: 'Fish Serving Knife',
    nameTh: 'มีดสำหรับเสิร์ฟปลา',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/fɪʃ ˈsɜːrvɪŋ naɪf/',
    useDesc: 'มีดสำหรับตัด แบ่ง หรือเสิร์ฟอาหารประเภทปลา',
    sentence: 'The fish serving knife is used to serve the fish.',
    file: 'cutlery_fish_serving_knife.webp',
  },
  {
    nameEn: 'Dessert Knife',
    nameTh: 'มีดขนมหวาน',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/dɪˈzɜːrt naɪf/',
    useDesc: 'มีดขนาดเล็กสำหรับตัดเค้ก ขนมหวาน และผลไม้',
    sentence: 'The dessert knife is used to cut the cake.',
    file: 'cutlery_dessert_knife.webp',
  },
  {
    nameEn: 'Cheese Knife',
    nameTh: 'มีดสำหรับตัดชีส',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/tʃiːz naɪf/',
    useDesc: 'มีดสำหรับตัดและแบ่งชีสประเภทต่าง ๆ',
    sentence: 'Use the cheese knife to cut the cheese.',
    file: 'cutlery_cheese_knife.webp',
  },
  {
    nameEn: 'Carving Knife',
    nameTh: 'มีดแล่เนื้อ',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈkɑːrvɪŋ naɪf/',
    useDesc: 'มีดใบยาวสำหรับหั่นหรือแล่เนื้อสัตว์ เช่น เนื้ออบ ไก่งวง หรือแฮม',
    sentence: 'The chef uses a carving knife to slice the roast.',
    file: 'cutlery_carving_knife.webp',
  },
  // ─── กลุ่มช้อน (Spoons) ─────────────────────────────────────────────────────
  {
    nameEn: 'Soup Spoon',
    nameTh: 'ช้อนซุป',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/suːp spuːn/',
    useDesc: 'ช้อนที่มีหัวลึกสำหรับตักและรับประทานซุปหรืออาหารที่มีน้ำ',
    sentence: 'Use the soup spoon to eat the soup.',
    file: 'cutlery_soup_spoon.webp',
  },
  {
    nameEn: 'Dinner Spoon',
    nameTh: 'ช้อนรับประทานอาหาร',
    category: 'cutlery',
    categoryTh: 'เครื่องใช้บนโต๊ะอาหาร',
    pronounce: '/ˈdɪnər spuːn/',
    useDesc: 'ช้อนขนาดมาตรฐานสำหรับใช้รับประทานอาหารในมื้อหลัก',
    sentence: 'The dinner spoon is placed next to the knife.',
    file: 'cutlery_dinner_spoon.webp',
  },
];

async function updateDb(connStr, label) {
  console.log(`\nConnecting to ${label} ...`);
  const client = new Client({
    connectionString: connStr,
    ssl: connStr.includes('railway') || connStr.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  for (const item of cutleryItems) {
    const filePath = path.join('public', 'uploads', item.file);
    const buf = fs.readFileSync(filePath);
    const base64Url = 'data:image/webp;base64,' + buf.toString('base64');

    await client.query(
      `INSERT INTO vocabulary_items
         (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (name_en) DO UPDATE SET
         name_th      = EXCLUDED.name_th,
         category     = EXCLUDED.category,
         category_th  = EXCLUDED.category_th,
         pronounce    = EXCLUDED.pronounce,
         use_desc     = EXCLUDED.use_desc,
         sentence     = EXCLUDED.sentence,
         image_url    = EXCLUDED.image_url,
         updated_at   = NOW()`,
      [item.nameEn, item.nameTh, item.category, item.categoryTh,
       item.pronounce, item.useDesc, item.sentence, base64Url]
    );
    console.log(`  ✓ Upserted: ${item.nameEn}`);
  }

  const total    = await client.query('SELECT count(*) FROM vocabulary_items');
  const cutlery  = await client.query("SELECT count(*) FROM vocabulary_items WHERE category='cutlery'");
  console.log(`  📊 ${label}: total=${total.rows[0].count}, cutlery=${cutlery.rows[0].count}`);
  await client.end();
  console.log(`✅ Done: ${label}`);
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
      console.warn('⚠️  Local DB skipped:', e.message);
    }
  }
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
