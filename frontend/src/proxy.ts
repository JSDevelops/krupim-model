import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

const ROLE_GUARDS: Record<string, ('developer' | 'teacher' | 'student')[]> = {
  '/admin': ['developer'],
  '/teacher': ['teacher', 'developer'],
  '/student': ['student', 'developer'],
}

const PUBLIC_PATHS = ['/', '/role-select', '/forgot-password', '/register-teacher', '/register-student']

function redirectToLogin(request: NextRequest, code?: string) {
  const url = request.nextUrl.clone()
  url.pathname = '/role-select'
  url.searchParams.set('redirect', request.nextUrl.pathname)
  if (code) url.searchParams.set('error', code)
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request: { headers: request.headers } })

  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return response
  }

  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    if (!token) return redirectToLogin(request)
    const session = await verifySessionToken(token)

    for (const [prefix, allowedRoles] of Object.entries(ROLE_GUARDS)) {
      if (!pathname.startsWith(prefix)) continue
      if (!allowedRoles.includes(session.role)) {
        const url = request.nextUrl.clone()
        if (session.role === 'teacher') url.pathname = '/teacher/dashboard'
        else if (session.role === 'student') url.pathname = '/student/dashboard'
        else url.pathname = '/role-select'
        return NextResponse.redirect(url)
      }
      break
    }

    return response
  } catch (error) {
    console.error('Proxy auth error:', error)
    return redirectToLogin(request, 'auth_unavailable')
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|icons|manifest.json|.*\\.(?:png|jpg|svg|ico|webp|glb|usdz)).*)',
  ],
}
