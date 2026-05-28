import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { activeMemberships } from '../auth/authorization'
import { useAuthStore } from '../stores/authStore'
import { EntityContext, type EntityContextValue } from './entityContextBase'

interface EntityProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'fastlink.currentEntityId'

const readStoredEntityId = (): number | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const value = window.localStorage.getItem(STORAGE_KEY)
  if (!value) {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const EntityProvider = ({ children }: EntityProviderProps) => {
  const user = useAuthStore((state) => state.user)
  const memberships = useMemo(() => activeMemberships(user), [user])
  const [preferredEntityId, setPreferredEntityId] = useState<number | null>(readStoredEntityId)

  const currentEntityId = useMemo(() => {
    if (memberships.length === 0) {
      return null
    }

    const preferredExists = memberships.some((membership) => membership.entityId === preferredEntityId)
    return preferredExists ? preferredEntityId : memberships[0].entityId
  }, [memberships, preferredEntityId])

  const setCurrentEntityId = useCallback((entityId: number | null) => {
    setPreferredEntityId(entityId)
    if (typeof window === 'undefined') {
      return
    }
    if (entityId === null) {
      window.localStorage.removeItem(STORAGE_KEY)
    } else {
      window.localStorage.setItem(STORAGE_KEY, String(entityId))
    }
  }, [])

  const currentMembership = useMemo(
    () => memberships.find((membership) => membership.entityId === currentEntityId) ?? null,
    [currentEntityId, memberships],
  )

  const value = useMemo<EntityContextValue>(
    () => ({
      currentEntityId,
      currentMembership,
      memberships,
      setCurrentEntityId,
    }),
    [currentEntityId, currentMembership, memberships, setCurrentEntityId],
  )

  return <EntityContext.Provider value={value}>{children}</EntityContext.Provider>
}
