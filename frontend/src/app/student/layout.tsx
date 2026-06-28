'use client'
import StudentFINENav from '@/components/StudentFINENav'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('userRole')
    if (!saved) {
      router.replace('/')
    }
  }, [])

  return (
    <>
      {children}
      <StudentFINENav />
    </>
  )
}
