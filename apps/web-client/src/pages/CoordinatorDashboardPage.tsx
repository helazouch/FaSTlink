import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  AlertTriangle,
  BarChart3,
  Check,
  Clock3,
  DoorOpen,
  HardDrive,
  Loader2,
  MonitorCheck,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PermissionAwareButton } from '../components/auth/PermissionAwareButton'
import { EmptyState } from '../components/role/EmptyState'
import { MetricCard } from '../components/role/MetricCard'
import {
  coordinatorAlerts,
  type CoordinatorAlert,
} from '../data/coordinatorMockData'
import { formatRelativeTime } from '../lib/date'
import { normalizeApiError } from '../lib/errors'
import {
  approveRequest,
  getCoordinatorRequests,
  markRequestUnderReview,
  rejectRequest,
  type AssignedRoomInput,
} from '../services/social/requestService'
import {
  coordinatorAnalyticsService,
  type CrossEntityDay,
  type DecisionTimeAnalytics,
  type EngagementLiftAnalytics,
  type EntityHealthAnalytics,
  type EntityHealthItem,
} from '../services/coordinatorAnalyticsService'
import type { ServiceRequest } from '../types/social'

type Loadable<T> = {
  data: T
  isLoading: boolean
  error: string | null
  reload: () => void
}

type RequestFilter = 'all' | ServiceRequest['status'] | 'MATERIAL_REQUEST' | 'ROOM_RESERVATION'
type PendingDecision = {
  request: ServiceRequest
  action: 'approve' | 'reject'
}

const analyticsQueryOptions = {
  staleTime: 30_000,
  refetchInterval: 60_000,
}

const useCrossEntityWeeklyAnalytics = () =>
  useQuery({
    queryKey: ['coordinator-analytics', 'cross-entity-weekly'],
    queryFn: coordinatorAnalyticsService.getCrossEntityWeekly,
    ...analyticsQueryOptions,
  })

const useEngagementLiftAnalytics = () =>
  useQuery({
    queryKey: ['coordinator-analytics', 'engagement-lift'],
    queryFn: coordinatorAnalyticsService.getEngagementLift,
    ...analyticsQueryOptions,
  })

const useDecisionTimeAnalytics = () =>
  useQuery({
    queryKey: ['coordinator-analytics', 'decision-time'],
    queryFn: coordinatorAnalyticsService.getDecisionTime,
    ...analyticsQueryOptions,
  })

const useEntityHealthAnalytics = () =>
  useQuery({
    queryKey: ['coordinator-analytics', 'entity-health'],
    queryFn: coordinatorAnalyticsService.getEntityHealth,
    ...analyticsQueryOptions,
  })

const useRequestMetricsAnalytics = () =>
  useQuery({
    queryKey: ['coordinator-analytics', 'request-metrics'],
    queryFn: coordinatorAnalyticsService.getRequestMetrics,
    ...analyticsQueryOptions,
  })

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const simulateCoordinatorLoad = async <T,>(data: T): Promise<T> => {
  await delay(260)
  return structuredClone(data)
}

const simulateCoordinatorMutation = async () => {
  await delay(360)
}

const useCoordinatorResource = <T,>(initialData: T): Loadable<T> => {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    simulateCoordinatorLoad(initialData)
      .then((loadedData) => {
        if (isMounted) {
          setData(loadedData)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Coordinator operations could not be loaded. Please retry.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [initialData, reloadKey])

  const reload = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setReloadKey((current) => current + 1)
  }, [])

  return { data, isLoading, error, reload }
}

const statusTone: Record<ServiceRequest['status'], string> = {
  submitted: 'bg-amber-50 text-amber-700 ring-amber-200',
  under_review: 'bg-sky-50 text-sky-700 ring-sky-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
}

const statusLabel: Record<ServiceRequest['status'], string> = {
  submitted: 'New request',
  under_review: 'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
}

const priorityTone = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-sky-50 text-sky-700',
  high: 'bg-rose-50 text-rose-700',
}

const entityHealthTone: Record<EntityHealthItem['status'], string> = {
  HEALTHY: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  LOW_PARTICIPATION: 'bg-amber-50 text-amber-700 ring-amber-200',
  INACTIVE: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const formatDuration = (seconds: number) => {
  if (seconds <= 0) return '0m'
  if (seconds < 3_600) return `${Math.round(seconds / 60)}m`
  const hours = seconds / 3_600
  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`
}

const formatTrend = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`

const analyticsErrorMessage = 'Coordinator analytics could not be loaded from analytics-service. Please retry.'

const requestTypeIcon = {
  ROOM_RESERVATION: DoorOpen,
  MATERIAL_REQUEST: HardDrive,
  room: DoorOpen,
  equipment: HardDrive,
  budget: Workflow,
  moderation: ShieldCheck,
}

const LoadingPanel = () => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
      <Loader2 className="animate-spin text-brand" size={16} />
      Loading coordinator operations
    </div>
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  </section>
)

const ErrorPanel = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle size={18} />
        </span>
        <div>
          <h2 className="font-bold text-slate-900">Coordinator data unavailable</h2>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white transition hover:bg-brand/90"
      >
        <RefreshCw size={15} />
        Retry
      </button>
    </div>
  </section>
)

const StatusBadge = ({ status }: { status: ServiceRequest['status'] }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusTone[status]}`}>
    {statusLabel[status]}
  </span>
)

const PriorityBadge = ({ priority }: { priority: ServiceRequest['priority'] }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${priorityTone[priority]}`}>
    {priority}
  </span>
)

const RequestQueue = ({ compact = false }: { compact?: boolean }) => {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<RequestFilter>('all')
  const [notice, setNotice] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [roomAssignments, setRoomAssignments] = useState<Record<number, Record<number, string>>>({})
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)
  const [modalNote, setModalNote] = useState('')

  const requestsQuery = useQuery({
    queryKey: ['requests', 'coordinator-queue'],
    queryFn: () => getCoordinatorRequests(),
  })
  const requests = requestsQuery.data ?? []

  const actionMutation = useMutation({
    mutationFn: async (input: { id: number; action: 'under_review' | 'approve' | 'reject'; note?: string }) => {
      const note = input.note ?? notes[input.id] ?? ''
      if (input.action === 'under_review') return markRequestUnderReview(input.id, note)
      if (input.action === 'reject') return rejectRequest(input.id, note)
      const request = requests.find((item) => item.id === input.id)
      const assignedRooms: AssignedRoomInput[] = request?.rooms.map((room) => ({
        reservationId: room.id,
        nomSalleAttribuee: roomAssignments[input.id]?.[room.id] ?? room.nomSalleAttribuee ?? '',
      })) ?? []
      return approveRequest(input.id, note, assignedRooms)
    },
    onSuccess: (_, variables) => {
      setNotice(
        variables.action === 'approve'
          ? 'Request approved.'
          : variables.action === 'reject'
            ? 'Request rejected.'
            : 'Request marked under review.',
      )
      setPendingDecision(null)
      setModalNote('')
      if (variables.note !== undefined) {
        setNotes((current) => ({ ...current, [variables.id]: variables.note ?? '' }))
      }
      void queryClient.invalidateQueries({ queryKey: ['requests', 'coordinator-queue'] })
    },
  })

  const filteredRequests = requests.filter((request) => filter === 'all' || request.status === filter || request.type === filter)
  const visibleRequests = compact ? filteredRequests.slice(0, 3) : filteredRequests

  if (requestsQuery.isLoading) return <LoadingPanel />
  if (requestsQuery.error) return <ErrorPanel message={`Request queue unavailable: ${normalizeApiError(requestsQuery.error).message}`} onRetry={() => void requestsQuery.refetch()} />

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Request processing queue</h2>
          <p className="text-sm text-slate-500">Coordinator decisions for cross-entity operations.</p>
        </div>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
          {requests.filter((request) => request.status === 'submitted' || request.status === 'under_review').length} open
        </span>
      </div>

      {!compact && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {(['all', 'under_review', 'approved', 'rejected', 'ROOM_RESERVATION', 'MATERIAL_REQUEST'] as RequestFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={[
                'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition',
                filter === item ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-brand/10 hover:text-brand',
              ].join(' ')}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {notice && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{notice}</p>}
      {actionMutation.error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{normalizeApiError(actionMutation.error).message}</p>}

      {visibleRequests.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Workflow} title="No matching requests" description="Change the queue filter or retry loading operations." />
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {visibleRequests.map((request) => {
            const Icon = requestTypeIcon[request.type]
            const isProcessing = actionMutation.isPending && actionMutation.variables?.id === request.id
            const isFinal = request.status === 'approved' || request.status === 'rejected'
            const canProcess = request.status === 'submitted' || request.status === 'under_review'
            const noteValue = notes[request.id] ?? request.note ?? ''
            return (
              <article key={request.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="grid gap-4 lg:grid-cols-[1.35fr,0.8fr,0.95fr]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={request.status} />
                      <PriorityBadge priority={request.priority} />
                    </div>
                    <h3 className="mt-3 font-bold text-slate-900">{request.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{request.description}</p>
                    <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-2">
                      <span>Requester: user #{request.requesterUserId}</span>
                      <span>Created: {formatRelativeTime(request.createdAt)}</span>
                      <span>Entity: {request.communityName}</span>
                      <span>Raw status: {request.rawStatus}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Request type</p>
                    <div className="mt-2 rounded-2xl bg-white p-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        <Icon size={13} />
                        {request.category}
                      </span>
                      {request.type === 'ROOM_RESERVATION' && request.rooms.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {request.rooms.map((room) => (
                            <input
                              key={room.id}
                              value={roomAssignments[request.id]?.[room.id] ?? room.nomSalleAttribuee ?? ''}
                              onChange={(event) =>
                                setRoomAssignments((current) => ({
                                  ...current,
                                  [request.id]: {
                                    ...current[request.id],
                                    [room.id]: event.target.value,
                                  },
                                }))
                              }
                              disabled={isFinal}
                              placeholder={`Room for capacity ${room.capaciteSouhaitee ?? '-'}`}
                              className="h-8 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-brand disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Treatment note</p>
                    <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-white p-3">
                        <textarea
                          value={noteValue}
                          onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                          disabled={isFinal}
                          placeholder="Treatment note"
                          className="min-h-20 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand disabled:bg-slate-100 disabled:text-slate-500"
                        />
                        {isFinal ? (
                          <p className="rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-600">
                            Final decision: {statusLabel[request.status]}
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {request.status === 'submitted' ? (
                              <PermissionAwareButton
                                globalRole="COORDINATOR"
                                disabled={isProcessing}
                                onClick={() => actionMutation.mutate({ id: request.id, action: 'under_review' })}
                                className="inline-flex h-8 items-center gap-1 rounded-lg bg-sky-50 px-2.5 text-xs font-bold text-sky-700 transition hover:bg-sky-100 disabled:opacity-40"
                              >
                                {isProcessing ? <Loader2 className="animate-spin" size={13} /> : <Clock3 size={13} />}
                                Review
                              </PermissionAwareButton>
                            ) : null}
                            <PermissionAwareButton
                              globalRole="COORDINATOR"
                              disabled={!canProcess || isProcessing}
                              onClick={() => {
                                setModalNote(noteValue)
                                setPendingDecision({ request, action: 'approve' })
                              }}
                              className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
                            >
                              <Check size={13} />
                              Approve
                            </PermissionAwareButton>
                            <PermissionAwareButton
                              globalRole="COORDINATOR"
                              disabled={!canProcess || isProcessing}
                              onClick={() => {
                                setModalNote(noteValue)
                                setPendingDecision({ request, action: 'reject' })
                              }}
                              className="inline-flex h-8 items-center gap-1 rounded-lg bg-rose-50 px-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                            >
                              <X size={13} />
                              Reject
                            </PermissionAwareButton>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {pendingDecision ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  {pendingDecision.action === 'approve' ? 'Approve request' : 'Reject request'}
                </p>
                <h3 className="mt-2 text-lg font-black text-slate-900">{pendingDecision.request.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{pendingDecision.request.communityName}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!actionMutation.isPending) {
                    setPendingDecision(null)
                    setModalNote('')
                  }
                }}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                Treatment note
              </span>
              <textarea
                value={modalNote}
                onChange={(event) => setModalNote(event.target.value)}
                disabled={actionMutation.isPending}
                className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand disabled:bg-slate-100"
                placeholder="Add a coordinator note for this decision"
              />
            </label>
            {actionMutation.error ? (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {normalizeApiError(actionMutation.error).message}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={actionMutation.isPending}
                onClick={() => {
                  setPendingDecision(null)
                  setModalNote('')
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionMutation.isPending}
                onClick={() => actionMutation.mutate({
                  id: pendingDecision.request.id,
                  action: pendingDecision.action,
                  note: modalNote,
                })}
                className={[
                  'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition disabled:opacity-50',
                  pendingDecision.action === 'approve' ? 'bg-brand hover:bg-brand-700' : 'bg-rose-600 hover:bg-rose-700',
                ].join(' ')}
              >
                {actionMutation.isPending ? <Loader2 className="animate-spin" size={15} /> : null}
                {pendingDecision.action === 'approve' ? 'Approve request' : 'Reject request'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

const ResponsiveBarChart = ({ data }: { data: CrossEntityDay[] }) => {
  const maxValue = Math.max(...data.map((point) => Math.max(point.engagement, point.requests)), 1)

  if (data.length === 0) {
    return <EmptyState icon={BarChart3} title="No analytics available" description="Cross-entity analytics will appear when data is available." />
  }

  return (
    <div className="mt-5 overflow-x-auto">
      <div className="flex h-56 min-w-[520px] items-end gap-3">
        {data.map((point) => (
          <div key={point.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end justify-center gap-1 rounded-xl bg-slate-50 px-2 py-2">
              <div className="w-3 rounded-full bg-brand" style={{ height: `${Math.max((point.engagement / maxValue) * 100, 8)}%` }} title={`${point.engagement} engagement events`} />
              <div className="w-3 rounded-full bg-sky-400" style={{ height: `${Math.max((point.requests / maxValue) * 100, 8)}%` }} title={`${point.requests} requests`} />
            </div>
            <span className="text-xs font-semibold text-slate-500">{point.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const AnalyticsChart = () => {
  const analyticsQuery = useCrossEntityWeeklyAnalytics()

  if (analyticsQuery.isLoading) return <LoadingPanel />
  if (analyticsQuery.isError) return <ErrorPanel message={analyticsErrorMessage} onRetry={() => analyticsQuery.refetch()} />

  const analytics = analyticsQuery.data

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Cross-entity analytics</h2>
          <p className="text-sm text-slate-500">Engagement and request pressure across the organization.</p>
        </div>
        <TrendingUp className="text-brand" size={20} />
      </div>
      <ResponsiveBarChart data={analytics?.days ?? []} />
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-brand" /> Engagement</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Requests</span>
        <span>{(analytics?.weeklyEntityActivity ?? 0).toLocaleString()} total weekly activity events</span>
      </div>
    </section>
  )
}

const EntitySupervisionGrid = () => {
  const entityHealthQuery = useEntityHealthAnalytics()

  if (entityHealthQuery.isLoading) return <LoadingPanel />
  if (entityHealthQuery.isError) return <ErrorPanel message={analyticsErrorMessage} onRetry={() => entityHealthQuery.refetch()} />

  const entities = entityHealthQuery.data?.entities ?? []

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Entity supervision</h2>
      {entities.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={MonitorCheck} title="No entity health data" description="Entity health will appear when analytics events are available." />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {entities.map((entity) => (
            <article key={entity.entityId} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800">{entity.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {entity.lastActivityAt ? `Last activity ${formatRelativeTime(entity.lastActivityAt)}` : 'No recorded activity'}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${entityHealthTone[entity.status]}`}>
                  {entity.status.replace('_', ' ').toLowerCase()}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-xl bg-white p-3">
                  <p className="font-bold text-slate-900">{entity.engagement.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Engagement</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="font-bold text-slate-900">{entity.weeklyActivity.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Weekly activity</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="font-bold text-slate-900">{entity.pendingRequests.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Pending requests</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

const OperationalMonitoring = () => {
  const requestMetricsQuery = useRequestMetricsAnalytics()
  const entityHealthQuery = useEntityHealthAnalytics()

  if (requestMetricsQuery.isLoading || entityHealthQuery.isLoading) return <LoadingPanel />
  if (requestMetricsQuery.isError || entityHealthQuery.isError) {
    return <ErrorPanel message={analyticsErrorMessage} onRetry={() => {
      requestMetricsQuery.refetch()
      entityHealthQuery.refetch()
    }} />
  }

  const requestMetrics = requestMetricsQuery.data
  const entityHealth = entityHealthQuery.data
  return (
    <section className="grid gap-3 md:grid-cols-3">
      <MetricCard icon={Workflow} label="Submitted requests" value={`${requestMetrics?.requestsSubmitted ?? 0}`} helper="Total request events" />
      <MetricCard icon={HardDrive} label="Pending queue" value={`${requestMetrics?.pending ?? 0}`} helper="Submitted minus decisions" />
      <MetricCard icon={MonitorCheck} label="Active entities" value={`${entityHealth?.activeEntityPercentage ?? 0}%`} helper="With activity in the last 7 days" />
    </section>
  )
}

const AlertsCenter = ({ compact = false }: { compact?: boolean }) => {
  const alertsResource = useCoordinatorResource(coordinatorAlerts)
  const [alerts, setAlerts] = useState<CoordinatorAlert[]>(coordinatorAlerts)
  const [processingAlertId, setProcessingAlertId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const toneMap = {
    info: 'border-sky-100 bg-sky-50 text-sky-700',
    warning: 'border-amber-100 bg-amber-50 text-amber-700',
    critical: 'border-rose-100 bg-rose-50 text-rose-700',
  }

  const acknowledge = async (id: number) => {
    const previousAlerts = alerts
    setProcessingAlertId(id)
    setError(null)
    setAlerts((current) => current.filter((alert) => alert.id !== id))

    try {
      await simulateCoordinatorMutation()
    } catch {
      setAlerts(previousAlerts)
      setError('The alert could not be acknowledged. Please retry.')
    } finally {
      setProcessingAlertId(null)
    }
  }

  if (alertsResource.isLoading) return <LoadingPanel />
  if (alertsResource.error) return <ErrorPanel message={alertsResource.error} onRetry={alertsResource.reload} />

  const visibleAlerts = compact ? alerts.slice(0, 2) : alerts

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Alerts center</h2>
      {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
      {visibleAlerts.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={AlertTriangle} title="No active alerts" description="Operational alerts will appear here." />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {visibleAlerts.map((alert) => {
            const isProcessing = processingAlertId === alert.id
            return (
              <article key={alert.id} className={`rounded-2xl border p-3 ${toneMap[alert.tone]}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={17} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{alert.title}</p>
                    <p className="mt-1 text-sm opacity-85">{alert.description}</p>
                    <p className="mt-2 text-xs font-semibold opacity-70">{formatRelativeTime(alert.createdAt)}</p>
                    <PermissionAwareButton
                      anyEntityPermission="PUBLICATION_MODERATE"
                      disabled={isProcessing}
                      onClick={() => acknowledge(alert.id)}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-xs font-bold transition hover:bg-white disabled:opacity-50"
                    >
                      {isProcessing && <Loader2 className="animate-spin" size={13} />}
                      Acknowledge
                    </PermissionAwareButton>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export const CoordinatorDashboardPage = () => {
  const crossEntityQuery = useCrossEntityWeeklyAnalytics()
  const requestMetricsQuery = useRequestMetricsAnalytics()
  const entityHealthQuery = useEntityHealthAnalytics()

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Coordinator console</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Organization operations</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">Supervise requests, analytics, moderation, room and equipment operations, and alerts.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Entities monitored" value={(entityHealthQuery.data?.totalEntities ?? 0).toLocaleString()} helper="Loaded from entity analytics" />
        <MetricCard icon={Workflow} label="Pending requests" value={String(requestMetricsQuery.data?.pending ?? 0)} helper="Submitted minus decisions" />
        <MetricCard icon={BarChart3} label="Weekly engagement" value={(crossEntityQuery.data?.weeklyEngagement ?? 0).toLocaleString()} helper="Real cross-entity activity" />
        <MetricCard icon={MonitorCheck} label="Healthy entities" value={`${entityHealthQuery.data?.healthyEntities ?? 0}/${entityHealthQuery.data?.totalEntities ?? 0}`} helper="Above engagement threshold" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.4fr,0.9fr]">
        <RequestQueue compact />
        <AlertsCenter compact />
      </div>

      <OperationalMonitoring />

      <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <AnalyticsChart />
        <EntitySupervisionGrid />
      </div>
    </div>
  )
}

export const CoordinatorRequestsPage = () => (
  <div className="space-y-4">
    <RequestQueue />
  </div>
)

const CoordinatorAnalyticsKpis = () => {
  const engagementLiftQuery = useEngagementLiftAnalytics()
  const decisionTimeQuery = useDecisionTimeAnalytics()
  const entityHealthQuery = useEntityHealthAnalytics()

  if (engagementLiftQuery.isLoading || decisionTimeQuery.isLoading || entityHealthQuery.isLoading) return <LoadingPanel />
  if (engagementLiftQuery.isError || decisionTimeQuery.isError || entityHealthQuery.isError) {
    return <ErrorPanel message={analyticsErrorMessage} onRetry={() => {
      engagementLiftQuery.refetch()
      decisionTimeQuery.refetch()
      entityHealthQuery.refetch()
    }} />
  }

  const engagementLift = engagementLiftQuery.data as EngagementLiftAnalytics
  const decisionTime = decisionTimeQuery.data as DecisionTimeAnalytics
  const entityHealth = entityHealthQuery.data as EntityHealthAnalytics

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <MetricCard
        icon={TrendingUp}
        label="Engagement lift"
        value={formatTrend(engagementLift.growthPercentage)}
        helper={`${engagementLift.currentWeekEngagement.toLocaleString()} this week vs ${engagementLift.previousWeekEngagement.toLocaleString()} prior`}
      />
      <MetricCard
        icon={Clock3}
        label="Decision time"
        value={formatDuration(decisionTime.medianProcessingSeconds)}
        helper={`${decisionTime.processedRequests.toLocaleString()} processed requests`}
      />
      <MetricCard
        icon={BarChart3}
        label="Healthy entities"
        value={`${entityHealth.healthyEntities}/${entityHealth.totalEntities}`}
        helper={`Threshold ${entityHealth.engagementThreshold.toLocaleString()} engagement events`}
      />
    </section>
  )
}

export const CoordinatorAnalyticsPage = () => (
  <div className="space-y-4">
    <AnalyticsChart />
    <CoordinatorAnalyticsKpis />
  </div>
)

export const CoordinatorSupervisionPage = () => (
  <div className="space-y-4">
    <EntitySupervisionGrid />
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Moderation overview</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {['Review flagged publication', 'Escalate repeated issue', 'Mark supervision complete'].map((action) => (
          <PermissionAwareButton
            key={action}
            anyEntityPermission="PUBLICATION_MODERATE"
            className="justify-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-brand/30 hover:bg-brand/5"
          >
            {action}
          </PermissionAwareButton>
        ))}
      </div>
    </section>
  </div>
)

export const CoordinatorAlertsPage = () => (
  <div className="space-y-4">
    <AlertsCenter />
  </div>
)
