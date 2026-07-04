import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zzkgzbdvyeansjxsylgw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)



// ─── Auth Helpers ─────────────────────────────────────────────────────────────

/** Login ด้วย Supabase Auth — คืนค่า { user, profile } หรือ throw Error */
export async function signInWithSupabase(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)

  const profile = await getProfileFromDB(data.user.id)
  return { user: data.user, profile }
}

/** Logout จาก Supabase Auth */
export async function signOutSupabase() {
  await supabase.auth.signOut()
}

/** ดึง session ปัจจุบัน (ใช้ใน middleware / RoleContext) */
export async function getSessionUser() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

/** ดึงโปรไฟล์จาก profiles table (รวม role) */
export async function getProfileFromDB(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) {
    console.warn('getProfileFromDB error:', error.message)
    return null
  }
  return data as Profile
}

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export type UserRole = 'developer' | 'teacher' | 'student'

export interface Profile {
  id: string
  school_id?: string
  name: string
  role: UserRole
  avatar_url?: string
  phone?: string
  bio?: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  title_en?: string
  description?: string
  thumbnail_url?: string
  is_published: boolean
  created_at: string
}

export interface Unit {
  id: string
  course_id: string
  title: string
  title_en?: string
  description?: string
  order_index: number
  thumbnail_url?: string
  ar_model_url?: string
}

export interface Lesson {
  id: string
  unit_id: string
  title: string
  content_type: 'video' | 'ar3d' | 'text' | 'quiz' | 'simulation'
  content_url?: string
  duration_minutes: number
  order_index: number
}

export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  score: number
  time_spent_minutes: number
  completed_at?: string
}

export interface LearningAnalytics {
  id: string
  student_id: string
  course_id: string
  date: string
  knowledge_score: number
  skills_score: number
  attitude_score: number
  competency_score: number
  overall_score: number
  lessons_completed: number
}

export interface SimulationScenario {
  id: string
  unit_id: string
  title: string
  description?: string
  scenario_type: string
  difficulty: string
  max_score: number
  time_limit_minutes: number
  rubric_json?: any
}

export interface AIScanItem {
  id: string
  name_th: string
  name_en: string
  category: string
  subcategory?: string
  description?: string
  service_tips?: string
  image_url?: string
}
