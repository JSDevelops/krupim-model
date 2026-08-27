'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StudentIcon, { type StudentIconName } from '@/app/student/StudentIcon'

const navItems: Array<{ href: string; icon: StudentIconName; label: string; id: string }> = [
  { href: '/student/dashboard', icon: 'school', label: 'หน้าหลัก', id: 'home' },
  { href: '/student/learn', icon: 'book', label: 'เรียนรู้', id: 'learn' },
  { href: '/student/explore', icon: 'cube', label: 'สำรวจ', id: 'explore' },
  { href: '/student/progress', icon: 'chart', label: 'ความก้าวหน้า', id: 'progress' },
  { href: '/student/profile', icon: 'profile', label: 'โปรไฟล์', id: 'profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link key={item.id} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><StudentIcon name={item.icon} size={21} /></span>
            <span className="nav-label">{item.label}</span>
            {isActive && <span className="nav-active-dot" />}
          </Link>
        )
      })}
    </nav>
  )
}
