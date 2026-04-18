import { httpClient } from '../api/httpClient'
import type { AuthSession, AuthUser, LoginPayload, RegisterPayload } from '../../types/auth'

interface AuthUserDto {
  id: number
  nomComplet?: string
  fullName?: string
  email: string
  roles?: string[]
  headline?: string
  avatarUrl?: string
}

interface AuthResponseDto {
  accessToken: string
  refreshToken?: string
  tokenType?: string
  expiresAt?: string
  expiresInSeconds?: number
  utilisateur?: AuthUserDto
  user?: AuthUserDto
}

interface RefreshPayload {
  refreshToken: string
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

const toAuthUser = (payload: AuthUserDto): AuthUser => ({
  id: payload.id,
  fullName: payload.nomComplet ?? payload.fullName ?? 'FaST Link User',
  email: payload.email,
  roles: Array.isArray(payload.roles) ? payload.roles : ['USER'],
  headline: payload.headline,
  avatarUrl: payload.avatarUrl,
})

const toSession = (payload: AuthResponseDto): AuthSession => {
  const rawUser = payload.user ?? payload.utilisateur

  if (!rawUser) {
    throw new Error('Authentication response does not contain user information')
  }

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    tokenType: payload.tokenType ?? 'Bearer',
    expiresAt: buildExpiry(payload.expiresAt, payload.expiresInSeconds),
    user: toAuthUser(rawUser),
  }
}

export const loginWithCredentials = async (payload: LoginPayload): Promise<AuthSession> => {
  const response = await httpClient.post<AuthResponseDto>(`${AUTH_BASE_PATH}/login`, {
    email: payload.email,
    password: payload.password,
    motDePasse: payload.password,
  })

  return toSession(response.data)
}

export const registerAccount = async (payload: RegisterPayload): Promise<AuthSession> => {
  const response = await httpClient.post<AuthResponseDto>(`${AUTH_BASE_PATH}/register`, {
    fullName: payload.fullName,
    nomComplet: payload.fullName,
    email: payload.email,
    password: payload.password,
    motDePasse: payload.password,
  })

  return toSession(response.data)
}

export const refreshSession = async (refreshToken: string): Promise<AuthSession> => {
  const response = await httpClient.post<AuthResponseDto>(`${AUTH_BASE_PATH}/refresh`, {
    refreshToken,
  } satisfies RefreshPayload)

  return toSession(response.data)
}

export const validateCurrentUser = async (): Promise<AuthUser> => {
  const response = await httpClient.get<AuthUserDto>(`${AUTH_BASE_PATH}/validate`)
  return toAuthUser(response.data)
}
