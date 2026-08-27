export type InteractIconName = 'arrowLeft' | 'arrowRight' | 'book' | 'check' | 'headphones' | 'info' | 'message' | 'mic' | 'pause' | 'refresh' | 'sparkles' | 'volume' | 'x'

export default function InteractIcon({ name, size = 20 }: { name: InteractIconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (name === 'arrowLeft') return <svg {...common}><path d="M19 12H5M10 17l-5-5 5-5"/></svg>
  if (name === 'arrowRight') return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5"/></svg>
  if (name === 'book') return <svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h6"/></svg>
  if (name === 'check') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>
  if (name === 'headphones') return <svg {...common}><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H5a1 1 0 0 1-1-1v-5ZM20 14h-3v6h2a1 1 0 0 0 1-1v-5Z"/></svg>
  if (name === 'info') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
  if (name === 'message') return <svg {...common}><path d="M21 14a3 3 0 0 1-3 3H9l-5 4v-4a3 3 0 0 1-2-3V6a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3Z"/><path d="M7 8h10M7 12h6"/></svg>
  if (name === 'mic') return <svg {...common}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>
  if (name === 'pause') return <svg {...common}><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>
  if (name === 'refresh') return <svg {...common}><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>
  if (name === 'sparkles') return <svg {...common}><path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3Z"/><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14Z"/></svg>
  if (name === 'volume') return <svg {...common}><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a9 9 0 0 1 0 12"/></svg>
  return <svg {...common}><path d="m7 7 10 10M17 7 7 17"/></svg>
}
