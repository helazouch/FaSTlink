import { mockCommunities } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type { CommunitySummary } from '../../types/social'

interface CommunityDto {
  id: number
  name: string
  description: string
  members: number
  coverUrl?: string
}

const communitiesCache: CommunitySummary[] = [...mockCommunities]

const mapCommunity = (payload: CommunityDto): CommunitySummary => ({
  id: payload.id,
  name: payload.name,
  description: payload.description,
  members: payload.members,
  coverUrl: payload.coverUrl,
})

export const getSuggestedCommunities = async (): Promise<CommunitySummary[]> =>
  withFallback(
    async () => {
      const response = await httpClient.get<CommunityDto[]>('/v1/communities/suggested')
      return response.data.map(mapCommunity)
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
