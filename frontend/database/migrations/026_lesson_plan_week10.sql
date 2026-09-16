-- Migration 026: Add Week 10 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 10: Taking Food Orders (5.2 Order Taking Simulation)
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
  'lesson-plan-week-10',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 10: Taking Food Orders (5.2 Order Taking Simulation: การจำลองการรับออเดอร์ ณ โต๊ะอาหาร และการรับออเดอร์ทางโทรศัพท์สำหรับบริการในห้องพัก)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 10',
  'การจำลองการรับออเดอร์ (Order Taking Simulation) เป็นทักษะขั้นสูงที่เชื่อมโยงความรู้ทางภาษาเข้ากับการปฏิบัติงานจริงในงานโรงแรม ผู้เรียนจะต้องฝึกฝนทั้งการรับออเดอร์ ณ โต๊ะอาหาร (Restaurant Order) แบบเผชิญหน้า และการรับออเดอร์ทางโทรศัพท์สำหรับบริการในห้องพัก (Room Service Order) ซึ่งต้องอาศัยทักษะการฟังและการสื่อสารที่ชัดเจนโดยไม่มีโอกาสเห็นหน้าลูกค้า การจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยี ผ่าน web app FINE Model รวมถึงการจำลองสถานการณ์เสมือนจริง เพื่อสร้างสมรรถนะการบริการที่เป็นไปตามมาตรฐานสากล',
  '[
    "อธิบายขั้นตอนและโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการรับออเดอร์ ณ โต๊ะอาหารได้ถูกต้อง",
    "อธิบายความแตกต่างและขั้นตอนเฉพาะของการรับออเดอร์ทางโทรศัพท์สำหรับบริการในห้องพักได้",
    "ระบุความหมายของรหัสย่อและระบบบันทึกคำสั่งซื้อของห้องอาหารตามมาตรฐานโรงแรมได้"
  ]'::jsonb,
  '[
    "พูดสื่อสารและโต้ตอบภาษาอังกฤษในบริบทการรับออเดอร์ทั้งแบบต่อหน้าและทางโทรศัพท์ได้อย่างถูกต้อง",
    "ใช้เทคโนโลยีผ่าน web app FINE Model ในการจำลองบทบาทสมมติเพื่อรับออเดอร์ได้",
    "ปฏิบัติทักษะการจดออเดอร์และการประสานงานในห้องปฏิบัติการจำลองได้"
  ]'::jsonb,
  '[
    "น้ำเสียง และภาษาที่สุภาพ (Telephone Courtesy & Hospitality)",
    "สมาธิและความอดทนในการฟังความต้องการของลูกค้าโดยไม่ขัดจังหวะ",
    "เจตคติที่ดีและมีความสุขในการแก้ไขปัญหาให้ลูกค้าในสถานการณ์จริง"
  ]'::jsonb,
  '[
    "ปรับเปลี่ยนระดับภาษาและเทคนิคการขาย (Upselling) ให้เหมาะสมกับช่องทางการรับออเดอร์แต่ละแบบได้",
    "ควบคุมสถานการณ์และแก้ไขข้อขัดข้องเบื้องต้นในขณะรับออเดอร์ทางโทรศัพท์ได้",
    "นำทักษะการบันทึกออเดอร์ไปส่งต่อข้อมูลให้แก่แผนกครัวได้อย่างถูกต้อง"
  ]'::jsonb,
  '[
    {"word": "Restaurant Order", "meaning": "การรับออเดอร์ ณ โต๊ะอาหาร"},
    {"word": "Room Service Order", "meaning": "การรับออเดอร์ทางโทรศัพท์สำหรับบริการในห้องพัก"},
    {"word": "Telephone Courtesy", "meaning": "มารยาทและมาตรฐานการสื่อสารทางโทรศัพท์"},
    {"word": "Upselling", "meaning": "เทคนิคการเชียร์ขายหรือแนะนำเมนูเพิ่มเติม"},
    {"word": "Flowchart", "meaning": "ผังลำดับขั้นตอนการปฏิบัติงานรับออเดอร์"},
    {"word": "Spaghetti Carbonara", "meaning": "สปาเกตตีคาโบนารา"},
    {"word": "Extra cheese", "meaning": "เพิ่มชีสพิเศษ"},
    {"word": "Hold the onions", "meaning": "ไม่ใส่หัวหอม / ละเว้นหัวหอม"},
    {"word": "Order Form", "meaning": "ใบจดบันทึกคำสั่งซื้ออาหาร"},
    {"word": "Double Check", "meaning": "การทบทวนตรวจสอบความถูกต้องของรายการอาหาร"},
    {"word": "Chef''s Special", "meaning": "เมนูอาหารพิเศษประจำวันของเชฟ"},
    {"word": "Room Number", "meaning": "หมายเลขห้องพักของผู้รับบริการ"}
  ]'::jsonb,
  '[
    "Good evening, may I take your order now, please?",
    "May I recommend our chef''s special, the Grilled Salmon?",
    "Room Service, this is [Name] speaking. How may I assist you today, sir/madam?",
    "May I have your room number and your name, please?",
    "Could you please repeat that for me, sir?",
    "Let me double check your order."
  ]'::jsonb,
  '[
    "ครูจัดกิจกรรมทายเสียงจำลอง โดยเปิดไฟล์เสียงเฉพาะบทสนทนาการโทรสั่งอาหารแบบ Room Service ที่มีทั้งเสียงรบกวนและข้อผิดพลาด",
    "กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเพื่อให้ผู้เรียนร่วมกันวิเคราะห์: ''การรับออเดอร์ทางโทรศัพท์ยากกว่าการรับออเดอร์ที่โต๊ะอาหารอย่างไรบ้าง?'' และ ''พนักงานควรทำอย่างไรเมื่อลูกค้าในสายพูดเร็วเกินไปหรือสัญญาณโทรศัพท์ไม่ชัดเจน?''",
    "ผู้เรียนแลกเปลี่ยนความคิดเห็น ครูสรุปเชื่อมโยงเข้าสู่บทเรียนเรื่องการฝึกจำลองสถานการณ์จริง"
  ]'::jsonb,
  '[
    "F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model กับกระบวนการจำลองออเดอร์สองรูปแบบ (60 นาที)",
    "ครูแจกเอกสารผังขั้นตอน (Flowchart) การรับออเดอร์ ณ โต๊ะอาหาร และการรับออเดอร์ Room Service พร้อมทั้งให้ผู้เรียนสแกน QR Code Learning Access เพื่อเข้าถึงหน้า Flowchart Interactive บนอุปกรณ์ส่วนตัว ช่วยให้เห็นการทำงานแบบเป็นลำดับขั้นชัดเจนยิ่งขึ้น",
    "ผู้เรียนแบ่งกลุ่มศึกษาคำศัพท์เฉพาะและสำนวนภาษาอังกฤษที่จำเป็น เช่น ''Spaghetti Carbonara'', ''Extra cheese'', ''Hold the onions'' รวมทั้งสัญลักษณ์ย่อที่ใช้เขียนกำกับลงในใบงาน",
    "ผู้เรียนทดลองจับคู่ซ้อมอ่านบทสนทนาตามผังเพื่อทำความเข้าใจลำดับก่อน-หลังของการบริการ"
  ]'::jsonb,
  '[
    "I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)",
    "ผู้เรียนใช้สมาร์ตโฟนหรือแท็บเล็ตเข้าใช้งานแอปพลิเคชัน Gemini และ Gemini Live ผ่าน web app FINE Model",
    "ภารกิจที่ 1 (Restaurant Mode): ผู้เรียนพิมพ์คำสั่งให้ Gemini ผ่าน web app FINE Model สวมบทบาทเป็นลูกค้าที่นั่งอยู่ที่โต๊ะอาหาร จากนั้นใช้ฟังก์ชัน Gemini Live ผ่าน web app FINE Model พูดคุยแนะนำเมนูและรับออเดอร์อาหารหลัก พร้อมเครื่องเคียง",
    "ภารกิจที่ 2 (Room Service Mode): ผู้เรียนตั้งโจทย์ให้ Gemini ผ่าน web app FINE Model สวมบทบาทเป็นแขกที่พักห้อง 405 และโทรศัพท์มาสั่งอาหารเช้า โดยผู้เรียนต้องหลับตาหรือหันหลังให้หน้าจอเพื่อฝึกทักษะการฟังจากเสียงอย่างเดียวผ่าน Gemini Live ผ่าน web app FINE Model",
    "ผู้เรียนจดบันทึกคำศัพท์เด่นและข้อผิดพลาดที่ AI แนะนำลงใน AI Learning Record ผ่าน web app FINE Model เพื่อนำมาปรับปรุงระบบการออกเสียงของตนเอง"
  ]'::jsonb,
  '[
    "N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง (55 นาที)",
    "ครูจัดพื้นที่ห้องปฏิบัติการออกเป็น 2 โซนหลัก: โซนโต๊ะอาหารห้องอาหารจำลอง (Restaurant Simulation) และโซนเคาน์เตอร์โทรศัพท์บริการห้องพัก (Room Service Station)",
    "ผู้เรียนในแต่ละกลุ่มสลับบทบาทกันเข้าสถานีทดสอบ: 1) สถานีที่ 1 (Restaurant): ฝึกการเดินเข้าไปรับออเดอร์ จัดท่าทางการยืน และเชียร์ขายอาหารจานเคียงเป็นภาษาอังกฤษ 2) สถานีที่ 2 (Room Service): ฝึกการใช้อุปกรณ์โทรศัพท์จำลอง รับสายภายใน 3 ครั้งตามมาตรฐานสากล จดรายละเอียดชื่อแขก หมายเลขห้อง และรายการอาหารลงในใบสั่งซื้อด่วน",
    "ครูสอดแทรกสถานการณ์ท้าทาย เช่น ลูกค้าขอเปลี่ยนส่วนผสมของอาหารกะทันหัน เพื่อให้ผู้เรียนใช้ไหวพริบปฏิภาณในการตอบโต้"
  ]'::jsonb,
  '[
    "E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)",
    "สุ่มตัวแทนกลุ่มออกมาปฏิบัติการรับออเดอร์สดในแต่ละโซน โดยครูและเพื่อนร่วมชั้นร่วมกันสังเกตการณ์",
    "ครูประเมินผลการปฏิบัติงานรายบุคคลและรายกลุ่มผ่านเกณฑ์คะแนนแบบ Rubrics",
    "ผู้เรียนทุกคนทำแบบทดสอบควิซออนไลน์ผ่าน web app FINE Model รายบุคคลเพื่อทบทวนประโยคและคำถามสำคัญที่พนักงานบริการ"
  ]'::jsonb,
  '[
    "Reflection: ครูและผู้เรียนร่วมกันสรุปบทเรียนร่วมกันชี้ให้เห็นความสำคัญของการใช้น้ำเสียง (Tone of Voice) ในการคุยโทรศัพท์ และการสบตาในการรับออเดอร์หน้าโต๊ะ",
    "ผู้เรียนส่งใบประเมิน Exit Ticket: ระบุ 1 สิ่งที่ตนเองคิดว่าต้องปรับปรุงในการฟังภาษาอังกฤษ และ 1 ประโยคเด็ดที่ใช้ Upselling ได้สำเร็จส่งครูก่อนเลิกคาบ"
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

-- 2. Insert or update 4 assignments for Week 10
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-101010101001',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-10',
  'สัปดาห์ที่ 10 [F]: ใบงาน Worksheet โครงสร้าง Order Taking Simulation (Restaurant & Room Service)',
  'ให้นักเรียนศึกษาผังขั้นตอน Flowchart การรับออเดอร์ทั้ง 2 รูปแบบผ่าน QR Code Learning Access ทำใบงานจำแนกสถานการณ์ และเติมคำในโครงสร้างประโยคการรับสาย Room Service และการเชียร์ขาย (Upselling) ให้ถูกต้องสมบูรณ์',
  'Familiarize',
  20,
  NOW() + interval '70 days',
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
  'a1111111-1111-4111-8111-101010101002',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-10',
  'สัปดาห์ที่ 10 [I]: ฝึกสนทนารับออเดอร์ 2 โหมด (Restaurant & Room Service) ผ่าน Gemini Live',
  'ให้นักเรียนใช้ Gemini Live ผ่าน web app FINE Model สวมบทบาทรับออเดอร์หน้าโต๊ะ (Restaurant Mode) และรับสายสั่งอาหารเช้าแบบ Room Service Mode โดยฝึกทักษะการฟังเสียงโดยไม่มองจอ พร้อมบันทึกผลลงใน AI Learning Record',
  'Interact',
  20,
  NOW() + interval '70 days',
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
  'a1111111-1111-4111-8111-101010101003',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-10',
  'สัปดาห์ที่ 10 [N]: สถานการณ์จำลอง SBL สถานี Restaurant และ Room Service Station',
  'ให้นักเรียนสลับบทบาทเข้าปฏิบัติงานจริงใน 2 สถานี: สถานีที่ 1 รับออเดอร์หน้าโต๊ะพร้อมจัดท่ายืนและเชียร์ขาย และสถานีที่ 2 รับสายโทรศัพท์ภายใน 3 ครั้ง จดชื่อ/เลขห้องลงใบสั่งซื้อด่วน พร้อมแก้ปัญหาเมื่อลูกค้าขอเปลี่ยนส่วนผสมกะทันหัน',
  'Navigate',
  20,
  NOW() + interval '70 days',
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
  'a1111111-1111-4111-8111-101010101004',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-10',
  'สัปดาห์ที่ 10 [E]: กิจกรรม Exit Ticket สะท้อนคิดและแบบทดสอบออนไลน์ Order Taking Simulation',
  'สุ่มตัวแทนสาธิตการรับออเดอร์สดทั้ง 2 โซนตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Order Taking Simulation และส่ง Exit Ticket สะท้อนจุดที่ต้องปรับปรุงในการฟังพร้อม 1 ประโยค Upselling ที่ใช้สำเร็จ',
  'Exhibit',
  20,
  NOW() + interval '70 days',
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
