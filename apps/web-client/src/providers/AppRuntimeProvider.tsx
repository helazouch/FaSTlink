import { useEffect, type ReactNode } from 'react'
import { env } from '../config/env'
import { createNotificationSocket } from '../services/websocket/notificationSocket'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import type { AuthSession } from '../types/auth'

interface AppRuntimeProviderProps {
  children: ReactNode
}

export const AppRuntimeProvider = ({ children }: AppRuntimeProviderProps) => {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const logout = useAuthStore((state) => state.logout)
  const setSession = useAuthStore((state) => state.setSession)
  const prependNotification = useNotificationStore((state) => state.prependNotification)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
    }

    const handleSessionRefresh = (event: Event) => {
      const session = (event as CustomEvent<AuthSession>).detail
      if (session) {
        setSession(session)
      }
    }

    window.addEventListener('fastlink:auth:unauthorized', handleUnauthorized)
    window.addEventListener('fastlink:auth:session-refreshed', handleSessionRefresh)

    return () => {
      window.removeEventListener('fastlink:auth:unauthorized', handleUnauthorized)
      window.removeEventListener('fastlink:auth:session-refreshed', handleSessionRefresh)
    }
  }, [logout, setSession])

  useEffect(() => {
    if (!env.enableWebsocket || status !== 'authenticated' || !user) {
      return
    }

    const socket = createNotificationSocket({
      url: env.wsUrl,
      topic: `${env.notificationTopicPrefix}${user.id}`,
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
