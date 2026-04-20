import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getPageLabel } from '../../config/navigation'
import { formatDateTime } from '../../lib/format'
import { listNotifications, markNotificationRead } from '../../services/admin/adminService'
import { useAuthStore } from '../../stores/authStore'
import { useUiStore } from '../../stores/uiStore'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface AdminTopbarProps {
  pathname: string
}

export const AdminTopbar = ({ pathname }: AdminTopbarProps) => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const theme = useUiStore((state) => state.theme)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  const [openNotifications, setOpenNotifications] = useState(false)

  const notificationsQuery = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () => listNotifications(user?.id ?? 0),
    enabled: Boolean(user?.id),
    refetchInterval: 30_000,
  })

  const markReadMutation = useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId, user?.id ?? 0),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-notifications', user?.id] })
    },
  })

  const unreadCount = useMemo(
    () => (notificationsQuery.data ?? []).filter((item) => !item.lu).length,
    [notificationsQuery.data],
  )

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/72 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-surface-900/62 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/10 dark:hover:text-slate-100 lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600/80 dark:text-brand-300/80">
              Administration
            </p>
            <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">
              {getPageLabel(pathname)}
            </h2>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>

          <button
            className="relative rounded-lg p-2 text-slate-600 transition hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-white/10"
            onClick={() => setOpenNotifications((value) => !value)}
          >
            <Bell size={18} />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-white/75 px-3 py-2 text-sm shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-surface-800/80 md:flex">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.fullName ?? 'Admin'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut size={14} />
            </Button>
          </div>

          {openNotifications ? (
            <div className="absolute right-0 top-12 z-20 w-80 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-surface-800/92">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
                <Badge tone={unreadCount > 0 ? 'warning' : 'neutral'}>{unreadCount} unread</Badge>
              </div>

              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {(notificationsQuery.data ?? []).length === 0 ? (
                  <p className="rounded-xl bg-brand-50/65 px-3 py-2 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    No notifications available for this admin account.
                  </p>
                ) : (
                  (notificationsQuery.data ?? []).map((item) => (
                    <button
                      key={item.notificationId}
                      className="w-full rounded-xl border border-slate-200/80 px-3 py-2 text-left hover:bg-brand-50/65 dark:border-white/10 dark:hover:bg-white/5"
                      onClick={() => {
                        if (!item.lu) {
                          markReadMutation.mutate(item.notificationId)
                        }
                      }}
                    >
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.titre}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.contenu}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDateTime(item.createdAt)}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
