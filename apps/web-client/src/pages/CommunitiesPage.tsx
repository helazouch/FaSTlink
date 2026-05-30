import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { Button } from '../components/atoms/Button'
import { useSuggestedCommunities } from '../hooks/useSocial'
import type { CommunitySummary } from '../types/social'

export const CommunitiesPage = () => {
  const { data: communities = [], isLoading } = useSuggestedCommunities()

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Communities</h1>
        <p className="mt-1 text-sm text-slate-500">
          Explore active FaST Link communities and jump into focused conversations.
        </p>
      </section>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Loading communities...
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        {communities.map((community: CommunitySummary) => (
          <article key={community.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">{community.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{community.description}</p>
            {community.members != null && community.members > 0 ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand">
                {community.members.toLocaleString()} members
              </p>
            ) : null}
            <Link to={`/messages/community/${community.id}`} className="mt-4 inline-flex">
              <Button variant="secondary">
                <MessageSquare size={15} />
                Open community
              </Button>
            </Link>
          </article>
        ))}
      </section>
    </div>
  )
}
