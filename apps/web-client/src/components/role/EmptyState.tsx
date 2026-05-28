import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
    <Icon className="mx-auto text-brand" size={24} />
    <h2 className="mt-3 text-base font-semibold text-slate-800">{title}</h2>
    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p>
  </div>
)
