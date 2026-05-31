import { httpClient } from '../api/httpClient'
import { getEntityName, hydrateEntityDirectory } from '../referenceDataService'
import type { EventItem, UpdateParticipationInput } from '../../types/social'

interface EvenementDto {
  id: number
  entiteId: number
  titre: string
  description: string
  lieu: string
  debutAt: string
  finAt: string
  // capacity and attendees are not returned by the backend
}

interface ParticipationResponseDto {
  evenementId: number
  utilisateurId: number
  statut: 'INTERESTED' | 'PARTICIPATING'
}

let eventsCache: EventItem[] = []

const fromParticipationStatus = (
  status: ParticipationResponseDto['statut'] | undefined,
): EventItem['participation'] =>
  status === 'PARTICIPATING' ? 'going' : 'interested'

const toParticipationStatus = (
  participation: EventItem['participation'],
): ParticipationResponseDto['statut'] =>
  participation === 'going' ? 'PARTICIPATING' : 'INTERESTED'

const mapEvent = (payload: EvenementDto): EventItem => ({
  id: payload.id,
  title: payload.titre,
  description: payload.description,
  location: payload.lieu,
  startsAt: payload.debutAt,
  endsAt: payload.finAt,
  // capacity and attendees are not provided by the event-service API
  capacity: 0,
  attendees: 0,
  communityId: payload.entiteId,
  communityName: getEntityName(payload.entiteId, `Entity #${payload.entiteId}`),
  participation: 'interested',
})

export const getUpcomingEvents = async (): Promise<EventItem[]> => {
  // Entity name resolution is best-effort: events must load even if entity-service is temporarily unavailable
  try {
    await hydrateEntityDirectory()
  } catch {
    // Entity names will fall back to "Entity #id" — events still render
  }

  const response = await httpClient.get<EvenementDto[]>('/v1/events')
  const mapped = response.data.map(mapEvent)
  eventsCache = mapped
  return mapped
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

  let updated: EventItem | null = null

  eventsCache = eventsCache.map((item) => {
    if (item.id !== response.data.evenementId) return item

    const nextParticipation = fromParticipationStatus(response.data.statut)
    const wasGoing = item.participation === 'going'
    const isGoing = nextParticipation === 'going'

    updated = {
      ...item,
      participation: nextParticipation,
      attendees:
        wasGoing === isGoing
          ? item.attendees
          : isGoing
            ? item.attendees + 1
            : Math.max(item.attendees - 1, 0),
    }

    return updated
  })

  if (!updated) throw new Error('Event not found after participation update')
  return updated
}
