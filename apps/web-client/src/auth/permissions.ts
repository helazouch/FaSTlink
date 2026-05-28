import {
  activeMemberships,
  bureauEntityIds,
  coordinatorEntityIds,
  hasAnyEntityRole,
  hasAnyEntityPermission,
  hasEntityPermission,
  hasEntityRole,
  hasGlobalRole,
} from './authorization'
import type { AuthUser, EntityRole } from '../types/auth'

export const buildPermissions = (user: AuthUser | null) => ({
  user,
  memberships: activeMemberships(user),
  isAdmin: hasGlobalRole(user, 'ADMIN'),
  isCoordinator: hasAnyEntityRole(user, ['COORDINATOR']),
  isBureauMember: hasAnyEntityRole(user, ['BUREAU_MEMBER']),
  bureauEntityIds: bureauEntityIds(user),
  coordinatorEntityIds: coordinatorEntityIds(user),
  hasGlobalRole: (role: string) => hasGlobalRole(user, role),
  hasEntityRole: (entityId: number | string | null | undefined, role: EntityRole) =>
    hasEntityRole(user, entityId, role),
  hasEntityPermission: (entityId: number | string | null | undefined, permission: string) =>
    hasEntityPermission(user, entityId, permission),
  hasAnyEntityPermission: (permission: string) => hasAnyEntityPermission(user, permission),
  canPublishInEntity: (entityId: number | string | null | undefined) =>
    hasEntityPermission(user, entityId, 'PUBLICATION_CREATE'),
  canManageCommunity: (entityId: number | string | null | undefined) =>
    hasEntityPermission(user, entityId, 'COMMUNITY_MANAGE'),
  canManageMembers: (entityId: number | string | null | undefined) =>
    hasEntityPermission(user, entityId, 'ENTITY_MEMBER_MANAGE'),
  canManageEvents: (entityId: number | string | null | undefined) =>
    hasEntityPermission(user, entityId, 'EVENT_CREATE'),
  canViewEntityStats: (entityId: number | string | null | undefined) =>
    hasEntityPermission(user, entityId, 'ANALYTICS_VIEW'),
  canSubmitRequests: (entityId: number | string | null | undefined) =>
    hasEntityRole(user, entityId, 'BUREAU_MEMBER'),
  canProcessRequests: () =>
    hasAnyEntityPermission(user, 'REQUEST_APPROVE') || hasAnyEntityPermission(user, 'REQUEST_REJECT'),
  canViewAdvancedAnalytics: () => hasAnyEntityPermission(user, 'ANALYTICS_VIEW'),
  canViewCrossEntityStats: () => hasAnyEntityPermission(user, 'ANALYTICS_VIEW'),
  canSuperviseEntities: () => hasAnyEntityPermission(user, 'PUBLICATION_MODERATE'),
  canOverseeOperations: () => hasAnyEntityPermission(user, 'OPERATIONS_OVERSIGHT'),
  canCoordinate: (entityId: number | string | null | undefined) =>
    hasEntityRole(user, entityId, 'COORDINATOR'),
})

export type PermissionsValue = ReturnType<typeof buildPermissions>
