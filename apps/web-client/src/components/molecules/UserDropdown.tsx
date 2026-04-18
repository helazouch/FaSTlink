import { ChevronDown, LogOut, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../atoms/Avatar'
import { useAuthStore } from '../../stores/authStore'

export const UserDropdown = () => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [isOpen, setIsOpen] = useState(false)

  const greeting = useMemo(() => {
    if (!user) {
      return 'Guest'
    }

    const [firstName] = user.fullName.split(' ')
    return firstName
  }, [user])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
      >
        <Avatar name={user?.fullName ?? 'FaST Link'} size="sm" />
        <span className="hidden md:block">{greeting}</span>
        <ChevronDown size={16} className="text-slate-500" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            onClick={() => setIsOpen(false)}
          >
            <User size={15} />
            Profile
          </Link>
          <button
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-50"
            onClick={() => {
              logout()
              setIsOpen(false)
            }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}
