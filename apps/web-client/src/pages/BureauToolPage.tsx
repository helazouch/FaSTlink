import {
  AlertTriangle,
  Archive,
  BarChart3,
  CalendarPlus,
  Check,
  Edit3,
  EyeOff,
  Loader2,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PermissionAwareButton } from '../components/auth/PermissionAwareButton'
import { EmptyState } from '../components/role/EmptyState'
import { MetricCard } from '../components/role/MetricCard'
import { RolePanel } from '../components/role/RolePanel'
import {
  createBureauSeed,
  type BureauEvent,
  type BureauEventStatus,
  type BureauMember,
  type BureauModerationItem,
  type BureauModerationStatus,
  type BureauPublication,
  type BureauPublicationStatus,
} from '../data/bureauMockData'
import { useCurrentEntityContext } from '../hooks/useCurrentEntityContext'
import { useScopedPermissions } from '../hooks/useScopedPermissions'
import { formatRelativeTime } from '../lib/date'

type BureauSeed = ReturnType<typeof createBureauSeed>

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const simulateLoad = async (seed: BureauSeed) => {
  await delay(240)
  return structuredClone(seed)
}

const simulateMutation = async () => {
  await delay(320)
}

const useBureauResource = (seed: BureauSeed, resourceKey: string) => {
  const [state, setState] = useState({
    data: seed,
    isLoading: true,
    error: null as string | null,
    version: 0,
    key: resourceKey,
  })

  useEffect(() => {
    let isMounted = true

    simulateLoad(seed)
      .then((data) => {
        if (isMounted) {
          setState((current) => ({ ...current, data, isLoading: false, error: null, key: resourceKey }))
        }
      })
      .catch(() => {
        if (isMounted) {
          setState((current) => ({
            ...current,
            isLoading: false,
            error: 'Scoped bureau data could not be loaded. Please retry.',
            key: resourceKey,
          }))
        }
      })

    return () => {
      isMounted = false
    }
  }, [resourceKey, seed, state.version])

  const reload = useCallback(() => {
    setState((current) => ({ ...current, isLoading: true, error: null, version: current.version + 1 }))
  }, [])

  return {
    data: state.data,
    isLoading: state.isLoading || state.key !== resourceKey,
    error: state.error,
    reload,
  }
}

const toolMeta = {
  '/bureau/publish': {
    title: 'Publication Management',
    permission: 'PUBLICATION_CREATE',
    icon: Megaphone,
  },
  '/bureau/community': {
    title: 'Scoped Moderation',
    permission: 'COMMUNITY_MANAGE',
    icon: MessageSquare,
  },
  '/bureau/members': {
    title: 'Member Management',
    permission: 'ENTITY_MEMBER_MANAGE',
    icon: UserPlus,
  },
  '/bureau/events': {
    title: 'Event Management',
    permission: 'EVENT_CREATE',
    icon: CalendarPlus,
  },
  '/bureau/statistics': {
    title: 'Entity Statistics',
    permission: 'ANALYTICS_VIEW',
    icon: BarChart3,
  },
} as const

const fallbackMeta = {
  title: 'Bureau Tool',
  permission: 'COMMUNITY_MANAGE',
  icon: Users,
}

const LoadingPanel = () => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
      <Loader2 className="animate-spin text-brand" size={16} />
      Loading scoped bureau workspace
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
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
        <p className="text-sm font-semibold text-slate-700">{message}</p>
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

const statusTone = {
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-700',
  archived: 'bg-slate-100 text-slate-600',
  hidden: 'bg-amber-50 text-amber-700',
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
}

const Badge = ({ children, tone }: { children: string; tone: keyof typeof statusTone }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[tone]}`}>{children}</span>
)

const MemberManagement = ({ members, permission }: { members: BureauMember[]; permission: string }) => {
  if (members.length === 0) {
    return <EmptyState icon={Users} title="No members yet" description="Members for the selected entity will appear here." />
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Scoped members</h2>
        <PermissionAwareButton permission={permission} className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white">
          <UserPlus size={15} />
          Invite
        </PermissionAwareButton>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th className="px-3 py-2">Member</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t border-slate-100">
                <td className="px-3 py-3">
                  <p className="font-semibold text-slate-800">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </td>
                <td className="px-3 py-3"><Badge tone={member.role === 'BUREAU_MEMBER' ? 'published' : 'draft'}>{member.role}</Badge></td>
                <td className="px-3 py-3 text-slate-600">{formatRelativeTime(member.joinedAt)}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <PermissionAwareButton permission={permission} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">Edit role</PermissionAwareButton>
                    <PermissionAwareButton permission={permission} className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700">Remove</PermissionAwareButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const EventManagement = ({ events, permission }: { events: BureauEvent[]; permission: string }) => {
  const [items, setItems] = useState(events)

  const updateStatus = async (id: number, status: BureauEventStatus) => {
    const previous = items
    setItems((current) => current.map((event) => (event.id === id ? { ...event, status } : event)))
    try {
      await simulateMutation()
    } catch {
      setItems(previous)
    }
  }

  if (items.length === 0) {
    return <EmptyState icon={CalendarPlus} title="No entity events" description="Create the first event for this scoped entity." />
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Entity events</h2>
        <PermissionAwareButton permission={permission} className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white">
          <CalendarPlus size={15} />
          Create
        </PermissionAwareButton>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {items.map((event) => (
          <article key={event.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-800">{event.title}</h3>
              <Badge tone={event.status}>{event.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500">{new Date(event.date).toLocaleDateString()}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{event.participants} participants</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <PermissionAwareButton permission={permission} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700">
                <Edit3 size={13} />
                Edit
              </PermissionAwareButton>
              <PermissionAwareButton permission={permission} onClick={() => updateStatus(event.id, 'cancelled')} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700">
                <Trash2 size={13} />
                Cancel
              </PermissionAwareButton>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const PublicationManagement = ({ publications, permission }: { publications: BureauPublication[]; permission: string }) => {
  const [items, setItems] = useState(publications)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (id: number, status: BureauPublicationStatus) => {
    const previous = items
    setError(null)
    setItems((current) => current.map((publication) => (publication.id === id ? { ...publication, status } : publication)))
    try {
      await simulateMutation()
    } catch {
      setItems(previous)
      setError('Publication action could not be saved.')
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Publication management</h2>
        <PermissionAwareButton permission={permission} className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white">
          <Megaphone size={15} />
          Publish
        </PermissionAwareButton>
      </div>
      {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
      {items.length === 0 ? (
        <div className="mt-4"><EmptyState icon={Megaphone} title="No publications" description="Entity publications will appear here." /></div>
      ) : (
        <div className="mt-4 grid gap-3">
          {items.map((publication) => (
            <article key={publication.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800">{publication.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{publication.author} - {publication.reactions} reactions - {publication.comments} comments</p>
                </div>
                <Badge tone={publication.status}>{publication.status}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <PermissionAwareButton permission={permission} onClick={() => updateStatus(publication.id, 'published')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                  <Check size={13} />
                  Publish
                </PermissionAwareButton>
                <PermissionAwareButton permission={permission} onClick={() => updateStatus(publication.id, 'hidden')} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700">
                  <EyeOff size={13} />
                  Hide
                </PermissionAwareButton>
                <PermissionAwareButton permission={permission} onClick={() => updateStatus(publication.id, 'archived')} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                  <Archive size={13} />
                  Archive
                </PermissionAwareButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

const StatisticsPanel = ({ data }: { data: BureauSeed }) => {
  const maxValue = Math.max(...data.trend.map((item) => item.value), 1)

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Members" value={String(data.members.length)} helper="Current entity only" />
        <MetricCard icon={CalendarPlus} label="Events" value={String(data.events.length)} helper="Entity events" />
        <MetricCard icon={Megaphone} label="Publications" value={String(data.publications.length)} helper="Local content" />
        <MetricCard icon={AlertTriangle} label="Moderation" value={String(data.moderation.filter((item) => item.status === 'pending').length)} helper="Pending review" />
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Entity activity</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {data.trend.map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 p-3">
              <div className="flex h-32 items-end rounded-xl bg-white px-4 py-3">
                <div className="w-full rounded-t-xl bg-brand" style={{ height: `${Math.max((item.value / maxValue) * 100, 10)}%` }} />
              </div>
              <p className="mt-2 text-sm font-bold text-slate-700">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const ModerationPanel = ({ items, permission }: { items: BureauModerationItem[]; permission: string }) => {
  const [queue, setQueue] = useState(items)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const decide = async (id: number, status: BureauModerationStatus) => {
    const previous = queue
    setProcessingId(id)
    setError(null)
    setQueue((current) => current.map((item) => (item.id === id ? { ...item, status } : item)))
    try {
      await simulateMutation()
    } catch {
      setQueue(previous)
      setError('Moderation action could not be saved.')
    } finally {
      setProcessingId(null)
    }
  }

  if (queue.length === 0) {
    return <EmptyState icon={MessageSquare} title="No moderation items" description="Scoped moderation reports will appear here." />
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Scoped moderation queue</h2>
      {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
      <div className="mt-4 grid gap-3">
        {queue.map((item) => {
          const isProcessing = processingId === item.id
          return (
            <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{item.source} reported by {item.reporter}</p>
                </div>
                <Badge tone={item.status}>{item.status}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <PermissionAwareButton permission={permission} disabled={isProcessing || item.status !== 'pending'} onClick={() => decide(item.id, 'approved')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 disabled:opacity-40">
                  {isProcessing ? <Loader2 className="animate-spin" size={13} /> : <Check size={13} />}
                  Approve
                </PermissionAwareButton>
                <PermissionAwareButton permission={permission} disabled={isProcessing || item.status !== 'pending'} onClick={() => decide(item.id, 'rejected')} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 disabled:opacity-40">
                  {isProcessing ? <Loader2 className="animate-spin" size={13} /> : <X size={13} />}
                  Reject
                </PermissionAwareButton>
                <PermissionAwareButton permission={permission} disabled={isProcessing || item.status !== 'pending'} onClick={() => decide(item.id, 'hidden')} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 disabled:opacity-40">
                  <EyeOff size={13} />
                  Hide
                </PermissionAwareButton>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export const BureauToolPage = () => {
  const location = useLocation()
  const { currentEntityId, currentMembership } = useCurrentEntityContext()
  const scoped = useScopedPermissions()
  const meta = toolMeta[location.pathname as keyof typeof toolMeta] ?? fallbackMeta
  const Icon = meta.icon
  const seed = useMemo(
    () => createBureauSeed(currentEntityId, currentMembership?.entityName ?? `Entity ${currentEntityId ?? ''}`),
    [currentEntityId, currentMembership?.entityName],
  )
  const resource = useBureauResource(seed, `${currentEntityId ?? 'none'}:${location.pathname}`)
  const panelKey = `${currentEntityId ?? 'none'}:${location.pathname}`

  if (!scoped.isBureauMember) {
    return (
      <EmptyState
        icon={Users}
        title="No bureau access for this entity"
        description="Select an entity where your current role is BUREAU_MEMBER."
      />
    )
  }

  return (
    <div className="space-y-4">
      <RolePanel
        eyebrow="Bureau only"
        title={meta.title}
        description={`${meta.title} is scoped to ${currentMembership?.entityName ?? `entity ${currentEntityId}`} and appears only for BUREAU_MEMBER context.`}
      />
      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard icon={Icon} label="Scope" value="Local" helper="Current entity only" />
        <MetricCard icon={Users} label="Role" value="Bureau" helper="No coordinator inheritance" />
        <MetricCard icon={BarChart3} label="Status" value="Scoped" helper="Backend validates every write" />
      </section>

      {resource.isLoading && <LoadingPanel />}
      {resource.error && <ErrorPanel message={resource.error} onRetry={resource.reload} />}
      {!resource.isLoading && !resource.error && location.pathname === '/bureau/members' && (
        <MemberManagement key={panelKey} members={resource.data.members} permission={meta.permission} />
      )}
      {!resource.isLoading && !resource.error && location.pathname === '/bureau/events' && (
        <EventManagement key={panelKey} events={resource.data.events} permission={meta.permission} />
      )}
      {!resource.isLoading && !resource.error && location.pathname === '/bureau/publish' && (
        <PublicationManagement key={panelKey} publications={resource.data.publications} permission={meta.permission} />
      )}
      {!resource.isLoading && !resource.error && location.pathname === '/bureau/statistics' && (
        <StatisticsPanel key={panelKey} data={resource.data} />
      )}
      {!resource.isLoading && !resource.error && location.pathname === '/bureau/community' && (
        <ModerationPanel key={panelKey} items={resource.data.moderation} permission={meta.permission} />
      )}
    </div>
  )
}
