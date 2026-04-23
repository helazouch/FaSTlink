import { httpClient } from './api/httpClient'

interface EntityDirectoryDto {
  id: number
  nom: string
}

interface UserDirectoryDto {
  id: number
  nomComplet: string
  email: string
}

const entityNameCache = new Map<number, string>()
const userNameCache = new Map<number, string>()

export const hydrateEntityDirectory = async (
  utilisateurId?: number | null,
): Promise<Map<number, string>> => {
  const response = await httpClient.get<EntityDirectoryDto[]>('/v1/entities', {
    params: {
      utilisateurId: utilisateurId ?? undefined,
    },
  })

  response.data.forEach((entity) => {
    entityNameCache.set(entity.id, entity.nom)
  })

  return new Map(entityNameCache)
}

export const hydrateUserDirectory = async (ids: number[]): Promise<Map<number, string>> => {
  const normalizedIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id) && id > 0)))

  if (normalizedIds.length === 0) {
    return new Map(userNameCache)
  }

  const missingIds = normalizedIds.filter((id) => !userNameCache.has(id))

  if (missingIds.length > 0) {
    const response = await httpClient.get<UserDirectoryDto[]>('/v1/users/directory', {
      params: {
        ids: missingIds,
      },
      paramsSerializer: {
        indexes: null,
      },
    })

    response.data.forEach((user) => {
      userNameCache.set(user.id, user.nomComplet)
    })
  }

  return new Map(userNameCache)
}

export const getEntityName = (entityId: number, fallback?: string): string =>
  entityNameCache.get(entityId) ?? fallback ?? `Entity #${entityId}`

export const getUserName = (userId: number, fallback?: string): string =>
  userNameCache.get(userId) ?? fallback ?? `User #${userId}`
