-- Migration 015: Add lesson_plan_id to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS lesson_plan_id TEXT REFERENCES fine_lesson_plans(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_assignments_lesson_plan ON assignments(lesson_plan_id);
