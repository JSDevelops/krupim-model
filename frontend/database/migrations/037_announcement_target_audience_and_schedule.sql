-- Migration 037: Announcement target audience, push notifications, and scheduling
ALTER TABLE system_announcements 
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(20) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS is_push_notification BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS class_id UUID;

CREATE INDEX IF NOT EXISTS idx_system_announcements_audience ON system_announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_system_announcements_dates ON system_announcements(starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_system_announcements_class ON system_announcements(class_id);

