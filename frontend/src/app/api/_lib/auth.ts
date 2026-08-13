import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// สร้าง Supabase admin client (Service Role — bypass RLS)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !serviceKey) {
    throw new Error('[Auth] Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL env vars')
  }
  return createClient(url, serviceKey)
}

export type AuthUser = { id: string }

/**
 * ตรวจสอบ Supabase JWT จาก Authorization header
 * คืนค่า { user } หากถูกต้อง หรือ throw Error หากไม่ผ่าน
 */
export async function requireAuth(req: NextRequest): Promise<AuthUser> {
  const authHeader = req.headers.get('authorization') || ''
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid Authorization header')
  }
  const token = authHeader.slice(7)
  const supabase = getSupabaseAdmin()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    throw new Error('Unauthorized: Invalid or expired session token')
  }
  return { id: user.id }
}

/** คืนค่า Supabase admin client (ใช้ใน API routes เพื่อ write ข้อมูล) */
export function getSupabase() {
  return getSupabaseAdmin()
}
