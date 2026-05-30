import { Badge } from '../components/atoms/Badge'
import { RequestSubmissionPanel } from '../components/organisms/RequestSubmissionPanel'
import { useRequestEntities, useRequests, useSubmitRequest } from '../hooks/useSocial'
import { useCurrentEntityContext } from '../hooks/useCurrentEntityContext'
import { useScopedPermissions } from '../hooks/useScopedPermissions'
import { formatDateTime } from '../lib/date'
import { normalizeApiError } from '../lib/errors'

const toneByStatus = {
  submitted: 'warning',
  under_review: 'warning',
  approved: 'success',
  rejected: 'alert',
} as const

const labelByStatus = {
  submitted: 'En cours d’etude',
  under_review: 'En cours d’etude',
  approved: 'Acceptee',
  rejected: 'Refusee',
} as const

export const RequestsPage = () => {
  const { currentEntityId, currentMembership } = useCurrentEntityContext()
  const scoped = useScopedPermissions()
  const { data: entities = [] } = useRequestEntities()
  const currentEntity = entities.find((entity) => entity.id === currentEntityId) ?? (
    currentEntityId ? {
      id: currentEntityId,
      name: currentMembership?.entityName ?? `Entity #${currentEntityId}`,
      description: '',
      members: 0,
    } : null
  )
  const requestsQuery = useRequests(currentEntityId)
  const requests = requestsQuery.data ?? []
  const submitMutation = useSubmitRequest()

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
      <div className="space-y-4">
        {submitMutation.isSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Request submitted successfully.
          </div>
        ) : null}
        {submitMutation.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {normalizeApiError(submitMutation.error).message}
          </div>
        ) : null}
        <RequestSubmissionPanel
          entity={currentEntity}
          canSubmit={scoped.canSubmitRequests}
          onSubmit={(input) => submitMutation.mutateAsync(input)}
          isSubmitting={submitMutation.isPending}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Submitted requests</h2>
        <div className="mt-3 space-y-3">
          {requestsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading requests...</p>
          ) : requestsQuery.isError ? (
            <p className="text-sm text-red-600">Unable to load submitted requests: {normalizeApiError(requestsQuery.error).message}</p>
          ) : requests.length > 0 ? (
            requests.map((request) => (
              <article key={request.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{request.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{request.category} - {request.communityName}</p>
                  </div>
                  <Badge tone={toneByStatus[request.status]}>{labelByStatus[request.status]}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{request.description}</p>
                <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                  <span>From {request.dateDebut ?? 'n/a'} {request.heureDebut ?? ''}</span>
                  <span>To {request.dateFin ?? 'n/a'} {request.heureFin ?? ''}</span>
                </div>
                {request.materials.length > 0 ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Material: {request.materials.map((item) => `${item.typeMateriel} x${item.quantite}`).join(', ')}
                  </p>
                ) : null}
                {request.rooms.length > 0 ? (
                  <div className="mt-2 text-xs text-slate-500">
                    Rooms: {request.rooms.map((room, index) => (
                      <span key={room.id}>
                        {index > 0 ? ', ' : ''}
                        capacity {room.capaciteSouhaitee ?? '-'}
                        {room.nomSalleAttribuee ? ` -> ${room.nomSalleAttribuee}` : ''}
                      </span>
                    ))}
                  </div>
                ) : null}
                {request.note ? <p className="mt-2 text-xs font-semibold text-slate-600">Coordinator note: {request.note}</p> : null}
                <p className="mt-2 text-xs text-slate-500">Updated {formatDateTime(request.updatedAt)}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">No requests yet for this entity.</p>
          )}
        </div>
      </section>
    </div>
  )
}
