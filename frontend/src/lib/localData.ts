'use client'

import type { DataOperation, DbResult } from './db'

type LocalUser = { id: string; email: string }
type LocalSession = { access_token: string; user: LocalUser }
type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT'
type AuthListener = (event: AuthEvent, session: LocalSession | null) => void | Promise<void>

const authListeners = new Set<AuthListener>()

async function jsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof data.error === 'string' ? data.error : 'Local API request failed'
    throw new Error(message)
  }
  return data as T
}

class BrowserQueryBuilder<T = Record<string, unknown>> implements PromiseLike<DbResult<T>> {
  private operation: DataOperation

  constructor(table: string) {
    this.operation = { table, action: 'select', columns: '*', filters: [], mode: 'many' }
  }

  select(columns = '*') {
    this.operation.columns = columns
    return this
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation.action = 'insert'
    this.operation.values = values
    return this
  }

  upsert(values: Record<string, unknown> | Record<string, unknown>[], options?: { onConflict?: string }) {
    this.operation.action = 'upsert'
    this.operation.values = values
    this.operation.onConflict = options?.onConflict
    return this
  }

  update(values: Record<string, unknown>) {
    this.operation.action = 'update'
    this.operation.values = values
    return this
  }

  delete() {
    this.operation.action = 'delete'
    return this
  }

  eq(column: string, value: unknown) {
    this.operation.filters?.push({ type: 'eq', column, value })
    return this
  }

  in(column: string, values: unknown[]) {
    this.operation.filters?.push({ type: 'in', column, value: values })
    return this
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.operation.order = { column, ascending: options.ascending !== false }
    return this
  }

  limit(limit: number) {
    this.operation.limit = limit
    return this
  }

  single() {
    this.operation.mode = 'single'
    this.operation.limit = 2
    return this
  }

  maybeSingle() {
    this.operation.mode = 'maybeSingle'
    this.operation.limit = 2
    return this
  }

  private async execute(): Promise<DbResult<T>> {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.operation),
      })
      return await jsonResponse<DbResult<T>>(response)
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : String(error) } }
    }
  }

  then<TResult1 = DbResult<T>, TResult2 = never>(
    onfulfilled?: ((value: DbResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

export const localData = {
  auth: {
    async signInWithPassword(input: { email: string; password: string; selectedRole: UserRole }) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        const payload = await jsonResponse<{ user: LocalUser; profile: Profile; access_token: string }>(response)
        const session = { access_token: payload.access_token, user: payload.user }
        await Promise.all([...authListeners].map(listener => listener('SIGNED_IN', session)))
        return { data: { user: payload.user, session, profile: payload.profile }, error: null }
      } catch (error) {
        return { data: { user: null, session: null, profile: null }, error: { message: error instanceof Error ? error.message : String(error) } }
      }
    },

    async signUp(input: {
      email: string
      password: string
      options?: { data?: { name?: string; requested_role?: string; school_name?: string; invite_code?: string } }
    }) {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: input.email,
            password: input.password,
            name: input.options?.data?.name,
            requestedRole: input.options?.data?.requested_role,
            school: input.options?.data?.school_name,
            inviteCode: input.options?.data?.invite_code,
          }),
        })
        const payload = await jsonResponse<{ user: LocalUser; profile: Profile; session: LocalSession | null }>(response)
        if (payload.session) {
          await Promise.all([...authListeners].map(listener => listener('SIGNED_IN', payload.session)))
        }
        return { data: payload, error: null }
      } catch (error) {
        return { data: { user: null, profile: null, session: null }, error: { message: error instanceof Error ? error.message : String(error) } }
      }
    },

    async getSession() {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' })
        if (response.status === 401) return { data: { session: null, profile: null }, error: null }
        const payload = await jsonResponse<{ session: LocalSession | null; profile?: Profile }>(response)
        return { data: payload, error: null }
      } catch (error) {
        return { data: { session: null, profile: null }, error: { message: error instanceof Error ? error.message : String(error) } }
      }
    },

    async signOut() {
      await fetch('/api/auth/logout', { method: 'POST' })
      await Promise.all([...authListeners].map(listener => listener('SIGNED_OUT', null)))
      return { error: null }
    },

    onAuthStateChange(listener: AuthListener) {
      authListeners.add(listener)
      return { data: { subscription: { unsubscribe: () => { authListeners.delete(listener) } } } }
    },
  },

  from<T extends Record<string, unknown> = Record<string, unknown>>(table: string) {
    return new BrowserQueryBuilder<T>(table)
  },
}

export async function signInLocal(email: string, password: string, selectedRole: UserRole) {
  const { data, error } = await localData.auth.signInWithPassword({ email, password, selectedRole })
  if (error || !data.user || !data.profile) throw new Error(error?.message || 'Invalid login credentials')
  return { user: data.user, profile: data.profile }
}

export async function signUpLocal(input: {
  email: string
  password: string
  name: string
  requestedRole: 'teacher' | 'student'
  school: string
  inviteCode?: string
}) {
  const { data, error } = await localData.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        name: input.name.trim(),
        requested_role: input.requestedRole,
        school_name: input.school.trim(),
        invite_code: input.inviteCode?.trim(),
      },
    },
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Unable to create account')
  return data
}

export async function signOutLocal() {
  await localData.auth.signOut()
}

export async function getSessionUser() {
  const { data } = await localData.auth.getSession()
  return data.session?.user ?? null
}

export async function getProfileFromDB(userId: string): Promise<Profile | null> {
  const { data, error } = await localData
    .from<Profile>('profiles')
    .select('id, name, role, requested_role, approval_status, avatar_url, school_id, school_name, phone, bio, created_at')
    .eq('id', userId)
    .single()
  if (error) {
    console.warn('getProfileFromDB error:', error.message)
    return null
  }
  return data as Profile
}

export type UserRole = 'developer' | 'teacher' | 'student'

export interface Profile extends Record<string, unknown> {
  id: string
  school_id?: string
  school_name?: string
  name: string
  role: UserRole
  requested_role?: 'teacher' | 'student'
  approval_status?: 'pending' | 'active' | 'inactive'
  avatar_url?: string
  phone?: string
  bio?: string
  created_at: string
}

export interface Course { id: string; title: string; title_en?: string; description?: string; thumbnail_url?: string; is_published: boolean; created_at: string }
export interface Unit { id: string; course_id: string; title: string; title_en?: string; description?: string; order_index: number; thumbnail_url?: string; ar_model_url?: string }
export interface Lesson { id: string; unit_id: string; title: string; content_type: 'video' | 'ar3d' | 'text' | 'quiz' | 'simulation'; content_url?: string; duration_minutes: number; order_index: number }
export interface LessonProgress { id: string; student_id: string; lesson_id: string; status: 'not_started' | 'in_progress' | 'completed'; score: number; time_spent_minutes: number; completed_at?: string }
export interface LearningAnalytics { id: string; student_id: string; course_id: string; date: string; knowledge_score: number; skills_score: number; attitude_score: number; competency_score: number; overall_score: number; lessons_completed: number }
export interface SimulationScenario { id: string; unit_id: string; title: string; description?: string; scenario_type: string; difficulty: string; max_score: number; time_limit_minutes: number; rubric_json?: unknown }
export interface AIScanItem { id: string; name_th: string; name_en: string; category: string; subcategory?: string; description?: string; service_tips?: string; image_url?: string }
