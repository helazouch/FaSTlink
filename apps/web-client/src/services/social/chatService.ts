import { mockChatMessages } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type { ChatMessage } from '../../types/social'

interface ChatMessageDto {
  id?: string | number
  communityId: number
  sender: {
    id: number
    fullName?: string
    nomComplet?: string
    headline?: string
  }
  content: string
  createdAt: string
}

const mapMessage = (payload: ChatMessageDto): ChatMessage => ({
  id: String(payload.id ?? `${payload.communityId}-${payload.createdAt}`),
  communityId: payload.communityId,
  sender: {
    id: payload.sender.id,
    fullName: payload.sender.fullName ?? payload.sender.nomComplet ?? 'FaST Link Member',
    headline: payload.sender.headline ?? 'Community member',
  },
  content: payload.content,
  createdAt: payload.createdAt,
  mine: false,
})

export const getCommunityMessages = async (communityId: number): Promise<ChatMessage[]> =>
  withFallback(
    async () => {
      const response = await httpClient.get<ChatMessageDto[]>(
        `/v1/communities/${communityId}/messages`,
      )

      return response.data.map(mapMessage)
    },
    () =>
      mockChatMessages.filter((item) => item.communityId === communityId || communityId === 1),
  )
