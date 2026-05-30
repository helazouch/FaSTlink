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
