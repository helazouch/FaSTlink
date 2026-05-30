import { useCallback, useEffect, useRef, useState } from 'react'
import { createChatClient } from '../services/websocket/chatClient'
import { env } from '../config/env'
import type { ChatMessage } from '../types/domain'

type ConnectionState = 'connecting' | 'online' | 'offline'

interface UseChatResult {
  messages: ChatMessage[]
  connectionState: ConnectionState
  sendMessage: (content: string) => void
}

const CHAT_CHANNEL = 'general'
const SELF_NAME = 'You'

const createMessageId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const parseIncomingMessage = (body: string): Omit<ChatMessage, 'id' | 'mine'> => {
  try {
    const payload = JSON.parse(body) as Partial<ChatMessage>
    return {
      sender: payload.sender ?? 'Teammate',
      content: payload.content ?? body,
      sentAt: payload.sentAt ?? new Date().toISOString(),
      channel: payload.channel ?? CHAT_CHANNEL,
    }
  } catch {
    return {
      sender: 'Teammate',
      content: body,
      sentAt: new Date().toISOString(),
      channel: CHAT_CHANNEL,
    }
  }
}

export const useChat = (): UseChatResult => {
  const wsEnabled = env.enableWebsocket
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    wsEnabled ? 'connecting' : 'offline',
  )
  const clientRef = useRef<ReturnType<typeof createChatClient> | null>(null)
  const pendingEchoTimeoutIdsRef = useRef<number[]>([])

  useEffect(() => {
    if (!wsEnabled) {
      return
    }

    // Uses the community WebSocket proxied through the API Gateway
    const socketUrl = env.communityWsUrl
    const topic = `${env.chatTopicPrefix}/${env.defaultCommunityId}`
    const destination = env.chatDestination.replace(
      '{communityId}',
      String(env.defaultCommunityId),
    )

    const client = createChatClient({
      url: socketUrl,
      topic,
      destination,
      onConnect: () => setConnectionState('online'),
      onDisconnect: () => setConnectionState('offline'),
      onMessage: (body) => {
        const incoming = parseIncomingMessage(body)
        setMessages((current) => [
          ...current,
          { ...incoming, id: createMessageId(), mine: false },
        ])
      },
      onError: () => setConnectionState('offline'),
    })

    clientRef.current = client
    client.connect()

    return () => {
      for (const timeoutId of pendingEchoTimeoutIdsRef.current) {
        clearTimeout(timeoutId)
      }
      pendingEchoTimeoutIdsRef.current = []
      client.disconnect()
      clientRef.current = null
    }
  }, [wsEnabled])

  const sendMessage = useCallback((content: string) => {
    const sanitizedContent = content.trim()
    if (!sanitizedContent) return

    const optimistic: ChatMessage = {
      id: createMessageId(),
      sender: SELF_NAME,
      content: sanitizedContent,
      sentAt: new Date().toISOString(),
      channel: CHAT_CHANNEL,
      mine: true,
    }

    setMessages((current) => [...current, optimistic])

    const socket = clientRef.current
    if (socket?.isConnected()) {
      socket.send({
        sender: optimistic.sender,
        content: optimistic.content,
        sentAt: optimistic.sentAt,
        channel: CHAT_CHANNEL,
      })
      return
    }

    setConnectionState('offline')

    const timeoutId = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          sender: 'FaST Link Bot',
          content: 'Message queued locally — will sync once the connection is restored.',
          sentAt: new Date().toISOString(),
          channel: CHAT_CHANNEL,
          mine: false,
        },
      ])
    }, 700)

    pendingEchoTimeoutIdsRef.current.push(timeoutId)
  }, [])

  return { messages, connectionState, sendMessage }
}
