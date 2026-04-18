import type { PropsWithChildren, ReactNode } from 'react'

interface DataTableShellProps {
  title: string
  subtitle?: string
  toolbar?: ReactNode
}

export const DataTableShell = ({
  title,
  subtitle,
  toolbar,
  children,
}: PropsWithChildren<DataTableShellProps>) => (
  <section className="panel overflow-hidden">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 dark:border-surface-700">
      <div>
        <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
    </header>
    <div className="overflow-x-auto">{children}</div>
  </section>
)
