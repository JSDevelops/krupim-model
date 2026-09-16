'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
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
  pdpa_consent?: boolean
  pdpa_consent_at?: string
  pdpa_consent_version?: string
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

const USER_SESSION_KEY = 'krupim_active_user'

function getStoredUser(): UserInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(USER_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

function storeUser(user: UserInfo | null) {
  if (typeof window === 'undefined') return
  try {
    if (user) sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(USER_SESSION_KEY)
  } catch {}
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUserState] = useState<UserInfo | null>(getStoredUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // 1. ดึง session ปัจจุบันจาก Local PostgreSQL Auth
    localData.auth.getSession().then(async ({ data, error }) => {
      if (!active) return
      if (error) {
        console.warn('Session verification notice:', error.message)
        // If there is an error communicating with server, do not prematurely wipe out state
        setLoading(false)
        return
      }

      const sessionUser = data?.session?.user
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
            email: sessionUser.email,
            pdpa_consent: profile.pdpa_consent,
            pdpa_consent_at: profile.pdpa_consent_at,
            pdpa_consent_version: profile.pdpa_consent_version,
          }
          if (active) {
            setUserState(userInfo)
            storeUser(userInfo)
          }
        } else {
          // หากไม่มี profile ใน DB หรือถูกระงับ — ล้างสิทธิ์
          if (active) {
            setUserState(null)
            storeUser(null)
            localStorage.removeItem('userRole')
            localStorage.removeItem('userInfo')
          }
        }
      } else {
        // ไม่มี Local PostgreSQL session
        if (active) {
          setUserState(null)
          storeUser(null)
          localStorage.removeItem('userRole')
          localStorage.removeItem('userInfo')
        }
      }
      if (active) setLoading(false)
    }).catch(err => {
      console.warn('Session fetch caught error:', err)
      if (active) setLoading(false)
    })

    // 2. ฟัง Auth state changes (login/logout จาก tab อื่น)
    const { data: { subscription } } = localData.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserState(null)
        storeUser(null)
        setLoading(false)
        localStorage.removeItem('userRole')
        localStorage.removeItem('userInfo')
      } else if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true)
        const profile = session.profile ?? await getProfileFromDB(session.user.id)

        if (profile?.approval_status === 'active' || (profile && !profile.approval_status)) {
          const userInfo: UserInfo = {
            id: profile.id,
            name: profile.name,
            role: profile.role,
            avatar_url: profile.avatar_url,
            school_id: profile.school_id,
            email: session.user.email,
            pdpa_consent: profile.pdpa_consent,
            pdpa_consent_at: profile.pdpa_consent_at,
            pdpa_consent_version: profile.pdpa_consent_version,
          }
          setUserState(userInfo)
          storeUser(userInfo)
        } else {
          setUserState(null)
          storeUser(null)
          localStorage.removeItem('userRole')
          localStorage.removeItem('userInfo')
        }
        setLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  function setUser(u: UserInfo) {
    setUserState(u)
    storeUser(u)
    setLoading(false)
  }

  async function logout() {
    await localData.auth.signOut()
    setUserState(null)
    storeUser(null)
    localStorage.removeItem('userRole')
    localStorage.removeItem('userInfo')
    router.replace('/')
    router.refresh()
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
