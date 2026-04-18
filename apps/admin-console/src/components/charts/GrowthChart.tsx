import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalyticsSnapshot } from '../../types/domain'

interface GrowthChartProps {
  snapshots: AnalyticsSnapshot[]
}

export const GrowthChart = ({ snapshots }: GrowthChartProps) => {
  const points = snapshots
    .slice()
    .reverse()
    .map((item) => ({
      label: new Date(item.createdAt).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      }),
      participation: item.participation,
    }))

  return (
    <div className="panel h-80 p-4">
      <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-slate-100">Growth signals</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Participation trend by snapshot</p>
      <div className="mt-4 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="participation" fill="#1249a8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
