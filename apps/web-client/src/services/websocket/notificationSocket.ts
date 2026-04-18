import { createStompSocket } from './stompSocket'
import type { NotificationItem } from '../../types/social'

interface NotificationSocketOptions {
  url: string
  topic: string
  onNotification: (notification: NotificationItem) => void
  onConnect: () => void
  onDisconnect: () => void
  onError: (message: string) => void
}

interface NotificationRealtimeDto {
  notificationId?: string | number
  type?: string
  titre?: string
  contenu?: string
  createdAt?: string
  lu?: boolean
}

const normalizeKind = (value: string | undefined): NotificationItem['kind'] => {
  const normalized = (value ?? '').toLowerCase()

  if (normalized.includes('success')) {
    return 'success'
  }

  if (normalized.includes('warn')) {
    return 'warning'
  }

  if (normalized.includes('alert') || normalized.includes('error')) {
    return 'alert'
  }

  return 'info'
}

export const createNotificationSocket = (options: NotificationSocketOptions) => {
  const socket = createStompSocket({
    url: options.url,
    onConnect: options.onConnect,
    onDisconnect: options.onDisconnect,
    onError: options.onError,
  })

  return {
    connect: () => {
      socket.connect()
      const subscribeWhenReady = () => {
        if (!socket.isConnected()) {
          window.setTimeout(subscribeWhenReady, 150)
          return
        }

        socket.subscribe(options.topic, (message) => {
          try {
            const payload = JSON.parse(message.body) as NotificationRealtimeDto
            options.onNotification({
              id: String(payload.notificationId ?? `ws-${Date.now()}`),
              kind: normalizeKind(payload.type),
              title: payload.titre ?? 'Notification',
              message: payload.contenu ?? '',
              createdAt: payload.createdAt ?? new Date().toISOString(),
              read: payload.lu ?? false,
            })
          } catch {
            options.onNotification({
              id: `ws-${Date.now()}`,
              kind: 'info',
              title: 'Realtime update',
              message: message.body,
              createdAt: new Date().toISOString(),
              read: false,
            })
          }
        })
      }

      subscribeWhenReady()
    },
    disconnect: () => {
      socket.disconnect()
    },
  }
}
