-- Migration 027: Add Week 11 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 11: Taking Food Orders (5.3 Confirming Orders)
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
  'lesson-plan-week-11',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 11: Taking Food Orders (5.3 Confirming Orders: การตรวจสอบรายการอาหารและเครื่องดื่ม และการทวนสอบยืนยันความถูกต้องตามมาตรฐาน)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 11',
  'การตรวจสอบและยืนยันความถูกต้องของรายการสั่งซื้อ (Confirming Orders) เป็นขั้นตอนสุดท้ายที่มีความสำคัญในกระบวนการรับออเดอร์เพื่อป้องกันข้อผิดพลาดในการสื่อสาร ลดความสูญเสียของวัตถุดิบอาหาร และสร้างความพึงพอใจให้แก่ลูกค้า พนักงานบริการจำเป็นต้องมีความรู้ในรูปประโยคภาษาอังกฤษที่เป็นแบบแผนสำหรับการทวนออเดอร์ การจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยี ผ่าน web app FINE Model และการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อพัฒนาทักษะการฟัง การบันทึก และการยืนยันข้อมูลอย่างถูกต้อง',
  '[
    "อธิบายหลักการ ลำดับขั้นตอน และความสำคัญของการทวนรายการอาหารและเครื่องดื่มได้",
    "ระบุโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการทวนออเดอร์ และการแจ้งระยะเวลาในการรออาหารได้อย่างถูกต้อง",
    "อธิบายสัญลักษณ์และเครื่องหมายมาตรฐานที่ใช้ในการตรวจสอบความถูกต้องบนใบสั่งอาหารได้"
  ]'::jsonb,
  '[
    "ทวนรายการอาหารและเครื่องดื่มเป็นภาษาอังกฤษได้และถูกต้อง",
    "ใช้เทคโนโลยีผ่าน web app FINE Model ในการจำลองบทบาทสมมติเพื่อทวนและตรวจสอบออเดอร์ได้",
    "บันทึก ปรับปรุง และยืนยันความถูกต้องของข้อมูลออเดอร์ในสถานการณ์จำลองได้"
  ]'::jsonb,
  '[
    "ความรอบคอบและความใส่ใจในรายละเอียดคำสั่งซื้อของลูกค้า (Attention to Detail)",
    "ความสุภาพ ให้ข้อมูลชัดเจน และความมั่นใจในการสื่อสาร (Professional Courtesy)",
    "เจตคติที่ดีต่อการรับฟัง และการแก้ไขข้อผิดพลาดในการบริการ"
  ]'::jsonb,
  '[
    "ประยุกต์ใช้ทักษะการทวนออเดอร์เพื่อแก้ไขสถานการณ์เมื่อลูกค้าขอเปลี่ยนแปลงหรือยกเลิกบางรายการได้",
    "ตรวจสอบความถูกต้องของใบสั่งอาหารก่อนส่งต่อเข้าสู่ระบบส่วนครัวได้",
    "บูรณาการทักษะภาษาเพื่อทวนออเดอร์ให้ถูกต้องตามหลัก Zero-Waste Communication ก่อนส่งเข้าแผนกครัว"
  ]'::jsonb,
  '[
    {"word": "Confirming Orders", "meaning": "การตรวจสอบและยืนยันความถูกต้องของรายการสั่งอาหาร"},
    {"word": "Order Slip", "meaning": "ใบสั่งอาหาร / สลิปรายการอาหาร"},
    {"word": "Captain Order Pad", "meaning": "สมุดจดบันทึกคำสั่งซื้อของหัวหน้าพนักงานบริการ"},
    {"word": "Dressing on the side", "meaning": "แยกน้ำสลัดใส่ถ้วยต่างหาก ไม่ราดบนผัก"},
    {"word": "No MSG", "meaning": "ไม่ใส่ผงชูรส"},
    {"word": "Well done", "meaning": "เนื้อสุกทั่วกันทั้งชิ้น"},
    {"word": "Appetizer", "meaning": "อาหารเรียกน้ำย่อย"},
    {"word": "Main Course", "meaning": "อาหารจานหลัก"},
    {"word": "Dessert", "meaning": "ของหวาน"},
    {"word": "Beverage", "meaning": "เครื่องดื่ม"},
    {"word": "Outside-In", "meaning": "ลำดับการบริการและการทวนสอบตามขั้นตอนเสิร์ฟสากล"},
    {"word": "Double-check", "meaning": "การทวนสอบซ้ำสองครั้งเพื่อความแม่นยำ"}
  ]'::jsonb,
  '[
    "May I repeat your order, please?",
    "Let me double-check your order, sir/madam.",
    "For the appetizers, you have one Caesar salad with dressing on the side.",
    "For the main course, we have one medium-rare Ribeye steak, and one Spaghetti Carbonara.",
    "Is there anything else I can get for you?",
    "Your order will be ready in about 15 to 20 minutes. Thank you very much."
  ]'::jsonb,
  '[
    "ครูเปิดคลิปเสียงสั้นจำลองเหตุการณ์พนักงานเสิร์ฟส่งอาหารผิดโต๊ะเนื่องจากจดออเดอร์ผิดพลาดและไม่มีการทวนออเดอร์ เพื่อให้ผู้เรียนเห็นผลกระทบที่เกิดขึ้น",
    "กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเพื่อชวนคิด: ''นักเรียนคิดว่าความเสียหายของการเสิร์ฟอาหารผิดพลาดส่งผลเสียต่อห้องอาหารอย่างไรบ้าง?'' และ ''คำพูดหรือประโยคภาษาอังกฤษแบบไหนที่จะช่วยล้อมคอกไม่ให้เกิดการส่งออเดอร์ผิดพลาดได้?''",
    "ผู้เรียนร่วมกันอภิปราย ครูสรุปประเด็นและนำเข้าสู่บทเรียนเรื่องขั้นตอนในการยืนยันออเดอร์"
  ]'::jsonb,
  '[
    "F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)",
    "ครูให้ผู้เรียนสแกน QR Code Learning Access บนอุปกรณ์ส่วนตัว เพื่อเข้าถึงหน้า Flowchart Interactive web app FINE Model เรื่องลำดับขั้นตอนการตรวจสอบและการทวนสอบออเดอร์ตามมาตรฐานโรงแรม",
    "ผู้เรียนศึกษาใบงานโครงสร้างประโยคภาษาอังกฤษสำหรับการทวนออเดอร์ (Confirming Sentences) รวมถึงเรียนรู้คำศัพท์เชิงเทคนิค เช่น ''Dressing on the side'', ''No MSG'', ''Well done''",
    "ผู้เรียนฝึกจับคู่จัดหมวดหมู่รายการอาหารในเมนูตัวอย่างลงใบงานตามลำดับการเสิร์ฟ (Appetizer -> Main Course -> Dessert -> Beverage) เพื่อสร้างความคุ้นเคยในการจัดระเบียบข้อมูล"
  ]'::jsonb,
  '[
    "I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)",
    "ผู้เรียนเปิดใช้งานแอปพลิเคชัน ผ่าน web app FINE Model บนสมาร์ตโฟน",
    "ภารกิจที่ 1 (Order Checking Mode): ผู้เรียนป้อน Prompt ให้ Gemini ผ่าน web app FINE Model สวมบทบาทเป็นลูกค้าที่สั่งอาหารชุดใหญ่ที่มีเงื่อนไขพิเศษหลายข้อ จากนั้นผู้เรียนใช้ Gemini Live ผ่าน web app FINE Model พูดโต้ตอบเพื่อสรุปและทวนรายการอาหารเหล่านั้นเป็นภาษาอังกฤษให้ถูกต้อง",
    "ภารกิจที่ 2 (Order Modification Challenge): ป้อนคำสั่งให้ Gemini ผ่าน web app FINE Model แกล้งจำลองสถานการณ์เปลี่ยนใจกลางคันในขณะที่พนักงานกำลังทวนออเดอร์ (เช่น ''Actually, change the soup to salad, please.'') ผู้เรียนต้องตั้งสติ ฟัง ปรับแก้ไขในใบบันทึก และพูดทวนสอบรอบสุดท้ายให้ถูกต้อง",
    "ผู้เรียนบันทึกคำศัพท์ สำนวน และข้อแนะนำเรื่องการออกเสียงที่ได้จากระบบลงใน AI Learning Record ผ่าน web app FINE Model"
  ]'::jsonb,
  '[
    "N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)",
    "ครูจัดพื้นที่ห้องปฏิบัติการจำลอง (Restaurant Simulation) โดยแบ่งกลุ่มผู้เรียนเป็นทีมบริการและทีมลูกค้า",
    "ครูแจกการ์ดบทบาทสมมติ (Role-play Cards) ให้ฝั่งลูกค้า ซึ่งจะระบุรายการอาหารที่สั่งมีคำที่ซับซ้อน",
    "ฝั่งพนักงานบริการต้องเข้ามารับออเดอร์ บันทึกข้อมูลอย่างรวดเร็ว และใช้ทักษะการทวนออเดอร์ตามแบบแผน Outside-In ตามลำดับการเสิร์ฟอาหารแต่ละประเภท พร้อมทั้งสรุปเงื่อนไขพิเศษได้",
    "ครูสอดแทรกอุปสรรคหน้างาน เช่น ลูกค้าแกล้งทักท้วงว่ารายการที่พนักงานทวนนั้นไม่ตรงกับที่สั่ง เพื่อทดสอบทักษะการแก้ปัญหาเฉพาะหน้าและการใช้คำพูดที่สุภาพ"
  ]'::jsonb,
  '[
    "E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)",
    "สุ่มตัวแทนกลุ่มออกมาสาธิตการปฏิบัติงานรับออเดอร์และทวนออเดอร์หน้าชั้นเรียน โดยเน้นย้ำความถูกต้องของภาษา การออกเสียง น้ำเสียง และการแจ้งเวลาการรออาหาร",
    "ผู้เรียนทุกคนทำแบบทดสอบออนไลน์ (Quiz) ผ่าน web app FINE Model เพื่อวัดความรู้ความเข้าใจเกี่ยวกับประโยคมาตรฐานในการทวนออเดอร์",
    "ครูประเมินสมรรถนะรายบุคคลและรายกลุ่มผ่านเกณฑ์ Rubrics"
  ]'::jsonb,
  '[
    "Reflection: ครูและผู้เรียนร่วมกันสะท้อนผลการทำกิจกรรม โดยชี้ให้เห็นว่าการทวนออเดอร์ไม่ใช่แค่การทวนคำพูด แต่คือการแสดงความใส่ใจในทุกรายละเอียดของลูกค้า",
    "ผู้เรียนเขียน Exit Ticket ระบุ 3 ประโยคสำคัญที่ต้องใช้ทุกครั้งในการทวนออเดอร์ และ 1 ประสบการณ์ที่ได้เรียนรู้จากการฝึกร่วมกับ Gemini Live ผ่าน web app FINE Model ส่งครูก่อนจบคาบเรียน"
  ]'::jsonb,
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
    published_at = EXCLUDED.published_at;

-- 2. Insert or update 4 assignments for Week 11
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-111111111101',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-11',
  'สัปดาห์ที่ 11 [F]: ใบงาน Worksheet ขั้นตอนและโครงสร้างประโยค Confirming Orders Sheet',
  'ให้นักเรียนสแกน QR Code ศึกษา Flowchart Interactive ลำดับการทวนออเดอร์ ทำใบงานจัดหมวดหมู่ประโยคตามลำดับการเสิร์ฟ (Appetizer -> Main Course -> Dessert -> Beverage) และเติมคำศัพท์เงื่อนไขพิเศษ เช่น Dressing on the side, No MSG',
  'Familiarize',
  20,
  NOW() + interval '77 days',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    activity_type = EXCLUDED.activity_type,
    max_score = EXCLUDED.max_score,
    due_date = EXCLUDED.due_date,
    lesson_plan_id = EXCLUDED.lesson_plan_id;

-- I: Interact
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-111111111102',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-11',
  'สัปดาห์ที่ 11 [I]: ฝึกทักษะการทวนออเดอร์และการรับมือเมื่อลูกค้าเปลี่ยนใจผ่าน Gemini Live',
  'ให้นักเรียนเปิดใช้ Gemini Live ผ่าน web app FINE Model ฝึกซ้อม 2 ภารกิจ: 1) Order Checking Mode ทวนรายการอาหารชุดใหญ่ที่มีเงื่อนไขซับซ้อน 2) Order Modification Challenge รับมือเมื่อ AI เปลี่ยนแปลงออเดอร์กลางคัน พร้อมบันทึกลงใน AI Learning Record',
  'Interact',
  20,
  NOW() + interval '77 days',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    activity_type = EXCLUDED.activity_type,
    max_score = EXCLUDED.max_score,
    due_date = EXCLUDED.due_date,
    lesson_plan_id = EXCLUDED.lesson_plan_id;

-- N: Navigate
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-111111111103',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-11',
  'สัปดาห์ที่ 11 [N]: สถานการณ์จำลอง Restaurant Simulation ทวนออเดอร์แบบ Outside-In',
  'แบ่งกลุ่มสวมบทบาทพนักงานบริการและลูกค้า ฝึกรับออเดอร์และทวนรายการตามแบบแผน Outside-In ตามลำดับอาหาร พร้อมตรวจสอบความถูกต้องบนใบสั่งอาหารจำลอง (Mock Order Sheet) และรับมือสถานการณ์ลูกค้าทักท้วงอย่างสุภาพ',
  'Navigate',
  20,
  NOW() + interval '77 days',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    activity_type = EXCLUDED.activity_type,
    max_score = EXCLUDED.max_score,
    due_date = EXCLUDED.due_date,
    lesson_plan_id = EXCLUDED.lesson_plan_id;

-- E: Exhibit
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-111111111104',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-11',
  'สัปดาห์ที่ 11 [E]: สาธิตการทวนออเดอร์สด, แบบทดสอบออนไลน์ และส่ง Exit Ticket',
  'สุ่มตัวแทนสาธิตการทวนออเดอร์สดหน้าห้องเรียน เน้นน้ำเสียงและความชัดเจนในการแจ้งเวลารออาหาร, ผู้เรียนทุกคนทำ Quiz ออนไลน์เรื่อง Confirming Orders และเขียน Exit Ticket ระบุ 3 ประโยคสำคัญพร้อม 1 ประสบการณ์จาก Gemini Live',
  'Exhibit',
  20,
  NOW() + interval '77 days',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    activity_type = EXCLUDED.activity_type,
    max_score = EXCLUDED.max_score,
    due_date = EXCLUDED.due_date,
    lesson_plan_id = EXCLUDED.lesson_plan_id;

COMMIT;
