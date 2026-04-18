import clsx from 'clsx'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  delta: number
  icon: LucideIcon
  hint: string
}

export const StatCard = ({ label, value, delta, icon: Icon, hint }: StatCardProps) => {
  const TrendIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : ArrowRight

  return (
    <article className="glass-panel p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-300">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="rounded-xl bg-brand-500/20 p-2 text-brand-200">
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <span
          className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1', {
            'bg-emerald-500/20 text-emerald-300': delta > 0,
            'bg-rose-500/20 text-rose-300': delta < 0,
            'bg-slate-500/20 text-slate-300': delta === 0,
          })}
        >
          <TrendIcon size={14} />
          {Math.abs(delta).toFixed(1)}%
        </span>
        <span className="text-slate-400">{hint}</span>
      </div>
    </article>
  )
}
