import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import type { NavigationItem } from '../../config/navigation'
import { navigationItems } from '../../config/navigation'

interface NavigationLinkProps {
  item: NavigationItem
  compact?: boolean
}

const navBaseClassName =
  'group flex items-center gap-3 rounded-2xl transition-all duration-200 hover:scale-[1.01]'

const NavigationLink = ({ item, compact = false }: NavigationLinkProps) => {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        clsx(navBaseClassName, {
          'bg-brand-600 text-white shadow-glow': isActive,
          'text-slate-300 hover:bg-white/10 hover:text-white': !isActive,
          'px-3 py-2.5 text-sm': compact,
          'px-4 py-3.5': !compact,
        })
      }
    >
      <Icon size={18} className="shrink-0" />
      <div className={clsx('min-w-0', compact && 'hidden sm:block')}>
        <p className="truncate text-sm font-semibold">{item.label}</p>
        <p className="truncate text-xs text-slate-400 group-hover:text-slate-200">
          {item.description}
        </p>
      </div>
    </NavLink>
  )
}

export const Sidebar = () => {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-[#090b1f]/90 p-6 backdrop-blur-2xl lg:flex lg:flex-col">
        <div>
          <p className="soft-tag">FastLink</p>
          <h2 className="mt-4 text-2xl font-bold text-white">Community OS</h2>
          <p className="mt-2 text-sm text-slate-400">
            Supervise publications, events and conversations in one place.
          </p>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {navigationItems.map((item) => (
            <NavigationLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="glass-panel mt-auto p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">System status</p>
          <p className="mt-2 text-sm font-semibold text-white">All services synchronized</p>
          <p className="mt-1 text-xs text-slate-300">Gateway + streams healthy</p>
        </div>
      </aside>

      <nav className="px-4 pt-4 lg:hidden">
        <div className="glass-panel flex gap-2 overflow-x-auto p-2">
          {navigationItems.map((item) => (
            <NavigationLink key={item.path} item={item} compact />
          ))}
        </div>
      </nav>
    </>
  )
}
