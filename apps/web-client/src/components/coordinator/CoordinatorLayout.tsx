import { Bell, Search, ShieldCheck } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { UserDropdown } from '../molecules/UserDropdown'
import { CoordinatorMobileNav } from './CoordinatorMobileNav'
import { CoordinatorSidebar } from './CoordinatorSidebar'

export const CoordinatorLayout = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_8%_12%,rgba(101,17,239,0.10),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(14,165,233,0.08),transparent_35%)]" />
    <div className="flex min-h-screen">
      <CoordinatorSidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white lg:hidden">
                <ShieldCheck size={19} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Coordinator operations</p>
                <h1 className="truncate text-lg font-black text-slate-900">Organization monitoring</h1>
              </div>
            </div>
            <div className="hidden min-w-[260px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
              <Search size={16} />
              <span>Search requests, entities, alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Bell size={17} />
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-brand" />
              </span>
              <UserDropdown />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] space-y-4 px-4 pb-24 pt-4 lg:px-6 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
    <CoordinatorMobileNav />
  </div>
)
