import { X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../config/navigation'
import { useUiStore } from '../../stores/uiStore'

export const AdminSidebar = () => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)
  const closeSidebar = useUiStore((state) => state.closeSidebar)

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200/70 bg-white/88 px-4 py-5 backdrop-blur-xl transition-transform dark:border-white/10 dark:bg-surface-900/84 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">FaST Link</p>
            <h1 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">Admin Console</h1>
          </div>
          <button
            onClick={closeSidebar}
            className="rounded-md p-1 text-slate-500 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/10 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-[inset_0_0_0_1px_rgba(101,17,239,0.12)] dark:bg-brand-500/18 dark:text-brand-100'
                      : 'text-slate-600 hover:bg-brand-50/70 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                  }`
                }
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {sidebarOpen ? (
        <button
          className="fixed inset-0 z-30 bg-ink/45 lg:hidden"
          aria-label="Close sidebar"
          onClick={closeSidebar}
        />
      ) : null}
    </>
  )
}
