export const Loader = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="panel flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
    <span>{label}</span>
  </div>
)
