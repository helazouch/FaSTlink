import { Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from '../components/navigation/AdminSidebar'
import { AdminTopbar } from '../components/navigation/AdminTopbar'

export const AdminLayout = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-surface-900">
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
