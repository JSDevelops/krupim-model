import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// สร้าง Supabase client (ใช้ Service Role ถ้ามี หากไม่มีใช้ Anon Key เพื่อรองรับ dev/prod ที่ไม่มี service key)
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  if (!url || !key) {
    throw new Error('[Auth] Missing Supabase URL or Key in environment variables')
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

export type AuthUser = { id: string }

/**
 * ตรวจสอบ Supabase JWT จาก Authorization header
 * คืนค่า { user } หากถูกต้อง หรือ null หากไม่มี/ไม่ผ่าน (กรณี strict=false)
 */
export async function requireAuth(req: NextRequest, strict: boolean = false): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization') || ''
  if (!authHeader.startsWith('Bearer ')) {
    if (strict) throw new Error('Unauthorized: Missing or invalid Authorization header')
    return null
  }
  const token = authHeader.slice(7).trim()
  if (!token) {
    if (strict) throw new Error('Unauthorized: Token is empty')
    return null
  }

  try {
    const supabase = getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      if (strict) throw new Error('Unauthorized: Invalid or expired session token')
      return null
    }
    return { id: user.id }
  } catch (err: any) {
    if (strict) throw err
    return null
  }
}

/** คืนค่า Supabase client (ใช้ใน API routes เพื่อ write/query ข้อมูล) */
export function getSupabase() {
  return getSupabaseClient()
}
