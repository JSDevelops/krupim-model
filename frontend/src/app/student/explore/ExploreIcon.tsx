export type ExploreIconName =
  | 'alert' | 'arrow' | 'book' | 'camera' | 'check' | 'close' | 'cube'
  | 'image' | 'info' | 'layers' | 'lightbulb' | 'location' | 'message'
  | 'mic' | 'pause' | 'refresh' | 'scan' | 'shield' | 'sparkles'
  | 'upload' | 'volume'

export default function ExploreIcon({
  name,
  size = 20,
  strokeWidth = 1.8,
}: {
  name: ExploreIconName
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

  if (name === 'camera') return <svg {...common}><path d="M4 7h3l1.5-2h7L17 7h3v11H4z"/><circle cx="12" cy="12.5" r="3.5"/></svg>
  if (name === 'sparkles') return <svg {...common}><path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3Z"/><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 13l-.8 2.2L16 16l2.2.8L19 19l.8-2.2L22 16l-2.2-.8L19 13Z"/></svg>
  if (name === 'book') return <svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h6"/></svg>
  if (name === 'volume') return <svg {...common}><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a9 9 0 0 1 0 12"/></svg>
  if (name === 'mic') return <svg {...common}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>
  if (name === 'pause') return <svg {...common}><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>
  if (name === 'upload') return <svg {...common}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></svg>
  if (name === 'scan') return <svg {...common}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10"/></svg>
  if (name === 'close') return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5"/></svg>
  if (name === 'cube') return <svg {...common}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>
  if (name === 'image') return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/></svg>
  if (name === 'info') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
  if (name === 'layers') return <svg {...common}><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></svg>
  if (name === 'lightbulb') return <svg {...common}><path d="M9 18h6M10 22h4"/><path d="M8.2 14.5A7 7 0 1 1 15.8 14.5C15 15.2 15 16 15 18H9c0-2 0-2.8-.8-3.5Z"/></svg>
  if (name === 'location') return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
  if (name === 'message') return <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>
  if (name === 'refresh') return <svg {...common}><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>
  if (name === 'alert') return <svg {...common}><path d="M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="9"/></svg>
}
