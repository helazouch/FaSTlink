import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string
  detail?: string
  icon?: ReactNode
}

export const StatCard = ({ title, value, detail, icon }: StatCardProps) => (
  <article className="panel p-4">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      {icon ? <span className="text-primary-600 dark:text-primary-100">{icon}</span> : null}
    </div>
    <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    {detail ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</p> : null}
  </article>
)
