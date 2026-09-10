-- ==========================================================
-- สคริปต์อัปเดตโครงสร้างและนำเข้าคำศัพท์ 79 รายการขึ้นฐานข้อมูลจริง
-- ใช้รันใน Railway Query Editor หรือ Supabase SQL Editor
-- ==========================================================

BEGIN;

-- 1. ปรับปรุงโครงสร้างตาราง app_users
ALTER TABLE IF EXISTS app_users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;

-- 2. สร้าง/ปรับปรุงโครงสร้างตาราง vocabulary_items
CREATE TABLE IF NOT EXISTS vocabulary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tableware',
  category_th TEXT NOT NULL DEFAULT 'เครื่องใช้บนโต๊ะอาหาร',
  pronounce TEXT,
  use_desc TEXT NOT NULL,
  sentence TEXT NOT NULL,
  image_url TEXT,
  glb_url TEXT,
  usdz_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS vocabulary_items DROP COLUMN IF EXISTS emoji;
ALTER TABLE IF EXISTS vocabulary_items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS vocabulary_items ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vocab_name_en ON vocabulary_items(name_en);
CREATE INDEX IF NOT EXISTS idx_vocab_category ON vocabulary_items(category);

-- 3. นำเข้า/อัปเดตคำศัพท์ทั้ง 79 รายการ
INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Appetizer Plate', 'จานเรียกน้ำย่อย / จานอาหารว่าง', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', 'แอพ-พิ-ไท-เซอร์ เพลท', 'จานขนาดเล็กสำหรับใส่ของว่างหรืออาหารเรียกน้ำย่อยก่อนเสิร์ฟอาหารจานหลัก', 'Please place the appetizer plate on the table before the main course.', '/uploads/vocab_1788049252599_Appetizer_Plate_2b5b74aa0c12.png', '/uploads/1787747940053_Appetizer_Plate01_glb_c084b8efb1c8.glb', '/uploads/1787747952576_Appetizer_Plate01_usdz_187b71ff0d56.usdz')
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Cereal Bowl', 'ชามซีเรียล', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', 'ซี-เรียล บาวแอล', 'ชามสำหรับใส่ซีเรียล โจ๊ก หรืออาหารเช้า', 'He poured milk over the cornflakes in his cereal bowl.', '/uploads/vocab_1788049252597_Cereal_Bowl_08231c5d2fb7.png', '/uploads/1787800314752_Cereal_Bowl_glb_e065987c09e0.glb', '/uploads/1787800328661_Cereal_Bowl_usdz_103562a636c0.usdz')
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Soup Bowl', 'ถ้วยซุป', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/suːp boʊl/', 'ถ้วยขนาดกลางมีสองหูจับ สำหรับเสิร์ฟซุปร้อน วางบนจานรองซุป (Underliner) เสิร์ฟจากด้านขวาของผู้รับบริการ ต้องอุ่นถ้วยก่อนเสิร์ฟ ช้อนซุปวางด้านขวาของจาน', 'The soup bowl is pre-warmed and served from the right side of the guest on an underliner plate.', '/uploads/vocab_1788049252588_Soup_Bowl_6efde00fc36e.png', '/uploads/1787799662101_Soup_Bowl_glb_bf9a25e12930.glb', '/uploads/1787799668263_Soup_Bowl_usdz_ed2052788850.usdz')
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Linen Basket', 'ตะกร้าเก็บผ้า', 'side_station', 'อุปกรณ์สถานีบริการ', '/ˈlɪnɪn ˈbæskɪt/', 'ตะกร้าสำหรับรวบรวมผ้าเช็ดปาก ผ้าปูโต๊ะ และผ้าอื่นๆ ที่ใช้แล้ว ส่งซักและรีดก่อนนำมาใช้ใหม่ ห้ามนำผ้าที่ใช้แล้วมาใช้ซ้ำในรอบเดิมเด็ดขาด', 'Collect all used linens in the basket for laundering — never reuse napkins or cloths within the same service shift.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Plate Rack', 'ถาดเก็บจาน', 'side_station', 'อุปกรณ์สถานีบริการ', '/pleɪt ræk/', 'ชั้นหรือถาดสำหรับจัดเก็บจานซ้อนกันเป็นระเบียบ วางจานสะอาดที่ขัดเงาแล้วเท่านั้น ซ้อนจานตามประเภทและขนาด เก็บในที่สะอาดห่างจากพื้น', 'Stack only clean, polished plates in the rack by type and size — keep them off the floor for hygiene.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Ice Bin', 'ถังเก็บน้ำแข็ง', 'side_station', 'อุปกรณ์สถานีบริการ', '/aɪs bɪn/', 'ถังฉนวนกันความร้อนสำหรับเก็บน้ำแข็งสำรองที่สถานีบริการ เติมน้ำแข็งก่อนเปิดบริการ ล้างถังทุกวันป้องกันแบคทีเรีย ใช้คีมน้ำแข็งหยิบทุกครั้งห้ามใช้มือโดยตรง', 'Ice bin stores reserve service ice — sanitize daily and always use tongs, never bare hands, to retrieve ice.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Waste Bin', 'ถังขยะบริการ', 'side_station', 'อุปกรณ์สถานีบริการ', '/weɪst bɪn/', 'ถังขยะขนาดเล็กสำหรับพนักงานทิ้งเศษอาหาร กระดาษ หรือวัสดุใช้แล้วขณะบริการ ต้องซ่อนไว้ภายในตู้ Side Station ห้ามให้แขกเห็น เปลี่ยนถุงขยะทุกรอบบริการ', 'Waste bin must be concealed inside the side station — never visible to guests, change the liner every shift.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Cutlery Holder', 'ถังเก็บช้อนส้อม', 'side_station', 'อุปกรณ์สถานีบริการ', '/ˈkʌtləri ˈhoʊldər/', 'ภาชนะทรงกระบอกสำหรับจัดเก็บช้อน ส้อม และมีดแยกประเภท วางใน Sideboard จัดหัวช้อนขึ้นเพื่อสุขอนามัย เก็บเฉพาะอุปกรณ์ที่ผ่านการขัดเงาแล้วเท่านั้น', 'Store polished cutlery handle-up in the holder — separate by type and keep only service-ready pieces inside.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Sideboard', 'ตู้เก็บอุปกรณ์', 'side_station', 'อุปกรณ์สถานีบริการ', '/ˈsaɪdbɔːrd/', 'ตู้ไม้หรือสแตนเลสสำหรับเก็บสำรองอุปกรณ์บริการ เช่น ช้อนส้อม ผ้าเช็ดปาก แก้ว เมนู จัดเป็นระเบียบแยกหมวดหมู่ เติมของสำรองก่อนเปิดบริการทุกวัน', 'Sideboard stores reserve service supplies — organize by category and fully restock before each service begins.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Coaster', 'ที่รองแก้ว', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '/ˈkoʊstər/', 'แผ่นรองกลมสำหรับวางใต้แก้วเครื่องดื่มเย็น ป้องกันน้ำที่เกิดจากการควบแน่น (Condensation) ทำให้โต๊ะเปียกหรือเสียหาย วางก่อนเสิร์ฟเครื่องดื่มเย็นเสมอ', 'Place a coaster under cold drink glasses to protect the table from condensation rings and water damage.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Charger Plate', 'แผ่นจานรอง', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '/ˈtʃɑːrdʒər pleɪt/', 'จานตกแต่งขนาดใหญ่ 30–33 ซม. วางบนโต๊ะก่อนแขกมาถึง ไม่ใส่อาหารโดยตรง วางจานอาหารซ้อนบน เก็บออกพร้อมจานก่อนเสิร์ฟของหวานหรือหลังมื้ออาหาร', 'Charger plate is decorative — place it before guests arrive and remove it when serving the dessert course.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Menu Card', 'การ์ดเมนู', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '/ˈmenjuː kɑːrd/', 'รายการอาหารและเครื่องดื่มทั้งหมด วางบนจานหรือส่งด้วยมือทั้งสองข้างจากขวาของแขก อ่านเมนูให้แขกฟังหากต้องการ แนะนำเมนูพิเศษประจำวัน (Daily Special) เสมอ', 'Present the menu with both hands from the guest right — always recommend the chef daily specials.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Table Number', 'ป้ายหมายเลขโต๊ะ', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '/ˈteɪbl ˈnʌmbər/', 'ป้ายระบุหมายเลขโต๊ะสำหรับสื่อสารระหว่างพนักงาน ควรมองเห็นชัดจากทางเข้าห้องอาหาร วางไว้ตำแหน่งกึ่งกลางโต๊ะ ช่วยให้การส่งอาหารถูกโต๊ะและรวดเร็ว', 'Table numbers identify guest covers — position them visibly at the center so servers can quickly locate orders.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Flower Vase', 'แจกันดอกไม้', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '/ˈflaʊər veɪs/', 'แจกันสำหรับวางดอกไม้ตกแต่งโต๊ะ ต้องสะอาดและดอกไม้สด ความสูงต้องไม่สูงเกินกว่าระดับตาของผู้นั่ง เปลี่ยนน้ำในแจกันทุกวัน ตัดก้านดอกไม้ทุก 2 วัน', 'Flower centerpieces must not obstruct sightlines — change water daily and trim stems every 2 days for freshness.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Candle Holder', 'เชิงเทียน', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '/ˈkændl ˈhoʊldər/', 'ฐานรองเทียนสำหรับวางกลางโต๊ะอาหาร ความสูงต้องไม่บดบังสายตาแขก (ไม่เกิน 30 ซม.) จุดเทียนก่อนแขกมา ดูแลไม่ให้ไขเทียนหยดบนโต๊ะหรือผ้าปูโต๊ะ', 'Candle holder must not exceed 30 cm height to preserve eye contact between guests — light before seating.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Serving Tong', 'คีมคีบอาหารบริการ', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '/ˈsɜːrvɪŋ tɔːŋ/', 'คีมสแตนเลสสำหรับหยิบและถ่ายอาหารจากถาดเสิร์ฟลงจานแขก ใช้แบบ Silver Service: ช้อน+ส้อมคีบอาหาร หรือคีมสปริง เสิร์ฟจากซ้ายของแขกเสมอ', 'In Silver Service, use spoon and fork together in one hand as tongs — serve from the guest left side.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Chef''s Knife', 'มีดเชฟ', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '/ʃefs naɪf/', 'มีดทำครัวอเนกประสงค์ใบยาว 20–25 ซม. ใช้สับ หั่น แล่ และตัด จับด้วยมือถนัดโดยนิ้วโป้งและนิ้วชี้หนีบที่โคนใบมีด มืออีกข้างงอนิ้วเป็นก้ามปูกันบาด', 'Grip the chef knife at the bolster with thumb and forefinger — curl the guiding hand into a claw for safety.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Cutting Board', 'เขียงเตรียมอาหาร', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '/ˈkʌtɪŋ bɔːrd/', 'เขียงไม้หรือพลาสติกสำหรับแล่เนื้อ หั่นผักบนรถ Gueridon ใช้สีเขียงตามมาตรฐาน HACCP: แดง=เนื้อแดง, เหลือง=สัตว์ปีก, เขียว=ผัก, น้ำเงิน=อาหารทะเล, ขาว=ขนมปัง', 'Follow HACCP color-coded boards: red for meat, yellow for poultry, green for vegetables, blue for seafood.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Flambé Pan', 'กระทะฟลอมเบ', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '/flɑːmˈbeɪ pæn/', 'กระทะสแตนเลสก้านยาวสำหรับทำอาหาร Flambé ต่อหน้าลูกค้า เช่น Crepe Suzette หรือ Banana Foster ราดเหล้าแล้วจุดไฟ เอียงกระทะออกจากตัวและแขกเพื่อความปลอดภัย', 'Tilt the flambé pan away from guests before igniting the spirit — keep a fire blanket nearby as a precaution.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Spirit Lamp', 'เตาแอลกอฮอล์', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '/ˈspɪrɪt læmp/', 'เตาบรรจุแอลกอฮอล์สำหรับให้ความร้อนบนรถ Gueridon ปรับระดับไฟด้วยฝาปิดเปลือก ระวังอย่าให้แอลกอฮอล์หกขณะบรรจุ ปิดฝาดับไฟเมื่อเสร็จงาน ห้ามเป่าดับ', 'Adjust the spirit lamp flame with the cover — never blow it out; always extinguish by closing the cap.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Gueridon Trolley', 'รถเข็นบริการ', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '/ɡeɪrɪˈdɒn ˈtrɑːli/', 'รถเข็นสองชั้นสำหรับเตรียมและปรุงอาหารต่อหน้าลูกค้า เป็นการบริการระดับสูงสุด (Gueridon Service) ชั้นบน: เตรียมอาหาร ชั้นล่าง: วางอุปกรณ์สำรอง ต้องผ่านการฝึกก่อนใช้', 'Gueridon trolley enables tableside cooking — upper shelf for preparation, lower shelf for equipment and supplies.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Corkscrew', 'ที่เปิดไวน์แบบเกลียว', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/ˈkɔːrkskruː/', 'อุปกรณ์เกลียวสำหรับถอดจุกคอร์กขวดไวน์ วางจุดกลาง หมุนเกลียวลงตรงกลางจุก ดึงจุกขึ้นช้าๆ อย่าให้จุกหัก ถ้าจุกขาดให้ใช้ Waiter''s Friend ช่วย', 'Center the worm on the cork, twist slowly, and pull straight up to extract without breaking the cork.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Bottle Opener', 'ที่เปิดขวด', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/ˈbɑːtl ˈoʊpnər/', 'อุปกรณ์โลหะสำหรับเปิดฝาขวดเบียร์หรือโซดา วางขอบที่เปิดใต้ฝา กดลงพร้อมยกขึ้นฝาจะเปิด พนักงานบาร์ควรพกติดตัวเสมอ หลังใช้เช็ดทำความสะอาดทุกครั้ง', 'Hook the bottle opener under the cap edge, then press down and lever up to pop it open cleanly.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Wine Pourer', 'เครื่องรินไวน์', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/waɪn ˈpɔːrər/', 'อุปกรณ์เสียบปากขวดไวน์ช่วยรินได้สม่ำเสมอและป้องกันหยดเลอะผ้าปูโต๊ะ ใช้สำหรับรินไวน์ที่บาร์หรือที่โต๊ะแขก เลือกรุ่นที่มีที่ดักหยด (Drip Stop) เสมอ', 'Wine pourer controls the flow and prevents drips — choose a drip-stop model for professional table service.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Wine Stopper', 'จุกปิดขวดไวน์', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/waɪn ˈstɑːpər/', 'อุปกรณ์อุดปิดปากขวดไวน์ที่เปิดแล้ว ช่วยรักษาความสดและป้องกันออกซิเจนเข้า เสียบจุกให้แน่นทันทีหลังเทไวน์แล้ว เก็บขวดในตู้เย็นหรือที่เย็น ใช้ภายใน 2–3 วัน', 'Insert the wine stopper firmly after pouring — refrigerate and consume the remaining wine within 2–3 days.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Wine Cooler', 'ถังแช่ไวน์', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/waɪn ˈkuːlər/', 'ถังสแตนเลสสำหรับแช่ไวน์ขาว แชมเปญ หรือโรเซ่ให้เย็น ใส่น้ำแข็งผสมน้ำเย็น วางบน Stand ข้างโต๊ะแขก เช็ดขวดด้วยผ้าทุกครั้งก่อนรินไวน์', 'Wine cooler chills white wine and champagne — wipe the bottle dry with a cloth before presenting and pouring.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Wine Basket', 'ตะกร้าไวน์', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/waɪn ˈbæskɪt/', 'ตะกร้าหวายหรือโลหะสำหรับวางขวดไวน์แดงวินเทจในแนวนอน ป้องกันการสะเทือนตะกอนไวน์ เสิร์ฟขวดไวน์วินเทจในตะกร้าเสมอเพื่อแสดงความเป็นมืออาชีพ', 'Wine basket keeps vintage red wine horizontal to prevent disturbing the sediment — a sign of professional service.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Wine Opener', 'ที่เปิดไวน์', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/waɪn ˈoʊpnər/', 'อุปกรณ์แบบ Waiter''s Friend มีใบมีด เกลียว และที่พัก ขั้นตอน: ตัดฟอยล์ → เจาะเกลียวตรงกลาง → พักที่ขอบปากขวด → ดึงจุก → เช็ดปากขวดก่อนรินเสิร์ฟ', 'Use the waiter''s corkscrew: cut the foil, insert the worm, lever on the rim, and extract the cork smoothly.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Ice Tong', 'คีมคีบน้ำแข็ง', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/aɪs tɔːŋ/', 'คีมสแตนเลสสำหรับหยิบน้ำแข็งใส่แก้วอย่างถูกสุขอนามัย ห้ามใช้มือหยิบน้ำแข็งโดยตรง บีบคีมหยิบน้ำแข็ง 1–2 ก้อน แล้วใส่แก้วก่อนเทเครื่องดื่มเสมอ', 'Always use ice tongs to handle ice hygienically — never use bare hands to touch ice.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Ice Bucket', 'ถังน้ำแข็ง', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/aɪs ˈbʌkɪt/', 'ถังโลหะหรือพลาสติกสำหรับแช่ขวดไวน์หรือแชมเปญ ใส่น้ำแข็งประมาณ 2/3 ของถัง เติมน้ำเย็นเล็กน้อยให้เย็นเร็ว วางบน Stand ข้างโต๊ะแขก เช็ดขวดก่อนรินเสมอ', 'Fill ice bucket two-thirds with ice and water — place it on a stand beside the table and wipe the bottle before pouring.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Tea Pot', 'กาน้ำชา', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/tiː pɑːt/', 'กาเซรามิคหรือแก้วสำหรับชงชา ใส่น้ำร้อน 90–95°C แล้วจุ่มถุงชาหรือกรองใบชา ทิ้งไว้ 3–5 นาที เสิร์ฟพร้อมชุดชาบนถาด วางบน Underplate กันร้อนโต๊ะ', 'Pre-warm the teapot, steep tea for 3–5 minutes at 90–95°C, and serve on a tray with a trivet to protect the table.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Coffee Pot', 'เหยือกกาแฟ', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/ˈkɔːfi pɑːt/', 'เหยือกโลหะหรือเซรามิคสำหรับเสิร์ฟกาแฟร้อน มีฝาปิดและหูจับ เสิร์ฟจากด้านขวาของแขก รินช้าๆ ไม่เต็มเกินปาก อุณหภูมิกาแฟร้อนควรอยู่ที่ 85–90°C', 'Pour hot coffee at 85–90°C from the guest''s right side — fill the cup two-thirds and avoid overfilling.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Water Pitcher', 'เหยือกน้ำ', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '/ˈwɔːtər ˈpɪtʃər/', 'เหยือกแก้วหรือสแตนเลสสำหรับบรรจุน้ำเปล่า มีปากรินและที่จับ ใส่น้ำแข็งก่อนแล้วจึงเติมน้ำ เสิร์ฟน้ำจากด้านขวาของแขก รินช้าๆ ไม่ให้กระเด็น', 'Fill the water pitcher with ice first, then pour water from the guest''s right side without splashing.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Rectangular Tray', 'ถาดสี่เหลี่ยม', 'service', 'อุปกรณ์บริการอาหาร', '/rekˈtæŋɡjələr treɪ/', 'ถาดทรงสี่เหลี่ยมสำหรับขนจานอาหารหลายจานพร้อมกัน วางอาหารเป็นแถวประหยัดพื้นที่ รับน้ำหนักได้มากกว่าถาดกลม ใช้สำหรับเสิร์ฟอาหารจำนวนมากหรือบุฟเฟต์', 'Rectangular tray carries multiple plates efficiently — arrange dishes in rows for maximum load stability.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Round Tray', 'ถาดกลม', 'service', 'อุปกรณ์บริการอาหาร', '/raʊnd treɪ/', 'ถาดวงกลมมาตรฐาน ใช้เสิร์ฟทั้งอาหารและเครื่องดื่ม ยกด้วยมือเดียวรองด้วยฝ่ามือ จัดของให้หนักอยู่กึ่งกลาง ปูผ้าคลุมถาดก่อนใช้ทุกครั้ง', 'Round tray is the standard service tray — balance items centrally and use a tray cloth liner always.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Beverage Tray', 'ถาดเครื่องดื่ม', 'service', 'อุปกรณ์บริการอาหาร', '/ˈbevərɪdʒ treɪ/', 'ถาดทรงกลมขนาดเล็กถึงกลางสำหรับเสิร์ฟเครื่องดื่มโดยเฉพาะ รองด้วยผ้าคลุมถาดกันลื่น จัดแก้วให้สมดุล ยกด้วยฝ่ามือ ไม่วางถาดบนโต๊ะแขกขณะเสิร์ฟ', 'Carry the beverage tray on your palm — never set it down on the guest table when pouring drinks.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Service Tray', 'ถาดเสิร์ฟอาหาร', 'service', 'อุปกรณ์บริการอาหาร', '/ˈsɜːrvɪs treɪ/', 'ถาดสี่เหลี่ยมหรือกลมสำหรับขนส่งอาหารและอุปกรณ์จากครัวถึงโต๊ะ วางน้ำหนักให้สมดุล ของหนักอยู่ตรงกลางหรือชิดร่างกาย ยกถาดด้วยมือข้างเดียวระดับไหล่', 'Balance heavy items at the center of the service tray and carry it at shoulder height with one hand.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Olive Oil Bottle', 'ขวดน้ำมันมะกอก', 'condiments', 'อุปกรณ์เครื่องปรุง', '/ˈɑːlɪv ɔɪl ˈbɑːtl/', 'ขวดแก้วบรรจุน้ำมันมะกอก Extra Virgin เสิร์ฟคู่กับน้ำส้มสายชูสำหรับจิ้มขนมปัง ทำน้ำสลัด หรือราดพาสต้า เก็บในที่เย็นห่างแสง และใช้ภายในวันที่กำหนด', 'Serve extra virgin olive oil with bread for dipping and as salad dressing — store away from heat and direct light.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Vinegar Bottle', 'ขวดน้ำส้มสายชู', 'condiments', 'อุปกรณ์เครื่องปรุง', '/ˈvɪnɪɡər ˈbɑːtl/', 'ขวดแก้วใสบรรจุน้ำส้มสายชูสำหรับปรุงรสสลัดหรืออาหาร วางในชุดเครื่องปรุงคู่กับน้ำมันมะกอก ต้องระบุฉลากชัดเจนและสะอาดทุกครั้ง เปลี่ยนทุกสัปดาห์', 'Vinegar bottle is paired with olive oil as a salad dressing set — label clearly, clean daily, and refill weekly.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Sauce Bottle', 'ขวดซอส', 'condiments', 'อุปกรณ์เครื่องปรุง', '/sɔːs ˈbɑːtl/', 'ขวดแก้วหรือพลาสติกบรรจุซอสปรุงรส เช่น ซอสพริก ซอสมะเขือเทศ ซอสถั่วเหลือง ต้องสะอาด ฝาแน่น ป้ายระบุชัดเจน เช็ดทำความสะอาดรอบขวดก่อนตั้งโต๊ะทุกวัน', 'Sauce bottles must be clean, labeled, and drip-free — wipe the exterior thoroughly before placing on the table.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Sugar Bowl', 'โถน้ำตาล', 'condiments', 'อุปกรณ์เครื่องปรุง', '/ˈʃʊɡər boʊl/', 'โถมีฝาปิดหรือแบบเปิด บรรจุน้ำตาลขาว น้ำตาลดิบ หรือซองน้ำตาล เสิร์ฟพร้อมชุดชาและกาแฟ ใช้คีมน้ำตาลสำหรับน้ำตาลก้อน ต้องสะอาดและเติมก่อนบริการ', 'Sugar bowl accompanies tea or coffee service — use a sugar tong for cubes and keep it filled before service.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Pepper Shaker', 'ขวดพริกไทย', 'condiments', 'อุปกรณ์เครื่องปรุง', '/ˈpepər ˈʃeɪkər/', 'ภาชนะมีฝาเจาะรูเล็กๆ บรรจุพริกไทยป่น วางคู่กับขวดเกลือ เขย่าเบาๆ ขณะโรยพริกไทย ระวังโรยมากเกินไป สะอาดและตรวจสอบปริมาณก่อนเปิดบริการทุกวัน', 'Pepper shaker is always paired with the salt shaker — check fill level and clean the holes before each service.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Salt Shaker', 'ขวดเกลือ', 'condiments', 'อุปกรณ์เครื่องปรุง', '/sɔːlt ˈʃeɪkər/', 'ภาชนะมีฝาเจาะรูเล็กๆ บรรจุเกลือป่น สำหรับปรุงรสอาหารด้วยตนเอง วางคู่กับขวดพริกไทยเสมอ ใส่เมล็ดข้าว 1–2 เม็ดดูดความชื้น เปลี่ยนเติมเกลือและล้างขวดทุกสัปดาห์', 'Salt and pepper shakers are always paired together — add rice grains to absorb moisture and prevent clumping.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Polishing Cloth', 'ผ้าเช็ดเครื่องเงิน', 'linen', 'เครื่องลินิน', '/ˈpɑːlɪʃɪŋ klɔːθ/', 'ผ้านุ่มสำหรับขัดเงาช้อนส้อมและเครื่องเงิน ขัดให้สะอาดหมดรอยน้ำและลายนิ้วมือ วิธีใช้: อุ่นน้ำใส่ผ้าแล้วเช็ด จากนั้นใช้ผ้าแห้งขัดให้เงา ตรวจก่อนตั้งโต๊ะทุกครั้ง', 'Polish flatware with the cloth by holding the handle — check for watermarks and fingerprints before setting the table.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Glass Cloth', 'ผ้าเช็ดแก้ว', 'linen', 'เครื่องลินิน', '/ɡlæs klɔːθ/', 'ผ้าสะอาดไม่มีขนฝุ่น (Lint-Free) สำหรับเช็ดและขัดเงาแก้ว วิธีใช้: จับที่ก้านด้วยผ้า หมุนเช็ดด้านในและด้านนอก ส่องไฟตรวจรอยน้ำก่อนนำขึ้นโต๊ะเสมอ', 'Hold the glass by the stem with the cloth, polish inside and out, then check against the light for watermarks.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Tray Cloth', 'ผ้าคลุมถาด', 'linen', 'เครื่องลินิน', '/treɪ klɔːθ/', 'ผ้าสำหรับปูบนถาดเสิร์ฟ ช่วยกันลื่นของอุปกรณ์บนถาด รักษาความสะอาด และป้องกันเสียงดัง มักทำจากผ้าฝ้ายหรือผ้าลินินสีขาว ต้องเปลี่ยนทุกครั้งที่ใช้งาน', 'A tray cloth prevents glasses and dishes from sliding during transport — change it after every use.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Napkin', 'ผ้าเช็ดปาก', 'linen', 'เครื่องลินิน', '/ˈnæpkɪn/', 'ผ้าสี่เหลี่ยม 45×45 ซม. พับเป็นรูปทรงต่างๆ วางบนจานอาหารหรือด้านซ้ายมือ ผู้รับบริการใช้วางบนตักและเช็ดปาก ห้ามใช้เช็ดโต๊ะหรืออุปกรณ์ เปลี่ยนทุกรอบบริการ', 'The napkin is folded and placed on the center plate or left side — guests place it on their lap during dining.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Under Cloth', 'ผ้ารองโต๊ะ', 'linen', 'เครื่องลินิน', '/ˈʌndər klɔːθ/', 'ผ้าหนาหรือแผ่นยาง วางใต้ผ้าปูโต๊ะก่อนเสมอ ช่วยลดเสียงการวางจานช้อนส้อม ป้องกันผ้าปูโต๊ะเลื่อนหลุด และปกป้องพื้นผิวโต๊ะจากรอยขีดข่วน', 'Under cloth is placed beneath the tablecloth to absorb noise, prevent slipping, and protect the table surface.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Table Cloth', 'ผ้าปูโต๊ะ', 'linen', 'เครื่องลินิน', '/ˈteɪbl klɔːθ/', 'ผ้าปูโต๊ะสีขาวหรือสีตามธีมร้าน ต้องสะอาด รีดเรียบไม่มีรอยย่น ปูให้ตกเท่ากันทุกด้าน ประมาณ 25–30 ซม. ล้างทำความสะอาดและเปลี่ยนทุกรอบหลังแขกกลับ', 'The table cloth must be clean, wrinkle-free, and hang evenly 25–30 cm on all sides of the table.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Martini Glass', 'แก้วมาร์ตินี', 'glassware', 'เครื่องแก้ว', '/mɑːrˈtiːni ɡlæs/', 'แก้วทรง V ก้านยาว ความจุ 3–5 ออนซ์ ต้องแช่แก้วในช่องแช่แข็งก่อนเสิร์ฟ จับที่ก้านเท่านั้น ตกแต่งด้วยมะกอกหรือเปลือกมะนาว เสิร์ฟแบบ Straight Up ไม่มีน้ำแข็ง', 'Chill the martini glass before service — hold only by the stem and garnish with an olive or lemon twist.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Brandy Snifter', 'แก้วบรั่นดี', 'glassware', 'เครื่องแก้ว', '/ˈbrændi ˈsnɪftər/', 'แก้วทรงลูกแพร์ก้านสั้น ความจุ 8–12 ออนซ์ ออกแบบให้กุมด้วยมือทั้งสองข้างเพื่อถ่ายความร้อนจากฝ่ามือ ทำให้บรั่นดีระเหยสารหอม เทบรั่นดีเพียง 1–2 ออนซ์', 'Cup the brandy snifter in both palms to gently warm the spirit and release its complex aromas.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Beer Glass', 'แก้วเบียร์', 'glassware', 'เครื่องแก้ว', '/bɪr ɡlæs/', 'แก้วทรงตรงปากบาน ความจุ 10–16 ออนซ์ เทเบียร์ลงแก้วทำมุม 45 องศาก่อน แล้วค่อยตั้งตรงเพื่อให้ฟองพอดี 1–2 ซม. ล้างแก้วด้วยน้ำเย็นก่อนรินเบียร์เสมอ', 'Pour beer at 45° first, then straighten to achieve a perfect 1–2 cm foam head — rinse the glass with cold water first.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Rocks Glass', 'แก้วร็อกส์', 'glassware', 'เครื่องแก้ว', '/rɑːks ɡlæs/', 'แก้วทรงกว้างเตี้ย ความจุ 6–8 ออนซ์ เรียกอีกชื่อว่า Old-Fashioned Glass ใช้บริการวิสกี้ บรั่นดี รัม หรือสก็อตช์ที่เสิร์ฟพร้อมน้ำแข็ง (On the Rocks) หรือเปล่า (Neat)', 'Rocks glass is used for spirits served neat or on the rocks — also called old-fashioned glass.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Highball Glass', 'แก้วไฮบอล', 'glassware', 'เครื่องแก้ว', '/ˈhaɪbɔːl ɡlæs/', 'แก้วทรงตรงสูง ความจุ 8–12 ออนซ์ สำหรับเครื่องดื่มผสมที่มีน้ำอัดลม เช่น Gin & Tonic Whisky Soda หรือน้ำผลไม้ เติมน้ำแข็งก่อนแล้วจึงเทเครื่องดื่มลงทีหลัง', 'Highball glass is used for long drinks with mixers — add ice first, then pour the spirit and mixer.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Cocktail Glass', 'แก้วค็อกเทล', 'glassware', 'เครื่องแก้ว', '/ˈkɑːkteɪl ɡlæs/', 'แก้วทรง V รูปสามเหลี่ยม ความจุ 4–6 ออนซ์ ไม่มีน้ำแข็ง (Straight Up) ก้านยาวป้องกันความร้อนจากมือทำให้เครื่องดื่มอุ่น ใช้เสิร์ฟ Martini Manhattan Cosmopolitan', 'Cocktail glass is the classic V-shaped vessel for straight-up cocktails — hold by the stem to keep it chilled.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Champagne Flute', 'แก้วแชมเปญ', 'glassware', 'เครื่องแก้ว', '/ʃæmˈpeɪn fluːt/', 'แก้วก้านทรงยาวแคว ความจุ 6–8 ออนซ์ ทรงยาวช่วยให้ฟอง (Bubbles) ลอยขึ้นได้นานและสวยงาม เติมแชมเปญ 3/4 ของแก้ว เสิร์ฟแบบเย็นจัดที่ 4–8°C', 'Champagne flute preserves carbonation — fill three-quarters and serve chilled at 4–8°C.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('White Wine Glass', 'แก้วไวน์ขาว', 'glassware', 'เครื่องแก้ว', '/waɪt waɪn ɡlæs/', 'แก้วก้านทรงรี ปากแคบกว่าแก้วไวน์แดง ความจุ 8–12 ออนซ์ ทรงแคบช่วยรักษาอุณหภูมิเย็นให้นานขึ้น เติมไวน์ 2/3 ของแก้ว เสิร์ฟที่อุณหภูมิ 8–12°C', 'White wine glass has a narrower bowl to keep the wine chilled — fill two-thirds and serve at 8–12°C.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Red Wine Glass', 'แก้วไวน์แดง', 'glassware', 'เครื่องแก้ว', '/red waɪn ɡlæs/', 'แก้วก้านทรงกลมป่องใหญ่ ความจุ 12–16 ออนซ์ ทรงกลมช่วยให้ไวน์แดงสัมผัสอากาศและระเหยกลิ่นได้ดี เติมไวน์เพียง 1/3 ของแก้ว จับที่ก้านแก้วเสมอ ไม่จับที่ตัวถ้วย', 'Red wine glass has a large bowl for breathing — fill only one-third and hold by the stem, never the bowl.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Water Goblet', 'แก้วน้ำเปล่า', 'glassware', 'เครื่องแก้ว', '/ˈwɔːtər ˈɡɑːblɪt/', 'แก้วทรงถ้วยก้านใหญ่ ความจุ 10–12 ออนซ์ วางเหนือมีดอาหารหลักด้านขวาบน ใช้บริการน้ำเปล่า หรือน้ำดื่มตลอดมื้อ คอยเติมน้ำเมื่อเหลือ 1 ใน 3 เสมอ', 'The water goblet is placed at the tip of the dinner knife — refill it when it reaches one-third full.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Coffee Spoon', 'ช้อนกาแฟ', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/ˈkɔːfi spuːn/', 'ช้อนขนาดเล็กที่สุดในชุด เล็กกว่าช้อนชาเล็กน้อย ออกแบบมาสำหรับถ้วยเอสเปรสโซขนาดเล็ก (Demitasse) ใช้คนน้ำตาลในกาแฟเข้มข้น วางบนจานรองด้านขวา', 'The coffee spoon is the smallest in the set — designed for stirring sugar in a small demitasse espresso cup.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Tea Spoon', 'ช้อนชา', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/tiː spuːn/', 'ช้อนขนาดเล็กสำหรับคนชาและน้ำตาล วางบนจานรองถ้วยชา ด้านขวาของถ้วย หลังคนน้ำตาลแล้วต้องวางช้อนบนจานรอง ห้ามทิ้งไว้ในถ้วย ยังใช้ตวงส่วนผสมในการทำอาหารได้', 'After stirring with the teaspoon, rest it on the right side of the saucer — never leave it standing in the cup.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dessert Fork', 'ส้อมของหวาน', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/dɪˈzɜːrt fɔːrk/', 'ส้อม 3 ง่ามขนาดเล็ก วางเหนือจานอาหารขนานกัน ด้ามชี้ซ้าย (คู่กับช้อนของหวาน) ใช้รับประทานของหวานแห้ง เช่น เค้ก ทาร์ต พาย หรือผลไม้สด', 'The dessert fork is placed horizontally above the plate with the handle facing left — for solid desserts and cake.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dessert Spoon', 'ช้อนของหวาน', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/dɪˈzɜːrt spuːn/', 'ช้อนขนาดกลางระหว่างช้อนซุปกับช้อนชา วางเหนือจานอาหารขนานกัน ด้ามชี้ขวา ใช้รับประทานของหวานที่มีน้ำ เช่น พุดดิ้ง ไอศกรีมในซอส มูส ปานาคอตต้า', 'The dessert spoon is placed horizontally above the plate with the handle pointing right — for liquid desserts.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Fish Fork', 'ส้อมปลา', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/fɪʃ fɔːrk/', 'ส้อม 4 ง่ามรูปทรงพิเศษ ง่ามนอกด้านซ้ายกว้างกว่าปกติ ใช้จับและแยกเนื้อปลาออกจากก้าง วางด้านซ้ายถัดในจากส้อมสลัด ใช้พร้อมมีดปลาสำหรับคอร์สปลาโดยเฉพาะ', 'The fish fork has a wider outer tine for separating fish flesh — always use it with the fish knife.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Fish Knife', 'มีดปลา', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/fɪʃ naɪf/', 'มีดรูปทรงพิเศษใบกว้างปลายมน ไม่คม ออกแบบเพื่อยกเนื้อปลาออกจากก้างโดยไม่ทำลายเนื้อ วางด้านขวาถัดจากมีดอาหารหลัก ใช้คู่กับส้อมปลา นิยมใช้ในคอร์สปลาโดยเฉพาะ', 'The fish knife has a wide blunt blade — use it to lift fish flesh from bones without crushing the fillet.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Salad Fork', 'ส้อมสลัด', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/ˈsæləd fɔːrk/', 'ส้อม 4 ง่ามขนาดเล็กกว่าส้อมอาหารหลัก วางด้านซ้ายนอกสุดถัดจากส้อมอาหารหลัก ใช้รับประทานสลัดและอาหารเรียกน้ำย่อย เก็บออกพร้อมจานสลัดก่อนเสิร์ฟจานหลัก', 'The salad fork is smaller than the dinner fork and placed to the outer left — remove it with the salad plate.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Butter Knife', 'มีดเนย', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/ˈbʌtər naɪf/', 'มีดใบสั้นไม่มีคม ปลายมนกว้าง วางบนจานขนมปังด้านขวาหรือพาดขวางจาน ใช้ตักและทาเนยบนขนมปังเท่านั้น ห้ามตัดขนมปัง ควรหักขนมปังด้วยมือก่อนแล้วจึงทาเนย', 'Use the butter knife only for spreading — tear bread by hand first, then spread butter on each small piece.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Soup Spoon', 'ช้อนซุป', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/suːp spuːn/', 'ช้อนหัวกลมใหญ่กว่าช้อนอาหาร ใช้ตักซุปและน้ำซุป วิธีใช้ที่ถูกต้อง: ตักออกจากตัวไปทางนอก (away from body) แล้วดื่มจากด้านข้างช้อน ห้ามดูดเสียงดัง ไม่ใส่ช้อนทั้งอันในปาก', 'Use the soup spoon by scooping away from yourself and sipping quietly from the side — never slurp.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dinner Spoon', 'ช้อนอาหาร', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/ˈdɪnər spuːn/', 'ช้อนขนาดใหญ่รูปทรงรีสำหรับรับประทานอาหาร เช่น ข้าว กับข้าวไทย หรือพาสต้า วางด้านขวาของมีดอาหาร ในโต๊ะสากลมักไม่ใช้ แต่ในร้านอาหารไทยถือเป็นอุปกรณ์หลัก', 'The dinner spoon is essential in Thai-style service and is placed to the right of the dinner knife.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dinner Fork', 'ส้อมอาหารหลัก', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/ˈdɪnər fɔːrk/', 'ส้อมขนาดใหญ่ที่สุดในชุด 4 ง่าม วางด้านซ้ายของจานอาหารหลัก ใช้รับประทานอาหารจานหลักทุกชนิด เป็นอุปกรณ์ที่ใช้บ่อยที่สุดในชุดช้อนส้อม ขัดเงาก่อนตั้งโต๊ะ', 'The dinner fork is the largest fork, placed to the left of the plate — it is used for the entire main course.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dinner Knife', 'มีดอาหารหลัก', 'cutlery', 'เครื่องเงินและช้อนส้อม', '/ˈdɪnər naɪf/', 'มีดขนาดใหญ่ที่สุดในชุด ใบมีดหันเข้าหาจาน วางไว้ด้านขวาของจานอาหารหลัก ใช้ตัดและแล่อาหารจานหลัก เช่น เนื้อสเต็ก ปลา ไก่ ต้องขัดเงาก่อนวางตั้งโต๊ะเสมอ', 'The dinner knife is placed to the right of the plate with the blade facing inward — polish before setting.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Sauce Dish', 'ถ้วยน้ำจิ้ม', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/sɔːs dɪʃ/', 'จานหรือถ้วยขนาดเล็กสำหรับใส่น้ำจิ้ม ซอสราด หรือเครื่องปรุงเพิ่มเติม วางไว้ข้างจานหลักด้านขวา ในร้านอาหารไทยมักเสิร์ฟพร้อมอาหารทอดหรืออาหารทะเล', 'The sauce dish holds dipping sauces or condiments and is placed to the upper right of the main plate.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dessert Bowl', 'ชามของหวาน', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/dɪˈzɜːrt boʊl/', 'ชามขนาดกลางสำหรับเสิร์ฟของหวาน เช่น ไอศกรีม ผลไม้ พุดดิ้ง หรือมูส วางบน Underliner เสิร์ฟพร้อมช้อนของหวาน ควรแช่เย็นก่อนใส่ไอศกรีมเพื่อไม่ให้ละลายเร็ว', 'Chill the dessert bowl before serving ice cream — present with a dessert spoon on an underliner plate.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Tea Cup', 'ถ้วยชา', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/tiː kʌp/', 'ถ้วยบางเบาสำหรับบริการชาร้อน เล็กกว่าถ้วยกาแฟเล็กน้อย วางบนจานรอง หูถ้วยหันขวา เสิร์ฟพร้อมน้ำตาลและนม ชุดชาประกอบด้วย ถ้วยชา จานรอง ช้อนชา และกาน้ำชา', 'The tea cup is placed on a saucer with a teaspoon; serve tea from the teapot and offer sugar and milk separately.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Coffee Cup', 'ถ้วยกาแฟ', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈkɔːfi kʌp/', 'ถ้วยเซรามิคสำหรับบริการกาแฟร้อน ขนาด 6–8 ออนซ์ วางบนจานรอง หูถ้วยหันขวา เสิร์ฟหลังอาหารหลักหรือพร้อมของหวาน อุณหภูมิเสิร์ฟ 85–90°C ไม่เติมกาแฟเกิน 3/4 ถ้วย', 'The coffee cup is served after the main course at 85–90°C with the handle at 4 o''clock on the saucer.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Saucer', 'จานรองถ้วยชา', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsɔːsər/', 'จานรองขนาดเล็กสำหรับวางถ้วยชาหรือถ้วยกาแฟ ช่วยรับหยดน้ำและรักษาความสะอาดโต๊ะ วางพร้อมกับถ้วยเสมอ ช้อนชาวางบนจานรองด้านขวา หูถ้วยหันขวาเสมอ', 'The saucer always pairs with a cup — place the teaspoon on the right side and position the cup handle at 4 o''clock.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Bread Plate', 'จานขนมปัง', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/bred pleɪt/', 'จานขนาดเล็ก เส้นผ่านศูนย์กลาง 15–17 ซม. วางด้านซ้ายมือของผู้รับบริการ เหนือส้อมอาหารหลัก ใช้วางขนมปัง เนย และทาร์ตตลอดมื้ออาหาร มีดเนยวางพาดบนจานด้านขวา', 'The bread plate is placed to the upper left of the cover, above the dinner fork, with the butter knife across it.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Salad Plate', 'จานสลัด', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsæləd pleɪt/', 'จานขนาดกลาง เส้นผ่านศูนย์กลาง 19–22 ซม. สำหรับเสิร์ฟสลัดหรืออาหารเรียกน้ำย่อย (Appetizer) วางไว้ด้านบนซ้ายของจานอาหารหลัก หรือเอาออกก่อนเสิร์ฟจานหลัก', 'The salad plate is served to the left of the cover for appetizers or salads before the main course.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dinner Plate', 'จานอาหารหลัก', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈdɪnər pleɪt/', 'จานขนาดใหญ่ เส้นผ่านศูนย์กลาง 27–30 ซม. สำหรับเสิร์ฟอาหารจานหลัก (Main Course) วางไว้ตรงกลางหน้าผู้รับบริการ ห่างจากขอบโต๊ะ 2 ซม. ต้องอุ่นจานก่อนเสิร์ฟอาหารร้อนทุกครั้ง', 'The dinner plate is placed at the center of the cover for serving the main course — warm it before use.', NULL, NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  glb_url = COALESCE(EXCLUDED.glb_url, vocabulary_items.glb_url),
  usdz_url = COALESCE(EXCLUDED.usdz_url, vocabulary_items.usdz_url),
  updated_at = NOW();

COMMIT;


-- ── ชุดคำศัพท์เครื่องแก้ว 16 รายการ พร้อมรูปภาพประกอบ ──────────────────
INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Water Goblet', 'แก้วน้ำ', 'glassware', 'เครื่องแก้ว', '/ˈwɔːtər ˈɡɑːblət/', 'แก้วทรงมีขาสำหรับเสิร์ฟน้ำดื่ม น้ำเปล่า หรือน้ำแร่บนโต๊ะอาหาร มักใช้ในงานบริการอาหารและโรงแรม', 'Please serve the water in a water goblet.', '/uploads/glass_water_goblet.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Highball Glass', 'แก้วไฮบอล', 'glassware', 'เครื่องแก้ว', '/ˈhaɪbɔːl ɡlæs/', 'แก้วทรงสูง ใช้เสิร์ฟเครื่องดื่มผสม เช่น Highball, Whisky Soda, น้ำอัดลม และค็อกเทลที่มีปริมาณมาก มักเสิร์ฟพร้อมน้ำแข็ง', 'Please serve the cocktail in a highball glass.', '/uploads/glass_highball_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Collins Glass', 'แก้วคอลลินส์', 'glassware', 'เครื่องแก้ว', '/ˈkɑːlɪnz ɡlæs/', 'แก้วทรงสูงและเรียวยาว ใช้สำหรับเสิร์ฟค็อกเทลประเภท Collins เช่น Tom Collins รวมถึงเครื่องดื่มผสมและเครื่องดื่มที่มีโซดา', 'A Tom Collins is usually served in a Collins glass.', '/uploads/glass_collins_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Red Wine Glass', 'แก้วไวน์แดง', 'glassware', 'เครื่องแก้ว', '/red waɪn ɡlæs/', 'แก้วไวน์ที่มีโถแก้วค่อนข้างกว้าง ช่วยให้ไวน์แดงสัมผัสอากาศและพัฒนากลิ่น เหมาะสำหรับการเสิร์ฟไวน์แดง', 'Please pour the red wine into a red wine glass.', '/uploads/glass_red_wine_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('White Wine Glass', 'แก้วไวน์ขาว', 'glassware', 'เครื่องแก้ว', '/waɪt waɪn ɡlæs/', 'แก้วไวน์ที่มีขนาดเล็กและแคบกว่าแก้วไวน์แดง ใช้เสิร์ฟไวน์ขาวและช่วยรักษาอุณหภูมิและกลิ่นของไวน์', 'White wine should be served in a white wine glass.', '/uploads/glass_white_wine_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Champagne Flute', 'แก้วแชมเปญฟลูต', 'glassware', 'เครื่องแก้ว', '/ʃæmˈpeɪn fluːt/', 'แก้วทรงสูงเรียว มีขา ใช้เสิร์ฟแชมเปญและไวน์สปาร์กลิง ช่วยรักษาฟองและความซ่าของเครื่องดื่ม', 'Please serve the champagne in a champagne flute.', '/uploads/glass_champagne_flute.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Champagne Coupe', 'แก้วแชมเปญคูเป้', 'glassware', 'เครื่องแก้ว', '/ʃæmˈpeɪn kuːp/', 'แก้วแชมเปญทรงตื้น ปากกว้าง มีขา ใช้สำหรับเสิร์ฟแชมเปญ ค็อกเทล และเครื่องดื่มที่ต้องการนำเสนอในรูปแบบคลาสสิก', 'The champagne is served in a coupe glass.', '/uploads/glass_champagne_coupe.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Martini Glass', 'แก้วมาร์ตินี่', 'glassware', 'เครื่องแก้ว', '/mɑːrˈtiːni ɡlæs/', 'แก้วก้านยาวที่มีปากกว้างและรูปทรงกรวย ใช้เสิร์ฟ Martini และค็อกเทลประเภทที่ไม่ใส่น้ำแข็งในแก้ว', 'Please serve the Martini in a martini glass.', '/uploads/glass_martini_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Rock Glass', 'แก้วร็อก / แก้ววิสกี้', 'glassware', 'เครื่องแก้ว', '/rɑːk ɡlæs/', 'แก้วทรงเตี้ย ปากกว้าง และก้นหนา ใช้เสิร์ฟวิสกี้ บรั่นดี และเครื่องดื่มประเภท Spirits แบบเพียวหรือใส่น้ำแข็ง', 'Please serve the whisky in a rock glass.', '/uploads/glass_rock_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Margarita Glass', 'แก้วมาร์การิต้า', 'glassware', 'เครื่องแก้ว', '/ˌmɑːrɡəˈriːtə ɡlæs/', 'แก้วก้านที่มีรูปทรงเป็นชั้นหรือปากกว้าง ใช้เสิร์ฟ Margarita และค็อกเทลที่มีลักษณะคล้ายกัน โดยมักตกแต่งขอบแก้วด้วยเกลือ', 'The Margarita is served in a margarita glass.', '/uploads/glass_margarita_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Hurricane Glass', 'แก้วเฮอริเคน', 'glassware', 'เครื่องแก้ว', '/ˈhɜːrɪkeɪn ɡlæs/', 'แก้วทรงสูงที่มีส่วนโค้งคล้ายตะเกียง ใช้เสิร์ฟค็อกเทลที่มีปริมาณมาก เช่น Hurricane และเครื่องดื่มผลไม้หรือเครื่องดื่มเขตร้อน', 'Please serve the tropical cocktail in a hurricane glass.', '/uploads/glass_hurricane_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Shot Glass', 'แก้วช็อต', 'glassware', 'เครื่องแก้ว', '/ʃɑːt ɡlæs/', 'แก้วขนาดเล็ก ใช้สำหรับเสิร์ฟเครื่องดื่ม Spirits ในปริมาณเล็ก เช่น Tequila, Vodka หรือเครื่องดื่มสำหรับการดื่มแบบ Shot', 'Please pour the tequila into a shot glass.', '/uploads/glass_shot_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Beer Pilsner Glass', 'แก้วเบียร์พิลส์เนอร์', 'glassware', 'เครื่องแก้ว', '/bɪr ˈpɪlsnər ɡlæs/', 'แก้วเบียร์ทรงสูงและเรียว ใช้เสิร์ฟเบียร์ประเภท Pilsner และ Lager ช่วยให้เห็นสีของเบียร์และรักษาชั้นฟอง', 'Please serve the Pilsner beer in a Pilsner glass.', '/uploads/glass_beer_pilsner_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Beer Mug', 'แก้วเบียร์มีหูจับ', 'glassware', 'เครื่องแก้ว', '/bɪr mʌɡ/', 'แก้วเบียร์ที่มีหูจับ ใช้สำหรับเสิร์ฟเบียร์หลายประเภท โดยเฉพาะเบียร์ที่เสิร์ฟในปริมาณมากและเหมาะกับการถือด้วยมือจับ', 'Please serve the beer in a beer mug.', '/uploads/glass_beer_mug.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Brandy Snifter', 'แก้วบรั่นดี / แก้วสนิฟเตอร์', 'glassware', 'เครื่องแก้ว', '/ˈbrændi ˈsnɪftər/', 'แก้วก้านสั้น โถแก้วกลมและปากแคบ ใช้สำหรับเสิร์ฟ Brandy หรือ Cognac ช่วยกักเก็บและรวมกลิ่นหอมของเครื่องดื่ม', 'Brandy is traditionally served in a brandy snifter.', '/uploads/glass_brandy_snifter.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Irish Coffee Glass', 'แก้วไอริชคอฟฟี่', 'glassware', 'เครื่องแก้ว', '/ˌaɪrɪʃ ˈkɔːfi ɡlæs/', 'แก้วใสทนความร้อน มีหูจับและก้าน ใช้เสิร์ฟ Irish Coffee และเครื่องดื่มกาแฟร้อนที่ต้องการให้เห็นชั้นของเครื่องดื่ม', 'Please serve the Irish coffee in an Irish coffee glass.', '/uploads/glass_irish_coffee_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

-- Tableware & Chinaware (18 items)
INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Appetizer Plate', 'จานอาหารเรียกน้ำย่อย', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈæpətaɪzər pleɪt/', 'จานขนาดเล็กสำหรับเสิร์ฟอาหารเรียกน้ำย่อย ของว่าง หรืออาหารจานเล็กก่อนอาหารมื้อหลัก', 'The appetizer plate is used to serve small starters before the main course.', '/uploads/tableware_appetizer_plate.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Soup Bowl (Soup Plate)', 'ชามซุป (จานซุป)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/suːp boʊl/', 'ภาชนะสำหรับเสิร์ฟซุป แกง หรืออาหารที่มีน้ำเป็นส่วนประกอบ โดยมีขอบลึกกว่าจานทั่วไป', 'The soup bowl is used to serve hot soup.', '/uploads/tableware_soup_bowl.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Cereal Bowl', 'ชามซีเรียล', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsɪəriəl boʊl/', 'ชามสำหรับเสิร์ฟซีเรียล ข้าวต้ม ผลไม้ หรืออาหารเช้าที่รับประทานร่วมกับนมหรือของเหลว', 'She uses a cereal bowl for breakfast.', '/uploads/tableware_cereal_bowl.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Salad Bowl', 'ชามสลัด', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsæləd boʊl/', 'ชามสำหรับเสิร์ฟสลัด ผัก หรืออาหารประเภทคลุกเคล้า', 'The salad bowl is placed in the center of the table.', '/uploads/tableware_salad_bowl.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dessert Bowl', 'ชามของหวาน', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/dɪˈzɜːrt boʊl/', 'ชามขนาดเล็กสำหรับเสิร์ฟของหวาน เช่น ไอศกรีม ผลไม้ หรือพุดดิ้ง', 'The dessert bowl is used for serving ice cream.', '/uploads/tableware_dessert_bowl.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Bouillon Cup (Broth Bowl)', 'ถ้วยน้ำซุป (ชามน้ำซุป)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈbuːjɒn kʌp/', 'ถ้วยมีหูจับสำหรับเสิร์ฟน้ำซุป น้ำแกง หรือซุปใส สามารถถือรับประทานได้สะดวก', 'The bouillon cup is used to serve clear broth.', '/uploads/tableware_bouillon_cup.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Ramekin', 'ถ้วยราเมคิน / ถ้วยอบขนาดเล็ก', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈræməkɪn/', 'ถ้วยขนาดเล็กสำหรับใส่ซอส เครื่องปรุง ของหวาน หรืออาหารที่ต้องนำเข้าอบ', 'The sauce is served in a small ramekin.', '/uploads/tableware_ramekin.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Finger Bowl', 'ถ้วยล้างปลายนิ้ว', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈfɪŋɡər boʊl/', 'ถ้วยขนาดเล็กที่ใส่น้ำสำหรับล้างปลายนิ้วบนโต๊ะอาหาร โดยเฉพาะในการรับประทานอาหารที่ใช้มือ', 'The finger bowl is placed on the table after the meal.', '/uploads/tableware_finger_bowl.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Tea Cup', 'ถ้วยชา', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/tiː kʌp/', 'ถ้วยสำหรับเสิร์ฟและดื่มชา มักใช้คู่กับจานรองถ้วยชา', 'The waiter serves tea in a tea cup.', '/uploads/tableware_tea_cup.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Coffee Cup', 'ถ้วยกาแฟ', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈkɔːfi kʌp/', 'ถ้วยสำหรับเสิร์ฟและดื่มกาแฟร้อน โดยทั่วไปใช้คู่กับจานรอง', 'The coffee cup is placed on the saucer.', '/uploads/tableware_coffee_cup.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Espresso Cup (Demitasse Cup)', 'ถ้วยเอสเปรสโซ (ถ้วยเดอมิตาส)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/eˈspresoʊ kʌp/', 'ถ้วยขนาดเล็กสำหรับเสิร์ฟกาแฟเอสเปรสโซหรือกาแฟเข้มข้นในปริมาณน้อย', 'The espresso is served in a small espresso cup.', '/uploads/tableware_espresso_cup.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Cappuccino Cup', 'ถ้วยคาปูชิโน', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˌkæpəˈtʃiːnoʊ kʌp/', 'ถ้วยสำหรับเสิร์ฟกาแฟคาปูชิโน โดยมีขนาดใหญ่กว่าถ้วยเอสเปรสโซ', 'The cappuccino is served in a cappuccino cup.', '/uploads/tableware_cappuccino_cup.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Saucer', 'จานรองถ้วย', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsɔːsər/', 'จานขนาดเล็กสำหรับรองถ้วยชา กาแฟ หรือเครื่องดื่มร้อน และใช้รองป้องกันของเหลวหกบนโต๊ะ', 'The cup is placed on the saucer.', '/uploads/tableware_saucer.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Mug', 'แก้วมัค / ถ้วยมีหู', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/mʌɡ/', 'แก้วหรือถ้วยขนาดค่อนข้างใหญ่ที่มีหูจับ สำหรับเสิร์ฟกาแฟ ชา หรือเครื่องดื่มร้อนและเย็น', 'He drinks coffee from a large mug.', '/uploads/tableware_mug.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Serving Platter (Oval Platter)', 'จานเสิร์ฟอาหาร (จานเสิร์ฟทรงรี)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsɜːrvɪŋ ˈplætər/', 'จานขนาดใหญ่สำหรับจัดวางและเสิร์ฟอาหารหลายชนิด โดยเฉพาะอาหารที่ต้องเสิร์ฟเป็นชุด', 'The roast chicken is served on an oval platter.', '/uploads/tableware_serving_platter_oval.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Serving Platter (Meat Platter)', 'จานเสิร์ฟอาหาร (จานเสิร์ฟเนื้อ)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsɜːrvɪŋ ˈplætər/', 'จานขนาดใหญ่สำหรับจัดวางและเสิร์ฟเนื้อสัตว์ อาหารจานหลัก หรืออาหารที่หั่นเป็นชิ้น', 'The sliced meat is arranged on the meat platter.', '/uploads/tableware_serving_platter_meat.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Soup Tureen', 'หม้อซุปสำหรับเสิร์ฟ', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/suːp təˈriːn/', 'ภาชนะขนาดใหญ่สำหรับใส่และเสิร์ฟซุปหรืออาหารประเภทน้ำให้กับผู้รับประทานหลายคน มักมีฝาปิดและหูจับ', 'The soup is served from a large soup tureen.', '/uploads/tableware_soup_tureen.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Soup Tureen (Open with Ladle)', 'หม้อซุปสำหรับเสิร์ฟ (แบบเปิดพร้อมกระบวย)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/suːp təˈriːn/', 'ภาชนะขนาดใหญ่สำหรับเสิร์ฟซุปหรืออาหารประเภทน้ำ โดยเปิดฝาและใช้กระบวยตักแบ่งให้ผู้รับประทาน', 'The soup tureen is open and ready to serve with a ladle.', '/uploads/tableware_soup_tureen_open.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();


-- Cutlery: Forks, Knives, Spoons (17 items)
INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dinner Fork', 'ส้อมรับประทานอาหาร', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈdɪnər fɔːrk/', 'ส้อมขนาดมาตรฐานสำหรับใช้รับประทานอาหารมื้อหลัก เช่น ข้าว เนื้อสัตว์ ผัก และอาหารทั่วไป', 'The dinner fork is placed on the left side of the plate.', '/uploads/cutlery_dinner_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Salad Fork', 'ส้อมสลัด', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsæləd fɔːrk/', 'ส้อมขนาดเล็กกว่าส้อมอาหารหลัก ใช้สำหรับรับประทานสลัดและอาหารเรียกน้ำย่อย', 'Use the salad fork to eat the salad.', '/uploads/cutlery_salad_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dessert Fork', 'ส้อมขนมหวาน', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/dɪˈzɜːrt fɔːrk/', 'ส้อมขนาดเล็กสำหรับรับประทานเค้ก ขนมหวาน และผลไม้', 'She uses a dessert fork to eat the cake.', '/uploads/cutlery_dessert_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Fish Fork', 'ส้อมสำหรับรับประทานปลา', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/fɪʃ fɔːrk/', 'ส้อมที่ออกแบบสำหรับรับประทานอาหารประเภทปลา โดยมีรูปทรงเหมาะกับการแยกและจับเนื้อปลา', 'The fish fork is used for eating fish.', '/uploads/cutlery_fish_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Oyster Fork', 'ส้อมหอยนางรม', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈɔɪstər fɔːrk/', 'ส้อมขนาดเล็กสำหรับรับประทานหอยนางรมและอาหารทะเลประเภทต่าง ๆ', 'The oyster fork is used to eat oysters.', '/uploads/cutlery_oyster_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Snail Fork', 'ส้อมสำหรับรับประทานหอยทาก', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/sneɪl fɔːrk/', 'ส้อมขนาดเล็กปลายแหลม ใช้สำหรับคีบหรือดึงเนื้อหอยทากออกจากเปลือก', 'The waiter brought a snail fork with the dish.', '/uploads/cutlery_snail_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Fruit Fork', 'ส้อมผลไม้', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/fruːt fɔːrk/', 'ส้อมขนาดเล็กสำหรับรับประทานผลไม้และของว่าง', 'Use the fruit fork to pick up the pieces of fruit.', '/uploads/cutlery_fruit_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dinner Knife', 'มีดรับประทานอาหาร', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈdɪnər naɪf/', 'มีดมาตรฐานสำหรับใช้ตัดและรับประทานอาหารในมื้อหลัก', 'The dinner knife is placed on the right side of the plate.', '/uploads/cutlery_dinner_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Steak Knife', 'มีดสเต๊ก', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/steɪk naɪf/', 'มีดที่มีคมเหมาะสำหรับตัดเนื้อสเต๊กและเนื้อสัตว์', 'A steak knife is used to cut meat.', '/uploads/cutlery_steak_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Butter Knife', 'มีดทาเนย', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈbʌtər naɪf/', 'มีดปลายมนสำหรับตักและทาเนย แยม หรือสเปรดบนขนมปัง', 'Use the butter knife to spread butter on the bread.', '/uploads/cutlery_butter_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Fish Knife', 'มีดสำหรับรับประทานปลา', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/fɪʃ naɪf/', 'มีดที่ออกแบบสำหรับแยกและรับประทานเนื้อปลา', 'The fish knife is used to separate the fish from the bones.', '/uploads/cutlery_fish_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Fish Serving Knife', 'มีดสำหรับเสิร์ฟปลา', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/fɪʃ ˈsɜːrvɪŋ naɪf/', 'มีดสำหรับตัด แบ่ง หรือเสิร์ฟอาหารประเภทปลา', 'The fish serving knife is used to serve the fish.', '/uploads/cutlery_fish_serving_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dessert Knife', 'มีดขนมหวาน', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/dɪˈzɜːrt naɪf/', 'มีดขนาดเล็กสำหรับตัดเค้ก ขนมหวาน และผลไม้', 'The dessert knife is used to cut the cake.', '/uploads/cutlery_dessert_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Cheese Knife', 'มีดสำหรับตัดชีส', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/tʃiːz naɪf/', 'มีดสำหรับตัดและแบ่งชีสประเภทต่าง ๆ', 'Use the cheese knife to cut the cheese.', '/uploads/cutlery_cheese_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Carving Knife', 'มีดแล่เนื้อ', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈkɑːrvɪŋ naɪf/', 'มีดใบยาวสำหรับหั่นหรือแล่เนื้อสัตว์ เช่น เนื้ออบ ไก่งวง หรือแฮม', 'The chef uses a carving knife to slice the roast.', '/uploads/cutlery_carving_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Soup Spoon', 'ช้อนซุป', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/suːp spuːn/', 'ช้อนที่มีหัวลึกสำหรับตักและรับประทานซุปหรืออาหารที่มีน้ำ', 'Use the soup spoon to eat the soup.', '/uploads/cutlery_soup_spoon.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dinner Spoon', 'ช้อนรับประทานอาหาร', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈdɪnər spuːn/', 'ช้อนขนาดมาตรฐานสำหรับใช้รับประทานอาหารในมื้อหลัก', 'The dinner spoon is placed next to the knife.', '/uploads/cutlery_dinner_spoon.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  pronounce = EXCLUDED.pronounce,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url),
  updated_at = NOW();

