import { httpClient } from './api/httpClient'

export interface EntityMembersAnalytics {
  totalMembers: number
  activeMembers: number
  newMembersThisMonth: number
}

export interface EntityEventsAnalytics {
  totalEvents: number
  upcomingEvents: number
  completedEvents: number
}

export interface EntityPublicationsAnalytics {
  totalPublications: number
  publicationsThisMonth: number
  engagementTotal: number
}

export interface EntityModerationAnalytics {
  pendingReviews: number
  approvedContent: number
  rejectedContent: number
}

export interface EntityOverviewAnalytics {
  entityId: number
  entityName: string
  totalMembers: number
  totalEvents: number
  totalPublications: number
  pendingModerationCount: number
  activeStatus: boolean
  members: EntityMembersAnalytics
  events: EntityEventsAnalytics
  publications: EntityPublicationsAnalytics
  moderation: EntityModerationAnalytics
  computedAt: string
}

export interface EntityActivityCategory {
  label: string
  value: number
}

export interface EntityActivityAnalytics {
  entityId: number
  categories: EntityActivityCategory[]
  computedAt: string
}

const ENDPOINTS = {
  overview: (entityId: number) => `/v1/analytics/entity/${entityId}/overview`,
  activity: (entityId: number) => `/v1/analytics/entity/${entityId}/activity`,
}

export const getEntityOverviewAnalytics = async (entityId: number): Promise<EntityOverviewAnalytics> => {
  const response = await httpClient.get<EntityOverviewAnalytics>(ENDPOINTS.overview(entityId))
  return response.data
}

export const getEntityActivityAnalytics = async (entityId: number): Promise<EntityActivityAnalytics> => {
  const response = await httpClient.get<EntityActivityAnalytics>(ENDPOINTS.activity(entityId))
  return response.data
}
