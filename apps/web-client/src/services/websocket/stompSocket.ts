import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface SocketOptions {
  url: string
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (message: string) => void
  debugLabel?: string
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
    webSocketFactory: () => new SockJS(options.url),
    debug: (message) => {
      if (options.debugLabel) {
        console.debug(`[${options.debugLabel}] ${message}`)
      }
    },
  })

  client.onConnect = () => {
    if (options.debugLabel) {
      console.info(`[${options.debugLabel}] connected`)
    }
    options.onConnect?.()
  }

  client.onWebSocketClose = () => {
    if (options.debugLabel) {
      console.info(`[${options.debugLabel}] disconnected`)
    }
    options.onDisconnect?.()
  }

  client.onStompError = (frame) => {
    const message = frame.headers.message ?? 'Realtime transport error'
    if (options.debugLabel) {
      console.error(`[${options.debugLabel}] stomp error`, message, frame.body)
    }
    options.onError?.(message)
  }

  return {
    connect: () => {
      if (options.debugLabel) {
        console.info(`[${options.debugLabel}] connecting`, options.url)
      }
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
        if (options.debugLabel) {
          console.warn(`[${options.debugLabel}] subscribe skipped while disconnected`, topic)
        }
        return () => {}
      }

      if (options.debugLabel) {
        console.info(`[${options.debugLabel}] subscribing`, topic)
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
