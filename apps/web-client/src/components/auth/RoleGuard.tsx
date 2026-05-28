import type { ReactNode } from 'react'
import { useCurrentEntityContext } from '../../hooks/useCurrentEntityContext'
import { usePermissions } from '../../hooks/usePermissions'
import type { EntityRole } from '../../types/auth'

interface RoleGuardProps {
  children: ReactNode
  globalRole?: string
  anyEntityRole?: EntityRole
  currentEntityRole?: EntityRole
  fallback?: ReactNode
}

export const RoleGuard = ({
  children,
  globalRole,
  anyEntityRole,
  currentEntityRole,
  fallback = null,
}: RoleGuardProps) => {
  const permissions = usePermissions()
  const { currentEntityId } = useCurrentEntityContext()

  const hasGlobal = globalRole ? permissions.hasGlobalRole(globalRole) : true
  const hasAnyRole = anyEntityRole
    ? permissions.memberships.some((membership) => membership.role === anyEntityRole)
    : true
  const hasCurrentRole = currentEntityRole
    ? permissions.hasEntityRole(currentEntityId, currentEntityRole)
    : true

  if (hasGlobal && hasAnyRole && hasCurrentRole) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
