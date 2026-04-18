import type { LucideIcon } from 'lucide-react'
import {
  BellRing,
  CalendarClock,
  LayoutDashboard,
  MessageCircleMore,
  Newspaper,
} from 'lucide-react'

export interface NavigationItem {
  path: string
  label: string
  description: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    description: 'Operational pulse',
    icon: LayoutDashboard,
  },
  {
    path: '/feed',
    label: 'Publications',
    description: 'Community timeline',
    icon: Newspaper,
  },
  {
    path: '/events',
    label: 'Events',
    description: 'Planning board',
    icon: CalendarClock,
  },
  {
    path: '/chat',
    label: 'Chat',
    description: 'Live discussions',
    icon: MessageCircleMore,
  },
  {
    path: '/notifications',
    label: 'Notifications',
    description: 'Alerts & updates',
    icon: BellRing,
  },
]

export const getRouteLabel = (path: string): string => {
  const exactRoute = navigationItems.find((item) => item.path === path)
  if (exactRoute) {
    return exactRoute.label
  }

  const partialRoute = navigationItems.find((item) => path.startsWith(item.path))
  return partialRoute?.label ?? 'Dashboard'
}
