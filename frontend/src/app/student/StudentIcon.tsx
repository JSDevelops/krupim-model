export type StudentIconName = 'arrowLeft' | 'arrowRight' | 'award' | 'book' | 'calendar' | 'camera' | 'chart' | 'check' | 'chevron' | 'clock' | 'cube' | 'edit' | 'exhibit' | 'eye' | 'eyeOff' | 'history' | 'info' | 'key' | 'lock' | 'logout' | 'message' | 'mic' | 'profile' | 'refresh' | 'school' | 'sparkles' | 'target' | 'task' | 'user' | 'volume' | 'x'

export default function StudentIcon({ name, size = 20 }: { name: StudentIconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (name === 'arrowLeft') return <svg {...common}><path d="M19 12H5M10 7l-5 5 5 5" /></svg>
  if (name === 'arrowRight') return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5" /></svg>
  if (name === 'award') return <svg {...common}><circle cx="12" cy="8" r="5" /><path d="m8.5 12-1 9 4.5-2 4.5 2-1-9" /></svg>
  if (name === 'book') return <svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
  if (name === 'calendar') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
  if (name === 'camera') return <svg {...common}><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" /><circle cx="12" cy="12" r="4" /></svg>
  if (name === 'chart') return <svg {...common}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
  if (name === 'check') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></svg>
  if (name === 'chevron') return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  if (name === 'cube') return <svg {...common}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>
  if (name === 'edit') return <svg {...common}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
  if (name === 'exhibit') return <svg {...common}><path d="M8 3h8l1 3h3v15H4V6h3Z" /><path d="M9 11h6M9 15h4" /></svg>
  if (name === 'eye') return <svg {...common}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
  if (name === 'eyeOff') return <svg {...common}><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2 2.8M6.6 6.6C3.7 8.3 2 12 2 12s3.5 7 10 7a10 10 0 0 0 3.4-.6" /></svg>
  if (name === 'history') return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></svg>
  if (name === 'info') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
  if (name === 'key') return <svg {...common}><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M16 7l2 2M14 9l2 2" /></svg>
  if (name === 'lock') return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
  if (name === 'logout') return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" /></svg>
  if (name === 'message') return <svg {...common}><path d="M21 14a3 3 0 0 1-3 3H9l-5 4v-4a3 3 0 0 1-2-3V6a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3Z" /></svg>
  if (name === 'mic') return <svg {...common}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></svg>
  if (name === 'profile' || name === 'user') return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
  if (name === 'refresh') return <svg {...common}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>
  if (name === 'school') return <svg {...common}><path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-6h6v6" /></svg>
  if (name === 'sparkles') return <svg {...common}><path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2Z" /><path d="m18 14-.8 2.2L15 17l2.2.8L18 20l.8-2.2L21 17l-2.2-.8Z" /></svg>
  if (name === 'target') return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v2M21 12h-2" /></svg>
  if (name === 'task') return <svg {...common}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3h6v4H9ZM9 12h6M9 16h4" /></svg>
  if (name === 'volume') return <svg {...common}><path d="M11 5 6 9H3v6h3l5 4ZM15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" /></svg>
  return <svg {...common}><path d="m7 7 10 10M17 7 7 17" /></svg>
}
