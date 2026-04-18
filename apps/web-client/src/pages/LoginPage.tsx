import { LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/atoms/Button'
import { TextInput } from '../components/atoms/TextInput'
import { normalizeApiError } from '../lib/errors'
import { useAuthStore } from '../stores/authStore'

const getFriendlyError = (error: unknown): string => {
  const normalized = normalizeApiError(error)

  if (normalized.statusCode === 401 && normalized.message.includes('Request failed with status')) {
    return 'Invalid credentials. Please check your email and password.'
  }

  return normalized.message || 'Unable to sign in. Please try again.'
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const status = useAuthStore((state) => state.status)
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated')
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    try {
      await login({
        email,
        password,
      })
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(getFriendlyError(error))
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_15%,rgba(101,17,239,0.14),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.1),transparent_30%),radial-gradient(circle_at_60%_80%,rgba(16,185,129,0.08),transparent_35%)]" />

      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">FaST Link</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-800">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in with your JWT credentials.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@fastlink.app"
            required
          />
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            required
          />

          {errorMessage ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            <LogIn size={16} />
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New to FaST Link?{' '}
          <Link to="/register" className="font-semibold text-brand hover:text-brand-700">
            Create account
          </Link>
        </p>
      </section>
    </div>
  )
}
