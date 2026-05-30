import { useQuery } from '@tanstack/react-query'
import {
  getEntityActivityAnalytics,
  getEntityOverviewAnalytics,
  type EntityActivityAnalytics,
  type EntityOverviewAnalytics,
} from '../services/entityAnalyticsService'

export const entityAnalyticsQueryKeys = {
  overview: (entityId: number) => ['entity-analytics', 'overview', entityId] as const,
  activity: (entityId: number) => ['entity-analytics', 'activity', entityId] as const,
}

export const useEntityOverviewAnalytics = (entityId: number | null) =>
  useQuery<EntityOverviewAnalytics>({
    queryKey: entityAnalyticsQueryKeys.overview(entityId ?? 0),
    queryFn: () => getEntityOverviewAnalytics(entityId as number),
    enabled: entityId !== null && entityId > 0,
    staleTime: 60_000,
  })

export const useEntityActivityAnalytics = (entityId: number | null) =>
  useQuery<EntityActivityAnalytics>({
    queryKey: entityAnalyticsQueryKeys.activity(entityId ?? 0),
    queryFn: () => getEntityActivityAnalytics(entityId as number),
    enabled: entityId !== null && entityId > 0,
    staleTime: 60_000,
  })
