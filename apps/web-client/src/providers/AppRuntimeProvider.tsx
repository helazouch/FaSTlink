import { useEffect, type ReactNode } from 'react'
import { env } from '../config/env'
import { createNotificationSocket } from '../services/websocket/notificationSocket'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

interface AppRuntimeProviderProps {
  children: ReactNode
}

export const AppRuntimeProvider = ({ children }: AppRuntimeProviderProps) => {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const logout = useAuthStore((state) => state.logout)
  const prependNotification = useNotificationStore((state) => state.prependNotification)

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
    if (!env.enableWebsocket || status !== 'authenticated' || !user) {
      return
    }

    const socket = createNotificationSocket({
      url: env.notificationWsUrl,
      topic: `${env.notificationTopicPrefix}/${user.id}/notifications`,
      onNotification: prependNotification,
      onConnect: () => undefined,
      onDisconnect: () => undefined,
      onError: () => undefined,
    })

    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [prependNotification, status, user])

  return <>{children}</>
}
