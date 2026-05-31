import { AlertCircle, Check, LoaderCircle, MessageSquare, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/atoms/Button'
import { useJoinCommunity, useMyCommunities, useSuggestedCommunities } from '../hooks/useSocial'
import { useAuthStore } from '../stores/authStore'
import type { CommunitySummary } from '../types/social'

export const CommunitiesPage = () => {
  const { data: communities = [], isLoading, isError } = useSuggestedCommunities()
  const { data: myCommunities = [] } = useMyCommunities()
  const joinMutation = useJoinCommunity()
  const userId = useAuthStore((state) => state.user?.id)

  const myIds = new Set(myCommunities.map((c) => c.id))

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Communities</h1>
        <p className="mt-1 text-sm text-slate-500">
          Explore active FaST Link communities and jump into focused conversations.
        </p>
      </section>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          <LoaderCircle className="animate-spin" size={14} />
          Loading communities...
        </div>
      ) : null}

      {isError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          Unable to load communities. Make sure the API Gateway is running.
        </div>
      ) : null}

      {!isLoading && !isError && communities.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          No communities yet.
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        {communities.map((community: CommunitySummary) => {
          const isMember = myIds.has(community.id)
          const isJoining =
            joinMutation.isPending && joinMutation.variables === community.id

          return (
            <article
              key={community.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
                isMember ? 'border-brand/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-slate-800">{community.name}</h2>
                  {isMember ? (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                      <Check size={11} />
                      Member
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="mt-2 text-sm text-slate-600">{community.description}</p>

              {community.members != null && community.members > 0 ? (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand">
                  {community.members.toLocaleString()} members
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {!isMember && userId ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isJoining}
                    onClick={() => joinMutation.mutate(community.id)}
                  >
                    {isJoining ? (
                      <LoaderCircle size={13} className="animate-spin" />
                    ) : (
                      <UserPlus size={13} />
                    )}
                    {isJoining ? 'Joining…' : 'Join'}
                  </Button>
                ) : null}

                {isMember ? (
                  /* Member → opens the messaging page for that specific community */
                  <Link to={`/messages/community/${community.id}`} className="inline-flex">
                    <Button size="sm" variant="primary">
                      <MessageSquare size={13} />
                      Open chat
                    </Button>
                  </Link>
                ) : (
                  /* Non-member → opens the community detail page (feed + info) */
                  <Link to={`/communities/${community.id}`} className="inline-flex">
                    <Button size="sm" variant="ghost">
                      View community
                    </Button>
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
