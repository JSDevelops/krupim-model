-- ============================================================
-- FINE MODEL — Security & Performance Migration
-- วันที่: 2026-08-11
-- ============================================================
-- ⚠️  รันใน Supabase SQL Editor
--     Project: https://supabase.com/dashboard/project/zzkgzbdvyeansjxsylgw
-- ⚠️  แนะนำรันทีละ SECTION และ verify ก่อน
-- ============================================================

-- ============================================================
-- SECTION 0: HELPER FUNCTION (รันก่อนสุด)
-- ดึง role ของ user ปัจจุบันจาก profiles table
-- (Cached per-transaction โดย Supabase → ไม่ช้า)
-- ============================================================
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT
  FROM profiles
  WHERE id = auth.uid()
$$;

-- ============================================================
-- SECTION 1: 🔴 ROLE-BASED RLS POLICIES
-- แก้ปัญหานักเรียนสามารถแก้ไข courses/lessons ได้
-- ============================================================

-- === SCHOOLS ===
DROP POLICY IF EXISTS "Teachers and admins manage schools" ON schools;
CREATE POLICY "Developers manage schools" ON schools
  FOR ALL
  USING (auth_user_role() = 'developer')
  WITH CHECK (auth_user_role() = 'developer');

-- === COURSES ===
DROP POLICY IF EXISTS "Authenticated users manage courses" ON courses;

CREATE POLICY "Teachers insert courses" ON courses
  FOR INSERT
  WITH CHECK (auth_user_role() IN ('teacher', 'developer'));

CREATE POLICY "Teachers update own courses" ON courses
  FOR UPDATE
  USING (created_by = auth.uid() OR auth_user_role() = 'developer');

CREATE POLICY "Teachers delete own courses" ON courses
  FOR DELETE
  USING (created_by = auth.uid() OR auth_user_role() = 'developer');

-- === UNITS ===
DROP POLICY IF EXISTS "Authenticated users manage units" ON units;
CREATE POLICY "Teachers manage units" ON units
  FOR ALL
  USING (auth_user_role() IN ('teacher', 'developer'))
  WITH CHECK (auth_user_role() IN ('teacher', 'developer'));

-- === LESSONS ===
DROP POLICY IF EXISTS "Authenticated users manage lessons" ON lessons;
CREATE POLICY "Teachers manage lessons" ON lessons
  FOR ALL
  USING (auth_user_role() IN ('teacher', 'developer'))
  WITH CHECK (auth_user_role() IN ('teacher', 'developer'));

-- === AR OBJECTS ===
DROP POLICY IF EXISTS "Authenticated users manage ar_objects" ON ar_objects;
CREATE POLICY "Teachers manage ar_objects" ON ar_objects
  FOR ALL
  USING (auth_user_role() IN ('teacher', 'developer'))
  WITH CHECK (auth_user_role() IN ('teacher', 'developer'));

-- === AR ITEMS ===
DROP POLICY IF EXISTS "Authenticated users manage ar_items" ON ar_items;
CREATE POLICY "Teachers manage ar_items" ON ar_items
  FOR ALL
  USING (created_by = auth.uid() OR auth_user_role() = 'developer')
  WITH CHECK (created_by = auth.uid() OR auth_user_role() = 'developer');

-- === AI SCAN ITEMS ===
DROP POLICY IF EXISTS "Authenticated users manage ai_scan_items" ON ai_scan_items;
CREATE POLICY "Teachers manage ai_scan_items" ON ai_scan_items
  FOR ALL
  USING (auth_user_role() IN ('teacher', 'developer'))
  WITH CHECK (auth_user_role() IN ('teacher', 'developer'));

-- === SIMULATION SCENARIOS ===
DROP POLICY IF EXISTS "Authenticated users manage simulation_scenarios" ON simulation_scenarios;
CREATE POLICY "Teachers manage simulation_scenarios" ON simulation_scenarios
  FOR ALL
  USING (auth_user_role() IN ('teacher', 'developer'))
  WITH CHECK (auth_user_role() IN ('teacher', 'developer'));

-- === CLASSES ===
DROP POLICY IF EXISTS "Teachers manage own classes" ON classes;
CREATE POLICY "Teachers manage own classes" ON classes
  FOR ALL
  USING (teacher_id = auth.uid() OR auth_user_role() = 'developer')
  WITH CHECK (teacher_id = auth.uid() OR auth_user_role() = 'developer');

-- === ASSESSMENTS ===
DROP POLICY IF EXISTS "Teachers manage assessments" ON assessments;
CREATE POLICY "Teachers manage assessments" ON assessments
  FOR ALL
  USING (auth_user_role() IN ('teacher', 'developer'))
  WITH CHECK (auth_user_role() IN ('teacher', 'developer'));

-- === ASSIGNMENTS ===
DROP POLICY IF EXISTS "Teachers manage assignments" ON assignments;
CREATE POLICY "Teachers manage assignments" ON assignments
  FOR ALL
  USING (auth_user_role() IN ('teacher', 'developer'))
  WITH CHECK (auth_user_role() IN ('teacher', 'developer'));

-- === LEARNING ANALYTICS ===
DROP POLICY IF EXISTS "Authenticated users manage analytics" ON learning_analytics;
CREATE POLICY "Teachers and triggers manage analytics" ON learning_analytics
  FOR ALL
  USING (auth_user_role() IN ('teacher', 'developer'))
  WITH CHECK (auth_user_role() IN ('teacher', 'developer'));

-- === NOTIFICATIONS ===
-- นักเรียนเห็นเฉพาะของตัวเอง
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers create notifications" ON notifications
  FOR INSERT
  WITH CHECK (auth_user_role() IN ('teacher', 'developer'));

-- ============================================================
-- SECTION 2: 🟡 PERFORMANCE INDEXES
-- เพิ่ม index บน foreign keys ที่ใช้บ่อย
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_id     ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id      ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_student_id       ON chat_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at       ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_student_id ON simulation_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id         ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id           ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class_id        ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id      ON class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_student_id  ON learning_analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id          ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread           ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);

-- ============================================================
-- SECTION 3: 🟢 ENUM UPDATES
-- เพิ่ม session types สำหรับ OpenAI / Claude
-- ============================================================
ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'openai_chat';
ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'claude_chat';
ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'simulation';

-- ============================================================
-- SECTION 4: 🟢 DIFFICULTY LEVEL ENUM
-- เพิ่ม constraint แทน free-text
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
  END IF;
END $$;

ALTER TABLE simulation_scenarios
  ALTER COLUMN difficulty TYPE difficulty_level
  USING difficulty::difficulty_level;

-- ============================================================
-- SECTION 5: 🟡 LEARNING ANALYTICS AUTO-UPDATE TRIGGER
-- อัพเดท learning_analytics อัตโนมัติเมื่อ lesson_progress เปลี่ยน
-- ใช้ column จริงจาก schema: lessons_completed, overall_score
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_learning_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id  UUID;
  v_completed   INTEGER;
  v_score_avg   NUMERIC;
BEGIN
  v_student_id := NEW.student_id;

  -- นับบทเรียนที่ completed แล้ว
  SELECT COUNT(*)
  INTO v_completed
  FROM lesson_progress
  WHERE student_id = v_student_id
    AND status = 'completed';

  -- ดึง average score จาก student_assessments
  SELECT COALESCE(AVG(score), 0)
  INTO v_score_avg
  FROM student_assessments
  WHERE student_id = v_student_id;

  -- Upsert ลง learning_analytics (unique: student_id + course_id + date)
  -- ใช้ NULL course_id สำหรับ global daily snapshot
  INSERT INTO learning_analytics (
    student_id,
    course_id,
    date,
    lessons_completed,
    overall_score
  )
  VALUES (
    v_student_id,
    NULL,
    CURRENT_DATE,
    v_completed,
    v_score_avg
  )
  ON CONFLICT (student_id, course_id, date)
  DO UPDATE SET
    lessons_completed = EXCLUDED.lessons_completed,
    overall_score     = EXCLUDED.overall_score;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_analytics ON lesson_progress;
CREATE TRIGGER trg_update_analytics
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_learning_analytics();

-- ============================================================
-- SECTION 6: 🟢 TABLE COMMENTS (AR_ITEMS vs AR_OBJECTS)
-- Define purpose ชัดเจน ไม่ต้อง merge
-- ============================================================
COMMENT ON TABLE ar_objects IS
  'AR 3D objects ที่ link กับ courses/units — เนื้อหาหลักของระบบ';

COMMENT ON TABLE ar_items IS
  'คลัง AR items ส่วนตัวของครู — สร้างจาก AI 3D Generator (standalone, teacher-managed)';

-- ============================================================
-- VERIFICATION (รัน manually หลัง migration)
-- ============================================================
-- ตรวจ policies ใหม่:
-- SELECT tablename, policyname, cmd
-- FROM pg_policies WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- ตรวจ indexes:
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
-- ORDER BY tablename;
--
-- ตรวจ session_type ENUM:
-- SELECT enumlabel FROM pg_enum
-- WHERE enumtypid = 'session_type'::regtype
-- ORDER BY enumsortorder;
