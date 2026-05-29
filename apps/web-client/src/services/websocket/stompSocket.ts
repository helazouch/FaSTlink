import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface SocketOptions {
  url: string
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (message: string) => void
}

export interface SocketHandle {
  connect: () => void
  disconnect: () => void
  publish: (destination: string, payload: unknown) => void
  subscribe: (topic: string, onMessage: (message: IMessage) => void) => () => void
  isConnected: () => boolean
}

export const createStompSocket = (options: SocketOptions): SocketHandle => {
  const subscriptions = new Set<StompSubscription>()

  const client = new Client({
    reconnectDelay: 4_000,
    heartbeatIncoming: 5_000,
    heartbeatOutgoing: 5_000,
    webSocketFactory: () => new SockJS(options.url, undefined, { withCredentials: false }),
    debug: () => undefined,
  })

  client.onConnect = () => {
    options.onConnect?.()
  }

  client.onWebSocketClose = () => {
    options.onDisconnect?.()
  }

  client.onStompError = (frame) => {
    options.onError?.(frame.headers.message ?? 'Realtime transport error')
  }

  return {
    connect: () => {
      client.activate()
    },
    disconnect: () => {
      for (const subscription of subscriptions) {
        subscription.unsubscribe()
      }
      subscriptions.clear()
      void client.deactivate()
      options.onDisconnect?.()
    },
    publish: (destination, payload) => {
      if (!client.connected) {
        return
      }

      client.publish({
        destination,
        body: JSON.stringify(payload),
      })
    },
    subscribe: (topic, onMessage) => {
      if (!client.connected) {
        return () => {}
      }

      const subscription = client.subscribe(topic, onMessage)
      subscriptions.add(subscription)

      return () => {
        subscription.unsubscribe()
        subscriptions.delete(subscription)
      }
    },
    isConnected: () => client.connected,
  }
}
