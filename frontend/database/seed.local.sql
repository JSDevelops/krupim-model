\set ON_ERROR_STOP on

-- Local development bootstrap only. Never apply this file to a production database.
-- email: admin@local.test / password: Admin123!
INSERT INTO app_users (id, email, password_hash)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@local.test',
  crypt('Admin123!', gen_salt('bf', 12))
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (
  id, name, email, role, requested_role, approval_status, school_id, school_name
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Local Developer',
  'admin@local.test',
  'developer',
  'developer',
  'active',
  '11111111-1111-1111-1111-111111111111',
  'วิทยาลัยอาชีวศึกษา ตัวอย่าง'
)
ON CONFLICT (id) DO NOTHING;
