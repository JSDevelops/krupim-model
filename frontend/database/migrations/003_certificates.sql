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

CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id, issued_at DESC);
