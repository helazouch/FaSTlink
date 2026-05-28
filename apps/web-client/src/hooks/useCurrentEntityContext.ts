import { useContext } from 'react'
import { EntityContext } from '../context/entityContextBase'

export const useCurrentEntityContext = () => {
  const context = useContext(EntityContext)
  if (!context) {
    throw new Error('useCurrentEntityContext must be used inside EntityProvider')
  }
  return context
}
