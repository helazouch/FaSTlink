import { useCallback, useEffect, useRef, useState } from 'react'
import { mockChatMessages } from '../data/mockData'
import { createChatClient } from '../services/websocket/chatClient'
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
  const wsEnabled = (import.meta.env.VITE_ENABLE_CHAT_WS ?? 'true') !== 'false'
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    wsEnabled ? 'connecting' : 'offline',
  )
  const clientRef = useRef<ReturnType<typeof createChatClient> | null>(null)
  const pendingEchoTimeoutIdsRef = useRef<number[]>([])

  useEffect(() => {
    if (!wsEnabled) {
      return
    }

    const socketUrl = import.meta.env.VITE_WS_URL ?? '/ws-community'
    const topic = import.meta.env.VITE_CHAT_TOPIC ?? '/topic/chat.general'
    const destination = import.meta.env.VITE_CHAT_DESTINATION ?? '/app/chat.send'

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
          {
            ...incoming,
            id: createMessageId(),
            mine: false,
          },
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
    if (!sanitizedContent) {
      return
    }

    const optimisticMessage: ChatMessage = {
      id: createMessageId(),
      sender: SELF_NAME,
      content: sanitizedContent,
      sentAt: new Date().toISOString(),
      channel: CHAT_CHANNEL,
      mine: true,
    }

    setMessages((current) => [...current, optimisticMessage])

    const socket = clientRef.current
    if (socket?.isConnected()) {
      socket.send({
        sender: optimisticMessage.sender,
        content: optimisticMessage.content,
        sentAt: optimisticMessage.sentAt,
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
          sender: 'FastLink Bot',
          content: 'Message queued locally. It will synchronize once the websocket reconnects.',
          sentAt: new Date().toISOString(),
          channel: CHAT_CHANNEL,
          mine: false,
        },
      ])
    }, 700)

    pendingEchoTimeoutIdsRef.current.push(timeoutId)
  }, [])

  return {
    messages,
    connectionState,
    sendMessage,
  }
}
