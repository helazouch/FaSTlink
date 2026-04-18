export interface AuthUser {
  id: number
  fullName: string
  email: string
  roles: string[]
  headline?: string
  avatarUrl?: string
}

export interface AuthSession {
  accessToken: string
  refreshToken?: string
  tokenType: string
  expiresAt: string
  user: AuthUser
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
}
