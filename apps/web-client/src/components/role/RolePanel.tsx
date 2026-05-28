import type { ReactNode } from 'react'

interface RolePanelProps {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}

export const RolePanel = ({ eyebrow, title, description, children }: RolePanelProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>
    <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
    <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
    {children ? <div className="mt-4">{children}</div> : null}
  </section>
)
