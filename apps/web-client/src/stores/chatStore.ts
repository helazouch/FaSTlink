import { create } from 'zustand'
import type { ChatMessage } from '../types/social'

type ChatConnectionStatus = 'connecting' | 'online' | 'offline'

interface ChatStoreState {
  connectionStatus: ChatConnectionStatus
  activeCommunityId: number
  messagesByCommunity: Record<number, ChatMessage[]>
  setConnectionStatus: (status: ChatConnectionStatus) => void
  setActiveCommunityId: (communityId: number) => void
  setMessages: (communityId: number, messages: ChatMessage[]) => void
  appendMessage: (communityId: number, message: ChatMessage) => void
}

export const useChatStore = create<ChatStoreState>((set) => ({
  connectionStatus: 'offline',
  activeCommunityId: 1,
  messagesByCommunity: {},
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
    set((state) => ({
      messagesByCommunity: {
        ...state.messagesByCommunity,
        [communityId]: [...(state.messagesByCommunity[communityId] ?? []), message],
      },
    })),
}))
