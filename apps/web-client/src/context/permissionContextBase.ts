import { createContext } from 'react'
import type { PermissionsValue } from '../auth/permissions'

export const PermissionContext = createContext<PermissionsValue | null>(null)
