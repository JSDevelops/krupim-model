import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../_lib/auth'

const signedInRoles = ['developer', 'teacher', 'student'] as const

type AnnouncementRow = {
  id: string
  title: string
  content: string
  priority: 'urgent' | 'general' | 'event'
  tags: string[]
  link_url: string | null
  published_at: string
  target_audience?: string | null
  starts_at?: string | null
  expires_at?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: signedInRoles, maxRequests: 40 })
    const role = user.role

    const roleFilter = role === 'developer'
      ? ''
      : role === 'teacher'
      ? "AND (target_audience = 'all' OR target_audience = 'teachers' OR target_audience IS NULL)"
      : "AND (target_audience = 'all' OR target_audience = 'students' OR target_audience IS NULL)"

    const result = await queryDb<AnnouncementRow>(`
      SELECT id, title, content, priority, tags, link_url, published_at,
             target_audience, starts_at, expires_at
      FROM system_announcements
      WHERE (starts_at IS NULL OR starts_at <= NOW())
        AND (expires_at IS NULL OR expires_at >= NOW())
        ${roleFilter}
      ORDER BY published_at DESC
      LIMIT 30
    `)
    return NextResponse.json({ announcements: result.rows })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
