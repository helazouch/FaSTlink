import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalyticsSnapshot } from '../../types/domain'

interface ActivityChartProps {
  snapshots: AnalyticsSnapshot[]
}

export const ActivityChart = ({ snapshots }: ActivityChartProps) => {
  const points = snapshots
    .slice()
    .reverse()
    .map((item) => ({
      label: new Date(item.createdAt).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      }),
      interactions: item.interactions,
      engagement: item.engagement,
    }))

  return (
    <div className="panel h-80 p-4">
      <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-slate-100">Daily activity</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Interactions and engagement over time</p>
      <div className="mt-4 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="interactions" stroke="#6511EF" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="engagement" stroke="#10c8b9" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
