-- Migration 031: Add Week 15 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 15: Handling Customer Complaints (7.1 Handling Customer Complaints)
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
  'lesson-plan-week-15',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 15: Handling Customer Complaints (7.1 Handling Customer Complaints: การรับฟังปัญหาและการตอบสนองต่อข้อร้องเรียนอย่างเหมาะสม)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 15',
  'การจัดการข้อร้องเรียนของลูกค้าเป็นทักษะที่มีความสำคัญ ในงานบริการอาหารและเครื่องดื่ม พนักงานจำเป็นต้องมีความรู้ความเข้าใจเกี่ยวกับจิตวิทยาบริการ กระบวนการรับฟังอย่างใส่ใจ และสามารถใช้ภาษาอังกฤษเพื่อการแสดงความเสียใจ และแสดงความรับผิดชอบได้อย่างมืออาชีพ โดยการจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับระบบประมวลผลอัจฉริยะ Gemini และ Gemini Live ในการฝึกฝนบทสนทนาโต้ตอบเสมือนจริงทางเสียง ควบคู่กับการใช้ฟังก์ชัน AI Scan ร่วมกับสถานการณ์จำลอง (Simulation-Based Learning) โดยใช้เทคโนโลยีผ่าน web app FINE Model เพื่อพัฒนาสมรรถนะการสื่อสารภาษาอังกฤษในวิชาชีพการโรงแรม',
  '[
    "อธิบายหลักการและขั้นตอนการรับมือข้อร้องเรียน (เช่น หลัก LAST: Listen, Apologize, Solve, Thank) ได้อย่างถูกต้อง",
    "ระบุโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการแสดงความเสียใจและการยอมรับข้อผิดพลาดได้ถูกต้อง",
    "จำแนกประเภทของข้อร้องเรียนในห้องอาหาร (ด้านอาหาร ด้านบริการ และด้านสิ่งแวดล้อม) ได้"
  ]'::jsonb,
  '[
    "ใช้ประโยคภาษาอังกฤษในการพูดตอบสนองต่อข้อร้องเรียนของลูกค้าได้อย่างสุภาพและเป็นมืออาชีพ",
    "ประยุกต์ใช้ระบบ Gemini และ Gemini Live ผ่าน web app FINE Model ในการฝึกฟังและโต้ตอบบทสนทนาข้อร้องเรียนทางเสียงได้อย่างลื่นไหล",
    "ปฏิบัติงานและแสดงพฤติกรรมการรับฟังอย่างใส่ใจ (Active Listening) ในสถานการณ์จำลองได้ถูกต้อง"
  ]'::jsonb,
  '[
    "ความอดทน อดกลั้น และสามารถควบคุมอารมณ์ภายใต้สภาวะกดดันได้ดี",
    "เจตคติที่ดีต่อการจัดการข้อร้องเรียน โดยมองว่าเป็นโอกาสในการพัฒนาบริการ (Service Mind)",
    "บุคลิกภาพ และภาษากายที่เหมาะสม ในการปฏิสัมพันธ์กับผู้รับบริการ"
  ]'::jsonb,
  '[
    "ประยุกต์ใช้ทักษะภาษาอังกฤษ และหลักการรับฟังเพื่อระงับอารมณ์ของลูกค้าในสถานการณ์วิกฤตได้จริง",
    "เลือกแนวทางการรายงานปัญหา และประสานงานต่อไปยังผู้เกี่ยวข้องได้อย่างเหมาะสม",
    "ประยุกต์ใช้คำศัพท์และจิตวิทยาบริการในการคลายความตึงเครียดของลูกค้าในห้องอาหารจำลองได้"
  ]'::jsonb,
  '[
    {"word": "Complaint", "meaning": "ข้อร้องเรียน / คำตำหนิของลูกค้า"},
    {"word": "Apologize", "meaning": "การกล่าวคำขออภัยอย่างเป็นทางการ"},
    {"word": "Dissatisfied", "meaning": "ไม่พึงพอใจในอาหารหรือการบริการ"},
    {"word": "Inconvenience", "meaning": "ความไม่สะดวกสบายที่เกิดขึ้นแก่ลูกค้า"},
    {"word": "Immediate action", "meaning": "การดำเนินการแก้ไขปัญหาในทันที"},
    {"word": "LAST Model", "meaning": "ขั้นตอนรับมือข้อร้องเรียน (Listen, Apologize, Solve, Thank)"},
    {"word": "Active Listening", "meaning": "การรับฟังอย่างตั้งใจและไม่โต้แย้ง"},
    {"word": "Gathering Information", "meaning": "การสอบถามข้อมูลเพิ่มเติมเพื่อตรวจสอบข้อเท็จจริง"},
    {"word": "Frustration", "meaning": "ความหงุดหงิดหรือความคับข้องใจของลูกค้า"},
    {"word": "Sincere apologies", "meaning": "คำขออภัยอย่างจริงใจจากใจจริง"},
    {"word": "Crisis Control Room", "meaning": "ห้องปฏิบัติการจำลองสถานการณ์วิกฤตการบริการ"},
    {"word": "Tone of Voice", "meaning": "น้ำเสียงที่นุ่มนวลและแสดงความเห็นอกเห็นใจ"}
  ]'::jsonb,
  '[
    "I am terribly sorry for the inconvenience, sir/madam.",
    "Please accept our sincere apologies for this mistake.",
    "I understand your frustration, and I will look into this right away.",
    "Could you please tell me more about what happened?",
    "I deeply apologize for this, sir. Let me replace this dish for you immediately."
  ]'::jsonb,
  '[
    "ครูเปิดคลิปวิดีโอสถานการณ์จำลอง ''A Disgruntled Guest in a Luxury Restaurant'' (ลูกค้าที่ไม่พอใจอย่างรุนแรงในห้องอาหาร) เพื่อให้ผู้เรียนสังเกตปฏิกิริยาของลูกค้าและพนักงาน",
    "กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเพื่อเชื่อมโยงความรู้สึกและประสบการณ์: ''จากวิดีโอ หากนักเรียนเป็นพนักงานบริการ สิ่งแรกที่ต้องทำเมื่อลูกค้าเริ่มส่งเสียงดังคืออะไร?'' และ ''ถ้านักเรียนใช้คำว่า It is not my fault (ไม่ใช่ความผิดของฉัน) กับลูกค้า จะเกิดอะไรขึ้นตามมา?''",
    "ผู้เรียนร่วมกันแสดงความคิดเห็นอย่างอิสระ ครูเชื่อมโยงเข้าสู่วัตถุประสงค์การเรียนรู้"
  ]'::jsonb,
  '[
    "F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)",
    "ครูแจกใบงานกรณีศึกษาข้อร้องเรียน (Complaint Case Studies) ประเภทต่างๆ",
    "ผู้เรียนใช้เครื่องมือ AI Scan สแกนรูปภาพในใบงานเพื่อวิเคราะห์ระดับอารมณ์ของลูกค้าและระบุประเภทของปัญหา (เช่น อาหารดิบเกินไป พนักงานเสิร์ฟผิดโต๊ะ หรือรอนาน)",
    "ผู้เรียนศึกษาประโยคตัวอย่างภาษาอังกฤษที่ระบบแสดงขึ้นมาเพื่อเป็นแนวทางในการตอบสนอง จากนั้นบันทึกข้อมูลลงใน AI Scan Learning Record ผ่าน web app FINE Model",
    "ภารกิจกลุ่มย่อย: ผู้เรียนร่วมกันจัดกลุ่มข้อร้องเรียนและฝึกจับคู่คำศัพท์ภาษาอังกฤษที่แสดงถึงความรู้สึกของลูกค้าและขั้นตอน LAST Model"
  ]'::jsonb,
  '[
    "I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)",
    "ครูมอบหมายภารกิจฝึกการฟัง และการพูดโต้ตอบข้อร้องเรียน โดยใช้ระบบ Gemini และ Gemini Live",
    "ผู้เรียนเปิดแอปพลิเคชันและใช้งานโหมดสนทนาทางเสียงกับ Gemini Live โดยกำหนดบทบาทให้ AI เป็น ''ลูกค้าที่กำลังโกรธเนื่องจากพบเส้นผมในจานอาหาร''",
    "ผู้เรียนต้องฝึกฟังข้อร้องเรียนภาษาอังกฤษจาก AI และตอบโต้ด้วยประโยคกล่าวขออภัยอย่างเป็นทางการตามโครงสร้าง เช่น ''I deeply apologize for this, sir. Let me replace this dish for you immediately.''",
    "จับคู่ฝึกปฏิบัติ (Pair Work): ผู้เรียนสลับกันฝึกโต้ตอบ โดยมี AI คอยให้คะแนนและคำแนะนำด้านน้ำเสียง (Tone of Voice) สุภาพ และความถูกต้อง บันทึกลงใน Gemini Live Session Log"
  ]'::jsonb,
  '[
    "N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)",
    "ครูแบ่งผู้เรียนเป็นทีม ทีมละ 4-5 คน เพื่อเข้าร่วมสถานการณ์จำลอง ''Crisis Control Room'' ในห้องปฏิบัติการห้องอาหารจำลอง (Restaurant Simulation)",
    "สถานการณ์จำลอง: ครูหรือตัวแทนผู้เรียนสวมบทบาทเป็นลูกค้าที่เข้ามาตำหนิบริการอย่างรุนแรงหน้างาน",
    "ผู้เรียนในทีมต้องประยุกต์ใช้หลักการฟังอย่างใส่ใจ (Active Listening) ห้ามพูดแทรก แสดงภาษากายที่เหมาะสม และกล่าวประโยคภาษาอังกฤษเพื่อระงับอารมณ์ของลูกค้าให้สงบลง",
    "ครูเพิ่มความท้าทายโดยเปลี่ยนเงื่อนไขข้อร้องเรียนกลางคัน เพื่อให้ผู้เรียนใช้ทักษะการคิดแก้ปัญหาเฉพาะหน้า"
  ]'::jsonb,
  '[
    "E – Exhibit Professional Performance : การลงมือปฏิบัติจริง (35 นาที)",
    "แต่ละทีมส่งตัวแทนออกมาแสดงบทบาทสมมติในการรับมือกับข้อร้องเรียนภาษาอังกฤษหน้าชั้นเรียน โดยครูและเพื่อนร่วมกันประเมิน",
    "ผู้เรียนทุกคนทำ Quiz ทดสอบสำนวนและประโยคภาษาอังกฤษในการจัดการข้อร้องเรียนผ่าน web app FINE Model",
    "ครูประเมินสมรรถนะการปฏิบัติงานรายกลุ่มด้วยเกณฑ์ Rubrics"
  ]'::jsonb,
  '[
    "Reflection: ครูและผู้เรียนร่วมกันสรุปบทเรียน: ความสำคัญของการฟังโดยไม่แก้ตัว ทักษะการสบตา และการเลือกใช้คำศัพท์ภาษาอังกฤษที่แสดงความเห็นใจลูกค้า",
    "ผู้เรียนทำกิจกรรม Exit Ticket: เขียนประโยคภาษาอังกฤษที่ทรงประสิทธิภาพที่สุด 3 ประโยคในการจัดการกับความโกรธของลูกค้า ส่งผ่านระบบออนไลน์ก่อนออกจากห้องเรียน"
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

-- 2. Insert or update 4 assignments for Week 15
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-151515151501',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-15',
  'สัปดาห์ที่ 15 [F]: ใบงานคำศัพท์ข้อร้องเรียน, ขั้นตอน LAST Model และ AI Scan วิเคราะห์อารมณ์',
  'ใช้ฟังก์ชัน AI Scan สแกนภาพกรณีศึกษาในใบงานเพื่อวิเคราะห์ระดับอารมณ์และประเภทข้อร้องเรียน (อาหาร/บริการ/สิ่งแวดล้อม), ทำแบบฝึกหัดคำศัพท์ จับคู่ขั้นตอน LAST Model (Listen, Apologize, Solve, Thank) และเติมโครงสร้างประโยคขออภัย',
  'Familiarize',
  20,
  NOW() + interval '105 days',
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
  'a1111111-1111-4111-8111-151515151502',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-15',
  'สัปดาห์ที่ 15 [I]: ฝึกสนทนารับมือลูกค้าโกรธ (พบสิ่งแปลกปลอมในจาน) ผ่าน Gemini Live',
  'ฝึกซ้อมผ่าน Gemini Live โต้ตอบกับ AI ในบทบาทลูกค้ากำลังโกรธเนื่องจากพบสิ่งแปลกปลอมในจานอาหาร ใช้สำนวนขออภัยอย่างเป็นทางการและเสนอเปลี่ยนจานทันที พร้อมรับประเมิน Tone of Voice บันทึกลง Gemini Live Session Log',
  'Interact',
  20,
  NOW() + interval '105 days',
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
  'a1111111-1111-4111-8111-151515151503',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-15',
  'สัปดาห์ที่ 15 [N]: สถานการณ์จำลองห้องอาหาร Crisis Control Room รับมือข้อร้องเรียนรุนแรง',
  'แบ่งกลุ่มเข้าจำลองสถานการณ์ Crisis Control Room รับมือลูกค้าที่เข้ามาตำหนิบริการอย่างรุนแรงหน้างาน ประยุกต์ใช้หลักการฟังอย่างใส่ใจ (Active Listening) แสดงภาษากายสุภาพ และระงับอารมณ์ลูกค้าพร้อมรับมือเงื่อนไขเปลี่ยนกลางคัน',
  'Navigate',
  20,
  NOW() + interval '105 days',
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
  'a1111111-1111-4111-8111-151515151504',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-15',
  'สัปดาห์ที่ 15 [E]: สาธิตการรับมือข้อร้องเรียนสดหน้าชั้นเรียน, Quiz ออนไลน์ และส่ง Exit Ticket',
  'สุ่มตัวแทนสาธิตการรับมือข้อร้องเรียนภาษาอังกฤษสดหน้าชั้นเรียนตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Handling Customer Complaints และส่ง Exit Ticket เขียนประโยคภาษาอังกฤษ 3 ประโยคในการจัดการความโกรธของลูกค้า',
  'Exhibit',
  20,
  NOW() + interval '105 days',
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
