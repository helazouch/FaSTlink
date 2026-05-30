import { create } from 'zustand'
import type { ChatMessage } from '../types/social'

type ChatConnectionStatus = 'connecting' | 'online' | 'offline'

export interface ChatStoreState {
  connectionStatus: ChatConnectionStatus
  activeCommunityId: number | null
  messagesByCommunity: Record<number, ChatMessage[]>
  unreadCountByCommunity: Record<number, number>
  setConnectionStatus: (status: ChatConnectionStatus) => void
  setActiveCommunityId: (communityId: number | null) => void
  setMessages: (communityId: number, messages: ChatMessage[]) => void
  appendMessage: (communityId: number, message: ChatMessage) => void
  resetUnread: (communityId: number) => void
  resetStore: () => void
}

export const useChatStore = create<ChatStoreState>((set) => ({
  connectionStatus: 'offline',
  activeCommunityId: null,
  messagesByCommunity: {},
  unreadCountByCommunity: {},
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setActiveCommunityId: (communityId) => set({ activeCommunityId: communityId }),
  setMessages: (communityId, messages) =>
    set((state) => ({
      messagesByCommunity: {
        ...state.messagesByCommunity,
        [communityId]: messages,
      },
    })),
  appendMessage: (communityId, message) =>
    set((state) => {
      const existing = state.messagesByCommunity[communityId] ?? []

      // Prevent duplicate append of identical message IDs (e.g. from websocket double event)
      if (existing.some((m) => m.id === message.id)) {
        return {}
      }

      const isActive = state.activeCommunityId === communityId
      const shouldIncrementUnread = !message.mine && !isActive

      const newMessages = [...existing]
      const isRealMessage = !message.id.includes('-') // Real DB IDs are auto-incremented integers, so no hyphens

      if (isRealMessage) {
        // Find if there is an optimistic message with same content and sender ID
        const optIndex = newMessages.findIndex(
          (m) => m.id.includes('-') && m.sender.id === message.sender.id && m.content === message.content
        )
        if (optIndex !== -1) {
          // Replace the optimistic message with the real one
          newMessages[optIndex] = message
        } else {
          newMessages.push(message)
        }
      } else {
        newMessages.push(message)
      }

      return {
        messagesByCommunity: {
          ...state.messagesByCommunity,
          [communityId]: newMessages,
        },
        unreadCountByCommunity: shouldIncrementUnread
          ? {
              ...state.unreadCountByCommunity,
              [communityId]: (state.unreadCountByCommunity[communityId] ?? 0) + 1,
            }
          : state.unreadCountByCommunity,
      }
    }),
  resetUnread: (communityId) =>
    set((state) => ({
      unreadCountByCommunity: {
        ...state.unreadCountByCommunity,
        [communityId]: 0,
      },
    })),
  resetStore: () =>
    set(() => ({
      connectionStatus: 'offline',
      activeCommunityId: null,
      messagesByCommunity: {},
      unreadCountByCommunity: {},
    })),
}))
