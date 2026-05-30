import { useQuery } from '@tanstack/react-query'
import { MetricBarChart } from '../components/charts/MetricBarChart'
import { MetricLineChart } from '../components/charts/MetricLineChart'
import { DataTableShell } from '../components/table/DataTableShell'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { StatCard } from '../components/ui/StatCard'
import { compactNumber, formatDateTime } from '../lib/format'
import {
  getCommunityMetrics,
  getEntityDistribution,
  getEventMetrics,
  getPlatformOverview,
  getPublicationMetrics,
  getRequestMetrics,
} from '../services/admin/adminService'

export const AnalyticsPage = () => {
  const overviewQuery = useQuery({
    queryKey: ['analytics-platform-overview'],
    queryFn: getPlatformOverview,
    staleTime: 60_000,
  })

  const entityDistributionQuery = useQuery({
    queryKey: ['analytics-entity-distribution'],
    queryFn: getEntityDistribution,
    staleTime: 60_000,
  })

  const publicationQuery = useQuery({
    queryKey: ['analytics-publication-metrics'],
    queryFn: getPublicationMetrics,
    staleTime: 60_000,
  })

  const eventQuery = useQuery({
    queryKey: ['analytics-event-metrics'],
    queryFn: getEventMetrics,
    staleTime: 60_000,
  })

  const communityQuery = useQuery({
    queryKey: ['analytics-community-metrics'],
    queryFn: getCommunityMetrics,
    staleTime: 60_000,
  })

  const requestQuery = useQuery({
    queryKey: ['analytics-request-metrics'],
    queryFn: getRequestMetrics,
    staleTime: 60_000,
  })

  if (
    overviewQuery.isLoading ||
    entityDistributionQuery.isLoading ||
    publicationQuery.isLoading ||
    eventQuery.isLoading ||
    communityQuery.isLoading ||
    requestQuery.isLoading
  ) {
    return <Loader label="Loading analytics metrics..." />
  }

  if (
    overviewQuery.isError ||
    entityDistributionQuery.isError ||
    publicationQuery.isError ||
    eventQuery.isError ||
    communityQuery.isError ||
    requestQuery.isError
  ) {
    return (
      <EmptyState
        title="Analytics unavailable"
        message="Could not read platform analytics. Check analytics-service, downstream services, and ADMIN permissions."
      />
    )
  }

  const overview = overviewQuery.data
  const entityDistribution = entityDistributionQuery.data
  const publicationMetrics = publicationQuery.data
  const eventMetrics = eventQuery.data
  const communityMetrics = communityQuery.data
  const requestMetrics = requestQuery.data

  if (!overview || !entityDistribution || !publicationMetrics || !eventMetrics || !communityMetrics || !requestMetrics) {
    return <Loader label="Loading analytics metrics..." />
  }

  const entityPoints = entityDistribution.entities.map((entity) => ({
    label: entity.nom,
    value: entity.members,
  }))

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Users" value={compactNumber(overview.totalUsers)} detail="identity-service total" />
        <StatCard title="Posts" value={compactNumber(publicationMetrics.totalPosts)} detail="publication-service total" />
        <StatCard title="Events" value={compactNumber(eventMetrics.eventsCreated)} detail="event-service total" />
        <StatCard title="Communities" value={compactNumber(communityMetrics.communitiesCreated)} detail="community-service total" />
        <StatCard title="Entity members" value={compactNumber(entityDistribution.totalMembers)} detail="entity-service memberships" />
        <StatCard
          title="Requests"
          value={compactNumber(requestMetrics.requestsSubmitted)}
          detail={`${compactNumber(requestMetrics.pending)} pending`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <MetricLineChart
          title="Publication activity"
          subtitle="Daily publication creation events"
          points={publicationMetrics.activity}
        />
        <MetricLineChart title="Event activity" subtitle="Daily event creation events" points={eventMetrics.activity} />
        <MetricBarChart title="Posts by entity" subtitle="Publication events by entity" points={publicationMetrics.postsByEntity} />
        <MetricBarChart title="Request processing" subtitle="Current request status totals" points={requestMetrics.processing} />
      </section>

      <DataTableShell
        title="Entity distribution"
        subtitle={`Computed ${formatDateTime(entityDistribution.computedAt)} from entity-service memberships.`}
      >
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-surface-700/60">
            <tr>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Entity</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Members</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Bureau</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Coordinators</th>
            </tr>
          </thead>
          <tbody>
            {entityDistribution.entities.length === 0 ? (
              <tr>
                <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={4}>
                  No entity membership data returned.
                </td>
              </tr>
            ) : (
              entityDistribution.entities.map((entity) => (
                <tr key={entity.entiteId} className="border-t border-slate-200 dark:border-surface-700">
                  <td className="table-cell text-slate-700 dark:text-slate-200">{entity.nom}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200">{entity.members}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200">{entity.bureauMembers}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200">{entity.coordinators}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTableShell>

      {entityPoints.length === 0 ? (
        <EmptyState title="No entity analytics data" message="Entity-service returned no entities for distribution metrics." />
      ) : null}
    </div>
  )
}
