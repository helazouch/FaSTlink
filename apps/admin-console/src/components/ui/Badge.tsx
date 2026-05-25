import { clsx } from 'clsx'
import type { PropsWithChildren } from 'react'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const toneMap: Record<BadgeTone, string> = {
  neutral: 'bg-brand-50 text-brand-700 dark:bg-brand-500/18 dark:text-brand-100',
  success: 'bg-mint/15 text-teal-700 dark:bg-mint/20 dark:text-mint',
  warning: 'bg-ember/15 text-orange-700 dark:bg-ember/20 dark:text-amber-200',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  info: 'bg-brand-100 text-brand-700 dark:bg-brand-500/22 dark:text-brand-100',
}

interface BadgeProps {
  tone?: BadgeTone
}

export const Badge = ({ children, tone = 'neutral' }: PropsWithChildren<BadgeProps>) => (
  <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', toneMap[tone])}>
    {children}
  </span>
)
