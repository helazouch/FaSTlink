import { Client, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export interface OutgoingChatPayload {
  sender: string
  content: string
  sentAt: string
  channel: string
}

export interface ChatClientOptions {
  url: string
  topic: string
  destination: string
  onConnect: () => void
  onDisconnect: () => void
  onMessage: (body: string) => void
  onError: (message: string) => void
}

export interface ChatClient {
  connect: () => void
  disconnect: () => void
  send: (payload: OutgoingChatPayload) => void
  isConnected: () => boolean
}

export const createChatClient = (options: ChatClientOptions): ChatClient => {
  let subscription: StompSubscription | null = null

  const client = new Client({
    reconnectDelay: 5_000,
    heartbeatIncoming: 4_000,
    heartbeatOutgoing: 4_000,
    webSocketFactory: () => new SockJS(options.url),
    debug: () => undefined,
  })

  client.onConnect = () => {
    subscription = client.subscribe(options.topic, (message) => {
      options.onMessage(message.body)
    })
    options.onConnect()
  }

  client.onStompError = (frame) => {
    options.onError(frame.headers.message ?? frame.body ?? 'Broker connection error')
  }

  client.onWebSocketClose = () => {
    options.onDisconnect()
  }

  return {
    connect: () => {
      client.activate()
    },
    disconnect: () => {
      if (subscription) {
        subscription.unsubscribe()
        subscription = null
      }
      void client.deactivate()
      options.onDisconnect()
    },
    send: (payload) => {
      if (!client.connected) {
        options.onError('WebSocket client is not connected yet')
        return
      }

      client.publish({
        destination: options.destination,
        body: JSON.stringify(payload),
      })
    },
    isConnected: () => client.connected,
  }
}
