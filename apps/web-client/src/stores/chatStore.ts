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
}

export const useChatStore = create<ChatStoreState>((set) => ({
  connectionStatus: 'offline' as ChatConnectionStatus,
  activeCommunityId: null as number | null,
  messagesByCommunity: {} as Record<number, ChatMessage[]>,
  unreadCountByCommunity: {} as Record<number, number>,

  setConnectionStatus: (status: ChatConnectionStatus) =>
    set({ connectionStatus: status }),

  setActiveCommunityId: (communityId: number | null) =>
    set({ activeCommunityId: communityId }),

  setMessages: (communityId: number, messages: ChatMessage[]) =>
    set((state: ChatStoreState) => ({
      messagesByCommunity: {
        ...state.messagesByCommunity,
        [communityId]: messages,
      },
    })),

  appendMessage: (communityId: number, message: ChatMessage) =>
    set((state: ChatStoreState) => {
      const existing = state.messagesByCommunity[communityId] ?? []
      const isActive = state.activeCommunityId === communityId
      const shouldIncrementUnread = !message.mine && !isActive

      return {
        messagesByCommunity: {
          ...state.messagesByCommunity,
          [communityId]: [...existing, message],
        },
        unreadCountByCommunity: shouldIncrementUnread
          ? {
              ...state.unreadCountByCommunity,
              [communityId]: (state.unreadCountByCommunity[communityId] ?? 0) + 1,
            }
          : state.unreadCountByCommunity,
      }
    }),

  resetUnread: (communityId: number) =>
    set((state: ChatStoreState) => ({
      unreadCountByCommunity: {
        ...state.unreadCountByCommunity,
        [communityId]: 0,
      },
    })),
}))
