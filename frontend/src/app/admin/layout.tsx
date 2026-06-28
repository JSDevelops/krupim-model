'use client'
import RoleBottomNav from '@/components/RoleBottomNav'
import { useRole } from '@/context/RoleContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = useRole()
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('userRole')
    const savedUserInfo = localStorage.getItem('userInfo')
    let parsedUser: any = null
    try { parsedUser = savedUserInfo ? JSON.parse(savedUserInfo) : null } catch {}

    if (!saved) {
      router.replace('/')
    } else if (saved !== 'developer' && parsedUser?.role !== 'developer') {
      router.replace(`/${saved === 'teacher' ? 'teacher' : 'student'}/dashboard`)
    }
  }, [])

  return (
    <>
      {children}
      <RoleBottomNav />
    </>
  )
}
