import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { DataTableShell } from '../components/table/DataTableShell'
import { Pagination } from '../components/table/Pagination'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { Modal } from '../components/ui/Modal'
import { SelectInput } from '../components/ui/SelectInput'
import { TextArea } from '../components/ui/TextArea'
import { TextInput } from '../components/ui/TextInput'
import { appendAuditEntry } from '../lib/auditTrail'
import { normalizeApiError } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import { createEvent, listEvents } from '../services/domain/operationsService'
import { useAuthStore } from '../stores/authStore'
import type { EventRecord } from '../types/domain'

const EVENT_STATUS_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'UPCOMING', value: 'UPCOMING' },
  { label: 'ONGOING', value: 'ONGOING' },
  { label: 'CLOSED', value: 'CLOSED' },
]

export const EventsPage = () => {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((state) => state.user?.id ?? 0)

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [filterEntityId, setFilterEntityId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<EventRecord | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [userId, setUserId] = useState(String(currentUserId || ''))
  const [entityId, setEntityId] = useState('1')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')

  const pageSize = 10

  const eventsQuery = useQuery({
    queryKey: ['events', page, pageSize, search, filterEntityId, filterStatus],
    queryFn: () =>
      listEvents({
        page,
        pageSize,
        search,
        entityId: Number(filterEntityId) || null,
        status: filterStatus || null,
      }),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createEvent({
        utilisateurId: Number(userId),
        entiteId: Number(entityId),
        titre: title,
        description,
        lieu: location,
        debutAt: new Date(startsAt).toISOString(),
        finAt: new Date(endsAt).toISOString(),
      }),
    onSuccess: (created) => {
      appendAuditEntry('CREATE_EVENT', 'event', String(created.id), 'SUCCESS', created.titre)
      setCreateOpen(false)
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    },
    onError: (error) => {
      appendAuditEntry('CREATE_EVENT', 'event', 'new', 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  return (
    <div className="space-y-5">
      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger dark:border-red-500/30 dark:bg-red-500/10">
          {errorMessage}
        </p>
      ) : null}

      <DataTableShell
        title="Events"
        subtitle="Track and create events from the admin console."
        toolbar={
          <>
            <Button variant="secondary" onClick={() => void queryClient.invalidateQueries({ queryKey: ['events'] })}>
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={14} />
              New event
            </Button>
          </>
        }
      >
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-surface-700 md:grid-cols-[1fr,140px,160px,160px]">
          <TextInput
            label="Search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Search title"
          />
          <TextInput
            label="Entity id"
            value={filterEntityId}
            onChange={(event) => {
              setFilterEntityId(event.target.value)
              setPage(0)
            }}
            placeholder="Any"
          />
          <SelectInput
            label="Status"
            value={filterStatus}
            onChange={(event) => {
              setFilterStatus(event.target.value)
              setPage(0)
            }}
            options={EVENT_STATUS_OPTIONS}
          />
          <Button className="self-end" variant="secondary" onClick={() => setPage(0)}>
            Apply filter
          </Button>
        </div>

        {eventsQuery.isLoading ? (
          <div className="p-4">
            <Loader label="Loading events..." />
          </div>
        ) : eventsQuery.isError ? (
          <div className="p-4">
            <EmptyState
              title="Unable to load events"
              message="The event listing endpoint returned an error. Check backend logs and admin permissions."
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Id</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Title</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Entity</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Organizer</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Window</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Location</th>
                  <th className="table-cell text-right font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(eventsQuery.data?.items ?? []).length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={8}>
                      No events in current page.
                    </td>
                  </tr>
                ) : (
                  (eventsQuery.data?.items ?? []).map((eventItem) => (
                    <tr key={eventItem.id} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell text-slate-700 dark:text-slate-200">#{eventItem.id}</td>
                      <td className="table-cell text-slate-700 dark:text-slate-200">{eventItem.titre}</td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">
                        <p>{eventItem.entityName ?? `Entity #${eventItem.entiteId}`}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">#{eventItem.entiteId}</p>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">
                        <p>{eventItem.organizerName ?? `User #${eventItem.createurUtilisateurId}`}</p>
                        {eventItem.organizerEmail ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{eventItem.organizerEmail}</p>
                        ) : null}
                      </td>
                      <td className="table-cell">
                        <Badge tone={eventItem.status === 'ONGOING' ? 'success' : 'neutral'}>{eventItem.status}</Badge>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">
                        {formatDateTime(eventItem.debutAt)} - {formatDateTime(eventItem.finAt)}
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{eventItem.lieu ?? '-'}</td>
                      <td className="table-cell text-right">
                        <Button variant="secondary" onClick={() => setDetailTarget(eventItem)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <Pagination
              page={eventsQuery.data?.page ?? 0}
              pageSize={eventsQuery.data?.pageSize ?? pageSize}
              total={eventsQuery.data?.total ?? 0}
              onPageChange={setPage}
            />
          </>
        )}
      </DataTableShell>

      <Modal
        open={createOpen}
        title="Create event"
        subtitle="Create a new event with entity ownership checks."
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={
                createMutation.isPending || !title.trim() || !startsAt.trim() || !endsAt.trim() || !entityId.trim()
              }
            >
              {createMutation.isPending ? 'Creating...' : 'Create event'}
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <TextInput label="User id" value={userId} onChange={(event) => setUserId(event.target.value)} />
          <TextInput label="Entity id" value={entityId} onChange={(event) => setEntityId(event.target.value)} />
        </div>
        <TextInput label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <TextArea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
        <TextInput label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
        <div className="grid gap-3 md:grid-cols-2">
          <TextInput
            label="Starts at"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
          />
          <TextInput
            label="Ends at"
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={detailTarget !== null}
        title={detailTarget ? `Event #${detailTarget.id}` : 'Event details'}
        onClose={() => setDetailTarget(null)}
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setDetailTarget(null)}>
              Close
            </Button>
          </div>
        }
      >
        {detailTarget ? (
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={detailTarget.status === 'ONGOING' ? 'success' : 'neutral'}>{detailTarget.status}</Badge>
              <span>{detailTarget.titre}</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Entity</p>
              <p>{detailTarget.entityName ?? `Entity #${detailTarget.entiteId}`} #{detailTarget.entiteId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Organizer</p>
              <p>{detailTarget.organizerName ?? `User #${detailTarget.createurUtilisateurId}`}</p>
              {detailTarget.organizerEmail ? <p className="text-slate-500">{detailTarget.organizerEmail}</p> : null}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Description</p>
              <p className="whitespace-pre-wrap">{detailTarget.description ?? '-'}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <p>Start: {formatDateTime(detailTarget.debutAt)}</p>
              <p>End: {formatDateTime(detailTarget.finAt)}</p>
              <p>Location: {detailTarget.lieu ?? '-'}</p>
              <p>Updated: {formatDateTime(detailTarget.updatedAt)}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
