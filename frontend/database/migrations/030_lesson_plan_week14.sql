-- Migration 030: Add Week 14 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 14: Handling Special Requests (6.3 Dealing with Unavailable Menu Items)
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
  'lesson-plan-week-14',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 14: Handling Special Requests (6.3 Dealing with Unavailable Menu Items: การจัดการเมื่อเมนูหมดและการนำเสนอทางเลือกอื่นให้ลูกค้า)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 14',
  'การจัดการในกรณีที่รายการอาหารหรือเครื่องดื่มหมด (Dealing with Unavailable Menu Items) เป็นทักษะการแก้ไขสถานการณ์เฉพาะหน้าที่สะท้อนถึงระดับความเป็นมืออาชีพของพนักงานบริการ พนักงานจำเป็นต้องทราบแนวทางปฏิบัติที่ถูกต้องเพื่อลดความไม่พึงพอใจของลูกค้า เรียนรู้โครงสร้างประโยคภาษาอังกฤษในการแจ้งข้อมูลอย่างสุภาพ และฝึกทักษะด้านศิลปะการขาย หรือการแนะนำเมนูทดแทนที่มีลักษณะและมูลค่าใกล้เคียงกัน โดยการจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับระบบคิดวิเคราะห์โต้ตอบอัจฉริยะ (Gemini และ Gemini Live) ฟังก์ชัน AI Scan ผ่าน web app FINE Model และการเรียนรู้ผ่านสถานการณ์จำลองเพื่อเสริมสร้างความมั่นใจและการสื่อสาร',
  '[
    "อธิบายหลักการและขั้นตอนในการแจ้งรายการอาหารหมดตามมาตรฐานการบริการได้",
    "ระบุโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการขออภัยและนำเสนอเมนูทางเลือกอื่นได้อย่างถูกต้อง",
    "จำแนกกลุ่มอาหารทดแทนที่มีลักษณะ รสชาติ หรือวัตถุดิบใกล้เคียงกันเพื่อใช้ในการแนะนำลูกค้าได้"
  ]'::jsonb,
  '[
    "สื่อสารภาษาอังกฤษเพื่อขอโทษและเสนอทางเลือกทดแทนได้และถูกต้อง",
    "ใช้เทคโนโลยี AI Scan ผ่าน web app FINE Model ในการตรวจสอบส่วนผสมของเมนูแนะนำ และใช้ Gemini Live ในการฝึกฝนบทสนทนาโต้ตอบเสียงได้",
    "แสดงทักษะการเจรจาจูงใจเพื่อรักษาบรรยากาศที่ดีและปิดการรับออเดอร์ในสถานการณ์จำลองได้"
  ]'::jsonb,
  '[
    "มีไหวพริบและความยืดหยุ่นในการแก้ไขปัญหาเฉพาะหน้า",
    "มีความมั่นใจในตนเองและควบคุมอารมณ์ภายใต้สถานการณ์กดดันได้ดี",
    "แสดงออกถึงความเห็นใจ และมีความพร้อมที่จะช่วยเหลือลูกค้าตลอดเวลา"
  ]'::jsonb,
  '[
    "ประยุกต์ใช้เทคนิคการจับคู่เมนูทางเลือกเพื่อนำเสนอขายรายการอาหารอื่นแทนรายการที่หมดได้อย่างคล่องแคล่ว",
    "แก้ไขสถานการณ์ในห้องอาหารจำลองเมื่อลูกค้าปฏิเสธตัวเลือกที่พนักงานนำเสนอได้อย่างมืออาชีพ",
    "บูรณาการศิลปะการขาย (Upselling/Cross-selling) ร่วมกับการแก้ปัญหารายการอาหารหมดเพื่อรักษามาตรฐานรายได้และความพึงพอใจ"
  ]'::jsonb,
  '[
    {"word": "Out of stock / Sold out", "meaning": "สินค้าหมด / จำหน่ายหมดแล้ว"},
    {"word": "Unavailable", "meaning": "ไม่พร้อมบริการ / ไม่มีให้บริการในขณะนั้น"},
    {"word": "Ingredient", "meaning": "วัตถุดิบหรือส่วนประกอบในการปรุงอาหาร"},
    {"word": "Alternative / Substitute", "meaning": "สิ่งทดแทน / ทางเลือกอื่นทดแทน"},
    {"word": "Suggesting Alternatives", "meaning": "การนำเสนอและแนะนำเมนูทางเลือก"},
    {"word": "Polite Apologies", "meaning": "การกล่าวคำขออภัยอย่างสุภาพและจริงใจ"},
    {"word": "Menu Substitution Flow", "meaning": "กระบวนการจับคู่รายการอาหารทดแทนตามลำดับขั้นตอน"},
    {"word": "Conflict Situation Cards", "meaning": "การ์ดสถานการณ์จำลองความขัดแย้งและข้อจำกัด"},
    {"word": "Cross-selling", "meaning": "การแนะนำขายสินค้าหรือบริการเสริมเพิ่มเติม"},
    {"word": "Positive Communication", "meaning": "การสื่อสารเชิงบวกเพื่อลดความผิดหวังของลูกค้า"},
    {"word": "Fluency & Hospitality Tone", "meaning": "ความลื่นไหลและน้ำเสียงที่เปี่ยมด้วยจิตบริการ"},
    {"word": "Baked Sea Bass", "meaning": "ปลากะพงอบ (เมนูซีฟู้ดทดแทนปลาแซลมอน)"}
  ]'::jsonb,
  '[
    "I am terribly sorry, sir/madam, but the [Grilled Salmon] is currently unavailable tonight.",
    "Unfortunately, we have just run out of the [Lobster Soup].",
    "However, may I highly recommend our [Baked Sea Bass]? It is also a seafood dish and is freshly caught today.",
    "As an alternative, we have a wonderful [Ribeye Steak] which is prepared in a similar style."
  ]'::jsonb,
  '[
    "ครูจัดกิจกรรม ''เมนูนี้ที่หายไป'' โดยให้ผู้เรียนสุ่มหยิบการ์ดเมนูโปรดขึ้นมา จากนั้นครูประกาศทันทีว่า ''เมนูที่นักเรียนเลือกหมด'' และสังเกตปฏิกิริยาแรกของผู้เรียน",
    "กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเชื่อมโยงเข้าสู่บทเรียน: ''ในฐานะลูกค้า ถ้าน้องๆ เดินเข้าร้านแล้วพนักงานบอกแค่ว่า เมนูนี้หมดค่ะ แล้วเงียบไป จะรู้สึกอย่างไร?'' และ ''คำพูดภาษาอังกฤษแบบไหนที่จะเปลี่ยนความผิดหวังของลูกค้า ให้กลายมาเป็นความสนใจสั่งเมนูอื่นแทน?''",
    "ผู้เรียนร่วมกันอภิปราย ครูสรุปแนวคิดการเปลี่ยนวิกฤตให้เป็นโอกาสในงานบริการและชี้แจงจุดประสงค์การเรียนรู้"
  ]'::jsonb,
  '[
    "F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)",
    "ครูให้ผู้เรียนสแกน QR Code Learning Access เพื่อศึกษา Flowchart Interactive ''กระบวนการจับคู่รายการอาหารทดแทนเมื่อวัตถุดิบหลักหมด (Menu Substitution Flow)''",
    "ผู้เรียนใช้ฟังก์ชัน AI Scan สแกนเล่มเมนูจำลองของห้องอาหาร เพื่อวิเคราะห์หาจุดเด่น รสชาติ และระดับราคาของอาหารแต่ละจาน จากนั้นบันทึกรายการอาหารที่สามารถแนะนำทดแทนกันได้ลงใน AI Scan Learning Record",
    "ผู้เรียนจับคู่ฝึกออกเสียงกลุ่มคำศัพท์และสำนวนประโยคการขอโทษและการเสนอทางเลือกตามเอกสารประกอบการเรียน"
  ]'::jsonb,
  '[
    "I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)",
    "ผู้เรียนเข้าใช้งานแอปพลิเคชัน Gemini และ Gemini Live บนอุปกรณ์สื่อสารส่วนตัว",
    "ภารกิจที่ 1 (Apology & Alternative Pattern): ผู้เรียนสั่งการให้ Gemini สวมบทบาทเป็นลูกค้าชาวต่างชาติที่ตั้งใจมาทานเมนูซิกเนเจอร์ของร้าน แต่ผู้เรียนต้องใช้ Gemini Live แจ้งว่าเมนูนั้นหมด พร้อมเสนอเมนูอื่นที่มีความคล้ายคลึงกัน โดยต้องทำให้ AI ยอมตกลงสั่งซื้อเมนูทางเลือกนั้น",
    "ภารกิจที่ 2 (Difficult Guest Challenge): ตั้งโจทย์ให้ Gemini แสดงอารมณ์หงุดหงิดหรือปฏิเสธตัวเลือกแรกที่เสนอไป (''But I specifically came here for that dish! What else do you have?'') ผู้เรียนต้องใช้ทักษะการฟังและพูดคุยทางเสียงเพื่อเสนอตัวเลือกที่สองหรือสิทธิประโยชน์อื่น",
    "ผู้เรียนบันทึกผล Feedback และข้อเด่นที่ได้จากการโต้ตอบลงใน AI Learning Record"
  ]'::jsonb,
  '[
    "N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)",
    "ครูจัดพื้นที่ห้องปฏิบัติการให้เป็นห้องอาหารจำลอง โดยมอบหมาย ''การ์ดสถานการณ์จำลองความขัดแย้ง (Conflict Situation Cards)'' ให้แต่ละกลุ่ม",
    "โจทย์จำลอง: ''ลูกค้าสั่งไวน์แดงยี่ห้อเฉพาะเพื่อฉลองวันครบรอบแต่งงาน แต่ไวน์รุ่นนั้นหมด พนักงานเสิร์ฟต้องเข้าไปขออภัย แนะนำไวน์รุ่นอื่นที่มีรสชาติบอดี้ใกล้เคียงกัน พร้อมนำเสนอการบริการเสริมเพื่อชดเชยความรู้สึก''",
    "ผู้เรียนในกลุ่มแบ่งบทบาทหน้าที่ ปฏิบัติการรับออเดอร์และแก้ไขสถานการณ์ร่วมกัน บันทึกการเปลี่ยนรายการลงในใบออเดอร์พร้อมทำสัญลักษณ์อัปเดตระบบ ครูคอยแทรกปัญหาเฉพาะหน้าเพื่อทดสอบปฏิภาณไหวพริบ"
  ]'::jsonb,
  '[
    "E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)",
    "สุ่มตัวแทนกลุ่มออกมาแสดงบทบาทสมมติในการแก้ปัญหาเมนูหมดหน้าชั้นเรียน โดยเน้นการประเมินบุคลิกภาพ การใช้น้ำเสียง และความลื่นไหลในการสนทนา (Fluency & Hospitality Tone)",
    "ผู้เรียนทุกคนทำแบบทดสอบออนไลน์ (Quiz) ผ่าน web app FINE Model เพื่อวัดความเข้าใจในโครงสร้างประโยคและหลักการแก้ปัญหาเมื่อรายการอาหารหมด",
    "ครูประเมินผลการปฏิบัติงานตามเกณฑ์มาตรฐาน Rubrics"
  ]'::jsonb,
  '[
    "Reflection: ครูและผู้เรียนร่วมกันสรุปบทเรียน: หัวใจของการจัดการเมื่อเมนูหมดไม่ใช่แค่การบอกว่าไม่มี แต่คือการส่งมอบ ''ทางเลือกที่ดีที่สุด'' ให้แก่ลูกค้าทันทีโดยไม่ต้องให้ลูกค้าร้องขอ",
    "ผู้เรียนทำกิจกรรม Exit Ticket: พิมพ์สำนวนภาษาอังกฤษในการแนะนำเมนูทดแทนที่ตนเองคิดว่าประทับใจที่สุด 1 ประโยค ส่งเข้าสู่ระบบจัดเก็บข้อมูลก่อนปิดการเรียนเรียนรู้"
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

-- 2. Insert or update 4 assignments for Week 14
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-141414141401',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-14',
  'สัปดาห์ที่ 14 [F]: ใบงานคำศัพท์เมนูหมด และ AI Scan วิเคราะห์จุดเด่นเพื่อจับคู่เมนูทดแทน',
  'สแกน QR Code ศึกษา Flowchart Interactive การจับคู่เมนูทดแทน (Menu Substitution Flow), ใช้ AI Scan สแกนเล่มเมนูวิเคราะห์จุดเด่น รสชาติ และระดับราคาเพื่อหาเมนูทดแทนที่เหมาะสม และทำแบบฝึกหัดคำศัพท์และเติมโครงสร้างประโยคขออภัย/เสนอทางเลือก',
  'Familiarize',
  20,
  NOW() + interval '98 days',
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
  'a1111111-1111-4111-8111-141414141402',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-14',
  'สัปดาห์ที่ 14 [I]: ฝึกสนทนาขออภัยและรับมือลูกค้ายาก (Difficult Guest) ผ่าน Gemini Live',
  'ใช้ Gemini Live ฝึกซ้อม 2 ภารกิจ: 1) Apology & Alternative Pattern เจรจาแจ้งเมนูซิกเนเจอร์หมดและโน้มน้าวให้ลูกค้าเลือกเมนูอื่น 2) Difficult Guest Challenge รับมือลูกค้าที่หงุดหงิดและปฏิเสธตัวเลือกแรกด้วยทักษะเสนอสิทธิประโยชน์ พร้อมบันทึก AI Learning Record',
  'Interact',
  20,
  NOW() + interval '98 days',
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
  'a1111111-1111-4111-8111-141414141403',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-14',
  'สัปดาห์ที่ 14 [N]: สถานการณ์จำลองแก้ไขปัญหาเมนูหมดตามการ์ด Conflict Situation Cards',
  'แบ่งกลุ่มเข้าจำลองสถานการณ์ห้องอาหาร รับมือปัญหาความขัดแย้งเมื่อเมนูที่ลูกค้าต้องการหมด (เช่น ไวน์ฉลองวันครบรอบหมด) ขออภัย แนะนำเมนูรสชาติใกล้เคียง พร้อมนำเสนอบริการเสริมชดเชยความรู้สึก และแก้ไขใบออเดอร์พร้อมอัปเดตระบบ',
  'Navigate',
  20,
  NOW() + interval '98 days',
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
  'a1111111-1111-4111-8111-141414141404',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-14',
  'สัปดาห์ที่ 14 [E]: สาธิตบทบาทสมมติแก้ปัญหาเมนูหมดสด, Quiz ออนไลน์ และส่ง Exit Ticket',
  'สุ่มตัวแทนสาธิตการแก้ปัญหาเมนูหมดสดหน้าชั้นเรียนเน้น Fluency & Hospitality Tone ตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Dealing with Unavailable Items และส่ง Exit Ticket ประโยคแนะนำเมนูทดแทนที่ประทับใจที่สุด 1 ประโยค',
  'Exhibit',
  20,
  NOW() + interval '98 days',
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
