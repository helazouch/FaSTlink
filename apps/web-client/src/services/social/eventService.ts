import { mockEvents } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type { EventItem, UpdateParticipationInput } from '../../types/social'

interface EventDto {
  id: number
  title: string
  description: string
  location: string
  startsAt: string
  endsAt: string
  capacity: number
  attendees: number
  communityId: number
  communityName: string
  participation: EventItem['participation']
}

let eventsCache: EventItem[] = [...mockEvents]

const mapEvent = (payload: EventDto): EventItem => ({
  id: payload.id,
  title: payload.title,
  description: payload.description,
  location: payload.location,
  startsAt: payload.startsAt,
  endsAt: payload.endsAt,
  capacity: payload.capacity,
  attendees: payload.attendees,
  communityId: payload.communityId,
  communityName: payload.communityName,
  participation: payload.participation,
})

export const getUpcomingEvents = async (): Promise<EventItem[]> =>
  withFallback(
    async () => {
      const response = await httpClient.get<EventDto[]>('/v1/events/upcoming')
      return response.data.map(mapEvent)
    },
    () => eventsCache,
  )

export const updateEventParticipation = async (
  input: UpdateParticipationInput,
): Promise<EventItem> =>
  withFallback(
    async () => {
      const response = await httpClient.post<EventDto>(
        `/v1/events/${input.eventId}/participation`,
        {
          participation: input.participation,
        },
      )

      return mapEvent(response.data)
    },
    () => {
      let updated: EventItem | null = null

      eventsCache = eventsCache.map((item) => {
        if (item.id !== input.eventId) {
          return item
        }

        const wasGoing = item.participation === 'going'
        const isGoing = input.participation === 'going'
        updated = {
          ...item,
          participation: input.participation,
          attendees: wasGoing === isGoing ? item.attendees : isGoing ? item.attendees + 1 : Math.max(item.attendees - 1, 0),
        }

        return updated
      })

      if (!updated) {
        throw new Error('Event not found')
      }

      return updated
    },
  )
