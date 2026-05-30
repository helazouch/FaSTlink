import { httpClient } from './api/httpClient'

export interface CrossEntityDay {
  day: string
  engagement: number
  requests: number
  entityActivityTotal: number
}

export interface CrossEntityWeeklyAnalytics {
  days: CrossEntityDay[]
  weeklyEngagement: number
  weeklyRequests: number
  weeklyEntityActivity: number
  engagementTrendPercentage: number
  requestTrendPercentage: number
  generatedAt: string
}

export interface EngagementLiftAnalytics {
  currentWeekEngagement: number
  previousWeekEngagement: number
  growthPercentage: number
  generatedAt: string
}

export interface DecisionTimeAnalytics {
  processedRequests: number
  medianProcessingSeconds: number
  averageProcessingSeconds: number
  fastestResponseSeconds: number
  slowestResponseSeconds: number
  generatedAt: string
}

export interface EntityHealthItem {
  entityId: number
  name: string
  engagement: number
  participation: number
  interactions: number
  weeklyActivity: number
  pendingRequests: number
  status: 'HEALTHY' | 'LOW_PARTICIPATION' | 'INACTIVE'
  lastActivityAt: string | null
}

export interface EntityHealthAnalytics {
  totalEntities: number
  healthyEntities: number
  inactiveEntities: number
  lowParticipationEntities: number
  activeEntityPercentage: number
  engagementThreshold: number
  entities: EntityHealthItem[]
  generatedAt: string
}

export interface RequestMetricsAnalytics {
  requestsSubmitted: number
  approved: number
  rejected: number
  pending: number
  processing: Array<{ label: string; value: number }>
  computedAt: string
}

const unwrap = <T,>(response: { data: T }) => response.data

export const coordinatorAnalyticsService = {
  getCrossEntityWeekly: () =>
    httpClient.get<CrossEntityWeeklyAnalytics>('/v1/analytics/cross-entity-weekly').then(unwrap),
  getEngagementLift: () =>
    httpClient.get<EngagementLiftAnalytics>('/v1/analytics/engagement-lift').then(unwrap),
  getDecisionTime: () =>
    httpClient.get<DecisionTimeAnalytics>('/v1/analytics/decision-time').then(unwrap),
  getEntityHealth: () =>
    httpClient.get<EntityHealthAnalytics>('/v1/analytics/entity-health').then(unwrap),
  getRequestMetrics: () =>
    httpClient.get<RequestMetricsAnalytics>('/v1/analytics/request-metrics').then(unwrap),
}
