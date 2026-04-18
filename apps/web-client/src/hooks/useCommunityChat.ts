import { useCallback, useEffect, useMemo, useRef } from 'react'
import { env } from '../config/env'
import { getCommunityMessages } from '../services/social/chatService'
import { createCommunityChatSocket } from '../services/websocket/communityChatSocket'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import type { ChatMessage } from '../types/social'

const createMessageId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const useCommunityChat = (communityId: number) => {
  const socketRef = useRef<ReturnType<typeof createCommunityChatSocket> | null>(null)
  const user = useAuthStore((state) => state.user)
  const messages = useChatStore((state) => state.messagesByCommunity[communityId] ?? [])
  const setMessages = useChatStore((state) => state.setMessages)
  const appendMessage = useChatStore((state) => state.appendMessage)
  const setConnectionStatus = useChatStore((state) => state.setConnectionStatus)
  const setActiveCommunityId = useChatStore((state) => state.setActiveCommunityId)

  useEffect(() => {
    setActiveCommunityId(communityId)
  }, [communityId, setActiveCommunityId])

  useEffect(() => {
    let cancelled = false

    void getCommunityMessages(communityId).then((history) => {
      if (!cancelled) {
        setMessages(communityId, history)
      }
    })

    return () => {
      cancelled = true
    }
  }, [communityId, setMessages])

  useEffect(() => {
    if (!env.enableWebsocket) {
      setConnectionStatus('offline')
      return
    }

    setConnectionStatus('connecting')

    const socket = createCommunityChatSocket({
      url: env.wsUrl,
      topicPrefix: env.chatTopicPrefix,
      destination: env.chatDestination,
      communityId,
      onConnect: () => setConnectionStatus('online'),
      onDisconnect: () => setConnectionStatus('offline'),
      onError: () => setConnectionStatus('offline'),
      onMessage: (message) => {
        appendMessage(communityId, message)
      },
    })

    socketRef.current = socket
    socket.connect()

    return () => {
      socket.disconnect()
      if (socketRef.current === socket) {
        socketRef.current = null
      }
    }
  }, [appendMessage, communityId, setConnectionStatus])

  const sendMessage = useCallback(
    (content: string) => {
      const sanitized = content.trim()
      if (!sanitized || !user) {
        return
      }

      const optimistic: ChatMessage = {
        id: createMessageId(),
        communityId,
        sender: {
          id: user.id,
          fullName: user.fullName,
          headline: user.headline ?? 'FaST Link member',
          avatarUrl: user.avatarUrl,
        },
        content: sanitized,
        createdAt: new Date().toISOString(),
        mine: true,
      }

      appendMessage(communityId, optimistic)

      if (!env.enableWebsocket) {
        return
      }

      const socket = socketRef.current
      if (!socket || !socket.isConnected()) {
        setConnectionStatus('offline')
        return
      }

      socket.send({
        communityId,
        sender: optimistic.sender,
        content: optimistic.content,
        createdAt: optimistic.createdAt,
      })
    },
    [appendMessage, communityId, setConnectionStatus, user],
  )

  const connectionStatus = useChatStore((state) => state.connectionStatus)

  return useMemo(
    () => ({ messages, sendMessage, connectionStatus }),
    [connectionStatus, messages, sendMessage],
  )
}
