import { mockCommunities } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type { CommunitySummary } from '../../types/social'

interface CommunityDto {
  id: number
  nom: string
  description: string
  createurUtilisateurId: number
}

let communitiesCache: CommunitySummary[] = [...mockCommunities]

const mapCommunity = (payload: CommunityDto): CommunitySummary => ({
  id: payload.id,
  name: payload.nom,
  description: payload.description,
  members: communitiesCache.find((item) => item.id === payload.id)?.members ?? 0,
  coverUrl: communitiesCache.find((item) => item.id === payload.id)?.coverUrl,
})

export const getSuggestedCommunities = async (): Promise<CommunitySummary[]> =>
  withFallback(
    async () => {
      const response = await httpClient.get<CommunityDto[]>('/v1/communities')
      const mapped = response.data.map(mapCommunity)

      if (mapped.length > 0) {
        communitiesCache = mapped
      }

      return communitiesCache
    },
    () => communitiesCache,
  )

export const getCommunityById = async (communityId: number): Promise<CommunitySummary> =>
  withFallback(
    async () => {
      const response = await httpClient.get<CommunityDto>(`/v1/communities/${communityId}`)
      return mapCommunity(response.data)
    },
    () => {
      const community = communitiesCache.find((item) => item.id === communityId)
      if (!community) {
        throw new Error('Community not found')
      }

      return community
    },
  )
