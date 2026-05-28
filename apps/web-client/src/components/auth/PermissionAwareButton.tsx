import type { ButtonHTMLAttributes } from 'react'
import { useCurrentEntityContext } from '../../hooks/useCurrentEntityContext'
import { usePermissions } from '../../hooks/usePermissions'

interface PermissionAwareButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: string
  anyEntityPermission?: string
  globalRole?: string
  entityId?: number | string | null
  hideIfUnauthorized?: boolean
}

export const PermissionAwareButton = ({
  permission,
  anyEntityPermission,
  globalRole,
  entityId,
  hideIfUnauthorized = true,
  className,
  disabled,
  ...buttonProps
}: PermissionAwareButtonProps) => {
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
  const isAllowed = allowedByGlobalRole && allowedByPermission && allowedByAnyPermission

  if (!isAllowed && hideIfUnauthorized) {
    return null
  }

  return (
    <button
      {...buttonProps}
      disabled={disabled || !isAllowed}
      className={[
        className,
        !isAllowed ? 'cursor-not-allowed opacity-60' : null,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
