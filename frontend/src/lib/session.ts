import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import type { NextRequest, NextResponse } from 'next/server'

export const SESSION_COOKIE = 'krupim_session'

export type SessionRole = 'developer' | 'teacher' | 'student'

export type SessionUser = {
  id: string
  email: string
  role: SessionRole
}

type SessionClaims = JWTPayload & {
  email: string
  role: SessionRole
}

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET || ''
  if (secret.length < 32) {
    throw new Error('AUTH_SECRET must contain at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.id)
    .setIssuer('krupim-local')
    .setAudience('krupim-app')
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSessionSecret())
}

export async function verifySessionToken(token: string): Promise<SessionUser> {
  const { payload } = await jwtVerify<SessionClaims>(token, getSessionSecret(), {
    algorithms: ['HS256'],
    issuer: 'krupim-local',
    audience: 'krupim-app',
  })

  if (!payload.sub || !payload.email || !['developer', 'teacher', 'student'].includes(payload.role)) {
    throw new Error('Invalid session payload')
  }

  return { id: payload.sub, email: payload.email, role: payload.role }
}

export function getRequestSessionToken(request: NextRequest) {
  const authorization = request.headers.get('authorization') || ''
  if (authorization.startsWith('Bearer ')) {
    const bearer = authorization.slice(7).trim()
    if (bearer) return bearer
  }
  return request.cookies.get(SESSION_COOKIE)?.value || ''
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

