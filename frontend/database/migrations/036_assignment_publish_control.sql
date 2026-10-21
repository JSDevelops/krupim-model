-- Migration 036: Add publication control and available_from scheduling to assignments
-- is_published: teacher can show/hide lesson from students at any time
-- available_from: optional scheduled start date; students cannot see before this date
BEGIN;

ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS available_from TIMESTAMPTZ DEFAULT NULL;

-- Backfill: existing assignments are published immediately (no restriction)
UPDATE assignments SET is_published = TRUE WHERE is_published IS NULL;

-- Index for fast student-side filtering
CREATE INDEX IF NOT EXISTS idx_assignments_published_available
  ON assignments (is_published, available_from);

COMMIT;
