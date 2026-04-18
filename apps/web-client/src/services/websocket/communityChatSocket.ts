import type { ChatMessage, UserSummary } from '../../types/social'
import { createStompSocket } from './stompSocket'

interface CommunityChatSocketOptions {
  url: string
  topicPrefix: string
  destination: string
  communityId: number
  onConnect: () => void
  onDisconnect: () => void
  onError: (message: string) => void
  onMessage: (message: ChatMessage) => void
}

interface OutgoingMessage {
  communityId: number
  sender: UserSummary
  content: string
  createdAt: string
}

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const createCommunityChatSocket = (options: CommunityChatSocketOptions) => {
  const socket = createStompSocket({
    url: options.url,
    onConnect: options.onConnect,
    onDisconnect: options.onDisconnect,
    onError: options.onError,
  })

  const topic = `${options.topicPrefix}${options.communityId}`

  return {
    connect: () => {
      socket.connect()

      const subscribeWhenReady = () => {
        if (!socket.isConnected()) {
          window.setTimeout(subscribeWhenReady, 150)
          return
        }

        socket.subscribe(topic, (frame) => {
          try {
            const payload = JSON.parse(frame.body) as OutgoingMessage
            options.onMessage({
              id: createId(),
              communityId: payload.communityId,
              sender: payload.sender,
              content: payload.content,
              createdAt: payload.createdAt,
              mine: false,
            })
          } catch {
            options.onMessage({
              id: createId(),
              communityId: options.communityId,
              sender: {
                id: -1,
                fullName: 'Community Bot',
                headline: 'System assistant',
              },
              content: frame.body,
              createdAt: new Date().toISOString(),
              mine: false,
            })
          }
        })
      }

      subscribeWhenReady()
    },
    disconnect: () => {
      socket.disconnect()
    },
    send: (message: OutgoingMessage) => {
      socket.publish(options.destination, message)
    },
    isConnected: () => socket.isConnected(),
  }
}
