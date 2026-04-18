export interface AuthUser {
  id: number
  fullName: string
  email: string
  roles: string[]
}

export interface AuthSession {
  accessToken: string
  tokenType: string
  expiresAt: string
  user: AuthUser
}

export interface LoginPayload {
  email: string
  password: string
}
