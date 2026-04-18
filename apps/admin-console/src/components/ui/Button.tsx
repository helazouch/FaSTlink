import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300',
  secondary:
    'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 dark:bg-surface-700 dark:text-slate-100 dark:border-surface-600 dark:hover:bg-surface-600',
  danger: 'bg-danger text-white hover:bg-red-700 disabled:bg-red-300',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-surface-700',
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
