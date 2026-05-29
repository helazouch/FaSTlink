import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DataTableShell } from '../components/table/DataTableShell'
import { Pagination } from '../components/table/Pagination'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { Modal } from '../components/ui/Modal'
import { SelectInput } from '../components/ui/SelectInput'
import { TextArea } from '../components/ui/TextArea'
import { TextInput } from '../components/ui/TextInput'
import { env } from '../config/env'
import { appendAuditEntry } from '../lib/auditTrail'
import { normalizeApiError } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import {
  assignEntityMember,
  createEntity,
  deleteEntity,
  listEntities,
  listEntityMembers,
  updateEntity,
} from '../services/domain/operationsService'

const ENTITY_ROLES = ['OWNER', 'COORDINATOR', 'MANAGER', 'MEMBER', 'VIEWER']

export const EntitiesPage = () => {
  const queryClient = useQueryClient()

  const [entityIdInput, setEntityIdInput] = useState(String(env.defaultEntityId))
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState('')
  const [assignRole, setAssignRole] = useState('MEMBER')

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')

  const [updateOpen, setUpdateOpen] = useState(false)
  const [updateName, setUpdateName] = useState('')
  const [updateDescription, setUpdateDescription] = useState('')

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const entityId = useMemo(() => {
    const parsed = Number(entityIdInput)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }, [entityIdInput])

  const membersQuery = useQuery({
    queryKey: ['entity-members', entityId],
    queryFn: () => listEntityMembers(entityId),
    enabled: entityId > 0,
  })

  const entitiesQuery = useQuery({
    queryKey: ['entities'],
    queryFn: listEntities,
  })

  const filteredMembers = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    const items = membersQuery.data ?? []

    if (!normalized) {
      return items
    }

    return items.filter((item) => {
      return (
        String(item.utilisateurId).includes(normalized) || item.role.toLowerCase().includes(normalized)
      )
    })
  }, [membersQuery.data, search])

  const entityRecords = entitiesQuery.data ?? []

  useEffect(() => {
    if (entityRecords.length === 0) {
      return
    }

    const currentEntityId = Number(entityIdInput)
    const selectedEntityExists = entityRecords.some((entity) => entity.id === currentEntityId)
    if (!selectedEntityExists) {
      setEntityIdInput(String(entityRecords[0].id))
    }
  }, [entityIdInput, entityRecords])

  const pageSize = 8
  const paginatedMembers = filteredMembers.slice(page * pageSize, page * pageSize + pageSize)

  const assignMutation = useMutation({
    mutationFn: ({ entiteId, utilisateurId, role }: { entiteId: number; utilisateurId: number; role: string }) =>
      assignEntityMember(entiteId, utilisateurId, role),
    onSuccess: (_, variables) => {
      appendAuditEntry('ASSIGN_ENTITY_MEMBER', 'entity', String(variables.entiteId), 'SUCCESS', `User ${variables.utilisateurId}`)
      setAssignOpen(false)
      setAssignUserId('')
      void queryClient.invalidateQueries({ queryKey: ['entity-members', entityId] })
      setErrorMessage(null)
    },
    onError: (error, variables) => {
      appendAuditEntry('ASSIGN_ENTITY_MEMBER', 'entity', String(variables.entiteId), 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const createMutation = useMutation({
    mutationFn: () => createEntity({ nom: createName, description: createDescription }),
    onSuccess: (created) => {
      appendAuditEntry('CREATE_ENTITY', 'entity', String(created.id), 'SUCCESS', createName)
      setCreateOpen(false)
      setCreateName('')
      setCreateDescription('')
      setEntityIdInput(String(created.id))
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['entities'] })
      void queryClient.invalidateQueries({ queryKey: ['entity-members', created.id] })
    },
    onError: (error) => {
      appendAuditEntry('CREATE_ENTITY', 'entity', 'new', 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => updateEntity(entityId, { nom: updateName, description: updateDescription }),
    onSuccess: () => {
      appendAuditEntry('UPDATE_ENTITY', 'entity', String(entityId), 'SUCCESS', updateName)
      setUpdateOpen(false)
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['entities'] })
      void queryClient.invalidateQueries({ queryKey: ['entity-members', entityId] })
    },
    onError: (error) => {
      appendAuditEntry('UPDATE_ENTITY', 'entity', String(entityId), 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteEntity(entityId),
    onSuccess: () => {
      appendAuditEntry('DELETE_ENTITY', 'entity', String(entityId), 'SUCCESS', 'Entity deleted')
      setDeleteOpen(false)
      setErrorMessage(null)
      void queryClient.removeQueries({ queryKey: ['entity-members', entityId] })
      void queryClient.invalidateQueries({ queryKey: ['entities'] })
    },
    onError: (error) => {
      appendAuditEntry('DELETE_ENTITY', 'entity', String(entityId), 'FAILED', normalizeApiError(error).message)
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
        title="Entities"
        subtitle="Inspect entity members and manage entity records with role assignment."
        toolbar={
          <>
            <Button variant="secondary" onClick={() => void queryClient.invalidateQueries({ queryKey: ['entity-members', entityId] })}>
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button variant="secondary" onClick={() => setCreateOpen(true)}>
              <Plus size={14} />
              New entity
            </Button>
            <Button variant="secondary" onClick={() => setUpdateOpen(true)} disabled={entityId <= 0}>
              Update entity
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)} disabled={entityId <= 0}>
              Delete
            </Button>
          </>
        }
      >
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-surface-700 md:grid-cols-[160px,1fr,220px]">
          <TextInput
            label="Entity id"
            value={entityIdInput}
            onChange={(event) => setEntityIdInput(event.target.value)}
            placeholder="5"
          />
          <TextInput
            label="Filter members"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="User id or role"
          />
          <Button className="self-end" onClick={() => setAssignOpen(true)} disabled={entityId <= 0}>
            <Plus size={14} />
            Assign member
          </Button>
        </div>

        <div className="border-b border-slate-200 p-4 dark:border-surface-700">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Available entities</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select an entity to inspect members or continue admin actions.
              </p>
            </div>
            <Badge tone="info">{entityRecords.length} entities</Badge>
          </div>
          {entitiesQuery.isLoading ? (
            <Loader label="Loading entities..." />
          ) : entitiesQuery.isError ? (
            <EmptyState title="Unable to load entities" message="The entity list endpoint is not reachable." />
          ) : entityRecords.length === 0 ? (
            <EmptyState title="No entities yet" message="Create your first entity to begin assigning members." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {entityRecords.map((entity) => (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => setEntityIdInput(String(entity.id))}
                  className={`rounded-2xl border p-4 text-left transition ${
                    entity.id === entityId
                      ? 'border-brand-500 bg-brand-50/80 shadow-sm dark:border-brand-400 dark:bg-brand-500/10'
                      : 'border-slate-200 bg-white hover:border-brand-300 dark:border-surface-700 dark:bg-surface-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{entity.nom}</p>
                    <Badge tone={entity.id === entityId ? 'info' : 'neutral'}>#{entity.id}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {entity.description ?? 'No description'}
                  </p>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Updated {formatDateTime(entity.updatedAt)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {membersQuery.isLoading ? (
          <div className="p-4">
            <Loader label="Loading entity members..." />
          </div>
        ) : membersQuery.isError ? (
          <div className="p-4">
            <EmptyState
              title="Unable to fetch entity members"
              message="Check the selected entity id and ensure API permissions are valid."
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">User id</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Role</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Created</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Updated</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={4}>
                      No members found for this entity.
                    </td>
                  </tr>
                ) : (
                  paginatedMembers.map((member) => (
                    <tr key={member.id} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell text-slate-700 dark:text-slate-200">#{member.utilisateurId}</td>
                      <td className="table-cell">
                        <Badge tone={member.role === 'OWNER' || member.role === 'COORDINATOR' ? 'info' : 'neutral'}>
                          {member.role}
                        </Badge>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(member.createdAt)}</td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(member.updatedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={filteredMembers.length} onPageChange={setPage} />
          </>
        )}
      </DataTableShell>

      <Modal
        open={assignOpen}
        title="Assign entity member"
        subtitle={`Entity #${entityId}`}
        onClose={() => setAssignOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const userId = Number(assignUserId)
                if (!Number.isFinite(userId) || userId <= 0 || entityId <= 0) {
                  setErrorMessage('User id and entity id must be valid positive numbers.')
                  return
                }

                assignMutation.mutate({ entiteId: entityId, utilisateurId: userId, role: assignRole })
              }}
              disabled={assignMutation.isPending}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign member'}
            </Button>
          </div>
        }
      >
        <TextInput
          label="User id"
          value={assignUserId}
          onChange={(event) => setAssignUserId(event.target.value)}
          placeholder="12"
        />
        <SelectInput
          label="Member role"
          value={assignRole}
          onChange={(event) => setAssignRole(event.target.value)}
          options={ENTITY_ROLES.map((role) => ({ label: role, value: role }))}
        />
      </Modal>

      <Modal
        open={createOpen}
        title="Create entity"
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !createName.trim()}>
              {createMutation.isPending ? 'Creating...' : 'Create entity'}
            </Button>
          </div>
        }
      >
        <TextInput label="Name" value={createName} onChange={(event) => setCreateName(event.target.value)} />
        <TextArea
          label="Description"
          value={createDescription}
          onChange={(event) => setCreateDescription(event.target.value)}
        />
      </Modal>

      <Modal
        open={updateOpen}
        title="Update entity"
        subtitle={`Entity #${entityId}`}
        onClose={() => setUpdateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !updateName.trim()}>
              {updateMutation.isPending ? 'Updating...' : 'Update entity'}
            </Button>
          </div>
        }
      >
        <TextInput label="Name" value={updateName} onChange={(event) => setUpdateName(event.target.value)} />
        <TextArea
          label="Description"
          value={updateDescription}
          onChange={(event) => setUpdateDescription(event.target.value)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete entity"
        description={`Confirm permanent deletion of entity #${entityId}.`}
        confirmLabel="Delete"
        tone="danger"
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
