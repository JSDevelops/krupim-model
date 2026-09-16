-- Migration 028: Add Week 12 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 12: Handling Special Requests (6.1 Handling Special Requests)
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
  'lesson-plan-week-12',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 12: Handling Special Requests (6.1 Handling Special Requests: การจัดการคำขอพิเศษเกี่ยวกับอาหารและการบริการ)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 12',
  'การจัดการคำขอพิเศษของลูกค้า (Handling Special Requests) ทั้งในด้านอาหารและการบริการ ถือเป็นองค์ประกอบสำคัญในการส่งมอบการบริการที่เหนือความคาดหมาย และเป็นไปตามมาตรฐานการปฏิบัติงานของโรงแรมระดับสากล พนักงานบริการต้องมีความรู้ในหลักการจัดการคำขอ รูปประโยคสำนวนภาษาอังกฤษในการตอบรับหรือปฏิเสธอย่างสุภาพ ตลอดจนการประสานงานร่วมกับฝ่ายที่เกี่ยวข้อง การจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยีการสแกนด้วยปัญญาประดิษฐ์ (AI Scan) ระบบคิดวิเคราะห์และโต้ตอบอัจฉริยะ (Gemini และ Gemini Live) ควบคู่กับการจำลองสถานการณ์ (Simulation-Based Learning) ผ่าน web app FINE Model เพื่อเสริมสร้างสมรรถนะการแก้ไขปัญหาเฉพาะหน้าและการสื่อสารอย่างมืออาชีพ',
  '[
    "อธิบายประเภทและหลักการจัดการคำขอพิเศษเกี่ยวกับอาหารและการบริการตามมาตรฐานวิชาชีพโรงแรมได้",
    "ระบุโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการตอบรับ ปฏิเสธ หรือขอตรวจสอบคำขอพิเศษได้อย่างถูกต้อง",
    "อธิบายขั้นตอนการประสานงานระหว่างแผนกบริการและแผนกครัวเมื่อได้รับคำขอพิเศษจากลูกค้าได้"
  ]'::jsonb,
  '[
    "สื่อสารภาษาอังกฤษโต้ตอบเพื่อจัดการคำขอพิเศษของลูกค้าได้อย่างถูกต้อง",
    "ใช้เทคโนโลยีผ่าน web app FINE Model ในการสืบค้นข้อมูลและฝึกปฏิบัติจำลองบทบาทสมมติได้",
    "บันทึกคำขอพิเศษลงในระบบจดออเดอร์และส่งต่อข้อมูลในสถานการณ์จำลองได้"
  ]'::jsonb,
  '[
    "จิตบริการและความยืดหยุ่นในการปฏิบัติงานเพื่อตอบสนองความต้องการของลูกค้า (Service Mind & Flexibility)",
    "ความรอบคอบและใส่ใจรายละเอียดส่วนบุคคลของลูกค้า",
    "ความมั่นใจและความมีสติในการแก้ไขปัญหาเฉพาะหน้า"
  ]'::jsonb,
  '[
    "ประยุกต์ใช้ทักษะการเจรจาและสำนวนบริการภาษาอังกฤษในการเสนอทางเลือกอื่นเมื่อไม่สามารถตอบรับคำขอของลูกค้าได้",
    "บูรณาการความรู้เรื่องคำขอพิเศษเพื่อจัดเตรียมอุปกรณ์หรือประสานงานหน้างานได้อย่างถูกต้องไร้ข้อผิดพลาด",
    "บูรณาการความรู้และไหวพริบในการควบคุมบทสนทนาเพื่อหาทางออกที่ดีที่สุดให้แก่ลูกค้า"
  ]'::jsonb,
  '[
    {"word": "Special Requests", "meaning": "คำขอพิเศษจากลูกค้าด้านอาหารและการบริการ"},
    {"word": "Vegetarian", "meaning": "อาหารมังสวิรัติ (ละเว้นเนื้อสัตว์แต่ทานไข่/นมได้)"},
    {"word": "Vegan", "meaning": "อาหารเจบริสุทธิ์ (ละเว้นเนื้อสัตว์และผลผลิตจากสัตว์ทั้งหมด)"},
    {"word": "Gluten-free", "meaning": "อาหารที่ไม่มีกลูเตน (สำหรับผู้แพ้โปรตีนในข้าวสาลี)"},
    {"word": "Low-sodium", "meaning": "อาหารที่มีปริมาณโซเดียมต่ำ / ลดเค็ม"},
    {"word": "Dressing on the side", "meaning": "แยกน้ำสลัดใส่ถ้วยต่างหาก"},
    {"word": "Extra cutlery", "meaning": "ขอชุดช้อนส้อมหรืออุปกรณ์รับประทานอาหารเพิ่ม"},
    {"word": "Wheelchair accessible table", "meaning": "โต๊ะที่จัดไว้รองรับลูกค้ารถเข็นผู้พิการ"},
    {"word": "High chair for a baby", "meaning": "เก้าอี้สูงสำหรับเด็กเล็ก"},
    {"word": "Dietary Requirements", "meaning": "ข้อกำหนดหรือข้อจำกัดด้านโภชนาการและสุขภาพ"},
    {"word": "Polite Refusal", "meaning": "การปฏิเสธคำขออย่างสุภาพและนุ่มนวล"},
    {"word": "Alternative Suggestion", "meaning": "การนำเสนอทางเลือกหรือเมนูอื่นทดแทน"}
  ]'::jsonb,
  '[
    "Certainly, sir/madam. We can definitely arrange that for you.",
    "No problem at all, I will inform the chef to prepare your dish with no added salt.",
    "Please allow me to check with the kitchen first.",
    "I am afraid we cannot substitute this ingredient, but may I suggest our delicious [Alternative Dish] instead?"
  ]'::jsonb,
  '[
    "ครูจัดกิจกรรม ''ความต้องการที่แตกต่าง'' โดยแจกกระดาษโน้ตสีให้ผู้เรียนสมมติตนเองเป็นแขกวีไอพีที่มีความต้องการแปลกๆ หรือเงื่อนไขในการทานอาหารที่จำกัดคนละ 1 ข้อ",
    "กิจกรรมกระตุ้นคิด (Brainstorming): ครูเลือกโน้ตบางใบขึ้นมาอ่านแล้วถามผู้เรียนว่า: ''ถ้าเจอคำขอที่ยากหรือนอกเหนือจากเมนูแบบนี้ พนักงานเสิร์ฟควรทำอย่างไรระหว่างปฏิเสธทันทีกับตอบรับโดยการขาดการวิเคราะห์ก่อน?'' และ ''คำพูดภาษาอังกฤษคำไหนที่จะช่วยให้ลูกค้ารู้สึกว่าเรากำลังพยายามช่วยเหลือเขาอย่างเต็มที่?''",
    "ผู้เรียนร่วมกันแสดงความคิดเห็น ครูเชื่อมโยงเข้าสู่วัตถุประสงค์การเรียนรู้เรื่องการจัดการคำขอพิเศษ"
  ]'::jsonb,
  '[
    "F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)",
    "ครูให้ผู้เรียนสแกน QR Code Learning Access เพื่อเปิดระบบ Flowchart Interactive เรื่อง ''ขั้นตอนการรับและการจัดการคำขอพิเศษ (Special Request Protocol)''",
    "ผู้เรียนใช้ฟังก์ชัน AI Scan ผ่าน web app FINE Model สแกนดูรายการส่วนผสมบนแผ่นเมนูจำลอง เพื่อศึกษาคำศัพท์เฉพาะกลุ่มอาหารทางเลือก (Dietary Requirements) และตัวอย่างประโยคบริการ แล้วบันทึกข้อมูลที่พบลงใน AI Scan Learning Record",
    "ผู้เรียนจับคู่กันทำใบงานคัดแยกประเภทคำขอพิเศษ (Food vs Service Requests) และฝึกออกเสียงสำนวนภาษาอังกฤษในการตอบรับตามผังจำลอง"
  ]'::jsonb,
  '[
    "I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model เพื่อฝึกทักษะทางการออกเสียง (50 นาที)",
    "ผู้เรียนเข้าใช้งานแอปพลิเคชัน ผ่าน web app FINE Model บนอุปกรณ์ดิจิทัลส่วนตัว",
    "ภารกิจที่ 1 (Dietary Request Mode): ผู้เรียนป้อน Prompt คำสั่งให้ Gemini ผ่าน web app FINE Model สวมบทบาทเป็นลูกค้าที่ทานอาหารมังสวิรัติแบบเคร่งครัด (Vegan) และต้องการสั่งอาหารชุดเฉพาะ โดยผู้เรียนต้องใช้ระบบ Gemini Live ผ่าน web app FINE Model สนทนาโต้ตอบ แนะนำเมนูที่เหมาะสม และใช้คำตอบรับที่สุภาพ",
    "ภารกิจที่ 2 (Service Constraint Challenge): ตั้งโจทย์ให้ Gemini ผ่าน web app FINE Model แกล้งขอคำขอที่ห้องอาหารไม่สามารถให้ได้ (เช่น ขอนั่งโต๊ะริมหน้าต่างที่ถูกจองเต็มแล้ว) ผู้เรียนต้องฝึกฟังและใช้ฟังก์ชันเสียงผ่าน Gemini Live ผ่าน web app FINE Model พูดปฏิเสธอย่างสุภาพ และเสนอทางเลือกใหม่",
    "ผู้เรียนประเมินผลการออกเสียงของตนเองและจดบันทึกสำนวนเด็ดลงใน AI Learning Record ผ่าน web app FINE Model"
  ]'::jsonb,
  '[
    "N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)",
    "ครูแบ่งพื้นที่ห้องปฏิบัติการจำลอง (Simulation Area) เป็นโต๊ะอาหารสถานการณ์ต่างๆ",
    "ผู้เรียนแบ่งกลุ่มเข้าประจำการ โดยครูแจกบทบาทสมมติ (Role-play Cards) ที่ซ่อนเงื่อนไขพิเศษท้าทาย เช่น ''ลูกค้าต้องการสเต็กที่ไม่มีเนยและน้ำมันเลยเนื่องจากปัญหาสุขภาพ'' หรือ ''ลูกค้ามาพร้อมรถเข็นผู้พิการและต้องการย้ายโต๊ะด่วน''",
    "ผู้เรียนในกลุ่มต้องใช้ทักษะการฟัง ดึงสำนวนที่ฝึกกับ Gemini ผ่าน web app FINE Model มาใช้เจรจาต่อหน้า และบันทึกคำขอพิเศษลงในใบออเดอร์พร้อมทำสัญลักษณ์ส่งต่อข้อมูลให้แผนกครัวและทีมบริการได้อย่างถูกต้อง",
    "ครูคอยสังเกตการณ์ แจ้งปัญหาเพิ่ม และให้คำแนะนำด้านการแสดงออกทางบุคลิกภาพ"
  ]'::jsonb,
  '[
    "E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)",
    "สุ่มตัวแทนกลุ่มออกมาปฏิบัติการรับมือกับคำขอพิเศษในสถานการณ์จำลองสดหน้าชั้นเรียน โดยเน้นความคล่องของภาษา (Fluency) และการแสดงมารยาทที่เหมาะสม",
    "ผู้เรียนทุกคนทำแบบทดสอบออนไลน์ (Quiz) ผ่าน web app FINE Model เพื่อประเมินโครงสร้างประโยคและคำศัพท์เกี่ยวกับคำขอพิเศษ",
    "ครูประเมินสมรรถนะการปฏิบัติงานกลุ่มและรายบุคคลตามเกณฑ์ Rubrics"
  ]'::jsonb,
  '[
    "Reflection: ครูและผู้เรียนร่วมกันสรุปบทเรียน: หัวใจของการจัดการคำขอพิเศษคือความยืดหยุ่นภายใต้ขอบเขตมาตรฐานและความปลอดภัยของแขก",
    "ผู้เรียนทำ Exit Ticket: พิมพ์ข้อความสรุปประโยคภาษาอังกฤษที่ดีที่สุดในการใช้แก้ไขสถานการณ์เมื่อเมนูไม่สามารถปรับเปลี่ยนได้ 1 ประโยค รวมกันก่อนสรุปก่อนสิ้นสุดกิจกรรม"
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

-- 2. Insert or update 4 assignments for Week 12
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-121212121201',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-12',
  'สัปดาห์ที่ 12 [F]: ใบงาน Worksheet จำแนกคำขอพิเศษ (Food vs Service) และ AI Scan เมนูอาหาร',
  'ให้นักเรียนสแกน QR Code เพื่อเปิด Flowchart Interactive ขั้นตอน Special Request Protocol, ใช้ฟังก์ชัน AI Scan สแกนส่วนผสมบนเมนูเพื่อค้นหาคำศัพท์กลุ่มโภชนาการ (Dietary Requirements) และทำใบงานคัดแยกประเภทคำขอพิเศษ พร้อมเติมคำสำนวนบริการ',
  'Familiarize',
  20,
  NOW() + interval '84 days',
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
  'a1111111-1111-4111-8111-121212121202',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-12',
  'สัปดาห์ที่ 12 [I]: ฝึกสนทนาจัดการคำขอพิเศษและการปฏิเสธอย่างสุภาพผ่าน Gemini Live',
  'ให้นักเรียนใช้ Gemini Live ผ่าน web app FINE Model ใน 2 ภารกิจ: 1) Dietary Request Mode แนะนำเมนูสำหรับลูกค้า Vegan เคร่งครัด 2) Service Constraint Challenge ฝึกปฏิเสธคำขอที่ทำไม่ได้อย่างสุภาพพร้อมเสนอทางเลือกใหม่ (Polite Refusal & Alternative Suggestion)',
  'Interact',
  20,
  NOW() + interval '84 days',
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
  'a1111111-1111-4111-8111-121212121203',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-12',
  'สัปดาห์ที่ 12 [N]: สถานการณ์จำลอง Restaurant Simulation รับมือเงื่อนไขคำขอพิเศษท้าทาย',
  'แบ่งกลุ่มสวมบทบาทรับมือคำขอพิเศษจากการ์ดสถานการณ์ (เช่น สเต็กไม่ใส่น้ำมัน/เนยเลย หรือลูกค้ารถเข็นขอย้ายโต๊ะด่วน) บันทึกลงใบออเดอร์พร้อมทำสัญลักษณ์ประสานงานครัวและทีมบริการอย่างถูกต้อง',
  'Navigate',
  20,
  NOW() + interval '84 days',
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
  'a1111111-1111-4111-8111-121212121204',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-12',
  'สัปดาห์ที่ 12 [E]: สาธิตการเจรจาคำขอพิเศษสด, ทำ Quiz ออนไลน์ และ Exit Ticket สำนวนแก้ไขสถานการณ์',
  'สุ่มตัวแทนสาธิตการรับมือคำขอพิเศษสดหน้าชั้นเรียนตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Handling Special Requests และพิมพ์ส่ง Exit Ticket ประโยคภาษาอังกฤษในการแก้ไขสถานการณ์เมื่อไม่สามารถปรับเปลี่ยนเมนูได้ 1 ประโยค',
  'Exhibit',
  20,
  NOW() + interval '84 days',
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
