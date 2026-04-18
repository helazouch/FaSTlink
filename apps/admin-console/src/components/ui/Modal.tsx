import { X } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  footer?: ReactNode
}

export const Modal = ({ open, title, subtitle, onClose, footer, children }: PropsWithChildren<ModalProps>) => {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-xl overflow-hidden">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-surface-700">
          <div>
            <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-surface-700 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">{children}</div>

        {footer ? <div className="border-t border-slate-200 px-5 py-4 dark:border-surface-700">{footer}</div> : null}
      </div>
    </div>
  )
}
