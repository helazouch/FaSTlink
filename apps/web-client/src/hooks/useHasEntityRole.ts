import { hasEntityRole } from '../auth/authorization'
import { useAuthStore } from '../stores/authStore'
import type { EntityRole } from '../types/auth'

export const useHasEntityRole = (entityId: number | string | null | undefined, role: EntityRole): boolean => {
  const user = useAuthStore((state) => state.user)
  return hasEntityRole(user, entityId, role)
}
