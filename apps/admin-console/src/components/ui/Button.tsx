import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-glow hover:bg-brand-700 disabled:bg-brand-300 disabled:shadow-none',
  secondary:
    'border border-brand-200 bg-brand-50/75 text-brand-700 hover:bg-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10',
  danger: 'bg-danger text-white hover:bg-red-700 disabled:bg-red-300',
  ghost:
    'bg-transparent text-slate-700 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-white/10',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...rest
}: PropsWithChildren<ButtonProps>) => (
  <button
    className={clsx(
      'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed',
      variantClass[variant],
      sizeClass[size],
      className,
    )}
    {...rest}
  >
    {children}
  </button>
)
