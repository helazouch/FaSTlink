import type { ReactNode } from 'react'
import { useCurrentEntityContext } from '../../hooks/useCurrentEntityContext'

interface EntityScopedGuardProps {
  children: ReactNode
  requireMembership?: boolean
  fallback?: ReactNode
}

export const EntityScopedGuard = ({
  children,
  requireMembership = true,
  fallback = null,
}: EntityScopedGuardProps) => {
  const { currentEntityId, memberships } = useCurrentEntityContext()

  if (currentEntityId === null) {
    return <>{fallback}</>
  }

  if (requireMembership && !memberships.some((membership) => membership.entityId === currentEntityId)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
