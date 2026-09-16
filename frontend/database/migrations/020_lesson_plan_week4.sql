-- Migration 020: Add Week 4 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 4: Service Equipment
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
  'lesson-plan-week-4',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 4: Service Equipment (จำแนกประเภท ชนิด การดูแลรักษา สุขอนามัย และการจัดเตรียมอุปกรณ์)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 4',
  'การรู้จัก จำแนกประเภท และใช้งานเครื่องมืออุปกรณ์ในการบริการอาหารและเครื่องดื่ม (Service Equipment) ถือเป็นทักษะพื้นฐานสำคัญของพนักงานบริการในอุตสาหกรรมโรงแรม ผู้เรียนจำเป็นต้องมีความรู้ความเข้าใจเกี่ยวกับประเภทของอุปกรณ์ ได้แก่ จานกระเบื้อง (Chinaware), เครื่องเงิน/ช้อนส้อมมีด (Flatware/Cutlery), เครื่องแก้ว (Glassware), ผ้าที่ใช้ในห้องอาหาร (Linen) และภาชนะโลหะ/ภาชนะโปร่ง (Hollowware) รวมถึงหลักการดูแลรักษา การทำความสะอาด (Polishing) การจับถืออุปกรณ์อย่างถูกสุขลักษณะ (Hygiene Handling) ตลอดจนการสื่อสารภาษาอังกฤษ เพื่อระบุชื่อและหน้าที่ของอุปกรณ์แต่ละชนิดได้อย่างถูกต้อง การจัดการเรียนรู้นี้บูรณาการ FINE Model ร่วมกับเทคโนโลยี Augmented Reality ผ่าน web app FINE Model และการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อพัฒนาสมรรถนะการสื่อสารภาษาอังกฤษเชิงวิชาชีพและการปฏิบัติงานเตรียมอุปกรณ์ตามมาตรฐานคุณวุฒิวิชาชีพ',
  '[
    "บอกชื่อ และจำแนกประเภทอุปกรณ์ในงานบริการอาหารและเครื่องดื่ม 5 หมวดหมู่หลัก (Chinaware, Cutlery, Glassware, Linen, Hollowware) เป็นภาษาอังกฤษได้ถูกต้อง",
    "อธิบายวิธีการดูแลรักษา การทำความสะอาด (Polishing) และหลักการจัดเก็บอุปกรณ์แต่ละประเภทตามมาตรฐานวิชาชีพได้",
    "อธิบายหลักสุขอนามัยในการจับ ถืออุปกรณ์ในงานบริการแต่ละชนิดได้ถูกต้อง"
  ]'::jsonb,
  '[
    "ออกเสียงคำศัพท์และประโยคภาษาอังกฤษระบุชื่อและหน้าที่ของอุปกรณ์ผ่านระบบ AI ได้ถูกต้อง",
    "ใช้เทคโนโลยี AR 3D และ AI Scan ผ่าน web app FINE Model เพื่อสแกน จำแนก และตรวจสอบสภาพของอุปกรณ์ให้พร้อมใช้งานได้",
    "ปฏิบัติงานเช็ดทำความสะอาด (Polishing) แก้วและเครื่องเงินด้วยไอน้ำ รวมถึงจับถืออุปกรณ์ได้อย่างถูกต้อง"
  ]'::jsonb,
  '[
    "ความรอบคอบ และระมัดระวังในการจับถืออุปกรณ์เพื่อความปลอดภัยในการทำงาน",
    "การคำนึงถึงความสำคัญของความสะอาดและสุขอนามัย (Hygiene Concept) ในการปฏิบัติงานบริการ",
    "ความกล้าแสดงออกและความมั่นใจในการใช้ภาษาอังกฤษสื่อสาร",
    "ทักษะการทำงานร่วมกับผู้อื่น และการบริหารจัดการเวลา ในการจัดเตรียมอุปกรณ์"
  ]'::jsonb,
  '[
    "เลือกใช้อุปกรณ์ในงานบริการอาหารและเครื่องดื่มได้ถูกต้อง เหมาะสมตามรายการอาหาร (Menu) และสถานการณ์ที่กำหนดได้",
    "ตรวจสอบ คัดแยก และแก้ไขปัญหาในกรณีที่อุปกรณ์ที่ไม่พร้อมใช้งาน (เช่น มีรอยคราบ ตำหนิ หรือชำรุด)",
    "ประยุกต์ใช้คำศัพท์และโครงสร้างประโยคภาษาอังกฤษ ในการแนะนำการใช้งานของอุปกรณ์ได้"
  ]'::jsonb,
  '[
    "Stemware",
    "Tumbler",
    "Cutlery",
    "Flatware",
    "Chinaware",
    "Hollowware",
    "Linen",
    "Polishing",
    "Sanitizing",
    "Service Cloth",
    "Handle with care",
    "Rim",
    "Base"
  ]'::jsonb,
  '[
    "This is a [Water Goblet], used for serving iced water.",
    "Always hold the wine glass by the stem to keep it clean and maintain the wine temperature.",
    "Please polish the cutlery with hot steam and a dry linen cloth.",
    "Check the glassware for any cracks or spots before placing it on the table.",
    "This is a [Fish Knife]. It is used for eating fish dishes.",
    "Always hold the glass by its stem to avoid leaving fingerprints."
  ]'::jsonb,
  'ขั้นนำเข้าสู่บทเรียน (20 นาที)
1. ครูเปิดวิดีโอ “Professional Equipment Handling & Polishing Standards in 5-Star Hotels” เพื่อให้ผู้เรียนเห็นมาตรฐานการจัดการอุปกรณ์บริการ และสุขอนามัย
2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามกระตุ้นความคิด:
   - “ทำไมพนักงานบริการถึงห้ามจับบริเวณขอบแก้ว (Rim) หรือหน้าสัมผัสของจานโดยเด็ดขาด?”
   - “หากลูกค้าพบรอยนิ้วมือหรือคราบน้ำบนแก้วไวน์ จะส่งผลต่อภาพลักษณ์ของโรงแรมอย่างไร?”
3. ผู้เรียนร่วมกันแสดงความคิดเห็น ครูสรุปเชื่อมโยงเข้าสู่จุดประสงค์การเรียนรู้เรื่อง Service Equipment',
  'ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี AR 3D & AI Scan (60 นาที)
1. ครูแจก Worksheet เรื่อง "Service Equipment Identification & Hygiene Rules"
2. ผู้เรียนใช้ Smartphone/Tablet สแกน QR Code เพื่อเปิดระบบ AR Learning สแกนดูโมเดล 3D ของอุปกรณ์บริการทั้ง 5 หมวด (Chinaware, Cutlery, Glassware, Linen, Hollowware)
3. ผู้เรียนศึกษารายละเอียด ชื่อภาษาอังกฤษ และหน้าที่การใช้งานผ่าน AR พร้อมบันทึกลงใน Worksheet
4. ภารกิจ AI Scan Learning: ผู้เรียนใช้ AI Scan ผ่าน web app FINE Model สแกนอุปกรณ์จริง ที่จัดวางไว้ในห้องปฏิบัติการ เพื่อศึกษาวิเคราะห์: ชื่อเรียกอุปกรณ์ภาษาอังกฤษและหมวดหมู่, ตำแหน่งจุดจับถือที่ถูกต้องตามหลักสุขอนามัย, ประโยคภาษาอังกฤษอธิบายการใช้งานของอุปกรณ์ และบันทึกข้อมูลลงใน AI Scan Learning Record (Equipment Edition)',
  'การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support (50 นาที)
1. ครูมอบหมายภารกิจฝึกออกเสียงคำศัพท์และแต่งประโยคอธิบายอุปกรณ์ โดยใช้ผ่าน web app FINE Model
2. ผู้เรียนฝึกแต่งประโยคอธิบายตามโครงสร้าง:
   - “This is a [Fish Knife]. It is used for eating fish dishes.”
   - “Always hold the glass by its stem to avoid leaving fingerprints.”
3. Pair Work กิจกรรมคู่: ผู้เรียนจับคู่กัน โดยคนหนึ่งเป็น "Head Server" ทำหน้าที่สุ่มชี้อุปกรณ์และถามคำถามภาษาอังกฤษ อีกคนเป็น "Junior Server" หยิบถืออุปกรณ์อย่างถูกวิธีพร้อมตอบชื่อและหน้าที่ โดยใช้ผ่าน web app FINE Model ช่วยฟังเสียงเพื่อประเมินความถูกต้องของสำเนียงและการใช้คำศัพท์',
  'การเรียนรู้ผ่านสถานการณ์จำลอง SBL (55 นาที)
1. ครูแบ่งกลุ่มผู้เรียนเป็นทีม ทีมละ 4-5 คน เพื่อเข้าร่วมกิจกรรม “Equipment Selection & Polishing Challenge”
2. สถานการณ์จำลอง: ครูแจกการ์ดรายการอาหาร (Menu Card) ให้แต่ละทีม เช่น:
   - โจทย์ A: "เมนู 3 คอร์ส: Cream of Mushroom Soup, Grilled Salmon with Herb Butter, and Chocolate Mousse พร้อมบริการไวน์ขาวและน้ำดื่ม"
   - โจทย์ B: "เมนู 3 คอร์ส: Caesar Salad, Ribeye Steak, and Apple Pie พร้อมบริการไวน์แดงและน้ำดื่ม"
3. สมาชิกในทีมระดมสมอง วางแผน เลือกอุปกรณ์ (Chinaware, Cutlery, Glassware) ให้ตรงกับเมนู และนำอุปกรณ์มาเข้ากระบวนการ Polishing (เช็ดทำความสะอาดด้วยไอน้ำ) ให้เงางาม ปราศจากคราบ
4. การเพิ่มความท้าทาย (Problem-Solving): ครูแอบปะปนอุปกรณ์ที่มีคราบ คราบรอยนิ้วมือ หรืออุปกรณ์ผิดประเภทลงในคลัง ให้ผู้เรียนคัดแยก ตรวจสอบ และแก้ไขให้ถูกต้องก่อนนำส่งตรวจ',
  'การลงมือปฏิบัติจริง (35 นาที)
1. ตัวแทนแต่ละทีมออกมานำเสนออุปกรณ์ที่เลือก และสาธิตวิธีการเช็ด/จับถืออุปกรณ์เป็นภาษาอังกฤษหน้าชั้นเรียน
2. ผู้เรียนทุกคนทำ Quiz ทดสอบความรู้เรื่อง Service Equipment Identification & Handling รายบุคคลผ่าน web app FINE Model
3. ครูประเมินสมรรถนะการปฏิบัติงานรายกลุ่ม (Performance Assessment) ด้วยเกณฑ์ Rubrics',
  'ขั้นสรุปและสะท้อนคิด (20 นาที)
1. Reflection: ครูและผู้เรียนร่วมกันสรุปหลักการสำคัญ: การคัดเลือกอุปกรณ์ให้เหมาะกับเมนู หลักสุขอนามัยในการจับถือ และเทคนิคการ Polishing ให้ถูกต้อง
2. Exit Ticket: ผู้เรียนเขียนชื่ออุปกรณ์ภาษาอังกฤษ 3 ชนิด พร้อมระบุจุดที่ต้องจับถืออย่างถูกสุขลักษณะ ส่งครูก่อนออกจากห้องเรียน',
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

-- 2. Insert Week 4 Assignments for ครูพิมพ์
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-444444444401',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-4',
  'สัปดาห์ที่ 4 [F]: ใบงาน Worksheet & AI Scan อุปกรณ์บริการ 5 หมวด Service Equipment',
  'ให้นักเรียนสแกนดูโมเดล 3D อุปกรณ์บริการทั้ง 5 หมวด (Chinaware, Cutlery, Glassware, Linen, Hollowware) พร้อมทำใบงานจับคู่คำศัพท์และหน้าที่ และใช้ฟีเจอร์ AI Scan สแกนอุปกรณ์จริงเพื่อบันทึกผลลงใน AI Scan Learning Record (Equipment Edition)',
  'Familiarize',
  20,
  NOW() + interval '28 days',
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
  'a1111111-1111-4111-8111-444444444402',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-4',
  'สัปดาห์ที่ 4 [I]: ฝึกพูดระบุหน้าที่และหลักการจับถืออุปกรณ์กับ AI Voice',
  'ให้นักเรียนฝึกออกเสียงคำศัพท์และประโยคภาษาอังกฤษระบุหน้าที่และหลักสุขอนามัยในการจับถืออุปกรณ์ เช่น "Always hold the wine glass by the stem to keep it clean and maintain the wine temperature." พร้อมจับคู่สลับบทบาทเป็น Head Server และ Junior Server',
  'Interact',
  20,
  NOW() + interval '28 days',
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
  'a1111111-1111-4111-8111-444444444403',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-4',
  'สัปดาห์ที่ 4 [N]: ภารกิจจำลองการคัดเลือกและ Polishing อุปกรณ์ Equipment Selection Challenge',
  'ให้นักเรียนแบ่งทีมวางแผนเลือกอุปกรณ์ให้ตรงตามโจทย์รายการอาหาร 3 คอร์ส นำอุปกรณ์มาผ่านขั้นตอน Polishing ด้วยไอน้ำร้อนและผ้า Linen ให้เงางามไร้คราบ พร้อมคัดแยกอุปกรณ์ชำรุดหรือมีตำหนิออกจากคลังบริการ',
  'Navigate',
  20,
  NOW() + interval '28 days',
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
  'a1111111-1111-4111-8111-444444444404',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-4',
  'สัปดาห์ที่ 4 [E]: กิจกรรม Exit Ticket สุขอนามัยการจับถือ และ Quiz ประจำสัปดาห์ที่ 4',
  'ให้ตัวแทนนำเสนออุปกรณ์และสาธิตการจับถืออย่างถูกสุขลักษณะเป็นภาษาอังกฤษ, ผู้เรียนทุกคนทำ Quiz ออนไลน์เรื่อง Service Equipment Rules & Identification และเขียน Exit Ticket ระบุจุดจับถือที่ถูกต้อง 3 ชนิดส่งก่อนออกจากห้องเรียน',
  'Exhibit',
  20,
  NOW() + interval '28 days',
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
