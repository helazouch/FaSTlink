import { formatDistanceToNow } from 'date-fns'
import {
  Activity,
  BellRing,
  CalendarClock,
  MessageSquareText,
  UsersRound,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { mockDashboardSummary } from '../data/mockData'
import { useNotifications as useRealtimeNotifications } from '../hooks/useNotifications'
import {
  useDashboardSummary,
  useEvents,
  usePublications,
} from '../hooks/usePlatformData'
import { useNotificationStore } from '../stores/notificationStore'

const fallbackTimeline = [24, 35, 31, 47, 58, 53, 66, 44]

const formatRelativeDate = (value: string): string => {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'just now'
  }

  return formatDistanceToNow(parsedDate, { addSuffix: true })
}

export const DashboardPage = () => {
  const configuredEntityId = Number(import.meta.env.VITE_DEFAULT_ENTITY_ID ?? '1')
  const entityId = Number.isFinite(configuredEntityId) ? configuredEntityId : 1

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(entityId)
  const { data: publications = [], isLoading: feedLoading } = usePublications()
  const { data: events = [], isLoading: eventsLoading } = useEvents()
  const notificationsQuery = useRealtimeNotifications()
  const notifications = useNotificationStore((state) => state.items)

  const dashboard = summary ?? mockDashboardSummary
  const timeline =
    dashboard.activityTimeline.length > 0 ? dashboard.activityTimeline : fallbackTimeline

  const unreadNotifications = notifications.filter((item) => !item.read)
  const featuredPublications = publications.slice(0, 3)
  const upcomingEvents = events.slice(0, 3)

  const isBootstrapping =
    summaryLoading && feedLoading && eventsLoading && notificationsQuery.isLoading

  if (isBootstrapping) {
    return (
      <div className="glass-panel animate-pulse p-8 text-center text-slate-300">
        Loading platform overview...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mission Control"
        title="Live Platform Snapshot"
        subtitle="Track member momentum, publication velocity and event demand in one operational cockpit."
        action={
          <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
            Export Summary
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Members"
          value={dashboard.totalMembers.toLocaleString()}
          delta={dashboard.growthRate}
          icon={UsersRound}
          hint="vs last month"
        />
        <StatCard
          label="Active Communities"
          value={dashboard.activeCommunities.toString()}
          delta={4.2}
          icon={Activity}
          hint="weekly increase"
        />
        <StatCard
          label="Weekly Events"
          value={dashboard.weeklyEvents.toString()}
          delta={6.7}
          icon={CalendarClock}
          hint="planned this week"
        />
        <StatCard
          label="Publications Today"
          value={dashboard.publicationsToday.toString()}
          delta={dashboard.engagementRate / 10}
          icon={MessageSquareText}
          hint="engagement trend"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr,1fr]">
        <article className="glass-panel p-6">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">Activity Pulse</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{dashboard.activeNow.toLocaleString()} active right now</h3>
          <p className="mt-2 text-sm text-slate-300">
            Real-time contribution intensity based on publications, chat activity and event check-ins.
          </p>

          <div className="mt-6 grid grid-cols-8 items-end gap-2">
            {timeline.map((value, index) => (
              <div key={`pulse-${index}`} className="flex flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end rounded-xl bg-white/5 p-1">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-brand-700 via-brand-500 to-brand-300"
                    style={{ height: `${Math.max(value, 18)}px` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-400">H{index + 9}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel p-6">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-400">Attention Radar</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{unreadNotifications.length} unread alerts</h3>

          <div className="mt-5 space-y-3">
            {(unreadNotifications.length > 0 ? unreadNotifications : notifications)
              .slice(0, 4)
              .map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <BellRing size={14} className="text-brand-300" />
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{item.message}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    {formatRelativeDate(item.createdAt)}
                  </p>
                </div>
              ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white">Latest Publications</h3>
          <div className="mt-4 space-y-3">
            {featuredPublications.map((post) => (
              <div key={post.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{post.title}</p>
                <p className="mt-1 text-xs text-slate-300">{post.community} · {post.author}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-300">{post.excerpt}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  {formatRelativeDate(post.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
          <div className="mt-4 space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{event.title}</p>
                <p className="mt-1 text-xs text-slate-300">{event.community} · {event.location}</p>
                <p className="mt-2 text-sm text-slate-300">{event.attendees}/{event.capacity} attendees</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  starts {formatRelativeDate(event.startsAt)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
