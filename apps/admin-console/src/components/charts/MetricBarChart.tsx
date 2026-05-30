import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MetricPoint } from '../../types/domain'

interface MetricBarChartProps {
  title: string
  subtitle: string
  points: MetricPoint[]
}

export const MetricBarChart = ({ title, subtitle, points }: MetricBarChartProps) => (
  <div className="panel h-80 p-4">
    <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    <div className="mt-4 h-60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#10c8b9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
)
