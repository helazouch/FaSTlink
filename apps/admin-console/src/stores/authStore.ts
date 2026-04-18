import { create } from 'zustand'
import type { AuthSession, LoginPayload } from '../types/auth'
import { normalizeApiError } from '../lib/errors'
import { loginWithCredentials, validateCurrentUser } from '../services/auth/authService'
import { clearStoredSession, readStoredSession, saveStoredSession } from '../services/auth/authStorage'

type AuthStatus = 'bootstrapping' | 'loading' | 'authenticated' | 'unauthenticated'

interface AuthStoreState {
  status: AuthStatus
  session: AuthSession | null
  user: AuthSession['user'] | null
  error: string | null
  bootstrap: () => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
  hasRole: (role: string) => boolean
  clearError: () => void
}

const hasAdminRole = (session: AuthSession | null): boolean =>
  Boolean(session?.user.roles.some((role) => role.toUpperCase() === 'ADMIN'))

const persistSession = (session: AuthSession, set: (partial: Partial<AuthStoreState>) => void) => {
  saveStoredSession(session)
  set({
    status: 'authenticated',
    session,
    user: session.user,
    error: null,
  })
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  status: 'bootstrapping',
  session: null,
  user: null,
  error: null,
  clearError: () => set({ error: null }),
  logout: () => {
    clearStoredSession()
    set({
      status: 'unauthenticated',
      session: null,
      user: null,
      error: null,
    })
  },
  hasRole: (role: string) =>
    Boolean(get().user?.roles.some((item) => item.toUpperCase() === role.toUpperCase())),
  bootstrap: async () => {
    const state = get()
    if (state.status !== 'bootstrapping') {
      return
    }

    const storedSession = readStoredSession()
    if (!storedSession) {
      set({ status: 'unauthenticated', session: null, user: null, error: null })
      return
    }

    set({ status: 'loading', session: storedSession, user: storedSession.user, error: null })

    try {
      const validatedUser = await validateCurrentUser()
      const validatedSession: AuthSession = {
        ...storedSession,
        user: {
          ...storedSession.user,
          fullName: validatedUser.fullName,
          roles: validatedUser.roles,
        },
      }

      if (!hasAdminRole(validatedSession)) {
        get().logout()
        set({ error: 'Your account is authenticated but does not have ADMIN privileges.' })
        return
      }

      persistSession(validatedSession, set)
    } catch {
      get().logout()
    }
  },
  login: async (payload) => {
    set({ status: 'loading', error: null })

    try {
      const session = await loginWithCredentials(payload)
      if (!hasAdminRole(session)) {
        get().logout()
        set({ error: 'This account does not have access to the admin console.' })
        throw new Error('ADMIN role required')
      }

      persistSession(session, set)
    } catch (error) {
      const normalized = normalizeApiError(error)
      set({
        status: 'unauthenticated',
        session: null,
        user: null,
        error: normalized.message || 'Unable to sign in',
      })
      throw error
    }
  },
}))
