import { format } from 'date-fns'
import { LogOut, Search, Sparkles } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'

interface TopbarProps {
  title: string
}

export const Topbar = ({ title }: TopbarProps) => {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/70 px-4 py-4 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">FastLink Control Plane</p>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-300">{format(new Date(), 'EEEE, dd MMM yyyy')}</p>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <label className="glass-panel relative block w-72 px-3 py-2.5">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search members, posts, events"
              className="w-full bg-transparent pl-6 text-sm text-slate-100 outline-none placeholder:text-slate-400"
            />
          </label>

          <button className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500">
            <Sparkles size={16} />
            New Briefing
          </button>

          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Signed in
            </p>
            <p className="text-sm font-semibold text-white">{user?.fullName ?? 'Unknown user'}</p>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-400/35 bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
