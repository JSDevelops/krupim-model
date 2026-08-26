'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import { localData } from '@/lib/localData'
import AdminShell from '@/components/admin/AdminShell'

type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout, user } = useRole()
  const userId = user?.id
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationLoading, setNotificationLoading] = useState(false)

  useEffect(() => {
    ;['geminiApiKey', 'openaiApiKey', 'claudeApiKey', 'threeDAIStudioKey', 'tripoApiKey', 'supabaseAnonKey', 'registeredUsers']
      .forEach(key => localStorage.removeItem(key))
  }, [pathname])

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    setNotificationLoading(true)
    try {
      const { data, error } = await localData
        .from<NotificationItem>('notifications')
        .select('id, title, message, type, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (!error && data) setNotifications(data)
    } catch (error) {
      console.warn('Failed to fetch notifications:', error)
    } finally {
      setNotificationLoading(false)
    }
  }, [userId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (userId) void fetchNotifications()
      else setNotifications([])
    }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchNotifications, userId])

  async function markAllAsRead() {
    if (!userId) return
    const unreadIds = notifications.filter(item => !item.is_read).map(item => item.id)
    if (!unreadIds.length) return

    const { error } = await localData
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    if (!error) {
      setNotifications(current => current.map(item => ({ ...item, is_read: true })))
    }
  }

  if (pathname === '/' || pathname === '/role-select') return <>{children}</>

  const isAdmin = pathname.startsWith('/admin')
  const isTeacher = pathname.startsWith('/teacher')

  if (isAdmin || isTeacher) {
    return (
      <AdminShell
        variant={isTeacher ? 'teacher' : 'admin'}
        user={user}
        notifications={notifications}
        notificationLoading={notificationLoading}
        onRefreshNotifications={fetchNotifications}
        onMarkAllRead={markAllAsRead}
        onLogout={logout}
      >
        {children}
      </AdminShell>
    )
  }

  return <div className="app-wrapper">{children}</div>
}
