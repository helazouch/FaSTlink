import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  helper: string
}

export const MetricCard = ({ icon: Icon, label, value, helper }: MetricCardProps) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon size={19} />
      </span>
    </div>
    <p className="mt-3 text-sm text-slate-500">{helper}</p>
  </article>
)
