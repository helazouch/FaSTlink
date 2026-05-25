import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Check, Plus, RefreshCw, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTableShell } from '../components/table/DataTableShell'
import { Pagination } from '../components/table/Pagination'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { Modal } from '../components/ui/Modal'
import { TextArea } from '../components/ui/TextArea'
import { TextInput } from '../components/ui/TextInput'
import { appendAuditEntry } from '../lib/auditTrail'
import { normalizeApiError } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import {
  approveRequest,
  createRoom,
  deleteRoom,
  listRequests,
  listRooms,
  rejectRequest,
  updateRoom,
} from '../services/domain/operationsService'
import { useAuthStore } from '../stores/authStore'

export const RequestsPage = () => {
  const queryClient = useQueryClient()
  const actorUserId = useAuthStore((state) => state.user?.id ?? 0)

  const [entiteIdInput, setEntiteIdInput] = useState('5')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const [createOpen, setCreateOpen] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomCapacity, setRoomCapacity] = useState('50')
  const [roomLocation, setRoomLocation] = useState('')

  const [editTargetId, setEditTargetId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editCapacity, setEditCapacity] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editActive, setEditActive] = useState(true)

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const [decisionOpen, setDecisionOpen] = useState(false)
  const [decisionRequestId, setDecisionRequestId] = useState('')
  const [decisionComment, setDecisionComment] = useState('')
  const [decisionMode, setDecisionMode] = useState<'APPROVE' | 'REJECT'>('APPROVE')

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const entiteId = useMemo(() => {
    const parsed = Number(entiteIdInput)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }, [entiteIdInput])

  const roomsQuery = useQuery({
    queryKey: ['rooms', entiteId],
    queryFn: () => listRooms(entiteId),
    enabled: entiteId > 0,
  })

  const requestsQuery = useQuery({
    queryKey: ['requests', entiteId],
    queryFn: () => listRequests(entiteId),
    enabled: entiteId > 0,
  })

  const filteredRooms = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const items = roomsQuery.data ?? []

    if (!needle) {
      return items
    }

    return items.filter((room) => {
      return (
        room.nom.toLowerCase().includes(needle) ||
        (room.localisation ?? '').toLowerCase().includes(needle) ||
        String(room.capacite).includes(needle)
      )
    })
  }, [roomsQuery.data, search])

  const pageSize = 8
  const pagedRooms = filteredRooms.slice(page * pageSize, page * pageSize + pageSize)

  const createRoomMutation = useMutation({
    mutationFn: () =>
      createRoom({
        utilisateurId: actorUserId,
        entiteId,
        nom: roomName,
        capacite: Number(roomCapacity),
        localisation: roomLocation,
      }),
    onSuccess: (created) => {
      appendAuditEntry('CREATE_ROOM', 'room', String(created.id), 'SUCCESS', created.nom)
      setCreateOpen(false)
      setRoomName('')
      setRoomCapacity('50')
      setRoomLocation('')
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['rooms', entiteId] })
    },
    onError: (error) => {
      appendAuditEntry('CREATE_ROOM', 'room', 'new', 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const updateRoomMutation = useMutation({
    mutationFn: () =>
      updateRoom(editTargetId ?? 0, {
        utilisateurId: actorUserId,
        nom: editName,
        capacite: Number(editCapacity),
        localisation: editLocation,
        active: editActive,
      }),
    onSuccess: (updated) => {
      appendAuditEntry('UPDATE_ROOM', 'room', String(updated.id), 'SUCCESS', updated.nom)
      setEditTargetId(null)
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['rooms', entiteId] })
    },
    onError: (error) => {
      appendAuditEntry('UPDATE_ROOM', 'room', String(editTargetId ?? 'unknown'), 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId: number) => deleteRoom(roomId, actorUserId),
    onSuccess: (_, roomId) => {
      appendAuditEntry('DELETE_ROOM', 'room', String(roomId), 'SUCCESS', 'Room deleted')
      setDeleteTargetId(null)
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['rooms', entiteId] })
    },
    onError: (error, roomId) => {
      appendAuditEntry('DELETE_ROOM', 'room', String(roomId), 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const requestDecisionMutation = useMutation({
    mutationFn: () => {
      const requestId = Number(decisionRequestId)

      if (decisionMode === 'APPROVE') {
        return approveRequest(requestId, actorUserId, decisionComment)
      }

      return rejectRequest(requestId, actorUserId, decisionComment)
    },
    onSuccess: () => {
      appendAuditEntry(
        decisionMode === 'APPROVE' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
        'request',
        decisionRequestId,
        'SUCCESS',
        decisionComment || 'No comment',
      )
      setDecisionOpen(false)
      setDecisionComment('')
      setDecisionRequestId('')
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['requests', entiteId] })
    },
    onError: (error) => {
      appendAuditEntry(
        decisionMode === 'APPROVE' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
        'request',
        decisionRequestId,
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
        title="Rooms and request operations"
        subtitle="Manage room inventory per entity and trigger request approvals/rejections."
        toolbar={
          <>
            <Button variant="secondary" onClick={() => void queryClient.invalidateQueries({ queryKey: ['rooms', entiteId] })}>
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)} disabled={entiteId <= 0}>
              <Plus size={14} />
              New room
            </Button>
            <Button variant="secondary" onClick={() => setDecisionOpen(true)}>
              Moderate request id
            </Button>
          </>
        }
      >
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-surface-700 md:grid-cols-[170px,1fr,160px]">
          <TextInput
            label="Entity id"
            value={entiteIdInput}
            onChange={(event) => setEntiteIdInput(event.target.value)}
            placeholder="5"
          />
          <TextInput
            label="Filter rooms"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Name or location"
          />
          <Button className="self-end" variant="secondary" onClick={() => setPage(0)}>
            Apply filter
          </Button>
        </div>

        {roomsQuery.isLoading ? (
          <div className="p-4">
            <Loader label="Loading rooms..." />
          </div>
        ) : roomsQuery.isError ? (
          <div className="p-4">
            <EmptyState
              title="Unable to load rooms"
              message="Rooms endpoint requires a valid entiteId and authorization." 
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Room</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Capacity</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Location</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Updated</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedRooms.length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={6}>
                      No rooms found for this entity.
                    </td>
                  </tr>
                ) : (
                  pagedRooms.map((room) => (
                    <tr key={room.id} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell text-slate-700 dark:text-slate-200">{room.nom}</td>
                      <td className="table-cell text-slate-700 dark:text-slate-200">{room.capacite}</td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{room.localisation ?? 'N/A'}</td>
                      <td className="table-cell">
                        <Badge tone={room.active ? 'success' : 'warning'}>{room.active ? 'Active' : 'Disabled'}</Badge>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(room.updatedAt)}</td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditTargetId(room.id)
                              setEditName(room.nom)
                              setEditCapacity(String(room.capacite))
                              setEditLocation(room.localisation ?? '')
                              setEditActive(room.active)
                            }}
                          >
                            Edit
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setDeleteTargetId(room.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <Pagination page={page} pageSize={pageSize} total={filteredRooms.length} onPageChange={setPage} />
          </>
        )}
      </DataTableShell>

      <Modal
        open={createOpen}
        title="Create room"
        subtitle={`Entity #${entiteId}`}
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createRoomMutation.mutate()} disabled={createRoomMutation.isPending || !roomName.trim()}>
              {createRoomMutation.isPending ? 'Creating...' : 'Create room'}
            </Button>
          </div>
        }
      >
        <TextInput label="Room name" value={roomName} onChange={(event) => setRoomName(event.target.value)} />
        <TextInput
          label="Capacity"
          value={roomCapacity}
          onChange={(event) => setRoomCapacity(event.target.value)}
          placeholder="50"
        />
        <TextInput
          label="Location"
          value={roomLocation}
          onChange={(event) => setRoomLocation(event.target.value)}
        />
      </Modal>

      <Modal
        open={editTargetId !== null}
        title="Edit room"
        subtitle={`Room #${editTargetId ?? '-'}`}
        onClose={() => setEditTargetId(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditTargetId(null)}>
              Cancel
            </Button>
            <Button onClick={() => updateRoomMutation.mutate()} disabled={updateRoomMutation.isPending || !editName.trim()}>
              {updateRoomMutation.isPending ? 'Updating...' : 'Update room'}
            </Button>
          </div>
        }
      >
        <TextInput label="Room name" value={editName} onChange={(event) => setEditName(event.target.value)} />
        <TextInput label="Capacity" value={editCapacity} onChange={(event) => setEditCapacity(event.target.value)} />
        <TextInput
          label="Location"
          value={editLocation}
          onChange={(event) => setEditLocation(event.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={editActive} onChange={(event) => setEditActive(event.target.checked)} />
          Active
        </label>
      </Modal>

      <Modal
        open={decisionOpen}
        title="Moderate request by id"
        subtitle="Approve or reject an operational request."
        onClose={() => setDecisionOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDecisionOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={decisionMode === 'APPROVE' ? 'primary' : 'danger'}
              onClick={() => requestDecisionMutation.mutate()}
              disabled={requestDecisionMutation.isPending || !decisionRequestId.trim()}
            >
              {requestDecisionMutation.isPending
                ? 'Submitting...'
                : decisionMode === 'APPROVE'
                  ? 'Approve request'
                  : 'Reject request'}
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <TextInput
            label="Request id"
            value={decisionRequestId}
            onChange={(event) => setDecisionRequestId(event.target.value)}
            placeholder="1001"
          />
          <div className="grid grid-cols-2 gap-2 self-end">
            <Button variant={decisionMode === 'APPROVE' ? 'primary' : 'secondary'} onClick={() => setDecisionMode('APPROVE')}>
              <Check size={14} />
              Approve
            </Button>
            <Button variant={decisionMode === 'REJECT' ? 'danger' : 'secondary'} onClick={() => setDecisionMode('REJECT')}>
              <X size={14} />
              Reject
            </Button>
          </div>
        </div>
        <TextArea
          label="Decision comment"
          value={decisionComment}
          onChange={(event) => setDecisionComment(event.target.value)}
          placeholder="Optional decision reason"
        />
      </Modal>

      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Delete room"
        description={`Delete room #${deleteTargetId ?? '-'}. This operation cannot be undone.`}
        confirmLabel="Delete room"
        tone="danger"
        busy={deleteRoomMutation.isPending}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (!deleteTargetId) {
            return
          }

          deleteRoomMutation.mutate(deleteTargetId)
        }}
      />

      <section className="panel p-4">
        <div className="mb-4 flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Building2 size={16} />
          <p className="text-sm">Requests submitted from the web client for this entity now appear below.</p>
        </div>

        {requestsQuery.isLoading ? (
          <Loader label="Loading requests..." />
        ) : requestsQuery.isError ? (
          <EmptyState title="Unable to load requests" message="The request history endpoint is not reachable." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Request</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">User</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Submitted</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Decision</th>
                </tr>
              </thead>
              <tbody>
                {(requestsQuery.data ?? []).length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={5}>
                      No requests found for this entity yet.
                    </td>
                  </tr>
                ) : (
                  (requestsQuery.data ?? []).map((request) => (
                    <tr key={request.id} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{request.objet}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">#{request.id}</p>
                          {request.description ? (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{request.description}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="table-cell text-slate-700 dark:text-slate-200">#{request.demandeurUtilisateurId}</td>
                      <td className="table-cell">
                        <Badge
                          tone={
                            request.status === 'APPROVED'
                              ? 'success'
                              : request.status === 'REJECTED'
                                ? 'warning'
                                : 'info'
                          }
                        >
                          {request.status}
                        </Badge>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">
                        {formatDateTime(request.submittedAt ?? request.createdAt)}
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">
                        {request.decisionCommentaire ?? (request.decideurUtilisateurId ? `By #${request.decideurUtilisateurId}` : 'Pending')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
