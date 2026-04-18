export interface DashboardSummary {
  totalMembers: number
  activeCommunities: number
  weeklyEvents: number
  publicationsToday: number
  growthRate: number
  engagementRate: number
  activeNow: number
  activityTimeline: number[]
}

export interface Publication {
  id: string
  author: string
  community: string
  title: string
  excerpt: string
  createdAt: string
  reactions: number
  comments: number
  tags: string[]
  isPinned?: boolean
}

export type EventStatus = 'open' | 'closed' | 'draft'

export interface EventItem {
  id: string
  title: string
  community: string
  startsAt: string
  location: string
  attendees: number
  capacity: number
  status: EventStatus
  description: string
}

export interface ChatMessage {
  id: string
  sender: string
  content: string
  sentAt: string
  channel: string
  mine: boolean
}

export type NotificationType = 'info' | 'warning' | 'success' | 'alert'

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
  actionLabel?: string
}

export interface CreatePublicationInput {
  userId: number
  content: string
  entityIds: number[]
}

export interface CreateEventInput {
  userId: number
  entityId: number
  title: string
  description: string
  location: string
  startsAt: string
  endsAt: string
}
