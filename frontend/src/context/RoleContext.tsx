'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { localData, getProfileFromDB } from '@/lib/localData'

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
    // 1. ดึง session ปัจจุบันจาก Local PostgreSQL Auth
    localData.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user
      if (sessionUser) {
        // ดึง profile จาก DB เพื่อรับ role
        const profile = data.profile ?? await getProfileFromDB(sessionUser.id)
        if (profile?.approval_status === 'active' || (profile && !profile.approval_status)) {
          const userInfo: UserInfo = {
            id: profile.id,
            name: profile.name,
            role: profile.role,
            avatar_url: profile.avatar_url,
            school_id: profile.school_id,
            email: sessionUser.email
          }
          setUserState(userInfo)
          localStorage.setItem('userRole', profile.role)
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
        } else {
          // หากไม่มี profile ใน DB — ล้างสิทธิ์ที่ไม่ถูกต้อง
          setUserState(null)
          localStorage.removeItem('userRole')
          localStorage.removeItem('userInfo')
        }
      } else {
        // ไม่มี Local PostgreSQL session — ไม่ใช้ localStorage fallback เพื่อความปลอดภัย
        setUserState(null)
        localStorage.removeItem('userRole')
        localStorage.removeItem('userInfo')
      }
      setLoading(false)
    })

    // 2. ฟัง Auth state changes (login/logout จาก tab อื่น)
    const { data: { subscription } } = localData.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'SIGNED_OUT') {
        setUserState(null)
        localStorage.removeItem('userRole')
        localStorage.removeItem('userInfo')
      } else if (event === 'SIGNED_IN' && session?.user) {
        const profile = await getProfileFromDB(session.user.id)

        if (profile?.approval_status === 'active' || (profile && !profile.approval_status)) {
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
        } else {
          setUserState(null)
          localStorage.removeItem('userRole')
          localStorage.removeItem('userInfo')
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
    await localData.auth.signOut()
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
