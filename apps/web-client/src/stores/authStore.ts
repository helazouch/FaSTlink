import { create } from 'zustand'
import { loginWithCredentials, refreshSession, registerAccount, validateCurrentUser } from '../services/auth/authService'
import { clearStoredSession, readStoredSession, saveStoredSession } from '../services/auth/authStorage'
import type { AuthSession, LoginPayload, RegisterPayload } from '../types/auth'

type AuthStatus = 'bootstrapping' | 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthStoreState {
  status: AuthStatus
  session: AuthSession | null
  user: AuthSession['user'] | null
  error: string | null
  bootstrap: () => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  setSession: (session: AuthSession) => void
  clearError: () => void
}

const toAuthSession = (session: AuthSession, fullName?: string): AuthSession => ({
  ...session,
  user: {
    ...session.user,
    fullName: fullName ?? session.user.fullName,
  },
})

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
  setSession: (session) => {
    persistSession(session, set)
  },
  logout: () => {
    clearStoredSession()
    set({
      status: 'unauthenticated',
      session: null,
      user: null,
      error: null,
    })
  },
  bootstrap: async () => {
    const currentState = get()
    if (currentState.status !== 'bootstrapping') {
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
      persistSession(toAuthSession(storedSession, validatedUser.fullName), set)
    } catch {
      if (!storedSession.refreshToken) {
        get().logout()
        return
      }

      try {
        const refreshedSession = await refreshSession(storedSession.refreshToken)
        persistSession(refreshedSession, set)
      } catch {
        get().logout()
      }
    }
  },
  login: async (payload) => {
    set({ status: 'loading', error: null })

    try {
      const session = await loginWithCredentials(payload)
      persistSession(session, set)
    } catch (error) {
      set({
        status: 'unauthenticated',
        session: null,
        user: null,
        error: error instanceof Error ? error.message : 'Unable to sign in',
      })
      throw error
    }
  },
  register: async (payload) => {
    set({ status: 'loading', error: null })

    try {
      const session = await registerAccount(payload)
      persistSession(session, set)
    } catch (error) {
      set({
        status: 'unauthenticated',
        session: null,
        user: null,
        error: error instanceof Error ? error.message : 'Unable to create account',
      })
      throw error
    }
  },
}))
