-- Migration 019: Add Week 3 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 3: Table Setting (Casual & Formal)
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
  'lesson-plan-week-3',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 3: Table Setting (Casual & Formal และขั้นตอนการจัดวางอุปกรณ์ตามมาตรฐาน)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 3',
  'การจัดโต๊ะอาหารเป็นหัวใจสำคัญของการเตรียมสภาพแวดล้อมเพื่อให้การบริการอาหารและเครื่องดื่มเป็นไปตามมาตรฐานสากล ผู้เรียนจำเป็นต้องมีความรู้ความเข้าใจเกี่ยวกับประเภทการจัดโต๊ะอาหาร ได้แก่ แบบทั่วไป (Casual Table Setting) และแบบเป็นทางการ (Formal Table Setting) รวมถึงขั้นตอน กฎเกณฑ์การจัดวางอุปกรณ์ (เช่น กฎ 1 นิ้วจากขอบโต๊ะ และการหยิบใช้อยุปกรณ์จากด้านนอกเข้าด้านใน หรือ Outside-In Rule) ตลอดจนสามารถสื่อสารภาษาอังกฤษ เพื่ออธิบายตำแหน่งการจัดวางอุปกรณ์ได้อย่างถูกต้อง การจัดการเรียนรู้นี้บูรณาการ FINE Model ร่วมกับเทคโนโลยี Augmented Reality (AR 3D Table Setting), ผ่าน web app FINE Model และการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อยกระดับสมรรถนะ การสื่อสารภาษาอังกฤษด้านวิชาชีพ และการปฏิบัติงานในการจัดโต๊ะอาหารตามมาตรฐานคุณวุฒิวิชาชีพ',
  '[
    "บอกประเภทการจัดโต๊ะอาหารแบบ Casual Table Setting และ Formal Table Setting เป็นภาษาอังกฤษได้ถูกต้อง",
    "อธิบายขั้นตอน กฎเกณฑ์ และลำดับการจัดวางอุปกรณ์บนโต๊ะอาหารตามมาตรฐานวิชาชีพได้",
    "อธิบายหลักการจัดวางเครื่องแก้ว จานขนมปัง และผ้าเช็ดปากตามประเภทการบริการได้"
  ]'::jsonb,
  '[
    "ออกเสียงคำศัพท์และประโยคภาษาอังกฤษ ระบุตำแหน่งการจัดโต๊ะอาหารผ่านระบบ AI ได้ถูกต้อง",
    "ใช้เทคโนโลยี AR เพื่อสแกน และเรียนรู้ผังการจัดโต๊ะอาหารแบบ 3D ได้อย่างคล่องแคล่ว",
    "จำแนก และลงมือจัดวางอุปกรณ์บนโต๊ะอาหารแบบ Casual และ Formal ในสถานการณ์จำลอง (Simulation) ได้ถูกต้องตามกฎ \"1 นิ้ว\" และ \"Outside - In\""
  ]'::jsonb,
  '[
    "ความรับผิดชอบ ละเอียดรอบคอบ และมีความประณีตในการจัดวางอุปกรณ์ตามมาตรฐานความสะอาด",
    "ความกล้าแสดงออก และมั่นใจในการใช้ภาษาอังกฤษสื่อสารและอธิบายรูปแบบการจัดโต๊ะ",
    "ทักษะการทำงานร่วมกับผู้อื่น ในการจัดเตรียมโต๊ะอาหารจำลอง (Teamwork)",
    "เจตคติที่ดีและมีจิตบริการ (Service Mind) ต่อวิชาชีพการโรงแรม"
  ]'::jsonb,
  '[
    "เลือกประเภทการจัดโต๊ะอาหาร ให้เหมาะสมกับรูปแบบการบริการ และสถานการณ์ที่กำหนดได้",
    "ตรวจสอบ และแก้ไขข้อผิดพลาด ในการจัดวางอุปกรณ์บนโต๊ะอาหารตามโจทย์จำลองได้",
    "ประยุกต์ใช้คำศัพท์และโครงสร้างประโยคภาษาอังกฤษ ในการนำเสนอรูปแบบการจัดโต๊ะอาหารได้อย่างมืออาชีพ"
  ]'::jsonb,
  '[
    "Casual Setting",
    "Formal Setting",
    "Centerpiece",
    "Placemat",
    "Table Cloth",
    "Show Plate",
    "Side Plate (B&B Plate)",
    "Butter Knife",
    "Alignment",
    "Distance"
  ]'::jsonb,
  '[
    "Place the [Dinner Knife] to the right of the plate with the blade facing inward.",
    "Keep a distance of one inch from the edge of the table.",
    "The Water Goblet is placed directly above the dinner knife.",
    "The bread plate is on the left side of the forks.",
    "The [Dinner Knife] goes on the right side of the plate.",
    "Place the [Water Goblet] above the dinner knife at a 45-degree angle."
  ]'::jsonb,
  'ขั้นนำเข้าสู่บทเรียน (20 นาที)
1. ครูเปิดวิดีโอกระตุ้นการเรียนรู้ “Table Setting Rules & Standards: Casual vs. Formal Table Setting” เพื่อให้ผู้เรียนเห็นเปรียบเทียบการจัดโต๊ะอาหารทั้งสองรูปแบบในโรงแรมระดับสากล
2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเชื่อมโยงประสบการณ์:
   - “จากการดูวิดีโอ การจัดโต๊ะแบบ Casual และ Formal มีความแตกต่างกันอย่างไร?”
   - “ทำไมมีดอาหารจานหลักต้องหันคมมีดเข้าหาจาน และต้องเว้นระยะห่างจากขอบโต๊ะ 1 นิ้ว?”
3. ผู้เรียนร่วมกันแสดงความคิดเห็น ครูสรุปเชื่อมโยงเข้าสู่จุดประสงค์การเรียนรู้เรื่อง Table Setting',
  'ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี AR 3D & AI Scan (60 นาที)
1. ครูแจก Worksheet เรื่อง "Table Setting Layouts & Rules"
2. ผู้เรียนใช้ Smartphone/Tablet สแกน QR Code เพื่อเปิดระบบ AR Learning สแกนดูผังโมเดล 3D การจัดโต๊ะอาหารแบบ Casual และ Formal
3. ผู้เรียนศึกษาตำแหน่งการจัดวาง (เช่น จาน, ช้อน, ส้อม, มีด, แก้วน้ำ, แก้วไวน์, จานขนมปัง) ผ่าน AR และจับคู่ชื่ออุปกรณ์กับตำแหน่งใน Worksheet
4. ภารกิจ AI Scan Learning: ผู้เรียนใช้ AI Scan ผ่าน web app FINE Model สแกนโต๊ะอาหารตัวอย่างที่ครูจัดไว้ในห้องปฏิบัติการ เพื่อศึกษาวิเคราะห์ ประเภทของการเซ็ตโต๊ะ, ระยะห่างและทิศทางของอุปกรณ์, ประโยคภาษาอังกฤษอธิบายตำแหน่งการจัดวาง แล้วบันทึกข้อมูลที่ได้ลงใน AI Scan Learning Record (Table Setting Edition)',
  'การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support (50 นาที)
1. ครูมอบหมายภารกิจฝึกออกเสียง และสร้างประโยคสนทนาในการระบุตำแหน่งการจัดโต๊ะอาหาร โดยใช้ผ่าน web app FINE Model ตามโครงสร้างประโยค:
   - "The [Dinner Knife] goes on the right side of the plate."
   - "Place the [Water Goblet] above the dinner knife at a 45-degree angle."
2. Pair Work กิจกรรมคู่: ผู้เรียนจับคู่กัน โดยคนหนึ่งเป็นผู้สั่งคำสั่งภาษาอังกฤษ (Instructor) และอีกคนเป็นผู้ปฏิบัติจัดวางอุปกรณ์จริงบนโต๊ะ (Setter) โดยเปิด Gemini Live ช่วยฟังเสียง เพื่อประเมินความถูกต้องของสำเนียงและการใช้คำศัพท์',
  'การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)
1. ครูแบ่งกลุ่มผู้เรียนเป็นทีม ทีมละ 4-5 คน เพื่อเข้าร่วมกิจกรรม “Table Setting Simulation Challenge”
2. สถานการณ์จำลอง: ครูแจกการ์ดโจทย์สถานการณ์จำลองให้แต่ละทีม เช่น:
   - โจทย์ A: "จงเซ็ตโต๊ะแบบ Formal Western Table Setting สำหรับอาหาร 4 คอร์ส (Soup, Fish, Main Course, Dessert) พร้อมแก้วไวน์แดงและไวน์ขาว"
   - โจทย์ B: "จงเซ็ตโต๊ะแบบ Casual Dining สำหรับอาหารกลางวัน 2 คอร์ส พร้อมจัดวาง B&B Plate และ Water Goblet ให้ถูกต้อง"
3. สมาชิกในทีมระดมสมอง วางแผน เลือกอุปกรณ์ และจัดวางอุปกรณ์ลงบนโต๊ะ ให้ถูกต้องตามกฎ 1 นิ้ว และ Outside-In
4. การเพิ่มความท้าทาย (Problem-Solving): ครูเปลี่ยนตำแหน่งอุปกรณ์บางชิ้น หรือปรับระยะให้ผิดเกณฑ์ 1 นิ้ว เพื่อให้ทีมช่วยกันตรวจสอบ คิดวิเคราะห์ และแก้ไขข้อผิดพลาดให้ถูกต้องตามมาตรฐาน',
  'การลงมือปฏิบัติจริง (35 นาที)
1. Each team sends a representative to present their table setup in English: อธิบายประเภทการจัดโต๊ะ ลำดับการจัดวาง และการใช้กฎ 1 นิ้ว / Outside-In ให้ครูและเพื่อนฟัง
2. ผู้เรียนทุกคนทำ Quiz ทดสอบความเข้าใจเรื่อง Table Setting Rules & Layouts รายบุคคลผ่าน web app FINE Model
3. ครูประเมินสมรรถนะการปฏิบัติงานรายกลุ่ม (Performance Assessment) ด้วยเกณฑ์ Rubrics',
  'ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)
1. Reflection: ครูและผู้เรียนร่วมกันสรุปหลักการสำคัญ: ความประณีตในการจัดโต๊ะ กฎ 1 นิ้ว ทิศทางใบมีด การวางแก้วน้ำ และความสำคัญของการจัดโต๊ะตามมาตรฐานสากลต่อภาพลักษณ์โรงแรม
2. Exit Ticket: ผู้เรียนเขียนสรุปกฎการจัดโต๊ะอาหารภาษาอังกฤษ 3 ข้อ (เช่น 1-inch distance, Blade inward, Outside-In placement) ส่งครูก่อนออกจากห้องเรียน',
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

-- 2. Insert Week 3 Assignments for ครูพิมพ์
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-333333333301',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-3',
  'สัปดาห์ที่ 3 [F]: ใบงาน Worksheet & AI Scan ผังการจัดโต๊ะอาหาร Casual & Formal',
  'ให้นักเรียนสแกนดูผังโมเดล 3D Table Setting แบบ Casual และ Formal พร้อมทำใบงานจับคู่คำศัพท์และตำแหน่งอุปกรณ์ และใช้ AI Scan สแกนโต๊ะอาหารตัวอย่างในห้องปฏิบัติการเพื่อบันทึกผลลงใน AI Scan Learning Record (Table Setting Edition)',
  'Familiarize',
  20,
  NOW() + interval '21 days',
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
  'a1111111-1111-4111-8111-333333333302',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-3',
  'สัปดาห์ที่ 3 [I]: ฝึกพูดและแต่งประโยคระบุตำแหน่งการจัดโต๊ะกับ AI Voice & Gemini Live',
  'ให้นักเรียนฝึกออกเสียงคำศัพท์และแต่งประโยคระบุตำแหน่งอุปกรณ์การจัดโต๊ะ เช่น "The Dinner Knife goes on the right side of the plate." พร้อมจับคู่ Pair Work สลับบทบาทเป็นผู้สั่งและผู้จัดวางอุปกรณ์จริงบนโต๊ะโดยใช้ Gemini Live ตรวจสอบสำเนียง',
  'Interact',
  20,
  NOW() + interval '21 days',
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
  'a1111111-1111-4111-8111-333333333303',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-3',
  'สัปดาห์ที่ 3 [N]: ภารกิจจำลองการจัดโต๊ะอาหาร Table Setting Simulation Challenge',
  'ให้นักเรียนแบ่งทีมร่วมแข่งขันจำลองการจัดโต๊ะอาหารตามโจทย์สถานการณ์จำลอง (Formal Western 4 คอร์ส หรือ Casual Dining) จัดวางอุปกรณ์ตามกฎ 1 นิ้ว และ Outside-In พร้อมแก้ไขจุดผิดพลาดที่ครูจำลองโจทย์ปัญหาท้าทาย (Problem-Solving)',
  'Navigate',
  20,
  NOW() + interval '21 days',
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
  'a1111111-1111-4111-8111-333333333304',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-3',
  'สัปดาห์ที่ 3 [E]: กิจกรรม Exit Ticket สรุปกฎ 3 ข้อ และ Quiz ประจำสัปดาห์ที่ 3',
  'ให้ตัวแทนนำเสนอผลงานจัดโต๊ะเป็นภาษาอังกฤษ, ผู้เรียนทุกคนทำ Quiz ออนไลน์ทดสอบความเข้าใจ Table Setting Rules & Layouts และเขียน Exit Ticket สรุปกฎการจัดโต๊ะภาษาอังกฤษ 3 ข้อส่งก่อนจบคลาส',
  'Exhibit',
  20,
  NOW() + interval '21 days',
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
