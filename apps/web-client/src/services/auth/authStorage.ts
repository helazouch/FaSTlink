import type { AuthSession } from '../../types/auth'

const AUTH_STORAGE_KEY = 'fastlink.auth.session'

const isExpired = (session: AuthSession): boolean => {
  const expiresAtTimestamp = Date.parse(session.expiresAt)
  if (Number.isNaN(expiresAtTimestamp)) {
    return true
  }

  return expiresAtTimestamp <= Date.now()
}

export const readStoredSession = (): AuthSession | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const serializedValue = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!serializedValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(serializedValue) as AuthSession

    if (!parsedValue.accessToken || !parsedValue.user || isExpired(parsedValue)) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return parsedValue
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export const saveStoredSession = (session: AuthSession): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export const clearStoredSession = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const getStoredAccessToken = (): string | null => readStoredSession()?.accessToken ?? null

export const getStoredRefreshToken = (): string | null => readStoredSession()?.refreshToken ?? null
