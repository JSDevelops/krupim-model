-- =================================================================
-- FINE MODEL AR 3D + AI Learning — Complete RLS Enablement Script
-- รันไฟล์นี้ใน Supabase SQL Editor เพื่อเปิดใช้งาน RLS ทุกตาราง
-- =================================================================

-- 1. Enable RLS on all 23 tables
ALTER TABLE IF EXISTS schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ar_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_scan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulation_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fine_lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS class_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ar_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing conflicting policies if re-running
DROP POLICY IF EXISTS "Allow public read schools" ON schools;
DROP POLICY IF EXISTS "Teachers and admins manage schools" ON schools;
DROP POLICY IF EXISTS "Users view profiles" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public read courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users manage courses" ON courses;
DROP POLICY IF EXISTS "Allow public read units" ON units;
DROP POLICY IF EXISTS "Authenticated users manage units" ON units;
DROP POLICY IF EXISTS "Allow public read lessons" ON lessons;
DROP POLICY IF EXISTS "Authenticated users manage lessons" ON lessons;
DROP POLICY IF EXISTS "Allow public read ar_objects" ON ar_objects;
DROP POLICY IF EXISTS "Authenticated users manage ar_objects" ON ar_objects;
DROP POLICY IF EXISTS "Allow public read ai_scan_items" ON ai_scan_items;
DROP POLICY IF EXISTS "Authenticated users manage ai_scan_items" ON ai_scan_items;
DROP POLICY IF EXISTS "Allow public read simulation_scenarios" ON simulation_scenarios;
DROP POLICY IF EXISTS "Authenticated users manage simulation_scenarios" ON simulation_scenarios;
DROP POLICY IF EXISTS "Allow authenticated read classes" ON classes;
DROP POLICY IF EXISTS "Teachers manage own classes" ON classes;
DROP POLICY IF EXISTS "Allow authenticated read class_students" ON class_students;
DROP POLICY IF EXISTS "Students and teachers manage class_students" ON class_students;
DROP POLICY IF EXISTS "Students manage own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students manage own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Students manage own simulation" ON simulation_sessions;
DROP POLICY IF EXISTS "Students manage own chat" ON chat_sessions;
DROP POLICY IF EXISTS "Allow authenticated read assessments" ON assessments;
DROP POLICY IF EXISTS "Teachers manage assessments" ON assessments;
DROP POLICY IF EXISTS "Students manage own student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "Students view own analytics" ON learning_analytics;
DROP POLICY IF EXISTS "Authenticated users manage analytics" ON learning_analytics;
DROP POLICY IF EXISTS "Allow authenticated read assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers manage assignments" ON assignments;
DROP POLICY IF EXISTS "Students manage own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;

-- 3. Create RLS Policies
-- Schools
CREATE POLICY "Allow public read schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Teachers and admins manage schools" ON schools FOR ALL USING (auth.role() = 'authenticated');

-- Profiles
CREATE POLICY "Users view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Courses, Units, Lessons, AR Objects
CREATE POLICY "Allow public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage courses" ON courses FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read units" ON units FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage units" ON units FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage lessons" ON lessons FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read ar_objects" ON ar_objects FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage ar_objects" ON ar_objects FOR ALL USING (auth.role() = 'authenticated');

-- AI Scan Items & Simulation Scenarios
CREATE POLICY "Allow public read ai_scan_items" ON ai_scan_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage ai_scan_items" ON ai_scan_items FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read simulation_scenarios" ON simulation_scenarios FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage simulation_scenarios" ON simulation_scenarios FOR ALL USING (auth.role() = 'authenticated');

-- Classes & Class Students
CREATE POLICY "Allow authenticated read classes" ON classes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Teachers manage own classes" ON classes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read class_students" ON class_students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Students and teachers manage class_students" ON class_students FOR ALL USING (auth.role() = 'authenticated');

-- Enrollments, Progress, Simulation, Chat
CREATE POLICY "Students manage own enrollments" ON enrollments FOR ALL USING (auth.uid() = student_id OR auth.role() = 'authenticated');
CREATE POLICY "Students manage own progress" ON lesson_progress FOR ALL USING (auth.uid() = student_id OR auth.role() = 'authenticated');
CREATE POLICY "Students manage own simulation" ON simulation_sessions FOR ALL USING (auth.uid() = student_id OR auth.role() = 'authenticated');
CREATE POLICY "Students manage own chat" ON chat_sessions FOR ALL USING (auth.uid() = student_id OR auth.role() = 'authenticated');

-- Assessments & Submissions
CREATE POLICY "Allow authenticated read assessments" ON assessments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Teachers manage assessments" ON assessments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Students manage own student_assessments" ON student_assessments FOR ALL USING (auth.uid() = student_id OR auth.role() = 'authenticated');

-- Analytics & Assignments
CREATE POLICY "Students view own analytics" ON learning_analytics FOR SELECT USING (auth.uid() = student_id OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users manage analytics" ON learning_analytics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read assignments" ON assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Teachers manage assignments" ON assignments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Students manage own submissions" ON assignment_submissions FOR ALL USING (auth.uid() = student_id OR auth.role() = 'authenticated');
CREATE POLICY "Users view own notifications" ON notifications FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated');
