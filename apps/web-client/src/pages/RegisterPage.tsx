import { UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/atoms/Button'
import { TextInput } from '../components/atoms/TextInput'
import { normalizeApiError } from '../lib/errors'
import { useAuthStore } from '../stores/authStore'

const getFriendlyError = (error: unknown): string => {
  const normalized = normalizeApiError(error)

  if (normalized.statusCode === 409 && normalized.message.includes('Request failed with status')) {
    return 'This email is already associated with an account.'
  }

  return normalized.message || 'Registration failed. Please try again.'
}

export const RegisterPage = () => {
  const navigate = useNavigate()
  const status = useAuthStore((state) => state.status)
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated')
  const register = useAuthStore((state) => state.register)

  const [fullName, setFullName] = useState('')
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
      await register({
        fullName,
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
        <h1 className="mt-3 text-3xl font-bold text-slate-800">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Join the collaboration network for communities and events.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <TextInput
            label="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nora Ait Kaci"
            required
          />
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
            placeholder="Minimum 8 characters"
            minLength={8}
            required
          />

          {errorMessage ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            <UserPlus size={16} />
            {status === 'loading' ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  )
}
