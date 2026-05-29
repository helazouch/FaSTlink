import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarPlus, Edit3, Trash2, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { PermissionAwareButton } from '../auth/PermissionAwareButton'
import { Badge } from '../atoms/Badge'
import { EmptyState } from '../role/EmptyState'
import { formatDateTime } from '../../lib/date'
import {
  createBureauEvent,
  deleteBureauEvent,
  listBureauEvents,
  updateBureauEvent,
  type BureauEventInput,
  type EventScope,
} from '../../services/social/eventService'
import { hydrateEntityDirectory } from '../../services/referenceDataService'
import type { EventItem, PublicationScope } from '../../types/social'

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const SimpleModal = ({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
    <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  </div>
)

const toDateTimeLocal = (iso: string) => {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

interface BureauEventManagementProps {
  entityId: number
  actorUserId: number
  permission: string
}

export const BureauEventManagement = ({ entityId, actorUserId, permission }: BureauEventManagementProps) => {
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EventItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [capacity, setCapacity] = useState('')
  const [category, setCategory] = useState('')
  const [scope, setScope] = useState<EventScope>('MY_ENTITY')
  const [selectedEntityIds, setSelectedEntityIds] = useState<number[]>([])

  const eventsQuery = useQuery({
    queryKey: ['bureau-events', entityId],
    queryFn: () => listBureauEvents(entityId),
  })

  const entitiesQuery = useQuery({
    queryKey: ['all-entities-directory'],
    queryFn: () => hydrateEntityDirectory(),
  })

  const allEntities = useMemo(
    () =>
      Array.from(entitiesQuery.data?.entries() ?? []).map(([id, name]) => ({
        id,
        name,
      })),
    [entitiesQuery.data],
  )

  const invalidateEvents = () => {
    void queryClient.invalidateQueries({ queryKey: ['bureau-events', entityId] })
    void queryClient.invalidateQueries({ queryKey: ['events'] })
  }

  const buildPayload = (): BureauEventInput => ({
    entityId,
    userId: actorUserId,
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
    startsAt: new Date(startsAt).toISOString(),
    endsAt: new Date(endsAt).toISOString(),
    scope,
    selectedEntityIds: scope === 'SELECTED_ENTITIES' ? selectedEntityIds : [],
    imageUrl: imageUrl.trim() || undefined,
    capacity: capacity.trim() ? Number(capacity) : undefined,
    category: category.trim() || undefined,
  })

  const createMutation = useMutation({
    mutationFn: () => createBureauEvent(buildPayload()),
    onSuccess: () => {
      setFeedback('Event created.')
      resetForm()
      invalidateEvents()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to create event.')),
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      updateBureauEvent(editTarget?.id ?? 0, {
        userId: actorUserId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        scope,
        selectedEntityIds: scope === 'SELECTED_ENTITIES' ? selectedEntityIds : [],
        imageUrl: imageUrl.trim() || undefined,
        capacity: capacity.trim() ? Number(capacity) : undefined,
        category: category.trim() || undefined,
      }),
    onSuccess: () => {
      setFeedback('Event updated.')
      resetForm()
      invalidateEvents()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to update event.')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteBureauEvent(deleteTarget?.id ?? 0, actorUserId),
    onSuccess: () => {
      setFeedback('Event deleted.')
      setDeleteTarget(null)
      invalidateEvents()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to delete event.')),
  })

  const resetForm = () => {
    setFormOpen(false)
    setEditTarget(null)
    setTitle('')
    setDescription('')
    setLocation('')
    setStartsAt('')
    setEndsAt('')
    setImageUrl('')
    setCapacity('')
    setCategory('')
    setScope('MY_ENTITY')
    setSelectedEntityIds([])
    setDateError(null)
  }

  const openEdit = (event: EventItem) => {
    setEditTarget(event)
    setTitle(event.title)
    setDescription(event.description)
    setLocation(event.location)
    setStartsAt(toDateTimeLocal(event.startsAt))
    setEndsAt(toDateTimeLocal(event.endsAt))
    setImageUrl(event.imageUrl ?? '')
    setCapacity(event.capacity > 0 ? String(event.capacity) : '')
    setCategory(event.category ?? '')
    setScope((event.scope as EventScope) ?? 'MY_ENTITY')
    setSelectedEntityIds(event.entiteIds ?? [])
    setDateError(null)
  }

  const validateDates = (nextStartsAt: string, nextEndsAt: string) => {
    if (!nextStartsAt || !nextEndsAt) {
      setDateError(null)
      return
    }

    const start = new Date(nextStartsAt).getTime()
    const end = new Date(nextEndsAt).getTime()
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      setDateError('Invalid date format.')
      return
    }

    if (end <= start) {
      setDateError('End date must be after the start date.')
      return
    }

    setDateError(null)
  }

  const toggleTargetEntity = (entityIdToToggle: number) => {
    setSelectedEntityIds((current) =>
      current.includes(entityIdToToggle)
        ? current.filter((id) => id !== entityIdToToggle)
        : [...current, entityIdToToggle],
    )
  }

  if (eventsQuery.isLoading || entitiesQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Loading events...
      </div>
    )
  }

  if (eventsQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        Events could not be loaded.
        <button type="button" className="ml-2 font-semibold underline" onClick={() => void eventsQuery.refetch()}>
          Retry
        </button>
      </div>
    )
  }

  const events = eventsQuery.data ?? []

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Entity events</h2>
        <PermissionAwareButton
          permission={permission}
          entityId={entityId}
          onClick={() => {
            resetForm()
            setFormOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white"
        >
          <CalendarPlus size={15} />
          Create event
        </PermissionAwareButton>
      </div>

      {feedback && <p className="mt-3 rounded-xl bg-brand/10 px-3 py-2 text-sm font-semibold text-brand">{feedback}</p>}

      {events.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={CalendarPlus} title="No events" description="Create the first event for this entity." />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800">{event.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{event.scope ?? 'MY_ENTITY'}</p>
                </div>
                <Badge tone="neutral">{event.category ?? 'Event'}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{event.description}</p>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(event.startsAt)}</p>
              <p className="mt-1 text-xs font-semibold text-brand">
                {event.attendees} going · {event.interestedCount ?? 0} interested
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <PermissionAwareButton
                  permission={permission}
                  entityId={entityId}
                  onClick={() => openEdit(event)}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700"
                >
                  <Edit3 size={13} />
                  Edit
                </PermissionAwareButton>
                <PermissionAwareButton
                  permission={permission}
                  entityId={entityId}
                  onClick={() => setDeleteTarget(event)}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700"
                >
                  <Trash2 size={13} />
                  Delete
                </PermissionAwareButton>
              </div>
            </article>
          ))}
        </div>
      )}

      {(formOpen || editTarget) && (
        <SimpleModal title={editTarget ? 'Update event' : 'Create event'} onClose={resetForm}>
          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <textarea
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Start
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm normal-case"
                  value={startsAt}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setStartsAt(nextValue)
                    validateDates(nextValue, endsAt)
                  }}
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                End
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm normal-case"
                  value={endsAt}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setEndsAt(nextValue)
                    validateDates(startsAt, nextValue)
                  }}
                />
              </label>
            </div>
            {dateError ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{dateError}</p>
            ) : null}
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Image / banner URL"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Capacity"
                type="number"
                min={0}
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
              />
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </div>
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Scope
              <select
                value={scope}
                disabled={Boolean(editTarget)}
                onChange={(event) => {
                  const nextScope = event.target.value as PublicationScope
                  setScope(nextScope)
                  if (nextScope !== 'SELECTED_ENTITIES') {
                    setSelectedEntityIds([])
                  }
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm normal-case"
              >
                <option value="MY_ENTITY">My entity</option>
                <option value="ALL_ENTITIES">All entities</option>
                <option value="ALL_USERS">All users</option>
                <option value="SELECTED_ENTITIES">Selected entities</option>
              </select>
            </label>
            {scope === 'SELECTED_ENTITIES' ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Target entities</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allEntities.map((entity) => (
                    <label
                      key={entity.id}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEntityIds.includes(entity.id)}
                        disabled={Boolean(editTarget)}
                        onChange={() => toggleTargetEntity(entity.id)}
                        className="h-4 w-4 accent-brand"
                      />
                      {entity.name}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            <button
              type="button"
              disabled={
                !title.trim() ||
                !startsAt ||
                !endsAt ||
                Boolean(dateError) ||
                (scope === 'SELECTED_ENTITIES' && selectedEntityIds.length === 0) ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              onClick={() => (editTarget ? updateMutation.mutate() : createMutation.mutate())}
              className="w-full rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save event'}
            </button>
          </div>
        </SimpleModal>
      )}

      {deleteTarget && (
        <SimpleModal title="Delete event" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Delete {deleteTarget.title}? This action cannot be undone.</p>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
              className="w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Confirm delete'}
            </button>
          </div>
        </SimpleModal>
      )}
    </section>
  )
}
