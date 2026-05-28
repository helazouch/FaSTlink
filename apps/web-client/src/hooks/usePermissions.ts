import { useContext, useMemo } from 'react'
import { buildPermissions } from '../auth/permissions'
import { PermissionContext } from '../context/permissionContextBase'
import { useAuthStore } from '../stores/authStore'

export const usePermissions = () => {
  const context = useContext(PermissionContext)
  const user = useAuthStore((state) => state.user)
  const computed = useMemo(() => buildPermissions(user), [user])

  return context ?? computed
}
