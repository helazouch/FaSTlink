import { useMemo } from 'react'
import { useCurrentEntityContext } from './useCurrentEntityContext'
import { usePermissions } from './usePermissions'

export const useScopedPermissions = () => {
  const { currentEntityId, currentMembership, memberships } = useCurrentEntityContext()
  const permissions = usePermissions()

  return useMemo(() => {
    const canPublish = permissions.canPublishInEntity(currentEntityId)
    const canManageCommunity = permissions.canManageCommunity(currentEntityId)
    const canManageMembers = permissions.canManageMembers(currentEntityId)
    const canManageEvents = permissions.canManageEvents(currentEntityId)
    const canViewStats = permissions.canViewEntityStats(currentEntityId)
    const canSubmitRequests = permissions.canSubmitRequests(currentEntityId)

    return {
      currentEntityId,
      currentMembership,
      memberships,
      isAdmin: permissions.isAdmin,
      isCoordinator: permissions.isCoordinator,
      isBureauMember: currentEntityId !== null && permissions.hasEntityRole(currentEntityId, 'BUREAU_MEMBER'),
      canPublish,
      canManageCommunity,
      canManageMembers,
      canManageEvents,
      canViewStats,
      canSubmitRequests,
      canProcessRequests: permissions.canProcessRequests(),
      canViewAdvancedAnalytics: permissions.canViewAdvancedAnalytics(),
      canViewCrossEntityStats: permissions.canViewCrossEntityStats(),
      canSuperviseEntities: permissions.canSuperviseEntities(),
      canOverseeOperations: permissions.canOverseeOperations(),
    }
  }, [
    currentEntityId,
    currentMembership,
    memberships,
    permissions,
  ])
}
