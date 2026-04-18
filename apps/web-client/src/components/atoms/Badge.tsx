import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'alert' | 'info'
  className?: string
}

const toneClasses = {
  neutral: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  alert: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700',
}

export const Badge = ({ children, tone = 'neutral', className }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]',
      toneClasses[tone],
      className,
    )}
  >
    {children}
  </span>
)
