import { httpClient } from '../api/httpClient'
import type { UserProfile } from '../../types/social'

// The identity-service /auth/validate endpoint returns: id, nomComplet, email, roles,
// headline (optional), avatarUrl (optional).
// Fields not provided by the backend (bio, location, interests, stats) are initialised
// to safe empty values — never filled with mock data.
interface ProfileDto {
  id: number
  fullName?: string
  nomComplet?: string
  email: string
  headline?: string
  bio?: string
  location?: string
  joinedAt?: string
  interests?: string[]
  stats?: {
    followers: number
    following: number
    posts: number
  }
}

const mapProfile = (payload: ProfileDto): UserProfile => ({
  id: payload.id,
  fullName: payload.fullName ?? payload.nomComplet ?? 'FaST Link Member',
  email: payload.email,
  headline: payload.headline ?? 'Community Member',
  bio: payload.bio ?? '',
  location: payload.location ?? '',
  joinedAt: payload.joinedAt ?? new Date().toISOString(),
  interests: payload.interests ?? [],
  stats: payload.stats ?? { followers: 0, following: 0, posts: 0 },
})

export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await httpClient.get<ProfileDto>('/v1/auth/validate')
  return mapProfile(response.data)
}
