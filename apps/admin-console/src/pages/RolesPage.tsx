import { useQuery } from '@tanstack/react-query'
import { Shield } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { listRoles } from '../services/admin/adminService'

export const RolesPage = () => {
  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: listRoles,
    staleTime: 60_000,
  })

  if (rolesQuery.isLoading) {
    return <Loader label="Loading roles..." />
  }

  if (rolesQuery.isError) {
    return (
      <EmptyState
        title="Unable to load roles"
        message="The identity-service role endpoint is unavailable or the current token is not authorized."
      />
    )
  }

  const roles = rolesQuery.data ?? []

  return (
    <section className="panel p-5">
      <div className="flex items-center gap-3">
        <Shield className="text-brand-600" size={22} />
        <div>
          <h1 className="font-heading text-xl font-bold">Roles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Role catalog from identity-service.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {roles.length === 0 ? (
          <EmptyState title="No roles" message="identity-service returned no role records." />
        ) : (
          roles.map((role) => (
            <article
              key={role.id}
              className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{role.name}</h2>
                <Badge tone="info">Global</Badge>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
