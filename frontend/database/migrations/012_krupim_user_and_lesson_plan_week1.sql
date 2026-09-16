-- Migration 012: Add ครูพิมพ์ user and Week 1 FINE Lesson Plan
BEGIN;

-- 1. Create User krupim@ktc.ac.th if not exists (Password: Krupim123!)
INSERT INTO app_users (id, email, password_hash)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  'krupim@ktc.ac.th',
  crypt('Krupim123!', gen_salt('bf', 12))
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash;

-- 2. Create Profile for ครูพิมพ์
INSERT INTO profiles (
  id, name, email, role, requested_role, approval_status, school_id, school_name
)
VALUES (
  (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th'),
  'ครูพิมพ์',
  'krupim@ktc.ac.th',
  'teacher',
  'teacher',
  'active',
  '11111111-1111-1111-1111-111111111111',
  'วิทยาลัยอาชีวศึกษา ตัวอย่าง'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    approval_status = EXCLUDED.approval_status;

-- 3. Create Class: ปวช.1 สาขาวิชาการโรงแรม
INSERT INTO classes (
  id, school_id, teacher_id, name, description, year, semester, is_active
)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th'),
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ห้องเรียน ปวช.1 สาขาวิชาการโรงแรม รายวิชาการบริการอาหารและเครื่องดื่ม',
  2567,
  1,
  true
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    teacher_id = EXCLUDED.teacher_id;

-- 4. Enroll Student student@local.test into this class for testing
INSERT INTO class_students (class_id, student_id)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '00000000-0000-0000-0000-000000000003'
)
ON CONFLICT (class_id, student_id) DO NOTHING;

-- 5. Insert FINE Lesson Plan Week 1: Cutlery and Glassware Vocabulary
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
  'lesson-plan-week-1',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 1: Cutlery and Glassware Vocabulary',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'สัปดาห์ที่ 1',
  'การเรียนรู้คำศัพท์และอุปกรณ์ในห้องอาหาร เป็นพื้นฐานสำคัญของการปฏิบัติงานบริการอาหารและเครื่องดื่ม ผู้เรียนจำเป็นต้องมีความรู้เกี่ยวกับชื่ออุปกรณ์ หน้าที่ วิธีการใช้งาน และสามารถสื่อสารภาษาอังกฤษในบริบทงานบริการได้อย่างถูกต้อง โดยการจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยีผ่าน web app FINE Model ตลอดจนการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อพัฒนาสมรรถนะการสื่อสารภาษาอังกฤษเชิงวิชาชีพและการปฏิบัติงานบริการตามมาตรฐานคุณวุฒิวิชาชีพ',
  '["บอกชื่ออุปกรณ์ในห้องอาหารประเภท Cutlery, Glassware เป็นภาษาอังกฤษได้ถูกต้อง", "อธิบายหน้าที่และการใช้งานของอุปกรณ์บนโต๊ะอาหารแต่ละประเภทได้", "อธิบายหลักการจัดวางอุปกรณ์บนโต๊ะอาหารตามมาตรฐานแบบทั่วไป (Casual) และแบบเป็นทางการ (Formal) ได้"]'::jsonb,
  '["ออกเสียงคำศัพท์อุปกรณ์ในห้องอาหาร และสามารถสื่อสารผ่านระบบ AI ผ่าน web app FINE Model ได้ถูกต้อง", "ใช้เทคโนโลยี AR เพื่อสแกนและเรียนรู้โมเดลอุปกรณ์ 3D ผ่าน web app FINE Model ได้", "จำแนก และจัดวางอุปกรณ์บนโต๊ะอาหาร ในสถานการณ์จำลอง (Simulation) ได้ถูกต้องตามตำแหน่งและหลักการ \"หยิบจากข้างนอก เข้าข้างใน\" (Outside - In)"]'::jsonb,
  '["ความรับผิดชอบและวินัยในการปฏิบัติงานตามขั้นตอน", "ความกล้าแสดงออกและมั่นใจในการใช้ภาษาอังกฤษเพื่อการสื่อสาร", "ทักษะการทำงานร่วมกับผู้อื่น และทำงานเป็นทีม (Teamwork)", "เจตคติที่ดีและมีจิตบริการ (Service Mind) ต่อวิชาชีพการโรงแรม"]'::jsonb,
  '["เลือกใช้อุปกรณ์ในห้องอาหารได้เหมาะสมกับประเภทการบริการ", "จัดวางอุปกรณ์บนโต๊ะอาหารตามสถานการณ์ที่กำหนดได้อย่างถูกต้อง", "ประยุกต์ใช้คำศัพท์ภาษาอังกฤษ ในการอธิบายอุปกรณ์และการจัดโต๊ะอาหารในสถานการณ์จำลองได้"]'::jsonb,
  '["Dinner Fork", "Dinner Knife", "Soup Spoon", "Dessert Spoon", "Teaspoon", "Water Goblet", "Red Wine Glass", "White Wine Glass", "Juice Glass", "Champagne Glass"]'::jsonb,
  '["This is a Dinner Knife. It is used for the main course.", "A Soup Spoon is used for soup.", "This is a Water Goblet.", "We use Water Goblet for water.", "What is this equipment? - This is a water goblet."]'::jsonb,
  '1. ครูเปิดวิดีโอเพื่อกระตุ้นการเรียนรู้ "Food & Beverage Terminology Explained | Essential Hotel & Restaurant Vocabulary" เพื่อให้ผู้เรียนเห็นภาพรวมบรรยากาศห้องอาหารระดับมาตรฐานสากลและอุปกรณ์ต่างๆ
2. กิจกรรมกระตุ้นความคิด (Brainstorming): ครูใช้คำถาม เพื่อเชื่อมโยงประสบการณ์เดิมของผู้เรียน:
  - "จากวิดีโอ นักเรียนเห็นอุปกรณ์ประเภทเครื่องแก้วหรือช้อนส้อมอะไรบ้าง?"
  - "หากเราเข้าไปในห้องอาหาร Fine Dining แล้วหยิบใช้อุปกรณ์ผิดประเภท จะส่งผลต่อภาพลักษณ์ของพนักงานและห้องอาหารอย่างไร?"
3. ผู้เรียนร่วมกันแชร์ความคิดเห็น อย่างอิสระ ครูเชื่อมโยงเข้าสู่วัตถุประสงค์การเรียนรู้',
  'ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)
1. ครูแจก Worksheet คำศัพท์อุปกรณ์ห้องอาหาร
2. ผู้เรียนใช้ Smartphone/Tablet สแกน QR Code เพื่อเปิดระบบ AR Learning เพื่อสแกนดูโมเดลอุปกรณ์ 3D (Cutlery และ Glassware)
3. ผู้เรียนจับคู่กลุ่มคำศัพท์ภาษาอังกฤษกับภาพโมเดลเสมือนจริงใน Worksheet
4. ภารกิจกลุ่มย่อย: ผู้เรียนเดินสำรวจห้องปฏิบัติการ และจับคู่คำศัพท์ที่ได้จาก AR นำไปวางคู่กับ "อุปกรณ์จริง" (Tableware Set) บนโต๊ะปฏิบัติงาน เพื่อสร้างความคุ้นเคย
5. ภารกิจ AI Scan Learning ผู้เรียนใช้ AI Scan วิเคราะห์อุปกรณ์จริงในห้องปฏิบัติการ เช่น Dinner Fork, Water Goblet, Soup Spoon จากนั้นศึกษาข้อมูลที่ระบบแสดงผล (ข้อมูลด้านวิชาชีพ, คำศัพท์ภาษาอังกฤษ, ตัวอย่างประโยค, ตัวอย่างบทสนทนา) และบันทึกผลลงใน AI Scan Learning Record',
  'การปฏิสัมพันธ์ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)
1. ครูมอบหมายภารกิจฝึกออกเสียง และแต่งประโยคเพื่อสื่อสาร โดยใช้ผ่าน web app FINE Model
2. ผู้เรียนฝึกออกเสียงคำศัพท์เดี่ยว และฝึกพูดประโยคระบุหน้าที่ของอุปกรณ์ตามโครงสร้าง:
  - "This is a [Dinner Knife]. It is used for [the main course]."
  - "A [Soup Spoon] is used for [soup]."
3. Pair Work กิจกรรมคู่หู: ผู้เรียนจับคู่ผลัดกันหยิบอุปกรณ์จริงขึ้นมา แล้วถาม-ตอบ โดยมี AI คอยจับเสียงและให้ Feedback เรื่องความถูกต้องของสำเนียง (Fluency)
  - A: "What is this equipment?"
  - B: "This is a water goblet."',
  'การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)
1. ครูแบ่งผู้เรียนเป็นทีม ทีมละ 4-5 คน เพื่อเข้าร่วมกิจกรรมจำลองสถานการณ์ "Restaurant Table Setup Challenge" (เกมแข่งจัดโต๊ะอาหารพลิกแพลง)
2. สถานการณ์จำลอง: ครูแจกการ์ดโจทย์ให้แต่ละทีม เช่น "ให้จัดโต๊ะอาหารแบบเป็นทางการ (Formal Western Table Setting) สำหรับเมนูที่มีซุป ปลา อาหารจานหลัก และไวน์ขาว"
3. ผู้เรียนในทีมต้องช่วยกันระดมสมอง วางแผนเลือกอุปกรณ์ และจัดวางบนโต๊ะตามหลักการ Outside-In และแนวทางที่ถูกต้องทางวิชาชีพ
4. ครูเพิ่มความท้าทาย โดยการเข้าไปสลับตำแหน่งอุปกรณ์ในระหว่างกิจกรรม เพื่อให้ทีมใช้ทักษะการคิดวิเคราะห์และแก้ปัญหาเฉพาะหน้า (Problem-Solving) ร่วมกัน',
  'การลงมือปฏิบัติจริง (35 นาที)
1. แต่ละทีมส่งตัวแทน นำเสนอผลงานการจัดโต๊ะอาหารเป็นภาษาอังกฤษ โดยอธิบายชื่อ และลำดับการจัดวางอุปกรณ์ให้ครูและเพื่อนในห้องฟัง
2. ผู้เรียนทุกคนทำ Quiz ทดสอบคำศัพท์และความเข้าใจรายบุคคล ผ่าน web app FINE Model
3. ครูประเมินสมรรถนะการปฏิบัติงาน (Performance Assessment) รายกลุ่ม รายบุคคล ด้วยเกณฑ์ Rubrics',
  'ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)
1. Reflection: ครูและผู้เรียนร่วมกันสรุปหลักการสำคัญ: การหยิบใช้อุปกรณ์จากด้านนอกเข้าด้านใน, ทิศทางการหันคมมีด, และความสำคัญของการเรียกชื่ออุปกรณ์ให้ถูกต้องเพื่อความเป็นมืออาชีพ
2. ผู้เรียนทำกิจกรรม Exit Ticket: พิมพ์หรือเขียนคำศัพท์อุปกรณ์ที่จำได้แม่นยำที่สุด 5 คำ พร้อมอธิบายหน้าที่สั้นๆ เป็นภาษาอังกฤษส่งครูก่อนออกจากห้องเรียน',
  'ครูพิมพ์',
  'krupim@ktc.ac.th',
  (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th'),
  '22222222-2222-2222-2222-222222222201',
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

COMMIT;
