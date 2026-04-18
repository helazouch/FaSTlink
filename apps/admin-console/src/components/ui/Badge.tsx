import { clsx } from 'clsx'
import type { PropsWithChildren } from 'react'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const toneMap: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-surface-700 dark:text-slate-200',
  success: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
}

interface BadgeProps {
  tone?: BadgeTone
}

export const Badge = ({ children, tone = 'neutral' }: PropsWithChildren<BadgeProps>) => (
  <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', toneMap[tone])}>
    {children}
  </span>
)
