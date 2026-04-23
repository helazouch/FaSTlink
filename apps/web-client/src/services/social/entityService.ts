import { mockCommunities } from '../../data/socialMockData'
import { hydrateEntityDirectory } from '../referenceDataService'
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

export const getRequestEntities = async (userId: number): Promise<CommunitySummary[]> =>
  withFallback(
    async () => {
      const directory = await hydrateEntityDirectory(userId)
      const mapped = Array.from(directory.entries()).map(([id, nom]) =>
        mapEntity({ id, nom, description: entitiesCache.find((item) => item.id === id)?.description ?? null }),
      )

      if (mapped.length > 0) {
        entitiesCache = mapped
      }

      return entitiesCache
    },
    () => entitiesCache,
  )
