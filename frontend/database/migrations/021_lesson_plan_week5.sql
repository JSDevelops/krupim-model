-- Migration 021: Add Week 5 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 5: Greeting and Welcoming Guests
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
  'lesson-plan-week-5',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 5: Greeting and Welcoming Guests (การกล่าวต้อนรับและการแนะนำตนเอง)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 5',
  'การกล่าวต้อนรับและการแนะนำตนเอง (Greeting and Welcoming Guests) เป็นประตูด่านแรกในการสร้างความประทับใจ และความเชื่อมั่นให้แก่ผู้รับบริการ พนักงานบริการจำเป็นต้องมีความรู้ความเข้าใจเกี่ยวกับขั้นตอนการต้อนรับ การใช้ภาษาท่าทาง (Body Language) ที่สุภาพ และการเลือกใช้สำนวนภาษาอังกฤษสำหรับงานบริการ (Expressions for Restaurant Service) ได้อย่างถูกต้องเหมาะสมตามช่วงเวลา และประเภทของลูกค้า โดยการจัดการเรียนรู้นี้ได้บูรณาการโครงสร้าง FINE Model ร่วมกับเทคโนโลยี Augmented Reality (AR) และ Artificial Intelligence (AI) ตลอดจนการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อพัฒนาสมรรถนะการสื่อสารภาษาอังกฤษ ตามมาตรฐานคุณวุฒิวิชาชีพได้',
  '[
    "ระบุขั้นตอนและหลักการต้อนรับลูกค้า (Greeting) ตามมาตรฐานของธุรกิจอาหารและเครื่องดื่มได้ถูกต้อง",
    "จำแนกสำนวน และประโยคภาษาอังกฤษที่ใช้ในการกล่าวต้อนรับ และการแนะนำตนเองตามระดับความเป็นทางการได้",
    "อธิบายหลักการใช้ภาษาท่าทาง (Non-verbal Communication) เช่น การสบตา การยิ้ม และการผายมือที่ถูกต้องได้"
  ]'::jsonb,
  '[
    "ออกเสียงการต้อนรับภาษาอังกฤษ และโต้ตอบบทสนทนากับระบบ AI ได้ถูกต้อง",
    "ปฏิบัติทักษะการต้อนรับลูกค้าและแนะนำตนเองร่วมกับภาษาที่ถูกต้อง และท่าทางที่สุภาพในสถานการณ์จำลองได้",
    "ปรับปรุงระดับเสียง ท่วงทำนอง และความเร็วในการพูดภาษาอังกฤษโดยอาศัยข้อมูลจากระบบ AI ได้"
  ]'::jsonb,
  '[
    "บุคลิกภาพที่สุภาพ มียิ้มแย้ม แจ่มใส และมีจิตบริการ (Service Mind)",
    "ความกล้าแสดงออกและความมั่นใจในการสื่อสารภาษาอังกฤษ",
    "ทักษะการทำงานร่วมกับผู้อื่นและพร้อมรับฟังคำแนะนำเพื่อการพัฒนาตนเอง"
  ]'::jsonb,
  '[
    "เลือกใช้สำนวนการกล่าวต้อนรับ และแนะนำตนเองได้เหมาะสมกับประเภทของลูกค้าในสถานการณ์จำลอง",
    "ประยุกต์ใช้ทักษะภาษาอังกฤษ และบุคลิกภาพงานบริการในการต้อนรับลูกค้า ณ หน้าห้องอาหารจำลองได้",
    "แก้ไขสถานการณ์เฉพาะหน้า ในการต้อนรับได้อย่างเหมาะสม"
  ]'::jsonb,
  '[
    "Reservation",
    "Welcome",
    "Server",
    "Proxemics",
    "Eye Contact",
    "Body Language",
    "First Impression",
    "Host/Hostess"
  ]'::jsonb,
  '[
    "Good morning/afternoon/evening, sir/madam. Welcome to [Restaurant Name].",
    "My name is [Name], and I will be your server for today.",
    "Do you have a reservation, sir/madam?",
    "A table for how many persons, please?",
    "Right this way, please. Let me show you to your table."
  ]'::jsonb,
  'ขั้นนำเข้าสู่บทเรียน (20 นาที)
1. ครูจัดกิจกรรม Role-play โดยครูสวมบทบาทเป็นลูกค้าชาวต่างชาติเดินเข้ามาในห้องเรียนด้วยท่าทางสับสน จากนั้นขอให้ผู้เรียนลองเข้ามาทักทายและต้อนรับ
2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเพื่อเชื่อมโยงประสบการณ์และนำเข้าสู่บทเรียน:
   - “จากที่เพื่อนๆ ได้ลองเข้ามาทักทาย ประโยคใดที่ทำให้ลูกค้ารู้สึกอบอุ่นและประทับใจมากที่สุด?”
   - “นอกจากคำพูดแล้ว ท่าทาง การยืน หรือการสบตา มีผลต่อความรู้สึกของลูกค้าใน 3 วินาทีแรกอย่างไรบ้าง?”
3. ผู้เรียนร่วมกันแชร์ความคิดเห็น ครูสรุปและเชื่อมโยงเข้าสู่วัตถุประสงค์การเรียนรู้เรื่องการต้อนรับและการแนะนำตนเอง',
  'ขั้นทำความคุ้นเคย ผ่านบทสนทนา (60 นาที)
1. ครูแจก Worksheet เรื่อง "Professional Greeting & Self-Introduction Expressions"
2. ผู้เรียนศึกษาโครงสร้างประโยคมาตรฐาน สำหรับการทักทายลูกค้าตามช่วงเวลา การแนะนำตนเองในฐานะพนักงานดูแลโต๊ะ และประโยคสอบถามเรื่องการจองโต๊ะอาหาร
3. ครูสาธิตการใช้น้ำเสียง ท่วงทำนอง (Intonation) และภาษาท่าทางที่ถูกต้อง เช่น ระยะห่างในการยืน (Proxemics) การสบตา (Eye Contact) และการไหว้หรือผายมือตามมาตรฐานโรงแรม
4. ผู้เรียนฝึกฝนการออกเสียงตามครูพร้อมกันทั้งห้องเรียน และฝึกจับคู่สลับกันอ่านออกเสียงเพื่อสร้างความคุ้นเคยกับโครงสร้างประโยค',
  'การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support (50 นาที)
1. ครูมอบหมายให้ผู้เรียนใช้ Smartphone/Tablet ในการเข้าใช้ web app FINE Model เพื่อฝึกทักษะการฟังและการโต้ตอบภาษาอังกฤษรายบุคคล
2. ผู้เรียนป้อนคำสั่ง (Prompt) จำลองสถานการณ์ให้ web app FINE Model รับบทเป็นลูกค้าต่างชาติที่เพิ่งเดินเข้ามาในห้องอาหาร จากนั้นผู้เรียนเปิดฟังก์ชันเสียงใน web app FINE Model เพื่อฝึกพูดกล่าวต้อนรับ แนะนำตนเอง และสอบถามข้อมูลการจองโต๊ะเป็นภาษาอังกฤษแบบเรียลไทม์
3. ระบบใน web app FINE Model จะทำหน้าที่โต้ตอบและให้คำแนะนำป้อนกลับ (Feedback) เกี่ยวกับความถูกต้องของไวยากรณ์ ความเร็วในการพูด และความชัดเจนของสำเนียง ผู้เรียนฝึกฝนซ้ำๆ จนกว่าจะเกิดความมั่นใจและผ่านเกณฑ์การประเมินจากระบบ AI',
  'การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน Restaurant Simulation (55 นาที)
1. ครูแบ่งผู้เรียนออกเป็นกลุ่ม กลุ่มละ 4-5 คน เพื่อจัดกิจกรรมในพื้นที่จำลอง Restaurant Simulation (หน้าประตูล็อบบี้ห้องอาหาร)
2. สถานการณ์จำลอง: แต่ละกลุ่มจะได้รับ "การ์ดบทบาทลูกค้า" ที่มีความหลากหลาย เช่น ลูกค้าธุรกิจที่รีบร้อน, ลูกค้าครอบครัวที่มีเด็กเล็ก, หรือลูกค้าชาวต่างชาติที่ไม่มีการจองโต๊ะล่วงหน้า
3. สมาชิกในกลุ่มต้องผลัดกันสวมบทบาทเป็น พนักงานต้อนรับ (Host/Hostess) และ พนักงานบริการ (Server) ในการเดินเข้าไปทักทาย แนะนำตนเอง และแก้ไขปัญหาตามสถานการณ์ที่ได้รับ โดยใช้สำนวนภาษาอังกฤษและภาษากายที่สุภาพ
4. ครูคอยสังเกตการณ์ ให้คำแนะนำ และเพิ่มความท้าทายหน้างาน เพื่อทดสอบไหวพริบและการแก้ปัญหาเฉพาะหน้าของผู้เรียน',
  'การลงมือปฏิบัติจริง (35 นาที)
1. สมาชิกแต่ละกลุ่มส่งตัวแทนออกมาปฏิบัติการต้อนรับลูกค้า และแนะนำตนเองใน Restaurant Simulation เพื่อทดสอบสมรรถนะรายบุคคล
2. ผู้เรียนคนอื่นๆ ร่วมกันวิเคราะห์และประเมินผลการแสดงออกของเพื่อน โดยเน้นที่บุคลิกภาพ น้ำเสียง และความถูกต้องของภาษา
3. ผู้เรียนทุกคนทำ Quiz ออนไลน์ผ่าน web app FINE Model เพื่อทดสอบความรู้ความเข้าใจเกี่ยวกับสำนวนและขั้นตอนการต้อนรับตามมาตรฐานสากล
4. ครูประเมินสมรรถนะการณ์ ในการปฏิบัติงานของผู้เรียนรายกลุ่ม และรายบุคคลด้วยเกณฑ์ Rubrics',
  'ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)
1. Reflection: ครูและผู้เรียนร่วมกันสรุปหลักการสำคัญ: หัวใจของการต้อนรับคือความจริงใจและความสุภาพ, สำนวนภาษาอังกฤษที่เหมาะสมช่วยยกระดับมาตรฐานห้องอาหาร, และการนำข้อผิดพลาดจากการฝึกฝนร่วมกับ web app FINE Model มาพัฒนาบุคลิกภาพของตนเอง
2. ผู้เรียนทำกิจกรรม Exit Ticket: เขียนประโยคกล่าวต้อนรับ และแนะนำตนเอง ในบทบาทที่ได้รับ แต่ยังคงความสุภาพเป็นภาษาอังกฤษคนละ 1 ชุด พร้อมบอกความรู้สึกหลังการฝึกปฏิบัติ ส่งครูก่อนออกจากห้องเรียน',
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

-- 2. Insert Week 5 Assignments for ครูพิมพ์
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-555555555501',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-5',
  'สัปดาห์ที่ 5 [F]: ใบงาน Worksheet สำนวนการกล่าวต้อนรับและการแนะนำตนเอง',
  'ให้นักเรียนทำแบบฝึกหัดเกี่ยวกับสำนวนการกล่าวต้อนรับตามช่วงเวลา การแนะนำตนเอง และการสอบถามข้อมูลการจองโต๊ะอาหาร พร้อมตอบคำถามเรื่องหลักการใช้ภาษาท่าทาง (Non-verbal Communication)',
  'Familiarize',
  20,
  NOW() + interval '35 days',
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
  'a1111111-1111-4111-8111-555555555502',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-5',
  'สัปดาห์ที่ 5 [I]: ฝึกสนทนาต้อนรับลูกค้าและรับ AI Feedback ผ่านระบบเสียง',
  'ให้นักเรียนฝึกพูดกล่าวต้อนรับ แนะนำตนเอง และสอบถามการจองโต๊ะอาหารกับ AI Support ในระบบเว็บแอปแบบเรียลไทม์ พร้อมบันทึกคำแนะนำป้อนกลับด้านไวยากรณ์ ความเร็ว และสำเนียงลงในแบบบันทึก',
  'Interact',
  20,
  NOW() + interval '35 days',
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
  'a1111111-1111-4111-8111-555555555503',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-5',
  'สัปดาห์ที่ 5 [N]: สถานการณ์จำลอง Restaurant Simulation รับบทบาท Host/Server ต้อนรับลูกค้า 3 รูปแบบ',
  'ให้นักเรียนสลับบทบาทเป็นพนักงานต้อนรับ (Host) และพนักงานบริการ (Server) ปฏิบัติการต้อนรับลูกค้าจริงตามการ์ดบทบาทสมมุติ (ลูกค้ารีบร้อน, ครอบครัว, ลูกค้าไม่จองล่วงหน้า) พร้อมแก้ไขสถานการณ์เฉพาะหน้า',
  'Navigate',
  20,
  NOW() + interval '35 days',
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
  'a1111111-1111-4111-8111-555555555504',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-5',
  'สัปดาห์ที่ 5 [E]: กิจกรรม Exit Ticket แก้ไขสถานการณ์เฉพาะหน้า และ Quiz สัปดาห์ที่ 5',
  'ให้ตัวแทนแสดงบทบาทสมมุติการต้อนรับหน้าห้อง, ผู้เรียนทุกคนทำ Quiz ออนไลน์เรื่อง Greeting & Welcoming Expressions และเขียน Exit Ticket ประโยคต้อนรับตามบทบาทที่ได้รับส่งครูก่อนจบคลาส',
  'Exhibit',
  20,
  NOW() + interval '35 days',
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
