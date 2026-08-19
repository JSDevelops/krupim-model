-- ============================================================
-- FINE MODEL AR 3D + AI Learning — Railway PostgreSQL Schema
-- สคริปต์ฐานข้อมูลที่ปรับแต่งสำหรับ Standard PostgreSQL บน Railway
-- ============================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('developer', 'teacher', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('video', 'ar3d', 'text', 'quiz', 'simulation');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lesson_status AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE session_type AS ENUM ('gemini_chat', 'gemini_live', 'ai_scan', 'openai_chat', 'claude_chat', 'simulation');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. USERS, SCHOOLS & PROFILES
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  contact TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  password_hash TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLASSES
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  year INTEGER,
  semester INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE TABLE IF NOT EXISTS class_invites (
  short_code TEXT PRIMARY KEY,
  target_class TEXT NOT NULL,
  teacher_name TEXT,
  school_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 5. COURSES, UNITS & LESSONS
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  thumbnail_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
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

CREATE TABLE IF NOT EXISTS lessons (
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

-- 6. AR ITEMS & AI SCAN KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS ar_items (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  pronounce TEXT,
  sentence TEXT,
  description TEXT,
  image_url TEXT,
  glb_url TEXT,
  usdz_url TEXT,
  blender_script TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_scan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  location TEXT,
  service_tips TEXT,
  english_phrases TEXT[],
  image_url TEXT,
  glb_url TEXT,
  usdz_url TEXT,
  pronounce TEXT,
  blender_script TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SIMULATION & CHAT SESSIONS
CREATE TABLE IF NOT EXISTS simulation_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  max_score INTEGER DEFAULT 100,
  time_limit_minutes INTEGER DEFAULT 10,
  script_json JSONB,
  rubric_json JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES simulation_scenarios(id) ON DELETE SET NULL,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  duration_minutes INTEGER DEFAULT 0,
  feedback_json JSONB,
  conversation_json JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type session_type NOT NULL,
  topic TEXT,
  messages_json JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- 8. ASSESSMENTS, PROGRESS & ANALYTICS
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  rubric_json JSONB,
  max_score INTEGER DEFAULT 100,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_assessments (
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
  graded_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
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

CREATE TABLE IF NOT EXISTS learning_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
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

-- 9. ASSIGNMENTS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  scenario_id UUID REFERENCES simulation_scenarios(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FINE LESSON PLANS (Teacher 12-Step Wizard)
CREATE TABLE IF NOT EXISTS fine_lesson_plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT,
  level TEXT,
  term TEXT,
  duration TEXT,
  target_class TEXT,
  weeks TEXT,
  concept TEXT,
  objectives_k JSONB DEFAULT '[]',
  objectives_s JSONB DEFAULT '[]',
  objectives_a JSONB DEFAULT '[]',
  objectives_ap JSONB DEFAULT '[]',
  vocabulary JSONB DEFAULT '[]',
  sentences JSONB DEFAULT '[]',
  activities_lead TEXT,
  activities_f TEXT,
  activities_i TEXT,
  activities_n TEXT,
  activities_e TEXT,
  activities_wrap TEXT,
  teacher_name TEXT,
  teacher_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_student ON chat_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_student ON simulation_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_ar_items_name_en ON ar_items(name_en);
CREATE INDEX IF NOT EXISTS idx_ai_scan_items_cat ON ai_scan_items(category);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ── 15. VOCABULARY ITEMS (คลังคำศัพท์มาตรฐาน 10 หมวดหมู่) ────────────────────
CREATE TABLE IF NOT EXISTS vocabulary_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en     TEXT NOT NULL UNIQUE,
  name_th     TEXT NOT NULL,
  category    TEXT DEFAULT 'tableware',
  category_th TEXT DEFAULT 'อุปกรณ์บนโต๊ะอาหาร',
  emoji       TEXT DEFAULT '🍴',
  pronounce   TEXT,
  use_desc    TEXT NOT NULL,
  sentence    TEXT NOT NULL,
  glb_url     TEXT,
  usdz_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocab_name_en ON vocabulary_items(name_en);
CREATE INDEX IF NOT EXISTS idx_vocab_category ON vocabulary_items(category);

