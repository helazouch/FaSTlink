import { useMemo } from 'react'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { EventParticipationCard } from '../components/organisms/EventParticipationCard'
import { useEvents, useUpdateParticipation } from '../hooks/useSocial'
import { normalizeApiError } from '../lib/errors'

export const EventsPage = () => {
  const navigate = useNavigate()
  const params = useParams<{ eventId: string }>()
  const selectedEventId = Number(params.eventId)

  const { data: events = [], isLoading, isError } = useEvents()
  const updateParticipationMutation = useUpdateParticipation()

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId],
  )

  const participationError = updateParticipationMutation.error
    ? normalizeApiError(updateParticipationMutation.error).message
    : null

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Events</h1>
        <p className="mt-1 text-sm text-slate-500">
          Discover upcoming events and confirm your participation in one click.
        </p>
      </section>

      {participationError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {participationError}
        </div>
      ) : null}

      {selectedEvent ? (
        <section className="rounded-2xl border border-brand/30 bg-brand/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Selected Event</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-800">{selectedEvent.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{selectedEvent.description}</p>
        </section>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          <LoaderCircle className="animate-spin" size={14} />
          Loading events...
        </div>
      ) : null}

      {isError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          Unable to load events. Make sure the API Gateway is running.
        </div>
      ) : null}

      {!isLoading && !isError && events.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          No upcoming events yet.
        </div>
      ) : null}

      <section className="grid gap-3">
        {events.map((event) => (
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
        ))}
      </section>
    </div>
  )
}
