import { Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from '../components/navigation/AdminSidebar'
import { AdminTopbar } from '../components/navigation/AdminTopbar'

export const AdminLayout = () => {
  const location = useLocation()

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-canvas text-slate-900 dark:bg-ink dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh opacity-90" />
      <div className="pointer-events-none absolute -left-24 top-20 -z-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute right-0 top-1/2 -z-10 h-80 w-80 -translate-y-1/2 rounded-full bg-mint/15 blur-3xl animate-pulseSoft" />
      <AdminSidebar />
      <div className="lg:pl-72">
        <AdminTopbar pathname={location.pathname} />
        <main className="space-y-5 px-4 py-4 md:px-6 md:py-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
