import { usePermissions } from './usePermissions'

export const useIsAdmin = () => {
  const permissions = usePermissions()
  return permissions.isAdmin
}
