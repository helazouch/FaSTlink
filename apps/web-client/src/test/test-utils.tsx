import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import type { AuthSession } from '../types/auth'
import type { AuthStoreState } from '../stores/authStore'
import { useAuthStore } from '../stores/authStore'

export const fallbackSession: AuthSession = {
  accessToken: 'test-token',
  refreshToken: 'refresh-token',
  tokenType: 'Bearer',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  user: {
    id: 1,
    fullName: 'Test User',
    email: 'test@fastlink.dev',
    roles: ['USER'],
    entityMemberships: [],
    entityPermissions: {},
  },
}

type AuthStateOverrides = Partial<
  Pick<AuthStoreState, 'status' | 'session' | 'user' | 'error'>
>

type AuthActionOverrides = Partial<
  Pick<AuthStoreState, 'login' | 'register' | 'logout' | 'bootstrap'>
>

export const setAuthState = (
  stateOverrides: AuthStateOverrides = {},
  actionOverrides: AuthActionOverrides = {},
) => {
  const current = useAuthStore.getState()

  useAuthStore.setState({
    ...current,
    status: stateOverrides.status ?? 'authenticated',
    session: stateOverrides.session ?? fallbackSession,
    user: stateOverrides.user ?? fallbackSession.user,
    error: stateOverrides.error ?? null,
    ...actionOverrides,
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  authState?: AuthStateOverrides
  authActions?: AuthActionOverrides
}

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', authState, authActions, ...renderOptions }: CustomRenderOptions = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  setAuthState(authState, authActions)

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )

  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  })
}
