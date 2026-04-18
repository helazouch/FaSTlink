import { AlertTriangle, Bell, CheckCircle2, Info, ShieldAlert } from 'lucide-react'
import { Badge } from '../components/atoms/Badge'
import { Button } from '../components/atoms/Button'
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from '../hooks/useNotifications'
import { formatRelativeTime } from '../lib/date'
import { useNotificationStore } from '../stores/notificationStore'
import type { NotificationKind } from '../types/social'

const iconByKind = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  alert: ShieldAlert,
} satisfies Record<NotificationKind, typeof Info>

const badgeToneByKind = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  alert: 'alert',
} as const

export const NotificationsPage = () => {
  const notificationsQuery = useNotifications()
  const notifications = useNotificationStore((state) => state.items)
  const unreadCount = notifications.filter((item) => !item.read).length

  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllMutation = useMarkAllNotificationsAsRead()

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-slate-800">
              <Bell size={20} className="text-brand" />
              Notifications
            </h1>
            <p className="mt-1 text-sm text-slate-500">{unreadCount} unread updates</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => markAllMutation.mutate()}
            disabled={notifications.length === 0 || markAllMutation.isPending}
          >
            Mark all as read
          </Button>
        </div>
      </section>

      {notificationsQuery.isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Loading notifications...
        </div>
      ) : null}

      <section className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((item) => {
            const Icon = iconByKind[item.kind]

            return (
              <article
                key={item.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${
                  item.read ? 'border-slate-200' : 'border-brand/25'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge tone={badgeToneByKind[item.kind]}>{item.kind}</Badge>
                    {!item.read ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => markAsReadMutation.mutate(item.id)}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No notifications yet.
          </div>
        )}
      </section>
    </div>
  )
}
