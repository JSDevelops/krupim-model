'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StudentIcon, { type StudentIconName } from '@/app/student/StudentIcon'
import { useRole } from '@/context/RoleContext'

type NavItem = { href: string; icon: StudentIconName; label: string }

const adminNav: NavItem[] = [
  { href: '/admin/dashboard', icon: 'chart', label: 'ภาพรวม' },
  { href: '/admin/users', icon: 'user', label: 'ผู้ใช้' },
  { href: '/admin/content', icon: 'cube', label: 'เนื้อหา' },
  { href: '/admin/settings', icon: 'task', label: 'ตั้งค่า' },
]

const teacherNav: NavItem[] = [
  { href: '/teacher/dashboard', icon: 'school', label: 'ห้องเรียน' },
  { href: '/teacher/assignments', icon: 'task', label: 'มอบหมาย' },
  { href: '/teacher/vocab', icon: 'book', label: 'คำศัพท์' },
  { href: '/teacher/students', icon: 'user', label: 'นักเรียน' },
  { href: '/teacher/profile', icon: 'profile', label: 'โปรไฟล์' },
]

const studentNav: NavItem[] = [
  { href: '/student/explore', icon: 'cube', label: 'F-Familiarize' },
  { href: '/student/interact', icon: 'message', label: 'I-Interact' },
  { href: '/student/scanner', icon: 'camera', label: 'AR Scan' },
  { href: '/student/learn', icon: 'book', label: 'N-Navigate' },
  { href: '/student/progress', icon: 'award', label: 'E-Exhibit' },
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
            <span className="nav-icon"><StudentIcon name={item.icon} size={21} /></span>
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
