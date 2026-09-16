-- Migration 017: PDPA Personal Data Protection Consent
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pdpa_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pdpa_consent_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pdpa_consent_version TEXT DEFAULT '1.0';
