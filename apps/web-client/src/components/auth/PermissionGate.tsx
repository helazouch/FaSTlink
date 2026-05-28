import type { ReactNode } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import type { EntityRole } from '../../types/auth'

interface PermissionGateProps {
  children: ReactNode
  entityId?: number | string | null
  entityRole?: EntityRole
  permission?: string
  anyEntityPermission?: string
  globalRole?: string
  fallback?: ReactNode
}

export const PermissionGate = ({
  children,
  entityId,
  entityRole,
  permission,
  anyEntityPermission,
  globalRole,
  fallback = null,
}: PermissionGateProps) => {
  const permissions = usePermissions()
  const allowedByGlobalRole = globalRole ? permissions.hasGlobalRole(globalRole) : true
  const allowedByEntityRole = entityRole ? permissions.hasEntityRole(entityId, entityRole) : true
  const allowedByPermission = permission ? permissions.hasEntityPermission(entityId, permission) : true
  const allowedByAnyPermission = anyEntityPermission
    ? permissions.hasAnyEntityPermission(anyEntityPermission)
    : true

  if (allowedByGlobalRole && allowedByEntityRole && allowedByPermission && allowedByAnyPermission) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
