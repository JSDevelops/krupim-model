export type AdminIconName =
  | 'dashboard'
  | 'users'
  | 'content'
  | 'announcement'
  | 'analytics'
  | 'settings'
  | 'bell'
  | 'menu'
  | 'close'
  | 'logout'
  | 'chevron'
  | 'school'
  | 'teacher'
  | 'student'
  | 'score'
  | 'refresh'
  | 'arrow'
  | 'activity'
  | 'check'
  | 'clock'
  | 'database'
  | 'course'
  | 'search'
  | 'plus'
  | 'key'
  | 'trash'
  | 'pause'
  | 'play'
  | 'edit'
  | 'link'
  | 'sparkles'
  | 'shield'
  | 'palette'
  | 'monitor'
  | 'cube'
  | 'scan'
  | 'archive'
  | 'eye'
  | 'eyeOff'

export default function AdminIcon({
  name,
  size = 20,
  strokeWidth = 1.8,
}: {
  name: AdminIconName
  size?: number
  strokeWidth?: number
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (name === 'dashboard') return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>
  if (name === 'users') return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  if (name === 'content') return <svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h6"/></svg>
  if (name === 'announcement') return <svg {...common}><path d="m3 11 18-5v12L3 13v-2Z"/><path d="M11.6 15.4 13 21H8l-1.8-6.8M21 9v6"/></svg>
  if (name === 'analytics') return <svg {...common}><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="M2 19h22"/></svg>
  if (name === 'settings') return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 8.94 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.57 15 1.7 1.7 0 0 0 3 14H3v-4h.09A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.88L4.2 7l2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.57 1.7 1.7 0 0 0 10 3V3h4v.09A1.7 1.7 0 0 0 15.06 4.6a1.7 1.7 0 0 0 1.88-.34L17 4.2 19.83 7l-.06.06A1.7 1.7 0 0 0 19.43 9 1.7 1.7 0 0 0 21 10h.09v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>
  if (name === 'bell') return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
  if (name === 'menu') return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16"/></svg>
  if (name === 'close') return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>
  if (name === 'logout') return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></svg>
  if (name === 'chevron') return <svg {...common}><path d="m9 18 6-6-6-6"/></svg>
  if (name === 'school') return <svg {...common}><path d="m3 10 9-6 9 6"/><path d="M5 9v11h14V9M9 20v-6h6v6M8 11h.01M16 11h.01"/></svg>
  if (name === 'teacher') return <svg {...common}><path d="M3 4h18v12H3zM8 20h8M12 16v4"/><circle cx="8" cy="9" r="2"/><path d="M5 14c.7-1.6 1.7-2.5 3-2.5s2.3.9 3 2.5M14 8h4M14 11h3"/></svg>
  if (name === 'student') return <svg {...common}><path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z"/><path d="M6 11.2V16c2.7 2.2 9.3 2.2 12 0v-4.8M21.5 9v6"/></svg>
  if (name === 'score') return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
  if (name === 'refresh') return <svg {...common}><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5"/></svg>
  if (name === 'activity') return <svg {...common}><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  if (name === 'database') return <svg {...common}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>
  if (name === 'key') return <svg {...common}><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M15 8l3 3M17 6l3 3"/></svg>
  if (name === 'trash') return <svg {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg>
  if (name === 'pause') return <svg {...common}><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>
  if (name === 'play') return <svg {...common}><path d="m8 5 11 7-11 7V5Z"/></svg>
  if (name === 'edit') return <svg {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
  if (name === 'link') return <svg {...common}><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg>
  if (name === 'sparkles') return <svg {...common}><path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3Z"/><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 13l-.8 2.2L16 16l2.2.8L19 19l.8-2.2L22 16l-2.2-.8L19 13Z"/></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
  if (name === 'palette') return <svg {...common}><path d="M12 3a9 9 0 0 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12h-3Z"/><circle cx="7.5" cy="10.5" r=".7" fill="currentColor"/><circle cx="9" cy="6.5" r=".7" fill="currentColor"/><circle cx="14" cy="6" r=".7" fill="currentColor"/></svg>
  if (name === 'monitor') return <svg {...common}><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
  if (name === 'cube') return <svg {...common}><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 7 9 5 9-5M3 7v10l9 5 9-5V7M12 12v10"/></svg>
  if (name === 'scan') return <svg {...common}><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/></svg>
  if (name === 'archive') return <svg {...common}><path d="M4 7h16v14H4zM3 3h18v4H3zM9 11h6"/></svg>
  if (name === 'eye') return <svg {...common}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>
  if (name === 'eyeOff') return <svg {...common}><path d="m3 3 18 18M10.6 6.2A10.6 10.6 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.3 3M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6a9.7 9.7 0 0 0 3.1-.5M10.2 10.2a2.5 2.5 0 0 0 3.6 3.6"/></svg>
  return <svg {...common}><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/></svg>
}
