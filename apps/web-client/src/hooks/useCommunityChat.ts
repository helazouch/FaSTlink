import { useCallback, useEffect, useMemo, useRef } from 'react'
import { env } from '../config/env'
import { getCommunityMessages } from '../services/social/chatService'
import { createCommunityChatSocket } from '../services/websocket/communityChatSocket'
import { useAuthStore } from '../stores/authStore'
import type { AuthStoreState } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import type { ChatStoreState } from '../stores/chatStore'
import type { ChatMessage } from '../types/social'

const createMessageId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const selectUser = (state: AuthStoreState) => state.user
const selectMessagesByCommunity = (state: ChatStoreState) => state.messagesByCommunity
const selectSetMessages = (state: ChatStoreState) => state.setMessages
const selectAppendMessage = (state: ChatStoreState) => state.appendMessage
const selectSetConnectionStatus = (state: ChatStoreState) => state.setConnectionStatus
const selectSetActiveCommunityId = (state: ChatStoreState) => state.setActiveCommunityId
const selectResetUnread = (state: ChatStoreState) => state.resetUnread
const selectConnectionStatus = (state: ChatStoreState) => state.connectionStatus

export const useCommunityChat = (communityId: number) => {
  const socketRef = useRef<ReturnType<typeof createCommunityChatSocket> | null>(null)

  const user = useAuthStore(selectUser)
  const messagesByCommunity = useChatStore(selectMessagesByCommunity)
  const messages = messagesByCommunity[communityId] ?? []
  const setMessages = useChatStore(selectSetMessages)
  const appendMessage = useChatStore(selectAppendMessage)
  const setConnectionStatus = useChatStore(selectSetConnectionStatus)
  const setActiveCommunityId = useChatStore(selectSetActiveCommunityId)
  const resetUnread = useChatStore(selectResetUnread)
  const connectionStatus = useChatStore(selectConnectionStatus)

  useEffect(() => {
    setActiveCommunityId(communityId)
    resetUnread(communityId)
    return () => {
      setActiveCommunityId(null)
    }
  }, [communityId, setActiveCommunityId, resetUnread])

  useEffect(() => {
    let cancelled = false

    if (!user) {
      setMessages(communityId, [])
      return () => {
        cancelled = true
      }
    }

    void getCommunityMessages(communityId, user.id).then((history) => {
      if (!cancelled) {
        setMessages(communityId, history)
        resetUnread(communityId)
      }
    })

    return () => {
      cancelled = true
    }
  }, [communityId, setMessages, resetUnread, user])

  useEffect(() => {
    if (!env.enableWebsocket) {
      setConnectionStatus('offline')
      return
    }

    setConnectionStatus('connecting')

    const socket = createCommunityChatSocket({
      url: env.communityWsUrl,
      topicPrefix: env.chatTopicPrefix,
      destination: env.chatDestination,
      communityId,
      currentUserId: user?.id,
      onConnect: () => setConnectionStatus('online'),
      onDisconnect: () => setConnectionStatus('offline'),
      onError: () => setConnectionStatus('offline'),
      onMessage: (message: ChatMessage) => {
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
  }, [appendMessage, communityId, setConnectionStatus, user?.id])

  const sendMessage = useCallback(
    (content: string) => {
      const sanitized = content.trim()
      if (!sanitized || !user) return

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

      if (!env.enableWebsocket) return

      const socket = socketRef.current
      if (!socket || !socket.isConnected()) {
        setConnectionStatus('offline')
        return
      }

      socket.send({
        utilisateurId: user.id,
        senderName: user.fullName,
        contenu: optimistic.content,
      })
    },
    [appendMessage, communityId, setConnectionStatus, user],
  )

  return useMemo(
    () => ({ messages, sendMessage, connectionStatus }),
    [connectionStatus, messages, sendMessage],
  )
}
