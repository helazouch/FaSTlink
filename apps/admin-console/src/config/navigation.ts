import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BellDot,
  CalendarDays,
  Flag,
  LayoutDashboard,
  Newspaper,
  Settings,
  Shield,
  SquareStack,
  Users,
} from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

export const navigationItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/entities', label: 'Entities', icon: SquareStack },
  { path: '/publications', label: 'Publications', icon: Newspaper },
  { path: '/events', label: 'Events', icon: CalendarDays },
  { path: '/communities', label: 'Communities', icon: Shield },
  { path: '/requests', label: 'Requests', icon: BellDot },
  { path: '/moderation', label: 'Moderation', icon: Flag },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export const getPageLabel = (pathname: string): string => {
  const exact = navigationItems.find((item) => item.path === pathname)
  if (exact) {
    return exact.label
  }

  const nested = navigationItems.find((item) => pathname.startsWith(item.path) && item.path !== '/')
  return nested?.label ?? 'Dashboard'
}
