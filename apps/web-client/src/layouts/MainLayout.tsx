import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { Topbar } from '../components/navigation/Topbar'
import { getRouteLabel } from '../config/navigation'

export const MainLayout = () => {
  const location = useLocation()
  const pageTitle = getRouteLabel(location.pathname)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh opacity-95" />
      <div className="pointer-events-none absolute -left-20 top-20 -z-10 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute right-0 top-1/2 -z-10 h-80 w-80 -translate-y-1/2 rounded-full bg-mint/20 blur-3xl animate-pulseSoft" />

      <Sidebar />

      <div className="lg:pl-72">
        <Topbar title={pageTitle} />
        <main className="px-4 pb-10 pt-4 md:px-8 md:pb-14">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
