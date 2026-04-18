import { clsx } from 'clsx'
import type { SelectHTMLAttributes } from 'react'

interface OptionItem {
  label: string
  value: string
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: OptionItem[]
}

export const SelectInput = ({ label, options, className, ...rest }: SelectInputProps) => (
  <label className="grid gap-1.5">
    {label ? <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span> : null}
    <select
      className={clsx(
        'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-surface-600 dark:bg-surface-700 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20',
        className,
      )}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
)
