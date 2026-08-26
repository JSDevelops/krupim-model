'use client'

import { Toaster } from 'sonner'

function ToastIcon({ type }: { type: 'success' | 'error' | 'warning' | 'info' }) {
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

  if (type === 'success') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>
  if (type === 'error') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>
  if (type === 'warning') return <svg {...common}><path d="M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
}

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      duration={4200}
      visibleToasts={4}
      closeButton
      gap={10}
      offset={18}
      mobileOffset={12}
      containerAriaLabel="การแจ้งเตือนของระบบ"
      icons={{
        success: <ToastIcon type="success" />,
        error: <ToastIcon type="error" />,
        warning: <ToastIcon type="warning" />,
        info: <ToastIcon type="info" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'app-toast',
          title: 'app-toast-title',
          description: 'app-toast-description',
          icon: 'app-toast-icon',
          closeButton: 'app-toast-close',
          success: 'app-toast-success',
          error: 'app-toast-error',
          warning: 'app-toast-warning',
          info: 'app-toast-info',
          loading: 'app-toast-loading',
        },
      }}
    />
  )
}
