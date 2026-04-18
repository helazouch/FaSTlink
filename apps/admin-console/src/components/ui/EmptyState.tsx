import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message: string
  action?: ReactNode
}

export const EmptyState = ({ title, message, action }: EmptyStateProps) => (
  <div className="panel flex flex-col items-center justify-center px-6 py-10 text-center">
    <h3 className="font-heading text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
    <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">{message}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
)
