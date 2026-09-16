-- Migration 029: Add Week 13 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 13: Handling Special Requests (6.2 Food Allergy and Menu Substitution)
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
  'lesson-plan-week-13',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 13: Handling Special Requests (6.2 Food Allergy and Menu Substitution: การจัดการเรื่องอาหารก่อภูมิแพ้และการเปลี่ยนเมนูอาหาร)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 13',
  'การจัดการข้อจำกัดด้านการแพ้อาหาร และการเปลี่ยนเมนูอาหาร (Food Allergy and Menu Substitution) เป็นมาตรฐานความปลอดภัยขั้นสูง ในการบริการอาหารและเครื่องดื่มระดับสากล พนักงานบริการต้องมีความรู้เกี่ยวกับสารก่อภูมิแพ้หลัก (Major Food Allergens) มีความเข้าใจในกระบวนการเปลี่ยนทดแทนวัตถุดิบอย่างถูกต้อง และมีความเชี่ยวชาญในการใช้รูปประโยคภาษาอังกฤษในการซักถาม ยืนยัน หรือปฏิเสธกรณีที่มีความเสี่ยงต่อสุขภาพของลูกค้า การจัดการเรียนรู้นี้ได้บูรณาการ FINE Model ร่วมกับเทคโนโลยี ผ่าน web app FINE Model ในการจำลองสถานการณ์วิกฤตหน้างาน เพื่อสร้างสมรรถนะความรับผิดชอบต่อชีวิตผู้บริโภคและการสื่อสารอย่างเป็นมืออาชีพ',
  '[
    "ระบุประเภทของอาหารก่อภูมิแพ้หลัก (เช่น ถั่ว นม ไข่ อาหารทะเล แป้งสาลี) เป็นภาษาอังกฤษได้ถูกต้อง",
    "อธิบายขั้นตอนการบันทึกและการประสานงานเร่งด่วนเพื่อเปลี่ยนเมนูอาหารตามมาตรฐานความปลอดภัยได้",
    "ระบุโครงสร้างประโยคภาษาอังกฤษในการสอบถามอาการแพ้และการเสนอเมนูเปลี่ยนทดแทนได้อย่างถูกต้อง"
  ]'::jsonb,
  '[
    "พูดซักถามและทวนอาการแพ้อาหารของลูกค้าเป็นภาษาอังกฤษได้อย่างถูกต้อง",
    "ใช้เทคโนโลยี AI Scan ในการตรวจสอบสารก่อภูมิแพ้บนเมนู และใช้ Gemini Live ผ่าน web app FINE Model ในการโต้ตอบสถานการณ์สับเปลี่ยนเมนู",
    "ปฏิบัติการบันทึกใบสั่งอาหาร และส่งต่อข้อมูลคำเตือนเรื่องอาการแพ้ไปยังห้องครัวได้อย่างถูกต้อง"
  ]'::jsonb,
  '[
    "มีความตระหนักรู้และรับผิดชอบต่อความปลอดภัยในชีวิตของแขก (Safety Awareness)",
    "มีความละเอียดรอบคอบ ต่อข้อมูลการแพ้อาหารแม้เพียงเล็กน้อย (Extreme Attention to Detail)",
    "มีความสุภาพ มีสติ และแสดงความเห็นอกเห็นใจต่อข้อจำกัดของแขก (Empathy in Service)"
  ]'::jsonb,
  '[
    "ประยุกต์ใช้ทักษะการวิเคราะห์ส่วนผสมเพื่อแนะนำเมนูทางเลือกอื่นที่ปลอดภัยให้แก่แขกได้ทันท่วงที",
    "แก้ไขสถานการณ์เฉพาะหน้าในห้องอาหารจำลองเมื่อลูกค้าแจ้งอาการแพ้อาหารกะทันหันได้อย่างถูกต้อง",
    "นำความรู้ไปปรับปรุงขั้นตอนการรับออเดอร์เพื่อความปลอดภัยของลูกค้าตั้งแต่ขั้นตอนแรก (Cross-contamination Prevention)"
  ]'::jsonb,
  '[
    {"word": "Food Allergy", "meaning": "การแพ้อาหาร"},
    {"word": "Major Food Allergens", "meaning": "สารก่อภูมิแพ้หลักในอาหาร"},
    {"word": "Menu Substitution", "meaning": "การเปลี่ยนส่วนผสมหรือเปลี่ยนเมนูทดแทน"},
    {"word": "Peanut", "meaning": "ถั่วลิสง"},
    {"word": "Dairy / Milk", "meaning": "ผลิตภัณฑ์จากนมวัว"},
    {"word": "Egg", "meaning": "ไข่"},
    {"word": "Seafood / Shellfish", "meaning": "อาหารทะเล / สัตว์น้ำมีเปลือก"},
    {"word": "Wheat / Gluten", "meaning": "แป้งสาลี / กลูเตน"},
    {"word": "Soy", "meaning": "ถั่วเหลือง"},
    {"word": "Intolerance", "meaning": "ภาวะร่างกายย่อยยากหรือไม่ทนต่ออาหาร"},
    {"word": "Severe reaction", "meaning": "อาการแพ้ขั้นรุนแรง"},
    {"word": "Cross-contamination", "meaning": "การปนเปื้อนข้ามของสารก่อภูมิแพ้ในครัว"}
  ]'::jsonb,
  '[
    "Do you have any food allergies or dietary restrictions that we should be aware of?",
    "Are you allergic to any specific ingredients?",
    "We can substitute the shrimp with chicken for your Pad Thai. Would that be acceptable?",
    "I will double-check with the chef to ensure this dish is 100% dairy-free for you."
  ]'::jsonb,
  '[
    "ครูยกกรณีศึกษา (Case Study) ของสถานการณ์ห้องอาหารที่เสิร์ฟอาหารที่มีส่วนผสมของถั่วให้แก่แขก และมีอาการแพ้ขั้นรุนแรงจนนำไปสู่การส่งโรงพยาบาลฉุกเฉินและฟ้องร้องดำเนินคดี",
    "กิจกรรมกระตุ้นคิด (Brainstorming): ครูตั้งคำถามเพื่อปลุกจิตสำนึก: ''นักเรียนคิดว่าความผิดพลาดนี้อยู่ที่ใคร ระหว่างคนจดออเดอร์ คนทำอาหาร หรือตัวลูกค้าเอง?'' และ ''ในฐานะพนักงานโรงแรม เราจะใช้ระบบคำถามอย่างไรเพื่อคัดกรองปัญหานี้ก่อนที่อาหารจะออกจากครัว?''",
    "ผู้เรียนร่วมกันวิเคราะห์ ครูสรุปและนำเข้าสู่บทเรียนเรื่องการจัดการอาหารก่อภูมิแพ้และการเปลี่ยนเมนู"
  ]'::jsonb,
  '[
    "F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี ผ่าน web app FINE Model (60 นาที)",
    "ครูให้ผู้เรียนสแกน QR Code Learning Access เพื่อเข้าสู่ระบบ Interactive Guide เรื่อง ''สัญลักษณ์และคำศัพท์สารก่อภูมิแพ้มาตรฐานสากล (International Allergen Codes)''",
    "ผู้เรียนใช้ฟังก์ชัน AI Scan สแกนการ์ดเมนูอาหารจำลองของห้องอาหาร เพื่อวิเคราะห์หาส่วนประกอบที่ซ่อนอยู่ (เช่น ซอสบางชนิดมีส่วนผสมของแป้งสาลีหรือปลา) ระบบจะแสดงข้อมูลเตือนเป็นภาษาไทยและภาษาอังกฤษ",
    "ผู้เรียนทำใบงานจับคู่สารก่อภูมิแพ้กับเมนูอาหารที่มีความเสี่ยง และสรุปแนวทางการเปลี่ยนวัตถุดิบเบื้องต้นลงใน AI Scan Learning Record"
  ]'::jsonb,
  '[
    "I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)",
    "ผู้เรียนเปิดแอปพลิเคชัน Gemini และ Gemini Live บนอุปกรณ์ของตนเอง",
    "ภารกิจที่ 1 (Allergy Screening Mode): ผู้เรียนป้อน Prompt คำสั่งให้ Gemini สวมบทบาทเป็นลูกค้าที่มีอาการแพ้กลูเตนขั้นรุนแรง (Celiac Disease) ผู้เรียนต้องใช้ Gemini Live พูดคุยซักถาม แนะนำเมนูที่ปลอดภัย และใช้รูปประโยคยืนยันว่าจะแยกอุปกรณ์ในการปรุงอย่างเด็ดขาด",
    "ภารกิจที่ 2 (Emergency Substitution Challenge): ตั้งโจทย์ให้ Gemini แกล้งบอกหลังจากสั่งอาหารเสร็จแล้วว่า ''Oh, I forgot to tell you, I am highly allergic to peanuts. Is there peanut oil in that sauce?'' ผู้เรียนต้องใช้ไหวพริบตอบโต้ทางเสียงผ่าน Gemini Live เพื่อระงับออเดอร์และเสนอเมนูเปลี่ยนทดแทนทันที",
    "ผู้เรียนจดบันทึกคำแนะนำด้านภาษาและข้อควรระวังที่ได้รับจากการหาข้อมูลลงใน AI Learning Record"
  ]'::jsonb,
  '[
    "N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (55 นาที)",
    "ครูจำลองห้องปฏิบัติการห้องอาหารให้เป็นสถานการณ์ ''Allergy Alert Room''",
    "ผู้เรียนแบ่งกลุ่มเป็นทีมบริการ โดยครูมอบหมายบทบาทให้ผู้เรียนบางคนในกลุ่มสลับกันเป็นแขกที่มีอาการแพ้อาหารแตกต่างกัน (เช่น แพ้อาหารทะเล แพ้นมวัว)",
    "พนักงานบริการต้องเข้ามารับออเดอร์ สังเกตคำสัญญาณ (Keywords) สื่อสารภาษาอังกฤษซักถามระดับความรุนแรง บันทึกคำเตือนด้วยปากกาสีแดงเด่นชัดบนใบออเดอร์ (Captain Order) และประสานงานส่งต่อข้อมูลจำลองกับเชฟห้องครัว",
    "ครูสร้างสถานการณ์กดดัน เช่น เชฟแจ้งกลับมาว่าเมนูที่เลือกไม่สามารถทำแบบแยกสารภูมิแพ้ได้ พนักงานต้องกลับไปเจรจาเปลี่ยนเมนูใหม่กับแขกด้วยความสุภาพ"
  ]'::jsonb,
  '[
    "E – Exhibit Professional Performance: การลงมือปฏิบัติจริง (35 นาที)",
    "สุ่มตัวแทนออกมาทดสอบการรับออเดอร์แขกที่แพ้อาหารและการเปลี่ยนเมนู (Live Assessment) โดยประเมินความถูกต้องของข้อมูล",
    "ผู้เรียนทุกคนทำควิซออนไลน์ (Quiz) ผ่าน web app FINE Model เพื่อวัดความรู้ความเข้าใจเกี่ยวกับประเภทสารก่อภูมิแพ้และประโยคภาษาอังกฤษในการสื่อสารความปลอดภัย",
    "ครูสรุปคะแนนและประเมินผลผ่านเกณฑ์ Rubrics"
  ]'::jsonb,
  '[
    "Reflection: ครูชวนผู้เรียนสะท้อนความคิดผ่านคำกล่าวที่ว่า ''ในงานบริการอาหาร ความใส่ใจเรื่องอาการแพ้ของลูกค้าเท่ากับการรักษาชีวิตของเขา''",
    "ผู้เรียนเขียน Exit Ticket: ระบุ 2 ข้อห้ามสำคัญในการรับออเดอร์แขกที่แพ้อาหาร และ 1 ประโยคภาษาอังกฤษที่มั่นใจที่สุดในการเสนอเปลี่ยนเมนู ส่งให้ครูผ่านระบบออนไลน์ก่อนออกจากห้องเรียน"
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

-- 2. Insert or update 4 assignments for Week 13
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-131313131301',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-13',
  'สัปดาห์ที่ 13 [F]: ใบงานคำศัพท์ Food Allergens และ AI Scan ตรวจจับสารก่อภูมิแพ้ในเมนู',
  'สแกน QR Code ศึกษา Interactive Guide สัญลักษณ์สารก่อภูมิแพ้สากล (International Allergen Codes), ใช้ AI Scan ตรวจจับส่วนผสมที่ซ่อนเร้นในเมนูอาหารจำลอง และทำใบงานจับคู่คำศัพท์สารก่อภูมิแพ้พร้อมเติมโครงสร้างประโยคซักถาม',
  'Familiarize',
  20,
  NOW() + interval '91 days',
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
  'a1111111-1111-4111-8111-131313131302',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-13',
  'สัปดาห์ที่ 13 [I]: ฝึกสนทนาคัดกรองอาการแพ้และระงับออเดอร์ฉุกเฉินผ่าน Gemini Live',
  'ฝึกซ้อมผ่าน Gemini Live ใน 2 ภารกิจวิกฤต: 1) Allergy Screening Mode ซักถามและแนะนำเมนูปลอดภัยแก่ลูกค้าแพ้กลูเตนรุนแรง (Celiac Disease) 2) Emergency Substitution Challenge ระงับออเดอร์และเสนอเมนูทดแทนทันทีเมื่อลูกค้าเพิ่งแจ้งอาการแพ้ถั่ว พร้อมบันทึก AI Learning Record',
  'Interact',
  20,
  NOW() + interval '91 days',
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
  'a1111111-1111-4111-8111-131313131303',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-13',
  'สัปดาห์ที่ 13 [N]: สถานการณ์จำลอง Allergy Alert Room จดเตือนสีแดงและประสานงานเปลี่ยนเมนู',
  'แบ่งกลุ่มเข้าจำลองสถานการณ์ห้องอาหาร Allergy Alert Room รับออเดอร์ลูกค้าที่มีอาการแพ้ เขียนคำเตือนสีแดงเด่นชัดบน Captain Order Pad และประสานงานส่งต่อเชฟในครัว พร้อมเจรจาเปลี่ยนเมนูอย่างสุภาพเมื่อครัวไม่สามารถแยกสารก่อภูมิแพ้ได้',
  'Navigate',
  20,
  NOW() + interval '91 days',
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
  'a1111111-1111-4111-8111-131313131304',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-13',
  'สัปดาห์ที่ 13 [E]: สาธิตการรับมือลูกค้าแพ้อาหารสด, ทำ Quiz ออนไลน์ และส่ง Exit Ticket',
  'สุ่มตัวแทนสาธิตการรับออเดอร์แขกแพ้อาหารและการเปลี่ยนเมนูสดหน้าชั้นเรียนตามเกณฑ์ Rubrics, ทำ Quiz ออนไลน์เรื่อง Food Allergens and Professional Service Communication และเขียน Exit Ticket ระบุ 2 ข้อห้ามสำคัญพร้อม 1 ประโยคเสนอเปลี่ยนเมนู',
  'Exhibit',
  20,
  NOW() + interval '91 days',
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
