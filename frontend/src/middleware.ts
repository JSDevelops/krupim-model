import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ─── Protected Route Config ───────────────────────────────────────────────────
// กำหนด prefix ที่ต้องการ role ใด
const ROLE_GUARDS: Record<string, ('developer' | 'teacher' | 'student')[]> = {
  '/admin':   ['developer'],
  '/teacher': ['teacher', 'developer'],
  '/student': ['student', 'developer'],
}

// Public routes ที่ไม่ต้องการ Auth
const PUBLIC_PATHS = ['/', '/role-select', '/register-teacher', '/register-student']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. อนุญาต public routes ────────────────────────────────────────────────
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // ── 2. ตรวจสอบ Supabase session token จาก cookie ─────────────────────────
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // สร้าง supabase client แบบ server-side (อ่าน cookie จาก request)
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: { cookie: request.headers.get('cookie') || '' }
    },
    auth: { persistSession: false }
  })

  const { data: { session } } = await supabase.auth.getSession()

  // ── 3. ถ้าไม่มี session → redirect ไปหน้า Login ────────────────────────────
  if (!session) {
    // ตรวจสอบ localStorage role ผ่าน cookie fallback (สำหรับ dev mode)
    // ถ้าไม่มีเลยให้ redirect ไป /
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ── 4. ดึง role จาก user_metadata หรือ profiles table (via header) ────────
  // role อยู่ใน profiles table — ดึงผ่าน supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const userRole = (profile?.role || 'student') as string

  // ── 5. ตรวจสอบ role ต่อ route prefix ─────────────────────────────────────
  for (const [prefix, allowedRoles] of Object.entries(ROLE_GUARDS)) {
    if (pathname.startsWith(prefix)) {
      if (!allowedRoles.includes(userRole as any)) {
        // Redirect ไปหน้าที่เหมาะสมกับ role ของตัวเอง
        const url = request.nextUrl.clone()
        if (userRole === 'teacher') url.pathname = '/teacher/dashboard'
        else if (userRole === 'student') url.pathname = '/student/explore'
        else url.pathname = '/'
        return NextResponse.redirect(url)
      }
      break
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Guard ทุก route ยกเว้น static assets และ API
    '/((?!_next/static|_next/image|favicon.ico|api|icons|manifest.json|.*\\.(?:png|jpg|svg|ico|webp|glb|usdz)).*)',
  ],
}
