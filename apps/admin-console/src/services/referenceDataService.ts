import { asArray, asObject, toNumber, toStringValue } from '../lib/parse'
import { httpClient } from './api/httpClient'

interface EntityDirectoryEntry {
  id: number
  name: string
}

interface UserDirectoryEntry {
  id: number
  name: string
  email: string
}

const entityCache = new Map<number, EntityDirectoryEntry>()
const userCache = new Map<number, UserDirectoryEntry>()

export const hydrateEntityDirectory = async (): Promise<Map<number, EntityDirectoryEntry>> => {
  const response = await httpClient.get<unknown>('/v1/entities')

  asArray(response.data).forEach((item) => {
    const payload = asObject(item)
    const id = toNumber(payload.id)

    if (id > 0) {
      entityCache.set(id, {
        id,
        name: toStringValue(payload.nom || payload.name, `Entity #${id}`),
      })
    }
  })

  return new Map(entityCache)
}

export const hydrateUserDirectory = async (ids: number[]): Promise<Map<number, UserDirectoryEntry>> => {
  const normalizedIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id) && id > 0)))
  const missingIds = normalizedIds.filter((id) => !userCache.has(id))

  if (missingIds.length > 0) {
    const response = await httpClient.get<unknown>('/v1/users/directory', {
      params: { ids: missingIds },
      paramsSerializer: { indexes: null },
    })

    asArray(response.data).forEach((item) => {
      const payload = asObject(item)
      const id = toNumber(payload.id)

      if (id > 0) {
        userCache.set(id, {
          id,
          name: toStringValue(payload.nomComplet || payload.fullName || payload.name, `User #${id}`),
          email: toStringValue(payload.email, ''),
        })
      }
    })
  }

  return new Map(userCache)
}

export const getEntityName = (entityId: number): string => entityCache.get(entityId)?.name ?? `Entity #${entityId}`

export const getUserName = (userId: number): string => userCache.get(userId)?.name ?? `User #${userId}`

export const getUserEmail = (userId: number): string | null => userCache.get(userId)?.email || null
