import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentEntityContext } from '../hooks/useCurrentEntityContext'
import { usePermissions } from '../hooks/usePermissions'
import type { EntityRole } from '../types/auth'

interface RoleAwareRouteProps {
  globalRole?: string
  anyEntityRole?: EntityRole
  currentEntityRole?: EntityRole
  permission?: string
}

export const RoleAwareRoute = ({
  globalRole,
  anyEntityRole,
  currentEntityRole,
  permission,
}: RoleAwareRouteProps) => {
  const permissions = usePermissions()
  const { currentEntityId } = useCurrentEntityContext()

  const hasGlobal = globalRole ? permissions.hasGlobalRole(globalRole) : true
  const hasAnyRole = anyEntityRole
    ? permissions.memberships.some((membership) => membership.role === anyEntityRole)
    : true
  const hasCurrentRole = currentEntityRole ? permissions.hasEntityRole(currentEntityId, currentEntityRole) : true
  const hasPermission = permission ? permissions.hasEntityPermission(currentEntityId, permission) : true

  if (!hasGlobal || !hasAnyRole || !hasCurrentRole || !hasPermission) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
