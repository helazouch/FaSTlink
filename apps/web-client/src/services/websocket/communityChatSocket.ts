import type { ChatMessage } from '../../types/social'
import { createStompSocket } from './stompSocket'

interface CommunityChatSocketOptions {
  url: string
  topicPrefix: string
  destination: string
  communityId: number
  currentUserId?: number
  onConnect: () => void
  onDisconnect: () => void
  onError: (message: string) => void
  onMessage: (message: ChatMessage) => void
}

interface OutgoingMessage {
  utilisateurId: number
  senderName: string
  contenu: string
}

interface IncomingMessage {
  id: number
  communauteId: number
  utilisateurId: number
  senderName: string | null
  contenu: string
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

  const topic = `${options.topicPrefix}/${options.communityId}`
  const destination = options.destination.includes('{communityId}')
    ? options.destination.replace('{communityId}', String(options.communityId))
    : options.destination

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
            const payload = JSON.parse(frame.body) as IncomingMessage
            options.onMessage({
              id: String(payload.id ?? createId()),
              communityId: payload.communauteId ?? options.communityId,
              sender: {
                id: payload.utilisateurId,
                fullName: payload.senderName ?? `User #${payload.utilisateurId}`,
                headline: 'Community member',
              },
              content: payload.contenu,
              createdAt: payload.createdAt,
              mine: payload.utilisateurId === options.currentUserId,
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
      socket.publish(destination, message)
    },
    isConnected: () => socket.isConnected(),
  }
}
