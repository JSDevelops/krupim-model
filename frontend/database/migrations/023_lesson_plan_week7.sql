-- Migration 023: Add Week 7 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 7: Introducing Menu Items (Food Description)
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
  'lesson-plan-week-7',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 7: Introducing Menu Items (Food Description: การอธิบายอาหาร ส่วนประกอบ และวิธีการปรุง)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 7',
  'การแนะนำและอธิบายรายการอาหาร (Food Description) เป็นทักษะขั้นสูงที่สำคัญ สำหรับพนักงานบริการอาหารและเครื่องดื่มมืออาชีพ ผู้เรียนจำเป็นต้องมีความรู้ความเข้าใจเกี่ยวกับคำศัพท์ภาษาอังกฤษที่ใช้อธิบายลักษณะของอาหาร ส่วนประกอบหลัก (Ingredients) และวิธีการปรุง (Cooking Methods) เพื่อสามารถให้ข้อมูลแก่ลูกค้าได้อย่างถูกต้อง น่าดึงดูด และชัดเจน โดยการจัดการเรียนรู้นี้ได้บูรณาการโครงสร้าง FINE Model ร่วมกับเทคโนโลยีผ่าน web app FINE Model รวมถึงการจำลองสถานการณ์เสมือนจริง เพื่อพัฒนาสมรรถนะการสื่อสารวิชาชีพและการบริการตามมาตรฐานสากล',
  '[
    "ระบุคำศัพท์ภาษาอังกฤษเกี่ยวกับวิธีการปรุงอาหาร (Cooking Methods) และส่วนประกอบหลักได้ถูกต้อง",
    "อธิบายโครงสร้างรูปประโยคภาษาอังกฤษที่ใช้ในการอธิบายลักษณะอาหาร (Food Descriptions) ได้",
    "บอกประเภทของวัตถุดิบและส่วนประกอบที่เสี่ยงต่อการแพ้อาหารเบื้องต้นจากชื่อเมนูได้"
  ]'::jsonb,
  '[
    "ออกเสียงคำศัพท์เทคนิคเกี่ยวกับอาหารและวิธีการปรุงได้อย่างถูกต้อง",
    "ใช้เทคโนโลยี AR + 3D Menu และ AI Scan ผ่าน web app FINE Model เพื่อสืบค้นข้อมูลและวิเคราะห์ส่วนประกอบของอาหารได้",
    "พูดอธิบายรายละเอียดเมนูอาหารเป็นภาษาอังกฤษโต้ตอบกับระบบ AI ผ่าน web app FINE Model และบุคคลได้"
  ]'::jsonb,
  '[
    "ความใส่ใจในรายละเอียดของอาหารและความต้องการของลูกค้า (Attentiveness)",
    "ความมั่นใจและบุคลิกภาพที่เหมาะสมในการนำเสนอขายอาหาร (Suggestive Selling)",
    "ทักษะการทำงานร่วมกันเป็นทีมและความรับผิดชอบต่อบทบาทหน้าที่"
  ]'::jsonb,
  '[
    "เลือกใช้คำศัพท์ที่เหมาะสม (Descriptive Words) ในการอธิบายอาหารเพื่อกระตุ้นความต้องการของลูกค้าได้",
    "ประยุกต์ใช้ทักษะภาษาอังกฤษ เพื่อแก้ไขปัญหาและตอบคำถามเกี่ยวกับอาหารในสถานการณ์จำลองหน้างานได้",
    "ปรับเปลี่ยนรูปแบบการอธิบายอาหารให้เหมาะสมกับพฤติกรรมและความต้องการของลูกค้าแต่ละบุคคลได้"
  ]'::jsonb,
  '[
    "Grilled",
    "Braised",
    "Roasted",
    "Steamed",
    "Poached",
    "Pan-fried",
    "Sautéed",
    "Tender",
    "Crispy",
    "Creamy",
    "Rich",
    "Savory",
    "Juicy",
    "Flavorful",
    "Seasoned with",
    "Garnished with",
    "Served with",
    "Infused with"
  ]'::jsonb,
  '[
    "This dish is [Grilled Salmon], which is served with asparagus and mashed potatoes.",
    "It is cooked by pan-frying until the skin is perfectly crispy.",
    "The beef is braised for 5 hours, making it incredibly tender and flavorful.",
    "Inside the soup, it contains dairy products and seafood.",
    "Can you tell me more about this dish?"
  ]'::jsonb,
  'ขั้นนำเข้าสู่บทเรียน (20 นาที)
1. ครูเปิดคลิปวิดีโอสั้นจำลองบรรยากาศพนักงานบริการระดับมิชลินสตาร์กำลังแนะนำและอธิบาย "เมนูจานเด็ด" ให้ลูกค้าชาวต่างชาติฟัง เพื่อให้ผู้เรียนเห็นภาพความสำคัญของระดับภาษากาย น้ำเสียง และคำศัพท์ที่เลือกใช้
2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามท้าทายความคิดผู้เรียน:
   - "ถ้านักเรียนบอกลูกค้าแค่ว่า ''นี่คือหมูทอด'' กับบอกว่า ''นี่คือหมูคุโรบุตะเนื้อนุ่มพิเศษ หมักด้วยสมุนไพรสูตรเฉพาะ นำไปทอดจนกรอบนอกนุ่มใน'' แบบไหนจะทำให้ลูกค้ารู้สึกอยากรับประทานมากกว่ากัน?"
   - "คำศัพท์ภาษาอังกฤษคำใดบ้างที่แปลว่า นุ่ม, กรอบ, หรือ อบ?"
3. ผู้เรียนร่วมกันตอบคำถามและแชร์คำศัพท์ที่ตนเองรู้จัก ครูทำการเชื่อมโยงเข้าสู่บทเรียนเรื่อง Food Description',
  'ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)
1. ครูแจก Worksheet ประจำสัปดาห์เรื่อง "The Master of Food Descriptions"
2. ผู้เรียนใช้สมาร์ตโฟนหรือแท็บเล็ตสแกนระบบ AR + 3D Menu เพื่อดูโมเดลอาหาร 3 มิติเสมือนจริงในเมนูจำลอง
3. ผู้เรียนทำภารกิจ AI Scan Learning โดยการนำกล้องไปสแกนรูปภาพเมนูอาหารหรือโมเดลจำลอง เพื่อให้ระบบ AI Scan วิเคราะห์และแสดงข้อมูล: คำศัพท์ภาษาอังกฤษ, ส่วนประกอบ (Ingredients), วิธีการปรุง (Cooking Methods) และตัวอย่างประโยคอธิบายอาหาร
4. ผู้เรียนบันทึกข้อมูลที่ได้จากการค้นพบลงใน AI Scan Learning Record เพื่อทำความเข้าใจโครงสร้างและจำแนกประเภทคำศัพท์คุณศัพท์อธิบายอาหาร',
  'การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)
1. ครูให้ผู้เรียนเปิดแอปพลิเคชันผ่าน web app FINE Model บนอุปกรณ์ส่วนตัว
2. ผู้เรียนรับบทบาทเป็นพนักงานบริการ ฝึกป้อนคำสั่ง (Prompt) ให้ระบบผ่าน web app FINE Model จำลองตนเองเป็นลูกค้าชาวต่างชาติที่ต้องการทราบรายละเอียดของอาหาร เช่น "Can you tell me more about this dish?" หรือ "How is this chicken prepared?"
3. ผู้เรียนฝึกสนทนาโต้ตอบผ่านระบบเสียงผ่าน web app FINE Model โดยการอธิบายลักษณะอาหาร วิธีการปรุง และวัตถุดิบตามหัวข้อที่เรียนมา เพื่อให้ระบบ AI จับสัญญาณเสียง ตรวจสอบความถูกต้องของการออกเสียง (Pronunciation) ความคล่องแคล่ว (Fluency) และให้คำแนะนำสะท้อนกลับเพื่อปรับปรุงสำนวนภาษา',
  'การเรียนรู้ผ่านสถานการณ์จำลอง Restaurant Simulation (55 นาที)
1. ครูแบ่งผู้เรียนออกเป็นกลุ่ม กลุ่มละ 4-5 คน และพาเข้าสู่พื้นที่ปฏิบัติการห้องอาหารจำลอง (Restaurant Simulation)
2. ครูแจกการ์ดโจทย์สถานการณ์จำลองที่พลิกแพลงให้แต่ละกลุ่ม เช่น "กลุ่มที่ 1 ต้องแนะนำเมนูสเต็กเนื้อแก่ลูกค้าที่ชอบเนื้อแบบนุ่มและชุ่มฉ่ำ", "กลุ่มที่ 2 ต้องอธิบายเมนูพาสต้าที่มีส่วนผสมของอาหารทะเลให้ลูกค้าที่มีข้อสงสัยเรื่องวัตถุดิบ"
3. ผู้เรียนในกลุ่มร่วมกันระดมสมอง วางแผน ออกแบบการพูด นัดแนะจังหวะการแสดงทักษะกายภาพประกอบการพูด (เช่น การผายมือชี้ไปที่รายการอาหารในเล่มเมนู) และทำการฝึกซ้อมร่วมกัน',
  'การลงมือปฏิบัติจริง (35 นาที)
1. ตัวแทนแต่ละกลุ่มออกมาปฏิบัติภารกิจแนะนำและอธิบายอาหารเป็นภาษาอังกฤษแก่ลูกค้า (รับบทโดยครูหรือเพื่อนต่างกลุ่ม) ในห้องอาหารจำลอง โดยเป็นการแสดงสดโดยไม่ดูโพยหรือสคริปต์
2. ผู้เรียนทุกคนทำควิซทดสอบออนไลน์ท้ายบทเรียนผ่าน web app FINE Model เพื่อประเมินความจำด้านคำศัพท์และโครงสร้างประโยคอธิบายอาหารรายบุคคล
3. ครูประเมินสมรรถนะการนำเสนอและการบริการรายกลุ่มด้วยแบบประเมิน Rubric Score และให้คะแนนชื่นชมกลุ่มที่ใช้ทักษะการแนะนำอาหารได้อย่างประทับใจ',
  'ขั้นสรุปและสะท้อนคิด (20 นาที)
1. Reflection: ครูและผู้เรียนสรุปองค์ความรู้ร่วมกัน: การอธิบายอาหารไม่ใช่เพียงการบอกชื่อวัตถุดิบ แต่คือการใช้คำพูดที่สร้างความประทับใจให้ลูกค้ารู้สึกถึงรสชาติ, การฝึกฝนกับผ่าน web app FINE Model ช่วยให้ผู้เรียนกล้าพูดภาษาอังกฤษ และการใช้ AR + 3D Menu ผ่าน web app FINE Model ช่วยเพิ่มความเข้าใจในรายละเอียดของอาหาร
2. ผู้เรียนเขียนกิจกรรม Exit Ticket: สรุปคำศัพท์วิธีการปรุงอาหาร 3 คำ และคำคุณศัพท์อธิบายรสชาติ/เนื้อสัมผัส 3 คำเป็นภาษาอังกฤษ พร้อมคำแปล ส่งครูก่อนจบคาบเรียน',
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

-- 2. Insert Week 7 Assignments for ครูพิมพ์
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-777777777701',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-7',
  'สัปดาห์ที่ 7 [F]: ใบงาน Worksheet & AI Scan การอธิบายลักษณะอาหารและวิธีปรุง The Master of Food Descriptions',
  'ให้นักเรียนสแกนดูโมเดลอาหาร 3D Menu และใช้ AI Scan สแกนรายการอาหารเพื่อวิเคราะห์วัตถุดิบ (Ingredients) วิธีการปรุง (Cooking Methods) และคำคุณศัพท์อธิบายรสชาติ/เนื้อสัมผัส (Descriptive Words) บันทึกลงใน AI Scan Learning Record',
  'Familiarize',
  20,
  NOW() + interval '49 days',
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
  'a1111111-1111-4111-8111-777777777702',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-7',
  'สัปดาห์ที่ 7 [I]: ฝึกพูดอธิบายเมนูอาหาร ตอบข้อซักถามลูกค้ากับ AI Voice',
  'ให้นักเรียนฝึกพูดอธิบายลักษณะอาหาร วิธีการปรุง และสารก่อภูมิแพ้เป็นภาษาอังกฤษโต้ตอบกับระบบ AI ใน web app FINE Model ที่รับบทเป็นลูกค้าต่างชาติสอบถามรายละเอียดเมนูอาหาร พร้อมรับผลประเมินสำเนียงและความคล่องแคล่ว',
  'Interact',
  20,
  NOW() + interval '49 days',
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
  'a1111111-1111-4111-8111-777777777703',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-7',
  'สัปดาห์ที่ 7 [N]: ภารกิจจำลอง Restaurant Simulation นำเสนอและแนะนำเมนูอาหาร Suggestive Selling',
  'ให้นักเรียนร่วมกันระดมสมองและฝึกซ้อมการแนะนำเมนูอาหารจานเด็ด (Suggestive Selling) ตามโจทย์การ์ดสถานการณ์จำลอง (เช่น แนะนำสเต็กเนื้อนุ่มชุ่มฉ่ำ หรืออธิบายวัตถุดิบพาสต้าอาหารทะเล) พร้อมแสดงท่าทางประกอบอย่างมืออาชีพ',
  'Navigate',
  20,
  NOW() + interval '49 days',
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
  'a1111111-1111-4111-8111-777777777704',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-7',
  'สัปดาห์ที่ 7 [E]: กิจกรรม Exit Ticket สรุปคำศัพท์การปรุง/รสชาติ 6 คำ และ Quiz สัปดาห์ที่ 7',
  'ให้ตัวแทนแต่ละกลุ่มนำเสนออธิบายอาหารสดหน้าชั้นเรียนโดยไม่ใช้โพย, ผู้เรียนทุกคนทำ Quiz ออนไลน์ด้านคำศัพท์ Food Description และเขียน Exit Ticket สรุปคำศัพท์วิธีปรุง 3 คำ และคำอธิบายรสชาติ 3 คำพร้อมคำแปลส่งก่อนจบคลาส',
  'Exhibit',
  20,
  NOW() + interval '49 days',
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
