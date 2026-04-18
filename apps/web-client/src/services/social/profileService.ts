import { mockProfile } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type { UserProfile } from '../../types/social'

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

const mapProfile = (payload: ProfileDto): UserProfile => {
  const baseProfile = mockProfile.id === payload.id ? mockProfile : null

  return {
    id: payload.id,
    fullName: payload.fullName ?? payload.nomComplet ?? 'FaST Link Member',
    email: payload.email,
    headline: payload.headline ?? baseProfile?.headline ?? 'Community Member',
    bio: payload.bio ?? baseProfile?.bio ?? 'No bio provided yet.',
    location: payload.location ?? baseProfile?.location ?? 'Unknown location',
    joinedAt: payload.joinedAt ?? baseProfile?.joinedAt ?? new Date().toISOString(),
    interests: payload.interests ?? baseProfile?.interests ?? [],
    stats: payload.stats ?? {
      followers: baseProfile?.stats.followers ?? 0,
      following: baseProfile?.stats.following ?? 0,
      posts: baseProfile?.stats.posts ?? 0,
    },
  }
}

export const getMyProfile = async (): Promise<UserProfile> =>
  withFallback(
    async () => {
      const response = await httpClient.get<ProfileDto>('/v1/auth/validate')
      return mapProfile(response.data)
    },
    () => mockProfile,
  )
