export interface AuthUser {
  id: number
  fullName: string
  email: string
  roles: string[]
  entityMemberships: EntityMembershipClaim[]
  entityPermissions: Record<string, string[]>
  headline?: string
  avatarUrl?: string
}

export type EntityRole = 'SIMPLE_MEMBER' | 'BUREAU_MEMBER'

export interface EntityMembershipClaim {
  entityId: number
  entityName?: string
  role: EntityRole
  status: string
}

export interface AuthSession {
  accessToken: string
  refreshToken?: string
  tokenType: string
  expiresAt: string
  user: AuthUser
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
}
