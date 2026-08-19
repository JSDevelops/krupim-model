-- ============================================================
-- FINE MODEL AR 3D + AI Learning — Database Cleanup Migration
-- สคริปต์ทำความสะอาดฐานข้อมูล: ลบตารางและนโยบายที่ไม่ใช้งาน
-- ============================================================
-- ⚠️ รันสคริปต์นี้ใน Supabase SQL Editor
-- ============================================================

-- 1. ลบ Policy เก่าของตาราง ar_objects (ถ้ามี)
DROP POLICY IF EXISTS "Allow public read ar_objects" ON ar_objects;
DROP POLICY IF EXISTS "Teachers manage ar_objects" ON ar_objects;
DROP POLICY IF EXISTS "Authenticated users manage ar_objects" ON ar_objects;

-- 2. ลบตาราง ar_objects (เนื่องจากระบบใช้งาน ar_items และ ai_scan_items แทน)
DROP TABLE IF EXISTS ar_objects CASCADE;

-- 3. ตรวจสอบและสร้าง Index ประสิทธิภาพสำหรับ ar_items และ ai_scan_items
CREATE INDEX IF NOT EXISTS idx_ar_items_name_en ON ar_items(name_en);
CREATE INDEX IF NOT EXISTS idx_ai_scan_items_category ON ai_scan_items(category);

-- 4. ยืนยันสถานะความสมบูรณ์
DO $$
BEGIN
  RAISE NOTICE 'Database cleanup completed successfully! Unused table ar_objects removed.';
END $$;
