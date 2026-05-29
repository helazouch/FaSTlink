import { useEffect, type ReactNode } from 'react'
import { env } from '../config/env'
import { queryClient } from '../config/queryClient'
import { createNotificationSocket } from '../services/websocket/notificationSocket'
import { resetFeedCache } from '../services/social/feedService'
import { EntityProvider } from '../context/EntityContext'
import { PermissionProvider } from '../context/PermissionContext'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import type { NotificationItem } from '../types/social'

interface AppRuntimeProviderProps {
  children: ReactNode
}

export const AppRuntimeProvider = ({ children }: AppRuntimeProviderProps) => {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const logout = useAuthStore((state) => state.logout)
  const prependNotification = useNotificationStore((state) => state.prependNotification)
  const setNotifications = useNotificationStore((state) => state.setItems)
  const userId = user?.id ?? null

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
    }

    window.addEventListener('fastlink:auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('fastlink:auth:unauthorized', handleUnauthorized)
    }
  }, [logout])

  useEffect(() => {
    resetFeedCache()
    void queryClient.removeQueries({ queryKey: ['social-feed'] })
    void queryClient.removeQueries({ queryKey: ['saved-publications'] })
    void queryClient.removeQueries({ queryKey: ['communities'] })
    void queryClient.removeQueries({ queryKey: ['events'] })
    void queryClient.removeQueries({ queryKey: ['notifications'] })
    setNotifications([])
  }, [setNotifications, userId])

  useEffect(() => {
    if (!env.enableWebsocket || status !== 'authenticated' || !user) {
      return
    }

    const socket = createNotificationSocket({
      url: env.notificationWsUrl,
      topic: `${env.notificationTopicPrefix}/${user.id}/notifications`,
      onNotification: (notification) => {
        prependNotification(notification)
        queryClient.setQueryData(
          ['notifications', 'my', user.id],
          (current: NotificationItem[] | undefined) => {
            const items = current ?? []
            return [notification, ...items.filter((item) => item.id !== notification.id)]
          },
        )
        window.setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: ['notifications', 'my', user.id] })
        }, 1_000)
        console.info('[notifications-ws] query cache updated', notification.id)
      },
      onConnect: () => console.info('[notifications-ws] frontend connected'),
      onDisconnect: () => console.info('[notifications-ws] frontend disconnected'),
      onError: (message) => console.error('[notifications-ws] frontend error', message),
    })

    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [prependNotification, status, user])

  return (
    <PermissionProvider>
      <EntityProvider>{children}</EntityProvider>
    </PermissionProvider>
  )
}
