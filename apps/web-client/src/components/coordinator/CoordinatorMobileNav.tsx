import { BarChart3, Bell, LayoutDashboard, MonitorCheck, Workflow } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'

export const CoordinatorMobileNav = () => {
  const permissions = usePermissions()
  const items = [
    { to: '/coordinator', label: 'Home', icon: LayoutDashboard, visible: true, end: true },
    { to: '/coordinator/requests', label: 'Requests', icon: Workflow, visible: permissions.canProcessRequests() },
    { to: '/coordinator/analytics', label: 'Analytics', icon: BarChart3, visible: permissions.canViewAdvancedAnalytics() },
    { to: '/coordinator/supervision', label: 'Supervision', icon: MonitorCheck, visible: permissions.canSuperviseEntities() },
    { to: '/coordinator/alerts', label: 'Alerts', icon: Bell, visible: true },
  ].filter((item) => item.visible)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      <div
        className="mx-auto grid max-w-xl gap-1"
        style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 5)}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] font-semibold',
                  isActive ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-100',
                ].join(' ')
              }
            >
              <Icon size={17} />
              <span className="mt-1 truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
