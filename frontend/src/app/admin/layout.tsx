'use client'
import RoleBottomNav from '@/components/RoleBottomNav'
import { useRole } from '@/context/RoleContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user || role !== 'developer') {
      if (role === 'teacher') router.replace('/teacher/dashboard')
      else if (role === 'student') router.replace('/student/explore')
      else router.replace('/')
    }
  }, [user, role, loading, router])

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">กำลังโหลด...</div>
  }

  return (
    <>
      {children}
      <RoleBottomNav />
    </>
  )
}
