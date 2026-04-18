import { Bookmark, CalendarRange, House, Shapes, Workflow } from 'lucide-react'
import { SidebarNavItem } from '../molecules/SidebarNavItem'

const navItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/communities', label: 'Communities', icon: Shapes },
  { to: '/events', label: 'Events', icon: CalendarRange },
  { to: '/requests', label: 'Requests', icon: Workflow },
  { to: '/saved', label: 'Saved items', icon: Bookmark },
]

export const LeftSidebar = () => (
  <aside className="top-20 hidden h-[calc(100vh-5rem)] w-72 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:flex">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Navigation</p>
      <div className="mt-3 space-y-1">
        {navItems.map((item) => (
          <SidebarNavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
        ))}
      </div>
    </div>

    <div className="mt-auto rounded-xl bg-brand/5 p-3 text-sm text-slate-600">
      <p className="font-semibold text-brand">Live collaboration mode</p>
      <p className="mt-1">You are synced with API Gateway, realtime notifications, and community chat.</p>
    </div>
  </aside>
)
