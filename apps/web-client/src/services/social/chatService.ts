import { mockChatMessages } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type { ChatMessage } from '../../types/social'

interface ChatMessageDto {
  id: string | number
  communauteId: number
  utilisateurId: number
  senderName: string | null
  contenu: string
  createdAt: string
}

const mapMessage = (payload: ChatMessageDto, userId: number): ChatMessage => ({
  id: String(payload.id),
  communityId: payload.communauteId,
  sender: {
    id: payload.utilisateurId,
    fullName: payload.senderName ?? `User #${payload.utilisateurId}`,
    headline: 'Community member',
  },
  content: payload.contenu,
  createdAt: payload.createdAt,
  mine: payload.utilisateurId === userId,
})

export const getCommunityMessages = async (
  communityId: number,
  userId: number,
): Promise<ChatMessage[]> =>
  withFallback(
    async () => {
      const response = await httpClient.get<ChatMessageDto[]>(
        `/v1/communities/${communityId}/messages`,
        {
          params: {
            utilisateurId: userId,
          },
        },
      )

      return response.data.map((item: ChatMessageDto) => mapMessage(item, userId))
    },
    () =>
      mockChatMessages.filter((item) => item.communityId === communityId || communityId === 1),
  )
