'use client'
import RoleBottomNav from '@/components/RoleBottomNav'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('userRole')
    const savedUserInfo = localStorage.getItem('userInfo')
    let parsedUser: any = null
    try { parsedUser = savedUserInfo ? JSON.parse(savedUserInfo) : null } catch {}

    if (!saved) {
      router.replace('/')
    } else if (saved === 'student' && parsedUser?.role !== 'developer') {
      router.replace('/student/explore')
    }
  }, [])

  return (
    <>
      {children}
      <RoleBottomNav />
    </>
  )
}
