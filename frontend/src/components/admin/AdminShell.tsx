'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import logo from '../../../public/logo.png'
import type { UserInfo } from '@/context/RoleContext'
import AdminIcon, { type AdminIconName } from './AdminIcon'
import styles from './AdminShell.module.css'

type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

type AdminShellProps = {
  children: React.ReactNode
  variant?: 'admin' | 'teacher'
  user: UserInfo | null
  notifications: NotificationItem[]
  notificationLoading: boolean
  onRefreshNotifications: () => Promise<void>
  onMarkAllRead: () => Promise<void>
  onLogout: () => void | Promise<void>
}

type NavigationItem = {
  href: string
  label: string
  description: string
  icon: AdminIconName
}

const adminNavigation: Array<{ label: string; items: NavigationItem[] }> = [
  {
    label: 'ภาพรวม',
    items: [
      { href: '/admin/dashboard', label: 'แดชบอร์ด', description: 'สถานะและภาพรวมระบบ', icon: 'dashboard' },
      { href: '/admin/analytics', label: 'รายงานวิเคราะห์', description: 'ผลลัพธ์และแนวโน้ม', icon: 'analytics' },
    ],
  },
  {
    label: 'ระบบวิชาการ',
    items: [
      { href: '/admin/classes', label: 'ห้องเรียนทั้งหมด', description: 'ห้องเรียน สมาชิก และลิงก์เชิญ', icon: 'school' },
      { href: '/admin/students', label: 'ทะเบียนนักเรียน', description: 'สมาชิกและผลการเรียนรายห้อง', icon: 'student' },
      { href: '/admin/lessons', label: 'แผนการสอน', description: 'แผน FINE และการเผยแพร่', icon: 'content' },
      { href: '/admin/assignments', label: 'งานและการประเมิน', description: 'งาน การส่ง และคะแนน KSA-C', icon: 'score' },
      { href: '/admin/certificates', label: 'ใบรับรองสมรรถนะ', description: 'ออกใหม่ ควบคุมสถานะ และดูประวัติ', icon: 'archive' },
      { href: '/admin/vocabulary', label: 'คลังคำศัพท์', description: 'คำศัพท์ส่วนกลางและของครู', icon: 'course' },
      { href: '/admin/ar-models', label: 'โมเดล AR 3D', description: 'สร้างด้วย AI และจัดการสื่อสามมิติ', icon: 'cube' },
    ],
  },
  {
    label: 'ระบบและเนื้อหา',
    items: [
      { href: '/admin/users', label: 'ครูและนักเรียน', description: 'บัญชี บทบาท และสิทธิ์เข้าถึง', icon: 'users' },
      { href: '/admin/content', label: 'เนื้อหาการเรียนรู้', description: 'บทเรียนและสื่อ AR', icon: 'content' },
      { href: '/admin/blog', label: 'ข่าวและประกาศ', description: 'สื่อสารกับผู้ใช้งาน', icon: 'announcement' },
      { href: '/admin/audit-logs', label: 'ประวัติกิจกรรม', description: 'ตรวจสอบการเปลี่ยนแปลงในระบบ', icon: 'activity' },
      { href: '/admin/settings', label: 'ตั้งค่าระบบ', description: 'บริการและการเชื่อมต่อ', icon: 'settings' },
    ],
  },
]

const teacherNavigation: Array<{ label: string; items: NavigationItem[] }> = [
  {
    label: 'ภาพรวม',
    items: [
      { href: '/teacher/dashboard', label: 'แดชบอร์ด', description: 'ชั้นเรียนและงานที่ต้องติดตาม', icon: 'dashboard' },
    ],
  },
  {
    label: 'การจัดการเรียนรู้',
    items: [
      { href: '/teacher/lessons', label: 'แผนการสอน', description: 'บทเรียนตาม FINE Model', icon: 'content' },
      { href: '/teacher/ar-models', label: 'โมเดล AR 3D', description: 'สื่อสามมิติสำหรับบทเรียน', icon: 'cube' },
      { href: '/teacher/vocab', label: 'คลังคำศัพท์', description: 'คำศัพท์และกิจกรรม AI Scan', icon: 'course' },
    ],
  },
  {
    label: 'ชั้นเรียน',
    items: [
      { href: '/teacher/classes', label: 'ห้องเรียน', description: 'รายวิชาและสมาชิกในชั้น', icon: 'school' },
      { href: '/teacher/students', label: 'นักเรียน', description: 'ทะเบียน สิทธิ์ และผลการเรียน', icon: 'student' },
      { href: '/teacher/assignments', label: 'งานและการประเมิน', description: 'มอบหมาย ตรวจ และให้คะแนน', icon: 'score' },
    ],
  },
  {
    label: 'บัญชีและความช่วยเหลือ',
    items: [
      { href: '/teacher/manual', label: 'คู่มือการใช้งาน', description: 'แนวทางใช้งานระบบสำหรับครู', icon: 'content' },
      { href: '/teacher/profile', label: 'ข้อมูลส่วนตัว', description: 'โปรไฟล์และสถานศึกษา', icon: 'teacher' },
    ],
  },
]

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'แดชบอร์ด',
  '/admin/analytics': 'รายงานวิเคราะห์',
  '/admin/classes': 'ห้องเรียนทั้งหมด',
  '/admin/students': 'ทะเบียนนักเรียน',
  '/admin/lessons': 'แผนการสอนทั้งหมด',
  '/admin/assignments': 'งานและการประเมิน',
  '/admin/certificates': 'ใบรับรองสมรรถนะ',
  '/admin/vocabulary': 'คลังคำศัพท์',
  '/admin/ar-models': 'โมเดล AR 3D',
  '/admin/users': 'จัดการผู้ใช้งาน',
  '/admin/content': 'จัดการเนื้อหา',
  '/admin/blog': 'ข่าวและประกาศ',
  '/admin/audit-logs': 'ประวัติกิจกรรม',
  '/admin/settings': 'ตั้งค่าระบบ',
  '/teacher/dashboard': 'แดชบอร์ดครูผู้สอน',
  '/teacher/lessons': 'แผนการสอน',
  '/teacher/ar-models': 'โมเดล AR 3D',
  '/teacher/vocab': 'คลังคำศัพท์',
  '/teacher/classes': 'จัดการห้องเรียน',
  '/teacher/students': 'จัดการนักเรียน',
  '/teacher/assignments': 'งานและการประเมิน',
  '/teacher/manual': 'คู่มือการใช้งาน',
  '/teacher/profile': 'ข้อมูลส่วนตัว',
}

function initials(name?: string) {
  const value = name?.trim()
  if (!value) return 'AD'
  return value.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function notificationIcon(type: string): AdminIconName {
  if (type === 'success') return 'check'
  if (type === 'assignment') return 'content'
  if (type === 'warning') return 'activity'
  return 'bell'
}

export default function AdminShell({
  children,
  variant = 'admin',
  user,
  notifications,
  notificationLoading,
  onRefreshNotifications,
  onMarkAllRead,
  onLogout,
}: AdminShellProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const unreadCount = notifications.filter(item => !item.is_read).length
  const isTeacherConsole = variant === 'teacher'
  const navigation = isTeacherConsole ? teacherNavigation : adminNavigation
  const consoleLabel = isTeacherConsole ? 'TEACHER CONSOLE' : 'ADMIN CONSOLE'
  const accountLabel = isTeacherConsole ? 'ครูผู้สอน' : 'ผู้ดูแลระบบ'
  const title = pageTitles[pathname] || (isTeacherConsole ? 'ระบบครูผู้สอน' : 'ระบบผู้ดูแล')

  async function toggleNotifications() {
    const next = !notificationsOpen
    setNotificationsOpen(next)
    if (next) await onRefreshNotifications()
  }

  const sidebar = (
    <aside className={styles.sidebar} aria-label={isTeacherConsole ? 'เมนูครูผู้สอน' : 'เมนูผู้ดูแลระบบ'}>
      <div className={styles.brand}>
        <Image src={logo} width={42} height={42} alt="FINE MODEL" priority />
        <div>
          <strong>FINE MODEL</strong>
          <span>{consoleLabel}</span>
        </div>
        <button className={styles.drawerClose} type="button" onClick={() => setDrawerOpen(false)} aria-label="ปิดเมนู">
          <AdminIcon name="close" size={20} />
        </button>
      </div>

      <nav className={styles.navigation}>
        {navigation.map(section => (
          <div className={styles.navSection} key={section.label}>
            <p>{section.label}</p>
            {section.items.map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? styles.navItemActive : styles.navItem}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setDrawerOpen(false)}
                >
                  <span className={styles.navIcon}><AdminIcon name={item.icon} size={19} /></span>
                  <span className={styles.navCopy}>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  <AdminIcon name="chevron" size={15} />
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.systemStatus}>
          <span aria-hidden="true" />
          <div><strong>ระบบพร้อมใช้งาน</strong><small>Local PostgreSQL</small></div>
        </div>
        <div className={styles.account}>
          <span className={styles.avatar}>{initials(user?.name)}</span>
          <div><strong>{user?.name || accountLabel}</strong><small>{user?.email || accountLabel}</small></div>
        </div>
        <button className={styles.logout} type="button" onClick={() => void onLogout()}>
          <AdminIcon name="logout" size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  )

  return (
    <div className={styles.shell}>
      <div className={drawerOpen ? styles.drawerVisible : styles.drawer}>{sidebar}</div>
      {drawerOpen && <button className={styles.overlay} type="button" onClick={() => setDrawerOpen(false)} aria-label="ปิดเมนู" />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            <button className={styles.menuButton} type="button" onClick={() => setDrawerOpen(true)} aria-label="เปิดเมนู">
              <AdminIcon name="menu" size={21} />
            </button>
            <div><small>{consoleLabel}</small><strong>{title}</strong></div>
          </div>

          <div className={styles.topbarActions}>
            <div className={styles.notificationWrap}>
              <button
                className={styles.iconButton}
                type="button"
                onClick={() => void toggleNotifications()}
                aria-label="การแจ้งเตือน"
                aria-expanded={notificationsOpen}
              >
                <AdminIcon name="bell" size={20} />
                {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {notificationsOpen && (
                <section className={styles.notificationPanel} aria-label="รายการแจ้งเตือน">
                  <header>
                    <div><strong>การแจ้งเตือน</strong><span>{unreadCount} รายการที่ยังไม่ได้อ่าน</span></div>
                    {unreadCount > 0 && <button type="button" onClick={() => void onMarkAllRead()}>อ่านทั้งหมด</button>}
                  </header>
                  <div className={styles.notificationList}>
                    {notificationLoading ? (
                      <p className={styles.notificationEmpty}>กำลังโหลดข้อมูล...</p>
                    ) : notifications.length === 0 ? (
                      <p className={styles.notificationEmpty}>ยังไม่มีการแจ้งเตือน</p>
                    ) : notifications.map(item => (
                      <article className={item.is_read ? styles.notificationItem : styles.notificationItemUnread} key={item.id}>
                        <span><AdminIcon name={notificationIcon(item.type)} size={16} /></span>
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.message}</p>
                          <small>{new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className={styles.topbarAccount}>
              <span>{initials(user?.name)}</span>
              <div><strong>{user?.name || accountLabel}</strong><small>{accountLabel}</small></div>
            </div>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
