import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export const ProtectedRoute = () => {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const isAuthenticated = status === 'authenticated'

  if (status === 'loading' || status === 'bootstrapping') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-700">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium shadow-sm">
          Validating session...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
