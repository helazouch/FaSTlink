import { Link } from 'react-router-dom'
import { Button } from '../components/atoms/Button'
import { useSuggestedCommunities } from '../hooks/useSocial'

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
        {communities.map((community) => (
          <article key={community.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">{community.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{community.description}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand">
              {community.members.toLocaleString()} members
            </p>
            <Link to={`/communities/${community.id}`} className="mt-4 inline-block">
              <Button variant="secondary">Open community</Button>
            </Link>
          </article>
        ))}
      </section>
    </div>
  )
}
