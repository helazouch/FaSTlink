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

  let retryDelay = 1000
  let reconnectTimer: number | null = null
  let isConnectingOrConnected = false

  const client = new Client({
    reconnectDelay: 0, // Manage reconnects manually for exponential backoff
    heartbeatIncoming: 5000,
    heartbeatOutgoing: 5000,
    webSocketFactory: () => new SockJS(options.url),
    debug: (message) => {
      if (options.debugLabel) {
        console.debug(`[${options.debugLabel}] ${message}`)
      }
    },
  })

  const getNextDelay = (current: number): number => {
    if (current <= 1000) return 2000
    if (current <= 2000) return 5000
    if (current <= 5000) return 10000
    return 30000 // Capped at 30 seconds
  }

  const scheduleReconnect = () => {
    if (reconnectTimer !== null) {
      return
    }

    if (options.debugLabel) {
      console.warn(`[${options.debugLabel}] Scheduling reconnect in ${retryDelay}ms...`)
    }

    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null
      if (options.debugLabel) {
        console.info(`[${options.debugLabel}] Attempting reconnect...`)
      }
      try {
        client.activate()
      } catch (err) {
        console.error('Reconnect activation failed:', err)
        handleFailure()
      }
    }, retryDelay)

    retryDelay = getNextDelay(retryDelay)
  }

  const handleFailure = () => {
    isConnectingOrConnected = false
    options.onDisconnect?.()
    scheduleReconnect()
  }

  client.onConnect = () => {
    retryDelay = 1000 // Reset backoff on successful connection
    isConnectingOrConnected = true
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (options.debugLabel) {
      console.info(`[${options.debugLabel}] connected`)
    }
    options.onConnect?.()
  }

  client.onWebSocketClose = () => {
    if (options.debugLabel) {
      console.info(`[${options.debugLabel}] websocket closed`)
    }
    handleFailure()
  }

  client.onStompError = (frame) => {
    const message = frame.headers.message ?? 'Realtime transport error'
    if (options.debugLabel) {
      console.error(`[${options.debugLabel}] stomp error`, message, frame.body)
    }
    handleFailure()
  }

  return {
    connect: () => {
      if (isConnectingOrConnected) return
      isConnectingOrConnected = true
      retryDelay = 1000
      if (options.debugLabel) {
        console.info(`[${options.debugLabel}] connecting`, options.url)
      }
      client.activate()
    },
    disconnect: () => {
      isConnectingOrConnected = false
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
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
