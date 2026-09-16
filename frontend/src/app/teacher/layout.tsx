'use client'
import { useRole } from '@/context/RoleContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import PdpaConsentModal from '@/components/PdpaConsentModal'
import IdleSecurityGuard from '@/components/IdleSecurityGuard'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/role-select')
      return
    }
    if (role !== 'teacher' && role !== 'developer') {
      if (role === 'student') router.replace('/student/dashboard')
      else router.replace('/role-select')
    }
  }, [user, role, loading, router])

  if (loading || !user) {
    return <div className="min-h-screen bg-[#0F291E] text-white flex items-center justify-center p-4">กำลังโหลด...</div>
  }

  return (
    <>
      <PdpaConsentModal />
      <IdleSecurityGuard />
      {children}
    </>
  )
}


