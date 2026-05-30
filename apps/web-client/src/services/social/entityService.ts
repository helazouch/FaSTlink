import { hydrateEntityDirectory } from '../referenceDataService'
import type { CommunitySummary } from '../../types/social'

interface EntityDto {
  id: number
  nom: string
  description: string | null
}

const mapEntity = (payload: EntityDto): CommunitySummary => ({
  id: payload.id,
  name: payload.nom,
  description: payload.description ?? '',
})

export const getRequestEntities = async (userId: number): Promise<CommunitySummary[]> => {
  const directory = await hydrateEntityDirectory(userId)
  return Array.from(directory.entries()).map(([id, nom]) =>
    mapEntity({ id, nom, description: null }),
  )
}
