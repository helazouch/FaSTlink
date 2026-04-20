import { mockCommunities } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type { CommunitySummary } from '../../types/social'

interface EntityDto {
  id: number
  nom: string
  description: string | null
}

let entitiesCache: CommunitySummary[] = mockCommunities.map((community) => ({
  ...community,
  name: community.name,
}))

const mapEntity = (payload: EntityDto): CommunitySummary => ({
  id: payload.id,
  name: payload.nom,
  description: payload.description ?? 'FastLink entity',
  members: entitiesCache.find((item) => item.id === payload.id)?.members ?? 0,
})

export const getRequestEntities = async (): Promise<CommunitySummary[]> =>
  withFallback(
    async () => {
      const response = await httpClient.get<EntityDto[]>('/v1/entities')
      const mapped = response.data.map(mapEntity)

      if (mapped.length > 0) {
        entitiesCache = mapped
      }

      return entitiesCache
    },
    () => entitiesCache,
  )
