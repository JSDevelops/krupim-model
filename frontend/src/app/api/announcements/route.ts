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
}

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: signedInRoles, maxRequests: 40 })
    const result = await queryDb<AnnouncementRow>(`
      SELECT id, title, content, priority, tags, link_url, published_at
      FROM system_announcements
      ORDER BY published_at DESC
      LIMIT 30
    `)
    return NextResponse.json({ announcements: result.rows })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
