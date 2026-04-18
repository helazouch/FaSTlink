import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string
  tone?: 'neutral' | 'primary'
}

export const IconButton = ({ icon, label, className, tone = 'neutral', ...props }: IconButtonProps) => (
  <button
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex h-10 w-10 items-center justify-center rounded-full transition',
      tone === 'primary'
        ? 'bg-brand text-white hover:bg-brand-700'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      className,
    )}
    {...props}
  >
    {icon}
  </button>
)
