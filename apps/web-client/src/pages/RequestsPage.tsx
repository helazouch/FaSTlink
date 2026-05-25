import { Badge } from '../components/atoms/Badge'
import { RequestSubmissionPanel } from '../components/organisms/RequestSubmissionPanel'
import { useRequestEntities, useRequests, useSubmitRequest } from '../hooks/useSocial'
import { formatDateTime } from '../lib/date'
import { normalizeApiError } from '../lib/errors'

const toneByStatus = {
  pending: 'warning',
  approved: 'success',
  rejected: 'alert',
} as const

export const RequestsPage = () => {
  const { data: entities = [] } = useRequestEntities()
  const requestsQuery = useRequests()
  const requests = requestsQuery.data ?? []
  const submitMutation = useSubmitRequest()

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
      <div className="space-y-4">
        {submitMutation.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {normalizeApiError(submitMutation.error).message}
          </div>
        ) : null}
        <RequestSubmissionPanel
          communities={entities}
          onSubmit={(input) => submitMutation.mutateAsync(input)}
          isSubmitting={submitMutation.isPending}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Submitted requests</h2>
        <div className="mt-3 space-y-3">
          {requestsQuery.isError ? (
            <p className="text-sm text-red-600">{normalizeApiError(requestsQuery.error).message}</p>
          ) : requests.length > 0 ? (
            requests.map((request) => (
              <article key={request.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{request.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{request.category} · {request.communityName}</p>
                  </div>
                  <Badge tone={toneByStatus[request.status]}>{request.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{request.description}</p>
                <p className="mt-2 text-xs text-slate-500">Updated {formatDateTime(request.updatedAt)}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">No requests yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}
