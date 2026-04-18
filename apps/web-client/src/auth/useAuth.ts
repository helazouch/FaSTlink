import { useContext } from 'react'
import type { AuthContextValue } from './AuthContext'
import { AuthContext } from './authContextBase'

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
