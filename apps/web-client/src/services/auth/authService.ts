import { httpClient } from '../api/httpClient'
import { decodeJwtPayload } from '../../lib/jwt'
import type {
  AuthSession,
  AuthUser,
  EntityMembershipClaim,
  EntityRole,
  LoginPayload,
  RegisterPayload,
} from '../../types/auth'

interface AuthUserDto {
  id: number
  nomComplet?: string
  fullName?: string
  email: string
  roles?: string[]
  headline?: string
  avatarUrl?: string
  entityMemberships?: EntityMembershipClaim[]
  entityPermissions?: Record<string, string[]>
}

interface AuthResponseDto {
  accessToken: string
  tokenType?: string
  expiresAt?: string
  expiresInSeconds?: number
  utilisateur?: AuthUserDto
  user?: AuthUserDto
  refreshToken?: string
}

interface AccessTokenClaims extends Record<string, unknown> {
  roles?: unknown
  uid?: unknown
  entityMemberships?: unknown
  entityPermissions?: unknown
}

const AUTH_BASE_PATH = '/v1/auth'

const buildExpiry = (expiresAt?: string, expiresInSeconds?: number): string => {
  if (expiresAt) {
    return expiresAt
  }

  if (typeof expiresInSeconds === 'number' && Number.isFinite(expiresInSeconds)) {
    return new Date(Date.now() + expiresInSeconds * 1_000).toISOString()
  }

  return new Date(Date.now() + 60 * 60 * 1_000).toISOString()
}

const isEntityRole = (role: string): role is EntityRole =>
  role === 'SIMPLE_MEMBER' || role === 'BUREAU_MEMBER'

const toMemberships = (value: unknown): EntityMembershipClaim[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return []
    }

    const record = item as Record<string, unknown>
    const entityId = Number(record.entityId)
    const role = String(record.role ?? '').toUpperCase()
    if (!Number.isFinite(entityId) || !isEntityRole(role)) {
      return []
    }

    const entityName = typeof record.entityName === 'string' ? record.entityName : undefined
    const status = typeof record.status === 'string' ? record.status : 'ACTIVE'
    return [{ entityId, entityName, role, status }]
  })
}

const toEntityPermissions = (value: unknown): Record<string, string[]> => {
  if (!value || typeof value !== 'object') {
    return {}
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string[]>>(
    (accumulator, [entityId, permissions]) => {
      if (Array.isArray(permissions)) {
        accumulator[entityId] = permissions.map(String)
      }
      return accumulator
    },
    {},
  )
}

const toRoles = (payloadRoles: unknown, claimRoles: unknown): string[] => {
  const roles = Array.isArray(payloadRoles) ? payloadRoles : Array.isArray(claimRoles) ? claimRoles : ['USER']
  return roles.map(String)
}

const toAuthUser = (payload: AuthUserDto, claims: Partial<AccessTokenClaims>): AuthUser => ({
  id: payload.id || Number(claims.uid) || 0,
  fullName: payload.nomComplet ?? payload.fullName ?? 'FaST Link User',
  email: payload.email,
  roles: toRoles(payload.roles, claims.roles),
  entityMemberships: payload.entityMemberships ?? toMemberships(claims.entityMemberships),
  entityPermissions: payload.entityPermissions ?? toEntityPermissions(claims.entityPermissions),
  headline: payload.headline,
  avatarUrl: payload.avatarUrl,
})

const toSession = (payload: AuthResponseDto): AuthSession => {
  const rawUser = payload.user ?? payload.utilisateur
  const claims = decodeJwtPayload<AccessTokenClaims>(payload.accessToken)

  if (!rawUser) {
    throw new Error('Authentication response does not contain user information')
  }

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    tokenType: payload.tokenType ?? 'Bearer',
    expiresAt: buildExpiry(payload.expiresAt, payload.expiresInSeconds),
    user: toAuthUser(rawUser, claims),
  }
}

export const loginWithCredentials = async (payload: LoginPayload): Promise<AuthSession> => {
  const response = await httpClient.post<AuthResponseDto>(`${AUTH_BASE_PATH}/login`, {
    email: payload.email,
    motDePasse: payload.password,
  })

  return toSession(response.data)
}

export const registerAccount = async (payload: RegisterPayload): Promise<AuthSession> => {
  const response = await httpClient.post<AuthResponseDto>(`${AUTH_BASE_PATH}/register`, {
    nomComplet: payload.fullName,
    email: payload.email,
    motDePasse: payload.password,
  })

  return toSession(response.data)
}

export const validateCurrentUser = async (): Promise<AuthUser> => {
  const response = await httpClient.get<AuthUserDto>(`${AUTH_BASE_PATH}/validate`)
  return toAuthUser(response.data, {})
}
