import { createContext } from 'react'
import type { EntityMembershipClaim } from '../types/auth'

export interface EntityContextValue {
  currentEntityId: number | null
  currentMembership: EntityMembershipClaim | null
  memberships: EntityMembershipClaim[]
  setCurrentEntityId: (entityId: number | null) => void
}

export const EntityContext = createContext<EntityContextValue | null>(null)
