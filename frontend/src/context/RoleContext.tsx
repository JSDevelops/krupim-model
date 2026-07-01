'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, getProfileFromDB } from '@/lib/supabase'

export type UserRole = 'developer' | 'teacher' | 'student'

export interface UserInfo {
  id: string
  name: string
  role: UserRole
  avatar?: string
  avatar_url?: string
  school?: string
  school_id?: string
  email?: string
  teacherName?: string
  enrolledClass?: string
}

interface RoleContextType {
  user: UserInfo | null
  role: UserRole | null
  setUser: (user: UserInfo) => void
  logout: () => void
  isAdmin: boolean
  isTeacher: boolean
  isStudent: boolean
  loading: boolean
}

const RoleContext = createContext<RoleContextType>({
  user: null, role: null,
  setUser: () => {}, logout: () => {},
  isAdmin: false, isTeacher: false, isStudent: false,
  loading: true
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. ดึง session ปัจจุบันจาก Supabase Auth
    supabase.auth.getSession().then(async ({ data }) => {
      const supabaseUser = data.session?.user
      if (supabaseUser) {
        // ดึง profile จาก DB เพื่อรับ role
        const profile = await getProfileFromDB(supabaseUser.id)
        if (profile) {
          const userInfo: UserInfo = {
            id: profile.id,
            name: profile.name,
            role: profile.role,
            avatar_url: profile.avatar_url,
            school_id: profile.school_id,
            email: supabaseUser.email
          }
          setUserState(userInfo)
          localStorage.setItem('userRole', profile.role)
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
        } else {
          // fallback: ถ้าไม่มี profile ใน DB ให้อ่านจาก localStorage
          const savedUser = localStorage.getItem('userInfo')
          if (savedUser) {
            try { setUserState(JSON.parse(savedUser)) } catch {}
          }
        }
      } else {
        // ไม่มี Supabase session — อ่านจาก localStorage (สำหรับ dev/offline mode)
        const savedUser = localStorage.getItem('userInfo')
        if (savedUser) {
          try { setUserState(JSON.parse(savedUser)) } catch {}
        }
      }
      setLoading(false)
    })

    // 2. ฟัง Auth state changes (login/logout จาก tab อื่น)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserState(null)
        localStorage.removeItem('userRole')
        localStorage.removeItem('userInfo')
      } else if (event === 'SIGNED_IN' && session?.user) {
        const profile = await getProfileFromDB(session.user.id)
        if (profile) {
          const userInfo: UserInfo = {
            id: profile.id,
            name: profile.name,
            role: profile.role,
            avatar_url: profile.avatar_url,
            school_id: profile.school_id,
            email: session.user.email
          }
          setUserState(userInfo)
          localStorage.setItem('userRole', profile.role)
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function setUser(u: UserInfo) {
    setUserState(u)
    localStorage.setItem('userRole', u.role)
    localStorage.setItem('userInfo', JSON.stringify(u))
  }

  async function logout() {
    await supabase.auth.signOut()
    setUserState(null)
    localStorage.removeItem('userRole')
    localStorage.removeItem('userInfo')
    window.location.href = '/'
  }

  const role = user?.role ?? null
  return (
    <RoleContext.Provider value={{
      user, role, setUser, logout, loading,
      isAdmin: role === 'developer',
      isTeacher: role === 'teacher',
      isStudent: role === 'student',
    }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
