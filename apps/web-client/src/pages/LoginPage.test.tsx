import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { LoginPage } from './LoginPage'
import { renderWithProviders } from '../test/test-utils'

describe('LoginPage', () => {
  it('submits login credentials through auth store action', async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(<LoginPage />, {
      route: '/login',
      authState: {
        status: 'unauthenticated',
        session: null,
        user: null,
      },
      authActions: {
        login: loginMock,
      },
    })

    await userEvent.type(screen.getByLabelText(/email/i), 'john@fastlink.dev')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123!')
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'john@fastlink.dev',
        password: 'Password123!',
      })
    })
  })

  it('shows link to register page', () => {
    renderWithProviders(<LoginPage />, {
      route: '/login',
      authState: {
        status: 'unauthenticated',
        session: null,
        user: null,
      },
    })

    expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument()
  })
})
