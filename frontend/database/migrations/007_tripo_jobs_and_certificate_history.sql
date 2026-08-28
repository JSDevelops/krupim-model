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

CREATE TABLE IF NOT EXISTS certificate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('issue','reissue','revoke','restore')),
  details_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO certificate_events(certificate_id,event_type,details_json,created_at)
SELECT id,'issue',jsonb_build_object('migrated',true,'certificateCode',certificate_code),issued_at
FROM certificates c
WHERE NOT EXISTS (SELECT 1 FROM certificate_events e WHERE e.certificate_id=c.id);

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

CREATE INDEX IF NOT EXISTS idx_certificate_events_certificate_created ON certificate_events(certificate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_generation_jobs_creator_updated ON model_generation_jobs(created_by, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_generation_jobs_status_updated ON model_generation_jobs(status, updated_at DESC);
