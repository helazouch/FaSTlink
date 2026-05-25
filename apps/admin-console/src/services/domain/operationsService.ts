import { normalizePagedResult } from '../../lib/paged'
import { asArray, asObject, toBoolean, toNumber, toStringValue } from '../../lib/parse'
import type {
  CommunityMember,
  CommunityMessage,
  EntityMember,
  EntityRecord,
  EventRecord,
  PagedResult,
  PublicationRecord,
  RequestRecord,
  Room,
} from '../../types/domain'
import { httpClient } from '../api/httpClient'

const mapEntityMember = (item: unknown): EntityMember => {
  const payload = asObject(item)
  return {
    id: toNumber(payload.id),
    entiteId: toNumber(payload.entiteId),
    utilisateurId: toNumber(payload.utilisateurId),
    role: toStringValue(payload.role),
    createdAt: toStringValue(payload.createdAt),
    updatedAt: toStringValue(payload.updatedAt),
  }
}

const mapEntity = (item: unknown): EntityRecord => {
  const payload = asObject(item)
  return {
    id: toNumber(payload.id),
    nom: toStringValue(payload.nom),
    description: toStringValue(payload.description, '') || null,
    createdAt: toStringValue(payload.createdAt),
    updatedAt: toStringValue(payload.updatedAt),
  }
}

const mapCommunityMember = (item: unknown): CommunityMember => {
  const payload = asObject(item)
  return {
    id: toNumber(payload.id),
    communauteId: toNumber(payload.communauteId),
    utilisateurId: toNumber(payload.utilisateurId),
    role: toStringValue(payload.role),
    createdAt: toStringValue(payload.createdAt),
    updatedAt: toStringValue(payload.updatedAt),
  }
}

const mapCommunityMessage = (item: unknown): CommunityMessage => {
  const payload = asObject(item)
  return {
    id: toNumber(payload.id),
    communauteId: toNumber(payload.communauteId),
    utilisateurId: toNumber(payload.utilisateurId),
    contenu: toStringValue(payload.contenu),
    createdAt: toStringValue(payload.createdAt),
  }
}

const mapRoom = (item: unknown): Room => {
  const payload = asObject(item)
  return {
    id: toNumber(payload.id),
    entiteId: toNumber(payload.entiteId),
    nom: toStringValue(payload.nom),
    capacite: toNumber(payload.capacite),
    localisation: toStringValue(payload.localisation, '') || null,
    active: toBoolean(payload.active),
    createdAt: toStringValue(payload.createdAt),
    updatedAt: toStringValue(payload.updatedAt),
  }
}

const mapPublication = (item: unknown): PublicationRecord => {
  const payload = asObject(item)
  return {
    id: toNumber(payload.id),
    utilisateurId: toNumber(payload.utilisateurId),
    contenu: toStringValue(payload.contenu),
    entiteIds: asArray<number>(payload.entiteIds),
    createdAt: toStringValue(payload.createdAt),
    updatedAt: toStringValue(payload.updatedAt),
  }
}

const mapEvent = (item: unknown): EventRecord => {
  const payload = asObject(item)
  return {
    id: toNumber(payload.id),
    entiteId: toNumber(payload.entiteId),
    createurUtilisateurId: toNumber(payload.createurUtilisateurId),
    titre: toStringValue(payload.titre),
    description: toStringValue(payload.description, '') || null,
    lieu: toStringValue(payload.lieu, '') || null,
    debutAt: toStringValue(payload.debutAt),
    finAt: toStringValue(payload.finAt),
    createdAt: toStringValue(payload.createdAt),
    updatedAt: toStringValue(payload.updatedAt),
  }
}

const mapRequest = (item: unknown): RequestRecord => {
  const payload = asObject(item)
  return {
    id: toNumber(payload.id),
    entiteId: toNumber(payload.entiteId),
    demandeurUtilisateurId: toNumber(payload.demandeurUtilisateurId),
    objet: toStringValue(payload.objet),
    description: toStringValue(payload.description, '') || null,
    status: toStringValue(payload.status) as RequestRecord['status'],
    decisionCommentaire: toStringValue(payload.decisionCommentaire, '') || null,
    decideurUtilisateurId: payload.decideurUtilisateurId == null ? null : toNumber(payload.decideurUtilisateurId),
    submittedAt: toStringValue(payload.submittedAt, '') || null,
    decisionAt: toStringValue(payload.decisionAt, '') || null,
    createdAt: toStringValue(payload.createdAt),
    updatedAt: toStringValue(payload.updatedAt),
  }
}

export const listEntities = async (): Promise<EntityRecord[]> => {
  const response = await httpClient.get<unknown>('/v1/entities')
  return asArray(response.data).map(mapEntity)
}

export const listEntityMembers = async (entiteId: number): Promise<EntityMember[]> => {
  const response = await httpClient.get<unknown>(`/v1/entities/${entiteId}/members`)
  return asArray(response.data).map(mapEntityMember)
}

export const assignEntityMember = async (
  entiteId: number,
  utilisateurId: number,
  role: string,
): Promise<EntityMember> => {
  const response = await httpClient.post<unknown>(`/v1/entities/${entiteId}/members`, {
    utilisateurId,
    role,
  })

  return mapEntityMember(response.data)
}

export const createEntity = async (payload: { nom: string; description: string }): Promise<EntityRecord> => {
  const response = await httpClient.post<unknown>('/v1/entities', payload)
  return mapEntity(response.data)
}

export const updateEntity = async (
  entiteId: number,
  payload: { nom: string; description: string },
): Promise<void> => {
  await httpClient.put(`/v1/entities/${entiteId}`, payload)
}

export const deleteEntity = async (entiteId: number): Promise<void> => {
  await httpClient.delete(`/v1/entities/${entiteId}`)
}

export const listPublications = async (query: {
  page: number
  pageSize: number
  search: string
}): Promise<PagedResult<PublicationRecord>> => {
  const response = await httpClient.get<unknown>('/v1/publications', {
    params: {
      page: query.page,
      size: query.pageSize,
      search: query.search || undefined,
    },
  })

  return normalizePagedResult<unknown, PublicationRecord>(response.data, query.page, query.pageSize, mapPublication)
}

export const createPublication = async (payload: {
  utilisateurId: number
  entiteIds: number[]
  contenu: string
}): Promise<PublicationRecord> => {
  const response = await httpClient.post<unknown>('/v1/publications', payload)
  return mapPublication(response.data)
}

export const listEvents = async (query: {
  page: number
  pageSize: number
  search: string
}): Promise<PagedResult<EventRecord>> => {
  const response = await httpClient.get<unknown>('/v1/events', {
    params: {
      page: query.page,
      size: query.pageSize,
      search: query.search || undefined,
    },
  })

  return normalizePagedResult<unknown, EventRecord>(response.data, query.page, query.pageSize, mapEvent)
}

export const createEvent = async (payload: {
  utilisateurId: number
  entiteId: number
  titre: string
  description: string
  lieu: string
  debutAt: string
  finAt: string
}): Promise<EventRecord> => {
  const response = await httpClient.post<unknown>('/v1/events', payload)
  return mapEvent(response.data)
}

export const createCommunity = async (payload: {
  utilisateurId: number
  nom: string
  description: string
}): Promise<void> => {
  await httpClient.post('/v1/communities', payload)
}

export const updateCommunity = async (
  communauteId: number,
  payload: {
    utilisateurId: number
    nom: string
    description: string
  },
): Promise<void> => {
  await httpClient.put(`/v1/communities/${communauteId}`, payload)
}

export const deleteCommunity = async (communauteId: number, utilisateurId: number): Promise<void> => {
  await httpClient.delete(`/v1/communities/${communauteId}`, {
    params: { utilisateurId },
  })
}

export const listCommunityMembers = async (communauteId: number): Promise<CommunityMember[]> => {
  const response = await httpClient.get<unknown>(`/v1/communities/${communauteId}/members`)
  return asArray(response.data).map(mapCommunityMember)
}

export const addCommunityMember = async (
  communauteId: number,
  acteurUtilisateurId: number,
  utilisateurId: number,
  role: 'ADMIN' | 'MEMBER',
): Promise<CommunityMember> => {
  const response = await httpClient.post<unknown>(`/v1/communities/${communauteId}/members`, {
    acteurUtilisateurId,
    utilisateurId,
    role,
  })

  return mapCommunityMember(response.data)
}

export const removeCommunityMember = async (
  communauteId: number,
  utilisateurId: number,
  acteurUtilisateurId: number,
): Promise<void> => {
  await httpClient.delete(`/v1/communities/${communauteId}/members/${utilisateurId}`, {
    params: { acteurUtilisateurId },
  })
}

export const listCommunityMessages = async (
  communauteId: number,
  utilisateurId: number,
): Promise<CommunityMessage[]> => {
  const response = await httpClient.get<unknown>(`/v1/communities/${communauteId}/messages`, {
    params: { utilisateurId },
  })

  return asArray(response.data).map(mapCommunityMessage)
}

export const sendCommunityMessage = async (
  communauteId: number,
  utilisateurId: number,
  contenu: string,
): Promise<CommunityMessage> => {
  const response = await httpClient.post<unknown>(`/v1/communities/${communauteId}/messages`, {
    utilisateurId,
    contenu,
  })

  return mapCommunityMessage(response.data)
}

export const listRooms = async (entiteId: number): Promise<Room[]> => {
  const response = await httpClient.get<unknown>('/v1/rooms', {
    params: { entiteId },
  })

  return asArray(response.data).map(mapRoom)
}

export const listRequests = async (entiteId: number): Promise<RequestRecord[]> => {
  const response = await httpClient.get<unknown>('/v1/requests', {
    params: { entiteId },
  })

  return asArray(response.data).map(mapRequest)
}

export const createRoom = async (payload: {
  utilisateurId: number
  entiteId: number
  nom: string
  capacite: number
  localisation: string
}): Promise<Room> => {
  const response = await httpClient.post<unknown>('/v1/rooms', payload)
  return mapRoom(response.data)
}

export const updateRoom = async (
  salleId: number,
  payload: {
    utilisateurId: number
    nom: string
    capacite: number
    localisation: string
    active: boolean
  },
): Promise<Room> => {
  const response = await httpClient.put<unknown>(`/v1/rooms/${salleId}`, payload)
  return mapRoom(response.data)
}

export const deleteRoom = async (salleId: number, utilisateurId: number): Promise<void> => {
  await httpClient.delete(`/v1/rooms/${salleId}`, {
    params: { utilisateurId },
  })
}

export const approveRequest = async (
  demandeId: number,
  utilisateurId: number,
  commentaire: string,
): Promise<void> => {
  await httpClient.post(`/v1/requests/${demandeId}/approve`, {
    utilisateurId,
    commentaire,
  })
}

export const rejectRequest = async (
  demandeId: number,
  utilisateurId: number,
  commentaire: string,
): Promise<void> => {
  await httpClient.post(`/v1/requests/${demandeId}/reject`, {
    utilisateurId,
    commentaire,
  })
}
