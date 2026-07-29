'use client'
import RoleBottomNav from '@/components/RoleBottomNav'
import { useRole } from '@/context/RoleContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user || (role !== 'teacher' && role !== 'developer')) {
      if (role === 'student') router.replace('/student/explore')
      else router.replace('/')
    }
  }, [user, role, loading, router])

  if (loading) {
    return <div className="min-h-screen bg-[#0F291E] text-white flex items-center justify-center p-4">กำลังโหลด...</div>
  }

  return (
    <>
      {children}
      <RoleBottomNav />
    </>
  )
}
