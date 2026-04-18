import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
}

export const TextInput = ({ label, error, className, id, ...props }: TextInputProps) => (
  <label className="block">
    {label ? (
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </span>
    ) : null}
    <input
      id={id}
      className={cn(
        'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20',
        error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : '',
        className,
      )}
      {...props}
    />
    {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
  </label>
)
