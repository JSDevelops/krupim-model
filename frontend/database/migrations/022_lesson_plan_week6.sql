-- Migration 022: Add Week 6 Lesson Plan & Assignments for ครูพิมพ์ (krupim@ktc.ac.th)
BEGIN;

-- 1. Insert FINE Lesson Plan Week 6: Seating Guests and Small Talk
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
  'lesson-plan-week-6',
  'แผนการจัดการเรียนรู้ สัปดาห์ที่ 6: Seating Guests and Small Talk (การเชิญลูกค้านั่งโต๊ะและการสนทนาเบื้องต้น)',
  '20701-2020 การบริการอาหารและเครื่องดื่ม (Food and Beverage Service)',
  'ปวช.1 สาขาวิชาการโรงแรม',
  'ภาคเรียนที่ 1',
  '4 ชั่วโมง (240 นาที)',
  COALESCE((SELECT name FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), 'ปวช. 1/1'),
  'สัปดาห์ที่ 6',
  'การพาลูกค้าไปนั่งที่โต๊ะอาหารและการชวนสนทนาเบื้องต้น (Seating Guests and Small Talk) เป็นขั้นตอนสำคัญในการสร้างความคุ้นเคย และความรู้สึกอบอุ่นให้แก่ลูกค้าก่อนการเริ่มต้นสั่งอาหาร พนักงานบริการจำเป็นต้องเรียนรู้ทักษะการเดินนำทาง การดึงเก้าอี้และผายมือเชิญนั่งที่ถูกต้องตามหลักสากล ตลอดจนการเลือกใช้สำนวนภาษาอังกฤษในการเริ่มบทสนทนาทั่วไป (Small Talk) ที่สุภาพ ไม่ละลาบละล้วง และช่วยสร้างความสัมพันธ์อันดี (Rapport) ระหว่างพนักงานกับลูกค้า โดยการจัดการเรียนรู้นี้ได้บูรณาการโครงสร้าง FINE Model ร่วมกับเทคโนโลยี ผ่าน web app FINE Model เพื่อมุ่งเน้นให้ผู้เรียนเกิดความเชี่ยวชาญด้านบุคลิกภาพวิชาชีพและการสื่อสารอย่างเป็นธรรมชาติ',
  '[
    "ระบุลำดับขั้นตอนและหลักการเชิญลูกค้านั่งโต๊ะ (Seating Procedure) ตามมาตรฐานระดับสากลได้ถูกต้อง",
    "อธิบายความหมาย และหัวข้อที่เหมาะสมในการสนทนาเบื้องต้น (Small Talk Topics) กับลูกค้าต่างชาติได้",
    "จำแนกรูปประโยคภาษาอังกฤษที่ใช้ในการผายมือ เชิญนั่ง และการสอบถามความพึงพอใจเรื่องโต๊ะอาหารได้"
  ]'::jsonb,
  '[
    "ปฏิบัติท่าทางการเดินนำ การผายมือ และการดึงเก้าอี้เชิญลูกค้านั่งได้อย่างนุ่มนวลและถูกพิกัดความปลอดภัย",
    "สื่อสารโต้ตอบบทสนทนาภาษาอังกฤษทั่วไป และตอบรับข้อมูลจากลูกค้าผ่าน web app FINE Model ได้อย่างเป็นธรรมชาติและถูกต้อง",
    "ประยุกต์ใช้สำนวนการสนทนาเพื่อสร้างความสัมพันธ์อันดีกับลูกค้าในบริบทห้องอาหารจำลองได้อย่างเหมาะสม"
  ]'::jsonb,
  '[
    "ความช่างสังเกต มีไหวพริบ และความเอาใจใส่ต่อความต้องการของลูกค้า (Attentiveness)",
    "บุคลิกภาพดี มั่นใจ และน่าเชื่อถือตามมาตรฐานงานบริการส่วนหน้าของห้องอาหาร",
    "เจตคติที่ดีในการต้อนรับ และใช้ภาษาอังกฤษเพื่อสร้างความประทับใจ"
  ]'::jsonb,
  '[
    "เลือกใช้หัวข้อในการพูดคุย (Small Talk) ได้สอดคล้องกับบรรยากาศและลักษณะของลูกค้าแต่ละบุคคล",
    "ปรับเปลี่ยนพฤติกรรมการบริการ และการต้อนรับตามข้อมูลสะท้อนกลับที่ได้รับจากระบบ AI ผ่าน web app FINE Model",
    "จัดการระบบลำดับความสำคัญในการพาลูกค้าต่างรูปแบบ (เช่น ผู้สูงอายุ หรือผู้มาติดต่อธุรกิจ) ไปยังโต๊ะที่เหมาะสมได้"
  ]'::jsonb,
  '[
    "Seating Procedure",
    "Small Talk",
    "Safe Topics",
    "Taboo Topics",
    "Rapport",
    "Attentiveness",
    "Front of the House",
    "Awkward Silence"
  ]'::jsonb,
  '[
    "Please follow me, sir/madam. Your table is this way.",
    "Allow me, sir/madam.",
    "Is this table suitable for you?",
    "How was your journey to the restaurant today?",
    "How are you enjoying the weather today?",
    "Is this your first time visiting our city?"
  ]'::jsonb,
  'ขั้นนำเข้าสู่บทเรียน (20 นาที)
1. ครูจัดสถานการณ์สมมติในห้องเรียน โดยครูทำหน้าที่เดินนำผู้เรียนคนหนึ่งไปยังเก้าอี้ แต่แกล้งเดินเร็วเกินไป ดึงเก้าอี้เสียงดัง และไม่พูดคุยใดๆ ตลอดทาง เพื่อให้ผู้เรียนคนอื่นๆ สังเกตและวิเคราะห์พฤติกรรม
2. กิจกรรมกระตุ้นคิด (Brainstorming): ครูใช้คำถามเพื่อเชื่อมโยงเข้าสู่เนื้อหาบทเรียน:
   - “จากเหตุการณ์จำลองเมื่อครู่ นักเรียนคิดว่าพนักงานขาดทักษะด้านใดบ้าง และส่งผลต่อความรู้สึกของลูกค้าอย่างไร?”
   - “ระยะทางจากประตูห้องอาหารไปยังโต๊ะที่นั่ง หากปล่อยให้เกิดความเงียบ (Awkward Silence) นานเกินไป เราจะใช้การสนทนาประเภทใดมาช่วยสร้างบรรยากาศให้ดีขึ้น?”
3. ผู้เรียนร่วมกันอภิปรายและแสดงความคิดเห็น ครูสรุปข้อมูลเพื่อนำเข้าสู่การเรียนรู้เรื่องกระบวนการเชิญลูกค้าไปนั่งโต๊ะ และการทำ Small Talk',
  'ขั้นทำความคุ้นเคย ผ่าน web app FINE Model การเรียนรู้ขั้นตอนและชุดคำศัพท์ (60 นาที)
1. ครูแจก Worksheet ประจำสัปดาห์เรื่อง "Seating Etiquette & Art of Small Talk"
2. ผู้เรียนศึกษาลำดับการปฏิบัติงานต้อนรับส่วนหน้าห้องอาหาร: การเดินนำหน้าลูกค้า 1-2 ก้าว, การหันมามองลูกค้าเป็นระยะ, การดึงเก้าอี้ให้ลูกค้าผู้หญิงหรือผู้มีอาวุโสก่อน, และการคลี่ผ้าเช็ด napkin
3. ผู้เรียนเลือกสำนวนภาษาอังกฤษที่ใช้ในการสนทนาเบื้องต้น โดยครูอธิบายถึงหัวข้อที่ควรนำมาใช้ (Safe Topics) เช่น ดินฟ้าอากาศ การเดินทาง ความสวยงามของสถานที่ และหัวข้อที่ควรหลีกเลี่ยง (Taboo Topics) เช่น การเมือง ศาสนา และเรื่องส่วนตัว
4. ผู้เรียนฝึกออกเสียงประโยคนำทาง และประโยคคำถามชวนคุยตามครูเพื่อให้เกิดความคุ้นชินในการสนทนา',
  'การปฏิสัมพันธ์ ผ่านเทคโนโลยี AI Support ผ่าน web app FINE Model (50 นาที)
1. ครูให้ผู้เรียนทุกคนเปิดใช้งานเครื่องมือผ่าน web app FINE Model บนอุปกรณ์สื่อสารส่วนบุคคล
2. ผู้เรียนกำหนดคำสั่งควบคุม (Prompt) เพื่อให้ผ่าน web app FINE Model จำลองบทบาทเป็นลูกค้าประเภทต่างๆ ที่กำลังเดินตามพนักงานไปที่โต๊ะอาหาร
3. ผู้เรียนฝึกใช้ฟังก์ชันเสียงผ่าน web app FINE Model สื่อสารและสลับกันถาม-ตอบบทสนทนาทั่วไป (Small Talk) แบบต่อเนื่อง โดยพยายามประคับประคองการสนทนาให้ลื่นไหลอย่างน้อย 3-4 ประโยคโต้ตอบ เช่น:
   - Student: "It is quite a beautiful sunny day today, isn''t it?"
   - Gemini Live: "Yes, it is absolutely lovely! I hope it stays like this all weekend."
   - Student: "I hope so too. Have you had a chance to explore the city yet?"
4. ผู้เรียนวิเคราะห์รายงานผลสะท้อนกลับจากระบบ AI ผ่าน web app FINE Model เกี่ยวกับความต่อเนื่องในการพูด (Fluency) และคำศัพท์ที่เลือกใช้ เพื่อนำมาปรับปรุงตนเอง',
  'การเรียนรู้ผ่านสถานการณ์จำลอง Restaurant Simulation (55 นาที)
1. ครูนำผู้เรียนเข้าสู่พื้นที่ปฏิบัติการห้องอาหารจำลอง Restaurant Simulation ผ่าน web app FINE Model และแบ่งผู้เรียนออกเป็นกลุ่ม กลุ่มละ 4-5 คน
2. สถานการณ์จำลอง: แต่ละกลุ่มส่งตัวแทนมารับ "ใบสั่งการณ์ภารกิจนำนั่ง" ซึ่งมีโจทย์ที่ท้าทายต่างกัน เช่น "พาลูกค้าผู้สูงอายุที่เดินช้าไปยังโต๊ะด้านในพร้อมชวนคุยเรื่องความสะดวกสบายในการเดินทาง" หรือ "พาลูกค้านักธุรกิจที่กำลังคุยโทรศัพท์ไปยังโต๊ะที่เงียบสงบโดยใช้ภาษาท่าทางทดแทนการขัดจังหวะ"
3. ผู้เรียนในกลุ่มร่วมกันแบ่งหน้าที่และแสดงบทบาทสมมติ (Role-play) โดยครูจะเดินตรวจเช็กพิกัด ท่าทาง ระยะห่างในการเดิน และความสุภาพในการสนทนา
4. สมาชิกกลุ่มที่เหลือทำหน้าที่เป็นผู้สังเกตการณ์เพื่อจดบันทึกข้อดีและข้อที่ควรปรับปรุงของเพื่อนลงในแบบฟอร์มประเมิน',
  'การลงมือปฏิบัติจริง (35 นาที)
1. ตัวแทนของแต่ละกลุ่มออกมาสาธิตทักษะการเชิญลูกค้านั่งโต๊ะและการทำ Small Talk ร่วมกันเป็นภาษาอังกฤษใน Restaurant Simulation โดยไม่มีการดูสคริปต์
2. ครูทำการประเมินสมรรถนะรายบุคคลและรายกลุ่มโดยละเอียดโดยใช้เกณฑ์การประเมินที่กำหนดมาตรฐานไว้
3. ผู้เรียนทุกคนทำแบบทดสอบความรู้ท้ายสัปดาห์ (Post-test Quiz) ผ่าน web app FINE Model เพื่อประเมินความแม่นยำด้านหลักการและสำนวนภาษาอังกฤษ
4. ครูประกาศคะแนนและชื่นชมกลุ่มที่แสดงออกได้สอดคล้องตามมาตรฐานวิชาชีพมากที่สุด',
  'ขั้นสรุปและสะท้อนคิด (20 นาที)
1. Reflection: ครูและผู้เรียนร่วมกันสะท้อนความคิดเห็น: การพานั่งโต๊ะไม่ใช่แค่การเดินนำ แต่คือการใส่ใจในความปลอดภัย และสร้างบรรยากาศที่อบอุ่น, ทักษะ Small Talk ช่วยคลายความกังวล และการฝึกซ้อมผ่าน web app FINE Model ช่วยลดความประหม่าในการเจอสถานการณ์จริง
2. ผู้เรียนทำกิจกรรม Exit Ticket: เขียนสรุปหัวข้อ Small Talk ที่คิดว่าตนเองถนัดและมั่นใจในการชวนลูกค้าคุยมากที่สุด เป็นภาษาอังกฤษ 2 ข้อ ส่งครูก่อนเลิกคาบเรียน',
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

-- 2. Insert Week 6 Assignments for ครูพิมพ์
-- F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-666666666601',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-6',
  'สัปดาห์ที่ 6 [F]: ใบงาน Worksheet ขั้นตอนการนำนั่ง Seating Etiquette & Safe/Taboo Topics',
  'ให้นักเรียนทำแบบฝึกหัดเกี่ยวกับขั้นตอนมารยาทการนำลูกค้านั่งโต๊ะ (Seating Etiquette) และการจำแนกหัวข้อที่เหมาะสม (Safe Topics) กับหัวข้อต้องห้าม (Taboo Topics) ในการทำ Small Talk',
  'Familiarize',
  20,
  NOW() + interval '42 days',
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
  'a1111111-1111-4111-8111-666666666602',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-6',
  'สัปดาห์ที่ 6 [I]: ฝึกสนทนา Small Talk ต่อเนื่อง 3-4 ประโยคกับ AI Support',
  'ให้นักเรียนฝึกโต้ตอบบทสนทนาทั่วไป (Small Talk) ขณะเดินนำลูกค้าไปยังโต๊ะอาหารกับ AI ใน web app FINE Model ต่อเนื่องอย่างน้อย 3-4 ประโยค พร้อมบันทึกผลการประเมินความลื่นไหล (Fluency)',
  'Interact',
  20,
  NOW() + interval '42 days',
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
  'a1111111-1111-4111-8111-666666666603',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-6',
  'สัปดาห์ที่ 6 [N]: สถานการณ์จำลอง Restaurant Simulation ภารกิจนำนั่งและ Small Talk ตามโจทย์ท้าทาย',
  'ให้นักเรียนแบ่งกลุ่มปฏิบัติการเดินนำทาง ผายมือ ดึงเก้าอี้ และชวนคุย Small Talk ตามโจทย์เฉพาะหน้า (เช่น พาลูกค้าผู้สูงอายุเดินช้า หรือลูกค้าธุรกิจที่คุยโทรศัพท์) ในห้องปฏิบัติการ Restaurant Simulation',
  'Navigate',
  20,
  NOW() + interval '42 days',
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
  'a1111111-1111-4111-8111-666666666604',
  COALESCE((SELECT id FROM classes WHERE teacher_id = (SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1) LIMIT 1), '22222222-2222-2222-2222-222222222201'::uuid),
  COALESCE((SELECT id FROM app_users WHERE email = 'krupim@ktc.ac.th' LIMIT 1), '00000000-0000-0000-0000-000000000020'::uuid),
  'lesson-plan-week-6',
  'สัปดาห์ที่ 6 [E]: กิจกรรม Exit Ticket สรุปหัวข้อ Small Talk 2 ประโยค และ Quiz สัปดาห์ที่ 6',
  'ให้ตัวแทนแสดงการนำนั่งและทำ Small Talk หน้าชั้นเรียนโดยไม่ใช้สคริปต์, ผู้เรียนทุกคนทำ Quiz ออนไลน์ประจำสัปดาห์ที่ 6 และเขียน Exit Ticket ระบุหัวข้อ Small Talk 2 ประโยคที่มั่นใจส่งก่อนจบคลาส',
  'Exhibit',
  20,
  NOW() + interval '42 days',
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
