import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { DataTableShell } from '../components/table/DataTableShell'
import { Pagination } from '../components/table/Pagination'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { Modal } from '../components/ui/Modal'
import { TextArea } from '../components/ui/TextArea'
import { TextInput } from '../components/ui/TextInput'
import { appendAuditEntry } from '../lib/auditTrail'
import { normalizeApiError } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import { createPublication, listPublications } from '../services/domain/operationsService'
import { useAuthStore } from '../stores/authStore'

export const PublicationsPage = () => {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((state) => state.user?.id ?? 0)

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [userId, setUserId] = useState(String(currentUserId || ''))
  const [entityIdsRaw, setEntityIdsRaw] = useState('1')
  const [content, setContent] = useState('')

  const pageSize = 10

  const publicationsQuery = useQuery({
    queryKey: ['publications', page, pageSize, search],
    queryFn: () => listPublications({ page, pageSize, search }),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: () => {
      const parsedUserId = Number(userId)
      const entiteIds = entityIdsRaw
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((value) => Number.isFinite(value) && value > 0)

      return createPublication({
        utilisateurId: parsedUserId,
        entiteIds,
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
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-surface-700 md:grid-cols-[1fr,160px]">
          <TextInput
            label="Search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Search content"
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
              title="Publication listing endpoint unavailable"
              message="POST publication is available, but GET /v1/publications is not exposed in this backend build."
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Id</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">User</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Entities</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Content</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Created</th>
                </tr>
              </thead>
              <tbody>
                {(publicationsQuery.data?.items ?? []).length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={5}>
                      No publications in current page.
                    </td>
                  </tr>
                ) : (
                  (publicationsQuery.data?.items ?? []).map((publication) => (
                    <tr key={publication.id} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell text-slate-700 dark:text-slate-200">#{publication.id}</td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">#{publication.utilisateurId}</td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">
                        {publication.entiteIds.length === 0 ? 'None' : publication.entiteIds.join(', ')}
                      </td>
                      <td className="table-cell text-slate-700 dark:text-slate-200">
                        <p className="line-clamp-2 max-w-xl">{publication.contenu}</p>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(publication.createdAt)}</td>
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
              disabled={createMutation.isPending || !content.trim() || !userId.trim()}
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        }
      >
        <TextInput label="User id" value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="1" />
        <TextInput
          label="Entity ids"
          value={entityIdsRaw}
          onChange={(event) => setEntityIdsRaw(event.target.value)}
          placeholder="1,2"
        />
        <TextArea
          label="Content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Publication content"
        />
      </Modal>
    </div>
  )
}
