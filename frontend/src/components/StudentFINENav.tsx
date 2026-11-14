'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './StudentFINENav.module.css'

type FineLetter = 'H' | 'F' | 'I' | 'N' | 'E' | 'P'
type NavIcon = 'home' | 'explore' | 'interact' | 'navigate' | 'exhibit' | 'profile'

type NavItem = {
  href: string
  letter: FineLetter
  label: string
  icon: NavIcon
  aliases?: string[]
}

const TABS: NavItem[] = [
  { href: '/student/dashboard', letter: 'H', label: 'หน้าหลัก', icon: 'home' },
  { href: '/student/explore', letter: 'F', label: 'F · Familiarize', icon: 'explore' },
  { href: '/student/interact', letter: 'I', label: 'I · Interact', icon: 'interact', aliases: ['/chat', '/live'] },
  { href: '/student/navigate', letter: 'N', label: 'N · Navigate', icon: 'navigate', aliases: ['/simulation', '/student/simulation'] },
  { href: '/student/exhibit', letter: 'E', label: 'E · Exhibit', icon: 'exhibit' },
  { href: '/student/profile', letter: 'P', label: 'Portfolio', icon: 'profile', aliases: ['/student/progress'] },
]

function FineNavIcon({ name }: { name: NavIcon }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (name === 'home') return <svg {...common}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  if (name === 'explore') return <svg {...common}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3"/><path d="M12 7v2M12 15v2M7 12h2M15 12h2"/></svg>
  if (name === 'interact') return <svg {...common}><path d="M21 14a3 3 0 0 1-3 3H9l-5 4v-4a3 3 0 0 1-2-3V6a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3Z"/><path d="M7 8h10M7 12h6"/></svg>
  if (name === 'navigate') return <svg {...common}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/><path d="m9.5 6.2 5 2.7"/></svg>
  if (name === 'exhibit') return <svg {...common}><path d="M9 4h6M10 2h4v4h-4z"/><rect x="5" y="5" width="14" height="17" rx="2"/><path d="m8 13 2 2 5-5M8 18h8"/></svg>
  return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/><path d="M18 5.5h3M19.5 4v3"/></svg>
}

function isCurrentPath(pathname: string, tab: NavItem) {
  const paths = [tab.href, ...(tab.aliases || [])]
  return paths.some(path => pathname === path || pathname.startsWith(path + '/'))
}

export default function StudentFINENav() {
  const pathname = usePathname()

  return (
    <div className={styles.dockWrap}>
      <nav className={styles.dock} aria-label="Student Navigation Menu">
        {TABS.map(tab => {
          const active = isCurrentPath(pathname, tab)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              aria-current={active ? 'page' : undefined}
              aria-label={`${tab.label} (${tab.letter})`}
              className={`${styles.item} ${active ? styles.active : ''}`}
            >
              <span className={styles.iconWrap}><FineNavIcon name={tab.icon} /></span>
              <span className={styles.label}>{tab.label}</span>
              {active && <span className={styles.activeMark} aria-hidden="true" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
