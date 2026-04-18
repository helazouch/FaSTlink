import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'

export const UnauthorizedPage = () => {
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-4 dark:bg-surface-900">
      <div className="panel w-full max-w-lg p-7 text-center">
        <div className="mx-auto mb-4 inline-flex rounded-full bg-amber-100 p-3 text-warning dark:bg-amber-500/20 dark:text-amber-300">
          <ShieldAlert size={24} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-slate-100">Admin access required</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your account is authenticated but does not have ADMIN permissions for this area.
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <Link to="/login">
            <Button variant="secondary">Back to login</Button>
          </Link>
          <Button onClick={logout}>Sign out</Button>
        </div>
      </div>
    </div>
  )
}
