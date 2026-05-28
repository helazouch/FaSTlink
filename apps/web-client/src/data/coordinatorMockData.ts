export type CoordinatorRequestType = 'room' | 'equipment' | 'budget' | 'moderation'
export type CoordinatorRequestStatus = 'pending' | 'approved' | 'rejected'
export type CoordinatorAlertTone = 'info' | 'warning' | 'critical'

export interface CoordinatorRequest {
  id: number
  title: string
  entityName: string
  type: CoordinatorRequestType
  status: CoordinatorRequestStatus
  priority: 'low' | 'medium' | 'high'
  submittedAt: string
  requester: string
}

export interface CoordinatorEntitySignal {
  id: number
  name: string
  members: number
  engagement: number
  pendingRequests: number
  moderationItems: number
}

export interface CoordinatorAlert {
  id: number
  title: string
  description: string
  tone: CoordinatorAlertTone
  createdAt: string
}

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString()

export const coordinatorRequests: CoordinatorRequest[] = [
  {
    id: 7001,
    title: 'Reserve amphitheater for AI workshop',
    entityName: 'Engineers Circle',
    type: 'room',
    status: 'pending',
    priority: 'high',
    submittedAt: hoursAgo(2),
    requester: 'Yanis Bensalem',
  },
  {
    id: 7002,
    title: 'Projectors and streaming kit',
    entityName: 'Events Studio',
    type: 'equipment',
    status: 'pending',
    priority: 'medium',
    submittedAt: hoursAgo(5),
    requester: 'Ines Harrat',
  },
  {
    id: 7003,
    title: 'Speaker travel support',
    entityName: 'Founders Hub',
    type: 'budget',
    status: 'pending',
    priority: 'low',
    submittedAt: hoursAgo(9),
    requester: 'Nora Ait Kaci',
  },
]

export const coordinatorEntitySignals: CoordinatorEntitySignal[] = [
  { id: 1, name: 'Founders Hub', members: 12340, engagement: 86, pendingRequests: 4, moderationItems: 1 },
  { id: 2, name: 'Engineers Circle', members: 9210, engagement: 78, pendingRequests: 7, moderationItems: 3 },
  { id: 3, name: 'Events Studio', members: 4802, engagement: 69, pendingRequests: 5, moderationItems: 2 },
  { id: 4, name: 'Design Guild', members: 3188, engagement: 61, pendingRequests: 2, moderationItems: 1 },
]

export const coordinatorAlerts: CoordinatorAlert[] = [
  {
    id: 1,
    title: 'High-priority room request',
    description: 'Engineers Circle needs a decision before the event schedule closes.',
    tone: 'critical',
    createdAt: hoursAgo(1),
  },
  {
    id: 2,
    title: 'Moderation queue rising',
    description: 'Three entities have unresolved content review items.',
    tone: 'warning',
    createdAt: hoursAgo(3),
  },
  {
    id: 3,
    title: 'Weekly analytics snapshot ready',
    description: 'Cross-entity engagement reports are available for review.',
    tone: 'info',
    createdAt: hoursAgo(8),
  },
]

export const coordinatorAnalyticsSeries = [
  { label: 'Mon', engagement: 62, requests: 8 },
  { label: 'Tue', engagement: 71, requests: 10 },
  { label: 'Wed', engagement: 66, requests: 7 },
  { label: 'Thu', engagement: 84, requests: 14 },
  { label: 'Fri', engagement: 78, requests: 11 },
  { label: 'Sat', engagement: 58, requests: 4 },
  { label: 'Sun', engagement: 73, requests: 6 },
]
