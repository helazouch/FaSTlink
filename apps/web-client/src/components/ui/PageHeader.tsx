import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle: string
  action?: ReactNode
}

export const PageHeader = ({ eyebrow, title, subtitle, action }: PageHeaderProps) => {
  return (
    <div className="animate-rise">
      {eyebrow ? <p className="soft-tag">{eyebrow}</p> : null}
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">{subtitle}</p>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  )
}
