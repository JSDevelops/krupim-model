-- Migration 025: Add Week 9 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 9: Taking Food Orders (5.1 Taking Orders Pattern)
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
  'lesson-plan-week-9',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 9: Taking Food Orders (5.1 Taking Orders Pattern: รูปประโยคการรับออเดอร์ คำถาม และคำตอบที่ใช้บ่อย)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 9',
  'การรับคำสั่งอาหารและเครื่องดื่ม (Taking Food and Beverage Orders) ถือเป็นขั้นตอนหัวใจสำคัญในการบริการของห้องอาหาร พนักงานบริการจำเป็นต้องมีความเชี่ยวชาญในการใช้รูปประโยคภาษาอังกฤษที่เป็นมาตรฐานสากล สุภาพ และถูกต้องตามหลักการบริการ รวมถึงสามารถใช้คำถามเจาะลึกเพื่อตรวจสอบความต้องการที่ถูกต้องของลูกค้า เช่น ระดับความสุกของเนื้อ หรือประเภทของเครื่องเคียง การจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยีปัญญาประดิษฐ์ผ่าน web app FINE Model ตลอดจนการเรียนรู้ผ่านสถานการณ์จำลอง (Simulation-Based Learning) เพื่อเสริมสร้างความมั่นใจและความแม่นยำในการสื่อสารภาษาอังกฤษในวิชาชีพการโรงแรม',
  '[
    "บอกรูปประโยคและสำนวนภาษาอังกฤษในการแนะนำตัวและเริ่มต้นรับออเดอร์ได้อย่างถูกต้อง",
    "ระบุคำถามที่ใช้บ่อยในการถามรายละเอียดอาหาร เช่น ความสุกของสเต็ก น้ำสลัด หรือเครื่องเคียงได้",
    "เข้าใจโครงสร้างประโยคในการจดบันทึกและทวนรายการอาหารเพื่อป้องกันความผิดพลาด"
  ]'::jsonb,
  '[
    "ออกเสียงคำศัพท์และประโยคในการรับออเดอร์ได้อย่างถูกต้อง",
    "ใช้เทคโนโลยีผ่าน web app FINE Model ในการฝึกฝนบทสนทนารับออเดอร์โต้ตอบได้",
    "ปฏิบัติหน้าที่จดบันทึกออเดอร์ด้วยสัญลักษณ์ย่อสากลในสถานการณ์จำลอง (Simulation) ได้"
  ]'::jsonb,
  '[
    "ความเอาใจใส่และความอดทนในการฟังความต้องการของลูกค้า (Active Listening)",
    "บุคลิกภาพที่สุภาพ และยิ้มแย้มแจ่มใส",
    "เจตคติที่ดีและมีจิตบริการ (Service Mind) ต่อวิชาชีพการโรงแรม"
  ]'::jsonb,
  '[
    "เลือกใช้รูปประโยคการรับออเดอร์ที่เหมาะสมกับประเภทและบรรยากาศของห้องอาหารได้",
    "ประยุกต์ใช้ความรู้ในการแก้ปัญหาเมื่อลูกค้าถามคำถามเกี่ยวกับรายละเอียดของอาหารในเมนูได้",
    "นำทักษะการฟังและการถามคำถามไปปรับใช้กับการรับออเดอร์ในสถานการณ์จริงได้อย่างเป็นมืออาชีพ"
  ]'::jsonb,
  '[
    "Order Taking",
    "Order Pad",
    "Steak Doneness",
    "Rare",
    "Medium Rare",
    "Medium",
    "Medium Well",
    "Well Done",
    "Salad Dressing",
    "Side Dish",
    "Active Listening",
    "Repeating Order"
  ]'::jsonb,
  '[
    "Are you ready to order now, sir/madam?",
    "May I take your order, please?",
    "Would you care for any appetizers to start with?",
    "How would you like your steak cooked?",
    "What kind of dressing would you prefer for your salad?",
    "Certainly, sir. One Ribeye steak, medium rare."
  ]'::jsonb,
  'ขั้นนำเข้าสู่บทเรียน (20 นาที)
1. ครูเปิดคลิปวิดีโอสั้นจำลองสถานการณ์การรับออเดอร์ในห้องอาหารเพื่อกระตุ้นการเรียนรู้ เพื่อให้ผู้เรียนเปรียบเทียบพฤติกรรมการรับออเดอร์ของพนักงานสองแบบ
2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูตั้งคำถามเพื่อเชื่อมโยงและกระตุ้นความเห็นของผู้เรียน:
   - "จากวิดีโอ พนักงานคนแรกทำพลาดในจุดไหนบ้างในขณะรับออเดอร์?"
   - "ถ้าลูกค้าสั่งสเต็กแล้วเราลืมถามระดับความสุก จะส่งผลเสียต่อห้องอาหารและห้องครัวอย่างไร?"
3. ผู้เรียนร่วมกันอภิปรายอย่างอิสระ ครูสรุปเชื่อมโยงเข้าสู่วัตถุประสงค์ของการเรียนรูปประโยคการรับออเดอร์มาตรฐาน',
  'ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)
1. ครูแจก Worksheet "The Perfect Order Taking Sheet" ให้แก่ผู้เรียนทุกคน
2. ผู้เรียนใช้แท็บเล็ตหรือสมาร์ตโฟนเปิดระบบคลังข้อมูลสากลเพื่อศึกษาโครงสร้างประโยค "Taking Orders Pattern" ที่ครูเตรียมไว้
3. ภารกิจกลุ่มย่อย: ผู้เรียนร่วมกันจำแนกประโยคภาษาอังกฤษออกเป็น 4 หมวดหลัก ได้แก่ 1) ประโยคเปิดการรับออเดอร์ 2) ประโยคถามรายละเอียด/เครื่องเคียง 3) ประโยคแนะนำเพิ่มเติม และ 4) ประโยคปิดท้าย/ขอบคุณ พร้อมฝึกออกเสียงประโยคเหล่านั้นร่วมกันในกลุ่ม
4. ผู้เรียนสรุปรูปประโยคที่สำคัญลงในใบงานของตนเอง',
  'การปฏิสัมพันธ์และฝึกฝนระบบภาษากับ AI Support ผ่าน web app FINE Model (50 นาที)
1. ครูมอบหมายภารกิจเดี่ยวให้ผู้เรียนใช้แอปพลิเคชันผ่าน web app FINE Model บนสมาร์ตโฟน
2. ผู้เรียนป้อนคำสั่ง (Prompt) ให้ระบบผ่าน web app FINE Model สวมบทบาทเป็นชาวต่างชาติที่เข้ามานั่งทานอาหารในร้าน และพร้อมที่จะสั่งอาหาร โดยผู้เรียนต้องทำหน้าที่เป็นพนักงานบริการที่คอยซักถามข้อมูล
3. ผู้เรียนใช้ฟังก์ชันผ่าน web app FINE Model เพื่อสนทนาโต้ตอบผ่านเสียงจริง โดยฝึกใช้รูปประโยค เช่น "How would you like your steak?" หรือ "Would you prefer fries or mashed potatoes?"
4. ระบบ AI ผ่าน web app FINE Model จะทำการจับเสียงและให้ข้อเสนอแนะ (Feedback) เรื่องการเน้นเสียง (Intonation) และความถูกต้องของไวยากรณ์ ผู้เรียนทำการจดบันทึกสิ่งที่ค้นพบและคำศัพท์ใหม่ลงใน AI Learning Record',
  'การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)
1. ครูแบ่งผู้เรียนออกเป็นกลุ่ม กลุ่มละ 3 คน (สลับบทบาทเป็น: พนักงานบริการ, ลูกค้าคนที่ 1, ลูกค้าคนที่ 2) เพื่อเข้าสู่กิจกรรม "The Order Taking Challenge" ในพื้นที่ห้องปฏิบัติการจำลอง (Restaurant Simulation)
2. ครูแจกการ์ดบทบาทสมมติ (Role-play Cards) ที่มีความท้าทายต่างกัน เช่น "ลูกค้าที่ทานมังสวิรัติและต้องการเปลี่ยนเครื่องเคียงทั้งหมด" หรือ "ลูกค้าที่ต้องการสั่งอาหารชุดใหญ่แต่เลือกน้ำสลัดไม่ถูก"
3. ผู้เรียนที่เป็นพนักงานบริการต้องใช้ทักษะการฟังอย่างมีสติ นำรูปประโยคที่ฝึกฝนมาใช้ซักถาม จดบันทึกออเดอร์ลงในสมุด Order Pad โดยใช้รหัสย่อสากลให้ถูกต้องตามเวลาที่กำหนด
4. ครูเดินสังเกตการณ์ คอยให้คำแนะนำและปรับท่วงท่าการยืน การถือแผ่นจดออเดอร์ให้เหมาะสม',
  'การลงมือปฏิบัติจริง (35 นาที)
1. แต่ละกลุ่มส่งตัวแทนออกมาสาธิตการรับออเดอร์ภาษาอังกฤษแบบสดต่อหน้าชั้นเรียน โดยครูจะทำการสุ่มเพิ่มเงื่อนไขหน้างานเพื่อทดสอบไหวพริบ
2. ครูประเมินสมรรถนะการปฏิบัติงานรายกลุ่มและรายบุคคลด้วยเกณฑ์คะแนน Rubrics
3. ผู้เรียนทุกคนทำแบบทดสอบความรู้รายบุคคล (Quiz) เกี่ยวกับสำนวนภาษาอังกฤษคำถาม-คำตอบที่ใช้บ่อยผ่านระบบออนไลน์',
  'ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)
1. Reflection: ครูและผู้เรียนร่วมกันสรุปบทเรียน: ความสำคัญของการทวนออเดอร์, ความสุภาพในการซักถามรายละเอียดอาหาร, และความมั่นใจที่เพิ่มขึ้นจากการฝึกฝนร่วมกับผ่าน web app FINE Model
2. ผู้เรียนทำกิจกรรม Exit Ticket: เขียนประโยคคำถามในการรับออเดอร์ที่คิดว่าสละสลวยและมั่นใจที่สุดมาคนละ 3 ประโยคลงในกระดาษโน้ตส่งครูก่อนออกจากห้องเรียน',
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

-- 2. Insert Week 9 Assignments for ครูพิมพ์
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-999999999901',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-9',
  'สัปดาห์ที่ 9 [F]: ใบงาน Worksheet โครงสร้างรูปประโยครับออเดอร์ The Perfect Order Taking Sheet',
  'ให้นักเรียนศึกษาโครงสร้างประโยคมาตรฐาน Taking Orders Pattern และทำใบงานจำแนกประโยค 4 หมวด (เปิดรับออเดอร์, สอบถามรายละเอียด/เครื่องเคียง, แนะนำเพิ่มเติม, ปิดท้าย/ขอบคุณ)',
  'Familiarize',
  20,
  NOW() + interval '63 days',
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
  'a1111111-1111-4111-8111-999999999902',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-9',
  'สัปดาห์ที่ 9 [I]: ฝึกสนทนารับออเดอร์กับลูกค้า AI และรับคำแนะนำ Intonation/Grammar',
  'ให้นักเรียนฝึกสนทนาโต้ตอบรับออเดอร์ผ่านเสียงจริงกับ AI ที่รับบทเป็นลูกค้าต่างชาติ ฝึกถามความสุกของเนื้อ เครื่องเคียง และน้ำสลัด พร้อมรับ Feedback เรื่องน้ำเสียงและไวยากรณ์',
  'Interact',
  20,
  NOW() + interval '63 days',
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
  'a1111111-1111-4111-8111-999999999903',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-9',
  'สัปดาห์ที่ 9 [N]: สถานการณ์จำลอง Restaurant Simulation ภารกิจรับออเดอร์ด้วยสมุด Order Pad',
  'ให้นักเรียนแบ่งกลุ่มปฏิบัติหน้าที่พนักงานบริการรับออเดอร์ตามการ์ดบทบาทสมมติ (เช่น ลูกค้ามังสวิรัติขอเปลี่ยนเครื่องเคียง) ฝึกจดบันทึกลงใน Order Pad ด้วยรหัสย่อสากลและทวนรายการอาหารอย่างถูกต้อง',
  'Navigate',
  20,
  NOW() + interval '63 days',
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
  'a1111111-1111-4111-8111-999999999904',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-9',
  'สัปดาห์ที่ 9 [E]: กิจกรรม Exit Ticket สรุปประโยครับออเดอร์ 3 ข้อ และ Quiz สัปดาห์ที่ 9',
  'ให้ตัวแทนสาธิตการรับออเดอร์สดหน้าชั้นเรียนตามเงื่อนไขท้าทาย, ผู้เรียนทุกคนทำ Quiz ออนไลน์เรื่อง Taking Orders Pattern และเขียน Exit Ticket ประโยคคำถามรับออเดอร์ที่มั่นใจ 3 ประโยคส่งก่อนจบคลาส',
  'Exhibit',
  20,
  NOW() + interval '63 days',
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
