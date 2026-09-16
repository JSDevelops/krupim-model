-- Migration 018: Add Week 2 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 2: Food and Beverage Vocabulary & Menu Classification
INSERT INTO fine_lesson_plans (
  id,
  title,
  subject,
  level,
  term,
  duration,
  target_class,
  weeks,
  concept,
  objectives_k,
  objectives_s,
  objectives_a,
  objectives_ap,
  vocabulary,
  sentences,
  activities_lead,
  activities_f,
  activities_i,
  activities_n,
  activities_e,
  activities_wrap,
  teacher_name,
  teacher_email,
  teacher_id,
  class_id,
  publication_status,
  published_at
)
VALUES (
  'lesson-plan-week-2',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 2: Food and Beverage Vocabulary & Menu Classification',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'สัปดาห์ที่ 2',
  'การที่ผู้เรียนมีความรู้เข้าใจเกี่ยวกับคำศัพท์ในงานบริการอาหารและเครื่องดื่ม ตลอดจนสามารถจำแนกประเภทของเมนูได้อย่างถูกต้องนั้น ถือเป็นสมรรถนะหลักที่พนักงานบริการอาหารและเครื่องดื่มต้องใช้ในการปฏิบัติงาน ในธุรกิจโรงแรมและภัตตาคาร ซึ่งการจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยี Augmented Reality (AR) 3D และ Artificial Intelligence (AI) ได้แก่ AI Scan และระบบ Gemini ตลอดจนการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อพัฒนาผู้เรียนให้มีทักษะการวิเคราะห์จำแนกประเภทเมนู และพัฒนาทักษะการออกเสียงคำศัพท์ชื่ออาหาร และเครื่องดื่ม ได้อย่างถูกต้องตามมาตรฐานคุณวุฒิวิชาชีพ',
  '[
    "บอกชื่อ และระบุคำศัพท์เกี่ยวกับอาหารและเครื่องดื่ม เป็นภาษาอังกฤษได้ถูกต้อง",
    "อธิบายและจำแนกประเภทของอาหาร (Appetizers, Main Courses, Desserts) ได้อย่างถูกต้อง",
    "อธิบายและจำแนกประเภทของเครื่องดื่ม (Non-Alcoholic, Hot/Cold Beverages) ได้อย่างถูกต้อง"
  ]'::jsonb,
  '[
    "ออกเสียงคำศัพท์ชื่ออาหาร เครื่องดื่ม และพูดประโยคที่ใช้สื่อสารผ่านระบบ AI ได้ถูกต้อง",
    "ใช้เทคโนโลยี AR เพื่อสแกน และศึกษาโมเดลเมนูอาหารเสมือนจริง 3D ได้อย่างคล่องแคล่ว",
    "จัดหมวดหมู่และแยกประเภทรายการอาหารและเครื่องดื่ม ลงในเล่มเมนูห้องอาหารจำลอง (Simulation) ได้อย่างถูกต้องตามหลักสากล"
  ]'::jsonb,
  '[
    "ความรับผิดชอบ และวินัยในการปฏิบัติงาน",
    "ความกล้าแสดงออก และมั่นใจในการใช้ภาษาอังกฤษเพื่อการสื่อสาร",
    "ทักษะการทำงานร่วมกับผู้อื่น ทำงานเป็นทีม (Teamwork)",
    "เจตคติที่ดีต่อวิชาชีพการโรงแรม และมีใจรักงานบริการ (Service Mind)"
  ]'::jsonb,
  '[
    "เลือกและจัดหมวดหมู่ เมนูอาหาร และเครื่องดื่ม ได้ถูกต้องตามมาตรฐานสากล",
    "จัดระเบียบเล่มเมนูอาหาร ตามหลักการให้บริการของห้องอาหารจริงได้อย่างถูกต้อง",
    "ประยุกต์ใช้คำศัพท์ภาษาอังกฤษ ในการบอกประเภทอาหารและเครื่องดื่มในสถานการณ์จำลองได้"
  ]'::jsonb,
  '[
    "Caesar Salad",
    "Garlic Bread",
    "Spring Rolls",
    "Mushroom Soup",
    "Grilled Ribeye Steak",
    "Salmon Fillet",
    "Spaghetti Carbonara",
    "Roasted Chicken",
    "Chocolate Lava Cake",
    "Tiramisu",
    "Panna Cotta",
    "Ice Cream Vanilla",
    "Mineral Water",
    "Orange Juice",
    "Soft Drinks",
    "Virgin Mojito",
    "Espresso",
    "Cappuccino",
    "Iced Americano",
    "Hot Green Tea"
  ]'::jsonb,
  '[
    "Caesar Salad is categorized as an appetizer.",
    "Spaghetti Carbonara is categorized as a main course.",
    "Chocolate Lava Cake is categorized as a dessert.",
    "Virgin Mojito belongs to non-alcoholic beverages.",
    "We serve Virgin Mojito as a refreshing mocktail.",
    "Espresso belongs to hot beverages.",
    "How is Caesar Salad categorized? - Caesar Salad is categorized as an appetizer."
  ]'::jsonb,
  '1. ครูเปิดวิดีโอกระตุ้นการเรียนรู้เกี่ยวกับ "เมนูและการจำแนกประเภทอาหารและเครื่องดื่มในโรงแรมระดับ 5 ดาว" เพื่อให้ผู้เรียนเห็นภาพรวมของการจัดประเภทของเมนูอาหาร ได้อย่างเป็นระบบ
2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถาม เพื่อเชื่อมโยงประสบการณ์เดิมของผู้เรียน:
   - "ถ้าห้องอาหารนำเมนู Steak ของคาว ไปปนอยู่ในหมวดของหวาน (Desserts) จะเกิดผลกระทบอย่างไรต่อการทำงานของพนักงานและการสั่งอาหารของลูกค้า?"
   - "ทำไมในเมนูสากลต้องแยกหมวดหมู่เครื่องดื่มไม่มีแอลกอฮอล์ (Non-Alcoholic) ออกจากหมวดหมู่อื่นๆ ให้ชัดเจน?"
3. ผู้เรียนร่วมกันแชร์ความคิดเห็น ครูสรุปเชื่อมโยงเข้าสู่วัตถุประสงค์การเรียนรู้ในสัปดาห์นี้',
  'ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี AR 3D Objects (60 นาที)
1. ครูแจก Worksheet คำศัพท์อาหารและเครื่องดื่มประจำสัปดาห์
2. ผู้เรียนใช้ Smartphone/Tablet สแกน QR Code เพื่อเปิดระบบ AR Learning สแกนดูโมเดลอาหารและเครื่องดื่มเสมือนจริง 3D แบบรอบด้าน
3. ผู้เรียนจับคู่คำศัพท์ภาษาอังกฤษกับโมเดล 3D ที่พบบนระบบลงในช่องตามหมวดหมู่ (Appetizer, Main Course, Dessert, Beverage) บน Worksheet
4. ภารกิจ AI Scan Learning: ผู้เรียนใช้ฟีเจอร์ AI Scan สแกนภาพหรือโมเดลอาหารและเครื่องดื่มจำลองในห้องปฏิบัติการเพื่อวิเคราะห์ เช่น Spaghetti Carbonara, Caesar Salad, Virgin Mojito จากนั้นทำการศึกษาข้อมูลด้านวิชาชีพ, คำศัพท์, ตัวอย่างประโยค และตัวอย่างบทสนทนาการเสิร์ฟ ที่ระบบแสดง แล้วบันทึกผลลงใน AI Scan Learning Record',
  'การปฏิสัมพันธ์ผ่านเทคโนโลยี AI Support (50 นาที)
1. ครูมอบหมายภารกิจฝึกออกเสียงและแต่งประโยคระบุประเภทอาหาร โดยใช้ผ่าน web app FINE Model
2. ผู้เรียนฝึกออกเสียงคำศัพท์และฝึกพูดประโยคแสดงการจำแนกประเภทเมนูตามโครงสร้าง:
   - "Spaghetti Carbonara is categorized as a main course."
   - "Virgin Mojito belongs to non-alcoholic beverages."
3. Pair Work กิจกรรมคู่: ผู้เรียนจับคู่ผลัดกันสุ่มหยิบการ์ดเมนูอาหารและเครื่องดื่มขึ้นมา จากนั้นฝึกถาม-ตอบ และออกเสียงผ่าน Voice Command โดยมีระบบ AI คอยตรวจสอบและให้คำแนะนำ (AI Feedback ผ่าน web app FINE Model) ในเรื่องของสำเนียง ความถูกต้อง และการเน้นเสียง (Stress)
   - A: "How is Caesar Salad categorized?"
   - B: "Caesar Salad is categorized as an appetizer."',
  'การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)
1. ครูแบ่งผู้เรียนออกเป็นทีม ทีมละ 4-5 คน เพื่อเข้าร่วมกิจกรรมจำลองสถานการณ์ “The Menu Master Challenge” (เกมแข่งจัดระเบียบเมนูห้องอาหาร)
2. สถานการณ์จำลอง: ครูแจกชุดการ์ดรายการอาหารและเครื่องดื่มภาษาอังกฤษแบบผสมกัน (คละหมวดหมู่) และบอร์ดจำลองโครงสร้างเมนูร้านอาหาร (Restaurant Menu Board) ให้แก่แต่ละกลุ่ม
3. ผู้เรียนในทีมต้องระดมสมอง ร่วมกันวิเคราะห์ และคัดแยกรายการการ์ดเหล่านั้นไปจัดหมวดหมู่ลงบนบอร์ดให้ถูกต้องตามตำแหน่งโครงสร้างบริการสากล (Appetizers -> Main Courses -> Desserts -> Beverages) ภายในเวลาที่จำกัด
4. ครูเพิ่มความท้าทายโดยสอดแทรก "เมนูแปลกใหม่หรือเมนูฟิวชั่น" ในระหว่างทำกิจกรรม เพื่อให้แต่ละทีมได้ใช้ทักษะการคิดวิเคราะห์ ค้นหาข้อมูล และแก้ไขปัญหาเฉพาะหน้าอย่างเป็นระบบ',
  'การลงมือปฏิบัติจริง (35 นาที)
1. แต่ละทีมส่งตัวแทนออกนำเสนอผลงานการจัดเล่มเมนูจำลองภาษาอังกฤษ โดยอธิบายหลักการแบ่งหมวดหมู่และชื่อเมนูพิเศษ ประจำกลุ่มให้ครูและเพื่อนร่วมชั้นฟัง
2. ผู้เรียนทุกคนทำ Quiz ทดสอบความรู้เกี่ยวกับคำศัพท์และความแม่นยำ ในการจำแนกประเภทเมนูเป็นรายบุคคล ผ่าน web app FINE Model
3. ครูประเมินสมรรถนะการปฏิบัติงาน (Performance Assessment) รายกลุ่ม และรายบุคคลด้วยเกณฑ์ Rubrics',
  'ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)
1. Reflection: ครูและผู้เรียนร่วมกันสรุปหลักการสำคัญของการจำแนกประเภทเมนู (Menu Classification) และประโยชน์ของระบบ AI (ผ่าน web app FINE Model) ที่ช่วยให้การออกเสียงคำศัพท์ยากๆ เป็นเรื่องง่ายและจำได้
2. ผู้เรียนทำกิจกรรม Exit Ticket: พิมพ์หรือเขียนสรุปองค์ประกอบของเมนู โดยยกตัวอย่างชื่ออาหารจานหลัก 2 เมนู, ของหวาน 2 เมนู และเครื่องดื่ม 1 เมนู เป็นภาษาอังกฤษส่งครูก่อนออกจากห้องเรียน',
  'ครูพิมพ์',
  'krupim@ktc.ac.th',
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  'published',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    subject = EXCLUDED.subject,
    level = EXCLUDED.level,
    term = EXCLUDED.term,
    duration = EXCLUDED.duration,
    target_class = EXCLUDED.target_class,
    weeks = EXCLUDED.weeks,
    concept = EXCLUDED.concept,
    objectives_k = EXCLUDED.objectives_k,
    objectives_s = EXCLUDED.objectives_s,
    objectives_a = EXCLUDED.objectives_a,
    objectives_ap = EXCLUDED.objectives_ap,
    vocabulary = EXCLUDED.vocabulary,
    sentences = EXCLUDED.sentences,
    activities_lead = EXCLUDED.activities_lead,
    activities_f = EXCLUDED.activities_f,
    activities_i = EXCLUDED.activities_i,
    activities_n = EXCLUDED.activities_n,
    activities_e = EXCLUDED.activities_e,
    activities_wrap = EXCLUDED.activities_wrap,
    teacher_name = EXCLUDED.teacher_name,
    teacher_email = EXCLUDED.teacher_email,
    teacher_id = EXCLUDED.teacher_id,
    class_id = EXCLUDED.class_id,
    publication_status = EXCLUDED.publication_status,
    published_at = EXCLUDED.published_at,
    updated_at = NOW();

-- 2. Insert Week 2 Assignments for ครูพิมพ์
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-222222222201',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'สัปดาห์ที่ 2 [F]: ใบงาน Worksheet & AI Scan รายการอาหารและเครื่องดื่ม 20 ชนิด',
  'ให้นักเรียนสแกนดูโมเดล 3D และทำใบงานจับคู่คำศัพท์ประเภทอาหารและเครื่องดื่ม (Appetizers, Main Courses, Desserts, Beverages) จำนวน 20 ชนิด พร้อมใช้ฟีเจอร์ AI Scan สแกนภาพหรือโมเดลอาหารจำลองและบันทึกผลลงใน AI Scan Learning Record',
  'Familiarize',
  20,
  NOW() + interval '14 days',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    activity_type = EXCLUDED.activity_type,
    max_score = EXCLUDED.max_score,
    due_date = EXCLUDED.due_date;

-- I: Interact
INSERT INTO assignments (
  id, class_id, teacher_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-222222222202',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'สัปดาห์ที่ 2 [I]: ฝึกพูดและแต่งประโยคจำแนกประเภทเมนูอาหารกับ AI Voice',
  'ให้นักเรียนฝึกออกเสียงคำศัพท์และพูดประโยคจำแนกประเภทเมนูตามโครงสร้าง "[Dish/Drink Name] is categorized as [Category]." ผ่านระบบ AI Voice เพื่อรับคำแนะนำด้านสำเนียง ความถูกต้อง และการเน้นเสียง (Stress)',
  'Interact',
  20,
  NOW() + interval '14 days',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    activity_type = EXCLUDED.activity_type,
    max_score = EXCLUDED.max_score,
    due_date = EXCLUDED.due_date;

-- N: Navigate
INSERT INTO assignments (
  id, class_id, teacher_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-222222222203',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'สัปดาห์ที่ 2 [N]: ภารกิจจำลองการจัดระเบียบเมนูห้องอาหาร The Menu Master Challenge',
  'ให้นักเรียนร่วมกันจัดหมวดหมู่และคัดแยกรายการอาหารและเครื่องดื่มลงบนบอร์ดจำลองโครงสร้างเมนูห้องอาหาร (Restaurant Menu Board) ตามมาตรฐานสากล (Appetizers -> Main Courses -> Desserts -> Beverages) พร้อมวิเคราะห์เมนูฟิวชั่น',
  'Navigate',
  20,
  NOW() + interval '14 days',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    activity_type = EXCLUDED.activity_type,
    max_score = EXCLUDED.max_score,
    due_date = EXCLUDED.due_date;

-- E: Exhibit
INSERT INTO assignments (
  id, class_id, teacher_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-222222222204',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'สัปดาห์ที่ 2 [E]: กิจกรรม Exit Ticket สรุปองค์ประกอบเมนู และ Quiz ประจำสัปดาห์ที่ 2',
  'ให้นักเรียนทำ Quiz ทดสอบความรู้เรื่องการจำแนกประเภทเมนูอาหารและเครื่องดื่ม พร้อมพิมพ์สรุปองค์ประกอบเมนูอาหารจานหลัก 2 เมนู, ของหวาน 2 เมนู และเครื่องดื่ม 1 เมนู เป็นภาษาอังกฤษในกิจกรรม Exit Ticket',
  'Exhibit',
  20,
  NOW() + interval '14 days',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    activity_type = EXCLUDED.activity_type,
    max_score = EXCLUDED.max_score,
    due_date = EXCLUDED.due_date;

COMMIT;
