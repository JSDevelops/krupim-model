-- ==========================================================
-- สคริปต์อัปเดตโครงสร้างและนำเข้าคำศัพท์ 51 รายการขึ้นฐานข้อมูลจริง
-- (เฉพาะรายการที่มีรูปภาพเท่านั้น)
-- อัปเดตล่าสุด: 2026-09-14 — ลบ 56 คำศัพท์ที่ไม่มีรูปออก
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

-- 3. นำเข้า/อัปเดตคำศัพท์ที่มีรูปภาพแล้ว (3 รายการ พร้อม GLB/USDZ 3D models)
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
VALUES ('Soup Bowl', 'ถ้วยซุป', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/suːp boʊl/', 'ถ้วยขนาดกลางมีสองหูจับ สำหรับเสิร์ฟซุปร้อน วางบนจานรองซุป เสิร์ฟจากด้านขวาของผู้รับบริการ ต้องอุ่นถ้วยก่อนเสิร์ฟ', 'The soup bowl is pre-warmed and served from the right side of the guest on an underliner plate.', '/uploads/vocab_1788049252588_Soup_Bowl_6efde00fc36e.png', '/uploads/1787799662101_Soup_Bowl_glb_bf9a25e12930.glb', '/uploads/1787799668263_Soup_Bowl_usdz_ed2052788850.usdz')
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
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Highball Glass', 'แก้วไฮบอล', 'glassware', 'เครื่องแก้ว', '/ˈhaɪbɔːl ɡlæs/', 'แก้วทรงสูง ใช้เสิร์ฟเครื่องดื่มผสม เช่น Highball, Whisky Soda, น้ำอัดลม และค็อกเทลที่มีปริมาณมาก มักเสิร์ฟพร้อมน้ำแข็ง', 'Please serve the cocktail in a highball glass.', '/uploads/glass_highball_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Collins Glass', 'แก้วคอลลินส์', 'glassware', 'เครื่องแก้ว', '/ˈkɑːlɪnz ɡlæs/', 'แก้วทรงสูงและเรียวยาว ใช้สำหรับเสิร์ฟค็อกเทลประเภท Collins เช่น Tom Collins รวมถึงเครื่องดื่มผสมและเครื่องดื่มที่มีโซดา', 'A Tom Collins is usually served in a Collins glass.', '/uploads/glass_collins_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Red Wine Glass', 'แก้วไวน์แดง', 'glassware', 'เครื่องแก้ว', '/red waɪn ɡlæs/', 'แก้วไวน์ที่มีโถแก้วค่อนข้างกว้าง ช่วยให้ไวน์แดงสัมผัสอากาศและพัฒนากลิ่น เหมาะสำหรับการเสิร์ฟไวน์แดง', 'Please pour the red wine into a red wine glass.', '/uploads/glass_red_wine_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('White Wine Glass', 'แก้วไวน์ขาว', 'glassware', 'เครื่องแก้ว', '/waɪt waɪn ɡlæs/', 'แก้วไวน์ที่มีขนาดเล็กและแคบกว่าแก้วไวน์แดง ใช้เสิร์ฟไวน์ขาวและช่วยรักษาอุณหภูมิและกลิ่นของไวน์', 'White wine should be served in a white wine glass.', '/uploads/glass_white_wine_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Champagne Flute', 'แก้วแชมเปญฟลูต', 'glassware', 'เครื่องแก้ว', '/ʃæmˈpeɪn fluːt/', 'แก้วทรงสูงเรียว มีขา ใช้เสิร์ฟแชมเปญและไวน์สปาร์กลิง ช่วยรักษาฟองและความซ่าของเครื่องดื่ม', 'Please serve the champagne in a champagne flute.', '/uploads/glass_champagne_flute.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Champagne Coupe', 'แก้วแชมเปญคูเป้', 'glassware', 'เครื่องแก้ว', '/ʃæmˈpeɪn kuːp/', 'แก้วแชมเปญทรงตื้น ปากกว้าง มีขา ใช้สำหรับเสิร์ฟแชมเปญ ค็อกเทล และเครื่องดื่มที่ต้องการนำเสนอในรูปแบบคลาสสิก', 'The champagne is served in a coupe glass.', '/uploads/glass_champagne_coupe.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Martini Glass', 'แก้วมาร์ตินี่', 'glassware', 'เครื่องแก้ว', '/mɑːrˈtiːni ɡlæs/', 'แก้วก้านยาวที่มีปากกว้างและรูปทรงกรวย ใช้เสิร์ฟ Martini และค็อกเทลประเภทที่ไม่ใส่น้ำแข็งในแก้ว', 'Please serve the Martini in a martini glass.', '/uploads/glass_martini_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Rock Glass', 'แก้วร็อก / แก้ววิสกี้', 'glassware', 'เครื่องแก้ว', '/rɑːk ɡlæs/', 'แก้วทรงเตี้ย ปากกว้าง และก้นหนา ใช้เสิร์ฟวิสกี้ บรั่นดี และเครื่องดื่มประเภท Spirits แบบเพียวหรือใส่น้ำแข็ง', 'Please serve the whisky in a rock glass.', '/uploads/glass_rock_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Margarita Glass', 'แก้วมาร์การิต้า', 'glassware', 'เครื่องแก้ว', '/ˌmɑːrɡəˈriːtə ɡlæs/', 'แก้วก้านที่มีรูปทรงเป็นชั้นหรือปากกว้าง ใช้เสิร์ฟ Margarita และค็อกเทลที่มีลักษณะคล้ายกัน โดยมักตกแต่งขอบแก้วด้วยเกลือ', 'The Margarita is served in a margarita glass.', '/uploads/glass_margarita_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Hurricane Glass', 'แก้วเฮอริเคน', 'glassware', 'เครื่องแก้ว', '/ˈhɜːrɪkeɪn ɡlæs/', 'แก้วทรงสูงที่มีส่วนโค้งคล้ายตะเกียง ใช้เสิร์ฟค็อกเทลที่มีปริมาณมาก เช่น Hurricane และเครื่องดื่มผลไม้หรือเครื่องดื่มเขตร้อน', 'Please serve the tropical cocktail in a hurricane glass.', '/uploads/glass_hurricane_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Shot Glass', 'แก้วช็อต', 'glassware', 'เครื่องแก้ว', '/ʃɑːt ɡlæs/', 'แก้วขนาดเล็ก ใช้สำหรับเสิร์ฟเครื่องดื่ม Spirits ในปริมาณเล็ก เช่น Tequila, Vodka หรือเครื่องดื่มสำหรับการดื่มแบบ Shot', 'Please pour the tequila into a shot glass.', '/uploads/glass_shot_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Beer Pilsner Glass', 'แก้วเบียร์พิลส์เนอร์', 'glassware', 'เครื่องแก้ว', '/bɪr ˈpɪlsnər ɡlæs/', 'แก้วเบียร์ทรงสูงและเรียว ใช้เสิร์ฟเบียร์ประเภท Pilsner และ Lager ช่วยให้เห็นสีของเบียร์และรักษาชั้นฟอง', 'Please serve the Pilsner beer in a Pilsner glass.', '/uploads/glass_beer_pilsner_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Beer Mug', 'แก้วเบียร์มีหูจับ', 'glassware', 'เครื่องแก้ว', '/bɪr mʌɡ/', 'แก้วเบียร์ที่มีหูจับ ใช้สำหรับเสิร์ฟเบียร์หลายประเภท โดยเฉพาะเบียร์ที่เสิร์ฟในปริมาณมากและเหมาะกับการถือด้วยมือจับ', 'Please serve the beer in a beer mug.', '/uploads/glass_beer_mug.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Brandy Snifter', 'แก้วบรั่นดี / แก้วสนิฟเตอร์', 'glassware', 'เครื่องแก้ว', '/ˈbrændi ˈsnɪftər/', 'แก้วก้านสั้น โถแก้วกลมและปากแคบ ใช้สำหรับเสิร์ฟ Brandy หรือ Cognac ช่วยกักเก็บและรวมกลิ่นหอมของเครื่องดื่ม', 'Brandy is traditionally served in a brandy snifter.', '/uploads/glass_brandy_snifter.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Irish Coffee Glass', 'แก้วไอริชคอฟฟี่', 'glassware', 'เครื่องแก้ว', '/ˌaɪrɪʃ ˈkɔːfi ɡlæs/', 'แก้วใสทนความร้อน มีหูจับและก้าน ใช้เสิร์ฟ Irish Coffee และเครื่องดื่มกาแฟร้อนที่ต้องการให้เห็นชั้นของเครื่องดื่ม', 'Please serve the Irish coffee in an Irish coffee glass.', '/uploads/glass_irish_coffee_glass.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();


-- Tableware & Chinaware (18 items)
INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Appetizer Plate', 'จานอาหารเรียกน้ำย่อย', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈæpətaɪzər pleɪt/', 'จานขนาดเล็กสำหรับเสิร์ฟอาหารเรียกน้ำย่อย ของว่าง หรืออาหารจานเล็กก่อนอาหารมื้อหลัก', 'The appetizer plate is used to serve small starters before the main course.', '/uploads/tableware_appetizer_plate.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Soup Bowl (Soup Plate)', 'ชามซุป (จานซุป)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/suːp boʊl/', 'ภาชนะสำหรับเสิร์ฟซุป แกง หรืออาหารที่มีน้ำเป็นส่วนประกอบ โดยมีขอบลึกกว่าจานทั่วไป', 'The soup bowl is used to serve hot soup.', '/uploads/tableware_soup_bowl.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Cereal Bowl', 'ชามซีเรียล', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsɪəriəl boʊl/', 'ชามสำหรับเสิร์ฟซีเรียล ข้าวต้ม ผลไม้ หรืออาหารเช้าที่รับประทานร่วมกับนมหรือของเหลว', 'She uses a cereal bowl for breakfast.', '/uploads/tableware_cereal_bowl.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Salad Bowl', 'ชามสลัด', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsæləd boʊl/', 'ชามสำหรับเสิร์ฟสลัด ผัก หรืออาหารประเภทคลุกเคล้า', 'The salad bowl is placed in the center of the table.', '/uploads/tableware_salad_bowl.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dessert Bowl', 'ชามของหวาน', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/dɪˈzɜːrt boʊl/', 'ชามขนาดเล็กสำหรับเสิร์ฟของหวาน เช่น ไอศกรีม ผลไม้ หรือพุดดิ้ง', 'The dessert bowl is used for serving ice cream.', '/uploads/tableware_dessert_bowl.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Bouillon Cup (Broth Bowl)', 'ถ้วยน้ำซุป (ชามน้ำซุป)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈbuːjɒn kʌp/', 'ถ้วยมีหูจับสำหรับเสิร์ฟน้ำซุป น้ำแกง หรือซุปใส สามารถถือรับประทานได้สะดวก', 'The bouillon cup is used to serve clear broth.', '/uploads/tableware_bouillon_cup.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Ramekin', 'ถ้วยราเมคิน / ถ้วยอบขนาดเล็ก', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈræməkɪn/', 'ถ้วยขนาดเล็กสำหรับใส่ซอส เครื่องปรุง ของหวาน หรืออาหารที่ต้องนำเข้าอบ', 'The sauce is served in a small ramekin.', '/uploads/tableware_ramekin.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Finger Bowl', 'ถ้วยล้างปลายนิ้ว', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈfɪŋɡər boʊl/', 'ถ้วยขนาดเล็กที่ใส่น้ำสำหรับล้างปลายนิ้วบนโต๊ะอาหาร โดยเฉพาะในการรับประทานอาหารที่ใช้มือ', 'The finger bowl is placed on the table after the meal.', '/uploads/tableware_finger_bowl.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Tea Cup', 'ถ้วยชา', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/tiː kʌp/', 'ถ้วยสำหรับเสิร์ฟและดื่มชา มักใช้คู่กับจานรองถ้วยชา', 'The waiter serves tea in a tea cup.', '/uploads/tableware_tea_cup.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Coffee Cup', 'ถ้วยกาแฟ', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈkɔːfi kʌp/', 'ถ้วยสำหรับเสิร์ฟและดื่มกาแฟร้อน โดยทั่วไปใช้คู่กับจานรอง', 'The coffee cup is placed on the saucer.', '/uploads/tableware_coffee_cup.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Espresso Cup (Demitasse Cup)', 'ถ้วยเอสเปรสโซ (ถ้วยเดอมิตาส)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/eˈspresoʊ kʌp/', 'ถ้วยขนาดเล็กสำหรับเสิร์ฟกาแฟเอสเปรสโซหรือกาแฟเข้มข้นในปริมาณน้อย', 'The espresso is served in a small espresso cup.', '/uploads/tableware_espresso_cup.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Cappuccino Cup', 'ถ้วยคาปูชิโน', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˌkæpəˈtʃiːnoʊ kʌp/', 'ถ้วยสำหรับเสิร์ฟกาแฟคาปูชิโน โดยมีขนาดใหญ่กว่าถ้วยเอสเปรสโซ', 'The cappuccino is served in a cappuccino cup.', '/uploads/tableware_cappuccino_cup.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Saucer', 'จานรองถ้วย', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsɔːsər/', 'จานขนาดเล็กสำหรับรองถ้วยชา กาแฟ หรือเครื่องดื่มร้อน และใช้รองป้องกันของเหลวหกบนโต๊ะ', 'The cup is placed on the saucer.', '/uploads/tableware_saucer.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Mug', 'แก้วมัค / ถ้วยมีหู', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/mʌɡ/', 'แก้วหรือถ้วยขนาดค่อนข้างใหญ่ที่มีหูจับ สำหรับเสิร์ฟกาแฟ ชา หรือเครื่องดื่มร้อนและเย็น', 'He drinks coffee from a large mug.', '/uploads/tableware_mug.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Serving Platter (Oval Platter)', 'จานเสิร์ฟอาหาร (จานเสิร์ฟทรงรี)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsɜːrvɪŋ ˈplætər/', 'จานขนาดใหญ่สำหรับจัดวางและเสิร์ฟอาหารหลายชนิด โดยเฉพาะอาหารที่ต้องเสิร์ฟเป็นชุด', 'The roast chicken is served on an oval platter.', '/uploads/tableware_serving_platter_oval.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Serving Platter (Meat Platter)', 'จานเสิร์ฟอาหาร (จานเสิร์ฟเนื้อ)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsɜːrvɪŋ ˈplætər/', 'จานขนาดใหญ่สำหรับจัดวางและเสิร์ฟเนื้อสัตว์ อาหารจานหลัก หรืออาหารที่หั่นเป็นชิ้น', 'The sliced meat is arranged on the meat platter.', '/uploads/tableware_serving_platter_meat.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Soup Tureen', 'หม้อซุปสำหรับเสิร์ฟ', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/suːp təˈriːn/', 'ภาชนะขนาดใหญ่สำหรับใส่และเสิร์ฟซุปหรืออาหารประเภทน้ำให้กับผู้รับประทานหลายคน มักมีฝาปิดและหูจับ', 'The soup is served from a large soup tureen.', '/uploads/tableware_soup_tureen.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Soup Tureen (Open with Ladle)', 'หม้อซุปสำหรับเสิร์ฟ (แบบเปิดพร้อมกระบวย)', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '/suːp təˈriːn/', 'ภาชนะขนาดใหญ่สำหรับเสิร์ฟซุปหรืออาหารประเภทน้ำ โดยเปิดฝาและใช้กระบวยตักแบ่งให้ผู้รับประทาน', 'The soup tureen is open and ready to serve with a ladle.', '/uploads/tableware_soup_tureen_open.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();


-- Cutlery: Forks, Knives, Spoons (17 items)
INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dinner Fork', 'ส้อมรับประทานอาหาร', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈdɪnər fɔːrk/', 'ส้อมขนาดมาตรฐานสำหรับใช้รับประทานอาหารมื้อหลัก เช่น ข้าว เนื้อสัตว์ ผัก และอาหารทั่วไป', 'The dinner fork is placed on the left side of the plate.', '/uploads/cutlery_dinner_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Salad Fork', 'ส้อมสลัด', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈsæləd fɔːrk/', 'ส้อมขนาดเล็กกว่าส้อมอาหารหลัก ใช้สำหรับรับประทานสลัดและอาหารเรียกน้ำย่อย', 'Use the salad fork to eat the salad.', '/uploads/cutlery_salad_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dessert Fork', 'ส้อมขนมหวาน', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/dɪˈzɜːrt fɔːrk/', 'ส้อมขนาดเล็กสำหรับรับประทานเค้ก ขนมหวาน และผลไม้', 'She uses a dessert fork to eat the cake.', '/uploads/cutlery_dessert_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Fish Fork', 'ส้อมสำหรับรับประทานปลา', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/fɪʃ fɔːrk/', 'ส้อมที่ออกแบบสำหรับรับประทานอาหารประเภทปลา โดยมีรูปทรงเหมาะกับการแยกและจับเนื้อปลา', 'The fish fork is used for eating fish.', '/uploads/cutlery_fish_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Oyster Fork', 'ส้อมหอยนางรม', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈɔɪstər fɔːrk/', 'ส้อมขนาดเล็กสำหรับรับประทานหอยนางรมและอาหารทะเลประเภทต่าง ๆ', 'The oyster fork is used to eat oysters.', '/uploads/cutlery_oyster_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Snail Fork', 'ส้อมสำหรับรับประทานหอยทาก', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/sneɪl fɔːrk/', 'ส้อมขนาดเล็กปลายแหลม ใช้สำหรับคีบหรือดึงเนื้อหอยทากออกจากเปลือก', 'The waiter brought a snail fork with the dish.', '/uploads/cutlery_snail_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Fruit Fork', 'ส้อมผลไม้', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/fruːt fɔːrk/', 'ส้อมขนาดเล็กสำหรับรับประทานผลไม้และของว่าง', 'Use the fruit fork to pick up the pieces of fruit.', '/uploads/cutlery_fruit_fork.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dinner Knife', 'มีดรับประทานอาหาร', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈdɪnər naɪf/', 'มีดมาตรฐานสำหรับใช้ตัดและรับประทานอาหารในมื้อหลัก', 'The dinner knife is placed on the right side of the plate.', '/uploads/cutlery_dinner_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Steak Knife', 'มีดสเต๊ก', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/steɪk naɪf/', 'มีดที่มีคมเหมาะสำหรับตัดเนื้อสเต๊กและเนื้อสัตว์', 'A steak knife is used to cut meat.', '/uploads/cutlery_steak_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Butter Knife', 'มีดทาเนย', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈbʌtər naɪf/', 'มีดปลายมนสำหรับตักและทาเนย แยม หรือสเปรดบนขนมปัง', 'Use the butter knife to spread butter on the bread.', '/uploads/cutlery_butter_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Fish Knife', 'มีดสำหรับรับประทานปลา', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/fɪʃ naɪf/', 'มีดที่ออกแบบสำหรับแยกและรับประทานเนื้อปลา', 'The fish knife is used to separate the fish from the bones.', '/uploads/cutlery_fish_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Fish Serving Knife', 'มีดสำหรับเสิร์ฟปลา', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/fɪʃ ˈsɜːrvɪŋ naɪf/', 'มีดสำหรับตัด แบ่ง หรือเสิร์ฟอาหารประเภทปลา', 'The fish serving knife is used to serve the fish.', '/uploads/cutlery_fish_serving_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dessert Knife', 'มีดขนมหวาน', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/dɪˈzɜːrt naɪf/', 'มีดขนาดเล็กสำหรับตัดเค้ก ขนมหวาน และผลไม้', 'The dessert knife is used to cut the cake.', '/uploads/cutlery_dessert_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Cheese Knife', 'มีดสำหรับตัดชีส', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/tʃiːz naɪf/', 'มีดสำหรับตัดและแบ่งชีสประเภทต่าง ๆ', 'Use the cheese knife to cut the cheese.', '/uploads/cutlery_cheese_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Carving Knife', 'มีดแล่เนื้อ', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈkɑːrvɪŋ naɪf/', 'มีดใบยาวสำหรับหั่นหรือแล่เนื้อสัตว์ เช่น เนื้ออบ ไก่งวง หรือแฮม', 'The chef uses a carving knife to slice the roast.', '/uploads/cutlery_carving_knife.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Soup Spoon', 'ช้อนซุป', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/suːp spuːn/', 'ช้อนที่มีหัวลึกสำหรับตักและรับประทานซุปหรืออาหารที่มีน้ำ', 'Use the soup spoon to eat the soup.', '/uploads/cutlery_soup_spoon.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

INSERT INTO vocabulary_items (name_en, name_th, category, category_th, pronounce, use_desc, sentence, image_url, glb_url, usdz_url)
VALUES ('Dinner Spoon', 'ช้อนรับประทานอาหาร', 'cutlery', 'เครื่องใช้บนโต๊ะอาหาร', '/ˈdɪnər spuːn/', 'ช้อนขนาดมาตรฐานสำหรับใช้รับประทานอาหารในมื้อหลัก', 'The dinner spoon is placed next to the knife.', '/uploads/cutlery_dinner_spoon.webp', NULL, NULL)
ON CONFLICT (name_en) DO UPDATE SET name_th = EXCLUDED.name_th, category = EXCLUDED.category, category_th = EXCLUDED.category_th, pronounce = EXCLUDED.pronounce, use_desc = EXCLUDED.use_desc, sentence = EXCLUDED.sentence, image_url = COALESCE(EXCLUDED.image_url, vocabulary_items.image_url), updated_at = NOW();

