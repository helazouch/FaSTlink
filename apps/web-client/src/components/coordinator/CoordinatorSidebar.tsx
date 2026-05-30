import {
  BarChart3,
  Bell,
  LayoutDashboard,
  MonitorCheck,
  ShieldCheck,
  Workflow,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'

const navItems = [
  { to: '/coordinator', label: 'Overview', icon: LayoutDashboard, gate: 'isCoordinator' as const, end: true },
  { to: '/coordinator/requests', label: 'Request Processing', icon: Workflow, gate: 'canProcessRequests' as const },
  { to: '/coordinator/analytics', label: 'Analytics', icon: BarChart3, gate: 'canViewAdvancedAnalytics' as const },
  { to: '/coordinator/supervision', label: 'Supervision', icon: MonitorCheck, gate: 'canSuperviseEntities' as const },
  { to: '/coordinator/alerts', label: 'Alerts', icon: Bell, gate: 'isCoordinator' as const },
]

export const CoordinatorSidebar = () => {
  const permissions = usePermissions()
  const gateMap = {
    isCoordinator: permissions.isCoordinator,
    canProcessRequests: permissions.canProcessRequests(),
    canViewAdvancedAnalytics: permissions.canViewAdvancedAnalytics(),
    canSuperviseEntities: permissions.canSuperviseEntities(),
  }

  const visibleItems = navItems.filter((item) => gateMap[item.gate])

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-5 lg:sticky lg:top-0 lg:block">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white">
          <ShieldCheck size={21} />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">FaST Link</p>
          <h1 className="text-lg font-black text-slate-900">Coordinator</h1>
        </div>
      </div>

      <nav className="mt-7 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-600 hover:bg-brand/5 hover:text-brand',
                ].join(' ')
              }
            >
              <Icon size={17} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-brand/10 bg-brand/5 p-4 text-sm text-slate-600">
        <p className="font-bold text-brand">Supervisory mode</p>
        <p className="mt-1">No bureau management tools are exposed from this console.</p>
      </div>
    </aside>
  )
}
