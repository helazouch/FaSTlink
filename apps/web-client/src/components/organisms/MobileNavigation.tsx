import { CalendarRange, House, ShieldCheck, Shapes, Workflow } from 'lucide-react'
import { SidebarNavItem } from '../molecules/SidebarNavItem'
import { useScopedPermissions } from '../../hooks/useScopedPermissions'

export const MobileNavigation = () => {
  const permissions = useScopedPermissions()
  const items = [
    { to: '/', label: 'Home', icon: House, visible: true },
    { to: '/communities', label: 'Communities', icon: Shapes, visible: true },
    { to: '/events', label: 'Events', icon: CalendarRange, visible: true },
    { to: '/bureau', label: 'Bureau', icon: Workflow, visible: permissions.isBureauMember && !permissions.isCoordinator },
    { to: '/coordinator', label: 'Coordinator', icon: ShieldCheck, visible: permissions.isCoordinator },
  ].filter((item) => item.visible)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
        {items.slice(0, 4).map((item) => (
          <SidebarNavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
        ))}
      </div>
    </nav>
  )
}
