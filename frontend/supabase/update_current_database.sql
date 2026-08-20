-- ==============================================================================
-- 🚀 FINE MODEL (AR 3D + AI) — DATABASE CURRENT UPDATE SCRIPT
-- สำหรับรันใน Supabase SQL Editor หรือ Railway PostgreSQL Dashboard
-- อัปเดตตารางและข้อมูลล่าสุด: 10 หมวดหมู่อุปกรณ์ + คลังคำศัพท์ + โมเดล AR 3D
-- ==============================================================================

-- 1. สร้างตาราง vocabulary_items (หากยังไม่มี)
CREATE TABLE IF NOT EXISTS vocabulary_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en     TEXT NOT NULL UNIQUE,
  name_th     TEXT NOT NULL,
  category    TEXT DEFAULT 'tableware',
  category_th TEXT DEFAULT 'อุปกรณ์บนโต๊ะอาหาร',
  emoji       TEXT DEFAULT '🍴',
  pronounce   TEXT,
  use_desc    TEXT NOT NULL,
  sentence    TEXT NOT NULL,
  glb_url     TEXT,
  usdz_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- สร้าง Index เพื่อการค้นหาคำศัพท์ความเร็วสูง
CREATE INDEX IF NOT EXISTS idx_vocab_name_en ON vocabulary_items(name_en);
CREATE INDEX IF NOT EXISTS idx_vocab_category ON vocabulary_items(category);

-- 2. ตั้งค่า RLS (Row Level Security) สำหรับ Supabase
ALTER TABLE vocabulary_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read vocabulary_items" ON vocabulary_items;
CREATE POLICY "Allow public read vocabulary_items" ON vocabulary_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert update delete vocabulary_items" ON vocabulary_items;
CREATE POLICY "Allow public insert update delete vocabulary_items" ON vocabulary_items FOR ALL USING (true) WITH CHECK (true);

-- 3. ตรวจสอบคอลัมน์ใน ai_scan_items
ALTER TABLE IF EXISTS ai_scan_items ADD COLUMN IF NOT EXISTS pronounce TEXT;
ALTER TABLE IF EXISTS ai_scan_items ADD COLUMN IF NOT EXISTS sentence TEXT;
ALTER TABLE IF EXISTS ai_scan_items ADD COLUMN IF NOT EXISTS glb_url TEXT;
ALTER TABLE IF EXISTS ai_scan_items ADD COLUMN IF NOT EXISTS usdz_url TEXT;

-- 4. INSERT / UPSERT ข้อมูลคำศัพท์มาตรฐาน 10 หมวดหมู่อุปกรณ์ครบถ้วน 66 รายการ
INSERT INTO vocabulary_items (name_en, name_th, category, category_th, emoji, pronounce, use_desc, sentence)
VALUES
  -- หมวดที่ 1 อุปกรณ์เครื่องใช้บนโต๊ะอาหาร (Tableware)
  ('Dinner Plate', 'จานอาหารหลัก', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '🍽️', '/ˈdɪnər pleɪt/', 'ใส่อาหารจานหลัก', 'The dinner plate is used for serving main courses.'),
  ('Salad Plate', 'จานสลัด', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '🥗', '/ˈsæləd pleɪt/', 'ใส่สลัดหรืออาหารเรียกน้ำย่อย', 'The salad plate is used for appetizers or salad.'),
  ('Bread Plate', 'จานขนมปัง', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '🍞', '/bred pleɪt/', 'วางขนมปังและเนย', 'The bread plate is placed on the left side of the setting.'),
  ('Saucer', 'จานรองถ้วยชา', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '☕', '/ˈsɔːsər/', 'รองถ้วยชาและกาแฟ', 'Place the cup neatly on the saucer.'),
  ('Soup Bowl', 'ถ้วยซุป', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '🥣', '/suːp bəʊl/', 'ใส่ซุป', 'The soup bowl is used for serving hot soup.'),
  ('Coffee Cup', 'ถ้วยกาแฟ', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '☕', '/ˈkɒfi kʌp/', 'ใส่กาแฟ', 'We serve freshly brewed coffee in a coffee cup.'),
  ('Tea Cup', 'ถ้วยชา', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '🍵', '/tiː kʌp/', 'ใส่ชา', 'Here is your tea cup for hot Jasmine tea.'),
  ('Dessert Bowl', 'ชามของหวาน', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '🍨', '/dɪˈzɜːt bəʊl/', 'ใส่ของหวาน', 'The dessert bowl is ideal for ice cream and fruits.'),
  ('Sauce Dish', 'ถ้วยน้ำจิ้ม', 'tableware', 'เครื่องใช้บนโต๊ะอาหาร', '🍲', '/sɔːs dɪʃ/', 'ใส่น้ำจิ้ม', 'Pass the sauce dish to the guest.'),

  -- หมวดที่ 2 เครื่องเงินและช้อนส้อม (Flatware / Cutlery)
  ('Dinner Knife', 'มีดอาหารหลัก', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🔪', '/ˈdɪnər naɪf/', 'ตัดอาหารจานหลัก', 'This is a dinner knife. It is used for cutting food.'),
  ('Dinner Fork', 'ส้อมอาหารหลัก', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🍴', '/ˈdɪnər fɔːk/', 'รับประทานอาหารจานหลัก', 'This is a dinner fork. It is used for the main course.'),
  ('Dinner Spoon', 'ช้อนอาหาร', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🥄', '/ˈdɪnər spuːn/', 'รับประทานอาหาร', 'The dinner spoon is used for rice or main food.'),
  ('Soup Spoon', 'ช้อนซุป', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🥄', '/suːp spuːn/', 'รับประทานซุป', 'Use the soup spoon for drinking soup.'),
  ('Butter Knife', 'มีดเนย', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🔪', '/ˈbʌtər naɪf/', 'ทาเนยบนขนมปัง', 'Use the butter knife to spread butter on your bread.'),
  ('Salad Fork', 'ส้อมสลัด', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🥗', '/ˈsæləd fɔːk/', 'รับประทานสลัด', 'The salad fork is slightly smaller than the dinner fork.'),
  ('Fish Knife', 'มีดปลา', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🐟', '/fɪʃ naɪf/', 'รับประทานปลา', 'The fish knife has a special blunt blade for lifting fish bones.'),
  ('Fish Fork', 'ส้อมปลา', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🐟', '/fɪʃ fɔːk/', 'รับประทานปลา', 'Use the fish fork along with the fish knife.'),
  ('Dessert Spoon', 'ช้อนของหวาน', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🍨', '/dɪˈzɜːt spuːn/', 'รับประทานของหวาน', 'The dessert spoon is served with puddings and cakes.'),
  ('Dessert Fork', 'ส้อมของหวาน', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🍰', '/dɪˈzɜːt fɔːk/', 'รับประทานของหวาน', 'Use the dessert fork for fruit or cake.'),
  ('Tea Spoon', 'ช้อนชา', 'cutlery', 'เครื่องเงินและช้อนส้อม', '🥄', '/tiː spuːn/', 'คนชา กาแฟ', 'Stir your hot tea gently with the tea spoon.'),
  ('Coffee Spoon', 'ช้อนกาแฟ', 'cutlery', 'เครื่องเงินและช้อนส้อม', '☕', '/ˈkɒfi spuːn/', 'คนกาแฟเอสเปรสโซ', 'The coffee spoon is designed for small espresso cups.'),

  -- หมวดที่ 3 เครื่องแก้ว (Glassware)
  ('Water Goblet', 'แก้วน้ำเปล่า', 'glassware', 'เครื่องแก้ว', '🍷', '/ˈwɔːtər ˈɡɒblət/', 'ใช้สำหรับบริการน้ำเปล่า', 'Water goblet is filled with ice water.'),
  ('Red Wine Glass', 'แก้วไวน์แดง', 'glassware', 'เครื่องแก้ว', '🍷', '/red waɪn ɡlɑːs/', 'บริการไวน์แดง', 'Red wine glass has a large, round bowl.'),
  ('White Wine Glass', 'แก้วไวน์ขาว', 'glassware', 'เครื่องแก้ว', '🥂', '/waɪt waɪn ɡlɑːs/', 'บริการไวน์ขาว', 'White wine glass is smaller to preserve chilled temperature.'),
  ('Champagne Flute', 'แก้วแชมเปญ', 'glassware', 'เครื่องแก้ว', '🥂', '/ʃæmˈpeɪn fluːt/', 'บริการแชมเปญ', 'Champagne flute keeps bubbles sparkling longer.'),
  ('Cocktail Glass', 'แก้วค็อกเทล', 'glassware', 'เครื่องแก้ว', '🍸', '/ˈkɒkteɪl ɡlɑːs/', 'บริการค็อกเทล', 'Cocktail glass is classic V-shaped glass.'),
  ('Highball Glass', 'แก้วไฮบอล', 'glassware', 'เครื่องแก้ว', '🥤', '/ˈhaɪbɔːl ɡlɑːs/', 'บริการเครื่องดื่มผสม', 'Highball glass is used for long drinks and juices.'),
  ('Rocks Glass', 'แก้วร็อกส์', 'glassware', 'เครื่องแก้ว', '🥃', '/rɒks ɡlɑːs/', 'บริการวิสกี้', 'Rocks glass is used for spirits served on the rocks.'),
  ('Beer Glass', 'แก้วเบียร์', 'glassware', 'เครื่องแก้ว', '🍺', '/bɪər ɡlɑːs/', 'บริการเบียร์', 'Pour beer carefully into the beer glass.'),
  ('Brandy Snifter', 'แก้วบรั่นดี', 'glassware', 'เครื่องแก้ว', '🥃', '/ˈbrændi ˈsnɪf.tər/', 'บริการบรั่นดี', 'Hold the brandy snifter in your palm to warm it.'),
  ('Martini Glass', 'แก้วมาร์ตินี', 'glassware', 'เครื่องแก้ว', '🍸', '/mɑːˈtiːni ɡlɑːs/', 'บริการมาร์ตินี', 'Serve chilled Martini in a martini glass with an olive.'),

  -- หมวดที่ 4 เครื่องลินิน (Linen)
  ('Table Cloth', 'ผ้าปูโต๊ะ', 'linen', 'เครื่องลินิน', '🟫', '/ˈteɪbl klɒθ/', 'ปูโต๊ะอาหาร', 'The table cloth must be clean and unwrinkled.'),
  ('Under Cloth', 'ผ้ารองโต๊ะ', 'linen', 'เครื่องลินิน', '⬛', '/ˈʌndər klɒθ/', 'รองผ้าปูโต๊ะเพื่อลดเสียง', 'Under cloth absorbs noise and softens the table surface.'),
  ('Napkin', 'ผ้าเช็ดปาก', 'linen', 'เครื่องลินิน', '🎗️', '/ˈnæpkɪn/', 'เช็ดปากและตกแต่งโต๊ะ', 'Fold the napkin neatly on the guest plate.'),
  ('Tray Cloth', 'ผ้าคลุมถาด', 'linen', 'เครื่องลินิน', '📐', '/treɪ klɒθ/', 'รองถาดเสิร์ฟกันลื่น', 'Place a tray cloth to prevent glasses from slipping.'),
  ('Glass Cloth', 'ผ้าเช็ดแก้ว', 'linen', 'เครื่องลินิน', '🧺', '/ɡlɑːs klɒθ/', 'เช็ดทำความสะอาดแก้ว', 'Polishing glasses with a lint-free glass cloth.'),
  ('Polishing Cloth', 'ผ้าเช็ดเครื่องเงิน', 'linen', 'เครื่องลินิน', '✨', '/ˈpɒlɪʃɪŋ klɒθ/', 'เช็ดเครื่องเงินและช้อนส้อม', 'Use polishing cloth for shiny flatware.'),

  -- หมวดที่ 5 อุปกรณ์เครื่องปรุง (Condiment Set)
  ('Salt Shaker', 'ขวดเกลือ', 'condiments', 'อุปกรณ์เครื่องปรุง', '🧂', '/sɔːlt ˈʃeɪkər/', 'ใส่เกลือปรุงรส', 'Salt shaker is placed next to pepper shaker.'),
  ('Pepper Shaker', 'ขวดพริกไทย', 'condiments', 'อุปกรณ์เครื่องปรุง', '🌶️', '/ˈpepər ˈʃeɪkər/', 'ใส่พริกไทยปรุงรส', 'Offer fresh pepper shaker to guests.'),
  ('Sugar Bowl', 'โถน้ำตาล', 'condiments', 'อุปกรณ์เครื่องปรุง', '🍯', '/ˈʃʊɡər bəʊl/', 'ใส่น้ำตาล', 'Sugar bowl is served with coffee and tea service.'),
  ('Sauce Bottle', 'ขวดซอส', 'condiments', 'อุปกรณ์เครื่องปรุง', '🍾', '/sɔːs ˈbɒtl/', 'ใส่ซอสปรุงรส', 'Sauce bottle provides extra flavor for meals.'),
  ('Vinegar Bottle', 'ขวดน้ำส้มสายชู', 'condiments', 'อุปกรณ์เครื่องปรุง', '🏺', '/ˈvɪnɪɡər ˈbɒtl/', 'ใส่น้ำส้มสายชู', 'Vinegar bottle is part of salad dressing condiments.'),
  ('Olive Oil Bottle', 'ขวดน้ำมันมะกอก', 'condiments', 'อุปกรณ์เครื่องปรุง', '🫒', '/ˈɒlɪv ɔɪl ˈbɒtl/', 'ใส่น้ำมันมะกอก', 'Serve extra virgin olive oil bottle with bread.'),

  -- หมวดที่ 6 อุปกรณ์บริการอาหาร (Service Equipment)
  ('Service Tray', 'ถาดเสิร์ฟอาหาร', 'service', 'อุปกรณ์บริการอาหาร', '🪞', '/ˈsɜːvɪs treɪ/', 'เสิร์ฟอาหาร', 'Carry food items safely using a service tray.'),
  ('Beverage Tray', 'ถาดเครื่องดื่ม', 'service', 'อุปกรณ์บริการอาหาร', '🍸', '/ˈbevərɪdʒ treɪ/', 'เสิร์ฟเครื่องดื่ม', 'Beverage tray should be held with one hand from below.'),
  ('Round Tray', 'ถาดกลม', 'service', 'อุปกรณ์บริการอาหาร', '⭕', '/raʊnd treɪ/', 'เสิร์ฟอาหารและแก้วน้ำ', 'Round tray is standard for beverage service.'),
  ('Rectangular Tray', 'ถาดสี่เหลี่ยม', 'service', 'อุปกรณ์บริการอาหาร', '▭', '/rekˈtæŋɡjələr treɪ/', 'เสิร์ฟอาหารจานใหญ่', 'Rectangular tray carries multiple plates easily.'),
  ('Water Pitcher', 'เหยือกน้ำ', 'service', 'อุปกรณ์บริการอาหาร', '🫖', '/ˈwɔːtər ˈpɪtʃər/', 'เติมน้ำเปล่า', 'Refill guests water glasses with water pitcher.'),
  ('Coffee Pot', 'เหยือกกาแฟ', 'service', 'อุปกรณ์บริการอาหาร', '☕', '/ˈkɒfi pɒt/', 'เสิร์ฟกาแฟร้อน', 'Pour hot coffee carefully from the coffee pot.'),
  ('Tea Pot', 'กาน้ำชา', 'service', 'อุปกรณ์บริการอาหาร', '🫖', '/tiː pɒt/', 'เสิร์ฟชาร้อน', 'Tea pot holds hot water for steeping tea.'),
  ('Ice Bucket', 'ถังน้ำแข็ง', 'service', 'อุปกรณ์บริการอาหาร', '🧊', '/aɪs ˈbʌkɪt/', 'แช่ไวน์และใส่น้ำแข็ง', 'Ice bucket keeps wine bottles nicely chilled.'),
  ('Ice Tong', 'คีมคีบน้ำแข็ง', 'service', 'อุปกรณ์บริการอาหาร', '🥢', '/aɪs tɒŋ/', 'คีบน้ำแข็ง', 'Pick up ice cubes hygienically with ice tong.'),
  ('Wine Opener', 'ที่เปิดไวน์', 'service', 'อุปกรณ์บริการอาหาร', '🍷', '/waɪn ˈəʊpnər/', 'เปิดขวดไวน์', 'Servers should carry a wine opener at all times.'),

  -- หมวดที่ 7 อุปกรณ์สำหรับบริการไวน์และเครื่องดื่ม (Beverage Equipment)
  ('Wine Basket', 'ตะกร้าไวน์', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '🧺', '/waɪn ˈbɑːskɪt/', 'วางขวดไวน์แดงวินเทจ', 'Wine basket presents aged red wine horizontally.'),
  ('Wine Cooler', 'ถังแช่ไวน์', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '🍾', '/waɪn ˈkuːlər/', 'แช่ไวน์ให้เย็น', 'Keep white wine cold in a wine cooler filled with ice.'),
  ('Wine Stopper', 'จุกปิดขวดไวน์', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '🍾', '/waɪn ˈstɒpər/', 'ปิดขวดไวน์เพื่อรักษาคุณภาพ', 'Seal opened wine bottle with a wine stopper.'),
  ('Wine Pourer', 'เครื่องรินไวน์', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '🍷', '/waɪn ˈpɔːrər/', 'รินไวน์ไม่ให้หยดเลอะเทอะ', 'Wine pourer prevents dripping on the tablecloth.'),
  ('Bottle Opener', 'ที่เปิดขวด', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '🍾', '/ˈbɒtl ˈəʊpnər/', 'เปิดฝาขวดเครื่องดื่ม', 'Use bottle opener for soda and beer bottles.'),
  ('Corkscrew', 'ที่เปิดไวน์แบบเกลียว', 'beverage', 'อุปกรณ์บริการเครื่องดื่ม', '🔩', '/ˈkɔːkskruː/', 'ถอดจุกคอร์กขวดไวน์', 'Insert corkscrew into the center of cork.'),

  -- หมวดที่ 8 อุปกรณ์ Gueridon (การบริการด้วยรถเข็น)
  ('Gueridon Trolley', 'รถเข็นบริการ', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '🛒', '/ˈɡerɪdɒn ˈtrɒli/', 'เตรียมและปรุงอาหารต่อหน้าลูกค้าที่โต๊ะ', 'Gueridon trolley is used for side-table cooking service.'),
  ('Spirit Lamp', 'เตาแอลกอฮอล์', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '🔥', '/ˈspɪrɪt læmp/', 'ให้ความร้อนบนรถเข็น', 'Spirit lamp provides flame for flambé dishes.'),
  ('Flambé Pan', 'กระทะฟลอมเบ', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '🍳', '/flɒmˈbeɪ pæn/', 'ทำอาหารฟลอมเบ (ราดเหล้าจุดไฟ)', 'Prepare Crepe Suzette using a flambé pan.'),
  ('Cutting Board', 'เขียงเตรียมอาหาร', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '🪵', '/ˈkʌtɪŋ bɔːd/', 'แล่เนื้อหรือหั่นเตรียมอาหาร', 'Carve roasted meat on a clean cutting board.'),
  ('Chef''s Knife', 'มีดเชฟ', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '🔪', '/ʃefs naɪf/', 'หั่นและตัดแล่ส่วนผสม', 'Chef''s knife cuts meat smoothly for serving.'),
  ('Serving Tong', 'คีมคีบอาหารบริการ', 'gueridon', 'อุปกรณ์บริการด้วยรถเข็น', '🥢', '/ˈsɜːvɪŋ tɒŋ/', 'คีบอาหารเสิร์ฟลูกค้า', 'Transfer food onto guest plates using serving tong.'),

  -- หมวดที่ 9 อุปกรณ์จัดโต๊ะ (Table Setting Accessories)
  ('Candle Holder', 'เชิงเทียน', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '🕯️', '/ˈkændl ˈhəʊldər/', 'วางเทียนตกแต่งโต๊ะอาหาร', 'Candle holder adds romantic atmosphere to dinner.'),
  ('Flower Vase', 'แจกันดอกไม้', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '💐', '/ˈflaʊər vɑːz/', 'ตกแต่งโต๊ะอาหาร', 'Flower vase centerpieces should not block guest eye lines.'),
  ('Table Number', 'ป้ายหมายเลขโต๊ะ', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '🔢', '/ˈteɪbl ˈnʌmbər/', 'ระบุหมายเลขโต๊ะอาหาร', 'Table number helps servers identify guest tables.'),
  ('Menu Card', 'การ์ดเมนู', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '📜', '/ˈmenjuː kɑːd/', 'แสดงรายการอาหารและเครื่องดื่ม', 'Present the menu card from the right side of guest.'),
  ('Charger Plate', 'แผ่นจานรอง', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '📀', '/ˈtʃɑːdʒər pleɪt/', 'รองจานอาหารเพื่อความสวยงาม', 'Charger plate remains on table until main course.'),
  ('Coaster', 'ที่รองแก้ว', 'accessories', 'อุปกรณ์จัดโต๊ะอาหาร', '⭕', '/ˈkəʊstər/', 'รองแก้วเครื่องดื่ม', 'Place a coaster under cold drink glasses.'),

  -- หมวดที่ 10 อุปกรณ์สถานีบริการ (Side Station Equipment)
  ('Sideboard', 'ตู้เก็บอุปกรณ์', 'side_station', 'อุปกรณ์สถานีบริการ', '🗄️', '/ˈsaɪdbɔːd/', 'เก็บสำรองอุปกรณ์บริการ', 'Sideboard holds extra cutlery, napkins and glasses.'),
  ('Cutlery Holder', 'ถังเก็บช้อนส้อม', 'side_station', 'อุปกรณ์สถานีบริการ', '🍴', '/ˈkʌtləri ˈhəʊldər/', 'จัดเก็บช้อนส้อมเป็นหมวดหมู่', 'Keep clean spoons and forks sorted in cutlery holder.'),
  ('Waste Bin', 'ถังขยะบริการ', 'side_station', 'อุปกรณ์สถานีบริการ', '🗑️', '/weɪst bɪn/', 'ทิ้งขยะเศษวัสดุ', 'Keep waste bin hidden inside side station cabinet.'),
  ('Ice Bin', 'ถังเก็บน้ำแข็ง', 'side_station', 'อุปกรณ์สถานีบริการ', '🧊', '/aɪs bɪn/', 'เก็บสำรองน้ำแข็งสะอาด', 'Ice bin stores ice for beverage service.'),
  ('Plate Rack', 'ถาดเก็บจาน', 'side_station', 'อุปกรณ์สถานีบริการ', '🍽️', '/pleɪt ræk/', 'จัดเก็บจานอาหาร', 'Stack clean plates carefully in the plate rack.'),
  ('Linen Basket', 'ตะกร้าเก็บผ้า', 'side_station', 'อุปกรณ์สถานีบริการ', '🧺', '/ˈlɪnɪn ˈbɑːskɪt/', 'เก็บผ้าเช็ดปากและผ้าปูโต๊ะที่ใช้แล้ว', 'Place used napkins in the linen basket.')

ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  category_th = EXCLUDED.category_th,
  use_desc = EXCLUDED.use_desc,
  sentence = EXCLUDED.sentence,
  pronounce = EXCLUDED.pronounce,
  updated_at = NOW();

-- 5. ซิงค์คำศัพท์เข้าตาราง ai_scan_items สำหรับระบบ AI Vision สแกนอัตโนมัติ
INSERT INTO ai_scan_items (name_en, name_th, category, description, service_tips, pronounce, sentence)
SELECT 
  v.name_en, 
  v.name_th, 
  v.category, 
  v.use_desc, 
  v.sentence, 
  v.pronounce, 
  v.sentence
FROM vocabulary_items v
ON CONFLICT (name_en) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  service_tips = EXCLUDED.service_tips,
  pronounce = EXCLUDED.pronounce,
  sentence = EXCLUDED.sentence;
