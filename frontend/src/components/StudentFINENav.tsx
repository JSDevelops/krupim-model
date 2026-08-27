'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { authenticatedFetch } from '@/lib/api'
import styles from './StudentFINENav.module.css'

type FineLetter = 'F' | 'I' | 'N' | 'E' | 'P'
type NavIcon = 'explore' | 'interact' | 'navigate' | 'exhibit' | 'profile'
type TaskCounts = Record<FineLetter, number>

type NavItem = {
  href: string
  letter: FineLetter
  label: string
  fineLabel: string
  icon: NavIcon
  aliases?: string[]
}

const EMPTY_COUNTS: TaskCounts = { F: 0, I: 0, N: 0, E: 0, P: 0 }

const TABS: NavItem[] = [
  { href: '/student/explore', letter: 'F', label: 'สำรวจ', fineLabel: 'Familiarize', icon: 'explore' },
  { href: '/student/interact', letter: 'I', label: 'ฝึกพูด', fineLabel: 'Interact', icon: 'interact', aliases: ['/chat', '/live'] },
  { href: '/student/navigate', letter: 'N', label: 'สถานการณ์', fineLabel: 'Navigate', icon: 'navigate', aliases: ['/simulation', '/student/simulation'] },
  { href: '/student/exhibit', letter: 'E', label: 'ทบทวน', fineLabel: 'Exhibit', icon: 'exhibit' },
  { href: '/student/profile', letter: 'P', label: 'โปรไฟล์', fineLabel: 'Portfolio', icon: 'profile', aliases: ['/student/progress'] },
]

function FineNavIcon({ name }: { name: NavIcon }) {
  const common = {
    width: 21,
    height: 21,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (name === 'explore') return <svg {...common}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3"/><path d="M12 7v2M12 15v2M7 12h2M15 12h2"/></svg>
  if (name === 'interact') return <svg {...common}><path d="M21 14a3 3 0 0 1-3 3H9l-5 4v-4a3 3 0 0 1-2-3V6a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3Z"/><path d="M7 8h10M7 12h6"/></svg>
  if (name === 'navigate') return <svg {...common}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/><path d="m9.5 6.2 5 2.7"/></svg>
  if (name === 'exhibit') return <svg {...common}><path d="M9 4h6M10 2h4v4h-4z"/><rect x="5" y="5" width="14" height="17" rx="2"/><path d="m8 13 2 2 5-5M8 18h8"/></svg>
  return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/><path d="M18 5.5h3M19.5 4v3"/></svg>
}

function countsMatch(left: TaskCounts, right: TaskCounts) {
  return left.F === right.F && left.I === right.I && left.N === right.N && left.E === right.E && left.P === right.P
}

function isCurrentPath(pathname: string, tab: NavItem) {
  const paths = [tab.href, ...(tab.aliases || [])]
  return paths.some(path => pathname === path || pathname.startsWith(path + '/'))
}

export default function StudentFINENav() {
  const pathname = usePathname()
  const [taskCounts, setTaskCounts] = useState<TaskCounts>(EMPTY_COUNTS)

  useEffect(() => {
    const controller = new AbortController()
    const updateCounts = async () => {
      try {
        const response = await authenticatedFetch('/api/student/dashboard', { signal: controller.signal })
        if (!response.ok) return
        const payload = await response.json() as { taskCounts?: TaskCounts }
        const next = payload.taskCounts || EMPTY_COUNTS
        setTaskCounts(previous => countsMatch(previous, next) ? previous : next)
      } catch { /* session/layout guard handles authentication */ }
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') updateCounts()
    }

    void updateCounts()
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void updateCounts()
    }, 60_000)
    window.addEventListener('focus', updateCounts)
    window.addEventListener('storage', updateCounts)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', updateCounts)
      window.removeEventListener('storage', updateCounts)
      document.removeEventListener('visibilitychange', handleVisibility)
      controller.abort()
    }
  }, [])

  return (
    <div className={styles.dockWrap}>
      <nav className={styles.dock} aria-label="เมนูหลักนักเรียน">
        {TABS.map(tab => {
          const active = isCurrentPath(pathname, tab)
          const pendingCount = taskCounts[tab.letter]

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              aria-current={active ? 'page' : undefined}
              aria-label={`${tab.label} — ${tab.fineLabel}${pendingCount ? `, มีงานค้าง ${pendingCount} รายการ` : ''}`}
              className={`${styles.item} ${active ? styles.active : ''}`}
            >
              {pendingCount > 0 && <span className={styles.badge} aria-hidden="true">{pendingCount > 99 ? '99+' : pendingCount}</span>}
              <span className={styles.iconWrap}><FineNavIcon name={tab.icon} /></span>
              <span className={styles.copy}>
                <span className={styles.label}>{tab.label}</span>
                <span className={styles.fineLabel}>{tab.letter} · {tab.fineLabel}</span>
              </span>
              {active && <span className={styles.activeMark} aria-hidden="true" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
