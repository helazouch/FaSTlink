import { BarChart3, CalendarRange, Megaphone, Shapes, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RolePanel } from '../components/role/RolePanel'
import { useCurrentEntityContext } from '../hooks/useCurrentEntityContext'
import { useScopedPermissions } from '../hooks/useScopedPermissions'

const tools = [
  { to: '/bureau/publish', label: 'Publish', icon: Megaphone, gate: 'canPublish' as const },
  { to: '/bureau/community', label: 'Manage Community', icon: Shapes, gate: 'canManageCommunity' as const },
  { to: '/bureau/members', label: 'Manage Members', icon: Users, gate: 'canManageMembers' as const },
  { to: '/bureau/events', label: 'Manage Events', icon: CalendarRange, gate: 'canManageEvents' as const },
  { to: '/bureau/statistics', label: 'Entity Statistics', icon: BarChart3, gate: 'canViewStats' as const },
]

export const BureauDashboardPage = () => {
  const { currentMembership } = useCurrentEntityContext()
  const permissions = useScopedPermissions()
  const gateMap = {
    canPublish: permissions.canPublish,
    canManageCommunity: permissions.canManageCommunity,
    canManageMembers: permissions.canManageMembers,
    canManageEvents: permissions.canManageEvents,
    canViewStats: permissions.canViewStats,
  }
  const visibleTools = tools.filter((tool) => (tool.gate ? gateMap[tool.gate] : true))

  return (
    <div className="space-y-4">
      <RolePanel
        eyebrow="Bureau workspace"
        title={currentMembership?.entityName ?? `Entity ${currentMembership?.entityId ?? ''}`}
        description="Local management tools are scoped to the selected entity where you are BUREAU_MEMBER."
      />
      {visibleTools.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {visibleTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.to}
                to={tool.to}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand/30 hover:bg-brand/5"
              >
                <Icon className="text-brand" size={20} />
                <p className="mt-3 font-semibold text-slate-800">{tool.label}</p>
              </Link>
            )
          })}
        </section>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No bureau actions are enabled for this entity yet.
        </div>
      )}
    </div>
  )
}
