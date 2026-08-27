import { NextRequest, NextResponse } from 'next/server'
import { queryDb } from '@/lib/db'
import { apiErrorResponse, guardApi } from '../../_lib/auth'

type SummaryRow = {
  total: number
  today: number
  actors: number
  actions: number
}

function safeFilter(value: string | null) {
  const normalized = value?.trim().toLowerCase() || ''
  return /^[a-z0-9_-]{1,80}$/.test(normalized) ? normalized : ''
}

export async function GET(request: NextRequest) {
  try {
    await guardApi(request, { roles: ['developer'], maxRequests: 90 })
    const url = new URL(request.url)
    const requestedPage = Number(url.searchParams.get('page') || '1')
    const requestedLimit = Number(url.searchParams.get('limit') || '24')
    const page = Number.isInteger(requestedPage) ? Math.max(1, Math.min(requestedPage, 10_000)) : 1
    const limit = Number.isInteger(requestedLimit) ? Math.max(10, Math.min(requestedLimit, 100)) : 24
    const search = (url.searchParams.get('search') || '').trim().slice(0, 120)
    const action = safeFilter(url.searchParams.get('action'))
    const entityType = safeFilter(url.searchParams.get('entityType'))

    const clauses: string[] = []
    const values: unknown[] = []
    const addValue = (value: unknown) => {
      values.push(value)
      return `$${values.length}`
    }
    if (search) {
      const position = addValue(`%${search}%`)
      clauses.push(`(COALESCE(p.name,'') ILIKE ${position} OR COALESCE(p.email,'') ILIKE ${position} OR l.action ILIKE ${position} OR l.entity_type ILIKE ${position} OR COALESCE(l.entity_id,'') ILIKE ${position})`)
    }
    if (action) clauses.push(`l.action=${addValue(action)}`)
    if (entityType) clauses.push(`l.entity_type=${addValue(entityType)}`)
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const offset = (page - 1) * limit

    const [logs, count, summary, options] = await Promise.all([
      queryDb(`
        SELECT l.id,l.action,l.entity_type AS "entityType",l.entity_id AS "entityId",
               l.details_json AS details,l.created_at AS "createdAt",
               p.name AS "actorName",p.email AS "actorEmail",p.role AS "actorRole"
        FROM audit_logs l LEFT JOIN profiles p ON p.id=l.actor_id
        ${where}
        ORDER BY l.created_at DESC
        LIMIT ${addValue(limit)} OFFSET ${addValue(offset)}
      `, values),
      queryDb<{ total: number }>(`
        SELECT COUNT(*)::int AS total
        FROM audit_logs l LEFT JOIN profiles p ON p.id=l.actor_id
        ${where}
      `, values.slice(0, values.length - 2)),
      queryDb<SummaryRow>(`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE created_at>=CURRENT_DATE)::int AS today,
               COUNT(DISTINCT actor_id)::int AS actors,
               COUNT(DISTINCT action)::int AS actions
        FROM audit_logs
      `),
      queryDb<{ actions: string[]; entityTypes: string[] }>(`
        SELECT ARRAY(SELECT DISTINCT action FROM audit_logs ORDER BY action) AS actions,
               ARRAY(SELECT DISTINCT entity_type FROM audit_logs ORDER BY entity_type) AS "entityTypes"
      `),
    ])

    const total = count.rows[0]?.total || 0
    return NextResponse.json({
      logs: logs.rows,
      summary: summary.rows[0] || { total: 0, today: 0, actors: 0, actions: 0 },
      options: options.rows[0] || { actions: [], entityTypes: [] },
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
