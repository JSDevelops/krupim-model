-- Migration 032: Add Week 16 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 16: Handling Customer Complaints (7.2 Service Recovery)
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
  'lesson-plan-week-16',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 16: Handling Customer Complaints (7.2 Service Recovery: การแก้ไขสถานการณ์เฉพาะหน้าและสร้างความพึงพอใจตามมาตรฐานสากล)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 16',
  'การชดเชยและรักษาคุณภาพการให้บริการ (Service Recovery) เป็นกระบวนการเปลี่ยนวิกฤตความไม่พึงพอใจของลูกค้าให้กลับมาเป็นความประทับใจและความภักดีต่อองค์กร พนักงานบริการอาหารและเครื่องดื่มจำเป็นต้องเรียนรู้วิธีวิเคราะห์ความรุนแรงของข้อร้องเรียน การตัดสินใจมอบสิ่งชดเชยที่เหมาะสมตามข้อกำหนดของสถานประกอบการ และการใช้ทักษะภาษาอังกฤษเพื่อยื่นข้อเสนอ การปิดการสนทนาอย่างราบรื่น โดยการจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับระบบประมวลผลอัจฉริยะ Gemini และ Gemini Live ผ่าน web app FINE Model ในการจำลองบทสนทนาโต้ตอบทางเสียงเพื่อฝึกการเจรจาต่อรองในสถานการณ์กดดัน ควบคู่กับกิจกรรมห้องอาหารจำลอง (Restaurant Simulation) เพื่อสร้างทักษะการตัดสินใจแก้ปัญหาเฉพาะหน้าและการบริการที่เป็นเลิศตามมาตรฐานโรงแรม',
  '[
    "อธิบายขั้นตอนการกู้คืนคุณภาพบริการ (Service Recovery Process) ตามมาตรฐานสากลได้อย่างถูกต้อง",
    "ระบุโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการเสนอทางเลือก การชดเชย และการสร้างความพึงพอใจต่อลูกค้าได้ถูกต้อง",
    "บอกหลักเกณฑ์และขอบเขตหน้าที่ของพนักงานในการมอบสิ่งชดเชย (เช่น การเปลี่ยนจานใหม่ การมอบส่วนลด หรือเครื่องดื่มสมนาคุณ) ได้"
  ]'::jsonb,
  '[
    "พูดนำเสนอทางเลือก และวิธีแก้ไขปัญหาให้แก่ลูกค้าเป็นภาษาอังกฤษได้อย่างเหมาะสม",
    "ประยุกต์ใช้ระบบ Gemini Live ในการเจรจาระงับความขัดแย้งและยื่นข้อเสนอชดเชยทางเสียงได้ถูกต้อง",
    "ปฏิบัติขั้นตอนการชดเชยความพึงพอใจของลูกค้าในสถานการณ์จำลองหน้างานได้อย่างถูกต้อง"
  ]'::jsonb,
  '[
    "แสดงออกถึงความรับผิดชอบและจรรยาบรรณในการแก้ไขความผิดพลาด",
    "มีความยืดหยุ่นและใจเย็นในการเผชิญหน้ากับพฤติกรรมเรียกร้องของลูกค้า (Customer-Centric Mindset)",
    "มีความเชื่อมั่นและกล้าตัดสินใจภายใต้กฎระเบียบของห้องอาหาร"
  ]'::jsonb,
  '[
    "สามารถวิเคราะห์ระดับความรุนแรงของปัญหา และเลือกใช้วิธีการชดเชยที่เหมาะสมกับสถานการณ์จริงได้",
    "สรุปรายงานข้อร้องเรียนและการแก้ไขปัญหา (Service Recovery Log) เพื่อส่งต่อข้อมูลและป้องกันการเกิดซ้ำได้อย่างเป็นระบบ",
    "พลิกสถานการณ์วิกฤตหน้างานให้ลูกค้าเปลี่ยนจากความโกรธเป็นความพึงพอใจต่อการรับบริการ และยอมรับข้อเสนอชดเชย"
  ]'::jsonb,
  '[
    {"word": "Service Recovery", "meaning": "การชดเชยและกู้คืนคุณภาพการให้บริการเมื่อเกิดข้อผิดพลาด"},
    {"word": "Compensate", "meaning": "การชดเชยความเสียหายหรือความไม่พึงพอใจ"},
    {"word": "On the house / Complimentary", "meaning": "การมอบให้ฟรีโดยทางร้านรับผิดชอบค่าใช้จ่าย (สมนาคุณ)"},
    {"word": "Waive the charge", "meaning": "การยกเว้นค่าบริการหรือยกเลิกการคิดเงินรายการนั้น"},
    {"word": "Replacement", "meaning": "การเปลี่ยนอาหารจานใหม่ทดแทนจานเดิม"},
    {"word": "Discount", "meaning": "การมอบส่วนลดพิเศษเพื่อชดเชยความรู้สึก"},
    {"word": "Service Recovery Matrix", "meaning": "ตารางเกณฑ์การตัดสินใจมอบสิ่งชดเชยตามระดับปัญหา"},
    {"word": "Guest Complaint & Recovery Log", "meaning": "แบบฟอร์มบันทึกข้อร้องเรียนและการฟื้นฟูบริการ"},
    {"word": "Customer-Centric Mindset", "meaning": "กรอบความคิดที่ยึดความพึงพอใจของลูกค้าเป็นศูนย์กลาง"},
    {"word": "Offering Solutions", "meaning": "การนำเสนอทางเลือกและวิธีแก้ไขปัญหาอย่างสร้างสรรค์"},
    {"word": "Follow-up & Closing", "meaning": "การติดตามความพึงพอใจหลังแก้ไขและการปิดการสนทนา"},
    {"word": "Unseen Scenario", "meaning": "สถานการณ์จำลองเฉพาะหน้าแบบไม่แจ้งโจทย์ล่วงหน้า"}
  ]'::jsonb,
  '[
    "To make up for this, we would like to offer you a complimentary dessert.",
    "I would be happy to replace this dish for you immediately. It will take about 5 minutes.",
    "Is everything to your satisfaction now, sir/madam?",
    "Thank you for your patience and understanding. Enjoy the rest of your meal."
  ]'::jsonb,
  '[
    "ครูเปิดแถลงการณ์จำลองภาพนิ่งหรือกรณีศึกษาจริงของโรงแรมระดับโลกที่พลิกสถานการณ์จากลูกค้าที่กำลังจะรีวิว 1 ดาว ให้กลับมารีวิว 5 ดาว ด้วยกระบวนการกู้คืนบริการที่ยอดเยี่ยม",
    "กิจกรรมกระตุ้นคิด (Brainstorming): ครูตั้งคำถามชวนคิด: ''หากเราขอโทษลูกค้าอย่างจริงใจแล้ว แต่ลูกค้ายังคงไม่พึงพอใจและต้องการเปลี่ยนจานใหม่ทันที เราควรเสนอสิ่งใดเพิ่มเติมเพื่อรักษาความรู้สึกของลูกค้า?'' และ ''คำว่า On the house กับ Free of charge ในงานโรงแรมสร้างความรู้สึกให้ลูกค้าแตกต่างกันอย่างไร?''",
    "ผู้เรียนร่วมกันอภิปราย ครูสรุปเชื่อมโยงเข้าสู่เรื่องการชดเชยและแก้ไขสถานการณ์เฉพาะหน้า (Service Recovery)"
  ]'::jsonb,
  '[
    "F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)",
    "ครูให้ผู้เรียนสแกน QR Code Learning Access เพื่อศึกษาลำดับขั้นการตัดสินใจ ''Service Recovery Matrix'' (การจับคู่ประเภทปัญหาขั้นวิกฤตกับสิ่งชดเชยที่เหมาะสม)",
    "ผู้เรียนใช้ฟังก์ชัน AI Scan สแกนใบงานกรณีวิเคราะห์ (Recovery Scenario Cards) เพื่อศึกษาโครงสร้างประโยคภาษาอังกฤษในการยื่นข้อเสนอและขอยกเว้นค่าบริการอย่างเป็นทางการ",
    "ผู้เรียนสรุปแนวทางและคำศัพท์ที่สำคัญลงในบันทึกผล AI Scan Learning Record"
  ]'::jsonb,
  '[
    "I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)",
    "ผู้เรียนเข้าใช้งานแอปพลิเคชัน Gemini และเปิดโหมดสนทนาเสียง Gemini Live บนสมาร์ตโฟน",
    "ภารกิจที่ 1 (Negotiation Challenge): ผู้เรียนตั้ง Prompt ให้ Gemini สวมบทบาทเป็น ''ลูกค้าผู้เข้มงวดที่ปฏิเสธคำขอโทษ และต้องการโพสต์ร้องเรียนลงโซเชียลมีเดียเนื่องจากพบสิ่งแปลกปลอมในอาหาร'' ผู้เรียนต้องใช้ Gemini Live พูดเจรจายื่นข้อเสนอชดเชย (เช่น การเปลี่ยนอาหารจานใหม่พร้อมมอบส่วนลด 20%) เป็นภาษาอังกฤษเพื่อโน้มน้าวใจให้ลูกค้ายอมรับ",
    "ภารกิจที่ 2 (Satisfaction Check): ผู้เรียนต้องฝึกพูดประโยคติดตามผลเพื่อทวนสอบความพึงพอใจหลังการชดเชยด้วยน้ำเสียงที่สุภาพและจริงใจ หาก AI ตรวจพบว่าน้ำเสียงของผู้เรียนไม่มีความกระตือรือร้น AI จะจำลองปฏิกิริยาไม่ยอมรับข้อเสนอ",
    "ผู้เรียนบันทึกแนวทางคำพูดที่สำเร็จและผล Feedback จาก AI ลงใน AI Learning Record"
  ]'::jsonb,
  '[
    "N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)",
    "ครูใช้พื้นที่ห้องปฏิบัติการห้องอาหารจำลอง (Restaurant Simulation) ในการจัดกิจกรรม ''The Ultimate Service Recovery Challenge''",
    "ครูและกลุ่มผู้เรียนสลับบทบาทเป็นกลุ่มลูกค้าที่เผชิญปัญหาร้ายแรงหน้างาน (เช่น ระบบแจ้งออเดอร์ตกหล่นทำให้รอนานกว่า 30 นาที หรือพนักงานทำเครื่องดื่มหกรดเสื้อผ้าของลูกค้า)",
    "ผู้เรียนที่ปฏิบัติหน้าที่พนักงานต้องเข้าควบคุมสถานการณ์ นำหลักการแก้ปัญหาเฉพาะหน้ามาใช้ พูดประโยคยื่นข้อเสนอชดเชยตามขอบเขตในการตัดสินใจ และปฏิบัติขั้นตอนทดแทนบริการอย่างรวดเร็ว พร้อมทั้งบันทึกข้อมูลลงใน Guest Complaint & Recovery Log"
  ]'::jsonb,
  '[
    "E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)",
    "สุ่มผู้เรียนออกมารับสถานการณ์จำลองแบบสด (Unseen Scenario) หน้าชั้นเรียนทีละคู่ เพื่อทดสอบไหวพริบ และการใช้ภาษาอังกฤษในการระงับเหตุและชดเชยบริการ",
    "ผู้เรียนทุกคนทำควิซออนไลน์ (Quiz) ผ่าน web app FINE Model เพื่อทดสอบความรู้ความเข้าใจเกี่ยวกับหลักเกณฑ์การชดเชย และโครงสร้างประโยค Service Recovery",
    "ครูประเมินผลการปฏิบัติงานตามเกณฑ์มาตรฐาน Rubrics"
  ]'::jsonb,
  '[
    "Reflection: ครูชวนผู้เรียนร่วมสรุปบทเรียน: ''การทำ Service Recovery ที่ดี ไม่ใช่แค่การให้ของฟรี แต่คือการแสดงความใส่ใจและความรับผิดชอบที่เหนือความคาดหมายของลูกค้า''",
    "ผู้เรียนทำกิจกรรม Exit Ticket: ระบุ 1 วิธีการชดเชยที่คิดว่ามีประสิทธิภาพที่สุด และเขียนประโยคภาษาอังกฤษในการเสนอสิ่งสมนาคุณ 1 ประโยค ส่งครูผ่านระบบออนไลน์ก่อนจบคาบเรียน"
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

-- 2. Insert or update 4 assignments for Week 16
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-161616161601',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-16',
  'สัปดาห์ที่ 16 [F]: ใบงานคำศัพท์ Service Recovery, วิเคราะห์ Service Recovery Matrix ด้วย AI Scan',
  'สแกน QR Code ศึกษาตารางเกณฑ์ตัดสินใจ Service Recovery Matrix, ใช้ AI Scan สแกน Recovery Scenario Cards เพื่อศึกษาโครงสร้างประโยคยื่นข้อเสนอและขอยกเว้นค่าบริการ และทำแบบฝึกหัดคำศัพท์เกี่ยวกับการชดเชยพร้อมเติมประโยคเสนอวิธีแก้ไขและติดตามผล',
  'Familiarize',
  20,
  NOW() + interval '112 days',
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
  'a1111111-1111-4111-8111-161616161602',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-16',
  'สัปดาห์ที่ 16 [I]: ฝึกเจรจายื่นข้อเสนอชดเชยและติดตามความพึงพอใจผ่าน Gemini Live',
  'ฝึกฝนผ่าน Gemini Live ใน 2 ภารกิจ: 1) Negotiation Challenge เจรจาโน้มน้าวลูกค้ายากที่ปฏิเสธคำขอโทษและจะโพสต์โซเชียลด้วยข้อเสนอเปลี่ยนจานและส่วนลด 2) Satisfaction Check ตรวจสอบความพึงพอใจด้วยน้ำเสียงที่กระตือรือร้นจริงใจ พร้อมบันทึกลงใน AI Learning Record',
  'Interact',
  20,
  NOW() + interval '112 days',
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
  'a1111111-1111-4111-8111-161616161603',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-16',
  'สัปดาห์ที่ 16 [N]: กิจกรรม SBL The Ultimate Service Recovery Challenge และบันทึก Recovery Log',
  'เข้าร่วมสถานการณ์จำลองวิกฤตหน้างาน (เช่น ออเดอร์ตกหล่นรอนาน 30 นาที หรือทำเครื่องดื่มหกรดเสื้อผ้า) ตัดสินใจยื่นข้อเสนอชดเชยตามขอบเขตอำนาจหน้าที่อย่างรวดเร็ว และบันทึกรายงานลงในแบบฟอร์ม Guest Complaint & Recovery Log',
  'Navigate',
  20,
  NOW() + interval '112 days',
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
  'a1111111-1111-4111-8111-161616161604',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-16',
  'สัปดาห์ที่ 16 [E]: ทดสอบสถานการณ์จำลองสด Unseen Scenario, Quiz และ Exit Ticket สิ่งสมนาคุณ',
  'สุ่มจับคู่รับสถานการณ์จำลองสดหน้าชั้นเรียน (Unseen Scenario) เพื่อทดสอบไหวพริบและการใช้ภาษาอังกฤษตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Service Recovery Strategies & Expressions และส่ง Exit Ticket ระบุ 1 วิธีชดเชยที่ดีที่สุดพร้อม 1 ประโยคเสนอสิ่งสมนาคุณ',
  'Exhibit',
  20,
  NOW() + interval '112 days',
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
