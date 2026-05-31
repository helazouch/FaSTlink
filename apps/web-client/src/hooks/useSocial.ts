import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCommunityById, getMyCommunities, getSuggestedCommunities, joinCommunity } from '../services/social/communityService'
import { getRequestEntities } from '../services/social/entityService'
import { getUpcomingEvents, updateEventParticipation } from '../services/social/eventService'
import { getMyProfile } from '../services/social/profileService'
import { getMyRequests, submitRequest } from '../services/social/requestService'
import { useAuthStore } from '../stores/authStore'
import type { AuthStoreState } from '../stores/authStore'
import type { SubmitRequestInput, UpdateParticipationInput } from '../types/social'

const selectUserId = (state: AuthStoreState) => state.user?.id

const queryKeys = {
  communities: ['communities', 'suggested'] as const,
  myCommunities: (userId: number) => ['communities', 'mine', userId] as const,
  communityById: (communityId: number) => ['communities', communityId] as const,
  events: ['events', 'upcoming'] as const,
  requestEntities: ['requests', 'entities'] as const,
  requests: ['requests', 'my'] as const,
  profile: ['profile', 'me'] as const,
}

export const useSuggestedCommunities = () =>
  useQuery({
    queryKey: queryKeys.communities,
    queryFn: getSuggestedCommunities,
  })

export const useMyCommunities = () => {
  const userId = useAuthStore(selectUserId)

  return useQuery({
    queryKey: userId ? queryKeys.myCommunities(userId) : ['communities', 'mine', 'none'],
    queryFn: () => {
      if (!userId) return Promise.resolve([])
      return getMyCommunities(userId)
    },
    enabled: Boolean(userId),
  })
}

export const useCommunity = (communityId: number) =>
  useQuery({
    queryKey: queryKeys.communityById(communityId),
    queryFn: () => getCommunityById(communityId),
    enabled: Number.isFinite(communityId),
  })

export const useEvents = () =>
  useQuery({
    queryKey: queryKeys.events,
    queryFn: getUpcomingEvents,
  })

export const useRequestEntities = () => {
  const userId = useAuthStore(selectUserId)

  return useQuery({
    queryKey: [...queryKeys.requestEntities, userId] as const,
    queryFn: () => {
      if (!userId) return Promise.resolve([])
      return getRequestEntities(userId)
    },
    enabled: Boolean(userId),
  })
}

export const useUpdateParticipation = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore(selectUserId)

  return useMutation({
    mutationFn: (input: UpdateParticipationInput) => {
      if (!userId) {
        throw new Error('You must be signed in to update participation')
      }
      return updateEventParticipation(input, userId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events })
    },
  })
}

export const useRequests = () => {
  const userId = useAuthStore(selectUserId)

  return useQuery({
    queryKey: [...queryKeys.requests, userId] as const,
    queryFn: () => {
      if (!userId) return Promise.resolve([])
      return getMyRequests(userId)
    },
    enabled: Boolean(userId),
  })
}

export const useSubmitRequest = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore(selectUserId)

  return useMutation({
    mutationFn: (input: SubmitRequestInput) => {
      if (!userId) {
        throw new Error('You must be signed in to submit a request')
      }
      return submitRequest(input, userId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests })
    },
  })
}

export const useJoinCommunity = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore(selectUserId)

  return useMutation({
    mutationFn: (communityId: number) => {
      if (!userId) throw new Error('You must be signed in to join a community')
      return joinCommunity(communityId, userId)
    },
    onSuccess: (_data, communityId) => {
      // Invalidate "my communities" and the specific community query so the UI refreshes
      void queryClient.invalidateQueries({ queryKey: ['communities', 'mine'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.communityById(communityId) })
    },
  })
}

export const useProfile = () =>
  useQuery({
    queryKey: queryKeys.profile,
    queryFn: getMyProfile,
  })
