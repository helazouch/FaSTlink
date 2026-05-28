import { useMemo, type ReactNode } from 'react'
import { buildPermissions } from '../auth/permissions'
import { useAuthStore } from '../stores/authStore'
import { PermissionContext } from './permissionContextBase'

interface PermissionProviderProps {
  children: ReactNode
}

export const PermissionProvider = ({ children }: PermissionProviderProps) => {
  const user = useAuthStore((state) => state.user)
  const value = useMemo(() => buildPermissions(user), [user])

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}
