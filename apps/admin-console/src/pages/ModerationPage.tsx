import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, RefreshCw, ShieldAlert, X } from 'lucide-react'
import { useState } from 'react'
import { DataTableShell } from '../components/table/DataTableShell'
import { Pagination } from '../components/table/Pagination'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { TextArea } from '../components/ui/TextArea'
import { TextInput } from '../components/ui/TextInput'
import { appendAuditEntry } from '../lib/auditTrail'
import { normalizeApiError } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import {
  approveModerationEvent,
  approveModerationPublication,
  listModerationEvents,
  listModerationPublications,
  rejectModerationEvent,
  rejectModerationPublication,
} from '../services/admin/adminService'
import { useAuthStore } from '../stores/authStore'

type ModerationDecision = {
  id: number
  type: 'PUBLICATION' | 'EVENT'
  action: 'APPROVE' | 'REJECT'
}

export const ModerationPage = () => {
  const queryClient = useQueryClient()
  const actorUserId = useAuthStore((state) => state.user?.id ?? 0)

  const [publicationPage, setPublicationPage] = useState(0)
  const [publicationSearch, setPublicationSearch] = useState('')
  const [eventPage, setEventPage] = useState(0)
  const [eventSearch, setEventSearch] = useState('')

  const [decision, setDecision] = useState<ModerationDecision | null>(null)
  const [decisionReason, setDecisionReason] = useState('')

  const [manualType, setManualType] = useState<'PUBLICATION' | 'EVENT'>('PUBLICATION')
  const [manualAction, setManualAction] = useState<'APPROVE' | 'REJECT'>('APPROVE')
  const [manualId, setManualId] = useState('')

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const pageSize = 8

  const publicationsQuery = useQuery({
    queryKey: ['moderation-publications', publicationPage, publicationSearch],
    queryFn: () =>
      listModerationPublications({
        page: publicationPage,
        pageSize,
        search: publicationSearch,
      }),
    retry: false,
  })

  const eventsQuery = useQuery({
    queryKey: ['moderation-events', eventPage, eventSearch],
    queryFn: () =>
      listModerationEvents({
        page: eventPage,
        pageSize,
        search: eventSearch,
      }),
    retry: false,
  })

  const moderationMutation = useMutation({
    mutationFn: (payload: ModerationDecision) => {
      if (payload.type === 'PUBLICATION' && payload.action === 'APPROVE') {
        return approveModerationPublication(payload.id, actorUserId, decisionReason)
      }

      if (payload.type === 'PUBLICATION' && payload.action === 'REJECT') {
        return rejectModerationPublication(payload.id, actorUserId, decisionReason)
      }

      if (payload.type === 'EVENT' && payload.action === 'APPROVE') {
        return approveModerationEvent(payload.id, actorUserId, decisionReason)
      }

      return rejectModerationEvent(payload.id, actorUserId, decisionReason)
    },
    onSuccess: (_, payload) => {
      appendAuditEntry(
        payload.action === 'APPROVE' ? 'APPROVE_CONTENT' : 'REJECT_CONTENT',
        payload.type.toLowerCase(),
        String(payload.id),
        'SUCCESS',
        decisionReason || 'No reason',
      )
      setErrorMessage(null)
      setDecision(null)
      setDecisionReason('')
      if (payload.type === 'PUBLICATION') {
        void queryClient.invalidateQueries({ queryKey: ['moderation-publications'] })
      } else {
        void queryClient.invalidateQueries({ queryKey: ['moderation-events'] })
      }
    },
    onError: (error, payload) => {
      appendAuditEntry(
        payload.action === 'APPROVE' ? 'APPROVE_CONTENT' : 'REJECT_CONTENT',
        payload.type.toLowerCase(),
        String(payload.id),
        'FAILED',
        normalizeApiError(error).message,
      )
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
        title="Publication moderation"
        subtitle="Approve or reject publication content based on moderation queue."
        toolbar={
          <Button variant="secondary" onClick={() => void queryClient.invalidateQueries({ queryKey: ['moderation-publications'] })}>
            <RefreshCw size={14} />
            Refresh
          </Button>
        }
      >
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-surface-700 md:grid-cols-[1fr,160px]">
          <TextInput
            label="Search moderation queue"
            value={publicationSearch}
            onChange={(event) => {
              setPublicationSearch(event.target.value)
              setPublicationPage(0)
            }}
            placeholder="Search title or reason"
          />
          <Button className="self-end" variant="secondary" onClick={() => setPublicationPage(0)}>
            Apply filter
          </Button>
        </div>

        {publicationsQuery.isError ? (
          <div className="p-4">
            <EmptyState
              title="Publication moderation endpoint unavailable"
              message="Configure moderation publication endpoints in .env and ensure backend routes exist."
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Id</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Title</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Reason</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Created</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(publicationsQuery.data?.items ?? []).length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={6}>
                      No publication moderation items.
                    </td>
                  </tr>
                ) : (
                  (publicationsQuery.data?.items ?? []).map((item) => (
                    <tr key={`pub-${item.id}`} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell text-slate-700 dark:text-slate-200">#{item.id}</td>
                      <td className="table-cell text-slate-700 dark:text-slate-200">{item.title}</td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{item.reason}</td>
                      <td className="table-cell">
                        <Badge tone={item.status === 'PENDING' ? 'warning' : 'neutral'}>{item.status}</Badge>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(item.createdAt)}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setDecision({ id: item.id, type: 'PUBLICATION', action: 'APPROVE' })}>
                            <Check size={14} />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDecision({ id: item.id, type: 'PUBLICATION', action: 'REJECT' })}
                          >
                            <X size={14} />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination
              page={publicationsQuery.data?.page ?? 0}
              pageSize={publicationsQuery.data?.pageSize ?? pageSize}
              total={publicationsQuery.data?.total ?? 0}
              onPageChange={setPublicationPage}
            />
          </>
        )}
      </DataTableShell>

      <DataTableShell
        title="Event moderation"
        subtitle="Approve or reject event submissions from moderation queue."
        toolbar={
          <Button variant="secondary" onClick={() => void queryClient.invalidateQueries({ queryKey: ['moderation-events'] })}>
            <RefreshCw size={14} />
            Refresh
          </Button>
        }
      >
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-surface-700 md:grid-cols-[1fr,160px]">
          <TextInput
            label="Search moderation queue"
            value={eventSearch}
            onChange={(event) => {
              setEventSearch(event.target.value)
              setEventPage(0)
            }}
            placeholder="Search title or reason"
          />
          <Button className="self-end" variant="secondary" onClick={() => setEventPage(0)}>
            Apply filter
          </Button>
        </div>

        {eventsQuery.isError ? (
          <div className="p-4">
            <EmptyState
              title="Event moderation endpoint unavailable"
              message="Configure moderation event endpoints in .env and ensure backend routes exist."
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Id</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Title</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Reason</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Created</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(eventsQuery.data?.items ?? []).length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={6}>
                      No event moderation items.
                    </td>
                  </tr>
                ) : (
                  (eventsQuery.data?.items ?? []).map((item) => (
                    <tr key={`event-${item.id}`} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell text-slate-700 dark:text-slate-200">#{item.id}</td>
                      <td className="table-cell text-slate-700 dark:text-slate-200">{item.title}</td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{item.reason}</td>
                      <td className="table-cell">
                        <Badge tone={item.status === 'PENDING' ? 'warning' : 'neutral'}>{item.status}</Badge>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(item.createdAt)}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setDecision({ id: item.id, type: 'EVENT', action: 'APPROVE' })}>
                            <Check size={14} />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDecision({ id: item.id, type: 'EVENT', action: 'REJECT' })}
                          >
                            <X size={14} />
                            Reject
                          </Button>
                        </div>
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
              onPageChange={setEventPage}
            />
          </>
        )}
      </DataTableShell>

      <section className="panel p-4">
        <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-slate-100">Manual moderation by id</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Use direct moderation when queue endpoints are not available in your backend environment.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-[160px,160px,1fr,160px]">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</span>
            <select
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-surface-600 dark:bg-surface-700"
              value={manualType}
              onChange={(event) => setManualType(event.target.value as 'PUBLICATION' | 'EVENT')}
            >
              <option value="PUBLICATION">Publication</option>
              <option value="EVENT">Event</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Action</span>
            <select
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-surface-600 dark:bg-surface-700"
              value={manualAction}
              onChange={(event) => setManualAction(event.target.value as 'APPROVE' | 'REJECT')}
            >
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
            </select>
          </label>
          <TextInput
            label="Content id"
            value={manualId}
            onChange={(event) => setManualId(event.target.value)}
            placeholder="123"
          />
          <Button
            className="self-end"
            onClick={() => {
              const parsedId = Number(manualId)
              if (!Number.isFinite(parsedId) || parsedId <= 0) {
                setErrorMessage('Manual moderation id must be a positive number.')
                return
              }

              setDecision({
                id: parsedId,
                type: manualType,
                action: manualAction,
              })
            }}
          >
            <ShieldAlert size={14} />
            Execute
          </Button>
        </div>
      </section>

      <Modal
        open={decision !== null}
        title={`${decision?.action === 'APPROVE' ? 'Approve' : 'Reject'} ${decision?.type?.toLowerCase()}`}
        subtitle={`Target id #${decision?.id ?? '-'}`}
        onClose={() => {
          setDecision(null)
          setDecisionReason('')
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button
              variant={decision?.action === 'REJECT' ? 'danger' : 'primary'}
              disabled={moderationMutation.isPending || decision === null}
              onClick={() => {
                if (!decision) {
                  return
                }

                moderationMutation.mutate(decision)
              }}
            >
              {moderationMutation.isPending ? 'Submitting...' : 'Confirm'}
            </Button>
          </div>
        }
      >
        <TextArea
          label="Decision reason"
          value={decisionReason}
          onChange={(event) => setDecisionReason(event.target.value)}
          placeholder="Optional moderation reason"
        />
      </Modal>
    </div>
  )
}
