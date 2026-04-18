import { clsx } from 'clsx'
import type { TextareaHTMLAttributes } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const TextArea = ({ label, className, ...rest }: TextAreaProps) => (
  <label className="grid gap-1.5">
    {label ? <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span> : null}
    <textarea
      className={clsx(
        'min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-surface-600 dark:bg-surface-700 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20',
        className,
      )}
      {...rest}
    />
  </label>
)
