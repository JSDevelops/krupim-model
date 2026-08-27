import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

export default async function LegacyProfilePage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) redirect('/role-select')
  try {
    const session = await verifySessionToken(token)
    if (session.role === 'teacher') redirect('/teacher/profile')
    if (session.role === 'developer') redirect('/admin/settings')
    redirect('/student/profile')
  } catch {
    redirect('/role-select')
  }
}
