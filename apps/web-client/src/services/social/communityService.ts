import { httpClient } from '../api/httpClient'
import type { CommunitySummary } from '../../types/social'

interface CommunityDto {
  id: number
  nom: string
  description: string
  createurUtilisateurId: number
  memberCount?: number
  nombreMembres?: number
}

const mapCommunity = (payload: CommunityDto): CommunitySummary => ({
  id: payload.id,
  name: payload.nom,
  description: payload.description,
  members: payload.memberCount ?? payload.nombreMembres ?? 0,
})

export const getSuggestedCommunities = async (): Promise<CommunitySummary[]> => {
  const response = await httpClient.get<CommunityDto[]>('/v1/communities')
  return response.data.map(mapCommunity)
}

export const getCommunityById = async (communityId: number): Promise<CommunitySummary> => {
  const response = await httpClient.get<CommunityDto>(`/v1/communities/${communityId}`)
  return mapCommunity(response.data)
}
