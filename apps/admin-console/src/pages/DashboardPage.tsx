import { useQuery } from '@tanstack/react-query'
import { Bell, Building2, CalendarDays, FileText, Network, Users } from 'lucide-react'
import { MetricBarChart } from '../components/charts/MetricBarChart'
import { MetricLineChart } from '../components/charts/MetricLineChart'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { StatCard } from '../components/ui/StatCard'
import { compactNumber, formatDateTime } from '../lib/format'
import {
  getEntityDistribution,
  getEventMetrics,
  getPlatformOverview,
  getPublicationMetrics,
  getRequestMetrics,
} from '../services/admin/adminService'

export const DashboardPage = () => {
  const overviewQuery = useQuery({
    queryKey: ['analytics-platform-overview'],
    queryFn: getPlatformOverview,
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

  const requestQuery = useQuery({
    queryKey: ['analytics-request-metrics'],
    queryFn: getRequestMetrics,
    staleTime: 60_000,
  })

  const entityDistributionQuery = useQuery({
    queryKey: ['analytics-entity-distribution'],
    queryFn: getEntityDistribution,
    staleTime: 60_000,
  })

  if (
    overviewQuery.isLoading ||
    publicationQuery.isLoading ||
    eventQuery.isLoading ||
    requestQuery.isLoading ||
    entityDistributionQuery.isLoading
  ) {
    return <Loader label="Loading dashboard metrics..." />
  }

  if (
    overviewQuery.isError ||
    publicationQuery.isError ||
    eventQuery.isError ||
    requestQuery.isError ||
    entityDistributionQuery.isError
  ) {
    return (
      <EmptyState
        title="Unable to load platform metrics"
        message="Analytics endpoints are unavailable. Verify analytics-service, gateway routing, and ADMIN token permissions."
      />
    )
  }

  const overview = overviewQuery.data
  const publicationMetrics = publicationQuery.data
  const eventMetrics = eventQuery.data
  const requestMetrics = requestQuery.data
  const entityDistribution = entityDistributionQuery.data

  if (!overview || !publicationMetrics || !eventMetrics || !requestMetrics || !entityDistribution) {
    return <Loader label="Loading platform metrics..." />
  }

  const entityPoints = entityDistribution.entities.map((entity) => ({
    label: entity.nom,
    value: entity.members,
  }))

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Users"
          value={compactNumber(overview.totalUsers)}
          detail={`Computed ${formatDateTime(overview.computedAt)}`}
          icon={<Users size={18} />}
        />
        <StatCard
          title="Entities"
          value={compactNumber(overview.totalEntities)}
          detail={`${compactNumber(entityDistribution.totalMembers)} members`}
          icon={<Building2 size={18} />}
        />
        <StatCard
          title="Publications"
          value={compactNumber(overview.totalPublications)}
          detail={`${compactNumber(publicationMetrics.engagement)} engagement signal`}
          icon={<FileText size={18} />}
        />
        <StatCard
          title="Events"
          value={compactNumber(overview.totalEvents)}
          detail={`${compactNumber(eventMetrics.participationCount)} participation signal`}
          icon={<CalendarDays size={18} />}
        />
        <StatCard
          title="Requests"
          value={compactNumber(overview.totalRequests)}
          detail={`${compactNumber(requestMetrics.pending)} pending`}
          icon={<Network size={18} />}
        />
        <StatCard
          title="Communities"
          value={compactNumber(overview.totalCommunities)}
          detail={`${compactNumber(overview.totalCommunities)} active`}
          icon={<Users size={18} />}
        />
        <StatCard
          title="Notifications"
          value={compactNumber(overview.totalNotifications)}
          detail="Stored notifications"
          icon={<Bell size={18} />}
        />
        <StatCard
          title="Processed requests"
          value={compactNumber(requestMetrics.approved + requestMetrics.rejected)}
          detail={`${compactNumber(requestMetrics.approved)} approved / ${compactNumber(requestMetrics.rejected)} rejected`}
          icon={<Network size={18} />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <MetricLineChart
          title="Publication activity"
          subtitle="Daily publication events captured by analytics-service"
          points={publicationMetrics.activity}
        />
        <MetricLineChart
          title="Event activity"
          subtitle="Daily event creation captured by analytics-service"
          points={eventMetrics.activity}
        />
        <MetricBarChart
          title="Request processing"
          subtitle="Submitted requests resolved from analytics events"
          points={requestMetrics.processing}
        />
        <MetricBarChart
          title="Entity distribution"
          subtitle="Members by entity from entity-service"
          points={entityPoints}
        />
      </section>
    </div>
  )
}
