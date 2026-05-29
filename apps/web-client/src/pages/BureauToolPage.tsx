import {
  AlertTriangle,
  Archive,
  BarChart3,
  CalendarPlus,
  Check,
  EyeOff,
  Loader2,
  Megaphone,
  MessageSquare,
  RefreshCw,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { PermissionAwareButton } from '../components/auth/PermissionAwareButton'
import { EmptyState } from '../components/role/EmptyState'
import { MetricCard } from '../components/role/MetricCard'
import { RolePanel } from '../components/role/RolePanel'
import {
  createBureauSeed,
  type BureauPublication,
  type BureauPublicationStatus,
} from '../data/bureauMockData'
import { BureauEventManagement } from '../components/organisms/BureauEventManagement'
import { useCurrentEntityContext } from '../hooks/useCurrentEntityContext'
import { useScopedPermissions } from '../hooks/useScopedPermissions'
import {
  addBureauCommunityMember,
  addBureauEntityMember,
  createBureauCommunity,
  deleteBureauCommunity,
  listBureauCommunities,
  listBureauCommunityMembers,
  listBureauEntityMembers,
  removeBureauCommunityMember,
  revokeBureauEntityMember,
  updateBureauCommunity,
  updateBureauEntityMemberRole,
  type BureauCommunity,
  type BureauEntityMember,
  type BureauEntityRole,
} from '../services/bureauService'
import { useAuthStore } from '../stores/authStore'

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

const BUREAU_ENTITY_ROLES: BureauEntityRole[] = ['SIMPLE_MEMBER', 'BUREAU_MEMBER']

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) {
      return response.data.message
    }
  }
  return fallback
}

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '-'
  }
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) {
    return '-'
  }
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp))
}

const SimpleModal = ({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
    <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  </div>
)

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

const MemberManagement = ({
  entityId,
  currentUserId,
  permission,
}: {
  entityId: number
  currentUserId: number
  permission: string
}) => {
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BureauEntityMember | null>(null)
  const [removeTarget, setRemoveTarget] = useState<BureauEntityMember | null>(null)
  const [targetUserId, setTargetUserId] = useState('')
  const [role, setRole] = useState<BureauEntityRole>('SIMPLE_MEMBER')

  const membersQuery = useQuery({
    queryKey: ['bureau-members', entityId],
    queryFn: () => listBureauEntityMembers(entityId),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['bureau-members', entityId] })

  const addMutation = useMutation({
    mutationFn: () => addBureauEntityMember(entityId, Number(targetUserId), role),
    onSuccess: () => {
      setFeedback('Member added to this entity.')
      setAddOpen(false)
      setTargetUserId('')
      void invalidate()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to add member.')),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { userId: number; role: BureauEntityRole }) =>
      updateBureauEntityMemberRole(entityId, payload.userId, payload.role),
    onSuccess: () => {
      setFeedback('Member role updated.')
      setEditTarget(null)
      void invalidate()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to update member role.')),
  })

  const removeMutation = useMutation({
    mutationFn: (userId: number) => revokeBureauEntityMember(entityId, userId),
    onSuccess: () => {
      setFeedback('Member removed from this entity.')
      setRemoveTarget(null)
      void invalidate()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to remove member.')),
  })

  const activeBureauCount = (membersQuery.data ?? []).filter(
    (member) => member.role === 'BUREAU_MEMBER' && member.status !== 'REVOKED',
  ).length
  const cannotRemoveLastSelf =
    removeTarget?.userId === currentUserId && removeTarget.role === 'BUREAU_MEMBER' && activeBureauCount <= 1

  if (membersQuery.isLoading) {
    return <LoadingPanel />
  }

  if (membersQuery.isError) {
    return (
      <ErrorPanel
        message={getErrorMessage(membersQuery.error, 'Entity members could not be loaded.')}
        onRetry={() => void membersQuery.refetch()}
      />
    )
  }

  const members = membersQuery.data ?? []

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Scoped members</h2>
        <PermissionAwareButton
          permission={permission}
          entityId={entityId}
          onClick={() => {
            setRole('SIMPLE_MEMBER')
            setAddOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white"
        >
          <UserPlus size={15} />
          Add member
        </PermissionAwareButton>
      </div>
      {feedback && <p className="mt-3 rounded-xl bg-brand/10 px-3 py-2 text-sm font-semibold text-brand">{feedback}</p>}
      {members.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Users} title="No members yet" description="Members for the selected entity will appear here." />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-3 py-2">Member</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Assigned</th>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-slate-100">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-slate-800">{member.name}</p>
                    {member.email && <p className="text-xs text-slate-500">{member.email}</p>}
                    <p className="text-xs text-slate-500">#{member.userId}</p>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={member.role === 'BUREAU_MEMBER' ? 'published' : 'draft'}>{member.role}</Badge>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{member.status ?? '-'}</td>
                  <td className="px-3 py-3 text-slate-600">{formatDateTime(member.assignedAt)}</td>
                  <td className="px-3 py-3 text-slate-600">{formatDateTime(member.updatedAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <PermissionAwareButton
                        permission={permission}
                        entityId={entityId}
                        onClick={() => {
                          setRole(member.role === 'BUREAU_MEMBER' ? 'BUREAU_MEMBER' : 'SIMPLE_MEMBER')
                          setEditTarget(member)
                        }}
                        className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700"
                      >
                        Edit role
                      </PermissionAwareButton>
                      <PermissionAwareButton
                        permission={permission}
                        entityId={entityId}
                        onClick={() => setRemoveTarget(member)}
                        className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700"
                      >
                        Remove
                      </PermissionAwareButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addOpen && (
        <SimpleModal title="Add entity member" onClose={() => setAddOpen(false)}>
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="User id"
              value={targetUserId}
              onChange={(event) => setTargetUserId(event.target.value)}
            />
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={role}
              onChange={(event) => setRole(event.target.value as BureauEntityRole)}
            >
              {BUREAU_ENTITY_ROLES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={addMutation.isPending || Number(targetUserId) <= 0}
              onClick={() => addMutation.mutate()}
              className="w-full rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {addMutation.isPending ? 'Adding...' : 'Add member'}
            </button>
          </div>
        </SimpleModal>
      )}

      {editTarget && (
        <SimpleModal title={`Edit ${editTarget.name}`} onClose={() => setEditTarget(null)}>
          <div className="space-y-3">
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={role}
              onChange={(event) => setRole(event.target.value as BureauEntityRole)}
            >
              {BUREAU_ENTITY_ROLES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate({ userId: editTarget.userId, role })}
              className="w-full rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save role'}
            </button>
          </div>
        </SimpleModal>
      )}

      {removeTarget && (
        <SimpleModal title="Remove member" onClose={() => setRemoveTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Remove {removeTarget.name} from this entity?
            </p>
            {cannotRemoveLastSelf && (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                You cannot remove yourself because this would leave the entity without bureau management.
              </p>
            )}
            <button
              type="button"
              disabled={removeMutation.isPending || cannotRemoveLastSelf}
              onClick={() => removeMutation.mutate(removeTarget.userId)}
              className="w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {removeMutation.isPending ? 'Removing...' : 'Confirm remove'}
            </button>
          </div>
        </SimpleModal>
      )}
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

const CommunityMembersPanel = ({
  community,
  entityMembers,
  actorUserId,
}: {
  community: BureauCommunity
  entityMembers: BureauEntityMember[]
  actorUserId: number
}) => {
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const membersQuery = useQuery({
    queryKey: ['bureau-community-members', community.id],
    queryFn: () => listBureauCommunityMembers(community.id),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['bureau-community-members', community.id] })

  const inviteMutation = useMutation({
    mutationFn: () => addBureauCommunityMember(community.id, community.entityId, actorUserId, Number(selectedUserId)),
    onSuccess: () => {
      setFeedback('Member invited to the community.')
      setSelectedUserId('')
      void invalidate()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to invite member.')),
  })

  const removeMutation = useMutation({
    mutationFn: (userId: number) => removeBureauCommunityMember(community.id, community.entityId, actorUserId, userId),
    onSuccess: () => {
      setFeedback('Community member removed.')
      void invalidate()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to remove community member.')),
  })

  const communityMembers = membersQuery.data ?? []
  const communityMemberIds = new Set(communityMembers.map((member) => member.userId))
  const eligibleInvitees = entityMembers.filter(
    (member) => member.status !== 'REVOKED' && !communityMemberIds.has(member.userId),
  )

  return (
    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 text-sm font-semibold text-slate-700">
          Invite entity member
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
          >
            <option value="">Select an eligible member</option>
            {eligibleInvitees.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name} #{member.userId}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={inviteMutation.isPending || !selectedUserId}
          onClick={() => inviteMutation.mutate()}
          className="rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {inviteMutation.isPending ? 'Inviting...' : 'Invite'}
        </button>
      </div>
      {feedback && <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-brand">{feedback}</p>}
      {membersQuery.isLoading ? (
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading community members...</p>
      ) : membersQuery.isError ? (
        <p className="mt-4 text-sm font-semibold text-rose-600">
          {getErrorMessage(membersQuery.error, 'Unable to load community members.')}
        </p>
      ) : communityMembers.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No community members yet.</p>
      ) : (
        <div className="mt-4 grid gap-2">
          {communityMembers.map((member) => (
            <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
              <div>
                <p className="font-semibold text-slate-800">{member.name}</p>
                <p className="text-xs text-slate-500">
                  {member.email ?? `#${member.userId}`} - {member.role}
                </p>
              </div>
              <button
                type="button"
                disabled={removeMutation.isPending || member.userId === actorUserId}
                onClick={() => removeMutation.mutate(member.userId)}
                className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const CommunityManagement = ({
  entityId,
  actorUserId,
  permission,
}: {
  entityId: number
  actorUserId: number
  permission: string
}) => {
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BureauCommunity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BureauCommunity | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const communitiesQuery = useQuery({
    queryKey: ['bureau-communities', entityId],
    queryFn: () => listBureauCommunities(entityId),
  })

  const entityMembersQuery = useQuery({
    queryKey: ['bureau-members', entityId],
    queryFn: () => listBureauEntityMembers(entityId),
  })

  const invalidateCommunities = () => queryClient.invalidateQueries({ queryKey: ['bureau-communities', entityId] })

  const createMutation = useMutation({
    mutationFn: () => createBureauCommunity(entityId, actorUserId, { name, description }),
    onSuccess: () => {
      setFeedback('Community created.')
      setFormOpen(false)
      setName('')
      setDescription('')
      void invalidateCommunities()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to create community.')),
  })

  const updateMutation = useMutation({
    mutationFn: () => updateBureauCommunity(editTarget?.id ?? 0, entityId, actorUserId, { name, description }),
    onSuccess: () => {
      setFeedback('Community updated.')
      setEditTarget(null)
      setName('')
      setDescription('')
      void invalidateCommunities()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to update community.')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteBureauCommunity(deleteTarget?.id ?? 0, entityId, actorUserId),
    onSuccess: () => {
      setFeedback('Community deleted.')
      setDeleteTarget(null)
      void invalidateCommunities()
    },
    onError: (error) => setFeedback(getErrorMessage(error, 'Unable to delete community.')),
  })

  if (communitiesQuery.isLoading || entityMembersQuery.isLoading) {
    return <LoadingPanel />
  }

  if (communitiesQuery.isError || entityMembersQuery.isError) {
    return (
      <ErrorPanel
        message="Community workspace could not be loaded for this entity."
        onRetry={() => {
          void communitiesQuery.refetch()
          void entityMembersQuery.refetch()
        }}
      />
    )
  }

  const communities = communitiesQuery.data ?? []
  const entityMembers = entityMembersQuery.data ?? []

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Entity communities</h2>
        <PermissionAwareButton
          permission={permission}
          entityId={entityId}
          onClick={() => {
            setName('')
            setDescription('')
            setFormOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white"
        >
          <MessageSquare size={15} />
          Create community
        </PermissionAwareButton>
      </div>
      {feedback && <p className="mt-3 rounded-xl bg-brand/10 px-3 py-2 text-sm font-semibold text-brand">{feedback}</p>}
      {communities.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={MessageSquare} title="No communities" description="Create a community for this selected entity." />
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {communities.map((community) => (
            <article key={community.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800">{community.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{community.description ?? 'No description'}</p>
                  <p className="mt-1 text-xs text-slate-400">Updated {formatDateTime(community.updatedAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === community.id ? null : community.id)}
                    className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700"
                  >
                    Members
                  </button>
                  <PermissionAwareButton
                    permission={permission}
                    entityId={entityId}
                    onClick={() => {
                      setEditTarget(community)
                      setName(community.name)
                      setDescription(community.description ?? '')
                    }}
                    className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700"
                  >
                    Edit
                  </PermissionAwareButton>
                  <PermissionAwareButton
                    permission={permission}
                    entityId={entityId}
                    onClick={() => setDeleteTarget(community)}
                    className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700"
                  >
                    Delete
                  </PermissionAwareButton>
                </div>
              </div>
              {expandedId === community.id && (
                <CommunityMembersPanel community={community} entityMembers={entityMembers} actorUserId={actorUserId} />
              )}
            </article>
          ))}
        </div>
      )}

      {(formOpen || editTarget) && (
        <SimpleModal title={editTarget ? 'Update community' : 'Create community'} onClose={() => {
          setFormOpen(false)
          setEditTarget(null)
        }}>
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Community name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <textarea
              className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <button
              type="button"
              disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
              onClick={() => (editTarget ? updateMutation.mutate() : createMutation.mutate())}
              className="w-full rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save community'}
            </button>
          </div>
        </SimpleModal>
      )}

      {deleteTarget && (
        <SimpleModal title="Delete community" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Delete {deleteTarget.name}? This action cannot be undone.</p>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
              className="w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Confirm delete'}
            </button>
          </div>
        </SimpleModal>
      )}
    </section>
  )
}

export const BureauToolPage = () => {
  const location = useLocation()
  const { currentEntityId, currentMembership } = useCurrentEntityContext()
  const currentUserId = useAuthStore((state) => state.user?.id ?? 0)
  const scoped = useScopedPermissions()
  const meta = toolMeta[location.pathname as keyof typeof toolMeta] ?? fallbackMeta
  const Icon = meta.icon
  const seed = useMemo(
    () => createBureauSeed(currentEntityId, currentMembership?.entityName ?? `Entity ${currentEntityId ?? ''}`),
    [currentEntityId, currentMembership?.entityName],
  )
  const resource = useBureauResource(seed, `${currentEntityId ?? 'none'}:${location.pathname}`)
  const panelKey = `${currentEntityId ?? 'none'}:${location.pathname}`
  const isRealBureauPage =
    location.pathname === '/bureau/members' ||
    location.pathname === '/bureau/community' ||
    location.pathname === '/bureau/events'

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

      {!isRealBureauPage && resource.isLoading && <LoadingPanel />}
      {!isRealBureauPage && resource.error && <ErrorPanel message={resource.error} onRetry={resource.reload} />}
      {location.pathname === '/bureau/members' && currentEntityId !== null && (
        <MemberManagement key={panelKey} entityId={currentEntityId} currentUserId={currentUserId} permission={meta.permission} />
      )}
      {location.pathname === '/bureau/events' && currentEntityId !== null && (
        <BureauEventManagement key={panelKey} entityId={currentEntityId} actorUserId={currentUserId} permission={meta.permission} />
      )}
      {!resource.isLoading && !resource.error && location.pathname === '/bureau/publish' && (
        <PublicationManagement key={panelKey} publications={resource.data.publications} permission={meta.permission} />
      )}
      {!resource.isLoading && !resource.error && location.pathname === '/bureau/statistics' && (
        <StatisticsPanel key={panelKey} data={resource.data} />
      )}
      {location.pathname === '/bureau/community' && currentEntityId !== null && (
        <CommunityManagement key={panelKey} entityId={currentEntityId} actorUserId={currentUserId} permission={meta.permission} />
      )}
    </div>
  )
}
