import { NextRequest, NextResponse } from 'next/server'
import { executeOperation, type DataOperation } from '@/lib/db'
import { ApiError, apiErrorResponse, guardApi, type AuthUser } from '../_lib/auth'

const READABLE_TABLES = new Set(['schools', 'profiles', 'notifications', 'fine_lesson_plans', 'ar_items', 'vocabulary_items', 'ai_scan_items'])
const VALID_ACTIONS = new Set(['select', 'insert', 'upsert', 'update', 'delete'])

function forceEq(operation: DataOperation, column: string, value: unknown) {
  operation.filters ||= []
  operation.filters.push({ type: 'eq', column, value })
}

function hasEqFilter(operation: DataOperation, column: string, value: unknown) {
  return operation.filters?.some(filter => (
    filter.type === 'eq' && filter.column === column && filter.value === value
  )) ?? false
}

function rows(operation: DataOperation) {
  if (!operation.values) return []
  return Array.isArray(operation.values) ? operation.values : [operation.values]
}

function keepFields(row: Record<string, unknown>, allowed: Set<string>) {
  return Object.fromEntries(Object.entries(row).filter(([key]) => allowed.has(key)))
}

function authorizeOperation(operation: DataOperation, user: AuthUser) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(operation.table)) throw new ApiError('Invalid data source', 400, 'INVALID_TABLE')
  if (!VALID_ACTIONS.has(operation.action)) throw new ApiError('Invalid data operation', 400, 'INVALID_OPERATION')

  if (operation.action === 'select') {
    if (!READABLE_TABLES.has(operation.table)) throw new ApiError('Data source is not readable', 403, 'FORBIDDEN')
  } else if (!['profiles', 'notifications'].includes(operation.table)) {
    throw new ApiError('Use the dedicated management API for this data source', 403, 'DEDICATED_API_REQUIRED')
  }

  if (operation.table === 'profiles') {
    if (operation.action === 'select') {
      if (user.role === 'student' || user.role === 'teacher') forceEq(operation, 'id', user.id)
      return operation
    }
    if (operation.action !== 'update') throw new ApiError('Profile operation is not allowed', 403, 'FORBIDDEN')
    forceEq(operation, 'id', user.id)
    operation.values = keepFields(rows(operation)[0] || {}, new Set(['name', 'school_id', 'school_name', 'avatar_url', 'phone', 'bio', 'updated_at']))
    return operation
  }

  if (operation.table === 'fine_lesson_plans' && user.role === 'student') {
    if (!hasEqFilter(operation, 'id', 'ar-items-store')) {
      throw new ApiError('Lesson plans must be loaded through the student learning API', 403, 'DEDICATED_API_REQUIRED')
    }
    return operation
  }

  if (operation.table === 'notifications') {
    forceEq(operation, 'user_id', user.id)
    return operation
    if (operation.action !== 'update') throw new ApiError('Notification operation is not allowed', 403, 'FORBIDDEN')
    operation.values = keepFields(rows(operation)[0] || {}, new Set(['is_read']))
    return operation
  }

  if (operation.table === 'fine_lesson_plans' && user.role === 'teacher') {
    if (operation.action === 'insert' || operation.action === 'upsert') {
      operation.values = rows(operation).map(row => ({ ...row, teacher_email: user.email }))
    } else {
      forceEq(operation, 'teacher_email', user.email)
    }
    if (operation.action === 'select') return operation
  }

  if (operation.table === 'ar_items' && user.role === 'teacher') {
    if (operation.action === 'insert' || operation.action === 'upsert') {
      operation.values = rows(operation).map(row => ({ ...row, created_by: user.id }))
    } else {
      forceEq(operation, 'created_by', user.id)
    }
    return operation
  }

  if (operation.action === 'select') return operation
  throw new ApiError('Data operation is not allowed', 403, 'FORBIDDEN')
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { maxRequests: 120, windowMs: 60_000 })
    const body = await request.json() as DataOperation
    const result = await executeOperation(authorizeOperation(structuredClone(body), user))
    if (result.error) return NextResponse.json(result, { status: result.error.code === 'PGRST116' ? 404 : 400 })
    return NextResponse.json(result)
  } catch (error) {
    return apiErrorResponse(error)
  }
}
