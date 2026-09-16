-- Migration 034: Add Week 18 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 18: Professional Food and Beverage Service Performance (8.7 - 8.8 Evaluation & Reflection)
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
  'lesson-plan-week-18',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 18: Professional Food and Beverage Service Performance (8.7 - 8.8 Evaluation & Reflection: การสะท้อนผลการเรียนรู้ จัดทำแฟ้มสะสมผลงาน และการประเมินสมรรถนะปลายภาค)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 18',
  'การจัดการเรียนรู้ในสัปดาห์สุดท้ายเป็นขั้นตอนการรวบยอดสมรรถนะวิชาชีพทั้งหมดที่ผู้เรียนได้สั่งสมมาตลอดทั้งภาคเรียน โดยเน้นกระบวนการสะท้อนคิด (Reflection) เพื่อให้ผู้เรียนมองเห็นความก้าวหน้า จุดแข็ง และสิ่งที่ควรพัฒนาของตนเอง รวมถึงการจัดทำแฟ้มสะสมผลงาน (Portfolio) เพื่อนำเสนอหลักฐานการเรียนรู้อย่างเป็นระบบ ควบคู่ไปกับการเข้ารับการประเมินสมรรถนะปลายภาค (Final Professional Performance Assessment) ในสถานการณ์จำลองระดับมาตรฐานสากล กระบวนการนี้ผสานพลังการเรียนรู้ผ่านเทคโนโลยี FINE Model ร่วมกับเครื่องมือปัญญาประดิษฐ์และระบบประเมินผล เพื่อตัดสินและรับรองความพร้อมของผู้เรียนในการก้าวสู่ภาคอุตสาหกรรมการบริการอาหารและเครื่องดื่มต่อไป',
  '[
    "อธิบายหลักการประเมินตนเองและกระบวนการสรุปผลการเรียนรู้งานบริการอาหารและเครื่องดื่มได้",
    "ระบุโครงสร้างการจัดทำแฟ้มสะสมผลงานวิชาชีพการโรงแรมในรูปแบบดิจิทัล (e-Portfolio) ได้อย่างถูกต้อง",
    "สรุปความเชื่อมโยงของมาตรฐานการทำงานในห้องอาหารระดับสากลและเกณฑ์การวัดผลระดับอาชีวศึกษาได้"
  ]'::jsonb,
  '[
    "บูรณาการทักษะวิชาชีพและภาษาอังกฤษเพื่อผ่านการทดสอบสถานการณ์จำลองปลายภาคตามมาตรฐาน",
    "คัดเลือก เรียบเรียง และตรวจทานเนื้อหาหลักฐานการเรียนรู้เพื่อจัดทำแฟ้มสะสมผลงานได้",
    "ใช้เครื่องมือดิจิทัลและปัญญาประดิษฐ์ในการตรวจสอบ วิเคราะห์ผลคะแนน และสรุปประเด็นการเรียนรู้ของตนเอง"
  ]'::jsonb,
  '[
    "เจตคติที่ดีและมีความภูมิใจในวิชาชีพการโรงแรมและการบริการอาหารและเครื่องดื่ม",
    "ความเป็นระเบียบเรียบร้อย ความถูกต้องชัดเจน และความซื่อสัตย์สุจริตในการประเมินผล",
    "ทักษะการยอมรับความคิดเห็นและพร้อมปรับปรุงพัฒนาตนเองอย่างต่อเนื่อง (Growth Mindset)"
  ]'::jsonb,
  '[
    "นำทักษะการสะท้อนคิด (Reflection) ไปประยุกต์ใช้ในการประเมินประสิทธิภาพการทำงานของตนเองในชีวิตจริง",
    "ประยุกต์ใช้แฟ้มสะสมผลงาน (Portfolio) เป็นเครื่องมือในการนำเสนอโปรไฟล์เพื่อการสมัครงานหรือศึกษาต่อในอนาคต",
    "ต่อยอดทักษะการรวบรวมผลงานและประสบการณ์ไปใช้ในการเตรียมพร้อมเข้าสู่ตลาดแรงงาน"
  ]'::jsonb,
  '[
    {"word": "e-Portfolio", "meaning": "แฟ้มสะสมผลงานวิชาชีพในรูปแบบดิจิทัล"},
    {"word": "Evaluation & Reflection", "meaning": "การประเมินผลสัมฤทธิ์และการสะท้อนคิดถอดบทเรียน"},
    {"word": "Self-Assessment", "meaning": "การประเมินสมรรถนะและพัฒนาการของตนเอง"},
    {"word": "Peer-Assessment", "meaning": "การประเมินผลงานและให้ข้อเสนอแนะระหว่างเพื่อนร่วมชั้น"},
    {"word": "Viva Voce", "meaning": "การสอบปากเปล่า / การสอบสัมภาษณ์วิชาชีพจำลอง"},
    {"word": "External Assessor", "meaning": "ผู้ประเมินภายนอกตามเกณฑ์มาตรฐานสมรรถนะ"},
    {"word": "Learning Logs", "meaning": "บันทึกประวัติและพัฒนาการการเรียนรู้ประจำสัปดาห์"},
    {"word": "Final Professional Performance Assessment", "meaning": "การประเมินสมรรถนะวิชาชีพภาคปฏิบัติปลายภาค"},
    {"word": "Growth Mindset", "meaning": "กรอบความคิดที่พร้อมเรียนรู้และพัฒนาตนเองอย่างต่อเนื่อง"},
    {"word": "Gallery Walk", "meaning": "กิจกรรมเดินชมนิทรรศการผลงานเพื่อแลกเปลี่ยนเรียนรู้"},
    {"word": "Rubrics Sheet", "meaning": "เกณฑ์การวัดผลและประเมินระดับสมรรถนะมาตรฐาน"},
    {"word": "My F&B Journey", "meaning": "บทความสะท้อนคิดการเดินทางสู่มืออาชีพงานบริการอาหารและเครื่องดื่ม"}
  ]'::jsonb,
  '[
    "Throughout this semester, I have developed my professional food and beverage service skills.",
    "The most challenging part was handling difficult customer complaints and special dietary requests.",
    "I will apply this skill to my future hotel internship and career in hospitality.",
    "What is the correct procedure when a guest complains about undercooked food?",
    "How do you present the bill professionally?"
  ]'::jsonb,
  '[
    "ครูเปิดวิดีโอประมวลภาพกิจกรรมและบรรยากาศการเรียนปฏิบัติของผู้เรียนตั้งแต่สัปดาห์ที่ 1 ถึงสัปดาห์ที่ 17 เพื่อกระตุ้นความทรงจำ และสร้างความภาคภูมิใจในพัฒนาการของผู้เรียน",
    "กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามปลายเปิดเพื่อชวนคุย: ''ถ้าย้อนเวลากลับไปสัปดาห์แรก ทักษะด้านใดของตนเองที่นักเรียนรู้สึกว่ามีการเปลี่ยนแปลงและเติบโตมากที่สุด?'' และ ''เพราะเหตุใด แฟ้มสะสมผลงาน (Portfolio) จึงเป็นสิ่งสำคัญที่จะยืนยันว่าเราคือคนทำงานโรงแรมมืออาชีพ ไม่ใช่แค่ผู้เรียนที่สอบผ่าน?''",
    "ผู้เรียนร่วมแชร์ความคิดเห็นร่วมกัน ครูสรุปและเชื่อมโยงสู่เป้าหมายของสัปดาห์แห่งการประเมินและถอดบทเรียน"
  ]'::jsonb,
  '[
    "F – Familiarize: ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (40 นาที)",
    "ครูอธิบายโครงสร้าง และรายละเอียดการจัดทำ Portfolio ทั้งแบบรูปเล่มและแบบดิจิทัล (e-Portfolio)",
    "ผู้เรียนเข้าระบบ web app FINE Model สแกนตรวจสอบสรุปผลสัมฤทธิ์จากบันทึก Learning Record ของตนเองตลอดภาคเรียน เพื่อดึงข้อมูลคำศัพท์ ไวยากรณ์ และเทคนิคงานบริการที่บันทึกไว้ นำมาเรียบเรียงจัดกลุ่มลงในแฟ้มงาน",
    "ผู้เรียนจัดทำโครงร่างการสะท้อนคิดรายบุคคลในหัวข้อ My F&B Journey เป็นภาษาอังกฤษ"
  ]'::jsonb,
  '[
    "I – Interact: การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)",
    "ครูมอบหมายภารกิจการประเมินทักษะการสื่อสารภาษาอังกฤษและการสัมภาษณ์สรุปบทเรียน",
    "ผู้เรียนใช้ระบบ Gemini และ Gemini Live ผ่าน web app FINE Model สื่อสารและตอบคำถามจำลองการสอบสัมภาษณ์วิชาชีพ (Viva Voce) โดยตั้งค่าให้ AI เป็นผู้ประเมินภายนอก (External Assessor) ป้อนคำถามทดสอบ เช่น ''What is the correct procedure when a guest complains about undercooked food?'' หรือ ''How do you present the bill professionally?''",
    "ผู้เรียนฝึกตอบคำถามโต้ตอบแบบเรียลไทม์ และรับฟัง Feedback ด้านความถูกต้องในการใช้ภาษาและคำศัพท์วิชาชีพเพื่อนำมาบันทึกเป็นคะแนนส่วนหนึ่งในแฟ้มผลงาน"
  ]'::jsonb,
  '[
    "N – Navigate Service Situations: การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน SBL (70 นาที)",
    "เข้าสู่ช่วง Final Professional Performance Assessment: ครูสุ่มโจทย์สถานการณ์จำลองระดับพลิกแพลงขั้นสูงสุด (เช่น การจัดการโต๊ะวีไอพีที่มีการสั่งอาหารจานพิเศษ มีข้อร้องเรียนเรื่องไวน์ และต้องการความรวดเร็วในการเช็คบิลพร้อมกัน)",
    "ผู้เรียนเข้ารับการทดสอบภาคปฏิบัติในพื้นที่จำลอง Restaurant Simulation เป็นรายกลุ่มและรายบุคคล โดยมีครูและกรรมการร่วมกันประเมินตามเกณฑ์ Rubrics มาตรฐานอาชีพ",
    "ระหว่างการทดสอบ ผู้เรียนต้องดึงสมรรถนะทุกหน่วยการเรียนรู้ ตั้งแต่การใช้อุปกรณ์ การจับคู่เครื่องดื่ม การรับมือคำขอพิเศษ และการคิดเงิน มาแสดงออกอย่างเป็นธรรมชาติตามเวลาที่กำหนด"
  ]'::jsonb,
  '[
    "E – Exhibit Professional Performance: การจัดแสดงนิทรรศการแฟ้มผลงาน (40 นาที)",
    "ผู้เรียนจัดวางแฟ้มสะสมผลงาน (Portfolio) หรือเปิดแสดงหน้าจอ e-Portfolio ของตนเองบนโต๊ะปฏิบัติงานในรูปแบบนิทรรศการนวัตกรรมการเรียนรู้ (Gallery Walk)",
    "ผู้เรียนเดินชมผลงานของเพื่อนร่วมชั้น ทำการประเมินร่วมกัน (Peer-Assessment) ผ่านการเขียนชื่นชมและให้ข้อเสนอแนะ",
    "ครูประกาศผลการประเมินสมรรถนะ มอบเกียรติบัตรหรือรางวัลจำลองสำหรับผู้เรียนที่มีผลการปฏิบัติงานและการพัฒนาดีเด่น เพื่อสร้างขวัญและกำลังใจ"
  ]'::jsonb,
  '[
    "Reflection: ครูและผู้เรียนร่วมกันสรุปภาพรวมของวิชาการบริการอาหารและเครื่องดื่ม เน้นย้ำว่าหัวใจสำคัญของการทำงานโรงแรม คือความเป็นเลิศในบริการ เทคโนโลยีเป็นเครื่องมือช่วยในการทำงาน แต่ภาษากาย รอยยิ้ม และความถูกต้อง คือสิ่งที่จะมัดใจลูกค้า",
    "ผู้เรียนทำกิจกรรม Exit Ticket ชิ้นสุดท้าย: เขียนเป้าหมายในอนาคตของตนเองในการฝึกงานหรือทำงานจริงลงในระบบดิจิทัลเพื่อปิดรายวิชาอย่างสมบูรณ์"
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

-- 2. Insert or update 4 assignments for Week 18
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-181818181801',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-18',
  'สัปดาห์ที่ 18 [F]: ใบงานจัดทำโครงสร้าง e-Portfolio และรวบรวม Learning Record ผ่าน AI Scan',
  'ระบุองค์ประกอบสำคัญ 4 ประการของ e-Portfolio, ใช้ AI Scan สแกนประมวลผลสัมฤทธิ์จากบันทึกการเรียนรู้ตลอด 17 สัปดาห์ และเขียนโครงร่างการสะท้อนคิดรายบุคคลในหัวข้อ My F&B Journey เป็นภาษาอังกฤษ',
  'Familiarize',
  20,
  NOW() + interval '126 days',
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
  'a1111111-1111-4111-8111-181818181802',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-18',
  'สัปดาห์ที่ 18 [I]: สอบสัมภาษณ์วิชาชีพจำลอง Viva Voce กับ AI ผู้ประเมินภายนอกผ่าน Gemini Live',
  'เข้าสู่การสอบสัมภาษณ์วิชาชีพจำลอง (Viva Voce) กับ AI ในบทบาท External Assessor ผ่าน Gemini Live ตอบคำถามสถานการณ์จริงและกระบวนการบริการเป็นภาษาอังกฤษแบบเรียลไทม์ พร้อมรับการประเมินบันทึกลงในแฟ้มผลงาน',
  'Interact',
  20,
  NOW() + interval '126 days',
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
  'a1111111-1111-4111-8111-181818181803',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-18',
  'สัปดาห์ที่ 18 [N]: สอบภาคปฏิบัติปลายภาค Final Professional Performance Assessment',
  'เข้ารับการประเมินสมรรถนะภาคปฏิบัติปลายภาคในพื้นที่จำลอง Restaurant Simulation รับมือโจทย์สถานการณ์จำลองระดับพลิกแพลงขั้นสูงสุด บูรณาการทุกสมรรถนะตามเกณฑ์ Rubrics มาตรฐานคุณวุฒิวิชาชีพสากล',
  'Navigate',
  20,
  NOW() + interval '126 days',
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
  'a1111111-1111-4111-8111-181818181804',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-18',
  'สัปดาห์ที่ 18 [E]: นิทรรศการแฟ้มผลงาน Gallery Walk, ประเมินเพื่อน และ Exit Ticket ปิดรายวิชา',
  'จัดแสดงแฟ้มผลงาน e-Portfolio ในรูปแบบ Gallery Walk, ทำการประเมินร่วมกันระหว่างเพื่อนร่วมชั้น (Peer-Assessment) และพิมพ์ส่ง Exit Ticket ชิ้นสุดท้ายระบุเป้าหมายในอนาคตเพื่อปิดการเรียนรู้อย่างสมบูรณ์',
  'Exhibit',
  20,
  NOW() + interval '126 days',
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
