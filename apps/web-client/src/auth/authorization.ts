import type { AuthUser, EntityMembershipClaim, EntityRole } from '../types/auth'

export const normalizeRole = (role: string): string => role.trim().toUpperCase()

export const hasGlobalRole = (user: AuthUser | null | undefined, role: string): boolean =>
  Boolean(user?.roles.some((item) => normalizeRole(item) === normalizeRole(role)))

export const activeMemberships = (user: AuthUser | null | undefined): EntityMembershipClaim[] =>
  user?.entityMemberships.filter((membership) => membership.status.toUpperCase() === 'ACTIVE') ?? []

export const hasEntityRole = (
  user: AuthUser | null | undefined,
  entityId: number | string | null | undefined,
  role: EntityRole,
): boolean => {
  const resolvedEntityId = Number(entityId)
  if (!Number.isFinite(resolvedEntityId)) {
    return false
  }

  return activeMemberships(user).some(
    (membership) => membership.entityId === resolvedEntityId && membership.role === role,
  )
}

export const hasAnyEntityRole = (
  user: AuthUser | null | undefined,
  roles: EntityRole[],
): boolean => activeMemberships(user).some((membership) => roles.includes(membership.role))

export const hasEntityPermission = (
  user: AuthUser | null | undefined,
  entityId: number | string | null | undefined,
  permission: string,
): boolean => {
  if (hasGlobalRole(user, 'ADMIN')) {
    return true
  }

  const resolvedEntityId = Number(entityId)
  if (!Number.isFinite(resolvedEntityId)) {
    return false
  }

  const permissions = user?.entityPermissions[String(resolvedEntityId)] ?? []
  if (permissions.some((item) => normalizeRole(item) === normalizeRole(permission))) {
    return true
  }

  return hasEntityPermissionFromMembership(user, resolvedEntityId, permission)
}

export const hasAnyEntityPermission = (
  user: AuthUser | null | undefined,
  permission: string,
): boolean => {
  if (hasGlobalRole(user, 'ADMIN')) {
    return true
  }

  const entries = Object.values(user?.entityPermissions ?? {})
  if (entries.some((permissions) =>
    permissions.some((item) => normalizeRole(item) === normalizeRole(permission)),
  )) {
    return true
  }

  return activeMemberships(user).some((membership) =>
    membership.role === 'BUREAU_MEMBER' &&
    ['ENTITY_MEMBER_MANAGE', 'COMMUNITY_MANAGE', 'PUBLICATION_CREATE', 'REQUEST_SUBMIT'].includes(normalizeRole(permission)),
  ) || activeMemberships(user).some((membership) =>
    membership.role === 'COORDINATOR' &&
    ['REQUEST_APPROVE', 'REQUEST_REJECT'].includes(normalizeRole(permission)),
  )
}

const hasEntityPermissionFromMembership = (
  user: AuthUser | null | undefined,
  entityId: number,
  permission: string,
): boolean => activeMemberships(user).some((membership) =>
  membership.entityId === entityId &&
  membership.role === 'BUREAU_MEMBER' &&
  ['ENTITY_MEMBER_MANAGE', 'COMMUNITY_MANAGE', 'PUBLICATION_CREATE', 'REQUEST_SUBMIT'].includes(normalizeRole(permission)),
)

export const bureauEntityIds = (user: AuthUser | null | undefined): number[] =>
  activeMemberships(user)
    .filter((membership) => membership.role === 'BUREAU_MEMBER')
    .map((membership) => membership.entityId)

export const coordinatorEntityIds = (user: AuthUser | null | undefined): number[] =>
  activeMemberships(user)
    .filter((membership) => membership.role === 'COORDINATOR')
    .map((membership) => membership.entityId)
