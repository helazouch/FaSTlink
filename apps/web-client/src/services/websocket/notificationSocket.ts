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
            const payload = JSON.parse(message.body) as NotificationItem
            options.onNotification(payload)
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
