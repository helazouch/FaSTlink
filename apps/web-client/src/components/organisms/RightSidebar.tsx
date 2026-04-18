import { Flame, Sparkles, Users2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from '../atoms/Avatar'
import { useEvents, useSuggestedCommunities } from '../../hooks/useSocial'
import { mockUsers } from '../../data/socialMockData'
import { formatDateTime } from '../../lib/date'

export const RightSidebar = () => {
  const { data: communities = [] } = useSuggestedCommunities()
  const { data: events = [] } = useEvents()
  const activeUsers = mockUsers.filter((item) => item.online)

  return (
    <aside className="top-20 hidden h-[calc(100vh-5rem)] w-[330px] space-y-4 overflow-y-auto pb-2 xl:sticky xl:block">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Sparkles size={15} className="text-brand" />
          Suggested communities
        </h3>
        <div className="mt-3 space-y-3">
          {communities.slice(0, 3).map((community) => (
            <Link
              to={`/communities/${community.id}`}
              key={community.id}
              className="block rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-brand/25"
            >
              <p className="font-semibold text-slate-800">{community.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{community.description}</p>
              <p className="mt-2 text-xs font-medium text-brand">{community.members.toLocaleString()} members</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Flame size={15} className="text-brand" />
          Upcoming events
        </h3>
        <div className="mt-3 space-y-3">
          {events.slice(0, 3).map((event) => (
            <Link
              to={`/events/${event.id}`}
              key={event.id}
              className="block rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-brand/25"
            >
              <p className="font-semibold text-slate-800">{event.title}</p>
              <p className="mt-1 text-xs text-slate-500">{event.communityName}</p>
              <p className="mt-2 text-xs font-medium text-brand">{formatDateTime(event.startsAt)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Users2 size={15} className="text-brand" />
          Active users
        </h3>
        <div className="mt-3 space-y-3">
          {activeUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-3 py-2">
              <Avatar name={user.fullName} size="sm" />
              <div>
                <p className="text-sm font-semibold text-slate-700">{user.fullName}</p>
                <p className="text-xs text-slate-500">{user.headline}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
