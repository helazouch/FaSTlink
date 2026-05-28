import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PermissionAwareButton } from '../components/auth/PermissionAwareButton'
import { EventParticipationCard } from '../components/organisms/EventParticipationCard'
import { EmptyState } from '../components/role/EmptyState'
import { useEvents, useUpdateParticipation } from '../hooks/useSocial'
import { useCurrentEntityContext } from '../hooks/useCurrentEntityContext'
import { CalendarPlus } from 'lucide-react'

export const EventsPage = () => {
  const navigate = useNavigate()
  const params = useParams<{ eventId: string }>()
  const selectedEventId = Number(params.eventId)

  const { data: events = [], isLoading } = useEvents()
  const updateParticipationMutation = useUpdateParticipation()
  const { currentEntityId } = useCurrentEntityContext()

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId],
  )

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Events</h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover upcoming events and confirm your participation in one click.
            </p>
          </div>
          <PermissionAwareButton
            permission="EVENT_CREATE"
            entityId={currentEntityId}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <CalendarPlus size={16} />
            Create event
          </PermissionAwareButton>
        </div>
      </section>

      {selectedEvent ? (
        <section className="rounded-2xl border border-brand/30 bg-brand/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Selected Event</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-800">{selectedEvent.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{selectedEvent.description}</p>
        </section>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Loading events...
        </div>
      ) : null}

      <section className="grid gap-3">
        {events.length > 0 ? events.map((event) => (
          <div key={event.id} className="space-y-2">
            <button
              onClick={() => navigate(`/events/${event.id}`)}
              className="text-left text-xs font-semibold uppercase tracking-[0.1em] text-brand"
            >
              Open details
            </button>
            <EventParticipationCard
              event={event}
              onUpdateParticipation={(eventId, participation) => {
                updateParticipationMutation.mutate({ eventId, participation })
              }}
            />
          </div>
        )) : (
          <EmptyState
            icon={CalendarPlus}
            title="No events yet"
            description="Events you can consult will appear here. Bureau creation controls only show in eligible entity contexts."
          />
        )}
      </section>
    </div>
  )
}
