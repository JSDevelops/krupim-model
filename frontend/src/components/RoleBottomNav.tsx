'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole } from '@/context/RoleContext'

const adminNav = [
  { href: '/admin/dashboard', icon: '🏠', label: 'ภาพรวม' },
  { href: '/admin/users', icon: '👥', label: 'ผู้ใช้' },
  { href: '/admin/content', icon: '📦', label: 'เนื้อหา' },
  { href: '/admin/settings', icon: '⚙️', label: 'ตั้งค่า' },
]

const teacherNav = [
  { href: '/teacher/dashboard', icon: '🏠', label: 'ห้องเรียน' },
  { href: '/teacher/assignments', icon: '📋', label: 'มอบหมาย' },
  { href: '/teacher/vocab', icon: '📖', label: 'คำศัพท์' },
  { href: '/teacher/students', icon: '👥', label: 'นักเรียน' },
  { href: '/teacher/profile', icon: '👤', label: 'โปรไฟล์' },
]

const studentNav = [
  { href: '/student/explore', icon: '📱', label: 'F-Familiarize' },
  { href: '/student/interact', icon: '💬', label: 'I-Interact' },
  { href: '/student/scanner', icon: '📷', label: 'สแกน AR' },
  { href: '/student/learn', icon: '📖', label: 'N-Navigate' },
  { href: '/student/progress', icon: '🏅', label: 'E-Exhibit' },
]

const roleColors: Record<string, string> = {
  developer: '#1565C0',
  teacher: '#7B1FA2',
  student: '#00897B',
}

export default function RoleBottomNav() {
  const pathname = usePathname()
  const { role } = useRole()

  const navItems = role === 'developer' ? adminNav
    : role === 'teacher' ? teacherNav
    : studentNav

  const activeColor = roleColors[role ?? 'student']

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? 'active' : ''}`}
            style={{ '--active-color': activeColor } as React.CSSProperties}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label" style={isActive ? { color: activeColor } : {}}>
              {item.label}
            </span>
            {isActive && <span className="nav-active-dot" style={{ background: activeColor }} />}
          </Link>
        )
      })}

      <style jsx>{`
        .nav-item.active .nav-icon {
          transform: scale(1.15);
          filter: saturate(1.5);
        }
      `}</style>
    </nav>
  )
}
