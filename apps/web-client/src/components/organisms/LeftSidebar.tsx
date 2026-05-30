import {
  BarChart3,
  Bookmark,
  CalendarRange,
  House,
  LayoutDashboard,
  Megaphone,
  MonitorCheck,
  ShieldCheck,
  Shapes,
  Users,
  Workflow,
} from 'lucide-react'
import { SidebarNavItem } from '../molecules/SidebarNavItem'
import { useCurrentEntityContext } from '../../hooks/useCurrentEntityContext'
import { useScopedPermissions } from '../../hooks/useScopedPermissions'

const memberNavItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/communities', label: 'Communities', icon: Shapes },
  { to: '/events', label: 'Events', icon: CalendarRange },
  { to: '/requests', label: 'Requests', icon: Workflow, gate: 'canSubmitRequests' as const },
  { to: '/saved', label: 'Saved items', icon: Bookmark },
]

const bureauNavItems = [
  { to: '/bureau', label: 'Entity Dashboard', icon: LayoutDashboard, gate: 'isBureauMember' as const },
  { to: '/bureau/publish', label: 'Publish', icon: Megaphone, gate: 'canPublish' as const },
  { to: '/bureau/community', label: 'Manage Community', icon: Shapes, gate: 'canManageCommunity' as const },
  { to: '/bureau/members', label: 'Manage Members', icon: Users, gate: 'canManageMembers' as const },
  { to: '/bureau/events', label: 'Manage Events', icon: CalendarRange, gate: 'canManageEvents' as const },
  { to: '/bureau/statistics', label: 'Entity Statistics', icon: BarChart3, gate: 'canViewStats' as const },
]

const coordinatorNavItems = [
  { to: '/coordinator', label: 'Coordinator Dashboard', icon: ShieldCheck, gate: 'isCoordinator' as const },
]

const coordinatorToolNavItems = [
  { to: '/coordinator/members', label: 'Manage Members', icon: Users, gate: 'canManageMembers' as const },
  { to: '/coordinator/community', label: 'Manage Community', icon: Shapes, gate: 'canManageCommunity' as const },
  { to: '/coordinator/events', label: 'Manage Events', icon: CalendarRange, gate: 'canManageEvents' as const },
  { to: '/coordinator/publish', label: 'Publish', icon: Megaphone, gate: 'canPublish' as const },
  { to: '/coordinator/statistics', label: 'Entity Statistics', icon: BarChart3, gate: 'canViewStats' as const },
]

const coordinatorOperationNavItems = [
  { to: '/coordinator/requests', label: 'Request Processing', icon: Workflow, gate: 'canProcessRequests' as const },
  { to: '/coordinator/supervision', label: 'Entity Supervision', icon: MonitorCheck, gate: 'canSuperviseEntities' as const },
  { to: '/coordinator/analytics', label: 'Advanced Analytics', icon: BarChart3, gate: 'canViewAdvancedAnalytics' as const },
]

export const LeftSidebar = () => {
  const permissions = useScopedPermissions()
  const { currentEntityId, currentMembership } = useCurrentEntityContext()
  const showBureauTools = currentEntityId !== null && permissions.isBureauMember
  const showCoordinatorTools = permissions.isCoordinator

  const memberGateMap = {
    canSubmitRequests: permissions.canSubmitRequests,
  }

  const bureauGateMap = {
    isBureauMember: permissions.isBureauMember,
    canPublish: permissions.canPublish,
    canManageCommunity: permissions.canManageCommunity,
    canManageMembers: permissions.canManageMembers,
    canManageEvents: permissions.canManageEvents,
    canViewStats: permissions.canViewStats,
  }

  const coordinatorGateMap = {
    isCoordinator: permissions.isCoordinator,
    canProcessRequests: permissions.canProcessRequests,
    canViewAdvancedAnalytics: permissions.canViewAdvancedAnalytics,
    canSuperviseEntities: permissions.canSuperviseEntities,
    canManageCommunity: permissions.canManageCommunity,
    canManageMembers: permissions.canManageMembers,
    canManageEvents: permissions.canManageEvents,
    canPublish: permissions.canPublish,
    canViewStats: permissions.canViewStats,
  }

  const visibleMemberNavItems = memberNavItems.filter((item) =>
    item.gate ? memberGateMap[item.gate] : true,
  )

  const visibleBureauNavItems = bureauNavItems.filter((item) =>
    item.gate ? bureauGateMap[item.gate] : true,
  )

  const visibleCoordinatorNavItems = coordinatorNavItems.filter((item) =>
    item.gate ? coordinatorGateMap[item.gate] : true,
  )
  const visibleCoordinatorToolNavItems = coordinatorToolNavItems.filter((item) =>
    item.gate ? coordinatorGateMap[item.gate] : true,
  )
  const visibleCoordinatorOperationNavItems = coordinatorOperationNavItems.filter((item) =>
    item.gate ? coordinatorGateMap[item.gate] : true,
  )

  return (
    <aside className="top-20 hidden h-[calc(100vh-5rem)] w-72 flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:flex">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Navigation</p>
        <div className="mt-3 space-y-1">
          {visibleMemberNavItems.map((item) => (
            <SidebarNavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
          ))}
        </div>
      </div>

      {showBureauTools && visibleBureauNavItems.length > 0 ? (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Bureau tools</p>
          <div className="mt-3 space-y-1">
            {visibleBureauNavItems.map((item) => (
              <SidebarNavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
            ))}
          </div>
        </div>
      ) : null}

      {showCoordinatorTools && visibleCoordinatorNavItems.length > 0 ? (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Coordinator</p>
          <div className="mt-3 space-y-1">
            {visibleCoordinatorNavItems.map((item) => (
              <SidebarNavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
            ))}
          </div>
        </div>
      ) : null}

      {showCoordinatorTools && visibleCoordinatorToolNavItems.length > 0 ? (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Coordinator tools</p>
          <div className="mt-3 space-y-1">
            {visibleCoordinatorToolNavItems.map((item) => (
              <SidebarNavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
            ))}
          </div>
        </div>
      ) : null}

      {showCoordinatorTools && visibleCoordinatorOperationNavItems.length > 0 ? (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Coordinator operations</p>
          <div className="mt-3 space-y-1">
            {visibleCoordinatorOperationNavItems.map((item) => (
              <SidebarNavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-auto rounded-xl bg-brand/5 p-3 text-sm text-slate-600">
        <p className="font-semibold text-brand">Current entity</p>
        <p className="mt-1">
          {currentMembership
            ? `${currentMembership.entityName ?? `Entity ${currentMembership.entityId}`} · ${currentMembership.role.replace('_', ' ')}`
            : 'No entity context selected.'}
        </p>
      </div>
    </aside>
  )
}
