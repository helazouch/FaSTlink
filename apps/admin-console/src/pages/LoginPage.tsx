import { ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { normalizeApiError } from '../lib/errors'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { TextInput } from '../components/ui/TextInput'

export const LoginPage = () => {
  const status = useAuthStore((state) => state.status)
  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    try {
      await login({ email, password })
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (normalized.statusCode === 401) {
        setErrorMessage('Invalid credentials. Please verify email and password.')
        return
      }

      setErrorMessage(normalized.message)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-100 px-4 py-10 dark:bg-surface-900">
      <div className="panel w-full max-w-md p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary-100 p-2 text-primary-700 dark:bg-primary-500/20 dark:text-primary-100">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">FaST Link</p>
            <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
          </div>
        </div>

        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Sign in with an ADMIN role account to manage platform operations and moderation.
        </p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="admin@fastlink.dev"
          />
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="Your password"
          />

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger dark:border-red-500/30 dark:bg-red-500/10">
              {errorMessage}
            </p>
          ) : null}

          <Button className="w-full" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in...' : 'Access admin console'}
          </Button>
        </form>
      </div>
    </div>
  )
}
