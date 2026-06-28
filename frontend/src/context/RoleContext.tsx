'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type UserRole = 'developer' | 'teacher' | 'student'

export interface UserInfo {
  id: string
  name: string
  role: UserRole
  avatar?: string
  school?: string
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
}

const RoleContext = createContext<RoleContextType>({
  user: null, role: null,
  setUser: () => {}, logout: () => {},
  isAdmin: false, isTeacher: false, isStudent: false
})

// Demo users per role
const DEMO_USERS: Record<UserRole, UserInfo> = {
  developer: {
    id: 'admin-001', name: 'ผู้ดูแลระบบ', role: 'developer',
    avatar: '⚙️', school: 'FINE MODE Platform', email: 'admin@finemode.ac.th'
  },
  teacher: {
    id: 'teacher-001', name: 'ครูสมหญิง รักเรียน', role: 'teacher',
    avatar: '👩‍🏫', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', email: 'teacher@school.ac.th'
  },
  student: {
    id: 'student-001', name: 'นายสมชาย ใจดี', role: 'student',
    avatar: '👨‍🎓', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', email: 'student@school.ac.th'
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserInfo | null>(null)

  useEffect(() => {
    // Restore from localStorage
    const savedRole = localStorage.getItem('userRole') as UserRole | null
    const savedUser = localStorage.getItem('userInfo')
    if (savedUser) {
      try { setUserState(JSON.parse(savedUser)) } catch {}
    } else if (savedRole && DEMO_USERS[savedRole]) {
      setUserState(DEMO_USERS[savedRole])
    }
  }, [])

  function setUser(u: UserInfo) {
    setUserState(u)
    localStorage.setItem('userRole', u.role)
    localStorage.setItem('userInfo', JSON.stringify(u))
  }

  function logout() {
    setUserState(null)
    localStorage.removeItem('userRole')
    localStorage.removeItem('userInfo')
    window.location.href = '/'
  }

  const role = user?.role ?? null
  return (
    <RoleContext.Provider value={{
      user, role, setUser, logout,
      isAdmin: role === 'developer',
      isTeacher: role === 'teacher',
      isStudent: role === 'student',
    }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
export { DEMO_USERS }
