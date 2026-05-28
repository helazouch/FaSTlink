import type { ReactNode } from 'react'
import { useCurrentEntityContext } from '../../hooks/useCurrentEntityContext'
import { usePermissions } from '../../hooks/usePermissions'

interface PermissionGuardProps {
  children: ReactNode
  permission?: string
  anyEntityPermission?: string
  globalRole?: string
  entityId?: number | string | null
  fallback?: ReactNode
}

export const PermissionGuard = ({
  children,
  permission,
  anyEntityPermission,
  globalRole,
  entityId,
  fallback = null,
}: PermissionGuardProps) => {
  const permissions = usePermissions()
  const { currentEntityId } = useCurrentEntityContext()
  const resolvedEntityId = entityId ?? currentEntityId

  const allowedByGlobalRole = globalRole ? permissions.hasGlobalRole(globalRole) : true
  const allowedByPermission = permission
    ? permissions.hasEntityPermission(resolvedEntityId, permission)
    : true
  const allowedByAnyPermission = anyEntityPermission
    ? permissions.hasAnyEntityPermission(anyEntityPermission)
    : true

  if (allowedByGlobalRole && allowedByPermission && allowedByAnyPermission) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
