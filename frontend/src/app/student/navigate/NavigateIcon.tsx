type IconName =
  | 'arrowLeft'
  | 'arrowRight'
  | 'book'
  | 'check'
  | 'chevron'
  | 'compass'
  | 'grid'
  | 'info'
  | 'message'
  | 'mic'
  | 'pause'
  | 'play'
  | 'refresh'
  | 'sparkles'
  | 'target'
  | 'user'
  | 'volume'

export default function NavigateIcon({ name, size = 20 }: { name: IconName; size?: number }) {
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

  const paths: Record<IconName, React.ReactNode> = {
    arrowLeft: <><path d="m15 18-6-6 6-6" /><path d="M9 12h10" /></>,
    arrowRight: <><path d="m9 18 6-6-6-6" /><path d="M5 12h10" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    chevron: <><path d="m9 18 6-6-6-6" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5Z" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
    message: <><path d="M20 15a4 4 0 0 1-4 4H8l-5 2 1.5-4A7 7 0 0 1 3 12V8a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></>,
    pause: <><path d="M9 7v10M15 7v10" /></>,
    play: <><path d="m8 5 11 7-11 7Z" /></>,
    refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M7.4 7.4A7 7 0 0 1 19.3 10M4.7 14a7 7 0 0 0 11.9 2.6" /></>,
    sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2Z" /><path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7Z" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v2M21 12h-2M12 21v-2M3 12h2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    volume: <><path d="M11 5 6 9H3v6h3l5 4Z" /><path d="M15 9.5a4 4 0 0 1 0 5M18 7a7 7 0 0 1 0 10" /></>,
  }

  return <svg {...common}>{paths[name]}</svg>
}
