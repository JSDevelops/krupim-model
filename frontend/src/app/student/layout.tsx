'use client'
import StudentFINENav from '@/components/StudentFINENav'
import { useRole } from '@/context/RoleContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import PdpaConsentModal from '@/components/PdpaConsentModal'
import IdleSecurityGuard from '@/components/IdleSecurityGuard'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user || (role !== 'student' && role !== 'developer')) {
      if (role === 'teacher') router.replace('/teacher/dashboard')
      else router.replace('/')
    }
  }, [user, role, loading, router])

  if (loading) {
    return <div className="min-h-screen bg-[#0F291E] text-white flex items-center justify-center p-4">กำลังโหลด...</div>
  }

  return (
    <>
      <PdpaConsentModal />
      <IdleSecurityGuard />
      {children}
      <StudentFINENav />
    </>
  )
}


