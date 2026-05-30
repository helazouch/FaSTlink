import { httpClient } from '../api/httpClient'
import type { CommunitySummary, MyCommunity } from '../../types/social'

interface CommunityDto {
  id: number
  nom: string
  description: string
  createurUtilisateurId: number
}

interface MyCommunityDto {
  id: number
  nom: string
  description: string
  createurUtilisateurId: number
  role: 'ADMIN' | 'MEMBER'
  createdAt: string
  lastMessageContent: string | null
  lastMessageAt: string | null
}

const mapCommunity = (payload: CommunityDto): CommunitySummary => ({
  id: payload.id,
  name: payload.nom,
  description: payload.description ?? '',
})

const mapMyCommunity = (payload: MyCommunityDto): MyCommunity => ({
  id: payload.id,
  name: payload.nom,
  description: payload.description ?? '',
  creatorUserId: payload.createurUtilisateurId,
  role: payload.role,
  createdAt: payload.createdAt,
  lastMessageContent: payload.lastMessageContent ?? undefined,
  lastMessageAt: payload.lastMessageAt ?? undefined,
})

export const getSuggestedCommunities = async (): Promise<CommunitySummary[]> => {
  const response = await httpClient.get<CommunityDto[]>('/v1/communities')
  return response.data.map(mapCommunity)
}

export const getMyCommunities = async (userId: number): Promise<MyCommunity[]> => {
  const response = await httpClient.get<MyCommunityDto[]>('/v1/communities', {
    params: { utilisateurId: userId },
  })
  return response.data.map(mapMyCommunity)
}

export const getCommunityById = async (communityId: number): Promise<CommunitySummary> => {
  const response = await httpClient.get<CommunityDto>(`/v1/communities/${communityId}`)
  return mapCommunity(response.data)
}
