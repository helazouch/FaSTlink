import { Route, Routes } from 'react-router-dom'
import { screen } from '@testing-library/react'
import { ProtectedRoute } from './ProtectedRoute'
import { renderWithProviders } from '../test/test-utils'

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Private content</div>} />
        </Route>
        <Route path="/login" element={<div>Login screen</div>} />
      </Routes>,
      {
        route: '/dashboard',
        authState: {
          status: 'unauthenticated',
          session: null,
          user: null,
        },
      },
    )

    expect(screen.getByText('Login screen')).toBeInTheDocument()
  })

  it('renders nested content for authenticated users', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Private content</div>} />
        </Route>
      </Routes>,
      {
        route: '/dashboard',
      },
    )

    expect(screen.getByText('Private content')).toBeInTheDocument()
  })
})
