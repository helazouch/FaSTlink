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
import { env } from '../config/env'
import { appendAuditEntry } from '../lib/auditTrail'
import { normalizeApiError } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import { createPublication, listPublications } from '../services/domain/operationsService'
import { useAuthStore } from '../stores/authStore'
import type { PublicationRecord } from '../types/domain'

export const PublicationsPage = () => {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((state) => state.user?.id ?? 0)

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [filterEntityId, setFilterEntityId] = useState('')
  const [filterAuthorId, setFilterAuthorId] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<PublicationRecord | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [publishingEntityId, setPublishingEntityId] = useState(String(env.defaultEntityId))
  const [scope, setScope] = useState<PublicationRecord['scope']>('ALL_USERS')
  const [selectedEntityIdsRaw, setSelectedEntityIdsRaw] = useState('')
  const [content, setContent] = useState('')

  const pageSize = 10

  const publicationsQuery = useQuery({
    queryKey: ['publications', page, pageSize, search, filterEntityId, filterAuthorId],
    queryFn: () =>
      listPublications({
        page,
        pageSize,
        search,
        entityId: Number(filterEntityId) || null,
        authorId: Number(filterAuthorId) || null,
      }),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: () => {
      const parsedPublishingEntityId = Number(publishingEntityId)
      const selectedEntityIds = selectedEntityIdsRaw
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((value) => Number.isFinite(value) && value > 0)

      return createPublication({
        utilisateurId: currentUserId || undefined,
        publishingEntityId: parsedPublishingEntityId,
        scope,
        selectedEntityIds,
        contenu: content,
      })
    },
    onSuccess: (created) => {
      appendAuditEntry('CREATE_PUBLICATION', 'publication', String(created.id), 'SUCCESS', created.contenu)
      setCreateOpen(false)
      setContent('')
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
    onError: (error) => {
      appendAuditEntry('CREATE_PUBLICATION', 'publication', 'new', 'FAILED', normalizeApiError(error).message)
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
        title="Publications"
        subtitle="Review publication stream and create new records through publication-service."
        toolbar={
          <>
            <Button variant="secondary" onClick={() => void queryClient.invalidateQueries({ queryKey: ['publications'] })}>
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={14} />
              New publication
            </Button>
          </>
        }
      >
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-surface-700 md:grid-cols-[1fr,140px,140px,160px]">
          <TextInput
            label="Search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Search content"
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
          <TextInput
            label="Author id"
            value={filterAuthorId}
            onChange={(event) => {
              setFilterAuthorId(event.target.value)
              setPage(0)
            }}
            placeholder="Any"
          />
          <Button variant="secondary" className="self-end" onClick={() => setPage(0)}>
            Apply filter
          </Button>
        </div>

        {publicationsQuery.isLoading ? (
          <div className="p-4">
            <Loader label="Loading publications..." />
          </div>
        ) : publicationsQuery.isError ? (
          <div className="p-4">
            <EmptyState
              title="Unable to load publications"
              message={normalizeApiError(publicationsQuery.error).message}
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Id</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">User</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Scope</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Entities</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Content</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Created</th>
                  <th className="table-cell text-right font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(publicationsQuery.data?.items ?? []).length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={7}>
                      No publications in current page.
                    </td>
                  </tr>
                ) : (
                  (publicationsQuery.data?.items ?? []).map((publication) => (
                    <tr key={publication.id} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell text-slate-700 dark:text-slate-200">#{publication.id}</td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {publication.authorName ?? `User #${publication.utilisateurId}`}
                        </p>
                        {publication.authorEmail ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{publication.authorEmail}</p>
                        ) : null}
                        <p className="text-xs text-slate-500 dark:text-slate-400">#{publication.utilisateurId}</p>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">
                        <Badge tone="info">{publication.scope}</Badge>
                        {publication.publishingEntityId ? (
                          <p className="mt-1 text-xs text-slate-500">Publisher entity #{publication.publishingEntityId}</p>
                        ) : null}
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">
                        <div className="flex flex-wrap gap-1">
                          {publication.entiteIds.length === 0 ? (
                            <span>None</span>
                          ) : (
                            publication.entiteIds.map((entityId, index) => (
                              <Badge key={entityId} tone="neutral">
                                {publication.entityNames[index] ?? `Entity #${entityId}`} #{entityId}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-slate-700 dark:text-slate-200">
                        <p className="line-clamp-2 max-w-xl">{publication.contenu}</p>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(publication.createdAt)}</td>
                      <td className="table-cell text-right">
                        <Button variant="secondary" onClick={() => setDetailTarget(publication)}>
                          View
                        </Button>
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
              onPageChange={setPage}
            />
          </>
        )}
      </DataTableShell>

      <Modal
        open={createOpen}
        title="Create publication"
        subtitle="This action writes directly to publication-service."
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={
                createMutation.isPending ||
                !content.trim() ||
                !Number.isFinite(Number(publishingEntityId)) ||
                Number(publishingEntityId) <= 0 ||
                (scope === 'SELECTED_ENTITIES' && selectedEntityIdsRaw.trim().length === 0)
              }
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        }
      >
        <TextInput
          label="Publishing entity id"
          value={publishingEntityId}
          onChange={(event) => setPublishingEntityId(event.target.value)}
          placeholder="1"
        />
        <SelectInput
          label="Scope"
          value={scope}
          onChange={(event) => setScope(event.target.value as PublicationRecord['scope'])}
          options={[
            { label: 'All users', value: 'ALL_USERS' },
            { label: 'All entities', value: 'ALL_ENTITIES' },
            { label: 'My entity', value: 'MY_ENTITY' },
            { label: 'Selected entities', value: 'SELECTED_ENTITIES' },
          ]}
        />
        <TextInput
          label="Selected entity ids"
          value={selectedEntityIdsRaw}
          onChange={(event) => setSelectedEntityIdsRaw(event.target.value)}
          placeholder="Required only for SELECTED_ENTITIES, e.g. 1,2"
          disabled={scope !== 'SELECTED_ENTITIES'}
        />
        <TextArea
          label="Content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Publication content"
        />
      </Modal>

      <Modal
        open={detailTarget !== null}
        title={detailTarget ? `Publication #${detailTarget.id}` : 'Publication details'}
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
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Author</p>
              <p>{detailTarget.authorName ?? `User #${detailTarget.utilisateurId}`}</p>
              {detailTarget.authorEmail ? <p className="text-slate-500">{detailTarget.authorEmail}</p> : null}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Scope</p>
              <p>
                {detailTarget.scope}
                {detailTarget.publishingEntityId ? ` from entity #${detailTarget.publishingEntityId}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Entities</p>
              <p>
                {detailTarget.entiteIds.length === 0
                  ? 'None'
                  : detailTarget.entiteIds
                      .map((entityId, index) => `${detailTarget.entityNames[index] ?? `Entity #${entityId}`} (#${entityId})`)
                      .join(', ')}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Content</p>
              <p className="whitespace-pre-wrap">{detailTarget.contenu}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <p>Created: {formatDateTime(detailTarget.createdAt)}</p>
              <p>Updated: {formatDateTime(detailTarget.updatedAt)}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
