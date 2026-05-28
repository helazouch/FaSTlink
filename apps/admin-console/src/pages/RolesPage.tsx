import { Shield } from 'lucide-react'
import { Badge } from '../components/ui/Badge'

const roles = [
  { name: 'USER', scope: 'Global', description: 'Authenticated platform access.' },
  { name: 'ADMIN', scope: 'Global', description: 'Admin console and platform governance.' },
  { name: 'SIMPLE_MEMBER', scope: 'Entity', description: 'Feed, comments, reactions, chat, events.' },
  { name: 'BUREAU_MEMBER', scope: 'Entity', description: 'Local entity management without coordinator inheritance.' },
  { name: 'COORDINATOR', scope: 'Entity', description: 'Supervisory workflows and cross-entity monitoring.' },
]

export const RolesPage = () => (
  <section className="panel p-5">
    <div className="flex items-center gap-3">
      <Shield className="text-brand-600" size={22} />
      <div>
        <h1 className="font-heading text-xl font-bold">Roles</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Global and entity-scoped role model.</p>
      </div>
    </div>
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {roles.map((role) => (
        <article key={role.name} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{role.name}</h2>
            <Badge tone={role.scope === 'Global' ? 'info' : 'neutral'}>{role.scope}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{role.description}</p>
        </article>
      ))}
    </div>
  </section>
)
