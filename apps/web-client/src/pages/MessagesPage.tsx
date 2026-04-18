import { useState } from 'react'
import { CommunityChatPanel } from '../components/organisms/CommunityChatPanel'
import { useSuggestedCommunities } from '../hooks/useSocial'

export const MessagesPage = () => {
  const { data: communities = [] } = useSuggestedCommunities()
  const [activeCommunityId, setActiveCommunityId] = useState<number>(communities[0]?.id ?? 1)

  const effectiveCommunityId = communities.some(
    (community) => community.id === activeCommunityId,
  )
    ? activeCommunityId
    : communities[0]?.id ?? 1

  return (
    <div className="grid gap-4 xl:grid-cols-[260px,1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Community rooms</h2>
        <div className="mt-3 space-y-2">
          {communities.map((community) => (
            <button
              key={community.id}
              onClick={() => setActiveCommunityId(community.id)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                community.id === effectiveCommunityId
                  ? 'bg-brand/10 text-brand'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {community.name}
            </button>
          ))}
        </div>
      </section>

      <CommunityChatPanel communityId={effectiveCommunityId} />
    </div>
  )
}
