import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCommunityById, getSuggestedCommunities } from '../services/social/communityService'
import { getRequestEntities } from '../services/social/entityService'
import { getUpcomingEvents, updateEventParticipation } from '../services/social/eventService'
import { getMyProfile } from '../services/social/profileService'
import { getMyRequests, submitRequest } from '../services/social/requestService'
import { useAuthStore } from '../stores/authStore'
import type { SubmitRequestInput, UpdateParticipationInput } from '../types/social'

const queryKeys = {
  communities: (userId?: number) => ['communities', 'suggested', userId ?? null] as const,
  communityById: (communityId: number, userId?: number) => ['communities', communityId, userId ?? null] as const,
  events: (userId?: number) => ['events', 'upcoming', userId ?? null] as const,
  requestEntities: ['requests', 'entities'] as const,
  requests: ['requests', 'my'] as const,
  profile: ['profile', 'me'] as const,
}

export const useSuggestedCommunities = () => {
  const userId = useAuthStore((state) => state.user?.id)

  return useQuery({
    queryKey: queryKeys.communities(userId),
    queryFn: getSuggestedCommunities,
    enabled: Boolean(userId),
  })
}

export const useCommunity = (communityId: number) => {
  const userId = useAuthStore((state) => state.user?.id)

  return useQuery({
    queryKey: queryKeys.communityById(communityId, userId),
    queryFn: () => getCommunityById(communityId),
    enabled: Number.isFinite(communityId) && Boolean(userId),
  })
}

export const useEvents = () => {
  const userId = useAuthStore((state) => state.user?.id)

  return useQuery({
    queryKey: queryKeys.events(userId),
    queryFn: getUpcomingEvents,
    enabled: Boolean(userId),
  })
}

export const useRequestEntities = () =>
  {
    const userId = useAuthStore((state) => state.user?.id)

    return useQuery({
      queryKey: [...queryKeys.requestEntities, userId] as const,
      queryFn: () => {
        if (!userId) {
          return Promise.resolve([])
        }

        return getRequestEntities(userId)
      },
      enabled: Boolean(userId),
    })
  }

export const useUpdateParticipation = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)

  return useMutation({
    mutationFn: (input: UpdateParticipationInput) => {
      if (!userId) {
        throw new Error('You must be signed in to update participation')
      }

      return updateEventParticipation(input, userId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export const useRequests = () => {
  const userId = useAuthStore((state) => state.user?.id)

  return useQuery({
    queryKey: [...queryKeys.requests, userId] as const,
    queryFn: () => {
      if (!userId) {
        return Promise.resolve([])
      }

      return getMyRequests(userId)
    },
    enabled: Boolean(userId),
  })
}

export const useSubmitRequest = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)

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

export const useProfile = () =>
  useQuery({
    queryKey: queryKeys.profile,
    queryFn: getMyProfile,
  })
