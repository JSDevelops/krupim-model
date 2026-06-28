-- ============================================
-- FINE MODE AR+AI 3D Learning — Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('developer', 'teacher', 'student');
CREATE TYPE content_type AS ENUM ('video', 'ar3d', 'text', 'quiz', 'simulation');
CREATE TYPE lesson_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE session_type AS ENUM ('gemini_chat', 'gemini_live', 'ai_scan');

-- ============================================
-- USERS & SCHOOLS
-- ============================================
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  contact TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id),
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLASSES
-- ============================================
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id),
  teacher_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  year INTEGER,
  semester INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- ============================================
-- COURSES & CONTENT
-- ============================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  thumbnail_url TEXT,
  created_by UUID REFERENCES profiles(id),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  ar_model_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type content_type NOT NULL,
  content_url TEXT,
  content_body TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AR 3D OBJECTS
-- ============================================
CREATE TABLE ar_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES units(id),
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  model_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI SCAN ITEMS (Knowledge Base)
-- ============================================
CREATE TABLE ai_scan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'food', 'equipment', 'tableware', 'beverage'
  subcategory TEXT,
  description TEXT,
  location TEXT,
  service_tips TEXT,
  english_phrases TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SIMULATION SCENARIOS
-- ============================================
CREATE TABLE simulation_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES units(id),
  title TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL, -- 'role_play', 'customer_service', 'emergency'
  difficulty TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  max_score INTEGER DEFAULT 100,
  time_limit_minutes INTEGER DEFAULT 10,
  script_json JSONB, -- dialog scripts
  rubric_json JSONB, -- scoring rubric
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ASSESSMENTS
-- ============================================
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id),
  unit_id UUID REFERENCES units(id),
  title TEXT NOT NULL,
  description TEXT,
  rubric_json JSONB,
  max_score INTEGER DEFAULT 100,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENROLLMENTS & PROGRESS
-- ============================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status lesson_status DEFAULT 'not_started',
  score INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- ============================================
-- SIMULATION SESSIONS
-- ============================================
CREATE TABLE simulation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES simulation_scenarios(id),
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  duration_minutes INTEGER DEFAULT 0,
  feedback_json JSONB,
  conversation_json JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI CHAT SESSIONS
-- ============================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type session_type NOT NULL,
  topic TEXT,
  messages_json JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- ============================================
-- STUDENT ASSESSMENTS
-- ============================================
CREATE TABLE student_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  knowledge_score INTEGER DEFAULT 0,
  skills_score INTEGER DEFAULT 0,
  attitude_score INTEGER DEFAULT 0,
  competency_score INTEGER DEFAULT 0,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_by UUID REFERENCES profiles(id)
);

-- ============================================
-- KSA-C ANALYTICS (daily snapshot)
-- ============================================
CREATE TABLE learning_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  date DATE DEFAULT CURRENT_DATE,
  knowledge_score DECIMAL(5,2) DEFAULT 0,
  skills_score DECIMAL(5,2) DEFAULT 0,
  attitude_score DECIMAL(5,2) DEFAULT 0,
  competency_score DECIMAL(5,2) DEFAULT 0,
  overall_score DECIMAL(5,2) DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(student_id, course_id, date)
);

-- ============================================
-- ASSIGNMENTS (Teacher → Students)
-- ============================================
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  lesson_id UUID REFERENCES lessons(id),
  scenario_id UUID REFERENCES simulation_scenarios(id),
  due_date TIMESTAMPTZ,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, student_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'assignment'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Lesson progress: students can manage own progress
CREATE POLICY "Students manage own progress" ON lesson_progress FOR ALL USING (auth.uid() = student_id);

-- Chat sessions: students can manage own sessions
CREATE POLICY "Students manage own chat" ON chat_sessions FOR ALL USING (auth.uid() = student_id);

-- Analytics: students can view own analytics
CREATE POLICY "Students view own analytics" ON learning_analytics FOR SELECT USING (auth.uid() = student_id);

-- Notifications: users can view own notifications
CREATE POLICY "Users view own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Sample School
INSERT INTO schools (id, name, address) VALUES
  ('11111111-1111-1111-1111-111111111111', 'วิทยาลัยอาชีวศึกษา ตัวอย่าง', 'กรุงเทพมหานคร');

-- Sample Course: Food & Beverage Service
INSERT INTO courses (id, title, title_en, description, is_published) VALUES
  ('22222222-2222-2222-2222-222222222222', 
   'การบริการอาหารและเครื่องดื่ม', 
   'Food and Beverage Service',
   'เรียนรู้มาตรฐานการบริการอาหารและเครื่องดื่มอย่างมืออาชีพ ผ่าน AR + AI',
   TRUE);

-- Sample Units
INSERT INTO units (id, course_id, title, title_en, order_index, thumbnail_url) VALUES
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 'อุปกรณ์ร้านอาหาร', 'Restaurant Equipment', 1, '/images/unit1.jpg'),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 'การจัดโต๊ะ', 'Table Setting', 2, '/images/unit2.jpg'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'การรับออร์เดอร์', 'Taking Food Orders', 3, '/images/unit3.jpg'),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 'การจัดการข้อร้องเรียน', 'Handling Complaints', 4, '/images/unit4.jpg'),
  ('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222222', 'การกู้คืนบริการ', 'Service Recovery', 5, '/images/unit5.jpg');

-- Sample AI Scan Items
INSERT INTO ai_scan_items (name_th, name_en, category, subcategory, description, service_tips) VALUES
  ('แซลมอนย่าง', 'Grilled Salmon', 'food', 'Main Course', 'ปลาแซลมอนย่างสไตล์ยุโรป', 'เสิร์ฟพร้อมซอสมะนาวและผักสด'),
  ('สเต็กเนื้อ', 'Beef Steak', 'food', 'Main Course', 'เนื้อวัวย่างระดับพรีเมี่ยม', 'ถามระดับความสุกก่อนทุกครั้ง'),
  ('เครื่องชงกาแฟ', 'Coffee Machine', 'equipment', 'Bar Equipment', 'เครื่องชงกาแฟ Espresso', 'ทำความสะอาดหัวชงทุกวัน'),
  ('แก้วไวน์', 'Wine Glass', 'tableware', 'Glassware', 'แก้วไวน์แดงทรง Bordeaux', 'จับที่ก้านแก้วเสมอ ไม่จับที่ถ้วย'),
  ('ช้อนส้อม', 'Cutlery Set', 'tableware', 'Flatware', 'ชุดช้อนส้อมสแตนเลส', 'วางให้ตรงตามมาตรฐาน place setting'),
  ('น้ำส้ม', 'Orange Juice', 'beverage', 'Juice', 'น้ำส้มคั้นสด', 'เสิร์ฟใส่แก้วที่แช่เย็น');

-- Sample Simulation Scenario
INSERT INTO simulation_scenarios (id, unit_id, title, description, scenario_type, difficulty, max_score, time_limit_minutes, rubric_json) VALUES
  ('44444444-4444-4444-4444-444444444441',
   '33333333-3333-3333-3333-333333333333',
   'รับออร์เดอร์อาหาร (Role Play)',
   'ฝึกรับออร์เดอร์อาหารจากลูกค้าในสถานการณ์จำลอง',
   'role_play',
   'beginner',
   100,
   10,
   '{"criteria": [
     {"name": "การทักทาย", "max_score": 20, "description": "ทักทายลูกค้าอย่างสุภาพและเป็นมิตร"},
     {"name": "การแนะนำเมนู", "max_score": 20, "description": "แนะนำเมนูได้ถูกต้องและน่าสนใจ"},
     {"name": "การรับออร์เดอร์", "max_score": 30, "description": "รับออร์เดอร์ครบถ้วน ถูกต้อง ทวนซ้ำ"},
     {"name": "ภาษาอังกฤษ", "max_score": 20, "description": "ใช้ภาษาอังกฤษได้ถูกต้องและคล่อง"},
     {"name": "มารยาท", "max_score": 10, "description": "มีมารยาทและบุคลิกภาพที่ดี"}
   ]}');
