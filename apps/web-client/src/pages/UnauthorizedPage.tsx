import { LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/role/EmptyState'

export const UnauthorizedPage = () => (
  <div className="space-y-4">
    <EmptyState
      icon={LockKeyhole}
      title="This workspace is not available"
      description="Your current global role, entity role, or selected entity context does not allow this action."
    />
    <div className="text-center">
      <Link
        to="/"
        className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Back to feed
      </Link>
    </div>
  </div>
)
