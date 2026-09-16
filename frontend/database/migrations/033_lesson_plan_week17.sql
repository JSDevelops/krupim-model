-- Migration 033: Add Week 17 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 17: Professional Performance (8.1 - 8.6 Core Service Cycle Practice)
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
  'lesson-plan-week-17',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 17: Professional Performance (8.1 - 8.6 Core Service Cycle Practice: การฝึกปฏิบัติบริการครบวงจรและการบริการพิเศษ)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 17',
  'การบูรณาการความรู้และทักษะปฏิบัติในงานบริการอาหารและเครื่องดื่มถือเป็นทักษะสำคัญของการเรียนรู้วิชาชีพการโรงแรม ผู้เรียนจำเป็นต้องนำความรู้ตั้งแต่การต้อนรับ การรับออเดอร์ การเสิร์ฟอาหารและเครื่องดื่ม ตลอดจนทักษะการบริการพิเศษ เช่น บริการอาหารในห้องพัก (Room Service) การบริการแบบรถเข็น (Gueridon Service) และกระบวนการเรียกเก็บเงิน (Billing) มาประยุกต์ใช้ร่วมกันอย่างเป็นระบบ การจัดการเรียนรู้สัปดาห์นี้ใช้รูปแบบ FINE Model ร่วมกับเทคโนโลยีการจำลองสถานการณ์เสมือนจริง (Restaurant Simulation) ผ่าน web app FINE Model เพื่อทดสอบและขัดเกลาสมรรถนะผู้เรียนให้ก้าวไปสู่มาตรฐานการทำงานระดับมืออาชีพในสถานการณ์จริงได้',
  '[
    "อธิบายขั้นตอนการบริการอาหารและเครื่องดื่มแบบครบกระบวนการ (Core Service Cycle) ได้ถูกต้อง",
    "อธิบายขั้นตอนการให้บริการแบบ Room Service และ Gueridon Service ได้อย่างถูกต้อง",
    "ระบุโครงสร้างประโยคภาษาอังกฤษในการนำเสนอเอกสารเรียกเก็บเงินและการปิดการบริการได้อย่างถูกต้อง"
  ]'::jsonb,
  '[
    "ปฏิบัติงานบริการอาหาร เครื่องดื่ม บริการบนรถเข็น และบริการในห้องพักตามลำดับขั้นตอนได้อย่างคล่องแคล่ว",
    "สื่อสารภาษาอังกฤษในแต่ละสถานการณ์การบริการได้อย่างถูกต้อง",
    "ใช้งานระบบดิจิทัลและการประสานงานผ่านเทคโนโลยีเพื่อจัดการรายการอาหารและบิลค่าใช้จ่ายได้"
  ]'::jsonb,
  '[
    "บุคลิกภาพที่ดี ถูกต้องตามสุขอนามัยและมาตรฐานวิชาชีพการโรงแรม",
    "ความยืดหยุ่น และการทำงานร่วมกันเป็นทีมในบทบาทที่แตกต่างกันได้",
    "ความใส่ใจในรายละเอียดและจิตวิญญาณแห่งการบริการ"
  ]'::jsonb,
  '[
    "เชื่อมโยงและปรับเปลี่ยนวิธีการบริการตามประเภทของลูกค้าและสถานการณ์ที่เกิดขึ้นจริงในห้องอาหารได้",
    "แก้ไขปัญหาหน้างานด้านกระบวนการเสิร์ฟและขั้นตอนการคิดเงินได้อย่างถูกต้องและสุภาพ",
    "บูรณาการทุกทักษะเพื่อรับมือกับลูกค้าตั้งแต่เดินเข้าร้านจนกระทั่งเดินออกจากร้านในสภาวะจำลองเสมือนจริง"
  ]'::jsonb,
  '[
    {"word": "Core Service Cycle", "meaning": "วงจรการบริการอาหารและเครื่องดื่มแบบครบกระบวนการ"},
    {"word": "Special Services", "meaning": "การให้บริการพิเศษตามมาตรฐานโรงแรม"},
    {"word": "Room Service", "meaning": "การบริการเสิร์ฟอาหารและเครื่องดื่มถึงห้องพัก"},
    {"word": "Gueridon Service", "meaning": "การบริการปรุง ปรุงแต่ง หรือเสิร์ฟอาหารข้างโต๊ะด้วยรถเข็น"},
    {"word": "Billing & Closing", "meaning": "ขั้นตอนการแจ้งยอดบิล การเรียกเก็บเงิน และการปิดการบริการ"},
    {"word": "Tableware", "meaning": "อุปกรณ์บนโต๊ะอาหารครบชุด (จาน ชาม ช้อน ส้อม แก้ว)"},
    {"word": "Greeter", "meaning": "พนักงานต้อนรับและนำทางลูกค้าสู่โต๊ะอาหาร"},
    {"word": "Server", "meaning": "พนักงานเสิร์ฟอาหารและเครื่องดื่ม"},
    {"word": "Gueridon Attendant", "meaning": "พนักงานผู้เชี่ยวชาญการบริการอาหารด้วยรถเข็นข้างโต๊ะ"},
    {"word": "Cashier", "meaning": "พนักงานแคชเชียร์ตรวจสอบบิลและรับชำระเงิน"},
    {"word": "Settle the bill", "meaning": "การชำระหรือเคลียร์ยอดค่าใช้จ่ายในบิล"},
    {"word": "Service Sequence Quiz", "meaning": "แบบทดสอบประเมินความแม่นยำของลำดับขั้นตอนบริการ"}
  ]'::jsonb,
  '[
    "Here is your bill, sir/madam. Whenever you are ready.",
    "How would you like to settle the bill, in cash or by credit card?",
    "Thank you very much for dining with us. We hope to welcome you back soon."
  ]'::jsonb,
  '[
    "ครูเปิดวิดีโอประมวลภาพรวมการแข่งขันระดับมาตรฐานสากล ''WorldSkills Hospitality Service'' เพื่อให้ผู้เรียนเห็นภาพความเป็นมืออาชีพ และความคล่องตัวในทุกขั้นตอนการบริการ",
    "กิจกรรมระดมสมอง (Brainstorming): ครูตั้งคำถามกระตุ้นความคิดเพื่อทบทวนความรู้เดิม: ''ถ้าระหว่างที่เรากำลังเสิร์ฟอาหารจานหลัก แขกโต๊ะข้างๆ เรียกขอเช็คบิลทันที นักเรียนจะจัดลำดับความสำคัญอย่างไร?'' และ ''การบริการแบบรถเข็น Gueridon แตกต่างจากการเสิร์ฟจากถาดปกติในแง่ของความรู้สึกของแขกอย่างไร?''",
    "ผู้เรียนร่วมกันอภิปรายอย่างอิสระ ครูเชื่อมโยงเข้าสู่บทเรียนเรื่องการฝึกปฏิบัติแบบครบกระบวนการ"
  ]'::jsonb,
  '[
    "F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (40 นาที)",
    "ครูแจกใบความรู้เกี่ยวกับ ''Core Service Cycle Map'' ซึ่งเป็นรายละเอียดในการให้บริการ",
    "ผู้เรียนใช้เครื่องมือ AI Scan ผ่าน web app FINE Model สแกนสัญลักษณ์และโจทย์สถานการณ์ เพื่อวิเคราะห์ข้อมูลวิชาชีพ ลำดับก่อน-หลังในการเสิร์ฟ และตรวจสอบประโยคภาษาอังกฤษที่จำเป็นในแต่ละจุดบริการ",
    "ผู้เรียนบันทึกสรุปขั้นตอนการปฏิบัติงานลงใน AI Scan Learning Record ผ่าน web app FINE Model เพื่อใช้เป็นคู่มือประจำตัวในการฝึกปฏิบัติ"
  ]'::jsonb,
  '[
    "I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)",
    "ครูแบ่งพื้นที่ห้องปฏิบัติการออกเป็นสถานีย่อย: สถานีต้อนรับ, สถานีโต๊ะอาหารหลัก, สถานี Room Service และสถานี Gueridon",
    "ผู้เรียนจับคู่และใช้ระบบ Gemini และ Gemini Live ผ่าน web app FINE Model ในการซักซ้อมบทสนทนาภาษาอังกฤษเฉพาะหน้า โดยกำหนดให้ AI สุ่มบทบาทเป็นแขกประเภทต่างๆ เช่น แขกที่รีบเช็คบิลเพื่อไปขึ้นเครื่องบิน หรือแขกที่ถามรายละเอียดการคิดเงินในบิล",
    "ผู้เรียนฝึกฟังการโต้ตอบและรับคำแนะนำด้านความคล่องแคล่ว (Fluency) และระดับภาษาที่เป็นมืออาชีพจากระบบ AI ผ่าน web app FINE Model ก่อนลงพื้นที่ปฏิบัติงานจริง"
  ]'::jsonb,
  '[
    "N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (70 นาที)",
    "ผู้เรียนรวมกลุ่มกันเป็นทีมแบ่งบทบาทหน้าที่: พนักงานต้อนรับ (Greeter), พนักงานเสิร์ฟ (Server), พนักงานบริการรถเข็น (Gueridon Attendant) และพนักงานตรวจบิล (Cashier)",
    "เข้าสู่กิจกรรม Restaurant Simulation Challenge: ครูทำการจำลองเปิดห้องอาหารเต็มรูปแบบ โดยกลุ่มที่ไม่ได้ปฏิบัติหน้าที่สวมบทบาทเป็นลูกค้าที่เข้ามาใช้บริการในหลากหลายรูปแบบ (Dining-in, Calling Room Service)",
    "ผู้เรียนในทีมต้องปฏิบัติงานจริง ตั้งแต่การจับผ้าปูโต๊ะ การรับออเดอร์ การเดินเสิร์ฟอาหารตามเข็มนาฬิกา การบริการอาหารข้างโต๊ะด้วยรถเข็น Gueridon ตลอดจนกระบวนการนับบิลเรียกเก็บเงินเป็นภาษาอังกฤษอย่างถูกต้อง",
    "ครูสร้างสถานการณ์หน้างาน (เช่น ออเดอร์ในครัวทำสลับโต๊ะ หรือระบบเครื่องคิดเงินขัดข้อง) เพื่อทดสอบทักษะการคิดวิเคราะห์และการประสานงานในทีม"
  ]'::jsonb,
  '[
    "E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (40 นาที)",
    "ตัวแทนแต่ละกลุ่มปฏิบัติการแสดงวงจรบริการเต็มรูปแบบในจุดที่ได้รับคัดเลือกต่อหน้าครูและเพื่อนร่วมชั้นเรียน",
    "ผู้เรียนสลับบทบาทกันเข้าทำแบบทดสอบความแม่นยำของลำดับขั้นตอนบริการ (Service Sequence Quiz) ผ่าน web app FINE Model เพื่อวัดผลรายบุคคล",
    "ครูประเมินสมรรถนะการปฏิบัติงานรายกลุ่มและรายบุคคลด้วยเกณฑ์ Rubrics ที่อิงตามมาตรฐานสากล"
  ]'::jsonb,
  '[
    "Reflection: ครูและผู้เรียนร่วมกันสะท้อนผลการปฏิบัติงาน: จุดเด่นที่ทำได้ดี เช่น ความนอบน้อมและการใช้ภาษาอังกฤษ และจุดที่ต้องปรับปรุง เช่น จังหวะการเสิร์ฟพร้อมกันและการรักษาความสะอาดบนรถเข็น",
    "ผู้เรียนทำกิจกรรม Exit Ticket: พิมพ์ข้อความสรุปสิ่งที่ตนเองต้องระวังในขั้นตอนการคิดเงินและการปิดบริการ ก่อนส่งเข้าสู่ระบบส่วนกลาง ท้ายคาบเรียน"
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

-- 2. Insert or update 4 assignments for Week 17
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-171717171701',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-17',
  'สัปดาห์ที่ 17 [F]: ใบงาน Core Service Cycle และ AI Scan วิเคราะห์แผนผังบริการวิชาชีพ',
  'ศึกษาใบความรู้ Core Service Cycle Map และขั้นตอนบริการพิเศษ (Room Service & Gueridon Service), ใช้ฟังก์ชัน AI Scan สแกนสัญลักษณ์เพื่อวิเคราะห์ลำดับก่อน-หลังในการเสิร์ฟ และทำแบบฝึกหัดเติมประโยคการแจ้งยอดบิลและการปิดการบริการ',
  'Familiarize',
  20,
  NOW() + interval '119 days',
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
  'a1111111-1111-4111-8111-171717171702',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-17',
  'สัปดาห์ที่ 17 [I]: ฝึกซ้อมบทสนทนาเฉพาะหน้า (แขกรีบเช็คบิล/ถามยอดบิล) ผ่าน Gemini Live',
  'จับคู่ฝึกปฏิบัติผ่าน Gemini Live ในสถานีย่อย สุ่มบทบาทจำลองเป็นแขกประเภทต่างๆ เช่น แขกที่รีบเช็คบิลเพื่อไปขึ้นเครื่องบิน หรือแขกที่ถามรายละเอียดการคิดเงินในบิล ฝึกความคล่องแคล่วและระดับภาษาที่เป็นมืออาชีพ พร้อมบันทึก AI Learning Record',
  'Interact',
  20,
  NOW() + interval '119 days',
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
  'a1111111-1111-4111-8111-171717171703',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-17',
  'สัปดาห์ที่ 17 [N]: กิจกรรม Restaurant Simulation Challenge วงจรบริการเต็มรูปแบบครบวงจร',
  'รวมกลุ่มปฏิบัติหน้าที่ทีมบริการ: Greeter, Server, Gueridon Attendant และ Cashier ปฏิบัติงานจริงเต็มรูปแบบในห้องอาหารจำลอง ตั้งแต่ต้อนรับ รับออเดอร์ เสิร์ฟตามเข็มนาฬิกา บริการรถเข็น Gueridon และคิดเงินเป็นภาษาอังกฤษ พร้อมแก้ไขเหตุขัดข้องหน้างาน',
  'Navigate',
  20,
  NOW() + interval '119 days',
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
  'a1111111-1111-4111-8111-171717171704',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-17',
  'สัปดาห์ที่ 17 [E]: สาธิตวงจรบริการเต็มรูปแบบ, Service Sequence Quiz และส่ง Exit Ticket',
  'ตัวแทนกลุ่มสาธิตวงจรบริการเต็มรูปแบบต่อหน้าชั้นเรียนตามเกณฑ์ Rubrics มาตรฐานสากล, ผู้เรียนทุกคนทำ Service Sequence Quiz ออนไลน์ผ่าน web app FINE Model และพิมพ์ส่ง Exit Ticket ข้อควรระวังในการคิดเงินและปิดการบริการ',
  'Exhibit',
  20,
  NOW() + interval '119 days',
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
