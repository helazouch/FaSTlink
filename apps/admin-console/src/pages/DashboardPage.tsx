import { useQuery } from '@tanstack/react-query'
import { Activity, Cog, Gauge, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ActivityChart } from '../components/charts/ActivityChart'
import { GrowthChart } from '../components/charts/GrowthChart'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { StatCard } from '../components/ui/StatCard'
import { TextInput } from '../components/ui/TextInput'
import { env } from '../config/env'
import { listLocalAuditEntries } from '../lib/auditTrail'
import { compactNumber, formatDateTime } from '../lib/format'
import { getAnalyticsSnapshots, getGlobalStats, listAuditLogs } from '../services/admin/adminService'

export const DashboardPage = () => {
  const [entityIdInput, setEntityIdInput] = useState(String(env.defaultEntityId))

  const entityId = useMemo(() => {
    const parsed = Number(entityIdInput)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : env.defaultEntityId
  }, [entityIdInput])

  const statsQuery = useQuery({
    queryKey: ['admin-global-stats'],
    queryFn: getGlobalStats,
  })

  const snapshotsQuery = useQuery({
    queryKey: ['analytics-snapshots', entityId],
    queryFn: () => getAnalyticsSnapshots(entityId, 30),
  })

  const auditQuery = useQuery({
    queryKey: ['dashboard-audit-logs'],
    queryFn: () => listAuditLogs(8),
    retry: false,
  })

  const auditEntries = useMemo(
    () => (auditQuery.isError ? listLocalAuditEntries(8) : auditQuery.data ?? []),
    [auditQuery.data, auditQuery.isError],
  )

  if (statsQuery.isLoading || snapshotsQuery.isLoading) {
    return <Loader label="Loading dashboard metrics..." />
  }

  if (statsQuery.isError) {
    return (
      <EmptyState
        title="Unable to load platform metrics"
        message="The admin stats endpoint is unavailable. Verify gateway and ADMIN token permissions."
      />
    )
  }

  const stats = statsQuery.data

  if (!stats) {
    return <Loader label="Loading platform metrics..." />
  }

  const snapshots = snapshotsQuery.data ?? []
  const latestSnapshot = snapshots[0]

  return (
    <div className="space-y-5">
      <section className="panel p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Dashboard scope
            </p>
            <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">
              Entity analytics source
            </h3>
          </div>
          <div className="ml-auto w-full max-w-xs">
            <TextInput
              label="Entity id"
              value={entityIdInput}
              onChange={(event) => setEntityIdInput(event.target.value)}
              placeholder="1"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Global configs"
          value={compactNumber(stats.totalGlobalConfigs)}
          detail={`Last update ${formatDateTime(stats.lastGlobalConfigUpdatedAt)}`}
          icon={<Cog size={18} />}
        />
        <StatCard
          title="Platform settings"
          value={compactNumber(stats.totalPlatformSettings)}
          detail={`${stats.enabledPlatformSettings} enabled / ${stats.disabledPlatformSettings} disabled`}
          icon={<SlidersHorizontal size={18} />}
        />
        <StatCard
          title="Interactions"
          value={compactNumber(latestSnapshot?.interactions ?? 0)}
          detail="Latest analytics snapshot"
          icon={<Activity size={18} />}
        />
        <StatCard
          title="Engagement"
          value={compactNumber(latestSnapshot?.engagement ?? 0)}
          detail={`Computed ${formatDateTime(stats.computedAt)}`}
          icon={<Gauge size={18} />}
        />
      </section>

      {snapshots.length === 0 ? (
        <EmptyState
          title="No analytics snapshots"
          message="No snapshots exist for this entity yet. Generate events and interactions first."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          <ActivityChart snapshots={snapshots} />
          <GrowthChart snapshots={snapshots} />
        </section>
      )}

      <section className="panel overflow-hidden">
        <header className="border-b border-slate-200 px-4 py-4 dark:border-surface-700">
          <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">Audit highlights</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Recent admin operations stored locally when audit endpoint is not available.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 dark:bg-surface-700/60">
              <tr>
                <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Time</th>
                <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Action</th>
                <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Resource</th>
                <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditEntries.length === 0 ? (
                <tr>
                  <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={4}>
                    No audit activity captured yet.
                  </td>
                </tr>
              ) : (
                auditEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-200 dark:border-surface-700">
                    <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(entry.createdAt)}</td>
                    <td className="table-cell text-slate-700 dark:text-slate-200">{entry.action}</td>
                    <td className="table-cell text-slate-600 dark:text-slate-300">
                      {entry.resourceType} #{entry.resourceId}
                    </td>
                    <td className="table-cell text-slate-700 dark:text-slate-200">{entry.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
