BEGIN;

-- 1. เพิ่ม session_version ให้ app_users (กรณีฐานข้อมูลบนโฮสจริงยังไม่มี)
ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;

-- 2. อัปเดตโครงสร้าง vocabulary_items ให้ตรงกับระบบล่าสุด
ALTER TABLE vocabulary_items
  DROP COLUMN IF EXISTS emoji;

ALTER TABLE vocabulary_items
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE vocabulary_items
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

COMMIT;
