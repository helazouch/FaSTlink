import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import {
  loginWithCredentials,
  registerAccount,
  validateCurrentUser,
} from '../services/auth/authService'
import {
  clearStoredSession,
  readStoredSession,
  saveStoredSession,
} from '../services/auth/authStorage'
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth'
import { AuthContext } from './authContextBase'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  session: AuthSession | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  hasRole: (role: string) => boolean
}

const initialSession = readStoredSession()

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<AuthSession | null>(initialSession)
  const [status, setStatus] = useState<AuthStatus>(
    initialSession ? 'authenticated' : 'unauthenticated',
  )

  const logout = useCallback(() => {
    clearStoredSession()
    setSession(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleUnauthorized = () => {
      logout()
    }

    window.addEventListener('fastlink:auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('fastlink:auth:unauthorized', handleUnauthorized)
    }
  }, [logout])

  const login = useCallback(async (payload: LoginPayload) => {
    setStatus('loading')

    try {
      const nextSession = await loginWithCredentials(payload)
      saveStoredSession(nextSession)
      setSession(nextSession)
      setStatus('authenticated')
    } catch (error) {
      setStatus('unauthenticated')
      throw error
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    setStatus('loading')

    try {
      const nextSession = await registerAccount(payload)
      saveStoredSession(nextSession)
      setSession(nextSession)
      setStatus('authenticated')
    } catch (error) {
      setStatus('unauthenticated')
      throw error
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (!session) {
      return
    }

    setStatus('loading')

    try {
      const validatedUser = await validateCurrentUser()
      const nextSession: AuthSession = {
        ...session,
        user: validatedUser,
      }
      saveStoredSession(nextSession)
      setSession(nextSession)
      setStatus('authenticated')
    } catch {
      logout()
    }
  }, [logout, session])

  const hasRole = useCallback(
    (role: string) =>
      Boolean(session?.user.roles.some((item) => item.toUpperCase() === role.toUpperCase())),
    [session],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      isAuthenticated: status === 'authenticated' && Boolean(session?.accessToken),
      login,
      register,
      logout,
      refreshUser,
      hasRole,
    }),
    [hasRole, login, logout, refreshUser, register, session, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
