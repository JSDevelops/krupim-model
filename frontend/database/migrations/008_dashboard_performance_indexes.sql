CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_courses_published
  ON courses(is_published);

CREATE INDEX IF NOT EXISTS idx_learning_analytics_date
  ON learning_analytics(date DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_status
  ON lesson_progress(status);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_updated_at
  ON lesson_progress(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at
  ON chat_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_simulation_sessions_completed_at
  ON simulation_sessions(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_assessments_submitted_at
  ON student_assessments(submitted_at DESC);
