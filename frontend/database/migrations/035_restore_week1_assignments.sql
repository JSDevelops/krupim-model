-- Migration 035: Restore Week 1 Assignments with Unique UUIDs and link to lesson-plan-week-1
BEGIN;

-- 1. F: Familiarize
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-010101010101',
  '22222222-2222-2222-2222-222222222201',
  '00000000-0000-0000-0000-000000000020',
  'lesson-plan-week-1',
  'สัปดาห์ที่ 1 [F]: ใบงาน Worksheet & AI Scan อุปกรณ์ Cutlery & Glassware 10 ชนิด',
  'ให้นักเรียนสแกนโมเดล 3D และทำใบงานจับคู่คำศัพท์อุปกรณ์ Cutlery และ Glassware จำนวน 10 ชนิด พร้อมใช้ AI Scan สแกนอุปกรณ์จริงในห้องปฏิบัติการและบันทึกลงใน AI Scan Learning Record',
  'Familiarize',
  20,
  NOW() + interval '7 days',
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

-- 2. I: Interact
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-010101010102',
  '22222222-2222-2222-2222-222222222201',
  '00000000-0000-0000-0000-000000000020',
  'lesson-plan-week-1',
  'สัปดาห์ที่ 1 [I]: ฝึกพูดและแต่งประโยคระบุหน้าที่อุปกรณ์กับ AI Voice',
  'ให้นักเรียนฝึกออกเสียงคำศัพท์เดี่ยวและพูดประโยคระบุหน้าที่ตามโครงสร้าง "This is a [อุปกรณ์]. It is used for [หน้าที่]." ผ่านระบบ AI Voice เพื่อรับคำแนะนำด้านสำเนียงและความคล่องแคล่ว (Fluency)',
  'Interact',
  20,
  NOW() + interval '7 days',
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

-- 3. N: Navigate
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-010101010103',
  '22222222-2222-2222-2222-222222222201',
  '00000000-0000-0000-0000-000000000020',
  'lesson-plan-week-1',
  'สัปดาห์ที่ 1 [N]: ภารกิจจำลองการจัดโต๊ะอาหาร Restaurant Table Setup Challenge',
  'ให้นักเรียนร่วมกันจัดโต๊ะอาหารแบบ Formal Western Table Setting ตามหลักการ Outside-In (สำหรับเมนู ซุป, ปลา, อาหารจานหลัก และไวน์ขาว) ถ่ายภาพการจัดโต๊ะอาหารจริงที่ถูกต้องเพื่อส่งในระบบ',
  'Navigate',
  30,
  NOW() + interval '7 days',
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

-- 4. E: Exhibit
INSERT INTO assignments (
  id, class_id, teacher_id, lesson_plan_id, title, description, activity_type, max_score, due_date, created_at, updated_at
)
VALUES (
  'a1111111-1111-4111-8111-010101010104',
  '22222222-2222-2222-2222-222222222201',
  '00000000-0000-0000-0000-000000000020',
  'lesson-plan-week-1',
  'สัปดาห์ที่ 1 [E]: แบบทดสอบ Quiz ประจำบทเรียน และ Exit Ticket 5 คำศัพท์',
  'ให้นักเรียนทำแบบทดสอบ Quiz ท้ายบทเรียน และเขียน Exit Ticket ระบุคำศัพท์อุปกรณ์ที่จำได้แม่นยำที่สุด 5 คำ พร้อมอธิบายหน้าที่สั้นๆ เป็นภาษาอังกฤษส่งครูผู้สอน',
  'Exhibit',
  30,
  NOW() + interval '7 days',
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

-- 5. Link sample submission back to Week 1 Assignment
INSERT INTO assignment_submissions (
  id, assignment_id, student_id, score, feedback, attachment_name, attachment_url, submitted_at, graded_at
)
VALUES (
  'b1111111-1111-4111-8111-010101010101',
  'a1111111-1111-4111-8111-010101010101',
  '00000000-0000-0000-0000-000000000003',
  NULL,
  NULL,
  'tableware_scan_record.jpg',
  '/uploads/samples/ai_scan_record.jpg',
  NOW() - interval '2 hours',
  NULL
)
ON CONFLICT (assignment_id, student_id) DO NOTHING;

COMMIT;
