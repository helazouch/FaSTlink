import { httpClient } from './api/httpClient'

export type BureauEntityRole = 'SIMPLE_MEMBER' | 'BUREAU_MEMBER'
export type CommunityRole = 'ADMIN' | 'MEMBER'

interface UserDirectoryDto {
  id: number
  nomComplet: string
  email: string
}

interface EntityMemberDto {
  id: number
  entityId?: number
  entiteId?: number
  userId?: number
  utilisateurId?: number
  role: string
  status?: string
  assignedAt?: string
  createdAt?: string
  updatedAt?: string
}

interface CommunityDto {
  id: number
  nom: string
  description: string | null
  entiteId: number
  createurUtilisateurId: number
  createdAt: string
  updatedAt: string
}

interface CommunityMemberDto {
  id: number
  communauteId: number
  utilisateurId: number
  role: CommunityRole
  createdAt: string
  updatedAt: string
}

export interface BureauEntityMember {
  id: number
  entityId: number
  userId: number
  name: string
  email: string | null
  role: string
  status: string | null
  assignedAt: string | null
  updatedAt: string | null
}

export interface BureauCommunity {
  id: number
  name: string
  description: string | null
  entityId: number
  creatorUserId: number
  createdAt: string
  updatedAt: string
}

export interface BureauCommunityMember {
  id: number
  communityId: number
  userId: number
  name: string
  email: string | null
  role: CommunityRole
  createdAt: string
  updatedAt: string
}

const hydrateUsers = async (ids: number[]): Promise<Map<number, UserDirectoryDto>> => {
  const normalizedIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id) && id > 0)))
  if (normalizedIds.length === 0) {
    return new Map()
  }

  const response = await httpClient.get<UserDirectoryDto[]>('/v1/users/directory', {
    params: { ids: normalizedIds },
    paramsSerializer: { indexes: null },
  })

  return new Map(response.data.map((user) => [user.id, user]))
}

const mapEntityMember = (payload: EntityMemberDto, users: Map<number, UserDirectoryDto>): BureauEntityMember => {
  const userId = Number(payload.userId ?? payload.utilisateurId ?? 0)
  const entityId = Number(payload.entityId ?? payload.entiteId ?? 0)
  const user = users.get(userId)

  return {
    id: Number(payload.id),
    entityId,
    userId,
    name: user?.nomComplet ?? `User #${userId}`,
    email: user?.email ?? null,
    role: payload.role,
    status: payload.status ?? null,
    assignedAt: payload.assignedAt ?? payload.createdAt ?? null,
    updatedAt: payload.updatedAt ?? null,
  }
}

const mapCommunity = (payload: CommunityDto): BureauCommunity => ({
  id: payload.id,
  name: payload.nom,
  description: payload.description,
  entityId: payload.entiteId,
  creatorUserId: payload.createurUtilisateurId,
  createdAt: payload.createdAt,
  updatedAt: payload.updatedAt,
})

const mapCommunityMember = (
  payload: CommunityMemberDto,
  users: Map<number, UserDirectoryDto>,
): BureauCommunityMember => {
  const user = users.get(payload.utilisateurId)

  return {
    id: payload.id,
    communityId: payload.communauteId,
    userId: payload.utilisateurId,
    name: user?.nomComplet ?? `User #${payload.utilisateurId}`,
    email: user?.email ?? null,
    role: payload.role,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  }
}

export const listBureauEntityMembers = async (entityId: number): Promise<BureauEntityMember[]> => {
  const response = await httpClient.get<EntityMemberDto[]>(`/v1/entities/${entityId}/members`)
  const users = await hydrateUsers(response.data.map((member) => Number(member.userId ?? member.utilisateurId ?? 0)))
  return response.data.map((member) => mapEntityMember(member, users))
}

export const addBureauEntityMember = async (
  entityId: number,
  userId: number,
  role: BureauEntityRole,
): Promise<BureauEntityMember> => {
  const response = await httpClient.post<EntityMemberDto>(`/v1/entities/${entityId}/members`, {
    utilisateurId: userId,
    role,
  })
  const users = await hydrateUsers([userId])
  return mapEntityMember(response.data, users)
}

export const updateBureauEntityMemberRole = async (
  entityId: number,
  userId: number,
  role: BureauEntityRole,
): Promise<BureauEntityMember> => {
  const response = await httpClient.patch<EntityMemberDto>(`/v1/entities/${entityId}/members/${userId}`, { role })
  const users = await hydrateUsers([userId])
  return mapEntityMember(response.data, users)
}

export const revokeBureauEntityMember = async (entityId: number, userId: number): Promise<void> => {
  await httpClient.delete(`/v1/entities/${entityId}/members/${userId}`)
}

export const listBureauCommunities = async (entityId: number): Promise<BureauCommunity[]> => {
  const response = await httpClient.get<CommunityDto[]>('/v1/communities', {
    params: { entityId },
  })
  return response.data.map(mapCommunity)
}

export const createBureauCommunity = async (
  entityId: number,
  actorUserId: number,
  payload: { name: string; description: string },
): Promise<BureauCommunity> => {
  const response = await httpClient.post<CommunityDto>('/v1/communities', {
    utilisateurId: actorUserId,
    entiteId: entityId,
    nom: payload.name,
    description: payload.description,
  }, {
    params: { entityId },
  })
  return mapCommunity(response.data)
}

export const updateBureauCommunity = async (
  communityId: number,
  entityId: number,
  actorUserId: number,
  payload: { name: string; description: string },
): Promise<BureauCommunity> => {
  const response = await httpClient.put<CommunityDto>(`/v1/communities/${communityId}`, {
    utilisateurId: actorUserId,
    nom: payload.name,
    description: payload.description,
  }, {
    params: { entityId },
  })
  return mapCommunity(response.data)
}

export const deleteBureauCommunity = async (communityId: number, entityId: number, actorUserId: number): Promise<void> => {
  await httpClient.delete(`/v1/communities/${communityId}`, {
    params: { utilisateurId: actorUserId, entityId },
  })
}

export const listBureauCommunityMembers = async (communityId: number): Promise<BureauCommunityMember[]> => {
  const response = await httpClient.get<CommunityMemberDto[]>(`/v1/communities/${communityId}/members`)
  const users = await hydrateUsers(response.data.map((member) => member.utilisateurId))
  return response.data.map((member) => mapCommunityMember(member, users))
}

export const addBureauCommunityMember = async (
  communityId: number,
  entityId: number,
  actorUserId: number,
  userId: number,
): Promise<BureauCommunityMember> => {
  const response = await httpClient.post<CommunityMemberDto>(`/v1/communities/${communityId}/members`, {
    acteurUtilisateurId: actorUserId,
    utilisateurId: userId,
    role: 'MEMBER',
  }, {
    params: { entityId },
  })
  const users = await hydrateUsers([userId])
  return mapCommunityMember(response.data, users)
}

export const removeBureauCommunityMember = async (
  communityId: number,
  entityId: number,
  actorUserId: number,
  userId: number,
): Promise<void> => {
  await httpClient.delete(`/v1/communities/${communityId}/members/${userId}`, {
    params: { acteurUtilisateurId: actorUserId, entityId },
  })
}
