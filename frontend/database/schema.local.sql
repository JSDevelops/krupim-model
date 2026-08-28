-- Local PostgreSQL schema for FINE MODEL.
-- Safe to run repeatedly against the dedicated krupim_local database.

\encoding UTF8

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS schema_migrations (
  migration_name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('developer', 'teacher', 'student');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('video', 'ar3d', 'text', 'quiz', 'simulation');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE lesson_status AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE session_type AS ENUM ('gemini_chat', 'gemini_live', 'ai_scan', 'openai_chat', 'claude_chat', 'simulation');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  contact TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  session_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id),
  school_name TEXT,
  name TEXT NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  requested_role user_role NOT NULL DEFAULT 'student',
  approval_status TEXT NOT NULL DEFAULT 'active' CHECK (approval_status IN ('pending', 'active', 'inactive')),
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_provider_settings (
  provider TEXT PRIMARY KEY CHECK (provider IN ('gemini', 'openai', 'claude')),
  api_key_encrypted TEXT,
  model TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
  setting_key TEXT PRIMARY KEY,
  value_json JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integration_settings (
  provider TEXT PRIMARY KEY,
  api_key_encrypted TEXT,
  config_json JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO integration_settings (provider, config_json)
VALUES ('tripo', '{"modelVersion":"v2.5-20250123"}'::jsonb)
ON CONFLICT (provider) DO NOTHING;

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL
);

INSERT INTO system_settings (setting_key, value_json)
VALUES ('general', '{"schoolName":"วิทยาลัยอาชีวศึกษากรุงเทพ","maintenance":false}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_provider_single_active
  ON ai_provider_settings ((is_active))
  WHERE is_active = TRUE;

INSERT INTO ai_provider_settings (provider, model, is_active)
VALUES
  ('gemini', 'gemini-2.5-flash', TRUE),
  ('openai', 'gpt-4.1-mini', FALSE),
  ('claude', 'claude-sonnet-4-6', FALSE)
ON CONFLICT (provider) DO NOTHING;

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  teacher_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  year INTEGER,
  semester INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  thumbnail_url TEXT,
  created_by UUID REFERENCES profiles(id),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  ar_model_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type content_type NOT NULL,
  content_url TEXT,
  content_body TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_scan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id),
  title TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  max_score INTEGER NOT NULL DEFAULT 100,
  time_limit_minutes INTEGER NOT NULL DEFAULT 10,
  script_json JSONB,
  rubric_json JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  unit_id UUID REFERENCES units(id),
  title TEXT NOT NULL,
  description TEXT,
  rubric_json JSONB,
  max_score INTEGER NOT NULL DEFAULT 100,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status lesson_status NOT NULL DEFAULT 'not_started',
  score INTEGER NOT NULL DEFAULT 0,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS simulation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES simulation_scenarios(id),
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 100,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  feedback_json JSONB,
  conversation_json JSONB,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type session_type NOT NULL,
  topic TEXT,
  messages_json JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS student_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  knowledge_score INTEGER NOT NULL DEFAULT 0,
  skills_score INTEGER NOT NULL DEFAULT 0,
  attitude_score INTEGER NOT NULL DEFAULT 0,
  competency_score INTEGER NOT NULL DEFAULT 0,
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  graded_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  knowledge_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  skills_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  attitude_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  competency_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  overall_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  UNIQUE(student_id, course_id, date)
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code TEXT NOT NULL UNIQUE DEFAULT ('FINE-' || UPPER(encode(gen_random_bytes(8), 'hex'))),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL DEFAULT 'fine-fb-service',
  issued_name TEXT NOT NULL,
  school_name TEXT,
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  score_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(student_id, certificate_type)
);

CREATE TABLE IF NOT EXISTS certificate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('issue','reissue','revoke','restore')),
  details_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL DEFAULT 'Familiarize',
  lesson_id UUID REFERENCES lessons(id),
  scenario_id UUID REFERENCES simulation_scenarios(id),
  due_date TIMESTAMPTZ,
  max_score INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE assignments ADD COLUMN IF NOT EXISTS activity_type TEXT NOT NULL DEFAULT 'Familiarize';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER,
  feedback TEXT,
  attachment_name TEXT,
  attachment_url TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS stored_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  original_name TEXT NOT NULL,
  storage_name TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 12582912),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS attachment_url TEXT;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  objectives_k JSONB NOT NULL DEFAULT '[]',
  objectives_s JSONB NOT NULL DEFAULT '[]',
  objectives_a JSONB NOT NULL DEFAULT '[]',
  objectives_ap JSONB NOT NULL DEFAULT '[]',
  vocabulary JSONB NOT NULL DEFAULT '[]',
  sentences JSONB NOT NULL DEFAULT '[]',
  activities_lead TEXT,
  activities_f TEXT,
  activities_i TEXT,
  activities_n TEXT,
  activities_e TEXT,
  activities_wrap TEXT,
  teacher_name TEXT,
  teacher_email CITEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fine_lesson_plans ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE fine_lesson_plans ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL;
ALTER TABLE fine_lesson_plans ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='fine_lesson_plans' AND column_name='publication_status'
  ) THEN
    ALTER TABLE fine_lesson_plans ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'published';
    UPDATE fine_lesson_plans SET published_at=COALESCE(published_at, updated_at);
    ALTER TABLE fine_lesson_plans ALTER COLUMN publication_status SET DEFAULT 'draft';
  END IF;
END $$;
DO $$ BEGIN
  ALTER TABLE fine_lesson_plans
    ADD CONSTRAINT fine_lesson_plans_publication_status_check
    CHECK (publication_status IN ('draft', 'published'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE simulation_sessions ADD COLUMN IF NOT EXISTS lesson_plan_id TEXT REFERENCES fine_lesson_plans(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  score INTEGER,
  metadata_json JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id,event_type,reference_type,reference_id)
);

CREATE TABLE IF NOT EXISTS class_invites (
  short_code TEXT PRIMARY KEY,
  target_class TEXT NOT NULL,
  teacher_name TEXT,
  school_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE class_invites ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE CASCADE;
ALTER TABLE class_invites ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE class_invites ADD COLUMN IF NOT EXISTS max_uses INTEGER NOT NULL DEFAULT 1;
ALTER TABLE class_invites ADD COLUMN IF NOT EXISTS use_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE class_invites ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

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
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generated_model_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'model/gltf-binary',
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  file_data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'tripo',
  external_task_id TEXT UNIQUE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ar_item_id TEXT REFERENCES ar_items(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES generated_model_assets(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model_version TEXT,
  name_en TEXT NOT NULL,
  name_th TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','success','failed','cancelled','banned','expired','unknown','preview')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  glb_url TEXT,
  preview_url TEXT,
  error_message TEXT,
  raw_response JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS vocabulary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tableware',
  category_th TEXT NOT NULL DEFAULT 'อุปกรณ์บนโต๊ะอาหาร',
  emoji TEXT NOT NULL DEFAULT '🍽️',
  pronounce TEXT,
  use_desc TEXT NOT NULL,
  sentence TEXT NOT NULL,
  glb_url TEXT,
  usdz_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vocabulary_items ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('AR Object', 'AI Scan', 'Simulation', 'Lesson')),
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  unit_label TEXT NOT NULL DEFAULT 'Unit 1',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(content_type, name_en)
);

CREATE TABLE IF NOT EXISTS system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'general' CHECK (priority IN ('urgent', 'general', 'event')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  link_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, approval_status);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_active ON classes(teacher_id, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON class_students(student_id, enrolled_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_student_date ON learning_analytics(student_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificate_events_certificate_created ON certificate_events(certificate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_assessments_student_submitted ON student_assessments(student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_updated ON lesson_progress(student_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_due ON assignments(teacher_id, due_date DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_class_due ON assignments(class_id, due_date DESC);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_stored_files_owner ON stored_files(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_student ON chat_sessions(student_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_student ON simulation_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_student_completed ON simulation_sessions(student_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_vocab_name_en ON vocabulary_items(name_en);
CREATE INDEX IF NOT EXISTS idx_vocab_category ON vocabulary_items(category);
CREATE INDEX IF NOT EXISTS idx_vocab_updated ON vocabulary_items(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_vocab_creator_updated ON vocabulary_items(created_by, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ar_items_creator_updated ON ar_items(created_by, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_generation_jobs_creator_updated ON model_generation_jobs(created_by, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_generation_jobs_status_updated ON model_generation_jobs(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_fine_lesson_plans_class_published
  ON fine_lesson_plans(class_id, publication_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_class_invites_class_active
  ON class_invites(class_id, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learning_events_student_occurred
  ON learning_events(student_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created
  ON audit_logs(created_at DESC, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created
  ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_created
  ON audit_logs(entity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_expires ON api_rate_limits(expires_at);
CREATE INDEX IF NOT EXISTS idx_content_library_type_status ON content_library(content_type, status);
CREATE INDEX IF NOT EXISTS idx_system_announcements_published ON system_announcements(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_date ON learning_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_updated_at ON lesson_progress(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_completed_at ON simulation_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_assessments_submitted_at ON student_assessments(submitted_at DESC);

INSERT INTO content_library (id, content_type, name_th, name_en, unit_label, status)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'AR Object', 'เครื่องชงกาแฟ Espresso', 'Espresso Machine', 'Unit 1', 'published'),
  ('20000000-0000-0000-0000-000000000002', 'AR Object', 'แก้วไวน์แดงทรง Bordeaux', 'Red Wine Glass', 'Unit 1', 'published'),
  ('20000000-0000-0000-0000-000000000003', 'AI Scan', 'จานอาหารหลัก', 'Main Course Plate', 'Unit 2', 'published'),
  ('20000000-0000-0000-0000-000000000004', 'Simulation', 'รับลูกค้าเข้าร้านอาหาร', 'Guest Arrival Scenario', 'Unit 3', 'published'),
  ('20000000-0000-0000-0000-000000000005', 'Lesson', 'มาตรฐานการจัดโต๊ะแบบยุโรป', 'European Table Setting Standard', 'Unit 2', 'draft')
ON CONFLICT (content_type, name_en) DO NOTHING;

INSERT INTO system_announcements (id, title, content, priority, tags, published_at)
VALUES (
  '30000000-0000-0000-0000-000000000001',
  'ขอความร่วมมือครูผู้สอนเร่งการประเมิน Rubric',
  'ขอแจ้งความร่วมมือให้ครูผู้สอนดำเนินการประเมินผลคะแนน Rubric ด้านคุณลักษณะของนักศึกษาให้เสร็จสิ้นภายในสัปดาห์นี้ เพื่อเตรียมออกใบรับรองสมรรถนะ FINE Model',
  'urgent',
  ARRAY['การประเมิน', 'คุณลักษณะ'],
  '2026-06-28T08:30:00+07:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, address)
VALUES ('11111111-1111-1111-1111-111111111111', 'วิทยาลัยอาชีวศึกษา ตัวอย่าง', 'กรุงเทพมหานคร')
ON CONFLICT (id) DO NOTHING;
