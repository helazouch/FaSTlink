import { ClipboardList } from 'lucide-react'

export const AuditLogsPage = () => (
  <section className="panel p-5">
    <div className="flex items-center gap-3">
      <ClipboardList className="text-brand-600" size={22} />
      <div>
        <h1 className="font-heading text-xl font-bold">Audit logs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Admin-only platform audit trail.</p>
      </div>
    </div>
    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
      Audit log API access is protected by the admin route guard and backend ADMIN authorization.
    </div>
  </section>
)
