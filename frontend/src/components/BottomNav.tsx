'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/student/dashboard', icon: '🏠', label: 'หน้าหลัก', id: 'home' },
  { href: '/learn', icon: '📚', label: 'เรียนรู้', id: 'learn' },
  { href: '/explore', icon: '🔍', label: 'สำรวจ', id: 'explore' },
  { href: '/progress', icon: '📊', label: 'ความก้าวหน้า', id: 'progress' },
  { href: '/profile', icon: '👤', label: 'โปรไฟล์', id: 'profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link key={item.id} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {isActive && <span className="nav-active-dot" />}
          </Link>
        )
      })}
    </nav>
  )
}
