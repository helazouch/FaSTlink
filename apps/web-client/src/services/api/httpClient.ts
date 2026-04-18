import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthSession } from '../../types/auth'
import { env } from '../../config/env'
import {
  clearStoredSession,
  getStoredAccessToken,
  readStoredSession,
  saveStoredSession,
} from '../auth/authStorage'

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponseDto {
  accessToken: string
  refreshToken?: string
  tokenType?: string
  expiresAt?: string
  expiresInSeconds?: number
  user?: {
    id: number
    fullName?: string
    nomComplet?: string
    email: string
    roles?: string[]
    headline?: string
    avatarUrl?: string
  }
  utilisateur?: {
    id: number
    fullName?: string
    nomComplet?: string
    email: string
    roles?: string[]
    headline?: string
    avatarUrl?: string
  }
}

const AUTH_PATHS = ['/v1/auth/login', '/v1/auth/register', '/v1/auth/refresh']

const isAuthPath = (url: string): boolean => AUTH_PATHS.some((path) => url.includes(path))

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 8_000,
})

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 8_000,
})

let refreshInFlight: Promise<AuthSession | null> | null = null

const toSession = (payload: RefreshResponseDto, currentSession: AuthSession): AuthSession => {
  const userPayload = payload.user ?? payload.utilisateur

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken ?? currentSession.refreshToken,
    tokenType: payload.tokenType ?? currentSession.tokenType,
    expiresAt:
      payload.expiresAt ??
      new Date(Date.now() + (payload.expiresInSeconds ?? 3_600) * 1_000).toISOString(),
    user: userPayload
      ? {
          id: userPayload.id,
          fullName: userPayload.fullName ?? userPayload.nomComplet ?? currentSession.user.fullName,
          email: userPayload.email,
          roles: userPayload.roles ?? currentSession.user.roles,
          headline: userPayload.headline,
          avatarUrl: userPayload.avatarUrl,
        }
      : currentSession.user,
  }
}

const refreshAccessToken = async (): Promise<AuthSession | null> => {
  const session = readStoredSession()
  if (!session?.refreshToken) {
    return null
  }

  const response = await refreshClient.post<RefreshResponseDto>('/v1/auth/refresh', {
    refreshToken: session.refreshToken,
  })

  const refreshedSession = toSession(response.data, session)
  saveStoredSession(refreshedSession)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('fastlink:auth:session-refreshed', {
        detail: refreshedSession,
      }),
    )
  }

  return refreshedSession
}

const dispatchUnauthorized = () => {
  clearStoredSession()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fastlink:auth:unauthorized'))
  }
}

httpClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const requestConfig = error.config as RetryableRequest | undefined
    const requestUrl = String(requestConfig?.url ?? '')

    if (!requestConfig || status !== 401 || isAuthPath(requestUrl)) {
      return Promise.reject(error)
    }

    if (requestConfig._retry) {
      dispatchUnauthorized()
      return Promise.reject(error)
    }

    requestConfig._retry = true

    try {
      refreshInFlight ??= refreshAccessToken().finally(() => {
        refreshInFlight = null
      })

      const refreshedSession = await refreshInFlight

      if (!refreshedSession?.accessToken) {
        dispatchUnauthorized()
        return Promise.reject(error)
      }

      requestConfig.headers.Authorization = `Bearer ${refreshedSession.accessToken}`
      return httpClient(requestConfig)
    } catch (refreshError) {
      dispatchUnauthorized()
      return Promise.reject(refreshError)
    }
  },
)
