import { Users } from 'lucide-react'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { formatDateTime } from '../../lib/date'
import type { EventItem, EventParticipation } from '../../types/social'

interface EventParticipationCardProps {
  event: EventItem
  onUpdateParticipation: (eventId: number, participation: EventParticipation) => void
}

export const EventParticipationCard = ({
  event,
  onUpdateParticipation,
}: EventParticipationCardProps) => {
  // capacity is not returned by the event-service API — guard against division by zero
  const occupancy = event.capacity > 0 ? Math.round((event.attendees / event.capacity) * 100) : 0
  const hasCapacity = event.capacity > 0

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{event.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{event.communityName}</p>
        </div>
        <Badge tone={event.participation === 'going' ? 'success' : 'neutral'}>
          {event.participation}
        </Badge>
      </div>

      <p className="mt-3 text-sm text-slate-600">{event.description}</p>

      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
        <p>{formatDateTime(event.startsAt)}</p>
        <p>{event.location}</p>
      </div>

      {hasCapacity ? (
        <div className="mt-3">
          <p className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Users size={13} />
            {event.attendees} / {event.capacity} attendees
          </p>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-700"
              style={{ width: `${Math.min(occupancy, 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={event.participation === 'going' ? 'primary' : 'secondary'}
          onClick={() => onUpdateParticipation(event.id, 'going')}
        >
          Going
        </Button>
        <Button
          size="sm"
          variant={event.participation === 'interested' ? 'primary' : 'secondary'}
          onClick={() => onUpdateParticipation(event.id, 'interested')}
        >
          Interested
        </Button>
        <Button
          size="sm"
          variant={event.participation === 'not-going' ? 'danger' : 'secondary'}
          onClick={() => onUpdateParticipation(event.id, 'not-going')}
        >
          Not going
        </Button>
      </div>
    </article>
  )
}
