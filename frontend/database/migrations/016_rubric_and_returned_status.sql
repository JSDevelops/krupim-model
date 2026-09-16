-- Migration 016: Rubric Assessment Levels and Return for Revision status
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','returned','resubmitted'));
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS return_reason TEXT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ;

ALTER TABLE student_assessments ADD COLUMN IF NOT EXISTS rubric_level_k SMALLINT CHECK (rubric_level_k BETWEEN 1 AND 4);
ALTER TABLE student_assessments ADD COLUMN IF NOT EXISTS rubric_level_s SMALLINT CHECK (rubric_level_s BETWEEN 1 AND 4);
ALTER TABLE student_assessments ADD COLUMN IF NOT EXISTS rubric_level_a SMALLINT CHECK (rubric_level_a BETWEEN 1 AND 4);
ALTER TABLE student_assessments ADD COLUMN IF NOT EXISTS rubric_level_c SMALLINT CHECK (rubric_level_c BETWEEN 1 AND 4);
