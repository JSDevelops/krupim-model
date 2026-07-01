import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── Protected Route Config ───────────────────────────────────────────────────
const ROLE_GUARDS: Record<string, ('developer' | 'teacher' | 'student')[]> = {
  '/admin':   ['developer'],
  '/teacher': ['teacher', 'developer'],
  '/student': ['student', 'developer'],
}

// Public routes that don't need auth
const PUBLIC_PATHS = ['/', '/role-select', '/register-teacher', '/register-student']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // ── 1. Allow public routes ──────────────────────────────────────────────────
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return response
  }

  // ── 2. Create server client (managing session cookies manually in middleware) ─
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(({ name, value }) => ({ name, value }))
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  // ── 3. If no session, redirect to Login ────────────────────────────────────
  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ── 4. Fetch user role from profiles table ───────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const userRole = (profile?.role || 'student') as string

  // ── 5. Enforce role guards ─────────────────────────────────────────────────
  for (const [prefix, allowedRoles] of Object.entries(ROLE_GUARDS)) {
    if (pathname.startsWith(prefix)) {
      if (!allowedRoles.includes(userRole as any)) {
        const url = request.nextUrl.clone()
        if (userRole === 'teacher') url.pathname = '/teacher/dashboard'
        else if (userRole === 'student') url.pathname = '/student/explore'
        else url.pathname = '/'
        return NextResponse.redirect(url)
      }
      break
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|icons|manifest.json|.*\\.(?:png|jpg|svg|ico|webp|glb|usdz)).*)',
  ],
}
