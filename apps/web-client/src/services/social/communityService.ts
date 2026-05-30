import { mockCommunities } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
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

let communitiesCache: CommunitySummary[] = [...mockCommunities]

const mapCommunity = (payload: CommunityDto): CommunitySummary => ({
  id: payload.id,
  name: payload.nom,
  description: payload.description,
  members: communitiesCache.find((item) => item.id === payload.id)?.members ?? 0,
  coverUrl: communitiesCache.find((item) => item.id === payload.id)?.coverUrl,
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

export const getMyCommunities = async (userId: number): Promise<MyCommunity[]> =>
  withFallback(
    async () => {
      const response = await httpClient.get<MyCommunityDto[]>('/v1/communities', {
        params: { utilisateurId: userId },
      })
      return response.data.map(mapMyCommunity)
    },
    () =>
      communitiesCache.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        creatorUserId: 0,
        role: 'MEMBER' as const,
        createdAt: new Date().toISOString(),
      })),
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
