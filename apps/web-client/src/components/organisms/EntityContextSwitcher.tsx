import { Building2 } from 'lucide-react'
import { useCurrentEntityContext } from '../../hooks/useCurrentEntityContext'

export const EntityContextSwitcher = () => {
  const { currentEntityId, memberships, setCurrentEntityId } = useCurrentEntityContext()

  if (memberships.length === 0) {
    return null
  }

  return (
    <label className="hidden min-w-[220px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 md:flex">
      <Building2 size={16} className="text-brand" />
      <select
        value={currentEntityId ?? ''}
        onChange={(event) => setCurrentEntityId(Number(event.target.value))}
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none"
        aria-label="Current entity context"
      >
        {memberships.map((membership) => (
          <option key={membership.entityId} value={membership.entityId}>
            {membership.entityName ?? `Entity ${membership.entityId}`} · {membership.role.replace('_', ' ')}
          </option>
        ))}
      </select>
    </label>
  )
}
