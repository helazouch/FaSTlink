import { httpClient } from '../api/httpClient'
import { getEntityName, hydrateEntityDirectory } from '../referenceDataService'
import type { EventItem, EventParticipation, PublicationScope, UpdateParticipationInput } from '../../types/social'

export type EventScope = PublicationScope

interface EvenementDto {
  id: number
  entiteId: number
  titre: string
  description: string
  lieu: string
  debutAt: string
  finAt: string
  scope?: EventScope
  entiteIds?: number[]
  imageUrl?: string | null
  capacity?: number | null
  category?: string | null
  goingCount?: number
  interestedCount?: number
  currentUserParticipation?: 'INTERESTED' | 'GOING' | 'NOT_GOING' | 'PARTICIPATING' | null
}

interface ParticipationResponseDto {
  evenementId: number
  utilisateurId: number
  statut: 'INTERESTED' | 'GOING' | 'NOT_GOING' | 'PARTICIPATING'
}

export interface BureauEventInput {
  entityId: number
  userId: number
  title: string
  description: string
  location: string
  startsAt: string
  endsAt: string
  scope: EventScope
  selectedEntityIds: number[]
  imageUrl?: string
  capacity?: number
  category?: string
}

const fromParticipationStatus = (
  status: EvenementDto['currentUserParticipation'] | ParticipationResponseDto['statut'] | undefined,
): EventParticipation | null => {
  if (status === 'GOING' || status === 'PARTICIPATING') {
    return 'going'
  }
  if (status === 'NOT_GOING') {
    return 'not-going'
  }
  if (status === 'INTERESTED') {
    return 'interested'
  }
  return null
}

const toParticipationStatus = (participation: EventParticipation): ParticipationResponseDto['statut'] => {
  if (participation === 'going') {
    return 'GOING'
  }
  if (participation === 'not-going') {
    return 'NOT_GOING'
  }
  return 'INTERESTED'
}

const mapEvent = (payload: EvenementDto): EventItem => ({
  id: payload.id,
  title: payload.titre,
  description: payload.description ?? '',
  location: payload.lieu ?? '',
  startsAt: payload.debutAt,
  endsAt: payload.finAt,
  capacity: payload.capacity ?? 0,
  attendees: payload.goingCount ?? 0,
  interestedCount: payload.interestedCount ?? 0,
  communityId: payload.entiteId,
  communityName: getEntityName(payload.entiteId, `Entity #${payload.entiteId}`),
  scope: payload.scope ?? 'MY_ENTITY',
  entiteIds: payload.entiteIds ?? [],
  imageUrl: payload.imageUrl ?? undefined,
  category: payload.category ?? undefined,
  participation: fromParticipationStatus(payload.currentUserParticipation),
})

export const getUpcomingEvents = async (): Promise<EventItem[]> => {
  await hydrateEntityDirectory()
  const response = await httpClient.get<EvenementDto[]>('/v1/events')
  return response.data.map(mapEvent)
}

export const listBureauEvents = async (entityId: number): Promise<EventItem[]> => {
  await hydrateEntityDirectory()
  const response = await httpClient.get<EvenementDto[]>('/v1/events', {
    params: {
      entityId,
      manage: true,
    },
  })
  return response.data.map(mapEvent)
}

export const createBureauEvent = async (input: BureauEventInput): Promise<EventItem> => {
  const response = await httpClient.post<EvenementDto>('/v1/events', {
    utilisateurId: input.userId,
    entiteId: input.entityId,
    titre: input.title,
    description: input.description,
    lieu: input.location,
    debutAt: input.startsAt,
    finAt: input.endsAt,
    scope: input.scope,
    selectedEntityIds: input.selectedEntityIds,
    imageUrl: input.imageUrl,
    capacity: input.capacity,
    category: input.category,
  })
  return mapEvent(response.data)
}

export const updateBureauEvent = async (
  eventId: number,
  input: Omit<BureauEventInput, 'entityId' | 'userId'> & { userId: number },
): Promise<EventItem> => {
  const response = await httpClient.put<EvenementDto>(`/v1/events/${eventId}`, {
    utilisateurId: input.userId,
    titre: input.title,
    description: input.description,
    lieu: input.location,
    debutAt: input.startsAt,
    finAt: input.endsAt,
    scope: input.scope,
    selectedEntityIds: input.selectedEntityIds,
    imageUrl: input.imageUrl,
    capacity: input.capacity,
    category: input.category,
  })
  return mapEvent(response.data)
}

export const deleteBureauEvent = async (eventId: number, userId: number): Promise<void> => {
  await httpClient.delete(`/v1/events/${eventId}`, {
    params: { utilisateurId: userId },
  })
}

export const updateEventParticipation = async (
  input: UpdateParticipationInput,
  userId: number,
): Promise<EventItem> => {
  const response = await httpClient.post<ParticipationResponseDto>(
    `/v1/events/${input.eventId}/participants`,
    {
      utilisateurId: userId,
      statut: toParticipationStatus(input.participation),
    },
  )

  const events = await getUpcomingEvents()
  const updated = events.find((item) => item.id === response.data.evenementId)
  if (!updated) {
    throw new Error('Event not found after participation update')
  }

  return {
    ...updated,
    participation: fromParticipationStatus(response.data.statut),
  }
}
