import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ActivityChart } from '../components/charts/ActivityChart'
import { GrowthChart } from '../components/charts/GrowthChart'
import { DataTableShell } from '../components/table/DataTableShell'
import { Pagination } from '../components/table/Pagination'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { StatCard } from '../components/ui/StatCard'
import { TextInput } from '../components/ui/TextInput'
import { env } from '../config/env'
import { compactNumber, formatDateTime } from '../lib/format'
import { getAnalyticsSnapshots } from '../services/admin/adminService'

export const AnalyticsPage = () => {
  const [entityIdInput, setEntityIdInput] = useState(String(env.defaultEntityId))
  const [limitInput, setLimitInput] = useState('60')
  const [page, setPage] = useState(0)

  const entityId = useMemo(() => {
    const parsed = Number(entityIdInput)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : env.defaultEntityId
  }, [entityIdInput])

  const limit = useMemo(() => {
    const parsed = Number(limitInput)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60
  }, [limitInput])

  const snapshotsQuery = useQuery({
    queryKey: ['analytics-snapshots-page', entityId, limit],
    queryFn: () => getAnalyticsSnapshots(entityId, Math.min(limit, 200)),
  })

  const snapshots = snapshotsQuery.data ?? []
  const totalInteractions = snapshots.reduce((acc, item) => acc + item.interactions, 0)
  const totalParticipation = snapshots.reduce((acc, item) => acc + item.participation, 0)
  const avgEngagement =
    snapshots.length === 0
      ? 0
      : snapshots.reduce((acc, item) => acc + item.engagement, 0) / snapshots.length

  const pageSize = 12
  const paginated = snapshots.slice(page * pageSize, page * pageSize + pageSize)

  if (snapshotsQuery.isLoading) {
    return <Loader label="Loading analytics snapshots..." />
  }

  if (snapshotsQuery.isError) {
    return (
      <EmptyState
        title="Analytics unavailable"
        message="Could not read analytics snapshots for this entity. Check analytics-service and permissions."
      />
    )
  }

  return (
    <div className="space-y-5">
      <section className="panel p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <TextInput
            label="Entity id"
            value={entityIdInput}
            onChange={(event) => setEntityIdInput(event.target.value)}
            placeholder="1"
          />
          <TextInput
            label="Snapshot limit"
            value={limitInput}
            onChange={(event) => setLimitInput(event.target.value)}
            placeholder="60"
          />
          <TextInput label="Loaded snapshots" value={String(snapshots.length)} disabled />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Interactions" value={compactNumber(totalInteractions)} detail="Total in selected horizon" />
        <StatCard title="Participation" value={compactNumber(totalParticipation)} detail="Participation signal" />
        <StatCard title="Average engagement" value={compactNumber(Math.round(avgEngagement))} detail="Mean per snapshot" />
      </section>

      {snapshots.length === 0 ? (
        <EmptyState
          title="No analytics data"
          message="No snapshots were returned for this entity. Start generating platform events first."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          <ActivityChart snapshots={snapshots} />
          <GrowthChart snapshots={snapshots} />
        </section>
      )}

      <DataTableShell title="Snapshot table" subtitle="Raw analytics snapshots for detailed audit and trend checks.">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-surface-700/60">
            <tr>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Snapshot id</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Interactions</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Participation</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Engagement</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Source type</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Created</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={6}>
                  No rows to display.
                </td>
              </tr>
            ) : (
              paginated.map((snapshot) => (
                <tr key={snapshot.id} className="border-t border-slate-200 dark:border-surface-700">
                  <td className="table-cell text-slate-700 dark:text-slate-200">#{snapshot.id}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200">{snapshot.interactions}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200">{snapshot.participation}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200">{snapshot.engagement}</td>
                  <td className="table-cell text-slate-600 dark:text-slate-300">{snapshot.sourceEventType ?? 'N/A'}</td>
                  <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(snapshot.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination page={page} pageSize={pageSize} total={snapshots.length} onPageChange={setPage} />
      </DataTableShell>
    </div>
  )
}
