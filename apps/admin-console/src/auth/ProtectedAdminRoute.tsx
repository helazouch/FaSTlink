import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export const ProtectedAdminRoute = () => {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const isAuthenticated = status === 'authenticated'
  const hasAdminRole = useAuthStore((state) => state.hasRole('ADMIN'))

  if (status === 'loading' || status === 'bootstrapping') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-100 dark:bg-surface-900">
        <div className="panel px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
          Validating admin session...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!hasAdminRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
