import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

interface SidebarNavItemProps {
  to: string
  label: string
  icon: LucideIcon
}

export const SidebarNavItem = ({ to, label, icon: Icon }: SidebarNavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
        isActive
          ? 'bg-brand/10 text-brand ring-1 ring-brand/20'
          : 'text-slate-600 hover:bg-slate-100',
      )
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
)
