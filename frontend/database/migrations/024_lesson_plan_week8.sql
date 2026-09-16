-- Migration 024: Add Week 8 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 8: Introducing Menu Items (Beverage Recommendation)
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
  'lesson-plan-week-8',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 8: Introducing Menu Items (Beverage Recommendation: การแนะนำเครื่องดื่ม ให้ข้อมูลไวน์ การจับคู่อาหาร)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 8',
  'การแนะนำเครื่องดื่มและการให้ข้อมูลเกี่ยวกับไวน์ ตลอดจนการจับคู่เครื่องดื่มกับอาหาร (Beverage Recommendation and Food Pairing) เป็นสมรรถนะวิชาชีพขั้นสูงที่ช่วยยกระดับมาตรฐานการบริการและเพิ่มยอดขายให้แก่ห้องอาหาร พนักงานบริการต้องมีความรู้ความเข้าใจในประเภทของเครื่องดื่ม รสชาติ และหลักการจับคู่รสชาติสากล เพื่อให้คำแนะนำที่ถูกต้องและตอบข้อซักถามของลูกค้าได้อย่างมั่นใจ การจัดการเรียนรู้นี้บูรณาการโครงสร้าง FINE Model ร่วมกับเทคโนโลยี ผ่าน web app FINE Model รวมถึงระบบห้องปฏิบัติการจำลอง เพื่อพัฒนาทักษะการคิดวิเคราะห์และการสื่อสารภาษาอังกฤษ',
  '[
    "ระบุประเภทคำศัพท์ภาษาอังกฤษเกี่ยวกับเครื่องดื่มและไวน์ชนิดต่างๆ ได้ถูกต้อง",
    "อธิบายหลักการเบื้องต้นในการจับคู่เครื่องดื่มกับอาหาร (Food and Beverage Pairing) ตามมาตรฐานสากลได้",
    "บอกโครงสร้างประโยคภาษาอังกฤษที่ใช้ในการแนะนำและตอบคำถามเกี่ยวกับเครื่องดื่มได้"
  ]'::jsonb,
  '[
    "ออกเสียงชื่อเครื่องดื่มและไวน์ยี่ห้อสากลได้อย่างถูกต้อง",
    "ใช้เทคโนโลยี AR + 3D Menu และ AI Scan ผ่าน web app FINE Model ในการสืบค้นข้อมูลรสชาติและลักษณะของเครื่องดื่มได้",
    "พูดเสนอแนะและโต้ตอบบทสนทนาภาษาอังกฤษในการจับคู่อาหารกับเครื่องดื่มผ่านระบบ AI ผ่าน web app FINE Model ได้"
  ]'::jsonb,
  '[
    "ไหวพริบ และความช่างสังเกตความต้องการของลูกค้า (Responsiveness)",
    "ความเชื่อมั่นในตนเองและมีบุคลิกภาพของผู้นำเสนอขาย (Professional Presence)",
    "ความรับผิดชอบและกระตือรือร้นในการปฏิบัติงานร่วมกับผู้อื่น"
  ]'::jsonb,
  '[
    "เลือกและแนะนำเครื่องดื่มที่ช่วยชูรสชาติอาหารตามที่ลูกค้าสั่งได้อย่างเหมาะสม",
    "ประยุกต์ใช้ทักษะภาษาอังกฤษเพื่อตอบคำถามและข้อสงสัยของลูกค้าเกี่ยวกับเครื่องดื่มในสถานการณ์จำลองหน้างานได้",
    "ปรับเปลี่ยนกลยุทธ์การนำเสนอขายเครื่องดื่ม (Upselling) ได้เหมาะสมตามลักษณะและพฤติกรรมของลูกค้า"
  ]'::jsonb,
  '[
    "Red wine",
    "White wine",
    "Sparkling wine",
    "Champagne",
    "Rosé wine",
    "Full-bodied",
    "Light-bodied",
    "Dry",
    "Sweet",
    "Fruity",
    "Crisp",
    "Acidic",
    "Pair with",
    "Go well with",
    "Complement",
    "Recommend",
    "Enhance"
  ]'::jsonb,
  '[
    "For the main course, I would highly recommend a glass of Cabernet Sauvignon.",
    "This white wine pairs perfectly with seafood as it has a crisp and acidic taste.",
    "If you prefer something sweet, this dessert wine will complement your cake.",
    "To answer your question, this beverage is completely non-alcoholic."
  ]'::jsonb,
  'ขั้นนำเข้าสู่บทเรียน (20 นาที)
1. ครูจัดกิจกรรมทายภาพ "Perfect Match Game" โดยขึ้นภาพเมนูอาหาร เช่น Steak หรือ Seafood แล้วให้ผู้เรียนร่วมกันทายว่าเครื่องดื่มประเภทใด (เช่น ไวน์แดง ไวน์ขาว หรือน้ำโซดา) ที่ควรจะนำไปวางคู่กันบนโต๊ะอาหาร
2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามปลายเปิดเพื่อกระตุ้นกระบวนการคิด:
   - "ถ้านักเรียนสั่งสเต็กเนื้อวัวรสชาติเข้มข้น แต่พนักงานนำไวน์ขาวรสหวานมาเสิร์ฟให้ นักเรียนจะรู้สึกอย่างไร?"
   - "ในฐานะพนักงานบริการ เราจะมีวิธีพูดแนะนำเครื่องดื่มอย่างไรให้ดูสุภาพ น่าเชื่อถือ และไม่ทำให้ลูกค้ารู้สึกอึดอัด?"
3. ผู้เรียนร่วมกันแสดงความคิดเห็น ครูสรุปประเด็นและเชื่อมโยงเข้าสู่เป้าหมายการเรียนรู้วิธีการแนะนำเครื่องดื่ม',
  'ขั้นทำความคุ้นเคย ผ่านเทคโนโลยี web app FINE Model (60 นาที)
1. ครูแจก Worksheet ประจำสัปดาห์เรื่อง "The Beverage Sommelier"
2. ผู้เรียนใช้เครื่องมือสมาร์ตโฟนสแกน AR + 3D Menu เพื่อดูโมเดล 3 มิติของขวดเครื่องดื่มและแก้วไวน์ประเภทต่างๆ
3. ผู้เรียนทำภารกิจ AI Scan Learning web app FINE Model โดยการนำกล้องไปสแกนป้ายฉลากเครื่องดื่มจำลองหรือเมนูเครื่องดื่ม เพื่อระบุคีย์เวิร์ดภาษาอังกฤษ รสชาติ และประวัติย่อของเครื่องดื่มนั้นๆ
4. ผู้เรียนจดบันทึกรายละเอียดของรสชาติเครื่องดื่มและคำศัพท์เฉพาะลงใน AI Scan Learning Record ผ่าน web app FINE Model เพื่อสร้างคลังความรู้ส่วนบุคคล',
  'การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)
1. ครูให้ผู้เรียนเปิดใช้งานระบบแอปพลิเคชัน ผ่าน web app FINE Model
2. ผู้เรียนตั้งค่าโหมดคำสั่งผ่าน web app FINE Model สวมบทบาทเป็นลูกค้าที่มีความจุกจิกและชอบถามคำถามเชิงลึกเกี่ยวกับเครื่องดื่ม เช่น "What kind of wine goes well with this spicy pasta?" หรือ "Is this drink too sweet?"
3. ผู้เรียนฝึกสนทนาโต้ตอบด้วยเสียงจริงผ่าน web app FINE Model โดยพยายามพูดประโยคแนะนำ แนะนำรสชาติ และเสนอทางเลือกการจับคู่อาหารให้แก่ AI ผ่าน web app FINE Model
4. ผู้เรียนรับคำแนะนำเชิงสะท้อนกลับ (Feedback) จากระบบ AI ผ่าน web app FINE Model ด้านการใช้คำศัพท์ที่สละสลวย การจัดลำดับคำพูด และความถูกต้องของการออกเสียงชื่อเฉพาะ เพื่อนำมาปรับใช้',
  'การเรียนรู้ผ่านสถานการณ์จำลอง ผ่าน Restaurant Simulation (55 นาที)
1. ครูนำผู้เรียนเข้าสู่พื้นที่ Restaurant Simulation (ห้องปฏิบัติการจำลอง) และรวมกลุ่มกลุ่มละ 4-5 คน
2. แต่ละกลุ่มจะได้รับ "การ์ดคำสั่งภารกิจแนะนำเครื่องดื่ม" ซึ่งเป็นสถานการณ์สมมติหน้างาน เช่น "ลูกค้าสั่งอาหารประเภทปลาหิมะอบ และต้องการให้พนักงานเสนอไวน์ที่เข้ากัน 1 แก้ว" หรือ "ลูกค้าไม่ดื่มแอลกอฮอล์ พนักงานต้องนำเสนอเครื่องดื่มม็อกเทลที่มีความสดชื่นแทน"
3. ผู้เรียนในกลุ่มร่วมกันฝึกฝน แบ่งหน้าที่เป็นพนักงานบริการและลูกค้า ฝึกฝนท่วงท่าการเดินไปที่โต๊ะ การผายมือชี้เมนูเครื่องดื่ม และการใช้น้ำเสียงโน้มน้าวใจ (Upselling Technique) อย่างสุภาพ',
  'การลงมือปฏิบัติจริง (35 นาที)
1. ตัวแทนแต่ละกลุ่มออกมาแสดงบทบาทสมมติในการแนะนำเครื่องดื่มและการตอบคำถามลูกค้าหน้าโต๊ะอาหารจำลองแบบสถานการณ์สด โดยไม่มีการดูเอกสาร
2. ครูประเมินสมรรถนะผู้เรียนรายบุคคลและรายกลุ่มผ่านเกณฑ์การประเมิน (Rubric Score)
3. ผู้เรียนทุกคนทำแบบทดสอบออนไลน์ประจำสัปดาห์ (Post-test Quiz) ผ่าน web app FINE Model เพื่อวัดระดับความรู้เรื่องการจับคู่อาหารและเครื่องดื่ม',
  'ขั้นสรุปและสะท้อนความคิดเห็น (20 นาที)
1. Reflection: ครูและผู้เรียนสรุปหลักการร่วมกัน: การแนะนำเครื่องดื่มคือการช่วยให้มื้ออาหารของลูกค้าสมบูรณ์แบบยิ่งขึ้น, การเข้าใจรสชาติช่วยให้เราตอบคำถามได้อย่างมั่นใจ, และการฝึกพูดสม่ำเสมอผ่าน web app FINE Model ช่วยขจัดความกลัวในการคุยกับชาวต่างชาติ
2. ผู้เรียนเขียนกิจกรรม Exit Ticket: ระบุชื่ออาหาร 1 จาน และเครื่องดื่มที่แนะนำให้จับคู่กัน 1 ชนิด พร้อมเขียนประโยคแนะนำภาษาอังกฤษ 1 ประโยค ส่งครูก่อนออกจากห้องเรียน',
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

-- 2. Insert Week 8 Assignments for ครูพิมพ์
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-888888888801',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-8',
  'สัปดาห์ที่ 8 [F]: ใบงาน Worksheet & AI Scan จัดหมวดหมู่ไวน์และรสชาติ The Beverage Sommelier',
  'ให้นักเรียนสแกนดูโมเดล 3D ขวดเครื่องดื่ม/แก้วไวน์ และใช้ AI Scan สแกนฉลากเครื่องดื่มเพื่อระบุรสชาติและประวัติย่อ พร้อมทำใบงานแยกหมวดหมู่ Wine Categories และ Taste Profiles',
  'Familiarize',
  20,
  NOW() + interval '56 days',
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
  'a1111111-1111-4111-8111-888888888802',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-8',
  'สัปดาห์ที่ 8 [I]: ฝึกสนทนาแนะนำเครื่องดื่มและตอบข้อซักถามกับ AI Support',
  'ให้นักเรียนฝึกโต้ตอบด้วยเสียงจริงกับ AI ในโหมดลูกค้าจุกจิกที่สอบถามเรื่องไวน์และรสชาติเครื่องดื่ม เช่น "What kind of wine goes well with this spicy pasta?" เพื่อรับ Feedback ด้านการออกเสียงและการจัดลำดับคำพูด',
  'Interact',
  20,
  NOW() + interval '56 days',
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
  'a1111111-1111-4111-8111-888888888803',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-8',
  'สัปดาห์ที่ 8 [N]: ภารกิจจำลอง Restaurant Simulation แนะนำเครื่องดื่มจับคู่อาหาร Food Pairing & Upselling',
  'ให้นักเรียนฝึกปฏิบัติการแนะนำเครื่องดื่มและจับคู่ไวน์กับอาหารตามการ์ดคำสั่งภารกิจ (เช่น ลูกค้าสั่งปลาหิมะอบ หรือลูกค้าไม่ดื่มแอลกอฮอล์) พร้อมฝึกท่วงท่าการผายมือชี้เมนูและการใช้น้ำเสียง Upselling อย่างสุภาพ',
  'Navigate',
  20,
  NOW() + interval '56 days',
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
  'a1111111-1111-4111-8111-888888888804',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-8',
  'สัปดาห์ที่ 8 [E]: กิจกรรม Exit Ticket ออกแบบคู่หูอาหารและเครื่องดื่ม 1 คู่ และ Quiz สัปดาห์ที่ 8',
  'ให้ตัวแทนแสดงบทบาทสมมติการแนะนำเครื่องดื่มจับคู่หน้าโต๊ะอาหารจำลอง, ผู้เรียนทุกคนทำ Quiz ออนไลน์เรื่อง Beverage Recommendation & Food Pairing และเขียน Exit Ticket ออกแบบคู่หูอาหาร-เครื่องดื่ม 1 คู่พร้อมประโยคแนะนำส่งก่อนจบคลาส',
  'Exhibit',
  20,
  NOW() + interval '56 days',
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
